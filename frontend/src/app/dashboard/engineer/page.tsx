'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api, { getFileUrl } from '@/lib/api';
import LogoutButton from '@/components/LogoutButton';

const FileUploadZone = ({ id, label, accept, icon, onFileSelect, currentFile, maxSize }: any) => {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState('');

  const validateAndSelect = (file: File) => {
    if (maxSize && file.size > maxSize) {
      alert(`File size exceeds limit of ${Math.round(maxSize / (1024 * 1024))}MB.`);
      return;
    }
    setFileName(file.name);
    onFileSelect(file);
  };

  const handleDrag = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: any) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSelect(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-[10px] font-black text-[#32312D]/60 uppercase tracking-[0.3em]">{label}</label>
      <div 
        onDragEnter={handleDrag} 
        onDragLeave={handleDrag} 
        onDragOver={handleDrag} 
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-[32px] p-10 text-center transition-all ${
          dragActive ? 'border-[#3A3F5F] bg-[#3A3F5F]/5' : 'border-[#32312D]/10 bg-white hover:border-[#3A3F5F]/30'
        }`}
      >
        <input 
          id={id}
          type="file" 
          accept={accept}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="flex flex-col items-center">
          <span className="text-4xl mb-4 grayscale opacity-50">{icon}</span>
          <p className="text-[10px] font-black text-[#32312D]/40 uppercase tracking-widest">
            {fileName || (currentFile ? 'Document Linked' : 'Drag & Drop or Click to Upload')}
          </p>
          {currentFile && !fileName && (
            <Link 
              href={getFileUrl(currentFile)} 
              target="_blank" 
              className="mt-4 text-[10px] text-[#3A3F5F] font-black uppercase tracking-widest hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              Verify Current Data →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

const EngineerDashboard = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('contracts');
  const [data, setData] = useState<any>({
    contracts: [],
    invoices: [],
    suggestedJobs: [],
    endorsements: [],
    stats: { totalEarned: 0, activeProjectCount: 0, nextGoal: 50000 },
    timesheets: []
  });
  const [fetching, setFetching] = useState(true);
  
  const [profile, setProfile] = useState<any>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const [selectedResume, setSelectedResume] = useState<File | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [selectedCerts, setSelectedCerts] = useState<File[]>([]);
  const [selectedPic, setSelectedPic] = useState<File | null>(null);
  const [picPreview, setSelectedPicPreview] = useState<string | null>(null);

  // Workspace / messaging state
  const [wsEmployer, setWsEmployer] = useState<any>(null);
  const [wsMessages, setWsMessages] = useState<any[]>([]);
  const [wsNewMsg, setWsNewMsg] = useState('');
  const [wsSending, setWsSending] = useState(false);
  const wsMsgEndRef = React.useRef<HTMLDivElement>(null);
  const wsPollRef = React.useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ENGINEER')) {
      router.push('/login');
    } else if (user?.role === 'ENGINEER') {
      fetchDashboardData();
    }
  }, [user, loading, router]);

  React.useEffect(() => {
    if (!wsEmployer) return;
    fetchWsMessages(wsEmployer.userId);
    wsPollRef.current = setInterval(() => fetchWsMessages(wsEmployer.userId), 5000);
    return () => { if (wsPollRef.current) clearInterval(wsPollRef.current); };
  }, [wsEmployer]);

  React.useEffect(() => {
    wsMsgEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [wsMessages]);

  const fetchDashboardData = async () => {
    setFetching(true);
    try {
      const [contractsRes, invoicesRes, profileRes, statsRes, suggestedRes, timesheetsRes, endorsementsRes] = await Promise.all([
        api.get('/contracts'),
        api.get('/payments/invoices'),
        api.get('/engineers/profile'),
        api.get('/engineers/stats'),
        api.get('/engineers/suggested-jobs'),
        api.get('/engineers/timesheets'),
        api.get('/engineers/endorsements')
      ]);
      setData((prev: any) => ({
        ...prev,
        contracts: contractsRes.data || [],
        invoices: invoicesRes.data || [],
        stats: statsRes.data,
        suggestedJobs: suggestedRes.data || [],
        timesheets: timesheetsRes.data || [],
        endorsements: endorsementsRes.data || []
      }));
      setProfile(profileRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  const fetchWsMessages = async (receiverId: string) => {
    try {
      const res = await api.get(`/messages/${receiverId}`);
      setWsMessages(res.data || []);
    } catch (err) { console.error(err); }
  };

  const handleWsSend = async () => {
    if (!wsNewMsg.trim() || !wsEmployer || wsSending) return;
    setWsSending(true);
    try {
      await api.post('/messages', { receiverId: wsEmployer.userId, content: wsNewMsg.trim() });
      setWsNewMsg('');
      await fetchWsMessages(wsEmployer.userId);
    } catch { alert('Failed to send'); }
    finally { setWsSending(false); }
  };

  const handleRemoveCertificate = async (certId: string) => {
    if (!confirm('Remove this certificate?')) return;
    try {
        await api.delete(`/engineers/certificates/${certId}`);
        alert('Certificate removed.');
        fetchDashboardData();
    } catch {
        alert('Failed to remove certificate');
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const hasPic = profile.profilePic || selectedPic;
    const hasVideo = profile.videoUrl || selectedVideo;

    if (!hasPic || !hasVideo) {
        alert('Profile Picture and Introduction Video are mandatory to complete your roster induction.');
        if (!hasPic) document.getElementById('profilePic')?.scrollIntoView({ behavior: 'smooth' });
        else document.getElementById('video-upload')?.scrollIntoView({ behavior: 'smooth' });
        return;
    }

    // Check video size limit
    if (selectedVideo && selectedVideo.size > 20 * 1024 * 1024) {
        alert('Video file size exceeds 20MB limit. Please compress or select a smaller file.');
        return;
    }

    setSavingProfile(true);
    const formData = new FormData();
    
    Object.keys(profile).forEach(key => {
        if (!['id', 'userId', 'createdAt', 'updatedAt', 'user', 'resumeUrl', 'videoUrl', 'certificates', 'profilePic', 'contracts', 'interests', 'isProfileComplete'].includes(key)) {
            formData.append(key, profile[key] || '');
        }
    });

    if (selectedResume) formData.append('resume', selectedResume);
    if (selectedVideo) formData.append('video', selectedVideo);
    if (selectedPic) formData.append('profilePic', selectedPic);
    
    if (selectedCerts.length > 0) {
        selectedCerts.forEach(file => {
            formData.append('certifications', file);
        });
    }

    try {
        await api.patch('/engineers/profile', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('Roster Metadata Updated.');
        fetchDashboardData();
        setSelectedResume(null);
        setSelectedVideo(null);
        setSelectedCerts([]);
        setSelectedPic(null);
    } catch (err: any) {
        alert(err.response?.data?.message || 'Update Protocol Failed');
    } finally {
        setSavingProfile(false);
    }
  };

  const handlePicSelect = (file: File) => {
    setSelectedPic(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedPicPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSignContract = async (id: string) => {
    if(!confirm('Authorize engagement terms?')) return;
    try {
        await api.patch(`/contracts/${id}/sign`);
        fetchDashboardData();
    } catch (err) {
        alert('Authorization Failed');
    }
  };

  const handleDeclineContract = async (id: string) => {
    if(!confirm('Abort this link request?')) return;
    try {
        await api.patch(`/contracts/${id}/decline`);
        fetchDashboardData();
    } catch (err) {
        alert('Request Aborted');
    }
  };

  const handleUpdateTask = async (taskId: string, status: string) => {
    try {
        await api.patch(`/tasks/${taskId}/status`, { status });
        fetchDashboardData();
    } catch (err) {
        alert('Sync Failed');
    }
  };

  const handleRequestInterview = async () => {
    try {
        await api.patch(`/admin/engineers/${profile.id}/status`, { approvalStatus: 'ACCEPTED_FOR_INTERVIEW' });
        alert('Verification signal broadcast.');
        fetchDashboardData();
    } catch (err) {
        alert('Broadcast Failed');
    }
  };

  if (loading || !user || fetching) return (
    <div className="min-h-screen bg-[#E7E6E2] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-[#3A3F5F]/10 border-t-[#3A3F5F] rounded-full animate-spin"></div>
        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#3A3F5F]">Synchronizing Terminal...</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#E7E6E2] text-[#32312D] flex flex-col font-sans selection:bg-[#3A3F5F] selection:text-white">
      
      
      <main className="max-w-[1600px] mx-auto w-full px-6 py-12 flex-1">
        {/* Header Section */}
        <div className="relative mb-12 p-10 rounded-[40px] bg-white border border-[#32312D]/10 shadow-sm overflow-hidden group">
            <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                <div className="text-left">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 bg-[#3A3F5F]/5 border border-[#3A3F5F]/10 rounded-full text-[10px] font-black uppercase tracking-widest text-[#3A3F5F]">Engineer Terminal v4.0</span>
                        <span className="w-2 h-2 rounded-full bg-[#3A3F5F] animate-pulse"></span>
                    </div>
                    <h1 className="text-5xl font-black mb-3 tracking-tighter text-[#32312D] uppercase">
                        Operator: {profile?.fullName?.split(' ')[0] || 'Agent'}
                    </h1>
                    <p className="text-[#32312D]/60 font-medium text-lg uppercase tracking-widest text-xs">Uplink Status: <span className="text-[#3A3F5F]">{profile?.isProfileComplete ? 'Synchronized' : 'Incomplete'}</span></p>
                </div>

                {!profile?.isProfileComplete && (
                    <div className="absolute top-0 right-0 p-4">
                         <div className="bg-[#3A3F5F] text-white px-6 py-2 rounded-bl-3xl font-black text-[8px] uppercase tracking-[0.3em] animate-pulse">Action Required: Complete Induction</div>
                    </div>
                )}

                {profile && (
                    <div className="p-px rounded-[32px] bg-[#32312D]/5">
                        <div className="bg-white p-6 rounded-[30px] flex items-center gap-6 min-w-[320px] border border-[#32312D]/5 shadow-sm">
                            <div className="relative">
                                <div className="w-16 h-16 rounded-2xl bg-[#3A3F5F]/5 flex items-center justify-center text-2xl border border-[#3A3F5F]/10 overflow-hidden text-[#3A3F5F]">
                                    {(picPreview || profile.profilePic) ? (
                                      <img 
                                        src={picPreview || getFileUrl(profile.profilePic)} 
                                        alt="Profile" 
                                        className="w-full h-full object-cover grayscale"
                                      />
                                    ) : profile.fullName?.charAt(0)}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#3A3F5F] border-4 border-white rounded-full"></div>
                            </div>
                            <div className="flex-1 text-left">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[10px] font-black text-[#32312D]/40 uppercase tracking-widest">Protocol Status</span>
                                    {profile.approvalStatus === 'PENDING' && (
                                        <button onClick={handleRequestInterview} className="text-[10px] font-black text-[#3A3F5F] hover:text-[#32312D] transition-colors uppercase underline decoration-2 underline-offset-4">Verify Node</button>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-sm font-black uppercase tracking-tight ${
                                        profile.approvalStatus === 'FULLY_APPROVED' ? 'text-[#3A3F5F]' : 'text-[#32312D]/40'
                                    }`}>
                                        {profile.approvalStatus || 'INITIALIZING'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <LogoutButton />
                    </div>
                )}
            </div>
        </div>

        {/* Tactical Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            {[
                { label: 'Active Links', value: data.contracts.filter((c: any) => c.status === 'ACTIVE').length, icon: '⚡' },
                { label: 'Pending Tasks', value: data.contracts.reduce((acc: number, c: any) => acc + (c.tasks?.length || 0), 0), icon: '📡' },
                { label: 'Neural Payouts', value: `$${data.contracts.filter((c: any) => c.status === 'ACTIVE').reduce((acc: number, c: any) => acc + (c.salary || 0), 0).toLocaleString()}`, icon: '💎' },
                { label: 'Total Equity', value: `$${data.invoices.filter((i: any) => i.status === 'PAID').reduce((acc: number, i: any) => acc + i.amount, 0).toLocaleString()}`, icon: '📀' }
            ].map((stat, i) => (
                <div key={i} className="group relative p-8 rounded-[32px] bg-white border border-[#32312D]/5 hover:border-[#3A3F5F]/30 transition-all duration-500 overflow-hidden shadow-sm">
                    <div className="relative z-10 text-left">
                        <div className="flex justify-between items-center mb-6">
                            <span className="w-10 h-10 rounded-xl bg-[#3A3F5F]/5 flex items-center justify-center text-xl border border-[#3A3F5F]/10 text-[#3A3F5F]">{stat.icon}</span>
                            <span className="text-[10px] font-black text-[#3A3F5F] bg-[#3A3F5F]/5 px-2 py-1 rounded-lg uppercase tracking-tighter">Live</span>
                        </div>
                        <div className="text-3xl font-black text-[#32312D] mb-1 tracking-tight">{stat.value}</div>
                        <div className="text-[10px] font-black text-[#32312D]/40 uppercase tracking-[0.2em]">{stat.label}</div>
                    </div>
                </div>
            ))}
        </div>

        {/* Sidebar Nav + Content */}
        <div className="flex flex-col lg:flex-row gap-12">
            <aside className="w-full lg:w-64 space-y-2">
                {['contracts', 'interests', 'tasks', 'timesheets', 'earnings', 'workspace', 'profile'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
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
                {activeTab === 'contracts' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black uppercase tracking-tight text-[#32312D]">Operational Links</h2>
                            <div className="h-px flex-1 mx-8 bg-[#32312D]/10"></div>
                        </div>
                        
                        {data.contracts.length === 0 ? (
                            <div className="p-20 rounded-[40px] border border-dashed border-[#32312D]/10 bg-white/[0.5] text-center">
                                <div className="text-4xl mb-4 opacity-20 grayscale">🕳️</div>
                                <div className="text-[#32312D]/40 font-black uppercase text-[10px] tracking-widest">No active transmissions detected.</div>
                            </div>
                        ) : (
                            <div className="grid gap-6">
                                {data.contracts.map((contract: any) => (
                                    <div key={contract.id} className="bg-white border border-[#32312D]/10 rounded-[32px] p-8 flex flex-col md:flex-row justify-between items-center gap-8 shadow-sm hover:shadow-md transition-all">
                                        <div className="flex items-center gap-8 text-left w-full md:w-auto">
                                            <div className="w-20 h-20 rounded-3xl bg-[#3A3F5F]/5 border border-[#3A3F5F]/10 flex items-center justify-center text-3xl grayscale opacity-50">🏢</div>
                                            <div>
                                                <div className="text-[10px] font-black text-[#3A3F5F] uppercase tracking-[0.3em] mb-2">Corporate Node</div>
                                                <h3 className="text-2xl font-black text-[#32312D] tracking-tight mb-2 uppercase">{contract.employer.companyName}</h3>
                                                <div className="text-sm font-bold text-[#32312D]/40 flex items-center gap-2">
                                                    Allocation: <span className="text-[#32312D]">${contract.salary.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-4 w-full md:w-auto">
                                            {contract.status === 'PENDING' ? (
                                                <>
                                                    <button 
                                                        onClick={() => handleSignContract(contract.id)}
                                                        className="flex-1 md:flex-none bg-[#3A3F5F] text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#32312D] transition-all shadow-md"
                                                    >
                                                        Authorize
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeclineContract(contract.id)}
                                                        className="flex-1 md:flex-none border border-[#32312D]/10 text-[#32312D]/40 px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-red-500 hover:text-red-500 transition-all"
                                                    >
                                                        Decline
                                                    </button>
                                                </>
                                            ) : (
                                                <div className="flex items-center gap-3 px-6 py-3 bg-[#3A3F5F]/5 border border-[#3A3F5F]/10 rounded-2xl">
                                                    <div className="w-2 h-2 rounded-full bg-[#3A3F5F] animate-pulse"></div>
                                                    <span className="text-[10px] font-black text-[#3A3F5F] uppercase tracking-widest">Active Link</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'interests' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black uppercase tracking-tight text-[#32312D]">Interest Signals</h2>
                            <div className="h-px flex-1 mx-8 bg-[#32312D]/10"></div>
                        </div>
                        
                        {!profile?.interests || profile.interests.length === 0 ? (
                            <div className="p-20 rounded-[40px] border border-dashed border-[#32312D]/10 bg-white/[0.5] text-center">
                                <div className="text-4xl mb-4 opacity-20 grayscale">📡</div>
                                <div className="text-[#32312D]/40 font-black uppercase text-[10px] tracking-widest">No interest signals detected.</div>
                            </div>
                        ) : (
                            <div className="grid gap-6">
                                {profile.interests.map((interest: any) => (
                                    <div key={interest.id} className="bg-white border border-[#32312D]/10 rounded-[32px] p-8 flex flex-col md:flex-row justify-between items-center gap-8 shadow-sm hover:shadow-md transition-all">
                                        <div className="flex items-center gap-8 text-left w-full md:w-auto">
                                            <div className="w-20 h-20 rounded-3xl bg-[#3A3F5F]/5 border border-[#3A3F5F]/10 flex items-center justify-center text-3xl grayscale opacity-50">🏢</div>
                                            <div>
                                                <div className="text-[10px] font-black text-[#3A3F5F] uppercase tracking-[0.3em] mb-2">Platform Client</div>
                                                <h3 className="text-2xl font-black text-[#32312D] tracking-tight mb-2 uppercase">{interest.employer.companyName}</h3>
                                                <div className="text-sm font-bold text-[#32312D]/40 flex items-center gap-2">
                                                    Target Job: <span className="text-[#32312D]">{interest.job.title}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-4 w-full md:w-auto">
                                            {interest.joinUrl ? (
                                                <a 
                                                    href={`https://leadhunter-crm.work.gd${interest.joinUrl}`} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="bg-emerald-500 text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-md flex items-center gap-3"
                                                >
                                                    <span>🔗</span> Join Meeting Room
                                                </a>
                                            ) : (
                                                <div className="flex items-center gap-3 px-6 py-3 bg-[#E7E6E2] border border-[#32312D]/10 rounded-2xl">
                                                    <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></div>
                                                    <span className="text-[10px] font-black text-[#32312D]/40 uppercase tracking-widest">{interest.status}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'workspace' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black uppercase tracking-tight text-[#32312D]">Workspace Inbox</h2>
                            <div className="h-px flex-1 mx-8 bg-[#32312D]/10"></div>
                            <span className="text-[10px] font-black text-[#32312D]/30 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
                                Live Channel
                            </span>
                        </div>

                        {data.contracts.length === 0 ? (
                            <div className="p-20 rounded-[40px] border border-dashed border-[#32312D]/10 bg-white/50 text-center">
                                <div className="text-4xl mb-4 opacity-20 grayscale">💬</div>
                                <div className="text-[#32312D]/40 font-black uppercase text-[10px] tracking-widest">No active contracts. You have no employers to chat with yet.</div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-[40px] border border-[#32312D]/10 shadow-sm overflow-hidden flex h-[70vh]">
                                {/* Employer List */}
                                <div className="w-72 shrink-0 border-r border-[#32312D]/8 flex flex-col">
                                    <div className="p-6 border-b border-[#32312D]/8">
                                        <div className="text-[8px] font-black text-[#32312D]/30 uppercase tracking-[0.3em]">Your Employers</div>
                                    </div>
                                    <div className="overflow-y-auto flex-1">
                                        {data.contracts.map((contract: any) => (
                                            <button
                                                key={contract.id}
                                                onClick={() => { setWsEmployer(contract.employer); setWsMessages([]); }}
                                                className={`w-full px-6 py-5 flex items-center gap-4 text-left transition-all hover:bg-[#E7E6E2]/50 border-b border-[#32312D]/5 ${wsEmployer?.id === contract.employer?.id ? 'bg-[#3A3F5F]/5 border-l-2 border-l-[#3A3F5F]' : ''}`}
                                            >
                                                <div className="w-10 h-10 rounded-2xl bg-[#3A3F5F]/10 flex items-center justify-center font-black text-[#3A3F5F] text-sm shrink-0">
                                                    🏢
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-black text-[#32312D] text-xs uppercase tracking-tight truncate">{contract.employer.companyName}</div>
                                                    <div className={`text-[8px] font-black uppercase tracking-widest mt-0.5 ${contract.status === 'ACTIVE' ? 'text-emerald-500' : 'text-[#32312D]/30'}`}>{contract.status}</div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Chat Area */}
                                <div className="flex-1 flex flex-col min-w-0">
                                    {!wsEmployer ? (
                                        <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 p-10">
                                            <div className="w-20 h-20 rounded-[28px] bg-[#E7E6E2] flex items-center justify-center text-4xl">💬</div>
                                            <div className="text-[10px] font-black text-[#32312D]/30 uppercase tracking-widest">Select an employer to open the channel</div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="px-8 py-5 border-b border-[#32312D]/8 flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-2xl bg-[#3A3F5F] flex items-center justify-center font-black text-white text-sm">
                                                    🏢
                                                </div>
                                                <div>
                                                    <div className="font-black text-[#32312D] uppercase text-sm tracking-tight">{wsEmployer?.companyName}</div>
                                                    <div className="text-[8px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1.5">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block"></span> Active Channel
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4">
                                                {wsMessages.length === 0 && (
                                                    <div className="text-center text-[10px] font-black text-[#32312D]/20 uppercase tracking-widest mt-10">No messages yet. Start the conversation!</div>
                                                )}
                                                {wsMessages.map((msg: any) => {
                                                    const isMe = msg.senderId === user?.id;
                                                    return (
                                                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                            <div className={`max-w-[70%] px-5 py-3 rounded-3xl ${isMe ? 'bg-[#3A3F5F] text-white rounded-br-lg' : 'bg-[#E7E6E2] text-[#32312D] rounded-bl-lg'}`}>
                                                                <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                                                                <p className={`text-[8px] font-black uppercase tracking-widest mt-1 ${isMe ? 'text-white/50 text-right' : 'text-[#32312D]/40'}`}>
                                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                                <div ref={wsMsgEndRef} />
                                            </div>
                                            <div className="px-6 py-5 border-t border-[#32312D]/8 flex items-center gap-4">
                                                <input
                                                    type="text"
                                                    value={wsNewMsg}
                                                    onChange={e => setWsNewMsg(e.target.value)}
                                                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleWsSend()}
                                                    placeholder="Type a message…"
                                                    className="flex-1 px-6 py-4 bg-[#E7E6E2]/50 border border-[#32312D]/10 rounded-2xl outline-none focus:border-[#3A3F5F] transition-all font-medium text-[#32312D] text-sm placeholder:text-[#32312D]/30"
                                                />
                                                <button
                                                    onClick={handleWsSend}
                                                    disabled={wsSending || !wsNewMsg.trim()}
                                                    className="bg-[#3A3F5F] text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#32312D] transition-all disabled:opacity-40 flex items-center gap-2 shadow-md"
                                                >
                                                    {wsSending ? '…' : '↑ Send'}
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'profile' && profile && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-12">
                        <div className="bg-white p-10 rounded-[40px] border border-[#32312D]/10 shadow-sm">
                            <h2 className="text-3xl font-black mb-10 tracking-tight uppercase text-left text-[#32312D]">Roster Metadata</h2>
                            
                            <form onSubmit={handleProfileUpdate} className="space-y-12">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left">
                                    <div className="space-y-10">
                                        <div className="space-y-3">
                                            <label className="block text-[10px] font-black text-[#32312D]/40 uppercase tracking-[0.3em]">Identity Hub</label>
                                            <div className="flex items-center gap-8">
                                                <div className="w-32 h-32 rounded-3xl bg-[#E7E6E2] border border-[#32312D]/10 flex items-center justify-center text-4xl overflow-hidden text-[#32312D]/40 shadow-inner">
                                                    {(picPreview || profile.profilePic) ? (
                                                      <img 
                                                        src={picPreview || getFileUrl(profile.profilePic)} 
                                                        alt="Profile Preview" 
                                                        className="w-full h-full object-cover grayscale"
                                                      />
                                                    ) : '👤'}
                                                </div>
                                                <div className="flex-1">
                                                    <input 
                                                      type="file" 
                                                      accept="image/*"
                                                      onChange={(e) => e.target.files && handlePicSelect(e.target.files[0])}
                                                      className="hidden" 
                                                      id="profilePic"
                                                    />
                                                    <label 
                                                      htmlFor="profilePic"
                                                      className="inline-block bg-[#3A3F5F] text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#32312D] transition-all cursor-pointer shadow-md"
                                                    >
                                                      Overwrite Ident
                                                    </label>
                                                    <p className="text-[8px] font-black text-[#32312D]/40 uppercase tracking-widest mt-3">JPG / PNG / WEBP. MAX 2MB.</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="block text-[10px] font-black text-[#32312D]/40 uppercase tracking-[0.3em]">Neural Alias</label>
                                            <input 
                                                type="text" 
                                                className="w-full px-6 py-4 bg-[#E7E6E2]/30 border border-[#32312D]/10 rounded-2xl outline-none focus:border-[#3A3F5F] transition-all font-bold text-[#32312D] uppercase text-xs tracking-widest"
                                                value={profile.fullName || ''}
                                                onChange={e => setProfile({...profile, fullName: e.target.value})}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <label className="block text-[10px] font-black text-[#32312D]/40 uppercase tracking-[0.3em]">Region Node</label>
                                                <input 
                                                    type="text" 
                                                    className="w-full px-6 py-4 bg-[#E7E6E2]/30 border border-[#32312D]/10 rounded-2xl outline-none focus:border-[#3A3F5F] transition-all font-bold text-[#32312D] uppercase text-xs tracking-widest"
                                                    value={profile.country || ''}
                                                    onChange={e => setProfile({...profile, country: e.target.value})}
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="block text-[10px] font-black text-[#32312D]/40 uppercase tracking-[0.3em]">Credit rate / hr ($)</label>
                                                <input 
                                                    type="number" 
                                                    className="w-full px-6 py-4 bg-[#E7E6E2]/30 border border-[#32312D]/10 rounded-2xl outline-none focus:border-[#3A3F5F] transition-all font-bold text-[#32312D] text-xs tracking-widest"
                                                    value={profile.hourlyRate || ''}
                                                    onChange={e => setProfile({...profile, hourlyRate: e.target.value})}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="block text-[10px] font-black text-[#32312D]/40 uppercase tracking-[0.3em]">Neural Specializations</label>
                                            <textarea 
                                                className="w-full px-6 py-4 bg-[#E7E6E2]/30 border border-[#32312D]/10 rounded-2xl outline-none focus:border-[#3A3F5F] transition-all font-medium text-[#32312D] h-[150px] resize-none text-xs uppercase tracking-tight"
                                                value={profile.skills || ''}
                                                onChange={e => setProfile({...profile, skills: e.target.value})}
                                                placeholder="LIST CORE MODULES..."
                                            ></textarea>
                                        </div>
                                    </div>

                                    <div className="space-y-10">
                                        <FileUploadZone 
                                          id="resume-upload"
                                          label="Dossier (Resume)" 
                                          accept=".pdf,.doc,.docx"
                                          icon="📄"
                                          currentFile={profile.resumeUrl}
                                          onFileSelect={setSelectedResume}
                                        />

                                        <FileUploadZone 
                                          id="video-upload"
                                          label="Intro Feed (Video) - Max 20MB" 
                                          accept="video/*"
                                          icon="🎥"
                                          currentFile={profile.videoUrl}
                                          onFileSelect={setSelectedVideo}
                                          maxSize={20 * 1024 * 1024}
                                        />

                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between">
                                                <label className="block text-[10px] font-black text-[#32312D]/40 uppercase tracking-[0.3em]">Accolades (Certifications - Max 15)</label>
                                                <span className="text-[10px] font-black text-[#3A3F5F]">{profile.certificates?.length || 0}/15</span>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 gap-4">
                                                {profile.certificates?.map((cert: any) => (
                                                    <div key={cert.id} className="flex items-center justify-between p-4 bg-[#E7E6E2]/30 border border-[#32312D]/10 rounded-2xl group">
                                                        <div className="flex items-center gap-4">
                                                            <span className="text-xl">🏆</span>
                                                            <div className="min-w-0">
                                                                <div className="text-[10px] font-black text-[#32312D] uppercase truncate max-w-[200px]">{cert.name || 'Certificate'}</div>
                                                                <Link href={getFileUrl(cert.url)} target="_blank" className="text-[8px] font-black text-[#3A3F5F] uppercase underline underline-offset-2">View Transmission</Link>
                                                            </div>
                                                        </div>
                                                        <button 
                                                            type="button"
                                                            onClick={() => handleRemoveCertificate(cert.id)}
                                                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs hover:bg-red-500 hover:text-white transition-all text-[#32312D]/20 opacity-0 group-hover:opacity-100"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>

                                            {(profile.certificates?.length || 0) < 15 && (
                                                <div className="space-y-4">
                                                    <FileUploadZone 
                                                      id="cert-upload"
                                                      label={selectedCerts.length > 0 ? `${selectedCerts.length} Files Selected` : "Upload New Accolades"} 
                                                      accept="image/*,.pdf"
                                                      icon="📤"
                                                      onFileSelect={(file: File) => setSelectedCerts(prev => [...prev].concat(file))}
                                                    />
                                                    {selectedCerts.length > 0 && (
                                                        <div className="flex flex-wrap gap-2">
                                                            {selectedCerts.map((f, i) => (
                                                                <div key={i} className="px-3 py-1 bg-[#3A3F5F] text-white rounded-full text-[8px] font-black uppercase flex items-center gap-2">
                                                                    {f.name}
                                                                    <button type="button" onClick={() => setSelectedCerts(prev => prev.filter((_, idx) => idx !== i))}>✕</button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-10 border-t border-[#32312D]/10 flex flex-col md:flex-row justify-between items-center gap-8">
                                    <div className="text-[10px] font-black text-[#32312D]/40 uppercase tracking-widest">
                                        Terminal Sync: <span className={savingProfile ? 'text-[#3A3F5F] animate-pulse' : 'text-emerald-600'}>{savingProfile ? 'Broadcasting...' : 'Stable'}</span>
                                    </div>
                                    <button 
                                        type="submit" 
                                        disabled={savingProfile}
                                        className="w-full md:w-auto bg-[#3A3F5F] text-white px-20 py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] hover:bg-[#32312D] transition-all shadow-xl shadow-[#3A3F5F]/20 disabled:opacity-50"
                                    >
                                        {savingProfile ? 'Syncing...' : 'Overwrite Terminal Metadata'}
                                    </button>
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

export default EngineerDashboard;
