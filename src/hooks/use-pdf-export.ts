// src/hooks/use-pdf-export.ts
import { useState, useCallback } from "react";
import { pdfExportService } from "@/lib/pdf-export-service";
import type {
  CulturalProfile,
  CulturalNarrative,
} from "@/lib/pdf-export-service";

interface PDFExportOptions {
  format?: "detailed" | "summary" | "executive";
  includeVisualizations?: boolean;
  includeFullStory?: boolean;
  includeRecommendations?: boolean;
  includeInsights?: boolean;
}

interface PDFExportState {
  isGenerating: boolean;
  progress: number;
  stage: string;
  error: string | null;
}

export const usePDFExport = () => {
  const [state, setState] = useState<PDFExportState>({
    isGenerating: false,
    progress: 0,
    stage: "",
    error: null,
  });

  const updateProgress = useCallback((progress: number, stage: string) => {
    setState((prev) => ({ ...prev, progress, stage }));
  }, []);

  const generatePDF = useCallback(
    async (
      preferences: Record<string, string[]>,
      culturalProfile: CulturalProfile,
      narrative: CulturalNarrative,
      discoveries: string[] = [],
      options: PDFExportOptions = {}
    ): Promise<void> => {
      try {
        setState({
          isGenerating: true,
          progress: 0,
          stage: "Initializing PDF generation...",
          error: null,
        });

        updateProgress(10, "Preparing document structure...");
        await new Promise((resolve) => setTimeout(resolve, 300));

        updateProgress(25, "Generating cover page...");
        await new Promise((resolve) => setTimeout(resolve, 200));

        updateProgress(40, "Processing cultural analysis...");
        await new Promise((resolve) => setTimeout(resolve, 300));

        updateProgress(60, "Adding insights and recommendations...");
        await new Promise((resolve) => setTimeout(resolve, 200));

        updateProgress(80, "Creating visualizations...");
        await new Promise((resolve) => setTimeout(resolve, 400));

        updateProgress(95, "Finalizing PDF...");

        const pdfBlob = await pdfExportService.generateCulturalDNAReport(
          preferences,
          culturalProfile,
          narrative,
          discoveries,
          options
        );

        updateProgress(100, "PDF ready for download!");

        // Download the PDF
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `cultural-dna-${narrative.title
          .toLowerCase()
          .replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setState({
          isGenerating: false,
          progress: 100,
          stage: "Download complete!",
          error: null,
        });

        // Reset state after a delay
        setTimeout(() => {
          setState({
            isGenerating: false,
            progress: 0,
            stage: "",
            error: null,
          });
        }, 2000);
      } catch (error) {
        console.error("PDF generation failed:", error);
        setState({
          isGenerating: false,
          progress: 0,
          stage: "",
          error:
            error instanceof Error ? error.message : "Failed to generate PDF",
        });
      }
    },
    [updateProgress]
  );

  const generateExecutiveSummary = useCallback(
    async (
      preferences: Record<string, string[]>,
      culturalProfile: CulturalProfile,
      narrative: CulturalNarrative
    ): Promise<void> => {
      return generatePDF(preferences, culturalProfile, narrative, [], {
        format: "executive",
        includeVisualizations: false,
        includeFullStory: false,
        includeRecommendations: false,
        includeInsights: true,
      });
    },
    [generatePDF]
  );

  const generateDetailedReport = useCallback(
    async (
      preferences: Record<string, string[]>,
      culturalProfile: CulturalProfile,
      narrative: CulturalNarrative,
      discoveries: string[]
    ): Promise<void> => {
      return generatePDF(preferences, culturalProfile, narrative, discoveries, {
        format: "detailed",
        includeVisualizations: true,
        includeFullStory: true,
        includeRecommendations: true,
        includeInsights: true,
      });
    },
    [generatePDF]
  );

  const generateSummaryReport = useCallback(
    async (
      preferences: Record<string, string[]>,
      culturalProfile: CulturalProfile,
      narrative: CulturalNarrative,
      discoveries: string[]
    ): Promise<void> => {
      return generatePDF(preferences, culturalProfile, narrative, discoveries, {
        format: "summary",
        includeVisualizations: false,
        includeFullStory: true,
        includeRecommendations: true,
        includeInsights: true,
      });
    },
    [generatePDF]
  );

  return {
    ...state,
    generatePDF,
    generateExecutiveSummary,
    generateDetailedReport,
    generateSummaryReport,
  };
};
