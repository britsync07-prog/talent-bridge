'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import api, { getFileUrl } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EngineerProfilePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const [engineer, setEngineer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Interest State
  const [myJobs, setMyJobs] = useState<any[]>([]);
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [interestType, setInterestType] = useState('LEASE');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [interestId, setInterestId] = useState<string | null>(null);
  const [scheduledAt, setScheduledAt] = useState('');

  const hasFetched = React.useRef(false);

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      api.get(`/engineers/${id}`).then(({ data }) => {
        setEngineer(data);
        setLoading(false);
      }).catch(() => setLoading(false));
    }

    if (user?.role === 'EMPLOYER') {
      api.get('/jobs/my-jobs').then(({ data }) => {
        setMyJobs(data);
        if (data.length > 0) setSelectedJobId(data[0].id);
      });
    }
  }, [id, user?.id, user?.role]);

  const handleShowInterest = async () => {
    if (!selectedJobId) {
        alert('Please select or create a job first');
        return;
    }
    try {
      const res = await api.post('/jobs/interest', {
        jobId: selectedJobId,
        engineerId: id,
        type: interestType
      });
      setInterestId(res.data.id);
      setShowInterestModal(false);
      setShowScheduleModal(true);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to show interest');
    }
  };

  const handleScheduleCall = async () => {
    if (!scheduledAt) return alert('Please select a date and time');
    try {
        await api.patch(`/jobs/interest/${interestId}/schedule`, { scheduledAt });
        alert('Call scheduled! Admin notified.');
        setShowScheduleModal(false);
    } catch (err) {
        alert('Failed to schedule call');
    }
  };

  if (loading) return <div className="min-h-screen bg-[#E7E6E2] text-slate-600"><Navbar /><div className="p-20 text-center text-[#3A3F5F] font-black uppercase tracking-[0.3em] animate-pulse">Loading Profile...</div></div>;
  if (!engineer) return <div className="min-h-screen bg-[#E7E6E2] text-slate-600"><Navbar /><div className="p-20 text-center text-red-400 font-black uppercase tracking-widest">Error: Engineer Not Found</div></div>;

  return (
    <div className="min-h-screen bg-[#E7E6E2] text-slate-600 pb-32">
      <Navbar />
      
      {/* HEADER SECTION */}
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-12 border-b border-[#32312D]/10">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8">
              <div className="flex items-center gap-10">
                  <div className="w-40 h-40 rounded-[40px] bg-white flex items-center justify-center text-7xl font-black text-[#3A3F5F] border-2 border-[#32312D]/10 shadow-2xl overflow-hidden">
                    👤
                  </div>
                  <div className="text-left">
                      <div className="flex items-center gap-4 mb-4">
                        <span className="bg-[#3A3F5F]/10 text-[#3A3F5F] text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border border-[#3A3F5F]/20">Verified Engineer</span>
                        {engineer.isFeatured && <span className="bg-[#32312D] text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">Elite Featured</span>}
                      </div>
                      <h1 className="text-6xl font-black text-[#32312D] uppercase tracking-tighter mb-2">Engineer {engineer.id.slice(0, 5).toUpperCase()}</h1>
                      <p className="text-slate-400 text-lg font-black uppercase tracking-[0.2em]">{engineer.country} • {engineer.yearsExperience}yr Experience</p>
                  </div>
              </div>
              <div className="flex gap-4 mb-2">
                  {engineer.hourlyRate > 0 && (
                    <div className="text-right px-8 border-r border-[#32312D]/10">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Market Rate</div>
                        <div className="text-3xl font-black text-[#3A3F5F]">${engineer.hourlyRate}/hr</div>
                    </div>
                  )}
                  <div className="text-right px-8">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</div>
                      <div className="text-3xl font-black text-emerald-500 uppercase tracking-tighter">{engineer.availabilityStatus}</div>
                  </div>
              </div>
          </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-12 gap-20">
        
        {/* LEFT COLUMN: INTRO VIDEO & DETAILS */}
        <div className="lg:col-span-8">
            {engineer.videoUrl && (
              <div className="mb-20">
                <div className="flex items-center gap-4 mb-8 text-left">
                    <div className="w-2 h-2 rounded-full bg-[#3A3F5F] animate-ping"></div>
                    <h2 className="text-xl font-black text-[#32312D] uppercase tracking-widest">Introduction Video</h2>
                </div>
                <div className="bg-white rounded-[50px] overflow-hidden border border-[#32312D]/10 shadow-2xl aspect-video relative group">
                  <video 
                    src={getFileUrl(engineer.videoUrl)} 
                    controls 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-16 mb-20 text-left">
                <div>
                    <h2 className="text-xs font-black text-[#3A3F5F] uppercase tracking-[0.3em] mb-8 border-b border-[#32312D]/10 pb-4">AI Specializations</h2>
                    <div className="flex flex-wrap gap-3">
                        {engineer.aiSpecializations.split(',').map((spec: string, i: number) => (
                        <span key={i} className="px-6 py-3 bg-white text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-[#32312D]/10 hover:border-[#3A3F5F] transition-all">
                            {spec.trim()}
                        </span>
                        ))}
                    </div>
                </div>
                <div>
                    <h2 className="text-xs font-black text-[#3A3F5F] uppercase tracking-[0.3em] mb-8 border-b border-[#32312D]/10 pb-4">Technical Stack</h2>
                    <div className="flex flex-wrap gap-3">
                        {engineer.skills.split(',').map((skill: string, i: number) => (
                        <span key={i} className="px-5 py-2 bg-[#E7E6E2] text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-[#32312D]/10">
                            {skill.trim()}
                        </span>
                        ))}
                    </div>
                </div>
            </div>

            {engineer.languages && (
                <div className="mb-20 text-left">
                    <h2 className="text-xs font-black text-[#3A3F5F] uppercase tracking-[0.3em] mb-8 border-b border-[#32312D]/10 pb-4">Linguistic Capabilities</h2>
                    <div className="flex flex-wrap gap-6">
                        {engineer.languages.split(',').map((lang: string, i: number) => (
                            <div key={i} className="flex items-center gap-3">
                                <span className="text-[#3A3F5F]">✦</span>
                                <span className="text-[#32312D] font-black uppercase text-xs tracking-widest">{lang.trim()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {engineer.certifications && (
                <div className="mb-20 text-left">
                    <h2 className="text-xs font-black text-[#3A3F5F] uppercase tracking-[0.3em] mb-8 border-b border-[#32312D]/10 pb-4">Verified Certifications</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="p-8 bg-white border border-[#32312D]/10 rounded-[32px] hover:border-[#3A3F5F] transition-all group relative overflow-hidden shadow-sm">
                            <div className="absolute inset-0 bg-[#3A3F5F]/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative z-10">
                                <div className="text-4xl mb-4">🏆</div>
                                <div className="text-[#32312D] font-black uppercase text-xs tracking-widest mb-4">Certification</div>
                                <Link 
                                    href={getFileUrl(engineer.certifications)} 
                                    target="_blank"
                                    className="inline-block text-[#3A3F5F] text-[10px] font-black uppercase tracking-widest border-b border-[#3A3F5F] pb-1 hover:text-[#3A3F5F]/80 hover:border-[#3A3F5F]/80 transition-all"
                                >
                                    View Document →
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* RIGHT COLUMN: ACTIONS */}
        <div className="lg:col-span-4">
            <div className="bg-white p-12 rounded-[50px] border border-[#32312D]/10 shadow-2xl sticky top-32 text-left">
                <h3 className="text-2xl font-black text-[#32312D] uppercase tracking-tighter mb-2">Contact Engineer</h3>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-10 leading-loose">Apply to work with this engineer.</p>
                
                {user?.role === 'EMPLOYER' ? (
                  <div className="flex flex-col gap-4">
                    <button 
                      onClick={() => setShowInterestModal(true)} 
                      className="w-full bg-[#3A3F5F] text-white py-6 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-[#3A3F5F]/90 transition-all shadow-xl shadow-[#3A3F5F]/20"
                    >
                      Show Interest
                    </button>
                    <button 
                      onClick={() => setShowScheduleModal(true)} 
                      disabled={!interestId}
                      className="w-full bg-[#32312D] text-white py-6 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-black transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Request Meeting
                    </button>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest text-center pt-2 leading-relaxed">
                      All contact is managed through platform admin. Direct communication is not permitted.
                    </p>
                  </div>
                ) : !user ? (
                  <div className="text-center">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-8 leading-loose">Authorization required to engage with elite talent.</p>
                    <Link href="/login" className="block w-full bg-[#32312D] text-white py-6 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-black transition-all">
                      Log In
                    </Link>
                  </div>
                ) : (
                  <div className="p-6 bg-[#E7E6E2] rounded-3xl border border-[#32312D]/10 text-center">
                      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest leading-loose">Profile viewing mode: ACTIVE</p>
                  </div>
                )}

                <div className="mt-12 pt-12 border-t border-[#32312D]/10 space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 shadow-sm">✔</div>
                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Identity Verified</div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 shadow-sm">🛡</div>
                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Secure Escrow Protection</div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 shadow-sm">✦</div>
                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Arctic Standard Certified</div>
                        </div>
                        <div className="p-5 bg-[#E7E6E2]/60 rounded-2xl border border-[#32312D]/10 mt-4">
                            <p className="text-[8px] font-black text-[#32312D]/40 uppercase tracking-widest leading-relaxed">
                                🔒 All hiring is managed through the platform. Resumes and personal contact details are protected and only shared after admin approval.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Show Interest Modal */}
      {showInterestModal && (
        <div className="fixed inset-0 bg-[#32312D]/60 backdrop-blur-xl z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-[60px] p-16 max-w-2xl w-full shadow-2xl relative border border-[#32312D]/10">
            <button onClick={() => setShowInterestModal(false)} className="absolute top-10 right-10 text-slate-400 hover:text-[#32312D] transition-colors text-3xl font-light">
              ✕
            </button>
            <h2 className="text-4xl font-black text-[#32312D] mb-4 uppercase tracking-tighter text-left">Express Interest</h2>
            <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest mb-12 text-left">Select the job you are hiring for.</p>
            
            <div className="space-y-8">
              <div className="text-left">
                <label className="block text-[10px] font-black text-[#3A3F5F] uppercase tracking-[0.3em] mb-4">Your Jobs</label>
                {myJobs.length > 0 ? (
                    <select 
                        value={selectedJobId} 
                        onChange={e => setSelectedJobId(e.target.value)}
                        className="w-full bg-[#E7E6E2] border-b-2 border-[#32312D]/10 py-6 text-[#32312D] outline-none focus:border-[#3A3F5F] transition-all font-black uppercase text-xs tracking-widest"
                    >
                        {myJobs.map(job => (
                            <option key={job.id} value={job.id}>{job.title}</option>
                        ))}
                    </select>
                ) : (
                    <div className="p-8 bg-[#E7E6E2] border border-dashed border-[#32312D]/10 rounded-3xl text-center">
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-6">No active jobs found.</p>
                        <button onClick={() => { setShowInterestModal(false); router.push('/dashboard/employer/jobs/new'); }} className="text-[#3A3F5F] text-[10px] font-black uppercase tracking-widest border-b border-[#3A3F5F]">Create a Job</button>
                    </div>
                )}
              </div>

              <div className="text-left">
                <label className="block text-[10px] font-black text-[#3A3F5F] uppercase tracking-[0.3em] mb-4">Work Type</label>
                <div className="grid grid-cols-2 gap-4">
                    <button 
                        onClick={() => setInterestType('LEASE')}
                        className={`p-6 rounded-3xl border-2 transition-all text-left ${interestType === 'LEASE' ? 'border-[#3A3F5F] bg-[#3A3F5F]/5' : 'border-[#32312D]/10 bg-white'}`}
                    >
                        <div className="text-[#32312D] font-black uppercase text-sm mb-1">Monthly Contract</div>
                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ongoing Work</div>
                    </button>
                    <button 
                        onClick={() => setInterestType('FULLTIME')}
                        className={`p-6 rounded-3xl border-2 transition-all text-left ${interestType === 'FULLTIME' ? 'border-[#3A3F5F] bg-[#3A3F5F]/5' : 'border-[#32312D]/10 bg-white'}`}
                    >
                        <div className="text-[#32312D] font-black uppercase text-sm mb-1">Direct Hire</div>
                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Permanent Placement</div>
                    </button>
                </div>
              </div>
              
              <button 
                onClick={handleShowInterest}
                disabled={!selectedJobId}
                className="w-full mt-8 py-6 bg-[#3A3F5F] text-white rounded-full font-black uppercase text-xs tracking-[0.3em] hover:bg-[#3A3F5F]/90 transition-all shadow-xl shadow-[#3A3F5F]/20 disabled:opacity-20"
              >
                Send Interest
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-[#32312D]/60 backdrop-blur-xl z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-[60px] p-16 max-lg w-full shadow-2xl border border-[#32312D]/10 text-center">
            <div className="text-6xl mb-8">📡</div>
            <h2 className="text-4xl font-black text-[#32312D] mb-4 uppercase tracking-tighter">Interest Sent</h2>
            <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest mb-12 leading-loose">
                Your interest has been recorded. Please choose a time for a meeting.
            </p>
            
            <div className="mb-12 text-left">
                <label className="block text-[10px] font-black text-[#3A3F5F] uppercase tracking-[0.3em] mb-4">Meeting Time</label>
                <input 
                    type="datetime-local" 
                    className="w-full bg-[#E7E6E2] border-b-2 border-[#32312D]/10 py-6 text-[#32312D] outline-none focus:border-[#3A3F5F] transition-all font-black uppercase text-xs tracking-widest"
                    value={scheduledAt}
                    onChange={e => setScheduledAt(e.target.value)}
                />
            </div>

            <div className="flex flex-col gap-4">
                <button 
                    onClick={handleScheduleCall}
                    className="w-full py-6 bg-[#3A3F5F] text-white rounded-full font-black uppercase text-xs tracking-[0.3em] hover:bg-[#3A3F5F]/90 transition-all shadow-xl"
                >
                    Confirm Schedule
                </button>
                <button 
                    onClick={() => setShowScheduleModal(false)}
                    className="w-full py-6 text-slate-400 font-black uppercase text-[10px] tracking-[0.3em] hover:text-[#32312D] transition-colors"
                >
                    Decide Later
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
