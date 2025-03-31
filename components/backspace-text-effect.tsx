import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface BackspaceTextEffectProps {
  text: string;
  isActive: boolean;
  onComplete?: () => void;
}

export function BackspaceTextEffect({ text, isActive, onComplete }: BackspaceTextEffectProps) {
  const [visibleText, setVisibleText] = useState(text);
  const [lastCharRef, setLastCharRef] = useState<HTMLSpanElement | null>(null);

  useEffect(() => {
    setVisibleText(text);
  }, [text]);

  useEffect(() => {
    if (isActive && visibleText.length > 0) {
      const slowdownThreshold = 40;
      
      // Just two speeds: fast (1ms) or slow (50ms)
      const intervalSpeed = visibleText.length > slowdownThreshold ? 0.09 : 50;
      
      // Delete 3 chars at a time when fast, 1 char when slow
      const charsToDelete = visibleText.length > slowdownThreshold ? 1 : 1;

      const interval = setInterval(() => {
        setVisibleText(prev => {
          const newText = prev.slice(0, -charsToDelete);
          if (newText.length === 0) {
            setTimeout(() => {
              onComplete?.();
            }, 0);
          }
          return newText;
        });
      }, intervalSpeed);

      return () => clearInterval(interval);
    }
  }, [isActive, onComplete, visibleText.length]);

  return (
    <div className="border-pink-300 placeholder:text-muted-foreground focus-visible:border-pink-300 focus-visible:ring-pink-300/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm relative">
      <div className="relative whitespace-pre-wrap break-words">
        {visibleText.split('').map((char, index) => (
          <span
            key={index}
            ref={index === visibleText.length - 1 ? setLastCharRef : null}
            className="relative inline-block"
          >
            {char === ' ' ? '\u00A0' : char}
            {index === visibleText.length - 1 && isActive && (
              <motion.div
                className="absolute -right-7 top-1/2 -translate-y-1/2 w-5 h-5"
                animate={{
                  x: [-2, 2, -2],
                }}
                transition={{
                  duration: 0.08,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                <img 
                  src="/pacman.gif" 
                  alt="Pac-Man" 
                  className="w-full h-full"
                />
              </motion.div>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}