'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-[#E7E6E2] text-[#32312D] font-sans selection:bg-[#3A3F5F] selection:text-white">
      <Navbar />
      
      {/* 1. HERO */}
      <section className="py-40 px-6 md:px-12 max-w-7xl mx-auto text-center">
        <h1 className="text-7xl md:text-8xl font-black mb-12 tracking-tighter uppercase text-[#32312D]">Concierge <br/><span className="text-[#3A3F5F]">Uplink.</span></h1>
        <p className="text-xl text-[#32312D]/60 max-w-2xl mx-auto mb-20 leading-relaxed uppercase tracking-widest font-medium">Establish a direct line to our managing council.</p>
      </section>

      {/* 2. CONTACT CONTENT */}
      <section className="pb-40 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-24 items-start">
          
          {/* Form */}
          <div className="bg-white p-16 rounded-[60px] border border-[#32312D]/10 shadow-xl text-left">
            <h2 className="text-3xl font-black text-[#32312D] mb-12 uppercase tracking-tight">Initiate Inquiry</h2>
            <form className="space-y-10">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-[#32312D]/40 uppercase tracking-[0.3em]">Identifier</label>
                <input type="text" placeholder="FULL NAME" className="w-full bg-[#E7E6E2]/20 border-b-2 border-[#32312D]/5 py-4 px-2 text-[#32312D] outline-none focus:border-[#3A3F5F] transition-all font-black uppercase text-xs tracking-widest" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-[#32312D]/40 uppercase tracking-[0.3em]">Neural Address</label>
                <input type="email" placeholder="EMAIL@ENTITY.COM" className="w-full bg-[#E7E6E2]/20 border-b-2 border-[#32312D]/5 py-4 px-2 text-[#32312D] outline-none focus:border-[#3A3F5F] transition-all font-black uppercase text-xs tracking-widest" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-[#32312D]/40 uppercase tracking-[0.3em]">Protocol Requirements</label>
                <textarea rows={4} placeholder="DEFINE YOUR MISSION BRIEF..." className="w-full bg-[#E7E6E2]/20 border-b-2 border-[#32312D]/5 py-4 px-2 text-[#32312D] outline-none focus:border-[#3A3F5F] transition-all font-medium text-sm uppercase tracking-tight"></textarea>
              </div>
              <button className="w-full bg-[#3A3F5F] text-white py-6 rounded-3xl font-black uppercase text-xs tracking-[0.4em] hover:bg-[#32312D] transition-all shadow-xl shadow-[#3A3F5F]/20">Transmit Signal</button>
            </form>
          </div>

          {/* Info */}
          <div className="pt-12 text-left">
            <div className="space-y-20">
              <div>
                <h3 className="text-[#3A3F5F] font-black uppercase text-[10px] tracking-[0.4em] mb-8">Direct Access</h3>
                <div className="space-y-6">
                  <div className="text-4xl font-black text-[#32312D] uppercase tracking-tighter hover:text-[#3A3F5F] transition-colors cursor-pointer leading-none">hq@talentbridge.ai</div>
                  <div className="text-4xl font-black text-[#32312D] uppercase tracking-tighter hover:text-[#3A3F5F] transition-colors cursor-pointer leading-none">+1 (888) INDIGO-AI</div>
                </div>
              </div>

              <div>
                <h3 className="text-[#3A3F5F] font-black uppercase text-[10px] tracking-[0.4em] mb-8">Global Nodes</h3>
                <div className="grid grid-cols-2 gap-12">
                  <div>
                    <div className="text-[#32312D] font-black uppercase text-xs tracking-widest mb-4">San Francisco</div>
                    <p className="text-[#32312D]/40 text-[10px] font-black uppercase tracking-widest leading-loose">Mission District <br/>Global HQ</p>
                  </div>
                  <div>
                    <div className="text-[#32312D] font-black uppercase text-xs tracking-widest mb-4">London</div>
                    <p className="text-[#32312D]/40 text-[10px] font-black uppercase tracking-widest leading-loose">Kings Cross <br/>EMEA Node</p>
                  </div>
                </div>
              </div>

              <div className="p-10 bg-white rounded-[40px] border border-[#32312D]/10 shadow-sm">
                <div className="text-xs font-black text-[#32312D] mb-4 uppercase tracking-[0.3em]">Uplink Speed Index</div>
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-2 bg-[#E7E6E2] rounded-full overflow-hidden">
                    <div className="w-[92%] h-full bg-emerald-500 shadow-[0_0_10px_#10b981]"></div>
                  </div>
                  <span className="text-[10px] font-black text-emerald-600 uppercase">92% Optimal</span>
                </div>
                <p className="mt-6 text-[9px] font-black text-[#32312D]/40 uppercase tracking-widest leading-loose">Current average response latency: 1.4 hours.</p>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
};

export default ContactPage;
