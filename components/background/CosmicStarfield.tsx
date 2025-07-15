'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface Star {
  x: number;
  y: number;
  z: number;
  size: number;
  speed: number;
  opacity: number;
  color: string;
  twinkle: number;
}

interface CosmicStarfieldProps {
  /** Number of stars to render */
  starCount?: number;
  /** Enable parallax mouse movement */
  parallax?: boolean;
  /** Animation speed multiplier */
  speed?: number;
  /** Star colors palette */
  colors?: string[];
  /** Enable twinkling effect */
  twinkling?: boolean;
  /** Enable performance optimizations for mobile */
  optimized?: boolean;
  /** Custom className */
  className?: string;
}

export default function CosmicStarfield({
  starCount = 150,
  parallax = true,
  speed = 1,
  colors = [
    'rgba(56, 189, 248, 0.8)',   // electric-blue
    'rgba(45, 212, 191, 0.7)',   // teal-400
    'rgba(168, 85, 247, 0.6)',   // purple-500
    'rgba(236, 72, 153, 0.5)',   // pink-500
    'rgba(255, 255, 255, 0.4)',  // white
  ],
  twinkling = true,
  optimized = true,
  className = ''
}: CosmicStarfieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number>();
  const [isMobile, setIsMobile] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  // Performance optimization: Detect mobile and reduced motion
  useEffect(() => {
    const checkMobile = () => window.innerWidth < 768;
    const checkReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    setIsMobile(checkMobile());
    setIsReducedMotion(checkReducedMotion());

    const handleResize = () => setIsMobile(checkMobile());
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize stars
  const initializeStars = (canvas: HTMLCanvasElement) => {
    const stars: Star[] = [];
    const adjustedStarCount = optimized && isMobile ? Math.min(starCount, 75) : starCount;

    for (let i = 0; i < adjustedStarCount; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * 1000,
        size: Math.random() * 2 + 0.5,
        speed: (Math.random() * 0.5 + 0.2) * speed,
        opacity: Math.random() * 0.8 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        twinkle: Math.random() * Math.PI * 2
      });
    }

    starsRef.current = stars;
  };

  // Update stars animation
  const updateStars = (canvas: HTMLCanvasElement, deltaTime: number) => {
    starsRef.current.forEach(star => {
      // Move star based on Z depth for parallax effect
      const parallaxFactor = parallax ? (1000 - star.z) / 1000 : 1;
      
      // Gentle floating motion
      star.x += Math.sin(deltaTime * 0.001 + star.z) * 0.1 * parallaxFactor * speed;
      star.y += Math.cos(deltaTime * 0.0008 + star.z) * 0.05 * parallaxFactor * speed;

      // Twinkling effect
      if (twinkling && !isReducedMotion) {
        star.twinkle += 0.02 * speed;
        star.opacity = 0.3 + Math.sin(star.twinkle) * 0.5;
      }

      // Wrap around screen
      if (star.x < -50) star.x = canvas.width + 50;
      if (star.x > canvas.width + 50) star.x = -50;
      if (star.y < -50) star.y = canvas.height + 50;
      if (star.y > canvas.height + 50) star.y = -50;
    });
  };

  // Render stars
  const renderStars = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    starsRef.current.forEach(star => {
      const parallaxFactor = parallax ? (1000 - star.z) / 1000 : 1;
      const size = star.size * parallaxFactor;
      
      // Mouse parallax effect
      let offsetX = 0, offsetY = 0;
      if (parallax && !isMobile) {
        const mouseInfluence = 0.00005 * parallaxFactor;
        offsetX = (mouseRef.current.x - canvas.width / 2) * mouseInfluence;
        offsetY = (mouseRef.current.y - canvas.height / 2) * mouseInfluence;
      }

      const x = star.x + offsetX;
      const y = star.y + offsetY;

      // Draw star with glow effect
      ctx.save();
      ctx.globalAlpha = star.opacity;
      
      // Create gradient for glow effect
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 3);
      gradient.addColorStop(0, star.color);
      gradient.addColorStop(1, 'transparent');

      // Draw glow
      ctx.fillStyle = gradient;
      ctx.fillRect(x - size * 3, y - size * 3, size * 6, size * 6);

      // Draw star core
      ctx.fillStyle = star.color;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });
  };

  // Mouse movement handler
  const handleMouseMove = (event: MouseEvent) => {
    if (!parallax || isMobile) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    mouseRef.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  };

  // Main animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initializeStars(canvas);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Mouse movement for parallax
    if (parallax && !isMobile) {
      document.addEventListener('mousemove', handleMouseMove);
    }

    // Animation loop with throttling for performance
    let lastTime = 0;
    const targetFPS = optimized && isMobile ? 30 : 60;
    const frameInterval = 1000 / targetFPS;

    const animate = (currentTime: number) => {
      if (currentTime - lastTime >= frameInterval) {
        if (!isReducedMotion) {
          updateStars(canvas, currentTime);
        }
        renderStars(ctx, canvas);
        lastTime = currentTime;
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animate(0);

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (parallax && !isMobile) {
        document.removeEventListener('mousemove', handleMouseMove);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [starCount, parallax, speed, colors, twinkling, optimized, isMobile, isReducedMotion]);

  return (
    <div className={`fixed inset-0 pointer-events-none ${className}`} style={{ zIndex: -1 }}>
      {/* Cosmic background gradient */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-blue-900/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      />
      
      {/* Animated nebula clouds */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
        animate={{
          x: [0, 50, 0],
          y: [0, -30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear'
        }}
      />
      
      <motion.div
        className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"
        animate={{
          x: [0, -30, 0],
          y: [0, 40, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'linear'
        }}
      />

      {/* Main starfield canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ opacity: isReducedMotion ? 0.3 : 0.6 }}
      />

      {/* Subtle grid overlay for depth */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(56, 189, 248, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)
          `
        }}
      />
    </div>
  );
} 