// src/app/api/openai/narrative/route.ts
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

    console.log("🤖 Generating cultural narrative with OpenAI...");

    // Test OpenAI connection first
    const connectionTest = await serverOpenAIService.testOpenAIConnection();
    if (!connectionTest.success) {
      return NextResponse.json(
        {
          error: "OpenAI API connection failed",
          details: connectionTest.message,
          message: "Cannot generate cultural narrative without OpenAI access",
        },
        { status: 503 }
      );
    }

    const narrative = await serverOpenAIService.generateCulturalNarrative(
      preferences,
      culturalProfile
    );

    console.log("✅ Cultural narrative generated successfully");

    return NextResponse.json({
      narrative,
      success: true,
      metadata: {
        timestamp: new Date().toISOString(),
        model: connectionTest.model || "gpt-4o",
      },
    });
  } catch (error) {
    console.error("❌ Narrative API error:", error);

    const errorDetails = {
      message: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    };

    // Check if it's an OpenAI API key issue
    if (error instanceof Error && error.message.includes("OPENAI_API_KEY")) {
      return NextResponse.json(
        {
          error: "OpenAI API configuration missing",
          details: errorDetails,
          message:
            "OpenAI API key is required for cultural narrative generation",
          requiresOpenAI: true,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: "Narrative generation failed",
        details: errorDetails,
        message: "Failed to generate cultural narrative with OpenAI",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const operation = searchParams.get("operation") || "test";

    switch (operation) {
      case "test":
        const connectionTest = await serverOpenAIService.testOpenAIConnection();
        return NextResponse.json(connectionTest);

      default:
        return NextResponse.json(
          {
            error: "Invalid operation",
            availableOperations: ["test"],
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("❌ OpenAI API test error:", error);
    return NextResponse.json(
      {
        error: "OpenAI test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
