import { CULTURAL_CATEGORIES } from "./types";

export const CATEGORY_METADATA = {
  [CULTURAL_CATEGORIES.MUSIC]: {
    name: "Music",
    icon: "🎵",
    description: "Artists, genres, or songs that move you",
    placeholder: "Billie Eilish, jazz, The Beatles...",
    examples: ["Billie Eilish", "Pink Floyd", "Kendrick Lamar", "Bon Iver"],
  },
  [CULTURAL_CATEGORIES.MOVIES]: {
    name: "Movies & TV",
    icon: "🎬",
    description: "Films, shows, or directors you love",
    placeholder: "The Grand Budapest Hotel, Breaking Bad...",
    examples: [
      "The Grand Budapest Hotel",
      "Parasite",
      "The Office",
      "Studio Ghibli",
    ],
  },
  [CULTURAL_CATEGORIES.FOOD]: {
    name: "Food & Dining",
    icon: "🍽️",
    description: "Cuisines, restaurants, or dining experiences",
    placeholder: "Ethiopian food, sushi, local cafes...",
    examples: ["Ethiopian cuisine", "Ramen", "Farm-to-table", "Street food"],
  },
  [CULTURAL_CATEGORIES.TRAVEL]: {
    name: "Travel & Places",
    icon: "🗺️",
    description: "Destinations, travel styles, or experiences",
    placeholder: "Tokyo, mountain hiking, boutique hotels...",
    examples: [
      "Tokyo",
      "Backpacking Europe",
      "National parks",
      "Cultural festivals",
    ],
  },
  [CULTURAL_CATEGORIES.BOOKS]: {
    name: "Books & Literature",
    icon: "📚",
    description: "Authors, genres, or specific books",
    placeholder: "Haruki Murakami, sci-fi, poetry...",
    examples: ["Haruki Murakami", "Science fiction", "Poetry", "Non-fiction"],
  },
};

export const API_ENDPOINTS = {
  QLOO: {
    SEARCH: "/api/qloo/search",
    RECOMMENDATIONS: "/api/qloo/recommendations",
    SIMILAR: "/api/qloo/similar",
  },
  OPENAI: {
    NARRATIVE: "/api/openai/narrative",
    ANALYSIS: "/api/openai/analysis",
    DISCOVERIES: "/api/openai/discoveries",
  },
  ANALYSIS: {
    CULTURAL_PROFILE: "/api/analysis/cultural-profile",
  },
} as const;

export const COLORS = {
  PRIMARY: {
    50: "#f0f9ff",
    500: "#3b82f6",
    600: "#2563eb",
    700: "#1d4ed8",
  },
  PURPLE: {
    50: "#faf5ff",
    500: "#a855f7",
    600: "#9333ea",
    700: "#7c3aed",
  },
  CHART: ["#8B5CF6", "#3B82F6", "#10B981", "#F59E0B", "#EF4444"],
} as const;
