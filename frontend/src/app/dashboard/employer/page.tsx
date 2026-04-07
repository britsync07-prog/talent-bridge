'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

const EmployerDashboard = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('jobs');
  const [data, setData] = useState<any>({
    jobs: [],
    contracts: [],
    invoices: [],
    activityLogs: [],
    featuredEngineers: [],
    savedCandidates: [
      { id: '1', fullName: 'Jane Doe', skills: 'Python, PyTorch', country: 'Germany' },
      { id: '2', fullName: 'John Smith', skills: 'React, Node.js', country: 'Canada' }
    ],
    upcomingInterviews: [
      { id: '1', candidate: 'Jane Doe', time: 'Tomorrow at 10:00 AM', status: 'CONFIRMED' }
    ],
    draftJobs: [
      { id: 'd1', title: 'Senior ML Engineer', savedAt: '2 days ago' }
    ]
  });
  const [fetching, setFetching] = useState(true);

  const hasFetched = React.useRef(false);

  useEffect(() => {
    if (loading) return;

    if (!user || user.role !== 'EMPLOYER') {
      router.push('/login');
    } else if (!hasFetched.current) {
      hasFetched.current = true;
      fetchDashboardData();
    }
  }, [user?.id, user?.role, loading, router]);

  const fetchDashboardData = async () => {
    setFetching(true);
    try {
      const [jobsRes, contractsRes, invoicesRes, engineersRes] = await Promise.all([
        api.get('/jobs/my-jobs'),
        api.get('/contracts'),
        api.get('/payments/invoices'),
        api.get('/engineers')
      ]);
      setData((prev: any) => ({
        ...prev,
        jobs: jobsRes.data || [],
        contracts: contractsRes.data || [],
        invoices: invoicesRes.data || [],
        featuredEngineers: (engineersRes.data || []).filter((e: any) => e.isFeatured).slice(0, 4)
      }));
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setFetching(false);
    }
  };

  const handleWithdrawInterest = async (interestId: string) => {
    if (!confirm('Are you sure you want to withdraw this interest?')) return;
    try {
      await api.delete(`/jobs/interest/${interestId}`);
      fetchDashboardData();
    } catch (err) {
      alert('Failed to withdraw interest');
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job posting? This will also remove all expressed interests for this job.')) return;
    try {
      await api.delete(`/jobs/${jobId}`);
      fetchDashboardData();
    } catch (err) {
      alert('Failed to delete job');
    }
  };

  const handleToggleJobStatus = async (jobId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'OPEN' ? 'CLOSED' : 'OPEN';
    try {
      await api.patch(`/jobs/${jobId}`, { status: newStatus });
      fetchDashboardData();
    } catch (err) {
      alert(`Failed to mark job as ${newStatus}`);
    }
  };

  if (loading || !user || fetching) return (
    <div className="min-h-screen bg-[#E7E6E2] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-[#32312D]/10 border-t-[#3A3F5F] rounded-full animate-spin"></div>
        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#3A3F5F]">Accessing Employer Gateway...</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#E7E6E2] text-[#32312D] flex flex-col font-sans selection:bg-[#3A3F5F] selection:text-white">

      
      <main className="max-w-[1600px] mx-auto w-full px-6 py-12 flex-1">
        {/* Header Section */}
        <div className="relative mb-12 p-10 rounded-[40px] bg-white border border-[#32312D]/10 shadow-sm overflow-hidden group">
            <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 bg-[#E7E6E2] border border-[#32312D]/10 rounded-full text-[10px] font-black uppercase tracking-widest text-[#3A3F5F]">Corporate Portal v4.0</span>
                        <span className="w-2 h-2 rounded-full bg-[#3A3F5F] animate-pulse"></span>
                    </div>
                    <h1 className="text-5xl font-black mb-3 tracking-tighter text-[#32312D] uppercase">
                        Employer Dashboard
                    </h1>
                    <p className="text-slate-500 font-medium text-lg uppercase tracking-widest text-xs">Managing workforce & AI roadmap</p>
                </div>

                <div className="flex flex-wrap gap-4">
                    <div className="bg-[#E7E6E2]/50 px-8 py-4 rounded-2xl border border-[#32312D]/10 min-w-[200px]">
                        <div className="text-[8px] font-black text-[#3A3F5F]/60 uppercase tracking-[0.2em] mb-1">Monthly Resource Burn</div>
                        <div className="text-2xl font-black text-[#3A3F5F]">${data.contracts.reduce((acc: number, c: any) => acc + (c.salary || 0), 0).toLocaleString()}</div>
                    </div>
                    <Link href="/dashboard/employer/jobs/new" className="bg-[#3A3F5F] text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#3A3F5F]/90 shadow-lg shadow-[#3A3F5F]/20 transition-all flex items-center">
                        + Deploy Job Posting
                    </Link>
                </div>
            </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            {[
                { label: 'Active Resources', value: data.contracts.length, icon: '💎', trend: 'Global' },
                { label: 'Open Requirements', value: data.jobs.filter((j: any) => j.status === 'OPEN').length, icon: '📜', trend: 'Active' },
                { label: 'Talent Interests', value: data.jobs.reduce((acc: number, j: any) => acc + (j.interests?.length || 0), 0), icon: '📡', trend: 'Incoming' },
                { label: 'CapEx Invoiced', value: `$${data.invoices.reduce((acc: number, i: any) => acc + i.amount, 0).toLocaleString()}`, icon: '💰', trend: 'Secured' }
            ].map((stat, i) => (
                <div key={i} className="group relative p-8 rounded-[32px] bg-white border border-[#32312D]/5 hover:border-[#32312D]/20 transition-all duration-500 shadow-sm hover:shadow-md">
                    <div className="flex justify-between items-center mb-6">
                        <span className="w-10 h-10 rounded-xl bg-[#E7E6E2] flex items-center justify-center text-xl border border-[#32312D]/10">{stat.icon}</span>
                        <span className="text-[10px] font-black text-[#3A3F5F] bg-[#E7E6E2] px-2 py-1 rounded-lg uppercase tracking-tighter">{stat.trend}</span>
                    </div>
                    <div className="text-3xl font-black text-[#32312D] mb-1 tracking-tight">{stat.value}</div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</div>
                </div>
            ))}
        </div>

        {/* Featured Talent Section */}
        {data.featuredEngineers.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black uppercase tracking-tight text-[#32312D]">Top Vetted Neural Nodes</h2>
              <div className="h-px flex-1 mx-8 bg-[#32312D]/10"></div>
              <Link href="/engineers" className="text-[#3A3F5F] text-[10px] font-black uppercase tracking-widest hover:underline decoration-2 underline-offset-4 transition-all">View Full Network →</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {data.featuredEngineers.map((eng: any) => (
                <Link href={`/engineers/${eng.id}`} key={eng.id} className="p-px rounded-[32px] bg-[#E7E6E2] hover:bg-[#E7E6E2] transition-all duration-500">
                  <div className="bg-white p-8 rounded-[31px] relative overflow-hidden group border border-[#32312D]/10 shadow-sm hover:shadow-xl">
                    <div className="absolute top-0 right-0 bg-[#3A3F5F] text-white text-[8px] font-black px-4 py-1.5 uppercase tracking-[0.2em] rounded-bl-2xl">Elite</div>
                    <div className="flex items-center gap-5 mb-6">
                      <div className="w-14 h-14 bg-[#E7E6E2] rounded-2xl flex items-center justify-center text-xl font-bold text-[#3A3F5F] border border-[#32312D]/10 group-hover:bg-[#3A3F5F] group-hover:text-white transition-all">
                        {eng.fullName ? eng.fullName.charAt(0) : 'E'}
                      </div>
                      <div>
                        <div className="font-black text-[#32312D] text-lg tracking-tight line-clamp-1 uppercase">{eng.fullName}</div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{eng.country}</div>
                      </div>
                    </div>
                    <div className="text-[10px] font-black text-[#3A3F5F]/80 mb-6 line-clamp-2 h-8 uppercase tracking-tighter leading-tight border-l-2 border-[#32312D]/10 pl-4">
                      {eng.aiSpecializations || eng.skills}
                    </div>
                    <div className="flex justify-between items-center pt-6 border-t border-[#E7E6E2]">
                      <div className="text-sm font-black text-[#32312D]">${eng.hourlyRate}<span className="text-[10px] text-slate-400">/HR</span></div>
                      <div className="text-[10px] font-black text-[#3A3F5F] uppercase tracking-widest bg-[#E7E6E2] px-2 py-1 rounded-lg">Available</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Tabs & Content */}
        <div className="flex flex-col lg:flex-row gap-12">
            <aside className="w-full lg:w-64 space-y-2">
                {['jobs', 'interests', 'team', 'billing', 'analytics', 'saved', 'profile'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.15em] transition-all group ${
                            activeTab === tab 
                            ? 'bg-[#3A3F5F] text-white shadow-lg shadow-[#3A3F5F]/20' 
                            : 'text-slate-400 hover:text-[#32312D] hover:bg-[#E7E6E2]'
                        }`}
                    >
                        {tab}
                        <span className={`w-1.5 h-1.5 rounded-full transition-all ${activeTab === tab ? 'bg-white' : 'bg-transparent group-hover:bg-[#E7E6E2]'}`}></span>
                    </button>
                ))}
            </aside>

            <div className="flex-1 min-w-0">
                {activeTab === 'jobs' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black uppercase tracking-tight text-[#32312D]">Deployment Registry</h2>
                            <div className="h-px flex-1 mx-8 bg-[#32312D]/10"></div>
                        </div>
                        
                        {data.jobs.length === 0 ? (
                            <div className="p-20 rounded-[40px] border border-dashed border-[#32312D]/20 bg-[#E7E6E2]/20 text-center">
                                <div className="text-4xl mb-4 opacity-40">🕳️</div>
                                <div className="text-slate-400 font-black uppercase text-[10px] tracking-widest mb-6">No deployment signals active</div>
                                <Link href="/dashboard/employer/jobs/new" className="text-[#3A3F5F] font-black text-[10px] uppercase tracking-widest underline decoration-2 underline-offset-8">Initiate First Posting →</Link>
                            </div>
                        ) : (
                            <div className="grid gap-6">
                                {data.jobs.map((job: any) => (
                                    <div key={job.id} className="p-px rounded-[32px] bg-[#E7E6E2] hover:bg-[#E7E6E2] transition-all duration-500">
                                        <div className="bg-white p-8 rounded-[31px] flex flex-col md:flex-row justify-between items-center gap-8 shadow-sm border border-[#32312D]/10">
                                            <div className="flex-1 text-left w-full">
                                                <div className="flex items-center gap-4 mb-3">
                                                    <h3 className="text-2xl font-black text-[#32312D] tracking-tight uppercase">{job.title}</h3>
                                                    <span className={`text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${job.status === 'OPEN' ? 'bg-[#E7E6E2] text-[#3A3F5F] border border-[#32312D]/10' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
                                                        {job.status}
                                                    </span>
                                                </div>
                                                <p className="text-slate-500 text-sm font-medium mb-6 line-clamp-1 uppercase tracking-tight">{job.description}</p>
                                                <div className="flex gap-6">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quota:</span>
                                                        <span className="text-[10px] font-black text-[#32312D] uppercase tracking-widest">${job.maxBudget}/HR</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cycle:</span>
                                                        <span className="text-[10px] font-black text-[#32312D] uppercase tracking-widest">{job.duration}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-3 shrink-0">
                                                <button 
                                                    onClick={() => handleToggleJobStatus(job.id, job.status)}
                                                    className="bg-white border border-slate-200 text-slate-400 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:text-[#32312D] hover:border-[#32312D] transition-all"
                                                >
                                                    {job.status === 'OPEN' ? 'Offline' : 'Online'}
                                                </button>
                                                <button onClick={() => handleDeleteJob(job.id)} className="p-4 bg-red-50 text-red-500 rounded-2xl border border-red-100 hover:bg-red-500 hover:text-white transition-all">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'interests' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black uppercase tracking-tight text-[#32312D]">Active Neural Links</h2>
                            <div className="bg-[#E7E6E2] border border-[#32312D]/10 p-4 rounded-2xl flex items-center gap-6 shadow-sm">
                                <div>
                                    <div className="text-[8px] font-black text-[#3A3F5F] uppercase tracking-widest mb-1">Next Uplink Session</div>
                                    <div className="text-xs font-bold text-[#32312D] uppercase">{data.upcomingInterviews[0]?.time}</div>
                                </div>
                                <button className="bg-[#3A3F5F] text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#3A3F5F]/90 transition-all shadow-md">Link Call</button>
                            </div>
                        </div>
                        
                        {data.jobs.every((j: any) => (j.interests?.length || 0) === 0) ? (
                            <div className="p-20 rounded-[40px] border border-dashed border-[#32312D]/20 bg-[#E7E6E2]/20 text-center">
                                <div className="text-4xl mb-4 opacity-40">🎯</div>
                                <h3 className="text-xl font-black text-[#32312D] mb-2 uppercase tracking-tight">No Interest Signals</h3>
                                <p className="text-slate-500 font-medium italic mb-8 max-w-sm mx-auto">Initiate Smart Match on your active nodes to broadcast interest to top AI engineers.</p>
                            </div>
                        ) : (
                            <div className="grid gap-6">
                                {data.jobs.map((job: any) => (
                                    job.interests?.map((interest: any) => (
                                        <div key={interest.id} className="bg-white p-8 rounded-[32px] border border-[#32312D]/5 flex flex-col md:flex-row justify-between items-center gap-8 group hover:border-[#32312D]/20 transition-all shadow-sm hover:shadow-md">
                                            <div className="flex items-center gap-6">
                                                <div className="w-16 h-16 bg-[#E7E6E2] rounded-2xl flex items-center justify-center text-2xl border border-[#32312D]/10 text-[#3A3F5F]">🤖</div>
                                                <div className="text-left">
                                                    <h3 className="text-2xl font-black text-[#32312D] tracking-tight uppercase">{interest.engineer.fullName}</h3>
                                                    <div className="flex gap-4 items-center mt-2">
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol: {job.title}</span>
                                                        <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${interest.type === 'LEASE' ? 'bg-[#E7E6E2] text-[#3A3F5F]' : 'bg-slate-50 text-slate-600'}`}>
                                                            {interest.type}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                {interest.status === 'REJECTED' ? (
                                                    <div className="flex flex-col items-end gap-1">
                                                        <span className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-red-50 text-red-600 border border-red-200">
                                                            ✕ Admin Rejected
                                                        </span>
                                                        <span className="text-[8px] font-black text-red-400 uppercase tracking-widest">Meeting request was denied</span>
                                                    </div>
                                                ) : (
                                                <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                                                    interest.status === 'CALLED' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' :
                                                    interest.scheduledAt ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                                    'bg-yellow-50 text-yellow-600 border border-yellow-100'
                                                }`}>
                                                    {interest.status === 'CALLED' ? 'Meeting Approved ✓' :
                                                     interest.scheduledAt ? 'Pending Admin Approval' :
                                                     'Waiting for Command'}
                                                </span>
                                                )}
                                                <button 
                                                    onClick={() => handleWithdrawInterest(interest.id)}
                                                    className="p-4 bg-red-50 text-red-300 hover:text-red-500 hover:bg-red-100 rounded-2xl transition-all"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'team' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                        <h2 className="text-2xl font-black uppercase tracking-tight mb-8 text-[#32312D]">Deployed Workforce</h2>
                        {data.contracts.length === 0 ? (
                            <div className="p-20 rounded-[40px] border border-dashed border-[#32312D]/20 bg-[#E7E6E2]/20 text-center text-slate-400 font-black uppercase text-[10px] tracking-widest">No active resource links established</div>
                        ) : (
                            <div className="grid gap-6">
                                {data.contracts.map((contract: any) => (
                                    <div key={contract.id} className="bg-white rounded-[32px] border border-[#32312D]/5 overflow-hidden group hover:border-[#32312D]/20 transition-all shadow-sm hover:shadow-md">
                                        <div className="p-8 flex flex-col md:flex-row justify-between items-center gap-8">
                                            <div className="flex items-center gap-8">
                                                <div className="w-20 h-20 bg-[#E7E6E2] rounded-2xl flex items-center justify-center text-3xl border border-[#32312D]/10 text-[#3A3F5F]">👤</div>
                                                <div className="text-left">
                                                    <h3 className="text-2xl font-black text-[#32312D] tracking-tight uppercase">{contract.engineer.fullName}</h3>
                                                    <div className="flex items-center gap-4 mt-2">
                                                        <span className="text-[10px] font-black text-[#3A3F5F] uppercase tracking-[0.2em]">{contract.status}</span>
                                                        <span className="text-slate-400 text-xs font-black uppercase tracking-widest">★ 5.0 Rating</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-4">
                                                <Link href={`/dashboard/employer/contracts/${contract.id}`} className="bg-slate-50 border border-slate-200 text-slate-600 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all">Manage Node</Link>
                                                <button 
                                                    onClick={async () => {
                                                        if(confirm('Generate monthly invoice for this contract?')) {
                                                            await api.post('/payments/generate-invoice', { contractId: contract.id });
                                                            fetchDashboardData();
                                                            setActiveTab('billing');
                                                        }
                                                    }}
                                                    className="bg-[#3A3F5F] text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#3A3F5F]/90 shadow-lg shadow-[#3A3F5F]/20 transition-all"
                                                >
                                                    Invoice Resource
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'billing' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                        <h2 className="text-2xl font-black uppercase tracking-tight mb-8 text-[#32312D]">Fiscal Ledger</h2>
                        {data.invoices.length === 0 ? (
                            <div className="p-20 rounded-[40px] border border-dashed border-[#32312D]/20 bg-[#E7E6E2]/20 text-center text-slate-400 font-black uppercase text-[10px] tracking-widest">No transaction history recorded</div>
                        ) : (
                            <div className="bg-white rounded-[32px] border border-[#32312D]/5 overflow-hidden shadow-sm">
                                <table className="w-full text-left">
                                    <thead className="bg-[#E7E6E2]/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                        <tr>
                                            <th className="px-8 py-6">Ledger ID</th>
                                            <th className="px-8 py-6">Resource Node</th>
                                            <th className="px-8 py-6 text-right">Debit</th>
                                            <th className="px-8 py-6">Verification</th>
                                            <th className="px-8 py-6 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#E7E6E2]">
                                        {data.invoices.map((inv: any) => (
                                            <tr key={inv.id} className="group hover:bg-[#E7E6E2]/30 transition-colors">
                                                <td className="px-8 py-6 font-mono text-[10px] text-slate-400 tracking-tighter">#{inv.id.slice(0,12)}</td>
                                                <td className="px-8 py-6 font-black text-[#32312D] text-xs tracking-tight uppercase">{inv.contract.engineer.fullName}</td>
                                                <td className="px-8 py-6 text-right font-black text-[#32312D] text-sm">${inv.amount.toLocaleString()}</td>
                                                <td className="px-8 py-6">
                                                    <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${inv.status === 'PAID' ? 'bg-[#E7E6E2] text-[#3A3F5F] border border-[#32312D]/10' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                                                        {inv.status}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    {inv.status === 'UNPAID' && (
                                                        <button 
                                                            onClick={async () => {
                                                                const { data } = await api.post(`/payments/create-checkout-session/${inv.id}`);
                                                                window.location.href = data.url;
                                                            }}
                                                            className="bg-[#3A3F5F] text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#3A3F5F]/90 transition-all"
                                                        >
                                                            Clear Debt
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'analytics' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                        <h2 className="text-2xl font-black uppercase tracking-tight mb-8 text-[#32312D]">Performance Metrics</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-10 rounded-[40px] border border-[#32312D]/5 shadow-sm">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Avg Acquisition Time</div>
                                <div className="text-5xl font-black text-[#32312D] tracking-tighter">12 <span className="text-lg text-slate-400">DAYS</span></div>
                                <div className="mt-6 text-[10px] font-black text-[#3A3F5F] uppercase tracking-widest bg-[#E7E6E2] px-3 py-1.5 rounded-xl inline-block">↑ 15% VS LAST CYCLE</div>
                            </div>
                            <div className="bg-white p-10 rounded-[40px] border border-[#32312D]/5 shadow-sm">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Acceptance Delta</div>
                                <div className="text-5xl font-black text-[#3A3F5F] tracking-tighter">92%</div>
                                <div className="mt-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">INDUSTRY STD: 74%</div>
                            </div>
                            <div className="bg-white p-10 rounded-[40px] border border-[#32312D]/5 shadow-sm">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">CPU Cost per Hire</div>
                                <div className="text-5xl font-black text-[#32312D] tracking-tighter">$1.4k</div>
                                <div className="mt-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">EXCL PLATFORM TAX</div>
                            </div>
                        </div>
                        <div className="bg-white p-10 rounded-[40px] border border-[#32312D]/5 shadow-sm">
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 text-center">Talent Pipeline Throughput</div>
                            <div className="flex flex-col md:flex-row items-center gap-2 h-auto md:h-16">
                               <div className="w-full md:flex-1 bg-[#3A3F5F] h-16 md:h-full rounded-2xl md:rounded-l-2xl md:rounded-r-none flex items-center justify-center text-[10px] font-black text-white uppercase shadow-lg shadow-[#3A3F5F]/20">Interests (100%)</div>
                               <div className="w-full md:flex-[0.6] bg-slate-100 h-16 md:h-full flex items-center justify-center text-[10px] font-black text-slate-600 uppercase">Interviews (60%)</div>
                               <div className="w-full md:flex-[0.2] bg-slate-200 h-16 md:h-full rounded-2xl md:rounded-r-2xl md:rounded-l-none flex items-center justify-center text-[10px] font-black text-slate-400 uppercase">Hired (20%)</div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'saved' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                        <h2 className="text-2xl font-black uppercase tracking-tight mb-8 text-[#32312D]">Shortlisted Neural Nodes</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {data.savedCandidates.map((cand: any) => (
                                <div key={cand.id} className="bg-white p-8 rounded-[32px] border border-[#32312D]/5 flex justify-between items-center hover:border-[#32312D]/20 transition-all group shadow-sm">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 bg-[#E7E6E2] rounded-2xl flex items-center justify-center text-2xl group-hover:bg-[#3A3F5F] group-hover:text-white transition-all text-[#3A3F5F]">👤</div>
                                        <div className="text-left">
                                            <div className="font-black text-[#32312D] text-lg tracking-tight uppercase">{cand.fullName}</div>
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{cand.country} • {cand.skills}</div>
                                        </div>
                                    </div>
                                    <button className="text-[#3A3F5F]/30 hover:text-[#3A3F5F] transition-colors p-4">
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'profile' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-12">
                        <div className="bg-white p-10 rounded-[40px] border border-[#32312D]/5 shadow-sm">
                            <h2 className="text-3xl font-black mb-10 tracking-tight uppercase text-[#32312D]">Corporate Metadata</h2>
                            <form className="space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-8">
                                        <div className="space-y-3 text-left">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Entity Name</label>
                                            <input type="text" className="w-full px-6 py-4 bg-[#E7E6E2]/20 border border-[#32312D]/10 rounded-2xl outline-none focus:border-[#3A3F5F] transition-all font-bold text-[#32312D] uppercase text-xs tracking-widest" defaultValue="Acme Corp" />
                                        </div>
                                        <div className="space-y-3 text-left">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Neural Link (URL)</label>
                                            <input type="text" className="w-full px-6 py-4 bg-[#E7E6E2]/20 border border-[#32312D]/10 rounded-2xl outline-none focus:border-[#3A3F5F] transition-all font-bold text-[#32312D] text-xs tracking-widest" defaultValue="https://acme.ai" />
                                        </div>
                                        <div className="space-y-3 text-left">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">HQ Node Location</label>
                                            <input type="text" className="w-full px-6 py-4 bg-[#E7E6E2]/20 border border-[#32312D]/10 rounded-2xl outline-none focus:border-[#3A3F5F] transition-all font-bold text-[#32312D] uppercase text-xs tracking-widest" defaultValue="San Francisco, CA" />
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="space-y-3 text-left">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Operational Bio</label>
                                            <textarea className="w-full px-6 py-4 bg-[#E7E6E2]/20 border border-[#32312D]/10 rounded-2xl outline-none focus:border-[#3A3F5F] transition-all font-medium text-slate-600 h-[230px] resize-none" defaultValue="Building the future of AI automation."></textarea>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-10 border-t border-[#E7E6E2]">
                                    <button type="button" className="w-full md:w-auto bg-[#3A3F5F] text-white px-20 py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] hover:bg-[#3A3F5F]/90 shadow-lg shadow-[#3A3F5F]/20 transition-all">Overwrite Entity Metadata</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </main>

    </div>
  );
};

export default EmployerDashboard;
