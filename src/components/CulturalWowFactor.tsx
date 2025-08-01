import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Sparkles,
  Music,
  Film,
  Coffee,
  MapPin as MapIcon,
  Book,
  Globe,
  Star,
  TrendingUp,
  Eye,
  Target,
  Palette,
  Heart,
  Compass,
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Activity,
  Zap,
  Lightbulb,
  Download,
  Share2,
} from "lucide-react";

// Enhanced type definitions
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

// Enhanced Cultural DNA Helix Component
const CulturalDNAHelix: React.FC<{
  culturalProfile: CulturalProfile;
  narrative: CulturalNarrative;
  preferences: Record<string, string[]>;
}> = ({ culturalProfile, narrative, preferences }) => {
  const [activeStrand, setActiveStrand] = useState<string | null>(null);
  const [animationPhase, setAnimationPhase] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const animationRef = useRef<NodeJS.Timeout | null>(null);

  // Optimized animation with proper cleanup
  useEffect(() => {
    if (isPlaying) {
      animationRef.current = setInterval(() => {
        setAnimationPhase((prev) => (prev + 1) % 360);
      }, 100);
    } else if (animationRef.current) {
      clearInterval(animationRef.current);
      animationRef.current = null;
    }

    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, [isPlaying]);

  const categoryIcons: Record<
    string,
    React.ComponentType<{ className?: string }>
  > = {
    music: Music,
    film: Film,
    food: Coffee,
    travel: MapIcon,
    books: Book,
    culture: Globe,
    art: Palette,
    lifestyle: Heart,
    technology: Brain,
    sports: Activity,
    fashion: Sparkles,
    default: Star,
  };

  const getColorForDomain = (domain: string): string => {
    const colors: Record<string, string> = {
      music: "#FF6B6B",
      film: "#4ECDC4",
      food: "#45B7D1",
      travel: "#96CEB4",
      books: "#FFEAA7",
      culture: "#DDA0DD",
      art: "#98D8C8",
      lifestyle: "#F7DC6F",
      technology: "#BB8FCE",
      sports: "#85C1E9",
      fashion: "#F8C471",
    };
    return colors[domain.toLowerCase()] || "#A8E6CF";
  };

  // Create DNA strands from preferences with improved positioning
  const createDNAStrands = (): DNAStrand[] => {
    const strands: DNAStrand[] = [];
    let strandIndex = 0;

    Object.entries(preferences).forEach(([domain, items]) => {
      items.forEach((item, itemIndex) => {
        const angle = (strandIndex * 25 + animationPhase) % 360;
        const radius = 80 + Math.sin(strandIndex * 0.5) * 20;
        const height = 50 + (strandIndex % 8) * 40;

        strands.push({
          id: `${domain}-${itemIndex}`,
          domain,
          item,
          angle,
          radius,
          height,
          color: getColorForDomain(domain),
          icon: categoryIcons[domain.toLowerCase()] || categoryIcons.default,
          connections:
            culturalProfile?.connections?.filter(
              (conn) => conn.domain1 === domain || conn.domain2 === domain
            ) || [],
        });
        strandIndex++;
      });
    });

    return strands;
  };

  const dnaStrands = createDNAStrands();

  return (
    <div className="relative w-full h-96 overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900/50 via-purple-900/50 to-pink-900/50 backdrop-blur-sm border border-white/10">
      {/* Animation Controls */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 text-white hover:bg-white/20 transition-colors"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setAnimationPhase(0)}
          className="p-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 text-white hover:bg-white/20 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </motion.button>
      </div>

      {/* DNA Helix Visualization */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-80 h-80">
          {dnaStrands.map((strand, index) => {
            const x = Math.cos((strand.angle * Math.PI) / 180) * strand.radius;
            const y = Math.sin((strand.angle * Math.PI) / 180) * strand.radius;
            const IconComponent = strand.icon;

            return (
              <motion.div
                key={strand.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: 1,
                  scale: activeStrand === strand.id ? 1.2 : 1,
                  rotateY: strand.angle,
                }}
                transition={{
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                }}
                onHoverStart={() => setActiveStrand(strand.id)}
                onHoverEnd={() => setActiveStrand(null)}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-white/30 shadow-lg transition-all duration-300 group-hover:scale-110"
                  style={{ backgroundColor: strand.color }}
                >
                  <IconComponent className="w-4 h-4 text-white" />
                </div>

                {/* Connection Lines */}
                {strand.connections.map((connection, connIndex) => (
                  <motion.div
                    key={connIndex}
                    className="absolute top-1/2 left-1/2 w-px bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    style={{
                      height: `${connection.strength * 50}px`,
                      transformOrigin: "top",
                      transform: `rotate(${connIndex * 45}deg)`,
                    }}
                    initial={{ scaleY: 0, opacity: 0 }}
                    animate={{ scaleY: 1, opacity: 0.6 }}
                    transition={{ delay: 1 + connIndex * 0.2 }}
                  />
                ))}

                {/* Hover Tooltip */}
                <AnimatePresence>
                  {activeStrand === strand.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.8 }}
                      animate={{ opacity: 1, y: -40, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.8 }}
                      className="absolute left-1/2 transform -translate-x-1/2 bg-black/90 backdrop-blur-sm text-white p-2 rounded-lg border border-white/20 text-xs whitespace-nowrap z-20"
                    >
                      <div className="font-medium">{strand.item}</div>
                      <div className="text-gray-300 capitalize">
                        {strand.domain}
                      </div>
                      {strand.connections.length > 0 && (
                        <div className="text-yellow-400 mt-1">
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

      {/* Cultural Themes */}
      <div className="absolute top-4 left-4">
        <div className="flex flex-wrap gap-2 max-w-md">
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
            {narrative?.title || "Eclectic Cultural Voyager"}
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

// Enhanced Cultural Constellation Component
const CulturalConstellation: React.FC<{
  preferences: Record<string, string[]>;
  culturalProfile: CulturalProfile;
}> = ({ preferences, culturalProfile }) => {
  const [hoveredStar, setHoveredStar] = useState<ConstellationStar | null>(
    null
  );
  const [selectedStars, setSelectedStars] = useState<Set<string>>(new Set());
  const [autoHighlightIndex, setAutoHighlightIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const createConstellationStars = (): ConstellationStar[] => {
    const stars: ConstellationStar[] = [];
    let starIndex = 0;

    Object.entries(preferences).forEach(([domain, items]) => {
      items.forEach((item, itemIndex) => {
        // Improved star positioning using golden ratio spiral
        const angle = starIndex * 2.4; // Golden angle in radians
        const radius = Math.sqrt(starIndex) * 8;
        const x = 50 + (Math.cos(angle) * radius) / 2;
        const y = 50 + (Math.sin(angle) * radius) / 2;

        stars.push({
          id: `${domain}-${itemIndex}`,
          domain,
          item,
          x: Math.max(10, Math.min(90, x)),
          y: Math.max(10, Math.min(90, y)),
          size: 3 + Math.random() * 4,
          brightness: 0.6 + Math.random() * 0.4,
          connections:
            culturalProfile?.connections?.filter(
              (conn) => conn.domain1 === domain || conn.domain2 === domain
            ) || [],
        });
        starIndex++;
      });
    });

    return stars;
  };

  const stars = createConstellationStars();

  // Auto-play functionality for Constellation
  useEffect(() => {
    if (isAutoPlay && stars.length > 0) {
      autoPlayRef.current = setInterval(() => {
        setAutoHighlightIndex((prev) => (prev + 1) % stars.length);
        // Auto-highlight star for a moment
        const currentStar = stars[autoHighlightIndex];
        if (currentStar) {
          setHoveredStar(currentStar);
          setTimeout(() => {
            if (isAutoPlay) setHoveredStar(null);
          }, 1500);
        }
      }, 2500); // Change highlighted star every 2.5 seconds
    } else if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = null;
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlay, stars, autoHighlightIndex]);

  const handleStarClick = (starId: string) => {
    setSelectedStars((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(starId)) {
        newSet.delete(starId);
      } else {
        newSet.add(starId);
      }
      return newSet;
    });
  };

  return (
    <div className="relative w-full h-96 overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900/50 via-purple-900/50 to-black/50 backdrop-blur-sm border border-white/10">
      {/* Auto-play Controls */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsAutoPlay(!isAutoPlay)}
          className="p-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 text-white hover:bg-white/20 transition-colors"
        >
          {isAutoPlay ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            setSelectedStars(new Set());
            setHoveredStar(null);
            setAutoHighlightIndex(0);
          }}
          className="p-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 text-white hover:bg-white/20 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Stars */}
      {stars.map((star, index) => (
        <motion.div
          key={star.id}
          className="absolute cursor-pointer group"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            transform: "translate(-50%, -50%)",
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: star.brightness,
            scale:
              hoveredStar?.id === star.id || autoHighlightIndex === index
                ? 1.5
                : 1,
          }}
          transition={{ delay: index * 0.05 }}
          onHoverStart={() => {
            setHoveredStar(star);
            setIsAutoPlay(false); // Pause auto-play on hover
          }}
          onHoverEnd={() => setHoveredStar(null)}
          onClick={() => handleStarClick(star.id)}
          whileHover={{ scale: 1.8 }}
          whileTap={{ scale: 0.8 }}
        >
          <div
            className={`rounded-full transition-all duration-300 ${
              selectedStars.has(star.id)
                ? "bg-yellow-400 shadow-lg shadow-yellow-400/50"
                : autoHighlightIndex === index && isAutoPlay
                ? "bg-cyan-400 shadow-lg shadow-cyan-400/50"
                : "bg-white group-hover:bg-yellow-300"
            }`}
            style={{
              width: `${star.size}px`,
              height: `${star.size}px`,
              boxShadow:
                hoveredStar?.id === star.id ||
                (autoHighlightIndex === index && isAutoPlay)
                  ? `0 0 20px rgba(255, 255, 255, 0.8)`
                  : `0 0 ${star.size}px rgba(255, 255, 255, 0.3)`,
            }}
          />

          {/* Auto-highlight pulse effect */}
          {autoHighlightIndex === index && isAutoPlay && (
            <motion.div
              className="absolute inset-0 rounded-full bg-cyan-400/30"
              animate={{
                scale: [1, 2, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
              }}
            />
          )}

          {/* Pulsing animation for connected stars */}
          {star.connections.length > 0 && (
            <motion.div
              className="absolute inset-0 rounded-full bg-white/20"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 0, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: index * 0.1,
              }}
            />
          )}
        </motion.div>
      ))}

      {/* Connection Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {culturalProfile?.connections?.map((connection, index) => {
          const star1 = stars.find((s) => s.domain === connection.domain1);
          const star2 = stars.find((s) => s.domain === connection.domain2);

          if (!star1 || !star2) return null;

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

      {/* Enhanced Hover Tooltip */}
      <AnimatePresence>
        {hoveredStar && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute z-10 bg-black/90 backdrop-blur-sm text-white p-4 rounded-lg border border-white/20 pointer-events-none max-w-xs"
            style={{
              left: `${hoveredStar.x}%`,
              top: `${Math.max(15, hoveredStar.y - 15)}%`,
              transform: "translateX(-50%)",
            }}
          >
            <div className="font-medium text-lg">{hoveredStar.item}</div>
            <div className="text-sm text-gray-300 capitalize mb-2">
              {hoveredStar.domain}
            </div>
            {hoveredStar.connections.length > 0 && (
              <div className="text-xs text-yellow-400">
                <div className="flex items-center gap-1 mb-1">
                  <Zap className="w-3 h-3" />
                  {hoveredStar.connections.length} cosmic connections
                </div>
                <div className="space-y-1">
                  {hoveredStar.connections.slice(0, 2).map((conn, idx) => (
                    <div key={idx} className="text-xs text-gray-400">
                      → {conn.explanation.slice(0, 50)}...
                    </div>
                  ))}
                </div>
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
        <div className="text-xs text-gray-400 mt-1">
          Click stars to highlight • {selectedStars.size} selected
          {isAutoPlay && (
            <span className="ml-2 text-cyan-400">• Auto-exploring</span>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-3 text-white text-xs">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 bg-white rounded-full"></div>
          <span>Cultural marker</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
          <span>Auto-highlighted</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-px bg-white/30"></div>
          <span>Connection</span>
        </div>
      </div>
    </div>
  );
};

// Enhanced Cultural Journey Map Component
const CulturalJourneyMap: React.FC<{
  narrative: CulturalNarrative;
  discoveries?: string[];
  evolutionPredictions?: string[];
}> = ({ narrative, discoveries }) => {
  const [activePhase, setActivePhase] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const journeyPhases = [
    {
      phase: "Discovery",
      title: "Your Cultural Foundations",
      description:
        "An explorer at heart, she bridges the old and the new, the familiar and the fantastical, in an ever-evolving cultural journey.",
      icon: Eye,
      color: "#8B5CF6",
      position: { x: 15, y: 25 },
    },
    {
      phase: "Analysis",
      title: "Pattern Recognition",
      description: "Finding hidden connections across domains",
      icon: Brain,
      color: "#3B82F6",
      position: { x: 35, y: 45 },
    },
    {
      phase: "Insights",
      title: narrative?.title || "Your Cultural Identity",
      description: "Your unique cultural archetype emerges",
      icon: Sparkles,
      color: "#10B981",
      position: { x: 55, y: 20 },
    },
    {
      phase: "Recommendations",
      title: "Personalized Discoveries",
      description: `${discoveries?.length || 6} tailored recommendations`,
      icon: Target,
      color: "#F59E0B",
      position: { x: 75, y: 35 },
    },
  ];

  // Auto-play functionality for Journey Map
  useEffect(() => {
    if (isAutoPlay) {
      autoPlayRef.current = setInterval(() => {
        setActivePhase((prev) => (prev + 1) % journeyPhases.length);
      }, 3000); // Change phase every 3 seconds
    } else if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = null;
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlay, journeyPhases.length]);

  return (
    <div className="relative w-full h-96 overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900/50 via-indigo-900/50 to-blue-900/50 backdrop-blur-sm border border-white/10">
      {/* Auto-play Controls */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsAutoPlay(!isAutoPlay)}
          className="p-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 text-white hover:bg-white/20 transition-colors"
        >
          {isAutoPlay ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            setActivePhase(0);
            setIsAutoPlay(false);
          }}
          className="p-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 text-white hover:bg-white/20 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Journey Path */}
      <svg className="absolute inset-0 w-full h-full">
        <motion.path
          d={`M ${journeyPhases[0].position.x}% ${journeyPhases[0].position.y}% 
              Q 30% 60% ${journeyPhases[1].position.x}% ${journeyPhases[1].position.y}%
              Q 40% 10% ${journeyPhases[2].position.x}% ${journeyPhases[2].position.y}%
              Q 60% 50% ${journeyPhases[3].position.x}% ${journeyPhases[3].position.y}%`}
          fill="none"
          stroke="rgba(255, 255, 255, 0.3)"
          strokeWidth="2"
          strokeDasharray="10 5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
      </svg>

      {/* Journey Phases */}
      {journeyPhases.map((phase, index) => {
        const IconComponent = phase.icon;
        const isActive = activePhase === index;

        return (
          <motion.div
            key={index}
            className="absolute cursor-pointer group"
            style={{
              left: `${phase.position.x}%`,
              top: `${phase.position.y}%`,
              transform: "translate(-50%, -50%)",
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: isActive ? 1.2 : 1 }}
            transition={{ delay: index * 0.5, type: "spring" }}
            onHoverStart={() => {
              setActivePhase(index);
              setIsAutoPlay(false); // Pause auto-play on hover
            }}
            whileHover={{ scale: 1.1 }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center border-4 border-white/30 shadow-lg transition-all duration-300"
              style={{ backgroundColor: phase.color }}
            >
              <IconComponent className="w-8 h-8 text-white" />
            </div>

            {/* Phase Info */}
            <AnimatePresence>
              {isActive && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: -80, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.8 }}
                  className="absolute left-1/2 transform -translate-x-1/2 bg-black/90 backdrop-blur-sm text-white p-4 rounded-lg border border-white/20 min-w-64 max-w-80"
                >
                  <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                    {phase.phase}
                  </div>
                  <div className="font-bold text-lg mb-2">{phase.title}</div>
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
            <span>{narrative?.diversityScore || 64}/100 diversity</span>
            <span>{discoveries?.length || 6} discoveries</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Enhanced Cultural WowFactor Component
const CulturalWowFactor: React.FC<{
  culturalProfile: CulturalProfile;
  narrative: CulturalNarrative;
  preferences: Record<string, string[]>;
  discoveries?: string[];
  evolutionPredictions?: string[];
}> = ({
  culturalProfile,
  narrative,
  preferences,
  discoveries,
  evolutionPredictions,
}) => {
  const [activeVisualization, setActiveVisualization] = useState("dna");

  const visualizations = [
    {
      id: "dna",
      name: "Cultural DNA",
      icon: Brain,
      description: "Your cultural genetic code",
    },
    {
      id: "journey",
      name: "Journey Map",
      icon: MapIcon,
      description: "Your taste evolution path",
    },
    {
      id: "constellation",
      name: "Constellation",
      icon: Star,
      description: "Your cultural star map",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Enhanced Visualization Selector */}
      <div className="flex justify-center">
        <div className="flex bg-white/5 backdrop-blur-sm rounded-2xl p-2 border border-white/10">
          {visualizations.map((viz) => {
            const IconComponent = viz.icon;
            const isActive = activeVisualization === viz.id;

            return (
              <motion.button
                key={viz.id}
                onClick={() => setActiveVisualization(viz.id)}
                className={`px-6 py-3 rounded-xl flex items-center transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <IconComponent className="w-5 h-5 mr-2" />
                <div className="text-left">
                  <div className="font-medium">{viz.name}</div>
                  <div className="text-xs opacity-70">{viz.description}</div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Enhanced Visualization Container */}
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

      {/* Enhanced Stats Display */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-3 gap-6"
      >
        <motion.div
          className="text-center bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300"
          whileHover={{ scale: 1.02, y: -2 }}
        >
          <div className="text-3xl font-bold text-white mb-2">
            {Object.values(preferences).flat().length}
          </div>
          <div className="text-white/60 mb-2">Cultural Markers</div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-1000"
              style={{
                width: `${Math.min(
                  100,
                  (Object.values(preferences).flat().length / 20) * 100
                )}%`,
              }}
            ></div>
          </div>
        </motion.div>

        <motion.div
          className="text-center bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300"
          whileHover={{ scale: 1.02, y: -2 }}
        >
          <div className="text-3xl font-bold text-white mb-2">
            {culturalProfile?.connections?.length || 0}
          </div>
          <div className="text-white/60 mb-2">Deep Connections</div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-1000"
              style={{
                width: `${Math.min(
                  100,
                  ((culturalProfile?.connections?.length || 0) / 15) * 100
                )}%`,
              }}
            ></div>
          </div>
        </motion.div>

        <motion.div
          className="text-center bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300"
          whileHover={{ scale: 1.02, y: -2 }}
        >
          <div className="text-3xl font-bold text-white mb-2">
            {narrative?.diversityScore || 64}%
          </div>
          <div className="text-white/60 mb-2">Diversity Score</div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${narrative?.diversityScore || 64}%` }}
            ></div>
          </div>
        </motion.div>
      </motion.div>

      {/* Cultural Insights Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
      >
        <div className="flex items-center mb-4">
          <Lightbulb className="w-6 h-6 text-yellow-400 mr-3" />
          <h3 className="text-xl font-bold text-white">Cultural Insights</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">
              Your Cultural DNA
            </h4>
            <p className="text-white/80 text-sm leading-relaxed">
              {narrative?.culturalDNA ||
                "An explorer at heart, you bridge the old and the new, the familiar and the fantastical, in an ever-evolving cultural journey."}
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-3">
              Key Patterns
            </h4>
            <div className="space-y-2">
              {culturalProfile?.patterns?.slice(0, 3).map((pattern, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="flex items-center text-white/70 text-sm"
                >
                  <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mr-3"></div>
                  {pattern}
                </motion.div>
              )) || (
                <>
                  <div className="flex items-center text-white/70 text-sm">
                    <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mr-3"></div>
                    Cross-cultural appreciation
                  </div>
                  <div className="flex items-center text-white/70 text-sm">
                    <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mr-3"></div>
                    Artistic sensibility
                  </div>
                  <div className="flex items-center text-white/70 text-sm">
                    <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mr-3"></div>
                    Exploratory mindset
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CulturalWowFactor;
