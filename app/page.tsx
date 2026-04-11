'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight, Loader2, Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // 🛡️ GUARD 1: Prevent automatic redirect loops on mount
  useEffect(() => {
    // If the page is looping, clearing this helps reset the router state
    const currentRole = localStorage.getItem('dbms_user_role');
    if (currentRole && window.location.pathname === '/login') {
       // Only redirect if we are sure we aren't already looping
       console.log("Session detected, standing by...");
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; // Prevent double-clicks
    
    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();

    try {
      // 🔍 STEP 1: Query the Oracle Registry
      const { data: userRecord, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', cleanEmail)
        .single();

      if (error || !userRecord) {
        alert("ACCESS DENIED: Identity not provisioned in Oracle.");
        setLoading(false);
        return;
      }

      // 🔐 STEP 2: REDIRECTION MATRIX LOGIC
      if (password === userRecord.temp_pass) {
        
        // 💾 CRITICAL: Save data BEFORE triggering navigation
        localStorage.setItem('dbms_user_email', cleanEmail);
        localStorage.setItem('dbms_user_role', userRecord.role);
        localStorage.setItem('dbms_user_name', userRecord.name);

        // 🚀 STEP 3: REFINED ROUTING
        // We use window.location.href for the first login to "Hard Reset" the 
        // browser state and break any Next.js Router cache loops.
        const targetPath = userRecord.role === 'admin' ? '/admin' : 
                           userRecord.role === 'faculty' ? '/faculty' : '/student';
        
        window.location.href = targetPath; 
        
      } else {
        alert("SECURITY BREACH: Invalid Access Key.");
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      alert("SYSTEM ERROR: Connectivity to Oracle lost.");
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-6 bg-[#020203] relative overflow-hidden font-sans">
      
      {/* 🌌 ATMOSPHERIC BACKGROUND */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-600/5 rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="w-full max-w-xl z-10"
      >
        {/* LOGO SECTION */}
        <div className="flex flex-col items-center mb-12 text-center">
          <div className="w-20 h-20 bg-indigo-600 rounded-[28px] flex items-center justify-center shadow-[0_0_50px_rgba(79,70,229,0.3)] mb-6 group transition-all hover:scale-110">
            <ShieldCheck size={40} className="text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-6xl font-black tracking-tighter text-white uppercase italic leading-none">
            DBMS<span className="text-indigo-500">ONE</span>
          </h1>
          <div className="flex items-center gap-2 mt-4">
             <div className="h-[1px] w-8 bg-indigo-500/30" />
             <p className="text-zinc-500 text-xs font-black tracking-[0.4em] uppercase italic">Oracle Gateway</p>
             <div className="h-[1px] w-8 bg-indigo-500/30" />
          </div>
        </div>

        {/* ACCESS CARD */}
        <div className="bg-white/[0.02] border border-white/10 rounded-[56px] p-12 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
          
          <form onSubmit={handleLogin} className="space-y-10">
            {/* EMAIL FIELD */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.5em] ml-6">Credential ID</label>
              <div className="relative group">
                <Mail className="absolute left-8 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-indigo-500 transition-colors" size={20} />
                <input 
                  type="email" 
                  placeholder="name@university.edu" 
                  className="w-full bg-white/5 border border-white/10 rounded-[30px] py-6 pl-16 pr-10 text-xl text-white outline-none focus:border-indigo-500/50 transition-all placeholder:text-zinc-800 shadow-inner" 
                  onChange={(e) => setEmail(e.target.value)} 
                  value={email}
                  required 
                />
              </div>
            </div>

            {/* PASSWORD FIELD */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.5em] ml-6">Access Key</label>
              <div className="relative group">
                <Lock className="absolute left-8 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-indigo-500 transition-colors" size={20} />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  className="w-full bg-white/5 border border-white/10 rounded-[30px] py-6 pl-16 pr-10 text-xl text-white outline-none focus:border-indigo-500/50 transition-all placeholder:text-zinc-800 shadow-inner" 
                  onChange={(e) => setPassword(e.target.value)} 
                  value={password}
                  required 
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-white hover:text-black text-white py-7 rounded-[32px] font-black text-xl shadow-2xl transition-all flex items-center justify-center gap-4 active:scale-95 group relative"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  <span className="uppercase italic tracking-widest">Initialize Session</span>
                  <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* SYSTEM STATUS */}
          <div className="mt-12 pt-8 border-t border-white/5 flex justify-between items-center px-4">
             <div className="flex items-center gap-2 text-[9px] font-black text-zinc-700 uppercase tracking-widest">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Database Online
             </div>
             <p className="text-[9px] text-zinc-700 font-black uppercase tracking-widest">Authorized Personnel Only</p>
          </div>
        </div>
      </motion.div>

      {/* FOOTER DECOR */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-5 pointer-events-none">
        <h2 className="text-[15vw] font-black text-white italic leading-none select-none">ORACLE</h2>
      </div>
    </main>
  );
}