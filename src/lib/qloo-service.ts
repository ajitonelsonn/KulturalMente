// Qloo API Service
const QLOO_API_URL =
  process.env.QLOO_API_URL || "https://hackathon.api.qloo.com";
const QLOO_API_KEY = process.env.QLOO_API_KEY || "";

export interface QlooEntity {
  id: string;
  name: string;
  category: string;
  score?: number;
  metadata?: any;
}

export interface QlooRecommendation {
  id: string;
  name: string;
  category: string;
  score: number;
  reasoning?: string;
}

export interface CulturalProfile {
  themes: string[];
  connections: Array<{
    domain1: string;
    domain2: string;
    strength: number;
    explanation: string;
  }>;
  patterns: string[];
}

class QlooService {
  private async makeRequest(endpoint: string, params: any = {}) {
    const url = new URL(endpoint, QLOO_API_URL);

    // Add query parameters
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key]);
      }
    });

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${QLOO_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Qloo API error: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }

  async searchEntities(
    query: string,
    category?: string
  ): Promise<QlooEntity[]> {
    try {
      const params: any = { q: query };
      if (category) params.category = category;

      const data = await this.makeRequest("/v1/search", params);
      return data.results || [];
    } catch (error) {
      console.error("Error searching entities:", error);
      return [];
    }
  }

  async getRecommendations(
    entities: string[],
    category?: string,
    limit: number = 10
  ): Promise<QlooRecommendation[]> {
    try {
      const params: any = {
        input: entities.join(","),
        limit: limit.toString(),
      };
      if (category) params.category = category;

      const data = await this.makeRequest("/v1/recommendations", params);
      return data.results || [];
    } catch (error) {
      console.error("Error getting recommendations:", error);
      return [];
    }
  }

  async getSimilarEntities(
    entityId: string,
    limit: number = 5
  ): Promise<QlooEntity[]> {
    try {
      const data = await this.makeRequest(`/v1/similar/${entityId}`, {
        limit: limit.toString(),
      });
      return data.results || [];
    } catch (error) {
      console.error("Error getting similar entities:", error);
      return [];
    }
  }

  async analyzeCrossDomainConnections(
    preferences: Record<string, string[]>
  ): Promise<CulturalProfile> {
    try {
      const connections = [];
      const themes = [];
      const patterns = [];

      // Get cross-domain recommendations
      const allEntities = Object.values(preferences).flat();
      const crossDomainRecs = await this.getRecommendations(
        allEntities,
        undefined,
        20
      );

      // Analyze connections between domains
      const domains = Object.keys(preferences);
      for (let i = 0; i < domains.length; i++) {
        for (let j = i + 1; j < domains.length; j++) {
          const domain1 = domains[i];
          const domain2 = domains[j];

          const domain1Entities = preferences[domain1];
          const domain2Entities = preferences[domain2];

          // Find cross-recommendations
          const crossRecs = await this.getRecommendations([
            ...domain1Entities,
            ...domain2Entities,
          ]);

          if (crossRecs.length > 0) {
            connections.push({
              domain1,
              domain2,
              strength: Math.min(crossRecs.length / 5, 1),
              explanation: `Connected through ${crossRecs
                .slice(0, 3)
                .map((r) => r.name)
                .join(", ")}`,
            });
          }
        }
      }

      // Extract themes from high-scoring recommendations
      const highScoreRecs = crossDomainRecs.filter((r) => r.score > 0.7);
      if (highScoreRecs.length > 0) {
        themes.push(
          "Cultural Sophistication",
          "Aesthetic Consistency",
          "Emotional Resonance"
        );
      }

      // Identify patterns
      if (connections.length > 2) {
        patterns.push("Multi-domain cultural coherence");
      }
      if (highScoreRecs.some((r) => r.category === "music")) {
        patterns.push("Music-centric cultural identity");
      }

      return { themes, connections, patterns };
    } catch (error) {
      console.error("Error analyzing cross-domain connections:", error);
      return { themes: [], connections: [], patterns: [] };
    }
  }
}

export const qlooService = new QlooService();
