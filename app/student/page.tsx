'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, User, Briefcase, Plus, Search, 
  LogOut, Activity, X, CheckCircle2, Loader2, ChevronRight, 
  FileText, Globe, Book, Layers, 
  Link, Send, GraduationCap, Mail, Code2, ArrowUpCircle, ChevronDown, ExternalLink, Lock,
} from 'lucide-react';

export default function StudentHub() {
  const router = useRouter();
  const [activeTrack, setActiveTrack] = useState<'publication' | 'project'>('publication');
  const [showVault, setShowVault] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // 🛡️ SECURITY & UI STATES
  const [showPassModal, setShowPassModal] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ pubs: 0, projs: 0 });
  const [history, setHistory] = useState<any[]>([]);
  const [passData, setPassData] = useState({ new: '', confirm: '' });
  const [updatingPass, setUpdatingPass] = useState(false);

  // FORM STATES
  const [pubForm, setPubForm] = useState({ title: '', mentor_name: '', mentor_email: '', associated_project: '', drive_link: '', summary: '', details: '', pub_type: 'journal' });
  const [projForm, setProjForm] = useState({ title: '', description: '', mentor_name: '', mentor_email: '', doc_link: '', github_link: '', notes: '', category: 'ongoing' });

  useEffect(() => { fetchScholarSystem(); }, []);

  async function fetchScholarSystem() {
    setLoading(true);
    const email = localStorage.getItem('dbms_user_email');
    if (!email) { router.replace('/'); return; }

    try {
      const { data: user } = await supabase.from('users').select('*').eq('email', email).single();
      if (!user) return;
      setProfile(user);

      const { data: pubs } = await supabase.from('publications').select('*').or(`student_id.eq.${user.user_id},student_name.eq.${user.name}`);
      const { data: projs } = await supabase.from('projects').select('*').or(`student_id.eq.${user.user_id},student_name.eq.${user.name}`);

      const combined = [
        ...(pubs?.map(p => ({ ...p, sys_cat: 'publication' })) || []),
        ...(projs?.map(p => ({ ...p, sys_cat: 'project' })) || [])
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setHistory(combined);
      setStats({ pubs: pubs?.length || 0, projs: projs?.length || 0 });
    } catch (e) { console.error("ONE Sync Error:", e); }
    setLoading(false);
  }

  // 🔐 SECURITY HANDSHAKE
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passData.new !== passData.confirm) return alert("Keys do not match.");
    setUpdatingPass(true);
    const { error } = await supabase.from('users').update({ temp_pass: passData.new }).eq('email', profile.email);
    if (!error) {
      alert("SUCCESS: Access Key Re-Provisioned.");
      setShowPassModal(false);
      setPassData({ new: '', confirm: '' });
    } else {
      alert("ERROR: Security override failed.");
    }
    setUpdatingPass(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const table = activeTrack === 'publication' ? 'publications' : 'projects';
    const data = activeTrack === 'publication' ? pubForm : projForm;

    const { error } = await supabase.from(table).insert([{
      ...data,
      student_id: profile.user_id,
      student_name: profile.name
    }]);

    if (!error) {
      setShowVault(false);
      await fetchScholarSystem();
      setPubForm({ title: '', mentor_name: '', mentor_email: '', associated_project: '', drive_link: '', summary: '', details: '', pub_type: 'journal' });
      setProjForm({ title: '', description: '', mentor_name: '', mentor_email: '', doc_link: '', github_link: '', notes: '', category: 'ongoing' });
    } else {
      alert("SYSTEM ERROR: Data rejected.");
    }
    setSubmitting(false);
  };

  if (loading) return <div className="min-h-screen bg-[#09090B] flex items-center justify-center text-emerald-500 font-black text-2xl animate-pulse italic uppercase tracking-widest">Accessing ONE...</div>;

  return (
    <div className="flex min-h-screen bg-[#09090B] text-[#FAFAFA] font-sans selection:bg-emerald-500/30 overflow-hidden">
      
      {/* 🚀 SIDEBAR */}
      <nav className="w-80 border-r border-white/5 bg-[#0C0C0E] p-10 hidden lg:flex flex-col flex-shrink-0">
        <div className="flex items-center gap-4 mb-16 px-2">
          <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-xl">
            <ShieldCheck size={26} className="text-white" />
          </div>
          <span className="text-2xl font-black tracking-tighter uppercase leading-none italic">DBMS<br/><span className="text-emerald-500">ONE</span></span>
        </div>
        
        <div className="flex-1 space-y-12">
          <div className="space-y-6">
            <label className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-600">Identity</label>
            <div className="space-y-4">
              <ProfileItem label="Scholar" value={profile?.name} icon={<User size={16}/>} />
              <ProfileItem label="Network ID" value={profile?.email} icon={<Mail size={16}/>} />
              
              {/* 🔐 SECURITY TRIGGER */}
              <button 
                onClick={() => setShowPassModal(true)}
                className="w-full bg-white/5 border border-white/5 p-5 rounded-[28px] flex items-center gap-4 hover:bg-white/10 transition-all text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-zinc-500"><Lock size={16}/></div>
                <div>
                   <p className="text-[8px] font-black uppercase text-zinc-600 tracking-widest leading-none">Security</p>
                   <p className="text-xs font-bold text-white italic">Update Access Key</p>
                </div>
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <label className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-600">Performance Metrics</label>
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-[#121214] border border-white/5 p-8 rounded-[40px] text-center">
                <h4 className="text-6xl font-black text-emerald-500 tracking-tighter">{stats.pubs}</h4>
                <p className="text-[10px] font-black uppercase text-zinc-600 mt-2 tracking-widest">Publications</p>
              </div>
              <div className="bg-[#121214] border border-white/5 p-8 rounded-[40px] text-center">
                <h4 className="text-6xl font-black text-blue-500 tracking-tighter">{stats.projs}</h4>
                <p className="text-[10px] font-black uppercase text-zinc-600 mt-2 tracking-widest">Active Projects</p>
              </div>
            </div>
          </div>
        </div>

        <button onClick={() => { localStorage.clear(); router.replace('/'); }} className="flex items-center gap-4 p-5 text-zinc-500 hover:text-red-400 font-bold mt-auto transition-all">
          <LogOut size={22} /> <span className="text-lg uppercase italic font-black">Exit Hub</span>
        </button>
      </nav>

      <main className="flex-1 overflow-y-auto p-10 lg:p-16 relative custom-scrollbar">
        <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-12 gap-10">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-8xl font-black tracking-tighter italic text-white leading-none">Scholar.</h1>
            <p className="text-zinc-500 text-xl font-medium mt-3 uppercase tracking-[0.3em] italic">ONE Integrated Repository</p>
          </motion.div>
          
          <button 
            onClick={() => setShowVault(!showVault)} 
            className={`${showVault ? 'bg-zinc-800 text-zinc-400' : 'bg-white text-black'} px-10 py-5 rounded-[32px] font-black text-xl shadow-2xl transition-all active:scale-95 flex items-center gap-3`}
          >
              {showVault ? <ArrowUpCircle size={24} /> : <Plus size={24} strokeWidth={3} />}
              {showVault ? 'Dismiss Vault' : 'Initiate Research'}
          </button>
        </header>

        {/* 📥 VAULT */}
        <AnimatePresence>
          {showVault && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="bg-[#121214] border border-white/5 rounded-[60px] p-12 mb-16 shadow-3xl overflow-hidden"
            >
              <div className="flex bg-black/40 p-2 rounded-[24px] w-fit mb-10 border border-white/5">
                <button onClick={() => setActiveTrack('publication')} className={`px-10 py-3 rounded-[18px] font-black text-xs uppercase transition-all ${activeTrack === 'publication' ? 'bg-emerald-600 text-white' : 'text-zinc-500'}`}>Publication</button>
                <button onClick={() => setActiveTrack('project')} className={`px-10 py-3 rounded-[18px] font-black text-xs uppercase transition-all ${activeTrack === 'project' ? 'bg-blue-600 text-white' : 'text-zinc-500'}`}>Project</button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-12">
                {activeTrack === 'publication' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <FormInput label="Research Title" placeholder="..." onChange={(e: any) => setPubForm({...pubForm, title: e.target.value})} value={pubForm.title} />
                    <div className="grid grid-cols-2 gap-6">
                      <FormInput label="Mentor Name" placeholder="..." onChange={(e: any) => setPubForm({...pubForm, mentor_name: e.target.value})} value={pubForm.mentor_name} />
                      <FormInput label="Mentor Email" placeholder="..." onChange={(e: any) => setPubForm({...pubForm, mentor_email: e.target.value})} value={pubForm.mentor_email} />
                    </div>
                    <FormInput label="Associated Project" placeholder="..." onChange={(e: any) => setPubForm({...pubForm, associated_project: e.target.value})} value={pubForm.associated_project} />
                    <FormInput label="Google Drive Link" icon={<Globe size={16}/>} placeholder="..." onChange={(e: any) => setPubForm({...pubForm, drive_link: e.target.value})} value={pubForm.drive_link} />
                    <div className="md:col-span-2 space-y-10">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.5em] ml-6 italic">Publication Type</label>
                        <select className="w-full bg-[#1A1A1E] border border-white/10 rounded-[30px] py-6 px-10 text-xl text-white outline-none focus:border-emerald-500 appearance-none font-bold italic shadow-inner" onChange={(e: any) => setPubForm({...pubForm, pub_type: e.target.value})} value={pubForm.pub_type}>
                          <option value="journal">Journal Paper</option>
                          <option value="patent">Intellectual Patent</option>
                          <option value="conference">Conference Proceeding</option>
                        </select>
                      </div>
                      <FormArea label="Executive Summary" placeholder="..." onChange={(e: any) => setPubForm({...pubForm, summary: e.target.value})} value={pubForm.summary} />
                      <FormArea label="Deep Narrative" placeholder="..." onChange={(e: any) => setPubForm({...pubForm, details: e.target.value})} value={pubForm.details} />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <FormInput label="Execution Title" placeholder="..." onChange={(e: any) => setProjForm({...projForm, title: e.target.value})} value={projForm.title} />
                    <div className="grid grid-cols-2 gap-6">
                      <FormInput label="Mentor Name" placeholder="..." onChange={(e: any) => setProjForm({...projForm, mentor_name: e.target.value})} value={projForm.mentor_name} />
                      <FormInput label="Mentor Email" placeholder="..." onChange={(e: any) => setProjForm({...projForm, mentor_email: e.target.value})} value={projForm.mentor_email} />
                    </div>
                    <FormInput label="Git Repository" icon={<Code2 size={16}/>} placeholder="..." onChange={(e: any) => setProjForm({...projForm, github_link: e.target.value})} value={projForm.github_link} />
                    <FormInput label="Related Document" placeholder="..." onChange={(e: any) => setProjForm({...projForm, doc_link: e.target.value})} value={projForm.doc_link} />
                    <div className="md:col-span-2 space-y-10">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.5em] ml-6 italic">Classification</label>
                        <select className="w-full bg-[#1A1A1E] border border-white/10 rounded-[30px] py-6 px-10 text-xl text-white outline-none focus:border-blue-500 appearance-none font-bold italic shadow-inner" onChange={(e: any) => setProjForm({...projForm, category: e.target.value})} value={projForm.category}>
                          <option value="ongoing">Ongoing Projects</option>
                          <option value="course">Course Project</option>
                          <option value="papers">Papers Based</option>
                        </select>
                      </div>
                      <FormArea label="Project Description" placeholder="..." onChange={(e: any) => setProjForm({...projForm, description: e.target.value})} value={projForm.description} />
                      <FormArea label="Technical Logs" placeholder="..." onChange={(e: any) => setProjForm({...projForm, notes: e.target.value})} value={projForm.notes} />
                    </div>
                  </div>
                )}
                <button type="submit" disabled={submitting} className={`w-full py-8 rounded-[40px] font-black text-2xl text-white mt-6 shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-4 ${activeTrack === 'publication' ? 'bg-emerald-600 shadow-emerald-500/20' : 'bg-blue-600 shadow-blue-500/20'}`}>
                  {submitting ? <Loader2 className="animate-spin" /> : <Send size={24} strokeWidth={3} />}
                  <span>Push to ONE Repository</span>
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 📜 IDENTITY HISTORY (WITH DROPDOWNS) */}
        <div className="space-y-10 pb-20">
          <div className="flex items-center justify-between px-6">
             <h3 className="text-4xl font-black text-white italic uppercase tracking-tighter">Identity History.</h3>
             <div className="h-[1px] flex-1 mx-12 bg-white/5" />
          </div>
          
          {history.length === 0 ? (
            <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-[60px] bg-white/[0.01]">
               <Activity className="mx-auto text-zinc-800 mb-6" size={64} />
               <p className="text-zinc-600 font-black uppercase text-2xl italic tracking-[0.2em]">Zero Historical Data Found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
               {history.map((item, idx) => (
                 <div key={idx} className="bg-white/[0.01] border border-white/5 rounded-[48px] overflow-hidden group hover:border-emerald-500/10 transition-all">
                    <div 
                      onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                      className="p-10 flex items-center justify-between cursor-pointer hover:bg-white/[0.02]"
                    >
                      <div className="flex items-center gap-10">
                         <div className="text-center w-16">
                            <p className="text-[10px] font-black uppercase text-zinc-600 mb-1">{new Date(item.created_at).toLocaleString('default', { month: 'short' })}</p>
                            <h4 className="text-4xl font-black text-white leading-none tracking-tighter">{new Date(item.created_at).getDate()}</h4>
                         </div>
                         <div className="h-16 w-[1px] bg-white/5" />
                         <div>
                            <div className="flex items-center gap-3 mb-2">
                               <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${item.sys_cat === 'publication' ? 'text-emerald-500 bg-emerald-500/10' : 'text-blue-500 bg-blue-500/10'}`}>
                                 {item.pub_type || item.category}
                               </span>
                            </div>
                            <h4 className="text-3xl font-bold text-white uppercase italic leading-tight tracking-tight">{item.title}</h4>
                            <p className="text-sm text-zinc-500 mt-2 font-bold uppercase italic">Supervisor: <span className="text-zinc-300">{item.mentor_name}</span></p>
                         </div>
                      </div>
                      <ChevronDown className={`text-zinc-700 transition-all duration-500 ${expandedId === item.id ? 'rotate-180 text-emerald-500' : ''}`} size={32} />
                    </div>

                    <AnimatePresence>
                      {expandedId === item.id && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-black/20 border-t border-white/5">
                          <div className="p-12 grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-8">
                               <HistoryDetail label="Executive Narrative" value={item.summary || item.description} />
                               <HistoryDetail label="Assigned Mentor" value={`${item.mentor_name} (${item.mentor_email})`} />
                               {item.notes && <HistoryDetail label="Technical Notes" value={item.notes} />}
                            </div>
                            <div className="space-y-8">
                               <div className="bg-white/5 p-8 rounded-3xl border border-white/5">
                                  <p className="text-[10px] font-black uppercase text-zinc-600 mb-6 tracking-widest italic text-center">Repository Assets</p>
                                  <div className="flex flex-wrap justify-center gap-4">
                                     {item.drive_link && <ArtifactLink label="Cloud Drive" url={item.drive_link} icon={<Globe size={14}/>} />}
                                     {item.github_link && <ArtifactLink label="Git Source" url={item.github_link} icon={<Code2 size={14}/>} />}
                                     {item.doc_link && <ArtifactLink label="Project Doc" url={item.doc_link} icon={<FileText size={14}/>} />}
                                  </div>
                               </div>
                               {item.associated_project && <div className="bg-emerald-500/5 p-6 rounded-3xl border border-emerald-500/10 text-center"><p className="text-[9px] font-black uppercase text-emerald-600 mb-1">Linked Identity</p><p className="text-lg font-bold text-white italic">{item.associated_project}</p></div>}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                 </div>
               ))}
            </div>
          )}
        </div>

        {/* 🔐 SECURITY MODAL (Surgically Inserted) */}
        <AnimatePresence>
          {showPassModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-3xl bg-black/80">
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-[#121214] border border-white/10 w-full max-w-xl rounded-[60px] p-12 shadow-2xl relative">
                <button onClick={() => setShowPassModal(false)} className="absolute top-8 right-8 text-zinc-600 hover:text-white transition-all"><X size={32}/></button>
                <h2 className="text-5xl font-black text-white mb-10 italic uppercase tracking-tighter">Reset Key.</h2>
                <form onSubmit={handlePasswordUpdate} className="space-y-8">
                  <FormInput label="New Access Key" placeholder="••••••••" onChange={(e:any) => setPassData({...passData, new: e.target.value})} value={passData.new} icon={<Lock size={18}/>} />
                  <FormInput label="Confirm New Key" placeholder="••••••••" onChange={(e:any) => setPassData({...passData, confirm: e.target.value})} value={passData.confirm} icon={<CheckCircle2 size={18}/>} />
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

// ATOMS (UI Integrity preserved)
function HistoryDetail({ label, value }: any) {
  return (
    <div className="space-y-3">
       <p className="text-[10px] font-black uppercase text-zinc-700 tracking-[0.2em] italic ml-4">{label}</p>
       <div className="bg-white/5 border border-white/10 rounded-3xl p-6 text-sm italic text-zinc-400 leading-relaxed shadow-inner">{value || "No detailed log found."}</div>
    </div>
  );
}
function ArtifactLink({ label, url, icon }: any) {
  return (
    <a href={url} target="_blank" className="flex items-center gap-3 px-6 py-3 bg-zinc-900 border border-white/5 rounded-2xl text-[10px] font-black uppercase text-zinc-400 hover:bg-emerald-600 hover:text-white transition-all shadow-xl">
      {icon} {label} <ExternalLink size={12} className="opacity-50" />
    </a>
  );
}
function ProfileItem({ label, value, icon }: any) {
  return (
    <div className="bg-white/[0.02] border border-white/5 p-6 rounded-[32px] flex items-center gap-5 group hover:bg-white/[0.05] transition-all">
      <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-zinc-600 group-hover:text-emerald-500 transition-colors shadow-inner">{icon}</div>
      <div className="min-w-0"><p className="text-[9px] font-black uppercase text-zinc-700 mb-1.5 tracking-widest leading-none">{label}</p><p className="text-base font-bold text-white truncate italic">{value || '...'}</p></div>
    </div>
  );
}
function FormInput({ label, placeholder, onChange, value, icon }: any) {
  return (
    <div className="space-y-4">
      <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.5em] ml-8 flex items-center gap-2 italic">{icon} {label}</label>
      <input required className="w-full bg-white/5 border border-white/10 rounded-[35px] py-7 px-12 text-2xl text-white outline-none focus:border-white/20 transition-all placeholder:text-zinc-900 shadow-inner italic" placeholder={placeholder} onChange={onChange} value={value} />
    </div>
  );
}
function FormArea({ label, placeholder, onChange, value }: any) {
  return (
    <div className="space-y-4">
      <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.5em] ml-8 italic">{label}</label>
      <textarea required className="w-full bg-white/5 border border-white/10 rounded-[45px] py-8 px-12 text-2xl text-white outline-none focus:border-white/20 transition-all placeholder:text-zinc-900 shadow-inner italic" rows={4} placeholder={placeholder} onChange={onChange} value={value} />
    </div>
  );
}