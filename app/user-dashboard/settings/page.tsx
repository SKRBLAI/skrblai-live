'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updateProfile, updateEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { db, auth } from '@/utils/firebase';
import { getUserData, sendPasswordReset } from '@/utils/auth';

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // Form states
  const [profile, setProfile] = useState({
    displayName: '',
    email: '',
    businessName: '',
    industry: ''
  });
  
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser);
      setProfile(prev => ({
        ...prev,
        displayName: currentUser.displayName || '',
        email: currentUser.email || ''
      }));
      
      const fetchUserData = async () => {
        try {
          const result = await getUserData(currentUser.uid);
          if (result.success && result.data) {
            setUserData(result.data);
            setProfile(prev => ({
              ...prev,
              businessName: result.data.businessName || '',
              industry: result.data.industry || ''
            }));
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchUserData();
    }
  }, []);
  
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      
      // Update Firebase Auth profile
      if (profile.displayName !== currentUser.displayName) {
        await updateProfile(currentUser, {
          displayName: profile.displayName
        });
      }
      
      // Update Firestore user data
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        businessName: profile.businessName,
        industry: profile.industry,
        updatedAt: new Date()
      });
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: `Failed to update profile: ${error.message}` });
    } finally {
      setSaving(false);
    }
  };
  
  const handleResetPassword = async () => {
    try {
      if (!user?.email) return;
      
      await sendPasswordReset(user.email);
      setMessage({ type: 'success', text: 'Password reset email sent. Check your inbox.' });
    } catch (error: any) {
      console.error('Error sending password reset:', error);
      setMessage({ type: 'error', text: `Failed to send password reset: ${error.message}` });
    }
  };
  
  if (loading) {
    return <div className="h-full flex items-center justify-center">
      <div className="w-12 h-12 rounded-full border-4 border-electric-blue border-t-transparent animate-spin"></div>
    </div>;
  }
  
  return (
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold text-white mb-6">Account Settings</h1>
        
        {/* Success/Error message */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${
              message.type === 'success' 
                ? 'bg-green-600/20 border-green-600' 
                : 'bg-red-600/20 border-red-600'
            } border rounded-lg p-4 mb-6`}
          >
            <p className={message.type === 'success' ? 'text-green-500' : 'text-red-500'}>
              {message.text}
            </p>
          </motion.div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left sidebar: profile settings */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Profile Information</h2>
              
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="displayName" className="block text-sm font-medium text-gray-400 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="displayName"
                      name="displayName"
                      value={profile.displayName}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={profile.email}
                      disabled
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-400 focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent opacity-70"
                    />
                    <p className="mt-1 text-xs text-gray-500">Contact support to change your email address.</p>
                  </div>
                  
                  <div>
                    <label htmlFor="businessName" className="block text-sm font-medium text-gray-400 mb-2">
                      Business Name
                    </label>
                    <input
                      type="text"
                      id="businessName"
                      name="businessName"
                      value={profile.businessName}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="industry" className="block text-sm font-medium text-gray-400 mb-2">
                      Industry
                    </label>
                    <input
                      type="text"
                      id="industry"
                      name="industry"
                      value={profile.industry}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className={`px-6 py-2 rounded-lg font-medium ${
                      saving
                        ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                        : 'bg-electric-blue text-white hover:bg-electric-blue/90'
                    } transition-colors`}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
          
          {/* Right sidebar: account security */}
          <div>
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Account Security</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-white mb-2">Password</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Secure your account with a strong password that you don't use elsewhere.
                  </p>
                  <button
                    onClick={handleResetPassword}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Reset Password
                  </button>
                </div>
                
                <div className="pt-4 border-t border-gray-700">
                  <h3 className="text-lg font-medium text-white mb-2">Account Plan</h3>
                  <div className="bg-gray-750 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-white font-medium">
                          {userData?.selectedPlan || 'Free Trial'}
                        </p>
                        <p className="text-sm text-gray-400">
                          Active since {new Date(userData?.createdAt?.toDate()).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="px-2 py-1 text-xs bg-green-600 text-white rounded-full">
                        Active
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
