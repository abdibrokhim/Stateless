import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

const DEFAULT_TIMEOUT = 7; // 7 seconds timeout
const MIN_SESSION_TIME = 5; // 5 minutes
const MAX_SESSION_TIME = 180; // 180 minutes

interface UseWritingSessionProps {
  initialSessionTime?: number;
  initialTimeoutSeconds?: number;
  disableAutoClear?: boolean;
}

export function useWritingSession({
  initialSessionTime = 15,
  initialTimeoutSeconds = DEFAULT_TIMEOUT,
  disableAutoClear = false
}: UseWritingSessionProps = {}) {
  const [text, setText] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [sessionTime, setSessionTime] = useState(initialSessionTime);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [lastKeystroke, setLastKeystroke] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [timeoutSeconds, setTimeoutSeconds] = useState(initialTimeoutSeconds);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Make lastKeystroke available globally for animation effects
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).lastKeystrokeTime = lastKeystroke;
    }
  }, [lastKeystroke]);

  // Check for timeout
  useEffect(() => {
    if (!isActive || disableAutoClear) return;

    const checkTimeout = () => {
      const now = Date.now();
      const elapsed = (now - lastKeystroke) / 1000;

      if (lastKeystroke && elapsed > timeoutSeconds) {
        // Text deleted due to inactivity
        setText("");
        toast.error(`You stopped typing for ${timeoutSeconds} seconds. Your text has been deleted.`);
      }
    };

    const interval = setInterval(checkTimeout, 1000);
    return () => clearInterval(interval);
  }, [isActive, lastKeystroke, timeoutSeconds, disableAutoClear]);

  // Session timer
  useEffect(() => {
    if (!isActive) return;

    setTimeRemaining(sessionTime * 60);

    sessionTimerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // End session
          endSession(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
      }
    };
  }, [isActive, sessionTime]);

  const startSession = () => {
    setIsActive(true);
    setIsOpen(true);
    setLastKeystroke(Date.now());
    setText("");
    toast.success(`Session started! Keep typing or lose your work after ${timeoutSeconds} seconds of inactivity.`);
  };

  const endSession = (completed = false) => {
    setIsActive(false);
    setIsOpen(false);
    if (sessionTimerRef.current) {
      clearInterval(sessionTimerRef.current);
    }
    
    if (completed) {
      toast.success("Congratulations! You completed your writing session.");
    } else {
      toast.info("Session ended. Your text has been preserved.");
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    setLastKeystroke(Date.now());
    if (!isActive) startSession();
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = isActive 
    ? ((sessionTime * 60 - timeRemaining) / (sessionTime * 60)) * 100 
    : 0;

  return {
    // State
    text,
    isActive,
    isOpen,
    sessionTime,
    timeRemaining,
    timeoutSeconds,
    showSettings,
    lastKeystroke,
    
    // Setters
    setText,
    setIsActive,
    setIsOpen,
    setSessionTime,
    setTimeoutSeconds,
    setShowSettings,
    
    // Utility functions
    formatTime,
    progressPercentage,
    startSession,
    endSession,
    handleTextChange,
    
    // Constants
    MIN_SESSION_TIME,
    MAX_SESSION_TIME,
  };
} 