"use client";
import React, { useEffect, useRef } from 'react';

interface ParticleProps {
  fullScreen?: boolean;
  particleCount?: number;
  speed?: number;
  size?: number;
  colors?: string[];
  glowIntensity?: number;
}

type ParticleType = {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  glowIntensity: number;
  glowDirection: number;
  color: string;
  update: (canvas: HTMLCanvasElement) => void;
  draw: (ctx: CanvasRenderingContext2D, globalGlowIntensity: number) => void;
};

class Particle implements ParticleType {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  glowIntensity: number;
  glowDirection: number;
  color: string;

  constructor(
    canvas: HTMLCanvasElement,
    size: number,
    speed: number,
    colors: string[]
  ) {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * size + size/2;
    this.speedX = (Math.random() * 2 - 1) * speed;
    this.speedY = (Math.random() * 2 - 1) * speed;
    this.opacity = Math.random() * 0.6 + 0.4;
    this.glowIntensity = Math.random();
    this.glowDirection = Math.random() > 0.5 ? 1 : -1;
    this.color = colors[Math.floor(Math.random() * colors.length)];
  }

  update(canvas: HTMLCanvasElement): void {
    this.x += this.speedX;
    this.y += this.speedY;

    if (this.x > canvas.width) this.x = 0;
    else if (this.x < 0) this.x = canvas.width;
    if (this.y > canvas.height) this.y = 0;
    else if (this.y < 0) this.y = canvas.height;

    this.glowIntensity += 0.01 * this.glowDirection;
    if (this.glowIntensity > 1) this.glowDirection = -1;
    else if (this.glowIntensity < 0) this.glowDirection = 1;
  }

  draw(ctx: CanvasRenderingContext2D, globalGlowIntensity: number): void {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = this.color;
    
    // Simplified drawing for better mobile performance - avoid expensive shadow operations
    if (globalGlowIntensity > 0) {
      ctx.shadowColor = this.color;
      ctx.shadowBlur = Math.min(5, 15 * this.glowIntensity * globalGlowIntensity);
    }
    
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

const FloatingParticles: React.FC<ParticleProps> = ({
  fullScreen = true,
  particleCount = 50,
  speed = 0.5,
  size = 2,
  colors = ['#38bdf8', '#f472b6', '#0ea5e9', '#22d3ee'],
  glowIntensity = 0.3
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Mobile performance detection
    const isMobile = window.innerWidth < 768;
    const isLowPowerDevice = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Disable particles on mobile or low-power devices to prevent crashes
    if (isMobile || isLowPowerDevice || reducedMotion) {
      console.log('[FloatingParticles] Disabled on mobile/low-power device for performance');
      return;
    }

    // Set canvas size
    const resizeCanvas = () => {
      if (!canvas) return;
      const container = canvas.parentElement;
      if (!container) return;
      
      canvas.width = fullScreen ? window.innerWidth : container.offsetWidth;
      canvas.height = fullScreen ? window.innerHeight : container.offsetHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Reduce particle count for better performance
    const optimizedParticleCount = Math.min(particleCount, 25);
    const particles = Array.from({ length: optimizedParticleCount }, () => new Particle(canvas, size, speed, colors));

    // Throttled animation loop for performance
    let animationFrameId: number;
    let lastTime = 0;
    const targetFPS = 30; // Limit to 30fps for better mobile performance
    const frameInterval = 1000 / targetFPS;
    
    const animate = (currentTime: number) => {
      if (!ctx || !canvas) return;
      
      if (currentTime - lastTime >= frameInterval) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(p => {
          p.update(canvas);
          p.draw(ctx, glowIntensity * 0.5); // Reduce glow intensity for performance
        });
        
        lastTime = currentTime;
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate(0);

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [fullScreen, particleCount, speed, size, colors, glowIntensity]);

  return (
    <canvas 
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none opacity-60"
    />
  );
};

export default FloatingParticles;
