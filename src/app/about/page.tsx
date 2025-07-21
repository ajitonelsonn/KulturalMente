"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Globe,
  MapPin,
  Flag,
  ExternalLink,
  Rocket,
  Brain,
} from "lucide-react";
import Navigation from "@/components/Navigation";
import Link from "next/link";

export default function AboutPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Floating orbs */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-32 h-32 rounded-full bg-gradient-to-r from-purple-400/10 to-blue-400/10 blur-xl"
            style={{
              left: `${20 + i * 20}%`,
              top: `${10 + Math.sin(i) * 20}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 8 + i * 2,
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

      {/* Main Profile Section */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-12 border border-white/20 relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='20' cy='20' r='2'/%3E%3C/g%3E%3C/svg%3E")`,
                }}
              />
            </div>

            <div className="relative z-10 text-center">
              {/* Profile Image */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="mb-8"
              >
                <motion.div
                  animate={{
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{ duration: 6, repeat: Infinity }}
                  className="w-32 h-32 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center mx-auto shadow-2xl relative"
                >
                  <User className="w-16 h-16 text-white" />

                  {/* Orbital ring */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 10,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute inset-0 border-2 border-white/20 rounded-full"
                  />
                </motion.div>
              </motion.div>

              {/* Name and Title */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mb-8"
              >
                <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
                  Ajito Nelson
                  <span className="bg-gradient-to-r from-yellow-400 via-pink-400 to-blue-400 bg-clip-text text-transparent block">
                    Lucio da Costa
                  </span>
                </h1>

                <p className="text-2xl text-blue-100 mb-6 font-light">
                  Data Engineer | AI & ML Enthusiast
                </p>

                <div className="flex items-center justify-center space-x-6 text-white/80">
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-green-400" />
                    <span>Dili, Timor-Leste</span>
                  </div>
                  <div className="flex items-center">
                    <Flag className="w-5 h-5 mr-2 text-red-400" />
                    <span>🇹🇱</span>
                  </div>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Link href="/onboarding">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center"
                  >
                    <Rocket className="w-5 h-5 mr-2" />
                    Try KulturalMente
                  </motion.button>
                </Link>

                <motion.a
                  href="https://ajitonelson.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto px-8 py-4 border border-white/30 text-white rounded-xl font-semibold hover:bg-white/10 transition-all flex items-center justify-center"
                >
                  <Globe className="w-5 h-5 mr-2" />
                  Visit My Website
                  <ExternalLink className="w-4 h-4 ml-2" />
                </motion.a>
              </motion.div>

              {/* Website Reference */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1 }}
                className="mt-8 text-white/60 text-sm"
              >
                For detailed portfolio, experience, and projects visit{" "}
                <a
                  href="https://ajitonelson.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-300 hover:text-blue-200 transition-colors underline"
                >
                  ajitonelson.com
                </a>
              </motion.div>
            </div>
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
