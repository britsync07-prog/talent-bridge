'use client';

export const runtime = 'edge';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';

const EngineerContractPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { id } = useParams();
  const [contract, setContract] = useState<any>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ENGINEER')) {
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

  const handleUpdateTaskStatus = async (taskId: string, status: string) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status });
      fetchContract();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  if (loading || fetching) return <div><Navbar /><div className="p-10 text-center">Loading contract...</div></div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="max-w-5xl mx-auto w-full px-6 py-12 flex-1">
        <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="text-xs font-black text-blue-600 uppercase tracking-widest mb-2">Project Workspace</div>
            <h1 className="text-4xl font-black text-gray-900">{contract?.employer?.companyName}</h1>
            <p className="text-gray-500 font-medium">Monthly Salary: ${contract?.salary?.toLocaleString()}</p>
          </div>
          <div className="bg-green-100 text-green-700 px-4 py-2 rounded-xl font-bold uppercase tracking-tighter text-sm">
            ACTIVE CONTRACT
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h2 className="text-2xl font-black text-gray-900 mb-8">Assigned Tasks</h2>
            {contract?.tasks?.length === 0 ? (
                <div className="text-center py-16 text-gray-400 font-medium border border-dashed border-gray-200 rounded-2xl">
                    No tasks assigned by the employer yet.
                </div>
            ) : (
                <div className="space-y-6">
                    {contract.tasks.map((task: any) => (
                        <div key={task.id} className="p-6 border border-gray-100 rounded-2xl bg-gray-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900 mb-1">{task.title}</h3>
                                <p className="text-gray-500 text-sm">{task.description}</p>
                            </div>
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <select 
                                    className="flex-1 md:flex-none bg-white border border-gray-200 px-4 py-2 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                    value={task.status}
                                    onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value)}
                                >
                                    <option value="PENDING">Pending</option>
                                    <option value="IN_PROGRESS">In Progress</option>
                                    <option value="REVIEW">In Review</option>
                                    <option value="COMPLETED">Completed</option>
                                </select>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default EngineerContractPage;
