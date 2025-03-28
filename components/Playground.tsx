"use client";

import { useRef, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerFooter, DrawerClose } from "@/components/ui/drawer";
import { AnimatedBackground } from "@/components/motion-primitives/animated-background";
import { useWritingSession } from "@/hooks/useWritingSession";
import { TimerClock } from "@/components/TimerClock";
import { TextEffect } from "@/components/motion-primitives/text-effect";
import { SlidingNumber } from '@/components/motion-primitives/sliding-number';
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { TextareaWithFadeExit, TextareaWithFadeExitRef } from "./TextareaWithFadeExit";
import { Settings, Copy, Clock, AlarmClock, BarChart2, Edit3 } from "lucide-react";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export function Playground() {
  const {
    text,
    isActive,
    sessionTime,
    timeRemaining,
    timeoutSeconds,
    showSettings,
    lastKeystroke,
    setSessionTime,
    setTimeoutSeconds,
    setShowSettings,
    setText,
    formatTime,
    progressPercentage,
    startSession,
    endSession,
    handleTextChange,
    MIN_SESSION_TIME,
    MAX_SESSION_TIME,
  } = useWritingSession({ disableAutoClear: true });

  const textareaRef = useRef<TextareaWithFadeExitRef>(null);
  const [isNearTimeout, setIsNearTimeout] = useState(false);
  const [shouldFadeOut, setShouldFadeOut] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  // Calculate character and word count
  useEffect(() => {
    setCharCount(text.length);
    setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
  }, [text]);
  
  // Handle checking for approaching timeout and setting fade effect
  useEffect(() => {
    if (!isActive || !text) return;

    const startFadeThreshold = timeoutSeconds * 0.5; // Start fadeout at 50% of timeout
    
    const checkActivity = () => {
      if (!lastKeystroke) return;
      
      const now = Date.now();
      const elapsed = (now - lastKeystroke) / 1000;
      
      // Set warning state when approaching timeout
      setIsNearTimeout(elapsed > (timeoutSeconds * 0.6));
      
      // Start fadeout when passing the threshold
      if (elapsed > startFadeThreshold && !shouldFadeOut && text.length > 0) {
        setShouldFadeOut(true);
      } else if (elapsed <= startFadeThreshold && shouldFadeOut) {
        // User resumed typing before timeout
        setShouldFadeOut(false);
      }
      
      // Complete deletion after timeout
      if (elapsed > timeoutSeconds && text.length > 0) {
        setText("");
        setShouldFadeOut(false);
        toast.error(`You stopped typing for ${timeoutSeconds} seconds. Your text has been deleted.`);
      }
    };

    const interval = setInterval(checkActivity, 300);
    return () => clearInterval(interval);
  }, [isActive, lastKeystroke, timeoutSeconds, text, shouldFadeOut, setText]);

  // Custom text change handler to manage the fade state
  const handleTextInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Stop fadeout if user starts typing
    if (shouldFadeOut) {
      setShouldFadeOut(false);
    }
    
    // Call the original handler from useWritingSession
    handleTextChange(e);
  };

  // Handle animation complete (all text has faded)
  const handleAnimationComplete = () => {
    if (shouldFadeOut) {
      setText("");
      setShouldFadeOut(false);
    }
  };

  // Handle start session with textarea focus
  const handleStartSession = () => {
    startSession();
    // Focus the textarea
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 100);
  };

  // Handle copy text to clipboard
  const handleCopyText = () => {
    if (!text) return;
    
    navigator.clipboard.writeText(text)
      .then(() => toast.success("Text copied to clipboard"))
      .catch(() => toast.error("Failed to copy text"));
  };

  // Settings content shared between dialog and drawer
  const SettingsContent = () => (
    <>
      <div className="space-y-6 py-6">
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center justify-between text-pink-800">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Session Length</span>
            </div>
            <div className="inline-flex items-center gap-1 font-mono text-pink-900">
              <SlidingNumber value={sessionTime} /> minutes
            </div>
          </label>
          <Slider 
            min={MIN_SESSION_TIME} 
            max={MAX_SESSION_TIME} 
            step={5}
            value={[sessionTime]} 
            onValueChange={(value) => setSessionTime(value[0])}
            className="bg-pink-200"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center justify-between text-pink-800">
            <div className="flex items-center gap-2">
              <AlarmClock className="h-4 w-4" />
              <span>Inactivity Timeout</span>
            </div>
            <div className="inline-flex items-center gap-1 font-mono text-pink-900">
              <SlidingNumber value={timeoutSeconds} /> seconds
            </div>
          </label>
          <Slider 
            min={3} 
            max={15} 
            step={1}
            value={[timeoutSeconds]} 
            onValueChange={(value) => setTimeoutSeconds(value[0])}
            className="bg-pink-200"
          />
          <p className="text-xs text-pink-600 mt-1">
            Your text will be deleted if you stop typing for this long.
          </p>
        </div>
      </div>
      
      <div className="mt-4">
        <Button 
          onClick={() => setShowSettings(false)} 
          className="w-full bg-pink-600 hover:bg-pink-700 text-white"
        >
          Save Settings
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-[calc(100vh-6rem)] flex flex-col">
      {/* Header with controls */}
      <div className="flex justify-between items-center mb-4 py-2 px-2 bg-pink-50 rounded-lg">
        <div className="flex items-center gap-2 text-pink-900">
          {isActive ? (
            <div className="flex items-center gap-2">
              <AlarmClock className="h-5 w-5 text-pink-700" />
              <span className="text-sm font-medium text-pink-800">Time:</span>
              <TimerClock seconds={timeRemaining} />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-pink-700" />
              <span className="text-sm font-medium text-pink-800">Session:</span>
              <span className="text-sm font-mono">{sessionTime} min</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {isActive && text && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full text-pink-700 hover:bg-pink-100 hover:text-pink-900"
              onClick={handleCopyText}
              title="Copy text"
            >
              <Copy className="h-4 w-4" />
            </Button>
          )}
          
          {isActive && (
            <div className="hidden md:flex items-center gap-4 text-xs text-pink-700 mr-2">
              <div className="flex items-center gap-1">
                <BarChart2 className="h-4 w-4" />
                <span>{charCount} chars</span>
              </div>
              <div className="flex items-center gap-1">
                <span>{wordCount} words</span>
              </div>
            </div>
          )}
          
          {isMobile ? (
            <Drawer open={showSettings} onOpenChange={setShowSettings}>
              <DrawerTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-full text-pink-700 hover:bg-pink-100 hover:text-pink-900"
                  disabled={isActive}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </DrawerTrigger>
              <DrawerContent className="bg-pink-50 border-pink-200">
                <DrawerHeader>
                  <DrawerTitle className="text-pink-900">Session Settings</DrawerTitle>
                  <DrawerDescription className="text-pink-700">
                    Configure your writing session parameters.
                  </DrawerDescription>
                </DrawerHeader>
                <div className="px-4">
                    <div className="space-y-6 py-6">
                        <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center justify-between text-pink-800">
                            <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>Session Length</span>
                            </div>
                            <div className="inline-flex items-center gap-1 font-mono text-pink-900">
                            <SlidingNumber value={sessionTime} /> minutes
                            </div>
                        </label>
                        <Slider 
                            min={MIN_SESSION_TIME} 
                            max={MAX_SESSION_TIME} 
                            step={5}
                            value={[sessionTime]} 
                            onValueChange={(value) => setSessionTime(value[0])}
                            className="bg-pink-200"
                        />
                        </div>
                        
                        <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center justify-between text-pink-800">
                            <div className="flex items-center gap-2">
                            <AlarmClock className="h-4 w-4" />
                            <span>Inactivity Timeout</span>
                            </div>
                            <div className="inline-flex items-center gap-1 font-mono text-pink-900">
                            <SlidingNumber value={timeoutSeconds} /> seconds
                            </div>
                        </label>
                        <Slider 
                            min={3} 
                            max={15} 
                            step={1}
                            value={[timeoutSeconds]} 
                            onValueChange={(value) => setTimeoutSeconds(value[0])}
                            className="bg-pink-200"
                        />
                        <p className="text-xs text-pink-600 mt-1">
                            Your text will be deleted if you stop typing for this long.
                        </p>
                        </div>
                    </div>
                    
                    <div className="mt-4">
                        <Button 
                        onClick={() => setShowSettings(false)} 
                        className="w-full bg-pink-600 hover:bg-pink-700 text-white"
                        >
                        Save Settings
                        </Button>
                    </div>
                </div>
                <DrawerFooter className="pt-2"></DrawerFooter>
              </DrawerContent>
            </Drawer>
          ) : (
            <Dialog open={showSettings} onOpenChange={setShowSettings}>
              <DialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-full text-pink-700 hover:bg-pink-100 hover:text-pink-900"
                  disabled={isActive}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-pink-50 border-pink-200">
                <DialogHeader>
                  <DialogTitle className="text-pink-900">Session Settings</DialogTitle>
                  <DialogDescription className="text-pink-700">
                    Configure your writing session parameters.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-6">
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center justify-between text-pink-800">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Session Length</span>
            </div>
            <div className="inline-flex items-center gap-1 font-mono text-pink-900">
              <SlidingNumber value={sessionTime} /> minutes
            </div>
          </label>
          <Slider 
            min={MIN_SESSION_TIME} 
            max={MAX_SESSION_TIME} 
            step={5}
            value={[sessionTime]} 
            onValueChange={(value) => setSessionTime(value[0])}
            className="bg-pink-200"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center justify-between text-pink-800">
            <div className="flex items-center gap-2">
              <AlarmClock className="h-4 w-4" />
              <span>Inactivity Timeout</span>
            </div>
            <div className="inline-flex items-center gap-1 font-mono text-pink-900">
              <SlidingNumber value={timeoutSeconds} /> seconds
            </div>
          </label>
          <Slider 
            min={3} 
            max={15} 
            step={1}
            value={[timeoutSeconds]} 
            onValueChange={(value) => setTimeoutSeconds(value[0])}
            className="bg-pink-200"
          />
          <p className="text-xs text-pink-600 mt-1">
            Your text will be deleted if you stop typing for this long.
          </p>
        </div>
      </div>
      
      <div className="mt-4">
        <Button 
          onClick={() => setShowSettings(false)} 
          className="w-full bg-pink-600 hover:bg-pink-700 text-white"
        >
          Save Settings
        </Button>
      </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {isActive ? (
          <div className="flex-1 flex flex-col">
            <Progress value={progressPercentage} className="h-1 mb-2 bg-pink-100" 
              indicatorClassName="bg-pink-600" />
            
            <Card className="flex-1 flex flex-col border-pink-200 bg-white shadow-sm">
              <div className="flex-1 p-2 md:p-4">
                <TextareaWithFadeExit
                  ref={textareaRef}
                  placeholder="Start typing... if you stop for more than 7 seconds, everything will be deleted!"
                  value={text}
                  onChange={handleTextInputChange}
                  className="min-h-[calc(100%-2rem)] w-full resize-none focus-visible:ring-pink-400 text-pink-950"
                  disabled={!isActive}
                  shouldFadeOut={shouldFadeOut}
                  onAnimationComplete={handleAnimationComplete}
                />
              </div>

              <div className="flex items-center justify-between p-2 bg-pink-50 border-t border-pink-100 text-xs text-pink-700">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <BarChart2 className="h-4 w-4" />
                    <span>{charCount} characters</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Edit3 className="h-4 w-4" />
                    <span>{wordCount} words</span>
                  </div>
                </div>

                <Button 
                  onClick={() => endSession()} 
                  variant="outline" 
                  className="h-8 border-pink-200 hover:bg-pink-100 text-pink-700 hover:text-pink-900"
                >
                  End Session
                </Button>
              </div>
            </Card>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-pink-50 p-8 rounded-lg text-center max-w-2xl shadow-sm border border-pink-100">
              <h3 className="text-2xl font-semibold mb-3 text-pink-900">Welcome to Stateless</h3>
              <p className="mb-8 text-pink-800">
                When you begin a timed session, you must keep typing; if you stop for more than {timeoutSeconds} seconds, 
                all your text disappears. This feature aims to trigger "flow," a highly focused mental state.
              </p>
              <AnimatedBackground 
                className="rounded-md overflow-hidden" 
                enableHover={true}
              >
                <Button 
                  onClick={handleStartSession} 
                  size="lg" 
                  className="bg-pink-600 hover:bg-pink-700 text-white"
                  data-id="start"
                >
                  Start {sessionTime}-Minute Session
                </Button>
              </AnimatedBackground>
            </div>
          </div>
        )}
      </div>
      
      {isActive && isNearTimeout && (
        <div className="mt-2 text-center text-pink-700 bg-pink-50 p-2 rounded-lg">
          <TextEffect per="char" preset="fade" className="text-pink-700">
            Warning! You're about to lose your text. Keep typing!
          </TextEffect>
        </div>
      )}
    </div>
  );
}
