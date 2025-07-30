// src/app/api/qloo/search/route.ts - Enhanced Version with Smart Fallbacks

import { NextRequest, NextResponse } from "next/server";

// SECURE: Only read from environment variables, no fallbacks
const QLOO_API_URL = process.env.QLOO_API_URL;
const QLOO_API_KEY = process.env.QLOO_API_KEY;

// Check for required environment variables
if (!QLOO_API_URL || !QLOO_API_KEY) {
  console.error("❌ Missing required environment variables:");
  if (!QLOO_API_URL) console.error("- QLOO_API_URL is not set");
  if (!QLOO_API_KEY) console.error("- QLOO_API_KEY is not set");
}

const QLOO_CATEGORY_MAP: Record<string, string> = {
  music: "urn:entity:artist",
  movies: "urn:entity:movie",
  food: "urn:entity:place",
  travel: "urn:entity:destination",
  books: "urn:entity:book",
};

const QLOO_REVERSE_MAP: Record<string, string> = {
  "urn:entity:artist": "music",
  "urn:entity:album": "music",
  "urn:entity:movie": "movies",
  "urn:entity:tv_show": "movies",
  "urn:entity:director": "movies",
  "urn:entity:actor": "movies",
  "urn:entity:place": "food",
  "urn:entity:locality": "travel",
  "urn:entity:destination": "travel",
  "urn:entity:book": "books",
  "urn:entity:author": "books",
  "urn:entity:brand": "food",
  "urn:entity:podcast": "books",
  "urn:entity:videogame": "movies",
};

function extractCategoryFromTypes(types?: string[]): string {
  if (!types || types.length === 0) return "unknown";
  const firstType = types[0];
  return (
    QLOO_REVERSE_MAP[firstType] ||
    firstType.replace("urn:entity:", "") ||
    "unknown"
  );
}

// Enhanced relevance calculation
function calculateRelevanceScore(entity: any, query: string): number {
  const queryLower = query.toLowerCase().trim();
  const entityName = entity.name.toLowerCase();

  // Exact match gets highest score
  if (entityName === queryLower) return 1.0;

  // Name contains query gets high score
  if (entityName.includes(queryLower)) return 0.9;

  // Query contains name (for partial matches)
  if (queryLower.includes(entityName)) return 0.85;

  // Check individual words for partial matches
  const queryWords = queryLower
    .split(/\s+/)
    .filter((word: string) => word.length > 1);
  const nameWords = entityName
    .split(/\s+/)
    .filter((word: string) => word.length > 1);

  let wordMatches = 0;
  let partialMatches = 0;

  queryWords.forEach((qWord: string) => {
    nameWords.forEach((nWord: string) => {
      if (nWord === qWord) {
        wordMatches += 1;
      } else if (nWord.includes(qWord) || qWord.includes(nWord)) {
        partialMatches += 0.5;
      }
    });
  });

  const totalMatches = wordMatches + partialMatches;
  const wordMatchRatio =
    totalMatches / Math.max(queryWords.length, nameWords.length);

  if (wordMatchRatio > 0.7) return 0.8 * wordMatchRatio;
  if (wordMatchRatio > 0.4) return 0.6 * wordMatchRatio;

  // Check tags for relevance
  if (entity.tags && Array.isArray(entity.tags)) {
    const tagScore = entity.tags.reduce((score: number, tag: any) => {
      // Handle different tag formats (string, object, etc.)
      const tagText =
        typeof tag === "string"
          ? tag
          : tag?.name || tag?.label || tag?.value || String(tag);

      if (typeof tagText !== "string") return score;

      const tagLower = tagText.toLowerCase();
      if (tagLower.includes(queryLower)) return Math.max(score, 0.5);

      const tagWords = tagLower.split(/\s+/);
      const tagMatches = queryWords.filter((qWord) =>
        tagWords.some((tWord) => tWord.includes(qWord) || qWord.includes(tWord))
      ).length;

      if (tagMatches > 0) {
        return Math.max(score, 0.3 * (tagMatches / queryWords.length));
      }
      return score;
    }, 0);

    if (tagScore > 0) return tagScore;
  }

  // Very low relevance for popular but unrelated entities
  return 0.05;
}

