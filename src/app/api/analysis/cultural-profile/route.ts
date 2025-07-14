// src/app/api/analysis/cultural-profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { qlooService } from "@/lib/qloo-service";
import { serverOpenAIService } from "@/lib/server-openai-service";

export async function POST(request: NextRequest) {
  try {
    const { preferences } = await request.json();

    if (!preferences || typeof preferences !== "object") {
      return NextResponse.json(
        { error: "Valid preferences object is required" },
        { status: 400 }
      );
    }

    console.log(`🧠 Starting cultural analysis for preferences:`, preferences);

    // Test Qloo connection first
    const connectionTest = await qlooService.testQlooConnection();
    if (!connectionTest.success) {
      return NextResponse.json(
        {
          error: "Qloo API connection failed",
          details: connectionTest.message,
          message: "Cannot analyze cultural profile without Qloo API access",
        },
        { status: 503 }
      );
    }

    console.log(`✅ Qloo API connection verified`);

    // Test OpenAI connection
    const openaiTest = await serverOpenAIService.testOpenAIConnection();
    if (!openaiTest.success) {
      return NextResponse.json(
        {
          error: "OpenAI API connection failed",
          details: openaiTest.message,
          message: "Cannot generate cultural narrative without OpenAI access",
        },
        { status: 503 }
      );
    }

    console.log(`✅ OpenAI API connection verified`);

    // Get cultural profile from Qloo using real API data
    console.log(`📊 Analyzing cross-domain connections with Qloo...`);
    const culturalProfile = await qlooService.analyzeCrossDomainConnections(
      preferences
    );
    console.log(`📊 Cultural profile generated:`, {
      themes: culturalProfile.themes.length,
      connections: culturalProfile.connections.length,
      patterns: culturalProfile.patterns.length,
      diversityScore: culturalProfile.diversityScore,
    });

    // Generate narrative with OpenAI using Qloo data
    console.log(`🤖 Generating cultural narrative with OpenAI...`);
    const narrative = await serverOpenAIService.generateCulturalNarrative(
      preferences,
      culturalProfile
    );
    console.log(`📝 Cultural narrative generated:`, {
      title: narrative.title,
      insights: narrative.insights.length,
      recommendations: narrative.recommendations.length,
    });

    // Generate discoveries based on narrative and profile
    console.log(`🎯 Generating discovery recommendations with OpenAI...`);
    const discoveries =
      await serverOpenAIService.generateDiscoveryRecommendations(
        narrative,
        preferences,
        culturalProfile
      );
    console.log(
      `🎯 Discovery recommendations generated: ${discoveries.length} items`
    );

    // Generate growth challenges based on complete profile
    console.log(`🎯 Generating cultural growth challenges with OpenAI...`);
    const growthChallenges =
      await serverOpenAIService.generateCulturalGrowthChallenges(
        preferences,
        culturalProfile,
        narrative
      );
    console.log(
      `🎯 Cultural growth challenges generated: ${growthChallenges.length} items`
    );

    // Add analysis metadata
    const analysisMetadata = {
      timestamp: new Date().toISOString(),
      qlooEntitiesFound: culturalProfile.qlooInsights?.totalEntitiesFound || 0,
      domainsAnalyzed:
        culturalProfile.qlooInsights?.domainsWithEntities?.length || 0,
      connectionsFound: culturalProfile.connections.length,
      diversityScore: culturalProfile.diversityScore,
      culturalDepth: culturalProfile.culturalDepth,
      source: "qloo_api_with_openai_generation",
      openaiModel: openaiTest.model || "gpt-4o",
      matchRate: culturalProfile.qlooInsights?.matchRate || 0,
    };

    console.log(`✅ Cultural analysis complete:`, analysisMetadata);

    return NextResponse.json({
      culturalProfile,
      narrative,
      discoveries,
      growthChallenges,
      metadata: analysisMetadata,
      success: true,
    });
  } catch (error) {
    console.error("❌ Cultural analysis API error:", error);

    // Provide detailed error information for debugging
    const errorDetails = {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      type: error instanceof Error ? error.constructor.name : "UnknownError",
    };

    // Check if it's an OpenAI API key issue
    if (error instanceof Error && error.message.includes("OPENAI_API_KEY")) {
      return NextResponse.json(
        {
          error: "OpenAI API configuration missing",
          details: errorDetails,
          message:
            "OpenAI API key is required for cultural narrative generation. Please check your environment variables.",
          requiresOpenAI: true,
        },
        { status: 500 }
      );
    }

    // Check if it's a Qloo API issue
    if (error instanceof Error && error.message.includes("Qloo")) {
      return NextResponse.json(
        {
          error: "Qloo API connection failed",
          details: errorDetails,
          message: "Failed to analyze cultural profile using Qloo API",
          requiresQloo: true,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: "Cultural analysis failed",
        details: errorDetails,
        message: "Failed to analyze cultural profile",
      },
      { status: 500 }
    );
  }
}

// Additional debug endpoint for testing individual OpenAI operations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const operation = searchParams.get("operation") || "test";

    switch (operation) {
      case "test-openai":
        const openaiTest = await serverOpenAIService.testOpenAIConnection();
        return NextResponse.json(openaiTest);

      case "test-qloo":
        const qlooTest = await qlooService.testQlooConnection();
        return NextResponse.json(qlooTest);

      case "test-both":
        const [openaiResult, qlooResult] = await Promise.all([
          serverOpenAIService.testOpenAIConnection(),
          qlooService.testQlooConnection(),
        ]);
        return NextResponse.json({
          openai: openaiResult,
          qloo: qlooResult,
          bothWorking: openaiResult.success && qlooResult.success,
        });

      case "search":
        const query = searchParams.get("query") || "test";
        const category = searchParams.get("category") || undefined;
        const searchResults = await qlooService.searchEntities(
          query,
          category,
          5
        );
        return NextResponse.json({ results: searchResults, query, category });

      case "recommendations":
        const entities = searchParams.get("entities")?.split(",") || [];
        if (entities.length === 0) {
          return NextResponse.json(
            { error: "No entities provided" },
            { status: 400 }
          );
        }
        const recommendations = await qlooService.getRecommendations(
          entities,
          undefined,
          5
        );
        return NextResponse.json({ results: recommendations, entities });

      default:
        return NextResponse.json(
          {
            error: "Invalid operation",
            availableOperations: [
              "test-openai",
              "test-qloo",
              "test-both",
              "search",
              "recommendations",
            ],
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("❌ Debug endpoint error:", error);
    return NextResponse.json(
      {
        error: "Debug operation failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
