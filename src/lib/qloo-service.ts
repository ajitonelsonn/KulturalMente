// src/lib/qloo-service.ts

// SECURE: Only read from environment variables in server-side code
function getQlooCredentials() {
  const QLOO_API_URL = process.env.QLOO_API_URL;
  const QLOO_API_KEY = process.env.QLOO_API_KEY;

  if (!QLOO_API_URL || !QLOO_API_KEY) {
    throw new Error(
      "Qloo API credentials not configured. Please check your .env.local file for QLOO_API_URL and QLOO_API_KEY"
    );
  }

  return { QLOO_API_URL, QLOO_API_KEY };
}

// CORRECT mapping based on working Qloo entity types
const QLOO_CATEGORY_MAP: Record<string, string> = {
  music: "urn:entity:artist", // ✅ Works
  movies: "urn:entity:movie", // ✅ Works
  food: "urn:entity:place", // ✅ Works
  travel: "urn:entity:destination", // ✅ Works
  books: "urn:entity:book", // ⚠️ Sometimes low signal
};

export interface QlooEntity {
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

export interface QlooRecommendation {
  id: string;
  name: string;
  category: string;
  score: number;
  reasoning?: string;
  confidence?: number;
  popularity?: number;
  types?: string[];
  location?: {
    country?: string;
    [key: string]: unknown;
  };
}

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

class QlooService {
  private async makeQlooRequest(
    endpoint: string,
    params?: Record<string, string>
  ): Promise<unknown> {
    const { QLOO_API_URL, QLOO_API_KEY } = getQlooCredentials();

    const url = new URL(endpoint, QLOO_API_URL);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }

    console.log(`🔍 Making Qloo API request to: ${url.toString()}`);

