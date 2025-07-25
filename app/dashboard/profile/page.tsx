'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../components/context/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { 
  User, 
  Mail, 
  Lock, 
  Shield, 
  CreditCard, 
  Link as LinkIcon, 
  Trash2, 
  Upload, 
  Save,
  Eye,
  EyeOff,
  AlertTriangle,
  Crown,
  Star,
  Settings,
  Bell,
  Globe,
  ArrowLeft
} from 'lucide-react';

interface UserProfile {
  name?: string;
  email: string;
  avatar_url?: string;
  marketing_consent?: boolean;
  created_at?: string;
}

interface ConnectedAccount {
  provider: string;
  email: string;
  connected_at: string;
  status: 'active' | 'expired';
}

export default function ProfileSettingsPage() {
  const { user, session, isLoading, accessLevel, vipStatus, benefits, signOut } = useAuth();
  const router = useRouter();
  
  // Component state
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form states
  const [editingName, setEditingName] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [showDangerZone, setShowDangerZone] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  
  // Modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  // Load user profile data
  const loadProfileData = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoadingProfile(true);
      
      // Fetch user profile from your API or Supabase
      const response = await fetch('/api/auth/dashboard-signin?checkAccess=true', {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        const profileData: UserProfile = {
          name: user.user_metadata?.full_name || user.user_metadata?.name,
          email: user.email || '',
          avatar_url: user.user_metadata?.avatar_url,
          marketing_consent: data.metadata?.marketing_consent,
          created_at: user.created_at
        };
        
        setProfile(profileData);
        setDisplayName(profileData.name || '');
        setMarketingConsent(profileData.marketing_consent || false);
      }
      
      // Mock connected accounts for now
      setConnectedAccounts([
        {
          provider: 'Google',
          email: user.email || '',
          connected_at: user.created_at || '',
          status: 'active'
        }
      ]);
      
    } catch (error) {
      console.error('[Profile] Error loading profile:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoadingProfile(false);
    }
  }, [user, session]);

  useEffect(() => {
    if (user && session) {
      loadProfileData();
    }
  }, [user, session, loadProfileData]);

  // Handle avatar upload
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // For now, show "coming soon" toast
    toast('Avatar upload coming soon! 📸', {
      icon: '🚧',
      duration: 3000
    });
  };

  // Handle name update
  const handleNameUpdate = async () => {
    if (!user || !displayName.trim()) return;
    
    setSaving(true);
    try {
      // Update user metadata
      const response = await fetch('/api/user/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          name: displayName.trim()
        })
      });

      const data = await response.json();

      if (data.success) {
        setProfile(prev => prev ? { ...prev, name: displayName.trim() } : null);
        setEditingName(false);
        toast.success('Name updated successfully!');
      } else {
        toast.error('Failed to update name');
      }
    } catch (error) {
      console.error('[Profile] Error updating name:', error);
      toast.error('Failed to update name');
    } finally {
      setSaving(false);
    }
  };

  // Handle marketing consent update
  const handleMarketingConsentUpdate = async (consent: boolean) => {
    if (!user) return;
    
    setSaving(true);
    try {
      const response = await fetch('/api/marketing-consent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          consent,
          source: 'profile_settings'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setMarketingConsent(consent);
        toast.success(`Marketing preferences ${consent ? 'enabled' : 'disabled'}`);
      } else {
        toast.error('Failed to update marketing preferences');
      }
    } catch (error) {
      console.error('[Profile] Error updating marketing consent:', error);
      toast.error('Failed to update marketing preferences');
    } finally {
      setSaving(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setSaving(true);
    try {
      // For now, show "coming soon" message
      toast('Password change coming soon! 🔒', {
        icon: '🚧',
        duration: 3000
      });
      
      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordSection(false);
    } catch (error) {
      console.error('[Profile] Error changing password:', error);
      toast.error('Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      toast.error('Please type "DELETE" to confirm account deletion');
      return;
    }

    // For now, show confirmation that this is coming soon
    toast.error('Account deletion is currently disabled for safety. Contact support for assistance.', {
      duration: 5000
    });
    setShowDeleteModal(false);
    setDeleteConfirmation('');
  };

  // Get subscription display info
  const getSubscriptionInfo = () => {
    const levelMap = {
      'free': { name: 'Free', color: 'text-gray-400', icon: '🆓' },
      'promo': { name: 'Promo', color: 'text-blue-400', icon: '🎁' },
      'vip': { name: 'VIP', color: 'text-gold', icon: '👑' }
    };
    
    return levelMap[accessLevel || 'free'] || levelMap.free;
  };

  if (isLoading || loadingProfile) {
    return (
      <div className="min-h-screen bg-deep-navy flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-electric-blue mx-auto mb-4"></div>
          <p className="text-white">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    router.push('/sign-in');
    return null;
  }

  const subscriptionInfo = getSubscriptionInfo();

  return (
    <div className="min-h-screen bg-deep-navy">
      {/* Cosmic Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-cyan-900/20 pointer-events-none" />
      
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 group"
          whileHover={{ x: -5 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft className="w-5 h-5 group-hover:text-electric-blue transition-colors" />
          <span className="font-medium">Back to Dashboard</span>
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-8 h-8 text-electric-blue" />
            <h1 className="text-4xl font-bold text-white skrblai-heading">
              Profile Settings
            </h1>
          </div>
          <p className="text-gray-400">Manage your account settings and preferences</p>
        </motion.div>

        {/* Main Content Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="cosmic-glass rounded-2xl p-8 shadow-glow"
        >
          {/* Profile Info Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-6 h-6 text-electric-blue" />
              <h2 className="text-2xl font-semibold text-white">Profile Information</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Avatar Section */}
              <div className="text-center">
                <div className="relative inline-block mb-4">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-electric-blue to-teal-400 flex items-center justify-center text-4xl font-bold text-white shadow-glow">
                    {profile.avatar_url ? (
                      <img 
                        src={profile.avatar_url} 
                        alt="Profile" 
                        className="agent-image w-full h-full rounded-full object-contain"
                style={{ transform: 'scale(0.85)' }}
                      />
                    ) : (
                      (profile.name?.charAt(0) || profile.email.charAt(0)).toUpperCase()
                    )}
                  </div>
                  <button
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                    className="absolute bottom-0 right-0 bg-electric-blue hover:bg-electric-blue/80 text-white p-2 rounded-full shadow-cosmic transition-all duration-300 hover:scale-110 hover:shadow-cosmic-lg"
                    title="Upload new avatar"
                    aria-label="Upload new avatar"
                  >
                    <Upload className="w-4 h-4" />
                  </button>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    aria-label="Avatar upload input"
                  />
                </div>
                <p className="text-gray-400 text-sm">Click to upload new avatar</p>
              </div>

              {/* Name and Email */}
              <div className="space-y-6">
                {/* Display Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Display Name
                  </label>
                  {editingName ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-electric-blue focus:outline-none"
                        placeholder="Enter your name"
                      />
                      <button
                        onClick={handleNameUpdate}
                        disabled={saving}
                        className="px-4 py-2 bg-electric-blue hover:bg-electric-blue/80 text-white rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingName(false);
                          setDisplayName(profile.name || '');
                        }}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <span className="text-white">
                        {profile.name || 'No name set'}
                      </span>
                      <button
                        onClick={() => setEditingName(true)}
                        className="text-electric-blue hover:text-electric-blue/80 text-sm hover:scale-105 transition-transform"
                        title="Edit display name"
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="flex items-center p-3 bg-white/5 rounded-lg">
                    <Mail className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-white">{profile.email}</span>
                    <span className="ml-auto text-xs text-gray-500">Read-only</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Password Section */}
          <div className="mb-8 border-t border-white/10 pt-8">
            <button
              onClick={() => setShowPasswordSection(!showPasswordSection)}
              className="flex items-center gap-3 mb-4 w-full text-left"
            >
              <Lock className="w-6 h-6 text-electric-blue" />
              <h2 className="text-2xl font-semibold text-white">Change Password</h2>
              <motion.div
                animate={{ rotate: showPasswordSection ? 180 : 0 }}
                className="ml-auto"
              >
                ▼
              </motion.div>
            </button>
            
            <AnimatePresence>
              {showPasswordSection && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-electric-blue focus:outline-none pr-10 focus:shadow-cosmic-sm transition-shadow"
                          placeholder="Enter current password"
                          aria-label="Current password"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-electric-blue focus:outline-none pr-10 focus:shadow-cosmic-sm transition-shadow"
                          placeholder="Enter new password"
                          aria-label="New password"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-electric-blue focus:outline-none pr-10 focus:shadow-cosmic-sm transition-shadow"
                          placeholder="Confirm new password"
                          aria-label="Confirm new password"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setShowPasswords(!showPasswords)}
                      className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-all duration-300 hover:scale-105"
                      title={`${showPasswords ? 'Hide' : 'Show'} password fields`}
                      aria-label={`${showPasswords ? 'Hide' : 'Show'} password fields`}
                    >
                      {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      {showPasswords ? 'Hide' : 'Show'} passwords
                    </button>
                    
                    <button
                      onClick={handlePasswordChange}
                      disabled={saving || !currentPassword || !newPassword || !confirmPassword}
                      className="ml-auto px-6 py-2 bg-electric-blue hover:bg-electric-blue/80 text-white rounded-lg transition-all duration-300 hover:scale-105 shadow-cosmic hover:shadow-cosmic-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none"
                      title="Update password"
                      aria-label="Update password"
                    >
                      {saving ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Marketing Preferences */}
          <div className="mb-8 border-t border-white/10 pt-8">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-6 h-6 text-electric-blue" />
              <h2 className="text-2xl font-semibold text-white">Marketing Preferences</h2>
            </div>
            
            <div className="bg-white/5 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium mb-1">Marketing Emails</h3>
                  <p className="text-gray-400 text-sm">
                    Receive updates about new features, tips, and promotional offers
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={marketingConsent}
                    onChange={(e) => handleMarketingConsentUpdate(e.target.checked)}
                    className="sr-only peer"
                    aria-label="Marketing consent toggle"
                    title="Toggle marketing emails"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-electric-blue"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Subscription Info */}
          <div className="mb-8 border-t border-white/10 pt-8">
            <div className="flex items-center gap-3 mb-6">
              <CreditCard className="w-6 h-6 text-electric-blue" />
              <h2 className="text-2xl font-semibold text-white">Subscription</h2>
            </div>
            
            <div className="bg-white/5 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{subscriptionInfo.icon}</span>
                  <div>
                    <h3 className={`font-semibold ${subscriptionInfo.color}`}>
                      {subscriptionInfo.name} Plan
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {vipStatus?.isVIP ? `VIP Level: ${vipStatus.vipLevel}` : 'Basic access to SKRBL AI features'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSubscriptionModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-electric-blue to-teal-400 text-white rounded-lg hover:from-electric-blue/80 hover:to-teal-400/80 transition-all duration-300 hover:scale-105 shadow-cosmic hover:shadow-cosmic-lg"
                  title={accessLevel === 'free' ? 'Upgrade subscription plan' : 'Manage subscription plan'}
                  aria-label={accessLevel === 'free' ? 'Upgrade subscription plan' : 'Manage subscription plan'}
                >
                  {accessLevel === 'free' ? 'Upgrade Plan' : 'Manage Plan'}
                </button>
              </div>
              
              {vipStatus?.isVIP && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2 text-gold">
                    <Crown className="w-4 h-4" />
                    <span className="text-sm font-medium">VIP Benefits Active</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Connected Accounts */}
          <div className="mb-8 border-t border-white/10 pt-8">
            <div className="flex items-center gap-3 mb-6">
              <LinkIcon className="w-6 h-6 text-electric-blue" />
              <h2 className="text-2xl font-semibold text-white">Connected Accounts</h2>
            </div>
            
            <div className="space-y-4">
              {connectedAccounts.map((account, index) => (
                <div key={index} className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-electric-blue to-teal-400 rounded-lg flex items-center justify-center">
                        <Globe className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium">{account.provider}</h3>
                        <p className="text-gray-400 text-sm">{account.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        account.status === 'active' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {account.status}
                      </span>
                      <button
                        onClick={() => toast('Account management coming soon! 🔗', { icon: '🚧' })}
                        className="text-gray-400 hover:text-white text-sm transition-all duration-300 hover:scale-105"
                        title="Manage connected account"
                        aria-label={`Manage ${account.provider} account`}
                      >
                        Manage
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              <button
                onClick={() => toast('Connect more accounts coming soon! 🔗', { icon: '🚧' })}
                className="w-full p-4 border-2 border-dashed border-white/20 rounded-lg text-gray-400 hover:text-white hover:border-white/40 transition-all duration-300 hover:scale-105 hover:shadow-cosmic"
                title="Connect new account"
                aria-label="Connect another account"
              >
                + Connect another account
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="border-t border-red-500/20 pt-8">
            <button
              onClick={() => setShowDangerZone(!showDangerZone)}
              className="flex items-center gap-3 mb-4 w-full text-left text-red-400 hover:text-red-300 transition-colors"
              aria-label="Toggle danger zone section"
              title="Toggle danger zone section"
            >
              <AlertTriangle className="w-6 h-6" />
              <h2 className="text-2xl font-semibold">Danger Zone</h2>
              <motion.div
                animate={{ rotate: showDangerZone ? 180 : 0 }}
                className="ml-auto"
              >
                ▼
              </motion.div>
            </button>
            
            <AnimatePresence>
              {showDangerZone && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-500/10 border border-red-500/20 rounded-lg p-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-red-400 font-medium mb-1">Delete Account</h3>
                      <p className="text-gray-400 text-sm">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-300 hover:scale-105 shadow-cosmic-red hover:shadow-cosmic-red-lg"
                      title="Delete account"
                      aria-label="Delete account"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Subscription Modal */}
        <AnimatePresence>
          {showSubscriptionModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setShowSubscriptionModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="cosmic-glass rounded-2xl p-8 max-w-md w-full shadow-glow"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-2xl font-semibold text-white mb-4">Manage Subscription</h3>
                <p className="text-gray-400 mb-6">
                  Contact our sales team to upgrade your plan or manage your existing subscription.
                </p>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => window.open('mailto:sales@skrblai.io')}
                    className="px-4 py-2 bg-electric-blue hover:bg-blue-600 text-white rounded-lg transition-all duration-300 hover:scale-105 shadow-cosmic hover:shadow-cosmic-lg"
                    title="Contact sales team"
                    aria-label="Contact sales team via email"
                  >
                    Contact Sales
                  </button>
                  <button
                    onClick={() => setShowSubscriptionModal(false)}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-all duration-300 hover:scale-105"
                    title="Close subscription modal"
                    aria-label="Close subscription management modal"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Account Modal */}
        <AnimatePresence>
          {showDeleteModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setShowDeleteModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="cosmic-glass rounded-2xl p-8 max-w-md w-full shadow-glow border-red-500/20"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center mb-6">
                  <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-semibold text-white mb-2">Delete Account</h3>
                  <p className="text-gray-400">
                    This action cannot be undone. All your data will be permanently deleted.
                  </p>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Type "DELETE" to confirm:
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-red-500/50 rounded-lg text-white focus:border-red-500 focus:outline-none"
                    placeholder="DELETE"
                  />
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirmation !== 'DELETE'}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-300 hover:scale-105 shadow-cosmic-red hover:shadow-cosmic-red-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none"
                    title="Permanently delete account"
                    aria-label="Permanently delete account"
                  >
                    Delete Account
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeleteConfirmation('');
                    }}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-all duration-300 hover:scale-105"
                    title="Cancel account deletion"
                    aria-label="Cancel account deletion"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 