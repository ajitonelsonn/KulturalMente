// src/lib/server-openai-service.ts
import OpenAI from "openai";

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
  qlooInsights?: {
    entityMapping?: Record<string, QlooEntity[]>;
    totalEntitiesFound?: number;
    domainsWithEntities?: string[];
    categoryMappingUsed?: Record<string, string>;
    matchRate?: number;
    error?: string;
    [key: string]: unknown;
  };
}

interface QlooEntity {
  id: string;
  name: string;
  category: string;
  score?: number;
  metadata?: Record<string, unknown>;
  popularity?: number;
  types?: string[];
  entity_id?: string;
  properties?: Record<string, unknown>;
  location?: {
    country?: string;
    [key: string]: unknown;
  };
  tags?: string[];
  disambiguation?: string;
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

// Server-side OpenAI service (only for API routes)
class ServerOpenAIService {
  private getOpenAIClient() {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    if (!OPENAI_API_KEY) {
      throw new Error(
        "OPENAI_API_KEY environment variable is required for KulturalMente to function"
      );
    }

    return new OpenAI({
      apiKey: OPENAI_API_KEY,
    });
  }

  async generateCulturalNarrative(
    preferences: Record<string, string[]>,
    culturalProfile: CulturalProfile
  ): Promise<CulturalNarrative> {
    try {
      const openai = this.getOpenAIClient();

      const totalPrefs = Object.values(preferences).flat().length;

      // Extract detailed Qloo data for better narrative generation
      const qlooInsights = culturalProfile.qlooInsights || {};
      const entityMapping = qlooInsights.entityMapping || {};
      const totalQlooEntities = qlooInsights.totalEntitiesFound || 0;
      const matchRate = qlooInsights.matchRate || 0;
      const domainsWithEntities = qlooInsights.domainsWithEntities || [];

      // Build detailed context for LLM
      const entityContext = this.buildEntityContext(entityMapping);
      const connectionContext = this.buildConnectionContext(
        culturalProfile.connections
      );
      const diversityContext = this.buildDiversityContext(
        culturalProfile,
        matchRate
      );

      const prompt = `You are an expert cultural anthropologist with access to Qloo's comprehensive cultural intelligence database. Analyze this person's cultural profile and create a completely original, data-driven narrative.

CULTURAL PREFERENCES ANALYSIS:
${Object.entries(preferences)
  .map(([domain, items]) => `${domain.toUpperCase()}: ${items.join(", ")}`)
  .join("\n")}

QLOO CULTURAL INTELLIGENCE DATA:
- Total preferences analyzed: ${totalPrefs}
- Qloo entities successfully matched: ${totalQlooEntities}/${totalPrefs} (${(
        matchRate * 100
      ).toFixed(1)}% database recognition)
- Active cultural domains: ${domainsWithEntities.join(", ")}
- Cultural diversity score: ${
        culturalProfile.diversityScore || "calculating..."
      }

DETAILED ENTITY ANALYSIS:
${entityContext}

CROSS-DOMAIN CONNECTION ANALYSIS:
${connectionContext}

CULTURAL PATTERNS DETECTED:
${culturalProfile.patterns.join("\n- ")}

DIVERSITY & SOPHISTICATION METRICS:
${diversityContext}

CRITICAL REQUIREMENTS:
1. Generate a COMPLETELY ORIGINAL cultural archetype title (3-4 words) based on their actual data patterns
2. Write an ENTIRELY NEW story (4-5 paragraphs) that weaves together their specific Qloo data
3. Create SPECIFIC insights derived from their actual cultural intelligence metrics
4. Generate PERSONALIZED recommendations based on their connection network and gaps
5. Predict UNIQUE evolution paths based on their current cultural position
6. Identify SPECIFIC blind spots from their data analysis

ANALYSIS GUIDELINES:
- Match rate >80%: Strong mainstream cultural alignment
- Match rate 60-80%: Balanced established/emerging interests  
- Match rate 40-60%: Selective authenticity-focused curation
- Match rate 20-40%: Niche/emerging cultural focus
- Match rate <20%: Highly unique underground perspective

- Diversity score >80: Exceptionally broad engagement
- Diversity score 60-80: Well-rounded intelligence
- Diversity score 40-60: Focused with variety
- Diversity score <40: Specialized/developing profile

DO NOT use any generic templates or static responses. Every element must be generated specifically for this person's unique cultural data profile.

FORMAT AS JSON:
{
  "title": "Original 3-4 word cultural archetype based on their specific data",
  "story": "Completely original 4-5 paragraph narrative using their actual Qloo metrics and connections",
  "insights": ["5 unique insights derived specifically from their cultural intelligence data"],
  "personality": "One original sentence capturing their specific cultural personality",
  "culturalDNA": "One unique sentence describing their core cultural essence from actual data",
  "recommendations": ["6 specific recommendations based on their actual Qloo network and gaps"],
  "evolutionPredictions": ["4 unique predictions based on their specific cultural trajectory"],
  "culturalBlindSpots": ["3 specific cultural gaps identified from their data analysis"],
  "diversityScore": [calculate based on their actual data]
}

Generate everything from scratch based on their unique cultural intelligence profile.`;

      console.log(
        "🤖 Generating completely original cultural narrative with OpenAI..."
      );

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.9, // Higher creativity for more original content
        max_tokens: 3500,
        response_format: { type: "json_object" },
      });

