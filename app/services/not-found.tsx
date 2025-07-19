'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import GlassmorphicCard from '@/components/shared/GlassmorphicCard';
import CosmicButton from '@/components/shared/CosmicButton';

export default function ServicesNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <GlassmorphicCard className="p-8 max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-electric-blue to-teal-400 bg-clip-text text-transparent">
            Service Not Found
          </h1>
          <p className="text-gray-300 mb-6">
            The service you're looking for doesn't exist or has been moved.
          </p>
          <Link href="/services">
            <CosmicButton>
              Back to Services
            </CosmicButton>
          </Link>
        </motion.div>
      </GlassmorphicCard>
    </div>
  );
} 