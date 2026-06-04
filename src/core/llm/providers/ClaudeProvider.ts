import { LLMMessage, LLMProvider, LLMResponse, LLMToolCall, LLMToolDefinition } from '../types';

const CLAUDE_API_URL = '/api/claude/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';

export class ClaudeProvider implements LLMProvider {
  constructor(private apiKey: string) {}

  async generateCompletion(
    messages: LLMMessage[],
    tools?: LLMToolDefinition[],
    systemInstruction?: string,
    modelName = 'claude-sonnet-4-6'
  ): Promise<LLMResponse> {
    const claudeMessages = this.mapMessagesToClaude(messages);
    const claudeTools = tools?.length ? this.mapToolsToClaude(tools) : undefined;

    const body: any = {
      model: modelName,
      max_tokens: 8192,
      messages: claudeMessages,
    };

    if (systemInstruction) {
      body.system = systemInstruction;
    }

    if (claudeTools?.length) {
      body.tools = claudeTools;
    }

    const res = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'anthropic-version': ANTHROPIC_VERSION,
        'anthropic-dangerous-direct-browser-access': 'true',
        'content-type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: { message: res.statusText } }));
      throw new Error(`Claude API error ${res.status}: ${err?.error?.message ?? res.statusText}`);
    }

    const data = await res.json();
    return this.mapResponseFromClaude(data);
  }

  // ─── Mapping helpers ────────────────────────────────────────

  private mapMessagesToClaude(messages: LLMMessage[]): any[] {
    const out: any[] = [];

    for (let i = 0; i < messages.length; i++) {
      const m = messages[i];

      if (m.role === 'system') continue;

      if (m.role === 'user') {
        const content: any[] = [];
        if (m.content) content.push({ type: 'text', text: m.content });
        if (m.images?.length) {
          for (const img of m.images) {
            const match = img.match(/^data:(image\/[a-z]+);base64,(.+)$/);
            if (match) {
              content.push({
                type: 'image',
                source: { type: 'base64', media_type: match[1], data: match[2] },
              });
            }
          }
        }
        out.push({ role: 'user', content: content.length === 1 && content[0].type === 'text' ? content[0].text : content });

      } else if (m.role === 'assistant') {
        const hasToolCalls = !!m.tool_calls?.length;

        // If this assistant message has tool_calls, check that tool results follow.
        // If not (e.g. last message before a new turn), strip the tool_calls to avoid the
        // "tool_use without tool_result" API error.
        if (hasToolCalls) {
          const nextMsg = messages[i + 1];
          const hasToolResult = nextMsg && nextMsg.role === 'tool';
          if (!hasToolResult) {
            // Emit only the text part, drop dangling tool_calls
            if (m.content) out.push({ role: 'assistant', content: m.content });
            continue;
          }
        }

        const content: any[] = [];
        if (m.content) content.push({ type: 'text', text: m.content });
        if (hasToolCalls) {
          for (const tc of m.tool_calls!) {
            content.push({
              type: 'tool_use',
              id: tc.id,
              name: tc.function.name,
              input: (() => { try { return JSON.parse(tc.function.arguments); } catch { return {}; } })(),
            });
          }
        }
        out.push({ role: 'assistant', content: content.length === 1 && !hasToolCalls ? content[0].text : content });

      } else if (m.role === 'tool') {
        const toolUseId = this.findToolUseId(messages, i, m.name || '');
        out.push({
          role: 'user',
          content: [{
            type: 'tool_result',
            tool_use_id: toolUseId,
            content: m.content,
          }],
        });
      }
    }

    return this.mergeConsecutiveRoles(out);
  }

  private findToolUseId(messages: LLMMessage[], toolMsgIdx: number, toolName: string): string {
    // Walk backwards to find the assistant message with a matching tool_call
    for (let i = toolMsgIdx - 1; i >= 0; i--) {
      const msg = messages[i];
      if (msg.role === 'assistant' && msg.tool_calls) {
        const tc = msg.tool_calls.find(t => t.function.name === toolName);
        if (tc) return tc.id;
      }
    }
    return toolName; // fallback
  }

  private mergeConsecutiveRoles(messages: any[]): any[] {
    const merged: any[] = [];
    for (const m of messages) {
      const last = merged[merged.length - 1];
      if (last && last.role === m.role) {
        // Merge content
        const prevContent = Array.isArray(last.content) ? last.content : [{ type: 'text', text: last.content }];
        const newContent = Array.isArray(m.content) ? m.content : [{ type: 'text', text: m.content }];
        last.content = [...prevContent, ...newContent];
      } else {
        merged.push({ ...m });
      }
    }
    return merged;
  }

  private mapToolsToClaude(tools: LLMToolDefinition[]): any[] {
    return tools.map(t => ({
      name: t.function.name,
      description: t.function.description,
      input_schema: this.cleanSchema(t.function.parameters),
    }));
  }

  private cleanSchema(schema: any): any {
    if (!schema) return { type: 'object', properties: {} };
    const { type, properties, required, items, description, enum: enumVals } = schema;
    const result: any = { type: type || 'object' };
    if (description) result.description = description;
    if (properties) {
      result.properties = Object.fromEntries(
        Object.entries(properties).map(([k, v]) => [k, this.cleanSchema(v)])
      );
    }
    if (required?.length) result.required = required;
    if (items) result.items = this.cleanSchema(items);
    if (enumVals) result.enum = enumVals;
    return result;
  }

  private mapResponseFromClaude(data: any): LLMResponse {
    let content: string | null = null;
    const toolCalls: LLMToolCall[] = [];

    for (const block of data.content ?? []) {
      if (block.type === 'text') {
        content = (content ?? '') + block.text;
      } else if (block.type === 'tool_use') {
        toolCalls.push({
          id: block.id,
          type: 'function',
          function: {
            name: block.name,
            arguments: JSON.stringify(block.input ?? {}),
          },
        });
      }
    }

    const usage = data.usage ? {
      promptTokens: data.usage.input_tokens ?? 0,
      completionTokens: data.usage.output_tokens ?? 0,
      totalTokens: (data.usage.input_tokens ?? 0) + (data.usage.output_tokens ?? 0),
    } : undefined;

    return {
      content,
      tool_calls: toolCalls.length ? toolCalls : undefined,
      usage,
      finishReason: data.stop_reason ?? undefined,
      raw: data,
      request: undefined,
    };
  }
}
