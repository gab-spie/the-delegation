import { USER_COLOR } from '../theme/brand';
import { DEFAULT_MODELS } from '../core/llm/constants';

export const USER_ID = 'user';
export const USER_NAME = 'User';
export const MAX_AGENTS = 20;
export { USER_COLOR };
export const DEFAULT_AGENTIC_SET_ID = 'single-agent';
export interface AgentNode {
  id: string;
  index: number;
  name: string;
  description: string;
  color: string;
  model: string;
  humanInTheLoop?: boolean;
  position?: { x: number; y: number };
  subagents?: AgentNode[];
}

export type OutputType = 'text' | 'image' | 'music' | 'video';
export interface AgenticSystem {
  id: string;
  teamName: string;
  teamType: string;
  teamDescription: string;
  color: string;
  outputType: OutputType;
  outputModel: string;
  outputAutoApprove?: boolean;
  user: {
    index: number;
    model: string;
    position?: { x: number; y: number };
  };
  leadAgent: AgentNode;
}

export const AGENTIC_SETS: AgenticSystem[] = [
  {
    id: 'unboring-net',
    teamName: 'unboring.net',
    teamType: 'Agency',
    teamDescription: 'A full-service creative agency covering branding, design, development and go-to-market strategy.',
    color: '#4285F4',
    outputType: 'text',
    outputModel: DEFAULT_MODELS.text,
    outputAutoApprove: true,
    user: { index: 0, model: 'Human', position: { x: 0, y: 0 } },
    leadAgent: {
      id: 'agency-orchestrator',
      index: 1,
      name: 'Creative Director (lead)',
      description: `Orchestrates branding, design, and development to deliver integrated creative solutions. Leads with content strategy: defines what content to produce, content pillars, editorial roadmap, and messaging hierarchy before delegating. Plans launch strategy: positioning, channel mix, timing, and go-to-market sequencing. Synthesizes Designer, Developer, and Copywriter outputs into a unified creative brief. Always output a structured plan before execution. WRITING RULES: no "pivotal/testament/underscores/vibrant/groundbreaking", no em dash overuse, no rule of three, no vague attributions, no generic conclusions ("future looks bright"). Use simple is/are/has. Vary sentence rhythm. Have opinions. Final pass: ask "what makes this obviously AI?" then fix those parts.`,
      color: '#4285F4',
      model: DEFAULT_MODELS.text,
      humanInTheLoop: true,
      position: { x: 0, y: 130 },
      subagents: [
        {
          id: 'agency-developer',
          index: 2,
          name: 'Developer',
          description: `Architects and develops robust digital platforms. Full-stack expertise: React, Next.js, Node.js, REST APIs, GraphQL, PostgreSQL, MongoDB. Applies modern web development best practices: component architecture, performance optimization, API design, database schema. Delivers working code with clear architecture decisions.`,
          color: '#34A853',
          model: DEFAULT_MODELS.text,
          position: { x: -300, y: 280 }
        },
        {
          id: 'agency-designer',
          index: 3,
          name: 'Designer',
          description: `Crafts visual identities and premium UI/UX. Uses high-end agency design principles: precise typography, intentional spacing, refined shadows, and motion that feels earned. Avoids generic AI aesthetics — no flat cards, no default Tailwind blues. Designs for specific styles (glassmorphism, brutalism, minimalism, bento grid) with 161 color palettes and 57 font pairings. Applies UX Pro guidelines: accessibility, interaction states, responsive layout, chart design.`,
          color: '#FBBC05',
          model: DEFAULT_MODELS.text,
          position: { x: 0, y: 280 }
        },
        {
          id: 'agency-copywriter',
          index: 4,
          name: 'Copywriter',
          description: `Crafts brand narratives and conversion copy. Applies copywriting frameworks: AIDA, PAS, before/after/bridge. Uses brand storytelling techniques from 30 product leaders — origin story, conflict, transformation arc. Writes headlines, taglines, landing page copy, email sequences, and ad copy. Focuses on customer pain and desire, not product features. All copy grounded in customer research and psychological triggers (social proof, scarcity, loss aversion, anchoring). WRITING RULES: no "pivotal/testament/vibrant/groundbreaking/showcasing", no em dash overuse, no filler ("in order to"→"to", "at this point in time"→"now"), no generic upbeat endings, no chatbot artifacts. Use is/are/has. Vary rhythm. Be specific. Final pass: ask "what makes this obviously AI?" then fix.`,
          color: '#EA4335',
          humanInTheLoop: true,
          model: DEFAULT_MODELS.text,
          position: { x: 300, y: 280 }
        }
      ]
    }
  },
  {
    id: 'photo-studio',
    teamName: 'Nano Banana Lab',
    teamType: 'Visual',
    teamDescription: 'Pro image generation using the [Subject] + [Action] + [Context] + [Comp] + [Style] formula.',
    color: '#FBBF24',
    outputType: 'image',
    outputModel: DEFAULT_MODELS.image,
    outputAutoApprove: false,
    user: { index: 0, model: 'Human', position: { x: 0, y: 0 } },
    leadAgent: {
      id: 'art-director',
      index: 1,
      name: 'Art Director (lead)',
      description: 'Synthesizes descriptions into valid Nano Banana prompts.',
      color: '#FBBF24',
      humanInTheLoop: true,
      model: DEFAULT_MODELS.text,
      position: { x: 0, y: 130 },
      subagents: [
        {
          id: 'scene-designer',
          index: 2,
          name: 'Scene Designer',
          description: 'Focuses on Subject and Action within the scene.',
          color: '#F59E0B',
          humanInTheLoop: true,
          model: DEFAULT_MODELS.text,
          position: { x: -150, y: 280 }
        },
        {
          id: 'lighting-stylist',
          index: 3,
          name: 'Lighting Stylist',
          description: 'Focuses on Composition, Lighting, and Style/Materiality.',
          color: '#E0E672',
          humanInTheLoop: true,
          model: DEFAULT_MODELS.text,
          position: { x: 150, y: 280 }
        }
      ]
    }
  },
  {
    id: 'music-studio',
    teamName: 'Lyria Factory',
    teamType: 'Music Production',
    teamDescription: 'High-fidelity audio production following Lyria guidelines.',
    color: '#43E47C',
    outputType: 'music',
    outputModel: DEFAULT_MODELS.music,
    outputAutoApprove: false,
    user: { index: 0, model: 'Human', position: { x: 0, y: 0 } },
    leadAgent: {
      id: 'master-producer',
      index: 1,
      name: 'Master Producer (lead)',
      description: 'Orchestrates the 4 pillars of sound into a cohesive track.',
      color: '#43E47C',
      model: DEFAULT_MODELS.text,
      humanInTheLoop: true,
      position: { x: 0, y: 130 },
      subagents: [
        {
          id: 'genre-expert',
          index: 2,
          name: 'Genre Expert',
          description: 'Defines style, mood, and global aesthetic (e.g., Synthwave, Lofi).',
          color: '#74D295',
          model: DEFAULT_MODELS.text,
          humanInTheLoop: true,
          position: { x: -450, y: 280 }
        },
        {
          id: 'tempo-architect',
          index: 3,
          name: 'Tempo Architect',
          description: 'Specifies BPM, rhythmical complexity, and time signatures.',
          color: '#92D540',
          model: DEFAULT_MODELS.text,
          humanInTheLoop: true,
          position: { x: -150, y: 280 }
        },
        {
          id: 'instrumentalist',
          index: 4,
          name: 'Instrumentalist',
          description: 'Selects timbres, arrangement, and orchestration layers.',
          color: '#40D5AD',
          model: DEFAULT_MODELS.text,
          humanInTheLoop: true,
          position: { x: 150, y: 280 }
        },
        {
          id: 'dynamics-engineer',
          index: 5,
          name: 'Dynamics Engineer',
          description: 'Controls volume, texture, contrast, and emotional progression.',
          color: '#50BB55',
          model: DEFAULT_MODELS.text,
          humanInTheLoop: true,
          position: { x: 450, y: 280 }
        }
      ]
    }
  },
  {
    id: 'film-studio',
    teamName: 'Veo Studio',
    teamType: 'Cinematic',
    teamDescription: 'Full cinematic production: Visuals + Soundstage (Veo 3.1 style).',
    color: '#E64347',
    outputType: 'video',
    outputModel: DEFAULT_MODELS.video,
    outputAutoApprove: false,
    user: { index: 0, model: 'Human', position: { x: 0, y: 0 } },
    leadAgent: {
      id: 'film-director',
      index: 1,
      name: 'Film Director (lead)',
      description: 'Orchestrates visuals and soundstage with global cinematic vision.',
      color: '#E64347',
      model: DEFAULT_MODELS.text,
      humanInTheLoop: true,
      position: { x: 0, y: 130 },
      subagents: [
        {
          id: 'visual-lead',
          index: 2,
          name: 'Visual Lead',
          description: 'Manages cinematography and VFX direction.',
          color: '#F17DC5',
          model: DEFAULT_MODELS.text,
          humanInTheLoop: true,
          position: { x: -200, y: 280 },
          subagents: [
            {
              id: 'cinematographer',
              index: 4,
              name: 'Cinematographer',
              description: 'Defines camera work, shot composition, and subject action.',
              color: '#E643C5',
              model: DEFAULT_MODELS.text,
              position: { x: -200, y: 430 }
            }
          ]
        },
        {
          id: 'audio-lead',
          index: 3,
          name: 'Audio Lead',
          description: 'Manages the soundstage: Dialogue, SFX, and Ambience.',
          color: '#7CE630',
          model: DEFAULT_MODELS.text,
          humanInTheLoop: true,
          position: { x: 200, y: 280 },
          subagents: [
            {
              id: 'sound-designer',
              index: 5,
              name: 'Sound Designer',
              description: 'Specifies SFX (SFX:), Ambient Noise (Ambient noise:), and Dialogue (" ").',
              color: '#50BB55',
              model: DEFAULT_MODELS.text,
              position: { x: 200, y: 430 }
            }
          ]
        }
      ]
    }
  },
  {
    id: 'strategy-coach',
    teamName: 'Strategy Coach',
    teamType: 'Strategic',
    teamDescription: 'A high-level strategic advisor for project direction and roadmap.',
    color: '#64748B',
    outputType: 'text',
    outputModel: DEFAULT_MODELS.text,
    outputAutoApprove: true,
    user: { index: 0, model: 'Human', position: { x: 0, y: 0 } },
    leadAgent: {
      id: 'visionary-advisor',
      index: 1,
      name: 'Visionary Advisor (lead)',
      description: `High-level strategic advisor. Applies investor-grade communication frameworks: the "Three Things" narrative model, 4-tier metric hierarchy, board-level storytelling. Structures pricing strategy (value-based, competitive, freemium, usage-based). Prepares investor outreach: cold emails, warm intro blurbs, update emails to angels/VCs. Delivers sharp strategic recommendations with clear rationale, key risks, and next actions. WRITING RULES: no "pivotal/testament/landscape/underscores/crucial", no vague attributions ("experts argue"), no rule of three, no generic conclusions. Vary sentence length. Use first person when it fits. Have opinions. Final pass: ask "what makes this obviously AI?" then fix.`,
      color: '#64748B',
      model: DEFAULT_MODELS.text,
      humanInTheLoop: true,
      position: { x: 0, y: 130 }
    }
  },
  {
    id: 'pr-agency',
    teamName: 'PR Agency',
    teamType: 'Public Relations',
    teamDescription: 'A sequential pipeline for media outreach: from strategy to press drafting.',
    color: '#E34B99',
    outputType: 'text',
    outputModel: DEFAULT_MODELS.text,
    outputAutoApprove: false,
    user: { index: 0, model: 'Human', position: { x: 0, y: 0 } },
    leadAgent: {
      id: 'pr-director',
      index: 1,
      name: 'PR Director (lead)',
      description: `Oversees media relations and strategic communications. Applies marketing psychology: cognitive biases (anchoring, social proof, scarcity, loss aversion, framing), persuasion triggers, and behavioral science to shape messaging. Builds communications strategy around the brand narrative. Delegates writing to Press Writer and channel distribution to Media Strategist. Owns reputation and message consistency. WRITING RULES: no "pivotal/testament/vibrant/groundbreaking", no em dashes overuse, no rule of three, no vague attributions, no generic closings. Short punchy sentences mixed with longer ones. Specific over vague. Final pass: ask "what makes this obviously AI?" then fix.`,
      color: '#E34B99',
      model: DEFAULT_MODELS.text,
      humanInTheLoop: true,
      position: { x: 0, y: 130 },
      subagents: [
        {
          id: 'media-strategist',
          index: 2,
          name: 'Media Strategist',
          description: `Identifies key media outlets and generates marketing/growth ideas for SaaS and software products. Specializes in channel strategy: SEO, paid, social, email, partnerships, community. Applies launch strategy frameworks: pre-launch, launch day, post-launch sequencing. Generates 10+ actionable ideas per brief, ranked by effort/impact. Delegates press release writing to Press Writer. WRITING RULES: no "pivotal/vibrant/showcasing/fostering", no filler phrases, no em dash overuse, no generic bullet headers in bold. Ideas must be specific and actionable, not vague. Final pass: ask "what makes this obviously AI?" then fix.`,
          color: '#E6D979',
          model: DEFAULT_MODELS.text,
          position: { x: 0, y: 260 },
          subagents: [
            {
              id: 'press-writer',
              index: 3,
              name: 'Press Writer',
              description: `Drafts press releases, media kits, and investor communications. Structures content with clear narrative arc before writing. Uses writing-plans methodology: outline first, then write section by section. Produces clean, journalist-ready copy: inverted pyramid structure, strong lede, no jargon. Writes investor update emails and board communication in the "Three Things" format: what happened, what it means, what's next. WRITING RULES: no "pivotal/testament/vibrant/groundbreaking/underscores", no em dash overuse, no filler ("in order to", "due to the fact that"), no chatbot artifacts ("I hope this helps"), no generic conclusions. Use is/are/has. Vary sentence rhythm. Be specific. Final pass: ask "what makes this obviously AI?" then fix.`,
              color: '#5E888E',
              model: DEFAULT_MODELS.text,
              position: { x: 0, y: 390 }
            }
          ]
        }
      ]
    }
  },
  {
    id: 'finance-analyst',
    teamName: 'Finance Analyst Team',
    teamType: 'Finance',
    teamDescription: 'Senior financial analysts covering valuation, modeling, and investment research. Ideal for case studies, internship prep, and deal analysis.',
    color: '#1A56DB',
    outputType: 'text',
    outputModel: DEFAULT_MODELS.text,
    outputAutoApprove: true,
    user: { index: 0, model: 'Human', position: { x: 0, y: 0 } },
    leadAgent: {
      id: 'finance-senior-analyst',
      index: 1,
      name: 'Senior Analyst (lead)',
      description: `Senior finance expert leading the team. Expertise in FinTech, banking, capital markets, investment analysis, and financial systems. Breaks briefs into tasks delegated to Financial Modeler, Market Researcher, and Report Writer. Synthesizes all outputs into structured investment memos, valuation summaries, or M&A rationale. Applies credit risk thinking: assesses quality, completeness, and reliability of every analysis. Delivers investor-grade materials internally consistent across all sections. WRITING RULES: no "pivotal/testament/landscape/crucial/underscores", no vague attributions ("industry observers"), no rule of three padding, no generic conclusions. All claims backed by numbers or named sources. Vary sentence length. Final pass: ask "what makes this obviously AI?" then fix.`,
      color: '#1A56DB',
      model: DEFAULT_MODELS.text,
      humanInTheLoop: true,
      position: { x: 0, y: 130 },
      subagents: [
        {
          id: 'finance-modeler',
          index: 2,
          name: 'Financial Modeler',
          description: `Builds financial models with full methodology transparency. DCF: projects free cash flows, calculates WACC, builds terminal value, outputs intrinsic value range with sensitivity table (WACC vs. growth rate). Market sizing: TAM/SAM/SOM using top-down, bottom-up, and value theory — produces investor-ready market analysis. Credit risk: data quality assessment, missing value analysis, IV/PSI variable screening. All models include explicit assumptions, sources, and sensitivity ranges.`,
          color: '#0E9F6E',
          model: DEFAULT_MODELS.text,
          position: { x: -300, y: 280 }
        },
        {
          id: 'finance-researcher',
          index: 3,
          name: 'Market Researcher',
          description: `Conducts deep industry and customer research. Customer research: ICP profiling, jobs-to-be-done analysis, persona building, voice-of-customer synthesis from reviews/interviews/forums. Market research: competitive dynamics, growth drivers, pricing landscape, TAM validation. Frames all findings in investment research format: industry overview, key trends, bull thesis, bear thesis, key risks. Uses pricing strategy frameworks: value-based, competitive, freemium, usage-based — always with rationale.`,
          color: '#7E3AF2',
          model: DEFAULT_MODELS.text,
          position: { x: 0, y: 280 }
        },
        {
          id: 'finance-writer',
          index: 4,
          name: 'Report Writer',
          description: `Formats financial analyses into polished memos, pitch decks, and executive summaries for investment committees, recruiters, or case study submissions. Data storytelling: transforms raw numbers into compelling narratives — context before data, insight before chart, action before conclusion. Pitch deck structure: problem, solution, market, business model, traction, team, ask — each slide one clear point. Investor materials: internally consistent across one-pagers, memos, and decks. All numbers traceable to source.

WRITING RULES (humanizer): Strip all AI writing patterns from every output.
- No significance inflation: never use "pivotal", "testament", "underscores", "landscape", "vibrant", "groundbreaking", "vital role"
- No promotional language: never use "nestled", "breathtaking", "showcasing", "boasts", "renowned"
- No superficial -ing endings: avoid "highlighting...", "reflecting...", "contributing to...", "fostering..."
- No vague attributions: no "experts argue", "industry observers", "some critics say" — cite specific sources or omit
- No rule of three padding, no false ranges ("from X to Y, from A to B")
- No em dash overuse, no excessive bold, no emoji headers, no title-case headings
- No filler: replace "in order to" → "to", "due to the fact that" → "because", "at this point in time" → "now"
- No generic conclusions: "the future looks bright", "exciting times ahead" — replace with specific next steps
- No chatbot artifacts: never write "I hope this helps", "let me know", "great question"
- Use simple copulas: "is/are/has" instead of "serves as", "stands as", "functions as"
- Vary sentence rhythm. Short punchy sentences mixed with longer ones.
- Use first person when it fits. Have opinions. Be specific about numbers and sources.
- Do a final anti-AI pass: ask "what makes this obviously AI-generated?" then revise those parts.`,
          color: '#E3A008',
          model: DEFAULT_MODELS.text,
          position: { x: 300, y: 280 }
        }
      ]
    }
  },
];

