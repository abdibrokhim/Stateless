"use client";

import { useRef, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AnimatedBackground } from "@/components/motion-primitives/animated-background";
import { useWritingSession } from "@/hooks/useWritingSession";
import { TimerClock } from "@/components/TimerClock";
import { TextEffect } from "@/components/motion-primitives/text-effect";
import { SlidingNumber } from '@/components/motion-primitives/sliding-number';
import { Slider } from "@/components/ui/slider";

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
    formatTime,
    progressPercentage,
    startSession,
    endSession,
    handleTextChange,
    MIN_SESSION_TIME,
    MAX_SESSION_TIME,
  } = useWritingSession();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isNearTimeout, setIsNearTimeout] = useState(false);

  // Handle checking for approaching timeout
  useEffect(() => {
    if (!isActive) return;

    const checkNearTimeout = () => {
      if (!lastKeystroke) return;
      const now = Date.now();
      const elapsed = (now - lastKeystroke) / 1000;
      setIsNearTimeout(elapsed > (timeoutSeconds * 0.5));
    };

    const interval = setInterval(checkNearTimeout, 500);
    return () => clearInterval(interval);
  }, [isActive, lastKeystroke, timeoutSeconds]);

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

  return (
    <div className="space-y-6">
      <Card className="border-pink-300">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl text-primary">Writing Session</CardTitle>
              <CardDescription>
                {isActive ? (
                  <div className="flex items-center gap-2">
                    <span>Time remaining:</span>
                    <TimerClock seconds={timeRemaining} />
                  </div>
                ) : (
                  `Session length: ${sessionTime} minutes`
                )}
              </CardDescription>
            </div>
            
            <Dialog open={showSettings} onOpenChange={setShowSettings}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-pink-200 hover:bg-pink-100" disabled={isActive}>
                  Settings
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Session Settings</DialogTitle>
                  <DialogDescription>
                    Configure your writing session parameters.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      Session Length: 
                      <div className="inline-flex items-center gap-1 font-mono">
                        <SlidingNumber value={sessionTime} /> minutes
                      </div>
                    </label>
                    <Slider 
                      min={MIN_SESSION_TIME} 
                      max={MAX_SESSION_TIME} 
                      step={5}
                      value={[sessionTime]} 
                      onValueChange={(value) => setSessionTime(value[0])}
                      className="bg-pink-100"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      Timeout: 
                      <div className="inline-flex items-center gap-1 font-mono">
                        <SlidingNumber value={timeoutSeconds} /> seconds
                      </div>
                    </label>
                    <Slider 
                      min={3} 
                      max={15} 
                      step={1}
                      value={[timeoutSeconds]} 
                      onValueChange={(value) => setTimeoutSeconds(value[0])}
                      className="bg-pink-100"
                    />
                    <p className="text-xs text-muted-foreground">
                      Your text will be deleted if you stop typing for this long.
                    </p>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button onClick={() => setShowSettings(false)}>Save Changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        
        <CardContent>
          {isActive ? (
            <>
              <Progress value={progressPercentage} className="h-2 mb-4" />
              <Textarea
                ref={textareaRef}
                placeholder="Start typing... if you stop for more than 7 seconds, everything will be deleted!"
                value={text}
                onChange={handleTextChange}
                className="min-h-[300px] resize-none focus-visible:ring-pink-400"
                disabled={!isActive}
              />
            </>
          ) : (
            <div className="bg-pink-50 p-8 rounded-md text-center">
              <h3 className="text-lg font-semibold mb-2">Welcome to Stateless</h3>
              <p className="mb-6 text-gray-700">
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
                  className="bg-pink-500 hover:bg-pink-600"
                  data-id="start"
                >
                  Start {sessionTime}-Minute Session
                </Button>
              </AnimatedBackground>
            </div>
          )}
        </CardContent>
        
        {isActive && (
          <CardFooter>
            <Button 
              onClick={() => endSession()} 
              variant="outline" 
              className="ml-auto border-pink-200 hover:bg-pink-100"
            >
              End Session
            </Button>
          </CardFooter>
        )}
      </Card>
      
      {isActive && (
        <div className="text-sm text-center text-muted-foreground">
          {isNearTimeout ? (
            <TextEffect per="char" preset="fade">
              Warning! You're about to lose your text. Keep typing!
            </TextEffect>
          ) : (
            <p>Keep typing! {timeoutSeconds} seconds of inactivity will delete all your text.</p>
          )}
        </div>
      )}
    </div>
  );
}
