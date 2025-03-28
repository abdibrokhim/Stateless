"use client";

import { useState, useRef, useEffect, useId } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AnimatedBackground } from "@/components/motion-primitives/animated-background";
import { 
  MorphingPopover,
  MorphingPopoverTrigger,
  MorphingPopoverContent,
} from '@/components/motion-primitives/morphing-popover';
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowLeftIcon } from "lucide-react";

const DEFAULT_TIMEOUT = 7; // 7 seconds timeout
const MIN_SESSION_TIME = 5; // 5 minutes
const MAX_SESSION_TIME = 180; // 180 minutes

export function Writing() {
  const uniqueId = useId();
  const [text, setText] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [sessionTime, setSessionTime] = useState(15); // Default 15 minutes
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [lastKeystroke, setLastKeystroke] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [timeoutSeconds, setTimeoutSeconds] = useState(DEFAULT_TIMEOUT);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Check for timeout
  useEffect(() => {
    if (!isActive) return;

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
  }, [isActive, lastKeystroke, timeoutSeconds]);

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

  useEffect(() => {
    // Autofocus the textarea when the popover opens
    if (isOpen && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

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
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = isActive 
    ? ((sessionTime * 60 - timeRemaining) / (sessionTime * 60)) * 100 
    : 0;

  return (
    <div className="space-y-6">
      <Card className="border-pink-300">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl text-primary">Stateless</CardTitle>
              <CardDescription>
                {isActive 
                  ? `Time remaining: ${formatTime(timeRemaining)}` 
                  : `A minimalist writing app for flow state`}
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
                    <label className="text-sm font-medium">
                      Session Length: {sessionTime} minutes
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
                    <label className="text-sm font-medium">
                      Timeout: {timeoutSeconds} seconds
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
          {!isActive ? (
            <div className="bg-pink-50 p-8 rounded-md text-center">
              <h3 className="text-lg font-semibold mb-2">Welcome to Stateless</h3>
              <p className="mb-6 text-gray-700">
                When you begin a timed session, you must keep typing; if you stop for more than {timeoutSeconds} seconds, 
                all your text disappears. This feature aims to trigger "flow," a highly focused mental state.
              </p>
              
              <MorphingPopover
                transition={{
                  type: 'spring',
                  bounce: 0.05,
                  duration: 0.3,
                }}
                open={isOpen}
                onOpenChange={(open) => {
                  if (open) {
                    startSession();
                  }
                  if (!open && isActive) {
                    endSession();
                  }
                  setIsOpen(open);
                }}
              >
                <MorphingPopoverTrigger asChild>
                  <AnimatedBackground 
                    className="rounded-md overflow-hidden inline-block" 
                    enableHover={true}
                  >
                    <Button 
                      size="lg" 
                      className="bg-pink-500 hover:bg-pink-600"
                      data-id="start"
                    >
                      <motion.span layoutId={`popover-label-${uniqueId}`} className="text-sm">
                        Start {sessionTime}-Minute Session
                      </motion.span>
                    </Button>
                  </AnimatedBackground>
                </MorphingPopoverTrigger>
                
                <MorphingPopoverContent className="rounded-xl border border-pink-300 bg-white p-0 shadow-[0_9px_9px_0px_rgba(0,0,0,0.01),_0_2px_5px_0px_rgba(0,0,0,0.06)] dark:bg-zinc-800">
                  <div className="flex flex-col w-[700px] h-[400px]">
                    <div className="px-4 py-3 flex justify-between items-center border-b border-pink-200">
                      <motion.span
                        layoutId={`popover-label-${uniqueId}`}
                        className="font-medium text-primary"
                      >
                        Writing Session ({formatTime(timeRemaining)} remaining)
                      </motion.span>
                      <Progress value={progressPercentage} className="h-2 w-[250px]" />
                    </div>
                    
                    <div className="relative flex-1 px-4 py-3">
                      <Textarea
                        ref={textareaRef}
                        className="h-full w-full resize-none border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                        placeholder="Start typing... if you stop for more than 7 seconds, everything will be deleted!"
                        value={text}
                        onChange={handleTextChange}
                        autoFocus
                      />
                    </div>
                    
                    <div className="flex justify-between items-center px-4 py-2 border-t border-pink-200">
                      <div className="text-xs text-muted-foreground">
                        Keep typing! {timeoutSeconds} seconds of inactivity will delete all your text.
                      </div>
                      <Button 
                        variant="ghost"
                        size="sm"
                        className="flex items-center text-pink-800 hover:bg-pink-100 hover:text-pink-900"
                        onClick={() => endSession()}
                      >
                        <ArrowLeftIcon size={16} className="mr-1" />
                        End Session
                      </Button>
                    </div>
                  </div>
                </MorphingPopoverContent>
              </MorphingPopover>
            </div>
          ) : (
            <div className="text-center p-8 bg-pink-50 rounded-md">
              <p className="text-lg text-pink-800">
                Writing session in progress...
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 