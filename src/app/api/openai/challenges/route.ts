// src/app/api/openai/challenges/route.ts
import { NextRequest, NextResponse } from "next/server";
import { serverOpenAIService } from "@/lib/server-openai-service";

export async function POST(request: NextRequest) {
  try {
    const { preferences, culturalProfile, narrative } = await request.json();

    if (!preferences || !culturalProfile || !narrative) {
      return NextResponse.json(
        { error: "Preferences, cultural profile, and narrative are required" },
        { status: 400 }
      );
    }

    console.log("🎯 Generating cultural growth challenges with OpenAI...");

    const challenges =
      await serverOpenAIService.generateCulturalGrowthChallenges(
        preferences,
        culturalProfile,
        narrative
      );

    console.log("✅ Cultural growth challenges generated successfully");

    return NextResponse.json({
      challenges,
      success: true,
      metadata: {
        timestamp: new Date().toISOString(),
        count: challenges.length,
      },
    });
  } catch (error) {
    console.error("❌ Growth challenges API error:", error);

    const errorDetails = {
      message: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        error: "Cultural growth challenges generation failed",
        details: errorDetails,
        message: "Failed to generate cultural growth challenges with OpenAI",
      },
      { status: 500 }
    );
  }
}
