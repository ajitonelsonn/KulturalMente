import OpenAI from "openai";

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

export interface CulturalNarrative {
  title: string;
  story: string;
  insights: string[];
  personality: string;
  culturalDNA: string;
  recommendations: string[];
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
}

// Check if OpenAI API key is available
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const openai = OPENAI_API_KEY
  ? new OpenAI({
      apiKey: OPENAI_API_KEY,
    })
  : null;

class OpenAIService {
  async generateCulturalNarrative(
    preferences: Record<string, string[]>,
    culturalProfile: CulturalProfile
  ): Promise<CulturalNarrative> {
    // Fallback if OpenAI is not available
    if (!openai) {
      console.warn("OpenAI API key not found, using fallback narrative");
      return this.generateFallbackNarrative(preferences, culturalProfile);
    }

    try {
      const prompt = `
You are a cultural intelligence expert. Based on these preferences and cultural analysis, create a compelling narrative about this person's cultural DNA.

PREFERENCES:
${Object.entries(preferences)
  .map(([domain, items]) => `${domain}: ${items.join(", ")}`)
  .join("\n")}

CULTURAL ANALYSIS:
Themes: ${culturalProfile.themes.join(", ")}
Connections: ${culturalProfile.connections
        .map((c) => `${c.domain1} ↔ ${c.domain2} (${c.explanation})`)
        .join(", ")}
Patterns: ${culturalProfile.patterns.join(", ")}

Create a rich, insightful narrative that:
1. Explains WHY these preferences connect
2. Reveals deeper personality traits
3. Identifies the underlying cultural DNA
4. Suggests meaningful discoveries

Format as JSON with:
- title: A compelling title for their cultural identity
- story: A 3-4 paragraph narrative explaining their cultural DNA
- insights: Array of 3-4 key insights about their personality
- personality: One-sentence personality summary
- culturalDNA: One-sentence description of their cultural essence
- recommendations: Array of 3-4 specific discovery suggestions

Be creative, insightful, and emotionally resonant. Avoid generic descriptions.
`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
        max_tokens: 1500,
      });

      const response = completion.choices[0].message.content;
      if (!response) throw new Error("No response from OpenAI");

