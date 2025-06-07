// Unified Percy glassmorphic Sign In / Sign Up + Promo/VIP code portal
'use client';
import React, { useState } from 'react';
import PercyAvatar from '@/components/home/PercyAvatar';
import { motion } from 'framer-motion';



export default function PercyOnboardingAuth() {
  // Step: 'auth' | 'code' | 'done'
  const [step, setStep] = useState<'auth' | 'code' | 'done'>('auth');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Code step
  const [promoCode, setPromoCode] = useState('');
  const [vipCode, setVipCode] = useState('');
  const [codeStatus, setCodeStatus] = useState<'none' | 'promo' | 'vip' | 'invalid' | 'used'>('none');
  const [codeMessage, setCodeMessage] = useState('');

  // VIP dashboard visual
  const [isVIP, setIsVIP] = useState(false);

  // Handle auth (real API integration)
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password || (mode === 'signup' && password !== confirm)) {
      setError('Please fill all fields correctly.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/dashboard-signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          mode,
          confirm: mode === 'signup' ? confirm : undefined
        })
      });
      const data = await res.json();
      if (data.success) {
        setStep('code');
      } else {
        setError(data.error || 'Authentication failed.');
      }
    } catch (err: any) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  // Handle code validation (real API integration)
  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCodeStatus('none');
    setCodeMessage('');
    setLoading(true);
    try {
      const code = vipCode || promoCode;
      const res = await fetch('/api/auth/dashboard-signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          mode,
          promoCode: promoCode || undefined,
          vipCode: vipCode || undefined
        })
      });
      const data = await res.json();
      if (data.success) {
        if (data.vipMode) {
          setCodeStatus('vip');
          setCodeMessage('VIP code accepted! Welcome to Percy Premium.');
          setIsVIP(true);
          setTimeout(() => setStep('done'), 1200);
        } else if (data.promoMode) {
          setCodeStatus('promo');
          setCodeMessage('Promo code applied! Enjoy your perks.');
          setTimeout(() => setStep('done'), 1200);
        } else {
          setStep('done');
        }
      } else {
        if (data.error && data.error.toLowerCase().includes('used')) {
          setCodeStatus('used');
          setCodeMessage('This code has already been used.');
        } else if (data.error && data.error.toLowerCase().includes('invalid')) {
          setCodeStatus('invalid');
          setCodeMessage('Invalid code. Please try again.');
        } else {
          setCodeStatus('invalid');
          setCodeMessage(data.error || 'Invalid code.');
        }
      }
    } catch (err: any) {
      setCodeStatus('invalid');
      setCodeMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  // Auth form (sign in/up)
  const renderAuthForm = () => (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 max-w-md w-full px-8 py-10 flex flex-col items-center"
    >
      <PercyAvatar size="lg" className="mb-6" />
      <h2 className="text-3xl font-bold mb-2 text-center bg-gradient-to-r from-electric-blue to-fuchsia-400 text-transparent bg-clip-text">Percy Dashboard Portal</h2>
      <p className="text-center text-white/80 mb-6">Sign in or create your account to access SKRBL AI. Cosmic security, glassmorphic style.</p>
      <div className="flex space-x-2 mb-6">
        <button
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${mode === 'signin' ? 'bg-electric-blue/80 text-white shadow' : 'bg-white/10 text-white/70 hover:bg-electric-blue/20'}`}
          onClick={() => setMode('signin')}
          disabled={mode === 'signin'}
        >Sign In</button>
        <button
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${mode === 'signup' ? 'bg-fuchsia-400/80 text-white shadow' : 'bg-white/10 text-white/70 hover:bg-fuchsia-400/20'}`}
          onClick={() => setMode('signup')}
          disabled={mode === 'signup'}
        >Sign Up</button>
      </div>
      <form className="w-full flex flex-col space-y-4" onSubmit={handleAuth}>
        <input
          type="email"
          placeholder="Email"
          className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-electric-blue/50"
          value={email}
          onChange={e => setEmail(e.target.value)}
          autoFocus
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-electric-blue/50"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        {mode === 'signup' && (
          <input
            type="password"
            placeholder="Confirm Password"
            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/50"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
          />
        )}
        {error && <div className="text-red-400 text-sm">{error}</div>}
        <button
          type="submit"
          className="w-full py-3 rounded-lg bg-gradient-to-r from-electric-blue to-fuchsia-400 text-white font-bold text-lg shadow-glow focus:outline-none focus:ring-2 focus:ring-electric-blue/60 transition-all disabled:opacity-50"
          disabled={loading}
        >{loading ? 'Processing...' : mode === 'signin' ? 'Sign In' : 'Sign Up'}</button>
      </form>
    </motion.div>
  );

  // Promo/VIP code step
  const renderCodeStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 max-w-md w-full px-8 py-10 flex flex-col items-center"
    >
      <PercyAvatar size="md" className="mb-4" />
      <h3 className="text-2xl font-bold mb-2 text-center">Do you have a Promo or VIP Code?</h3>
      <p className="text-center text-white/70 mb-6">Enter a code to unlock perks or premium features. You can skip this step and add a code later from your profile.</p>
      <form className="w-full flex flex-col space-y-4" onSubmit={handleCodeSubmit}>
        <input
          type="text"
          placeholder="Promo Code (optional)"
          className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-sky-400/50"
          value={promoCode}
          onChange={e => { setPromoCode(e.target.value); setVipCode(''); setCodeStatus('none'); setCodeMessage(''); }}
          disabled={!!vipCode}
        />
        <input
          type="text"
          placeholder="VIP Code (optional)"
          className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/50"
          value={vipCode}
          onChange={e => { setVipCode(e.target.value); setPromoCode(''); setCodeStatus('none'); setCodeMessage(''); }}
          disabled={!!promoCode}
        />
        {codeStatus !== 'none' && (
          <div className={`text-center text-sm ${codeStatus === 'vip' ? 'text-fuchsia-400' : codeStatus === 'promo' ? 'text-sky-400' : 'text-red-400'}`}>{codeMessage}</div>
        )}
        <button
          type="submit"
          className="w-full py-3 rounded-lg bg-gradient-to-r from-sky-400 to-fuchsia-400 text-white font-bold text-lg shadow-glow focus:outline-none focus:ring-2 focus:ring-sky-400/60 transition-all disabled:opacity-50"
          disabled={!!codeStatus && codeStatus !== 'none' && codeStatus !== 'invalid' && codeStatus !== 'used'}
        >Unlock</button>
        <button
          type="button"
          className="w-full py-2 rounded-lg bg-white/10 border border-white/20 text-white font-medium text-base hover:bg-sky-400/10 transition-all"
          onClick={() => setStep('done')}
        >Skip</button>
      </form>
    </motion.div>
  );

  // Dashboard (VIP/regular)
  const renderDashboard = () => (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 max-w-md w-full px-8 py-10 flex flex-col items-center ${isVIP ? 'ring-4 ring-fuchsia-400/70' : ''}`}
    >
      <PercyAvatar size="md" className="mb-4" />
      <h2 className={`text-3xl font-bold mb-2 text-center ${isVIP ? 'bg-gradient-to-r from-fuchsia-400 to-yellow-300 text-transparent bg-clip-text' : 'text-white'}`}>{isVIP ? 'Welcome, Percy VIP!' : 'Welcome to your Dashboard'}</h2>
      {isVIP && <span className="px-4 py-1 rounded-full bg-fuchsia-400/20 text-fuchsia-400 font-semibold mb-3">VIP ACCESS</span>}
      <p className="text-center text-white/80 mb-6">You are now signed in. This is a demo dashboard. VIPs see cosmic upgrades and exclusive features here!</p>
      <button className="w-full py-3 rounded-lg bg-gradient-to-r from-fuchsia-400 to-yellow-300 text-white font-bold text-lg shadow-glow focus:outline-none focus:ring-2 focus:ring-fuchsia-400/60 transition-all">Go to App</button>
    </motion.div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0D1117] via-[#161B22] to-[#1f2937] py-12 px-4">
      {step === 'auth' && renderAuthForm()}
      {step === 'code' && renderCodeStep()}
      {step === 'done' && renderDashboard()}
    </div>
  );
}