export function getAgentSet(id: string, customSystems: AgenticSystem[] = []): AgenticSystem {
  const builtIn = AGENTIC_SETS.find((s) => s.id === id);
  const custom = customSystems.find((s) => s.id === id);

  if (builtIn && custom) {
    // For built-in teams, always use the code-defined agent hierarchy (leadAgent + subagents)
    // but preserve user-configured settings (model, autoApprove, color, outputType).
    // This prevents a stale customSystems entry in localStorage from breaking the agent tree.
    return {
      ...builtIn,
      outputType: custom.outputType ?? builtIn.outputType,
      outputModel: custom.outputModel ?? builtIn.outputModel,
      outputAutoApprove: custom.outputAutoApprove ?? builtIn.outputAutoApprove,
      color: custom.color ?? builtIn.color,
    };
  }

  return custom || builtIn || AGENTIC_SETS[0];
}

export function getAllAgents(system: AgenticSystem): AgentNode[] {
  const agents: AgentNode[] = [];
  const traverse = (node: AgentNode) => {
    agents.push(node);
    if (node.subagents) {
      node.subagents.forEach(traverse);
    }
  };
  traverse(system.leadAgent);
  return agents;
}

export function getAllCharacters(system: AgenticSystem): AgentNode[] {
  const userNode: AgentNode = {
    id: USER_ID,
    index: system.user.index,
    name: USER_NAME,
    color: USER_COLOR,
    model: system.user.model,
    description: 'Human user issuing commands.',
  };
  return [userNode, ...getAllAgents(system)];
}
