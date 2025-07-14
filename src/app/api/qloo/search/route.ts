// src/app/api/qloo/search/route.ts
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

// CORRECT mapping based on available Qloo entity types
const QLOO_CATEGORY_MAP: Record<string, string> = {
  music: "urn:entity:artist",
  movies: "urn:entity:movie",
  food: "urn:entity:place",
  travel: "urn:entity:destination",
  books: "urn:entity:book",
};

// Reverse mapping for response processing
const QLOO_REVERSE_MAP: Record<string, string> = {
  "urn:entity:artist": "music",
  "urn:entity:album": "music",
  "urn:entity:movie": "movies",
  "urn:entity:tv_show": "movies",
  "urn:entity:director": "movies",
  "urn:entity:actor": "movies",
  "urn:entity:place": "food",
  "urn:entity:locality": "food",
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

export async function GET(request: NextRequest) {
  try {
    // Check environment variables
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
    const limit = searchParams.get("limit") || "8";

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter is required" },
        { status: 400 }
      );
    }

    console.log(
      `🔍 Search request: query="${query}", category="${category}", limit="${limit}"`
    );

    // Build Qloo API URL
    const qlooUrl = new URL("/search", QLOO_API_URL);
    qlooUrl.searchParams.set("q", query);
    qlooUrl.searchParams.set("limit", limit);

    if (category && QLOO_CATEGORY_MAP[category]) {
      qlooUrl.searchParams.set("filter.type", QLOO_CATEGORY_MAP[category]);
      console.log(
        `🎯 Using Qloo entity type: ${QLOO_CATEGORY_MAP[category]} for category: ${category}`
      );
    }

    console.log(`📡 Making Qloo API request to: ${qlooUrl.toString()}`);

    const response = await fetch(qlooUrl.toString(), {
      method: "GET",
      headers: {
        "X-API-Key": QLOO_API_KEY,
        "Content-Type": "application/json",
      },
    });

    console.log(`📊 Qloo API response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Qloo API error: ${response.status} - ${errorText}`);

      // If 403, try without category filter
      if (response.status === 403 && category) {
        console.log(
          `⚠️ 403 error with category filter, retrying without filter...`
        );

        const fallbackUrl = new URL("/search", QLOO_API_URL);
        fallbackUrl.searchParams.set("q", query);
        fallbackUrl.searchParams.set("limit", limit);

        const fallbackResponse = await fetch(fallbackUrl.toString(), {
          method: "GET",
          headers: {
            "X-API-Key": QLOO_API_KEY,
            "Content-Type": "application/json",
          },
        });

        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          const results = (fallbackData.results || []).map((item: any) => ({
            id: item.entity_id,
            name: item.name,
            category: extractCategoryFromTypes(item.types),
            score: item.popularity || 0,
            metadata: item.properties || {},
            types: item.types,
            popularity: item.popularity,
            location: item.location,
            properties: item.properties,
          }));

          console.log(
            `✅ Fallback search successful: ${results.length} results`
          );
          return NextResponse.json({
            results,
            total: results.length,
            query,
            category,
            source: "qloo_api_fallback",
            message: "Used fallback search without category filter",
          });
        }
      }

      return NextResponse.json(
        {
          error: `Qloo API error: ${response.status}`,
          details: errorText,
          message: "Failed to search Qloo API",
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`✅ Qloo API success:`, data);

    // Transform the results based on real Qloo structure
    const results = (data.results || []).map((item: any) => ({
      id: item.entity_id,
      name: item.name,
      category: extractCategoryFromTypes(item.types),
      score: item.popularity || 0,
      metadata: item.properties || {},
      types: item.types,
      popularity: item.popularity,
      location: item.location,
      properties: item.properties,
    }));

    console.log(`✅ Returning ${results.length} search results`);
    return NextResponse.json({
      results,
      total: results.length,
      query,
      category,
      source: "qloo_api",
    });
  } catch (error) {
    console.error("❌ Search API error:", error);
    return NextResponse.json(
      {
        error: "Qloo search failed",
        details: error instanceof Error ? error.message : "Unknown error",
        message: "Failed to connect to Qloo API",
      },
      { status: 500 }
    );
  }
}
