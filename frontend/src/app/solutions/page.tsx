'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

const SolutionsPage = () => {
  const solutions = [
    { title: 'Neural Infrastructure', desc: 'Enterprise-grade AI environment architecture and deployment.', icon: '🛰️' },
    { title: 'LLM Custom Forge', desc: 'Training and fine-tuning large language models on proprietary datasets.', icon: '🔥' },
    { title: 'Computer Vision Systems', desc: 'Advanced visual recognition and spatial intelligence modules.', icon: '👁️' },
    { title: 'Predictive Analytics', desc: 'Statistical modeling for high-stakes forecasting and risk assessment.', icon: '📊' },
    { title: 'AI Ethics Audit', desc: 'Comprehensive safety, bias, and alignment verification protocols.', icon: '⚖️' },
    { title: 'Autonomous Agents', desc: 'Development of self-correcting task-oriented agentic workflows.', icon: '🤖' },
  ];

  return (
    <div className="min-h-screen bg-[#E7E6E2] text-[#32312D] font-sans selection:bg-[#3A3F5F] selection:text-white">
      <Navbar />
      
      {/* 1. HERO */}
      <section className="py-40 px-6 md:px-12 max-w-7xl mx-auto text-center">
        <h1 className="text-7xl md:text-8xl font-black mb-12 tracking-tighter uppercase text-[#32312D]">Technical <br/><span className="text-[#3A3F5F]">Protocols.</span></h1>
        <p className="text-xl text-[#32312D]/60 max-w-2xl mx-auto mb-20 leading-relaxed uppercase tracking-widest font-medium">Standardized engagement frameworks for planetary-scale AI requirements.</p>
      </section>

      {/* 2. SOLUTIONS GRID */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-12">
          {solutions.map((s, i) => (
            <div key={i} className="bg-white p-12 rounded-[40px] border border-[#32312D]/10 hover:border-[#3A3F5F]/30 transition-all duration-700 group shadow-sm hover:shadow-xl">
              <div className="text-5xl mb-8 group-hover:scale-110 transition-transform block grayscale group-hover:grayscale-0 opacity-50 group-hover:opacity-100">{s.icon}</div>
              <h3 className="text-2xl font-black text-[#32312D] mb-6 uppercase tracking-tight">{s.title}</h3>
              <p className="text-[#32312D]/60 text-sm leading-loose uppercase tracking-widest">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. CTA */}
      <section className="py-40 px-6 md:px-12">
        <div className="max-w-5xl mx-auto bg-[#32312D] rounded-[60px] p-24 text-center shadow-2xl relative overflow-hidden">
            <h2 className="text-5xl font-black text-white mb-10 tracking-tighter uppercase">Request Custom Protocol.</h2>
            <Link href="/contact" className="relative inline-block bg-[#3A3F5F] text-white px-16 py-5 rounded-full font-black uppercase text-xs tracking-[0.3em] hover:bg-white hover:text-[#32312D] transition-all shadow-lg">Initiate Inquiry</Link>
        </div>
      </section>
    </div>
  );
};

export default SolutionsPage;
