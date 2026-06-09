import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Plus, Search, Filter, RefreshCw, X, 
  CheckCircle, AlertTriangle, ArrowRight, Eye, Calendar,
  TrendingUp, Ship, Landmark, Anchor, ShieldCheck
} from 'lucide-react';

const LCManagement = () => {
  const { user, isClient, isOps, isRM, isAdmin, corporateClientId } = useAuth();
  
  // Data State
  const [lcs, setLcs] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLc, setSelectedLc] = useState(null);

  // Amendments & Drawings State
  const [amendments, setAmendments] = useState([]);
  const [drawings, setDrawings] = useState([]);
  const [detailTab, setDetailTab] = useState('details'); // details | amendments | drawings

  // Modals & Panels State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAmendModal, setShowAmendModal] = useState(false);
  const [showDrawModal, setShowDrawModal] = useState(false);

  // Filters State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // 1. Create LC Wizard Form State
  const [wizardStep, setWizardStep] = useState(1);
  const [newLc, setNewLc] = useState({
    lcType: 'SIGHT',
    creditFacilityId: '',
    amount: '',
    currency: 'USD',
    applicantName: '',
    beneficiaryName: '',
    expiryDate: '',
    tolerancePercentage: 5.0,
    portOfLoading: '',
    portOfDischarge: '',
    latestShipmentDate: ''
  });

  // 2. Amend Form State
  const [amendment, setAmendment] = useState({
    newAmount: '',
    newExpiryDate: '',
    justification: ''
  });

  // 3. Drawing Presentation Form State
  const [drawing, setDrawing] = useState({
    drawingRef: '',
    amount: '',
    documentsPresented: 'Bill of Lading, Commercial Invoice, Packing List',
    portOfLoadingCheck: '',
    discrepancyNotes: ''
  });

  const [discrepancyAlert, setDiscrepancyAlert] = useState(null);

  // Fetch Letters of Credit
  const fetchLcs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/lcs');
      setLcs(res.data.data || []);
      
      const facRes = await api.get('/corporates/facilities');
      // Filter to only show LETTER_OF_CREDIT_FACILITY type facilities
      const allFacs = facRes.data.data || [];
      const lcFacs = allFacs.filter(f => f.facilityType === 'LETTER_OF_CREDIT_FACILITY');
      setFacilities(lcFacs);
      if (lcFacs.length > 0) {
        setNewLc(prev => ({
          ...prev,
          creditFacilityId: lcFacs[0].id,
          applicantName: lcFacs[0].client?.companyName || prev.applicantName
        }));
      } else {
        setNewLc(prev => ({ ...prev, creditFacilityId: '', applicantName: '' }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchAmendmentsAndDrawings = async (lcId) => {
    try {
      const amendRes = await api.get(`/lcs/${lcId}/amendments`);
      setAmendments(amendRes.data.data || []);
      
      const drawRes = await api.get(`/lcs/${lcId}/drawings`);
      setDrawings(drawRes.data.data || []);
    } catch (e) {
      console.error("Error fetching amendments/drawings", e);
    }
  };

  useEffect(() => {
    fetchLcs();
  }, []);

  useEffect(() => {
    if (selectedLc) {
      fetchAmendmentsAndDrawings(selectedLc.id);
    } else {
      setAmendments([]);
      setDrawings([]);
    }
    setDetailTab('details');
  }, [selectedLc]);

  // Filtered LCs list
  const filteredLcs = lcs.filter(item => {
    const matchesSearch = item.lcNumber.toLowerCase().includes(search.toLowerCase()) ||
      item.applicantName.toLowerCase().includes(search.toLowerCase()) ||
      item.beneficiaryName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter ? item.status === statusFilter : true;
    const matchesType = typeFilter ? item.lcType === typeFilter : true;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Actions handlers
  const handleCreateLc = async (e) => {
    e.preventDefault();
    try {
      // Guard: client must be mapped
      if (isClient && !corporateClientId) {
        alert('Your account has not been mapped to a corporate client yet. Please ask your administrator to assign your corporate client in User Management.');
        return;
      }
      // Guard: must have an active LC facility
      if (facilities.length === 0) {
        alert('No active Letter of Credit Facility found for your account. Please contact your Relationship Manager to set up a credit facility.');
        return;
      }
      const selectedFacility = facilities.find(f => f.id === parseInt(newLc.creditFacilityId)) || facilities[0];
      const clientId = corporateClientId || selectedFacility?.client?.id;
      const facilityId = selectedFacility?.id;
      
      if (!clientId || !facilityId) {
        alert('Unable to determine corporate client or credit facility. Please contact your administrator.');
        return;
      }

      const payload = {
        ...newLc,
        applicantName: selectedFacility?.client?.companyName || newLc.applicantName
      };

      const res = await api.post(`/lcs?clientId=${clientId}&facilityId=${facilityId}`, payload);
      setLcs(prev => [res.data.data, ...prev]);
      setShowCreateModal(false);
      resetCreateForm();
      fetchLcs();
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.message || 'Error creating LC application');
    }
  };

  const handleStatusUpdate = async (lcId, newStatus) => {
    try {
      const res = await api.put(`/lcs/${lcId}/status`, { status: newStatus });
      setLcs(prev => prev.map(item => item.id === lcId ? res.data.data : item));
      if (selectedLc?.id === lcId) {
        setSelectedLc(res.data.data);
      }
      fetchLcs();
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.message || 'Error updating LC status');
    }
  };

  const handleAmendSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/lcs/${selectedLc.id}/amendments`, {
        lcId: selectedLc.id,
        amendmentNumber: 1,
        previousAmount: selectedLc.amount,
        newAmount: parseFloat(amendment.newAmount),
        previousExpiryDate: selectedLc.expiryDate,
        newExpiryDate: amendment.newExpiryDate,
        justification: amendment.justification,
        createdBy: user?.username
      });
      alert('LC Amendment request submitted successfully for review!');
      setShowAmendModal(false);
      fetchAmendmentsAndDrawings(selectedLc.id);
      fetchLcs();
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.message || 'Failed to submit amendment');
    }
  };

  const handleProcessAmendment = async (amendmentId, newStatus) => {
    try {
      await api.put(`/lcs/amendments/${amendmentId}`, { status: newStatus });
      alert(`Amendment ${newStatus.toLowerCase()} successfully.`);
      if (selectedLc) {
        const res = await api.get(`/lcs/${selectedLc.id}`);
        setSelectedLc(res.data.data);
        fetchAmendmentsAndDrawings(selectedLc.id);
      }
      fetchLcs();
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.message || 'Failed to process amendment');
    }
  };

  const handleProcessDrawing = async (drawingId, newStatus) => {
    try {
      await api.put(`/lcs/drawings/${drawingId}`, {
        status: newStatus,
        discrepancyNotes: newStatus === 'REJECTED' ? 'Rejected by operations desk.' : 'Approved and paid.'
      });
      alert(`Drawing ${newStatus === 'PAID' ? 'paid' : 'rejected'} successfully.`);
      if (selectedLc) {
        const res = await api.get(`/lcs/${selectedLc.id}`);
        setSelectedLc(res.data.data);
        fetchAmendmentsAndDrawings(selectedLc.id);
      }
      fetchLcs();
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.message || 'Failed to process drawing');
    }
  };

  // Automated Discrepancy Screening Check
  const runDiscrepancyScreening = () => {
    let alertMsg = '';
    // Discrepancy Check 1: Port checks
    if (drawing.portOfLoadingCheck && selectedLc.portOfLoading) {
      if (drawing.portOfLoadingCheck.toLowerCase().trim() !== selectedLc.portOfLoading.toLowerCase().trim()) {
        alertMsg += `Discrepancy: Presented port of loading (${drawing.portOfLoadingCheck}) does not match registered LC port (${selectedLc.portOfLoading}). `;
      }
    }
    // Discrepancy Check 2: Amount exceed checks
    if (parseFloat(drawing.amount) > selectedLc.amount) {
      alertMsg += `Discrepancy: Presented invoice amount ($${drawing.amount}) exceeds Letter of Credit limit ($${selectedLc.amount}). `;
    }

    if (alertMsg) {
      setDiscrepancyAlert(alertMsg);
      setDrawing(prev => ({ ...prev, discrepancyNotes: alertMsg }));
    } else {
      setDiscrepancyAlert(null);
      setDrawing(prev => ({ ...prev, discrepancyNotes: 'Standard Clean Presentation' }));
    }
  };

  const handleDrawSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/lcs/${selectedLc.id}/drawings`, {
        lcId: selectedLc.id,
        drawingRef: drawing.drawingRef,
        amount: parseFloat(drawing.amount),
        currency: 'USD',
        presentationDate: new Date().toISOString().split('T')[0],
        documentsPresented: drawing.documentsPresented,
        discrepancyNotes: drawing.discrepancyNotes,
        status: discrepancyAlert ? 'DISCREPANT' : 'PENDING_REVIEW'
      });
      alert(discrepancyAlert ? 'Drawing submitted as DISCREPANT. Operations review required.' : 'Drawing presented cleanly.');
      setShowDrawModal(false);
      fetchLcs();
    } catch (e) {
      console.error(e);
    }
  };

  const resetCreateForm = () => {
    setWizardStep(1);
    const firstFac = facilities[0];
    setNewLc({
      lcType: 'SIGHT',
      creditFacilityId: firstFac?.id || '',
      amount: '',
      currency: 'USD',
      applicantName: firstFac?.client?.companyName || '',
      beneficiaryName: '',
      expiryDate: '',
      tolerancePercentage: 5.0,
      portOfLoading: '',
      portOfDischarge: '',
      latestShipmentDate: ''
    });
  };

  // Status badging layout helper
  const getStatusBadge = (status) => {
    const badges = {
      DRAFT: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
      IN_REVIEW: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
      APPROVED: 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
      ACTIVE: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 badge-pulse',
      AMENDED: 'bg-purple-500/10 text-purple-500 border border-purple-500/20',
      DRAWN: 'bg-teal-500/10 text-teal-500 border border-teal-500/20',
      EXPIRED: 'bg-rose-500/10 text-rose-500 border border-rose-500/20',
      CLOSED: 'bg-slate-500/10 text-slate-500 border border-slate-500/20',
    };
    return badges[status] || badges.DRAFT;
  };

  // Steps indicators
  const steps = [
    { num: 1, label: 'Applicant Details' },
    { num: 2, label: 'Financial Limit' },
    { num: 3, label: 'Shipping Rules' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b dark:border-slate-900 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Letters of Credit Workspace</h1>
          <p className="text-xs text-slate-400 mt-1">Manage Sight &amp; Usance LCs, issue drawing presentations, discrepant validations</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchLcs} className="p-2.5 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-slate-950/20 bg-white hover:bg-slate-100 transition-colors">
            <RefreshCw className="h-4 w-4" />
          </button>
          {isClient && corporateClientId && facilities.length > 0 && (
            <button 
              onClick={() => { resetCreateForm(); setShowCreateModal(true); }}
              className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs transition-all flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> Apply for Letter of Credit
            </button>
          )}
        </div>
      </div>

      {/* CLIENT ACCOUNT STATUS BANNERS */}
      {isClient && !corporateClientId && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs">
          <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <p className="font-bold text-amber-500">Account Pending Corporate Client Assignment</p>
            <p className="text-slate-500 dark:text-slate-400">
              Your account has been admitted but has not been mapped to a corporate client company yet.
              Please contact your <strong className="text-slate-700 dark:text-slate-200">System Administrator</strong> to assign your corporate client profile in User Management.
              Once mapped, you will be able to view your credit facilities and apply for Letters of Credit.
            </p>
          </div>
        </div>
      )}

      {isClient && corporateClientId && facilities.length === 0 && !loading && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs">
          <ShieldCheck className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <p className="font-bold text-blue-500">No Active Letter of Credit Facility</p>
            <p className="text-slate-500 dark:text-slate-400">
              Your corporate client account is active, but no <strong className="text-slate-700 dark:text-slate-200">Letter of Credit Facility</strong> has been set up yet.
              Please contact your <strong className="text-slate-700 dark:text-slate-200">Relationship Manager</strong> to create an LC credit facility for your account.
            </p>
          </div>
        </div>
      )}

      {/* SEARCH AND FILTER BAR */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by LC Number, applicant, beneficiary..."
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
          <option value="IN_REVIEW">IN_REVIEW</option>
          <option value="APPROVED">APPROVED</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="AMENDED">AMENDED</option>
          <option value="DRAWN">DRAWN</option>
          <option value="EXPIRED">EXPIRED</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-slate-900 bg-white text-xs focus:outline-none"
        >
          <option value="">All Types</option>
          <option value="SIGHT">SIGHT</option>
          <option value="USANCE">USANCE</option>
        </select>
      </div>

      {/* LETTERS OF CREDIT LIST GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LCs Main Table Card */}
        <div className="glass-card-light dark:glass-card-dark rounded-3xl p-6 lg:col-span-2 overflow-hidden space-y-4">
          <h3 className="font-bold text-base">Active Letters of Credit</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-slate-400 font-bold border-b dark:border-slate-800">
                  <th className="py-3">LC Number</th>
                  <th>Applicant</th>
                  <th>Beneficiary</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredLcs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 font-semibold">No Letter of Credit records found matching filters.</td>
                  </tr>
                ) : (
                  filteredLcs.map(lc => (
                    <tr key={lc.id} className="border-b dark:border-slate-900/60 hover:bg-slate-500/5 transition-colors">
                      <td className="py-3.5 font-bold tracking-tight text-brand-500 dark:text-brand-400">{lc.lcNumber}</td>
                      <td className="font-semibold">{lc.applicantName}</td>
                      <td>{lc.beneficiaryName}</td>
                      <td className="font-bold">USD {lc.amount.toLocaleString()}</td>
                      <td>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${getStatusBadge(lc.status)}`}>
                          {lc.status}
                        </span>
                      </td>
                      <td className="text-right">
                        <button 
                          onClick={() => setSelectedLc(lc)}
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

        {/* DETAILS PANEL PANEL */}
        <div className="glass-card-light dark:glass-card-dark rounded-3xl p-6 space-y-6">
          <h3 className="font-bold text-base border-b dark:border-slate-800 pb-3">LC Transaction Audit Inspector</h3>
          
          {selectedLc ? (
            <div className="space-y-6">
              {/* Tab Selector */}
              <div className="flex border-b dark:border-slate-800 border-slate-200">
                <button
                  onClick={() => setDetailTab('details')}
                  className={`flex-1 pb-2 text-[10px] font-bold tracking-wider uppercase border-b-2 text-center transition-colors ${detailTab === 'details' ? 'border-brand-500 text-brand-500 dark:text-white' : 'border-transparent text-slate-400'}`}
                >
                  Details
                </button>
                <button
                  onClick={() => setDetailTab('amendments')}
                  className={`flex-1 pb-2 text-[10px] font-bold tracking-wider uppercase border-b-2 text-center transition-colors ${detailTab === 'amendments' ? 'border-brand-500 text-brand-500 dark:text-white' : 'border-transparent text-slate-400'}`}
                >
                  Amendments ({amendments.length})
                </button>
                <button
                  onClick={() => setDetailTab('drawings')}
                  className={`flex-1 pb-2 text-[10px] font-bold tracking-wider uppercase border-b-2 text-center transition-colors ${detailTab === 'drawings' ? 'border-brand-500 text-brand-500 dark:text-white' : 'border-transparent text-slate-400'}`}
                >
                  Drawings ({drawings.length})
                </button>
              </div>

              {detailTab === 'details' && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Card Meta */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">SECURE AUDIT KEY: {selectedLc.id}</span>
                    <h4 className="text-xl font-black">{selectedLc.lcNumber}</h4>
                    <div className="flex gap-2 items-center mt-1">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${getStatusBadge(selectedLc.status)}`}>{selectedLc.status}</span>
                      <span className="text-xs text-slate-400 font-semibold">{selectedLc.lcType} LC</span>
                    </div>
                  </div>

                  {/* LC Lifecycle Progress Tracker */}
                  <div className="space-y-3 p-4 rounded-2xl dark:bg-slate-950/40 bg-slate-50 border dark:border-slate-900 border-slate-200">
                    <h5 className="font-bold text-xs uppercase tracking-wider text-slate-400">LC Progress Stages</h5>
                    <div className="flex items-center justify-between relative pt-2">
                      <div className="absolute top-4 left-0 right-0 h-0.5 dark:bg-slate-800 bg-slate-200 z-0"></div>
                      {['DRAFT', 'IN_REVIEW', 'APPROVED', 'ACTIVE', 'DRAWN'].map((stage, idx) => {
                        const stages = ['DRAFT', 'IN_REVIEW', 'APPROVED', 'ACTIVE', 'DRAWN', 'CLOSED'];
                        const currentIdx = stages.indexOf(selectedLc.status);
                        const stageIdx = stages.indexOf(stage);
                        const isPassed = currentIdx >= stageIdx;
                        
                        return (
                          <div key={stage} className="flex flex-col items-center z-10 relative">
                            <div className={`h-4.5 w-4.5 rounded-full border-2 flex items-center justify-center text-[8px] font-extrabold ${isPassed ? 'bg-brand-500 border-brand-500 text-white' : 'dark:bg-slate-950 bg-white dark:border-slate-800 border-slate-300 text-slate-400'}`}>
                              {isPassed ? '✓' : idx + 1}
                            </div>
                            <span className="text-[8px] font-bold mt-1 text-slate-400 uppercase tracking-widest">{stage.replace('_', ' ')}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Financial Metrics */}
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-slate-900/30 bg-slate-50/50">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">LC Limit Amount</span>
                      <div className="font-extrabold text-base mt-1">USD {selectedLc.amount.toLocaleString()}</div>
                    </div>
                    <div className="p-3.5 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-slate-900/30 bg-slate-50/50">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Shipment Date Limit</span>
                      <div className="font-extrabold text-sm mt-1">{selectedLc.latestShipmentDate || 'Not Required'}</div>
                    </div>
                    <div className="p-3.5 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-slate-900/30 bg-slate-50/50 col-span-2">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Beneficiary Merchant Details</span>
                      <div className="font-extrabold text-sm mt-1">{selectedLc.beneficiaryName}</div>
                    </div>
                  </div>

                  {/* WORKFLOW CONTROLS */}
                  <div className="border-t dark:border-slate-800 pt-4 space-y-2">
                    {/* 0. Client: Submit DRAFT for Ops Review */}
                    {isClient && selectedLc.status === 'DRAFT' && (
                      <div className="space-y-2">
                        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-semibold flex gap-2 items-start">
                          <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                          <span>This LC is a <strong>DRAFT</strong>. Submit it for Operations review to proceed.</span>
                        </div>
                        <button 
                          onClick={() => handleStatusUpdate(selectedLc.id, 'IN_REVIEW')}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2"
                        >
                          <ArrowRight className="h-3.5 w-3.5" /> Submit for Operations Review
                        </button>
                      </div>
                    )}

                    {/* 2. Operations / Admin review queue */}
                    {(isOps || isAdmin) && selectedLc.status === 'IN_REVIEW' && (
                      <div className="space-y-2">
                        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-semibold flex gap-2 items-start">
                          <ShieldCheck className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                          <span>Review this LC application and approve or reject as Maker.</span>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleStatusUpdate(selectedLc.id, 'APPROVED')}
                            className="flex-1 px-3.5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-colors"
                          >
                            ✓ Approve Application (Maker)
                          </button>
                          <button 
                            onClick={() => handleStatusUpdate(selectedLc.id, 'REJECTED')}
                            className="px-3.5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    )}

                    {/* 3. RM Limit verification clearance */}
                    {(isRM || isAdmin) && selectedLc.status === 'APPROVED' && (
                      <div className="space-y-2">
                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-semibold flex gap-2 items-start">
                          <Landmark className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                          <span>Verify credit facility limits and activate the LC for client use.</span>
                        </div>
                        <button 
                          onClick={() => handleStatusUpdate(selectedLc.id, 'ACTIVE')}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs transition-colors"
                        >
                          Clear Facility Limit &amp; Activate LC
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {detailTab === 'amendments' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex justify-between items-center border-b dark:border-slate-800 pb-2">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Amendment Records</h4>
                    {isClient && selectedLc.status === 'ACTIVE' && (
                      <button
                        onClick={() => {
                          setAmendment({
                            newAmount: selectedLc.amount,
                            newExpiryDate: selectedLc.expiryDate,
                            justification: ''
                          });
                          setShowAmendModal(true);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-bold text-[10px] transition-colors"
                      >
                        Request Amendment
                      </button>
                    )}
                  </div>
                  {amendments.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 italic text-[11px]">No amendment applications logged for this LC.</div>
                  ) : (
                    <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                      {amendments.map(am => (
                        <div key={am.id} className="p-3.5 rounded-2xl border dark:border-slate-900 border-slate-200 dark:bg-slate-950/40 bg-slate-50 space-y-2 text-xs">
                          <div className="flex justify-between items-center font-bold">
                            <span className="text-brand-500 dark:text-brand-400">Amendment #{am.amendmentNumber}</span>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                              am.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-500' :
                              am.status === 'REJECTED' ? 'bg-rose-500/10 text-rose-500' :
                              'bg-amber-500/10 text-amber-500 animate-pulse'
                            }`}>{am.status}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-450 dark:text-slate-400">
                            <div>Previous Amount: <strong className="text-slate-700 dark:text-slate-200">USD {am.previousAmount.toLocaleString()}</strong></div>
                            <div>New Amount: <strong className="text-slate-700 dark:text-slate-200">USD {am.newAmount.toLocaleString()}</strong></div>
                            <div>Previous Expiry: <strong className="text-slate-700 dark:text-slate-200">{am.previousExpiryDate}</strong></div>
                            <div>New Expiry: <strong className="text-slate-700 dark:text-slate-200">{am.newExpiryDate}</strong></div>
                          </div>
                          {am.justification && (
                            <p className="text-[10px] italic text-slate-500 leading-normal border-t dark:border-slate-900/60 border-slate-200 pt-1.5">
                              "{am.justification}"
                            </p>
                          )}
                          <div className="text-[9px] text-slate-400 flex justify-between pt-1 border-t border-dashed dark:border-slate-900">
                            <span>Creator: {am.createdBy}</span>
                          </div>
                          {am.status === 'PENDING_APPROVAL' && (isOps || isRM || isAdmin) && (
                            <div className="flex gap-2 pt-2 border-t dark:border-slate-900 border-slate-200">
                              <button
                                onClick={() => handleProcessAmendment(am.id, 'APPROVED')}
                                className="flex-1 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px] transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleProcessAmendment(am.id, 'REJECTED')}
                                className="px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-bold text-[10px] transition-colors"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {detailTab === 'drawings' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex justify-between items-center border-b dark:border-slate-800 pb-2">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Presentation of Drawings</h4>
                    {isClient && selectedLc.status === 'ACTIVE' && (
                      <button
                        onClick={() => {
                          setDrawing({
                            drawingRef: 'DRW-' + Math.floor(Math.random() * 90000 + 10000),
                            amount: '',
                            documentsPresented: 'Bill of Lading, Commercial Invoice, Packing List',
                            portOfLoadingCheck: '',
                            discrepancyNotes: 'Standard Clean Presentation'
                          });
                          setDiscrepancyAlert(null);
                          setShowDrawModal(true);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-bold text-[10px] transition-colors"
                      >
                        Present Drawing
                      </button>
                    )}
                  </div>
                  {drawings.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 italic text-[11px]">No documentary drawing requests reported under this LC.</div>
                  ) : (
                    <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                      {drawings.map(dr => (
                        <div key={dr.id} className="p-3.5 rounded-2xl border dark:border-slate-900 border-slate-200 dark:bg-slate-950/40 bg-slate-50 space-y-2 text-xs">
                          <div className="flex justify-between items-center font-bold">
                            <span className="text-teal-500 dark:text-teal-400 font-mono text-[11px]">{dr.drawingRef}</span>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                              dr.status === 'PAID' ? 'bg-teal-500/10 text-teal-500' :
                              dr.status === 'REJECTED' ? 'bg-rose-500/10 text-rose-500' :
                              dr.status === 'DISCREPANT' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' :
                              'bg-amber-500/10 text-amber-500 animate-pulse'
                            }`}>{dr.status}</span>
                          </div>
                          <div className="flex justify-between text-[11px] font-bold border-b dark:border-slate-900 pb-1">
                            <span className="text-slate-400">Presentation Amount:</span>
                            <span className="text-slate-800 dark:text-slate-100">USD {dr.amount.toLocaleString()}</span>
                          </div>
                          {dr.documentsPresented && (
                            <div className="text-[10px] text-slate-500 leading-normal">
                              <strong className="text-slate-400">Covenants: </strong> {dr.documentsPresented}
                            </div>
                          )}
                          {dr.discrepancyNotes && (
                            <div className={`p-2 rounded-xl text-[10px] font-semibold mt-1.5 ${
                              dr.status === 'DISCREPANT' 
                                ? 'bg-rose-500/5 text-rose-500 border border-rose-500/10' 
                                : 'bg-slate-500/5 text-slate-400'
                            }`}>
                              <strong>Revisions / Discrepancy: </strong> {dr.discrepancyNotes}
                            </div>
                          )}
                          <div className="text-[9px] text-slate-400 flex justify-between pt-1 border-t border-dashed dark:border-slate-900">
                            <span>Presented Date: {dr.presentationDate}</span>
                          </div>
                          {(dr.status === 'PENDING_REVIEW' || dr.status === 'DISCREPANT') && (isOps || isAdmin) && (
                            <div className="flex gap-2 pt-2 border-t dark:border-slate-900 border-slate-200">
                              <button
                                onClick={() => handleProcessDrawing(dr.id, 'PAID')}
                                className="flex-1 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-600 text-white font-bold text-[10px] transition-colors"
                              >
                                Approve &amp; Pay
                              </button>
                              <button
                                onClick={() => handleProcessDrawing(dr.id, 'REJECTED')}
                                className="px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-bold text-[10px] transition-colors"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="py-20 text-center text-slate-400 text-xs font-semibold">
              Select a Letter of Credit item to inspect auditing records and workflow operations.
            </div>
          )}
        </div>

      </div>

      {/* ----------------------------------------------------
          MODALS SECTION
         ---------------------------------------------------- */}
      
      {/* 1. CREATE LC WIZARD MODAL */}
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
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-2xl rounded-3xl border dark:border-slate-800 border-slate-200 dark:bg-slate-900 bg-white shadow-2xl relative z-10 overflow-hidden"
            >
              {/* Header */}
              <div className="h-14 border-b dark:border-slate-800 border-slate-100 flex items-center justify-between px-6">
                <h4 className="font-extrabold text-sm flex items-center gap-2">
                  <FileText className="h-4.5 w-4.5 text-brand-500" /> Apply for Letter of Credit
                </h4>
                <button onClick={() => setShowCreateModal(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Wizard Steps indicator */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950/20 border-b dark:border-slate-850 flex items-center justify-center gap-10">
                {steps.map(s => (
                  <div key={s.num} className="flex items-center gap-2">
                    <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-black ${wizardStep >= s.num ? 'bg-brand-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
                      {s.num}
                    </span>
                    <span className={`text-[10px] uppercase font-bold tracking-wider ${wizardStep >= s.num ? 'text-brand-500' : 'text-slate-400'}`}>
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>

              <form onSubmit={handleCreateLc} className="p-6 space-y-4">
                
                {/* STEP 1: Applicant / Beneficiary details */}
                {wizardStep === 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Applicant Company</label>
                      <input 
                        type="text" 
                        value={newLc.applicantName} 
                        disabled 
                        className="w-full px-4 py-2.5 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-slate-950 bg-slate-50/50 text-xs font-semibold focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Beneficiary Merchant Partner</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Tokyo Steel Alloys Inc."
                        value={newLc.beneficiaryName}
                        onChange={(e) => setNewLc(prev => ({ ...prev, beneficiaryName: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-slate-950 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Tolerance Percentage (%)</label>
                      <input 
                        type="number" 
                        step="0.1"
                        value={newLc.tolerancePercentage}
                        onChange={(e) => setNewLc(prev => ({ ...prev, tolerancePercentage: parseFloat(e.target.value) }))}
                        className="w-full px-4 py-2.5 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-slate-950 bg-white text-xs focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">LC Credit Type</label>
                      <select 
                        value={newLc.lcType}
                        onChange={(e) => setNewLc(prev => ({ ...prev, lcType: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-slate-950 bg-white text-xs focus:outline-none"
                      >
                        <option value="SIGHT">SIGHT (Immediate Draft Payment)</option>
                        <option value="USANCE">USANCE (Maturity Term Draft)</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* STEP 2: Financial Facilities mapping */}
                {wizardStep === 2 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {facilities.length === 0 ? (
                      <div className="md:col-span-2 flex items-start gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                        <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-amber-500">No Active Letter of Credit Facility</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Your corporate client account has no active <strong>Letter of Credit Facility</strong>.
                            Please contact your <strong className="text-slate-700 dark:text-slate-200">Relationship Manager</strong> to set up an LC facility before you can apply.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Active Credit Facility Utilizer</label>
                        <select 
                          value={newLc.creditFacilityId}
                          onChange={(e) => {
                            const facId = parseInt(e.target.value);
                            const selectedFac = facilities.find(f => f.id === facId);
                            setNewLc(prev => ({ 
                              ...prev, 
                              creditFacilityId: facId,
                              applicantName: selectedFac?.client?.companyName || prev.applicantName
                            }));
                          }}
                          className="w-full px-4 py-2.5 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-slate-950 bg-white text-xs focus:outline-none"
                        >
                          {facilities.map(fac => (
                            <option key={fac.id} value={fac.id}>
                              {fac.client?.companyName} — {fac.facilityType.replace(/_/g, ' ')} (Available: USD {(fac.limitAmount - fac.utilizedAmount).toLocaleString()})
                            </option>
                          ))}
                        </select>
                        {newLc.applicantName && (
                          <p className="text-[10px] text-emerald-500 font-semibold mt-1 flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" /> Corporate Applicant: {newLc.applicantName}
                          </p>
                        )}
                      </div>
                    )}
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Amount (USD)</label>
                      <input 
                        type="number" 
                        placeholder="e.g. 1500000"
                        value={newLc.amount}
                        onChange={(e) => setNewLc(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                        className="w-full px-4 py-2.5 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-slate-950 bg-white text-xs focus:outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Currency</label>
                      <input 
                        type="text" 
                        value="USD" 
                        disabled 
                        className="w-full px-4 py-2.5 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-slate-950 bg-slate-50/50 text-xs font-semibold focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* STEP 3: Shipping & logistics ports */}
                {wizardStep === 3 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Port of Loading (Origin)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Port of Yokohama"
                        value={newLc.portOfLoading}
                        onChange={(e) => setNewLc(prev => ({ ...prev, portOfLoading: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-slate-950 bg-white text-xs focus:outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Port of Discharge (Destination)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Port of Los Angeles"
                        value={newLc.portOfDischarge}
                        onChange={(e) => setNewLc(prev => ({ ...prev, portOfDischarge: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-slate-950 bg-white text-xs focus:outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Latest Shipment Date</label>
                      <input 
                        type="date" 
                        value={newLc.latestShipmentDate}
                        onChange={(e) => setNewLc(prev => ({ ...prev, latestShipmentDate: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-slate-950 bg-white text-xs focus:outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">LC Expiry Maturity Date</label>
                      <input 
                        type="date" 
                        value={newLc.expiryDate}
                        onChange={(e) => setNewLc(prev => ({ ...prev, expiryDate: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-slate-950 bg-white text-xs focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Footers */}
                <div className="border-t dark:border-slate-800 pt-4 flex justify-between items-center text-xs">
                  {wizardStep > 1 ? (
                    <button 
                      type="button" 
                      onClick={() => setWizardStep(prev => prev - 1)}
                      className="px-4 py-2 rounded-xl border dark:border-slate-800 border-slate-200 hover:bg-slate-50 dark:hover:bg-slate-950 font-bold transition-colors"
                    >
                      Back
                    </button>
                  ) : (
                    <div></div>
                  )}

                  {wizardStep < 3 ? (
                    <button 
                      type="button" 
                      onClick={() => setWizardStep(prev => prev + 1)}
                      className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold transition-colors flex items-center gap-1.5"
                    >
                      Continue <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  ) : (
                    <button 
                      type="submit" 
                      className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-colors"
                    >
                      Submit Application (Draft)
                    </button>
                  )}
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. REQUEST AMENDMENT MODAL */}
      <AnimatePresence>
        {showAmendModal && selectedLc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAmendModal(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            ></motion.div>
            
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="w-full max-w-md rounded-3xl border dark:border-slate-800 border-slate-200 dark:bg-slate-900 bg-white shadow-2xl relative z-10 p-6 space-y-4"
            >
              <div className="flex justify-between items-center border-b dark:border-slate-800 pb-3">
                <h4 className="font-extrabold text-sm">Amend LC: {selectedLc.lcNumber}</h4>
                <button onClick={() => setShowAmendModal(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              <form onSubmit={handleAmendSubmit} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-400">Previous registered amount: USD {selectedLc.amount.toLocaleString()}</label>
                  <input
                    type="number"
                    placeholder="New requested amount"
                    value={amendment.newAmount}
                    onChange={(e) => setAmendment(prev => ({ ...prev, newAmount: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-slate-950 bg-white text-xs focus:outline-none"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-400">Previous expiry: {selectedLc.expiryDate}</label>
                  <input
                    type="date"
                    value={amendment.newExpiryDate}
                    onChange={(e) => setAmendment(prev => ({ ...prev, newExpiryDate: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-slate-950 bg-white text-xs focus:outline-none"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-400">Justification / Order Revision Log</label>
                  <textarea
                    rows={3}
                    placeholder="Provide justification notes..."
                    value={amendment.justification}
                    onChange={(e) => setAmendment(prev => ({ ...prev, justification: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-slate-950 bg-white text-xs focus:outline-none"
                    required
                  ></textarea>
                </div>

                <button type="submit" className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold transition-all">
                  Submit Amendment (Maker check required)
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. DRAWING PRESENTATION / DISCREPANCY CHECK MODAL */}
      <AnimatePresence>
        {showDrawModal && selectedLc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDrawModal(false)}
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
                  <Ship className="h-4.5 w-4.5 text-brand-500" /> Presentation of Drawings &amp; Documents
                </h4>
                <button onClick={() => setShowDrawModal(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              <form onSubmit={handleDrawSubmit} className="space-y-4 text-xs">
                
                {discrepancyAlert && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex gap-2">
                    <AlertTriangle className="h-4.5 w-4.5 flex-shrink-0" />
                    <p>{discrepancyAlert}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400">Drawing Ref Reference</label>
                    <input
                      type="text"
                      disabled
                      value={drawing.drawingRef}
                      className="w-full px-4 py-2.5 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-slate-950 bg-slate-50/50 font-mono text-xs focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400">Invoice Amount (USD)</label>
                    <input
                      type="number"
                      placeholder="Amount to draw"
                      value={drawing.amount}
                      onChange={(e) => setDrawing(prev => ({ ...prev, amount: e.target.value }))}
                      onBlur={runDiscrepancyScreening}
                      className="w-full px-4 py-2.5 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-slate-950 bg-white text-xs focus:outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400">Port of Loading check</label>
                    <input
                      type="text"
                      placeholder="Dispatched Port (e.g Yokohama)"
                      value={drawing.portOfLoadingCheck}
                      onChange={(e) => setDrawing(prev => ({ ...prev, portOfLoadingCheck: e.target.value }))}
                      onBlur={runDiscrepancyScreening}
                      className="w-full px-4 py-2.5 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-slate-950 bg-white text-xs focus:outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400">Registered LC Port</label>
                    <input
                      type="text"
                      disabled
                      value={selectedLc.portOfLoading}
                      className="w-full px-4 py-2.5 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-slate-950 bg-slate-50/50 text-xs font-semibold focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-400">Presented Documents Checklist</label>
                  <input
                    type="text"
                    value={drawing.documentsPresented}
                    onChange={(e) => setDrawing(prev => ({ ...prev, documentsPresented: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-slate-950 bg-white text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-400">Screening Discrepancy Log (Auto-evaluated)</label>
                  <input
                    type="text"
                    disabled
                    value={drawing.discrepancyNotes}
                    className="w-full px-4 py-2.5 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-slate-950 bg-slate-50/50 text-xs font-semibold focus:outline-none"
                  />
                </div>

                <button type="submit" className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold transition-all flex items-center justify-center gap-2">
                  <ShieldCheck className="h-4.5 w-4.5" /> Present Drawing to Operations Desk
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default LCManagement;
