"use client";
import React, { useEffect, useRef } from 'react';

interface ParticleProps {
  fullScreen?: boolean;
  particleCount?: number;
  speed?: number;
  size?: number;
  colors?: string[];
  glowIntensity?: number;
  enableOrbs?: boolean;
  enableShootingStars?: boolean;
  enableParallax?: boolean;
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

// --- Orb Particle (large, slow, strong glow) ---
class OrbParticle implements ParticleType {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  glowIntensity: number;
  glowDirection: number;
  color: string;
  layer: number; // for parallax

  constructor(canvas: HTMLCanvasElement, colors: string[]) {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 60 + 40;
    this.speedX = (Math.random() * 0.2 - 0.1);
    this.speedY = (Math.random() * 0.2 - 0.1);
    this.opacity = Math.random() * 0.15 + 0.08;
    this.glowIntensity = 1;
    this.glowDirection = 1;
    this.color = colors[Math.floor(Math.random() * colors.length)];
    this.layer = Math.random() * 0.5 + 0.5;
  }
  update(canvas: HTMLCanvasElement): void {
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.x > canvas.width) this.x = 0;
    else if (this.x < 0) this.x = canvas.width;
    if (this.y > canvas.height) this.y = 0;
    else if (this.y < 0) this.y = canvas.height;
  }
  draw(ctx: CanvasRenderingContext2D, globalGlowIntensity: number): void {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 80 * globalGlowIntensity;
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  }
}

// --- Shooting Star Particle (rare, fast, white/cyan trail) ---
class ShootingStarParticle implements ParticleType {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  glowIntensity: number;
  glowDirection: number;
  color: string;
  trail: {x: number, y: number}[];
  maxTrail: number;
  active: boolean;
  constructor(canvas: HTMLCanvasElement) {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height * 0.5;
    this.size = Math.random() * 1.5 + 1;
    this.speedX = Math.random() * 6 + 4;
    this.speedY = Math.random() * 2 - 1;
    this.opacity = 1;
    this.glowIntensity = 1;
    this.glowDirection = 1;
    this.color = Math.random() > 0.5 ? '#e0f2fe' : '#a5f3fc';
    this.trail = [];
    this.maxTrail = 16;
    this.active = true;
  }
  update(canvas: HTMLCanvasElement): void {
    if (!this.active) return;
    this.trail.push({x: this.x, y: this.y});
    if (this.trail.length > this.maxTrail) this.trail.shift();
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.x > canvas.width + 40 || this.y > canvas.height + 40 || this.y < -40) {
      this.active = false;
    }
  }
  draw(ctx: CanvasRenderingContext2D, globalGlowIntensity: number): void {
    if (!this.active) return;
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.strokeStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 20 * globalGlowIntensity;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < this.trail.length; i++) {
      const pt = this.trail[i];
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    }
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  }
}

// --- Main Particle (small, cosmic, glowy) ---
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
  colors = [
    'linear-gradient(90deg, #38bdf8 0%, #0ea5e9 100%)',
    '#f472b6',
    'linear-gradient(90deg, #22d3ee 0%, #818cf8 100%)',
    '#a5b4fc',
    '#0ea5e9',
    '#22d3ee',
    '#818cf8',
    '#f472b6',
  ],
  glowIntensity = 0.3,
  enableOrbs = true,
  enableShootingStars = true,
  enableParallax = true,
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

    // Particle counts and layers
    const desktop = window.innerWidth >= 1024;
    const optimizedParticleCount = desktop ? Math.min(particleCount, 42) : Math.min(particleCount, 25);
    const orbCount = enableOrbs && desktop ? 4 : 2;
    const shootingStarCount = enableShootingStars && desktop ? 1 : 0;
    // Main cosmic particles
    const particles = Array.from({ length: optimizedParticleCount }, () => new Particle(canvas, size, speed, colors));
    // Orbs
    const orbs = enableOrbs ? Array.from({ length: orbCount }, () => new OrbParticle(canvas, colors)) : [];
    // Shooting stars (start as inactive)
    let shootingStars: ShootingStarParticle[] = [];
    if (enableShootingStars) {
      shootingStars = Array.from({ length: shootingStarCount }, () => new ShootingStarParticle(canvas));
    }
    let shootingStarTimer = 0;

    // Throttled animation loop for performance
    let animationFrameId: number;
    let lastTime = 0;
    const targetFPS = 30; // Limit to 30fps for better mobile performance
    const frameInterval = 1000 / targetFPS;
    
    const animate = (currentTime: number) => {
      if (!ctx || !canvas) return;
      // Parallax offset for orbs
      let parallaxX = 0, parallaxY = 0;
      if (enableParallax) {
        parallaxX = (window.innerWidth/2 - (window as any).mouseX || 0) * 0.01;
        parallaxY = (window.innerHeight/2 - (window as any).mouseY || 0) * 0.01;
      }
      if (currentTime - lastTime >= frameInterval) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Orbs (draw behind)
        orbs.forEach(orb => {
          if (enableParallax) {
            orb.x += parallaxX * orb.layer;
            orb.y += parallaxY * orb.layer;
          }
          orb.update(canvas);
          orb.draw(ctx, glowIntensity * 1.2);
        });
        // Main cosmic particles
        particles.forEach(p => {
          p.update(canvas);
          p.draw(ctx, glowIntensity * 0.7);
        });
        // Shooting stars
        if (enableShootingStars) {
          shootingStars.forEach(star => {
            star.update(canvas);
            star.draw(ctx, glowIntensity * 1.5);
          });
          shootingStarTimer++;
          // Randomly spawn a new shooting star every ~5-10 seconds
          if (shootingStarTimer > targetFPS * (5 + Math.random() * 5)) {
            const idx = shootingStars.findIndex(s => !s.active);
            if (idx !== -1) shootingStars[idx] = new ShootingStarParticle(canvas);
            shootingStarTimer = 0;
          }
        }
        lastTime = currentTime;
      }
      animationFrameId = requestAnimationFrame(animate);
    };
    // Parallax mouse tracking
    if (enableParallax) {
      (window as any).mouseX = window.innerWidth/2;
      (window as any).mouseY = window.innerHeight/2;
      window.addEventListener('mousemove', (e) => {
        (window as any).mouseX = e.clientX;
        (window as any).mouseY = e.clientY;
      });
    }

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
      className="absolute inset-0 w-full h-full pointer-events-none opacity-60 transform-gpu will-change-transform"
    />
  );
};

export default FloatingParticles;
