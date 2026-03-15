'use client';

import React from 'react';
import Navbar from '@/components/Navbar';

export default function Terms() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
        <p className="text-gray-600">This is a placeholder for the Terms of Service. In a production environment, this would contain the legal agreements regarding platform usage, escrow payment holding, and dispute resolution policies.</p>
      </div>
    </div>
  );
}