'use client';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { TextEffect } from '@/components/motion-primitives/text-effect';
import { Textarea } from '@/components/ui/textarea';

export interface TextareaWithFadeExitProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  shouldFadeOut?: boolean;
  onAnimationComplete?: () => void;
}

export interface TextareaWithFadeExitRef {
  focus: () => void;
}

const fadeExitVariants = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.01 },
    },
    exit: {
      transition: { staggerChildren: 0.01, staggerDirection: 1 },
    },
  },
  item: {
    hidden: {
      opacity: 0,
      filter: 'blur(2px)',
    },
    visible: {
      opacity: 1,
      filter: 'blur(0px)',
      transition: {
        duration: 0.2,
      },
    },
    exit: {
      opacity: 0,
      filter: 'blur(5px)',
      transition: {
        duration: 0.2,
      },
    },
  },
};

export const TextareaWithFadeExit = forwardRef<TextareaWithFadeExitRef, TextareaWithFadeExitProps>(
  ({ value, onChange, className, placeholder, disabled, shouldFadeOut, onAnimationComplete }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [textVisible, setTextVisible] = useState(true);
    
    useImperativeHandle(ref, () => ({
      focus: () => {
        textareaRef.current?.focus();
      },
    }));
    
    // Start fade-out animation when shouldFadeOut becomes true
    if (shouldFadeOut && textVisible) {
      setTextVisible(false);
    }
    
    // Reset visibility when shouldFadeOut becomes false
    if (!shouldFadeOut && !textVisible) {
      setTextVisible(true);
    }
    
    const handleAnimationComplete = () => {
      if (!textVisible && onAnimationComplete) {
        onAnimationComplete();
      }
    };

    return (
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`${className} opacity-0 absolute top-0 left-0 w-full h-full z-10`}
        />
        <div className="w-full h-full font-mono">
          <TextEffect
            per="char"
            variants={fadeExitVariants}
            trigger={textVisible}
            onAnimationComplete={handleAnimationComplete}
            as="div"
            className="whitespace-pre-wrap break-words w-full h-full"
          >
            {value || placeholder || " "}
          </TextEffect>
        </div>
      </div>
    );
  }
);

TextareaWithFadeExit.displayName = 'TextareaWithFadeExit'; 