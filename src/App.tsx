/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Volume2,
  VolumeX,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Heart,
  Gamepad2,
  Gift,
  MousePointer,
  Maximize2,
  Music,
  UserCheck
} from 'lucide-react';
import { StarryCanvas } from './components/StarryCanvas';
import { soundManager } from './components/SoundManager';
import { ScreenState, QuizQuestion } from './types';

// Luxury quiz questions
const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "What does Eyad love the most in this galaxy?",
    options: ["Programming & Tech Hackathons", "Sleeping 14 Hours Straight", "Playing Average Football"],
    correctIndex: 0
  },
  {
    id: 2,
    question: "Where do you honestly see Eyad in 5 years?",
    options: ["An Elite Tech Lead", "An Egyptian Bill Gates", "Both (And probably super rich)"],
    correctIndex: 2
  },
  {
    id: 3,
    question: "Who is officially the coolest person alive right now?",
    options: ["Eyadfarouk (The Legend)", "Eyad (No debate)", "Eyad (All of the above)"],
    correctIndex: 0 // In Q3, we make any choice feel correct, with funny customized messages!
  }
];

// Rotating witty loading tips
const LOADING_MESSAGES = [
  "Forging golden seals...",
  "Running friendship compatibility algorithms...",
  "Calibrating Eyad's coolness scale (1000x multiplier)...",
  "Brewing fresh mint tea for the host...",
  "Loading premium star dust particles...",
  "Finalizing galactic greeting permissions..."
];

// Witty remarks on incorrect answers
const WRONG_ANSWERS_FEEDBACK = [
  "Wrong answer bro! Eyad is weeping in binary 💀",
  "Incorrect! Eyad's local compiler just crashed 💻",
  "Ouch! Even my smart filters felt that wrong prediction 🫠",
  "Incorrect! Eyad is reconsidering your friendship status 🔌"
];

const FUNNY_EASTER_EGGS = [
  "Eyad once resolved a Merge Conflict by whispering to the code. 🔥",
  "Eyad drinks coffee in Hexadecimal format. ☕",
  "Legend says Eyad's keyboard typing sound is actual music track. 🎹",
  "Eyad's Wi-Fi speed is powered purely by direct coolness! 📡"
];

