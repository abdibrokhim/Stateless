'use client';
import { forwardRef, useImperativeHandle, useRef, useState, useEffect } from 'react';
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
    
    // Forward the focus method
    useImperativeHandle(ref, () => ({
      focus: () => {
        textareaRef.current?.focus();
      },
    }));
    
    // Handle fade state changes
    useEffect(() => {
      if (shouldFadeOut && textVisible) {
        setTextVisible(false);
      } else if (!shouldFadeOut && !textVisible) {
        setTextVisible(true);
      }
    }, [shouldFadeOut, textVisible]);
    
    // Handle animation complete
    const handleAnimationComplete = () => {
      if (!textVisible && onAnimationComplete) {
        onAnimationComplete();
      }
    };

    return (
      <div className="relative h-full w-full flex-1">
        {/* Overlay the textarea with the animated text */}
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`${className} absolute inset-0 w-full h-full resize-none p-4 z-10 ${shouldFadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'} transition-opacity duration-200`}
        />
        
        {/* Text with fade effect */}
        <div className={`absolute inset-0 w-full h-full p-4 font-mono overflow-auto ${!shouldFadeOut ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}>
          <TextEffect
            per="char"
            variants={fadeExitVariants}
            trigger={textVisible}
            onAnimationComplete={handleAnimationComplete}
            as="div"
            className="whitespace-pre-wrap break-words w-full h-full text-pink-950"
          >
            {value || placeholder || " "}
          </TextEffect>
        </div>
      </div>
    );
  }
);

TextareaWithFadeExit.displayName = 'TextareaWithFadeExit'; 