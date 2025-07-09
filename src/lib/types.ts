export interface CulturalPreferences {
  music: string[];
  movies: string[];
  food: string[];
  travel: string[];
  books: string[];
}

export const CULTURAL_CATEGORIES = {
  MUSIC: "music",
  MOVIES: "movies",
  FOOD: "food",
  TRAVEL: "travel",
  BOOKS: "books",
} as const;

export type CulturalCategory =
  (typeof CULTURAL_CATEGORIES)[keyof typeof CULTURAL_CATEGORIES];

export interface QlooEntity {
  id: string;
  name: string;
  category: string;
  score?: number;
  metadata?: Record<string, any>;
}

export interface CulturalConnection {
  domain1: string;
  domain2: string;
  strength: number;
  explanation: string;
  entities: string[];
}

export interface CulturalTheme {
  name: string;
  description: string;
  strength: number;
  examples: string[];
}

export interface CulturalProfile {
  themes: CulturalTheme[];
  connections: CulturalConnection[];
  patterns: string[];
  personalityTraits: string[];
  culturalDNA: string;
}

export interface CulturalNarrative {
  title: string;
  story: string;
  insights: string[];
  personality: string;
  culturalDNA: string;
  recommendations: string[];
  evolutionPredictions: string[];
}

export interface DiscoveryRecommendation {
  id: string;
  title: string;
  description: string;
  category: string;
  reasoning: string;
  confidence: number;
  actions: string[];
}
