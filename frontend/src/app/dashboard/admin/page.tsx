'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api, { getFileUrl } from '@/lib/api';
import LogoutButton from '@/components/LogoutButton';

const AdminDashboard = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'stats' | 'engineers' | 'employers' | 'logs' | 'interests' | 'health' | 'disputes' | 'waitlist' | 'settings' | 'jobs'>('stats');
  const [stats, setStats] = useState({
    totalEngineers: 0,
    totalEmployers: 0,
    totalJobs: 0,
    activeContracts: 0,
    totalRevenue: 0,
    payoutHistory: [],
    securityAlerts: [] as { id: number; type: string; message: string; time: string }[],
    referralData: { total: 0, successful: 0, conversion: '0%' }
  });
  const [engineers, setEngineers] = useState<any[]>([]);
  const [employers, setEmployers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [interests, setInterests] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [fetching, setFetching] = useState(false);
  const [onboardingItem, setOnboardingItem] = useState<any | null>(null);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [onboardingForm, setOnboardingForm] = useState({
      salary: '',
      type: 'LEASE',
      platformFee: '10'
  });

  const [viewingEngineer, setViewingEngineer] = useState<any | null>(null);
  const [viewingEmployer, setViewingEmployer] = useState<any | null>(null);
  const [protocolFee, setProtocolFee] = useState('10');

  const fetchData = async () => {
    setFetching(true);
    try {
      if (activeTab === 'stats') {
        // Fetch everything needed for the stats tab in parallel
        const [statsRes, engineersRes, logsRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/engineers'),
          api.get('/admin/logs'),
        ]);

        const data = statsRes.data;
        const allEngineers: any[] = engineersRes.data || [];
        const allLogs: any[] = logsRes.data || [];

        // Build real security alerts from recent relevant log events
        const alertKeywords = ['login', 'registration', 'admin', 'password', 'failed'];
        const relevantLogs = allLogs
          .filter((l: any) => alertKeywords.some(kw => (l.action || '').toLowerCase().includes(kw) || (l.details || '').toLowerCase().includes(kw)))
          .slice(0, 5)
          .map((l: any, i: number) => ({
            id: i + 1,
            type: (l.action || '').toLowerCase().includes('login') ? 'INFO' : 'WARNING',
            message: l.details || l.action || 'System event recorded',
            time: new Date(l.createdAt).toLocaleString()
          }));

        // If no relevant logs yet, show a clean state
        const securityAlerts = relevantLogs.length > 0
          ? relevantLogs
          : [{ id: 1, type: 'INFO', message: 'No recent security events detected', time: 'Now' }];

        // Derive network growth from real counts
        const totalEngineers = data.totalEngineers || 0;
        const approvedEngineers = allEngineers.filter((e: any) => e.approvalStatus === 'FULLY_APPROVED').length;
        const conversionRate = totalEngineers > 0 ? ((approvedEngineers / totalEngineers) * 100).toFixed(1) + '%' : '0%';

        setEngineers(allEngineers);
        setStats(prev => ({
          ...prev,
          ...data,
          payoutHistory: data.payoutHistory || [],
          securityAlerts,
          referralData: {
            total: data.totalEmployers || 0,       // employers = impressions/reach
            successful: approvedEngineers,          // approved engineers = successful inductions
            conversion: conversionRate
          }
        }));
      } else if (activeTab === 'engineers') {
        const { data } = await api.get('/admin/engineers');
        setEngineers(data || []);
      } else if (activeTab === 'employers') {
        const { data } = await api.get('/admin/employers');
        setEmployers(data || []);
      } else if (activeTab === 'logs') {
        const { data } = await api.get('/admin/logs');
        setLogs(data || []);
      } else if (activeTab === 'interests') {
        const { data } = await api.get('/admin/interests');
        setInterests(data || []);
      } else if (activeTab === 'settings') {
        const { data } = await api.get('/admin/config');
        const fee = data.find((c: any) => c.key === 'protocol_fee');
        if (fee) setProtocolFee(fee.value);
      } else if (activeTab === 'jobs') {
        const { data } = await api.get('/admin/jobs');
        setJobs(data || []);
      }
    } catch (error: any) {
      console.error('Error fetching admin data:', error.response?.data || error.message);
    }
    setFetching(false);
  };

  const hasFetched = React.useRef(false);

  useEffect(() => {
    if (loading) return;

    if (!user || user.role !== 'ADMIN') {
      router.push('/login');
    } else {
      fetchData();
    }
  }, [user?.id, user?.role, loading, router, activeTab]);

  const handleUpdateEngineerStatus = async (id: string, approvalStatus: string) => {
    try {
      let disapprovalReason = null;
      if (approvalStatus === 'REJECTED') {
          disapprovalReason = prompt('Reason for rejection:');
          if (!disapprovalReason) return;
      }
      await api.patch(`/admin/engineers/${id}/status`, { approvalStatus, disapprovalReason });
      fetchData();
      if (viewingEngineer?.id === id) {
          setViewingEngineer((prev: any) => ({ ...prev, approvalStatus, disapprovalReason }));
      }
    } catch (error) {
      alert('Failed to update engineer status');
    }
  };

  const handleToggleFeature = async (id: string, isFeatured: boolean) => {
    try {
      await api.patch(`/admin/engineers/${id}/feature`, { isFeatured });
      fetchData();
      if (viewingEngineer?.id === id) {
          setViewingEngineer((prev: any) => ({ ...prev, isFeatured }));
      }
    } catch (error) {
      alert('Failed to toggle feature status');
    }
  };

  const handleApproveEmployer = async (id: string, isApproved: boolean) => {
    try {
      let disapprovalReason = null;
      if (!isApproved) {
        disapprovalReason = prompt('Reason for disapproval:');
        if (!disapprovalReason) return;
      }
      await api.patch(`/admin/employers/${id}/approve`, { isApproved, disapprovalReason });
      fetchData();
      if (viewingEmployer?.id === id) {
          setViewingEmployer((prev: any) => ({ ...prev, isApproved, disapprovalReason }));
      }
    } catch (error) {
      alert('Failed to update employer status');
    }
  };

  const handleApproveJob = async (id: string) => {
    try {
      await api.patch(`/admin/jobs/${id}/approve`);
      fetchData();
      alert('Job Approved successfully');
    } catch (error) {
      alert('Failed to approve job');
    }
  };

  const handleDisapproveJob = async (id: string) => {
    try {
      const reason = prompt('Reason for disapproval:');
      if (!reason) return;
      await api.patch(`/admin/jobs/${id}/disapprove`, { reason });
      fetchData();
      alert('Job Disapproved successfully');
    } catch (error) {
      alert('Failed to disapprove job');
    }
  };

  const handleDeleteInterest = async (id: string) => {
    if (!confirm('Are you sure you want to reject and remove this interest?')) return;
    try {
      await api.delete(`/admin/interests/${id}`);
      fetchData();
    } catch (error) {
      alert('Failed to delete interest');
    }
  };

  const handleRejectInterest = async (id: string) => {
    if (!confirm('Reject this meeting request? The employer will be notified.')) return;
    try {
      await api.patch(`/admin/interests/${id}/status`, { status: 'REJECTED' });
      fetchData();
    } catch (error) {
      alert('Failed to reject meeting request');
    }
  };

  const handleCreateMeeting = async (id: string) => {
    try {
      await api.post(`/admin/interests/${id}/meeting`);
      fetchData();
      alert('Meeting Room Created Successfully');
    } catch (error) {
      alert('Failed to create meeting room');
    }
  };

  const handleCreateEngineerMeeting = async (id: string) => {
    try {
      await api.post(`/admin/engineers/${id}/meeting`);
      fetchData();
      alert('Verification Meeting Room Created Successfully');
    } catch (error) {
      alert('Failed to create verification meeting room');
    }
  };

  const handleOnboard = async () => {
      try {
          await api.post('/jobs/admin/onboard', {
              employerId: onboardingItem.employerId,
              engineerId: onboardingItem.engineerId,
              salary: onboardingForm.salary,
              type: onboardingForm.type,
              platformFee: onboardingForm.platformFee
          });
          setOnboardingItem(null);
          setActiveTab('interests');
          fetchData();
          alert('Engineer onboarded successfully!');
      } catch (err) {
          alert('Failed to onboard');
      }
  };

  const handleSaveConfig = async (key: string, value: string) => {
    try {
        await api.patch('/admin/config', { key, value });
        alert('Internal Protocol Overwritten.');
        fetchData();
    } catch (err) {
        alert('Failed to update protocol');
    }
  };

  if (loading || !user || fetching) return (
    <div className="min-h-screen bg-[#E7E6E2] flex items-center justify-center text-[#32312D]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-[#3A3F5F]/10 border-t-[#3A3F5F] rounded-full animate-spin"></div>
        <div className="text-[10px] font-black uppercase tracking-[0.3em]">Accessing Command Core...</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#E7E6E2] text-[#32312D] flex flex-col font-sans selection:bg-[#3A3F5F] selection:text-white">
      
      
      <main className="max-w-[1600px] mx-auto w-full px-6 py-12 flex-1">
        {/* Header Section */}
        <div className="relative mb-12 p-10 rounded-[40px] bg-white border border-[#32312D]/10 shadow-sm overflow-hidden group text-left">
            <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 bg-[#3A3F5F]/5 border border-[#3A3F5F]/10 rounded-full text-[10px] font-black uppercase tracking-widest text-[#3A3F5F]">Command Center v4.0</span>
                        <span className="w-2 h-2 rounded-full bg-[#3A3F5F] animate-pulse"></span>
                    </div>
                    <h1 className="text-5xl font-black mb-3 tracking-tighter uppercase text-[#32312D]">
                        Admin Dashboard
                    </h1>
                    <p className="text-[#32312D]/40 font-medium text-lg uppercase tracking-widest text-xs">Governance & Infrastructure Management</p>
                </div>

                <div className="flex flex-wrap gap-4">
                    <button 
                        onClick={() => setShowBroadcastModal(true)}
                        className="bg-white border border-[#32312D]/10 text-[#32312D]/60 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-[#3A3F5F] transition-all flex items-center gap-3 shadow-sm"
                    >
                        <span className="text-[#3A3F5F]">📢</span> Global Broadcast
                    </button>
                    <div className="bg-[#3A3F5F]/5 px-8 py-4 rounded-2xl border border-[#3A3F5F]/10 min-w-[200px]">
                        <div className="text-[8px] font-black text-[#3A3F5F] uppercase tracking-[0.2em] mb-1 text-left">Aggregate Marketplace GMV</div>
                        <div className="text-2xl font-black text-[#3A3F5F] text-left">${stats.totalRevenue.toLocaleString()}</div>
                    </div>
                    <LogoutButton />
                </div>
            </div>
        </div>

        {/* Sidebar Nav + Content */}
        <div className="flex flex-col lg:flex-row gap-12">
            <aside className="w-full lg:w-64 space-y-2">
                {['stats', 'interests', 'jobs', 'engineers', 'employers', 'logs', 'settings'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.15em] transition-all group ${
                            activeTab === tab 
                            ? 'bg-[#3A3F5F] text-white shadow-lg shadow-[#3A3F5F]/20' 
                            : 'text-[#32312D]/40 hover:text-[#32312D] hover:bg-white'
                        }`}
                    >
                        {tab}
                        <span className={`w-1.5 h-1.5 rounded-full transition-all ${activeTab === tab ? 'bg-white' : 'bg-transparent group-hover:bg-[#3A3F5F]'}`}></span>
                    </button>
                ))}
            </aside>

            <div className="flex-1 min-w-0">
                {activeTab === 'stats' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-12">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {[
                                { label: 'Gross Revenue', value: `$${stats.totalRevenue.toLocaleString()}`, color: 'text-[#32312D]' },
                                { label: 'Active Contracts', value: stats.activeContracts, color: 'text-[#3A3F5F]' },
                                { label: 'Deployment Signals', value: stats.totalJobs, color: 'text-[#32312D]' },
                                { label: 'Verified Nodes', value: stats.totalEngineers, color: 'text-[#32312D]' }
                            ].map((item, i) => (
                                <div key={i} className="bg-white p-8 rounded-[32px] border border-[#32312D]/10 shadow-sm text-left">
                                    <div className="text-[10px] font-black text-[#32312D]/40 uppercase tracking-widest mb-2">{item.label}</div>
                                    <div className={`text-3xl font-black ${item.color}`}>{item.value}</div>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-8 rounded-[32px] border border-red-100 col-span-2 relative overflow-hidden shadow-sm">
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="text-xs font-black text-[#32312D] uppercase tracking-[0.2em] flex items-center gap-3 text-left">
                                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> Security Protocols
                                    </h3>
                                    <button className="text-[10px] font-black text-red-500 uppercase tracking-widest border border-red-100 px-3 py-1 rounded-lg hover:bg-red-50 transition-all">Audit Logs</button>
                                </div>
                                <div className="space-y-4">
                                    {stats.securityAlerts.map(alert => (
                                        <div key={alert.id} className="flex justify-between items-center p-5 bg-[#E7E6E2]/30 rounded-2xl border border-[#32312D]/5">
                                            <div className="text-left">
                                                <div className="text-[8px] font-black text-red-500 uppercase tracking-widest mb-1">{alert.type}</div>
                                                <div className="text-sm font-bold text-[#32312D]/60 uppercase tracking-widest text-[10px]">{alert.message}</div>
                                            </div>
                                            <div className="text-[10px] font-bold text-[#32312D]/40 uppercase">{alert.time}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white p-8 rounded-[32px] border border-[#32312D]/10 shadow-sm text-left">
                                <div className="text-[10px] font-black text-[#32312D]/40 uppercase tracking-widest mb-6">Network Growth Index</div>
                                <div className="text-5xl font-black text-[#3A3F5F] tracking-tighter mb-2">{stats.referralData.successful}</div>
                                <div className="text-[10px] font-black text-[#32312D]/40 uppercase tracking-widest mb-8">Verified Inductions</div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center py-3 border-t border-[#32312D]/5">
                                        <div className="text-[10px] font-black text-[#32312D]/40 uppercase">Conversion Delta</div>
                                        <div className="text-xs font-black text-emerald-600">{stats.referralData.conversion}</div>
                                    </div>
                                    <div className="flex justify-between items-center py-3 border-t border-[#32312D]/5">
                                        <div className="text-[10px] font-black text-[#32312D]/40 uppercase">Total Impressions</div>
                                        <div className="text-xs font-black text-[#32312D]">{stats.referralData.total}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8 text-left">
                            <h2 className="text-2xl font-black uppercase tracking-tight text-[#32312D]">Pending Authorizations</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                                {engineers.filter(e => e.approvalStatus === 'PENDING').slice(0, 3).map(eng => (
                                    <div key={eng.id} className="p-px rounded-[32px] bg-[#32312D]/5 hover:bg-[#3A3F5F]/10 transition-all duration-500">
                                        <div className="bg-white p-8 rounded-[31px] group shadow-sm border border-[#32312D]/10">
                                            <div className="flex items-center gap-5 mb-8">
                                                <div className="w-14 h-14 bg-[#3A3F5F]/5 rounded-2xl flex items-center justify-center text-xl font-bold text-[#3A3F5F] border border-[#3A3F5F]/10 group-hover:bg-[#3A3F5F] group-hover:text-white transition-all uppercase">
                                                    {eng.fullName.charAt(0)}
                                                </div>
                                                <div className="text-left">
                                                    <div className="font-black text-[#32312D] text-lg tracking-tight uppercase line-clamp-1">{eng.fullName}</div>
                                                    <div className="text-[10px] font-black text-[#32312D]/40 uppercase tracking-widest">{eng.country}</div>
                                                </div>
                                            </div>
                                            <div className="flex gap-3">
                                                <button onClick={() => setViewingEngineer(eng)} className="flex-1 py-3 bg-[#E7E6E2]/50 border border-[#32312D]/10 rounded-xl text-[10px] font-black uppercase text-[#32312D]/40 hover:text-[#32312D] hover:bg-[#E7E6E2] transition-all shadow-sm">Audit Dossier</button>
                                                <button onClick={() => handleUpdateEngineerStatus(eng.id, 'ACCEPTED_FOR_INTERVIEW')} className="flex-1 py-3 bg-[#3A3F5F] rounded-xl text-[10px] font-black uppercase text-white hover:bg-[#32312D] transition-all shadow-md">Authorize Call</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'interests' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8 text-left">
                        <h2 className="text-2xl font-black uppercase tracking-tight mb-8 text-[#32312D]">Engagement Queue</h2>
                        <div className="bg-white rounded-[32px] border border-[#32312D]/10 overflow-hidden shadow-sm">
                                <table className="w-full text-left text-[#32312D]">
                                <thead className="bg-[#3A3F5F]/5 text-[10px] font-black text-[#32312D]/40 uppercase tracking-[0.2em]">
                                    <tr>
                                        <th className="px-8 py-6">Corporate Entity</th>
                                        <th className="px-8 py-6">Target Node</th>
                                        <th className="px-8 py-6">Protocol</th>
                                        <th className="px-8 py-6">Requested Time</th>
                                        <th className="px-8 py-6">Status</th>
                                        <th className="px-8 py-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#32312D]/5">
                                    {interests.map(interest => (
                                        <tr key={interest.id} className="hover:bg-[#3A3F5F]/5 transition-colors">
                                            <td className="px-8 py-6 font-black text-[#32312D] text-xs tracking-tight uppercase">{interest.employer.companyName}</td>
                                            <td className="px-8 py-6 font-black text-[#3A3F5F] text-xs tracking-tight uppercase">{interest.engineer.fullName}</td>
                                            <td className="px-8 py-6">
                                                <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${interest.type === 'LEASE' ? 'bg-[#3A3F5F]/5 text-[#3A3F5F]' : 'bg-[#E7E6E2] text-[#32312D]/60'}`}>
                                                    {interest.type}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                {interest.scheduledAt ? (
                                                    <div className="text-left">
                                                        <div className="text-[10px] font-black text-[#32312D] uppercase tracking-tight">{new Date(interest.scheduledAt).toLocaleDateString()}</div>
                                                        <div className="text-[8px] font-black text-[#32312D]/40 uppercase tracking-widest mt-0.5">{new Date(interest.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-[10px] font-black text-[#32312D]/20 uppercase tracking-widest">Not Set</span>
                                                )}
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                                        interest.status === 'PENDING' ? 'bg-orange-400 animate-pulse' :
                                                        interest.status === 'REJECTED' ? 'bg-red-500' :
                                                        interest.status === 'CALLED' ? 'bg-indigo-500' :
                                                        'bg-emerald-500'
                                                    }`}></span>
                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${
                                                        interest.status === 'REJECTED' ? 'text-red-500' : 'text-[#32312D]/40'
                                                    }`}>{interest.status}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex justify-end gap-3">
                                                    {interest.status === 'REJECTED' ? (
                                                        <span className="px-4 py-2.5 bg-red-50 text-red-400 border border-red-100 rounded-xl font-black text-[10px] uppercase tracking-widest">Meeting Denied</span>
                                                    ) : interest.joinUrl ? (
                                                        <a 
                                                            href={`https://leadhunter-crm.work.gd${interest.joinUrl}`} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-sm flex items-center gap-2"
                                                        >
                                                            <span>🔗</span> Join Room
                                                        </a>
                                                    ) : interest.scheduledAt ? (
                                                        <>
                                                            <button 
                                                                onClick={() => handleCreateMeeting(interest.id)}
                                                                className="bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-sm"
                                                            >
                                                                ✓ Approve
                                                            </button>
                                                            <button 
                                                                onClick={() => handleRejectInterest(interest.id)}
                                                                className="bg-red-500 text-white px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 transition-all shadow-sm"
                                                            >
                                                                ✕ Reject
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <button 
                                                            onClick={() => handleCreateMeeting(interest.id)}
                                                            className="bg-indigo-500 text-white px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-sm"
                                                        >
                                                            Create Room
                                                        </button>
                                                    )}
                                                    {interest.status !== 'REJECTED' && (
                                                        <button onClick={() => { setOnboardingItem(interest); setOnboardingForm(prev => ({ ...prev, type: interest.type })); }} className="bg-[#32312D] text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#3A3F5F] transition-all shadow-sm">Review</button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'engineers' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8 text-left">
                        <h2 className="text-2xl font-black uppercase tracking-tight mb-8 text-[#32312D]">Operational Node Registry</h2>
                        <div className="bg-white rounded-[32px] border border-[#32312D]/10 overflow-hidden shadow-sm">
                            <table className="w-full text-left text-[#32312D]">
                                <thead className="bg-[#3A3F5F]/5 text-[10px] font-black text-[#32312D]/40 uppercase tracking-[0.2em]">
                                    <tr>
                                        <th className="px-8 py-6">Identifier</th>
                                        <th className="px-8 py-6">Status</th>
                                        <th className="px-8 py-6">Protocol</th>
                                        <th className="px-8 py-6 text-right">Operations</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#32312D]/5">
                                    {engineers.map(eng => (
                                        <tr key={eng.id} className="hover:bg-[#3A3F5F]/5 transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="font-black text-[#32312D] text-xs tracking-tight uppercase flex items-center gap-2">
                                                    {eng.fullName} {eng.isFeatured && <span className="text-[#3A3F5F]">★</span>}
                                                </div>
                                                <div className="text-[10px] font-bold text-[#32312D]/40 mt-1 uppercase tracking-widest">{eng.user?.email}</div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${eng.approvalStatus === 'FULLY_APPROVED' ? 'bg-emerald-50 text-emerald-600' : 'bg-[#3A3F5F]/5 text-[#3A3F5F]'}`}>
                                                    {eng.approvalStatus || 'INITIALIZING'}
                                                </span>
                                                {eng.disapprovalReason && (
                                                    <div className="text-[8px] text-red-500 mt-1 uppercase font-bold italic">{eng.disapprovalReason}</div>
                                                )}
                                            </td>
                                            <td className="px-8 py-6">
                                                <select 
                                                    className="bg-[#E7E6E2]/50 border border-[#32312D]/10 text-[10px] font-black uppercase text-[#32312D]/60 rounded-lg px-3 py-1.5 outline-none focus:border-[#3A3F5F] transition-all cursor-pointer"
                                                    value={eng.approvalStatus || 'PENDING'}
                                                    onChange={(e) => handleUpdateEngineerStatus(eng.id, e.target.value)}
                                                >
                                                    <option value="PENDING">PENDING</option>
                                                    <option value="ACCEPTED_FOR_INTERVIEW">INTERVIEW</option>
                                                    <option value="INTERVIEW_COMPLETED">VERIFIED</option>
                                                    <option value="FULLY_APPROVED">ACTIVE</option>
                                                    <option value="REJECTED">OFFLINE</option>
                                                </select>
                                            </td>
                                            <td className="px-8 py-6 text-right flex justify-end gap-3">
                                                {eng.joinUrl ? (
                                                    <a 
                                                        href={`https://leadhunter-crm.work.gd${eng.joinUrl}`} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-sm flex items-center gap-2"
                                                    >
                                                        <span>🔗</span> Join Room
                                                    </a>
                                                ) : (
                                                    <button 
                                                        onClick={() => handleCreateEngineerMeeting(eng.id)}
                                                        className="bg-indigo-500 text-white px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-sm"
                                                    >
                                                        Verify Room
                                                    </button>
                                                )}
                                                <button onClick={() => handleToggleFeature(eng.id, !eng.isFeatured)} className={`p-2.5 rounded-xl border transition-all ${eng.isFeatured ? 'border-[#3A3F5F]/50 bg-[#3A3F5F]/5 text-[#3A3F5F]' : 'border-[#32312D]/10 bg-[#E7E6E2]/20 text-[#32312D]/20 hover:text-[#32312D]'}`}>★</button>
                                                <button onClick={() => setViewingEngineer(eng)} className="px-5 py-2.5 bg-[#E7E6E2]/50 border border-[#32312D]/10 rounded-xl text-[10px] font-black uppercase text-[#32312D]/40 hover:text-[#32312D] hover:bg-[#E7E6E2] transition-all">Audit</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'employers' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8 text-left">
                        <h2 className="text-2xl font-black uppercase tracking-tight mb-8 text-[#32312D]">Corporate Intelligence Roster</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {employers.map(emp => (
                                <div key={emp.id} className="p-px rounded-[32px] bg-[#32312D]/5 hover:bg-[#3A3F5F]/10 transition-all duration-500">
                                    <div className="bg-white p-8 rounded-[31px] group border border-[#32312D]/10 shadow-sm text-left h-full flex flex-col">
                                        <div className="flex items-center gap-5 mb-8">
                                            <div className="w-14 h-14 bg-[#3A3F5F]/5 rounded-2xl flex items-center justify-center text-xl font-bold text-[#3A3F5F] border border-[#3A3F5F]/10 group-hover:bg-[#3A3F5F] group-hover:text-white transition-all uppercase">
                                                {emp.companyName?.charAt(0) || 'C'}
                                            </div>
                                            <div className="text-left">
                                                <div className="font-black text-[#32312D] text-lg tracking-tight uppercase line-clamp-1">{emp.companyName}</div>
                                                <div className="text-[10px] font-black text-[#32312D]/40 uppercase tracking-widest">{emp.location || 'Global Node'}</div>
                                                {emp.disapprovalReason && (
                                                    <div className="text-[8px] text-red-500 mt-1 uppercase font-bold italic line-clamp-1">{emp.disapprovalReason}</div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-3 mt-auto">
                                            <button onClick={() => setViewingEmployer(emp)} className="flex-1 py-3 bg-[#E7E6E2]/50 border border-[#32312D]/10 rounded-xl text-[10px] font-black uppercase text-[#32312D]/40 hover:text-[#32312D] hover:bg-[#E7E6E2] transition-all shadow-sm">Entity Bio</button>
                                            <button 
                                                onClick={() => handleApproveEmployer(emp.id, !emp.isApproved)}
                                                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all shadow-sm ${emp.isApproved ? 'bg-[#3A3F5F] text-white' : 'bg-[#32312D] text-white hover:bg-[#3A3F5F]'}`}
                                            >
                                                {emp.isApproved ? 'Verified' : 'Authorize'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'jobs' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8 text-left">
                        <h2 className="text-2xl font-black uppercase tracking-tight mb-8 text-[#32312D]">Marketplace Job Queue</h2>
                        <div className="bg-white rounded-[32px] border border-[#32312D]/10 overflow-hidden shadow-sm">
                            <table className="w-full text-left text-[#32312D]">
                                <thead className="bg-[#3A3F5F]/5 text-[10px] font-black text-[#32312D]/40 uppercase tracking-[0.2em]">
                                    <tr>
                                        <th className="px-8 py-6">Job Title</th>
                                        <th className="px-8 py-6">Employer</th>
                                        <th className="px-8 py-6">Budget</th>
                                        <th className="px-8 py-6">Status</th>
                                        <th className="px-8 py-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#32312D]/5">
                                    {jobs.map(job => (
                                        <tr key={job.id} className="hover:bg-[#3A3F5F]/5 transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="font-black text-[#32312D] text-xs tracking-tight uppercase">{job.title}</div>
                                                <div className="text-[10px] font-bold text-[#32312D]/40 mt-1 uppercase tracking-widest truncate max-w-md">{job.description}</div>
                                            </td>
                                            <td className="px-8 py-6 font-black text-[#32312D] text-[10px] uppercase tracking-tight">{job.employer?.companyName}</td>
                                            <td className="px-8 py-6 font-black text-[#32312D] text-[10px] uppercase tracking-tight">${job.maxBudget}/HR</td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                                        job.status === 'PENDING' ? 'bg-orange-400 animate-pulse' :
                                                        job.status === 'DISAPPROVED' ? 'bg-red-500' :
                                                        'bg-emerald-500'
                                                    }`}></span>
                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${
                                                        job.status === 'DISAPPROVED' ? 'text-red-500' : 'text-[#32312D]/40'
                                                    }`}>{job.status}</span>
                                                </div>
                                                {job.disapprovalReason && (
                                                    <div className="text-[8px] text-red-400 mt-1 uppercase font-bold italic">{job.disapprovalReason}</div>
                                                )}
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex justify-end gap-3">
                                                    {job.status === 'PENDING' && (
                                                        <>
                                                            <button 
                                                                onClick={() => handleApproveJob(job.id)}
                                                                className="bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-sm"
                                                            >
                                                                Approve
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDisapproveJob(job.id)}
                                                                className="bg-red-500 text-white px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 transition-all shadow-sm"
                                                            >
                                                                Disapprove
                                                            </button>
                                                        </>
                                                    )}
                                                    {job.status === 'DISAPPROVED' && (
                                                        <button 
                                                            onClick={() => handleApproveJob(job.id)}
                                                            className="bg-indigo-500 text-white px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-sm"
                                                        >
                                                            Re-approve
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'logs' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8 text-left">
                        <h2 className="text-2xl font-black uppercase tracking-tight mb-8 text-[#32312D]">Event Stream Ledger</h2>
                        <div className="bg-white rounded-[32px] border border-[#32312D]/10 overflow-hidden shadow-sm">
                            <table className="w-full text-left text-[#32312D]">
                                <thead className="bg-[#3A3F5F]/5 text-[10px] font-black text-[#32312D]/40 uppercase tracking-[0.2em]">
                                    <tr>
                                        <th className="px-8 py-6">Timestamp</th>
                                        <th className="px-8 py-6">Protocol Action</th>
                                        <th className="px-8 py-6">Source Origin</th>
                                        <th className="px-8 py-6">Metadata</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#32312D]/5">
                                    {logs.map(log => (
                                        <tr key={log.id} className="hover:bg-[#3A3F5F]/5 transition-colors">
                                            <td className="px-8 py-6 text-[10px] font-bold text-[#32312D]/40 uppercase tracking-tighter">{new Date(log.createdAt).toLocaleString()}</td>
                                            <td className="px-8 py-6">
                                                <span className="bg-[#3A3F5F]/5 text-[#3A3F5F] px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest border border-[#3A3F5F]/10">{log.action}</span>
                                            </td>
                                            <td className="px-8 py-6 font-black text-[#32312D] text-[10px] uppercase tracking-tight">{log.user?.email || 'SYSTEM CORE'}</td>
                                            <td className="px-8 py-6 text-[#32312D]/60 text-[10px] font-medium leading-relaxed italic uppercase tracking-tighter">{log.details}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                
                {activeTab === 'settings' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 grid grid-cols-1 md:grid-cols-2 gap-10 text-left">
                        <div className="bg-white p-10 rounded-[40px] border border-[#32312D]/10 shadow-sm text-left">
                            <h3 className="text-xl font-black uppercase tracking-tight mb-10 text-[#32312D]">Marketplace Parameters</h3>
                            <div className="space-y-8">
                                <div className="space-y-3 text-left">
                                    <label className="block text-[10px] font-black text-[#32312D]/40 uppercase tracking-[0.3em]">Protocol Fee (%)</label>
                                    <input 
                                        type="number" 
                                        value={protocolFee} 
                                        onChange={(e) => setProtocolFee(e.target.value)}
                                        className="w-full px-6 py-4 bg-[#E7E6E2]/30 border border-[#32312D]/10 rounded-2xl outline-none focus:border-[#3A3F5F] transition-all font-bold text-[#32312D] uppercase text-xs" 
                                    />
                                </div>
                                <button 
                                    onClick={() => handleSaveConfig('protocol_fee', protocolFee)}
                                    className="w-full bg-[#3A3F5F] text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] shadow-lg shadow-[#3A3F5F]/20 hover:bg-[#32312D] transition-all"
                                >
                                    Overwrite Core Config
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </main>

      {/* Broadcast Modal */}
      {showBroadcastModal && (
          <div className="fixed inset-0 bg-[#32312D]/60 backdrop-blur-2xl z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
              <div className="bg-white w-full max-w-2xl rounded-[60px] shadow-2xl p-16 border border-[#32312D]/10 relative">
                  <button onClick={() => setShowBroadcastModal(false)} className="absolute top-10 right-10 text-[#32312D]/40 hover:text-[#32312D] text-3xl transition-colors font-light">✕</button>
                  <h2 className="text-4xl font-black text-[#32312D] mb-2 uppercase tracking-tighter text-left">Broadcast Signal</h2>
                  <p className="text-[#32312D]/40 text-[10px] font-black uppercase tracking-[0.3em] mb-12 leading-loose text-left">Transmitting to all active nodes in the Talent Bridge network.</p>
                  <div className="space-y-10">
                      <div className="space-y-4 text-left">
                          <label className="block text-[10px] font-black text-[#32312D]/40 uppercase tracking-widest">Protocol Subject</label>
                          <input type="text" className="w-full px-8 py-5 bg-[#E7E6E2]/30 border border-[#32312D]/10 rounded-2xl outline-none focus:border-[#3A3F5F] transition-all font-black uppercase text-xs tracking-widest text-[#32312D]" placeholder="TRANSMISSION_ID" />
                      </div>
                      <div className="space-y-4 text-left">
                          <label className="block text-[10px] font-black text-[#32312D]/40 uppercase tracking-widest">Signal Payload</label>
                          <textarea className="w-full px-8 py-6 bg-[#E7E6E2]/30 border border-[#32312D]/10 rounded-2xl outline-none focus:border-[#3A3F5F] transition-all font-medium text-[#32312D]/60 h-48 resize-none" placeholder="Enter payload content..."></textarea>
                      </div>
                      <button onClick={() => { alert('Signal Broadcasted!'); setShowBroadcastModal(false); }} className="w-full bg-[#3A3F5F] text-white py-6 rounded-3xl font-black uppercase text-[10px] tracking-[0.4em] shadow-lg shadow-[#3A3F5F]/20 hover:bg-[#32312D] transition-all">Initiate Transmission</button>
                  </div>
              </div>
          </div>
      )}

      {/* Engineer Audit Modal */}
      {viewingEngineer && (
          <div className="fixed inset-0 bg-[#32312D]/80 backdrop-blur-2xl z-50 flex items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-300">
              <div className="bg-white w-full max-w-5xl rounded-[50px] shadow-2xl overflow-hidden flex flex-col md:flex-row h-[85vh] border border-[#32312D]/10">
                  <div className="flex-1 bg-[#E7E6E2]/50 flex items-center justify-center relative">
                      {viewingEngineer.videoUrl ? (
                          <video src={getFileUrl(viewingEngineer.videoUrl)} controls className="w-full h-full object-contain grayscale" />
                      ) : (
                          <div className="text-[#32312D]/20 font-black uppercase tracking-[0.5em] text-sm">Uplink Feed Offline</div>
                      )}
                      <div className="absolute top-8 left-8 bg-white border border-[#32312D]/10 px-5 py-2.5 rounded-full text-[#3A3F5F] text-[8px] font-black uppercase tracking-[0.3em] shadow-sm">
                          Live Dossier Preview
                      </div>
                  </div>
                  <div className="w-full md:w-[450px] p-12 flex flex-col overflow-y-auto bg-white border-l border-[#32312D]/10 text-left">
                      <div className="flex justify-between items-start mb-12">
                          <div className="text-left">
                              <h2 className="text-4xl font-black text-[#32312D] tracking-tighter mb-2 uppercase">{viewingEngineer.fullName}</h2>
                              <p className="text-[#32312D]/40 font-black uppercase text-[10px] tracking-[0.2em]">{viewingEngineer.country} • NODE_v{viewingEngineer.yearsExperience}.0</p>
                          </div>
                          <button onClick={() => setViewingEngineer(null)} className="text-[#32312D]/40 hover:text-[#32312D] transition-colors text-2xl font-light">✕</button>
                      </div>

                      <div className="space-y-10 flex-1 text-left">
                          <div className="grid grid-cols-2 gap-6">
                              <div className="bg-[#3A3F5F]/5 p-6 rounded-[32px] border border-[#3A3F5F]/10">
                                  <div className="text-[8px] font-black text-[#3A3F5F] uppercase tracking-widest mb-2">Protocol Status</div>
                                  <div className="text-[10px] font-black text-[#3A3F5F] uppercase">{viewingEngineer.approvalStatus || 'PENDING'}</div>
                              </div>
                              <div className="bg-[#E7E6E2]/30 p-6 rounded-[32px] border border-[#32312D]/5">
                                  <div className="text-[8px] font-black text-[#32312D]/40 uppercase tracking-widest mb-2">Market Quota</div>
                                  <div className="text-sm font-black text-[#32312D]">${viewingEngineer.hourlyRate}/HR</div>
                              </div>
                          </div>

                          <div>
                              <div className="text-[10px] font-black text-[#32312D]/40 uppercase mb-5 tracking-[0.3em]">Core Module Specs</div>
                              <div className="flex flex-wrap gap-2">
                                  {viewingEngineer.aiSpecializations?.split(',').map((s: string, i: number) => (
                                      <span key={i} className="px-4 py-2 bg-[#3A3F5F]/5 text-[#3A3F5F] border border-[#3A3F5F]/10 rounded-xl text-[8px] font-black uppercase tracking-widest">{s.trim()}</span>
                                  ))}
                              </div>
                          </div>

                          <div className="space-y-4">
                              <div className="text-[10px] font-black text-[#32312D]/40 uppercase mb-5 tracking-[0.3em]">Encrypted Documentation</div>
                              {viewingEngineer.resumeUrl && (
                                  <a href={getFileUrl(viewingEngineer.resumeUrl)} target="_blank" className="flex items-center justify-between p-5 bg-white rounded-2xl border border-[#32312D]/10 hover:border-[#3A3F5F] shadow-sm transition-all group">
                                      <span className="text-[10px] font-black text-[#32312D]/40 uppercase tracking-widest group-hover:text-[#32312D] transition-colors">Dossier_Link.pdf</span>
                                      <span className="text-[#3A3F5F]">→</span>
                                  </a>
                              )}
                          </div>

                          <div className="space-y-4 pt-4">
                              <div className="text-[10px] font-black text-[#32312D]/40 uppercase mb-5 tracking-[0.3em]">Interested Corporate Entities</div>
                              {viewingEngineer.interests && viewingEngineer.interests.length > 0 ? (
                                  <div className="flex flex-col gap-3">
                                      {viewingEngineer.interests.map((interest: any) => (
                                          <div key={interest.id} className="p-4 bg-[#E7E6E2]/30 rounded-2xl border border-[#32312D]/5 flex justify-between items-center text-left">
                                              <div>
                                                  <div className="text-xs font-black text-[#32312D] uppercase">{interest.employer?.companyName || 'Unknown Entity'}</div>
                                                  <div className="text-[8px] font-black text-[#32312D]/40 uppercase tracking-widest mt-1">Status: {interest.status}</div>
                                              </div>
                                              <span className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest ${interest.type === 'LEASE' ? 'bg-[#3A3F5F]/5 text-[#3A3F5F]' : 'bg-white text-[#32312D]/60'}`}>
                                                  {interest.type}
                                              </span>
                                          </div>
                                      ))}
                                  </div>
                              ) : (
                                  <div className="text-[#32312D]/30 text-xs font-black uppercase tracking-widest">No interests signaled yet.</div>
                              )}
                          </div>
                      </div>

                      <div className="pt-12 mt-12 border-t border-[#32312D]/5 text-left">
                          <div className="grid grid-cols-2 gap-4">
                              <button onClick={() => handleUpdateEngineerStatus(viewingEngineer.id, 'ACCEPTED_FOR_INTERVIEW')} className="bg-[#3A3F5F] text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#32312D] transition-all shadow-md">Invite Uplink</button>
                              <button onClick={() => handleUpdateEngineerStatus(viewingEngineer.id, 'FULLY_APPROVED')} className="bg-[#32312D] text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#3A3F5F] transition-all shadow-md">Full Activation</button>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Employer Audit Modal */}
      {viewingEmployer && (
          <div className="fixed inset-0 bg-[#32312D]/80 backdrop-blur-2xl z-50 flex items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-300">
              <div className="bg-white w-full max-w-4xl rounded-[60px] shadow-2xl overflow-hidden flex flex-col border border-[#32312D]/10 max-h-[90vh]">
                  <div className="p-16 overflow-y-auto text-left">
                      <div className="flex justify-between items-start mb-16 text-left">
                          <div className="flex items-center gap-10 text-left">
                              <div className="w-32 h-32 bg-[#3A3F5F]/5 rounded-[40px] flex items-center justify-center text-5xl font-black text-[#3A3F5F] border border-[#3A3F5F]/10 shadow-sm uppercase">
                                  {viewingEmployer.companyName?.charAt(0) || 'C'}
                              </div>
                              <div className="text-left">
                                  <div className="flex items-center gap-4 mb-4">
                                      <span className="bg-[#3A3F5F]/5 text-[#3A3F5F] text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border border-[#3A3F5F]/10 text-left">Corporate Entity Profile</span>
                                      <span className={`w-2 h-2 rounded-full ${viewingEmployer.isApproved ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-orange-400 animate-pulse'} `}></span>
                                  </div>
                                  <h2 className="text-5xl font-black text-[#32312D] tracking-tighter uppercase mb-2 text-left">{viewingEmployer.companyName}</h2>
                                  <p className="text-[#32312D]/40 font-black uppercase text-xs tracking-[0.3em] text-left">{viewingEmployer.location || 'Global Operations'} • {viewingEmployer.industry || 'Multi-Domain'}</p>
                              </div>
                          </div>
                          <button onClick={() => setViewingEmployer(null)} className="text-[#32312D]/40 hover:text-[#32312D] transition-colors text-3xl font-light">✕</button>
                      </div>

                      <div className="grid md:grid-cols-2 gap-20 text-left">
                          <div className="text-left">
                              <div className="text-[10px] font-black text-[#3A3F5F] uppercase mb-8 tracking-[0.3em] border-b border-[#32312D]/5 pb-4 text-left">Corporate Intel</div>
                              <div className="space-y-10 text-left">
                                  <div className="text-left">
                                      <div className="text-[8px] font-black text-[#32312D]/40 uppercase tracking-widest mb-2 text-left">Mission Brief</div>
                                      <p className="text-[#32312D]/60 text-sm leading-relaxed uppercase tracking-tighter font-medium text-left">{viewingEmployer.description || 'No public metadata broadcasted for this entity.'}</p>
                                  </div>
                                  <div className="grid grid-cols-2 gap-8 text-left">
                                      <div className="text-left">
                                          <div className="text-[8px] font-black text-[#32312D]/40 uppercase tracking-widest mb-2 text-left">Workforce Size</div>
                                          <div className="text-lg font-black text-[#32312D] text-left">{viewingEmployer.size || 'UNDISCLOSED'}</div>
                                      </div>
                                      <div className="text-left">
                                          <div className="text-[8px] font-black text-[#32312D]/40 uppercase tracking-widest mb-2 text-left">Compliance Node</div>
                                          <div className={`text-lg font-black ${viewingEmployer.isApproved ? 'text-emerald-600' : 'text-orange-400'} text-left`}>{viewingEmployer.isApproved ? 'AUTHORIZED' : 'PENDING'}</div>
                                      </div>
                                      <div className="text-left col-span-2">
                                          <div className="text-[8px] font-black text-[#32312D]/40 uppercase tracking-widest mb-2 text-left">Business Registration</div>
                                          <div className="text-lg font-black text-[#32312D] text-left uppercase tracking-tighter">{viewingEmployer.businessRegNumber || 'NOT PROVIDED'}</div>
                                      </div>
                                  </div>
                              </div>
                          </div>

                          <div className="text-left">
                              <div className="text-[10px] font-black text-[#3A3F5F] uppercase mb-8 tracking-[0.3em] border-b border-[#32312D]/5 pb-4 text-left">Secure Protocols</div>
                              <div className="space-y-6 text-left">
                                  <div className="p-8 bg-[#E7E6E2]/30 border border-[#32312D]/5 rounded-[32px] hover:border-[#3A3F5F]/20 transition-all text-left shadow-sm">
                                      <div className="text-[8px] font-black text-[#32312D]/40 uppercase tracking-widest mb-4 text-left">Official Comm Point</div>
                                      <div className="text-sm font-black text-[#32312D] truncate text-left">{viewingEmployer.user?.email || 'N/A'}</div>
                                  </div>
                                  {viewingEmployer.website && (
                                      <a href={viewingEmployer.website} target="_blank" className="block p-8 bg-[#E7E6E2]/30 border border-[#32312D]/5 rounded-[32px] hover:border-[#3A3F5F]/20 transition-all group text-left shadow-sm">
                                          <div className="text-[8px] font-black text-[#32312D]/40 uppercase tracking-widest mb-4 group-hover:text-[#3A3F5F] text-left">Neural Link (Website)</div>
                                          <div className="text-sm font-black text-[#32312D] truncate uppercase tracking-widest group-hover:underline underline-offset-8 text-left">Access Corporate Hub →</div>
                                      </a>
                                  )}
                              </div>
                          </div>
                      </div>

                      <div className="mt-12 text-left">
                          <div className="text-[10px] font-black text-[#3A3F5F] uppercase mb-8 tracking-[0.3em] border-b border-[#32312D]/5 pb-4 text-left">Targeted Nodes (Interests)</div>
                          {viewingEmployer.interests && viewingEmployer.interests.length > 0 ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {viewingEmployer.interests.map((interest: any) => (
                                      <div key={interest.id} className="p-6 bg-white rounded-[24px] border border-[#32312D]/10 flex flex-col gap-3 shadow-sm hover:border-[#3A3F5F]/30 transition-all text-left">
                                          <div className="flex justify-between items-start">
                                              <div>
                                                  <div className="text-xs font-black text-[#32312D] uppercase tracking-tight">{interest.engineer?.fullName || 'Anonymous Node'}</div>
                                                  <div className="text-[8px] font-black text-[#32312D]/40 uppercase tracking-widest mt-1">Status: {interest.status}</div>
                                              </div>
                                              <span className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest ${interest.type === 'LEASE' ? 'bg-[#3A3F5F]/5 text-[#3A3F5F]' : 'bg-[#E7E6E2] text-[#32312D]/60'}`}>
                                                  {interest.type}
                                              </span>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          ) : (
                              <div className="text-[#32312D]/30 text-xs font-black uppercase tracking-widest">No targets acquired yet.</div>
                          )}
                      </div>

                      <div className="mt-20 pt-12 border-t border-[#32312D]/5 flex justify-end gap-6 text-left">
                          <button 
                            onClick={() => handleApproveEmployer(viewingEmployer.id, !viewingEmployer.isApproved)} 
                            className={`px-12 py-5 rounded-full font-black text-xs uppercase tracking-[0.3em] transition-all shadow-md ${viewingEmployer.isApproved ? 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-500 hover:text-white' : 'bg-[#32312D] text-white hover:bg-[#3A3F5F]'}`}
                          >
                              {viewingEmployer.isApproved ? 'Revoke Protocol' : 'Issue Credentials'}
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default AdminDashboard;
