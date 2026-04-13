'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, User, Briefcase, Plus, Search, 
  LogOut, Activity, X, CheckCircle2, Loader2, ChevronRight, 
  FileText, Globe, Book, Layers, 
  Link, Send, GraduationCap, Mail, Code2, ArrowUpCircle, ChevronDown, ExternalLink, Lock, Menu 
} from 'lucide-react';

export default function MentorHub() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeTrack, setActiveTrack] = useState<'publication' | 'project'>('publication');
  const [showVault, setShowVault] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [mentorStats, setMentorStats] = useState({ totalSubmissions: 0 });
  const [supervisionList, setSupervisionList] = useState<any[]>([]);
  const [showPassModal, setShowPassModal] = useState(false);
  const [passData, setPassData] = useState({ new: '', confirm: '' });
  const [updatingPass, setUpdatingPass] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // 📥 BIFURCATED FORM STATES
  const [pubForm, setPubForm] = useState({ title: '', student_name: '', student_email: '', associated_project: '', drive_link: '', summary: '', details: '', pub_type: 'journal' });
  const [projForm, setProjForm] = useState({ title: '', description: '', student_name: '', student_email: '', doc_link: '', github_link: '', notes: '', category: 'ongoing' });

  const toggleExpand = (id: string) => setExpandedId(expandedId === id ? null : id);

  useEffect(() => { 
    setMounted(true);
    fetchMentorEcosystem(); 
  }, []);

  async function fetchMentorEcosystem() {
    setLoading(true);
    const email = localStorage.getItem('dbms_user_email');
    if (!email) { router.replace('/'); return; }
    try {
      const { data: user } = await supabase.from('users').select('*').eq('email', email).single();
      if (!user) return;
      setProfile(user);
      const { data: pubs } = await supabase.from('publications').select('*').ilike('mentor_email', email);
      const { data: projs } = await supabase.from('projects').select('*').ilike('mentor_email', email);
      const combined = [...(pubs?.map(p => ({ ...p, sys_cat: 'publication' })) || []), ...(projs?.map(p => ({ ...p, sys_cat: 'project' })) || [])].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setSupervisionList(combined);
      setMentorStats({ totalSubmissions: combined.length });
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  const validateAndFixLink = (url: string) => {
    if (!url) return '';
    const clean = url.trim();
    return (clean.startsWith('http://') || clean.startsWith('https://')) ? clean : `https://${clean}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    const isPub = activeTrack === 'publication';
    const form = isPub ? pubForm : projForm;
    const cleanScholarEmail = form.student_email.toLowerCase().trim();

    // 🛡️ CRITICAL HANDSHAKE: Only add students who exist in the database
    const { data: scholar, error: scholarErr } = await supabase
      .from('users')
      .select('role')
      .eq('email', cleanScholarEmail)
      .single();

    if (scholarErr || !scholar || scholar.role !== 'student') {
      alert("HANDSHAKE REFUSED: The specified Scholar ID is not verified in the Student Registry.");
      setSubmitting(false);
      return;
    }

    const table = isPub ? 'publications' : 'projects';
    const data = isPub ? {
      ...pubForm,
      student_email: cleanScholarEmail,
      mentor_email: profile.email,
      mentor_name: profile.name,
      drive_link: validateAndFixLink(pubForm.drive_link)
    } : {
      ...projForm,
      student_email: cleanScholarEmail,
      mentor_email: profile.email,
      mentor_name: profile.name,
      github_link: validateAndFixLink(projForm.github_link),
      doc_link: validateAndFixLink(projForm.doc_link)
    };

    const { error } = await supabase.from(table).insert([data]);
    if (!error) { 
        setShowVault(false); 
        await fetchMentorEcosystem();
        setPubForm({ title: '', student_name: '', student_email: '', associated_project: '', drive_link: '', summary: '', details: '', pub_type: 'journal' });
        setProjForm({ title: '', description: '', student_name: '', student_email: '', doc_link: '', github_link: '', notes: '', category: 'ongoing' });
    }
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

  if (!mounted || loading) return <div className="min-h-screen bg-white flex items-center justify-center text-blue-600 font-black text-2xl animate-pulse italic uppercase tracking-widest">ONE COMMAND SYNC...</div>;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#F8FAFC] text-slate-900 font-sans overflow-x-hidden">
      
      {/* 📱 MOBILE HEADER */}
      <div className="lg:hidden flex items-center justify-between p-6 bg-blue-600 text-white sticky top-0 z-[60] shadow-[0_4px_20px_rgba(0,0,0,0.15)]">
        <div className="flex items-center gap-3"><ShieldCheck size={28} strokeWidth={2.5} /><span className="text-xl font-black tracking-tighter uppercase">ONE <span className="font-light text-blue-100 text-lg">HUB</span></span></div>
        <button onClick={() => setShowMobileSidebar(true)} className="p-2 bg-white/20 rounded-xl active:scale-90 transition-transform"><Menu size={24} /></button>
      </div>

      {/* 🚀 NAVIGATION DRAWER (White Background) */}
      <AnimatePresence>
        {(showMobileSidebar || (mounted && window.innerWidth >= 1024)) && (
          <motion.nav initial={{ x: -320 }} animate={{ x: 0 }} exit={{ x: -320 }} className={`fixed lg:relative z-[70] w-80 h-full bg-white border-r border-slate-200 p-8 flex flex-col flex-shrink-0 transition-transform lg:translate-x-0 ${showMobileSidebar ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:flex'}`}>
            <button onClick={() => setShowMobileSidebar(false)} className="lg:hidden absolute top-8 right-8 text-slate-400 hover:text-blue-600 transition-colors"><X size={28}/></button>
            <div className="hidden lg:flex items-center gap-4 mb-16 px-2"><ShieldCheck size={36} className="text-blue-600" strokeWidth={2.5} /><span className="text-2xl font-black tracking-tighter uppercase text-slate-900 leading-none">ONE<br/><span className="text-blue-600 font-medium text-xl">COMMAND</span></span></div>
            
            <div className="flex-1 space-y-10">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 italic">Faculty Identity</label>
                <ProfileItem label="Mentor" value={profile?.name} icon={<User size={18}/>} />
                <ProfileItem label="Network" value={profile?.email} icon={<Mail size={18}/>} />
                <button onClick={() => { setShowPassModal(true); setShowMobileSidebar(false); }} className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl flex items-center gap-4 hover:bg-white hover:shadow-md transition-all text-left group shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-blue-600 shadow-sm transition-colors"><Lock size={18}/></div>
                  <div className="min-w-0"><p className="text-[9px] font-black text-slate-400 uppercase leading-none italic">Security</p><p className="text-xs font-bold text-slate-900 truncate">Reset Access Key</p></div>
                </button>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 italic">Governance Metrics</label>
                <div className="bg-blue-600 p-8 rounded-[32px] text-white shadow-[0_15px_30px_rgba(37,99,235,0.2)] border-b-8 border-blue-800">
                  <h4 className="text-6xl font-black tabular-nums drop-shadow-[0_4px_4px_rgba(0,0,0,0.2)]">{mentorStats.totalSubmissions}</h4>
                  <p className="text-[10px] font-bold uppercase tracking-widest mt-2 opacity-80 italic">Supervised Records</p>
                </div>
              </div>
            </div>
            <button onClick={() => { localStorage.clear(); router.replace('/'); }} className="flex items-center gap-4 p-5 text-slate-400 hover:text-red-600 font-bold mt-auto transition-all group active:scale-95"><LogOut size={22} className="group-hover:-translate-x-1 transition-transform" /> <span className="text-lg uppercase font-black tracking-tight italic">Disconnect</span></button>
          </motion.nav>
        )}
      </AnimatePresence>

      <main className="flex-1 overflow-y-auto relative custom-scrollbar">
        {/* 📘 3D BLUE HEADER */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-10 lg:p-20 text-white shadow-xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -mr-32 -mt-32" />
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
              <div>
                <h1 className="text-6xl lg:text-8xl font-black tracking-tighter leading-none uppercase drop-shadow-2xl italic">Command<span className="text-blue-300">.</span></h1>
                <p className="text-blue-100 text-lg font-bold mt-4 uppercase tracking-[0.4em] opacity-80 italic">Supervision Intelligence Feed</p>
              </div>
              <button onClick={() => setShowVault(!showVault)} className="bg-white text-blue-700 px-12 py-6 rounded-[24px] font-black text-xl shadow-[0_10px_0_rgb(219,234,254),0_20px_40px_rgba(0,0,0,0.2)] hover:translate-y-[2px] active:translate-y-[8px] active:shadow-none transition-all flex items-center gap-4 group">
                {showVault ? <ArrowUpCircle size={28} /> : <Plus size={28} strokeWidth={3} />} {showVault ? 'DISMISS VAULT' : 'MENTOR LOG'}
              </button>
           </motion.div>
        </div>

        <div className="p-6 lg:p-14 -mt-12 relative z-20">
          
          {/* 📥 3D BIFURCATED VAULT */}
          <AnimatePresence>
            {showVault && (
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} className="bg-white border border-slate-200 rounded-[48px] p-8 lg:p-14 mb-14 shadow-2xl overflow-hidden">
                <div className="flex bg-slate-100 p-2 rounded-2xl w-fit mb-12 border border-slate-200 shadow-inner">
                  <button onClick={() => setActiveTrack('publication')} className={`px-10 py-3 rounded-xl font-black text-xs uppercase transition-all ${activeTrack === 'publication' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}> Publication</button>
                  <button onClick={() => setActiveTrack('project')} className={`px-10 py-3 rounded-xl font-black text-xs uppercase transition-all ${activeTrack === 'project' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}> Project</button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <FormInput label="Title" placeholder="Identity of the research/project..." onChange={(e: any) => activeTrack === 'publication' ? setPubForm({...pubForm, title: e.target.value}) : setProjForm({...projForm, title: e.target.value})} value={activeTrack === 'publication' ? pubForm.title : projForm.title} />
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <FormInput label="Scholar Name" placeholder="..." onChange={(e: any) => activeTrack === 'publication' ? setPubForm({...pubForm, student_name: e.target.value}) : setProjForm({...projForm, student_name: e.target.value})} value={activeTrack === 'publication' ? pubForm.student_name : projForm.student_name} />
                      <FormInput label="Scholar Email ID" placeholder="..." onChange={(e: any) => activeTrack === 'publication' ? setPubForm({...pubForm, student_email: e.target.value}) : setProjForm({...projForm, student_email: e.target.value})} value={activeTrack === 'publication' ? pubForm.student_email : projForm.student_email} />
                    </div>

                    <FormInput label={activeTrack === 'publication' ? "Project Association Link" : "GitHub Repository Link"} icon={activeTrack === 'publication' ? <Layers size={18}/> : <Code2 size={18}/>} placeholder="https://..." onChange={(e: any) => activeTrack === 'publication' ? setPubForm({...pubForm, associated_project: e.target.value}) : setProjForm({...projForm, github_link: e.target.value})} value={activeTrack === 'publication' ? pubForm.associated_project : projForm.github_link} />
                    
                    <FormInput label={activeTrack === 'publication' ? "Artifacts (Google Drive Link)" : "Project Document (Optional Link)"} icon={<Globe size={18}/>} placeholder="https://..." onChange={(e: any) => activeTrack === 'publication' ? setPubForm({...pubForm, drive_link: e.target.value}) : setProjForm({...projForm, doc_link: e.target.value})} value={activeTrack === 'publication' ? pubForm.drive_link : projForm.doc_link} />
                    
                    <div className="space-y-3 md:col-span-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-4 italic">Classification</label>
                        <select className="w-full bg-slate-50 border border-slate-200 rounded-[24px] py-6 px-10 text-xl font-bold text-slate-900 outline-none focus:border-blue-600 shadow-inner appearance-none transition-all cursor-pointer" onChange={(e: any) => activeTrack === 'publication' ? setPubForm({...pubForm, pub_type: e.target.value}) : setProjForm({...projForm, category: e.target.value})}>
                        {activeTrack === 'publication' ? (
                            <><option value="journal">Journal Paper</option><option value="patent">Intellectual Patent</option><option value="conference">Conference Proceeding</option></>
                        ) : (
                            <><option value="ongoing">Ongoing Real-time Projects</option><option value="course">Course Project</option><option value="papers">Papers Based</option></>
                        )}
                        </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {activeTrack === 'publication' ? (
                      <>
                        <FormArea label="Summary (Brief)" placeholder="..." onChange={(e: any) => setPubForm({...pubForm, summary: e.target.value})} value={pubForm.summary} />
                        <FormArea label="Details (Deep Narrative)" placeholder="..." onChange={(e: any) => setPubForm({...pubForm, details: e.target.value})} value={pubForm.details} />
                      </>
                    ) : (
                      <>
                        <FormArea label="Narrative (Description of Goal)" placeholder="..." onChange={(e: any) => setProjForm({...projForm, description: e.target.value})} value={projForm.description} />
                        <FormArea label="Internal Log (Notes / Status)" placeholder="..." onChange={(e: any) => setProjForm({...projForm, notes: e.target.value})} value={projForm.notes} />
                      </>
                    )}
                  </div>

                  <button type="submit" disabled={submitting} className="w-full py-8 bg-blue-600 text-white rounded-[32px] font-black text-2xl active:translate-y-[12px] active:shadow-none transition-all flex items-center justify-center gap-6 shadow-2xl shadow-blue-500/20">
                    {submitting ? <Loader2 className="animate-spin" /> : <Send size={32} strokeWidth={2.5} />}
                    <span>PUSH TO ONE REGISTRY</span>
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 📋 SUPERVISION FEED */}
          <div className="bg-white border border-slate-200 rounded-[48px] overflow-hidden shadow-2xl">
            <div className="p-8 lg:p-10 flex flex-col md:flex-row justify-between items-center gap-8 border-b border-slate-50 bg-slate-50/50">
               <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight italic">Supervision Archive</h3>
               <div className="relative w-full md:w-[400px]"><Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={24} /><input className="w-full bg-white border border-slate-200 rounded-3xl py-4 pl-16 pr-8 text-lg text-slate-900 outline-none focus:ring-4 focus:ring-blue-600/5 shadow-inner transition-all placeholder:text-slate-300 italic" placeholder="Filter feed..." onChange={(e) => setSearchTerm(e.target.value)} /></div>
            </div>

            <div className="p-6 lg:p-10 space-y-6">
              {supervisionList.filter(item => (item.title + item.student_name).toLowerCase().includes(searchTerm.toLowerCase())).map((item, idx) => (
                  <div key={idx} className="bg-white border border-slate-100 rounded-[32px] overflow-hidden group hover:border-blue-300 transition-all hover:shadow-2xl">
                    <div onClick={() => toggleExpand(item.id)} className="p-8 flex justify-between items-center cursor-pointer hover:bg-blue-50/30">
                      <div className="flex items-center gap-8">
                        <div className="text-center w-12 border-r border-slate-100 pr-10">
                          <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1 italic">{new Date(item.created_at).toLocaleString('default', { month: 'short' })}</p>
                          <h4 className="text-3xl font-black text-slate-900 leading-none">{new Date(item.created_at).getDate()}</h4>
                        </div>
                        <div>
                          <span className={`text-[11px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full ${item.sys_cat === 'publication' ? 'text-blue-600 bg-blue-50' : 'text-slate-600 bg-slate-100'}`}>{item.pub_type || item.category}</span>
                          <h4 className="text-2xl font-bold text-slate-900 mt-2 tracking-tight">{item.title}</h4>
                          <p className="text-sm text-slate-400 font-bold uppercase mt-1 italic">Scholar: <span className="text-blue-600">{item.student_name}</span></p>
                        </div>
                      </div>
                      <ChevronDown className={`text-slate-300 transition-all duration-500 ${expandedId === item.id ? 'rotate-180 text-blue-600 scale-125' : ''}`} size={32} />
                    </div>
                    <AnimatePresence>{expandedId === item.id && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-slate-50 border-t border-slate-100 shadow-inner">
                        <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-12">
                          <div className="space-y-8">
                            <DetailBox label="Detailed Summary / Narrative" value={item.summary || item.description} />
                            {(item.details || item.notes) && <DetailBox label="Technical Deep-Dive / Logs" value={item.details || item.notes} />}
                          </div>
                          <div className="space-y-8">
                            <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm"><p className="text-[10px] font-black text-slate-400 uppercase mb-6 text-center tracking-[0.3em] italic">Original Artifacts</p><div className="flex flex-wrap justify-center gap-4">{item.drive_link && <ArtifactLink label="Assets" icon={<Globe size={14}/>} url={item.drive_link} />}{item.github_link && <ArtifactLink label="Source" icon={<Code2 size={14}/>} url={item.github_link} />}{item.doc_link && <ArtifactLink label="Docs" icon={<FileText size={14}/>} url={item.doc_link} />}</div></div>
                            <div className="bg-white border border-dashed border-slate-200 p-6 rounded-[24px] text-center shadow-inner"><p className="text-[9px] font-black text-slate-400 uppercase italic">Scholar Handshake Hash</p><p className="text-xs font-bold text-slate-500 mt-1 truncate">{item.student_email}</p></div>
                          </div>
                        </div>
                      </motion.div>
                    )}</AnimatePresence>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <AnimatePresence>{showPassModal && (<div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md"><motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white border border-slate-200 w-full max-w-xl rounded-[48px] p-12 lg:p-16 shadow-2xl relative"><button onClick={() => setShowPassModal(false)} className="absolute top-8 right-8 text-slate-300 hover:text-emerald-600 transition-all"><X size={36}/></button><h2 className="text-4xl font-black text-slate-900 mb-10 tracking-tight uppercase italic">Security Center</h2><form onSubmit={handlePasswordUpdate} className="space-y-8"><FormInput label="New Access Key" type="password" onChange={(e:any) => setPassData({...passData, new: e.target.value})} icon={<Lock size={20}/>} /><FormInput label="Confirm New Key" type="password" onChange={(e:any) => setPassData({...passData, confirm: e.target.value})} icon={<CheckCircle2 size={20}/>} /><button type="submit" disabled={updatingPass} className="w-full py-8 bg-blue-600 text-white rounded-3xl font-black text-2xl shadow-xl transition-all active:scale-95">OVERWRITE SECURITY KEY</button></form></motion.div></div>)}</AnimatePresence>
      </main>
      {showMobileSidebar && <div onClick={() => setShowMobileSidebar(false)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[65] lg:hidden" />}
    </div>
  );
}

function ProfileItem({ label, value, icon }: any) { return (<div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl flex items-center gap-5 group hover:bg-white hover:shadow-md transition-all shadow-inner"><div className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors shadow-sm">{icon}</div><div className="min-w-0"><p className="text-[9px] font-bold uppercase text-slate-400 mb-1 leading-none italic">{label}</p><p className="text-sm font-bold text-slate-900 truncate">{value || '...'}</p></div></div>); }
function DetailBox({ label, value }: { label: string, value: string }) { return (<div className="space-y-3"><label className="text-[11px] font-black uppercase text-slate-400 tracking-widest ml-2 italic">{label}</label><div className="bg-white border border-slate-200 rounded-3xl p-6 text-base text-slate-600 leading-relaxed shadow-inner italic whitespace-pre-wrap">{value || 'No entry synced.'}</div></div>); }
function ArtifactLink({ label, icon, url }: { label: string, icon: any, url: string }) { return (<a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-6 py-3 bg-slate-100 border border-slate-200 rounded-2xl text-[10px] font-black uppercase text-slate-700 hover:bg-blue-600 hover:text-white active:scale-90 transition-all shadow-sm">{icon} {label} <ExternalLink size={12} className="opacity-50" /></a>); }
function FormInput({ label, placeholder, onChange, icon, type = "text", value }: any) { return (<div className="space-y-3"><label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-6 italic flex items-center gap-2">{icon} {label}</label><input required type={type} value={value} className="w-full bg-slate-50 border border-slate-200 rounded-[28px] py-6 px-10 text-xl font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white shadow-inner transition-all placeholder:text-slate-300" placeholder={placeholder} onChange={onChange} /></div>); }
function FormArea({ label, placeholder, onChange, value }: any) { return (<div className="space-y-3"><label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-6 italic">{label}</label><textarea required className="w-full bg-slate-50 border border-slate-200 rounded-[40px] py-8 px-10 text-xl font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white shadow-inner transition-all placeholder:text-zinc-300" rows={4} placeholder={placeholder} onChange={onChange} value={value} /></div>); }