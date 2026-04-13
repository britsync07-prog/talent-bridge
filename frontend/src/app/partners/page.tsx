'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

const PartnersPage = () => {
  const partners = [
    { name: 'Vanguard Systems', type: 'Strategic', desc: 'Joint R&D into advanced AI computing systems.' },
    { name: 'Apollo Venture', type: 'Financial', desc: 'Deployment partner for global financial technology projects.' },
    { name: 'Specter Defense', type: 'Technical', desc: 'Secure AI systems for high-security sectors.' },
  ];

  return (
    <div className="min-h-screen bg-[#E7E6E2] text-[#32312D] font-sans selection:bg-[#3A3F5F] selection:text-white">
      <Navbar />
      
      {/* 1. HERO */}
      <section className="py-40 px-6 md:px-12 max-w-7xl mx-auto text-center">
        <h1 className="text-7xl md:text-8xl font-black mb-12 tracking-tighter uppercase text-[#32312D]">Our <br/><span className="text-[#3A3F5F]">Partners.</span></h1>
        <p className="text-xl text-[#32312D]/60 max-w-2xl mx-auto mb-20 leading-relaxed uppercase tracking-widest font-medium">Building the future of AI together.</p>
      </section>

      {/* 2. PARTNERS GRID */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-12">
          {partners.map((p, i) => (
            <div key={i} className="bg-white p-12 rounded-[40px] border border-[#32312D]/10 hover:border-[#3A3F5F]/30 transition-all duration-700 shadow-sm hover:shadow-xl text-left">
              <div className="text-[10px] font-black text-[#3A3F5F] uppercase tracking-[0.4em] mb-6">{p.type} Partner</div>
              <h3 className="text-3xl font-black text-[#32312D] mb-6 uppercase tracking-tight">{p.name}</h3>
              <p className="text-[#32312D]/60 text-sm leading-loose uppercase tracking-widest mb-10">{p.desc}</p>
              <div className="w-12 h-1 h-[#3A3F5F]/20 bg-[#3A3F5F]/20 rounded-full"></div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. ECOSYSTEM CTA */}
      <section className="py-40 px-6 md:px-12 bg-white border-y border-[#32312D]/10 text-center">
          <h2 className="text-2xl font-black text-[#32312D] mb-12 uppercase tracking-[0.3em]">Partner with us?</h2>
          <p className="text-[#32312D]/60 text-sm leading-relaxed uppercase tracking-widest mb-16 max-w-2xl mx-auto">We are actively seeking infrastructural partners in the areas of advanced computing and chip design.</p>
          <Link href="/contact" className="inline-block bg-[#3A3F5F] text-white px-12 py-5 rounded-full font-black uppercase text-xs tracking-[0.3em] hover:bg-[#32312D] transition-all shadow-md">Contact us about a partnership</Link>
      </section>
    </div>
  );
};

export default PartnersPage;
