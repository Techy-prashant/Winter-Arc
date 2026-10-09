"use client";

import Link from 'next/link';
import { useState } from 'react';
import { X, Github } from 'lucide-react';

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-[#0a0c10] text-gray-200 overflow-x-hidden selection:bg-blue-900/50">
      
      {/* Noise overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-40 px-6 py-8 flex justify-between items-center text-xs tracking-[0.2em] font-medium uppercase text-white/70">
        <div>NAMDAPHA WINTER ARC</div>
        <div className="flex gap-8">
          <Link href="/login" className="hover:text-white transition-colors">LOGIN</Link>
          <button onClick={() => setIsMenuOpen(true)} className="hover:text-white transition-colors">MENU</button>
        </div>
      </nav>

      {/* Menu Popup */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0a0c10] border border-white/10 rounded-2xl p-6 md:p-8 max-w-md w-full relative space-y-8 animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsMenuOpen(false)}
              className="absolute top-4 right-4 p-2 text-white/50 hover:text-white transition-colors rounded-full hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-3">
              <h3 className="text-xs font-medium tracking-[0.2em] text-white/50 uppercase">What is this?</h3>
              <p className="text-white/80 text-sm leading-relaxed">
                The Winter Arc is a commitment to self-improvement during the final months of the year. 
                This platform helps you track your daily non-negotiables, log workouts, and stay consistent 
                with your goals when most people give up.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-medium tracking-[0.2em] text-white/50 uppercase">Tech Stack</h3>
              <div className="flex flex-wrap gap-2">
                {['Next.js', 'React', 'Tailwind CSS', 'Supabase', 'TypeScript'].map(tech => (
                  <span key={tech} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-white/70">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-medium tracking-[0.2em] text-white/50 uppercase">Credits</h3>
              <div className="grid grid-cols-2 gap-2">
                {['Prashant Tiwari', 'Aman', 'Nitish', 'Sneh'].map(name => (
                  <button key={name} className="text-left px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all rounded-lg text-sm text-white/80">
                    {name}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <a 
                href="https://github.com/Techy-prashant/Winter-Arc.git" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-white text-black hover:bg-gray-200 transition-colors rounded-lg text-sm font-medium"
              >
                <Github className="w-4 h-4" />
                GitHub Repository
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center pt-20">
        
        {/* Artistic SVG Parallax Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div 
            className="absolute inset-0 opacity-40 mix-blend-screen scale-[1.15] animate-in fade-in duration-1000"
            style={{
              backgroundImage: 'url("/landing%20page%20bs.svg")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundAttachment: 'fixed'
            }}
          />
          <div className="absolute bottom-0 left-0 right-0 h-[60vh] bg-gradient-to-t from-[#05070a] via-[#0a0c10]/90 to-transparent z-10" />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[80vw] h-[80vw] md:w-[40vw] md:h-[40vw] rounded-full bg-white/5 blur-[100px] z-10" />
        </div>

        <div className="relative z-20 text-center space-y-6 flex flex-col items-center mt-[-10vh]">
          <h1 className="text-6xl md:text-9xl font-semibold tracking-tighter text-white">
            WINTER ARC
          </h1>
          <p className="text-sm md:text-base tracking-[0.3em] uppercase text-white/50 font-light">
            A challenge in consistency.
          </p>
        </div>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 text-[10px] tracking-[0.2em] uppercase text-white/40 flex flex-col items-center gap-4">
          SCROLL TO EXPLORE
          <div className="w-[1px] h-12 bg-gradient-to-b from-white/20 to-transparent" />
        </div>
      </section>

      {/* Scroll Sequence */}
      <section className="relative z-20 bg-[#05070a] py-32 px-6">
        <div className="max-w-4xl mx-auto space-y-48">
          
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-baseline border-t border-white/5 pt-12">
            <h2 className="text-4xl md:text-6xl font-medium tracking-tight text-white w-full md:w-1/2">
              SHOW UP.
            </h2>
            <p className="text-lg md:text-xl text-white/50 tracking-wide font-light w-full md:w-1/2">
              3+ HOURS / DAY
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-start md:items-baseline border-t border-white/5 pt-12">
            <h2 className="text-4xl md:text-6xl font-medium tracking-tight text-white w-full md:w-1/2">
              MOVE.
            </h2>
            <p className="text-lg md:text-xl text-white/50 tracking-wide font-light w-full md:w-1/2">
              3 SESSIONS / WEEK
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-start md:items-baseline border-t border-white/5 pt-12">
            <h2 className="text-4xl md:text-6xl font-medium tracking-tight text-white w-full md:w-1/2">
              GROW.
            </h2>
            <p className="text-lg md:text-xl text-white/50 tracking-wide font-light w-full md:w-1/2">
              WEEKLY CHALLENGES
            </p>
          </div>
          
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="relative z-20 bg-[#05070a] h-[80vh] flex flex-col items-center justify-center">
        <div className="text-center space-y-12">
          <h2 className="text-3xl md:text-5xl font-medium tracking-tight text-white">
            YOUR ARC STARTS HERE.
          </h2>
          <Link 
            href="/login" 
            className="inline-flex items-center gap-4 text-xs tracking-[0.2em] uppercase text-white/60 hover:text-white transition-colors border-b border-white/20 hover:border-white pb-2"
          >
            LOGIN <span>→</span>
          </Link>
        </div>
      </section>
      
    </div>
  );
}