      try {
        return JSON.parse(response);
      } catch (parseError) {
        // Fallback if JSON parsing fails
        return {
          title: "Cultural Explorer",
          story: response,
          insights: [
            "Complex cultural tastes",
            "Seeks depth in experiences",
            "Values authenticity",
          ],
          personality:
            "You have sophisticated, interconnected cultural preferences.",
          culturalDNA:
            "A seeker of authentic, emotionally resonant cultural experiences.",
          recommendations: [
            "Explore underground music scenes",
            "Visit cultural festivals",
            "Try fusion cuisine",
          ],
        };
      }
    } catch (error) {
      console.error("Error generating cultural narrative:", error);
      return this.generateFallbackNarrative(preferences, culturalProfile);
    }
  }

  private generateFallbackNarrative(
    preferences: Record<string, string[]>,
    culturalProfile: CulturalProfile
  ): CulturalNarrative {
    const totalPrefs = Object.values(preferences).flat().length;
    const domains = Object.keys(preferences).filter(
      (key) => preferences[key].length > 0
    );

    // Generate a basic narrative based on preferences
    const title =
      totalPrefs > 10 ? "The Cultural Explorer" : "The Emerging Curator";

    const story = `Your cultural preferences reveal a thoughtful approach to life and art. Across ${
      domains.length
    } different domains, you've chosen ${totalPrefs} distinct cultural touchpoints that reflect your unique perspective.

Your interests in ${domains.join(
      ", "
    )} show a pattern of seeking authentic, meaningful experiences. You appear drawn to both the familiar and the unexpected, creating a cultural identity that's both grounded and adventurous.

The connections between your preferences suggest someone who values depth over breadth, preferring to really understand and appreciate the cultural works that resonate with you rather than consuming everything available.

This careful curation of your cultural world speaks to a personality that finds meaning in artistic expression and uses culture as a way to understand both yourself and the world around you.`;

    return {
      title,
      story,
      insights: [
        "You have a sophisticated, selective approach to cultural consumption",
        "Your preferences show both consistency and openness to discovery",
        "You use culture as a means of self-expression and understanding",
        "Quality and authenticity matter more to you than popularity",
      ],
      personality:
        "You are a thoughtful cultural curator who seeks meaningful artistic experiences.",
      culturalDNA:
        "A seeker of authentic, emotionally resonant cultural experiences that reflect your values.",
      recommendations: [
        "Explore underground or independent works in your favorite domains",
        "Seek out cultural experiences that bridge your different interests",
        "Consider attending intimate cultural events like small concerts or art gallery openings",
        "Try creating your own cultural content inspired by your preferences",
      ],
    };
  }

  async analyzeCulturalPatterns(
    preferences: Record<string, string[]>
  ): Promise<CulturalAnalysis> {
    if (!openai) {
      return this.generateFallbackAnalysis(preferences);
    }

    try {
      const prompt = `
Analyze these cultural preferences and identify deep patterns:

${Object.entries(preferences)
  .map(([domain, items]) => `${domain}: ${items.join(", ")}`)
  .join("\n")}

Identify:
1. Underlying themes (aesthetic, emotional, philosophical)
2. Cross-domain patterns
3. Unexpected connections between preferences
4. Predictions about other things they might enjoy

Return JSON with:
- themes: Array of underlying themes
- patterns: Array of behavioral/preference patterns
- connections: Array of {items, explanation, strength}
- predictions: Array of predictions about other interests
`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const response = completion.choices[0].message.content;
      if (!response) throw new Error("No response from OpenAI");

      try {
        return JSON.parse(response);
      } catch (parseError) {
        return {
          themes: [
            "Authenticity",
            "Emotional depth",
            "Cultural sophistication",
          ],
          patterns: [
            "Seeks meaningful experiences",
            "Values artistic expression",
          ],
          connections: [
            {
              items: Object.values(preferences).flat().slice(0, 3),
              explanation: "Connected through shared aesthetic sensibilities",
              strength: "moderate" as const,
            },
          ],
          predictions: [
            "Likely enjoys independent cinema",
            "May appreciate artisanal crafts",
            "Probably drawn to intimate venues",
          ],
        };
      }
    } catch (error) {
      console.error("Error analyzing cultural patterns:", error);
      return this.generateFallbackAnalysis(preferences);
    }
  }

  private generateFallbackAnalysis(
    preferences: Record<string, string[]>
  ): CulturalAnalysis {
    const domains = Object.keys(preferences).filter(
      (key) => preferences[key].length > 0
    );
    const allItems = Object.values(preferences).flat();

    return {
      themes: ["Authenticity", "Emotional depth", "Cultural sophistication"],
      patterns: [
        "Seeks meaningful experiences",
        "Values artistic expression",
        "Prefers quality over quantity",
      ],
      connections:
        domains.length > 1
          ? [
              {
                items: allItems.slice(0, 3),
                explanation:
                  "Connected through shared aesthetic sensibilities and emotional resonance",
                strength: "moderate" as const,
              },
            ]
          : [],
      predictions: [
        "Likely enjoys intimate cultural venues over large commercial spaces",
        "May appreciate artisanal or handcrafted cultural products",
        "Probably drawn to stories that explore human complexity",
        "Values cultural experiences that offer personal growth",
      ],
    };
  }

  async generateDiscoveryRecommendations(
    culturalNarrative: CulturalNarrative,
    preferences: Record<string, string[]>
  ): Promise<string[]> {
    if (!openai) {
      return this.generateFallbackRecommendations(preferences);
    }

    try {
      const prompt = `
Based on this cultural profile, suggest 5 specific, actionable discoveries:

CULTURAL DNA: ${culturalNarrative.culturalDNA}
PERSONALITY: ${culturalNarrative.personality}
CURRENT PREFERENCES: ${Object.entries(preferences)
        .map(([domain, items]) => `${domain}: ${items.join(", ")}`)
        .join("\n")}

Create specific, actionable recommendations that:
1. Build on their existing interests
2. Introduce them to new domains
3. Connect their preferences in unexpected ways
4. Are specific enough to act on

Format as array of strings, each recommendation being one specific action.
`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
        max_tokens: 800,
      });

      const response = completion.choices[0].message.content;
      if (!response) throw new Error("No response from OpenAI");

      try {
        return JSON.parse(response);
      } catch (parseError) {
        // Extract recommendations from text if JSON parsing fails
        const lines = response
          .split("\n")
          .filter((line) => line.trim().length > 0);
        return lines
          .slice(0, 5)
          .map((line) => line.replace(/^\d+\.\s*/, "").trim());
      }
    } catch (error) {
      console.error("Error generating discovery recommendations:", error);
      return this.generateFallbackRecommendations(preferences);
    }
  }

  private generateFallbackRecommendations(
    preferences: Record<string, string[]>
  ): string[] {
    const recommendations = [];
    const domains = Object.keys(preferences).filter(
      (key) => preferences[key].length > 0
    );

    if (domains.includes("music") && domains.includes("movies")) {
      recommendations.push(
        "Explore music documentaries that feature artists similar to your favorites"
      );
    }

    if (domains.includes("food") && domains.includes("travel")) {
      recommendations.push(
        "Plan a culinary journey to destinations that specialize in cuisines you love"
      );
    }

    if (domains.includes("books")) {
      recommendations.push(
        "Find audiobooks narrated by actors from your favorite films"
      );
    }

    if (domains.length >= 3) {
      recommendations.push(
        "Look for cultural festivals that combine multiple interests from your profile"
      );
    }

    recommendations.push(
      "Visit local venues that showcase independent or emerging talent in your areas of interest"
    );

    return recommendations.slice(0, 5);
  }
}

export const openaiService = new OpenAIService();
