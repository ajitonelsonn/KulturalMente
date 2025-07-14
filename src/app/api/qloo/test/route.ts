// src/app/api/qloo/test/route.ts

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    console.log(`🧪 Testing Qloo API connection...`);

    // SECURE: Only read from environment variables
    const QLOO_API_URL = process.env.QLOO_API_URL;
    const QLOO_API_KEY = process.env.QLOO_API_KEY;

    if (!QLOO_API_URL || !QLOO_API_KEY) {
      console.error("❌ Missing required environment variables:");
      if (!QLOO_API_URL) console.error("- QLOO_API_URL is not set");
      if (!QLOO_API_KEY) console.error("- QLOO_API_KEY is not set");

      return NextResponse.json({
        success: false,
        message:
          "Qloo API credentials not configured. Please check your .env.local file.",
        missingVars: {
          QLOO_API_URL: !QLOO_API_URL,
          QLOO_API_KEY: !QLOO_API_KEY,
        },
        hasApiKey: false,
      });
    }

    console.log(`API URL configured: ${QLOO_API_URL}`);
    console.log(`API Key configured: ${QLOO_API_KEY ? "Yes" : "No"}`);

    // Test search endpoint
    const qlooUrl = new URL("/search", QLOO_API_URL);
    qlooUrl.searchParams.set("q", "test");
    qlooUrl.searchParams.set("limit", "1");

    const response = await fetch(qlooUrl.toString(), {
      method: "GET",
      headers: {
        "X-API-Key": QLOO_API_KEY,
        "Content-Type": "application/json",
      },
    });

    const isSuccess = response.ok;
    const data = isSuccess ? await response.json() : await response.text();

    console.log(`🧪 Qloo API test result: ${isSuccess ? "SUCCESS" : "FAILED"}`);

    return NextResponse.json({
      success: isSuccess,
      status: response.status,
      data: isSuccess ? data : null,
      error: isSuccess ? null : data,
      hasApiKey: !!QLOO_API_KEY,
      message: isSuccess
        ? "Qloo API is working correctly!"
        : "Qloo API connection failed - check credentials",
    });
  } catch (error) {
    console.error("❌ Qloo API test failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        message: "Failed to connect to Qloo API",
        hasApiKey: !!process.env.QLOO_API_KEY,
      },
      { status: 500 }
    );
  }
}
