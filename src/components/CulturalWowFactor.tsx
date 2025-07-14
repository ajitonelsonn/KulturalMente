import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Sparkles,
  Music,
  Film,
  Coffee,
  MapPin,
  Book,
  Globe,
  Star,
  TrendingUp,
  Eye,
  Target,
} from "lucide-react";

// Type definitions
interface CulturalProfile {
  themes: string[];
  connections: Array<{
    domain1: string;
    domain2: string;
    strength: number;
    explanation: string;
    qlooEntities: string[];
  }>;
  patterns: string[];
  diversityScore?: number;
  culturalDepth?: number;
  qlooInsights?: {
    entityMapping?: Record<string, unknown[]>;
    totalEntitiesFound?: number;
    domainsWithEntities?: string[];
    categoryMappingUsed?: Record<string, string>;
    matchRate?: number;
    error?: string;
    [key: string]: unknown;
  };
}

interface CulturalNarrative {
  title: string;
  story: string;
  insights: string[];
  personality: string;
  culturalDNA: string;
  recommendations: string[];
  evolutionPredictions?: string[];
  culturalBlindSpots?: string[];
  diversityScore?: number;
}

interface DNAStrand {
  id: string;
  domain: string;
  item: string;
  angle: number;
  radius: number;
  height: number;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
  connections: Array<{
    domain1: string;
    domain2: string;
    strength: number;
    explanation: string;
    qlooEntities: string[];
  }>;
}

interface CulturalDNAHelixProps {
  culturalProfile: CulturalProfile;
  narrative: CulturalNarrative;
  preferences: Record<string, string[]>;
}

