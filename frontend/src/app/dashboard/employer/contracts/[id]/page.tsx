'use client';

export const runtime = 'edge';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';

const ContractManagementPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { id } = useParams();
  const [contract, setContract] = useState<any>(null);
  const [fetching, setFetching] = useState(true);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'EMPLOYER')) {
      router.push('/login');
    } else if (id) {
      fetchContract();
    }
  }, [user, loading, id]);

  const fetchContract = async () => {
    setFetching(true);
    try {
      const { data } = await api.get(`/contracts/${id}`);
      setContract(data);
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/tasks', {
        contractId: id,
        title: taskTitle,
        description: taskDesc,
        priority: 'MEDIUM'
      });
      setTaskTitle('');
      setTaskDesc('');
      fetchContract();
    } catch (err) {
      alert('Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || fetching) return <div><Navbar /><div className="p-10 text-center">Loading contract details...</div></div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="max-w-7xl mx-auto w-full px-6 py-12 flex-1">
        <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="text-xs font-black text-blue-600 uppercase tracking-widest mb-2">Contract Management</div>
            <h1 className="text-4xl font-black text-gray-900">{contract?.engineer?.fullName}</h1>
            <p className="text-gray-500 font-medium">Monthly Rate: ${contract?.salary?.toLocaleString()} + Fees</p>
          </div>
          <div className={`px-4 py-2 rounded-xl font-bold uppercase tracking-tighter text-sm ${contract?.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-800'}`}>
            {contract?.status}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            {/* Task List */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                <h2 className="text-xl font-black text-gray-900 mb-6">Active Tasks</h2>
                {contract?.tasks?.length === 0 ? (
                    <div className="text-center py-10 text-gray-400 font-medium border border-dashed border-gray-200 rounded-2xl">
                        No tasks assigned yet.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {contract.tasks.map((task: any) => (
                            <div key={task.id} className="p-5 border border-gray-50 rounded-2xl bg-gray-50/50 flex justify-between items-center">
                                <div>
                                    <div className="font-bold text-gray-900">{task.title}</div>
                                    <div className="text-sm text-gray-500 line-clamp-1">{task.description}</div>
                                </div>
                                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${
                                    task.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                    task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                                    'bg-gray-100 text-gray-500'
                                }`}>
                                    {task.status}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
          </div>

          <div className="space-y-8">
            {/* Create Task Form */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                <h2 className="text-xl font-black text-gray-900 mb-6">Assign New Task</h2>
                <form onSubmit={handleCreateTask} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Title</label>
                        <input 
                            type="text"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            value={taskTitle}
                            onChange={e => setTaskTitle(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Description</label>
                        <textarea 
                            required
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            value={taskDesc}
                            onChange={e => setTaskDesc(e.target.value)}
                        />
                    </div>
                    <button 
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-all disabled:opacity-50"
                    >
                        {submitting ? 'Assigning...' : 'Assign Task'}
                    </button>
                </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractManagementPage;
