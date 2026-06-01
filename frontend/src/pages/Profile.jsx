import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  User, Mail, Lock, ShieldCheck, UserCheck, 
  KeyRound, ShieldAlert, CheckCircle2, AlertCircle, 
  Loader2, RefreshCw, BadgeInfo
} from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useAuth();

  // Form states
  const [newUsername, setNewUsername] = useState(user?.username || '');
  const [newEmail, setNewEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    // Validations
    if (!newUsername.trim()) {
      setErrorMsg('Username cannot be empty.');
      return;
    }
    if (!newEmail.trim()) {
      setErrorMsg('Email address cannot be empty.');
      return;
    }

    // Password change validations
    const changingPassword = newPassword.trim() !== '';
    if (changingPassword) {
      if (!currentPassword) {
        setErrorMsg('Current password is required to set a new password.');
        return;
      }
      if (newPassword.length < 6) {
        setErrorMsg('New password must be at least 6 characters.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMsg('New password and password confirmation do not match.');
        return;
      }
    }

    setLoading(true);
    try {
      await updateProfile({
        newUsername: newUsername !== user.username ? newUsername.trim() : null,
        newEmail: newEmail !== user.email ? newEmail.trim() : null,
        currentPassword: changingPassword ? currentPassword : null,
        newPassword: changingPassword ? newPassword : null,
      });

      setSuccessMsg('Profile updated successfully! Security credentials synchronized.');
      // Clear password fields on success
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30';
      case 'COMPLIANCE':
        return 'bg-rose-500/10 text-rose-500 border border-rose-500/30';
      case 'TREASURY':
        return 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/30';
      case 'OPERATIONS':
        return 'bg-amber-500/10 text-amber-500 border border-amber-500/30';
      case 'RELATIONSHIP_MANAGER':
        return 'bg-sky-500/10 text-sky-500 border border-sky-500/30';
      default:
        return 'bg-brand-500/10 text-brand-500 border border-brand-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b dark:border-slate-900 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Security Credentials Portal</h1>
          <p className="text-xs text-slate-400 mt-1">Manage corporate access coordinates, login handles, and security keys</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Security Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="lg:col-span-1 glass-card-light dark:glass-card-dark p-6 rounded-3xl space-y-6 border dark:border-slate-900 border-slate-200/60 bg-white/50 dark:bg-slate-900/40 backdrop-blur-md relative overflow-hidden"
        >
          {/* Subtle badge background glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col items-center text-center space-y-4 pt-4">
            <div className="relative">
              <div className="h-24 w-24 rounded-3xl bg-brand-500/10 flex items-center justify-center border border-brand-500/20 shadow-lg shadow-brand-500/5">
                <ShieldCheck className="h-12 w-12 text-brand-500 animate-pulse" />
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow border-2 border-white dark:border-slate-950">
                <UserCheck className="h-3 w-3" />
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold tracking-tight">{user?.fullName}</h3>
              <div className="flex justify-center">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${getRoleBadgeStyle(user?.role)}`}>
                  {user?.role?.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>

          <hr className="dark:border-slate-800 border-slate-100" />

          {/* Secure Details Ledger */}
          <div className="space-y-3.5 text-xs">
            <div className="flex justify-between items-center py-0.5">
              <span className="text-slate-400 font-medium">Security ID Status</span>
              <span className="font-bold text-emerald-500 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                {user?.status || 'ACTIVE'}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-0.5">
              <span className="text-slate-400 font-medium">Corporate Email</span>
              <span className="font-bold dark:text-slate-200 text-slate-700 truncate max-w-[180px]">{user?.email}</span>
            </div>

            <div className="flex justify-between items-center py-0.5">
              <span className="text-slate-400 font-medium">Access Handle</span>
              <span className="font-bold dark:text-slate-200 text-slate-700">@{user?.username}</span>
            </div>

            <div className="flex justify-between items-center py-0.5">
              <span className="text-slate-400 font-medium">Cryptographic Key</span>
              <span className="font-mono text-[10px] text-brand-500 bg-brand-500/5 px-2 py-0.5 rounded border border-brand-500/20">BCrypt-AES256</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-brand-500/5 border border-brand-500/10 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 flex gap-2">
            <BadgeInfo className="h-4 w-4 text-brand-500 flex-shrink-0 mt-0.5" />
            <span>Updates synchronize instantaneously across the enterprise blockchain ledger and database registry.</span>
          </div>
        </motion.div>

        {/* Right Column: Settings Form */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="lg:col-span-2 glass-card-light dark:glass-card-dark p-6 rounded-3xl space-y-6 border dark:border-slate-900 border-slate-200/60 bg-white/50 dark:bg-slate-900/40 backdrop-blur-md"
        >
          <div className="border-b dark:border-slate-800 pb-4">
            <h3 className="text-lg font-bold tracking-tight">Access Control Synchronization</h3>
            <p className="text-xs text-slate-400 mt-0.5">Modify authentication parameters. Leave password fields blank if you do not wish to rotate key coordinates.</p>
          </div>

          {/* Toast Notifications */}
          {successMsg && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs flex items-center gap-3"
            >
              <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
              <span className="font-medium">{successMsg}</span>
            </motion.div>
          )}

          {errorMsg && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-3"
            >
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span className="font-medium">{errorMsg}</span>
            </motion.div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-6">
            {/* Core parameters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Authentication Username</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-slate-950 bg-slate-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all font-semibold"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Corporate Email Coordinates</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-slate-950 bg-slate-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all font-semibold"
                    required
                  />
                </div>
              </div>
            </div>

            <hr className="dark:border-slate-800 border-slate-100" />

            {/* Key rotation parameters */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-brand-400">
                <KeyRound className="h-4 w-4 text-brand-500" />
                <span>ROTATION OF SECURITY PASSWORD (OPTIONAL)</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Current Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="password"
                      placeholder="••••••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-slate-950 bg-slate-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="password"
                      placeholder="At least 6 chars"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-slate-950 bg-slate-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="password"
                      placeholder="••••••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-slate-950 bg-slate-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            <hr className="dark:border-slate-800 border-slate-100" />

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm transition-all duration-200 flex items-center gap-2 hover:shadow-lg hover:shadow-brand-500/20 active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Synchronizing Registry...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Commit Credentials Update
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
