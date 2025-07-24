"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Play,
  Brain,
  Sparkles,
  Globe,
  Users,
  Target,
  Clock,
  Star,
  CheckCircle,
} from "lucide-react";
import Navigation from "@/components/Navigation";
import Link from "next/link";

export default function DemoPage() {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Auto-cycle through features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Cultural Analysis",
      description:
        "Advanced machine learning analyzes your cultural preferences to reveal hidden patterns and connections",
      highlight: "Real-time cultural intelligence",
      color: "from-purple-500 to-violet-500",
      stats: "10M+ data points analyzed",
    },
    {
      icon: Globe,
      title: "Cross-Domain Connections",
      description:
        "Discover surprising links between your music, movies, food, travel, and book preferences",
      highlight: "Qloo's cultural intelligence API",
      color: "from-blue-500 to-cyan-500",
      stats: "Infinite cultural connections",
    },
    {
      icon: Sparkles,
      title: "Personalized Cultural DNA",
      description:
        "Generate a unique cultural identity narrative that explains who you are through what you love",
      highlight: "OpenAI GPT-4o powered storytelling",
      color: "from-yellow-500 to-orange-500",
      stats: "100% personalized narratives",
    },
    {
      icon: Target,
      title: "Smart Recommendations",
      description:
        "Get tailored cultural discoveries and growth challenges based on your unique profile",
      highlight: "Privacy-first recommendations",
      color: "from-green-500 to-emerald-500",
      stats: "Actionable cultural insights",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>

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

      {/* Mouse follower */}
      <motion.div
        className="fixed w-6 h-6 bg-white/20 rounded-full pointer-events-none z-50 mix-blend-screen"
        style={{
          left: mousePosition.x - 12,
          top: mousePosition.y - 12,
        }}
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
      />

      {/* Header with Navigation */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <Navigation />
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.div
              animate={{
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1],
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="inline-flex items-center bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-sm rounded-2xl px-6 py-3 border border-white/20 mb-8"
            >
              <Play className="w-6 h-6 text-purple-400 mr-3" />
              <span className="text-white font-medium">
                Watch KulturalMente in Action
              </span>
            </motion.div>

            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
              See Your
              <span className="bg-gradient-to-r from-yellow-400 via-pink-400 to-blue-400 bg-clip-text text-transparent block">
                Cultural DNA
              </span>
              Come to Life
            </h1>

            <p className="text-2xl text-blue-100 max-w-4xl mx-auto mb-12 font-light leading-relaxed">
              Experience how artificial intelligence transforms your cultural
              preferences into a personalized narrative that reveals who you
              really are.
            </p>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap justify-center gap-8 mb-16"
            >
              {[
                {
                  icon: Users,
                  value: "1000+",
                  label: "Cultural Profiles Created",
                },
                { icon: Clock, value: "< 2min", label: "Analysis Time" },
                { icon: Star, value: "4.9/5", label: "User Rating" },
                { icon: Globe, value: "50+", label: "Countries Served" },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="flex items-center bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4 border border-white/20"
                >
                  <stat.icon className="w-6 h-6 text-purple-400 mr-4" />
                  <div className="text-left">
                    <div className="text-2xl font-bold text-white">
                      {stat.value}
                    </div>
                    <div className="text-sm text-blue-200">{stat.label}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Video Section */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative bg-black/20 backdrop-blur-sm rounded-3xl p-8 border border-white/20 overflow-hidden"
          >
            {/* Video Container */}
            <div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
              {!isVideoLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-900 to-blue-900">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full"
                  />
                </div>
              )}

              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/39GKuMeEGV0?si=dR71MFAS0sdD3VIV&autoplay=0&mute=1"
                title="KulturalMente Demo - Cultural DNA Analysis"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                onLoad={() => setIsVideoLoaded(true)}
                className="w-full h-full rounded-2xl"
              />
            </div>

            {/* Video Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-8 text-center"
            >
              <h3 className="text-2xl font-bold text-white mb-4">
                Complete Walkthrough: From Preferences to Cultural DNA
              </h3>
              <p className="text-blue-100 text-lg mb-6 max-w-3xl mx-auto">
                Watch as we demonstrate the entire KulturalMente experience -
                from entering your cultural preferences to discovering your
                unique cultural identity through AI-powered analysis.
              </p>

              <div className="flex flex-wrap justify-center gap-4">
                <div className="flex items-center bg-green-500/20 text-green-300 px-4 py-2 rounded-full border border-green-400/30">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">
                    Real Qloo API Integration
                  </span>
                </div>
                <div className="flex items-center bg-blue-500/20 text-blue-300 px-4 py-2 rounded-full border border-blue-400/30">
                  <Brain className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">
                    OpenAI GPT-4o Narratives
                  </span>
                </div>
                <div className="flex items-center bg-purple-500/20 text-purple-300 px-4 py-2 rounded-full border border-purple-400/30">
                  <Sparkles className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">3D Visualizations</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 py-32 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold text-white mb-8">
              Powered by Advanced AI
            </h2>
            <p className="text-2xl text-blue-100 max-w-3xl mx-auto font-light">
              Experience the cutting-edge technology that makes cultural DNA
              analysis possible
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Feature Cards */}
            <div className="space-y-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, x: 10 }}
                  onHoverStart={() => setActiveFeature(index)}
                  className={`p-8 rounded-3xl border cursor-pointer transition-all duration-500 ${
                    activeFeature === index
                      ? `bg-gradient-to-r ${feature.color} bg-opacity-20 border-white/40 shadow-2xl`
                      : "bg-white/10 backdrop-blur-sm border-white/20 hover:border-white/40"
                  }`}
                >
                  <div className="flex items-start space-x-6">
                    <motion.div
                      animate={
                        activeFeature === index
                          ? { rotate: 360, scale: 1.1 }
                          : {}
                      }
                      transition={{ duration: 1 }}
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center shadow-lg`}
                    >
                      <feature.icon className="w-8 h-8 text-white" />
                    </motion.div>

                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-white mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-blue-100 leading-relaxed mb-4">
                        {feature.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm">
                          <div
                            className={`w-2 h-2 rounded-full bg-gradient-to-r ${feature.color} mr-2`}
                          />
                          <span className="text-white/80 font-medium">
                            {feature.highlight}
                          </span>
                        </div>
                        <div className="text-white/60 text-sm font-medium">
                          {feature.stats}
                        </div>
                      </div>
                    </div>

                    {/* Active indicator */}
                    {activeFeature === index && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex-shrink-0"
                      >
                        <div className="w-4 h-4 bg-white rounded-full shadow-lg" />
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Visualization */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-3xl p-12 border border-white/20 backdrop-blur-sm relative overflow-hidden">
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='20' cy='20' r='2'/%3E%3C/g%3E%3C/svg%3E")`,
                    }}
                  />
                </div>

                {/* Central Brain */}
                <div className="relative z-10 text-center">
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
                      scale: { duration: 3, repeat: Infinity },
                    }}
                    className="w-32 h-32 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl"
                  >
                    <Brain className="w-16 h-16 text-white" />
                  </motion.div>

                  <h3 className="text-3xl font-bold text-white mb-6">
                    AI Cultural Intelligence
                  </h3>

                  {/* Orbiting Feature Icons */}
                  {features.map((feature, index) => {
                    const angle = index * 90 + ((Date.now() / 50) % 360);
                    const radius = 120;
                    const x = Math.cos((angle * Math.PI) / 180) * radius;
                    const y = Math.sin((angle * Math.PI) / 180) * radius;

                    return (
                      <motion.div
                        key={index}
                        className={`absolute w-16 h-16 rounded-full bg-gradient-to-r ${
                          feature.color
                        } flex items-center justify-center shadow-lg ${
                          activeFeature === index ? "scale-125 shadow-2xl" : ""
                        }`}
                        style={{
                          left: "50%",
                          top: "50%",
                          transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                        }}
                        animate={{
                          scale: activeFeature === index ? 1.25 : 1,
                        }}
                        transition={{ duration: 0.5 }}
                      >
                        <feature.icon className="w-8 h-8 text-white" />
                      </motion.div>
                    );
                  })}

                  {/* Connection Lines */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    {features.map((_, index) => {
                      const angle = index * 90 + ((Date.now() / 50) % 360);
                      const radius = 120;
                      const x1 = 50;
                      const y1 = 50;
                      const x2 =
                        x1 + (Math.cos((angle * Math.PI) / 180) * radius) / 4;
                      const y2 =
                        y1 + (Math.sin((angle * Math.PI) / 180) * radius) / 4;

                      return (
                        <motion.line
                          key={index}
                          x1={`${x1}%`}
                          y1={`${y1}%`}
                          x2={`${x2}%`}
                          y2={`${y2}%`}
                          stroke={
                            activeFeature === index
                              ? "#ffffff"
                              : "rgba(255,255,255,0.3)"
                          }
                          strokeWidth={activeFeature === index ? "3" : "1"}
                          strokeDasharray="5 5"
                          animate={{
                            strokeDashoffset: [0, 10],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        />
                      );
                    })}
                  </svg>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-black/20 backdrop-blur-sm border-t border-white/10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-6 md:mb-0">
              <Brain className="w-10 h-10 text-purple-400 mr-4" />
              <div>
                <span className="text-3xl font-bold text-white">
                  KulturalMente
                </span>
                <div className="text-white/60">
                  Cultural Intelligence Platform
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-8">
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
