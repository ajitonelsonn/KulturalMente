// src/app/api/qloo/enhanced-search/route.ts - UPDATED SECURE VERSION

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
    const query = searchParams.get("q");
    const category = searchParams.get("category");
    const limit = parseInt(searchParams.get("limit") || "8");

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: "Query must be at least 2 characters long" },
        { status: 400 }
      );
    }

    console.log(
      `🔍 Enhanced Qloo search: "${query}" in category: ${category || "all"}`
    );

    // Build search parameters
    const params = new URLSearchParams({
      q: query.trim(),
      limit: Math.min(limit, 20).toString(),
    });

    // Add category filter if provided and valid
    if (category && QLOO_CATEGORY_MAP[category]) {
      params.append("filter.type", QLOO_CATEGORY_MAP[category]);
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

    console.log(`📊 Qloo API Response: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Qloo API Error: ${response.status} - ${errorText}`);

      // Handle specific error cases
      if (response.status === 401) {
        return NextResponse.json(
          {
            error: "Invalid API key",
            message: "Qloo API authentication failed",
          },
          { status: 401 }
        );
      }

      if (response.status === 429) {
        return NextResponse.json(
          {
            error: "Rate limit exceeded",
            message: "Too many requests to Qloo API",
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        {
          error: "Qloo API error",
          message: `Search failed with status ${response.status}`,
          details: errorText,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    const results = data.results || [];

    // Enhance results with cultural intelligence
    const enhancedResults = results.map((entity: any) => ({
      ...entity,
      culturalSignificance: calculateCulturalSignificance(entity),
      trendStatus: determineTrendStatus(entity),
      geographicReach: determineGeographicReach(entity),
    }));

    // Sort by relevance and cultural significance
    enhancedResults.sort((a: any, b: any) => {
      const aRelevance = calculateRelevance(a, query);
      const bRelevance = calculateRelevance(b, query);
      return bRelevance - aRelevance;
    });

    console.log(
      `✅ Enhanced search complete: ${enhancedResults.length} results`
    );

    return NextResponse.json({
      results: enhancedResults,
      total: enhancedResults.length,
      query,
      category,
      metadata: {
        searchTime: Date.now(),
        enhanced: true,
        apiSource: "qloo",
      },
    });
  } catch (error) {
    console.error("❌ Enhanced search error:", error);

    return NextResponse.json(
      {
        error: "Search failed",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
        results: [],
      },
      { status: 500 }
    );
  }
}

function calculateCulturalSignificance(entity: any): number {
  let significance = entity.popularity || 0.5;

  // Boost for awards, critical acclaim
  if (entity.metadata?.awards || entity.properties?.awards) {
    significance += 0.2;
  }

  // Boost for international recognition
  if (entity.location?.country && entity.location.country !== "US") {
    significance += 0.1;
  }

  // Boost for cross-cultural influence
  if (entity.types && entity.types.length > 1) {
    significance += 0.1;
  }

  return Math.min(1, significance);
}

function determineTrendStatus(
  entity: any
): "emerging" | "trending" | "established" | "classic" {
  const popularity = entity.popularity || 0.5;
  const recentMentions = entity.metadata?.recentMentions || false;
  const yearCreated = entity.metadata?.year || entity.properties?.year;
  const currentYear = new Date().getFullYear();
  const age = yearCreated ? currentYear - yearCreated : 0;

  if (popularity < 0.3 && age < 5) return "emerging";
  if (popularity < 0.6 && (recentMentions || age < 10)) return "trending";
  if (popularity < 0.8 || age < 20) return "established";
  return "classic";
}

function determineGeographicReach(
  entity: any
): "local" | "regional" | "national" | "global" {
  const popularity = entity.popularity || 0.5;
  const hasLocation = entity.location?.country;
  const isInternational = entity.metadata?.international || false;

  if (isInternational || popularity > 0.8) return "global";
  if (!hasLocation || popularity > 0.6) return "national";
  if (popularity > 0.4) return "regional";
  return "local";
}

function calculateRelevance(entity: any, query: string): number {
  const name = entity.name?.toLowerCase() || "";
  const queryLower = query.toLowerCase();

  let relevance = 0;

  // Exact match gets highest score
  if (name === queryLower) {
    relevance += 100;
  }
  // Starts with query gets high score
  else if (name.startsWith(queryLower)) {
    relevance += 80;
  }
  // Contains query gets medium score
  else if (name.includes(queryLower)) {
    relevance += 60;
  }

  // Boost based on popularity and cultural significance
  relevance += (entity.popularity || 0) * 20;
  relevance += (entity.culturalSignificance || 0) * 15;

  // Boost for exact category match
  if (entity.score) {
    relevance += entity.score * 10;
  }

  return relevance;
}
