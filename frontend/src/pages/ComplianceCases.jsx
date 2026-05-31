import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, Search, RefreshCw, X, ShieldCheck, 
  AlertTriangle, UserCheck, CheckCircle2, Ban, FileText,
  TrendingUp, Activity, User
} from 'lucide-react';

const ComplianceCases = () => {
  const { user } = useAuth();
  
  // Data State
  const [screenings, setScreenings] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState(null);

  // Resolution Form State
  const [resolution, setResolution] = useState({
    notes: '',
    assignedTo: 'compliance'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const scrRes = await api.get('/compliance/screenings');
      setScreenings(scrRes.data.data || []);

      const casesRes = await api.get('/compliance/cases');
      setCases(casesRes.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleResolveCase = async (caseId, decision) => {
    if (!resolution.notes) {
      alert('Please fill in resolution notes explaining the rationale for clearance or block.');
      return;
    }
    try {
      const res = await api.put(`/compliance/cases/${caseId}/resolve`, {
        status: decision,
        notes: resolution.notes
      });
      alert(`Case ${caseId} successfully resolved as ${decision}. Audit ledger logs have been generated.`);
      setSelectedCase(null);
      setResolution({ notes: '', assignedTo: 'compliance' });
      fetchData();
    } catch (e) {
      console.error(e);
      alert('Error resolving compliance case');
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-rose-500 font-black';
    if (score >= 50) return 'text-amber-500 font-bold';
    return 'text-emerald-500 font-semibold';
  };

  const getStatusBadge = (status) => {
    const badges = {
      OPEN: 'bg-rose-500/10 text-rose-500 border border-rose-500/20 badge-pulse',
      UNDER_INVESTIGATION: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
      ESCALATED: 'bg-purple-500/10 text-purple-500 border border-purple-500/20',
      RESOLVED_CLEARED: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
      RESOLVED_BLOCKED: 'bg-slate-500/10 text-slate-500 border border-slate-500/20 font-bold',
    };
    return badges[status] || badges.OPEN;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b dark:border-slate-900 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Compliance &amp; Watchlist Registry</h1>
          <p className="text-xs text-slate-400 mt-1">Sovereign watchlist screenings (OFAC, UN list hits), match scores, &amp; case clearing</p>
        </div>
        <button onClick={fetchData} className="p-2.5 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-slate-950/20 bg-white hover:bg-slate-100 transition-colors">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Compliance Cases list */}
        <div className="glass-card-light dark:glass-card-dark rounded-3xl p-6 lg:col-span-2 space-y-4">
          <h3 className="font-bold text-base flex items-center gap-1.5">
            <ShieldAlert className="h-5 w-5 text-rose-500" /> Watchlist Matching Cases Queue
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-slate-400 font-bold border-b dark:border-slate-800">
                  <th className="py-3">Case ID</th>
                  <th>Entity Name</th>
                  <th>Match Source</th>
                  <th>Score</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {cases.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 font-semibold">No pending sanctions alerts in queue.</td>
                  </tr>
                ) : (
                  cases.map(item => (
                    <tr key={item.id} className="border-b dark:border-slate-900/60 hover:bg-slate-500/5 transition-colors">
                      <td className="py-3.5 font-bold tracking-tight text-slate-500 font-mono">CASE-00{item.id}</td>
                      <td className="font-semibold">{item.screening?.entityName}</td>
                      <td>{item.screening?.watchlistSource}</td>
                      <td className={`font-black ${getScoreColor(item.screening?.matchScore)}`}>{item.screening?.matchScore}%</td>
                      <td>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${getStatusBadge(item.caseStatus)}`}>
                          {item.caseStatus.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="text-right">
                        <button 
                          onClick={() => setSelectedCase(item)}
                          className="px-3 py-1 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-[10px] transition-colors"
                        >
                          Investigate
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Screenings list */}
          <div className="pt-6 border-t dark:border-slate-800/80 border-slate-100 space-y-4">
            <h3 className="font-bold text-base">Historical Screening Logs</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="text-slate-400 font-bold border-b dark:border-slate-800">
                    <th className="py-2.5">Screened Entity Name</th>
                    <th>Entity Type</th>
                    <th>Source list</th>
                    <th>Match Score</th>
                    <th>Result Status</th>
                  </tr>
                </thead>
                <tbody>
                  {screenings.map(scr => (
                    <tr key={scr.id} className="border-b dark:border-slate-900/60 text-slate-500">
                      <td className="py-2 font-bold text-slate-700 dark:text-slate-300">{scr.entityName}</td>
                      <td>{scr.entityType}</td>
                      <td>{scr.watchlistSource}</td>
                      <td className={`font-black ${getScoreColor(scr.matchScore)}`}>{scr.matchScore}%</td>
                      <td>
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${scr.status === 'CLEARED' ? 'bg-emerald-500/10 text-emerald-500' : scr.status === 'FLAGGED' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'}`}>
                          {scr.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* INVESTIGATION WORKBENCH */}
        <div className="glass-card-light dark:glass-card-dark rounded-3xl p-6 space-y-6">
          <h3 className="font-bold text-base border-b dark:border-slate-800 pb-3">Investigator workbench</h3>

          {selectedCase ? (
            <div className="space-y-6 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">CASE ID: CASE-00{selectedCase.id}</span>
                <h4 className="text-lg font-black">{selectedCase.screening?.entityName}</h4>
                <div className="flex gap-2 items-center mt-1">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${getStatusBadge(selectedCase.caseStatus)}`}>{selectedCase.caseStatus}</span>
                  <span className={`font-bold ${getScoreColor(selectedCase.screening?.matchScore)}`}>{selectedCase.screening?.matchScore}% Watchlist Match</span>
                </div>
              </div>

              {/* Watchlist Info */}
              <div className="p-4 rounded-2xl dark:bg-slate-950/40 bg-slate-50 border dark:border-slate-900 border-slate-200 space-y-2.5">
                <h5 className="font-bold text-[10px] uppercase tracking-wider text-slate-400">Match Registry Information</h5>
                <div className="space-y-1">
                  <span className="text-slate-400">Watchlist Hit Source: </span>
                  <span className="font-bold">{selectedCase.screening?.watchlistSource}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400">Current Assigned Investigator: </span>
                  <span className="font-bold text-brand-500 flex items-center gap-1.5 mt-0.5">
                    <User className="h-4 w-4" /> compliance_officer
                  </span>
                </div>
              </div>

              {/* Resolution Form */}
              <div className="space-y-3">
                <h5 className="font-bold text-xs uppercase tracking-wider text-slate-400 border-b dark:border-slate-850 pb-1.5">Resolution Rationale &amp; Logs</h5>
                
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-bold">Investigation Resolution Notes</label>
                  <textarea
                    rows={4}
                    placeholder="Provide details of shareholding analysis, PEP checks, or SDN clearance review..."
                    value={resolution.notes}
                    onChange={(e) => setResolution(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-slate-950 bg-white text-xs focus:outline-none"
                    required
                  ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button 
                    onClick={() => handleResolveCase(selectedCase.id, 'RESOLVED_CLEARED')}
                    className="py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-all flex items-center justify-center gap-1 hover:shadow-lg hover:shadow-emerald-500/10"
                  >
                    <ShieldCheck className="h-4 w-4" /> Clear Entity
                  </button>
                  <button 
                    onClick={() => handleResolveCase(selectedCase.id, 'RESOLVED_BLOCKED')}
                    className="py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold transition-all flex items-center justify-center gap-1 hover:shadow-lg hover:shadow-rose-500/10"
                  >
                    <Ban className="h-4 w-4" /> Block Entity
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-slate-400 text-xs font-semibold">
              Select a pending matching case from the queue to start SDN or watchlists verification audits.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ComplianceCases;
