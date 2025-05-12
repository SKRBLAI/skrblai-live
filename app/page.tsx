import { motion } from 'framer-motion';
import PercyProvider from 'components/assistant/PercyProvider';
import PageLayout from '@/components/layout/PageLayout';
import PercyHeroSection from "@/components/home/PercyHeroSection";
import FloatingParticles from "@/components/ui/FloatingParticles";


export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default function HomePage() {
  return (
    <PercyProvider>
      <PageLayout>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="relative min-h-screen w-full bg-gradient-to-b from-[#0d1117] to-[#161b22] overflow-x-hidden">
            {/* Animated floating particles background */}
            <FloatingParticles />
            {/* Hero section with animated Percy, CTA, and floating particles */}
            <PercyHeroSection />
            {/* Animated testimonials section */}
          </div>
        </motion.div>
      </PageLayout>
    </PercyProvider>
  );
}
