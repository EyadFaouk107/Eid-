import React, { useEffect, useRef } from 'react';
import { Particle } from '../types';

interface StarryCanvasProps {
  intensity?: number; // 0 to 1
  withGoldDust?: boolean;
}

export const StarryCanvas: React.FC<StarryCanvasProps> = ({
  intensity = 0.5,
  withGoldDust = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const starsRef = useRef<{ x: number; y: number; size: number; alpha: number; speed: number }[]>([]);
  const mouseRef = useRef<{ x: number; y: number; targetX: number; targetY: number; radius: number }>({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    radius: 120,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle physical size changes in accordance with ResizeObserver rules
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        canvas.width = width;
        canvas.height = height;

        // Populate base starry backdrop dynamically
        const starCount = Math.floor((width * height) / 8000) * (intensity + 0.5);
        const newStars = [];
        for (let i = 0; i < starCount; i++) {
          newStars.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 1.8 + 0.4,
            alpha: Math.random() * 0.7 + 0.3,
            speed: Math.random() * 0.05 + 0.01,
          });
        }
        starsRef.current = newStars;
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Set initial mouse position in the center
    mouseRef.current.x = window.innerWidth / 2;
    mouseRef.current.y = window.innerHeight / 2;
    mouseRef.current.targetX = window.innerWidth / 2;
    mouseRef.current.targetY = window.innerHeight / 2;

    // Capture pointer moves for aura and trails
    const handlePointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.targetX = e.clientX - rect.left;
      mouseRef.current.targetY = e.clientY - rect.top;

      // Spawn subtle golden dust trail on move
      if (withGoldDust && Math.random() < 0.25) {
        spawnGoldDust(e.clientX - rect.left, e.clientY - rect.top, 3);
      }
    };

    window.addEventListener('pointermove', handlePointerMove);

    // Helper to spawn elegant golden and ruby star dust particles
    const spawnGoldDust = (x: number, y: number, count: number = 8, isExplosion = false) => {
      const colors = [
        'rgba(212, 175, 55, ', // Gold
        'rgba(245, 228, 183, ', // Light gold/champagne
        'rgba(181, 141, 42, ', // Deep bronze
        'rgba(153, 27, 27, ', // Ruby crimson
        'rgba(251, 245, 223, ', // Light starlight
      ];

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speedMultiplier = isExplosion ? Math.random() * 5 + 2 : Math.random() * 1.5 + 0.3;
        const vx = Math.cos(angle) * speedMultiplier;
        const vy = Math.sin(angle) * speedMultiplier - (isExplosion ? 1.5 : 0.2); // slight upwards float

        particlesRef.current.push({
          x,
          y,
          vx,
          vy,
          alpha: 1.0,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * (isExplosion ? 3.5 : 2.5) + 0.8,
          decay: Math.random() * 0.016 + 0.008,
          spin: Math.random() * Math.PI * 2,
          spinSpeed: (Math.random() - 0.5) * 0.1,
        });
      }
    };

    // Global listener for custom celebrations (fireworks/bursts)
    const handleCelebration = (e: Event) => {
      const customEvent = e as CustomEvent<{ x: number; y: number; size?: number }>;
      const { x, y, size } = customEvent.detail || {};
      const targetX = x || canvas.width / 2;
      const targetY = y || canvas.height / 3;

      const particlesToSpawn = size || 65;
      spawnGoldDust(targetX, targetY, particlesToSpawn, true);

      // Sound trigger
      window.dispatchEvent(new CustomEvent('play-sound', { detail: 'success' }));
    };

    window.addEventListener('canvas-celebration', handleCelebration);

    // Continuous physics canvas rendering loop
    let animationId: number;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Draw solid dark background fade
      ctx.fillStyle = '#030408';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Subtle dynamic background glow color at mouse
      // Interpolate mouse coordinates smoothly (lerping)
      const mouse = mouseRef.current;
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      const radialGlow = ctx.createRadialGradient(
        mouse.x,
        mouse.y,
        10,
        mouse.x,
        mouse.y,
        mouse.radius * 2.5
      );
      radialGlow.addColorStop(0, 'rgba(16, 21, 40, 0.45)');
      radialGlow.addColorStop(0.5, 'rgba(15, 10, 24, 0.15)');
      radialGlow.addColorStop(1, 'rgba(3, 4, 8, 0)');
      ctx.fillStyle = radialGlow;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Draw luxury starry cosmos
      starsRef.current.forEach((star) => {
        // Slow organic blinking / twinkling
        star.alpha += star.speed;
        if (star.alpha > 0.95 || star.alpha < 0.15) {
          star.speed = -star.speed;
        }

        // Slight drift downwards representing falling dust
        star.y += 0.05;
        if (star.y > canvas.height) {
          star.y = 0;
          star.x = Math.random() * canvas.width;
        }

        ctx.fillStyle = `rgba(212, 175, 55, ${star.alpha})`; // Warm golden twinkling
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Update & render explosive gold particles
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        
        // gravity/drag physics
        p.vy += 0.04; // gravity pulling sparks downwards
        p.vx *= 0.985;
        p.vy *= 0.985;

        p.alpha -= p.decay;

        if (p.spin !== undefined && p.spinSpeed !== undefined) {
          p.spin += p.spinSpeed;
        }

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.fillStyle = p.color + p.alpha + ')';

        ctx.save();
        ctx.translate(p.x, p.y);
        
        if (p.spin !== undefined) {
          ctx.rotate(p.spin);
          // Draw diamond star sparkles for standard confetti
          ctx.beginPath();
          ctx.moveTo(0, -p.size);
          ctx.lineTo(p.size * 0.5, 0);
          ctx.lineTo(0, p.size);
          ctx.lineTo(-p.size * 0.5, 0);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        
        ctx.restore();
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('canvas-celebration', handleCelebration);
      cancelAnimationFrame(animationId);
    };
  }, [intensity, withGoldDust]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0"
    >
      <canvas
        ref={canvasRef}
        className="block w-full h-full pointer-events-none"
      />
    </div>
  );
};