// Cultural DNA Helix Visualization Component
const CulturalDNAHelix: React.FC<CulturalDNAHelixProps> = ({
  culturalProfile,
  narrative,
  preferences,
}) => {
  const [activeStrand, setActiveStrand] = useState<string | null>(null);
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase((prev) => (prev + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const categoryIcons: Record<
    string,
    React.ComponentType<{ className?: string }>
  > = {
    music: Music,
    movies: Film,
    food: Coffee,
    travel: MapPin,
    books: Book,
  };

  const categoryColors: Record<string, string> = {
    music: "#8B5CF6",
    movies: "#3B82F6",
    food: "#F59E0B",
    travel: "#10B981",
    books: "#EF4444",
  };

  // Generate DNA strands from cultural data
  const generateDNAStrands = (): DNAStrand[] => {
    const strands: DNAStrand[] = [];
    const domains = Object.keys(preferences).filter(
      (key) => preferences[key].length > 0
    );

    domains.forEach((domain, domainIndex) => {
      preferences[domain].forEach((item, itemIndex) => {
        const angle =
          (domainIndex * 72 + itemIndex * 15 + animationPhase) % 360;
        const radius = 80 + itemIndex * 20;
        const height = domainIndex * 60 + itemIndex * 25;

        strands.push({
          id: `${domain}-${itemIndex}`,
          domain,
          item,
          angle,
          radius,
          height,
          color: categoryColors[domain],
          icon: categoryIcons[domain],
          connections:
            culturalProfile?.connections?.filter(
              (conn) => conn.domain1 === domain || conn.domain2 === domain
            ) || [],
        });
      });
    });

    return strands;
  };

  const dnaStrands = generateDNAStrands();

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 rounded-3xl overflow-hidden border border-white/10 backdrop-blur-sm">
      {/* 3D DNA Helix Container */}
      <div className="absolute inset-0 flex items-center justify-center perspective-1000">
        <div
          className="relative preserve-3d"
          style={{
            transform: `rotateY(${animationPhase}deg) rotateX(15deg)`,
            transition: "transform 0.05s linear",
          }}
        >
          {/* DNA Backbone */}
          <div className="absolute left-1/2 top-1/2 w-1 h-80 bg-gradient-to-b from-blue-400 to-purple-400 rounded-full transform -translate-x-1/2 -translate-y-1/2 opacity-30" />
          <div className="absolute left-1/2 top-1/2 w-1 h-80 bg-gradient-to-b from-purple-400 to-pink-400 rounded-full transform -translate-x-1/2 -translate-y-1/2 rotate-180 opacity-30" />

          {/* Cultural Data Points as DNA Base Pairs */}
          {dnaStrands.map((strand, index) => {
            const x = Math.cos((strand.angle * Math.PI) / 180) * strand.radius;
            const z = Math.sin((strand.angle * Math.PI) / 180) * strand.radius;
            const y = strand.height - 150;
            const IconComponent = strand.icon;

            return (
              <motion.div
                key={strand.id}
                className="absolute cursor-pointer"
                style={{
                  transform: `translate3d(${x}px, ${y}px, ${z}px)`,
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: activeStrand === strand.id ? 1.5 : 1,
                  opacity: 1,
                }}
                transition={{
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 200,
                }}
                onHoverStart={() => setActiveStrand(strand.id)}
                onHoverEnd={() => setActiveStrand(null)}
              >
                {/* Cultural Data Node */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white/30"
                  style={{
                    backgroundColor: strand.color,
                    boxShadow: `0 0 20px ${strand.color}50`,
                  }}
                >
                  <IconComponent className="w-4 h-4 text-white" />
                </div>

                {/* Connection Lines */}
                {strand.connections.map((connection, connIndex) => (
                  <div
                    key={connIndex}
                    className="absolute top-1/2 left-1/2 origin-left h-0.5 bg-gradient-to-r from-yellow-400 to-transparent rounded-full opacity-60"
                    style={{
                      width: `${connection.strength * 100}px`,
                      transform: `rotate(${connIndex * 45}deg)`,
                    }}
                  />
                ))}

                {/* Hover Tooltip */}
                <AnimatePresence>
                  {activeStrand === strand.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: 10 }}
                      className="absolute bottom-12 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap border border-white/20"
                    >
                      <div className="font-medium">{strand.item}</div>
                      <div className="text-xs text-gray-300 capitalize">
                        {strand.domain}
                      </div>
                      {strand.connections.length > 0 && (
                        <div className="text-xs text-yellow-400">
                          {strand.connections.length} connections
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Floating Cultural Themes */}
      <div className="absolute top-4 left-4 right-4">
        <div className="flex flex-wrap gap-2">
          {culturalProfile?.themes?.slice(0, 3).map((theme, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 + index * 0.2 }}
              className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs text-white border border-white/20"
            >
              {theme}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Cultural DNA Title */}
      <div className="absolute bottom-4 left-4 right-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-white"
        >
          <div className="text-sm text-white/60 mb-1">Your Cultural DNA</div>
          <div className="text-lg font-bold">
            {narrative?.title || "Analyzing..."}
          </div>
          <div className="text-xs text-white/80 mt-1">
            {dnaStrands.length} cultural markers •{" "}
            {culturalProfile?.connections?.length || 0} connections
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Cultural Journey Map Component
interface CulturalJourneyMapProps {
  narrative: CulturalNarrative;
  discoveries?: string[];
  evolutionPredictions?: string[];
}

interface JourneyPhase {
  phase: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  position: { x: number; y: number };
}

const CulturalJourneyMap: React.FC<CulturalJourneyMapProps> = ({
  narrative,
  discoveries,
}) => {
  const [activePhase, setActivePhase] = useState(0);

  const journeyPhases: JourneyPhase[] = [
    {
      phase: "Discovery",
      title: "Your Cultural Foundations",
      description:
        narrative?.culturalDNA || "Understanding your core preferences...",
      icon: Eye,
      color: "#8B5CF6",
      position: { x: 10, y: 20 },
    },
    {
      phase: "Analysis",
      title: "Pattern Recognition",
      description: "Finding hidden connections across domains",
      icon: Brain,
      color: "#3B82F6",
      position: { x: 30, y: 40 },
    },
    {
      phase: "Insights",
      title: narrative?.title || "Your Cultural Identity",
      description: "Your unique cultural archetype emerges",
      icon: Sparkles,
      color: "#10B981",
      position: { x: 50, y: 12 },
    },
    {
      phase: "Recommendations",
      title: "Personalized Discoveries",
      description: `${discoveries?.length || 0} tailored recommendations`,
      icon: Target,
      color: "#F59E0B",
      position: { x: 70, y: 40 },
    },
    {
      phase: "Evolution",
      title: "Future Growth",
      description: "Your cultural journey continues...",
      icon: TrendingUp,
      color: "#EF4444",
      position: { x: 85, y: 10 },
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActivePhase((prev) => (prev + 1) % journeyPhases.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-140 bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-3xl overflow-hidden border border-white/10 backdrop-blur-sm">
      {/* Journey Path */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#3B82F6" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#EF4444" stopOpacity="0.6" />
          </linearGradient>
        </defs>

        <motion.path
          d={`M ${journeyPhases[0].position.x * 4} ${
            journeyPhases[0].position.y * 3.2
          } 
              Q ${journeyPhases[1].position.x * 4} ${
            journeyPhases[1].position.y * 3.2
          } 
              ${journeyPhases[2].position.x * 4} ${
            journeyPhases[2].position.y * 3.2
          }
              Q ${journeyPhases[3].position.x * 4} ${
            journeyPhases[3].position.y * 3.2
          }
              ${journeyPhases[4].position.x * 4} ${
            journeyPhases[4].position.y * 3.2
          }`}
          stroke="url(#pathGradient)"
          strokeWidth="3"
          fill="none"
          strokeDasharray="10 5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
      </svg>

      {/* Journey Phases */}
      {journeyPhases.map((phase, index) => {
        const IconComponent = phase.icon;
        return (
          <motion.div
            key={index}
            className="absolute cursor-pointer"
            style={{
              left: `${phase.position.x}%`,
              top: `${phase.position.y}%`,
              transform: "translate(-50%, -50%)",
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: activePhase === index ? 1.3 : 1,
              opacity: 1,
            }}
            transition={{
              delay: index * 0.3,
              type: "spring",
              stiffness: 200,
            }}
            onHoverStart={() => setActivePhase(index)}
          >
            {/* Phase Node */}
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center border-4 border-white/30 shadow-2xl relative"
              style={{
                backgroundColor: phase.color,
                boxShadow: `0 0 30px ${phase.color}60`,
              }}
            >
              <IconComponent className="w-8 h-8 text-white" />

              {/* Pulse Effect for Active Phase */}
              {activePhase === index && (
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-white/50"
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </div>

            {/* Phase Info */}
            <AnimatePresence>
              {activePhase === index && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.8 }}
                  className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-black/90 backdrop-blur-sm text-white p-4 rounded-xl border border-white/20 min-w-48 text-center"
                >
                  <div className="text-sm font-bold text-gray-300 mb-1">
                    {phase.phase}
                  </div>
                  <div className="font-bold mb-2">{phase.title}</div>
                  <div className="text-sm text-gray-300">
                    {phase.description}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}

      {/* Journey Stats */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="flex justify-between items-center text-white text-sm">
          <div className="flex items-center">
            <Star className="w-4 h-4 mr-2 text-yellow-400" />
            <span>Cultural Journey Map</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>{narrative?.diversityScore || 75}/100 diversity</span>
            <span>{discoveries?.length || 0} discoveries</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Cultural Constellation Component
interface CulturalConstellationProps {
  preferences: Record<string, string[]>;
  culturalProfile: CulturalProfile;
}

interface ConstellationStar {
  id: string;
  domain: string;
  item: string;
  x: number;
  y: number;
  size: number;
  brightness: number;
  connections: Array<{
    domain1: string;
    domain2: string;
    strength: number;
    explanation: string;
    qlooEntities: string[];
  }>;
}

const CulturalConstellation: React.FC<CulturalConstellationProps> = ({
  preferences,
  culturalProfile,
}) => {
  const [hoveredStar, setHoveredStar] = useState<ConstellationStar | null>(
    null
  );
  const [tooltipTimer, setTooltipTimer] = useState<NodeJS.Timeout | null>(null);

  const handleStarHover = (star: ConstellationStar) => {
    // Clear any existing timer
    if (tooltipTimer) {
      clearTimeout(tooltipTimer);
    }

    setHoveredStar(star);
  };

  const handleStarLeave = () => {
    // Set a delay before hiding the tooltip
    const timer = setTimeout(() => {
      setHoveredStar(null);
    }, 1000); // 1 second delay

    setTooltipTimer(timer);
  };

  const handleTooltipHover = () => {
    // Clear the timer if user hovers over tooltip
    if (tooltipTimer) {
      clearTimeout(tooltipTimer);
      setTooltipTimer(null);
    }
  };

  const handleTooltipLeave = () => {
    // Hide tooltip immediately when leaving tooltip area
    setHoveredStar(null);
    if (tooltipTimer) {
      clearTimeout(tooltipTimer);
      setTooltipTimer(null);
    }
  };

  const generateConstellation = (): ConstellationStar[] => {
    const stars: ConstellationStar[] = [];
    const domains = Object.keys(preferences).filter(
      (key) => preferences[key].length > 0
    );

    domains.forEach((domain, domainIndex) => {
      const centerX = 20 + domainIndex * 15 + Math.random() * 10;
      const centerY = 20 + Math.random() * 60;

      preferences[domain].forEach((item, itemIndex) => {
        const angle = itemIndex * 60 + Math.random() * 30;
        const distance = 5 + Math.random() * 8;
        const x = centerX + Math.cos((angle * Math.PI) / 180) * distance;
        const y = centerY + Math.sin((angle * Math.PI) / 180) * distance;

        stars.push({
          id: `${domain}-${itemIndex}`,
          domain,
          item,
          x: Math.max(5, Math.min(95, x)),
          y: Math.max(5, Math.min(95, y)),
          size: 3 + Math.random() * 4,
          brightness: 0.6 + Math.random() * 0.4,
          connections:
            culturalProfile?.connections?.filter(
              (conn) => conn.domain1 === domain || conn.domain2 === domain
            ) || [],
        });
      });
    });

    return stars;
  };

  const stars = generateConstellation();
  const categoryColors: Record<string, string> = {
    music: "#8B5CF6",
    movies: "#3B82F6",
    food: "#F59E0B",
    travel: "#10B981",
    books: "#EF4444",
  };

  return (
    <div className="relative w-full h-96 bg-gradient-to-b from-indigo-900/30 to-black/50 rounded-3xl overflow-hidden border border-white/10 backdrop-blur-sm">
      {/* Stars */}
      {stars.map((star, index) => (
        <motion.div
          key={star.id}
          className="absolute cursor-pointer"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            transform: "translate(-50%, -50%)",
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: 1,
            opacity: star.brightness,
          }}
          transition={{
            delay: index * 0.05,
            type: "spring",
          }}
          whileHover={{ scale: 2 }}
          onHoverStart={() => handleStarHover(star)}
          onHoverEnd={handleStarLeave}
        >
          <div
            className="rounded-full"
            style={{
              width: `${star.size}px`,
              height: `${star.size}px`,
              backgroundColor: categoryColors[star.domain],
              boxShadow: `0 0 ${star.size * 2}px ${
                categoryColors[star.domain]
              }80`,
            }}
          />

          {/* Twinkle Effect */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ backgroundColor: categoryColors[star.domain] }}
            animate={{
              opacity: [0, 1, 0],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        </motion.div>
      ))}

      {/* Constellation Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {culturalProfile?.connections?.map((connection, index) => {
          const domain1Stars = stars.filter(
            (s) => s.domain === connection.domain1
          );
          const domain2Stars = stars.filter(
            (s) => s.domain === connection.domain2
          );

          if (domain1Stars.length === 0 || domain2Stars.length === 0)
            return null;

          const star1 = domain1Stars[0];
          const star2 = domain2Stars[0];

          return (
            <motion.line
              key={index}
              x1={`${star1.x}%`}
              y1={`${star1.y}%`}
              x2={`${star2.x}%`}
              y2={`${star2.y}%`}
              stroke="rgba(255, 255, 255, 0.3)"
              strokeWidth={connection.strength * 2}
              strokeDasharray="5 5"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.6 }}
              transition={{ delay: 2 + index * 0.3, duration: 1 }}
            />
          );
        })}
      </svg>

      {/* Hover Tooltip */}
      <AnimatePresence>
        {hoveredStar && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute z-10 bg-black/90 backdrop-blur-sm text-white p-3 rounded-lg border border-white/20 pointer-events-auto"
            style={{
              left: `${hoveredStar.x}%`,
              top: `${Math.max(15, hoveredStar.y - 15)}%`,
              transform: "translateX(-50%)",
            }}
            onMouseEnter={handleTooltipHover}
            onMouseLeave={handleTooltipLeave}
          >
            <div className="font-medium">{hoveredStar.item}</div>
            <div className="text-sm text-gray-300 capitalize">
              {hoveredStar.domain}
            </div>
            {hoveredStar.connections.length > 0 && (
              <div className="text-xs text-yellow-400 mt-1">
                {hoveredStar.connections.length} cosmic connections
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Constellation Info */}
      <div className="absolute top-4 left-4 text-white">
        <div className="text-lg font-bold mb-1">
          Your Cultural Constellation
        </div>
        <div className="text-sm text-gray-300">
          {stars.length} stars • {culturalProfile?.connections?.length || 0}{" "}
          connections
        </div>
      </div>
    </div>
  );
};

// Main Wow Factor Component
interface CulturalWowFactorProps {
  culturalProfile: CulturalProfile;
  narrative: CulturalNarrative;
  preferences: Record<string, string[]>;
  discoveries?: string[];
  evolutionPredictions?: string[];
}

const CulturalWowFactor: React.FC<CulturalWowFactorProps> = ({
  culturalProfile,
  narrative,
  preferences,
  discoveries,
  evolutionPredictions,
}) => {
  const [activeVisualization, setActiveVisualization] = useState<
    "dna" | "journey" | "constellation"
  >("dna");

  const visualizations = [
    { id: "dna" as const, name: "Cultural DNA", icon: Brain },
    { id: "journey" as const, name: "Journey Map", icon: Globe },
    { id: "constellation" as const, name: "Constellation", icon: Star },
  ];

  return (
    <div className="space-y-8">
      {/* Visualization Selector */}
      <div className="flex justify-center">
        <div className="flex bg-white/10 backdrop-blur-sm rounded-2xl p-2 border border-white/20">
          {visualizations.map((viz) => {
            const IconComponent = viz.icon;
            return (
              <motion.button
                key={viz.id}
                onClick={() => setActiveVisualization(viz.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all ${
                  activeVisualization === viz.id
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                <IconComponent className="w-5 h-5 mr-2" />
                {viz.name}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Visualization Container */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeVisualization}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          {activeVisualization === "dna" && (
            <CulturalDNAHelix
              culturalProfile={culturalProfile}
              narrative={narrative}
              preferences={preferences}
            />
          )}
          {activeVisualization === "journey" && (
            <CulturalJourneyMap
              narrative={narrative}
              discoveries={discoveries}
              evolutionPredictions={evolutionPredictions}
            />
          )}
          {activeVisualization === "constellation" && (
            <CulturalConstellation
              preferences={preferences}
              culturalProfile={culturalProfile}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Wow Factor Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-3 gap-6"
      >
        <div className="text-center bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <div className="text-3xl font-bold text-white mb-2">
            {Object.values(preferences).flat().length}
          </div>
          <div className="text-white/60">Cultural Markers</div>
        </div>
        <div className="text-center bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <div className="text-3xl font-bold text-white mb-2">
            {culturalProfile?.connections?.length || 0}
          </div>
          <div className="text-white/60">Deep Connections</div>
        </div>
        <div className="text-center bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <div className="text-3xl font-bold text-white mb-2">
            {narrative?.diversityScore || 75}%
          </div>
          <div className="text-white/60">Diversity Score</div>
        </div>
      </motion.div>
    </div>
  );
};

export default CulturalWowFactor;
