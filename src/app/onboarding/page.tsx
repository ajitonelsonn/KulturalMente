"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Music,
  Film,
  Coffee,
  MapPin,
  Book,
  ChevronRight,
  ChevronLeft,
  Brain,
  Sparkles,
  Search,
  Plus,
  X,
  Star,
  Loader2,
  Clock,
  CheckCircle,
  TrendingUp,
  Zap,
  Heart,
  Users,
  Globe,
  Award,
  Target,
  Eye,
} from "lucide-react";
import { qlooService, QlooEntity } from "@/lib/qloo-service";
import Link from "next/link";

interface PreferenceCategory {
  id: string;
  name: string;
  icon: any;
  description: string;
  placeholder: string;
  examples: string[];
  gradient: string;
  motivationalText: string;
  tips: string[];
}

const categories: PreferenceCategory[] = [
  {
    id: "music",
    name: "Music",
    icon: Music,
    description: "Artists, genres, or songs that move your soul",
    placeholder: "Type to search for artists, genres, or songs...",
    examples: ["Central Cee", "Billie Eilish", "Pink Floyd", "Kendrick Lamar"],
    gradient: "from-purple-500 to-pink-500",
    motivationalText: "Let's explore the soundscape of your soul! 🎵",
    tips: [
      "Try searching by genre like 'indie rock' or 'jazz'",
      "Include both mainstream and niche artists",
      "Think about what you listen to in different moods",
    ],
  },
  {
    id: "movies",
    name: "Movies & TV",
    icon: Film,
    description: "Films, shows, or directors that captivate you",
    placeholder: "Type to search for movies, shows, or directors...",
    examples: [
      "The Grand Budapest Hotel",
      "Parasite",
      "The Office",
      "Studio Ghibli",
    ],
    gradient: "from-blue-500 to-cyan-500",
    motivationalText: "Time to dive into your cinematic universe! 🎬",
    tips: [
      "Include both movies and TV shows",
      "Consider directors you admire",
      "Think about different genres you enjoy",
    ],
  },
  {
    id: "food",
    name: "Food & Dining",
    icon: Coffee,
    description: "Cuisines and dining experiences you crave",
    placeholder: "Type to search for cuisines, dishes, or restaurants...",
    examples: ["Ethiopian cuisine", "Ramen", "Farm-to-table", "Street food"],
    gradient: "from-orange-500 to-red-500",
    motivationalText: "Let's discover your culinary adventures! 🍽️",
    tips: [
      "Think about specific cuisines you love",
      "Include cooking styles or restaurant types",
      "Consider comfort foods and exotic flavors",
    ],
  },
  {
    id: "travel",
    name: "Travel & Places",
    icon: MapPin,
    description: "Destinations and experiences that inspire you",
    placeholder: "Type to search for destinations or travel experiences...",
    examples: [
      "Tokyo",
      "Backpacking Europe",
      "National parks",
      "Cultural festivals",
    ],
    gradient: "from-green-500 to-teal-500",
    motivationalText: "Where does your wanderlust take you? 🗺️",
    tips: [
      "Include both places you've been and dream destinations",
      "Think about travel styles (luxury, adventure, cultural)",
      "Consider specific experiences you enjoy",
    ],
  },
  {
    id: "books",
    name: "Books & Literature",
    icon: Book,
    description: "Authors, genres, or stories that resonate",
    placeholder: "Type to search for authors, books, or genres...",
    examples: ["Haruki Murakami", "Science fiction", "Poetry", "Non-fiction"],
    gradient: "from-indigo-500 to-purple-500",
    motivationalText: "Let's explore your literary landscape! 📚",
    tips: [
      "Include both fiction and non-fiction",
      "Think about authors who influenced you",
      "Consider different formats: books, audiobooks, poetry",
    ],
  },
];

const insights = [
  {
    icon: Heart,
    text: "Your choices reveal authentic preferences",
    color: "text-red-400",
  },
  {
    icon: Brain,
    text: "Each selection builds your cultural DNA",
    color: "text-purple-400",
  },
  {
    icon: Globe,
    text: "Discovering global cultural patterns",
    color: "text-blue-400",
  },
  {
    icon: Sparkles,
    text: "Unique connections are emerging",
    color: "text-yellow-400",
  },
  {
    icon: Target,
    text: "Perfect recommendations incoming",
    color: "text-green-400",
  },
];

