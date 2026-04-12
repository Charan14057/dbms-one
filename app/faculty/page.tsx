'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, User, Briefcase, Plus, Search, 
  LogOut, Activity, X, CheckCircle2, Loader2, ChevronRight, 
  FileText, Globe, Book, Layers, 
  Link, Send, GraduationCap, Mail, Code2, ArrowUpCircle, ChevronDown, ExternalLink, Lock, Menu ,  
} from 'lucide-react';

export default function MentorHub() {
  const router = useRouter();
  const [activeTrack, setActiveTrack] = useState<'publication' | 'project'>('publication');
  const [showVault, setShowVault] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // 📱 MOBILE & UI STATES
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [mentorStats, setMentorStats] = useState({ totalSubmissions: 0 });
  const [supervisionList, setSupervisionList] = useState<any[]>([]);
  const [showPassModal, setShowPassModal] = useState(false);
  const [passData, setPassData] = useState({ new: '', confirm: '' });
  const [updatingPass, setUpdatingPass] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // 📥 MENTOR-SCHOLAR FORM STATES
  const [pubForm, setPubForm] = useState({ title: '', student_name: '', student_email: '', associated_project: '', drive_link: '', summary: '', details: '', pub_type: 'journal' });
  const [projForm, setProjForm] = useState({ title: '', description: '', student_name: '', student_email: '', doc_link: '', github_link: '', notes: '', category: 'ongoing' });

  const toggleExpand = (id: string) => setExpandedId(expandedId === id ? null : id);

  useEffect(() => { fetchMentorEcosystem(); }, []);

  async function fetchMentorEcosystem() {
    setLoading(true);
    const email = localStorage.getItem('dbms_user_email');
    if (!email) { router.replace('/'); return; }
    try {
      const { data: user } = await supabase.from('users').select('*').eq('email', email).single();
      if (!user) return;
      setProfile(user);

      // QUERY: Fetch records where current user is the mentor
      const { data: pubs } = await supabase.from('publications').select('*').ilike('mentor_email', email);
      const { data: projs } = await supabase.from('projects').select('*').ilike('mentor_email', email);

      const combined = [...(pubs?.map(p => ({ ...p, sys_cat: 'publication' })) || []), ...(projs?.map(p => ({ ...p, sys_cat: 'project' })) || [])].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setSupervisionList(combined);
      setMentorStats({ totalSubmissions: combined.length });
    } catch (e) { console.error("Sync Error:", e); }
    setLoading(false);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const table = activeTrack === 'publication' ? 'publications' : 'projects';
    const rawData = activeTrack === 'publication' ? pubForm : projForm;

    // 🛠️ BILATERAL LOGIC: Set Mentor from profile, Scholar from Form
    const data = { 
      ...rawData, 
      mentor_name: profile.name, 
      mentor_email: profile.email.toLowerCase().trim(),
      student_email: rawData.student_email.toLowerCase().trim()
    };

    const { error } = await supabase.from(table).insert([data]);
    if (!error) { 
        setShowVault(false); 
        await fetchMentorEcosystem(); 
        setPubForm({ title: '', student_name: '', student_email: '', associated_project: '', drive_link: '', summary: '', details: '', pub_type: 'journal' });
        setProjForm({ title: '', description: '', student_name: '', student_email: '', doc_link: '', github_link: '', notes: '', category: 'ongoing' });
    } else { alert("Handshake Refused: System Error."); }
    setSubmitting(false);
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passData.new !== passData.confirm) return alert("Keys do not match.");
    setUpdatingPass(true);
    const { error } = await supabase.from('users').update({ temp_pass: passData.new }).eq('email', profile.email);
    if (!error) { alert("SUCCESS: Key Secured."); setShowPassModal(false); }
    setUpdatingPass(false);
  };

  if (loading) return <div className="min-h-screen bg-[#09090B] flex items-center justify-center text-blue-500 font-black text-2xl animate-pulse italic uppercase tracking-widest">Accessing ONE Command...</div>;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#09090B] text-[#FAFAFA] font-sans selection:bg-blue-500/30 overflow-x-hidden">
      
      {/* 📱 MOBILE HEADER */}
      <div className="lg:hidden flex items-center justify-between p-6 border-b border-white/5 bg-[#0C0C0E] sticky top-0 z-[60]">
        <div className="flex items-center gap-3"><div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg"><ShieldCheck size={20} className="text-white" /></div><span className="text-xl font-black tracking-tighter uppercase italic">DBMS<span className="text-blue-500">ONE</span></span></div>
        <button onClick={() => setShowMobileSidebar(true)} className="p-3 bg-white/5 rounded-xl text-zinc-400"><Menu size={24} /></button>
      </div>

      <AnimatePresence>
        {(showMobileSidebar || (typeof window !== 'undefined' && window.innerWidth >= 1024)) && (
          <motion.nav initial={{ x: -320 }} animate={{ x: 0 }} exit={{ x: -320 }} className={`fixed lg:relative z-[70] w-80 h-full border-r border-white/5 bg-[#0C0C0E] p-10 flex flex-col flex-shrink-0 transition-transform lg:translate-x-0 ${showMobileSidebar ? 'translate-x-0' : '-translate-x-full lg:flex'}`}>
            <button onClick={() => setShowMobileSidebar(false)} className="lg:hidden absolute top-8 right-8 text-zinc-500"><X size={28}/></button>
            <div className="flex items-center gap-4 mb-16 px-2 hidden lg:flex"><div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-900/20"><ShieldCheck size={26} className="text-white" /></div><span className="text-2xl font-black tracking-tighter uppercase leading-none italic">DBMS<br/><span className="text-blue-500">ONE</span></span></div>
            <div className="flex-1 space-y-12">
              <div className="space-y-6">
                <label className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-600 italic">Mentor Identity</label>
                <div className="space-y-4">
                  <ProfileItem label="Faculty" value={profile?.name} icon={<User size={16}/>} />
                  <ProfileItem label="Auth Email" value={profile?.email} icon={<Mail size={16}/>} />
                  <button onClick={() => { setShowPassModal(true); setShowMobileSidebar(false); }} className="w-full bg-white/5 border border-white/5 p-5 rounded-[28px] flex items-center gap-4 hover:bg-white/10 transition-all text-left group">
                    <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-zinc-500 group-hover:text-blue-500 transition-colors shadow-inner"><Lock size={16}/></div>
                    <div className="min-w-0"><p className="text-[8px] font-black text-zinc-600 uppercase leading-none italic">Security</p><p className="text-xs font-bold text-white italic truncate">Update Access Key</p></div>
                  </button>
                </div>
              </div>
              <div className="space-y-6">
                <label className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-600 italic">Metrics</label>
                <div className="bg-blue-600/10 border border-blue-500/20 p-10 rounded-[40px] text-center shadow-inner"><h4 className="text-6xl lg:text-7xl font-black text-blue-500 tracking-tighter">{mentorStats.totalSubmissions}</h4><p className="text-[10px] font-black uppercase text-blue-500/60 mt-3 leading-none italic">Records Supervised</p></div>
              </div>
            </div>
            <button onClick={() => { localStorage.clear(); router.replace('/'); }} className="flex items-center gap-4 p-5 text-zinc-500 hover:text-red-400 font-bold mt-auto transition-all group"><LogOut size={22} className="group-hover:-translate-x-1" /> <span className="text-lg uppercase italic font-black">Disconnect</span></button>
          </motion.nav>
        )}
      </AnimatePresence>

      <main className="flex-1 overflow-y-auto p-6 lg:p-16 relative custom-scrollbar">
        <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-12 gap-10">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}><h1 className="text-6xl lg:text-8xl font-black tracking-tighter italic text-white leading-none">Command.</h1><p className="text-zinc-500 text-lg lg:text-xl font-medium mt-3 uppercase tracking-[0.3em] italic">Supervision Intelligence</p></motion.div>
          <div className="flex flex-col md:flex-row gap-6 items-center w-full lg:w-auto">
            <button onClick={() => setShowVault(!showVault)} className={`${showVault ? 'bg-zinc-800 text-zinc-400' : 'bg-blue-600 text-white'} w-full lg:w-auto px-10 py-5 rounded-[32px] font-black text-xl shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3`}>{showVault ? <ArrowUpCircle size={24} /> : <Plus size={24} strokeWidth={3} />}{showVault ? 'Dismiss Vault' : 'Mentor Log'}</button>
            <div className="relative w-full md:w-[350px]"><Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600" size={24} /><input className="w-full bg-white/5 border border-white/10 rounded-[28px] py-4 lg:py-5 pl-16 pr-8 text-xl text-white outline-none focus:ring-2 focus:ring-blue-500/20 placeholder:text-zinc-800 italic shadow-inner" placeholder="Search Feed..." onChange={(e) => setSearchTerm(e.target.value)} /></div>
          </div>
        </header>

        {/* 📥 BILATERAL VAULT (The update you requested) */}
        <AnimatePresence>
          {showVault && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-[#121214] border border-white/5 rounded-[40px] lg:rounded-[60px] p-8 lg:p-12 mb-16 shadow-3xl overflow-hidden">
              <div className="flex bg-black/40 p-2 rounded-[24px] w-fit mb-10 border border-white/5">
                <button onClick={() => setActiveTrack('publication')} className={`px-6 lg:px-10 py-3 rounded-[18px] font-black text-[10px] lg:text-xs uppercase transition-all ${activeTrack === 'publication' ? 'bg-blue-600 text-white' : 'text-zinc-500'}`}>Publication</button>
                <button onClick={() => setActiveTrack('project')} className={`px-6 lg:px-10 py-3 rounded-[18px] font-black text-[10px] lg:text-xs uppercase transition-all ${activeTrack === 'project' ? 'bg-blue-800 text-white' : 'text-zinc-500'}`}>Project Track</button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-12">
                {activeTrack === 'publication' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <FormInput label="Research Title" placeholder="..." onChange={(e: any) => setPubForm({...pubForm, title: e.target.value})} value={pubForm.title} />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><FormInput label="Scholar Name" placeholder="..." onChange={(e: any) => setPubForm({...pubForm, student_name: e.target.value})} value={pubForm.student_name} /><FormInput label="Scholar Email" placeholder="..." onChange={(e: any) => setPubForm({...pubForm, student_email: e.target.value})} value={pubForm.student_email} /></div>
                    <FormInput label="Associated Project" placeholder="..." onChange={(e: any) => setPubForm({...pubForm, associated_project: e.target.value})} value={pubForm.associated_project} />
                    <FormInput label="Google Drive Link" icon={<Globe size={16}/>} placeholder="..." onChange={(e: any) => setPubForm({...pubForm, drive_link: e.target.value})} value={pubForm.drive_link} />
                    <div className="md:col-span-2 space-y-10">
                      <div className="space-y-3"><label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.5em] ml-6 italic">Classification</label><select className="w-full bg-[#1A1A1E] border border-white/10 rounded-[30px] py-6 px-10 text-xl text-white outline-none focus:border-blue-500 appearance-none font-bold italic shadow-inner" onChange={(e: any) => setPubForm({...pubForm, pub_type: e.target.value})} value={pubForm.pub_type}><option value="journal">Journal Paper</option><option value="patent">Intellectual Patent</option><option value="conference">Conference Proceeding</option></select></div>
                      <FormArea label="Executive Summary" placeholder="..." onChange={(e: any) => setPubForm({...pubForm, summary: e.target.value})} value={pubForm.summary} />
                      <FormArea label="Deep Narrative" placeholder="..." onChange={(e: any) => setPubForm({...pubForm, details: e.target.value})} value={pubForm.details} />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <FormInput label="Execution Title" placeholder="..." onChange={(e: any) => setProjForm({...projForm, title: e.target.value})} value={projForm.title} />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><FormInput label="Scholar Name" placeholder="..." onChange={(e: any) => setProjForm({...projForm, student_name: e.target.value})} value={projForm.student_name} /><FormInput label="Scholar Email" placeholder="..." onChange={(e: any) => setProjForm({...projForm, student_email: e.target.value})} value={projForm.student_email} /></div>
                    <FormInput label="Git Repository" icon={<Code2 size={16}/>} placeholder="..." onChange={(e: any) => setProjForm({...projForm, github_link: e.target.value})} value={projForm.github_link} />
                    <FormInput label="Related Document" placeholder="..." onChange={(e: any) => setProjForm({...projForm, doc_link: e.target.value})} value={projForm.doc_link} />
                    <div className="md:col-span-2 space-y-10">
                      <div className="space-y-3"><label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.5em] ml-6 italic">Execution Status</label><select className="w-full bg-[#1A1A1E] border border-white/10 rounded-[30px] py-6 px-10 text-xl text-white outline-none focus:border-blue-500 appearance-none font-bold italic shadow-inner" onChange={(e: any) => setProjForm({...projForm, category: e.target.value})} value={projForm.category}><option value="ongoing">Ongoing Real-Time</option><option value="course">Course Project</option><option value="papers">Papers Based</option></select></div>
                      <FormArea label="Project Description" placeholder="..." onChange={(e: any) => setProjForm({...projForm, description: e.target.value})} value={projForm.description} />
                      <FormArea label="Technical Logs" placeholder="..." onChange={(e: any) => setProjForm({...projForm, notes: e.target.value})} value={projForm.notes} />
                    </div>
                  </div>
                )}
                <button type="submit" disabled={submitting} className={`w-full py-8 rounded-[40px] font-black text-2xl text-white mt-6 shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-4 bg-blue-600 shadow-blue-500/20`}>{submitting ? <Loader2 className="animate-spin" /> : <SendIcon size={24} strokeWidth={3} />}<span>Secure to Repository</span></button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-6 pb-20">
          {supervisionList.filter(item => (item.title + item.student_name).toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? (
            <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-[40px] lg:rounded-[60px] bg-white/[0.01] shadow-inner"><Activity className="mx-auto text-zinc-800 mb-6" size={64} /><p className="text-zinc-600 font-black uppercase text-xl lg:text-2xl italic tracking-[0.2em]">Zero Supervised Data.</p></div>
          ) : (
            supervisionList.filter(item => (item.title + item.student_name).toLowerCase().includes(searchTerm.toLowerCase())).map((item, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#121214] border border-white/5 rounded-[32px] lg:rounded-[40px] overflow-hidden group transition-all hover:border-blue-500/10 shadow-inner">
                <div onClick={() => toggleExpand(item.id)} className="p-6 lg:p-8 cursor-pointer flex items-center justify-between hover:bg-white/[0.02] transition-all">
                  <div className="flex items-center gap-6 lg:gap-10">
                    <div className="text-center w-12 lg:w-16"><p className="text-[8px] lg:text-[9px] font-black uppercase text-zinc-600 mb-1 italic">{new Date(item.created_at).toLocaleString('default', { month: 'short' })}</p><h4 className="text-2xl lg:text-3xl font-black text-white leading-none tracking-tighter">{new Date(item.created_at).getDate()}</h4></div>
                    <div className="h-12 w-[1px] bg-white/5" />
                    <div>
                      <div className="flex items-center gap-3 mb-1"><span className={`text-[8px] lg:text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${item.sys_cat === 'publication' ? 'text-emerald-500 bg-emerald-500/5' : 'text-blue-500 bg-blue-500/5'}`}>{item.pub_type || item.category}</span></div>
                      <h4 className="text-xl lg:text-2xl font-bold text-white uppercase italic leading-tight tracking-tight">{item.title}</h4>
                      <p className="text-[10px] lg:text-xs text-zinc-500 mt-1 font-bold uppercase italic">Scholar: <span className="text-zinc-300">{item.student_name}</span></p>
                    </div>
                  </div>
                  <ChevronDown size={28} className={`text-zinc-700 transition-all duration-500 ${expandedId === item.id ? 'rotate-180 text-blue-500' : ''}`} />
                </div>
                <AnimatePresence>{expandedId === item.id && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-white/5 bg-black/20"><div className="p-6 lg:p-10 grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10"><div className="space-y-6"><DetailBox label="Technical Description" value={item.summary || item.description} />{(item.details || item.notes) && <DetailBox label="Narrative Logs" value={item.details || item.notes} />}</div><div className="space-y-6"><div className="bg-white/5 p-6 rounded-3xl border border-white/5 shadow-inner"><p className="text-[9px] font-black uppercase text-zinc-600 mb-4 tracking-widest italic text-center">Repository Artifacts</p><div className="flex flex-wrap justify-center gap-4">{item.drive_link && <ArtifactLink label="Drive Assets" icon={<Globe size={14}/>} url={item.drive_link} />}{item.github_link && <ArtifactLink label="Source Repo" icon={<Code2 size={14}/>} url={item.github_link} />}{item.doc_link && <ArtifactLink label="Documentation" icon={<FileText size={14}/>} url={item.doc_link} />}</div></div><div className="bg-white/[0.01] p-6 rounded-3xl border border-dashed border-white/5 text-center shadow-inner"><p className="text-[9px] font-black uppercase text-zinc-700 mb-1 tracking-widest italic">Scholar Signature</p><p className="text-xs font-bold text-zinc-500 italic">{item.student_name} (ID: {item.student_id?.slice(0,8) || 'Handshake'})</p></div></div></div></motion.div>)}</AnimatePresence>
              </motion.div>
            ))
          )}
        </div>

        <AnimatePresence>{showPassModal && (<div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-3xl bg-black/80"><motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-[#121214] border border-white/10 w-full max-w-xl rounded-[40px] lg:rounded-[60px] p-8 lg:p-12 shadow-2xl relative"><button onClick={() => setShowPassModal(false)} className="absolute top-8 right-8 text-zinc-600 hover:text-white transition-all"><X size={32}/></button><h2 className="text-4xl lg:text-5xl font-black text-white mb-10 italic uppercase tracking-tighter">Reset Key.</h2><form onSubmit={handlePasswordUpdate} className="space-y-8"><div className="space-y-4"><label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.5em] ml-8 flex items-center gap-2 italic"><Lock size={18}/> New Key</label><input required className="w-full bg-white/5 border border-white/10 rounded-[35px] py-5 lg:py-7 px-8 lg:px-12 text-lg lg:text-2xl text-white outline-none focus:border-white/20 transition-all placeholder:text-zinc-900 shadow-inner italic" placeholder="••••••••" type="password" onChange={(e:any) => setPassData({...passData, new: e.target.value})} /></div><div className="space-y-4"><label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.5em] ml-8 flex items-center gap-2 italic"><CheckCircle2 size={18}/> Confirm Key</label><input required className="w-full bg-white/5 border border-white/10 rounded-[35px] py-5 lg:py-7 px-8 lg:px-12 text-lg lg:text-2xl text-white outline-none focus:border-white/20 transition-all placeholder:text-zinc-900 shadow-inner italic" placeholder="••••••••" type="password" onChange={(e:any) => setPassData({...passData, confirm: e.target.value})} /></div><button type="submit" disabled={updatingPass} className="w-full py-6 lg:py-8 bg-white text-black rounded-[30px] lg:rounded-[40px] font-black text-xl lg:text-2xl shadow-2xl active:scale-95 flex items-center justify-center gap-4">{updatingPass ? <Loader2 className="animate-spin" /> : 'Provision New Key'}</button></form></motion.div></div>)}</AnimatePresence>
      </main>
      {showMobileSidebar && <div onClick={() => setShowMobileSidebar(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[65] lg:hidden" />}
    </div>
  );
}

function ProfileItem({ label, value, icon }: any) { return (<div className="bg-white/[0.02] border border-white/5 p-6 rounded-[32px] flex items-center gap-5 group hover:bg-white/[0.05] transition-all shadow-inner"><div className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-zinc-600 group-hover:text-blue-500 transition-colors shadow-inner">{icon}</div><div className="min-w-0"><p className="text-[8px] lg:text-[9px] font-black uppercase text-zinc-700 mb-1.5 tracking-widest leading-none italic">{label}</p><p className="text-sm lg:text-base font-bold text-white truncate italic">{value || 'Syncing...'}</p></div></div>); }
function DetailBox({ label, value }: { label: string, value: string }) { return (<div className="space-y-3"><label className="text-[9px] lg:text-[10px] font-black uppercase text-zinc-600 tracking-widest ml-2 italic">{label}</label><div className="bg-white/5 border border-white/10 rounded-3xl p-6 text-xs lg:text-sm text-zinc-300 italic leading-relaxed shadow-inner">{value || 'No data logged.'}</div></div>); }
function ArtifactLink({ label, icon, url }: { label: string, icon: any, url: string }) { return (<a href={url} target="_blank" className="flex items-center gap-3 px-4 lg:px-6 py-3 bg-zinc-900 hover:bg-white hover:text-black rounded-2xl text-[8px] lg:text-[10px] font-black uppercase transition-all shadow-xl border border-white/5 shadow-inner">{icon} {label} <ExternalLink size={12} className="opacity-50" /></a>); }
function FormInput({ label, placeholder, onChange, value, icon, type = "text" }: any) { return (<div className="space-y-4"><label className="text-[9px] lg:text-[10px] font-black text-zinc-600 uppercase tracking-[0.5em] ml-6 lg:ml-8 flex items-center gap-2 italic">{icon} {label}</label><input required type={type} className="w-full bg-white/5 border border-white/10 rounded-[30px] lg:rounded-[35px] py-5 lg:py-7 px-8 lg:px-12 text-lg lg:text-2xl text-white outline-none focus:border-white/20 transition-all placeholder:text-zinc-900 shadow-inner italic" placeholder={placeholder} onChange={onChange} value={value} /></div>); }
function FormArea({ label, placeholder, onChange, value }: any) { return (<div className="space-y-4"><label className="text-[9px] lg:text-[10px] font-black text-zinc-600 uppercase tracking-[0.5em] ml-6 lg:ml-8 italic">{label}</label><textarea required className="w-full bg-white/5 border border-white/10 rounded-[35px] lg:rounded-[45px] py-6 lg:py-8 px-8 lg:px-12 text-lg lg:text-2xl text-white outline-none focus:border-white/20 transition-all placeholder:text-zinc-900 shadow-inner italic" rows={4} placeholder={placeholder} onChange={onChange} value={value} /></div>); }
function SendIcon({ size, strokeWidth }: any) { return <Activity size={size} strokeWidth={strokeWidth} />; }