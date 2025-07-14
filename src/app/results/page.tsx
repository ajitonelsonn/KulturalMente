"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Sparkles,
  Heart,
  Compass,
  Share2,
  Download,
  Star,
  Zap,
  Map as MapIcon,
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
  BookOpen,
  ChevronRight,
  Award,
  Lightbulb,
  Bookmark,
  ExternalLink,
  Users,
  Activity,
  ChevronDown,
  ChevronUp,
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Minimize2,
  CheckCircle,
  Calendar,
  Rocket,
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
  LineChart,
  Line,
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

interface StorySection {
  id: number;
  title: string;
  content: string;
  readingTime: number;
  isHighlight: boolean;
}

interface InsightItem {
  id: string;
  content: string;
  confidence: number;
  isRevealed: boolean;
  timestamp: number;
}

interface ConnectionDetails {
  id: string;
  domain1: string;
  domain2: string;
  strength: number;
  explanation: string;
  entities: string[];
  isHovered: boolean;
}

interface DiscoveryAction {
  id: string;
  isSaved: boolean;
  isCompleted: boolean;
  note: string;
  confidence: number;
}

const RESULTS_STORAGE_KEY = "kulturalmemente_results";
const RESULTS_EXPIRY_DAYS = 7;

export default function ResultsPage() {
  // Core state
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
  const [isMounted, setIsMounted] = useState(false);
  const [analysisStats, setAnalysisStats] = useState({
    analysisTime: 0,
    connectionsFound: 0,
    insightsGenerated: 0,
    confidenceScore: 0,
  });

  // Enhanced UX state
  const [activeTab, setActiveTab] = useState<
    "story" | "connections" | "discoveries" | "evolution" | "visualization"
  >("story");
  const [visibleInsights, setVisibleInsights] = useState(1);
  const [readingProgress, setReadingProgress] = useState(0);
  const [expandedStorySection, setExpandedStorySection] = useState<
    number | null
  >(null);
  const [hoveredConnection, setHoveredConnection] = useState<string | null>(
    null
  );
  const [savedDiscoveries, setSavedDiscoveries] = useState<Set<number>>(
    new Set()
  );
  const [isAutoRevealActive, setIsAutoRevealActive] = useState(true);
  const [showAllInsights, setShowAllInsights] = useState(false);
  const [connectionTooltip, setConnectionTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    content: string;
  }>({ visible: false, x: 0, y: 0, content: "" });

  const [techBadgeExpanded, setTechBadgeExpanded] = useState(false);

  // Story enhancement state
  const [currentStoryHighlight, setCurrentStoryHighlight] =
    useState<string>("");
  const [storyReadingMode, setStoryReadingMode] = useState<
    "sections" | "continuous"
  >("sections");
  const [storyProgress, setStoryProgress] = useState(0);

  // Sharing state
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(
    null
  );
  const shareableRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);

  // Enhanced insights state
  const [insightRevealTimer, setInsightRevealTimer] =
    useState<NodeJS.Timeout | null>(null);
  const [insightAnimations, setInsightAnimations] = useState<
    Map<number, boolean>
  >(new Map());

  useEffect(() => {
    setIsMounted(true);
    loadResults();
  }, []);

  // Progressive insight revelation with enhanced timing
  useEffect(() => {
    if (
      narrative &&
      narrative.insights.length > 0 &&
      activeTab === "story" &&
      isAutoRevealActive
    ) {
      const timer = setInterval(() => {
        setVisibleInsights((prev) => {
          if (prev < narrative.insights.length) {
            // Trigger animation for the new insight
            setInsightAnimations(
              (prevAnimations) => new Map(prevAnimations.set(prev, true))
            );
            return prev + 1;
          }
          return prev;
        });
      }, 2500); // Slightly longer delay for better UX

      setInsightRevealTimer(timer);
      return () => {
        clearInterval(timer);
        setInsightRevealTimer(null);
      };
    }
  }, [narrative, activeTab, isAutoRevealActive]);

  // Enhanced reading progress tracker
  useEffect(() => {
    const handleScroll = () => {
      if (activeTab === "story" && storyRef.current) {
        const element = storyRef.current;
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const elementHeight = element.offsetHeight;

        // Calculate reading progress based on story section
        const scrolled = Math.max(0, -rect.top);
        const maxScroll = Math.max(1, elementHeight - windowHeight);
        const progress = Math.min(100, (scrolled / maxScroll) * 100);

        setReadingProgress(progress);
        setStoryProgress(progress);

        // Auto-expand sections based on scroll position
        if (storyReadingMode === "continuous" && progress > 20) {
          setExpandedStorySection(null); // Show all sections
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeTab, storyReadingMode]);

  // Enhanced tab switching with animation
  const switchTab = (newTab: typeof activeTab) => {
    setActiveTab(newTab);

    // Reset story-specific state when leaving story tab
    if (newTab !== "story") {
      setExpandedStorySection(null);
      setCurrentStoryHighlight("");
    }

    // Reset insights state when entering story tab
    if (newTab === "story" && !showAllInsights) {
      setVisibleInsights(1);
      setInsightAnimations(new Map());
    }
  };

  const loadResults = async () => {
    try {
      const storedResults = getStoredResults();

      if (storedResults && !isResultsExpired(storedResults.timestamp)) {
        console.log("📋 Loading existing results from storage");
        setLoadingStage("Loading your saved cultural DNA...");
        setLoadingProgress(50);

        await new Promise((resolve) => setTimeout(resolve, 800));

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

      const storedPrefs = localStorage.getItem("culturalPreferences");
      if (!storedPrefs) {
        console.log("🔄 No preferences found, redirecting to onboarding");
        window.location.href = "/onboarding";
        return;
      }

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
      setLoadingStage("Loading your cultural preferences...");
      setLoadingProgress(10);
      await new Promise((resolve) => setTimeout(resolve, 500));

      setLoadingStage("🔍 Analyzing cross-domain connections...");
      setLoadingProgress(30);
      const profile = await qlooService.analyzeCrossDomainConnections(prefs);
      setCulturalProfile(profile);

      setLoadingStage("🎨 Generating cultural insights...");
      setLoadingProgress(60);
      const story = await openaiService.generateCulturalNarrative(
        prefs,
        profile
      );
      setNarrative(story);

      setLoadingStage("🎯 Creating personalized discoveries...");
      setLoadingProgress(80);
      const recs = await openaiService.generateDiscoveryRecommendations(
        story,
        prefs,
        profile
      );
      setDiscoveries(recs);

      setLoadingStage("✨ Crafting your unique narrative...");
      setLoadingProgress(95);
      const challenges = await openaiService.generateCulturalGrowthChallenges(
        prefs,
        profile,
        story
      );
      setGrowthChallenges(challenges);

      setLoadingStage("🎉 Finalizing your cultural DNA...");
      setLoadingProgress(100);

      const endTime = Date.now();
      const stats = {
        analysisTime: Math.round((endTime - startTime) / 1000),
        connectionsFound: profile.connections.length,
        insightsGenerated: story.insights.length,
        confidenceScore: Math.round(story.diversityScore || 75),
      };
      setAnalysisStats(stats);

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
    const expiry = RESULTS_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    return Date.now() - timestamp > expiry;
  };

  const clearStoredResults = (): void => {
    try {
      localStorage.removeItem(RESULTS_STORAGE_KEY);
      localStorage.removeItem("culturalPreferences");
    } catch (error) {
      console.warn("Failed to clear stored results:", error);
    }
  };

  const handleStartFresh = () => {
    clearStoredResults();
    window.location.href = "/onboarding";
  };

  // Enhanced story section utilities
  const getStorySections = (): StorySection[] => {
    if (!narrative?.story) return [];

    const paragraphs = narrative.story.split("\n\n").filter((p) => p.trim());
    return paragraphs.map((paragraph, index) => ({
      id: index,
      content: paragraph.trim(),
      title:
        index === 0
          ? "Your Cultural Foundation"
          : index === 1
          ? "Cultural Expression & Style"
          : index === 2
          ? "Current Cultural Essence"
          : index === 3
          ? "Cultural Journey & Growth"
          : `Chapter ${index + 1}`,
      readingTime: Math.ceil(paragraph.split(" ").length / 200), // ~200 words per minute
      isHighlight: index === 0 || paragraph.includes(narrative.title),
    }));
  };

  // Enhanced discovery actions
  const toggleSaveDiscovery = (index: number) => {
    setSavedDiscoveries((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  // Enhanced connection hover handlers
  const handleConnectionHover = (
    connectionId: string,
    event: React.MouseEvent
  ) => {
    const connection = culturalProfile?.connections.find(
      (c) => `${c.domain1}-${c.domain2}` === connectionId
    );

    if (connection) {
      setHoveredConnection(connectionId);
      setConnectionTooltip({
        visible: true,
        x: event.clientX,
        y: event.clientY,
        content: connection.explanation,
      });
    }
  };

  const handleConnectionLeave = () => {
    setHoveredConnection(null);
    setConnectionTooltip({ visible: false, x: 0, y: 0, content: "" });
  };

  // Insight control functions
  const toggleAutoReveal = () => {
    setIsAutoRevealActive(!isAutoRevealActive);
    if (insightRevealTimer) {
      clearInterval(insightRevealTimer);
      setInsightRevealTimer(null);
    }
  };

  const revealAllInsights = () => {
    if (narrative) {
      setVisibleInsights(narrative.insights.length);
      setShowAllInsights(true);
      setIsAutoRevealActive(false);
      if (insightRevealTimer) {
        clearInterval(insightRevealTimer);
        setInsightRevealTimer(null);
      }
    }
  };

  const resetInsightReveal = () => {
    setVisibleInsights(1);
    setShowAllInsights(false);
    setIsAutoRevealActive(true);
    setInsightAnimations(new Map());
  };

  if (!isMounted) {
    return null;
  }
  // Enhanced loading state with better progress tracking and animations
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
        {/* Enhanced floating particles */}
        <div className="absolute inset-0">
          {[...Array(200)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
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
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center relative z-10 max-w-2xl mx-auto px-4"
        >
          {/* Enhanced loading spinner */}
          <motion.div className="relative w-48 h-48 mx-auto mb-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full"
              style={{
                background: isNewAnalysis
                  ? "conic-gradient(from 0deg, #8B5CF6, #3B82F6, #10B981, #F59E0B, #EF4444, #8B5CF6)"
                  : "conic-gradient(from 0deg, #10B981, #3B82F6, #8B5CF6, #10B981)",
                maskImage:
                  "radial-gradient(circle, transparent 60%, black 70%)",
                WebkitMaskImage:
                  "radial-gradient(circle, transparent 60%, black 70%)",
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
                maskImage:
                  "radial-gradient(circle, transparent 50%, black 60%)",
                WebkitMaskImage:
                  "radial-gradient(circle, transparent 50%, black 60%)",
              }}
            />
            <div className="absolute inset-8 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 rounded-full flex items-center justify-center">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Brain className="w-20 h-20 text-white" />
              </motion.div>
            </div>

            {/* Progress indicator around the spinner */}
            <svg
              className="absolute inset-0 w-full h-full transform -rotate-90"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="2"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="url(#progressGradient)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="283"
                initial={{ strokeDashoffset: 283 }}
                animate={{
                  strokeDashoffset: 283 - (283 * loadingProgress) / 100,
                }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
              <defs>
                <linearGradient
                  id="progressGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="50%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#10B981" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>

          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-5xl font-bold text-white mb-6"
          >
            {isNewAnalysis
              ? "🎨 Crafting Your Cultural Story..."
              : "📖 Loading Your Cultural DNA..."}
          </motion.h2>

          {/* Enhanced Progress Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="w-full max-w-md mx-auto mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-blue-100 text-xl font-medium">
                {loadingProgress}% Complete
              </span>
              <div className="flex items-center text-blue-200">
                <Clock className="w-5 h-5 mr-2" />
                <span className="text-sm">
                  {isNewAnalysis ? "Analyzing..." : "Loading..."}
                </span>
              </div>
            </div>

            <div className="h-4 bg-white/20 rounded-full overflow-hidden shadow-inner relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${loadingProgress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`h-full rounded-full relative overflow-hidden ${
                  isNewAnalysis
                    ? "bg-gradient-to-r from-purple-400 via-blue-400 via-green-400 to-yellow-400"
                    : "bg-gradient-to-r from-green-400 to-blue-400"
                }`}
              >
                {/* Shimmer effect */}
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

              {/* Progress markers */}
              <div className="absolute inset-0 flex justify-between items-center px-2">
                {[25, 50, 75].map((marker) => (
                  <div
                    key={marker}
                    className={`w-1 h-1 rounded-full transition-colors duration-500 ${
                      loadingProgress >= marker ? "bg-white" : "bg-white/30"
                    }`}
                  />
                ))}
              </div>
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
              className="text-blue-100 text-xl font-medium mb-4"
            >
              {loadingStage}
            </motion.p>

            {!isNewAnalysis && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="flex items-center justify-center text-blue-200 text-sm"
              >
                <Lightbulb className="w-4 h-4 mr-2 animate-pulse" />
                <span>
                  💡 Tip: Your results are saved locally for quick access
                </span>
              </motion.div>
            )}
          </motion.div>

          {/* Detailed Progress Steps for New Analysis */}
          {isNewAnalysis && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="space-y-4 text-blue-100 max-w-lg mx-auto"
            >
              {[
                {
                  step: "Loading cultural preferences",
                  threshold: 10,
                  icon: "📋",
                  description: "Processing your taste profile",
                },
                {
                  step: "Cross-domain analysis",
                  threshold: 30,
                  icon: "🔍",
                  description: "Finding hidden connections",
                },
                {
                  step: "Cultural insights generation",
                  threshold: 60,
                  icon: "🎨",
                  description: "Creating your narrative",
                },
                {
                  step: "Personalized discoveries",
                  threshold: 80,
                  icon: "🎯",
                  description: "Curating recommendations",
                },
                {
                  step: "Finalizing cultural DNA",
                  threshold: 95,
                  icon: "✨",
                  description: "Polishing your profile",
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 + index * 0.1 }}
                  className={`flex items-center p-4 rounded-xl transition-all duration-500 ${
                    loadingProgress >= item.threshold
                      ? "bg-white/10 border border-white/20 text-white"
                      : loadingProgress >= item.threshold - 10
                      ? "bg-white/5 border border-white/10 text-blue-200"
                      : "bg-transparent border border-transparent text-blue-300/60"
                  }`}
                >
                  <span className="text-2xl mr-4">{item.icon}</span>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{item.step}</div>
                    <div className="text-sm opacity-80">{item.description}</div>
                  </div>
                  <div className="ml-4">
                    {loadingProgress >= item.threshold && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-green-400"
                      >
                        ✓
                      </motion.div>
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
                          className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full"
                        />
                      )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Loading animation for saved results */}
          {!isNewAnalysis && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="flex items-center justify-center space-x-2 text-blue-100"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-2 h-2 bg-blue-400 rounded-full"
              />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                className="w-2 h-2 bg-purple-400 rounded-full"
              />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                className="w-2 h-2 bg-green-400 rounded-full"
              />
            </motion.div>
          )}
        </motion.div>
      </div>
    );
  }

  // Enhanced error state
  if (!narrative || !culturalProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md mx-auto px-4"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-24 h-24 mx-auto mb-8 bg-red-500/20 rounded-full flex items-center justify-center"
          >
            <Brain className="w-12 h-12 text-red-400" />
          </motion.div>

          <h2 className="text-3xl font-bold text-white mb-6">
            Oops! Something went wrong
          </h2>

          <p className="text-blue-100 mb-8 leading-relaxed">
            We couldn't load your cultural analysis. This might be due to a
            temporary issue or missing data. Let's try starting fresh with a new
            analysis.
          </p>

          <div className="space-y-4">
            <Link href="/onboarding">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-all flex items-center justify-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Start New Analysis
              </motion.button>
            </Link>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.reload()}
              className="w-full border-2 border-white/30 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all flex items-center justify-center"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Try Again
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Enhanced sharing functionality
  const generateShareableImage = async () => {
    if (!shareableRef.current || !narrative) return null;

    setIsGeneratingImage(true);

    try {
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
            <p style="margin: 0; font-size: 20px; font-weight: bold;">kulturalmemente.space</p>
          </div>
        </div>
      `;

      document.body.appendChild(shareCard);

      const canvas = await html2canvas(shareCard, {
        width: 1200,
        height: 630,
        scale: 1,
        backgroundColor: null,
        useCORS: true,
        allowTaint: true,
      });

      document.body.removeChild(shareCard);

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
  // Prepare enhanced data for visualizations
  const connectionData = culturalProfile.connections.map((conn, index) => ({
    id: `${conn.domain1}-${conn.domain2}`,
    name: `${conn.domain1} ↔ ${conn.domain2}`,
    value: Math.round(conn.strength * 100),
    strength: conn.strength,
    explanation: conn.explanation,
    entities: conn.qlooEntities || [],
    color: ["#8B5CF6", "#3B82F6", "#10B981", "#F59E0B", "#EF4444"][index % 5],
  }));

  const themeData = culturalProfile.themes.map((theme, index) => ({
    name: theme,
    value: 100 - index * 12,
    color: ["#8B5CF6", "#3B82F6", "#10B981", "#F59E0B", "#EF4444"][index % 5],
    description: `Cultural theme representing ${theme.toLowerCase()}`,
  }));

  const evolutionData =
    narrative.evolutionPredictions?.map((pred, index) => ({
      phase: `Phase ${index + 1}`,
      prediction: pred,
      timeframe: `${6 + index * 6} months`,
      likelihood: 90 - index * 10,
      color: ["#8B5CF6", "#3B82F6", "#10B981", "#F59E0B"][index % 4],
    })) || [];

  const diversityBreakdown = [
    {
      name: "Mainstream",
      value: 40,
      color: "#3B82F6",
      description: "Well-known cultural elements",
    },
    {
      name: "Niche",
      value: 35,
      color: "#8B5CF6",
      description: "Specialized interests",
    },
    {
      name: "Experimental",
      value: 25,
      color: "#10B981",
      description: "Cutting-edge preferences",
    },
  ];

  const COLORS = ["#8B5CF6", "#3B82F6", "#10B981", "#F59E0B", "#EF4444"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Enhanced Reading Progress Bar */}
      <AnimatePresence>
        {activeTab === "story" && readingProgress > 5 && (
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            exit={{ opacity: 0, scaleX: 0 }}
            className="fixed top-0 left-0 right-0 z-50"
          >
            <div
              className="h-1 bg-gradient-to-r from-purple-400 via-blue-400 to-green-400 transform origin-left transition-all duration-300"
              style={{ width: `${readingProgress}%` }}
            />
            <div className="absolute top-1 right-4 bg-black/80 text-white text-xs px-2 py-1 rounded-b-lg backdrop-blur-sm">
              {Math.round(readingProgress)}% read
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Share Modal */}
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
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              className="bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 p-8 max-w-lg w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-8">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-16 h-16 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <Share2 className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Share Your Cultural DNA
                </h3>
                <p className="text-blue-100">
                  Show the world your unique cultural identity
                </p>
              </div>

              {generatedImageUrl && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mb-6"
                >
                  <img
                    src={generatedImageUrl}
                    alt="Cultural DNA Share Card"
                    className="w-full rounded-xl border border-white/20 shadow-lg"
                  />
                </motion.div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={copyToClipboard}
                  className="flex items-center justify-center px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-colors font-medium"
                >
                  <Copy className="w-5 h-5 mr-3" />
                  Copy Text
                </motion.button>

                {generatedImageUrl && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={downloadImage}
                    className="flex items-center justify-center px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl transition-colors font-medium"
                  >
                    <Download className="w-5 h-5 mr-3" />
                    Download
                  </motion.button>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowShareModal(false)}
                className="w-full mt-4 px-6 py-3 border border-white/30 text-white rounded-xl font-medium hover:bg-white/10 transition-all"
              >
                Close
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connection Tooltip */}
      <AnimatePresence>
        {connectionTooltip.visible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed z-50 bg-black/90 backdrop-blur-sm text-white p-4 rounded-xl border border-white/20 max-w-xs pointer-events-none"
            style={{
              left: connectionTooltip.x + 10,
              top: connectionTooltip.y - 50,
            }}
          >
            <p className="text-sm leading-relaxed">
              {connectionTooltip.content}
            </p>
            <div className="absolute -bottom-2 left-4 w-4 h-4 bg-black/90 rotate-45 border-r border-b border-white/20" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Floating orbs */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-32 h-32 rounded-full bg-gradient-to-r from-purple-400/10 to-blue-400/10 blur-xl"
            style={{
              left: `${20 + i * 15}%`,
              top: `${10 + Math.sin(i) * 20}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 6 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
          />
        ))}
      </div>

      {/* Enhanced Header */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-8 bg-black/10 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Link href="/" className="flex items-center group">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="bg-white/10 backdrop-blur-sm rounded-full p-3 border border-white/20 mr-4 group-hover:border-white/40 transition-all"
            >
              <Brain className="w-8 h-8 text-white" />
            </motion.div>
            <div className="text-left">
              <span className="text-3xl font-bold text-white group-hover:text-blue-200 transition-colors">
                KulturalMente
              </span>
              <div className="text-sm text-white/60 hidden sm:block">
                Cultural Intelligence Platform
              </div>
            </div>
          </Link>

          {/* Enhanced Analysis Stats */}
          <div className="hidden md:flex items-center space-x-4">
            {[
              {
                icon: Clock,
                label: `${analysisStats.analysisTime}s analysis`,
                color: "from-blue-500 to-cyan-500",
              },
              {
                icon: Target,
                label: `${analysisStats.connectionsFound} connections`,
                color: "from-green-500 to-emerald-500",
              },
              {
                icon: BarChart3,
                label: `${analysisStats.confidenceScore}% confidence`,
                color: "from-purple-500 to-violet-500",
              },
            ].map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05, y: -2 }}
                className={`flex items-center bg-gradient-to-r ${stat.color} bg-opacity-20 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20`}
              >
                <stat.icon className="w-4 h-4 mr-2 text-white" />
                <span className="text-sm font-medium text-white">
                  {stat.label}
                </span>
              </motion.div>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartFresh}
              className="flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all rounded-xl border border-white/20 text-sm font-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              New
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={shareResults}
              disabled={isGeneratingImage}
              className="flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all rounded-xl border border-white/20 disabled:opacity-50 font-medium"
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
                animate={{
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 1],
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl p-6 mr-6 relative shadow-2xl"
              >
                <Sparkles className="w-16 h-16 text-white" />
                {narrative.diversityScore && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                    className="absolute -top-3 -right-3 bg-green-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg"
                  >
                    {narrative.diversityScore}
                  </motion.div>
                )}

                {/* Floating particles around the icon */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-white rounded-full opacity-60"
                    style={{
                      left: `${20 + Math.cos((i * 60 * Math.PI) / 180) * 40}px`,
                      top: `${20 + Math.sin((i * 60 * Math.PI) / 180) * 40}px`,
                    }}
                    animate={{
                      scale: [0, 1, 0],
                      opacity: [0, 0.8, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.3,
                    }}
                  />
                ))}
              </motion.div>

              <div className="text-left">
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-6xl font-bold text-white mb-3 leading-tight"
                >
                  {narrative.title}
                </motion.h1>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center text-blue-200"
                >
                  <Star className="w-6 h-6 mr-3 text-yellow-400" />
                  <span className="text-xl font-medium">
                    Cultural Diversity Score: {narrative.diversityScore || 75}
                    /100
                  </span>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-center text-white/60 mt-2"
                >
                  <Users className="w-4 h-4 mr-2" />
                  <span className="text-sm">
                    Based on {Object.values(preferences).flat().length} cultural
                    preferences
                  </span>
                </motion.div>
              </div>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-2xl text-blue-100 max-w-4xl mx-auto mb-12 font-light leading-relaxed"
            >
              {narrative.culturalDNA}
            </motion.p>

            {/* Enhanced Tab Navigation with Improved UX */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="flex justify-center mb-8"
            >
              <div className="flex flex-wrap justify-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 max-w-6xl mx-auto shadow-2xl">
                {[
                  {
                    id: "story",
                    label: "Your Story",
                    icon: Heart,
                    color: "from-red-500 to-pink-500",
                    badge: getStorySections().length,
                  },
                  {
                    id: "connections",
                    label: "Connections",
                    icon: Globe,
                    color: "from-blue-500 to-cyan-500",
                    badge: culturalProfile.connections.length,
                  },
                  {
                    id: "discoveries",
                    label: "Discoveries",
                    icon: Compass,
                    color: "from-green-500 to-emerald-500",
                    badge: discoveries.length,
                  },
                  {
                    id: "evolution",
                    label: "Evolution",
                    icon: TrendingUp,
                    color: "from-purple-500 to-violet-500",
                    badge: evolutionData.length || growthChallenges.length,
                  },
                  {
                    id: "visualization",
                    label: "Visualization",
                    icon: Sparkles,
                    color: "from-yellow-500 to-orange-500",
                    badge: "3D",
                  },
                ].map((tab) => (
                  <motion.button
                    key={tab.id}
                    onClick={() => switchTab(tab.id as any)}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative flex items-center px-6 py-4 rounded-xl font-semibold transition-all duration-300 min-w-0 overflow-hidden group ${
                      activeTab === tab.id
                        ? `bg-gradient-to-r ${tab.color} text-white shadow-xl shadow-black/20`
                        : "text-white/80 hover:text-white hover:bg-white/10 border border-white/20"
                    }`}
                  >
                    <tab.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                    <span className="text-sm font-medium whitespace-nowrap mr-2">
                      {tab.label}
                    </span>

                    {/* Tab badge */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`flex items-center justify-center min-w-[20px] h-5 px-2 rounded-full text-xs font-bold ${
                        activeTab === tab.id
                          ? "bg-white/20 text-white"
                          : "bg-white/10 text-white/60"
                      }`}
                    >
                      {tab.badge}
                    </motion.div>

                    {/* Active tab indicator */}
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeTabIndicator"
                        className="absolute inset-0 bg-white/10 rounded-xl"
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                        }}
                      />
                    )}

                    {/* Hover effect */}
                    <motion.div
                      className="absolute inset-0 bg-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                      initial={false}
                    />
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Tab content preview/summary */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="text-center text-white/60 text-sm"
            >
              {activeTab === "story" &&
                `${getStorySections().length} chapters • ${Math.ceil(
                  narrative.story.split(" ").length / 200
                )} min read`}
              {activeTab === "connections" &&
                `${culturalProfile.connections.length} cultural connections discovered`}
              {activeTab === "discoveries" &&
                `${discoveries.length} personalized recommendations • ${savedDiscoveries.size} saved`}
              {activeTab === "evolution" &&
                `${evolutionData.length} predictions • ${growthChallenges.length} growth challenges`}
              {activeTab === "visualization" &&
                "Interactive 3D cultural DNA exploration"}
            </motion.div>
          </motion.div>
        </div>
      </section>
      {/* Enhanced Content Sections */}
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
                {/* Enhanced Cultural Story with Advanced Features */}
                <motion.div
                  ref={storyRef}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white/10 backdrop-blur-sm rounded-3xl p-10 border border-white/20 hover:border-white/30 transition-all"
                >
                  {/* Story Header with Controls */}
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold text-white flex items-center">
                      <Heart className="w-8 h-8 text-red-400 mr-4" />
                      Your Cultural Story
                    </h2>
                    <div className="flex items-center space-x-3">
                      <div className="text-sm text-white/60 bg-white/10 px-3 py-1 rounded-full flex items-center">
                        <BookOpen className="w-4 h-4 mr-2" />
                        {Math.ceil(narrative.story.length / 200)} min read
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() =>
                          setStoryReadingMode(
                            storyReadingMode === "sections"
                              ? "continuous"
                              : "sections"
                          )
                        }
                        className="text-sm text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition-all flex items-center"
                      >
                        {storyReadingMode === "sections" ? (
                          <>
                            <Maximize2 className="w-4 h-4 mr-1" />
                            Continuous
                          </>
                        ) : (
                          <>
                            <Minimize2 className="w-4 h-4 mr-1" />
                            Sections
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>

                  {/* Reading Progress Indicator */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-white/60">
                        Reading Progress
                      </span>
                      <span className="text-sm text-white/80">
                        {Math.round(storyProgress)}%
                      </span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${storyProgress}%` }}
                        className="bg-gradient-to-r from-red-400 to-pink-400 h-2 rounded-full transition-all duration-300"
                      />
                    </div>
                  </div>

                  {/* Enhanced Story Sections */}
                  <div className="space-y-8">
                    {getStorySections().map((section, index) => (
                      <motion.div
                        key={section.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className="group"
                      >
                        {storyReadingMode === "sections" && (
                          <motion.button
                            onClick={() =>
                              setExpandedStorySection(
                                expandedStorySection === section.id
                                  ? null
                                  : section.id
                              )
                            }
                            whileHover={{ scale: 1.02 }}
                            className="w-full text-left mb-4"
                          >
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all group-hover:border-white/20">
                              <div className="flex items-center">
                                <motion.div
                                  whileHover={{ scale: 1.1 }}
                                  className="w-10 h-10 bg-gradient-to-r from-red-400 to-pink-400 rounded-lg flex items-center justify-center text-white font-bold text-sm mr-4"
                                >
                                  {index + 1}
                                </motion.div>
                                <div>
                                  <h3 className="text-xl font-semibold text-white">
                                    {section.title}
                                  </h3>
                                  <div className="flex items-center text-white/60 text-sm mt-1">
                                    <Clock className="w-3 h-3 mr-1" />
                                    <span>{section.readingTime} min read</span>
                                    {section.isHighlight && (
                                      <>
                                        <span className="mx-2">•</span>
                                        <Star className="w-3 h-3 mr-1 text-yellow-400" />
                                        <span className="text-yellow-400">
                                          Highlight
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <motion.div
                                animate={{
                                  rotate:
                                    expandedStorySection === section.id
                                      ? 90
                                      : 0,
                                }}
                                transition={{ duration: 0.3 }}
                              >
                                <ChevronRight className="w-5 h-5 text-white/60" />
                              </motion.div>
                            </div>
                          </motion.button>
                        )}

                        <AnimatePresence>
                          {(expandedStorySection === section.id ||
                            storyReadingMode === "continuous" ||
                            expandedStorySection === null) && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.4, ease: "easeInOut" }}
                              className="overflow-hidden"
                            >
                              <div
                                className={`${
                                  storyReadingMode === "sections"
                                    ? "pl-6 border-l-2 border-gradient-to-b from-red-400 to-pink-400"
                                    : ""
                                }`}
                              >
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: 0.2 }}
                                  className={`${
                                    section.isHighlight
                                      ? "bg-gradient-to-r from-yellow-400/10 to-orange-400/10 p-6 rounded-xl border border-yellow-400/20"
                                      : ""
                                  }`}
                                >
                                  <p className="text-blue-100 leading-relaxed text-lg">
                                    {section.content}
                                  </p>
                                  {section.isHighlight && (
                                    <div className="mt-4 flex items-center text-yellow-400 text-sm">
                                      <Star className="w-4 h-4 mr-2" />
                                      <span>Key cultural insight</span>
                                    </div>
                                  )}
                                </motion.div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </div>

                  {/* Story Statistics */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-8 p-6 bg-white/5 rounded-xl border border-white/10"
                  >
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2 text-blue-400" />
                      Story Analytics
                    </h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-white">
                          {narrative.story.split(" ").length}
                        </div>
                        <div className="text-xs text-white/60">Words</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-white">
                          {getStorySections().length}
                        </div>
                        <div className="text-xs text-white/60">Chapters</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-white">
                          {narrative.insights.length}
                        </div>
                        <div className="text-xs text-white/60">Insights</div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Enhanced Insights with Progressive Reveal */}
                <div className="space-y-8">
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/10 backdrop-blur-sm rounded-3xl p-10 border border-white/20 hover:border-white/30 transition-all"
                  >
                    {/* Insights Header with Controls */}
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold text-white flex items-center">
                        <Zap className="w-6 h-6 text-yellow-400 mr-3" />
                        Key Insights
                      </h3>
                      <div className="flex items-center space-x-3">
                        <div className="text-sm text-white/60 bg-white/10 px-3 py-1 rounded-full">
                          {visibleInsights}/{narrative.insights.length} revealed
                        </div>
                        <div className="flex items-center space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={toggleAutoReveal}
                            className={`p-2 rounded-lg transition-colors ${
                              isAutoRevealActive
                                ? "bg-green-500/20 text-green-400"
                                : "bg-white/10 text-white/60"
                            }`}
                            title={
                              isAutoRevealActive
                                ? "Pause auto-reveal"
                                : "Resume auto-reveal"
                            }
                          >
                            {isAutoRevealActive ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={revealAllInsights}
                            className="p-2 rounded-lg bg-white/10 text-white/60 hover:text-white transition-colors"
                            title="Reveal all insights"
                          >
                            <Maximize2 className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={resetInsightReveal}
                            className="p-2 rounded-lg bg-white/10 text-white/60 hover:text-white transition-colors"
                            title="Reset insights"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </div>
                    </div>

                    {/* Progressive Insights Display */}
                    <div className="space-y-4">
                      {narrative.insights
                        .slice(0, visibleInsights)
                        .map((insight, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: 20, scale: 0.9 }}
                            animate={{
                              opacity: 1,
                              x: 0,
                              scale: 1,
                            }}
                            transition={{
                              delay: index * 0.2,
                              type: "spring",
                              stiffness: 200,
                              damping: 20,
                            }}
                            className="group relative"
                          >
                            <motion.div
                              whileHover={{ scale: 1.02, x: 5 }}
                              className="flex items-start p-6 hover:bg-white/5 rounded-xl transition-all cursor-pointer border border-transparent hover:border-white/10"
                            >
                              <motion.div
                                whileHover={{ rotate: 180, scale: 1.2 }}
                                transition={{ duration: 0.3 }}
                                className="flex-shrink-0 mt-1 mr-4"
                              >
                                <Star className="w-6 h-6 text-purple-400 group-hover:text-yellow-400 transition-colors" />
                              </motion.div>

                              <div className="flex-1">
                                <span className="text-blue-100 text-lg leading-relaxed group-hover:text-white transition-colors block">
                                  {insight}
                                </span>

                                {/* Insight metadata */}
                                <div className="flex items-center mt-3 space-x-4 text-xs text-white/60">
                                  <div className="flex items-center">
                                    <Brain className="w-3 h-3 mr-1" />
                                    <span>AI Generated</span>
                                  </div>
                                  <div className="flex items-center">
                                    <Target className="w-3 h-3 mr-1" />
                                    <span>
                                      {85 + Math.round(Math.random() * 15)}%
                                      confidence
                                    </span>
                                  </div>
                                  <div className="flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    <span>Insight #{index + 1}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Insight animation indicator */}
                              {insightAnimations.get(index) && (
                                <motion.div
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  transition={{ duration: 0.5 }}
                                  className="absolute top-2 right-2 w-3 h-3 bg-green-400 rounded-full"
                                />
                              )}
                            </motion.div>

                            {/* Insight progress bar */}
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: "100%" }}
                              transition={{
                                delay: 0.5 + index * 0.2,
                                duration: 0.8,
                              }}
                              className="h-0.5 bg-gradient-to-r from-purple-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                            />
                          </motion.div>
                        ))}
                    </div>

                    {/* Next Insight Preview */}
                    {visibleInsights < narrative.insights.length &&
                      !showAllInsights && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-center mt-6 p-4 border border-white/10 rounded-xl bg-white/5"
                        >
                          <div className="flex items-center justify-center text-white/60 mb-2">
                            <Lightbulb className="w-4 h-4 mr-2 animate-pulse" />
                            <span className="text-sm">
                              {isAutoRevealActive
                                ? "Next insight revealing soon..."
                                : "Click play to continue revealing insights"}
                            </span>
                          </div>
                          <div className="text-xs text-white/40">
                            {narrative.insights.length - visibleInsights} more
                            insights waiting
                          </div>
                        </motion.div>
                      )}

                    {/* Insights Complete */}
                    {visibleInsights >= narrative.insights.length && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center mt-6 p-4 border border-green-400/20 rounded-xl bg-green-500/10"
                      >
                        <div className="flex items-center justify-center text-green-400 mb-2">
                          <Award className="w-5 h-5 mr-2" />
                          <span className="font-medium">
                            All insights revealed!
                          </span>
                        </div>
                        <div className="text-sm text-green-300/80">
                          You've discovered all {narrative.insights.length}{" "}
                          cultural insights
                        </div>
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Enhanced Cultural Themes */}
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white/10 backdrop-blur-sm rounded-3xl p-10 border border-white/20 hover:border-white/30 transition-all"
                  >
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                      <Palette className="w-6 h-6 text-pink-400 mr-3" />
                      Cultural Themes
                      <div className="ml-auto text-sm text-white/60 bg-white/10 px-3 py-1 rounded-full">
                        {culturalProfile.themes.length} themes
                      </div>
                    </h3>

                    {themeData.length > 0 && (
                      <>
                        <ResponsiveContainer width="100%" height={400}>
                          <BarChart
                            data={connectionData}
                            margin={{
                              bottom: 60,
                              left: 20,
                              right: 20,
                              top: 20,
                            }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="rgba(255,255,255,0.1)"
                            />
                            <XAxis
                              dataKey="name"
                              angle={-35}
                              textAnchor="end"
                              height={60}
                              tick={{
                                fill: "white",
                                fontSize: 11,
                                textAnchor: "end",
                              }}
                              interval={0}
                              tickFormatter={(value) => {
                                // Improved formatting for connection names
                                const parts = value.split(" ↔ ");
                                if (parts.length === 2) {
                                  // Capitalize first letter and shorten
                                  const domain1 =
                                    parts[0].charAt(0).toUpperCase() +
                                    parts[0].slice(1);
                                  const domain2 =
                                    parts[1].charAt(0).toUpperCase() +
                                    parts[1].slice(1);

                                  // Smart truncation
                                  const maxLength = 8;
                                  const truncated1 =
                                    domain1.length > maxLength
                                      ? domain1.substring(0, maxLength) + "..."
                                      : domain1;
                                  const truncated2 =
                                    domain2.length > maxLength
                                      ? domain2.substring(0, maxLength) + "..."
                                      : domain2;

                                  return `${truncated1} ↔ ${truncated2}`;
                                }
                                return value.length > 20
                                  ? value.substring(0, 20) + "..."
                                  : value;
                              }}
                            />
                            <YAxis
                              tick={{ fill: "white", fontSize: 12 }}
                              domain={[0, 100]}
                              label={{
                                value: "Connection Strength (%)",
                                angle: -90,
                                position: "insideLeft",
                                style: {
                                  textAnchor: "middle",
                                  fill: "white",
                                  fontSize: 12,
                                },
                              }}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "rgba(0, 0, 0, 0.95)",
                                border: "1px solid rgba(255, 255, 255, 0.2)",
                                borderRadius: "12px",
                                backdropFilter: "blur(10px)",
                                color: "white",
                                maxWidth: "300px",
                              }}
                              formatter={(value, name, props) => [
                                `${value}% connection strength`,
                                "Cultural Similarity",
                              ]}
                              labelFormatter={(label) => {
                                const connection = connectionData.find(
                                  (c) => c.name === label
                                );
                                return (
                                  <div>
                                    <div className="font-bold mb-2 text-lg">
                                      {label}
                                    </div>
                                    {connection?.explanation && (
                                      <div className="text-sm text-gray-300 leading-relaxed">
                                        {connection.explanation.length > 150
                                          ? connection.explanation.substring(
                                              0,
                                              150
                                            ) + "..."
                                          : connection.explanation}
                                      </div>
                                    )}
                                    <div className="text-xs text-gray-400 mt-2">
                                      {connection?.entities?.length || 0} shared
                                      cultural elements
                                    </div>
                                  </div>
                                );
                              }}
                            />
                            <Bar
                              dataKey="value"
                              radius={[6, 6, 0, 0]}
                              onMouseEnter={(data, index) => {
                                const connection = connectionData[index];
                                setHoveredConnection(connection.id);
                              }}
                              onMouseLeave={() => setHoveredConnection(null)}
                            >
                              {connectionData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={entry.color}
                                  stroke={
                                    hoveredConnection === entry.id
                                      ? "rgba(255,255,255,0.8)"
                                      : "transparent"
                                  }
                                  strokeWidth={
                                    hoveredConnection === entry.id ? 2 : 0
                                  }
                                  style={{
                                    filter:
                                      hoveredConnection === entry.id
                                        ? "brightness(1.2) drop-shadow(0 0 8px currentColor)"
                                        : "none",
                                    transition: "all 0.3s ease",
                                  }}
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>

                        <div className="mt-6 space-y-3">
                          {culturalProfile.themes.map((theme, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.5 + index * 0.1 }}
                              whileHover={{ scale: 1.02, x: 10 }}
                              className="flex items-center p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all cursor-pointer group"
                            >
                              <motion.div
                                whileHover={{ scale: 1.2, rotate: 360 }}
                                transition={{ duration: 0.5 }}
                                className="w-5 h-5 rounded-full mr-4 flex-shrink-0 shadow-lg"
                                style={{
                                  backgroundColor:
                                    COLORS[index % COLORS.length],
                                }}
                              />
                              <div className="flex-1">
                                <span className="text-blue-100 font-medium group-hover:text-white transition-colors">
                                  {theme}
                                </span>
                                <div className="text-xs text-white/60 mt-1">
                                  {themeData[index]?.description ||
                                    "Cultural theme"}
                                </div>
                              </div>
                              <div className="text-white/40 group-hover:text-white/60 transition-colors">
                                <ChevronRight className="w-4 h-4" />
                              </div>
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
                {/* Enhanced Connection Visualization */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white/10 backdrop-blur-sm rounded-3xl p-10 border border-white/20"
                >
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold text-white flex items-center">
                      <Globe className="w-8 h-8 text-blue-400 mr-4" />
                      Cross-Domain Connections
                    </h2>
                    <div className="text-sm text-white/60 bg-white/10 px-3 py-1 rounded-full">
                      {connectionData.length} found
                    </div>
                  </div>

                  {connectionData.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={450}>
                        <BarChart
                          data={connectionData}
                          margin={{ bottom: 80, left: 20, right: 20, top: 20 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="rgba(255,255,255,0.1)"
                          />
                          <XAxis
                            dataKey="name"
                            angle={-45}
                            textAnchor="end"
                            height={80}
                            tick={{
                              fill: "white",
                              fontSize: 10,
                              textAnchor: "end",
                            }}
                            interval={0}
                            tickFormatter={(value) => {
                              // Shorten long connection names
                              if (value.length > 15) {
                                const parts = value.split(" ↔ ");
                                return `${parts[0].substring(
                                  0,
                                  6
                                )}...↔${parts[1].substring(0, 6)}...`;
                              }
                              return value;
                            }}
                          />
                          <YAxis
                            tick={{ fill: "white", fontSize: 12 }}
                            domain={[0, 100]}
                            label={{
                              value: "Connection Strength (%)",
                              angle: -90,
                              position: "insideLeft",
                              style: { textAnchor: "middle", fill: "white" },
                            }}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "rgba(0, 0, 0, 0.1)",
                              border: "1px solid rgba(255, 255, 255, 0.2)",
                              borderRadius: "12px",
                              backdropFilter: "blur(10px)",
                              color: "white",
                            }}
                            formatter={(value, name, props) => [
                              `${value}% strength`,
                              "Connection Strength",
                            ]}
                            labelFormatter={(label) => (
                              <div className="font-bold">{label}</div>
                            )}
                          />
                          <Bar
                            dataKey="value"
                            radius={[8, 8, 0, 0]}
                            onMouseEnter={(data, index) => {
                              const connection = connectionData[index];
                              setHoveredConnection(connection.id);
                            }}
                            onMouseLeave={() => setHoveredConnection(null)}
                          >
                            {connectionData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={entry.color}
                                stroke={
                                  hoveredConnection === entry.id
                                    ? "rgba(255,255,255,0.6)"
                                    : "transparent"
                                }
                                strokeWidth={
                                  hoveredConnection === entry.id ? 3 : 0
                                }
                                style={{
                                  filter:
                                    hoveredConnection === entry.id
                                      ? "brightness(1.3) drop-shadow(0 0 10px currentColor)"
                                      : "none",
                                  transition: "all 0.3s ease",
                                }}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>

                      {/* Connection Insights Summary */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="mt-8 p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-400/20"
                      >
                        <div className="flex items-start">
                          <Brain className="w-6 h-6 text-blue-400 mr-4 mt-1 flex-shrink-0" />
                          <div>
                            <h4 className="text-white font-medium mb-3">
                              Connection Analysis
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-blue-300">
                                  {connectionData.length}
                                </div>
                                <div className="text-xs text-white/60">
                                  Total Links
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-green-300">
                                  {Math.round(
                                    connectionData.reduce(
                                      (sum, c) => sum + c.value,
                                      0
                                    ) / connectionData.length
                                  )}
                                  %
                                </div>
                                <div className="text-xs text-white/60">
                                  Avg Strength
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-purple-300">
                                  {Math.max(
                                    ...connectionData.map((c) => c.value)
                                  )}
                                  %
                                </div>
                                <div className="text-xs text-white/60">
                                  Strongest
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-yellow-300">
                                  {
                                    connectionData.filter(
                                      (c) => c.entities && c.entities.length > 0
                                    ).length
                                  }
                                </div>
                                <div className="text-xs text-white/60">
                                  With Entities
                                </div>
                              </div>
                            </div>
                            <p className="text-blue-100 text-sm leading-relaxed">
                              Your cultural profile shows{" "}
                              <strong>
                                {connectionData.length} cross-domain connections
                              </strong>{" "}
                              with an average strength of{" "}
                              <strong>
                                {Math.round(
                                  connectionData.reduce(
                                    (sum, c) => sum + c.value,
                                    0
                                  ) / connectionData.length
                                )}
                                %
                              </strong>
                              . The strongest connection is at{" "}
                              <strong>
                                {Math.max(
                                  ...connectionData.map((c) => c.value)
                                )}
                                %
                              </strong>
                              , indicating deep cultural interconnections across
                              your preferences.
                            </p>
                          </div>
                        </div>
                      </motion.div>

                      {/* Top Connections Highlight */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="mt-6"
                      >
                        <h4 className="text-white font-medium mb-4 flex items-center">
                          <Star className="w-5 h-5 text-yellow-400 mr-2" />
                          Strongest Connections
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {connectionData
                            .sort((a, b) => b.value - a.value)
                            .slice(0, 4)
                            .map((connection, index) => (
                              <motion.div
                                key={connection.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 1.1 + index * 0.1 }}
                                whileHover={{ scale: 1.02 }}
                                className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all"
                                onMouseEnter={() =>
                                  setHoveredConnection(connection.id)
                                }
                                onMouseLeave={() => setHoveredConnection(null)}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="text-white font-medium text-sm">
                                    {connection.name}
                                  </div>
                                  <div className="flex items-center">
                                    <div
                                      className="w-3 h-3 rounded-full mr-2"
                                      style={{
                                        backgroundColor: connection.color,
                                      }}
                                    ></div>
                                    <span className="text-white text-sm font-bold">
                                      {connection.value}%
                                    </span>
                                  </div>
                                </div>
                                <div className="w-full bg-white/20 rounded-full h-1.5">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${connection.value}%` }}
                                    transition={{
                                      delay: 1.2 + index * 0.1,
                                      duration: 0.8,
                                    }}
                                    className="h-1.5 rounded-full"
                                    style={{
                                      backgroundColor: connection.color,
                                    }}
                                  />
                                </div>
                                <div className="text-xs text-white/60 mt-2">
                                  {connection.entities?.length || 0} cultural
                                  entities
                                </div>
                              </motion.div>
                            ))}
                        </div>
                      </motion.div>
                    </>
                  ) : (
                    <div className="text-center py-16 text-white/60">
                      <MapIcon className="w-16 h-16 mx-auto mb-6 opacity-40" />
                      <p className="text-lg">
                        No strong cross-domain connections found yet.
                      </p>
                      <p className="text-sm mt-2">
                        Add more preferences to discover connections!
                      </p>
                    </div>
                  )}
                </motion.div>

                {/* Enhanced Connection Details */}
                <div className="space-y-8">
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/10 backdrop-blur-sm rounded-3xl p-10 border border-white/20"
                  >
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                      <Activity className="w-6 h-6 text-green-400 mr-3" />
                      Connection Details
                    </h3>

                    <div className="space-y-6 max-h-96 overflow-y-auto">
                      {culturalProfile.connections.length > 0 ? (
                        culturalProfile.connections.map((connection, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 + index * 0.1 }}
                            whileHover={{ scale: 1.02, x: 5 }}
                            className={`p-6 rounded-xl border-l-4 transition-all cursor-pointer group ${
                              hoveredConnection ===
                              `${connection.domain1}-${connection.domain2}`
                                ? "border-yellow-400 bg-white/10 shadow-lg"
                                : "border-purple-400 bg-white/5 hover:bg-white/10"
                            }`}
                            onMouseEnter={(e) =>
                              handleConnectionHover(
                                `${connection.domain1}-${connection.domain2}`,
                                e
                              )
                            }
                            onMouseLeave={handleConnectionLeave}
                          >
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-bold text-white text-lg flex items-center">
                                <div className="w-4 h-4 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full mr-3" />
                                {connection.domain1} ↔ {connection.domain2}
                              </h4>
                              <div className="flex items-center">
                                <div className="w-24 bg-white/20 rounded-full h-2 mr-3 overflow-hidden">
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
                                <div className="text-center">
                                  <div className="text-lg font-bold text-white">
                                    {Math.round(connection.strength * 100)}%
                                  </div>
                                  <div className="text-xs text-white/60">
                                    strength
                                  </div>
                                </div>
                              </div>
                            </div>

                            <p className="text-blue-100 leading-relaxed group-hover:text-white transition-colors mb-4">
                              {connection.explanation}
                            </p>

                            <div className="flex items-center justify-between text-sm text-white/60">
                              <div className="flex items-center">
                                <Users className="w-4 h-4 mr-2" />
                                <span>
                                  {connection.qlooEntities?.length || 0}{" "}
                                  cultural entities
                                </span>
                              </div>
                              <div className="flex items-center">
                                <Target className="w-4 h-4 mr-2" />
                                <span>
                                  {connection.strength > 0.8
                                    ? "Strong"
                                    : connection.strength > 0.5
                                    ? "Moderate"
                                    : "Emerging"}{" "}
                                  connection
                                </span>
                              </div>
                            </div>

                            {/* Connection insight badge */}
                            <div className="mt-4 inline-flex items-center px-3 py-1 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full border border-purple-400/30">
                              <Brain className="w-3 h-3 mr-2 text-purple-300" />
                              <span className="text-xs text-purple-200">
                                AI-Discovered Pattern
                              </span>
                            </div>
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

                  {/* Enhanced Cultural Diversity Breakdown */}
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

                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie
                          data={diversityBreakdown}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={100}
                          paddingAngle={8}
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
                          formatter={(value, name, props) => [
                            `${value}%`,
                            props.payload.description,
                          ]}
                        />
                      </PieChart>
                    </ResponsiveContainer>

                    <div className="grid grid-cols-3 gap-4 mt-6">
                      {diversityBreakdown.map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.5 + index * 0.1 }}
                          whileHover={{ scale: 1.05 }}
                          className="text-center p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all"
                        >
                          <div className="flex items-center justify-center mb-2">
                            <div
                              className="w-4 h-4 rounded-full mr-2"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-white text-sm font-medium">
                              {item.name}
                            </span>
                          </div>
                          <div className="text-2xl font-bold text-white">
                            {item.value}%
                          </div>
                          <div className="text-xs text-white/60 mt-1">
                            {item.description}
                          </div>
                        </motion.div>
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
                {/* Enhanced AI Recommendations */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white/10 backdrop-blur-sm rounded-3xl p-10 border border-white/20"
                >
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold text-white flex items-center">
                      <Compass className="w-8 h-8 text-green-400 mr-4" />
                      Personalized Discoveries
                    </h2>
                    <div className="flex items-center space-x-3">
                      <div className="text-sm text-white/60 bg-white/10 px-3 py-1 rounded-full">
                        {discoveries.length} curated
                      </div>
                      {savedDiscoveries.size > 0 && (
                        <div className="text-sm text-yellow-400 bg-yellow-400/20 px-3 py-1 rounded-full border border-yellow-400/30">
                          {savedDiscoveries.size} saved
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-6 ">
                    {discoveries.length > 0 ? (
                      discoveries.map((discovery, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                          whileHover={{ scale: 1.02, x: 5 }}
                          className="group p-6 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-2xl border border-green-400/20 hover:border-green-400/40 transition-all hover:bg-gradient-to-r hover:from-green-500/20 hover:to-blue-500/20"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start flex-1">
                              <motion.div
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-400 rounded-xl flex items-center justify-center text-white font-bold text-lg mr-4 mt-1 flex-shrink-0"
                              >
                                {index + 1}
                              </motion.div>
                              <div className="flex-1">
                                <p className="text-blue-100 leading-relaxed text-lg group-hover:text-white transition-colors">
                                  {discovery}
                                </p>

                                {/* Discovery metadata */}
                                <div className="mt-4 flex items-center justify-between">
                                  <div className="flex items-center text-sm text-white/60">
                                    <Brain className="w-4 h-4 mr-2" />
                                    <span>AI Recommendation</span>
                                  </div>
                                  <div className="flex items-center">
                                    <div className="w-20 bg-white/20 rounded-full h-1.5 mr-2">
                                      <div
                                        className="bg-gradient-to-r from-green-400 to-blue-400 h-1.5 rounded-full"
                                        style={{
                                          width: `${85 + Math.random() * 15}%`,
                                        }}
                                      />
                                    </div>
                                    <span className="text-xs text-white/60">
                                      High Match
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Enhanced Action Buttons */}
                            <div className="flex items-center space-x-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => toggleSaveDiscovery(index)}
                                className={`p-3 rounded-lg transition-colors ${
                                  savedDiscoveries.has(index)
                                    ? "bg-yellow-500/20 text-yellow-400 border border-yellow-400/30"
                                    : "bg-white/10 text-white/60 hover:text-white border border-white/20 hover:border-white/40"
                                }`}
                                title={
                                  savedDiscoveries.has(index)
                                    ? "Remove from saved"
                                    : "Save for later"
                                }
                              >
                                <Bookmark className="w-4 h-4" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="p-3 rounded-lg bg-white/10 text-white/60 hover:text-white transition-colors border border-white/20 hover:border-white/40"
                                title="Learn more"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="p-3 rounded-lg bg-white/10 text-white/60 hover:text-white transition-colors border border-white/20 hover:border-white/40"
                                title="Share discovery"
                              >
                                <Share2 className="w-4 h-4" />
                              </motion.button>
                            </div>
                          </div>

                          {/* Discovery tags */}
                          <div className="mt-4 flex flex-wrap gap-2">
                            <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full border border-green-400/30">
                              Personalized
                            </span>
                            <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-400/30">
                              Cultural Match
                            </span>
                            {savedDiscoveries.has(index) && (
                              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded-full border border-yellow-400/30">
                                Saved
                              </span>
                            )}
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

                  {/* Saved Discoveries Summary */}
                  {savedDiscoveries.size > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 p-4 bg-yellow-500/10 rounded-xl border border-yellow-400/20"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-yellow-400">
                          <Bookmark className="w-5 h-5 mr-2" />
                          <span className="font-medium">
                            {savedDiscoveries.size} discoveries saved for later
                          </span>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-4 py-2 bg-yellow-400/20 hover:bg-yellow-400/30 text-yellow-300 rounded-lg transition-colors border border-yellow-400/30 text-sm font-medium"
                        >
                          <BookOpen className="w-4 h-4 mr-2 inline" />
                          View Saved
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
                {/* Enhanced Blind Spots & Recommendations */}
                <div className="space-y-8">
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/10 backdrop-blur-sm rounded-3xl p-10 border border-white/20"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold text-white flex items-center">
                        <Eye className="w-6 h-6 text-orange-400 mr-3" />
                        Cultural Blind Spots
                      </h3>
                      <div className="text-sm text-white/60 bg-white/10 px-3 py-1 rounded-full">
                        Growth opportunities
                      </div>
                    </div>

                    <div className="space-y-4">
                      {narrative.culturalBlindSpots?.length ? (
                        narrative.culturalBlindSpots.map((blindSpot, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 + index * 0.1 }}
                            whileHover={{ scale: 1.02, x: 5 }}
                            className="flex items-start p-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl border border-orange-400/20 hover:border-orange-400/40 transition-all group cursor-pointer"
                          >
                            <motion.div
                              whileHover={{ scale: 1.2, rotate: 15 }}
                              className="flex-shrink-0 mr-4 mt-1"
                            >
                              <Eye className="w-5 h-5 text-orange-400 group-hover:text-yellow-400 transition-colors" />
                            </motion.div>
                            <div className="flex-1">
                              <span className="text-blue-100 group-hover:text-white transition-colors leading-relaxed">
                                {blindSpot}
                              </span>
                              <div className="mt-2 flex items-center text-xs text-white/60">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                <span>Expansion opportunity</span>
                              </div>
                            </div>
                            <motion.div
                              initial={{ opacity: 0 }}
                              whileHover={{ opacity: 1 }}
                              className="text-white/40 ml-4"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </motion.div>
                          </motion.div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-white/60">
                          <Award className="w-12 h-12 mx-auto mb-4 text-green-400" />
                          <p className="text-lg text-green-400 font-medium">
                            Excellent Cultural Coverage!
                          </p>
                          <p className="text-sm mt-2">
                            You have a well-rounded cultural profile with no
                            major blind spots.
                          </p>
                          <div className="mt-4 inline-flex items-center px-4 py-2 bg-green-500/20 rounded-lg border border-green-400/30">
                            <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                            <span className="text-green-300 text-sm font-medium">
                              Comprehensive Profile
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Blind Spot Insights */}
                    {narrative.culturalBlindSpots?.length ||
                      (0 > 0 && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.8 }}
                          className="mt-6 p-4 bg-orange-500/10 rounded-xl border border-orange-400/20"
                        >
                          <div className="flex items-start">
                            <Lightbulb className="w-5 h-5 text-orange-400 mr-3 mt-0.5 flex-shrink-0" />
                            <div>
                              <h4 className="text-white font-medium mb-2">
                                Growth Insight
                              </h4>
                              <p className="text-orange-100 text-sm leading-relaxed">
                                These areas represent exciting opportunities to
                                expand your cultural horizons. Consider
                                exploring one new domain each month to develop a
                                more diverse cultural palette.
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                  </motion.div>

                  {/* Enhanced Next Steps */}
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white/10 backdrop-blur-sm rounded-3xl p-10 border border-white/20"
                  >
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                      <Target className="w-6 h-6 text-blue-400 mr-3" />
                      Continue Your Journey
                      <div className="ml-auto text-sm text-white/60 bg-white/10 px-3 py-1 rounded-full">
                        {narrative.recommendations.length} suggestions
                      </div>
                    </h3>

                    <div className="space-y-4">
                      {narrative.recommendations.map((rec, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + index * 0.1 }}
                          whileHover={{ scale: 1.02, x: 5 }}
                          className="flex items-start p-4 border border-white/20 rounded-xl hover:border-white/40 bg-white/5 hover:bg-white/10 transition-all group cursor-pointer"
                        >
                          <motion.div
                            whileHover={{ rotate: 180 }}
                            transition={{ duration: 0.3 }}
                            className="text-blue-400 mr-4 mt-1 group-hover:text-white transition-colors flex-shrink-0"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </motion.div>
                          <div className="flex-1">
                            <span className="text-blue-100 group-hover:text-white transition-colors leading-relaxed">
                              {rec}
                            </span>
                            <div className="mt-2 flex items-center text-xs text-white/60">
                              <Compass className="w-3 h-3 mr-1" />
                              <span>Recommended next step</span>
                            </div>
                          </div>
                          <motion.div
                            initial={{ opacity: 0 }}
                            whileHover={{ opacity: 1 }}
                            className="text-white/40 ml-4 flex items-center space-x-2"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </motion.div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Action CTA */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1 }}
                      className="mt-8 p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-400/20"
                    >
                      <div className="text-center">
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-4"
                        >
                          <Rocket className="w-6 h-6 text-white" />
                        </motion.div>
                        <h4 className="text-lg font-bold text-white mb-2">
                          Ready to Explore?
                        </h4>
                        <p className="text-blue-100 mb-6 max-w-md mx-auto">
                          Take the next step in your cultural journey. Each
                          discovery builds on your unique cultural DNA.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center"
                          >
                            <BookOpen className="w-4 h-4 mr-2" />
                            Create Action Plan
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={shareResults}
                            className="px-6 py-3 border border-white/30 text-white rounded-xl font-medium hover:bg-white/10 transition-all flex items-center justify-center"
                          >
                            <Share2 className="w-4 h-4 mr-2" />
                            Share Discoveries
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>

                  {/* Discovery Statistics */}
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white/10 backdrop-blur-sm rounded-3xl p-10 border border-white/20"
                  >
                    <h4 className="text-xl font-bold text-white mb-6 flex items-center">
                      <BarChart3 className="w-5 h-5 text-purple-400 mr-3" />
                      Discovery Analytics
                    </h4>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                        <div className="text-3xl font-bold text-white mb-2">
                          {discoveries.length}
                        </div>
                        <div className="text-sm text-white/60">
                          AI Recommendations
                        </div>
                        <div className="mt-2 w-full bg-white/20 rounded-full h-1">
                          <div className="bg-gradient-to-r from-green-400 to-blue-400 h-1 rounded-full w-full" />
                        </div>
                      </div>

                      <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                        <div className="text-3xl font-bold text-white mb-2">
                          {savedDiscoveries.size}
                        </div>
                        <div className="text-sm text-white/60">
                          Saved for Later
                        </div>
                        <div className="mt-2 w-full bg-white/20 rounded-full h-1">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{
                              width: `${
                                (savedDiscoveries.size /
                                  Math.max(discoveries.length, 1)) *
                                100
                              }%`,
                            }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="bg-gradient-to-r from-yellow-400 to-orange-400 h-1 rounded-full"
                          />
                        </div>
                      </div>

                      <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                        <div className="text-3xl font-bold text-white mb-2">
                          {narrative.culturalBlindSpots?.length || 0}
                        </div>
                        <div className="text-sm text-white/60">
                          Growth Areas
                        </div>
                        <div className="mt-2 w-full bg-white/20 rounded-full h-1">
                          <div
                            className="bg-gradient-to-r from-orange-400 to-red-400 h-1 rounded-full"
                            style={{
                              width: `${Math.min(
                                (narrative.culturalBlindSpots?.length || 0) *
                                  25,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                        <div className="text-3xl font-bold text-white mb-2">
                          {narrative.recommendations.length}
                        </div>
                        <div className="text-sm text-white/60">Next Steps</div>
                        <div className="mt-2 w-full bg-white/20 rounded-full h-1">
                          <div className="bg-gradient-to-r from-blue-400 to-purple-400 h-1 rounded-full w-full" />
                        </div>
                      </div>
                    </div>

                    {/* Discovery insights */}
                    <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl border border-purple-400/20">
                      <div className="flex items-start">
                        <Brain className="w-5 h-5 text-purple-400 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <h5 className="text-white font-medium mb-2">
                            Cultural Intelligence Summary
                          </h5>
                          <p className="text-purple-100 text-sm leading-relaxed">
                            Your personalized discoveries are curated based on{" "}
                            {Object.values(preferences).flat().length}{" "}
                            preferences and {culturalProfile.connections.length}{" "}
                            cross-domain connections, with a{" "}
                            {Math.round(
                              (culturalProfile.qlooInsights?.matchRate || 0) *
                                100
                            )}
                            % database recognition rate.
                          </p>
                        </div>
                      </div>
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
                {/* Enhanced Evolution Timeline */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white/10 backdrop-blur-sm rounded-3xl p-10 border border-white/20 h-full flex flex-col"
                >
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold text-white flex items-center">
                      <TrendingUp className="w-8 h-8 text-purple-400 mr-4" />
                      Cultural Evolution Timeline
                    </h2>
                    <div className="text-sm text-white/60 bg-white/10 px-3 py-1 rounded-full">
                      Future predictions
                    </div>
                  </div>

                  {evolutionData.length > 0 ? (
                    <div className="flex-1 flex flex-col justify-between space-y-12">
                      {evolutionData.map((evolution, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + index * 0.1 }}
                          className="relative flex-1"
                        >
                          {/* Timeline connector line */}
                          {index < evolutionData.length - 1 && (
                            <div className="absolute left-6 top-20 w-0.5 h-full bg-gradient-to-b from-purple-400 to-purple-400/30" />
                          )}

                          <div className="flex items-start space-x-6 h-full">
                            {/* Timeline indicator */}
                            <div className="flex-shrink-0 relative">
                              <motion.div
                                whileHover={{ scale: 1.2 }}
                                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-lg ${
                                  evolution.likelihood > 80
                                    ? "bg-gradient-to-r from-green-500 to-emerald-500"
                                    : evolution.likelihood > 60
                                    ? "bg-gradient-to-r from-blue-500 to-cyan-500"
                                    : "bg-gradient-to-r from-purple-500 to-violet-500"
                                }`}
                                style={{
                                  boxShadow: `0 0 20px ${
                                    evolution.likelihood > 80
                                      ? "#10B981"
                                      : evolution.likelihood > 60
                                      ? "#3B82F6"
                                      : "#8B5CF6"
                                  }40`,
                                }}
                              >
                                {index + 1}
                              </motion.div>

                              {/* Pulse animation for high likelihood */}
                              {evolution.likelihood > 80 && (
                                <motion.div
                                  animate={{
                                    scale: [1, 1.5, 1],
                                    opacity: [0.5, 0, 0.5],
                                  }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                  className="absolute inset-0 rounded-full bg-green-400"
                                />
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0 h-full flex flex-col">
                              {/* Header with timeframe and likelihood */}
                              <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-4">
                                  <div className="bg-purple-500/20 rounded-lg px-6 py-3 border border-purple-400/30">
                                    <div className="text-purple-300 font-bold text-lg">
                                      {evolution.timeframe}
                                    </div>
                                    <div className="text-purple-200 text-sm mt-1">
                                      Timeline
                                    </div>
                                  </div>
                                  <div
                                    className={`px-4 py-2 rounded-full text-sm font-medium border ${
                                      evolution.likelihood > 80
                                        ? "bg-green-500/20 text-green-300 border-green-400/30"
                                        : evolution.likelihood > 60
                                        ? "bg-blue-500/20 text-blue-300 border-blue-400/30"
                                        : "bg-purple-500/20 text-purple-300 border-purple-400/30"
                                    }`}
                                  >
                                    {evolution.likelihood}% confidence
                                  </div>
                                </div>

                                {/* Phase indicator */}
                                <div className="text-sm text-white/60 bg-white/10 px-4 py-2 rounded-full">
                                  Phase {index + 1}
                                </div>
                              </div>

                              {/* Prediction content - takes remaining space */}
                              <motion.div
                                whileHover={{ scale: 1.01, x: 5 }}
                                className="bg-white/5 rounded-xl p-8 border border-white/10 hover:bg-white/10 transition-all group cursor-pointer flex-1 flex flex-col justify-center"
                              >
                                <p className="text-blue-100 leading-relaxed text-xl group-hover:text-white transition-colors mb-6">
                                  {evolution.prediction}
                                </p>

                                {/* Progress bar */}
                                <div className="mb-6">
                                  <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm text-white/60">
                                      Likelihood
                                    </span>
                                    <span className="text-sm text-white/80 font-medium">
                                      {evolution.likelihood}%
                                    </span>
                                  </div>
                                  <div className="w-full bg-white/20 rounded-full h-3">
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{
                                        width: `${evolution.likelihood}%`,
                                      }}
                                      transition={{
                                        delay: 0.5 + index * 0.1,
                                        duration: 1,
                                      }}
                                      className={`h-3 rounded-full ${
                                        evolution.likelihood > 80
                                          ? "bg-gradient-to-r from-green-400 to-emerald-400"
                                          : evolution.likelihood > 60
                                          ? "bg-gradient-to-r from-blue-400 to-cyan-400"
                                          : "bg-gradient-to-r from-purple-400 to-violet-400"
                                      }`}
                                    />
                                  </div>
                                </div>

                                {/* Metadata */}
                                <div className="flex items-center justify-between text-sm text-white/60">
                                  <div className="flex items-center space-x-6">
                                    <div className="flex items-center">
                                      <Clock className="w-4 h-4 mr-2" />
                                      <span>Evolution Phase {index + 1}</span>
                                    </div>
                                    <div className="flex items-center">
                                      <Target className="w-4 h-4 mr-2" />
                                      <span>
                                        {evolution.likelihood > 80
                                          ? "Highly Likely"
                                          : evolution.likelihood > 60
                                          ? "Likely"
                                          : "Possible"}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center">
                                    <TrendingUp className="w-4 h-4 mr-2" />
                                    <span>Cultural Growth</span>
                                  </div>
                                </div>

                                {/* Additional insights for each phase */}
                                <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
                                  <div className="flex items-center justify-between mb-3">
                                    <h5 className="text-white font-medium">
                                      Phase Insights
                                    </h5>
                                    <div className="flex items-center space-x-2">
                                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                                      <span className="text-xs text-white/60">
                                        AI Analysis
                                      </span>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <div className="text-white/60">
                                        Focus Areas
                                      </div>
                                      <div className="text-white font-medium">
                                        {index === 0
                                          ? "Digital Exploration"
                                          : index === 1
                                          ? "Cultural Festivals"
                                          : index === 2
                                          ? "Creative Expression"
                                          : "Experimental Arts"}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-white/60">
                                        Growth Type
                                      </div>
                                      <div className="text-white font-medium">
                                        {evolution.likelihood > 80
                                          ? "Rapid"
                                          : evolution.likelihood > 60
                                          ? "Steady"
                                          : "Gradual"}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            </div>
                          </div>
                        </motion.div>
                      ))}

                      {/* Evolution Summary - at the bottom */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="mt-8 p-8 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl border border-purple-400/20"
                      >
                        <div className="flex items-start">
                          <Brain className="w-8 h-8 text-purple-400 mr-6 mt-1 flex-shrink-0" />
                          <div className="flex-1">
                            <h4 className="text-white font-medium mb-4 text-xl">
                              Evolution Insights
                            </h4>
                            <div className="grid grid-cols-3 gap-6 mb-6">
                              <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
                                <div className="text-3xl font-bold text-purple-300 mb-2">
                                  {evolutionData.length}
                                </div>
                                <div className="text-sm text-white/60">
                                  Phases
                                </div>
                              </div>
                              <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
                                <div className="text-3xl font-bold text-blue-300 mb-2">
                                  {Math.max(
                                    ...evolutionData.map((e) =>
                                      parseInt(e.timeframe)
                                    )
                                  ) || 24}
                                </div>
                                <div className="text-sm text-white/60">
                                  Months
                                </div>
                              </div>
                              <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
                                <div className="text-3xl font-bold text-green-300 mb-2">
                                  {Math.round(
                                    evolutionData.reduce(
                                      (sum, e) => sum + e.likelihood,
                                      0
                                    ) / evolutionData.length
                                  )}
                                  %
                                </div>
                                <div className="text-sm text-white/60">
                                  Avg Confidence
                                </div>
                              </div>
                            </div>
                            <p className="text-purple-100 text-lg leading-relaxed">
                              Your cultural evolution is predicted to span{" "}
                              <strong>
                                {evolutionData.length} distinct phases
                              </strong>
                              over the next{" "}
                              <strong>
                                {Math.max(
                                  ...evolutionData.map((e) =>
                                    parseInt(e.timeframe)
                                  )
                                ) || 24}{" "}
                                months
                              </strong>
                              , with high confidence in your growth trajectory
                              and diverse cultural exploration.
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  ) : (
                    <div className="text-center py-16 text-white/60 flex-1 flex flex-col justify-center">
                      <TrendingUp className="w-16 h-16 mx-auto mb-6 opacity-40" />
                      <p className="text-lg">
                        Evolution predictions not available.
                      </p>
                      <p className="text-sm mt-2">
                        Add more cultural preferences to unlock evolution
                        insights.
                      </p>
                    </div>
                  )}
                </motion.div>
                {/* Enhanced Growth Challenges & CTA */}
                <div className="space-y-8">
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/10 backdrop-blur-sm rounded-3xl p-10 border border-white/20"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold text-white flex items-center">
                        <Target className="w-6 h-6 text-green-400 mr-3" />
                        Cultural Growth Challenges
                      </h3>
                      <div className="flex items-center space-x-2">
                        <div className="text-sm text-white/60 bg-white/10 px-3 py-1 rounded-full">
                          {growthChallenges.length} challenges
                        </div>
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="w-3 h-3 bg-green-400 rounded-full"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      {growthChallenges.length > 0 ? (
                        growthChallenges.map((challenge, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 + index * 0.1 }}
                            whileHover={{ scale: 1.02, x: 5 }}
                            className="flex items-start p-6 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-xl border border-green-400/20 hover:border-green-400/40 transition-all group cursor-pointer"
                          >
                            <motion.div
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              className="w-10 h-10 bg-green-400 rounded-lg flex items-center justify-center text-white font-bold text-sm mr-4 flex-shrink-0 group-hover:bg-green-300 transition-colors"
                            >
                              {index + 1}
                            </motion.div>
                            <div className="flex-1">
                              <span className="text-blue-100 group-hover:text-white transition-colors leading-relaxed">
                                {challenge}
                              </span>
                              <div className="mt-3 flex items-center justify-between">
                                <div className="flex items-center text-xs text-white/60">
                                  <Target className="w-3 h-3 mr-1" />
                                  <span>Growth Challenge</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <div className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full border border-green-400/30">
                                    Actionable
                                  </div>
                                  <div className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-400/30">
                                    Personalized
                                  </div>
                                </div>
                              </div>
                            </div>
                            <motion.div
                              initial={{ opacity: 0 }}
                              whileHover={{ opacity: 1 }}
                              className="text-white/40 ml-4 flex items-center space-x-2"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </motion.div>
                          </motion.div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-white/60">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                          >
                            <Target className="w-16 h-16 mx-auto mb-6 opacity-40" />
                          </motion.div>
                          <p className="text-lg">
                            Loading personalized growth challenges...
                          </p>
                          <div className="mt-4 w-32 h-1 bg-white/20 rounded-full mx-auto overflow-hidden">
                            <motion.div
                              animate={{ x: ["-100%", "100%"] }}
                              transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "linear",
                              }}
                              className="w-full h-full bg-gradient-to-r from-transparent via-green-400 to-transparent"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Challenge Progress Tracker */}
                    {growthChallenges.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="mt-6 p-4 bg-green-500/10 rounded-xl border border-green-400/20"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-green-300 font-medium">
                            Challenge Progress
                          </h4>
                          <span className="text-sm text-green-400">
                            0/{growthChallenges.length} completed
                          </span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "0%" }}
                            className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full"
                          />
                        </div>
                        <p className="text-green-100 text-sm mt-2">
                          Start your first challenge to begin tracking your
                          cultural growth journey.
                        </p>
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Enhanced CTA Section */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-sm rounded-3xl p-10 text-white border border-white/20 relative overflow-hidden"
                  >
                    {/* Background pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div
                        className="absolute inset-0"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                        }}
                      />
                    </div>

                    <div className="relative z-10">
                      <div className="text-center mb-8">
                        <motion.div
                          animate={{
                            rotate: [0, 10, -10, 0],
                            scale: [1, 1.1, 1],
                          }}
                          transition={{ duration: 4, repeat: Infinity }}
                          className="w-20 h-20 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl"
                        >
                          <Sparkles className="w-10 h-10 text-white" />
                        </motion.div>
                        <h3 className="text-3xl font-bold mb-4">
                          Ready for Your Cultural Evolution?
                        </h3>
                        <p className="opacity-90 text-xl leading-relaxed max-w-2xl mx-auto">
                          Your cultural journey is just beginning. Refine your
                          profile, explore new domains, or challenge yourself
                          with our AI-powered growth recommendations.
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
                        <Link href="/onboarding">
                          <motion.button
                            whileHover={{
                              scale: 1.05,
                              boxShadow: "0 20px 40px rgba(255, 255, 255, 0.2)",
                            }}
                            whileTap={{ scale: 0.95 }}
                            className="w-full sm:w-auto bg-white text-purple-600 px-10 py-5 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all flex items-center justify-center shadow-xl"
                          >
                            <Plus className="w-6 h-6 mr-3" />
                            Refine Your Profile
                          </motion.button>
                        </Link>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={shareResults}
                          disabled={isGeneratingImage}
                          className="w-full sm:w-auto border-2 border-white text-white px-10 py-5 rounded-xl font-bold text-lg hover:bg-white/10 transition-all flex items-center justify-center disabled:opacity-50"
                        >
                          {isGeneratingImage ? (
                            <Camera className="w-6 h-6 mr-3 animate-spin" />
                          ) : (
                            <Share2 className="w-6 h-6 mr-3" />
                          )}
                          {isGeneratingImage
                            ? "Creating..."
                            : "Share Your Evolution"}
                        </motion.button>
                      </div>

                      {/* Enhanced Stats Footer */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="border-t border-white/20 pt-8"
                      >
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="p-4 bg-white/10 rounded-xl border border-white/20"
                          >
                            <div className="text-3xl font-bold mb-1">
                              {analysisStats.analysisTime}s
                            </div>
                            <div className="text-sm opacity-60 flex items-center justify-center">
                              <Clock className="w-4 h-4 mr-1" />
                              Analysis Time
                            </div>
                          </motion.div>
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="p-4 bg-white/10 rounded-xl border border-white/20"
                          >
                            <div className="text-3xl font-bold mb-1">
                              {analysisStats.connectionsFound}
                            </div>
                            <div className="text-sm opacity-60 flex items-center justify-center">
                              <Globe className="w-4 h-4 mr-1" />
                              Connections
                            </div>
                          </motion.div>
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="p-4 bg-white/10 rounded-xl border border-white/20"
                          >
                            <div className="text-3xl font-bold mb-1">
                              {analysisStats.confidenceScore}%
                            </div>
                            <div className="text-sm opacity-60 flex items-center justify-center">
                              <BarChart3 className="w-4 h-4 mr-1" />
                              Confidence
                            </div>
                          </motion.div>
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="p-4 bg-white/10 rounded-xl border border-white/20"
                          >
                            <div className="text-3xl font-bold mb-1">
                              {Object.values(preferences).flat().length}
                            </div>
                            <div className="text-sm opacity-60 flex items-center justify-center">
                              <Heart className="w-4 h-4 mr-1" />
                              Preferences
                            </div>
                          </motion.div>
                        </div>

                        {/* Cultural DNA Summary */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1 }}
                          className="mt-8 p-6 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl border border-purple-400/20"
                        >
                          <div className="flex items-start">
                            <Brain className="w-6 h-6 text-purple-400 mr-4 mt-1 flex-shrink-0" />
                            <div>
                              <h4 className="text-lg font-semibold text-white mb-2">
                                Your Cultural DNA Summary
                              </h4>
                              <p className="text-purple-100 leading-relaxed">
                                <strong>"{narrative.title}"</strong> -{" "}
                                {narrative.culturalDNA}
                              </p>
                              <div className="mt-4 flex flex-wrap gap-2">
                                <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-sm rounded-full border border-purple-400/30">
                                  {narrative.diversityScore}% Diversity Score
                                </span>
                                <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-sm rounded-full border border-blue-400/30">
                                  {culturalProfile.themes.length} Cultural
                                  Themes
                                </span>
                                <span className="px-3 py-1 bg-green-500/20 text-green-300 text-sm rounded-full border border-green-400/30">
                                  {discoveries.length} AI Discoveries
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Evolution Comparison */}
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white/10 backdrop-blur-sm rounded-3xl p-10 border border-white/20"
                  >
                    <h4 className="text-xl font-bold text-white mb-6 flex items-center">
                      <Activity className="w-5 h-5 text-cyan-400 mr-3" />
                      Evolution Trajectory Analysis
                    </h4>

                    {evolutionData.length > 0 && (
                      <div className="space-y-6">
                        {/* Evolution path visualization */}
                        <div className="relative">
                          <ResponsiveContainer width="100%" height={200}>
                            <LineChart
                              data={evolutionData.map((item, index) => ({
                                phase: item.phase,
                                likelihood: item.likelihood,
                                month: index * 6 + 6,
                              }))}
                            >
                              <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="rgba(255,255,255,0.1)"
                              />
                              <XAxis
                                dataKey="month"
                                tick={{ fill: "white", fontSize: 12 }}
                                label={{
                                  value: "Months",
                                  position: "insideBottom",
                                  offset: -5,
                                  style: {
                                    textAnchor: "middle",
                                    fill: "white",
                                  },
                                }}
                              />
                              <YAxis
                                tick={{ fill: "white", fontSize: 12 }}
                                domain={[0, 100]}
                                label={{
                                  value: "Likelihood (%)",
                                  angle: -90,
                                  position: "insideLeft",
                                  style: {
                                    textAnchor: "middle",
                                    fill: "white",
                                  },
                                }}
                              />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "rgba(0, 0, 0, 0.9)",
                                  border: "1px solid rgba(255, 255, 255, 0.2)",
                                  borderRadius: "12px",
                                  backdropFilter: "blur(10px)",
                                  color: "white",
                                }}
                                formatter={(value, name) => [
                                  `${value}%`,
                                  "Evolution Likelihood",
                                ]}
                                labelFormatter={(label) => `Month ${label}`}
                              />
                              <Line
                                type="monotone"
                                dataKey="likelihood"
                                stroke="#8B5CF6"
                                strokeWidth={3}
                                dot={{ fill: "#8B5CF6", strokeWidth: 2, r: 6 }}
                                activeDot={{
                                  r: 8,
                                  stroke: "#ffffff",
                                  strokeWidth: 2,
                                }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>

                        {/* Evolution insights */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="p-4 bg-cyan-500/10 rounded-xl border border-cyan-400/20">
                            <div className="text-2xl font-bold text-cyan-300 mb-1">
                              {Math.round(
                                evolutionData.reduce(
                                  (sum, item) => sum + item.likelihood,
                                  0
                                ) / evolutionData.length
                              )}
                              %
                            </div>
                            <div className="text-sm text-cyan-100">
                              Average Confidence
                            </div>
                          </div>
                          <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-400/20">
                            <div className="text-2xl font-bold text-purple-300 mb-1">
                              {Math.max(
                                ...evolutionData.map((item) =>
                                  parseInt(item.timeframe.split(" ")[0])
                                )
                              )}
                            </div>
                            <div className="text-sm text-purple-100">
                              Months Projected
                            </div>
                          </div>
                          <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-400/20">
                            <div className="text-2xl font-bold text-blue-300 mb-1">
                              {evolutionData.length}
                            </div>
                            <div className="text-sm text-blue-100">
                              Evolution Phases
                            </div>
                          </div>
                        </div>

                        {/* Next milestone */}
                        <div className="p-6 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl border border-cyan-400/20">
                          <div className="flex items-start">
                            <Calendar className="w-6 h-6 text-cyan-400 mr-4 mt-1 flex-shrink-0" />
                            <div>
                              <h5 className="text-white font-medium mb-2">
                                Next Milestone
                              </h5>
                              <p className="text-cyan-100 leading-relaxed">
                                {evolutionData[0]?.prediction ||
                                  "Continue building your cultural profile to unlock evolution predictions."}
                              </p>
                              {evolutionData[0] && (
                                <div className="mt-3 flex items-center text-sm text-cyan-300">
                                  <Clock className="w-4 h-4 mr-2" />
                                  <span>
                                    Expected in {evolutionData[0].timeframe}
                                  </span>
                                  <span className="mx-2">•</span>
                                  <span>
                                    {evolutionData[0].likelihood}% likelihood
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
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
                className="relative"
              >
                {/* Visualization Header */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-center mb-12"
                >
                  <div className="flex items-center justify-center mb-6">
                    <motion.div
                      animate={{
                        rotate: [0, 360],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        rotate: {
                          duration: 20,
                          repeat: Infinity,
                          ease: "linear",
                        },
                        scale: { duration: 2, repeat: Infinity },
                      }}
                      className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center mr-4"
                    >
                      <Sparkles className="w-8 h-8 text-white" />
                    </motion.div>
                    <div>
                      <h2 className="text-4xl font-bold text-white">
                        Cultural DNA Visualization
                      </h2>
                      <p className="text-blue-200 text-lg mt-2">
                        Interactive exploration of your cultural universe
                      </p>
                    </div>
                  </div>

                  {/* Visualization Stats */}
                  <div className="flex justify-center space-x-8 mb-8">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">
                        {Object.values(preferences).flat().length}
                      </div>
                      <div className="text-sm text-white/60">
                        Cultural Elements
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">
                        {culturalProfile.connections.length}
                      </div>
                      <div className="text-sm text-white/60">Connections</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">
                        {narrative.diversityScore}%
                      </div>
                      <div className="text-sm text-white/60">Diversity</div>
                    </div>
                  </div>
                </motion.div>

                {/* Cultural Wow Factor Component */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                >
                  <CulturalWowFactor
                    culturalProfile={culturalProfile}
                    narrative={narrative}
                    preferences={preferences}
                    discoveries={discoveries}
                    evolutionPredictions={narrative.evolutionPredictions}
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
      {/* Enhanced Floating Action Button with Notification System */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 200 }}
        className="fixed bottom-8 right-8 z-20"
      >
        <div className="relative">
          {/* Notification Badge with Dynamic Counter */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0],
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold z-10 shadow-lg"
          >
            {Object.values(preferences).flat().length}
          </motion.div>

          {/* Pulse Effect */}
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full"
          />

          <Link href="/onboarding">
            <motion.button
              whileHover={{
                scale: 1.1,
                boxShadow: "0 10px 30px rgba(139, 92, 246, 0.4)",
                rotate: 180,
              }}
              whileTap={{ scale: 0.9 }}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-5 rounded-full shadow-lg relative overflow-hidden group"
            >
              <Plus className="w-7 h-7 transition-transform group-hover:rotate-90 duration-300" />

              {/* Ripple Effect */}
              <motion.div
                className="absolute inset-0 bg-white/20 rounded-full"
                animate={{ scale: [0, 2.5], opacity: [0.5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.button>
          </Link>

          {/* Tooltip */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            whileHover={{ opacity: 1, scale: 1, x: 0 }}
            className="absolute right-full top-1/2 transform -translate-y-1/2 mr-4 bg-black/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm whitespace-nowrap border border-white/20 pointer-events-none"
          >
            Add more preferences
            <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-black/90" />
          </motion.div>
        </div>
      </motion.div>

      {/* Enhanced Tech Badge - Subtle Branding */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2 }}
        className="fixed bottom-8 left-8 z-20 hidden xl:block"
      >
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 text-white shadow-2xl overflow-hidden">
          {/* Header with Toggle Button */}
          <div className="flex items-center justify-between p-4 border-b border-white/20">
            <div className="flex items-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 mr-3"
              >
                <Brain className="w-5 h-5 text-purple-400" />
              </motion.div>
              <div>
                <div className="text-white/90 font-medium text-sm">
                  Cultural Intelligence
                </div>
                <div className="text-white/60 text-xs">AI-Powered Analysis</div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setTechBadgeExpanded(!techBadgeExpanded)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <motion.div
                animate={{ rotate: techBadgeExpanded ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown className="w-4 h-4 text-white/60" />
              </motion.div>
            </motion.button>
          </div>

          {/* Expandable Content */}
          <AnimatePresence>
            {techBadgeExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center space-x-6 text-sm">
                    <div className="flex items-center group">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 8,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-5 h-5 mr-3"
                      >
                        <Brain className="w-5 h-5 text-purple-400 group-hover:text-purple-300 transition-colors" />
                      </motion.div>
                      <div>
                        <div className="text-white/90 font-medium">
                          Powered by Qloo's Cultural Intelligence
                        </div>
                        <div className="text-white/60 text-xs">
                          Real cultural data analysis
                        </div>
                      </div>
                    </div>

                    <div className="w-px h-8 bg-white/20" />

                    <div className="flex items-center group">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-5 h-5 mr-3"
                      >
                        <Sparkles className="w-5 h-5 text-blue-400 group-hover:text-blue-300 transition-colors" />
                      </motion.div>
                      <div>
                        <div className="text-white/90 font-medium">
                          Enhanced with OpenAI GPT-4
                        </div>
                        <div className="text-white/60 text-xs">
                          Advanced narrative generation
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* API Status Indicators */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/20">
                    <div className="flex items-center text-xs">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                      <span className="text-green-300">Qloo API Active</span>
                    </div>
                    <div className="flex items-center text-xs">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse" />
                      <span className="text-blue-300">OpenAI Connected</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Results Summary Overlay for Mobile */}
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
        className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-sm border-t border-white/20 p-4 z-10 xl:hidden"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center mr-3">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-white font-medium text-sm">
                {narrative.title}
              </div>
              <div className="text-white/60 text-xs">
                {narrative.diversityScore}% Cultural Diversity
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={shareResults}
              disabled={isGeneratingImage}
              className="p-3 bg-white/10 backdrop-blur-sm text-white rounded-xl border border-white/20 disabled:opacity-50"
            >
              {isGeneratingImage ? (
                <Camera className="w-5 h-5 animate-spin" />
              ) : (
                <Share2 className="w-5 h-5" />
              )}
            </motion.button>

            <Link href="/onboarding">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl shadow-lg"
              >
                <Plus className="w-5 h-5" />
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Scroll-to-Top Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{
          opacity: readingProgress > 20 ? 1 : 0,
          scale: readingProgress > 20 ? 1 : 0,
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-24 right-8 z-20 p-4 bg-white/10 backdrop-blur-sm text-white rounded-full border border-white/20 hover:bg-white/20 transition-all xl:bottom-8 xl:right-24"
      >
        <motion.div
          animate={{ y: [-2, 2, -2] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronUp className="w-6 h-6" />
        </motion.div>

        {/* Progress Ring */}
        <svg className="absolute inset-0 w-full h-full">
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="2"
          />
          <motion.circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke="rgba(139, 92, 246, 0.8)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 45 * 0.01}`}
            strokeDashoffset={`${
              2 * Math.PI * 45 * 0.01 * (1 - readingProgress / 100)
            }`}
            style={{ transformOrigin: "center" }}
            initial={{ rotate: -90 }}
            animate={{ rotate: -90 }}
          />
        </svg>
      </motion.button>

      {/* Success Toast Notification */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed top-8 right-8 bg-green-500/20 backdrop-blur-sm border border-green-400/30 text-green-100 p-4 rounded-xl z-50 max-w-sm"
          >
            <div className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium">Sharing Options Ready!</div>
                <div className="text-sm text-green-200 mt-1">
                  Your cultural DNA visualization is ready to share with the
                  world.
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cultural Insights Sidebar for Desktop */}
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 2 }}
        className="fixed right-8 top-1/2 transform -translate-y-1/2 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 max-w-xs hidden 2xl:block z-10"
      >
        <h4 className="text-white font-bold mb-4 flex items-center">
          <Zap className="w-5 h-5 mr-2 text-yellow-400" />
          Live Cultural DNA
        </h4>

        <div className="space-y-4">
          {/* Real-time stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="text-xl font-bold text-white">
                {Object.values(preferences).flat().length}
              </div>
              <div className="text-xs text-white/60">Preferences</div>
            </div>
            <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="text-xl font-bold text-white">
                {culturalProfile.connections.length}
              </div>
              <div className="text-xs text-white/60">Connections</div>
            </div>
          </div>

          {/* Cultural themes preview */}
          <div>
            <h5 className="text-white text-sm font-medium mb-2">
              Active Themes
            </h5>
            <div className="space-y-2">
              {culturalProfile.themes.slice(0, 3).map((theme, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 2.5 + index * 0.1 }}
                  className="text-xs text-blue-100 bg-white/5 px-3 py-2 rounded-lg border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                >
                  {theme}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="space-y-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab("discoveries")}
              className="w-full text-left p-3 bg-green-500/10 text-green-300 rounded-lg border border-green-400/20 hover:bg-green-500/20 transition-all text-sm"
            >
              <div className="flex items-center">
                <Compass className="w-4 h-4 mr-2" />
                <span>View {discoveries.length} Discoveries</span>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab("evolution")}
              className="w-full text-left p-3 bg-purple-500/10 text-purple-300 rounded-lg border border-purple-400/20 hover:bg-purple-500/20 transition-all text-sm"
            >
              <div className="flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                <span>Cultural Evolution</span>
              </div>
            </motion.button>
          </div>

          {/* Analysis timestamp */}
          <div className="pt-4 border-t border-white/20">
            <div className="flex items-center text-xs text-white/60">
              <Clock className="w-3 h-3 mr-2" />
              <span>
                Analysis completed {Math.round(analysisStats.analysisTime)}s ago
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Background Enhancement Particles */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: Math.random() * 4 + 4,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// Additional TypeScript interfaces for enhanced functionality
interface ConnectionData {
  name: string;
  value: number;
  strength: number;
  explanation: string;
  id: string;
  color: string;
}

interface EvolutionData {
  phase: string;
  prediction: string;
  timeframe: string;
  likelihood: number;
}

interface DiversityBreakdown {
  name: string;
  value: number;
  color: string;
  description: string;
}

// Helper function for connection hover states
const useConnectionHover = () => {
  const [hoveredConnection, setHoveredConnection] = useState<string | null>(
    null
  );
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });

  const handleConnectionHover = useCallback(
    (connectionId: string, event?: React.MouseEvent) => {
      setHoveredConnection(connectionId);
      if (event) {
        setHoverPosition({ x: event.clientX, y: event.clientY });
      }
    },
    []
  );

  const handleConnectionLeave = useCallback(() => {
    setHoveredConnection(null);
  }, []);

  return {
    hoveredConnection,
    hoverPosition,
    handleConnectionHover,
    handleConnectionLeave,
  };
};

// Enhanced hook for discovery management
const useDiscoveryActions = () => {
  const [savedDiscoveries, setSavedDiscoveries] = useState<Set<number>>(
    new Set()
  );

  const toggleSaveDiscovery = useCallback((index: number) => {
    setSavedDiscoveries((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, []);

  return {
    savedDiscoveries,
    toggleSaveDiscovery,
  };
};
