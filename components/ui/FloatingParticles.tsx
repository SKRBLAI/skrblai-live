"use client";
import React, { useEffect, useRef } from 'react';

interface ParticleProps {
  fullScreen?: boolean;
  particleCount?: number;
}

const FloatingParticles = ({ fullScreen = true, particleCount = 50 }: ParticleProps = {}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

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

    // Particle class
    class Particle {
      private glowIntensity: number = 0;
      private glowDirection: number = 1;
      x: number = 0;
      y: number = 0;
      size: number = 1;
      speedX: number = 0;
      speedY: number = 0;
      opacity: number = 0.2;

      constructor() {
        if (!canvas) return;
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * 2 - 1;
        this.opacity = Math.random() * 0.5 + 0.2;
      }

      update() {
        if (!canvas) return;
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas.width) this.x = 0;
        else if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        else if (this.y < 0) this.y = canvas.height;
      }

      draw() {
        if (!ctx) return;
        
        // Update glow effect
        this.glowIntensity += 0.02 * this.glowDirection;
        if (this.glowIntensity > 1) {
          this.glowDirection = -1;
        } else if (this.glowIntensity < 0) {
          this.glowDirection = 1;
        }
        
        // Draw particle with glow
        ctx.shadowBlur = 15;
        ctx.shadowColor = `rgba(20, 255, 233, ${this.glowIntensity * 0.5})`;
        ctx.fillStyle = `rgba(20, 255, 233, ${this.opacity * (0.7 + this.glowIntensity * 0.3)})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    // Create particles
    const particles: Particle[] = Array(particleCount).fill(null).map(() => new Particle());

    // Animation loop
    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      requestAnimationFrame(animate);
    };
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [fullScreen, particleCount]);

  return (
    <canvas 
      ref={canvasRef} 
      className={`particles-canvas ${fullScreen ? 'particles-canvas-fullscreen' : ''}`}
    />
  );
};

export default FloatingParticles;
