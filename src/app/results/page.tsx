"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Sparkles,
  Heart,
  Compass,
  Share2,
  Download,
  ArrowLeft,
  Star,
  Zap,
  Map,
  Globe,
  Palette,
  Plus,
  TrendingUp,
  Eye,
  Clock,
  Target,
  BarChart3,
  Camera,
  Copy,
} from "lucide-react";
import { qlooService, CulturalProfile } from "@/lib/qloo-service";
import { openaiService, CulturalNarrative } from "@/lib/openai-service";
import Link from "next/link";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import CulturalWowFactor from "@/components/CulturalWowFactor";
import html2canvas from "html2canvas";

interface StoredResults {
  preferences: Record<string, string[]>;
  culturalProfile: CulturalProfile;
  narrative: CulturalNarrative;
  discoveries: string[];
  growthChallenges: string[];
  timestamp: number;
  analysisStats: {
    analysisTime: number;
    connectionsFound: number;
    insightsGenerated: number;
    confidenceScore: number;
  };
}

const RESULTS_STORAGE_KEY = "kulturalmemente_results";
const RESULTS_EXPIRY_DAYS = 7; // Results expire after 7 days

export default function ResultsPage() {
  const [preferences, setPreferences] = useState<Record<string, string[]>>({});
  const [culturalProfile, setCulturalProfile] =
    useState<CulturalProfile | null>(null);
  const [narrative, setNarrative] = useState<CulturalNarrative | null>(null);
  const [discoveries, setDiscoveries] = useState<string[]>([]);
  const [growthChallenges, setGrowthChallenges] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStage, setLoadingStage] = useState(
    "Checking for existing results..."
  );
  const [isNewAnalysis, setIsNewAnalysis] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "story" | "connections" | "discoveries" | "evolution" | "visualization"
  >("story");
  const [isMounted, setIsMounted] = useState(false);
  const [analysisStats, setAnalysisStats] = useState({
    analysisTime: 0,
    connectionsFound: 0,
    insightsGenerated: 0,
    confidenceScore: 0,
  });

  // New states for sharing functionality
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(
    null
  );
  const shareableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      // Check for stored results first
      const storedResults = getStoredResults();

      if (storedResults && !isResultsExpired(storedResults.timestamp)) {
        console.log("📋 Loading existing results from storage");
        setLoadingStage("Loading your saved cultural DNA...");
        setLoadingProgress(50);

        // Simulate brief loading for UX
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Load stored data
        setPreferences(storedResults.preferences);
        setCulturalProfile(storedResults.culturalProfile);
        setNarrative(storedResults.narrative);
        setDiscoveries(storedResults.discoveries);
        setGrowthChallenges(storedResults.growthChallenges);
        setAnalysisStats(storedResults.analysisStats);

        setLoadingProgress(100);
        setLoadingStage("✨ Your cultural DNA is ready!");

        await new Promise((resolve) => setTimeout(resolve, 500));
        setIsLoading(false);

        return;
      }

      // No valid stored results, check for fresh preferences
      const storedPrefs = localStorage.getItem("culturalPreferences");
      if (!storedPrefs) {
        console.log("🔄 No preferences found, redirecting to onboarding");
        window.location.href = "/onboarding";
        return;
      }

      // Run new analysis
      console.log("🆕 Running new cultural analysis");
      setIsNewAnalysis(true);
      await runNewAnalysis(JSON.parse(storedPrefs));
    } catch (error) {
      console.error("Error loading results:", error);
      setIsLoading(false);
    }
  };

  const runNewAnalysis = async (prefs: Record<string, string[]>) => {
    const startTime = Date.now();
    setPreferences(prefs);

    try {
      // Stage 1: Loading preferences (10%)
      setLoadingStage("Loading your cultural preferences...");
      setLoadingProgress(10);
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Stage 2: Analyzing cross-domain connections (30%)
      setLoadingStage("🔍 Analyzing cross-domain connections...");
      setLoadingProgress(30);
      const profile = await qlooService.analyzeCrossDomainConnections(prefs);
      setCulturalProfile(profile);

      // Stage 3: Generating cultural narrative (60%)
      setLoadingStage("🎨 Generating cultural insights...");
      setLoadingProgress(60);
      const story = await openaiService.generateCulturalNarrative(
        prefs,
        profile
      );
      setNarrative(story);

      // Stage 4: Creating personalized discoveries (80%)
      setLoadingStage("🎯 Creating personalized discoveries...");
      setLoadingProgress(80);
      const recs = await openaiService.generateDiscoveryRecommendations(
        story,
        prefs,
        profile
      );
      setDiscoveries(recs);

      // Stage 5: Generating growth challenges (95%)
      setLoadingStage("✨ Crafting your unique narrative...");
      setLoadingProgress(95);
      const challenges = await openaiService.generateCulturalGrowthChallenges(
        prefs,
        profile,
        story
      );
      setGrowthChallenges(challenges);

      // Stage 6: Finalizing (100%)
      setLoadingStage("🎉 Finalizing your cultural DNA...");
      setLoadingProgress(100);

      // Calculate analysis stats
      const endTime = Date.now();
      const stats = {
        analysisTime: Math.round((endTime - startTime) / 1000),
        connectionsFound: profile.connections.length,
        insightsGenerated: story.insights.length,
        confidenceScore: Math.round(story.diversityScore || 75),
      };
      setAnalysisStats(stats);

      // Store results for future visits
      const resultsToStore: StoredResults = {
        preferences: prefs,
        culturalProfile: profile,
        narrative: story,
        discoveries: recs,
        growthChallenges: challenges,
        timestamp: Date.now(),
        analysisStats: stats,
      };

      storeResults(resultsToStore);
      console.log("💾 Results saved for future visits");

      // Small delay to show 100% before transitioning
      await new Promise((resolve) => setTimeout(resolve, 800));
      setIsLoading(false);
    } catch (error) {
      console.error("Error analyzing cultural profile:", error);
      setLoadingStage("❌ Analysis failed. Retrying...");
      setIsLoading(false);
    }
  };

  // Storage management functions
  const storeResults = (results: StoredResults): void => {
    try {
      localStorage.setItem(RESULTS_STORAGE_KEY, JSON.stringify(results));
    } catch (error) {
      console.warn("Failed to store results:", error);
    }
  };

  const getStoredResults = (): StoredResults | null => {
    try {
      const stored = localStorage.getItem(RESULTS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn("Failed to load stored results:", error);
      return null;
    }
  };

  const isResultsExpired = (timestamp: number): boolean => {
    const expiry = RESULTS_EXPIRY_DAYS * 24 * 60 * 60 * 1000; // Convert to milliseconds
    return Date.now() - timestamp > expiry;
  };

  const clearStoredResults = (): void => {
    try {
      localStorage.removeItem(RESULTS_STORAGE_KEY);
      localStorage.removeItem("culturalPreferences");
      console.log("🗑️ Stored results cleared");
    } catch (error) {
      console.warn("Failed to clear stored results:", error);
    }
  };

  const handleStartFresh = () => {
    clearStoredResults();
    window.location.href = "/onboarding";
  };

  // Enhanced sharing functionality with image generation
  const generateShareableImage = async () => {
    if (!shareableRef.current || !narrative) return null;

    setIsGeneratingImage(true);

    try {
      // Create a shareable card element
      const shareCard = document.createElement("div");
      shareCard.style.width = "1200px";
      shareCard.style.height = "630px";
      shareCard.style.background =
        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
      shareCard.style.position = "fixed";
      shareCard.style.top = "-10000px";
      shareCard.style.left = "0";
      shareCard.style.padding = "60px";
      shareCard.style.fontFamily = "Inter, sans-serif";
      shareCard.style.color = "white";
      shareCard.style.display = "flex";
      shareCard.style.flexDirection = "column";
      shareCard.style.justifyContent = "space-between";

      shareCard.innerHTML = `
        <div style="display: flex; align-items: center; margin-bottom: 40px;">
          <div style="width: 80px; height: 80px; background: rgba(255,255,255,0.2); border-radius: 20px; display: flex; align-items: center; justify-content: center; margin-right: 30px; backdrop-filter: blur(10px);">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1L9 7V9C9 10.1 9.9 11 11 11V20C11 21.1 11.9 22 13 22H15C16.1 22 17 21.1 17 20V11C18.1 11 19 10.1 19 9Z"/>
            </svg>
          </div>
          <div>
            <h1 style="font-size: 36px; font-weight: bold; margin: 0; margin-bottom: 8px;">KulturalMente</h1>
            <p style="font-size: 18px; margin: 0; opacity: 0.8;">Cultural Intelligence Platform</p>
          </div>
        </div>

        <div style="flex: 1;">
          <div style="display: flex; align-items: center; margin-bottom: 30px;">
            <div style="width: 100px; height: 100px; background: linear-gradient(45deg, #FFD700, #FFA500); border-radius: 20px; display: flex; align-items: center; justify-content: center; margin-right: 30px; position: relative;">
              <svg width="50" height="50" viewBox="0 0 24 24" fill="white">
                <path d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5-1.5 1.5-5-5v-.79l-.27-.27A6.516 6.516 0 0 1 9.5 16 6.5 6.5 0 0 1 3 9.5 6.5 6.5 0 0 1 9.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14 14 12 14 9.5 12 5 9.5 5Z"/>
              </svg>
              <div style="position: absolute; top: -8px; right: -8px; background: #4CAF50; color: white; font-size: 16px; font-weight: bold; padding: 4px 8px; border-radius: 12px;">
                ${narrative.diversityScore || 75}
              </div>
            </div>
            <div>
              <h2 style="font-size: 48px; font-weight: bold; margin: 0; margin-bottom: 10px;">"${
                narrative.title
              }"</h2>
              <div style="display: flex; align-items: center; opacity: 0.9;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 8px;">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span style="font-size: 20px;">Cultural Diversity Score: ${
                  narrative.diversityScore || 75
                }/100</span>
              </div>
            </div>
          </div>

          <p style="font-size: 24px; line-height: 1.4; margin: 0; opacity: 0.95; max-width: 1000px;">
            ${narrative.culturalDNA}
          </p>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 40px;">
          <div style="display: flex; gap: 60px;">
            <div style="text-center;">
              <div style="font-size: 36px; font-weight: bold;">${
                Object.values(preferences).flat().length
              }</div>
              <div style="opacity: 0.7; font-size: 16px;">Cultural Markers</div>
            </div>
            <div style="text-center;">
              <div style="font-size: 36px; font-weight: bold;">${
                culturalProfile?.connections?.length || 0
              }</div>
              <div style="opacity: 0.7; font-size: 16px;">Deep Connections</div>
            </div>
            <div style="text-center;">
              <div style="font-size: 36px; font-weight: bold;">${
                narrative.diversityScore || 75
              }%</div>
              <div style="opacity: 0.7; font-size: 16px;">Diversity Score</div>
            </div>
          </div>
          <div style="text-align: right;">
            <p style="margin: 0; font-size: 18px; opacity: 0.8;">Discover your cultural identity at</p>
            <p style="margin: 0; font-size: 20px; font-weight: bold;">kulturalmemente.com</p>
          </div>
        </div>
      `;

      document.body.appendChild(shareCard);

      // Generate image using html2canvas
      const canvas = await html2canvas(shareCard, {
        width: 1200,
        height: 630,
        scale: 1,
        backgroundColor: null,
        useCORS: true,
        allowTaint: true,
      });

      // Clean up
      document.body.removeChild(shareCard);

      // Convert to blob and create URL
      const imageDataUrl = canvas.toDataURL("image/png", 1.0);
      setGeneratedImageUrl(imageDataUrl);
      setShowShareModal(true);

      return imageDataUrl;
    } catch (error) {
      console.error("Error generating shareable image:", error);
      alert("Failed to generate image. Please try again.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const downloadImage = () => {
    if (!generatedImageUrl) return;

    const link = document.createElement("a");
    link.download = `cultural-dna-${
      narrative?.title?.toLowerCase().replace(/\s+/g, "-") || "result"
    }.png`;
    link.href = generatedImageUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = async () => {
    if (!narrative) return;

    const shareText = `🧠 My Cultural DNA: ${narrative.title}\n\n${narrative.culturalDNA}\n\nDiscover yours at ${window.location.origin}`;

    try {
      await navigator.clipboard.writeText(shareText);
      alert("Text copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const shareResults = async () => {
    setIsGeneratingImage(true);

    if (navigator.share && narrative) {
      try {
        await navigator.share({
          title: `My Cultural DNA: ${narrative.title}`,
          text: narrative.culturalDNA,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Native share failed, showing custom modal:", error);
        await generateShareableImage();
      }
    } else {
      await generateShareableImage();
    }

    setIsGeneratingImage(false);
  };

  // Don't render until mounted to prevent hydration errors
  if (!isMounted) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
        {/* Enhanced loading animation */}
        <div className="absolute inset-0">
          {[...Array(150)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full blur-sm"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100, 0],
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
              }}
              transition={{
                duration: Math.random() * 4 + 2,
                repeat: Infinity,
                delay: Math.random() * 3,
              }}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center relative z-10"
        >
          <motion.div className="relative w-48 h-48 mx-auto mb-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full"
              style={{
                background: isNewAnalysis
                  ? "conic-gradient(from 0deg, #8B5CF6, #3B82F6, #10B981, #F59E0B, #EF4444, #8B5CF6)"
                  : "conic-gradient(from 0deg, #10B981, #3B82F6, #8B5CF6, #10B981)",
              }}
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute inset-4 rounded-full"
              style={{
                background: isNewAnalysis
                  ? "conic-gradient(from 180deg, #EC4899, #8B5CF6, #3B82F6, #EC4899)"
                  : "conic-gradient(from 180deg, #10B981, #3B82F6, #10B981)",
              }}
            />
            <div className="absolute inset-8 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 rounded-full flex items-center justify-center">
              <Brain className="w-20 h-20 text-white" />
            </div>
          </motion.div>

          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-5xl font-bold text-white mb-6"
          >
            {isNewAnalysis
              ? "Crafting Your Cultural Story..."
              : "Loading Your Cultural DNA..."}
          </motion.h2>

          {/* Enhanced Progress Bar with Percentage */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="w-96 mx-auto mb-8"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-blue-100 text-lg font-medium">
                {loadingProgress}% Complete
              </span>
              <span className="text-blue-200 text-sm">
                {isNewAnalysis ? "Analyzing..." : "Loading..."}
              </span>
            </div>

            <div className="h-4 bg-white/20 rounded-full overflow-hidden shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${loadingProgress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`h-full rounded-full relative ${
                  isNewAnalysis
                    ? "bg-gradient-to-r from-purple-400 via-blue-400 via-green-400 to-yellow-400"
                    : "bg-gradient-to-r from-green-400 to-blue-400"
                }`}
              >
                {/* Animated shimmer effect */}
                <motion.div
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Current Stage Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-center mb-8"
          >
            <motion.p
              key={loadingStage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-blue-100 text-xl font-medium"
            >
              {loadingStage}
            </motion.p>

            {!isNewAnalysis && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-blue-200 text-sm mt-2"
              >
                💡 Tip: Your results are saved locally for quick access
              </motion.p>
            )}
          </motion.div>

          {/* Detailed Progress Steps */}
          {isNewAnalysis && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="space-y-4 text-blue-100 max-w-md mx-auto"
            >
              {[
                { step: "Loading preferences", threshold: 10, icon: "📋" },
                { step: "Cross-domain analysis", threshold: 30, icon: "🔍" },
                { step: "Cultural insights", threshold: 60, icon: "🎨" },
                { step: "Personalized discoveries", threshold: 80, icon: "🎯" },
                { step: "Finalizing narrative", threshold: 95, icon: "✨" },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className={`flex items-center transition-all duration-500 ${
                    loadingProgress >= item.threshold
                      ? "text-white font-medium"
                      : loadingProgress >= item.threshold - 10
                      ? "text-blue-200"
                      : "text-blue-300/60"
                  }`}
                >
                  <span className="text-xl mr-3">{item.icon}</span>
                  <span className="flex-1">{item.step}</span>
                  {loadingProgress >= item.threshold && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-green-400 ml-2"
                    >
                      ✓
                    </motion.span>
                  )}
                  {loadingProgress >= item.threshold - 10 &&
                    loadingProgress < item.threshold && (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full ml-2"
                      />
                    )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    );
  }

  if (!narrative || !culturalProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Something went wrong
          </h2>
          <div className="space-y-4">
            <Link href="/onboarding">
              <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-all">
                Try Again
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const connectionData = culturalProfile.connections.map((conn) => ({
    name: `${conn.domain1} ↔ ${conn.domain2}`,
    value: Math.round(conn.strength * 100),
    strength: conn.strength,
  }));

  const themeData = culturalProfile.themes.map((theme, index) => ({
    name: theme,
    value: 100 - index * 15,
    color: ["#8B5CF6", "#3B82F6", "#10B981", "#F59E0B", "#EF4444"][index % 5],
  }));

  // New data for evolution tab
  const evolutionData =
    narrative.evolutionPredictions?.map((pred, index) => ({
      phase: `Phase ${index + 1}`,
      prediction: pred,
      timeframe: `${6 + index * 6} months`,
      likelihood: 90 - index * 10,
    })) || [];

  const diversityBreakdown = [
    { name: "Mainstream", value: 40, color: "#3B82F6" },
    { name: "Niche", value: 35, color: "#8B5CF6" },
    { name: "Experimental", value: 25, color: "#10B981" },
  ];

  const COLORS = ["#8B5CF6", "#3B82F6", "#10B981", "#F59E0B", "#EF4444"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 p-8 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">
                  Share Your Cultural DNA
                </h3>
                <p className="text-blue-100">
                  Choose how you'd like to share your results
                </p>
              </div>

              {generatedImageUrl && (
                <div className="mb-6">
                  <img
                    src={generatedImageUrl}
                    alt="Cultural DNA Share Card"
                    className="w-full rounded-xl border border-white/20"
                  />
                </div>
              )}

              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={copyToClipboard}
                  className="flex-1 flex items-center justify-center px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-colors font-medium"
                >
                  <Copy className="w-5 h-5 mr-3" />
                  Copy Text
                </motion.button>

                {generatedImageUrl && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={downloadImage}
                    className="flex-1 flex items-center justify-center px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl transition-colors font-medium"
                  >
                    <Download className="w-5 h-5 mr-3" />
                    Download Image
                  </motion.button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      {/* Enhanced Header */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-8 bg-black/10 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Link href="/" className="flex items-center group">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="bg-white/10 backdrop-blur-sm rounded-full p-3 border border-white/20 mr-4"
            >
              <Brain className="w-8 h-8 text-white" />
            </motion.div>
            <span className="text-3xl font-bold text-white group-hover:text-blue-200 transition-colors">
              KulturalMente
            </span>
          </Link>

          {/* Analysis Stats */}
          <div className="hidden md:flex items-center space-x-6 text-white/80">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              <span className="text-sm">
                {analysisStats.analysisTime}s analysis
              </span>
            </div>
            <div className="flex items-center">
              <Target className="w-4 h-4 mr-2" />
              <span className="text-sm">
                {analysisStats.connectionsFound} connections
              </span>
            </div>
            <div className="flex items-center">
              <BarChart3 className="w-4 h-4 mr-2" />
              <span className="text-sm">
                {analysisStats.confidenceScore}% confidence
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Start Fresh Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartFresh}
              className="flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all rounded-xl border border-white/20 text-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              New
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={shareResults}
              disabled={isGeneratingImage}
              className="flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all rounded-xl border border-white/20 disabled:opacity-50"
            >
              {isGeneratingImage ? (
                <Camera className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Share2 className="w-5 h-5 mr-2" />
              )}
              {isGeneratingImage ? "Creating..." : "Share"}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Enhanced Hero Section */}
      <section
        className="relative z-10 px-4 sm:px-6 lg:px-8 py-16"
        ref={shareableRef}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="flex items-center justify-center mb-8">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl p-4 mr-6 relative"
              >
                <Sparkles className="w-12 h-12 text-white" />
                {narrative.diversityScore && (
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {narrative.diversityScore}
                  </div>
                )}
              </motion.div>
              <div className="text-left">
                <h1 className="text-6xl font-bold text-white mb-2">
                  {narrative.title}
                </h1>
                <div className="flex items-center text-blue-200">
                  <Star className="w-5 h-5 mr-2" />
                  <span className="text-lg">
                    Cultural Diversity Score: {narrative.diversityScore || 75}
                    /100
                  </span>
                </div>
              </div>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-2xl text-blue-100 max-w-4xl mx-auto mb-12 font-light"
            >
              {narrative.culturalDNA}
            </motion.p>

            {/* Enhanced Tab Navigation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex justify-center mb-8"
            >
              <div className="flex flex-wrap justify-center gap-2 bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/20 max-w-5xl mx-auto">
                {[
                  { id: "story", label: "Your Story", icon: Heart },
                  { id: "connections", label: "Connections", icon: Globe },
                  { id: "discoveries", label: "Discoveries", icon: Compass },
                  { id: "evolution", label: "Evolution", icon: TrendingUp },
                  {
                    id: "visualization",
                    label: "Visualization",
                    icon: Sparkles,
                  },
                ].map((tab) => (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center px-4 py-3 rounded-xl font-semibold transition-all duration-300 min-w-0 ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/20"
                        : "text-white/80 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <tab.icon className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="text-sm font-medium whitespace-nowrap">
                      {tab.label}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 pb-32">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === "story" && (
              <motion.div
                key="story"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-12"
              >
                {/* Cultural Story */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white/10 backdrop-blur-sm rounded-3xl p-10 border border-white/20 hover:border-white/30 transition-all"
                >
                  <h2 className="text-3xl font-bold text-white mb-8 flex items-center">
                    <Heart className="w-8 h-8 text-red-400 mr-4" />
                    Your Cultural Story
                  </h2>
                  <div className="prose prose-lg max-w-none">
                    {narrative.story.split("\n\n").map((paragraph, index) => (
                      <motion.p
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className="mb-6 text-blue-100 leading-relaxed text-lg"
                      >
                        {paragraph}
                      </motion.p>
                    ))}
                  </div>
                </motion.div>

                {/* Insights & Themes */}
                <div className="space-y-8">
                  {/* Key Insights */}
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/10 backdrop-blur-sm rounded-3xl p-10 border border-white/20 hover:border-white/30 transition-all"
                  >
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                      <Zap className="w-6 h-6 text-yellow-400 mr-3" />
                      Key Insights
                    </h3>
                    <ul className="space-y-4">
                      {narrative.insights.map((insight, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + index * 0.1 }}
                          className="flex items-start group"
                        >
                          <Star className="w-6 h-6 text-purple-400 mr-4 mt-1 flex-shrink-0 group-hover:text-yellow-400 transition-colors" />
                          <span className="text-blue-100 text-lg leading-relaxed group-hover:text-white transition-colors">
                            {insight}
                          </span>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>

                  {/* Cultural Themes Visualization */}
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white/10 backdrop-blur-sm rounded-3xl p-10 border border-white/20 hover:border-white/30 transition-all"
                  >
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                      <Palette className="w-6 h-6 text-pink-400 mr-3" />
                      Your Cultural Themes
                    </h3>
                    {themeData.length > 0 && (
                      <>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={themeData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={120}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {themeData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={COLORS[index % COLORS.length]}
                                />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "rgba(255, 255, 255, 0.1)",
                                border: "1px solid rgba(255, 255, 255, 0.2)",
                                borderRadius: "12px",
                                backdropFilter: "blur(10px)",
                                color: "white",
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="mt-6 grid grid-cols-1 gap-3">
                          {culturalProfile.themes.map((theme, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.5 + index * 0.1 }}
                              className="flex items-center p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all"
                            >
                              <div
                                className="w-4 h-4 rounded-full mr-4 flex-shrink-0"
                                style={{
                                  backgroundColor:
                                    COLORS[index % COLORS.length],
                                }}
                              />
                              <span className="text-blue-100 font-medium">
                                {theme}
                              </span>
                            </motion.div>
                          ))}
                        </div>
                      </>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            )}

            {activeTab === "connections" && (
              <motion.div
                key="connections"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-12"
              >
                {/* Connection Strength Chart */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white/10 backdrop-blur-sm rounded-3xl p-10 border border-white/20"
                >
                  <h2 className="text-3xl font-bold text-white mb-8 flex items-center">
                    <Globe className="w-8 h-8 text-blue-400 mr-4" />
                    Cross-Domain Connections
                  </h2>
                  {connectionData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={connectionData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="rgba(255,255,255,0.1)"
                        />
                        <XAxis
                          dataKey="name"
                          angle={-45}
                          textAnchor="end"
                          height={120}
                          tick={{ fill: "white", fontSize: 12 }}
                        />
                        <YAxis tick={{ fill: "white" }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(255, 255, 255, 0.1)",
                            border: "1px solid rgba(255, 255, 255, 0.2)",
                            borderRadius: "12px",
                            backdropFilter: "blur(10px)",
                            color: "white",
                          }}
                        />
                        <Bar
                          dataKey="value"
                          fill="url(#connectionGradient)"
                          radius={[4, 4, 0, 0]}
                        />
                        <defs>
                          <linearGradient
                            id="connectionGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#8B5CF6"
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="95%"
                              stopColor="#3B82F6"
                              stopOpacity={0.2}
                            />
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center py-16 text-white/60">
                      <Map className="w-16 h-16 mx-auto mb-6 opacity-40" />
                      <p className="text-lg">
                        No strong cross-domain connections found yet.
                      </p>
                      <p className="text-sm mt-2">
                        Add more preferences to discover connections!
                      </p>
                    </div>
                  )}
                </motion.div>

                {/* Connection Details & Preferences */}
                <div className="space-y-8">
                  {/* Connection Details */}
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/10 backdrop-blur-sm rounded-3xl p-10 border border-white/20"
                  >
                    <div className="space-y-6">
                      {culturalProfile.connections.length > 0 ? (
                        culturalProfile.connections.map((connection, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 + index * 0.1 }}
                            className="border-l-4 border-gradient-to-b from-purple-400 to-blue-400 pl-6 py-4 bg-white/5 rounded-r-xl"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-bold text-white text-lg">
                                {connection.domain1} ↔ {connection.domain2}
                              </h4>
                              <div className="flex items-center">
                                <div className="w-24 bg-white/20 rounded-full h-2 mr-3">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{
                                      width: `${connection.strength * 100}%`,
                                    }}
                                    transition={{
                                      delay: 0.5 + index * 0.1,
                                      duration: 1,
                                    }}
                                    className="bg-gradient-to-r from-purple-400 to-blue-400 h-2 rounded-full"
                                  />
                                </div>
                                <span className="text-sm text-white/80 font-medium">
                                  {Math.round(connection.strength * 100)}%
                                </span>
                              </div>
                            </div>
                            <p className="text-blue-100 leading-relaxed">
                              {connection.explanation}
                            </p>
                          </motion.div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-white/60">
                          <p>
                            Add more preferences to discover connections between
                            your interests.
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {/* Cultural Diversity Breakdown */}
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white/10 backdrop-blur-sm rounded-3xl p-10 border border-white/20"
                  >
                    <h4 className="text-2xl font-bold text-white mb-6 flex items-center">
                      <BarChart3 className="w-6 h-6 text-green-400 mr-3" />
                      Cultural Diversity Profile
                    </h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={diversityBreakdown}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {diversityBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(255, 255, 255, 0.1)",
                            border: "1px solid rgba(255, 255, 255, 0.2)",
                            borderRadius: "12px",
                            backdropFilter: "blur(10px)",
                            color: "white",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      {diversityBreakdown.map((item, index) => (
                        <div key={index} className="text-center">
                          <div className="flex items-center justify-center mb-2">
                            <div
                              className="w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-white text-sm font-medium">
                              {item.name}
                            </span>
                          </div>
                          <div className="text-2xl font-bold text-white">
                            {item.value}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {activeTab === "discoveries" && (
              <motion.div
                key="discoveries"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-12"
              >
                {/* AI Recommendations */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white/10 backdrop-blur-sm rounded-3xl p-10 border border-white/20"
                >
                  <h2 className="text-3xl font-bold text-white mb-8 flex items-center">
                    <Compass className="w-8 h-8 text-green-400 mr-4" />
                    Personalized Discoveries
                  </h2>
                  <div className="space-y-6">
                    {discoveries.length > 0 ? (
                      discoveries.map((discovery, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                          className="group p-6 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-2xl border border-green-400/20 hover:border-green-400/40 transition-all hover:bg-gradient-to-r hover:from-green-500/20 hover:to-blue-500/20"
                        >
                          <div className="flex items-start">
                            <motion.div
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-400 rounded-xl flex items-center justify-center text-white font-bold text-lg mr-4 mt-1 flex-shrink-0"
                            >
                              {index + 1}
                            </motion.div>
                            <p className="text-blue-100 leading-relaxed text-lg group-hover:text-white transition-colors">
                              {discovery}
                            </p>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-16 text-white/60">
                        <Compass className="w-16 h-16 mx-auto mb-6 opacity-40" />
                        <p className="text-lg">No discoveries generated yet.</p>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Cultural Blind Spots */}
                <div className="space-y-8">
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/10 backdrop-blur-sm rounded-3xl p-10 border border-white/20"
                  >
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                      <Eye className="w-6 h-6 text-orange-400 mr-3" />
                      Cultural Blind Spots
                    </h3>
                    <div className="space-y-4">
                      {narrative.culturalBlindSpots?.length ? (
                        narrative.culturalBlindSpots.map((blindSpot, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 + index * 0.1 }}
                            className="flex items-center p-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl border border-orange-400/20 hover:border-orange-400/40 transition-all group"
                          >
                            <Eye className="w-5 h-5 text-orange-400 mr-4 flex-shrink-0 group-hover:text-yellow-400 transition-colors" />
                            <span className="text-blue-100 group-hover:text-white transition-colors">
                              {blindSpot}
                            </span>
                          </motion.div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-white/60">
                          <p>You have a well-rounded cultural profile!</p>
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {/* Next Recommendations */}
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white/10 backdrop-blur-sm rounded-3xl p-10 border border-white/20"
                  >
                    <h3 className="text-2xl font-bold text-white mb-6">
                      Continue Your Journey
                    </h3>
                    <div className="space-y-4">
                      {narrative.recommendations.map((rec, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + index * 0.1 }}
                          className="flex items-start p-4 border border-white/20 rounded-xl hover:border-white/40 bg-white/5 hover:bg-white/10 transition-all group"
                        >
                          <motion.div
                            whileHover={{ rotate: 180 }}
                            transition={{ duration: 0.3 }}
                            className="text-blue-400 mr-4 mt-1 group-hover:text-white transition-colors"
                          >
                            <ArrowLeft className="w-5 h-5 transform rotate-180" />
                          </motion.div>
                          <span className="text-blue-100 group-hover:text-white transition-colors leading-relaxed">
                            {rec}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {activeTab === "evolution" && (
              <motion.div
                key="evolution"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-12"
              >
                {/* Evolution Timeline */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white/10 backdrop-blur-sm rounded-3xl p-10 border border-white/20"
                >
                  <h2 className="text-3xl font-bold text-white mb-8 flex items-center">
                    <TrendingUp className="w-8 h-8 text-purple-400 mr-4" />
                    Cultural Evolution Predictions
                  </h2>

                  {evolutionData.length > 0 ? (
                    <div className="space-y-6">
                      {evolutionData.map((evolution, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + index * 0.1 }}
                          className="relative"
                        >
                          <div className="flex items-start">
                            <div className="flex-shrink-0 w-24 text-right mr-6">
                              <div className="text-purple-400 font-bold text-sm">
                                {evolution.timeframe}
                              </div>
                              <div className="text-white/60 text-xs">
                                {evolution.likelihood}% likely
                              </div>
                            </div>
                            <div className="flex-shrink-0 w-6 flex justify-center">
                              <div className="w-3 h-3 bg-purple-400 rounded-full relative">
                                {index < evolutionData.length - 1 && (
                                  <div className="absolute top-3 left-1/2 w-0.5 h-16 bg-purple-400/30 transform -translate-x-1/2" />
                                )}
                              </div>
                            </div>
                            <div className="flex-1 ml-6">
                              <div className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all">
                                <p className="text-blue-100 leading-relaxed">
                                  {evolution.prediction}
                                </p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 text-white/60">
                      <TrendingUp className="w-16 h-16 mx-auto mb-6 opacity-40" />
                      <p className="text-lg">
                        Evolution predictions not available.
                      </p>
                    </div>
                  )}
                </motion.div>

                {/* Future Recommendations & Challenges */}
                <div className="space-y-8">
                  {/* Cultural Growth Challenges - NOW DYNAMIC */}
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/10 backdrop-blur-sm rounded-3xl p-10 border border-white/20"
                  >
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                      <Target className="w-6 h-6 text-green-400 mr-3" />
                      Cultural Growth Challenges
                    </h3>
                    <div className="space-y-4">
                      {growthChallenges.length > 0 ? (
                        growthChallenges.map((challenge, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 + index * 0.1 }}
                            className="flex items-center p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-xl border border-green-400/20 hover:border-green-400/40 transition-all group cursor-pointer"
                          >
                            <div className="w-8 h-8 bg-green-400 rounded-lg flex items-center justify-center text-white font-bold text-sm mr-4 flex-shrink-0 group-hover:bg-green-300 transition-colors">
                              {index + 1}
                            </div>
                            <span className="text-blue-100 group-hover:text-white transition-colors">
                              {challenge}
                            </span>
                          </motion.div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-white/60">
                          <Target className="w-16 h-16 mx-auto mb-6 opacity-40" />
                          <p className="text-lg">
                            Loading personalized growth challenges...
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {/* Action Buttons */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-sm rounded-3xl p-10 text-white border border-white/20"
                  >
                    <h3 className="text-2xl font-bold mb-4">
                      Ready for Your Cultural Evolution?
                    </h3>
                    <p className="mb-8 opacity-90 text-lg">
                      Your cultural journey is just beginning. Refine your
                      profile, explore new domains, or challenge yourself with
                      our growth recommendations.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Link href="/onboarding">
                        <motion.button
                          whileHover={{
                            scale: 1.05,
                            boxShadow: "0 10px 30px rgba(255, 255, 255, 0.2)",
                          }}
                          whileTap={{ scale: 0.95 }}
                          className="w-full sm:w-auto bg-white text-purple-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all"
                        >
                          Refine Your Profile
                        </motion.button>
                      </Link>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={shareResults}
                        className="w-full sm:w-auto border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all"
                      >
                        Share Your Evolution
                      </motion.button>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {activeTab === "visualization" && (
              <motion.div
                key="visualization"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6 }}
              >
                <CulturalWowFactor
                  culturalProfile={culturalProfile}
                  narrative={narrative}
                  preferences={preferences}
                  discoveries={discoveries}
                  evolutionPredictions={narrative.evolutionPredictions}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Floating Action Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 200 }}
        className="fixed bottom-8 right-8 z-20"
      >
        <Link href="/onboarding">
          <motion.button
            whileHover={{
              scale: 1.1,
              boxShadow: "0 10px 30px rgba(139, 92, 246, 0.4)",
            }}
            whileTap={{ scale: 0.9 }}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-full shadow-lg"
          >
            <Plus className="w-6 h-6" />
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
}
