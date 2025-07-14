// src/lib/openai-service.ts - CLIENT-SIDE SERVICE (API Calls Only)

export interface CulturalProfile {
  themes: string[];
  connections: Array<{
    domain1: string;
    domain2: string;
    strength: number;
    explanation: string;
    qlooEntities: string[];
  }>;
  patterns: string[];
  diversityScore?: number;
  culturalDepth?: number;
  qlooInsights?: any;
}

export interface CulturalNarrative {
  title: string;
  story: string;
  insights: string[];
  personality: string;
  culturalDNA: string;
  recommendations: string[];
  evolutionPredictions?: string[];
  culturalBlindSpots?: string[];
  diversityScore?: number;
}

export interface CulturalAnalysis {
  themes: string[];
  patterns: string[];
  connections: Array<{
    items: string[];
    explanation: string;
    strength: "strong" | "moderate" | "subtle";
  }>;
  predictions: string[];
  blindSpots: string[];
  diversityMetrics: {
    score: number;
    breakdown: Record<string, number>;
  };
}

// Client-side service that makes API calls to server-side OpenAI endpoints
class OpenAIService {
  async generateCulturalNarrative(
    preferences: Record<string, string[]>,
    culturalProfile: CulturalProfile
  ): Promise<CulturalNarrative> {
    try {
      console.log("🤖 Calling OpenAI narrative API...");

      const response = await fetch("/api/openai/narrative", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          preferences,
          culturalProfile,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `API request failed: ${response.status}`
        );
      }

      const data = await response.json();
      console.log("✅ OpenAI narrative API response received");

      return data.narrative;
    } catch (error) {
      console.error("❌ OpenAI narrative API call failed:", error);
      throw new Error(
        `Cultural narrative generation failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async generateDiscoveryRecommendations(
    culturalNarrative: CulturalNarrative,
    preferences: Record<string, string[]>,
    culturalProfile?: CulturalProfile
  ): Promise<string[]> {
    try {
      console.log("🎯 Calling OpenAI discoveries API...");

      const response = await fetch("/api/openai/discoveries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          culturalNarrative,
          preferences,
          culturalProfile,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `API request failed: ${response.status}`
        );
      }

      const data = await response.json();
      console.log("✅ OpenAI discoveries API response received");

      return data.discoveries;
    } catch (error) {
      console.error("❌ OpenAI discoveries API call failed:", error);
      throw new Error(
        `Discovery recommendations generation failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async generateEvolutionPredictions(
    preferences: Record<string, string[]>,
    culturalProfile: CulturalProfile
  ): Promise<string[]> {
    try {
      console.log("🔮 Calling OpenAI evolution API...");

      const response = await fetch("/api/openai/evolution", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          preferences,
          culturalProfile,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `API request failed: ${response.status}`
        );
      }

      const data = await response.json();
      console.log("✅ OpenAI evolution API response received");

      return data.predictions;
    } catch (error) {
      console.error("❌ OpenAI evolution API call failed:", error);
      throw new Error(
        `Evolution predictions generation failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async analyzeCulturalPatternsWithQlooData(
    preferences: Record<string, string[]>,
    culturalProfile: CulturalProfile
  ): Promise<CulturalAnalysis> {
    try {
      console.log("📊 Calling OpenAI analysis API...");

      const response = await fetch("/api/openai/analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          preferences,
          culturalProfile,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `API request failed: ${response.status}`
        );
      }

      const data = await response.json();
      console.log("✅ OpenAI analysis API response received");

      return data.analysis;
    } catch (error) {
      console.error("❌ OpenAI analysis API call failed:", error);
      throw new Error(
        `Cultural analysis generation failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async generateCulturalInsightsSummary(
    preferences: Record<string, string[]>,
    culturalProfile: CulturalProfile,
    narrative: CulturalNarrative
  ): Promise<{
    keyInsights: string[];
    dataHighlights: string[];
    evolutionSummary: string;
    recommendationStrategy: string;
  }> {
    try {
      console.log("📝 Calling OpenAI insights API...");

      const response = await fetch("/api/openai/insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          preferences,
          culturalProfile,
          narrative,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `API request failed: ${response.status}`
        );
      }

      const data = await response.json();
      console.log("✅ OpenAI insights API response received");

      return data.insights;
    } catch (error) {
      console.error("❌ OpenAI insights API call failed:", error);
      throw new Error(
        `Insights summary generation failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async generateCulturalGrowthChallenges(
    preferences: Record<string, string[]>,
    culturalProfile: CulturalProfile,
    narrative: CulturalNarrative
  ): Promise<string[]> {
    try {
      console.log("🎯 Calling OpenAI growth challenges API...");

      const response = await fetch("/api/openai/challenges", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          preferences,
          culturalProfile,
          narrative,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `API request failed: ${response.status}`
        );
      }

      const data = await response.json();
      console.log("✅ OpenAI growth challenges API response received");

      return data.challenges;
    } catch (error) {
      console.error("❌ OpenAI growth challenges API call failed:", error);
      throw new Error(
        `Cultural growth challenges generation failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
  async testOpenAIConnection(): Promise<{
    success: boolean;
    message: string;
    model?: string;
  }> {
    try {
      console.log("🧪 Testing OpenAI API connection...");

      const response = await fetch("/api/openai/test", {
        method: "GET",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `API request failed: ${response.status}`
        );
      }

      const data = await response.json();
      console.log("✅ OpenAI API connection test successful");

      return data;
    } catch (error) {
      console.error("❌ OpenAI API connection test failed:", error);
      return {
        success: false,
        message: `OpenAI API connection test failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }
}

export const openaiService = new OpenAIService();
