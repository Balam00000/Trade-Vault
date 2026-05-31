import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { 
  BarChart3, FileSpreadsheet, Printer, RefreshCw, Landmark,
  TrendingUp, TrendingDown, Percent, ArrowUpRight, DollarSign
} from 'lucide-react';

const Reports = () => {
  const { user } = useAuth();
  
  // Data State
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/analytics/summary');
      setStats(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  // ----------------------------------------------------
  // CHART DATA
  // ----------------------------------------------------
  const facilityChartData = [
    { name: 'Acme LC Limit', limit: 20.0, utilized: 4.5 },
    { name: 'Acme Guarantee', limit: 10.0, utilized: 2.0 },
    { name: 'Acme Revolving', limit: 20.0, utilized: 12.0 },
    { name: 'Global LC Limit', limit: 15.0, utilized: 3.2 },
    { name: 'Nexus LC Limit', limit: 50.0, utilized: 24.0 },
  ];

  const regionalData = [
    { country: 'United States', amount: 30.5 },
    { country: 'Singapore', amount: 24.0 },
    { country: 'United Kingdom', amount: 15.0 },
    { country: 'Japan', amount: 8.5 },
    { country: 'Germany', amount: 3.0 },
  ];

  const sightUsanceData = [
    { name: 'Sight Draft (Sight)', value: 65, color: '#4a6be9' },
    { name: 'Term Usance (Usance)', value: 35, color: '#f59e0b' },
  ];

  // Functional Exporter - CSV
  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Facility Name,Limit Amount (Millions),Utilized Amount (Millions),Utilization Percentage\n"
      + facilityChartData.map(e => `"${e.name}",${e.limit},${e.utilized},${((e.utilized/e.limit)*100).toFixed(1)}%`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `tradevault_exposure_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Functional Exporter - Browser Print
  const handlePrint = () => {
    window.print();
  };

  const isDark = document.body.classList.contains('dark');

  return (
    <div className="space-y-6 print:bg-white print:text-black">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b dark:border-slate-900 pb-4 print:hidden">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Trade Analytics &amp; Reports</h1>
          <p className="text-xs text-slate-400 mt-1">Export exposure trends, credit facility metrics, and risk limits distributions</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchStats} className="p-2.5 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-slate-950/20 bg-white hover:bg-slate-100 transition-colors">
            <RefreshCw className="h-4 w-4" />
          </button>
          <button 
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs transition-all flex items-center gap-2"
          >
            <FileSpreadsheet className="h-4 w-4" /> Export CSV Ledger
          </button>
          <button 
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-slate-950/20 bg-white hover:bg-slate-100 font-bold text-xs transition-all flex items-center gap-2"
          >
            <Printer className="h-4 w-4" /> Print Report Card
          </button>
        </div>
      </div>

      {/* METRICS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card-light dark:glass-card-dark p-6 rounded-3xl space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Credit Facility Pool</span>
          <h3 className="text-2xl font-black">{formatCurrency(stats?.totalLimit)}</h3>
          <div className="text-xs text-slate-400">Onboarded Corporate Credit lines</div>
        </div>
        <div className="glass-card-light dark:glass-card-dark p-6 rounded-3xl space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400">Active Utilized Exposure</span>
          <h3 className="text-2xl font-black text-brand-500 dark:text-brand-400">{formatCurrency(stats?.totalUtilized)}</h3>
          <div className="text-xs text-slate-400">Utilized limits via Active LCs/BGs</div>
        </div>
        <div className="glass-card-light dark:glass-card-dark p-6 rounded-3xl space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400">Global Utilization Rate</span>
          <h3 className="text-2xl font-black text-emerald-500">{stats?.utilizationRate.toFixed(2)}%</h3>
          <div className="text-xs text-slate-400">Available remaining capacity: {(100 - (stats?.utilizationRate || 0)).toFixed(2)}%</div>
        </div>
      </div>

      {/* CHARTS GRAPHICS BLOCK */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Credit Limits vs Utilization */}
        <div className="glass-card-light dark:glass-card-dark p-6 rounded-3xl space-y-4">
          <div>
            <h4 className="font-bold text-base">Corporate Credit Facility utilization</h4>
            <p className="text-xs text-slate-400">Limits vs Active Utilized value (in Millions USD)</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={facilityChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#e2e8f0'} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip />
                <Legend verticalAlign="top" height={36} />
                <Bar dataKey="limit" fill="#4a6be9" name="Limit Pool" radius={[4, 4, 0, 0]} />
                <Bar dataKey="utilized" fill="#10b981" name="Utilized Amount" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Regional Risk Heatmap */}
        <div className="glass-card-light dark:glass-card-dark p-6 rounded-3xl space-y-4">
          <div>
            <h4 className="font-bold text-base">Regional Exposure Distribution</h4>
            <p className="text-xs text-slate-400">Top countries by active utilize volume (in Millions USD)</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionalData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#e2e8f0'} />
                <XAxis type="number" stroke="#94a3b8" fontSize={10} />
                <YAxis dataKey="country" type="category" stroke="#94a3b8" fontSize={10} width={80} />
                <Tooltip />
                <Bar dataKey="amount" fill="#f59e0b" name="Exposure" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Sight vs Usance distribution */}
        <div className="glass-card-light dark:glass-card-dark p-6 rounded-3xl space-y-4 lg:col-span-2">
          <div className="flex justify-between items-center border-b dark:border-slate-800 pb-3">
            <div>
              <h4 className="font-bold text-base">LC Drafting Structure</h4>
              <p className="text-xs text-slate-400">Draft distribution between sight drafts and term usance credit structures</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-around gap-6">
            <div className="h-52 w-52 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sightUsanceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {sightUsanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active LCs</span>
                <span className="text-xl font-black">Sight Lead</span>
              </div>
            </div>

            <div className="space-y-4 max-w-sm">
              <div className="p-4 rounded-2xl dark:bg-slate-900/40 bg-slate-50 border dark:border-slate-800 border-slate-100 text-xs leading-relaxed">
                <h5 className="font-bold text-slate-700 dark:text-slate-200 mb-1 flex items-center gap-1">
                  <Percent className="h-4 w-4 text-brand-500" /> Sight Draft Dominance (65%)
                </h5>
                <p className="text-slate-400">
                  Sight drafts dominate the export portfolio. Corporate clients prefer immediate payment against shipping presentations to maximize working capital liquidity.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Reports;
