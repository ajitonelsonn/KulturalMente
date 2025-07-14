// src/app/api/qloo/recommendations/route.ts

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

// Correct mapping for recommendations 'type' parameter
const QLOO_TYPE_MAP: Record<string, string> = {
  music: "urn:entity:artist",
  movies: "urn:entity:movie",
  food: "urn:entity:place",
  travel: "urn:entity:destination",
  books: "urn:entity:book",
};

// Fallback types to try when primary type fails
const QLOO_FALLBACK_TYPES: Record<string, string[]> = {
  music: ["urn:entity:artist", "urn:entity:album", "urn:entity:movie"],
  movies: ["urn:entity:movie", "urn:entity:tv_show", "urn:entity:director"],
  food: ["urn:entity:place", "urn:entity:locality", "urn:entity:brand"],
  travel: ["urn:entity:destination", "urn:entity:place", "urn:entity:locality"],
  books: ["urn:entity:book", "urn:entity:author", "urn:entity:movie"],
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

async function makeQlooRecommendationRequest(
  entities: string[],
  type: string,
  limit: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    if (!QLOO_API_URL || !QLOO_API_KEY) {
      return { success: false, error: "Qloo API credentials not configured" };
    }

    const qlooUrl = new URL("/recommendations", QLOO_API_URL);

    // Add required parameters
    qlooUrl.searchParams.set("type", type);
    entities.forEach((entityId) => {
      qlooUrl.searchParams.append("entity_ids", entityId);
    });
    qlooUrl.searchParams.set("take", limit);
    qlooUrl.searchParams.set("sort_by", "affinity");
    qlooUrl.searchParams.set("page", "1");

    console.log(
      `📡 Trying Qloo request with type ${type}: ${qlooUrl.toString()}`
    );

    const response = await fetch(qlooUrl.toString(), {
      method: "GET",
      headers: {
        "X-API-Key": QLOO_API_KEY,
        accept: "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log(
        `✅ Success with type ${type}: ${data.results?.length || 0} results`
      );
      return { success: true, data };
    } else {
      const errorText = await response.text();
      console.log(
        `❌ Failed with type ${type}: ${response.status} - ${errorText}`
      );
      return { success: false, error: `${response.status}: ${errorText}` };
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.log(`❌ Request error with type ${type}: ${errorMsg}`);
    return { success: false, error: errorMsg };
  }
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
    const entitiesParam = searchParams.get("entities");
    const category = searchParams.get("category");
    const limit = searchParams.get("limit") || "5";

    if (!entitiesParam) {
      return NextResponse.json(
        { error: "Entities parameter is required" },
        { status: 400 }
      );
    }

    if (!category || !QLOO_TYPE_MAP[category]) {
      return NextResponse.json(
        {
          error: "Valid category is required for recommendations",
          validCategories: Object.keys(QLOO_TYPE_MAP),
        },
        { status: 400 }
      );
    }

    // Parse entities and remove duplicates
    const entities = entitiesParam
      .split(",")
      .map((e) => e.trim())
      .filter((e) => e.length > 0)
      .filter((value, index, self) => self.indexOf(value) === index);

    if (entities.length === 0) {
      return NextResponse.json(
        { error: "At least one valid entity is required" },
        { status: 400 }
      );
    }

    console.log(
      `🎯 Qloo recommendations request: entities=[${entities.join(
        ","
      )}], category="${category}", limit=${limit}`
    );

    // Try primary type first, then fallback types if needed
    const typesToTry = QLOO_FALLBACK_TYPES[category] || [
      QLOO_TYPE_MAP[category],
    ];
    let successResponse = null;
    let lastError = null;
    let workingType = null;

    for (const type of typesToTry) {
      const result = await makeQlooRecommendationRequest(entities, type, limit);

      if (result.success && result.data?.results?.length > 0) {
        successResponse = result.data;
        workingType = type;
        console.log(`✅ Found recommendations using type: ${type}`);
        break;
      } else {
        lastError = result.error;

        // If it's a "low signal strength" error, try next type
        if (result.error?.includes("low a signal strength")) {
          console.log(
            `⚠️ Low signal strength for type ${type}, trying next fallback...`
          );
          continue;
        }

        console.log(
          `⚠️ Type ${type} failed: ${result.error}, trying next fallback...`
        );
      }
    }

    if (!successResponse) {
      console.error(
        `❌ All recommendation types failed for category ${category}. Last error: ${lastError}`
      );

      // Return empty results instead of error to allow cultural analysis to continue
      return NextResponse.json({
        results: [],
        total: 0,
        inputEntities: entities,
        category,
        source: "qloo_api_no_recommendations",
        message: `No recommendations available for this entity in category ${category}`,
        error: lastError,
        triedTypes: typesToTry,
      });
    }

    // Transform the successful response
    const results = (successResponse.results || []).map((item: any) => ({
      id: item.entity_id,
      name: item.name,
      category: extractCategoryFromTypes(item.types),
      score: item.popularity || 0,
      reasoning:
        item.disambiguation || `Recommended by Qloo based on cultural affinity`,
      confidence: item.popularity || 0.7,
      metadata: item.properties || {},
      popularity: item.popularity,
      types: item.types,
      location: item.location,
      tags: item.tags,
      disambiguation: item.disambiguation,
    }));

    console.log(
      `✅ Returning ${results.length} recommendations using type ${workingType}`
    );
    return NextResponse.json({
      results,
      total: results.length,
      inputEntities: entities,
      category,
      type: workingType,
      source: "qloo_api_success",
      duration: successResponse.duration,
    });
  } catch (error) {
    console.error("❌ Recommendations API error:", error);
    return NextResponse.json(
      {
        error: "Recommendations failed",
        details: error instanceof Error ? error.message : "Unknown error",
        message: "Failed to get recommendations from Qloo API",
      },
      { status: 500 }
    );
  }
}
