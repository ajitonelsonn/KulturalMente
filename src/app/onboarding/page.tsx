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
}

const categories: PreferenceCategory[] = [
  {
    id: "music",
    name: "Music",
    icon: Music,
    description: "Artists, genres, or songs that move your soul",
    placeholder: "Billie Eilish, jazz, The Beatles...",
    examples: ["Billie Eilish", "Pink Floyd", "Kendrick Lamar", "Bon Iver"],
    gradient: "from-purple-500 to-pink-500",
  },
  {
    id: "movies",
    name: "Movies & TV",
    icon: Film,
    description: "Films, shows, or directors that captivate you",
    placeholder: "The Grand Budapest Hotel, Breaking Bad...",
    examples: [
      "The Grand Budapest Hotel",
      "Parasite",
      "The Office",
      "Studio Ghibli",
    ],
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    id: "food",
    name: "Food & Dining",
    icon: Coffee,
    description: "Cuisines and dining experiences you crave",
    placeholder: "Ethiopian food, sushi, local cafes...",
    examples: ["Ethiopian cuisine", "Ramen", "Farm-to-table", "Street food"],
    gradient: "from-orange-500 to-red-500",
  },
  {
    id: "travel",
    name: "Travel & Places",
    icon: MapPin,
    description: "Destinations and experiences that inspire you",
    placeholder: "Tokyo, mountain hiking, boutique hotels...",
    examples: [
      "Tokyo",
      "Backpacking Europe",
      "National parks",
      "Cultural festivals",
    ],
    gradient: "from-green-500 to-teal-500",
  },
  {
    id: "books",
    name: "Books & Literature",
    icon: Book,
    description: "Authors, genres, or stories that resonate",
    placeholder: "Haruki Murakami, sci-fi, poetry...",
    examples: ["Haruki Murakami", "Science fiction", "Poetry", "Non-fiction"],
    gradient: "from-indigo-500 to-purple-500",
  },
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [preferences, setPreferences] = useState<Record<string, string[]>>({});
  const [currentInput, setCurrentInput] = useState("");
  const [searchResults, setSearchResults] = useState<QlooEntity[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const currentCategory = categories[currentStep];

  useEffect(() => {
    if (currentInput.length > 2) {
      searchPreferences(currentInput);
    } else {
      setSearchResults([]);
    }
  }, [currentInput]);

  const searchPreferences = async (query: string) => {
    setIsSearching(true);
    try {
      const results = await qlooService.searchEntities(
        query,
        currentCategory.id
      );
      setSearchResults(results.slice(0, 6));
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    }
    setIsSearching(false);
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
    } else {
      startAnalysis();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setCurrentInput("");
      setSearchResults([]);
    }
  };

  const startAnalysis = () => {
    setIsAnalyzing(true);
    localStorage.setItem("culturalPreferences", JSON.stringify(preferences));
    setTimeout(() => {
      window.location.href = "/results";
    }, 3000);
  };

  const currentPrefs = preferences[currentCategory.id] || [];
  const canProceed = currentPrefs.length >= 2;

  if (isAnalyzing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
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
            Analyzing Your Cultural DNA...
          </motion.h2>

          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 3 }}
            className="w-80 h-2 bg-white/20 rounded-full mx-auto mb-6 overflow-hidden"
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 3 }}
              className="h-full bg-gradient-to-r from-purple-400 to-blue-400 rounded-full"
            />
          </motion.div>

          <p className="text-blue-100 text-lg max-w-md mx-auto">
            Finding hidden connections across your cultural preferences...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-30">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      {/* Header */}
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

          {/* Progress */}
          <div className="flex items-center space-x-4">
            <span className="text-blue-200 font-medium">
              {currentStep + 1} of {categories.length}
            </span>
            <div className="w-40 bg-white/20 rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${((currentStep + 1) / categories.length) * 100}%`,
                }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-r from-purple-400 to-blue-400 h-3 rounded-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4 }}
            className="bg-white/10 backdrop-blur-sm rounded-3xl shadow-2xl p-12 border border-white/20"
          >
            {/* Category Header */}
            <div className="text-center mb-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="flex items-center justify-center mb-8"
              >
                <div
                  className={`w-24 h-24 bg-gradient-to-r ${currentCategory.gradient} rounded-2xl flex items-center justify-center shadow-lg`}
                >
                  <currentCategory.icon className="w-12 h-12 text-white" />
                </div>
              </motion.div>
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-4xl font-bold text-white mb-4"
              >
                {currentCategory.name}
              </motion.h2>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-blue-100 text-xl font-light"
              >
                {currentCategory.description}
              </motion.p>
            </div>

            {/* Input Section */}
            <div className="mb-10">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="relative"
              >
                <div className="absolute left-6 top-1/2 transform -translate-y-1/2 text-white/60">
                  <Search className="w-6 h-6" />
                </div>
                <input
                  type="text"
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  placeholder={currentCategory.placeholder}
                  className="w-full pl-16 pr-6 py-6 bg-white/10 border border-white/30 rounded-2xl focus:ring-2 focus:ring-purple-400 focus:border-transparent text-white placeholder-white/60 text-lg backdrop-blur-sm transition-all duration-300"
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && currentInput.trim()) {
                      addPreference(currentInput.trim());
                    }
                  }}
                />
                {currentInput && (
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    onClick={() => addPreference(currentInput.trim())}
                    className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-purple-500 to-blue-500 text-white p-2 rounded-lg hover:scale-110 transition-transform"
                  >
                    <Plus className="w-5 h-5" />
                  </motion.button>
                )}
              </motion.div>

              {/* Search Results */}
              <AnimatePresence>
                {searchResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-6 bg-white/5 rounded-2xl p-6 border border-white/10"
                  >
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {searchResults.map((result, index) => (
                        <motion.button
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => addPreference(result.name)}
                          className="text-left p-4 bg-white/10 rounded-xl hover:bg-white/20 border border-white/20 hover:border-white/40 transition-all duration-200 group"
                        >
                          <div className="font-medium text-white group-hover:text-blue-200 transition-colors">
                            {result.name}
                          </div>
                          {result.category && (
                            <div className="text-sm text-white/60 capitalize mt-1">
                              {result.category}
                            </div>
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Examples */}
              {searchResults.length === 0 && currentInput.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mt-6"
                >
                  <p className="text-white/60 mb-4 font-medium">
                    Popular choices:
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {currentCategory.examples.map((example, index) => (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        onClick={() => addPreference(example)}
                        className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm border border-white/20 hover:border-white/40 transition-all duration-200 hover:scale-105"
                      >
                        {example}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Selected Preferences */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mb-10"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white flex items-center">
                  <Star className="w-6 h-6 text-yellow-400 mr-3" />
                  Your selections ({currentPrefs.length}/5)
                </h3>
                <span className="text-white/60">
                  Add at least 2 to continue
                </span>
              </div>

              {currentPrefs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {currentPrefs.map((pref, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between bg-gradient-to-r from-white/10 to-white/5 border border-white/20 text-white px-6 py-4 rounded-xl backdrop-blur-sm"
                    >
                      <span className="font-medium">{pref}</span>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removePreference(pref)}
                        className="text-white/60 hover:text-red-400 transition-colors ml-3"
                      >
                        <X className="w-5 h-5" />
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 text-white/60"
                >
                  <Sparkles className="w-16 h-16 mx-auto mb-6 opacity-40" />
                  <p className="text-lg">Start adding your preferences above</p>
                </motion.div>
              )}
            </motion.div>

            {/* Navigation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
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

              <motion.button
                whileHover={
                  canProceed
                    ? {
                        scale: 1.05,
                        boxShadow: "0 10px 30px rgba(139, 92, 246, 0.3)",
                      }
                    : {}
                }
                whileTap={{ scale: 0.95 }}
                onClick={nextStep}
                disabled={!canProceed}
                className="flex items-center px-12 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-bold text-lg"
              >
                {currentStep === categories.length - 1 ? (
                  <>
                    <Brain className="w-6 h-6 mr-3" />
                    Analyze My Culture
                  </>
                ) : (
                  <>
                    Next Step
                    <ChevronRight className="w-5 h-5 ml-3" />
                  </>
                )}
              </motion.button>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
