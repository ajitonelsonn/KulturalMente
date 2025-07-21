// src/lib/pdf-export-service.ts
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export interface CulturalProfile {
  themes: string[];
  connections: Array<{
    domain1: string;
    domain2: string;
    strength: number;
    explanation: string;
    qlooEntities: string[];
  }>;
  patterns: string[];
  diversityScore?: number;
  culturalDepth?: number;
  qlooInsights?: any;
}

export interface CulturalNarrative {
  title: string;
  story: string;
  insights: string[];
  personality: string;
  culturalDNA: string;
  recommendations: string[];
  evolutionPredictions?: string[];
  culturalBlindSpots?: string[];
  diversityScore?: number;
}

interface PDFExportOptions {
  includeVisualizations?: boolean;
  includeFullStory?: boolean;
  includeRecommendations?: boolean;
  includeInsights?: boolean;
  format?: "detailed" | "summary" | "executive";
  customBranding?: boolean;
}

class PDFExportService {
  private doc: jsPDF;
  private currentY: number = 20;
  private pageHeight: number = 297; // A4 height in mm
  private pageWidth: number = 210; // A4 width in mm
  private margins = { left: 20, right: 20, top: 20, bottom: 20 };

  constructor() {
    this.doc = new jsPDF("p", "mm", "a4");
  }

