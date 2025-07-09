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
} from "lucide-react";
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
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white px-12 py-6 rounded-full font-bold text-xl hover:bg-white/20 transition-all duration-300 flex items-center"
              >
                <Play className="mr-3 w-6 h-6 group-hover:scale-110 transition-transform" />
                Watch Demo
              </motion.button>
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

      {/* Example Section */}
      <section className="relative z-10 py-32 bg-gradient-to-r from-purple-900/50 to-blue-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h3 className="text-5xl font-bold text-white mb-8">
              Example Cultural DNA
            </h3>
            <p className="text-2xl text-blue-100 max-w-3xl mx-auto font-light">
              See how we transform scattered preferences into meaningful
              cultural insights.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="bg-white/10 backdrop-blur-sm rounded-3xl p-12 border border-white/20 max-w-5xl mx-auto"
          >
            <div className="mb-10">
              <h4 className="text-4xl font-bold text-white mb-6 flex items-center">
                <Sparkles className="w-10 h-10 text-yellow-400 mr-4" />
                "The Intimate Grandeur Seeker"
              </h4>
              <p className="text-blue-100 text-xl leading-relaxed font-light">
                Your love of Billie Eilish, The Grand Budapest Hotel, and
                Ethiopian food reveals a fascinating cultural pattern: you're
                drawn to experiences that feel both deeply personal and
                cinematically grand. You seek beauty in unexpected places and
                value authentic expression over mainstream appeal.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h5 className="font-bold text-white mb-4 text-xl flex items-center">
                  <Star className="w-5 h-5 text-yellow-400 mr-2" />
                  Your Cultural Themes
                </h5>
                <ul className="space-y-3">
                  {[
                    "Intimate yet cinematic experiences",
                    "Aesthetic sophistication",
                    "Emotional authenticity",
                  ].map((item, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="flex items-center text-blue-100"
                    >
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 mr-3" />
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </div>

              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h5 className="font-bold text-white mb-4 text-xl flex items-center">
                  <Compass className="w-5 h-5 text-blue-400 mr-2" />
                  Recommended Discoveries
                </h5>
                <ul className="space-y-3">
                  {[
                    "A boutique hotel in Prague",
                    "Japanese whisky tasting",
                    "Underground jazz in Tokyo",
                  ].map((item, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="flex items-center text-blue-100"
                    >
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 mr-3" />
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
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
