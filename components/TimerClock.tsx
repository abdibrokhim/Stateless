'use client';
import { SlidingNumber } from '@/components/motion-primitives/sliding-number';

interface TimerClockProps {
  seconds: number;
}

export function TimerClock({ seconds }: TimerClockProps) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return (
    <div className='flex items-center gap-0.5 font-mono'>
      <SlidingNumber value={minutes} padStart={true} />
      <span className='text-pink-500'>:</span>
      <SlidingNumber value={remainingSeconds} padStart={true} />
    </div>
  );
} 