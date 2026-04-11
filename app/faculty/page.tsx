'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, User, Briefcase, Search, 
  LogOut, Activity, ChevronDown, 
  FileText, Globe, Book, Layers, 
  Link, GraduationCap, Mail, Code2, ExternalLink, Lock, CheckCircle2, Loader2
} from 'lucide-react';

export default function MentorHub() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // 👤 PROFILE & DATA
  const [profile, setProfile] = useState<any>(null);
  const [mentorStats, setMentorStats] = useState({ totalSubmissions: 0 });
  const [supervisionList, setSupervisionList] = useState<any[]>([]);

  // 🔐 SECURITY STATES
  const [showPassModal, setShowPassModal] = useState(false);
  const [passData, setPassData] = useState({ new: '', confirm: '' });
  const [updatingPass, setUpdatingPass] = useState(false);

  useEffect(() => { fetchMentorEcosystem(); }, []);

  async function fetchMentorEcosystem() {
    setLoading(true);
    const email = localStorage.getItem('dbms_user_email');
    if (!email) { router.replace('/'); return; }

    try {
      const { data: user } = await supabase.from('users').select('*').eq('email', email).single();
      if (!user) return;
      setProfile(user);

      const { data: pubs } = await supabase.from('publications').select('*').eq('mentor_email', email);
      const { data: projs } = await supabase.from('projects').select('*').eq('mentor_email', email);

      const combined = [
        ...(pubs?.map(p => ({ ...p, sys_cat: 'publication' })) || []),
        ...(projs?.map(p => ({ ...p, sys_cat: 'project' })) || [])
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setSupervisionList(combined);
      setMentorStats({ totalSubmissions: combined.length });
    } catch (e) { console.error("Filter Error:", e); }
    setLoading(false);
  }

  // 🔐 SECURITY HANDSHAKE
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passData.new !== passData.confirm) return alert("Keys do not match.");
    setUpdatingPass(true);
    const { error } = await supabase.from('users').update({ temp_pass: passData.new }).eq('email', profile.email);
    if (!error) {
      alert("SUCCESS: Mentor Access Key Updated.");
      setShowPassModal(false);
      setPassData({ new: '', confirm: '' });
    } else {
      alert("ERROR: Security override failed.");
    }
    setUpdatingPass(false);
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) return <div className="min-h-screen bg-[#09090B] flex items-center justify-center text-blue-500 font-black text-2xl animate-pulse italic uppercase tracking-widest">Filtering Ecosystem...</div>;

  return (
    <div className="flex min-h-screen bg-[#09090B] text-[#FAFAFA] font-sans selection:bg-blue-500/30 overflow-hidden">
      
      {/* 🚀 SIDEBAR (MENTOR IDENTITY) */}
      <nav className="w-80 border-r border-white/5 bg-[#0C0C0E] p-10 hidden lg:flex flex-col flex-shrink-0">
        <div className="flex items-center gap-4 mb-16 px-2">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-900/20">
            <ShieldCheck size={26} className="text-white" />
          </div>
          <span className="text-2xl font-black tracking-tighter uppercase leading-none italic">DBMS<br/><span className="text-blue-500">ONE</span></span>
        </div>
        
        <div className="flex-1 space-y-12">
          {/* PROFILE CARD */}
          <div className="space-y-6">
            <label className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-600">Mentor Identity</label>
            <div className="space-y-4">
              <ProfileItem label="Faculty" value={profile?.name} icon={<User size={16}/>} />
              <ProfileItem label="Auth Email" value={profile?.email} icon={<Mail size={16}/>} />
              
              {/* 🔐 SECURITY TRIGGER */}
              <button 
                onClick={() => setShowPassModal(true)}
                className="w-full bg-white/5 border border-white/5 p-5 rounded-[28px] flex items-center gap-4 hover:bg-white/10 transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-zinc-500 group-hover:text-blue-500 transition-colors"><Lock size={16}/></div>
                <div>
                   <p className="text-[8px] font-black uppercase text-zinc-600 tracking-widest leading-none">Security</p>
                   <p className="text-xs font-bold text-white italic">Update Access Key</p>
                </div>
              </button>
            </div>
          </div>

          {/* SUPERVISION METRIC */}
          <div className="space-y-6">
            <label className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-600">Supervision Load</label>
            <div className="bg-blue-600/10 border border-blue-500/20 p-10 rounded-[40px] text-center">
              <h4 className="text-7xl font-black text-blue-500 tracking-tighter">{mentorStats.totalSubmissions}</h4>
              <p className="text-[10px] font-black uppercase text-blue-500/60 mt-3 tracking-widest leading-none">Total Supervised Records</p>
            </div>
          </div>
        </div>

        <button onClick={() => { localStorage.clear(); router.replace('/'); }} className="flex items-center gap-4 p-5 text-zinc-500 hover:text-red-400 font-bold mt-auto transition-all group">
          <LogOut size={22} className="group-hover:-translate-x-1 transition-transform" /> <span className="text-lg uppercase italic font-black">Disconnect</span>
        </button>
      </nav>

      {/* 🏆 MAIN INTERFACE */}
      <main className="flex-1 overflow-y-auto p-10 lg:p-16 relative custom-scrollbar">
        <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-12 gap-10">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-8xl font-black tracking-tighter italic text-white leading-none">Command.</h1>
            <p className="text-zinc-500 text-xl font-medium mt-3 uppercase tracking-[0.3em] italic underline decoration-blue-500/30 underline-offset-8">Research Supervision Feed</p>
          </motion.div>

          <div className="relative w-full md:w-[400px]">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600" size={24} />
            <input 
              className="w-full bg-white/5 border border-white/10 rounded-[28px] py-5 pl-16 pr-8 text-xl text-white outline-none focus:ring-2 focus:ring-blue-500/20 placeholder:text-zinc-800 italic shadow-inner" 
              placeholder="Search Title / Scholar..." 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
        </header>

        {/* 📋 SUPERVISION FEED */}
        <div className="space-y-6 pb-20">
          {supervisionList
            .filter(item => (item.title + item.student_name).toLowerCase().includes(searchTerm.toLowerCase()))
            .length === 0 ? (
            <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-[60px] bg-white/[0.01]">
               <Activity className="mx-auto text-zinc-800 mb-6" size={64} />
               <p className="text-zinc-600 font-black uppercase text-2xl italic tracking-[0.2em]">No Supervised Data Found.</p>
            </div>
          ) : (
            supervisionList
              .filter(item => (item.title + item.student_name).toLowerCase().includes(searchTerm.toLowerCase()))
              .map((item, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#121214] border border-white/5 rounded-[40px] overflow-hidden group transition-all">
                <div onClick={() => toggleExpand(item.id)} className="p-8 cursor-pointer flex items-center justify-between hover:bg-white/[0.02] transition-all">
                  <div className="flex items-center gap-10">
                    <div className="text-center w-16">
                      <p className="text-[9px] font-black uppercase text-zinc-600 mb-1">{new Date(item.created_at).toLocaleString('default', { month: 'short' })}</p>
                      <h4 className="text-3xl font-black text-white leading-none tracking-tighter">{new Date(item.created_at).getDate()}</h4>
                    </div>
                    <div className="h-12 w-[1px] bg-white/5" />
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${item.sys_cat === 'publication' ? 'text-emerald-500 bg-emerald-500/5' : 'text-blue-500 bg-blue-500/5'}`}>{item.pub_type || item.category}</span>
                      </div>
                      <h4 className="text-2xl font-bold text-white uppercase italic tracking-tight">{item.title}</h4>
                      <p className="text-xs text-zinc-500 mt-1 font-bold uppercase italic">Scholar: <span className="text-zinc-300">{item.student_name}</span></p>
                    </div>
                  </div>
                  <ChevronDown size={28} className={`text-zinc-700 transition-all duration-500 ${expandedId === item.id ? 'rotate-180 text-blue-500' : ''}`} />
                </div>

                <AnimatePresence>
                  {expandedId === item.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-white/5 bg-black/20">
                      <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-6">
                           <DetailBox label="Technical Description" value={item.summary || item.description} />
                           {item.details || item.notes ? <DetailBox label="Narrative / Internal Logs" value={item.details || item.notes} /> : null}
                        </div>
                        <div className="space-y-6">
                           <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                              <p className="text-[9px] font-black uppercase text-zinc-600 mb-4 tracking-widest italic text-center">Repository Artifacts</p>
                              <div className="flex flex-wrap justify-center gap-4">
                                 {item.drive_link && <ArtifactLink label="Drive Assets" icon={<Globe size={14}/>} url={item.drive_link} />}
                                 {item.github_link && <ArtifactLink label="Source Repo" icon={<Code2 size={14}/>} url={item.github_link} />}
                                 {item.doc_link && <ArtifactLink label="Documentation" icon={<FileText size={14}/>} url={item.doc_link} />}
                              </div>
                           </div>
                           <div className="bg-white/[0.01] p-6 rounded-3xl border border-dashed border-white/5 text-center">
                              <p className="text-[9px] font-black uppercase text-zinc-700 mb-1 tracking-widest">Scholar Signature</p>
                              <p className="text-xs font-bold text-zinc-500 italic">{item.student_name} (ID: {item.student_id?.slice(0,8)})</p>
                           </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </div>

        {/* 🔐 SECURITY MODAL */}
        <AnimatePresence>
          {showPassModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-3xl bg-black/80">
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-[#121214] border border-white/10 w-full max-w-xl rounded-[60px] p-12 shadow-2xl relative">
                <button onClick={() => setShowPassModal(false)} className="absolute top-8 right-8 text-zinc-600 hover:text-white transition-all"><X size={32}/></button>
                <h2 className="text-5xl font-black text-white mb-10 italic uppercase tracking-tighter">Reset Key.</h2>
                <form onSubmit={handlePasswordUpdate} className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.5em] ml-8 flex items-center gap-2 italic"><Lock size={18}/> New Access Key</label>
                    <input required className="w-full bg-white/5 border border-white/10 rounded-[35px] py-7 px-12 text-2xl text-white outline-none focus:border-white/20 transition-all placeholder:text-zinc-900 shadow-inner italic" placeholder="••••••••" type="password" onChange={(e:any) => setPassData({...passData, new: e.target.value})} value={passData.new} />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.5em] ml-8 flex items-center gap-2 italic"><CheckCircle2 size={18}/> Confirm New Key</label>
                    <input required className="w-full bg-white/5 border border-white/10 rounded-[35px] py-7 px-12 text-2xl text-white outline-none focus:border-white/20 transition-all placeholder:text-zinc-900 shadow-inner italic" placeholder="••••••••" type="password" onChange={(e:any) => setPassData({...passData, confirm: e.target.value})} value={passData.confirm} />
                  </div>
                  <button type="submit" disabled={updatingPass} className="w-full py-8 bg-white text-black rounded-[40px] font-black text-2xl shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-4">
                    {updatingPass ? <Loader2 className="animate-spin" /> : 'Provision New Key'}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// ATOMS (Preserved UI)
function ProfileItem({ label, value, icon }: any) {
  return (
    <div className="bg-white/[0.02] border border-white/5 p-6 rounded-[32px] flex items-center gap-5 group hover:bg-white/[0.05] transition-all">
      <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-zinc-600 group-hover:text-blue-500 transition-colors shadow-inner">{icon}</div>
      <div className="min-w-0"><p className="text-[9px] font-black uppercase text-zinc-700 tracking-widest leading-none mb-1.5">{label}</p><p className="text-base font-bold text-white truncate italic">{value || 'Syncing...'}</p></div>
    </div>
  );
}
function DetailBox({ label, value }: { label: string, value: string }) {
  return (
    <div className="space-y-3">
       <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest ml-2 italic">{label}</label>
       <div className="bg-white/5 border border-white/10 rounded-3xl p-6 text-sm text-zinc-300 italic leading-relaxed whitespace-pre-wrap shadow-inner">{value || 'No data provided.'}</div>
    </div>
  );
}
function ArtifactLink({ label, icon, url }: { label: string, icon: any, url: string }) {
  return (
    <a href={url} target="_blank" className="flex items-center gap-3 px-6 py-3 bg-zinc-900 hover:bg-white hover:text-black rounded-2xl text-[10px] font-black uppercase transition-all shadow-xl border border-white/5">{icon} {label} <ExternalLink size={12} className="opacity-50" /></a>
  );
}