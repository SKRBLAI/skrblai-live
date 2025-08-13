export interface GuestSession {
  sessionId: string;
  firstVisit: Date;
  lastVisit: Date;
  scansUsed: number;
  quickWinsUsed: number;
  returnVisits: number;
  emailCaptured: boolean;
  upgradeOffered: boolean;
  userAgent: string;
  ip?: string;
}

export interface ScanResult {
  scanId: string;
  timestamp: Date;
  videoUrl: string;
  feedback: string;
  quickWins: QuickWin[];
  ageGroup: 'youth' | 'teen' | 'adult' | 'senior';
  sport: string;
}

export interface QuickWin {
  id: string;
  title: string;
  description: string;
  downloadUrl: string;
  category: 'technique' | 'training' | 'nutrition' | 'mental';
}

const STORAGE_KEY = 'skillsmith_guest_session';
const FREE_SCANS_LIMIT = 2;
const FREE_QUICKWINS_LIMIT = 2;
const TRIAL_DURATION_DAYS = 7;

export class SkillSmithGuestTracker {
  private session: GuestSession;

  constructor() {
    this.session = this.loadOrCreateSession();
  }

  private generateSessionId(): string {
    return `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private loadOrCreateSession(): GuestSession {
    if (typeof window === 'undefined') {
      return this.createNewSession();
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const session: GuestSession = {
          ...parsed,
          firstVisit: new Date(parsed.firstVisit),
          lastVisit: new Date(parsed.lastVisit)
        };

        // Check if trial period expired
        const daysSinceFirst = (Date.now() - session.firstVisit.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceFirst > TRIAL_DURATION_DAYS) {
          return this.createNewSession();
        }

        // Update return visits and last visit
        session.returnVisits += 1;
        session.lastVisit = new Date();
        this.saveSession(session);
        
        return session;
      } catch (error) {
        console.error('Error parsing guest session:', error);
        return this.createNewSession();
      }
    }

    return this.createNewSession();
  }

  private createNewSession(): GuestSession {
    const session: GuestSession = {
      sessionId: this.generateSessionId(),
      firstVisit: new Date(),
      lastVisit: new Date(),
      scansUsed: 0,
      quickWinsUsed: 0,
      returnVisits: 0,
      emailCaptured: false,
      upgradeOffered: false,
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : ''
    };

    this.saveSession(session);
    return session;
  }

  private saveSession(session: GuestSession): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch (error) {
      console.error('Error saving guest session:', error);
    }
  }

  // Public API
  getSession(): GuestSession {
    return { ...this.session };
  }

  getScansRemaining(): number {
    return Math.max(0, FREE_SCANS_LIMIT - this.session.scansUsed);
  }

  getQuickWinsRemaining(): number {
    return Math.max(0, FREE_QUICKWINS_LIMIT - this.session.quickWinsUsed);
  }

  canUseScan(): boolean {
    return this.getScansRemaining() > 0;
  }

  canUseQuickWins(): boolean {
    return this.getQuickWinsRemaining() > 0;
  }

  useScan(): boolean {
    if (!this.canUseScan()) return false;
    
    this.session.scansUsed += 1;
    this.session.lastVisit = new Date();
    this.saveSession(this.session);
    
    return true;
  }

  useQuickWin(): boolean {
    if (!this.canUseQuickWins()) return false;
    
    this.session.quickWinsUsed += 1;
    this.session.lastVisit = new Date();
    this.saveSession(this.session);
    
    return true;
  }

  markEmailCaptured(): void {
    this.session.emailCaptured = true;
    this.saveSession(this.session);
  }

  markUpgradeOffered(): void {
    this.session.upgradeOffered = true;
    this.saveSession(this.session);
  }

  shouldShowUpgradeOffer(): boolean {
    return this.session.scansUsed >= FREE_SCANS_LIMIT && !this.session.upgradeOffered;
  }

  isTrialExpired(): boolean {
    const daysSinceFirst = (Date.now() - this.session.firstVisit.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceFirst > TRIAL_DURATION_DAYS;
  }

  getDaysRemaining(): number {
    const daysSinceFirst = (Date.now() - this.session.firstVisit.getTime()) / (1000 * 60 * 60 * 24);
    return Math.max(0, TRIAL_DURATION_DAYS - daysSinceFirst);
  }

  // Analytics and tracking
  getUsageStats() {
    return {
      scansUsed: this.session.scansUsed,
      scansRemaining: this.getScansRemaining(),
      quickWinsUsed: this.session.quickWinsUsed,
      quickWinsRemaining: this.getQuickWinsRemaining(),
      returnVisits: this.session.returnVisits,
      daysActive: Math.ceil((this.session.lastVisit.getTime() - this.session.firstVisit.getTime()) / (1000 * 60 * 60 * 24)),
      daysRemaining: this.getDaysRemaining(),
      emailCaptured: this.session.emailCaptured
    };
  }

  // Clear session (for testing or reset)
  clearSession(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
    this.session = this.createNewSession();
  }
}

// Singleton instance
let guestTracker: SkillSmithGuestTracker | null = null;

export function getGuestTracker(): SkillSmithGuestTracker {
  if (!guestTracker) {
    guestTracker = new SkillSmithGuestTracker();
  }
  return guestTracker;
}

// Hook for React components
export function useSkillSmithGuest() {
  const tracker = getGuestTracker();
  
  return {
    session: tracker.getSession(),
    scansRemaining: tracker.getScansRemaining(),
    quickWinsRemaining: tracker.getQuickWinsRemaining(),
    canUseScan: tracker.canUseScan(),
    canUseQuickWins: tracker.canUseQuickWins(),
    useScan: () => tracker.useScan(),
    useQuickWin: () => tracker.useQuickWin(),
    markEmailCaptured: () => tracker.markEmailCaptured(),
    markUpgradeOffered: () => tracker.markUpgradeOffered(),
    shouldShowUpgradeOffer: tracker.shouldShowUpgradeOffer(),
    isTrialExpired: tracker.isTrialExpired(),
    usageStats: tracker.getUsageStats(),
    clearSession: () => tracker.clearSession()
  };
} 