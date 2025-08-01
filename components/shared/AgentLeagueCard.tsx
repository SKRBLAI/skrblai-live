import React from 'react';
import { motion, MotionProps } from 'framer-motion';

export interface AgentLeagueCardProps extends MotionProps, Omit<React.HTMLAttributes<HTMLDivElement>, keyof MotionProps> {
  style?: React.CSSProperties;
  children: React.ReactNode;
  onMouseEnter?: React.MouseEventHandler<HTMLDivElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLDivElement>;
}

export default function AgentLeagueCard({ style, children, ...motionProps }: AgentLeagueCardProps) {
  return (
    <motion.div
      {...motionProps}
      style={{ position: 'absolute', ...style }}
      className="w-full mx-auto flex flex-col items-center justify-center relative rounded-xl overflow-hidden bg-black/20 backdrop-blur-lg border border-blue-500/30"
    >
      {children}
    </motion.div>
  );
}