import PercyAvatar from '@/components/home/PercyAvatar';
import AnimatedBackground from '@/components/ui/FloatingParticles';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative bg-deep-navy">
      <AnimatedBackground />
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="glass-card p-8 rounded-2xl flex flex-col items-center shadow-xl">
        <PercyAvatar size="lg" className="mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-white mt-4">Page Not Found</h1>
        <p className="text-lg text-teal-200 mt-2">Sorry, the page you’re looking for doesn’t exist.</p>
      </motion.div>
    </div>
  );
}
