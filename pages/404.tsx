// pages/404.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Custom404() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to App Router's not-found page after a short delay
    const timer = setTimeout(() => {
      router.replace('/not-found');
    }, 100);
    
    return () => clearTimeout(timer);
  }, [router]);
  
  // Show this while redirecting
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center bg-deep-navy text-white">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-soft-gray mb-6">Redirecting to new page...</p>
      <Link href="/">
        <motion.button
          whileHover={{ scale: 1.05 }}
          className="bg-electric-blue text-white px-6 py-3 rounded-xl"
        >
          Back to Home
        </motion.button>
      </Link>
    </div>
  );
}
