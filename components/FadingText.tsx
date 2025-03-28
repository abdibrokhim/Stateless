'use client';

import React from 'react';

interface FadingTextProps {
  text: string;
  deletingFromStart?: boolean;
}

export function FadingText({ text, deletingFromStart = true }: FadingTextProps) {
  const FADE_COUNT = 5; // How many characters to apply fade effect to
  
  return (
    <div className="font-mono whitespace-pre-wrap break-words">
      {text.split('').map((char, index) => {
        // Calculate opacity based on position
        let opacity = 1;
        
        if (deletingFromStart) {
          // For left-to-right deletion (beginning of text)
          if (index < FADE_COUNT) {
            opacity = 0.2 + (index * (0.8 / FADE_COUNT));
          }
        } else {
          // For right-to-left deletion (end of text)
          if (index >= text.length - FADE_COUNT) {
            const reverseIndex = text.length - index - 1;
            opacity = 0.2 + (reverseIndex * (0.8 / FADE_COUNT));
          }
        }
        
        return (
          <span 
            key={index} 
            className="inline-block transition-opacity"
            style={{ 
              opacity, 
              transition: 'opacity 0.3s ease-out'
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        );
      })}
    </div>
  );
} 