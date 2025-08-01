import { HandoffAnimation } from '../config/services';

export interface HandoffState {
  active: boolean;
  fromElement?: HTMLElement;
  toElement?: HTMLElement;
  progress: number;
  animationType: 'arrow' | 'fade' | 'progress' | 'glow';
  duration: number;
}

class AgentHandoffAnimationSystem {
  private activeHandoffs: Map<string, HandoffState> = new Map();
  private animationCallbacks: Map<string, (state: HandoffState) => void> = new Map();

  /**
   * Start an agent handoff animation between two service cards
   */
  async startHandoff(animation: HandoffAnimation): Promise<void> {
    const handoffId = `${animation.fromServiceId}-${animation.toServiceId}`;
    
    console.log('[Handoff] Starting animation:', handoffId);

    // Find the DOM elements
    const fromElement = document.querySelector(`[data-service-id="${animation.fromServiceId}"]`) as HTMLElement;
    const toElement = document.querySelector(`[data-service-id="${animation.toServiceId}"]`) as HTMLElement;

    if (!fromElement || !toElement) {
      console.warn('[Handoff] Could not find service elements:', { fromElement, toElement });
      return;
    }

    // Initialize handoff state
    const handoffState: HandoffState = {
      active: true,
      fromElement,
      toElement,
      progress: 0,
      animationType: animation.animationType,
      duration: animation.duration
    };

    this.activeHandoffs.set(handoffId, handoffState);

    // Execute the animation based on type
    switch (animation.animationType) {
      case 'arrow':
        await this.animateArrow(handoffState);
        break;
      case 'fade':
        await this.animateFade(handoffState);
        break;
      case 'progress':
        await this.animateProgress(handoffState);
        break;
      case 'glow':
        await this.animateGlow(handoffState);
        break;
    }

    // Clean up
    this.activeHandoffs.delete(handoffId);
    this.notifyCallbacks(handoffId, { ...handoffState, active: false, progress: 100 });
  }

