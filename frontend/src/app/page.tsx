'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';

const LandingPage = () => {
  const [featured, setFeatured] = useState<any[]>([]);

  useEffect(() => {
    api.get('/engineers').then(res => {
        setFeatured(res.data.filter((e: any) => e.isFeatured).slice(0, 3));
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#E7E6E2] text-slate-600 selection:bg-[#3A3F5F] selection:text-white font-sans">
      <Navbar />
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-32 pb-40 px-6 md:px-12 flex flex-col items-center text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#3A3F5F]/5 rounded-full blur-[150px]"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#3A3F5F]/5 rounded-full blur-[150px]"></div>
        </div>

        <div className="max-w-5xl mx-auto relative">
          <div className="inline-flex items-center gap-2 py-2 px-6 mb-12 rounded-full border border-[#32312D]/10 bg-white shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#3A3F5F] animate-pulse"></span>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">The New Era of Hiring</span>
          </div>
          
          <h1 className="text-7xl md:text-[130px] font-black leading-[0.85] mb-12 tracking-tighter text-[#32312D] uppercase">
            REDEFINING <br />
            <span className="text-[#3A3F5F]">AI TALENT.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-400 mb-16 max-w-2xl mx-auto leading-relaxed font-medium uppercase tracking-widest">
            The global bridge between elite AI intelligence and ambitious enterprises.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
            <Link 
              href="/signup" 
              className="w-full sm:w-auto bg-[#3A3F5F] text-white px-16 py-6 rounded-full font-black uppercase text-xs tracking-[0.2em] hover:bg-[#3A3F5F]/90 transition-all shadow-xl shadow-[0_0_30px_rgba(58,63,95,0.1)]"
            >
              Start Your Legacy
            </Link>
            <Link 
              href="/engineers" 
              className="w-full sm:w-auto bg-white border-2 border-[#32312D]/10 text-slate-500 px-16 py-6 rounded-full font-black uppercase text-xs tracking-[0.2em] hover:bg-[#E7E6E2] transition-all"
            >
              Browse Talent Bridge
            </Link>
          </div>
        </div>
      </section>

      {/* 2. METRICS SECTION */}
      <section className="py-24 px-6 md:px-12 bg-white border-y border-[#32312D]/10">
          <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 text-left">
              {[
                  { label: 'Network Value', value: '$2.4B+', desc: 'aggregate capital managed' },
                  { label: 'Vetting Rigor', value: '0.8%', desc: 'acceptance threshold' },
                  { label: 'Retention', value: '99.2%', desc: 'deployment success rate' },
                  { label: 'Uplink Speed', value: '< 2hr', desc: 'concierge response' },
              ].map((stat, i) => (
                  <div key={i} className="group border-l border-[#32312D]/10 pl-8">
                      <div className="text-[10px] font-black text-[#3A3F5F] uppercase tracking-[0.3em] mb-4">{stat.label}</div>
                      <div className="text-5xl font-black text-[#32312D] mb-2 tracking-tighter">{stat.value}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{stat.desc}</div>
                  </div>
              ))}
          </div>
      </section>

      {/* 3. FEATURED TALENT */}
      <section className="py-40 px-6 md:px-12 relative bg-[#E7E6E2]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-12">
            <div className="max-w-2xl text-left">
                <span className="text-[#3A3F5F] font-black uppercase text-[10px] tracking-[0.4em] block mb-4">The Talent Roster</span>
                <h2 className="text-6xl font-black text-[#32312D] tracking-tighter uppercase">Vetted AI <br/>Engineering.</h2>
            </div>
            <Link href="/engineers" className="text-[#3A3F5F] font-black uppercase text-[10px] tracking-[0.3em] border-b-2 border-[#3A3F5F] pb-2 hover:text-[#3A3F5F]/80 hover:border-[#3A3F5F]/80 transition-all">View Full Network →</Link>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            {featured.map((eng, i) => (
              <div key={i} className="group bg-white rounded-[40px] p-12 border border-[#32312D]/10 hover:border-[#3A3F5F] transition-all duration-700 shadow-sm hover:shadow-2xl relative overflow-hidden text-left">
                <div className="w-24 h-24 bg-[#E7E6E2] rounded-3xl mb-8 flex items-center justify-center text-4xl font-black text-[#3A3F5F] border border-[#32312D]/5">
                    {eng.fullName.charAt(0)}
                </div>
                <h3 className="text-2xl font-black text-[#32312D] mb-2 group-hover:text-[#3A3F5F] transition-colors uppercase tracking-tight">{eng.fullName}</h3>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8">{eng.country}</p>
                <div className="flex flex-wrap gap-2 mb-8">
                    {eng.aiSpecializations.split(',').slice(0, 2).map((s: string, j: number) => (
                        <span key={j} className="text-[9px] font-black uppercase tracking-widest bg-[#E7E6E2] text-slate-500 px-4 py-1.5 rounded-full border border-[#32312D]/5">{s.trim()}</span>
                    ))}
                </div>
                <Link href={`/engineers/${eng.id}`} className="block font-black text-[#3A3F5F] uppercase text-[10px] tracking-[0.3em] hover:underline underline-offset-8">Audit Node Profile</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. PREMIUM SERVICES */}
      <section className="py-40 px-6 md:px-12 bg-white">
          <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-px bg-[#32312D]/10 rounded-[60px] overflow-hidden border border-[#32312D]/10 shadow-xl">
              {[
                  { title: 'Architectural Review', desc: 'Expert validation of AI systems for enterprise deployment.', icon: '🏛️' },
                  { title: 'Bespoke LLM Training', desc: 'Custom model development optimized for niche domains.', icon: '⚡' },
                  { title: 'Neural Infrastructure', desc: 'Managed execution environments for high-stakes production.', icon: '🛰️' },
              ].map((s, i) => (
                  <div key={i} className="bg-white p-20 hover:bg-[#E7E6E2] transition-all group text-left">
                      <div className="text-5xl mb-8 grayscale group-hover:grayscale-0 transition-all">{s.icon}</div>
                      <h3 className="text-2xl font-black text-[#32312D] mb-6 tracking-tight uppercase tracking-widest">{s.title}</h3>
                      <p className="text-slate-400 text-sm leading-relaxed uppercase tracking-widest font-medium">{s.desc}</p>
                  </div>
              ))}
          </div>
      </section>

      {/* 5. VETTING PROCESS */}
      <section className="py-40 px-6 md:px-12 max-w-7xl mx-auto text-center">
          <h2 className="text-5xl font-black text-[#32312D] mb-24 tracking-tighter uppercase">The Vetting Protocol</h2>
          <div className="grid md:grid-cols-4 gap-8">
              {[
                  { step: '01', title: 'Tech Review', desc: 'Analysis of past algorithmic contributions.' },
                  { step: '02', title: 'Live Benchmarking', desc: 'Scrutinized performance testing in production.' },
                  { step: '03', title: 'EQ Scoping', desc: 'Assessment of leadership & strategic communication.' },
                  { step: '04', title: 'Final Induction', desc: 'Board review & permanent roster placement.' },
              ].map((v, i) => (
                  <div key={i} className="relative p-10 bg-white border border-[#32312D]/10 rounded-[40px] hover:border-[#3A3F5F] transition-all shadow-sm text-left">
                      <div className="text-4xl font-black text-[#DDDDDD] absolute top-6 right-8 leading-none">{v.step}</div>
                      <h3 className="text-lg font-black text-[#3A3F5F] mb-4 uppercase tracking-widest">{v.title}</h3>
                      <p className="text-slate-400 text-xs leading-relaxed uppercase tracking-widest">{v.desc}</p>
                  </div>
              ))}
          </div>
      </section>

      {/* 6. TESTIMONIALS */}
      <section className="py-40 px-6 md:px-12 bg-[#E7E6E2] relative overflow-hidden border-y border-[#32312D]/10">
          <div className="max-w-5xl mx-auto relative text-left">
              <div className="text-6xl mb-12 text-[#3A3F5F]">"</div>
              <p className="text-4xl md:text-5xl font-black text-[#32312D] italic leading-tight mb-12 tracking-tighter">
                  "Working with Talent Bridge isn't just about hiring; it's about acquiring an unfair competitive advantage in the AI race."
              </p>
              <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-[#B6B6B6] rounded-2xl shadow-lg"></div>
                  <div>
                      <div className="text-[#32312D] font-black uppercase tracking-widest text-sm">Alexander Sterling</div>
                      <div className="text-[#3A3F5F] font-black uppercase tracking-[0.2em] text-[10px]">CTO, Nova Genomics</div>
                  </div>
              </div>
          </div>
      </section>

      {/* 7. WORLD-CLASS NETWORK */}
      <section className="py-24 px-6 md:px-12 bg-white">
          <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-20 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-1000">
              {['VANGUARD', 'APOLLO', 'ORION', 'SPECTER', 'ZENITH'].map((logo, i) => (
                  <div key={i} className="text-2xl font-black text-[#32312D] tracking-[0.5em]">{logo}</div>
              ))}
          </div>
      </section>

      {/* 8. FAQ */}
      <section className="py-40 px-6 md:px-12 max-w-4xl mx-auto">
          <h2 className="text-4xl font-black text-[#32312D] mb-20 tracking-tighter text-center uppercase tracking-widest">Inquiries</h2>
          <div className="space-y-12 text-left">
              {[
                  { q: 'How exclusive is the Talent Bridge network?', a: 'We represent fewer than 500 engineers globally, ensuring unparalleled quality control.' },
                  { q: 'What is the cost of entry?', a: 'Our engagements start at $15k/mo, reflecting the elite caliber of our talent pool.' },
                  { q: 'Can we hire for full-time equity roles?', a: 'Yes, our direct-hire protocol handles executive-level AI placements with full vesting support.' },
              ].map((item, i) => (
                  <div key={i} className="border-b border-[#32312D]/10 pb-12 group cursor-pointer">
                      <div className="text-[#3A3F5F] font-black uppercase tracking-[0.3em] text-xs mb-4">{item.q}</div>
                      <p className="text-slate-400 text-sm leading-relaxed uppercase tracking-widest">{item.a}</p>
                  </div>
              ))}
          </div>
      </section>

      {/* 9. FINAL CTA SECTION */}
      <section className="py-40 px-6 md:px-12 bg-[#E7E6E2]">
        <div className="max-w-6xl mx-auto bg-white rounded-[80px] p-24 md:p-40 text-center relative overflow-hidden border border-[#32312D]/10 shadow-2xl">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#3A3F5F]/5 rounded-full blur-[120px]"></div>
          <h2 className="text-6xl md:text-9xl font-black text-[#32312D] mb-16 tracking-tighter relative uppercase">COMMAND <br/>THE FUTURE.</h2>
          <div className="flex flex-col sm:flex-row gap-10 justify-center items-center relative">
              <Link href="/signup" className="w-full sm:w-auto bg-[#3A3F5F] text-white px-16 py-6 rounded-full font-black uppercase text-xs tracking-[0.3em] hover:bg-[#3A3F5F]/90 transition-all shadow-xl shadow-[0_0_30px_rgba(58,63,95,0.1)]">Establish Presence</Link>
              <Link href="/engineers" className="w-full sm:w-auto text-[#3A3F5F] border-2 border-[#32312D]/10 px-16 py-6 rounded-full font-black uppercase text-xs tracking-[0.3em] hover:bg-[#E7E6E2] transition-all">Secure Talent</Link>
          </div>
        </div>
      </section>
      
      {/* FOOTER */}
      <footer className="py-24 px-6 md:px-12 border-t border-[#32312D]/10 bg-white">
        <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-4 gap-20 mb-20 text-left">
                <div className="col-span-1 md:col-span-2">
                    <div className="text-2xl font-black text-[#3A3F5F] mb-10 tracking-tighter">TALENT BRIDGE</div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] max-w-sm leading-loose">The premier global sanctuary for elite AI intelligence. Established 2026. San Francisco. London. Tokyo.</p>
                </div>
                <div>
                    <div className="text-[10px] font-black text-[#32312D] uppercase tracking-[0.4em] mb-10">Access</div>
                    <ul className="space-y-6 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                        <li><Link href="/engineers" className="hover:text-[#3A3F5F] transition-all">The Roster</Link></li>
                        <li><Link href="/solutions" className="hover:text-[#3A3F5F] transition-all">Protocols</Link></li>
                        <li><Link href="/pricing" className="hover:text-[#3A3F5F] transition-all">Tier Entry</Link></li>
                        <li><Link href="/partners" className="hover:text-[#3A3F5F] transition-all">Alliances</Link></li>
                    </ul>
                </div>
                <div>
                    <div className="text-[10px] font-black text-[#32312D] uppercase tracking-[0.4em] mb-10">Legal</div>
                    <ul className="space-y-6 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                        <li><Link href="/terms" className="hover:text-[#3A3F5F] transition-all">Terms of Accord</Link></li>
                        <li><Link href="/privacy" className="hover:text-[#3A3F5F] transition-all">Privacy Shield</Link></li>
                        <li><Link href="/contact" className="hover:text-[#3A3F5F] transition-all">Concierge</Link></li>
                    </ul>
                </div>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-center gap-12 pt-12 border-t border-[#32312D]/5">
                <div className="text-slate-300 text-[9px] font-black uppercase tracking-[0.5em]">© 2026 TALENT BRIDGE. SECURED.</div>
                <div className="flex gap-10 text-slate-300 font-black text-[9px] tracking-[0.3em]">
                    <div className="hover:text-[#3A3F5F] cursor-pointer transition-all uppercase">LinkedIn</div>
                    <div className="hover:text-[#3A3F5F] cursor-pointer transition-all uppercase">Twitter</div>
                    <div className="hover:text-[#3A3F5F] cursor-pointer transition-all uppercase">Instagram</div>
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
