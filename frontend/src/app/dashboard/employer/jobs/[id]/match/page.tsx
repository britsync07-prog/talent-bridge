'use client';

export const runtime = 'edge';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';

const SmartMatchPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { id } = useParams();
  const [job, setJob] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);

  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedEngineerId, setSelectedEngineerId] = useState<string | null>(null);
  const [interestId, setInterestId] = useState<string | null>(null);
  const [scheduledAt, setScheduledAt] = useState('');

  useEffect(() => {
    if (!loading && (!user || user.role !== 'EMPLOYER')) {
      router.push('/login');
    } else if (id) {
      fetchMatches();
    }
  }, [user, loading, id]);

  const fetchMatches = async () => {
    setFetching(true);
    try {
      const jobRes = await api.get(`/jobs/${id}`);
      setJob(jobRes.data);
      
      const matchRes = await api.get(`/engineers/match?requiredSkills=${jobRes.data.requiredSkills}&maxBudget=${jobRes.data.maxBudget}`);
      setMatches(matchRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  const handleInterestClick = (engineerId: string) => {
    setSelectedEngineerId(engineerId);
    setShowTypeModal(true);
  };

  const handleConfirmInterest = async (type: string) => {
    if (!selectedEngineerId) return;
    setSubmitting(selectedEngineerId);
    setShowTypeModal(false);
    try {
      const res = await api.post('/jobs/interest', {
        jobId: id,
        engineerId: selectedEngineerId,
        type
      });
      setInterestId(res.data.id);
      setShowScheduleModal(true);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to show interest');
    } finally {
      setSubmitting(null);
    }
  };

  const handleScheduleCall = async () => {
    if (!scheduledAt) return alert('Please select a date and time');
    try {
        await api.patch(`/jobs/interest/${interestId}/schedule`, { scheduledAt });
        alert('Call scheduled! Admin notified.');
        router.push('/dashboard/employer');
    } catch (err) {
        alert('Failed to schedule call');
    }
  };

  if (loading || fetching) return <div><Navbar /><div className="p-10 text-center">Finding best matches...</div></div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="max-w-5xl mx-auto w-full px-6 py-12 flex-1">
        <div className="mb-10">
          <h1 className="text-3xl font-black text-gray-900 mb-2">Smart Match: {job?.title}</h1>
          <p className="text-gray-500">Ranked recommendations based on your job requirements</p>
        </div>

        <div className="grid gap-6">
          {matches.length === 0 ? (
             <div className="bg-white p-10 rounded-3xl text-center border border-gray-100 shadow-sm">
                No engineers found matching your criteria.
             </div>
          ) : (
            matches.map((engineer: any) => (
              <div key={engineer.id} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl font-bold">
                        AI
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Expert AI Engineer #{engineer.id.slice(0,5)}</h3>
                        <div className="text-sm font-bold text-blue-600 uppercase tracking-tighter">
                            Match Score: {Math.round(engineer.matchPercentage)}%
                        </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {engineer.skills.split(',').map((skill: string, i: number) => (
                        <span key={i} className="px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-xs font-medium">
                            {skill.trim()}
                        </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase">Rate</div>
                        <div className="font-bold text-gray-900">${engineer.hourlyRate}/hr</div>
                    </div>
                    <div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase">Experience</div>
                        <div className="font-bold text-gray-900">{engineer.yearsExperience} Years</div>
                    </div>
                    <div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase">Country</div>
                        <div className="font-bold text-gray-900">{engineer.country}</div>
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-auto">
                    <button 
                        onClick={() => handleInterestClick(engineer.id)}
                        disabled={submitting !== null}
                        className="w-full md:w-auto bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md disabled:opacity-50"
                    >
                        {submitting === engineer.id ? 'Submitting...' : 'Interested'}
                    </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Interest Type Modal */}
      {showTypeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-[2rem] p-10 max-w-md w-full shadow-2xl relative border border-gray-100">
            <button onClick={() => setShowTypeModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6">
                🤝
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-2">Hiring Interest</h2>
              <p className="text-gray-500 font-medium">How would you like to engage with this engineer?</p>
            </div>
            
            <div className="space-y-4">
              <button 
                onClick={() => handleConfirmInterest('LEASE')}
                className="w-full p-6 bg-white border-2 border-gray-100 rounded-2xl text-left hover:border-blue-600 hover:bg-blue-50 transition-all group"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-black text-xl text-gray-900 group-hover:text-blue-600">Monthly Lease</span>
                  <span className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </div>
                <p className="text-sm text-gray-500 font-medium leading-relaxed">Flexible monthly arrangement with platform management.</p>
              </button>
              
              <button 
                onClick={() => handleConfirmInterest('FULLTIME')}
                className="w-full p-6 bg-white border-2 border-gray-100 rounded-2xl text-left hover:border-blue-600 hover:bg-blue-50 transition-all group"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-black text-xl text-gray-900 group-hover:text-blue-600">Direct Hire</span>
                  <span className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </div>
                <p className="text-sm text-gray-500 font-medium leading-relaxed">Permanent placement with a one-time onboarding fee.</p>
              </button>
            </div>
            
            <button 
              onClick={() => setShowTypeModal(false)}
              className="w-full mt-8 py-4 text-gray-400 font-bold hover:text-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Schedule Video Call Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-[2rem] p-10 max-w-md w-full shadow-2xl relative border border-gray-100 text-center">
            <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6">
              📅
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-2">Interest Noted!</h2>
            <p className="text-gray-500 font-medium mb-8">
                To finalize the match, please select a preferred date and time for a quick 15-minute intro call.
            </p>
            
            <div className="space-y-4 mb-8">
                <div className="text-left">
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Select Date & Time</label>
                    <input 
                        type="datetime-local" 
                        className="w-full px-6 py-4 rounded-2xl border-2 border-gray-100 focus:border-blue-600 outline-none font-bold text-gray-900"
                        value={scheduledAt}
                        onChange={e => setScheduledAt(e.target.value)}
                    />
                </div>
            </div>

            <div className="space-y-4">
                <button 
                    onClick={handleScheduleCall}
                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                >
                    Confirm Schedule
                </button>
                <button 
                    onClick={() => router.push('/dashboard/employer')}
                    className="w-full py-4 text-gray-500 font-bold hover:text-gray-700 transition-colors"
                >
                    I'll schedule later
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartMatchPage;