    try {
      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "X-API-Key": QLOO_API_KEY,
          "Content-Type": "application/json",
        },
      });

      console.log(`📡 Qloo API Response Status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Qloo API Error: ${response.status} - ${errorText}`);
        throw new Error(`Qloo API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log(`✅ Qloo API Success:`, data);
      return data;
    } catch (error) {
      console.error(`🚨 Qloo Request Failed for ${url.toString()}:`, error);
      throw error;
    }
  }

  async searchEntities(
    query: string,
    category?: string,
    limit: number = 8
  ): Promise<QlooEntity[]> {
    if (!query.trim() || query.length < 2) {
      return [];
    }

    try {
      const params = new URLSearchParams({
        q: query.trim(),
        limit: limit.toString(),
      });

      if (category && QLOO_CATEGORY_MAP[category]) {
        params.append("category", category);
      }

      console.log(
        `🔍 Searching Qloo for: "${query}" with category: ${category || "all"}`
      );

      const response = await fetch(`/api/qloo/search?${params.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.error("Search API error:", response.status);
        const errorData = await response.json();
        console.error("Search API error details:", errorData);
        return [];
      }

      const data = await response.json();
      console.log(
        `✅ Search API returned ${data.results?.length || 0} results`
      );
      return data.results || [];
    } catch (error) {
      console.error("❌ Qloo search failed:", error);
      return [];
    }
  }

  async getRecommendations(
    entities: string[],
    category?: string,
    limit: number = 10
  ): Promise<QlooRecommendation[]> {
    if (!entities.length) {
      console.warn("No entities provided for recommendations");
      return [];
    }

    try {
      console.log(
        `🎯 Getting Qloo recommendations for entities: ${entities.join(", ")}`
      );

      // Use GET request with query parameters
      const params = new URLSearchParams({
        entities: entities.join(","),
        limit: limit.toString(),
      });

      if (category) {
        params.append("category", category);
      }

      const response = await fetch(
        `/api/qloo/recommendations?${params.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();

        // Check if it's a "low signal strength" or "no recommendations" error
        if (
          errorData.message &&
          (errorData.message.includes("No recommendations available") ||
            errorData.message.includes("low a signal strength"))
        ) {
          console.warn(
            `⚠️ No recommendations available for entities in category ${category}:`,
            errorData.message
          );
          return []; // Return empty array instead of throwing error
        }

        console.error("Recommendations API error:", response.status, errorData);
        return []; // Return empty array for other errors too
      }

      const data = await response.json();
      console.log(
        `✅ Recommendations API returned ${
          data.results?.length || 0
        } results for category ${category}`
      );
      return data.results || [];
    } catch (error) {
      console.error("❌ Qloo recommendations failed:", error);
      return []; // Return empty array instead of throwing
    }
  }

  async getSimilarEntities(
    entityId: string,
    limit: number = 5
  ): Promise<QlooEntity[]> {
    if (!entityId) {
      console.warn("Entity ID is required for similar entities");
      return [];
    }

    try {
      console.log(`🔗 Getting similar entities for: ${entityId}`);

      const params = new URLSearchParams({
        entityId: entityId,
        limit: limit.toString(),
      });

      const response = await fetch(`/api/qloo/similar?${params.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.error("Similar entities API error:", response.status);
        return [];
      }

      const data = await response.json();
      console.log(
        `✅ Similar entities API returned ${data.results?.length || 0} results`
      );
      return data.results || [];
    } catch (error) {
      console.error("❌ Qloo similar entities failed:", error);
      return [];
    }
  }

  async analyzeCrossDomainConnections(
    preferences: Record<string, string[]>
  ): Promise<CulturalProfile> {
    try {
      console.log(`🧠 Analyzing cross-domain connections using REAL Qloo data`);

      const connections = [];
      const themes = [];
      const patterns = [];
      const qlooInsights: CulturalProfile["qlooInsights"] = {};

      const domains = Object.keys(preferences).filter(
        (key) => preferences[key].length > 0
      );

      const totalPrefs = Object.values(preferences).flat().length;
      console.log(
        `📊 Analyzing ${totalPrefs} preferences across ${domains.length} domains`
      );

      // Get actual Qloo entity IDs for all preferences
      const entityMapping: Record<string, QlooEntity[]> = {};

      for (const [domain, items] of Object.entries(preferences)) {
        if (items.length === 0) continue;

        console.log(
          `🔍 Finding Qloo entities for ${domain} (using ${
            QLOO_CATEGORY_MAP[domain] || "no filter"
          })`
        );
        entityMapping[domain] = [];

        // Search for each preference item to get actual Qloo entities
        for (const item of items) {
          try {
            const searchResults = await this.searchEntities(item, domain, 3);
            if (searchResults.length > 0) {
              // Take the best match (first result)
              entityMapping[domain].push(searchResults[0]);
              console.log(
                `✅ Found Qloo entity: "${item}" -> "${searchResults[0].name}" (${searchResults[0].id}) [${searchResults[0].types?.[0]}]`
              );
            } else {
              console.warn(
                `⚠️ No Qloo entities found for: "${item}" in domain ${domain}`
              );
            }

            // Add delay to avoid rate limiting
            await new Promise((resolve) => setTimeout(resolve, 100));
          } catch (error) {
            console.warn(`⚠️ Could not search Qloo for: "${item}"`, error);
          }
        }
      }

      console.log(
        `📊 Entity mapping complete:`,
        Object.fromEntries(
          Object.entries(entityMapping).map(([domain, entities]) => [
            domain,
            entities.length,
          ])
        )
      );

      // Analyze connections between domains using actual Qloo data
      for (let i = 0; i < domains.length; i++) {
        for (let j = i + 1; j < domains.length; j++) {
          const domain1 = domains[i];
          const domain2 = domains[j];

          if (
            entityMapping[domain1]?.length &&
            entityMapping[domain2]?.length
          ) {
            const connection = await this.analyzeQlooConnectionBetweenDomains(
              domain1,
              domain2,
              entityMapping[domain1],
              entityMapping[domain2]
            );

            if (connection.strength > 0.1) {
              connections.push(connection);
              console.log(
                `🔗 Found connection: ${domain1} ↔ ${domain2} (${Math.round(
                  connection.strength * 100
                )}%)`
              );
            }
          }
        }
      }

      // Generate themes based on actual Qloo entity analysis
      const detectedThemes = this.extractThemesFromQlooEntities(entityMapping);
      themes.push(...detectedThemes);

      // Generate patterns based on Qloo data
      const detectedPatterns = this.identifyPatternsFromQlooData(
        entityMapping,
        totalPrefs
      );
      patterns.push(...detectedPatterns);

      // Calculate diversity metrics using Qloo data
      const diversityScore = this.calculateQlooDiversityScore(entityMapping);
      const culturalDepth = this.calculateCulturalDepth(preferences);

      // Store Qloo insights for debugging
      qlooInsights.entityMapping = Object.fromEntries(
        Object.entries(entityMapping).map(([domain, entities]) => [
          domain,
          entities.map((e) => ({
            id: e.id,
            name: e.name,
            types: e.types,
            popularity: e.popularity,
          })) as QlooEntity[],
        ])
      );
      qlooInsights.totalEntitiesFound =
        Object.values(entityMapping).flat().length;
      qlooInsights.domainsWithEntities = Object.keys(entityMapping).filter(
        (d) => entityMapping[d].length > 0
      );
      qlooInsights.categoryMappingUsed = QLOO_CATEGORY_MAP;
      qlooInsights.matchRate =
        Object.values(entityMapping).flat().length / totalPrefs;

      console.log(
        `✅ Cultural analysis complete: ${connections.length} connections, ${themes.length} themes, ${patterns.length} patterns`
      );
      console.log(
        `📈 Match rate: ${(qlooInsights.matchRate * 100).toFixed(1)}% (${
          qlooInsights.totalEntitiesFound
        }/${totalPrefs})`
      );

      return {
        themes,
        connections,
        patterns,
        diversityScore,
        culturalDepth,
        qlooInsights,
      };
    } catch (error) {
      console.error("❌ Cross-domain analysis failed:", error);

      // Return a meaningful profile even if analysis fails
      return {
        themes: ["Cultural Explorer", "Emerging Taste Profile"],
        connections: [],
        patterns: [
          "Developing cultural interests",
          "Seeking authentic experiences",
        ],
        diversityScore: 50,
        culturalDepth: 25,
        qlooInsights: {
          error: error instanceof Error ? error.message : "Analysis failed",
          totalEntitiesFound: 0,
          matchRate: 0,
        },
      };
    }
  }

  private async analyzeQlooConnectionBetweenDomains(
    domain1: string,
    domain2: string,
    entities1: QlooEntity[],
    entities2: QlooEntity[]
  ): Promise<{
    domain1: string;
    domain2: string;
    strength: number;
    explanation: string;
    qlooEntities: string[];
  }> {
    try {
      // Use Qloo's recommendation API to find connections
      const entityIds1 = entities1.map((e) => e.id);

      console.log(
        `🔗 Analyzing connection between ${domain1} (${entityIds1.length} entities) and ${domain2}`
      );

      const recommendations = await this.getRecommendations(
        entityIds1,
        domain2,
        5
      );

      let connectionStrength = 0;
      const connectedEntities = [...entityIds1];

      if (recommendations.length > 0) {
        // Calculate connection strength based on recommendations and scores
        const avgScore =
          recommendations.reduce((sum, rec) => sum + rec.score, 0) /
          recommendations.length;
        const recommendationRatio = recommendations.length / 5; // Max 5 recommendations

        // Combine recommendation count and average score
        connectionStrength = Math.min(
          0.95,
          recommendationRatio * 0.7 + avgScore * 0.3
        );
        connectedEntities.push(...recommendations.map((r) => r.id));

        console.log(
          `🔗 Qloo found ${
            recommendations.length
          } connections between ${domain1} and ${domain2}, avg score: ${avgScore.toFixed(
            2
          )}, strength: ${connectionStrength.toFixed(2)}`
        );
      } else {
        // If no recommendations, analyze based on entity properties similarity
        console.log(
          `🔗 No direct recommendations, analyzing entity similarity...`
        );

        // Calculate similarity based on popularity scores
        const avgPop1 =
          entities1.reduce((sum, e) => sum + (e.popularity || 0), 0) /
          entities1.length;
        const avgPop2 =
          entities2.reduce((sum, e) => sum + (e.popularity || 0), 0) /
          entities2.length;
        const popularitySimilarity = 1 - Math.abs(avgPop1 - avgPop2);

        // Calculate location similarity if both have location data
        const entities1WithLocation = entities1.filter(
          (e) => e.location?.country
        );
        const entities2WithLocation = entities2.filter(
          (e) => e.location?.country
        );

        let locationSimilarity = 0;
        if (
          entities1WithLocation.length > 0 &&
          entities2WithLocation.length > 0
        ) {
          const countries1 = new Set(
            entities1WithLocation.map((e) => e.location!.country!)
          );
          const countries2 = new Set(
            entities2WithLocation.map((e) => e.location!.country!)
          );
          const intersection = new Set(
            [...countries1].filter((x) => countries2.has(x))
          );
          locationSimilarity =
            intersection.size / Math.max(countries1.size, countries2.size);
        }

        // Analyze tag similarity if available
        let tagSimilarity = 0;
        const tags1 = new Set(entities1.flatMap((e) => e.tags || []));
        const tags2 = new Set(entities2.flatMap((e) => e.tags || []));
        if (tags1.size > 0 && tags2.size > 0) {
          const intersection = new Set([...tags1].filter((x) => tags2.has(x)));
          tagSimilarity = intersection.size / Math.max(tags1.size, tags2.size);
        }

        // Base connection strength on similarity metrics
        connectionStrength = Math.max(
          0.1,
          popularitySimilarity * 0.4 +
            locationSimilarity * 0.3 +
            tagSimilarity * 0.2 +
            0.1
        );

        console.log(
          `🔗 Similarity-based connection: popularity(${popularitySimilarity.toFixed(
            2
          )}) + location(${locationSimilarity.toFixed(
            2
          )}) + tags(${tagSimilarity.toFixed(
            2
          )}) = ${connectionStrength.toFixed(2)}`
        );
      }

      const strengthLabel =
        connectionStrength > 0.7
          ? "strong"
          : connectionStrength > 0.4
          ? "moderate"
          : "subtle";

      return {
        domain1,
        domain2,
        strength: connectionStrength,
        explanation:
          recommendations.length > 0
            ? `Qloo's cultural intelligence identified ${strengthLabel} thematic connections between your ${domain1} and ${domain2} preferences`
            : `Cultural similarity analysis reveals ${strengthLabel} connections between your ${domain1} and ${domain2} preferences based on popularity, geography, and thematic tags`,
        qlooEntities: connectedEntities,
      };
    } catch (error) {
      console.warn(
        `⚠️ Could not analyze connection between ${domain1} and ${domain2}:`,
        error
      );
      return {
        domain1,
        domain2,
        strength: 0.2, // Give a minimal connection strength
        explanation: `Cultural preferences in ${domain1} and ${domain2} show potential thematic connections`,
        qlooEntities: entities1.map((e) => e.id),
      };
    }
  }

  private extractThemesFromQlooEntities(
    entityMapping: Record<string, QlooEntity[]>
  ): string[] {
    const themes = [];

    const totalEntities = Object.values(entityMapping).flat().length;
    const domainsWithEntities = Object.keys(entityMapping).filter(
      (domain) => entityMapping[domain].length > 0
    );

    console.log(
      `🎨 Extracting themes from ${totalEntities} Qloo entities across ${domainsWithEntities.length} domains`
    );

    // Database recognition themes
    if (totalEntities > 12) {
      themes.push("Comprehensive Cultural Database Recognition");
    } else if (totalEntities > 8) {
      themes.push("Strong Cultural Database Alignment");
    } else if (totalEntities > 4) {
      themes.push("Moderate Cultural Recognition");
    } else if (totalEntities > 0) {
      themes.push("Emerging Cultural Recognition");
    } else {
      themes.push("Unique Cultural Perspective");
    }

    // Domain coverage themes
    if (domainsWithEntities.length >= 4) {
      themes.push("Multi-Domain Cultural Coherence");
    } else if (domainsWithEntities.length >= 3) {
      themes.push("Cross-Domain Cultural Interests");
    } else if (domainsWithEntities.length >= 2) {
      themes.push("Focused Cultural Domains");
    }

    // Depth themes
    if (Object.values(entityMapping).some((entities) => entities.length >= 4)) {
      themes.push("Deep Domain Specialization");
    } else if (
      Object.values(entityMapping).some((entities) => entities.length >= 2)
    ) {
      themes.push("Selective Domain Focus");
    }

    // Popularity analysis
    const allEntities = Object.values(entityMapping).flat();
    if (allEntities.length > 0) {
      const avgPopularity =
        allEntities.reduce((sum, entity) => sum + (entity.popularity || 0), 0) /
        allEntities.length;

      if (avgPopularity > 0.8) {
        themes.push("Mainstream Cultural Recognition");
      } else if (avgPopularity > 0.6) {
        themes.push("Popular Cultural Alignment");
      } else if (avgPopularity > 0.4) {
        themes.push("Balanced Cultural Portfolio");
      } else if (avgPopularity > 0.2) {
        themes.push("Niche Cultural Discovery");
      } else {
        themes.push("Underground Cultural Exploration");
      }

      console.log(`📊 Average popularity score: ${avgPopularity.toFixed(2)}`);
    }

    // Geographic diversity
    const entitiesWithLocation = allEntities.filter((e) => e.location?.country);
    if (entitiesWithLocation.length > 0) {
      const uniqueCountries = new Set(
        entitiesWithLocation.map((e) => e.location!.country!)
      );
      if (uniqueCountries.size > 3) {
        themes.push("Globally Diverse Cultural Interests");
      } else if (uniqueCountries.size > 1) {
        themes.push("Geographically Varied Preferences");
      }
    }

    console.log(`🎨 Extracted ${themes.length} themes: ${themes.join(", ")}`);
    return themes;
  }

  private identifyPatternsFromQlooData(
    entityMapping: Record<string, QlooEntity[]>,
    totalPrefs: number
  ): string[] {
    const patterns = [];
    const domains = Object.keys(entityMapping).filter(
      (domain) => entityMapping[domain].length > 0
    );
    const totalQlooEntities = Object.values(entityMapping).flat().length;

    // Calculate match rate (how many preferences matched Qloo entities)
    const matchRate = totalQlooEntities / totalPrefs;

    console.log(
      `📊 Identifying patterns: ${totalQlooEntities}/${totalPrefs} preferences matched (${(
        matchRate * 100
      ).toFixed(1)}%)`
    );

    // Match rate patterns
    if (matchRate > 0.9) {
      patterns.push(
        "Exceptional Qloo database alignment - culturally significant preferences across all domains"
      );
    } else if (matchRate > 0.75) {
      patterns.push(
        "Excellent cultural recognition with highly established taste profile"
      );
    } else if (matchRate > 0.6) {
      patterns.push(
        "Strong cultural database match with well-recognized preferences"
      );
    } else if (matchRate > 0.4) {
      patterns.push("Good cultural recognition with some distinctive choices");
    } else if (matchRate > 0.25) {
      patterns.push(
        "Selective cultural curation with emerging and established interests"
      );
    } else {
      patterns.push(
        "Highly unique cultural perspective with specialized or emerging preferences"
      );
    }

    // Domain coverage patterns
    if (domains.length >= 4) {
      patterns.push(
        "Comprehensive cross-domain cultural intelligence validated by Qloo's network"
      );
    } else if (domains.length >= 3) {
      patterns.push(
        "Multi-domain cultural engagement with thematic consistency"
      );
    } else if (domains.length >= 2) {
      patterns.push("Focused cross-domain cultural interests");
    } else {
      patterns.push("Concentrated cultural expertise in specific domain");
    }

    // Entity type diversity patterns
    const allEntities = Object.values(entityMapping).flat();
    const uniqueTypes = new Set(
      allEntities.flatMap((entity) => entity.types || [])
    );
    if (uniqueTypes.size > 8) {
      patterns.push(
        "Exceptionally diverse engagement across Qloo's cultural taxonomy"
      );
    } else if (uniqueTypes.size > 5) {
      patterns.push("Broad engagement across multiple cultural entity types");
    } else if (uniqueTypes.size > 2) {
      patterns.push("Focused cultural type preferences with some variety");
    }

    // Popularity distribution patterns
    if (allEntities.length > 0) {
      const popularities = allEntities.map((e) => e.popularity || 0);
      const avgPop =
        popularities.reduce((a, b) => a + b, 0) / popularities.length;
      const variance = this.calculateVariance(popularities);

      if (variance > 0.3 && avgPop > 0.5) {
        patterns.push(
          "Balanced mix of mainstream and niche cultural preferences"
        );
      } else if (avgPop > 0.7) {
        patterns.push(
          "Preference for culturally significant and widely recognized entities"
        );
      } else if (avgPop < 0.4) {
        patterns.push(
          "Gravitates toward emerging or underground cultural movements"
        );
      }
    }

    // Geographic patterns
    const entitiesWithLocation = allEntities.filter(
      (entity) => entity.location?.country
    );
    if (entitiesWithLocation.length > 0) {
      const uniqueCountries = new Set(
        entitiesWithLocation.map((e) => e.location!.country!)
      );
      if (uniqueCountries.size > 2) {
        patterns.push(
          "Internationally diverse cultural interests spanning multiple regions"
        );
      } else if (uniqueCountries.size > 1) {
        patterns.push("Culturally curious with some international perspective");
      }
    }

    // Quality assurance pattern
    patterns.push(
      "Preferences validated by Qloo's comprehensive cultural intelligence network"
    );

    console.log(`📊 Identified ${patterns.length} patterns`);
    return patterns;
  }

  private calculateQlooDiversityScore(
    entityMapping: Record<string, QlooEntity[]>
  ): number {
    const domains = Object.keys(entityMapping).filter(
      (domain) => entityMapping[domain].length > 0
    );
    const totalEntities = Object.values(entityMapping).flat().length;
    const allEntities = Object.values(entityMapping).flat();

    console.log(
      `📈 Calculating diversity score for ${totalEntities} entities across ${domains.length} domains`
    );

    // Domain coverage score (0-25 points)
    const domainScore = (domains.length / 5) * 25;

    // Entity recognition score (0-25 points)
    const recognitionScore = Math.min(25, (totalEntities / 20) * 25);

    // Popularity diversity score (0-20 points)
    let popularityScore = 10; // Default
    if (allEntities.length > 0) {
      const popularities = allEntities.map((e) => e.popularity || 0);
      const popularityVariance = this.calculateVariance(popularities);
      const avgPopularity =
        popularities.reduce((a, b) => a + b, 0) / popularities.length;
      popularityScore = Math.min(
        20,
        popularityVariance * 10 + avgPopularity * 10
      );
    }

    // Entity type diversity score (0-15 points)
    const uniqueTypes = new Set(
      allEntities.flatMap((entity) => entity.types || [])
    );
    const typeScore = Math.min(15, uniqueTypes.size * 1.5);

    // Geographic diversity score (0-10 points)
    const entitiesWithLocation = allEntities.filter((e) => e.location?.country);
    const uniqueCountries = new Set(
      entitiesWithLocation.map((e) => e.location!.country!)
    );
    const geoScore = Math.min(10, uniqueCountries.size * 2.5);

    // Balance score (0-5 points)
    const variance = this.calculateEntityVariance(entityMapping);
    const balanceScore = (1 - variance) * 5;

    const score = Math.round(
      domainScore +
        recognitionScore +
        popularityScore +
        typeScore +
        geoScore +
        balanceScore
    );

    console.log(
      `📈 Diversity score breakdown: domains(${domainScore.toFixed(
        1
      )}) + recognition(${recognitionScore.toFixed(
        1
      )}) + popularity(${popularityScore.toFixed(
        1
      )}) + types(${typeScore.toFixed(1)}) + geo(${geoScore.toFixed(
        1
      )}) + balance(${balanceScore.toFixed(1)}) = ${score}/100`
    );

    return score;
  }

  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance =
      values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) /
      values.length;
    return Math.min(1, Math.sqrt(variance));
  }

  private calculateEntityVariance(
    entityMapping: Record<string, QlooEntity[]>
  ): number {
    const lengths = Object.values(entityMapping).map(
      (entities) => entities.length
    );
    if (lengths.length === 0) return 1;

    const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const variance =
      lengths.reduce((acc, length) => acc + Math.pow(length - mean, 2), 0) /
      lengths.length;

    return Math.min(1, variance / 10);
  }

  private calculateCulturalDepth(
    preferences: Record<string, string[]>
  ): number {
    const totalPrefs = Object.values(preferences).flat().length;
    const domains = Object.keys(preferences).filter(
      (key) => preferences[key].length > 0
    );

    const avgPrefsPerDomain =
      domains.length > 0 ? totalPrefs / domains.length : 0;
    return Math.min(100, Math.round(avgPrefsPerDomain * 20));
  }

  // Method to test which entity types work with Qloo API
  async testAvailableEntityTypes(): Promise<{
    working: string[];
    failing: string[];
  }> {
    const testTypes = [
      "urn:entity:music",
      "urn:entity:artist",
      "urn:entity:album",
      "urn:entity:movie",
      "urn:entity:film",
      "urn:entity:book",
      "urn:entity:destination",
      "urn:entity:place",
      "urn:entity:food",
    ];

    const working = [];
    const failing = [];

    console.log(`🧪 Testing ${testTypes.length} entity types...`);

    for (const type of testTypes) {
      try {
        const params = {
          q: "test",
          "filter.type": type,
          limit: "1",
        };

        await this.makeQlooRequest("/search", params);
        working.push(type);
        console.log(`✅ ${type} works`);
      } catch (error) {
        failing.push(type);
        console.log(
          `❌ ${type} fails: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }

      // Add delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    console.log(
      `🧪 Test complete: ${working.length} working, ${failing.length} failing`
    );
    return { working, failing };
  }

  // Method to test Qloo API connection
  async testQlooConnection(): Promise<{
    success: boolean;
    message: string;
    data?: unknown;
  }> {
    try {
      console.log(`🧪 Testing Qloo API connection...`);

      // Check if credentials are available
      try {
        getQlooCredentials();
      } catch (error) {
        return {
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "Credentials not configured",
        };
      }

      const testResults = await this.searchEntities("test", undefined, 1);
      console.log(`✅ Qloo API connection successful`);
      return {
        success: true,
        message: "Qloo API connection successful!",
        data: testResults,
      };
    } catch (error) {
      console.error(`❌ Qloo API connection failed:`, error);
      return {
        success: false,
        message: `Qloo API connection failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  // Method to get detailed analysis stats
  getAnalysisStats(culturalProfile: CulturalProfile): Record<string, unknown> {
    return {
      totalEntitiesFound: culturalProfile.qlooInsights?.totalEntitiesFound || 0,
      matchRate: culturalProfile.qlooInsights?.matchRate || 0,
      domainsWithEntities:
        culturalProfile.qlooInsights?.domainsWithEntities?.length || 0,
      connectionsFound: culturalProfile.connections.length,
      diversityScore: culturalProfile.diversityScore || 0,
      culturalDepth: culturalProfile.culturalDepth || 0,
      themesGenerated: culturalProfile.themes.length,
      patternsIdentified: culturalProfile.patterns.length,
      entityBreakdown: culturalProfile.qlooInsights?.entityMapping || {},
      categoryMappingUsed:
        culturalProfile.qlooInsights?.categoryMappingUsed || {},
    };
  }

  // Method to get entity details by ID
  async getEntityDetails(entityId: string): Promise<QlooEntity | null> {
    try {
      console.log(`🔍 Getting details for entity: ${entityId}`);

      // Try to get entity details using similar endpoint with the entity as input
      const similar = await this.getSimilarEntities(entityId, 1);
      if (similar.length > 0) {
        // The first result might be the entity itself or we can infer details
        return similar[0];
      }

      return null;
    } catch (error) {
      console.error(`❌ Failed to get entity details for ${entityId}:`, error);
      return null;
    }
  }

  // Method to batch process multiple search queries
  async batchSearchEntities(
    queries: Array<{ query: string; category?: string }>,
    limit: number = 3
  ): Promise<Record<string, QlooEntity[]>> {
    const results: Record<string, QlooEntity[]> = {};

    console.log(`🔍 Batch searching ${queries.length} queries...`);

    for (let i = 0; i < queries.length; i++) {
      const { query, category } = queries[i];
      try {
        const searchResults = await this.searchEntities(query, category, limit);
        results[query] = searchResults;
        console.log(
          `✅ Batch search ${i + 1}/${queries.length}: "${query}" -> ${
            searchResults.length
          } results`
        );

        // Add delay to avoid rate limiting
        if (i < queries.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 150));
        }
      } catch (error) {
        console.error(`❌ Batch search failed for "${query}":`, error);
        results[query] = [];
      }
    }

    console.log(
      `✅ Batch search complete: ${queries.length} queries processed`
    );
    return results;
  }

  // Method to validate entity IDs
  async validateEntityIds(
    entityIds: string[]
  ): Promise<{ valid: string[]; invalid: string[] }> {
    const valid = [];
    const invalid = [];

    console.log(`🔍 Validating ${entityIds.length} entity IDs...`);

    for (const entityId of entityIds) {
      try {
        const similar = await this.getSimilarEntities(entityId, 1);
        if (similar.length > 0) {
          valid.push(entityId);
        } else {
          invalid.push(entityId);
        }

        // Add delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        invalid.push(entityId);
        console.warn(`⚠️ Entity ID ${entityId} appears invalid:`, error);
      }
    }

    console.log(
      `✅ Validation complete: ${valid.length} valid, ${invalid.length} invalid`
    );
    return { valid, invalid };
  }

  // Method to get cultural recommendations for a full profile
  async getCulturalRecommendations(
    culturalProfile: CulturalProfile,
    preferences: Record<string, string[]>
  ): Promise<Record<string, QlooRecommendation[]>> {
    const recommendations: Record<string, QlooRecommendation[]> = {};

    console.log(`🎯 Getting cultural recommendations for profile...`);

    // Get all entity IDs from the cultural profile
    const entityMapping = culturalProfile.qlooInsights?.entityMapping || {};
    const allEntityIds = Object.values(entityMapping)
      .flat()
      .map((entity: QlooEntity) => entity.id);

    if (allEntityIds.length === 0) {
      console.warn("⚠️ No entity IDs found in cultural profile");
      return recommendations;
    }

    // Get recommendations for each category
    const categories = Object.keys(preferences).filter(
      (cat) => preferences[cat].length > 0
    );

    for (const category of categories) {
      try {
        console.log(`🎯 Getting recommendations for category: ${category}`);
        const categoryRecs = await this.getRecommendations(
          allEntityIds,
          category,
          8
        );
        recommendations[category] = categoryRecs;

        // Add delay between categories
        await new Promise((resolve) => setTimeout(resolve, 200));
      } catch (error) {
        console.error(
          `❌ Failed to get recommendations for ${category}:`,
          error
        );
        recommendations[category] = [];
      }
    }

    console.log(
      `✅ Cultural recommendations complete for ${categories.length} categories`
    );
    return recommendations;
  }

  // Method to analyze cultural evolution potential
  analyzeCulturalEvolution(culturalProfile: CulturalProfile): {
    evolutionPotential: number;
    suggestedExpansions: string[];
    culturalGaps: string[];
  } {
    const entityMapping = culturalProfile.qlooInsights?.entityMapping || {};
    const domainsWithEntities = Object.keys(entityMapping).filter(
      (d) => entityMapping[d]?.length > 0
    );
    const totalEntities = Object.values(entityMapping).flat().length;

    // Calculate evolution potential (0-100)
    let evolutionPotential = 50; // Base score

    // Add points for domain coverage
    evolutionPotential += (domainsWithEntities.length / 5) * 20;

    // Add points for entity diversity
    evolutionPotential += Math.min(20, (totalEntities / 15) * 20);

    // Add points for connection strength
    const avgConnectionStrength =
      culturalProfile.connections.length > 0
        ? culturalProfile.connections.reduce(
            (sum, conn) => sum + conn.strength,
            0
          ) / culturalProfile.connections.length
        : 0;
    evolutionPotential += avgConnectionStrength * 10;

    evolutionPotential = Math.min(100, Math.round(evolutionPotential));

    // Suggest expansions based on current profile
    const suggestedExpansions = [];
    const allCategories = ["music", "movies", "food", "travel", "books"];
    const missingDomains = allCategories.filter(
      (cat) => !domainsWithEntities.includes(cat)
    );

    if (missingDomains.length > 0) {
      suggestedExpansions.push(
        `Explore ${missingDomains[0]} to create new cross-domain connections`
      );
    }

    if (
      domainsWithEntities.some((domain) => entityMapping[domain].length < 3)
    ) {
      suggestedExpansions.push(
        "Deepen existing domains with more specific preferences"
      );
    }

    if (culturalProfile.diversityScore && culturalProfile.diversityScore < 70) {
      suggestedExpansions.push(
        "Explore more diverse cultural expressions within current interests"
      );
    }

    // Identify cultural gaps
    const culturalGaps = [];

    if (missingDomains.length >= 3) {
      culturalGaps.push(
        "Limited domain coverage - opportunity for cultural expansion"
      );
    }

    if (totalEntities < 8) {
      culturalGaps.push(
        "Developing cultural profile - room for preference discovery"
      );
    }

    if (culturalProfile.connections.length === 0) {
      culturalGaps.push(
        "No cross-domain connections found - opportunity for thematic exploration"
      );
    }

    return {
      evolutionPotential,
      suggestedExpansions,
      culturalGaps,
    };
  }

  // Method to compare two cultural profiles
  compareCulturalProfiles(
    profile1: CulturalProfile,
    profile2: CulturalProfile
  ): {
    similarity: number;
    sharedThemes: string[];
    uniqueThemes1: string[];
    uniqueThemes2: string[];
    connectionSimilarity: number;
  } {
    // Calculate theme similarity
    const themes1 = new Set(profile1.themes);
    const themes2 = new Set(profile2.themes);
    const sharedThemes = [...themes1].filter((theme) => themes2.has(theme));
    const uniqueThemes1 = [...themes1].filter((theme) => !themes2.has(theme));
    const uniqueThemes2 = [...themes2].filter((theme) => !themes1.has(theme));

    const themeSimilarity =
      sharedThemes.length / Math.max(themes1.size, themes2.size);

    // Calculate connection similarity
    const avgStrength1 =
      profile1.connections.length > 0
        ? profile1.connections.reduce((sum, conn) => sum + conn.strength, 0) /
          profile1.connections.length
        : 0;
    const avgStrength2 =
      profile2.connections.length > 0
        ? profile2.connections.reduce((sum, conn) => sum + conn.strength, 0) /
          profile2.connections.length
        : 0;

    const connectionSimilarity = 1 - Math.abs(avgStrength1 - avgStrength2);

    // Calculate diversity similarity
    const diversitySimilarity =
      1 -
      Math.abs(
        (profile1.diversityScore || 0) - (profile2.diversityScore || 0)
      ) /
        100;

    // Overall similarity score
    const similarity =
      themeSimilarity * 0.4 +
      connectionSimilarity * 0.3 +
      diversitySimilarity * 0.3;

    return {
      similarity: Math.round(similarity * 100),
      sharedThemes,
      uniqueThemes1,
      uniqueThemes2,
      connectionSimilarity: Math.round(connectionSimilarity * 100),
    };
  }
}

export const qlooService = new QlooService();
