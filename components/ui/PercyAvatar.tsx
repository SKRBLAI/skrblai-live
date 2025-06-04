import { motion } from 'framer-motion';
import Image from 'next/image';

export default function PercyAvatar({ className = '', isThinking = false }) {
  return (
    <motion.div
      className={`relative w-24 h-24 mx-auto mb-6 select-none ${className}`}
      animate={{
        scale: [1, 1.04, 1],
        filter: isThinking
          ? 'brightness(1.15) drop-shadow(0 0 24px #30D5C8)' : 'none',
      }}
      transition={{ duration: 2.2, repeat: Infinity }}
    >
      {/* Subtle breathing */}
      <motion.div
        className="absolute inset-0 rounded-full z-10"
        animate={{
          scale: [1, 1.07, 1],
          boxShadow: [
            '0 0 0px #30D5C8',
            '0 0 32px 6px #30D5C8AA',
            '0 0 0px #30D5C8'
          ]
        }}
        transition={{ duration: 3.2, repeat: Infinity }}
      />
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
        animate={{ y: [0, 2, -2, 0] }}
        transition={{ duration: 2.2, repeat: Infinity }}
      >
        <Image
          src="/images/agents-percy-nobg-skrblai.png"
          alt="Percy AI Assistant"
          width={96}
          height={96}
          className="object-contain"
          priority
        />
        {/* Eye animation overlay */}
        <motion.div
          className="absolute left-1/2 top-1/2 w-6 h-3 bg-black/80 rounded-b-full opacity-80"
          style={{ transform: 'translate(-50%, -50%)' }}
          animate={{ y: [0, 0.5, -0.5, 0], scaleX: [1, 1.08, 0.96, 1] }}
          transition={{ duration: 2.1, repeat: Infinity }}
        />
      </motion.div>
    </motion.div>
  );
}