export default function App() {
  const [screen, setScreen] = useState<ScreenState>('loading');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingTip, setLoadingTip] = useState(LOADING_MESSAGES[0]);
  const [isMuted, setIsMuted] = useState(true);

  // Intro states & typing segments
  const [introSegment, setIntroSegment] = useState(0);

  // Quiz states
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizStatus, setQuizStatus] = useState<'neutral' | 'correct' | 'wrong'>('neutral');
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [wrongFeedbackMsg, setWrongFeedbackMsg] = useState("");
  const [quizScores, setQuizScores] = useState<number>(0);

  // Letter / Envelope opening state
  const [envelopeOpened, setEnvelopeOpened] = useState(false);
  const [showFunnyEdeya, setShowFunnyEdeya] = useState(false);
  const [edeyaPoundCounter, setEdeyaPoundCounter] = useState(500);
  const [closingSequence, setClosingSequence] = useState(false);

  // Interaction feedback states
  const [easterEggText, setEasterEggText] = useState(FUNNY_EASTER_EGGS[0]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync ambient loop sound effects with muted states
  useEffect(() => {
    // Listen to play-sound requests emitted from child elements
    const handleSoundRequest = (e: Event) => {
      if (isMuted) return;
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail === 'success') {
        soundManager.playSuccess();
      } else if (customEvent.detail === 'failure') {
        soundManager.playFailure();
      } else if (customEvent.detail === 'letter') {
        soundManager.playLetterSlide();
      } else {
        soundManager.playTick();
      }
    };

    window.addEventListener('play-sound', handleSoundRequest);
    return () => {
      window.removeEventListener('play-sound', handleSoundRequest);
    };
  }, [isMuted]);

  // Loading progress ticker
  useEffect(() => {
    if (screen !== 'loading') return;

    // Change tip message periodically
    const tipInterval = setInterval(() => {
      const randomMsg = LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)];
      setLoadingTip(randomMsg);
    }, 1200);

    // Speed up initial loader mock
    const progressInterval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          clearInterval(tipInterval);
          return 100;
        }
        const step = Math.floor(Math.random() * 8) + 3;
        return Math.min(prev + step, 100);
      });
    }, 100);

    return () => {
      clearInterval(progressInterval);
      clearInterval(tipInterval);
    };
  }, [screen]);

  // Handle ambient loop music toggles
  const handleMuteToggle = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    soundManager.toggleAmbient(!nextState);
    triggerToast(nextState ? "Sound FX muted 🔇" : "Ambient soundscapes enabled 🎵");
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // Launch initial intro cinematic sequence
  const startCinematicExperience = () => {
    // Standard audio safety trigger on first mouse gesture
    if (!isMuted) {
      soundManager.playTick();
    }
    setScreen('intro');
  };

  // Next Intro Line
  const advanceIntro = () => {
    if (!isMuted) soundManager.playTick();
    if (introSegment < 3) {
      setIntroSegment((prev) => prev + 1);
    } else {
      setScreen('quiz');
      triggerToast("Verification Quest Initialized ⚡");
    }
  };

  // Handle Quiz selection
  const handleOptionClick = (optionIndex: number, e: React.MouseEvent) => {
    if (quizStatus !== 'neutral') return; // block multiple clicks during delays

    setSelectedOpt(optionIndex);
    const correctIdx = QUIZ_QUESTIONS[quizIndex].correctIndex;
    
    // In Question 3, any answer qualifies as spectacular because Eyad is cooler anyway!
    const isActuallyCorrect = quizIndex === 2 || optionIndex === correctIdx;

    if (isActuallyCorrect) {
      setQuizStatus('correct');
      setQuizScores((prev) => prev + 1);

      // Trigger starry confetti celebration event in canvas
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = rect.left + rect.width / 2;
      const clickY = rect.top + rect.height / 2;
      
      window.dispatchEvent(
        new CustomEvent('canvas-celebration', {
          detail: { x: clickX, y: clickY, size: 45 }
        })
      );

      // Play chime sound
      window.dispatchEvent(new CustomEvent('play-sound', { detail: 'success' }));

      // Advance to next question or end scene
      setTimeout(() => {
        if (quizIndex < QUIZ_QUESTIONS.length - 1) {
          setQuizIndex((prev) => prev + 1);
          setQuizStatus('neutral');
          setSelectedOpt(null);
        } else {
          setScreen('transition');
          triggerToast("Verification check: SUCCESS 🌟");
          
          // Smooth transition delay to envelope opening scene
          setTimeout(() => {
            setScreen('envelope');
            window.dispatchEvent(new CustomEvent('play-sound', { detail: 'letter' }));
            // Massive sparklers burst at screen center
            window.dispatchEvent(
              new CustomEvent('canvas-celebration', {
                detail: { x: window.innerWidth / 2, y: window.innerHeight / 2, size: 85 }
              })
            );
          }, 3200);
        }
      }, 1600);
    } else {
      setQuizStatus('wrong');
      const randomFailureRemarks = WRONG_ANSWERS_FEEDBACK[Math.floor(Math.random() * WRONG_ANSWERS_FEEDBACK.length)];
      setWrongFeedbackMsg(randomFailureRemarks);
      window.dispatchEvent(new CustomEvent('play-sound', { detail: 'failure' }));

      // Clear wrong visual indicator after a second to allow retries
      setTimeout(() => {
        setQuizStatus('neutral');
        setSelectedOpt(null);
      }, 1800);
    }
  };

  // Handle Envelope open sequence
  const handleEnvelopeClick = () => {
    if (envelopeOpened) return;
    setEnvelopeOpened(true);
    window.dispatchEvent(new CustomEvent('play-sound', { detail: 'letter' }));
    
    // Fire elegant sparkle trail cascade in canvas
    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent('canvas-celebration', {
          detail: { x: window.innerWidth / 2, y: window.innerHeight * 0.45, size: 100 }
        })
      );
    }, 600);

    // Display letter state smoothly
    setTimeout(() => {
      setScreen('letter');
      // Set funny Edeya demand view timer
      setTimeout(() => {
        setShowFunnyEdeya(true);
        window.dispatchEvent(
          new CustomEvent('canvas-celebration', {
            detail: { x: window.innerWidth / 2, y: window.innerHeight * 0.85, size: 50 }
          })
        );
      }, 5500);
    }, 1800);
  };

  // Wholesome ending animation sequence back to envelope folding & closure card
  const handleCloseLetter = () => {
    setClosingSequence(true);
    window.dispatchEvent(new CustomEvent('play-sound', { detail: 'tick' }));
    
    // Reverse slide acoustics (magical sound effect)
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('play-sound', { detail: 'letter' }));
    }, 250);

    // After 1000ms, go back to envelope state & close envelope flap nicely
    setTimeout(() => {
      setScreen('envelope');
      setEnvelopeOpened(false);
      
      // Let the envelope close with soft animation, then fade-out to final emotional 'closure' scene
      setTimeout(() => {
        setScreen('closure');
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('play-sound', { detail: 'success' }));
        }, 300);
      }, 1600);

    }, 1000);
  };

  // Easter Egg quote switcher
  const cycleEasterEgg = () => {
    window.dispatchEvent(new CustomEvent('play-sound', { detail: 'tick' }));
    const currentIdx = FUNNY_EASTER_EGGS.indexOf(easterEggText);
    const nextIdx = (currentIdx + 1) % FUNNY_EASTER_EGGS.length;
    setEasterEggText(FUNNY_EASTER_EGGS[nextIdx]);
    triggerToast("Easter Egg discovered! 🥚✨");
  };

  // Manual Spark Launch on Letter Greeting Screen
  const triggerManualSpark = (e: React.MouseEvent) => {
    window.dispatchEvent(
      new CustomEvent('canvas-celebration', {
        detail: { x: e.clientX, y: e.clientY, size: 30 }
      })
    );
  };

  // Trigger sound request automatically when letter opens
  useEffect(() => {
    if (screen === 'letter') {
      const interval = setInterval(() => {
        window.dispatchEvent(
          new CustomEvent('canvas-celebration', {
            detail: {
              x: Math.random() * window.innerWidth,
              y: Math.random() * (window.innerHeight * 0.6),
              size: 40
            }
          })
        );
      }, 2400);
      return () => clearInterval(interval);
    }
  }, [screen]);

  return (
    <div id="interactive_root" className="relative transition-all duration-700 min-h-screen w-full flex flex-col justify-between overflow-hidden text-gold-100 font-sans select-none selection:bg-gold-500 selection:text-black" style={{ background: 'radial-gradient(circle at 50% 50%, #020b1a 0%, #050505 100%)' }}>
      {/* Premium Corner Decorations from the Bold Typography theme */}
      <div className="absolute top-[20px] left-[20px] w-[100px] h-[100px] border border-gold-500/20 border-r-0 border-b-0 pointer-events-none hidden md:block z-45"></div>
      <div className="absolute bottom-[20px] right-[20px] w-[100px] h-[100px] border border-gold-500/20 border-l-0 border-t-0 pointer-events-none hidden md:block z-45"></div>

      {/* Immersive interactive stardust particle system */}
      <StarryCanvas intensity={screen === 'letter' ? 1.0 : 0.6} withGoldDust={true} />

      {/* FIXED ATMOSPHERIC AMBIENT CONTROLS */}
      <div className="absolute top-5 right-5 z-50 flex items-center gap-3">
        {/* Cinematic sound level indicator */}
        {!isMuted && (
          <div className="hidden sm:flex items-center gap-1 bg-black/60 px-3 py-1.5 rounded-full border border-gold-500/30 text-[10px] tracking-widest uppercase text-gold-400 font-mono">
            <span className="flex h-1.5 w-1.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            AMBIENT LIVE
          </div>
        )}
        <button
          onClick={handleMuteToggle}
          className="relative group flex items-center justify-center w-11 h-11 rounded-full border border-gold-500/30 bg-black/75 hover:bg-gold-950/40 text-gold-400 transition-all duration-300 hover:border-gold-500/60 focus:outline-none focus:ring-1 focus:ring-gold-500 cursor-pointer shadow-lg"
          aria-label="Toggle background cinema audio"
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
          ) : (
            <div className="relative flex items-center justify-center">
              <Volume2 className="w-5 h-5 z-10 transition-transform duration-200 group-hover:scale-110" />
              <div className="absolute inset-0 rounded-full border border-gold-500/40 ripple"></div>
            </div>
          )}
        </button>
      </div>

      {/* FIXED BRANDING HEADLINE / COUNTER (SUBTLE & BEAUTIFUL) */}
      <div className="absolute top-5 left-5 z-40 flex items-center gap-2">
        <div className="w-8 h-8 rounded-full border border-gold-500/40 flex items-center justify-center text-xs font-serif text-gold-500 bg-black/50 select-none">
          E
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-serif font-black tracking-widest text-gold-500">QUEST</span>
          <span className="text-[9px] font-mono uppercase tracking-widest text-[#906b20]">VERIFICATION</span>
        </div>
      </div>

      {/* TOAST SYSTEM FEEDBACKS */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 glass-panel px-4 py-2 rounded-full border border-gold-500/40 flex items-center gap-2 shadow-xl"
          >
            <Sparkles className="w-3.5 h-3.5 text-gold-400 animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-gold-200">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CORE CONTAINER FOR INTERACTIONS */}
      <main className="flex-1 w-full flex items-center justify-center px-4 py-12 relative z-10">
        <AnimatePresence mode="wait">
          
          {/* 1) LOADING SCREEN */}
          {screen === 'loading' && (
            <motion.div
              key="loading_screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
              transition={{ duration: 0.8 }}
              className="w-full max-w-md flex flex-col items-center justify-center text-center px-6 relative"
            >
              <div className="absolute w-72 h-72 rounded-full bg-gold-500/5 blur-[120px] pointer-events-none"></div>

              {/* Pulsing luxurious star mandala container */}
              <div className="relative mb-8 p-1">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 25, ease: 'linear' }}
                  className="w-24 h-24 border border-dashed border-gold-500/40 rounded-full flex items-center justify-center"
                />
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                  className="absolute inset-0 m-auto w-12 h-12 rounded-full gold-shimmer-bg flex items-center justify-center cursor-pointer shadow-lg"
                >
                  <Sparkles className="w-5 h-5 text-black" />
                </motion.div>
              </div>

              {/* Loader typography headings */}
              <h1 className="text-3xl font-serif font-black tracking-widest text-gold-500 mb-2 uppercase gold-text-shimmer">
                Eyad's Universe
              </h1>
              <p className="text-[11px] font-mono uppercase tracking-widest text-[#906b20] mb-8">
                Interactive Lunar Greeting card
              </p>

              {/* Real glassmorphic slider tracker */}
              <div className="w-full glass-panel p-6 rounded-2xl border border-gold-500/10 mb-4 shadow-2xl">
                <div className="flex justify-between items-center text-xs font-mono mb-2">
                  <span className="text-gold-400 font-medium">PREPARING ATMOSPHERE</span>
                  <span className="text-gold-500 font-bold">{loadingProgress}%</span>
                </div>

                {/* Progress gold bar slot */}
                <div className="h-2 w-full bg-black/65 rounded-full overflow-hidden p-[2px] border border-gold-500/10">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-right from-gold-700 via-gold-500 to-amber-300"
                    style={{ width: `${loadingProgress}%` }}
                    transition={{ ease: 'easeOut' }}
                  />
                </div>

                <p className="mt-4 text-xs font-mono text-[#aa7c11] italic h-8 flex items-center justify-center text-center animate-pulse">
                  "{loadingTip}"
                </p>
              </div>

              {/* Interactive prompt trigger after 100% loaded */}
              <AnimatePresence>
                {loadingProgress >= 100 && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 w-full"
                  >
                    <button
                      onClick={startCinematicExperience}
                      className="w-full py-3.5 px-6 rounded-xl font-serif font-bold uppercase tracking-widest text-black gold-shimmer-bg transition-shadow duration-300 hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] active:scale-95 cursor-pointer shadow-md text-sm flex items-center justify-center gap-2"
                    >
                      Enter Surprise Card <MousePointer className="w-4 h-4" />
                    </button>
                    <p className="text-[9px] font-mono text-[rgb(144,107,32)] mt-2">
                      💡 Click to enable synchronized premium space synth pad sound effects
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* 2) CINEMATIC INTRO */}
          {screen === 'intro' && (
            <motion.div
              key="intro_screen"
              initial={{ opacity: 0, filter: 'blur(8px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -30, filter: 'blur(10px)' }}
              transition={{ duration: 0.8 }}
              className="w-full max-w-xl flex flex-col items-center px-4 md:px-8 text-center"
            >
              <div className="glass-panel-heavy p-8 md:p-12 rounded-3xl relative border border-gold-500/20 max-w-md w-full crimson-glow flex flex-col items-center">
                
                {/* Intro typing sequence cards */}
                <div className="min-h-40 flex items-center justify-center mb-10 w-full relative">
                  <AnimatePresence mode="wait">
                    {introSegment === 0 && (
                      <motion.div
                        key="seg0"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05, filter: 'blur(4px)' }}
                        className="text-center"
                      >
                        <span className="text-[12px] font-mono uppercase tracking-widest text-[#aa7c11] block mb-2">INITIALIZING SATELLITE</span>
                        <h2 className="text-4xl font-serif font-extrabold text-gold-500 tracking-relaxed gold-text-shimmer">
                          "Hey..."
                        </h2>
                      </motion.div>
                    )}

                    {introSegment === 1 && (
                      <motion.div
                        key="seg1"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05, filter: 'blur(4px)' }}
                        className="text-center"
                      >
                        <span className="text-[12px] font-mono uppercase tracking-widest text-[#991b1b] block mb-2">TELEPATHY LINK</span>
                        <h2 className="text-2xl font-serif font-black text-white leading-relaxed">
                          I spent hours crafting something incredibly special just for you.
                        </h2>
                      </motion.div>
                    )}

                    {introSegment === 2 && (
                      <motion.div
                        key="seg2"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05, filter: 'blur(4px)' }}
                        className="text-center animate-pulse"
                      >
                        <span className="text-[12px] font-mono uppercase tracking-widest text-[#aa7c11] block mb-2">SYSTEM CONSTRAINTS</span>
                        <h2 className="text-3xl font-serif font-extrabold text-gold-300 leading-normal uppercase">
                          But first...
                        </h2>
                      </motion.div>
                    )}

                    {introSegment === 3 && (
                      <motion.div
                        key="seg3"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05, filter: 'blur(4px)' }}
                        className="text-center"
                      >
                        <span className="text-[12px] font-mono uppercase tracking-widest text-gold-400 block mb-3">SECURITY INTERACTION</span>
                        <h2 className="text-xl font-serif font-bold text-white leading-relaxed">
                          You must prove you are officially a companion of <span className="text-gold-400 border-b border-gold-500/40 pb-1">Eyadfarouk</span>.
                        </h2>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Navigation indicators */}
                <div className="flex gap-2 mb-8">
                  {[0, 1, 2, 3].map((idx) => (
                    <div
                      key={idx}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        introSegment === idx ? 'w-6 bg-gold-500' : 'w-2 bg-gold-950/60'
                      }`}
                    />
                  ))}
                </div>

                {/* Continue Buttons */}
                <button
                  onClick={advanceIntro}
                  className="w-full py-4 rounded-xl font-serif text-xs font-bold uppercase tracking-widest text-black gold-shimmer-bg hover:shadow-[0_0_25px_rgba(212,175,55,0.45)] transition-all duration-300 transform active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  {introSegment === 3 ? "Begin Verification Quest" : "Continue"}
                  <Sparkles className="w-4 h-4 text-black animate-spin" />
                </button>
              </div>
            </motion.div>
          )}

          {/* 3) FRIENDSHIP QUIZ SECTION */}
          {screen === 'quiz' && (
            <motion.div
              key="quiz_screen"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
              transition={{ duration: 0.6 }}
              className="w-full max-w-lg flex flex-col items-center"
            >
              {/* Question progress container and scorecard top banner */}
              <div className="w-full flex justify-between items-center text-xs font-mono mb-4 px-2">
                <span className="text-gold-500 font-bold uppercase tracking-widest">
                  QUEST INTERROGATORY #{QUIZ_QUESTIONS[quizIndex].id}
                </span>
                <span className="text-gold-300 bg-gold-950/40 border border-gold-500/20 px-3 py-1 rounded-full">
                  VERIFIED: <strong className="text-gold-400">{quizIndex}/3</strong>
                </span>
              </div>

              {/* Progress Slider Bar */}
              <div className="w-full h-1 bg-black/55 rounded-full overflow-hidden mb-6 border border-gold-500/10">
                <motion.div
                  className="h-full bg-gold-500"
                  initial={{ width: '0%' }}
                  animate={{ width: `${((quizIndex + 1) / 3) * 100}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>

              {/* Glass container with questions */}
              <div
                className={`w-full glass-panel p-8 rounded-3xl transition-all duration-300 border relative ${
                  quizStatus === 'correct'
                    ? 'border-emerald-500/45 gold-glow'
                    : quizStatus === 'wrong'
                    ? 'border-red-500/45 md:animate-bounce shadow-2xl skew-x-1 duration-75'
                    : 'border-gold-500/15'
                }`}
                style={quizStatus === 'wrong' ? { animation: 'glitch 0.3s cubic-bezier(.25, .46, .45, .94) both 1' } : undefined}
              >
                {/* Glow lights */}
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-[1px] bg-gradient-to-r from-transparent via-gold-500/50 to-transparent"></span>

                {/* Main animated question label */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={quizIndex}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="mb-8"
                  >
                    <h3 className="text-xl md:text-2xl font-serif font-black text-center text-white leading-relaxed">
                      {QUIZ_QUESTIONS[quizIndex].question}
                    </h3>
                  </motion.div>
                </AnimatePresence>

                {/* Option card items list */}
                <div className="flex flex-col gap-3.5 mb-6">
                  {QUIZ_QUESTIONS[quizIndex].options.map((option, idx) => {
                    const isSelected = selectedOpt === idx;
                    const isCorrect = idx === QUIZ_QUESTIONS[quizIndex].correctIndex;
                    
                    // Style indicators
                    let styleClass = "border-gold-500/15 bg-black/40 text-gold-200 hover:border-gold-500/40 hover:bg-gold-500/5 hover:text-white";
                    
                    if (quizStatus === 'correct' && isSelected) {
                      styleClass = "border-emerald-500 bg-emerald-950/20 text-emerald-300 ring-2 ring-emerald-500/10";
                    } else if (quizStatus === 'wrong' && isSelected) {
                      styleClass = "border-red-500 bg-red-950/20 text-red-300 ring-2 ring-red-500/10";
                    } else if (quizStatus !== 'neutral' && isCorrect) {
                      // Highlight correct choice after choice submission
                      styleClass = "border-emerald-500/60 bg-emerald-950/10 text-emerald-200";
                    }

                    return (
                      <button
                        key={idx}
                        onClick={(e) => handleOptionClick(idx, e)}
                        disabled={quizStatus !== 'neutral'}
                        className={`w-full text-left p-4 rounded-xl border text-sm transition-all duration-300 flex items-center justify-between cursor-pointer focus:outline-none ${styleClass}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 flex items-center justify-center rounded-lg border border-gold-500/30 text-xs font-mono bg-black text-gold-400">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span className="font-medium">{option}</span>
                        </div>
                        
                        <div className="flex items-center">
                          {quizStatus === 'correct' && isSelected && (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          )}
                          {quizStatus === 'wrong' && isSelected && (
                            <XCircle className="w-5 h-5 text-red-400" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Correct/Incorrect funny texts prompt panel */}
                <div className="min-h-12 flex items-center justify-center text-center">
                  <AnimatePresence mode="wait">
                    {quizStatus === 'correct' && (
                      <motion.p
                        key="cmt_correct"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-xs font-mono text-emerald-400 flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4 animate-bounce" /> Correct choice! Eyad's cool status is glowing!
                      </motion.p>
                    )}

                    {quizStatus === 'wrong' && (
                      <motion.p
                        key="cmt_wrong"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-xs font-mono text-red-400 flex items-center gap-1.5"
                      >
                        <XCircle className="w-4 h-4 hover:animate-spin" /> {wrongFeedbackMsg}
                      </motion.p>
                    )}

                    {quizStatus === 'neutral' && (
                      <motion.p
                        key="cmt_tip"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.65 }}
                        className="text-[11px] font-mono text-gold-400 italic"
                      >
                        {quizIndex === 0 && "Hint: Eyad builds robust compilers. 🧑‍💻"}
                        {quizIndex === 1 && "Hint: Look for the most magnificent future! 🚀"}
                        {quizIndex === 2 && "Eyad is so cool, no wrong choices possible! Click anyone! 😄"}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}

          {/* 4) TRANSITION SCENE */}
          {screen === 'transition' && (
            <motion.div
              key="transition_screen"
              initial={{ opacity: 0, filter: 'blur(20px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.85, filter: 'blur(25px)' }}
              transition={{ duration: 1.0 }}
              className="w-full max-w-md text-center flex flex-col items-center justify-center"
            >
              <div className="p-8">
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 180, scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5 }}
                  className="w-14 h-14 border border-gold-500 rounded-full mx-auto mb-8 flex items-center justify-center"
                >
                  <UserCheck className="w-6 h-6 text-gold-500 animate-pulse" />
                </motion.div>
                
                <h2 className="text-4xl font-serif font-extrabold tracking-widest text-gold-500 mb-4 gold-text-shimmer uppercase leading-tight">
                  You passed.
                </h2>
                
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 0.9, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="text-md font-serif text-gold-300 italic tracking-wider leading-relaxed"
                >
                  "Now you deserve the message."
                </motion.p>
              </div>
            </motion.div>
          )}

          {/* 5) ENVELOPE SECTION */}
          {screen === 'envelope' && (
            <motion.div
              key="envelope_screen"
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1, filter: 'blur(15px)' }}
              className="w-full max-w-sm flex flex-col items-center"
            >
              <div className="text-center mb-6">
                <span className="text-[11px] font-mono tracking-[0.5em] uppercase text-[#c5a059] block mb-2">
                  A TOKEN OF FRIENDSHIP
                </span>
                <h1 className="text-5xl md:text-6xl font-serif font-bold select-none bg-gradient-to-b from-white via-gold-200 to-gold-500 text-transparent bg-clip-text italic tracking-wide">
                  Eid Mubarak
                </h1>
                <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-gold-400 mt-3">Tap to crack the golden seals and open letter</p>
              </div>

              {/* 3D Envelope Element with linear side decoration lines */}
              <div className="relative py-4">
                <div className="absolute left-[-70px] top-1/2 -translate-y-1/2 w-[50px] h-[1px] bg-gold-400/30 hidden sm:block"></div>
                <div className="absolute right-[-70px] top-1/2 -translate-y-1/2 w-[50px] h-[1px] bg-gold-400/30 hidden sm:block"></div>

                <motion.div
                  whileHover={{ scale: 1.05, rotateZ: 1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleEnvelopeClick}
                  className="relative w-80 h-52 bg-[#090b14] rounded-2xl border border-gold-500/30 flex items-center justify-center cursor-pointer overflow-hidden transition-all duration-300 hover:border-gold-500 shadow-[0_20px_50px_rgba(0,0,0,0.8)] md:shadow-[0_25px_60px_rgba(212,175,55,0.15)] group"
                >
                  {/* Gold rim glow borders */}
                  <div className="absolute inset-[1px] rounded-2xl bg-[#04050a] z-0" />

                  {/* Envelope Flap geometry simulation via linear design borders */}
                  <div className="absolute inset-0 z-10 pointer-events-none">
                    {/* Visual Left folding boundary */}
                    <svg className="w-full h-full opacity-60 text-gold-500/30" xmlns="http://www.w3.org/2000/svg">
                      <line x1="0" y1="0" x2="160" y2="104" stroke="currentColor" strokeWidth="1" />
                      <line x1="320" y1="0" x2="160" y2="104" stroke="currentColor" strokeWidth="1" />
                      <line x1="0" y1="208" x2="160" y2="104" stroke="currentColor" strokeWidth="1" strokeDasharray="3,3" />
                      <line x1="320" y1="208" x2="160" y2="104" stroke="currentColor" strokeWidth="1" strokeDasharray="3,3" />
                    </svg>
                  </div>

                  {/* Wax seal emblem */}
                  <div className="absolute z-20 flex flex-col items-center justify-center">
                    <motion.div
                      animate={{ scale: [1, 1.07, 1] }}
                      transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                      className="w-14 h-14 rounded-full bg-gradient-to-r from-red-800 to-red-600 border border-gold-500/50 flex items-center justify-center shadow-lg group-hover:from-gold-600 group-hover:to-gold-400 group-hover:border-white transition-all duration-300 pointer-events-none duration-500"
                    >
                      {/* Crescent moon visual inside seal */}
                      <Gift className="w-6 h-6 text-gold-100 group-hover:text-black transition-colors" />
                    </motion.div>
                    <span className="text-[9px] font-serif font-black tracking-widest text-[#aa7c11] mt-3 uppercase pointer-events-none group-hover:text-gold-400">
                      CLICK SEAL
                    </span>
                  </div>

                  {/* Soft ambient shine effect reflection */}
                  <div className="absolute -inset-1 px-8 py-2 w-12 hover:left-full bg-white/10 opacity-30 blur-md transform -skew-x-[35deg] transition-all duration-1000 z-10 pointer-events-none" />

                </motion.div>
              </div>

              {/* Secure verification stamp badge */}
              <div className="mt-4 flex items-center gap-1.5 opacity-50 text-[10px] font-mono tracking-wider">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                GENUINE COMPANION ID VERIFIED (88%)
              </div>
            </motion.div>
          )}

          {/* 6) FINAL MESSAGE (LETTER CARD STATE) */}
          {screen === 'letter' && (
            <motion.div
              key="letter_screen"
              initial={{ opacity: 0, scale: 0.9, y: 60 }}
              animate={closingSequence ? { opacity: 0, scale: 0.85, y: 150, filter: 'blur(10px)' } : { opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 50, damping: 15 }}
              onClick={triggerManualSpark}
              className="w-full max-w-lg flex flex-col items-center cursor-crosshair px-2"
              title="Click anywhere for customized firework bursts!"
            >
              {/* Outer Envelope sliding backing frame representation */}
              <div className="w-full glass-panel-heavy p-8 md:p-12 rounded-3xl relative border border-gold-500/35 shadow-[0_30px_70px_rgba(0,0,0,0.9)] crimson-glow text-center overflow-hidden">
                
                {/* Magical corner luxury gold stars decorative SVGs */}
                <div className="absolute top-4 left-4 text-gold-500/40 w-8 h-8 pointer-events-none">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" />
                  </svg>
                </div>
                <div className="absolute top-4 right-4 text-gold-500/40 w-8 h-8 pointer-events-none">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" />
                  </svg>
                </div>

                {/* Gold header tag for Eid Mubarak */}
                <span className="inline-block px-5 py-1.5 rounded-full border border-gold-500/30 bg-gold-950/20 text-[11px] font-serif font-black tracking-[0.2em] text-gold-400 uppercase mb-8">
                  EID SURPRISE DELIVERED ✨
                </span>

                {/* HUGE GORGEOUS ARABIC CALIGRAPHY COMPLIMENT GREETING */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mb-8"
                >
                  <p className="font-arabic text-3xl md:text-4xl font-extrabold leading-normal text-gold-500 text-shadow-lg tracking-wide dir-rtl" style={{ direction: 'rtl' }}>
                    كل سنة وانت طيب يا صاحبي ❤️
                  </p>
                  <p className="font-arabic text-xl md:text-2xl font-semibold leading-relaxed text-yellow-100/90 mt-4 tracking-wide dir-rtl" style={{ direction: 'rtl' }}>
                    وربنا يديم الضحك والهزار بينا.
                  </p>
                </motion.div>

                {/* Subtle description translator below */}
                <p className="text-[10px] font-mono uppercase tracking-widest text-[#aa7c11] max-w-xs mx-auto mb-10 border-t border-gold-500/10 pt-4 opacity-75">
                  May God bless our friendship with laughter forever.
                </p>

                {/* Sparkle banner callout tip */}
                <span className="text-[11px] font-mono text-gold-300 flex items-center justify-center gap-1 opacity-70 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-gold-500 animate-spin" /> Click anywhere for custom explosive golden fireworks!
                </span>

                {/* Emotional beautiful statement and Close button */}
                <AnimatePresence>
                  {showFunnyEdeya && (
                    <motion.div
                      initial={{ opacity: 0, y: 25, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ type: 'spring', stiffness: 80, delay: 0.5 }}
                      className="mt-8 p-6 rounded-2xl bg-black/65 border border-gold-500/15 shadow-2xl relative"
                    >
                      <span className="text-gold-500 font-mono text-[9px] tracking-widest uppercase block mb-2">
                        🌙 MESSAGE OF APPRECIATION
                      </span>
                      <p className="font-arabic text-base md:text-md font-medium leading-relaxed text-yellow-50/95 tracking-wide mb-6 text-center" style={{ direction: 'rtl' }}>
                        ممتن جداً لوجودك في حياتي يا صاحبي. كل سنة واحنا دايماً سوا بنضحك، بنهزر، وبنحقق أحلامنا. دمت لي رفيقاً جميلاً وطيباً. ❤️
                      </p>

                      <div className="flex flex-col items-center gap-3">
                        {/* The small elegant close button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCloseLetter();
                          }}
                          className="px-6 py-2.5 rounded-xl text-xs font-mono font-bold tracking-widest uppercase bg-gradient-to-r from-gold-800 to-gold-600 hover:from-gold-600 hover:to-gold-400 text-black shadow-[0_0_15px_rgba(212,175,55,0.2)] hover:shadow-[0_0_25px_rgba(212,175,55,0.4)] active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          Close the Letter ✨
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            </motion.div>
          )}

          {/* 7) CLINICAL / BEAUTIFUL EMOTIONAL CLOSURE STATE */}
          {screen === 'closure' && (
            <motion.div
              key="closure_screen"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 1.8, ease: 'easeOut' }}
              className="w-full max-w-md text-center flex flex-col items-center justify-center py-12 px-4 relative z-10"
            >
              <div className="absolute w-96 h-96 rounded-full bg-gold-500/5 blur-[120px] pointer-events-none"></div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 1.5 }}
                className="flex flex-col items-center"
              >
                {/* Glowing subtle heart or moon ornament */}
                <motion.div
                  animate={{ scale: [1, 1.15, 1], y: [0, -4, 0] }}
                  transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
                  className="mb-8"
                >
                  <Heart className="w-12 h-12 text-[#b91c1c] fill-[#b91c1c] drop-shadow-[0_0_15px_rgba(185,28,28,0.9)]" />
                </motion.div>

                <h1 className="text-5xl md:text-6xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-b from-white via-gold-200 to-gold-500 tracking-wide italic mb-4 drop-shadow-md pb-1">
                  ❤️ Eid Mubarak
                </h1>
                
                <p className="text-sm font-serif text-gold-300 tracking-widest italic max-w-xs leading-relaxed opacity-90 mt-2">
                  "May your days be filled with love, laughter, and light."
                </p>

                <p className="text-[10px] font-mono tracking-[0.4em] uppercase text-gold-500/50 mt-12 opacity-70">
                  A premium gift for Eyadfarouk
                </p>

                {/* Replay action button simplicity & elegantly */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setScreen('loading');
                    setLoadingProgress(0);
                    setClosingSequence(false);
                    setEnvelopeOpened(false);
                    setShowFunnyEdeya(false);
                  }}
                  className="mt-12 px-6 py-2.5 rounded-full border border-gold-500/20 hover:border-gold-500/50 bg-black/60 hover:bg-gold-950/20 text-xs font-mono tracking-widest uppercase text-gold-400 transition-all duration-300 cursor-pointer text-shadow"
                >
                  Replay Experience ↺
                </motion.button>
              </motion.div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* FOOTER WIDGET WITH INTERACTIVE EASTER EGG BAR & BRANDING INPAGE (MODIFIED LITERALLY TO PREVENT TECH LARPING SLOP) */}
      <footer className="w-full py-4 text-center border-t border-gold-500/5 bg-black/40 z-20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={cycleEasterEgg}
            className="group flex items-center gap-2 bg-gold-950/20 hover:bg-gold-900/40 px-4 py-2 rounded-xl text-xs font-mono text-gold-400 cursor-pointer border border-gold-500/10 hover:border-gold-500/30 transition-all duration-300"
          >
            <Gamepad2 className="w-3.5 h-3.5 text-gold-500 animate-spin" />
            <span>Easter Fact:</span>
            <span className="text-gold-200 group-hover:text-gold-100 transition-colors text-left max-w-xs truncate md:max-w-md">
              "{easterEggText}"
            </span>
          </button>

          <p className="text-[10px] font-mono text-[#6e4e19] uppercase tracking-wider">
            🌙 Eyadfarouk Friendship Quest & Greeting card
          </p>
        </div>
      </footer>
    </div>
  );
}
