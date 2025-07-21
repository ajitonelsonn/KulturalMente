"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  Sparkles,
  Heart,
  Compass,
  ArrowRight,
  Play,
  Star,
  Users,
  Zap,
  Globe,
  Palette,
  Music,
  Film,
  Coffee,
  Clock,
  Target,
  BarChart3,
} from "lucide-react";
import Navigation from "@/components/Navigation";
import Link from "next/link";

export default function HomePage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setIsLoaded(true);

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>

        {/* Floating Elements */}
        <motion.div
          className="absolute top-20 left-10 w-4 h-4 bg-blue-400 rounded-full blur-sm"
          animate={{
            x: mousePosition.x * 0.02,
            y: mousePosition.y * 0.02,
          }}
          transition={{ type: "spring", stiffness: 150, damping: 15 }}
        />
        <motion.div
          className="absolute top-40 right-20 w-6 h-6 bg-purple-400 rounded-full blur-sm"
          animate={{
            x: mousePosition.x * -0.03,
            y: mousePosition.y * 0.03,
          }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
        />
        <motion.div
          className="absolute bottom-40 left-20 w-8 h-8 bg-pink-400 rounded-full blur-sm"
          animate={{
            x: mousePosition.x * 0.01,
            y: mousePosition.y * -0.02,
          }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        />
      </div>

      {/* Header with Navigation */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <Navigation />
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            {/* Logo */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex items-center justify-center mb-8"
            >
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute -inset-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur-lg opacity-30"
                />
                <div className="relative bg-white/10 backdrop-blur-sm rounded-full p-4 border border-white/20">
                  <Brain className="w-16 h-16 text-white" />
                </div>
              </div>
              <div className="ml-6">
                <h1 className="text-6xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                  KulturalMente
                </h1>
                <p className="text-blue-200 text-xl mt-2 font-light">
                  Cultural Intelligence Platform
                </p>
              </div>
            </motion.div>

            {/* Main Headline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="max-w-5xl mx-auto mb-8"
            >
              <h2 className="text-7xl font-bold text-white mb-6 leading-tight">
                Your Mind. Your Culture.{" "}
                <span className="bg-gradient-to-r from-yellow-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                  Your Story.
                </span>
              </h2>
              <p className="text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed font-light">
                Discover your unique cultural identity through AI-powered
                analysis. Understand not just what you like, but why you like it
                and what it reveals about who you are.
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20"
            >
              <Link href="/onboarding">
                <motion.button
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 20px 40px rgba(139, 92, 246, 0.3)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative bg-gradient-to-r from-purple-600 to-blue-600 text-white px-12 py-6 rounded-full font-bold text-xl overflow-hidden transition-all duration-300"
                >
                  <span className="relative z-10 flex items-center">
                    Discover Your Cultural DNA
                    <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.button>
              </Link>
              <Link href="/demo">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white px-12 py-6 rounded-full font-bold text-xl hover:bg-white/20 transition-all duration-300 flex items-center"
                >
                  <Play className="mr-3 w-6 h-6 group-hover:scale-110 transition-transform" />
                  Watch Demo
                </motion.button>
              </Link>
            </motion.div>

            {/* Cultural Icons Animation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="flex justify-center space-x-8 mb-16"
            >
              {[
                { icon: Music, delay: 0 },
                { icon: Film, delay: 0.1 },
                { icon: Coffee, delay: 0.2 },
                { icon: Globe, delay: 0.3 },
                { icon: Palette, delay: 0.4 },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: item.delay }}
                  className="relative"
                >
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: index * 0.2,
                    }}
                    className="bg-white/10 backdrop-blur-sm rounded-full p-4 border border-white/20"
                  >
                    <item.icon className="w-8 h-8 text-white" />
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-20 bg-white/5 backdrop-blur-sm border-y border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                icon: Brain,
                number: "∞",
                label: "Cultural Connections",
                color: "from-purple-400 to-pink-400",
              },
              {
                icon: Users,
                number: "10M+",
                label: "Cultural Data Points",
                color: "from-blue-400 to-cyan-400",
              },
              {
                icon: Zap,
                number: "< 2min",
                label: "Discovery Time",
                color: "from-green-400 to-emerald-400",
              },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center group"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotateY: 180 }}
                  transition={{ duration: 0.6 }}
                  className={`w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r ${stat.color} flex items-center justify-center`}
                >
                  <stat.icon className="w-10 h-10 text-white" />
                </motion.div>
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 + 0.3 }}
                  className="text-5xl font-bold text-white mb-3"
                >
                  {stat.number}
                </motion.div>
                <div className="text-blue-200 text-lg">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h3 className="text-5xl font-bold text-white mb-8">How It Works</h3>
            <p className="text-2xl text-blue-100 max-w-3xl mx-auto font-light">
              Our AI analyzes your cultural preferences across domains to reveal
              the deeper patterns that define your cultural identity.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                icon: Heart,
                title: "Share Your Preferences",
                description:
                  "Tell us about your favorite music, movies, food, travel destinations, and more.",
                color: "from-red-500 to-pink-500",
                delay: 0,
              },
              {
                icon: Brain,
                title: "AI Cultural Analysis",
                description:
                  "Our AI finds hidden connections between your preferences across different cultural domains.",
                color: "from-purple-500 to-blue-500",
                delay: 0.2,
              },
              {
                icon: Compass,
                title: "Discover Your Story",
                description:
                  "Get personalized insights about your cultural DNA and recommendations for new discoveries.",
                color: "from-green-500 to-teal-500",
                delay: 0.4,
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: feature.delay }}
                whileHover={{ y: -10 }}
                className="group relative"
              >
                <div className="absolute -inset-4 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-10 border border-white/20 hover:border-white/40 transition-all duration-500">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                    className={`w-20 h-20 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-8`}
                  >
                    <feature.icon className="w-10 h-10 text-white" />
                  </motion.div>
                  <h4 className="text-3xl font-bold text-white mb-6 group-hover:text-blue-100 transition-colors">
                    {feature.title}
                  </h4>
                  <p className="text-blue-100 text-lg leading-relaxed font-light">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Example Section */}
      <section className="relative z-10 py-32 bg-gradient-to-r from-purple-900/50 to-blue-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h3 className="text-5xl font-bold text-white mb-8">
              Live Cultural DNA Example
            </h3>
            <p className="text-2xl text-blue-100 max-w-3xl mx-auto font-light">
              See how we transform scattered preferences into meaningful
              cultural insights and visualizations.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="bg-white/10 backdrop-blur-sm rounded-3xl p-12 border border-white/20 max-w-6xl mx-auto"
          >
            {/* Header with Icon and Title */}
            <div className="text-center mb-12">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="flex items-center justify-center mb-6"
              >
                <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl p-4 mr-6 relative">
                  <Sparkles className="w-12 h-12 text-white" />
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    63
                  </div>
                </div>
                <div className="text-left">
                  <h4 className="text-4xl font-bold text-white mb-2">
                    "Eclectic Global Voyager"
                  </h4>
                  <div className="flex items-center text-blue-200">
                    <Star className="w-5 h-5 mr-2" />
                    <span className="text-lg">
                      Cultural Diversity Score: 63/100
                    </span>
                  </div>
                </div>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-blue-100 text-xl leading-relaxed font-light max-w-4xl mx-auto mb-8"
              >
                An eclectic mix of global influences and narratives, their core
                cultural essence lies in the seamless integration of diverse
                experiences into a cohesive, vibrant life journey.
              </motion.p>

              {/* Analysis Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex justify-center items-center space-x-8 mb-8 text-white/80"
              >
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  <span className="text-sm">72s analysis</span>
                </div>
                <div className="flex items-center">
                  <Target className="w-4 h-4 mr-2" />
                  <span className="text-sm">10 connections</span>
                </div>
                <div className="flex items-center">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  <span className="text-sm">63% confidence</span>
                </div>
              </motion.div>
            </div>

            {/* Three Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cultural Story */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/5 rounded-2xl p-6 border border-white/10"
              >
                <h5 className="font-bold text-white mb-4 text-xl flex items-center">
                  <Heart className="w-5 h-5 text-red-400 mr-2" />
                  Your Cultural Story
                </h5>
                <p className="text-blue-100 text-sm leading-relaxed mb-4">
                  In a world constantly pulsating to the rhythms of change,
                  there exists an individual for whom the cultural tapestry of
                  life is woven with vibrant threads of global experiences.
                  Rooted in the beats of Central Cee and Alan Walker, alongside
                  the rhythmic pulse of Rihanna, they find solace and
                  inspiration in the intricate musical landscape that spans
                  continents.
                </p>
                <p className="text-blue-100 text-sm leading-relaxed">
                  Their cinematic adventures are beautifully shaped by
                  tear-jerking heroes in "Spider-Man: Far From Home" and the
                  timeless tale of succession from "The Lion King II: Simba's
                  Pride." These narratives mirror their own journey of
                  self-discovery and growth.
                </p>
              </motion.div>

              {/* Key Insights */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white/5 rounded-2xl p-6 border border-white/10"
              >
                <h5 className="font-bold text-white mb-4 text-xl flex items-center">
                  <Zap className="w-5 h-5 text-yellow-400 mr-2" />
                  Key Insights
                </h5>
                <div className="space-y-3">
                  {[
                    "Strong thematic connections between media and music preferences indicate a pursuit of rich, narrative-driven experiences",
                    "Their varied travel interests suggest an inclination towards both cultural immersion and exploration of uncharted territories",
                    "Musical tastes reflect a broad appreciation for modern, global influences, indicating an openness to diverse soundscapes",
                    "Food choices reveal a blend of comfort in tradition and excitement in discovering new culinary experiences",
                    "Literary preferences for AI and non-fiction indicate a keen interest in technological advancement and factual storytelling",
                  ].map((insight, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="flex items-start text-blue-100 text-sm"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 mr-3 mt-2 flex-shrink-0" />
                      {insight}
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Cultural Themes & Connections */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-6"
              >
                {/* Themes */}
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <h5 className="font-bold text-white mb-4 text-lg flex items-center">
                    <Palette className="w-5 h-5 text-pink-400 mr-2" />
                    Cultural Themes
                  </h5>
                  <div className="space-y-2">
                    {[
                      "Comprehensive Cultural Database Recognition",
                      "Multi-Domain Cultural Coherence",
                      "Deep Domain Specialization",
                      "Mainstream Cultural Recognition",
                    ].map((theme, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                        className="text-xs text-blue-100 bg-white/5 px-3 py-2 rounded-lg border border-white/10"
                      >
                        {theme}
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Connections */}
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <h5 className="font-bold text-white mb-4 text-lg flex items-center">
                    <Globe className="w-5 h-5 text-blue-400 mr-2" />
                    Top Connections
                  </h5>
                  <div className="space-y-3">
                    {[
                      { domains: "music ↔ movies", strength: 95 },
                      { domains: "music ↔ food", strength: 95 },
                      { domains: "music ↔ books", strength: 95 },
                    ].map((conn, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + index * 0.1 }}
                        className="flex items-center justify-between"
                      >
                        <span className="text-xs text-blue-100">
                          {conn.domains}
                        </span>
                        <div className="flex items-center">
                          <div className="w-12 bg-white/20 rounded-full h-1.5 mr-2">
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{ width: `${conn.strength}%` }}
                              transition={{
                                delay: 0.9 + index * 0.1,
                                duration: 0.8,
                              }}
                              className="bg-gradient-to-r from-purple-400 to-blue-400 h-1.5 rounded-full"
                            />
                          </div>
                          <span className="text-xs text-white/80 font-medium">
                            {conn.strength}%
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Bottom Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="grid grid-cols-3 gap-6 mt-8 pt-8 border-t border-white/10"
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">13</div>
                <div className="text-sm text-white/60">
                  Cultural Preferences
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">10</div>
                <div className="text-sm text-white/60">
                  Cross-Domain Connections
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">63%</div>
                <div className="text-sm text-white/60">Diversity Score</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h3 className="text-5xl font-bold text-white mb-8">
              Ready to Discover Your Cultural DNA?
            </h3>
            <p className="text-2xl text-blue-100 max-w-3xl mx-auto mb-12 font-light">
              Join thousands of cultural explorers who have discovered their
              unique cultural identity and found amazing new experiences.
            </p>
            <Link href="/onboarding">
              <motion.button
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 25px 50px rgba(139, 92, 246, 0.4)",
                }}
                whileTap={{ scale: 0.95 }}
                className="group relative bg-gradient-to-r from-purple-600 to-blue-600 text-white px-16 py-8 rounded-full font-bold text-2xl overflow-hidden"
              >
                <span className="relative z-10 flex items-center">
                  Start Your Cultural Journey
                  <Sparkles className="ml-4 w-8 h-8 group-hover:rotate-12 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-black/20 backdrop-blur-sm border-t border-white/10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-6 md:mb-0">
              <Brain className="w-10 h-10 text-purple-400 mr-4" />
              <span className="text-3xl font-bold text-white">
                KulturalMente
              </span>
            </div>
            <div className="flex space-x-8">
              <span className="text-blue-200 text-lg">
                Your Mind. Your Culture. Your Story.
              </span>
            </div>
          </div>
          <div className="border-t border-white/10 mt-12 pt-8 text-center text-blue-300">
            <p>&copy; 2025 KulturalMente. Built for the Qloo LLM Hackathon.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
