// src/app/api/qloo/similar/route.ts - UPDATED

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

function extractCategoryFromTypes(types?: string[]): string {
  if (!types || types.length === 0) return "unknown";

  const firstType = types[0];
  if (firstType && firstType.startsWith("urn:entity:")) {
    const category = firstType.replace("urn:entity:", "");

    // Map Qloo categories back to our categories
    const categoryMap: Record<string, string> = {
      destination: "travel",
      film: "movies",
      music: "music",
      food: "food",
      book: "books",
    };

    return categoryMap[category] || category;
  }

  return firstType || "unknown";
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
    const entityId = searchParams.get("entityId");
    const limit = searchParams.get("limit") || "5";

    if (!entityId) {
      return NextResponse.json(
        { error: "EntityId parameter is required" },
        { status: 400 }
      );
    }

    console.log(
      `🔗 Similar entities request: entityId="${entityId}", limit=${limit}`
    );

    // Build Qloo API URL for similar entities
    const qlooUrl = new URL(`/similar/${entityId}`, QLOO_API_URL);
    qlooUrl.searchParams.set("limit", limit);

    console.log(`📡 Making Qloo similar request to: ${qlooUrl.toString()}`);

    const response = await fetch(qlooUrl.toString(), {
      method: "GET",
      headers: {
        "X-API-Key": QLOO_API_KEY,
        "Content-Type": "application/json",
      },
    });

    console.log(`📊 Qloo similar response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `❌ Qloo similar API error: ${response.status} - ${errorText}`
      );
      return NextResponse.json(
        {
          error: `Qloo similar API error: ${response.status}`,
          details: errorText,
          message: "Failed to get similar entities from Qloo API",
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`✅ Qloo similar success:`, data);

    // Transform the results based on real Qloo structure
    const results = (data.results || []).map((item: any) => ({
      id: item.entity_id,
      name: item.name,
      category: extractCategoryFromTypes(item.types),
      score: item.score || item.popularity || 0,
      metadata: item.properties || {},
      types: item.types,
      popularity: item.popularity,
      location: item.location,
    }));

    console.log(`✅ Returning ${results.length} similar entities`);
    return NextResponse.json({
      results,
      total: results.length,
      entityId,
      source: "qloo_api",
    });
  } catch (error) {
    console.error("❌ Similar API error:", error);
    return NextResponse.json(
      {
        error: "Qloo similar entities failed",
        details: error instanceof Error ? error.message : "Unknown error",
        message: "Failed to get similar entities from Qloo API",
      },
      { status: 500 }
    );
  }
}
