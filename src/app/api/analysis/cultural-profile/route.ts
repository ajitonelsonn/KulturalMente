// src/app/api/analysis/cultural-profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { qlooService } from "@/lib/qloo-service";
import { openaiService } from "@/lib/openai-service";

export async function POST(request: NextRequest) {
  try {
    const { preferences } = await request.json();

    if (!preferences || typeof preferences !== "object") {
      return NextResponse.json(
        { error: "Valid preferences object is required" },
        { status: 400 }
      );
    }

    // Get cultural profile from Qloo
    const culturalProfile = await qlooService.analyzeCrossDomainConnections(
      preferences
    );

    // Generate narrative with OpenAI
    const narrative = await openaiService.generateCulturalNarrative(
      preferences,
      culturalProfile
    );

    // Generate discoveries
    const discoveries = await openaiService.generateDiscoveryRecommendations(
      narrative,
      preferences
    );

    return NextResponse.json({
      culturalProfile,
      narrative,
      discoveries,
    });
  } catch (error) {
    console.error("Cultural analysis API error:", error);
    return NextResponse.json(
      { error: "Cultural analysis failed" },
      { status: 500 }
    );
  }
}
