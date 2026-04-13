'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, Users, Briefcase, Plus, Search, 
  LogOut, Activity, X, CheckCircle2, Loader2, ChevronRight, 
  Trash2, ArrowLeft, UserPlus, Mail, Globe, Database, 
  Book, FileText, LayoutGrid, Layers, Clock, ChevronDown, 
  ExternalLink, Link, Code2, Lock, Menu, SendHorizontal 
} from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'uploads' | 'registry'>('uploads');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [creationMode, setCreationMode] = useState<'student' | 'faculty'>('student');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showPassModal, setShowPassModal] = useState(false);
  const [passData, setPassData] = useState({ new: '', confirm: '' });
  const [updatingPass, setUpdatingPass] = useState(false);
  const [adminProfile, setAdminProfile] = useState<any>(null);

  const [stats, setStats] = useState({ scholars: 0, mentors: 0, journals: 0, patents: 0, confs: 0, ongoing: 0, course: 0, papers: 0 });
  const [users, setUsers] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [formData, setFormData] = useState({ name: '', email: '', dept: '' });

  // 🛡️ MOUNT GUARD
  useEffect(() => { 
    setMounted(true);
    fetchSystemVolume(); 
  }, [activeTab]);

  async function fetchSystemVolume() {
    setLoading(true);
    const email = localStorage.getItem('dbms_user_email');
    if (!email) { router.replace('/'); return; }
    try {
      const { data: admin } = await supabase.from('users').select('*').eq('email', email).single();
      setAdminProfile(admin);
      const { data: u } = await supabase.from('users').select('*').order('name');
      const { data: pb } = await supabase.from('publications').select('*');
      const { data: pr } = await supabase.from('projects').select('*');
      
      const combined = [
        ...(pb?.map(p => ({ ...p, sys_cat: 'publication' })) || []), 
        ...(pr?.map(p => ({ ...p, sys_cat: 'project' })) || [])
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setUsers(u || []);
      setSubmissions(combined);
      setStats({ 
        scholars: u?.filter(x => x.role === 'student').length || 0, 
        mentors: u?.filter(x => x.role === 'faculty').length || 0, 
        journals: pb?.filter(x => x.pub_type === 'journal').length || 0, 
        patents: pb?.filter(x => x.pub_type === 'patent').length || 0, 
        confs: pb?.filter(x => x.pub_type === 'conference').length || 0, 
        ongoing: pr?.filter(x => x.category === 'ongoing').length || 0, 
        course: pr?.filter(x => x.category === 'course').length || 0, 
        papers: pr?.filter(x => x.category === 'papers').length || 0 
      });
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  const handleProvision = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // 🛡️ STRICT EMAIL ENFORCEMENT: Lowercase and trimmed
    const cleanEmail = formData.email.toLowerCase().trim();
    
    const { error } = await supabase.from('users').insert([{ 
      ...formData, 
      role: creationMode, 
      temp_pass: 'WELCOME@123', 
      email: cleanEmail 
    }]);

    if (!error) { 
      setShowModal(false); 
      setFormData({ name: '', email: '', dept: '' }); 
      fetchSystemVolume(); 
    } else { alert("Error: Account already registered or identity conflict."); }
    setSubmitting(false);
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passData.new !== passData.confirm) return alert("Keys do not match.");
    setUpdatingPass(true);
    const { error } = await supabase.from('users').update({ temp_pass: passData.new }).eq('email', adminProfile.email);
    if (!error) { alert("SUCCESS: Master Key Updated."); setShowPassModal(false); }
    setUpdatingPass(false);
  };

  const handleDelete = async (table: string, id: string) => {
    if (!confirm(`SYSTEM ACTION: Remove entry permanently?`)) return;
    const { error } = await supabase.from(table).delete().eq(table === 'users' ? 'user_id' : 'id', id);
    if (!error) fetchSystemVolume();
  };

  if (!mounted || loading) return <div className="min-h-screen bg-white flex items-center justify-center text-blue-600 font-black text-2xl animate-pulse italic uppercase">Initializing ROOT Hub...</div>;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#F8FAFC] text-slate-900 font-sans overflow-x-hidden">
      
      {/* MOBILE HEADER */}
      <div className="lg:hidden flex items-center justify-between p-6 bg-blue-600 text-white sticky top-0 z-[60] shadow-lg">
        <div className="flex items-center gap-3"><ShieldCheck size={28} strokeWidth={2.5} /><span className="text-xl font-black tracking-tighter uppercase">ONE ROOT</span></div>
        <button onClick={() => setShowMobileSidebar(true)} className="p-2 bg-white/20 rounded-xl active:scale-90 transition-transform"><Menu size={24} /></button>
      </div>

      {/* 🚀 SIDEBAR (White Elevated) */}
      <AnimatePresence>
        {(showMobileSidebar || (mounted && window.innerWidth >= 1024)) && (
          <motion.nav initial={{ x: -320 }} animate={{ x: 0 }} exit={{ x: -320 }} className={`fixed lg:relative z-[70] w-72 h-full bg-white border-r border-slate-200 p-8 flex flex-col flex-shrink-0 transition-transform lg:translate-x-0 ${showMobileSidebar ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:flex'}`}>
            <button onClick={() => setShowMobileSidebar(false)} className="lg:hidden absolute top-8 right-8 text-slate-400"><X size={28}/></button>
            <div className="hidden lg:flex items-center gap-4 mb-14 px-2"><ShieldCheck size={36} className="text-blue-600" strokeWidth={2.5} /><span className="text-2xl font-black tracking-tighter uppercase text-slate-900 leading-none">ONE<br/><span className="text-blue-600 font-medium">ROOT</span></span></div>
            <div className="space-y-4 flex-1">
              <SidebarBtn active={activeTab === 'uploads'} onClick={() => { setActiveTab('uploads'); setShowMobileSidebar(false); }} icon={<Globe size={20}/>} label="Universal Feed" />
              <SidebarBtn active={activeTab === 'registry'} onClick={() => { setActiveTab('registry'); setShowMobileSidebar(false); }} icon={<Briefcase size={20}/>} label="Registry" />
              <button onClick={() => setShowPassModal(true)} className="w-full flex items-center gap-5 p-5 rounded-2xl transition-all font-bold text-slate-500 hover:bg-blue-50 hover:text-blue-600 group shadow-sm"><Lock size={20} className="group-hover:rotate-12 transition-transform" /><span>Security Hub</span></button>
            </div>
            <button onClick={() => { localStorage.clear(); router.replace('/'); }} className="flex items-center gap-4 p-5 text-slate-400 hover:text-red-600 font-bold mt-auto transition-all group active:scale-95"><LogOut size={22} className="group-hover:-translate-x-1 transition-transform" /> <span className="text-lg uppercase font-black tracking-tight">Disconnect</span></button>
          </motion.nav>
        )}
      </AnimatePresence>

      <main className="flex-1 overflow-y-auto relative custom-scrollbar">
        {/* 📘 3D HEADER */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-10 lg:p-20 text-white shadow-xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -mr-32 -mt-32" />
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
              <div><h1 className="text-6xl lg:text-8xl font-black tracking-tighter leading-none uppercase italic drop-shadow-2xl">ROOT<span className="text-blue-300">.</span></h1><p className="text-blue-100 text-lg font-bold mt-4 uppercase tracking-[0.4em] opacity-80 italic">Governance Intelligence</p></div>
              <button onClick={() => setShowModal(true)} className="bg-white text-blue-700 px-12 py-6 rounded-[24px] font-black text-xl shadow-[0_10px_0_rgb(219,234,254)] hover:translate-y-[2px] active:translate-y-[8px] transition-all flex items-center gap-4 group shadow-2xl"><UserPlus size={28} className="group-hover:scale-110" /> PROVISION ID</button>
           </motion.div>
        </div>

        <div className="p-6 lg:p-14 -mt-12 relative z-20">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-12">
            <StatBox label="Scholars" value={stats.scholars} /><StatBox label="Mentors" value={stats.mentors} /><StatBox label="Journals" value={stats.journals} /><StatBox label="Patents" value={stats.patents} /><StatBox label="Confs" value={stats.confs} /><StatBox label="Ongoing" value={stats.ongoing} /><StatBox label="Course" value={stats.course} /><StatBox label="Papers" value={stats.papers} />
          </div>

          <div className="bg-white border border-slate-200 rounded-[48px] overflow-hidden shadow-2xl">
            <div className="p-8 lg:p-10 flex flex-col md:flex-row justify-between items-center gap-8 border-b border-slate-50 bg-slate-50/50">
              <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight italic">{activeTab === 'uploads' ? 'Universal Volume' : 'Network Registry'}</h3>
              <div className="relative w-full md:w-[450px]"><Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={24} /><input className="w-full bg-white border border-slate-200 rounded-3xl py-5 pl-16 pr-8 text-xl text-slate-900 outline-none focus:ring-4 focus:ring-blue-600/5 shadow-inner placeholder:text-slate-300 italic" placeholder="Search ONE..." onChange={(e) => setSearchTerm(e.target.value)} /></div>
            </div>

            <div className="p-6 lg:p-10">
              {activeTab === 'uploads' ? (
                <div className="space-y-6">
                  {submissions.filter(i => (i.title + i.student_name + i.mentor_name).toLowerCase().includes(searchTerm.toLowerCase())).map((item, i) => (
                      <div key={i} className="bg-white border border-slate-100 rounded-[32px] overflow-hidden group hover:border-blue-300 transition-all hover:shadow-2xl">
                        <div onClick={() => setExpandedId(expandedId === item.id ? null : item.id)} className="p-8 flex justify-between items-center cursor-pointer hover:bg-blue-50/30">
                          <div className="flex items-center gap-8"><div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-sm shadow-inner ${item.sys_cat === 'publication' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-white'}`}>{item.pub_type?.[0] || item.category?.[0]}</div><div><span className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{item.pub_type || item.category}</span><h4 className="text-3xl font-bold text-slate-900 mt-3 tracking-tight">{item.title}</h4><p className="text-sm text-slate-400 font-bold uppercase mt-2 italic">Student: <span className="text-blue-600">{item.student_name}</span> • Mentor: <span className="text-slate-600">{item.mentor_name}</span></p></div></div>
                          <ChevronDown className={`text-slate-300 transition-all duration-500 ${expandedId === item.id ? 'rotate-180 text-blue-600 scale-125' : ''}`} size={32} />
                        </div>
                        <AnimatePresence>{expandedId === item.id && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-slate-50 border-t border-slate-100 shadow-inner"><div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-12"><div className="space-y-8"><DetailItem label="Full Narrative" value={item.summary || item.description} /><DetailItem label="Handshake Auth" value={`${item.mentor_name} (${item.mentor_email})`} /></div><div className="space-y-8"><div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm"><p className="text-[10px] font-black text-slate-400 uppercase mb-6 text-center italic tracking-[0.3em]">Repository Assets</p><div className="flex flex-wrap justify-center gap-4">{item.drive_link && <ArtifactLink label="Assets" icon={<Globe size={14}/>} url={item.drive_link} />}{item.github_link && <ArtifactLink label="Source" icon={<Code2 size={14}/>} url={item.github_link} />}{item.doc_link && <ArtifactLink label="Docs" icon={<FileText size={14}/>} url={item.doc_link} />}</div></div><button onClick={() => handleDelete(item.sys_cat === 'publication' ? 'publications' : 'projects', item.id)} className="w-full py-5 bg-red-50 text-red-600 border border-red-100 rounded-2xl font-black uppercase text-[12px] tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-sm">Nuke Record</button></div></div></motion.div>
                        )}</AnimatePresence>
                      </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {users.filter(u => u.role !== 'admin' && (u.name + u.email).toLowerCase().includes(searchTerm.toLowerCase())).map((u, i) => (
                    <div key={i} className="bg-white border border-slate-200 p-8 rounded-[40px] group transition-all hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] relative overflow-hidden">
                       <div className={`absolute top-0 left-0 w-1.5 h-full ${u.role === 'faculty' ? 'bg-blue-600' : 'bg-emerald-500'}`} />
                       <div className="flex justify-between items-start mb-8"><div className="flex items-center gap-6"><div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-3xl shadow-inner border border-slate-100 ${u.role === 'faculty' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>{u.name[0]}</div><div><h3 className="text-2xl font-bold text-slate-900 tracking-tight">{u.name}</h3><p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">{u.role} • {u.dept}</p></div></div><button onClick={() => handleDelete('users', u.user_id)} className="p-3 text-slate-200 hover:text-red-500 transition-all"><Trash2 size={24}/></button></div>
                       <details className="group/details"><summary className="list-none cursor-pointer flex items-center justify-between w-full py-5 px-6 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase text-blue-600 tracking-widest hover:bg-blue-50 transition-all"><span>Volume Profile</span><ChevronRight size={16} className="group-open/details:rotate-90 transition-transform"/></summary><div className="space-y-2 mt-5 max-h-48 overflow-y-auto pr-2 custom-scrollbar">{submissions.filter(s => u.role === 'student' ? s.student_id === u.user_id : s.mentor_email === u.email).map((entry, idx) => (<div key={idx} className="p-4 bg-white border border-slate-100 rounded-xl flex justify-between items-center group/item hover:border-blue-200"><div><p className="text-sm font-bold text-slate-900">{entry.title}</p><p className="text-[9px] font-bold text-slate-400 uppercase mt-1 tracking-widest">{entry.pub_type || entry.category}</p></div><button onClick={() => handleDelete(entry.sys_cat === 'publication' ? 'publications' : 'projects', entry.id)} className="text-slate-200 hover:text-red-500 transition-all"><Trash2 size={16}/></button></div>))}<div className="h-4" /></div></details>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 🔐 Master Security Modal */}
        <AnimatePresence>{showPassModal && (<div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md"><motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white border border-slate-200 w-full max-w-xl rounded-[48px] p-10 lg:p-14 shadow-2xl relative"><button onClick={() => setShowPassModal(false)} className="absolute top-8 right-8 text-slate-300 hover:text-blue-600 transition-all"><X size={36}/></button><h2 className="text-4xl font-black text-slate-900 mb-10 tracking-tight uppercase italic">Security Center</h2><form onSubmit={handlePasswordUpdate} className="space-y-8"><Input label="New Master Key" type="password" onChange={(e:any) => setPassData({...passData, new: e.target.value})} icon={<Lock size={20}/>} /><Input label="Confirm Master Key" type="password" onChange={(e:any) => setPassData({...passData, confirm: e.target.value})} icon={<CheckCircle2 size={20}/>} /><button type="submit" disabled={updatingPass} className="w-full py-8 bg-blue-600 text-white rounded-3xl font-black text-2xl shadow-[0_10px_0_rgb(30,58,138)] hover:translate-y-[2px] active:translate-y-[10px] active:shadow-none transition-all">OVERWRITE ROOT KEY</button></form></motion.div></div>)}</AnimatePresence>

        {/* 📥 Provision ID Modal (Lowercase Email Enforcement) */}
        <AnimatePresence>{showModal && (<div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md"><motion.div initial={{ scale: 0.9, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 40 }} className="bg-white border border-slate-200 w-full max-w-2xl rounded-[60px] p-10 lg:p-16 relative shadow-2xl"><button onClick={() => setShowModal(false)} className="absolute top-10 right-10 text-slate-300 hover:text-blue-600 transition-all"><X size={36} /></button><h2 className="text-5xl font-black text-slate-900 mb-8 tracking-tighter uppercase leading-none italic">Provision ID<span className="text-blue-600">.</span></h2>
        <div className="flex bg-slate-100 p-2 rounded-3xl w-fit mb-12 border border-slate-200 mx-auto lg:mx-0 shadow-inner"><button onClick={() => setCreationMode('student')} className={`px-10 py-4 rounded-2xl font-black text-xs lg:text-sm uppercase transition-all ${creationMode === 'student' ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-400'}`}>Scholar</button><button onClick={() => setCreationMode('faculty')} className={`px-10 py-4 rounded-2xl font-black text-xs lg:text-sm uppercase transition-all ${creationMode === 'faculty' ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-400'}`}>Mentor</button></div>
        <form onSubmit={handleProvision} className="space-y-8">
          <Input icon={<Users size={24}/>} label="Full Legal Identity" onChange={(e:any) => setFormData({...formData, name: e.target.value})} value={formData.name} />
          {/* 🛡️ THE NO-CAPS EMAIL INPUT */}
          <div className="space-y-3">
            <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-6 italic flex items-center gap-2"><Mail size={24}/> Academic Email ID (No Caps)</label>
            <input 
              required 
              type="email" 
              className="w-full bg-slate-50 border border-slate-200 rounded-[28px] py-6 px-10 text-xl font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white shadow-inner transition-all placeholder:text-slate-300 lowercase" 
              placeholder="id@university.edu" 
              onChange={(e:any) => setFormData({...formData, email: e.target.value.toLowerCase().trim()})} 
              value={formData.email} 
            />
          </div>
          <Input icon={<Database size={24}/>} label="Department" onChange={(e:any) => setFormData({...formData, dept: e.target.value})} value={formData.dept} />
          <button type="submit" disabled={submitting} className="w-full py-8 bg-slate-900 text-white rounded-3xl font-black text-2xl shadow-[0_12px_0_rgb(0,0,0)] hover:translate-y-[2px] active:translate-y-[12px] active:shadow-none transition-all flex items-center justify-center gap-6 shadow-2xl">{submitting ? <Loader2 className="animate-spin" /> : <SendHorizontal size={32} strokeWidth={2.5} />}<span>SYNC TO REGISTRY</span></button>
        </form></motion.div></div>)}</AnimatePresence>
      </main>
      {showMobileSidebar && <div onClick={() => setShowMobileSidebar(false)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[65] lg:hidden" />}
    </div>
  );
}

// 🎨 ATOMS
function SidebarBtn({ icon, label, active, onClick }: any) { return (<button onClick={onClick} className={`w-full flex items-center gap-5 p-5 rounded-2xl transition-all font-bold text-lg active:scale-95 ${active ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50 hover:text-blue-600'}`}>{icon} <span className="tracking-tight">{label}</span></button>); }
function StatBox({ label, value }: any) { return (<div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm text-center border-b-4 border-b-blue-600 group hover:-translate-y-1 transition-all"><p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-2 italic">{label}</p><h4 className="text-3xl font-black text-blue-600 tabular-nums drop-shadow-[0_4px_4px_rgba(37,99,235,0.1)]">{value}</h4></div>); }
function DetailItem({ label, value }: any) { return (<div className="space-y-3"><p className="text-[11px] font-black uppercase text-slate-400 tracking-widest ml-2 italic">{label}</p><div className="bg-white border border-slate-200 rounded-3xl p-6 text-base text-slate-600 leading-relaxed shadow-sm italic whitespace-pre-wrap">{value || "No detailed log synced."}</div></div>); }
function ArtifactLink({ label, icon, url }: any) { return (<a href={url} target="_blank" className="flex items-center gap-3 px-6 py-3 bg-slate-100 border border-slate-200 rounded-2xl text-[10px] font-black uppercase text-slate-700 hover:bg-blue-600 hover:text-white active:scale-90 transition-all shadow-sm">{icon} {label}</a>); }
function ProfileItem({ label, value, icon }: any) { return (<div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl flex items-center gap-5 group hover:bg-white hover:shadow-md transition-all shadow-inner"><div className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors shadow-sm">{icon}</div><div className="min-w-0"><p className="text-[9px] font-bold uppercase text-slate-400 mb-1 leading-none italic">{label}</p><p className="text-sm font-bold text-slate-900 truncate">{value || '...'}</p></div></div>); }
function Input({ label, icon, onChange, type = "text", value }: any) { return (<div className="space-y-3"><label className="text-[12px] font-black text-slate-400 uppercase tracking-widest ml-6 italic flex items-center gap-2">{icon} {label}</label><input required type={type} value={value} className="w-full bg-slate-50 border border-slate-200 rounded-[28px] py-6 px-10 text-xl font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white shadow-inner transition-all placeholder:text-slate-300" placeholder="..." onChange={onChange} /></div>); }