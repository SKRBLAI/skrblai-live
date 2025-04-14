'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { logoutUser } from '@/utils/auth';

export default function LogoutPage() {
  const router = useRouter();
  
  useEffect(() => {
    const performLogout = async () => {
      try {
        await logoutUser();
        router.push('/login');
      } catch (error) {
        console.error('Logout error:', error);
        router.push('/login');
      }
    };
    
    performLogout();
  }, [router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-xl shadow-lg max-w-md w-full text-center">
        <div className="w-12 h-12 rounded-full border-4 border-electric-blue border-t-transparent animate-spin mx-auto mb-6"></div>
        <h1 className="text-2xl font-bold text-white mb-2">Signing Out</h1>
        <p className="text-gray-400">Please wait while we log you out...</p>
      </div>
    </div>
  );
}
