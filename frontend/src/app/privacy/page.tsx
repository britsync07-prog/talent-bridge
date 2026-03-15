'use client';

import React from 'react';
import Navbar from '@/components/Navbar';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        <p className="text-gray-600">This is a placeholder for the Privacy Policy detailing how user data, CVs, and company information are handled and protected.</p>
      </div>
    </div>
  );
}