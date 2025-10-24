'use client';

import { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { ActivityFeed } from '../activity/ActivityFeed';

interface DashboardWithActivityFeedProps {
  children: ReactNode;
  userId?: string;
  showActivityFeed?: boolean;
}

export function DashboardWithActivityFeed({ 
  children, 
  userId,
  showActivityFeed = true 
}: DashboardWithActivityFeedProps) {
  const [isFeedOpen, setIsFeedOpen] = useState(true);
  const [isMobileView, setIsMobileView] = useState(false);

  // Check if mobile on mount
  if (typeof window !== 'undefined') {
    const checkMobile = () => window.innerWidth < 1024;
    if (isMobileView !== checkMobile()) {
      setIsMobileView(checkMobile());
    }
  }

  if (!showActivityFeed) {
    return <>{children}</>;
  }

  return (
    <div className="flex gap-4 h-full">
      {/* Main Content */}
      <div className={`flex-1 min-w-0 transition-all duration-300 ${isFeedOpen ? 'lg:mr-0' : ''}`}>
        {children}
      </div>

      {/* Desktop: Right Sidebar */}
      {!isMobileView && (
        <AnimatePresence>
          {isFeedOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 384, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="hidden lg:block flex-shrink-0 overflow-hidden"
            >
              <div className="sticky top-24 h-[calc(100vh-7rem)]">
                <div className="
                  h-full
                  bg-[rgba(21,23,30,0.60)]
                  border border-teal-400/30
                  rounded-xl
                  shadow-[0_0_24px_rgba(45,212,191,0.2)]
                  backdrop-blur-xl
                  p-4
                  overflow-hidden
                  flex flex-col
                ">
                  {/* Toggle Button */}
                  <button
                    onClick={() => setIsFeedOpen(false)}
                    className="
                      absolute -left-10 top-4
                      p-2 rounded-l-lg
                      bg-[rgba(21,23,30,0.90)]
                      border border-r-0 border-teal-400/30
                      text-gray-400 hover:text-teal-400
                      transition-all
                      hover:bg-teal-500/10
                    "
                    aria-label="Close activity feed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <ActivityFeed userId={userId} maxEvents={50} />
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      )}

      {/* Desktop: Collapsed State Button */}
      {!isMobileView && !isFeedOpen && (
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => setIsFeedOpen(true)}
          className="
            fixed right-4 top-24
            p-3 rounded-lg
            bg-[rgba(21,23,30,0.90)]
            border border-teal-400/40
            shadow-[0_0_16px_rgba(45,212,191,0.3)]
            backdrop-blur-xl
            text-teal-400
            hover:bg-teal-500/10
            hover:border-teal-400/60
            transition-all
            z-40
            group
          "
          aria-label="Open activity feed"
        >
          <Activity className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="
            absolute right-full mr-2 top-1/2 -translate-y-1/2
            px-3 py-1 rounded-lg
            bg-[rgba(21,23,30,0.95)]
            border border-teal-400/40
            text-xs text-white whitespace-nowrap
            opacity-0 group-hover:opacity-100
            transition-opacity
            pointer-events-none
          ">
            Open Activity Feed
          </span>
        </motion.button>
      )}

      {/* Mobile: Bottom Sheet */}
      {isMobileView && (
        <>
          {/* Floating Action Button */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => setIsFeedOpen(true)}
            className="
              fixed bottom-6 right-6
              w-14 h-14 rounded-full
              bg-gradient-to-br from-teal-500 to-cyan-500
              shadow-[0_0_24px_rgba(45,212,191,0.5)]
              text-white
              flex items-center justify-center
              z-50
              hover:scale-110
              active:scale-95
              transition-all
            "
            aria-label="Open activity feed"
          >
            <Activity className="w-6 h-6" />
          </motion.button>

          {/* Bottom Sheet Modal */}
          <AnimatePresence>
            {isFeedOpen && (
              <>
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsFeedOpen(false)}
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                />

                {/* Sheet */}
                <motion.div
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                  className="
                    fixed bottom-0 left-0 right-0
                    max-h-[80vh]
                    bg-[rgba(21,23,30,0.95)]
                    border-t border-teal-400/40
                    rounded-t-2xl
                    shadow-[0_-4px_32px_rgba(45,212,191,0.3)]
                    backdrop-blur-xl
                    z-50
                    overflow-hidden
                  "
                >
                  {/* Handle */}
                  <div className="flex items-center justify-center py-3 border-b border-teal-400/20">
                    <div className="w-12 h-1 rounded-full bg-gray-600" />
                  </div>

                  {/* Content */}
                  <div className="p-4 h-[calc(80vh-3rem)] overflow-y-auto">
                    <ActivityFeed userId={userId} maxEvents={30} />
                  </div>

                  {/* Close Button */}
                  <button
                    onClick={() => setIsFeedOpen(false)}
                    className="
                      absolute top-4 right-4
                      p-2 rounded-lg
                      text-gray-400 hover:text-white
                      hover:bg-white/5
                      transition-all
                    "
                    aria-label="Close activity feed"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
