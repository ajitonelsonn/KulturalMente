// src/app/api/openai/discoveries/route.ts
import { NextRequest, NextResponse } from "next/server";
import { serverOpenAIService } from "@/lib/server-openai-service";

export async function POST(request: NextRequest) {
  try {
    const { culturalNarrative, preferences, culturalProfile } =
      await request.json();

    if (!culturalNarrative || !preferences) {
      return NextResponse.json(
        { error: "Cultural narrative and preferences are required" },
        { status: 400 }
      );
    }

    console.log("🎯 Generating discovery recommendations with OpenAI...");

    const discoveries =
      await serverOpenAIService.generateDiscoveryRecommendations(
        culturalNarrative,
        preferences,
        culturalProfile
      );

    console.log("✅ Discovery recommendations generated successfully");

    return NextResponse.json({
      discoveries,
      success: true,
      metadata: {
        timestamp: new Date().toISOString(),
        count: discoveries.length,
      },
    });
  } catch (error) {
    console.error("❌ Discoveries API error:", error);

    const errorDetails = {
      message: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        error: "Discovery recommendations generation failed",
        details: errorDetails,
        message: "Failed to generate discovery recommendations with OpenAI",
      },
      { status: 500 }
    );
  }
}