      const response = completion.choices[0].message.content;
      if (!response) {
        throw new Error("OpenAI returned empty response");
      }

      try {
        const parsed = JSON.parse(response);
        console.log(
          "✅ Generated completely original cultural narrative from OpenAI"
        );

        return {
          title: parsed.title,
          story: parsed.story,
          insights: parsed.insights || [],
          personality: parsed.personality,
          culturalDNA: parsed.culturalDNA,
          recommendations: parsed.recommendations || [],
          evolutionPredictions: parsed.evolutionPredictions || [],
          culturalBlindSpots: parsed.culturalBlindSpots || [],
          diversityScore:
            parsed.diversityScore || culturalProfile.diversityScore || 75,
        };
      } catch (parseError) {
        console.error("Failed to parse OpenAI response:", parseError);
        throw new Error("OpenAI response parsing failed - invalid JSON format");
      }
    } catch (error) {
      console.error("❌ OpenAI cultural narrative generation failed:", error);
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
      const openai = this.getOpenAIClient();
      const qlooContext = culturalProfile?.qlooInsights
        ? this.buildQlooDiscoveryContext(culturalProfile)
        : "";

      const prompt = `Based on this person's unique cultural intelligence profile, generate 6 completely original, specific discovery recommendations:

CULTURAL IDENTITY: ${culturalNarrative.title}
CULTURAL DNA: ${culturalNarrative.culturalDNA}
PERSONALITY: ${culturalNarrative.personality}
DIVERSITY SCORE: ${culturalNarrative.diversityScore}/100
CULTURAL BLIND SPOTS: ${
        culturalNarrative.culturalBlindSpots?.join(", ") || "To be determined"
      }

CURRENT PREFERENCES WITH QLOO INTELLIGENCE: 
${Object.entries(preferences)
  .map(([domain, items]) => `${domain.toUpperCase()}: ${items.join(", ")}`)
  .join("\n")}

${qlooContext}

DETECTED CROSS-DOMAIN CONNECTIONS:
${
  culturalProfile?.connections
    ?.map(
      (conn) =>
        `${conn.domain1} ↔ ${conn.domain2}: ${(conn.strength * 100).toFixed(
          1
        )}% strength - ${conn.explanation}`
    )
    .join("\n") || "No strong connections detected in current analysis"
}

REQUIREMENTS:
1. Each recommendation must be COMPLETELY ORIGINAL and SPECIFIC (no generic suggestions)
2. Reference their actual Qloo entity data and connection patterns
3. Address their identified cultural blind spots with concrete actions
4. Match their sophistication level (diversity score: ${
        culturalNarrative.diversityScore
      }/100)
5. Include specific names, places, artists, or experiences
6. Build on their strongest cultural domains to explore weaker ones

Generate 6 unique, actionable recommendations as a JSON object.

Format: {"recommendations": ["specific recommendation 1", "specific recommendation 2", ...]}`;

      console.log(
        "🎯 Generating original discovery recommendations with OpenAI..."
      );

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.85,
        max_tokens: 1200,
        response_format: { type: "json_object" },
      });

      const response = completion.choices[0].message.content;
      if (!response) {
        throw new Error("OpenAI returned empty response for recommendations");
      }

      try {
        const parsed = JSON.parse(response);
        const recommendations = parsed.recommendations || Object.values(parsed);
        console.log(
          "✅ Generated original discovery recommendations from OpenAI"
        );

        if (!Array.isArray(recommendations) || recommendations.length === 0) {
          throw new Error("OpenAI returned invalid recommendations format");
        }

        return recommendations.slice(0, 6);
      } catch (parseError) {
        console.error("Failed to parse OpenAI recommendations:", parseError);
        throw new Error(
          "Recommendations parsing failed - invalid format returned"
        );
      }
    } catch (error) {
      console.error(
        "❌ OpenAI discovery recommendations generation failed:",
        error
      );
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
      const openai = this.getOpenAIClient();
      const qlooContext = this.buildQlooDiscoveryContext(culturalProfile);

      const prompt = `Based on this person's Qloo-analyzed cultural intelligence profile, predict 4 completely original ways their cultural taste will evolve over the next 2-3 years:

CURRENT CULTURAL PREFERENCES: 
${Object.entries(preferences)
  .map(([domain, items]) => `${domain}: ${items.join(", ")}`)
  .join("\n")}

${qlooContext}

DETECTED CULTURAL PATTERNS: ${culturalProfile.patterns.join(", ")}

CURRENT CROSS-DOMAIN CONNECTIONS: 
${
  culturalProfile.connections
    ?.map(
      (c) =>
        `${c.domain1}↔${c.domain2} (${(c.strength * 100).toFixed(
          1
        )}% strength): ${c.explanation}`
    )
    .join("\n") || "No significant connections detected yet"
}

Generate 4 completely original predictions based on their actual data patterns.

Return as JSON: {"predictions": ["prediction 1", "prediction 2", "prediction 3", "prediction 4"]}`;

      console.log(
        "🔮 Generating original evolution predictions with OpenAI..."
      );

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
        max_tokens: 1000,
        response_format: { type: "json_object" },
      });

      const response = completion.choices[0].message.content;
      if (!response) {
        throw new Error(
          "OpenAI returned empty response for evolution predictions"
        );
      }

      try {
        const parsed = JSON.parse(response);
        const predictions = parsed.predictions || Object.values(parsed);
        console.log("✅ Generated original evolution predictions from OpenAI");

        return Array.isArray(predictions) ? predictions.slice(0, 4) : [];
      } catch (parseError) {
        console.error(
          "Failed to parse OpenAI evolution predictions:",
          parseError
        );
        throw new Error(
          "Evolution predictions parsing failed - invalid format returned"
        );
      }
    } catch (error) {
      console.error(
        "❌ OpenAI evolution predictions generation failed:",
        error
      );
      throw new Error(
        `Evolution predictions generation failed: ${
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
      const openai = this.getOpenAIClient();
      const qlooContext = this.buildQlooDiscoveryContext(culturalProfile);

      const prompt = `Based on this person's specific cultural intelligence profile, generate 4 completely original, personalized growth challenges that will expand their cultural horizons:

CULTURAL IDENTITY: ${narrative.title}
CULTURAL DNA: ${narrative.culturalDNA}
DIVERSITY SCORE: ${narrative.diversityScore}/100
CULTURAL BLIND SPOTS: ${
        narrative.culturalBlindSpots?.join(", ") || "None identified"
      }

CURRENT PREFERENCES:
${Object.entries(preferences)
  .map(([domain, items]) => `${domain.toUpperCase()}: ${items.join(", ")}`)
  .join("\n")}

${qlooContext}

CROSS-DOMAIN CONNECTIONS:
${
  culturalProfile.connections
    ?.map(
      (conn) =>
        `${conn.domain1} ↔ ${conn.domain2}: ${(conn.strength * 100).toFixed(
          1
        )}% strength - ${conn.explanation}`
    )
    .join("\n") || "No strong connections detected yet"
}

QLOO INSIGHTS:
- Database Recognition: ${(
        (culturalProfile.qlooInsights?.matchRate || 0) * 100
      ).toFixed(1)}%
- Active Domains: ${
        culturalProfile.qlooInsights?.domainsWithEntities?.length || 0
      }/5
- Total Entities: ${culturalProfile.qlooInsights?.totalEntitiesFound || 0}

REQUIREMENTS:
Generate 4 specific, actionable cultural growth challenges that:

1. **Address their cultural blind spots** - Target gaps in their profile
2. **Challenge their comfort zone** - Push beyond current preferences  
3. **Build on their strengths** - Use existing interests as stepping stones
4. **Are measurable and time-bound** - Include specific actions and timeframes
5. **Match their sophistication level** - Appropriate for their diversity score
6. **Reference their actual data** - Use their Qloo entities and connections

CHALLENGE CALIBRATION:
- Diversity score 80+: Advanced, experimental challenges requiring cultural leadership
- Diversity score 60-79: Intermediate challenges connecting familiar with unfamiliar
- Diversity score 40-59: Foundational challenges expanding core interests
- Diversity score <40: Accessible challenges building cultural confidence

Each challenge should be immediately actionable with specific steps, not generic advice.

Return as JSON: {"challenges": ["specific challenge 1", "specific challenge 2", "specific challenge 3", "specific challenge 4"]}`;

      console.log(
        "🎯 Generating original cultural growth challenges with OpenAI..."
      );

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.85,
        max_tokens: 1000,
        response_format: { type: "json_object" },
      });

      const response = completion.choices[0].message.content;
      if (!response) {
        throw new Error("OpenAI returned empty response for growth challenges");
      }

      try {
        const parsed = JSON.parse(response);
        const challenges = parsed.challenges || Object.values(parsed);
        console.log(
          "✅ Generated original cultural growth challenges from OpenAI"
        );

        if (!Array.isArray(challenges) || challenges.length === 0) {
          throw new Error("OpenAI returned invalid challenges format");
        }

        return challenges.slice(0, 4);
      } catch (parseError) {
        console.error("Failed to parse OpenAI growth challenges:", parseError);
        throw new Error(
          "Growth challenges parsing failed - invalid format returned"
        );
      }
    } catch (error) {
      console.error(
        "❌ OpenAI cultural growth challenges generation failed:",
        error
      );
      throw new Error(
        `Cultural growth challenges generation failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  // Helper methods
  private buildEntityContext(
    entityMapping: Record<string, QlooEntity[]>
  ): string {
    if (!entityMapping || Object.keys(entityMapping).length === 0) {
      return "No detailed entity mapping available from Qloo analysis";
    }

    const context = [];
    for (const [domain, entities] of Object.entries(entityMapping)) {
      if (entities && entities.length > 0) {
        const entityDetails = entities
          .map(
            (entity) =>
              `"${entity.name}" (Qloo ID: ${entity.id}, Popularity: ${
                entity.popularity || "N/A"
              }, Cultural Types: ${
                entity.types?.join(", ") || "N/A"
              }, Geographic: ${entity.location?.country || "Global"})`
          )
          .join("\n  - ");
        context.push(`${domain.toUpperCase()} ENTITIES:\n  - ${entityDetails}`);
      }
    }
    return context.join("\n\n");
  }

  private buildConnectionContext(
    connections: CulturalProfile["connections"]
  ): string {
    if (!connections || connections.length === 0) {
      return "No significant cross-domain connections detected in cultural preferences";
    }

    return connections
      .map(
        (conn) =>
          `${conn.domain1} ↔ ${conn.domain2}: ${(conn.strength * 100).toFixed(
            1
          )}% connection strength
      - Analysis: ${conn.explanation}
      - Connected Entities: ${
        conn.qlooEntities?.length || 0
      } Qloo entities bridging these domains`
      )
      .join("\n\n");
  }

  private buildDiversityContext(
    culturalProfile: CulturalProfile,
    matchRate: number
  ): string {
    const context = [];
    context.push(
      `Qloo Database Recognition: ${(matchRate * 100).toFixed(
        1
      )}% of preferences successfully matched`
    );
    context.push(
      `Cultural Diversity Score: ${
        culturalProfile.diversityScore || "Computing..."
      }/100`
    );
    context.push(
      `Cultural Depth Assessment: ${
        culturalProfile.culturalDepth || "Computing..."
      }/100`
    );
    context.push(
      `Cross-Domain Relationship Count: ${
        culturalProfile.connections?.length || 0
      } significant connections`
    );

    if (culturalProfile.qlooInsights?.domainsWithEntities) {
      context.push(
        `Active Domain Coverage: ${culturalProfile.qlooInsights.domainsWithEntities.length}/5 domains with recognized entities`
      );
    }

    if (culturalProfile.qlooInsights?.entityMapping) {
      const totalEntities = Object.values(
        culturalProfile.qlooInsights.entityMapping
      ).flat().length;
      context.push(
        `Total Cultural Entities Mapped: ${totalEntities} unique Qloo entities identified`
      );
    }

    return context.join("\n");
  }

  private buildQlooDiscoveryContext(culturalProfile: CulturalProfile): string {
    const qlooInsights = culturalProfile.qlooInsights;
    if (!qlooInsights) return "No Qloo intelligence data available";

    const context = [];
    context.push(`QLOO CULTURAL INTELLIGENCE ANALYSIS:`);
    context.push(
      `- Database Recognition Rate: ${(
        (qlooInsights.matchRate || 0) * 100
      ).toFixed(1)}%`
    );
    context.push(
      `- Total Recognized Cultural Entities: ${
        qlooInsights.totalEntitiesFound || 0
      }`
    );
    context.push(
      `- Active Cultural Domains: ${
        qlooInsights.domainsWithEntities?.length || 0
      }/5`
    );

    if (qlooInsights.entityMapping) {
      context.push(`\nDETAILED ENTITY BREAKDOWN:`);
      for (const [domain, entities] of Object.entries(
        qlooInsights.entityMapping
      )) {
        if (entities && Array.isArray(entities) && entities.length > 0) {
          const popularities = entities.map((e) => e.popularity || 0);
          const avgPopularity =
            popularities.reduce((a, b) => a + b, 0) / popularities.length;
          const uniqueTypes = new Set(entities.flatMap((e) => e.types || []));
          context.push(
            `${domain}: ${
              entities.length
            } entities, avg popularity: ${avgPopularity.toFixed(
              2
            )}, types: ${Array.from(uniqueTypes).join(", ")}`
          );
        }
      }
    }

    return context.join("\n");
  }

  // Test method to verify OpenAI connection (server-side only)
  async testOpenAIConnection(): Promise<{
    success: boolean;
    message: string;
    model?: string;
  }> {
    try {
      console.log("🧪 Testing OpenAI API connection...");

      const openai = this.getOpenAIClient();

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: "Test connection - respond with 'Connected'",
          },
        ],
        max_tokens: 10,
      });

      const response = completion.choices[0].message.content;

      if (response?.toLowerCase().includes("connected")) {
        console.log("✅ OpenAI API connection successful");
        return {
          success: true,
          message: "OpenAI API connection successful!",
          model: completion.model,
        };
      } else {
        throw new Error("Unexpected response from OpenAI");
      }
    } catch (error) {
      console.error("❌ OpenAI API connection failed:", error);
      return {
        success: false,
        message: `OpenAI API connection failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }
}

export const serverOpenAIService = new ServerOpenAIService();
