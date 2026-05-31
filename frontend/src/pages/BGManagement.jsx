import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, Plus, Search, RefreshCw, X, CheckCircle, 
  AlertTriangle, Calendar, FileText, ArrowRight, ShieldCheck, 
  HelpCircle, Flag, Eye, AlertCircle
} from 'lucide-react';

const BGManagement = () => {
  const { user, isClient, isOps } = useAuth();
  
  // Data State
  const [bgs, setBgs] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBg, setSelectedBg] = useState(null);
  const [bgClaims, setBgClaims] = useState({}); // bgId -> list of claims
  const [complianceHoldMsg, setComplianceHoldMsg] = useState(null);

  // Modals & Panels State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);

  // Search/Filters State
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // 1. Create BG Form State
  const [newBg, setNewBg] = useState({
    bgType: 'PERFORMANCE_BOND',
    creditFacilityId: 2,
    amount: '',
    currency: 'USD',
    beneficiaryName: '',
    expiryDate: '',
    termsConditions: ''
  });

  // 2. Submit Claim State
  const [claim, setClaim] = useState({
    claimRef: '',
    amount: '',
    paymentDetails: ''
  });

  // Fetch Bank Guarantees & Claims
  const fetchBgs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/bgs');
      const bgsList = res.data.data || [];
      setBgs(bgsList);

      const facRes = await api.get('/corporates/facilities');
      setFacilities((facRes.data.data || []).filter(f => f.facilityType === 'GUARANTEE_FACILITY'));

      // Fetch claims for each BG via real API endpoint
      const claimsMap = {};
      for (const bg of bgsList) {
        try {
          const claimsRes = await api.get(`/bgs/${bg.id}/claims`);
          claimsMap[bg.id] = claimsRes.data.data || [];
        } catch (e) {
          console.error("Error fetching claims for BG " + bg.id, e);
          claimsMap[bg.id] = [];
        }
      }
      setBgClaims(claimsMap);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBgs();
  }, []);

  const handleCreateBg = async (e) => {
    e.preventDefault();
    try {
      const selectedFacility = facilities.find(f => f.id === parseInt(newBg.creditFacilityId)) || facilities[0];
      const clientId = selectedFacility?.client?.id || 1;
      const facilityId = newBg.creditFacilityId || 2;
      
      const res = await api.post(`/bgs?clientId=${clientId}&facilityId=${facilityId}`, newBg);
      setBgs(prev => [res.data.data, ...prev]);
      setShowCreateModal(false);
      resetCreateForm();
      fetchBgs();
    } catch (e) {
      console.error(e);
      alert('Error raising guarantee application');
    }
  };

  const handleStatusUpdate = async (bgId, newStatus) => {
    try {
      setComplianceHoldMsg(null);
      const res = await api.put(`/bgs/${bgId}/status`, { status: newStatus });
      const updatedBg = res.data.data;
      // Defensive: if API returned a valid object use it, otherwise patch just the status field
      setBgs(prev => prev.map(item =>
        item.id === bgId ? (updatedBg ?? { ...item, status: newStatus }) : item
      ));
      if (selectedBg?.id === bgId) {
        setSelectedBg(updatedBg ?? { ...selectedBg, status: newStatus });
      }
      fetchBgs();
    } catch (e) {
      console.error(e);
      const msg = e.response?.data?.message || e.message || 'Failed to update status.';
      if (e.response?.status === 403 && msg.includes('COMPLIANCE_HOLD')) {
        setComplianceHoldMsg(msg);
      } else {
        alert('Failed to update BG status: ' + msg);
      }
    }
  };

  // Dedicated handler for CLIENT: DRAFT → PENDING_APPROVAL via /submit endpoint
  const handleSubmitForApproval = async (bgId) => {
    try {
      const res = await api.put(`/bgs/${bgId}/submit`, {});
      const updatedBg = res.data.data;
      setBgs(prev => prev.map(item =>
        item.id === bgId ? (updatedBg ?? { ...item, status: 'PENDING_APPROVAL' }) : item
      ));
      if (selectedBg?.id === bgId) {
        setSelectedBg(updatedBg ?? { ...selectedBg, status: 'PENDING_APPROVAL' });
      }
      fetchBgs();
    } catch (e) {
      console.error(e);
      alert('Failed to submit for approval. ' + (e.response?.data?.message || ''));
    }
  };

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/bgs/${selectedBg.id}/claims`, {
        amount: parseFloat(claim.amount),
        paymentDetails: claim.paymentDetails
      });
      alert(`Guarantee Breach Claim ${res.data.data.claimRef} submitted successfully! Operations desk has been alerted.`);
      setShowClaimModal(false);
      fetchBgs();
    } catch (e) {
      console.error(e);
      alert('Error presenting breach claim');
    }
  };

  const resetCreateForm = () => {
    setNewBg({
      bgType: 'PERFORMANCE_BOND',
      creditFacilityId: 2,
      amount: '',
      currency: 'USD',
      beneficiaryName: '',
      expiryDate: '',
      termsConditions: ''
    });
  };

  const filteredBgs = bgs.filter(item => {
    const matchesSearch = item.bgNumber.toLowerCase().includes(search.toLowerCase()) ||
      item.beneficiaryName.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter ? item.bgType === typeFilter : true;
    const matchesStatus = statusFilter ? item.status === statusFilter : true;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const badges = {
      DRAFT: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
      PENDING_APPROVAL: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
      ACTIVE: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 badge-pulse',
      CLAIMED: 'bg-rose-500/10 text-rose-500 border border-rose-500/20',
      EXPIRED: 'bg-rose-500/10 text-rose-500 border border-rose-500/20',
      RELEASED: 'bg-slate-500/10 text-slate-500 border border-slate-500/20',
    };
    return badges[status] || badges.DRAFT;
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b dark:border-slate-900 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Bank Guarantees Workspace</h1>
          <p className="text-xs text-slate-400 mt-1">Issue Bid Bonds, Performance Bonds, Financial Guarantees &amp; track default claims</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchBgs} className="p-2.5 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-slate-950/20 bg-white hover:bg-slate-100 transition-colors">
            <RefreshCw className="h-4 w-4" />
          </button>
          {isClient && (
            <button 
              onClick={() => { resetCreateForm(); setShowCreateModal(true); }}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-all flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> Request Bank Guarantee
            </button>
          )}
        </div>
      </div>

      {/* FILTER CONTROLS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by BG Reference, beneficiary..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-slate-900 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-slate-900 bg-white text-xs focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="DRAFT">DRAFT</option>
          <option value="PENDING_APPROVAL">PENDING_APPROVAL</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="CLAIMED">CLAIMED</option>
          <option value="EXPIRED">EXPIRED</option>
          <option value="RELEASED">RELEASED</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-slate-900 bg-white text-xs focus:outline-none"
        >
          <option value="">All Types</option>
          <option value="PERFORMANCE_BOND">PERFORMANCE BOND</option>
          <option value="BID_BOND">BID BOND</option>
          <option value="ADVANCE_PAYMENT">ADVANCE PAYMENT</option>
          <option value="FINANCIAL">FINANCIAL</option>
        </select>
      </div>

      {/* DUAL WORKSPACE LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main List */}
        <div className="glass-card-light dark:glass-card-dark rounded-3xl p-6 lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-base">Active Guarantees Portfolio</h3>
            <div className="flex gap-1 items-center text-[10px] text-amber-500 font-bold bg-amber-500/5 px-2 py-0.5 rounded-full border border-amber-500/10">
              <Calendar className="h-3 w-3" />
              <span>Expiry alerts active</span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-slate-400 font-bold border-b dark:border-slate-800">
                  <th className="py-3">BG Number</th>
                  <th>Guarantee Type</th>
                  <th>Beneficiary</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredBgs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 font-semibold">No active Bank Guarantees found.</td>
                  </tr>
                ) : (
                  filteredBgs.map(bg => (
                    <tr key={bg.id} className="border-b dark:border-slate-900/60 hover:bg-slate-500/5 transition-colors">
                      <td className="py-3.5 font-bold tracking-tight text-emerald-500 dark:text-emerald-400">{bg.bgNumber}</td>
                      <td className="font-semibold text-slate-500">{bg.bgType.replace('_', ' ')}</td>
                      <td>{bg.beneficiaryName}</td>
                      <td className="font-bold">USD {bg.amount.toLocaleString()}</td>
                      <td>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${getStatusBadge(bg.status)}`}>
                          {bg.status}
                        </span>
                      </td>
                      <td className="text-right">
                        <button 
                          onClick={() => { setSelectedBg(bg); setComplianceHoldMsg(null); }}
                          className="p-1.5 rounded-lg dark:hover:bg-slate-800 hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                        >
                          <Eye className="h-4.5 w-4.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Details panel */}
        <div className="glass-card-light dark:glass-card-dark rounded-3xl p-6 space-y-6">
          <h3 className="font-bold text-base border-b dark:border-slate-800 pb-3">Guarantee Inspection Desk</h3>

          {selectedBg ? (
            <div className="space-y-5">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">REGULATORY KEY: {selectedBg.id}</span>
                <h4 className="text-xl font-black">{selectedBg.bgNumber}</h4>
                <div className="flex gap-2 items-center mt-1">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${getStatusBadge(selectedBg.status)}`}>{selectedBg.status}</span>
                  <span className="text-xs text-slate-400 font-semibold">{selectedBg.bgType.replace('_', ' ')}</span>
                </div>
              </div>

              {/* Financial Stats */}
              <div className="p-4 rounded-2xl dark:bg-slate-950/40 bg-slate-50 border dark:border-slate-900 border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold">Security Limit Amount</span>
                  <span className="font-black">USD {selectedBg.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold">Expiry Date Threshold</span>
                  <span className="font-bold text-amber-500 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> {selectedBg.expiryDate}
                  </span>
                </div>
              </div>

              {/* Terms and conditions block */}
              <div className="p-3.5 rounded-2xl dark:bg-slate-900/30 bg-slate-50 border dark:border-slate-800/80 border-slate-100 text-xs">
                <h5 className="font-bold text-[10px] uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5 text-brand-500" /> Guarantee Covenant terms
                </h5>
                <p className="text-slate-500 leading-relaxed italic">{selectedBg.termsConditions || 'Standard sovereign bond clauses apply.'}</p>
              </div>

              {/* Breaches & Claims */}
              <div className="space-y-3">
                <h5 className="font-bold text-xs uppercase tracking-wider text-slate-400 border-b dark:border-slate-850 pb-1.5 flex items-center gap-1">
                  <Flag className="h-3.5 w-3.5 text-rose-500" /> Default Claims Logs
                </h5>
                {bgClaims[selectedBg.id] && bgClaims[selectedBg.id].length > 0 ? (
                  bgClaims[selectedBg.id].map(clm => (
                    <div key={clm.id} className="p-3 rounded-xl border border-rose-500/20 bg-rose-500/5 text-xs space-y-1">
                      <div className="flex justify-between font-bold">
                        <span>Ref: {clm.claimRef}</span>
                        <span className="text-rose-500">USD {clm.amount.toLocaleString()}</span>
                      </div>
                      <p className="text-[10px] text-slate-400">Milestone default reported. Status: <span className="font-bold text-rose-500">{clm.status}</span></p>
                    </div>
                  ))
                ) : (
                  <div className="text-[10px] text-slate-400 italic">No active breach claims reported under this bond structure.</div>
                )}
              </div>

              {/* Compliance Hold Banner */}
              {complianceHoldMsg && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 rounded-2xl border-2 border-rose-500/40 bg-rose-500/10 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-rose-500 flex-shrink-0" />
                    <span className="font-black text-xs text-rose-500 uppercase tracking-wider">🔒 Compliance Hold Active</span>
                  </div>
                  <p className="text-[11px] text-rose-400 leading-relaxed font-semibold">
                    This BG is blocked by a sanctions screening flag. A <span className="text-rose-300 font-black">Compliance Manager</span> must resolve the case in the <span className="text-rose-300 font-black">Compliance &amp; Watchlist</span> module before this BG can be issued.
                  </p>
                  <p className="text-[10px] text-rose-500/70 font-mono break-all">{complianceHoldMsg.replace('COMPLIANCE_HOLD: ', '')}</p>
                </motion.div>
              )}

              {/* Secure Actions */}
              <div className="border-t dark:border-slate-800 pt-4 space-y-2">

                {/* STEP 1 → CLIENT: Submit DRAFT for ops review */}
                {isClient && selectedBg.status === 'DRAFT' && (
                  <div className="space-y-2">
                    <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-[10px] text-amber-500 font-semibold">
                      ⚠ This guarantee is still a draft. Submit it for Operations review to proceed.
                    </div>
                    <button
                      onClick={() => handleSubmitForApproval(selectedBg.id)}
                      className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2"
                    >
                      <ArrowRight className="h-3.5 w-3.5" />
                      Submit for Approval
                    </button>
                  </div>
                )}

                {/* STEP 2 → OPS: Approve or Release a PENDING_APPROVAL BG */}
                {isOps && selectedBg.status === 'PENDING_APPROVAL' && (
                  <div className="space-y-2">
                    <div className="p-3 rounded-xl bg-brand-500/5 border border-brand-500/20 text-[10px] text-brand-500 font-semibold">
                      📋 Awaiting Operations clearance. Review covenant terms before issuing.
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleStatusUpdate(selectedBg.id, 'ACTIVE')}
                        className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-colors"
                      >
                        ✓ Clear &amp; Issue BG
                      </button>
                      <button 
                        onClick={() => handleStatusUpdate(selectedBg.id, 'RELEASED')}
                        className="px-3.5 py-2.5 rounded-xl bg-slate-500 hover:bg-slate-600 text-white font-bold text-xs transition-colors"
                      >
                        Release
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3 → CLIENT: File a breach claim on an ACTIVE BG */}
                {isClient && selectedBg.status === 'ACTIVE' && (
                  <button 
                    onClick={() => {
                      setClaim({
                        claimRef: 'CLM-BG' + Math.floor(Math.random() * 9000 + 1000) + '-01',
                        amount: '',
                        paymentDetails: ''
                      });
                      setShowClaimModal(true);
                    }}
                    className="w-full py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs transition-colors"
                  >
                    Submit Default / Breach Claim
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-slate-400 text-xs font-semibold">
              Select a Bank Guarantee Reference to inspect covenants, expiry limits, and claims logs.
            </div>
          )}
        </div>

      </div>

      {/* ----------------------------------------------------
          MODALS SECTION
         ---------------------------------------------------- */}

      {/* 1. REQUEST BG ISSUANCE MODAL */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            ></motion.div>
            
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="w-full max-w-lg rounded-3xl border dark:border-slate-800 border-slate-200 dark:bg-slate-900 bg-white shadow-2xl relative z-10 p-6 space-y-4"
            >
              <div className="flex justify-between items-center border-b dark:border-slate-800 pb-3">
                <h4 className="font-extrabold text-sm flex items-center gap-2">
                  <Award className="h-4.5 w-4.5 text-emerald-500" /> Apply for Bank Guarantee
                </h4>
                <button onClick={() => setShowCreateModal(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              <form onSubmit={handleCreateBg} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400">Guarantee Type Bond</label>
                    <select
                      value={newBg.bgType}
                      onChange={(e) => setNewBg(prev => ({ ...prev, bgType: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-slate-950 bg-white text-xs focus:outline-none"
                    >
                      <option value="PERFORMANCE_BOND">PERFORMANCE BOND</option>
                      <option value="BID_BOND">BID BOND</option>
                      <option value="ADVANCE_PAYMENT">ADVANCE PAYMENT</option>
                      <option value="FINANCIAL">FINANCIAL COVENANT</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400">Active Guarantee Facility</label>
                    <select
                      value={newBg.creditFacilityId}
                      onChange={(e) => setNewBg(prev => ({ ...prev, creditFacilityId: parseInt(e.target.value) }))}
                      className="w-full px-4 py-2.5 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-slate-950 bg-white text-xs focus:outline-none"
                    >
                      {facilities.map(fac => (
                        <option key={fac.id} value={fac.id}>
                          Guarantee limit: (USD {(fac.limitAmount - fac.utilizedAmount).toLocaleString()} available)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400">Guarantee Amount (USD)</label>
                    <input
                      type="number"
                      placeholder="e.g. 500000"
                      value={newBg.amount}
                      onChange={(e) => setNewBg(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                      className="w-full px-4 py-2.5 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-slate-950 bg-white text-xs focus:outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400">Beneficiary Corporate</label>
                    <input
                      type="text"
                      placeholder="e.g. Texas Dept of Transit"
                      value={newBg.beneficiaryName}
                      onChange={(e) => setNewBg(prev => ({ ...prev, beneficiaryName: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-slate-950 bg-white text-xs focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-400">Bond Expiry Maturity Date</label>
                  <input
                    type="date"
                    value={newBg.expiryDate}
                    onChange={(e) => setNewBg(prev => ({ ...prev, expiryDate: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-slate-950 bg-white text-xs focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-400">Special Terms, Clauses, &amp; Covenants</label>
                  <textarea
                    rows={3}
                    placeholder="Enter covenant terms &amp; conditions..."
                    value={newBg.termsConditions}
                    onChange={(e) => setNewBg(prev => ({ ...prev, termsConditions: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-slate-950 bg-white text-xs focus:outline-none"
                    required
                  ></textarea>
                </div>

                <button type="submit" className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-all">
                  Submit Guarantee Application (Draft)
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. SUBMIT BREACH CLAIM MODAL */}
      <AnimatePresence>
        {showClaimModal && selectedBg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowClaimModal(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            ></motion.div>
            
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="w-full max-w-md rounded-3xl border dark:border-slate-800 border-slate-200 dark:bg-slate-900 bg-white shadow-2xl relative z-10 p-6 space-y-4"
            >
              <div className="flex justify-between items-center border-b dark:border-slate-800 pb-3">
                <h4 className="font-extrabold text-sm">Present Default breach Claim: {selectedBg.bgNumber}</h4>
                <button onClick={() => setShowClaimModal(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              <form onSubmit={handleClaimSubmit} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-400">Claim Code / Reference</label>
                  <input
                    type="text"
                    disabled
                    value={claim.claimRef}
                    className="w-full px-4 py-2.5 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-slate-950 bg-slate-50/50 font-mono focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-400">Claim Invoice Breach Amount (USD)</label>
                  <input
                    type="number"
                    placeholder="Enter claim amount"
                    value={claim.amount}
                    onChange={(e) => setClaim(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-slate-950 bg-white text-xs focus:outline-none"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-400">Breach Justification details</label>
                  <textarea
                    rows={3}
                    placeholder="Provide details on project milestone failure or financial default..."
                    value={claim.paymentDetails}
                    onChange={(e) => setClaim(prev => ({ ...prev, paymentDetails: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-slate-950 bg-white text-xs focus:outline-none"
                    required
                  ></textarea>
                </div>

                <button type="submit" className="w-full py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold transition-all">
                  Present Breach Claim (Operations audit pending)
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default BGManagement;