// Generate search variations for better matching
function generateSearchVariations(query: string): string[] {
  const variations = new Set<string>();
  const trimmed = query.trim();

  // Original query
  variations.add(trimmed);

  // Lowercase
  variations.add(trimmed.toLowerCase());

  // Title case
  variations.add(
    trimmed
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ")
  );

  // Individual words (for partial matching)
  const words = trimmed.split(/\s+/).filter((word) => word.length > 1);
  words.forEach((word) => {
    variations.add(word);
    variations.add(word.toLowerCase());
    variations.add(word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
  });

  // Word combinations
  if (words.length > 1) {
    for (let i = 0; i < words.length - 1; i++) {
      for (let j = i + 1; j < words.length; j++) {
        variations.add(`${words[i]} ${words[j]}`);
      }
    }
  }

  return Array.from(variations);
}

// Make API request to Qloo
async function makeQlooSearchRequest(
  query: string,
  category?: string,
  limit: number = 10
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    if (!QLOO_API_URL || !QLOO_API_KEY) {
      return { success: false, error: "Qloo API credentials not configured" };
    }

    const params = new URLSearchParams({
      query: query.trim(), // Use 'query' instead of 'q'
      take: Math.min(limit, 20).toString(), // Use 'take' instead of 'limit'
    });

    // Add category filter if provided and valid
    if (category && QLOO_CATEGORY_MAP[category]) {
      params.append("types", QLOO_CATEGORY_MAP[category]);
    }

    const searchUrl = `${QLOO_API_URL}/search?${params.toString()}`;
    console.log(`📡 Qloo API Request: ${searchUrl}`);

    const response = await fetch(searchUrl, {
      method: "GET",
      headers: {
        "X-API-Key": QLOO_API_KEY,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `HTTP ${response.status}: ${errorText}`,
      };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Safely extract and normalize entity data from Qloo response
function normalizeQlooEntity(entity: any): any {
  return {
    id: entity.entity_id || entity.id || entity.qloo_id,
    name: entity.name || entity.title || "Unknown",
    category: extractCategoryFromTypes(entity.types),
    score: entity.popularity || entity.score || 0,
    metadata: entity.properties || entity.metadata || {},
    types: entity.types || [],
    popularity: entity.popularity || 0,
    location: entity.location || null,
    properties: entity.properties || {},
    tags: entity.tags || [],
    // Add relevance score placeholder (will be calculated later)
    relevanceScore: 0,
  };
}

// Filter and sort results by relevance
function filterRelevantResults(
  results: any[],
  originalQuery: string,
  minScore: number = 0.15
) {
  return results
    .map((result) => {
      const normalized = normalizeQlooEntity(result);
      normalized.relevanceScore = calculateRelevanceScore(
        normalized,
        originalQuery
      );
      return normalized;
    })
    .filter((result) => result.relevanceScore >= minScore)
    .sort((a, b) => {
      // Primary sort by relevance score
      if (Math.abs(a.relevanceScore - b.relevanceScore) > 0.1) {
        return b.relevanceScore - a.relevanceScore;
      }
      // Secondary sort by popularity for similar relevance
      return (b.popularity || 0) - (a.popularity || 0);
    });
}

// Get genre-based recommendations when no exact matches
async function getGenreRecommendations(
  query: string,
  category: string = "music"
): Promise<any[]> {
  const genreKeywords = {
    music: [
      "rap",
      "hip hop",
      "drill",
      "grime",
      "uk rap",
      "british rap",
      "pop",
      "rock",
      "indie",
      "electronic",
      "jazz",
      "classical",
      "r&b",
      "soul",
      "funk",
      "reggae",
      "country",
      "folk",
    ],
    movies: [
      "action",
      "comedy",
      "drama",
      "thriller",
      "horror",
      "sci-fi",
      "romance",
      "documentary",
      "animation",
      "superhero",
    ],
  };

  const keywords = genreKeywords[category as keyof typeof genreKeywords] || [];

  // Try to infer genre from the query
  const queryLower = query.toLowerCase();
  const matchedGenres = keywords.filter(
    (genre) => queryLower.includes(genre) || genre.includes(queryLower)
  );

  if (matchedGenres.length > 0) {
    console.log(`🎭 Trying genre-based search for: ${matchedGenres[0]}`);
    const genreResult = await makeQlooSearchRequest(
      matchedGenres[0],
      category,
      10
    );
    if (genreResult.success && genreResult.data?.results?.length > 0) {
      return genreResult.data.results;
    }
  }

  // If no genre matches, try searching for popular artists in the category
  if (category === "music") {
    console.log(`🎭 Trying popular music search as fallback...`);
    const popularResult = await makeQlooSearchRequest(
      "popular music",
      category,
      5
    );
    if (popularResult.success && popularResult.data?.results?.length > 0) {
      return popularResult.data.results;
    }
  }

  return [];
}

export async function GET(request: NextRequest) {
  try {
    // Check environment variables first
    if (!QLOO_API_URL || !QLOO_API_KEY) {
      return NextResponse.json(
        {
          error: "Configuration error",
          message:
            "Qloo API credentials not configured. Please check environment variables.",
        },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const originalQuery = searchParams.get("q");
    const category = searchParams.get("category");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!originalQuery || originalQuery.length < 2) {
      return NextResponse.json(
        { error: "Query must be at least 2 characters long" },
        { status: 400 }
      );
    }

    console.log(
      `🔍 Enhanced search for: "${originalQuery}" in category: ${
        category || "all"
      }`
    );

    let allResults: any[] = [];
    let searchAttempts: string[] = [];
    let totalApiCalls = 0;
    const MAX_API_CALLS = 5;

    // Generate search variations
    const searchVariations = generateSearchVariations(originalQuery);
    console.log(
      `🔄 Generated ${searchVariations.length} search variations:`,
      searchVariations
    );

    // Try each variation until we get good results
    for (const variation of searchVariations) {
      if (totalApiCalls >= MAX_API_CALLS) break;

      console.log(`🔍 Trying search variation: "${variation}"`);
      searchAttempts.push(variation);

      const result = await makeQlooSearchRequest(
        variation,
        category || undefined,
        limit
      );
      totalApiCalls++;

      if (result.success && result.data?.results?.length > 0) {
        console.log(`📊 API Response structure:`, {
          totalResults: result.data.results.length,
          firstResult: result.data.results[0],
          hasExpectedFields: {
            entity_id: !!result.data.results[0]?.entity_id,
            name: !!result.data.results[0]?.name,
            types: !!result.data.results[0]?.types,
            tags: !!result.data.results[0]?.tags,
            tagsType: typeof result.data.results[0]?.tags,
          },
        });

        const relevantResults = filterRelevantResults(
          result.data.results,
          originalQuery,
          0.15
        );

        if (relevantResults.length > 0) {
          console.log(
            `✅ Found ${relevantResults.length} relevant results with variation: "${variation}"`
          );
          allResults.push(...relevantResults);

          // If we have enough high-quality results, we can stop
          if (allResults.filter((r) => r.relevanceScore > 0.5).length >= 3) {
            break;
          }
        }
      } else if (result.error) {
        console.log(`❌ Search failed for "${variation}": ${result.error}`);
      }
    }

    // Remove duplicates based on entity ID
    const uniqueResults = allResults.filter(
      (result, index, self) =>
        index === self.findIndex((r) => r.id === result.id)
    );

    // If still no good results, try genre-based recommendations
    if (uniqueResults.length === 0 && category) {
      console.log(
        `🎭 No direct matches found, trying genre-based recommendations...`
      );
      const genreResults = await getGenreRecommendations(
        originalQuery,
        category
      );
      if (genreResults.length > 0) {
        const relevantGenreResults = filterRelevantResults(
          genreResults,
          originalQuery,
          0.05 // Lower threshold for genre matches
        );
        uniqueResults.push(...relevantGenreResults);
      }
    }

    // Final sort and limit
    const finalResults = uniqueResults
      .sort((a, b) => {
        if (Math.abs(a.relevanceScore - b.relevanceScore) > 0.1) {
          return b.relevanceScore - a.relevanceScore;
        }
        return (b.popularity || 0) - (a.popularity || 0);
      })
      .slice(0, limit);

    console.log(
      `✅ Final results: ${
        finalResults.length
      } entities, relevance scores: ${finalResults
        .map((r) => r.relevanceScore.toFixed(2))
        .join(", ")}`
    );

    // Prepare response
    const responseData = {
      results: finalResults,
      total: finalResults.length,
      query: originalQuery,
      category,
      metadata: {
        searchTime: Date.now(),
        searchAttempts,
        totalApiCalls,
        apiSource: "qloo",
        enhanced: true,
        hasRelevantResults: finalResults.some((r) => r.relevanceScore > 0.3),
        avgRelevanceScore:
          finalResults.length > 0
            ? finalResults.reduce((sum, r) => sum + r.relevanceScore, 0) /
              finalResults.length
            : 0,
      },
    };

    // Add helpful message if no relevant results
    if (finalResults.length === 0) {
      return NextResponse.json({
        ...responseData,
        message: `No relevant results found for "${originalQuery}". Try different search terms or check spelling.`,
        suggestions: [
          "Try searching with just one word (e.g., 'Central' or 'Cee')",
          "Check the spelling of artist/item names",
          "Try searching for the genre instead",
          "Use more common or well-known names",
        ],
      });
    }

    // Add recommendations message if results have low relevance
    if (responseData.metadata.avgRelevanceScore < 0.3) {
      return NextResponse.json({
        ...responseData,
        message: `Found some results for "${originalQuery}", but they may not be exactly what you're looking for. Consider these similar options:`,
      });
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("❌ Enhanced search error:", error);

    return NextResponse.json(
      {
        error: "Search failed",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
        query: request.url,
      },
      { status: 500 }
    );
  }
}