// Storage keys for clearing
const RESULTS_STORAGE_KEY = "kulturalmemente_results";
const PREFERENCES_STORAGE_KEY = "culturalPreferences";

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [preferences, setPreferences] = useState<Record<string, string[]>>({});
  const [currentInput, setCurrentInput] = useState("");
  const [searchResults, setSearchResults] = useState<QlooEntity[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [currentInsight, setCurrentInsight] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isClearing, setIsClearing] = useState(true);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  const currentCategory = categories[currentStep];
  const totalPreferences = Object.values(preferences).flat().length;
  const completionPercentage = Math.round(
    (currentStep / categories.length) * 100
  );
  const estimatedTimeLeft = Math.max(1, categories.length - currentStep - 1);

  // Auto-clear previous results when onboarding loads
  useEffect(() => {
    const clearPreviousResults = () => {
      try {
        // Clear both results and preferences
        localStorage.removeItem(RESULTS_STORAGE_KEY);
        localStorage.removeItem(PREFERENCES_STORAGE_KEY);

        console.log("🧹 Previous results cleared - starting fresh onboarding");

        // Show brief clearing animation
        setTimeout(() => {
          setIsClearing(false);
        }, 1000);
      } catch (error) {
        console.warn("Failed to clear previous results:", error);
        setIsClearing(false);
      }
    };

    clearPreviousResults();
  }, []);

  // Rotate insights every 3 seconds
  useEffect(() => {
    if (!isClearing) {
      const interval = setInterval(() => {
        setCurrentInsight((prev) => (prev + 1) % insights.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isClearing]);

  // Auto-search when input changes (with debouncing)
  useEffect(() => {
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (currentInput.length === 0) {
      setSearchResults([]);
      setHasSearched(false);
      setIsSearching(false);
      return;
    }

    if (currentInput.length >= 2) {
      // Set new timeout for auto-search
      const timeout = setTimeout(() => {
        searchPreferences(currentInput);
      }, 500); // 500ms debounce

      setSearchTimeout(timeout);
    }

    // Cleanup timeout on unmount or dependency change
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [currentInput]);

  // Mark step as completed when user adds preferences
  useEffect(() => {
    if (!isClearing) {
      const currentPrefs = preferences[currentCategory.id] || [];
      if (currentPrefs.length >= 2 && !completedSteps.includes(currentStep)) {
        setCompletedSteps((prev) => [...prev, currentStep]);
      }
    }
  }, [
    preferences,
    currentStep,
    currentCategory.id,
    completedSteps,
    isClearing,
  ]);

  const searchPreferences = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      console.log(
        `🔍 Auto-searching for: "${query}" in category: ${currentCategory.id}`
      );

      let results: QlooEntity[] = [];

      // Try category search first
      try {
        results = await qlooService.searchEntities(
          query,
          currentCategory.id,
          10
        );
        console.log(`📊 Category search returned ${results.length} results`);
      } catch (error) {
        console.warn("Category search failed, trying without filter", error);
      }

      // If no results, try without category filter
      if (results.length === 0) {
        try {
          results = await qlooService.searchEntities(query, undefined, 15);
          console.log(`📊 General search returned ${results.length} results`);
        } catch (error) {
          console.warn("General search also failed", error);
        }
      }

      // Limit and sort results
      results = results.slice(0, 8);

      // Sort by relevance
      results.sort((a, b) => {
        const aExact = a.name.toLowerCase().includes(query.toLowerCase());
        const bExact = b.name.toLowerCase().includes(query.toLowerCase());

        if (aExact && !bExact) return -1;
        if (bExact && !aExact) return 1;

        return (b.score || b.popularity || 0) - (a.score || a.popularity || 0);
      });

      setSearchResults(results);
      console.log(
        `✅ Auto-search results: ${results.length} items for "${query}"`
      );
    } catch (error) {
      console.error("Auto-search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && currentInput.trim()) {
      addPreference(currentInput.trim());
    }
  };

  const addPreference = (preference: string) => {
    const categoryPrefs = preferences[currentCategory.id] || [];
    if (!categoryPrefs.includes(preference) && categoryPrefs.length < 5) {
      setPreferences((prev) => ({
        ...prev,
        [currentCategory.id]: [...categoryPrefs, preference],
      }));
      setCurrentInput("");
      setSearchResults([]);
      setHasSearched(false);
    }
  };

  const removePreference = (preference: string) => {
    setPreferences((prev) => ({
      ...prev,
      [currentCategory.id]: (prev[currentCategory.id] || []).filter(
        (p) => p !== preference
      ),
    }));
  };

  const nextStep = () => {
    if (currentStep < categories.length - 1) {
      setCurrentStep(currentStep + 1);
      setCurrentInput("");
      setSearchResults([]);
      setHasSearched(false);
      setShowTips(false);
    } else {
      startAnalysis();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setCurrentInput("");
      setSearchResults([]);
      setHasSearched(false);
      setShowTips(false);
    }
  };

  const startAnalysis = () => {
    setIsAnalyzing(true);
    localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
    setTimeout(() => {
      window.location.href = "/results";
    }, 2000);
  };

  const currentPrefs = preferences[currentCategory.id] || [];
  const canProceed = currentPrefs.length >= 2;

  // Show clearing animation first
  if (isClearing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [1, 0],
                scale: [1, 0],
                y: [0, -100],
              }}
              transition={{
                duration: 1.5,
                delay: Math.random() * 0.5,
                ease: "easeOut",
              }}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center relative z-10"
        >
          <motion.div className="relative w-32 h-32 mx-auto mb-8">
            <motion.div
              animate={{ rotate: 360, scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute inset-0 rounded-full border-4 border-white/30"
            />
            <motion.div
              animate={{ rotate: -360, scale: [1, 0.8, 1] }}
              transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
              className="absolute inset-2 rounded-full border-4 border-purple-400/50"
            />
            <Brain className="w-16 h-16 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </motion.div>

          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold text-white mb-4"
          >
            🧹 Preparing Fresh Canvas
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-blue-100 text-lg"
          >
            Clearing previous data for a fresh cultural analysis...
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-6 w-64 mx-auto"
          >
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1, ease: "easeInOut" }}
                className="h-full bg-gradient-to-r from-purple-400 to-blue-400 rounded-full"
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (isAnalyzing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
        <div className="absolute inset-0">
          {[...Array(100)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full opacity-20"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.8, 0.2],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center relative z-10"
        >
          <motion.div className="relative w-32 h-32 mx-auto mb-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border-4 border-purple-400 border-t-transparent"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-2 rounded-full border-4 border-blue-400 border-b-transparent"
            />
            <Brain className="w-16 h-16 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </motion.div>

          <motion.h2
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            className="text-4xl font-bold text-white mb-6"
          >
            🎉 Launching Your Cultural Journey!
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-blue-100 text-lg max-w-md mx-auto"
          >
            {totalPreferences} fresh preferences collected across{" "}
            {
              Object.keys(preferences).filter((k) => preferences[k].length > 0)
                .length
            }{" "}
            domains. Preparing your unique cultural DNA analysis...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      {/* Enhanced Header */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <Link href="/" className="flex items-center group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-sm rounded-full p-3 border border-white/20 mr-4"
            >
              <Brain className="w-8 h-8 text-white" />
            </motion.div>
            <span className="text-3xl font-bold text-white group-hover:text-blue-200 transition-colors">
              KulturalMente
            </span>
          </Link>

          {/* Enhanced Progress Indicator */}
          <div className="flex items-center space-x-6">
            <div className="hidden md:flex items-center space-x-4 text-white/80">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                <span className="text-sm">~{estimatedTimeLeft} min left</span>
              </div>
              <div className="flex items-center">
                <Target className="w-4 h-4 mr-2" />
                <span className="text-sm">{totalPreferences} preferences</span>
              </div>
              <div className="flex items-center">
                <Sparkles className="w-4 h-4 mr-2" />
                <span className="text-sm">Fresh start</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-blue-200 font-medium text-lg">
                {completionPercentage}% Complete
              </span>
              <div className="w-48 bg-white/20 rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${completionPercentage}%` }}
                  transition={{ duration: 0.5 }}
                  className="bg-gradient-to-r from-purple-400 to-blue-400 h-3 rounded-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Step Indicators */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 mb-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center space-x-4">
            {categories.map((category, index) => (
              <motion.div
                key={index}
                className={`flex items-center ${
                  index <= currentStep ? "opacity-100" : "opacity-40"
                }`}
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                    index < currentStep
                      ? "bg-green-500 border-green-400 text-white"
                      : index === currentStep
                      ? "bg-white/20 border-white/40 text-white"
                      : "bg-white/10 border-white/20 text-white/60"
                  }`}
                >
                  {completedSteps.includes(index) ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <category.icon className="w-6 h-6" />
                  )}
                </motion.div>
                {index < categories.length - 1 && (
                  <div
                    className={`w-8 h-0.5 mx-2 ${
                      index < currentStep ? "bg-green-400" : "bg-white/20"
                    }`}
                  />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4 }}
            className="bg-white/10 backdrop-blur-sm rounded-3xl shadow-2xl p-12 border border-white/20"
          >
            <div className="text-center mb-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="flex items-center justify-center mb-8"
              >
                <div
                  className={`w-24 h-24 bg-gradient-to-r ${currentCategory.gradient} rounded-2xl flex items-center justify-center shadow-lg relative`}
                >
                  <currentCategory.icon className="w-12 h-12 text-white" />
                  {completedSteps.includes(currentStep) && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1"
                    >
                      <CheckCircle className="w-6 h-6 text-white" />
                    </motion.div>
                  )}
                </div>
              </motion.div>

              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-5xl font-bold text-white mb-4"
              >
                {currentCategory.name}
              </motion.h2>

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-blue-100 text-xl font-light mb-4"
              >
                {currentCategory.description}
              </motion.p>

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-purple-200 text-lg font-medium"
              >
                {currentCategory.motivationalText}
              </motion.p>
            </div>

            {/* Enhanced Search Input - Auto Search */}
            <div className="mb-10">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="relative"
              >
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <div className="absolute left-6 top-1/2 transform -translate-y-1/2 text-white/60">
                      <Search className="w-6 h-6" />
                    </div>
                    <input
                      type="text"
                      value={currentInput}
                      onChange={(e) => setCurrentInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={currentCategory.placeholder}
                      className="w-full pl-16 pr-6 py-6 bg-white/10 border-2 border-white/30 rounded-2xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-white placeholder-white/60 text-lg backdrop-blur-sm transition-all duration-300"
                    />
                    {isSearching && (
                      <div className="absolute right-6 top-1/2 transform -translate-y-1/2">
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                      </div>
                    )}
                  </div>

                  {currentInput.trim() && (
                    <motion.button
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => addPreference(currentInput.trim())}
                      className="px-6 py-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Add
                    </motion.button>
                  )}
                </div>

                {/* Auto-search indicator */}
                {currentInput.length > 0 && currentInput.length < 2 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-2 text-white/60 text-sm flex items-center"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Type at least 2 characters to search automatically...
                  </motion.div>
                )}

                {/* Tips Toggle */}
                <div className="mt-4 flex items-center justify-between">
                  <motion.button
                    onClick={() => setShowTips(!showTips)}
                    className="text-blue-200 hover:text-white transition-colors text-sm flex items-center"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {showTips ? "Hide tips" : "Show helpful tips"}
                  </motion.button>

                  {/* Real-time insight */}
                  <motion.div
                    key={currentInsight}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center text-sm text-purple-200"
                  >
                    {(() => {
                      const CurrentIcon = insights[currentInsight].icon;
                      return (
                        <CurrentIcon
                          className={`w-4 h-4 mr-2 ${insights[currentInsight].color}`}
                        />
                      );
                    })()}
                    {insights[currentInsight].text}
                  </motion.div>
                </div>

                {/* Tips Section */}
                <AnimatePresence>
                  {showTips && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 bg-white/5 rounded-xl p-4 border border-white/10"
                    >
                      <h4 className="text-white font-medium mb-2 flex items-center">
                        <Sparkles className="w-4 h-4 mr-2 text-yellow-400" />
                        Helpful Tips:
                      </h4>
                      <ul className="space-y-1">
                        {currentCategory.tips.map((tip, index) => (
                          <li
                            key={index}
                            className="text-blue-100 text-sm flex items-start"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mr-3 mt-2 flex-shrink-0" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Enhanced Auto-Search Results */}
              <AnimatePresence>
                {searchResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-6 bg-white/5 rounded-2xl p-6 border border-white/10"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-white font-semibold flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
                        Auto-Search Results ({searchResults.length})
                      </h4>
                      <span className="text-white/60 text-sm">
                        Click to add to your profile
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {searchResults.map((result, index) => (
                        <motion.button
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => addPreference(result.name)}
                          className="text-left p-4 bg-white/10 rounded-xl hover:bg-white/20 border border-white/20 hover:border-white/40 transition-all duration-200 group"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-white group-hover:text-blue-200 transition-colors">
                                {result.name}
                              </div>
                              {result.category && (
                                <div className="text-sm text-white/60 capitalize mt-1 flex items-center">
                                  <span>{result.category}</span>
                                  {result.popularity && (
                                    <>
                                      <span className="mx-2">•</span>
                                      <div className="flex items-center">
                                        <Users className="w-3 h-3 mr-1" />
                                        <span className="text-green-400">
                                          {Math.round(result.popularity * 100)}%
                                          popular
                                        </span>
                                      </div>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center ml-4"
                            >
                              <Plus className="w-5 h-5 text-white" />
                            </motion.div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {hasSearched &&
                  searchResults.length === 0 &&
                  !isSearching &&
                  currentInput.length >= 2 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 bg-white/5 rounded-2xl p-6 border border-white/10 text-center"
                    >
                      <div className="text-white/60 mb-4">
                        No results found for "{currentInput}"
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => addPreference(currentInput.trim())}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2 mx-auto"
                      >
                        <Plus className="w-5 h-5" />
                        Add "{currentInput}" anyway
                      </motion.button>
                    </motion.div>
                  )}
              </AnimatePresence>

              {/* Popular Choices */}
              {searchResults.length === 0 &&
                currentInput.length === 0 &&
                !hasSearched && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-white/80 font-medium flex items-center">
                        <Star className="w-5 h-5 mr-2 text-yellow-400" />
                        Popular choices to get you started:
                      </p>
                      <span className="text-white/60 text-sm">
                        Click to add
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {currentCategory.examples.map((example, index) => (
                        <motion.button
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6 + index * 0.1 }}
                          onClick={() => addPreference(example)}
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-6 py-3 bg-gradient-to-r from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 text-white rounded-full text-sm border border-white/20 hover:border-white/40 transition-all duration-200 flex items-center gap-2 group"
                        >
                          <Plus className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                          {example}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
            </div>

            {/* Enhanced Selections Display */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mb-10"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white flex items-center">
                  <Award className="w-6 h-6 text-yellow-400 mr-3" />
                  Your {currentCategory.name} Profile
                  <span className="ml-3 text-lg text-white/60">
                    ({currentPrefs.length}/5)
                  </span>
                </h3>
                <div className="flex items-center space-x-4 text-white/60 text-sm">
                  <span>Add at least 2 to continue</span>
                  {canProceed && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center text-green-400"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Ready!
                    </motion.div>
                  )}
                </div>
              </div>

              {currentPrefs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {currentPrefs.map((pref, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      className="group relative"
                    >
                      <div className="flex items-center justify-between bg-gradient-to-r from-white/10 to-white/5 border border-white/20 text-white px-6 py-4 rounded-xl backdrop-blur-sm hover:border-white/40 transition-all duration-300">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mr-4 text-white font-bold">
                            {index + 1}
                          </div>
                          <span className="font-medium">{pref}</span>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => removePreference(pref)}
                          className="w-8 h-8 bg-red-500/20 hover:bg-red-500/40 border border-red-400/30 hover:border-red-400/60 rounded-lg flex items-center justify-center text-red-300 hover:text-red-200 transition-all ml-3 opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-4 h-4" />
                        </motion.button>
                      </div>

                      {/* Progress indicator for this preference */}
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 rounded-b-xl overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${((index + 1) / 5) * 100}%` }}
                          transition={{
                            delay: 0.5 + index * 0.1,
                            duration: 0.8,
                          }}
                          className="h-full bg-gradient-to-r from-green-400 to-blue-400"
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16 border border-white/10 rounded-2xl bg-white/5"
                >
                  <Sparkles className="w-16 h-16 mx-auto mb-6 text-white/40" />
                  <p className="text-lg text-white/60 mb-2">
                    Start building your {currentCategory.name.toLowerCase()}{" "}
                    profile
                  </p>
                  <p className="text-sm text-white/40">
                    Type above for auto-suggestions or choose from popular
                    options
                  </p>
                </motion.div>
              )}

              {/* Progress visualization for current category */}
              {currentPrefs.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="mt-6 flex items-center justify-center"
                >
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <motion.div
                        key={num}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.9 + num * 0.1 }}
                        className={`w-3 h-3 rounded-full ${
                          num <= currentPrefs.length
                            ? "bg-gradient-to-r from-green-400 to-blue-400"
                            : "bg-white/20"
                        }`}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Enhanced Navigation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex justify-between items-center"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={prevStep}
                disabled={currentStep === 0}
                className="flex items-center px-8 py-4 text-white/80 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 bg-white/10 rounded-xl border border-white/20 hover:bg-white/20"
              >
                <ChevronLeft className="w-5 h-5 mr-2" />
                Previous
              </motion.button>

              <div className="flex items-center space-x-4">
                {/* Current progress insight */}
                <div className="text-center text-white/60 text-sm">
                  <div className="font-medium">
                    {totalPreferences} preferences across{" "}
                    {
                      Object.keys(preferences).filter(
                        (k) => preferences[k].length > 0
                      ).length
                    }{" "}
                    domains
                  </div>
                  <div className="text-xs mt-1">
                    Fresh cultural diversity building...
                  </div>
                </div>

                <motion.button
                  whileHover={
                    canProceed
                      ? {
                          scale: 1.05,
                          boxShadow: "0 10px 30px rgba(139, 92, 246, 0.3)",
                        }
                      : { scale: 1.02 }
                  }
                  whileTap={{ scale: 0.95 }}
                  onClick={nextStep}
                  disabled={!canProceed}
                  className={`relative overflow-hidden flex items-center px-12 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                    canProceed
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg"
                      : "bg-white/10 text-white/50 cursor-not-allowed"
                  }`}
                >
                  {currentStep === categories.length - 1 ? (
                    <>
                      <Brain className="w-6 h-6 mr-3" />
                      Analyze My Culture
                      <Sparkles className="w-5 h-5 ml-3" />
                    </>
                  ) : (
                    <>
                      Continue Journey
                      <ChevronRight className="w-5 h-5 ml-3" />
                    </>
                  )}

                  {/* Animated background for enabled state */}
                  {canProceed && (
                    <motion.div
                      initial={{ x: "-100%" }}
                      animate={{ x: "100%" }}
                      transition={{
                        repeat: Infinity,
                        duration: 2,
                        ease: "linear",
                        repeatDelay: 1,
                      }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    />
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Cultural Insights Sidebar */}
        {totalPreferences > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1 }}
            className="fixed right-8 top-1/2 transform -translate-y-1/2 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 max-w-xs hidden xl:block"
          >
            <h4 className="text-white font-bold mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-yellow-400" />
              Building Your DNA
            </h4>

            <div className="space-y-4">
              {categories.map((category, index) => (
                <div
                  key={index}
                  className={`flex items-center space-x-3 transition-all ${
                    index <= currentStep ? "opacity-100" : "opacity-40"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      completedSteps.includes(index)
                        ? "bg-green-500"
                        : index === currentStep
                        ? `bg-gradient-to-r ${category.gradient}`
                        : "bg-white/20"
                    }`}
                  >
                    {completedSteps.includes(index) ? (
                      <CheckCircle className="w-4 h-4 text-white" />
                    ) : (
                      <category.icon className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-white text-sm font-medium">
                      {category.name}
                    </div>
                    <div className="text-white/60 text-xs">
                      {preferences[category.id]?.length || 0} preferences
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10"
            >
              <div className="text-white text-sm font-medium mb-2">
                Fresh Cultural Diversity
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min(100, (totalPreferences / 15) * 100)}%`,
                  }}
                  className="bg-gradient-to-r from-purple-400 to-blue-400 h-2 rounded-full"
                />
              </div>
              <div className="text-white/60 text-xs mt-2">
                {Math.round(Math.min(100, (totalPreferences / 15) * 100))}%
                complete • Fresh start
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
