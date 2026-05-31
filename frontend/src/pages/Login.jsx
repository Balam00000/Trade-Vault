import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, User, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleAutofill = (roleUsername) => {
    setUsername(roleUsername);
    setPassword('password'); // All seed users share the password 'password'
    setErrorMsg('');
  };

  const testAccounts = [
    { label: 'Corporate Client', user: 'client', desc: 'Acme Industrial LC & facility management' },
    { label: 'Trade Ops Officer', user: 'ops', desc: 'Maker-Checker processing, drawings review' },
    { label: 'Relationship Mgr', user: 'relationship', desc: 'Credit facilities, portfolio approvals' },
    { label: 'Treasury Manager', user: 'treasury', desc: 'Exposure charts, liquidity ratios' },
    { label: 'Compliance Officer', user: 'compliance', desc: 'Sanctions cases & watchlists' },
    { label: 'System Admin', user: 'admin', desc: 'Chronological audit ledger & portal status' },
  ];

  return (
    <div className="min-h-screen relative flex flex-col md:flex-row items-center justify-center p-4 md:p-0 dark:bg-slate-950 bg-slate-50 transition-colors duration-300 overflow-hidden">
      {/* Background Decorative Blur Spheres */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-brand-500/10 dark:bg-brand-500/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Left side: Enterprise Intro */}
      <div className="hidden md:flex flex-col justify-center w-1/2 min-h-screen p-16 relative z-10 text-slate-800 dark:text-slate-100">
        <div className="max-w-md space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-brand-500/10 flex items-center justify-center border border-brand-500/20 shadow-lg shadow-brand-500/5">
              <ShieldCheck className="h-7 w-7 text-brand-500" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-brand-600 to-indigo-500 bg-clip-text text-transparent dark:from-white dark:to-brand-300">
              TRADEVAULT
            </h1>
          </div>
          
          <h2 className="text-4xl font-bold leading-tight">
            Enterprise Banking &amp; Trade Finance Portal
          </h2>
          
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
            TradeVault is an enterprise-grade digital core platform built to automate Letters of Credit (LC), Bank Guarantees (BG), Export documentary collections, and instant compliance watchlist sanctions screening.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="p-4 rounded-2xl dark:bg-slate-900/40 bg-white border dark:border-slate-900 border-slate-200">
              <h4 className="font-semibold text-sm">Role-Based Operations</h4>
              <p className="text-xs text-slate-400 mt-1">Multi-role environment mapping Corporate Clients, Ops, and Compliance.</p>
            </div>
            <div className="p-4 rounded-2xl dark:bg-slate-900/40 bg-white border dark:border-slate-900 border-slate-200">
              <h4 className="font-semibold text-sm">Maker-Checker Controls</h4>
              <p className="text-xs text-slate-400 mt-1">Audit-ready workflows ensuring risk and regulatory clearance.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Login Panel */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg rounded-3xl border border-slate-200/60 dark:border-slate-900 bg-white/70 dark:bg-slate-900/55 backdrop-blur-xl shadow-2xl p-8 space-y-6"
        >
          <div className="text-center md:text-left space-y-1.5">
            <h3 className="text-2xl font-bold tracking-tight">Access Control Terminal</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Provide credentials to enter secure corporate network.</p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2.5">
              <AlertCircle className="h-4.5 w-4.5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Username</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Enter corporate username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-slate-950 bg-slate-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Security Password</label>
                <Link to="/forgot-password" className="text-xs text-brand-500 hover:underline">Forgot?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-slate-950 bg-slate-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-brand-500/20 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Decrypting & Sign-In...' : 'Initiate Secure Session'}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          {/* Quick Sandbox Autofill Assistant */}
          <div className="border-t dark:border-slate-800/80 border-slate-100 pt-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-brand-400">
              <Sparkles className="h-3.5 w-3.5 text-brand-500" />
              <span>TESTING SANDBOX ASSISTANT</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {testAccounts.map((account) => (
                <button
                  key={account.user}
                  type="button"
                  onClick={() => handleAutofill(account.user)}
                  className="p-2.5 text-left rounded-xl border dark:border-slate-900 border-slate-200 dark:bg-slate-900/30 bg-slate-50/60 hover:bg-brand-500/5 dark:hover:bg-brand-500/5 hover:border-brand-500/30 transition-all group"
                >
                  <div className="font-bold text-[11px] text-slate-700 dark:text-slate-200 group-hover:text-brand-500 transition-colors">
                    {account.label}
                  </div>
                  <div className="text-[9px] text-slate-400 font-medium leading-tight truncate mt-0.5">
                    {account.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="text-center">
            <span className="text-xs text-slate-400">New corporate client? </span>
            <Link to="/register" className="text-xs text-brand-500 hover:underline font-semibold">Initiate Onboarding</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
