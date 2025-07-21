import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Home, Play, User, Menu, X } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

interface NavigationProps {
  className?: string;
}

const Navigation: React.FC<NavigationProps> = ({ className = "" }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Ensure component is mounted before using router
  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    {
      name: "Home",
      href: "/",
      icon: Home,
      description: "Discover your cultural DNA",
    },
    {
      name: "Watch Demo",
      href: "/demo",
      icon: Play,
      description: "See KulturalMente in action",
    },
    {
      name: "About",
      href: "/about",
      icon: User,
      description: "Learn about the creator",
    },
  ];

  const isActive = (href: string) => {
    if (!mounted) return false;

    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return null;
  }

  const handleNavigation = (href: string) => {
    setIsMobileMenuOpen(false);
    router.push(href);
  };

  return (
    <nav className={`relative z-50 ${className}`}>
      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20 shadow-2xl">
        {/* Logo */}
        <div
          onClick={() => handleNavigation("/")}
          className="flex items-center group cursor-pointer"
        >
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="bg-white/10 backdrop-blur-sm rounded-full p-3 border border-white/20 mr-4 group-hover:border-white/40 transition-all"
          >
            <Brain className="w-6 h-6 text-white" />
          </motion.div>
          <div className="text-left">
            <span className="text-2xl font-bold text-white group-hover:text-blue-200 transition-colors">
              KulturalMente
            </span>
            <div className="text-sm text-white/60 hidden lg:block">
              Cultural Intelligence Platform
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex items-center space-x-2">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const active = isActive(item.href);

            return (
              <div
                key={item.name}
                onClick={() => handleNavigation(item.href)}
                className="cursor-pointer"
              >
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-300 group ${
                    active
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-xl"
                      : "text-white/80 hover:text-white hover:bg-white/10 border border-white/20 hover:border-white/40"
                  }`}
                >
                  <IconComponent className="w-5 h-5 mr-3" />
                  <span className="font-medium">{item.name}</span>

                  {/* Active indicator */}
                  {active && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute inset-0 bg-white/10 rounded-xl"
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  )}

                  {/* Hover tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="bg-black/90 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap border border-white/20">
                      {item.description}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black/90" />
                    </div>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        {/* Mobile Header */}
        <div className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/20">
          <div
            onClick={() => handleNavigation("/")}
            className="flex items-center cursor-pointer"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-full p-2 border border-white/20 mr-3">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">KulturalMente</span>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 bg-white/10 backdrop-blur-sm text-white rounded-lg border border-white/20 hover:bg-white/20 transition-all"
          >
            <AnimatePresence mode="wait">
              {isMobileMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="w-6 h-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="w-6 h-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden"
            >
              <div className="p-4 space-y-2">
                {navItems.map((item, index) => {
                  const IconComponent = item.icon;
                  const active = isActive(item.href);

                  return (
                    <div
                      key={item.name}
                      onClick={() => handleNavigation(item.href)}
                      className="cursor-pointer"
                    >
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02, x: 5 }}
                        whileTap={{ scale: 0.98 }}
                        className={`flex items-center p-4 rounded-xl transition-all ${
                          active
                            ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                            : "text-white/80 hover:text-white hover:bg-white/10 border border-white/20"
                        }`}
                      >
                        <IconComponent className="w-5 h-5 mr-4" />
                        <div className="flex-1">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm opacity-60">
                            {item.description}
                          </div>
                        </div>
                        {active && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </motion.div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navigation;
