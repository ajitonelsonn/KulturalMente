// src/app/api/openai/test/route.ts
import { NextRequest, NextResponse } from "next/server";
import { serverOpenAIService } from "@/lib/server-openai-service";

export async function GET(request: NextRequest) {
  try {
    console.log("🧪 Testing OpenAI API connection...");

    const connectionTest = await serverOpenAIService.testOpenAIConnection();

    return NextResponse.json(connectionTest);
  } catch (error) {
    console.error("❌ OpenAI test error:", error);

    return NextResponse.json(
      {
        success: false,
        message: `OpenAI API test failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