  private async animateArrow(state: HandoffState): Promise<void> {
    const { fromElement, toElement, duration } = state;
    if (!fromElement || !toElement) return;

    // Create arrow element
    const arrow = this.createArrowElement();
    document.body.appendChild(arrow);

    // Calculate positions
    const fromRect = fromElement.getBoundingClientRect();
    const toRect = toElement.getBoundingClientRect();
    
    const startX = fromRect.right;
    const startY = fromRect.top + fromRect.height / 2;
    const endX = toRect.left;
    const endY = toRect.top + toRect.height / 2;

    // Position arrow at start
    arrow.style.left = `${startX}px`;
    arrow.style.top = `${startY}px`;

    // Calculate angle
    const angle = Math.atan2(endY - startY, endX - startX) * 180 / Math.PI;
    arrow.style.transform = `rotate(${angle}deg)`;

    // Animate to target
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const currentX = startX + (endX - startX) * this.easeInOutCubic(progress);
      const currentY = startY + (endY - startY) * this.easeInOutCubic(progress);
      
      arrow.style.left = `${currentX}px`;
      arrow.style.top = `${currentY}px`;
      arrow.style.opacity = progress < 0.9 ? '1' : (1 - (progress - 0.9) / 0.1).toString();
      
      state.progress = progress * 100;
      this.notifyCallbacks(`${state.fromElement?.dataset.serviceId}-${state.toElement?.dataset.serviceId}`, state);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        arrow.remove();
      }
    };

    requestAnimationFrame(animate);
  }

  private async animateFade(state: HandoffState): Promise<void> {
    const { fromElement, toElement, duration } = state;
    if (!fromElement || !toElement) return;

    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Fade out from element
      const fromOpacity = 1 - (progress * 0.3); // Don't fade completely
      fromElement.style.opacity = fromOpacity.toString();
      
      // Fade in to element with glow
      const toOpacity = 0.7 + (progress * 0.3);
      toElement.style.opacity = toOpacity.toString();
      toElement.style.boxShadow = `0 0 ${20 * progress}px rgba(48, 213, 200, ${progress * 0.8})`;
      
      state.progress = progress * 100;
      this.notifyCallbacks(`${state.fromElement?.dataset.serviceId}-${state.toElement?.dataset.serviceId}`, state);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Reset styles
        setTimeout(() => {
          fromElement.style.opacity = '1';
          toElement.style.opacity = '1';
          toElement.style.boxShadow = '';
        }, 500);
      }
    };

    requestAnimationFrame(animate);
  }

  private async animateProgress(state: HandoffState): Promise<void> {
    const { fromElement, toElement, duration } = state;
    if (!fromElement || !toElement) return;

    // Create progress line
    const progressLine = this.createProgressLine(fromElement, toElement);
    document.body.appendChild(progressLine);

    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Update progress line
      const progressBar = progressLine.querySelector('.progress-fill') as HTMLElement;
      if (progressBar) {
        progressBar.style.width = `${progress * 100}%`;
      }
      
      state.progress = progress * 100;
      this.notifyCallbacks(`${state.fromElement?.dataset.serviceId}-${state.toElement?.dataset.serviceId}`, state);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setTimeout(() => progressLine.remove(), 500);
      }
    };

    requestAnimationFrame(animate);
  }

  private async animateGlow(state: HandoffState): Promise<void> {
    const { fromElement, toElement, duration } = state;
    if (!fromElement || !toElement) return;

    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Pulsing glow effect
      const intensity = Math.sin(progress * Math.PI * 4) * 0.5 + 0.5;
      const glowSize = 20 + (intensity * 30);
      const glowOpacity = 0.3 + (intensity * 0.5);
      
      fromElement.style.boxShadow = `0 0 ${glowSize}px rgba(255, 165, 0, ${glowOpacity})`;
      toElement.style.boxShadow = `0 0 ${glowSize}px rgba(48, 213, 200, ${glowOpacity})`;
      
      state.progress = progress * 100;
      this.notifyCallbacks(`${state.fromElement?.dataset.serviceId}-${state.toElement?.dataset.serviceId}`, state);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Reset styles
        fromElement.style.boxShadow = '';
        toElement.style.boxShadow = '';
      }
    };

    requestAnimationFrame(animate);
  }

  private createArrowElement(): HTMLElement {
    const arrow = document.createElement('div');
    arrow.className = 'agent-handoff-arrow';
    arrow.innerHTML = `
      <div style="
        width: 40px;
        height: 4px;
        background: linear-gradient(90deg, #30d5c8, #6366f1);
        position: relative;
        border-radius: 2px;
        box-shadow: 0 0 10px rgba(48, 213, 200, 0.6);
      ">
        <div style="
          position: absolute;
          right: -8px;
          top: -6px;
          width: 0;
          height: 0;
          border-left: 8px solid #6366f1;
          border-top: 8px solid transparent;
          border-bottom: 8px solid transparent;
          filter: drop-shadow(0 0 5px rgba(99, 102, 241, 0.8));
        "></div>
      </div>
    `;
    arrow.style.position = 'fixed';
    arrow.style.zIndex = '10000';
    arrow.style.pointerEvents = 'none';
    arrow.style.transition = 'opacity 0.3s ease';
    
    return arrow;
  }

  private createProgressLine(fromElement: HTMLElement, toElement: HTMLElement): HTMLElement {
    const fromRect = fromElement.getBoundingClientRect();
    const toRect = toElement.getBoundingClientRect();
    
    const line = document.createElement('div');
    line.className = 'agent-handoff-progress';
    
    const startX = fromRect.right;
    const startY = fromRect.top + fromRect.height / 2;
    const endX = toRect.left;
    const endY = toRect.top + toRect.height / 2;
    
    const length = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
    const angle = Math.atan2(endY - startY, endX - startX) * 180 / Math.PI;
    
    line.innerHTML = `
      <div style="
        width: ${length}px;
        height: 3px;
        background: rgba(48, 213, 200, 0.3);
        border-radius: 2px;
        overflow: hidden;
        position: relative;
      ">
        <div class="progress-fill" style="
          width: 0%;
          height: 100%;
          background: linear-gradient(90deg, #30d5c8, #6366f1);
          transition: width 0.1s ease;
          box-shadow: 0 0 8px rgba(48, 213, 200, 0.8);
        "></div>
      </div>
    `;
    
    line.style.position = 'fixed';
    line.style.left = `${startX}px`;
    line.style.top = `${startY}px`;
    line.style.transform = `rotate(${angle}deg)`;
    line.style.transformOrigin = '0 50%';
    line.style.zIndex = '9999';
    line.style.pointerEvents = 'none';
    
    return line;
  }

  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
  }

  private notifyCallbacks(handoffId: string, state: HandoffState): void {
    const callback = this.animationCallbacks.get(handoffId);
    if (callback) {
      callback(state);
    }
  }

  /**
   * Register a callback for handoff animation updates
   */
  onHandoffUpdate(handoffId: string, callback: (state: HandoffState) => void): void {
    this.animationCallbacks.set(handoffId, callback);
  }

  /**
   * Stop an active handoff animation
   */
  stopHandoff(handoffId: string): void {
    const state = this.activeHandoffs.get(handoffId);
    if (state) {
      state.active = false;
      this.activeHandoffs.delete(handoffId);
    }
  }

  /**
   * Get the current state of a handoff animation
   */
  getHandoffState(handoffId: string): HandoffState | undefined {
    return this.activeHandoffs.get(handoffId);
  }

  /**
   * Stop all active animations
   */
  stopAllHandoffs(): void {
    this.activeHandoffs.clear();
    this.animationCallbacks.clear();
    
    // Clean up any remaining DOM elements
    document.querySelectorAll('.agent-handoff-arrow, .agent-handoff-progress').forEach(el => el.remove());
  }
}

// Export singleton instance
export const agentHandoffAnimations = new AgentHandoffAnimationSystem();

// Convenience functions
export function animateAgentHandoff(animation: HandoffAnimation): Promise<void> {
  return agentHandoffAnimations.startHandoff(animation);
}

export function stopAgentHandoff(fromServiceId: string, toServiceId: string): void {
  agentHandoffAnimations.stopHandoff(`${fromServiceId}-${toServiceId}`);
}