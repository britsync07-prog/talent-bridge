'use client';

import React from 'react';
import Navbar from '@/components/Navbar';

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">How It Works</h1>
        <div className="space-y-8 text-gray-600 leading-relaxed text-lg">
          <p><strong>1. Curated Talent:</strong> We interview and carefully select the top 3% of AI engineers globally. They don't sign up; they are invited.</p>
          <p><strong>2. Secure Payment System:</strong> When you hire an engineer, your payment is securely held in a secure payment system via Stripe Connect.</p>
          <p><strong>3. Seamless Collaboration:</strong> Use our built-in real-time messaging to define project details and share files.</p>
          <p><strong>4. Automatic Payouts:</strong> Upon project completion and admin approval, the engineer is paid automatically, minus our platform fee.</p>
        </div>
      </div>
    </div>
  );
}