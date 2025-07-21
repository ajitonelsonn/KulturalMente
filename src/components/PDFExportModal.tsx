// src/components/PDFExportModal.tsx - Portal Version
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  FileText,
  Settings,
  CheckCircle,
  X,
  Loader2,
  Eye,
  Sparkles,
  Brain,
  BarChart3,
  Clock,
  Target,
  Award,
  Zap,
} from "lucide-react";
import { usePDFExport } from "@/hooks/use-pdf-export";

interface PDFExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: Record<string, string[]>;
  culturalProfile: any;
  narrative: any;
  discoveries: string[];
}

interface ExportOption {
  id: "executive" | "summary" | "detailed";
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  features: string[];
  pages: string;
  color: string;
  recommended?: boolean;
}

const exportOptions: ExportOption[] = [
  {
    id: "executive",
    name: "Executive Summary",
    description: "Quick overview perfect for sharing",
    icon: Zap,
    features: [
      "Cultural identity overview",
      "Key statistics",
      "Primary themes",
      "Core insights",
    ],
    pages: "2-3 pages",
    color: "from-green-500 to-emerald-500",
  },
  {
    id: "summary",
    name: "Summary Report",
    description: "Balanced detail for personal review",
    icon: Eye,
    features: [
      "Complete cultural story",
      "All insights & patterns",
      "Cross-domain connections",
      "Recommendations",
    ],
    pages: "4-6 pages",
    color: "from-blue-500 to-cyan-500",
    recommended: true,
  },
  {
    id: "detailed",
    name: "Detailed Analysis",
    description: "Comprehensive report with everything",
    icon: Brain,
    features: [
      "Full cultural narrative",
      "Technical analysis",
      "Data visualizations",
      "Evolution predictions",
      "Growth opportunities",
    ],
    pages: "8-12 pages",
    color: "from-purple-500 to-violet-500",
  },
];

