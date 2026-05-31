import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';
import { 
  History, Search, RefreshCw, X, ShieldAlert,
  Calendar, Terminal, User, Globe
} from 'lucide-react';

const AuditLedger = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter States
  const [search, setSearch] = useState('');
  const [userFilter, setUserFilter] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/audit-logs');
      setLogs(res.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(search.toLowerCase()) || 
      log.details.toLowerCase().includes(search.toLowerCase());
    const matchesUser = userFilter ? log.username === userFilter : true;
    return matchesSearch && matchesUser;
  });

  // Extract unique usernames for filter dropdown
  const uniqueUsers = [...new Set(logs.map(log => log.username))];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b dark:border-slate-900 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <History className="h-6 w-6 text-brand-500" /> Chronological Audit Ledger
          </h1>
          <p className="text-xs text-slate-400 mt-1">Immutable system activity logs, security trails, transaction revisions</p>
        </div>
        <button onClick={fetchLogs} className="p-2.5 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-slate-950/20 bg-white hover:bg-slate-100 transition-colors">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* FILTER PANEL */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by action tag, details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-slate-900 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <select
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-slate-900 bg-white text-xs focus:outline-none"
        >
          <option value="">All Users</option>
          {uniqueUsers.map(u => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>
      </div>

      {/* LOGS GRID TIMELINE */}
      <div className="glass-card-light dark:glass-card-dark rounded-3xl p-6 overflow-hidden space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-base flex items-center gap-1.5">
            <Terminal className="h-4 w-4 text-brand-500" /> Immutable Event Trails
          </h3>
          <span className="h-5 px-2 rounded-full dark:bg-slate-950 bg-slate-100 text-[10px] font-mono text-brand-500">{filteredLogs.length} events logged</span>
        </div>

        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
          {filteredLogs.length === 0 ? (
            <div className="py-20 text-center text-slate-400 font-semibold text-xs">No audit logs found matching filters.</div>
          ) : (
            filteredLogs.map((log) => (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                key={log.id}
                className="p-4 rounded-2xl dark:bg-slate-950/40 bg-slate-50 border dark:border-slate-900 border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono text-xs hover:border-brand-500/20 transition-all"
              >
                <div className="space-y-1.5 overflow-hidden">
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-brand-500"></span>
                    <span className="font-bold text-slate-600 dark:text-brand-400 flex items-center gap-1">
                      <User className="h-3.5 w-3.5" /> {log.username}
                    </span>
                    <span className="font-black text-slate-800 dark:text-slate-200 uppercase">{log.action}</span>
                  </div>
                  <p className="text-slate-400 font-sans text-[11px] leading-relaxed">{log.details}</p>
                </div>

                <div className="flex items-center md:flex-col items-end gap-3 md:gap-1 text-[10px] text-slate-400 flex-shrink-0">
                  <span className="flex items-center gap-1 font-sans">
                    <Globe className="h-3 w-3" /> {log.ipAddress || '127.0.0.1'}
                  </span>
                  <span className="flex items-center gap-1 font-sans">
                    <Calendar className="h-3 w-3" /> {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditLedger;
