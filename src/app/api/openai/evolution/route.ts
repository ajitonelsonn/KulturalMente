// src/app/api/openai/evolution/route.ts
import { NextRequest, NextResponse } from "next/server";
import { serverOpenAIService } from "@/lib/server-openai-service";

export async function POST(request: NextRequest) {
  try {
    const { preferences, culturalProfile } = await request.json();

    if (!preferences || !culturalProfile) {
      return NextResponse.json(
        { error: "Preferences and cultural profile are required" },
        { status: 400 }
      );
    }

    console.log("🔮 Generating evolution predictions with OpenAI...");

    const predictions = await serverOpenAIService.generateEvolutionPredictions(
      preferences,
      culturalProfile
    );

    console.log("✅ Evolution predictions generated successfully");

    return NextResponse.json({
      predictions,
      success: true,
      metadata: {
        timestamp: new Date().toISOString(),
        count: predictions.length,
      },
    });
  } catch (error) {
    console.error("❌ Evolution API error:", error);

    const errorDetails = {
      message: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        error: "Evolution predictions generation failed",
        details: errorDetails,
        message: "Failed to generate evolution predictions with OpenAI",
      },
      { status: 500 }
    );
  }
}
