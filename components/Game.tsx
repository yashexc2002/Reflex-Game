"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

export default function Game() {
  // 1. GAME STATES
  const [gameState, setGameState] = useState<"start" | "playing" | "gameover">("start");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [duration, setDuration] = useState(1.5); // Ball ki initial speed
  const [feedback, setFeedback] = useState<"idle" | "hit" | "miss">("idle");

  // 2. REFS FOR HIT DETECTION
  const targetRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);

  // 3. LOAD HIGH SCORE FROM LOCAL STORAGE
  useEffect(() => {
    const savedHighScore = localStorage.getItem("reflexHighScore");
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }
  }, []);

  // 4. SOUND EFFECTS SYSTEM (Web Audio API)
  const playSound = (type: "hit" | "miss") => {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    if (type === "hit") {
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(800, ctx.currentTime); 
      oscillator.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.1);
    } else {
      oscillator.type = "sawtooth";
      oscillator.frequency.setValueAtTime(150, ctx.currentTime); 
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.3);
    }
  };

  // 5. START / RESTART GAME
  const startGame = (e: React.PointerEvent) => {
    e.stopPropagation(); // Button ka touch background tak jaane se rokta hai
    setScore(0);
    setDuration(1.5); // Speed reset
    setGameState("playing");
    setFeedback("idle");
  };

  // 6. HIT DETECTION LOGIC
  const handleTap = () => {
    if (gameState !== "playing") return; 
    if (!targetRef.current || !centerRef.current) return;

    // Exact positions nikalna
    const targetRect = targetRef.current.getBoundingClientRect();
    const centerRect = centerRef.current.getBoundingClientRect();

    // Check agar ball center ke andar hai
    const isHit = 
      targetRect.left >= centerRect.left && 
      targetRect.right <= centerRect.right;

    if (isHit) {
      playSound("hit");
      const newScore = score + 1;
      setScore(newScore);
      setDuration((prev) => Math.max(0.4, prev - 0.1)); // Speed badhao
      setFeedback("hit");

      // High Score logic
      if (newScore > highScore) {
        setHighScore(newScore);
        localStorage.setItem("reflexHighScore", newScore.toString());
      }
    } else {
      playSound("miss");
      setFeedback("miss");
      setGameState("gameover"); // Game over on miss
    }

    // Screen color reset after 300ms
    setTimeout(() => {
      if (gameState === "playing") setFeedback("idle");
    }, 300);
  };

  // 7. UI COLORS
  const bgColors = {
    idle: "bg-slate-800",
    hit: "bg-green-900/60",
    miss: "bg-red-900/80",
  };

  return (
    <div className="w-full max-w-md flex flex-col items-center">
      
      {/* HIGH SCORE PILL */}
      <div className="mb-6 px-6 py-2 bg-slate-800/80 rounded-full border border-slate-700 shadow-lg text-lg font-medium text-slate-300">
        🏆 High Score: <span className="text-cyan-400 font-bold ml-1">{highScore}</span>
      </div>

      {/* MAIN GAME BOX */}
      <div 
        className={`w-full h-[60vh] sm:h-96 ${bgColors[feedback]} transition-colors duration-200 rounded-2xl relative overflow-hidden cursor-pointer border border-slate-700 shadow-2xl touch-none select-none`}
        onPointerDown={handleTap} 
      >
        {/* CURRENT SCORE */}
        <div className="absolute top-6 w-full text-center z-10 drop-shadow-md pointer-events-none">
          <div className="text-6xl font-black text-white/90">
            {score}
          </div>
        </div>

        {/* TARGET ZONE */}
        <div 
          ref={centerRef}
          className="absolute left-1/2 top-0 h-full w-24 sm:w-28 -translate-x-1/2 bg-white/5 border-x-2 border-dashed border-cyan-400 pointer-events-none"
        />

        {/* MOVING BALL */}
        {gameState === "playing" && (
          <motion.div 
            ref={targetRef}
            className="absolute top-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full shadow-[0_0_20px_rgba(34,211,238,0.6)] pointer-events-none"
            initial={{ left: "0%" }}
            animate={{ left: "calc(100% - 3rem)" }}
            transition={{ 
              duration: duration,
              repeat: Infinity, 
              repeatType: "reverse", 
              ease: "linear" 
            }}
          />
        )}

        {/* START MENU OVERLAY */}
        {gameState === "start" && (
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center pointer-events-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 text-center px-4">Tap exact center to score!</h2>
            <button 
              onPointerDown={startGame}
              className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold rounded-full transition-transform hover:scale-105 active:scale-95"
            >
              Start Game
            </button>
          </div>
        )}

        {/* GAME OVER OVERLAY */}
        {gameState === "gameover" && (
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center pointer-events-auto">
            <h2 className="text-3xl font-bold text-red-400 mb-2">Game Over!</h2>
            <p className="text-xl text-white mb-6">Score: {score}</p>
            <button 
              onPointerDown={startGame}
              className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold rounded-full transition-transform hover:scale-105 active:scale-95"
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}