const PDFExportModal: React.FC<PDFExportModalProps> = ({
  isOpen,
  onClose,
  preferences,
  culturalProfile,
  narrative,
  discoveries,
}) => {
  const [selectedOption, setSelectedOption] = useState<
    "executive" | "summary" | "detailed"
  >("summary");
  const [customOptions, setCustomOptions] = useState({
    includeVisualizations: true,
    includeFullStory: true,
    includeRecommendations: true,
    includeInsights: true,
  });
  const [showCustomOptions, setShowCustomOptions] = useState(false);
  const [mounted, setMounted] = useState(false);

  const {
    isGenerating,
    progress,
    stage,
    error,
    generateExecutiveSummary,
    generateSummaryReport,
    generateDetailedReport,
    generatePDF,
  } = usePDFExport();

  // Ensure component is mounted before rendering portal
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  const handleExport = async () => {
    try {
      switch (selectedOption) {
        case "executive":
          await generateExecutiveSummary(
            preferences,
            culturalProfile,
            narrative
          );
          break;
        case "summary":
          await generateSummaryReport(
            preferences,
            culturalProfile,
            narrative,
            discoveries
          );
          break;
        case "detailed":
          await generateDetailedReport(
            preferences,
            culturalProfile,
            narrative,
            discoveries
          );
          break;
        default:
          await generatePDF(
            preferences,
            culturalProfile,
            narrative,
            discoveries,
            {
              format: selectedOption,
              ...customOptions,
            }
          );
      }
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  const selectedExportOption = exportOptions.find(
    (opt) => opt.id === selectedOption
  )!;

  // Don't render on server or if not mounted
  if (!mounted || !isOpen) return null;

  // Create the modal content
  const modalContent = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 flex items-center justify-center p-4"
        style={{
          zIndex: 999999,
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          backdropFilter: "blur(8px)",
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          className="max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          style={{
            backgroundColor: "rgba(17, 24, 39, 0.95)",
            backdropFilter: "blur(20px)",
            borderRadius: "24px",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8)",
            padding: "32px",
            position: "relative",
            zIndex: 1000000,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <motion.div
                animate={{ rotate: isGenerating ? 360 : 0 }}
                transition={{
                  duration: 2,
                  repeat: isGenerating ? Infinity : 0,
                  ease: "linear",
                }}
                className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mr-4"
              >
                <FileText className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Export Cultural DNA Report
                </h2>
                <p className="text-blue-200">
                  Choose your preferred format and download your personalized
                  cultural analysis
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 transition-colors text-white"
            >
              <X className="w-6 h-6" />
            </motion.button>
          </div>

          {/* Progress Bar (when generating) */}
          <AnimatePresence>
            {isGenerating && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8 bg-white/5 rounded-xl p-6 border border-white/10"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Loader2 className="w-5 h-5 text-purple-400 mr-3 animate-spin" />
                    <span className="text-white font-medium">
                      Generating PDF...
                    </span>
                  </div>
                  <span className="text-purple-300 font-bold">{progress}%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                    className="bg-gradient-to-r from-purple-400 to-blue-400 h-3 rounded-full"
                  />
                </div>
                <div className="mt-3 text-blue-200 text-sm">{stage}</div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Display */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 bg-red-500/10 border border-red-400/20 rounded-xl p-4"
              >
                <div className="text-red-300 font-medium">Export Failed</div>
                <div className="text-red-200 text-sm mt-1">{error}</div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Export Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {exportOptions.map((option) => (
              <motion.div
                key={option.id}
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedOption(option.id)}
                className={`relative cursor-pointer rounded-2xl p-6 border-2 transition-all duration-300 ${
                  selectedOption === option.id
                    ? "border-white/40 bg-white/10"
                    : "border-white/20 bg-white/5 hover:border-white/30 hover:bg-white/8"
                }`}
              >
                {/* Recommended Badge */}
                {option.recommended && (
                  <div className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-3 py-1 rounded-full">
                    Recommended
                  </div>
                )}

                {/* Selected Indicator */}
                {selectedOption === option.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-4 right-4 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                  >
                    <CheckCircle className="w-4 h-4 text-white" />
                  </motion.div>
                )}

                <div
                  className={`w-12 h-12 bg-gradient-to-r ${option.color} rounded-xl flex items-center justify-center mb-4`}
                >
                  <option.icon className="w-6 h-6 text-white" />
                </div>

                <h3 className="text-xl font-bold text-white mb-2">
                  {option.name}
                </h3>
                <p className="text-blue-200 text-sm mb-4">
                  {option.description}
                </p>

                <div className="text-white/80 text-sm mb-4">
                  <div className="flex items-center mb-2">
                    <Clock className="w-4 h-4 mr-2" />
                    {option.pages}
                  </div>
                </div>

                <div className="space-y-2">
                  {option.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center text-sm text-blue-100"
                    >
                      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-3" />
                      {feature}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Custom Options Toggle */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCustomOptions(!showCustomOptions)}
              className="flex items-center text-white/80 hover:text-white transition-colors"
            >
              <Settings className="w-5 h-5 mr-2" />
              <span>Advanced Options</span>
              <motion.div
                animate={{ rotate: showCustomOptions ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="ml-2"
              >
                ▼
              </motion.div>
            </motion.button>

            <AnimatePresence>
              {showCustomOptions && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 bg-white/5 rounded-xl p-6 border border-white/10"
                >
                  <h4 className="text-white font-medium mb-4">
                    Customize Your Report
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      {
                        key: "includeVisualizations",
                        label: "Include Visualizations",
                        icon: BarChart3,
                      },
                      {
                        key: "includeFullStory",
                        label: "Include Full Story",
                        icon: Brain,
                      },
                      {
                        key: "includeRecommendations",
                        label: "Include Recommendations",
                        icon: Target,
                      },
                      {
                        key: "includeInsights",
                        label: "Include All Insights",
                        icon: Sparkles,
                      },
                    ].map((option) => (
                      <motion.label
                        key={option.key}
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={
                            customOptions[
                              option.key as keyof typeof customOptions
                            ]
                          }
                          onChange={(e) =>
                            setCustomOptions((prev) => ({
                              ...prev,
                              [option.key]: e.target.checked,
                            }))
                          }
                          className="sr-only"
                        />
                        <div
                          className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center transition-colors ${
                            customOptions[
                              option.key as keyof typeof customOptions
                            ]
                              ? "bg-purple-500 border-purple-400"
                              : "border-white/30"
                          }`}
                        >
                          {customOptions[
                            option.key as keyof typeof customOptions
                          ] && <CheckCircle className="w-3 h-3 text-white" />}
                        </div>
                        <option.icon className="w-4 h-4 text-white/80 mr-2" />
                        <span className="text-white text-sm">
                          {option.label}
                        </span>
                      </motion.label>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Preview Info */}
          <div className="bg-white/5 rounded-xl p-6 border border-white/10 mb-8">
            <h4 className="text-white font-medium mb-4 flex items-center">
              <Eye className="w-5 h-5 mr-2 text-blue-400" />
              Report Preview - {selectedExportOption.name}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">
                  {Object.values(preferences).flat().length}
                </div>
                <div className="text-sm text-white/60">
                  Cultural Preferences
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">
                  {culturalProfile?.connections?.length || 0}
                </div>
                <div className="text-sm text-white/60">Connections Found</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">
                  {narrative?.diversityScore || 75}%
                </div>
                <div className="text-sm text-white/60">Diversity Score</div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-purple-500/10 rounded-lg border border-purple-400/20">
              <div className="flex items-start">
                <Award className="w-5 h-5 text-purple-400 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-white font-medium mb-1">
                    "{narrative?.title}"
                  </div>
                  <div className="text-purple-100 text-sm">
                    {narrative?.culturalDNA}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              disabled={isGenerating}
              className="px-6 py-3 border border-white/30 text-white rounded-xl font-medium hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExport}
              disabled={isGenerating}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 mr-2" />
                  Export {selectedExportOption.name}
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  // Render the modal using a portal to document.body
  return createPortal(modalContent, document.body);
};

export default PDFExportModal;
