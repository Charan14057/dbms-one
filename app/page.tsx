'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ArrowRight, Loader2, Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // 🛡️ GUARD: Ensure fresh session & fix Hydration Error
  useEffect(() => {
    setMounted(true);
    localStorage.clear();
    console.log("ONE Hub: Gateway Primed.");
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; 
    
    setLoading(true);
    // 🛡️ DATA INTEGRITY: Strict lowercase and trim
    const cleanEmail = email.trim().toLowerCase();

    try {
      // 🔍 Query the ONE Registry
      const { data: userRecord, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', cleanEmail)
        .single();

      if (error || !userRecord) {
        alert("ACCESS DENIED: Identity not provisioned in ONE Hub.");
        setLoading(false);
        return;
      }

      // 🔐 Authenticate via temporary access key
      if (password === userRecord.temp_pass) {
        // 💾 Secure handshake data
        localStorage.setItem('dbms_user_email', cleanEmail);
        localStorage.setItem('dbms_user_role', userRecord.role);
        localStorage.setItem('dbms_user_name', userRecord.name);

        // 🚀 High-velocity routing matrix
        const targetPath = userRecord.role === 'admin' ? '/admin' : 
                           userRecord.role === 'faculty' ? '/faculty' : '/student';
        
        window.location.href = targetPath; 
      } else {
        alert("SECURITY BREACH: Invalid Access Key.");
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      alert("SYSTEM ERROR: Connectivity to ONE Hub lost.");
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <main className="flex min-h-screen items-center justify-center p-4 lg:p-6 bg-slate-50 relative overflow-hidden font-sans text-slate-900">
      
      {/* 🌌 ATMOSPHERIC AMBIENCE */}
      <div className="absolute top-[-10%] left-[-10%] w-[300px] lg:w-[600px] h-[300px] lg:h-[600px] bg-blue-600/10 rounded-full blur-[100px] lg:blur-[140px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[250px] lg:w-[500px] h-[250px] lg:h-[500px] bg-blue-400/5 rounded-full blur-[80px] lg:blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="w-full max-w-xl z-10"
      >
        {/* LOGO ENGINE */}
        <div className="flex flex-col items-center mb-10 lg:mb-12 text-center">
          <div className="w-16 h-16 lg:w-20 lg:h-20 bg-blue-600 rounded-[24px] lg:rounded-[28px] flex items-center justify-center shadow-[0_0_50px_rgba(37,99,235,0.2)] mb-6 transition-all hover:scale-110 border-b-4 border-blue-800">
            <ShieldCheck size={32} className="text-white lg:hidden" strokeWidth={2.5} />
            <ShieldCheck size={40} className="text-white hidden lg:block" strokeWidth={2.5} />
          </div>
          <h1 className="text-5xl lg:text-6xl font-black tracking-tighter text-blue-900 uppercase italic leading-none">
            DBMS<span className="text-blue-600">ONE</span>
          </h1>
          <div className="flex items-center gap-2 mt-4">
             <div className="h-[1px] w-6 lg:w-8 bg-blue-200" />
             <p className="text-slate-400 text-[10px] font-black tracking-[0.4em] uppercase italic">System Gateway</p>
             <div className="h-[1px] w-6 lg:w-8 bg-blue-200" />
          </div>
        </div>

        {/* ACCESS INTERFACE */}
        <div className="bg-white border border-slate-200 rounded-[40px] lg:rounded-[56px] p-8 lg:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.05)] relative overflow-hidden mx-2 lg:mx-0">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
          
          <form onSubmit={handleLogin} className="space-y-8 lg:space-y-10">
            {/* CREDENTIALS */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] ml-6 italic">Identity ID</label>
              <div className="relative group">
                <Mail className="absolute left-6 lg:left-8 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input 
                  type="email" 
                  placeholder="name@university.edu" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-[24px] lg:rounded-[30px] py-5 lg:py-6 pl-14 lg:pl-16 pr-8 text-lg lg:text-xl text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all placeholder:text-slate-300 shadow-inner italic lowercase" 
                  onChange={(e) => setEmail(e.target.value)} 
                  value={email}
                  required 
                />
              </div>
            </div>

            {/* SECURITY KEY */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] ml-6 italic">Access Key</label>
              <div className="relative group">
                <Lock className="absolute left-6 lg:left-8 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-[24px] lg:rounded-[30px] py-5 lg:py-6 pl-14 lg:pl-16 pr-8 text-lg lg:text-xl text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all placeholder:text-slate-300 shadow-inner" 
                  onChange={(e) => setPassword(e.target.value)} 
                  value={password}
                  required 
                />
              </div>
            </div>

            {/* 🛠️ 3D SKEUOMORPHIC BUTTON */}
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 lg:py-7 rounded-[28px] lg:rounded-[32px] font-black text-xl shadow-[0_10px_0_rgb(30,58,138),0_20px_40px_rgba(37,99,235,0.2)] hover:translate-y-[2px] hover:shadow-[0_8px_0_rgb(30,58,138)] active:translate-y-[10px] active:shadow-none transition-all flex items-center justify-center gap-4 group"
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

          {/* NETWORK STATUS */}
          <div className="mt-10 lg:mt-12 pt-6 lg:pt-8 border-t border-slate-100 flex flex-col lg:flex-row justify-between items-center gap-4 px-4">
             <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest italic">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />
                Database Active
             </div>
             <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest italic">Authorized Personnel Only</p>
          </div>
        </div>
      </motion.div>

      {/* BACKGROUND BRANDING */}
      <div className="absolute bottom-6 lg:bottom-10 left-1/2 -translate-x-1/2 opacity-[0.05] pointer-events-none">
        <h2 className="text-[25vw] lg:text-[15vw] font-black text-slate-900 italic leading-none select-none uppercase">ONE</h2>
      </div>
    </main>
  );
}