  async generateCulturalDNAReport(
    preferences: Record<string, string[]>,
    culturalProfile: CulturalProfile,
    narrative: CulturalNarrative,
    discoveries: string[] = [],
    options: PDFExportOptions = {}
  ): Promise<Blob> {
    const {
      includeVisualizations = true,
      includeFullStory = true,
      includeRecommendations = true,
      includeInsights = true,
      format = "detailed",
      customBranding = true,
    } = options;

    try {
      // Reset PDF
      this.doc = new jsPDF("p", "mm", "a4");
      this.currentY = 20;

      // Cover Page
      await this.generateCoverPage(narrative, culturalProfile);

      // Executive Summary (for all formats)
      this.addNewPage();
      await this.generateExecutiveSummary(
        narrative,
        culturalProfile,
        preferences
      );

      // Detailed sections (based on format)
      if (format === "detailed" || format === "summary") {
        if (includeFullStory) {
          this.addNewPage();
          await this.generateStorySection(narrative);
        }

        if (includeInsights) {
          this.addNewPage();
          await this.generateInsightsSection(narrative, culturalProfile);
        }

        this.addNewPage();
        await this.generateConnectionsSection(culturalProfile);

        if (includeRecommendations && discoveries.length > 0) {
          this.addNewPage();
          await this.generateRecommendationsSection(discoveries, narrative);
        }
      }

      // Data Analysis Section (detailed format only)
      if (format === "detailed") {
        this.addNewPage();
        await this.generateDataAnalysisSection(culturalProfile, preferences);

        if (narrative.evolutionPredictions?.length) {
          this.addNewPage();
          await this.generateEvolutionSection(narrative);
        }
      }

      // Visualizations (if requested and supported)
      if (includeVisualizations) {
        await this.addVisualizationsSection(culturalProfile, preferences);
      }

      // Footer with branding
      if (customBranding) {
        this.addFooterBranding();
      }

      return this.doc.output("blob");
    } catch (error) {
      console.error("PDF generation failed:", error);
      throw new Error(
        `Failed to generate PDF: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  private async generateCoverPage(
    narrative: CulturalNarrative,
    culturalProfile: CulturalProfile
  ) {
    // Background gradient simulation
    this.doc.setFillColor(67, 56, 202); // Indigo
    this.doc.rect(0, 0, this.pageWidth, this.pageHeight, "F");

    this.doc.setFillColor(139, 92, 246); // Purple overlay
    this.doc.rect(0, 0, this.pageWidth, this.pageHeight / 2, "F");

    // Title
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(32);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("KulturalMente", this.pageWidth / 2, 40, { align: "center" });

    this.doc.setFontSize(16);
    this.doc.setFont("helvetica", "normal");
    this.doc.text("Cultural Intelligence Report", this.pageWidth / 2, 50, {
      align: "center",
    });

    // Cultural DNA Title
    this.doc.setFontSize(28);
    this.doc.setFont("helvetica", "bold");
    const titleText = `"${narrative.title}"`;
    this.doc.text(titleText, this.pageWidth / 2, 80, { align: "center" });

    // Diversity Score Badge
    this.doc.setFillColor(34, 197, 94); // Green
    this.doc.circle(this.pageWidth / 2, 110, 15, "F");
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(20);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(
      `${narrative.diversityScore || 75}`,
      this.pageWidth / 2,
      115,
      { align: "center" }
    );

    this.doc.setFontSize(12);
    this.doc.text("Diversity Score", this.pageWidth / 2, 130, {
      align: "center",
    });

    // Cultural DNA Description
    this.doc.setFontSize(14);
    this.doc.setFont("helvetica", "normal");
    const dnaLines = this.doc.splitTextToSize(
      narrative.culturalDNA,
      this.pageWidth - 40
    );
    this.doc.text(dnaLines, this.pageWidth / 2, 150, { align: "center" });

    // Stats at bottom
    this.doc.setFontSize(12);
    this.doc.setFont("helvetica", "bold");
    const statsY = 240;

    // Cultural Markers
    this.doc.text("Cultural Markers", 30, statsY);
    this.doc.setFontSize(24);
    const entityCount = Object.values(
      culturalProfile.qlooInsights?.entityMapping || {}
    ).flat().length;
    this.doc.text(`${entityCount}`, 30, statsY + 10);

    // Connections
    this.doc.setFontSize(12);
    this.doc.text("Connections", this.pageWidth / 2, statsY, {
      align: "center",
    });
    this.doc.setFontSize(24);
    this.doc.text(
      `${culturalProfile.connections.length}`,
      this.pageWidth / 2,
      statsY + 10,
      { align: "center" }
    );

    // Themes
    this.doc.setFontSize(12);
    this.doc.text("Themes", this.pageWidth - 30, statsY, { align: "right" });
    this.doc.setFontSize(24);
    this.doc.text(
      `${culturalProfile.themes.length}`,
      this.pageWidth - 30,
      statsY + 10,
      { align: "right" }
    );

    // Generation timestamp
    this.doc.setFontSize(10);
    this.doc.setTextColor(200, 200, 200);
    this.doc.text(
      `Generated on ${new Date().toLocaleDateString()}`,
      this.pageWidth / 2,
      280,
      { align: "center" }
    );
  }

  private async generateExecutiveSummary(
    narrative: CulturalNarrative,
    culturalProfile: CulturalProfile,
    preferences: Record<string, string[]>
  ) {
    this.addSectionHeader("Executive Summary");

    // Cultural Identity
    this.doc.setFontSize(14);
    this.doc.setFont("helvetica", "bold");
    this.doc.setTextColor(0, 0, 0);
    this.doc.text("Cultural Identity:", this.margins.left, this.currentY);

    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(12);
    this.currentY += 8;
    const identityLines = this.doc.splitTextToSize(
      `"${narrative.title}" - ${narrative.personality}`,
      this.pageWidth - 40
    );
    this.doc.text(identityLines, this.margins.left, this.currentY);
    this.currentY += identityLines.length * 5 + 10;

    // Key Statistics
    this.doc.setFontSize(14);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("Key Statistics:", this.margins.left, this.currentY);
    this.currentY += 10;

    const stats = [
      `Cultural Diversity Score: ${narrative.diversityScore || 75}/100`,
      `Preferences Analyzed: ${
        Object.values(preferences).flat().length
      } across ${
        Object.keys(preferences).filter((k) => preferences[k].length > 0).length
      } domains`,
      `Cross-Domain Connections: ${culturalProfile.connections.length}`,
      `Cultural Themes Identified: ${culturalProfile.themes.length}`,
      `Database Recognition Rate: ${Math.round(
        (culturalProfile.qlooInsights?.matchRate || 0) * 100
      )}%`,
    ];

    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(11);
    stats.forEach((stat) => {
      this.doc.text(`• ${stat}`, this.margins.left + 5, this.currentY);
      this.currentY += 6;
    });

    this.currentY += 10;

    // Cultural DNA
    this.doc.setFontSize(14);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("Cultural DNA:", this.margins.left, this.currentY);
    this.currentY += 8;

    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(12);
    const dnaLines = this.doc.splitTextToSize(
      narrative.culturalDNA,
      this.pageWidth - 40
    );
    this.doc.text(dnaLines, this.margins.left, this.currentY);
    this.currentY += dnaLines.length * 5 + 15;

    // Top Cultural Themes
    this.doc.setFontSize(14);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("Primary Cultural Themes:", this.margins.left, this.currentY);
    this.currentY += 10;

    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(11);
    culturalProfile.themes.slice(0, 5).forEach((theme, index) => {
      this.doc.text(
        `${index + 1}. ${theme}`,
        this.margins.left + 5,
        this.currentY
      );
      this.currentY += 6;
    });
  }

  private async generateStorySection(narrative: CulturalNarrative) {
    this.addSectionHeader("Your Cultural Story");

    this.doc.setFontSize(12);
    this.doc.setFont("helvetica", "normal");
    this.doc.setTextColor(0, 0, 0);

    // Split story into paragraphs
    const paragraphs = narrative.story.split("\n\n").filter((p) => p.trim());

    paragraphs.forEach((paragraph, index) => {
      if (this.currentY > this.pageHeight - 40) {
        this.addNewPage();
      }

      const lines = this.doc.splitTextToSize(
        paragraph.trim(),
        this.pageWidth - 40
      );
      this.doc.text(lines, this.margins.left, this.currentY);
      this.currentY += lines.length * 5 + 8;
    });
  }

  private async generateInsightsSection(
    narrative: CulturalNarrative,
    culturalProfile: CulturalProfile
  ) {
    this.addSectionHeader("Cultural Insights & Analysis");

    // Key Insights
    this.doc.setFontSize(14);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("Key Insights:", this.margins.left, this.currentY);
    this.currentY += 10;

    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(11);
    narrative.insights.forEach((insight, index) => {
      if (this.currentY > this.pageHeight - 30) {
        this.addNewPage();
      }

      this.doc.text(`${index + 1}.`, this.margins.left, this.currentY);
      const insightLines = this.doc.splitTextToSize(
        insight,
        this.pageWidth - 50
      );
      this.doc.text(insightLines, this.margins.left + 10, this.currentY);
      this.currentY += insightLines.length * 5 + 5;
    });

    this.currentY += 10;

    // Cultural Patterns
    this.doc.setFontSize(14);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("Cultural Patterns:", this.margins.left, this.currentY);
    this.currentY += 10;

    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(11);
    culturalProfile.patterns.forEach((pattern, index) => {
      if (this.currentY > this.pageHeight - 30) {
        this.addNewPage();
      }

      this.doc.text("•", this.margins.left, this.currentY);
      const patternLines = this.doc.splitTextToSize(
        pattern,
        this.pageWidth - 50
      );
      this.doc.text(patternLines, this.margins.left + 10, this.currentY);
      this.currentY += patternLines.length * 5 + 3;
    });
  }

  private async generateConnectionsSection(culturalProfile: CulturalProfile) {
    this.addSectionHeader("Cross-Domain Connections");

    if (culturalProfile.connections.length === 0) {
      this.doc.setFontSize(12);
      this.doc.text(
        "No significant cross-domain connections detected.",
        this.margins.left,
        this.currentY
      );
      return;
    }

    this.doc.setFontSize(11);
    this.doc.setFont("helvetica", "normal");

    culturalProfile.connections.forEach((connection, index) => {
      if (this.currentY > this.pageHeight - 40) {
        this.addNewPage();
      }

      // Connection header
      this.doc.setFont("helvetica", "bold");
      this.doc.text(
        `${connection.domain1} ↔ ${connection.domain2}`,
        this.margins.left,
        this.currentY
      );

      // Strength indicator
      const strengthPercent = Math.round(connection.strength * 100);
      const [r, g, b] = this.getStrengthColor(connection.strength);
      this.doc.setTextColor(r, g, b);
      this.doc.text(
        `${strengthPercent}% connection strength`,
        this.pageWidth - 60,
        this.currentY,
        { align: "right" }
      );

      this.currentY += 7;

      // Explanation
      this.doc.setFont("helvetica", "normal");
      this.doc.setTextColor(0, 0, 0);
      const explanationLines = this.doc.splitTextToSize(
        connection.explanation,
        this.pageWidth - 40
      );
      this.doc.text(explanationLines, this.margins.left + 5, this.currentY);
      this.currentY += explanationLines.length * 5 + 10;
    });
  }

  private async generateRecommendationsSection(
    discoveries: string[],
    narrative: CulturalNarrative
  ) {
    this.addSectionHeader("Personalized Recommendations");

    this.doc.setFontSize(11);
    this.doc.setFont("helvetica", "normal");

    discoveries.forEach((discovery, index) => {
      if (this.currentY > this.pageHeight - 30) {
        this.addNewPage();
      }

      this.doc.setFont("helvetica", "bold");
      this.doc.text(`${index + 1}.`, this.margins.left, this.currentY);

      this.doc.setFont("helvetica", "normal");
      const discoveryLines = this.doc.splitTextToSize(
        discovery,
        this.pageWidth - 50
      );
      this.doc.text(discoveryLines, this.margins.left + 10, this.currentY);
      this.currentY += discoveryLines.length * 5 + 8;
    });

    // Cultural Blind Spots (if any)
    if (narrative.culturalBlindSpots?.length) {
      this.currentY += 10;
      this.doc.setFontSize(14);
      this.doc.setFont("helvetica", "bold");
      this.doc.text("Growth Opportunities:", this.margins.left, this.currentY);
      this.currentY += 10;

      this.doc.setFontSize(11);
      this.doc.setFont("helvetica", "normal");
      narrative.culturalBlindSpots.forEach((blindSpot, index) => {
        if (this.currentY > this.pageHeight - 30) {
          this.addNewPage();
        }

        this.doc.text("•", this.margins.left, this.currentY);
        const blindSpotLines = this.doc.splitTextToSize(
          blindSpot,
          this.pageWidth - 50
        );
        this.doc.text(blindSpotLines, this.margins.left + 10, this.currentY);
        this.currentY += blindSpotLines.length * 5 + 5;
      });
    }
  }

  private async generateDataAnalysisSection(
    culturalProfile: CulturalProfile,
    preferences: Record<string, string[]>
  ) {
    this.addSectionHeader("Technical Analysis");

    // Data Overview
    this.doc.setFontSize(12);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("Data Processing Summary:", this.margins.left, this.currentY);
    this.currentY += 10;

    const technicalStats = [
      `Total Preferences Processed: ${
        Object.values(preferences).flat().length
      }`,
      `Cultural Domains Analyzed: ${
        Object.keys(preferences).filter((k) => preferences[k].length > 0).length
      }`,
      `Qloo Entities Matched: ${
        culturalProfile.qlooInsights?.totalEntitiesFound || 0
      }`,
      `Database Recognition Rate: ${Math.round(
        (culturalProfile.qlooInsights?.matchRate || 0) * 100
      )}%`,
      `Cross-Domain Connections Found: ${culturalProfile.connections.length}`,
      `Cultural Themes Identified: ${culturalProfile.themes.length}`,
      `Cultural Depth Score: ${culturalProfile.culturalDepth || "N/A"}/100`,
    ];

    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(11);
    technicalStats.forEach((stat) => {
      this.doc.text(`• ${stat}`, this.margins.left + 5, this.currentY);
      this.currentY += 6;
    });

    this.currentY += 10;

    // Entity Mapping Details
    if (culturalProfile.qlooInsights?.entityMapping) {
      this.doc.setFont("helvetica", "bold");
      this.doc.setFontSize(12);
      this.doc.text(
        "Entity Recognition by Domain:",
        this.margins.left,
        this.currentY
      );
      this.currentY += 10;

      this.doc.setFont("helvetica", "normal");
      this.doc.setFontSize(11);
      Object.entries(culturalProfile.qlooInsights.entityMapping).forEach(
        ([domain, entities]) => {
          if (Array.isArray(entities) && entities.length > 0) {
            this.doc.text(
              `${domain.charAt(0).toUpperCase() + domain.slice(1)}: ${
                entities.length
              } entities recognized`,
              this.margins.left + 5,
              this.currentY
            );
            this.currentY += 6;
          }
        }
      );
    }
  }

  private async generateEvolutionSection(narrative: CulturalNarrative) {
    this.addSectionHeader("Cultural Evolution Predictions");

    if (!narrative.evolutionPredictions?.length) {
      this.doc.setFontSize(12);
      this.doc.text(
        "No evolution predictions available.",
        this.margins.left,
        this.currentY
      );
      return;
    }

    this.doc.setFontSize(11);
    this.doc.setFont("helvetica", "normal");

    narrative.evolutionPredictions.forEach((prediction, index) => {
      if (this.currentY > this.pageHeight - 30) {
        this.addNewPage();
      }

      this.doc.setFont("helvetica", "bold");
      this.doc.text(`Phase ${index + 1}:`, this.margins.left, this.currentY);

      this.doc.setFont("helvetica", "normal");
      const predictionLines = this.doc.splitTextToSize(
        prediction,
        this.pageWidth - 50
      );
      this.doc.text(predictionLines, this.margins.left + 25, this.currentY);
      this.currentY += predictionLines.length * 5 + 8;
    });
  }

  private async addVisualizationsSection(
    culturalProfile: CulturalProfile,
    preferences: Record<string, string[]>
  ) {
    this.addNewPage();
    this.addSectionHeader("Cultural Data Visualizations");

    try {
      // Create a temporary canvas for chart generation
      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 300;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        // Simple diversity chart
        await this.generateDiversityChart(ctx, culturalProfile, canvas);

        // Add chart to PDF
        const imgData = canvas.toDataURL("image/png");
        this.doc.addImage(
          imgData,
          "PNG",
          this.margins.left,
          this.currentY,
          170,
          100
        );
        this.currentY += 110;

        this.doc.setFontSize(10);
        this.doc.text(
          "Cultural Diversity Distribution",
          this.margins.left,
          this.currentY
        );
        this.currentY += 15;
      }
    } catch (error) {
      console.warn("Could not generate visualizations:", error);
      this.doc.setFontSize(12);
      this.doc.text(
        "Visualizations could not be generated for PDF export.",
        this.margins.left,
        this.currentY
      );
    }
  }

  private async generateDiversityChart(
    ctx: CanvasRenderingContext2D,
    culturalProfile: CulturalProfile,
    canvas: HTMLCanvasElement
  ) {
    // Simple pie chart showing domain distribution
    const domains = ["Music", "Movies", "Food", "Travel", "Books"];
    const colors = ["#8B5CF6", "#3B82F6", "#F59E0B", "#10B981", "#EF4444"];

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 80;

    // Clear canvas
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let currentAngle = 0;
    const totalConnections = culturalProfile.connections.length || 1;

    domains.forEach((domain, index) => {
      const domainConnections = culturalProfile.connections.filter(
        (c) =>
          c.domain1 === domain.toLowerCase() ||
          c.domain2 === domain.toLowerCase()
      ).length;

      const sliceAngle =
        (domainConnections / totalConnections) * 2 * Math.PI ||
        (2 * Math.PI) / domains.length;

      // Draw slice
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(
        centerX,
        centerY,
        radius,
        currentAngle,
        currentAngle + sliceAngle
      );
      ctx.closePath();
      ctx.fillStyle = colors[index];
      ctx.fill();

      // Draw label
      const labelAngle = currentAngle + sliceAngle / 2;
      const labelX = centerX + Math.cos(labelAngle) * (radius + 20);
      const labelY = centerY + Math.sin(labelAngle) * (radius + 20);

      ctx.fillStyle = "#000000";
      ctx.font = "12px Arial";
      ctx.textAlign = "center";
      ctx.fillText(domain, labelX, labelY);

      currentAngle += sliceAngle;
    });
  }

  private addSectionHeader(title: string) {
    if (this.currentY > this.pageHeight - 60) {
      this.addNewPage();
    }

    this.doc.setFillColor(139, 92, 246); // Purple
    this.doc.rect(
      this.margins.left,
      this.currentY - 5,
      this.pageWidth - 40,
      12,
      "F"
    );

    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(16);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(title, this.margins.left + 5, this.currentY + 5);

    this.currentY += 20;
    this.doc.setTextColor(0, 0, 0);
  }

  private addNewPage() {
    this.doc.addPage();
    this.currentY = this.margins.top + 10;
  }

  private addFooterBranding() {
    const totalPages = (this.doc as any).getNumberOfPages();

    for (let i = 1; i <= totalPages; i++) {
      this.doc.setPage(i);

      // Footer line
      this.doc.setDrawColor(200, 200, 200);
      this.doc.line(
        this.margins.left,
        this.pageHeight - 15,
        this.pageWidth - this.margins.right,
        this.pageHeight - 15
      );

      // Branding
      this.doc.setFontSize(8);
      this.doc.setTextColor(100, 100, 100);
      this.doc.text(
        "Generated by KulturalMente",
        this.margins.left,
        this.pageHeight - 8
      );

      // Page number
      this.doc.text(
        `Page ${i} of ${totalPages}`,
        this.pageWidth - this.margins.right,
        this.pageHeight - 8,
        { align: "right" }
      );

      // Website
      this.doc.text(
        "kulturalmemente.space",
        this.pageWidth / 2,
        this.pageHeight - 8,
        { align: "center" }
      );
    }
  }

  private getStrengthColor(strength: number): [number, number, number] {
    if (strength > 0.8) return [34, 197, 94]; // Green
    if (strength > 0.6) return [59, 130, 246]; // Blue
    if (strength > 0.4) return [249, 115, 22]; // Orange
    return [239, 68, 68]; // Red
  }

  // Quick export methods for different formats
  async generateExecutiveSummaryPDF(
    preferences: Record<string, string[]>,
    culturalProfile: CulturalProfile,
    narrative: CulturalNarrative
  ): Promise<Blob> {
    return this.generateCulturalDNAReport(
      preferences,
      culturalProfile,
      narrative,
      [],
      {
        format: "executive",
        includeVisualizations: false,
        includeFullStory: false,
        includeRecommendations: false,
        includeInsights: true,
      }
    );
  }

  async generateDetailedReportPDF(
    preferences: Record<string, string[]>,
    culturalProfile: CulturalProfile,
    narrative: CulturalNarrative,
    discoveries: string[]
  ): Promise<Blob> {
    return this.generateCulturalDNAReport(
      preferences,
      culturalProfile,
      narrative,
      discoveries,
      {
        format: "detailed",
        includeVisualizations: true,
        includeFullStory: true,
        includeRecommendations: true,
        includeInsights: true,
      }
    );
  }
}

export const pdfExportService = new PDFExportService();
