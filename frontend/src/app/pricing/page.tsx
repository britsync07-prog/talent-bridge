'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

const PricingPage = () => {
  const tiers = [
    { name: 'Standard', price: '15k', desc: 'Direct access to individual AI nodes for specific task execution.', features: ['Verified Engineer Access', 'Secure Escrow', 'Basic Support', 'Weekly Reporting'] },
    { name: 'Enterprise', price: '45k', desc: 'Managed multi-node squads for comprehensive system architecture.', features: ['Priority Squad Selection', 'Technical Project Lead', 'Daily Synchronizations', '24/7 Concierge'] },
    { name: 'Quantum', price: 'Custom', desc: 'Bespoke strategic partnerships for fundamental R&D and core infra.', features: ['Council Level Support', 'On-site Deployment', 'Full IP Assignment', 'Custom Vetting Protocols'] },
  ];

  return (
    <div className="min-h-screen bg-[#E7E6E2] text-[#32312D] font-sans selection:bg-[#3A3F5F] selection:text-white">
      <Navbar />
      
      {/* 1. HERO */}
      <section className="py-40 px-6 md:px-12 max-w-7xl mx-auto text-center">
        <h1 className="text-7xl md:text-8xl font-black mb-12 tracking-tighter uppercase text-[#32312D]">Access <br/><span className="text-[#3A3F5F]">Tiers.</span></h1>
        <p className="text-xl text-[#32312D]/60 max-w-2xl mx-auto mb-20 leading-relaxed uppercase tracking-widest font-medium">Transparent capital allocation for elite technical intelligence.</p>
      </section>

      {/* 2. TIERS GRID */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-12">
          {tiers.map((t, i) => (
            <div key={i} className={`p-16 rounded-[60px] border transition-all duration-700 shadow-sm hover:shadow-2xl ${i === 1 ? 'bg-[#32312D] border-transparent text-white scale-105 z-10' : 'bg-white border-[#32312D]/10 text-[#32312D]'}`}>
              <div className={`text-[10px] font-black uppercase tracking-[0.4em] mb-8 ${i === 1 ? 'text-[#3A3F5F]' : 'text-[#3A3F5F]'}`}>{t.name} Node</div>
              <div className="flex items-baseline gap-2 mb-10">
                <span className="text-6xl font-black tracking-tighter">${t.price}</span>
                <span className={`text-xs font-black uppercase tracking-widest opacity-40`}>/ month</span>
              </div>
              <p className={`text-sm leading-loose uppercase tracking-widest mb-12 h-20 ${i === 1 ? 'text-white/60' : 'text-[#32312D]/60'}`}>{t.desc}</p>
              
              <ul className="space-y-6 mb-16">
                {t.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
                    <span className="text-[#3A3F5F]">✦</span> {f}
                  </li>
                ))}
              </ul>

              <Link href="/signup" className={`block text-center py-6 rounded-2xl font-black uppercase text-xs tracking-[0.3em] transition-all ${i === 1 ? 'bg-[#3A3F5F] text-white hover:bg-white hover:text-[#32312D]' : 'bg-[#32312D] text-white hover:bg-[#3A3F5F]'}`}>Request Activation</Link>
            </div>
          ))}
        </div>
      </section>

      {/* 3. FAQ CTA */}
      <section className="py-40 px-6 md:px-12 max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-black text-[#32312D] mb-8 uppercase tracking-[0.3em]">Institutional requirements?</h2>
          <p className="text-[#32312D]/60 text-sm leading-relaxed uppercase tracking-widest mb-12 font-medium">We offer tailored agreements for government, defense, and multinational conglomerates. Contact our board for a confidential briefing.</p>
          <Link href="/contact" className="text-[#3A3F5F] font-black uppercase text-[10px] tracking-[0.3em] border-b-2 border-[#3A3F5F] pb-2 hover:text-[#32312D] hover:border-[#32312D] transition-all">Connect with Managing Partner →</Link>
      </section>
    </div>
  );
};

export default PricingPage;
