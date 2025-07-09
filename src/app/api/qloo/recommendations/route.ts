// src/app/api/qloo/recommendations/route.ts
import { NextRequest, NextResponse } from "next/server";
import { qlooService } from "@/lib/qloo-service";

export async function POST(request: NextRequest) {
  try {
    const { entities, category, limit } = await request.json();

    if (!entities || !Array.isArray(entities)) {
      return NextResponse.json(
        { error: "Entities array is required" },
        { status: 400 }
      );
    }

    const results = await qlooService.getRecommendations(
      entities,
      category,
      limit
    );
    return NextResponse.json({ results });
  } catch (error) {
    console.error("Recommendations API error:", error);
    return NextResponse.json(
      { error: "Recommendations failed" },
      { status: 500 }
    );
  }
}
