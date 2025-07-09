// src/app/api/openai/narrative/route.ts
import { NextRequest, NextResponse } from "next/server";
import { openaiService } from "@/lib/openai-service";

export async function POST(request: NextRequest) {
  try {
    const { preferences, culturalProfile } = await request.json();

    if (!preferences || !culturalProfile) {
      return NextResponse.json(
        { error: "Preferences and cultural profile are required" },
        { status: 400 }
      );
    }

    const narrative = await openaiService.generateCulturalNarrative(
      preferences,
      culturalProfile
    );
    return NextResponse.json({ narrative });
  } catch (error) {
    console.error("Narrative API error:", error);
    return NextResponse.json(
      { error: "Narrative generation failed" },
      { status: 500 }
    );
  }
}
