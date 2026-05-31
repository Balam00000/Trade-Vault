import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, AlertCircle, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Please enter your registered corporate email.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    
    // Simulate API delay
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 dark:bg-slate-950 bg-slate-50 transition-colors duration-300 overflow-hidden">
      {/* Decorative Spheres */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-brand-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md rounded-3xl border border-slate-200/60 dark:border-slate-900 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl shadow-2xl p-8 space-y-6"
      >
        <div className="flex items-center justify-between border-b dark:border-slate-800 pb-4">
          <Link to="/login" className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-brand-500 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Sign-In
          </Link>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-brand-500" />
            <span className="font-bold text-sm bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent dark:from-white dark:to-brand-300">TRADEVAULT</span>
          </div>
        </div>

        {success ? (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
            <CheckCircle2 className="h-14 w-14 text-emerald-500 animate-bounce" />
            <h3 className="text-lg font-bold">Recovery Token Dispatched</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
              We have dispatched a cryptographic password reset token to <strong>{email}</strong>. Check your corporate mailbox and follow instructions to decrypt your access credential.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-1">
              <h3 className="text-lg font-bold tracking-tight">Decryption Request</h3>
              <p className="text-xs text-slate-400">Request password retrieval link for registered accounts.</p>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2.5">
                <AlertCircle className="h-4.5 w-4.5 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Corporate Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. employee@bankdomain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-slate-950 bg-slate-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-brand-500/20 active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? 'Verifying Corporate Record...' : 'Dispatch Token'}
                {!loading && <Send className="h-4 w-4" />}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
