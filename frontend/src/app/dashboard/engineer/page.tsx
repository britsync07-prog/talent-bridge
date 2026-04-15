'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api, { getFileUrl } from '@/lib/api';
import LogoutButton from '@/components/LogoutButton';

const EngineerDashboard = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [fetching, setFetching] = useState(true);
  const [data, setData] = useState<any>({
    contracts: [],
    invoices: [],
    stats: {
      activeLinkCount: 0,
      pendingTaskCount: 0,
      totalEarnings: 0,
      totalEarned: 0
    },
    upcomingInterviews: []
  });

  const [profile, setProfile] = useState<any>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'stable' | 'syncing' | 'error'>('stable');

  // Messaging state
  const [employers, setEmployers] = useState<any[]>([]);
  const [selectedEmployer, setSelectedEmployer] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const msgEndRef = React.useRef<HTMLDivElement>(null);
  const msgPollRef = React.useRef<NodeJS.Timeout | null>(null);

  const hasFetched = React.useRef(false);

  useEffect(() => {
    if (loading) return;

    if (!user || user.role !== 'ENGINEER') {
      router.push('/login');
    } else if (!hasFetched.current) {
      hasFetched.current = true;
      fetchDashboardData();
      fetchEmployers();
    }
  }, [user?.id, user?.role, loading, router]);

  // Poll messages when an employer is selected
  React.useEffect(() => {
    if (!selectedEmployer) return;
    fetchMessages(selectedEmployer.userId);
    msgPollRef.current = setInterval(() => fetchMessages(selectedEmployer.userId), 5000);
    return () => { if (msgPollRef.current) clearInterval(msgPollRef.current); };
  }, [selectedEmployer]);

  // Scroll to bottom
  React.useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchDashboardData = async () => {
    setFetching(true);
    try {
      // Use individual try/catch or Promise.allSettled to handle missing/failing endpoints gracefully
      const [contractsRes, invoicesRes, profileRes, statsRes, interviewsRes] = await Promise.all([
        api.get('/contracts').catch(err => { console.warn('Contracts fetch failed', err); return { data: [] }; }),
        api.get('/payments/invoices').catch(err => { console.warn('Invoices fetch failed', err); return { data: [] }; }),
        api.get('/engineers/profile').catch(err => { console.warn('Profile fetch failed', err); return { data: null }; }),
        api.get('/engineers/stats').catch(err => { console.warn('Stats fetch failed', err); return { data: {} }; }),
        api.get('/engineers/interviews').catch(err => { console.warn('Interviews fetch failed', err); return { data: [] }; })
      ]);
      
      setData({
        contracts: contractsRes.data || [],
        invoices: invoicesRes.data || [],
        stats: statsRes.data || {},
        upcomingInterviews: interviewsRes.data || []
      });
      if (profileRes.data) setProfile(profileRes.data);
    } catch (err) {
      console.error('Critical error fetching dashboard data:', err);
    } finally {
      setFetching(false);
    }
  };

  const fetchEmployers = async () => {
    try {
      const res = await api.get('/engineers/my-employers');
      setEmployers(res.data || []);
    } catch (err) {
      console.warn('Failed to fetch employers (likely endpoint missing on remote API)', err);
    }
  };

  const fetchMessages = async (receiverId: string) => {
    try {
      const res = await api.get(`/messages/${receiverId}`);
      setMessages(res.data || []);
    } catch (err) {
      console.warn('Failed to fetch messages', err);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedEmployer || sendingMsg) return;
    setSendingMsg(true);
    try {
      await api.post('/messages', { receiverId: selectedEmployer.userId, content: newMessage.trim() });
      setNewMessage('');
      await fetchMessages(selectedEmployer.userId);
    } catch (err) {
      alert('Failed to send message');
    } finally {
      setSendingMsg(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setSyncStatus('syncing');
    try {
      // The backend expects a nested profile update or flat fields depending on implementation
      await api.patch('/engineers/profile', profile);
      setSyncStatus('stable');
      alert('Profile updated successfully.');
    } catch (err) {
      setSyncStatus('error');
      alert('Update Failed');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'resume' | 'video' | 'certifications' | 'profilePic') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append(type, file);

    setSyncStatus('syncing');
    try {
      // Using the base profile endpoint as /upload likely doesn't exist
      const res = await api.patch('/engineers/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProfile(res.data);
      setSyncStatus('stable');
      alert('File Uploaded');
    } catch (err) {
      setSyncStatus('error');
      console.error('Upload error:', err);
      alert('Upload failed');
    }
  };

  const handleVerifyRequest = async () => {
    try {
      await api.post('/engineers/verify-request');
      alert('Verification request sent.');
    } catch (err) {
      alert('Failed to send request');
    }
  };

  if (loading || !user || fetching) return (
    <div className="min-h-screen bg-[#E7E6E2] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-[#32312D]/10 border-t-[#3A3F5F] rounded-full animate-spin"></div>
        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#3A3F5F]">Loading Dashboard...</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#E7E6E2] text-[#32312D] flex flex-col font-sans selection:bg-[#3A3F5F] selection:text-white">

      <main className="max-w-[1600px] mx-auto w-full px-6 py-12 flex-1">
        {/* Header Section */}
        <div className="relative mb-12 p-10 rounded-[40px] bg-white border border-[#32312D]/10 shadow-sm overflow-hidden group">
            <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 text-left">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 bg-[#3A3F5F]/5 border border-[#3A3F5F]/10 rounded-full text-[10px] font-black uppercase tracking-widest text-[#3A3F5F]">Engineer Dashboard</span>
                        <span className="w-2 h-2 rounded-full bg-[#3A3F5F] animate-pulse"></span>
                    </div>
                    <h1 className="text-5xl font-black mb-3 tracking-tighter uppercase">
                        Welcome, {user?.fullName?.split(' ')[0] || 'Engineer'}
                    </h1>
                    <p className="text-slate-400 font-medium text-lg uppercase tracking-widest text-xs">Manage your profile and active jobs</p>
                </div>

                <div className="flex flex-wrap gap-4">
                    <div className="bg-[#3A3F5F]/5 px-8 py-4 rounded-2xl border border-[#3A3F5F]/10 min-w-[200px]">
                        <div className="text-[8px] font-black text-[#3A3F5F] uppercase tracking-[0.2em] mb-1">Expected Earnings</div>
                        <div className="text-2xl font-black text-[#3A3F5F]">${data.stats?.totalEarnings?.toLocaleString() || '0'}</div>
                    </div>
                    <div className="bg-white border border-[#32312D]/10 px-8 py-4 rounded-2xl min-w-[150px]">
                        <div className="text-[8px] font-black text-[#32312D]/30 uppercase tracking-[0.2em] mb-1 text-left">Profile Status</div>
                        <div className={`text-[10px] font-black uppercase tracking-widest text-left ${profile?.approvalStatus === 'FULLY_APPROVED' ? 'text-emerald-500' : 'text-orange-400'}`}>
                            {profile?.approvalStatus || 'NEW'}
                        </div>
                    </div>
                    <LogoutButton />
                </div>
            </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            {[
                { label: 'Active Jobs', value: data.stats?.activeLinkCount || 0, icon: '⚡' },
                { label: 'Tasks', value: data.stats?.pendingTaskCount || 0, icon: '📋' },
                { label: 'Expected Earnings', value: `$${data.stats?.totalEarnings?.toLocaleString() || '0'}`, icon: '💰' },
                { label: 'Total Earned', value: `$${data.stats?.totalEarned?.toLocaleString() || '0'}`, icon: '🏛️' }
            ].map((stat, i) => (
                <div key={i} className="p-8 rounded-[32px] bg-white border border-[#32312D]/5 shadow-sm text-left">
                    <div className="w-10 h-10 rounded-xl bg-[#E7E6E2] flex items-center justify-center text-xl mb-6 border border-[#32312D]/10">{stat.icon}</div>
                    <div className="text-3xl font-black text-[#32312D] mb-1">{stat.value}</div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</div>
                </div>
            ))}
        </div>

        {/* Status Alert */}
        {profile?.approvalStatus === 'PENDING' && (
            <div className="mb-12 p-8 rounded-[32px] bg-[#3A3F5F] text-white flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl shadow-[#3A3F5F]/20 animate-in fade-in slide-in-from-top-4">
                <div className="text-left">
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] mb-2 opacity-60">Account Status</div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">Complete your profile setup</h3>
                    <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-2 leading-relaxed">Your profile is currently waiting for review. Please ensure all your information and files are uploaded.</p>
                </div>
                <button 
                    onClick={handleVerifyRequest}
                    className="bg-white text-[#3A3F5F] px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#E7E6E2] transition-all whitespace-nowrap"
                >
                    Verify Profile
                </button>
            </div>
        )}

        <div className="flex flex-col lg:flex-row gap-12">
            <aside className="w-full lg:w-64 space-y-2">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'jobs', label: 'Active Jobs' },
                  { id: 'messages', label: 'Messages' },
                  { id: 'profile', label: 'Profile' },
                  { id: 'earnings', label: 'Earnings' }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.15em] transition-all group ${
                            activeTab === tab.id 
                            ? 'bg-[#3A3F5F] text-white shadow-lg shadow-[#3A3F5F]/20' 
                            : 'text-slate-400 hover:text-[#32312D] hover:bg-[#E7E6E2]'
                        }`}
                    >
                        {tab.label}
                        <span className={`w-1.5 h-1.5 rounded-full transition-all ${activeTab === tab.id ? 'bg-white' : 'bg-transparent group-hover:bg-[#3A3F5F]'}`}></span>
                    </button>
                ))}
            </aside>

            <div className="flex-1 min-w-0">
                {activeTab === 'overview' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-12">
                        {/* Active Jobs List */}
                        <div className="space-y-8">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-black uppercase tracking-tight text-[#32312D]">Active Jobs</h2>
                                <Link href="/engineers" className="text-[10px] font-black text-[#3A3F5F] uppercase tracking-widest hover:underline">View All →</Link>
                            </div>
                            {data.contracts.length === 0 ? (
                                <div className="p-20 rounded-[40px] border border-dashed border-[#32312D]/10 bg-white/50 text-center">
                                    <div className="text-4xl mb-4 opacity-20">📡</div>
                                    <div className="text-slate-400 font-black uppercase text-[10px] tracking-widest">No active jobs found</div>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {data.contracts.map((contract: any) => (
                                        <div key={contract.id} className="bg-white p-8 rounded-[32px] border border-[#32312D]/5 flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm hover:shadow-md transition-all">
                                            <div className="flex items-center gap-6 text-left">
                                                <div className="w-14 h-14 bg-[#E7E6E2] rounded-2xl flex items-center justify-center text-xl text-[#3A3F5F] font-bold">🏢</div>
                                                <div>
                                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Company: {contract.employer?.companyName}</div>
                                                    <div className="text-xl font-black text-[#32312D] uppercase tracking-tight">Active Job</div>
                                                </div>
                                            </div>
                                            <Link href={`/dashboard/engineer/contracts/${contract.id}`} className="bg-[#3A3F5F] text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#32312D] transition-all shadow-lg shadow-[#3A3F5F]/10">Manage</Link>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Interview Requests */}
                        <div className="space-y-8">
                            <h2 className="text-2xl font-black uppercase tracking-tight text-[#32312D]">Interview Requests</h2>
                            {data.upcomingInterviews.length === 0 ? (
                                <div className="p-20 rounded-[40px] border border-dashed border-[#32312D]/10 bg-white/50 text-center">
                                    <div className="text-4xl mb-4 opacity-20">🔔</div>
                                    <div className="text-slate-400 font-black uppercase text-[10px] tracking-widest">No interview requests found</div>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {data.upcomingInterviews.map((interview: any) => (
                                        <div key={interview.id} className="bg-white p-8 rounded-[32px] border border-[#32312D]/5 flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm text-left">
                                            <div className="flex items-center gap-6">
                                                <div className="w-14 h-14 bg-[#3A3F5F]/5 rounded-2xl flex items-center justify-center text-xl text-[#3A3F5F]">🤝</div>
                                                <div>
                                                    <div className="text-lg font-black text-[#32312D] uppercase tracking-tight">{interview.employer?.companyName}</div>
                                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                                        {new Date(interview.scheduledAt).toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>
                                            <a href={`https://meet.truecrm.online${interview.joinUrl}`} target="_blank" className="bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-md">Join Call</a>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'messages' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black uppercase tracking-tight text-[#32312D]">Messages</h2>
                            <div className="h-px flex-1 mx-8 bg-[#32312D]/10"></div>
                            <span className="text-[10px] font-black text-[#32312D]/30 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
                                Active Chat
                            </span>
                        </div>

                        {employers.length === 0 ? (
                            <div className="p-20 rounded-[40px] border border-dashed border-[#32312D]/10 bg-white/50 text-center">
                                <div className="text-4xl mb-4 opacity-20 grayscale">💬</div>
                                <div className="text-[#32312D]/40 font-black uppercase text-[10px] tracking-widest">No active jobs. Companies will contact you here.</div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-[40px] border border-[#32312D]/10 shadow-sm overflow-hidden flex h-[70vh]">
                                {/* Employer List */}
                                <div className="w-72 shrink-0 border-r border-[#32312D]/8 flex flex-col">
                                    <div className="p-6 border-b border-[#32312D]/8">
                                        <div className="text-[8px] font-black text-[#32312D]/30 uppercase tracking-[0.3em]">Your Companies</div>
                                    </div>
                                    <div className="overflow-y-auto flex-1">
                                        {employers.map((emp: any) => (
                                            <button
                                                key={emp.id}
                                                onClick={() => { setSelectedEmployer(emp); setMessages([]); }}
                                                className={`w-full px-6 py-5 flex items-center gap-4 text-left transition-all hover:bg-[#E7E6E2]/50 border-b border-[#32312D]/5 ${selectedEmployer?.id === emp.id ? 'bg-[#3A3F5F]/5 border-l-2 border-l-[#3A3F5F]' : ''}`}
                                            >
                                                <div className="w-10 h-10 rounded-2xl bg-[#3A3F5F]/10 flex items-center justify-center font-black text-[#3A3F5F] text-sm shrink-0">
                                                    🏢
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-black text-[#32312D] text-xs uppercase tracking-tight truncate">{emp.companyName}</div>
                                                    <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Contact</div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Chat Area */}
                                <div className="flex-1 flex flex-col min-w-0">
                                    {!selectedEmployer ? (
                                        <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 p-10">
                                            <div className="w-20 h-20 rounded-[28px] bg-[#E7E6E2] flex items-center justify-center text-4xl">💬</div>
                                            <div className="text-[10px] font-black text-[#32312D]/30 uppercase tracking-widest">Select a company to start chatting</div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="px-8 py-5 border-b border-[#32312D]/8 flex items-center gap-4 text-left">
                                                <div className="w-10 h-10 rounded-2xl bg-[#3A3F5F] flex items-center justify-center font-black text-white text-sm">
                                                    🏢
                                                </div>
                                                <div>
                                                    <div className="font-black text-[#32312D] uppercase text-sm tracking-tight">{selectedEmployer.companyName}</div>
                                                    <div className="text-[8px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1.5">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block"></span> Active Chat
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4">
                                                {messages.map((msg: any) => {
                                                    const isMe = msg.senderId === user?.id;
                                                    return (
                                                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                            <div className={`max-w-[70%] px-5 py-3 rounded-3xl ${isMe ? 'bg-[#3A3F5F] text-white rounded-br-lg' : 'bg-[#E7E6E2] text-[#32312D] rounded-bl-lg'}`}>
                                                                <p className="text-sm font-medium leading-relaxed text-left">{msg.content}</p>
                                                                <p className={`text-[8px] font-black uppercase tracking-widest mt-1 ${isMe ? 'text-white/50 text-right' : 'text-[#32312D]/40 text-left'}`}>
                                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                                <div ref={msgEndRef} />
                                            </div>

                                            <div className="px-6 py-5 border-t border-[#32312D]/8 flex items-center gap-4">
                                                <input
                                                    type="text"
                                                    value={newMessage}
                                                    onChange={e => setNewMessage(e.target.value)}
                                                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                                                    placeholder="Type a message…"
                                                    className="flex-1 px-6 py-4 bg-[#E7E6E2]/50 border border-[#32312D]/10 rounded-2xl outline-none focus:border-[#3A3F5F] transition-all font-medium text-[#32312D] text-sm"
                                                />
                                                <button
                                                    onClick={handleSendMessage}
                                                    disabled={sendingMsg || !newMessage.trim()}
                                                    className="bg-[#3A3F5F] text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#32312D] transition-all disabled:opacity-40"
                                                >
                                                    ↑ Send
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'profile' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-12">
                        <div className="bg-white p-10 rounded-[40px] border border-[#32312D]/5 shadow-sm text-left">
                            <h2 className="text-3xl font-black mb-10 tracking-tight uppercase text-[#32312D]">Profile Information</h2>
                            <form onSubmit={handleProfileUpdate} className="space-y-12">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    <div className="space-y-8">
                                        <div className="flex items-center gap-8 mb-4">
                                            <div className="relative group">
                                                <div className="w-24 h-24 rounded-3xl bg-[#E7E6E2] border-2 border-[#32312D]/10 flex items-center justify-center text-4xl overflow-hidden relative">
                                                    {profile?.profilePic ? <img src={getFileUrl(profile.profilePic)} className="w-full h-full object-cover grayscale" /> : '👤'}
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <span className="text-[8px] font-black text-white uppercase tracking-widest">Change Photo</span>
                                                    </div>
                                                </div>
                                                <input type="file" onChange={e => handleFileUpload(e, 'profilePic')} className="absolute inset-0 opacity-0 cursor-pointer" />
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Profile Picture</div>
                                                <div className="text-xs font-black text-[#32312D] uppercase tracking-tight">{user.fullName}</div>
                                            </div>
                                        </div>

                                        <div className="space-y-3 text-left">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Full Name</label>
                                            <input
                                                type="text"
                                                className="w-full px-6 py-4 bg-[#E7E6E2]/20 border border-[#32312D]/10 rounded-2xl outline-none focus:border-[#3A3F5F] transition-all font-bold text-[#32312D] uppercase text-xs"
                                                value={profile?.fullName || ''}
                                                onChange={e => setProfile({ ...profile, fullName: e.target.value })}
                                            />
                                        </div>

                                        <div className="space-y-3 text-left">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Location</label>
                                            <input
                                                type="text"
                                                className="w-full px-6 py-4 bg-[#E7E6E2]/20 border border-[#32312D]/10 rounded-2xl outline-none focus:border-[#3A3F5F] transition-all font-bold text-[#32312D] uppercase text-xs"
                                                value={profile?.country || ''}
                                                onChange={e => setProfile({ ...profile, country: e.target.value })}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-3 text-left">
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Experience (Years)</label>
                                                <input
                                                    type="number"
                                                    className="w-full px-6 py-4 bg-[#E7E6E2]/20 border border-[#32312D]/10 rounded-2xl outline-none focus:border-[#3A3F5F] transition-all font-bold text-[#32312D] text-xs"
                                                    value={profile?.yearsExperience || 0}
                                                    onChange={e => setProfile({ ...profile, yearsExperience: parseInt(e.target.value) })}
                                                />
                                            </div>
                                            <div className="space-y-3 text-left">
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Hourly Rate ($)</label>
                                                <input
                                                    type="number"
                                                    className="w-full px-6 py-4 bg-[#E7E6E2]/20 border border-[#32312D]/10 rounded-2xl outline-none focus:border-[#3A3F5F] transition-all font-bold text-[#32312D] text-xs"
                                                    value={profile?.hourlyRate || 0}
                                                    onChange={e => setProfile({ ...profile, hourlyRate: parseInt(e.target.value) })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="space-y-3 text-left">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Skills & Expertise</label>
                                            <textarea
                                                className="w-full px-6 py-4 bg-[#E7E6E2]/20 border border-[#32312D]/10 rounded-2xl outline-none focus:border-[#3A3F5F] transition-all font-medium text-slate-600 h-24 resize-none"
                                                value={profile?.aiSpecializations || ''}
                                                onChange={e => setProfile({ ...profile, aiSpecializations: e.target.value })}
                                                placeholder="LIST YOUR SKILLS..."
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="space-y-4">
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Resume</label>
                                                <div className="relative">
                                                    <div className={`p-6 rounded-2xl border-2 border-dashed transition-all flex items-center justify-between ${profile?.resumeUrl ? 'bg-emerald-50/30 border-emerald-100' : 'bg-[#E7E6E2]/20 border-[#32312D]/10 hover:border-[#3A3F5F]'}`}>
                                                        <span className="text-[10px] font-black uppercase text-[#32312D]/40">{profile?.resumeUrl ? 'File Uploaded' : 'Upload Resume (PDF)'}</span>
                                                        {profile?.resumeUrl && <a href={getFileUrl(profile.resumeUrl)} target="_blank" className="text-[10px] font-black text-[#3A3F5F] underline uppercase">View File</a>}
                                                    </div>
                                                    <input type="file" onChange={e => handleFileUpload(e, 'resume')} className="absolute inset-0 opacity-0 cursor-pointer" />
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Intro Video</label>
                                                <div className="relative">
                                                    <div className={`p-6 rounded-2xl border-2 border-dashed transition-all flex items-center justify-between ${profile?.videoUrl ? 'bg-emerald-50/30 border-emerald-100' : 'bg-[#E7E6E2]/20 border-[#32312D]/10 hover:border-[#3A3F5F]'}`}>
                                                        <span className="text-[10px] font-black uppercase text-[#32312D]/40">{profile?.videoUrl ? 'File Uploaded' : 'Upload Video (MP4)'}</span>
                                                        {profile?.videoUrl && <a href={getFileUrl(profile.videoUrl)} target="_blank" className="text-[10px] font-black text-[#3A3F5F] underline uppercase">View File</a>}
                                                    </div>
                                                    <input type="file" onChange={e => handleFileUpload(e, 'video')} className="absolute inset-0 opacity-0 cursor-pointer" />
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Certifications</label>
                                                <div className="relative">
                                                    <div className={`p-6 rounded-2xl border-2 border-dashed transition-all flex items-center justify-between ${profile?.certifications ? 'bg-emerald-50/30 border-emerald-100' : 'bg-[#E7E6E2]/20 border-[#32312D]/10 hover:border-[#3A3F5F]'}`}>
                                                        <span className="text-[10px] font-black uppercase text-[#32312D]/40">{profile?.certifications ? 'File Uploaded' : 'Upload Certifications'}</span>
                                                        {profile?.certifications && <a href={getFileUrl(profile.certifications)} target="_blank" className="text-[10px] font-black text-[#3A3F5F] underline uppercase">View File</a>}
                                                    </div>
                                                    <input type="file" onChange={e => handleFileUpload(e, 'certifications')} className="absolute inset-0 opacity-0 cursor-pointer" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-10 border-t border-[#32312D]/5 flex flex-col md:flex-row justify-between items-center gap-8">
                                    <div className="text-[10px] font-black text-[#32312D]/40 uppercase tracking-widest">
                                        Status: <span className={syncStatus === 'syncing' ? 'text-[#3A3F5F] animate-pulse' : syncStatus === 'error' ? 'text-red-500' : 'text-emerald-600'}>
                                            {syncStatus === 'syncing' ? 'Saving...' : syncStatus === 'error' ? 'Error' : 'Saved'}
                                        </span>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={savingProfile}
                                        className="w-full md:w-auto bg-[#3A3F5F] text-white px-20 py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] hover:bg-[#32312D] transition-all shadow-xl shadow-[#3A3F5F]/10"
                                    >
                                        {savingProfile ? 'Saving...' : 'Update Profile'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {activeTab === 'earnings' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                        <h2 className="text-2xl font-black uppercase tracking-tight mb-8 text-[#32312D]">Earnings History</h2>
                        {data.invoices.length === 0 ? (
                            <div className="p-20 rounded-[40px] border border-dashed border-[#32312D]/10 bg-white/50 text-center text-slate-400 font-black uppercase text-[10px] tracking-widest">No earnings history</div>
                        ) : (
                            <div className="bg-white rounded-[32px] border border-[#32312D]/5 overflow-hidden shadow-sm">
                                <table className="w-full text-left">
                                    <thead className="bg-[#E7E6E2]/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                        <tr>
                                            <th className="px-8 py-6">Invoice ID</th>
                                            <th className="px-8 py-6">Company</th>
                                            <th className="px-8 py-6 text-right">Amount</th>
                                            <th className="px-8 py-6">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#E7E6E2]">
                                        {data.invoices.map((inv: any) => (
                                            <tr key={inv.id} className="group hover:bg-[#E7E6E2]/30 transition-colors">
                                                <td className="px-8 py-6 font-mono text-[10px] text-slate-400">#{inv.id.slice(0,12)}</td>
                                                <td className="px-8 py-6 font-black text-[#32312D] text-xs tracking-tight uppercase">{inv.contract.employer.companyName}</td>
                                                <td className="px-8 py-6 text-right font-black text-[#32312D] text-sm">${inv.amount.toLocaleString()}</td>
                                                <td className="px-8 py-6">
                                                    <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${inv.status === 'PAID' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                                                        {inv.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
      </main>
    </div>
  );
};

export default EngineerDashboard;
