"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronDown, 
  Sparkles,
  ArrowDown
} from "lucide-react";

export default function ExplorationSection() {
  const [activeText, setActiveText] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveText((prev) => (prev + 1) % explorationTexts.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const explorationTexts = [
    "Discover More",
    "Continue Exploring",
    "See More Below"
  ];

  const arrowVariants = {
    initial: { y: 0 },
    animate: {
      y: [0, 5, 0],
      transition: {
        duration: 1.2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <section className="relative py-12 bg-gradient-to-b from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center max-w-2xl mx-auto">
          
          {/* Animated Arrow */}
          <motion.div
            variants={arrowVariants}
            initial="initial"
            animate="animate"
            className="mb-4 relative"
          >
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 blur-md opacity-30 rounded-full animate-pulse"></div>
              
              {/* Main arrow */}
              <div className="relative bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-full shadow-lg">
                <ChevronDown className="w-8 h-8 text-white" />
              </div>
            </div>
          </motion.div>

          {/* Animated text */}
          <div className="text-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeText}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span className="text-lg md:text-xl font-semibold text-gray-700">
                  {explorationTexts[activeText]}
                </span>
                <Sparkles className="w-4 h-4 text-blue-500" />
              </motion.div>
            </AnimatePresence>

            {/* Subtle hint text */}
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-sm text-gray-500 mt-2 max-w-md mx-auto"
            >
              Scroll down for more amazing content and features
            </motion.p>
          </div>

          {/* Dots indicator */}
          <div className="flex gap-1.5 mt-6">
            {explorationTexts.map((_, index) => (
              <motion.div
                key={index}
                className={`w-1.5 h-1.5 rounded-full ${
                  index === activeText 
                    ? "bg-gradient-to-r from-blue-500 to-purple-500" 
                    : "bg-gray-300"
                }`}
                animate={{
                  scale: index === activeText ? 1.2 : 1,
                }}
                transition={{ duration: 0.3 }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}