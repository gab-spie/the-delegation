export const DEFAULT_MODELS = {
  text: 'claude-sonnet-4-6',       // Claude for text (overridable)
  image: 'gemini-3.1-flash-image-preview',
  music: 'lyria-3-clip-preview',
  video: 'veo-3.1-lite-generate-preview'
} as const;

export const CLAUDE_MODELS = [
  'claude-sonnet-4-6',
  'claude-opus-4-8',
  'claude-haiku-4-5-20251001',
] as const;

export const GEMINI_TEXT_MODELS = [
  'gemini-3-flash-preview',
  'gemini-3.1-pro-preview',
  'gemini-3.1-flash-lite-preview',
] as const;

export const AVAILABLE_MODELS = {
  text: [...CLAUDE_MODELS, ...GEMINI_TEXT_MODELS] as unknown as string[],
  image: [
    'gemini-3.1-flash-image-preview',
    'gemini-3-pro-image-preview',
    'gemini-2.5-flash-image'
  ],
  music: [
    'lyria-3-clip-preview',
    'lyria-3-pro-preview'
  ],
  video: [
    'veo-3.1-lite-generate-preview',
    'veo-3.1-fast-generate-preview',
    'veo-3.1-generate-preview'
  ]
} as const;

export type ModelType = keyof typeof AVAILABLE_MODELS;

export function isClaudeModel(modelName: string): boolean {
  return modelName.startsWith('claude-');
}

export function isGeminiModel(modelName: string): boolean {
  return modelName.startsWith('gemini-') || modelName.startsWith('lyria-') || modelName.startsWith('veo-');
}
