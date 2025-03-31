import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface PacmanTextEffectProps {
  text: string;
  isActive: boolean;
  onComplete?: () => void;
}

export function PacmanTextEffect({ text, isActive, onComplete }: PacmanTextEffectProps) {
  const [visibleText, setVisibleText] = useState(text);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);

  useEffect(() => {
    if (isActive && !isAnimating) {
      setIsAnimating(true);
      setCurrentPosition(0);
      const chars = text.split('');
      const interval = setInterval(() => {
        setCurrentPosition(prev => {
          if (prev < chars.length) {
            setVisibleText(chars.slice(0, chars.length - prev - 1).join(''));
            return prev + 1;
          } else {
            clearInterval(interval);
            setIsAnimating(false);
            onComplete?.();
            return prev;
          }
        });
      }, 30); // Faster animation speed

      return () => clearInterval(interval);
    }
  }, [isActive, text, isAnimating, onComplete]);

  return (
    <div className="relative font-mono whitespace-pre-wrap break-words">
      {visibleText.split('').map((char, index) => (
        <motion.span
          key={index}
          className="inline-block relative"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
        >
          {char === ' ' ? '\u00A0' : char}
          {index === visibleText.length - 1 && isAnimating && (
            <motion.div
              className="absolute -right-2 top-1/2 -translate-y-1/2 w-6 h-6"
              animate={{
                x: [0, 4, 0],
                rotate: [0, 15, 0],
              }}
              transition={{
                duration: 0.2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {/* Pac-Man shape using CSS */}
              <div className="w-full h-full relative">
                <div className="absolute inset-0 bg-yellow-400 rounded-full"></div>
                <motion.div 
                  className="absolute inset-0"
                  animate={{
                    clipPath: [
                      'polygon(0% 0%, 50% 50%, 0% 100%)',    // fully open
                      'polygon(0% 15%, 50% 50%, 0% 85%)',    // mostly open
                      'polygon(0% 35%, 50% 50%, 0% 65%)',    // half closed
                      'polygon(0% 45%, 50% 50%, 0% 55%)',    // almost closed
                      'polygon(0% 35%, 50% 50%, 0% 65%)',    // half closed
                      'polygon(0% 15%, 50% 50%, 0% 85%)',    // mostly open
                      'polygon(0% 0%, 50% 50%, 0% 100%)',    // fully open
                    ]
                  }}
                  style={{
                    backgroundColor: 'transparent',
                    background: 'white'
                  }}
                  transition={{
                    duration: 0.2,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
              </div>
            </motion.div>
          )}
        </motion.span>
      ))}
    </div>
  );
} 