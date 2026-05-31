import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { ShieldCheck, AlertCircle, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('CLIENT');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !fullName || !email || !password) {
      setErrorMsg('Please complete all security fields.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      await register(username, password, email, fullName, role);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      setErrorMsg(err.message || 'Onboarding registration failed. Username/Email might be in use.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 dark:bg-slate-950 bg-slate-50 transition-colors duration-300 overflow-hidden">
      {/* Decorative Spheres */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-xl rounded-3xl border border-slate-200/60 dark:border-slate-900 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl shadow-2xl p-8 space-y-6"
      >
        <div className="flex items-center justify-between border-b dark:border-slate-800 pb-4">
          <Link to="/login" className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-brand-500 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Gate
          </Link>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-brand-500" />
            <span className="font-bold text-sm bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent dark:from-white dark:to-brand-300">TRADEVAULT</span>
          </div>
        </div>

        {success ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
            <CheckCircle2 className="h-16 w-16 text-emerald-500 animate-bounce" />
            <h3 className="text-xl font-bold">Onboarding Request Authenticated</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
              Your credentials have been successfully registered into our secure banking vault. Redirecting you to sign-in terminal...
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-1">
              <h3 className="text-xl font-bold tracking-tight">Onboarding Registry</h3>
              <p className="text-xs text-slate-400">Configure new user profile and security roles below.</p>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2.5">
                <AlertCircle className="h-4.5 w-4.5 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Username</label>
                <input
                  type="text"
                  placeholder="e.g. jsmith_corp"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-slate-950 bg-slate-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Full Name / Org Entity</label>
                <input
                  type="text"
                  placeholder="e.g. John Smith (Acme Corp)"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-slate-950 bg-slate-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Business Email</label>
                <input
                  type="email"
                  placeholder="e.g. contact@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-slate-950 bg-slate-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Access Key / Password</label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-slate-950 bg-slate-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                  required
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Operations &amp; Security Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-slate-950 bg-slate-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                >
                  <option value="CLIENT">Corporate Client (onboard letter of credit, bank guarantee facility)</option>
                  <option value="OPERATIONS">Trade Operations Officer (approve documents presentation &amp; drawings)</option>
                  <option value="RELATIONSHIP_MANAGER">Relationship Manager (facility onboarding, limit adjustments)</option>
                  <option value="TREASURY">Treasury Director (liquidity, overall exposure, analytical insights)</option>
                  <option value="COMPLIANCE">Compliance Officer (manage watchlist matches, block/clear transactions)</option>
                  <option value="ADMIN">System Administrator (audit log overview, system health monitor)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full md:col-span-2 mt-4 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-brand-500/20 active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? 'Submitting Registry Key...' : 'Register Profile'}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default Register;
