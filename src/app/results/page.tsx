"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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

export default function ResultsPage() {
  const [preferences, setPreferences] = useState<Record<string, string[]>>({});
  const [culturalProfile, setCulturalProfile] =
    useState<CulturalProfile | null>(null);
  const [narrative, setNarrative] = useState<CulturalNarrative | null>(null);
  const [discoveries, setDiscoveries] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "story" | "connections" | "discoveries"
  >("story");

  useEffect(() => {
    loadPreferencesAndAnalyze();
  }, []);

  const loadPreferencesAndAnalyze = async () => {
    try {
      // Load preferences from localStorage
      const storedPrefs = localStorage.getItem("culturalPreferences");
      if (!storedPrefs) {
        window.location.href = "/onboarding";
        return;
      }

      const prefs = JSON.parse(storedPrefs);
      setPreferences(prefs);

      // Analyze cultural profile with Qloo
      const profile = await qlooService.analyzeCrossDomainConnections(prefs);
      setCulturalProfile(profile);

      // Generate narrative with OpenAI
      const story = await openaiService.generateCulturalNarrative(
        prefs,
        profile
      );
      setNarrative(story);

      // Generate discoveries
      const recs = await openaiService.generateDiscoveryRecommendations(
        story,
        prefs
      );
      setDiscoveries(recs);

      setIsLoading(false);
    } catch (error) {
      console.error("Error analyzing cultural profile:", error);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-24 h-24 mx-auto mb-8"
          >
            <Brain className="w-24 h-24 text-purple-600" />
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Crafting Your Cultural Story...
          </h2>
          <p className="text-gray-600 text-lg">
            Connecting your preferences across domains
          </p>
        </motion.div>
      </div>
    );
  }

  if (!narrative || !culturalProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Something went wrong
          </h2>
          <Link href="/onboarding">
            <button className="bg-purple-600 text-white px-6 py-3 rounded-lg">
              Try Again
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // Data for visualizations
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

  const COLORS = ["#8B5CF6", "#3B82F6", "#10B981", "#F59E0B", "#EF4444"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-8 py-6 bg-white/50 backdrop-blur-sm">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Link href="/" className="flex items-center">
            <Brain className="w-8 h-8 text-purple-600 mr-3" />
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              KulturalMente
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            <button className="flex items-center px-4 py-2 text-gray-600 hover:text-purple-600 transition-colors">
              <Share2 className="w-5 h-5 mr-2" />
              Share
            </button>
            <button className="flex items-center px-4 py-2 text-gray-600 hover:text-purple-600 transition-colors">
              <Download className="w-5 h-5 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center mb-6">
              <Sparkles className="w-12 h-12 text-purple-600 mr-4" />
              <h1 className="text-5xl font-bold text-gray-900">
                {narrative.title}
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              {narrative.culturalDNA}
            </p>

            {/* Tab Navigation */}
            <div className="flex justify-center space-x-2 bg-white rounded-full p-2 shadow-lg max-w-md mx-auto">
              {[
                { id: "story", label: "Your Story", icon: Heart },
                { id: "connections", label: "Connections", icon: Globe },
                { id: "discoveries", label: "Discoveries", icon: Compass },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                      : "text-gray-600 hover:text-purple-600"
                  }`}
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          {activeTab === "story" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              {/* Cultural Story */}
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Heart className="w-6 h-6 text-red-500 mr-3" />
                  Your Cultural Story
                </h2>
                <div className="prose prose-gray max-w-none">
                  {narrative.story.split("\n\n").map((paragraph, index) => (
                    <p
                      key={index}
                      className="mb-4 text-gray-700 leading-relaxed"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>

              {/* Insights & Themes */}
              <div className="space-y-6">
                {/* Key Insights */}
                <div className="bg-white rounded-2xl p-8 shadow-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <Zap className="w-5 h-5 text-yellow-500 mr-2" />
                    Key Insights
                  </h3>
                  <ul className="space-y-3">
                    {narrative.insights.map((insight, index) => (
                      <li key={index} className="flex items-start">
                        <Star className="w-5 h-5 text-purple-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Cultural Themes Visualization */}
                <div className="bg-white rounded-2xl p-8 shadow-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Your Cultural Themes
                  </h3>
                  {themeData.length > 0 && (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={themeData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
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
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                  <div className="mt-4 space-y-2">
                    {culturalProfile.themes.map((theme, index) => (
                      <div key={index} className="flex items-center">
                        <div
                          className="w-4 h-4 rounded-full mr-3"
                          style={{
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        />
                        <span className="text-gray-700">{theme}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "connections" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              {/* Connection Strength Chart */}
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Globe className="w-6 h-6 text-blue-500 mr-3" />
                  Cross-Domain Connections
                </h2>
                {connectionData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={connectionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={100}
                      />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8B5CF6" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Map className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No strong cross-domain connections found yet.</p>
                  </div>
                )}
              </div>

              {/* Connection Details */}
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  How Your Interests Connect
                </h3>
                <div className="space-y-4">
                  {culturalProfile.connections.length > 0 ? (
                    culturalProfile.connections.map((connection, index) => (
                      <div
                        key={index}
                        className="border-l-4 border-purple-500 pl-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">
                            {connection.domain1} ↔ {connection.domain2}
                          </h4>
                          <div className="flex items-center">
                            <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                              <div
                                className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full"
                                style={{
                                  width: `${connection.strength * 100}%`,
                                }}
                              />
                            </div>
                            <span className="text-sm text-gray-500">
                              {Math.round(connection.strength * 100)}%
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm">
                          {connection.explanation}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      Add more preferences to discover connections between your
                      interests.
                    </p>
                  )}
                </div>

                {/* Your Preferences Summary */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-4">
                    Your Cultural Profile
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(preferences).map(([domain, items]) => (
                      <div key={domain} className="bg-gray-50 rounded-lg p-4">
                        <h5 className="font-medium text-gray-900 mb-2 capitalize">
                          {domain}
                        </h5>
                        <div className="flex flex-wrap gap-1">
                          {items.map((item, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-white text-gray-700 text-xs rounded-full"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "discoveries" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              {/* AI Recommendations */}
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Compass className="w-6 h-6 text-green-500 mr-3" />
                  Personalized Discoveries
                </h2>
                <div className="space-y-4">
                  {discoveries.length > 0 ? (
                    discoveries.map((discovery, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200"
                      >
                        <div className="flex items-start">
                          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3 mt-0.5">
                            {index + 1}
                          </div>
                          <p className="text-gray-800 leading-relaxed">
                            {discovery}
                          </p>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Compass className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No discoveries generated yet.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Cultural Evolution & Next Steps */}
              <div className="space-y-6">
                {/* Cultural Patterns */}
                <div className="bg-white rounded-2xl p-8 shadow-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <Sparkles className="w-5 h-5 text-purple-500 mr-2" />
                    Cultural Patterns
                  </h3>
                  <div className="space-y-3">
                    {culturalProfile.patterns.length > 0 ? (
                      culturalProfile.patterns.map((pattern, index) => (
                        <div
                          key={index}
                          className="flex items-center p-3 bg-purple-50 rounded-lg"
                        >
                          <Star className="w-4 h-4 text-purple-500 mr-3" />
                          <span className="text-gray-700">{pattern}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-4">
                        Continue exploring to reveal more patterns.
                      </p>
                    )}
                  </div>
                </div>

                {/* Next Recommendations */}
                <div className="bg-white rounded-2xl p-8 shadow-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Continue Your Journey
                  </h3>
                  <div className="space-y-4">
                    {narrative.recommendations.map((rec, index) => (
                      <div
                        key={index}
                        className="flex items-start p-3 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4 text-gray-400 mr-3 mt-0.5 transform rotate-180" />
                        <span className="text-gray-700">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white">
                  <h3 className="text-xl font-bold mb-4">Ready for More?</h3>
                  <p className="mb-6 opacity-90">
                    Refine your cultural profile or explore new domains to
                    unlock deeper insights.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link href="/onboarding">
                      <button className="w-full sm:w-auto bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                        Add More Preferences
                      </button>
                    </Link>
                    <button className="w-full sm:w-auto border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">
                      Share Your Story
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
