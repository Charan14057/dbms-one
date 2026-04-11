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
  ExternalLink, Link, Code2, Lock 
} from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'uploads' | 'registry'>('uploads');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [creationMode, setCreationMode] = useState<'student' | 'faculty'>('student');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showPassModal, setShowPassModal] = useState(false);
  const [passData, setPassData] = useState({ new: '', confirm: '' });
  const [updatingPass, setUpdatingPass] = useState(false);
  const [adminProfile, setAdminProfile] = useState<any>(null);

  const [stats, setStats] = useState({ 
    scholars: 0, mentors: 0, journals: 0, patents: 0, 
    confs: 0, ongoing: 0, course: 0, papers: 0 
  });

  const [users, setUsers] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [formData, setFormData] = useState({ name: '', email: '', dept: '' });

  useEffect(() => { fetchSystemVolume(); }, [activeTab]);

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
        papers: pr?.filter(x => x.category === 'papers').length || 0,
      });
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passData.new !== passData.confirm) return alert("Keys do not match.");
    setUpdatingPass(true);
    const { error } = await supabase.from('users').update({ temp_pass: passData.new }).eq('email', adminProfile.email);
    if (!error) { alert("SUCCESS: Access Key Secured."); setShowPassModal(false); }
    setUpdatingPass(false);
  };

  const handleDelete = async (table: string, id: string) => {
    if (!confirm(`SYSTEM ACTION: Remove entry permanently?`)) return;
    const { error } = await supabase.from(table).delete().eq(table === 'users' ? 'user_id' : 'id', id);
    if (!error) fetchSystemVolume();
  };

  const handleProvision = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.from('users').insert([{ ...formData, role: creationMode, temp_pass: 'WELCOME@123' }]);
    if (!error) { setShowModal(false); setFormData({ name: '', email: '', dept: '' }); fetchSystemVolume(); }
    setSubmitting(false);
  };

  if (loading) return <div className="min-h-screen bg-[#09090B] flex items-center justify-center text-emerald-500 font-black text-2xl animate-pulse italic uppercase tracking-tighter">Syncing ONE ROOT...</div>;

  return (
    <div className="flex min-h-screen bg-[#09090B] text-[#FAFAFA] font-sans selection:bg-emerald-500/30 overflow-hidden">
      
      {/* 🚀 SIDEBAR */}
      <nav className="w-72 border-r border-white/5 bg-[#0C0C0E] p-8 hidden lg:flex flex-col flex-shrink-0">
        <div className="flex items-center gap-4 mb-14 px-2">
          <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-xl"><ShieldCheck size={26} className="text-white" /></div>
          <span className="text-2xl font-black tracking-tighter uppercase leading-none italic">DBMS<br/><span className="text-emerald-500">ONE</span></span>
        </div>
        <div className="space-y-4 flex-1">
          <SidebarBtn active={activeTab === 'uploads'} onClick={() => setActiveTab('uploads')} icon={<Globe size={22}/>} label="Universal" />
          <SidebarBtn active={activeTab === 'registry'} onClick={() => setActiveTab('registry')} icon={<Briefcase size={22}/>} label="Registry" />
          <button onClick={() => setShowPassModal(true)} className="w-full flex items-center gap-5 p-6 rounded-[32px] transition-all font-bold text-xl text-zinc-500 hover:bg-white/5 hover:text-white"><Lock size={22} /><span className="tracking-tight uppercase font-black italic">Security</span></button>
        </div>
        <button onClick={() => { localStorage.clear(); router.replace('/'); }} className="flex items-center gap-4 p-5 text-zinc-500 hover:text-red-400 font-bold mt-auto transition-all group"><LogOut size={22} /><span className="text-lg uppercase italic font-black">Exit Hub</span></button>
      </nav>

      <main className="flex-1 overflow-y-auto p-10 lg:p-16 relative">
        <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-12 gap-10">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}><h1 className="text-8xl font-black tracking-tighter italic text-white leading-none">ROOT.</h1><p className="text-zinc-500 text-xl font-medium mt-3 uppercase tracking-[0.3em] italic">System Governance Registry</p></motion.div>
          <button onClick={() => setShowModal(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-5 rounded-[32px] font-black text-xl shadow-2xl transition-all active:scale-95 flex items-center gap-3"><UserPlus size={24} strokeWidth={3} /> Provision Access</button>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4 mb-12">
          <StatBox label="Scholars" value={stats.scholars} color="emerald" /><StatBox label="Mentors" value={stats.mentors} color="blue" /><StatBox label="Journals" value={stats.journals} color="emerald" /><StatBox label="Patents" value={stats.patents} color="orange" /><StatBox label="Confs" value={stats.confs} color="blue" /><StatBox label="Ongoing" value={stats.ongoing} color="orange" /><StatBox label="Course" value={stats.course} color="blue" /><StatBox label="Pro-Papers" value={stats.papers} color="rose" />
        </div>

        <div className="bg-[#121214] border border-white/5 rounded-[48px] overflow-hidden shadow-2xl">
          <div className="p-10 flex flex-col md:flex-row justify-between items-center gap-8 border-b border-white/5 bg-white/[0.01]"><h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">{activeTab === 'uploads' ? 'Universal Feed' : 'Registry Control'}</h3><div className="relative w-full md:w-[450px]"><Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600" size={24} /><input className="w-full bg-white/5 border border-white/10 rounded-[28px] py-5 pl-16 pr-8 text-xl text-white outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-zinc-800" placeholder="Search ONE Registry..." onChange={(e) => setSearchTerm(e.target.value)} /></div></div>

          <div className="p-6">
            {activeTab === 'uploads' ? (
              <div className="space-y-4">
                {submissions.filter(i => (i.title + i.student_name + i.mentor_name).toLowerCase().includes(searchTerm.toLowerCase())).map((item, i) => (
                    <div key={i} className="bg-white/[0.01] border border-white/5 rounded-[32px] overflow-hidden group">
                      <div onClick={() => setExpandedId(expandedId === item.id ? null : item.id)} className="p-8 flex justify-between items-center cursor-pointer hover:bg-white/[0.03] transition-all">
                        <div className="flex items-center gap-8">
                          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-xs uppercase ${item.sys_cat === 'publication' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'}`}>{item.pub_type?.[0] || item.category?.[0]}</div>
                          <div><div className="flex gap-3 mb-2"><span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/5 px-2 py-0.5 rounded">{item.pub_type || item.category}</span><span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">{new Date(item.created_at).toLocaleDateString()}</span></div><h4 className="text-3xl font-black text-white uppercase italic leading-tight">{item.title}</h4><p className="text-sm text-zinc-500 mt-2 font-bold uppercase italic">Scholar: {item.student_name} • Mentor: {item.mentor_name}</p></div>
                        </div>
                        <div className="flex items-center gap-4">
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(item.sys_cat === 'publication' ? 'publications' : 'projects', item.id); }} className="p-4 bg-zinc-900 rounded-2xl text-zinc-700 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"><Trash2 size={24} /></button>
                          <ChevronDown className={`text-zinc-700 transition-all duration-500 ${expandedId === item.id ? 'rotate-180 text-emerald-500' : ''}`} />
                        </div>
                      </div>
                      <AnimatePresence>
                        {expandedId === item.id && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-black/20 border-t border-white/5">
                            <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
                              <div className="space-y-6"><DetailItem label="Full Narrative" value={item.summary || item.description} /><DetailItem label="Mentor Credentials" value={`${item.mentor_name} (${item.mentor_email})`} />{item.associated_project && <DetailItem label="Linked Project" value={item.associated_project} />}</div>
                              <div className="space-y-6">
                                <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                                   <p className="text-[10px] font-black uppercase text-zinc-600 mb-4 tracking-widest italic">Technical Artifacts</p>
                                   <div className="flex flex-wrap gap-4">
                                      {item.drive_link && <ArtifactLink label="Drive Assets" icon={<Globe size={14}/>} url={item.drive_link} />}
                                      {item.github_link && <ArtifactLink label="Code Repository" icon={<Code2 size={14}/>} url={item.github_link} />}
                                      {item.doc_link && <ArtifactLink label="Project Docs" icon={<FileText size={14}/>} url={item.doc_link} />}
                                   </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4"><MiniDataBox label="Date Logged" val={new Date(item.created_at).toLocaleDateString()} /><MiniDataBox label="Track Type" val={item.pub_type || item.category} /></div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {users.filter(u => u.role !== 'admin' && (u.name + u.email).toLowerCase().includes(searchTerm.toLowerCase())).map((u, i) => (
                  <div key={i} className="bg-white/[0.02] border border-white/5 p-8 rounded-[40px] group transition-all hover:border-emerald-500/20">
                     <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-6"><div className="w-16 h-16 bg-zinc-800 rounded-3xl flex items-center justify-center text-emerald-500 font-black text-3xl shadow-inner border border-white/5">{u.name[0]}</div><div><h3 className="text-2xl font-black text-white italic uppercase leading-none tracking-tighter">{u.name}</h3><p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">{u.role} • {u.dept}</p></div></div>
                        <button onClick={() => handleDelete('users', u.user_id)} className="p-3 bg-zinc-900 rounded-xl text-zinc-700 hover:text-red-500 transition-colors"><Trash2 size={20}/></button>
                     </div>
                     <details className="group/details">
                        <summary className="list-none cursor-pointer flex items-center justify-between w-full py-4 px-6 bg-white/5 rounded-2xl border border-white/5 text-[10px] font-black uppercase text-emerald-500 group-open:mb-4 transition-all"><span>View Upload Profile</span><ChevronRight size={16} className="group-open/details:rotate-90 transition-transform"/></summary>
                        <div className="space-y-2 mt-4 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                           {submissions.filter(s => u.role === 'student' ? s.student_id === u.user_id : s.mentor_email === u.email).map((entry, idx) => (
                              <div key={idx} className="p-4 bg-white/5 rounded-xl border border-white/5 flex justify-between items-center group/item">
                                 <div><p className="text-xs font-bold text-zinc-300 uppercase italic">{entry.title}</p><p className="text-[8px] font-black text-zinc-600 uppercase mt-1">{entry.pub_type || entry.category}</p></div>
                                 <button onClick={() => handleDelete(entry.sys_cat === 'publication' ? 'publications' : 'projects', entry.id)} className="opacity-0 group-hover/item:opacity-100 text-red-500/50 hover:text-red-500 transition-all"><Trash2 size={14}/></button>
                              </div>
                           ))}
                        </div>
                     </details>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <AnimatePresence>
          {showPassModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-3xl bg-black/80">
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-[#121214] border border-white/10 w-full max-w-xl rounded-[60px] p-12 shadow-2xl relative">
                <button onClick={() => setShowPassModal(false)} className="absolute top-8 right-8 text-zinc-600 hover:text-white transition-all"><X size={32}/></button>
                <h2 className="text-5xl font-black text-white mb-10 italic uppercase tracking-tighter">Reset Key.</h2>
                <form onSubmit={handlePasswordUpdate} className="space-y-8"><Input label="New Key" placeholder="••••••••" type="password" onChange={(e:any) => setPassData({...passData, new: e.target.value})} icon={<Lock size={18}/>} /><Input label="Confirm Key" placeholder="••••••••" type="password" onChange={(e:any) => setPassData({...passData, confirm: e.target.value})} icon={<CheckCircle2 size={18}/>} /><button type="submit" disabled={updatingPass} className="w-full py-8 bg-emerald-600 text-white rounded-[40px] font-black text-2xl shadow-2xl active:scale-95 flex items-center justify-center gap-4">{updatingPass ? <Loader2 className="animate-spin" /> : 'Provision New Key'}</button></form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-3xl bg-black/80">
              <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-[#121214] border border-white/10 w-full max-w-2xl rounded-[60px] p-12 relative shadow-2xl">
                 <button onClick={() => setShowModal(false)} className="absolute top-8 right-8 text-zinc-600 hover:text-white transition-all"><X size={32} /></button>
                 <h2 className="text-5xl font-black text-white mb-10 italic uppercase tracking-tighter">Provision {creationMode}.</h2>
                 <form onSubmit={handleProvision} className="space-y-6"><Input icon={<Users size={20}/>} label="Full Identity Name" onChange={(e:any) => setFormData({...formData, name: e.target.value})} /><Input icon={<Mail size={20}/>} label="Academic Email" onChange={(e:any) => setFormData({...formData, email: e.target.value})} /><Input icon={<Database size={20}/>} label="Department" onChange={(e:any) => setFormData({...formData, dept: e.target.value})} /><button type="submit" disabled={submitting} className={`w-full py-8 rounded-[40px] font-black text-2xl text-white mt-6 shadow-2xl transition-all ${creationMode === 'student' ? 'bg-emerald-600' : 'bg-blue-600'}`}>Sync & Finalize</button></form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// ATOMS
function DetailItem({ label, value }: { label: string, value: string }) { return (<div className="space-y-2"><p className="text-[9px] font-black uppercase text-zinc-700 tracking-[0.2em] italic">{label}</p><div className="bg-white/5 border border-white/10 p-5 rounded-2xl text-sm italic text-zinc-400 leading-relaxed shadow-inner">{value || "No detailed log found."}</div></div>); }
function ArtifactLink({ label, icon, url }: { label: string, icon: any, url: string }) { return (<a href={url} target="_blank" className="flex items-center gap-3 px-6 py-3 bg-zinc-900 hover:bg-white hover:text-black rounded-2xl text-[10px] font-black uppercase transition-all shadow-xl border border-white/5">{icon} {label} <ExternalLink size={12} className="opacity-50" /></a>); }
function MiniDataBox({ label, val }: any) { return (<div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl"><p className="text-[8px] font-black uppercase text-zinc-700 mb-1">{label}</p><p className="text-xs font-bold text-zinc-400 italic uppercase">{val}</p></div>); }
function SidebarBtn({ icon, label, active, onClick }: any) { return (<button onClick={onClick} className={`w-full flex items-center justify-between p-6 rounded-[32px] transition-all font-bold text-xl group ${active ? 'bg-white text-[#09090B] shadow-xl' : 'text-zinc-500 hover:bg-white/5 hover:text-white'}`}><div className="flex items-center gap-5"><span>{icon}</span><span className="tracking-tight uppercase font-black italic">{label}</span></div>{active && <ChevronRight size={18} />}</button>); }
function StatBox({ label, value, color }: any) { const themes: any = { emerald: "text-emerald-500", blue: "text-blue-500", orange: "text-orange-500", rose: "text-rose-500" }; return (<div className="bg-[#121214] border border-white/5 p-6 rounded-[32px] shadow-xl relative overflow-hidden group"><p className="text-zinc-600 text-[8px] font-black uppercase tracking-widest relative z-10 italic mb-2 leading-none">{label}</p><h4 className={`text-4xl font-black tracking-tighter relative z-10 ${themes[color]}`}>{value}</h4></div>); }
function Input({ label, icon, onChange, type = "text", placeholder = "..." }: any) { return (<div className="space-y-3"><label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] ml-4 flex items-center gap-2 italic">{icon} {label}</label><input required type={type} className="w-full bg-white/5 border border-white/10 rounded-[30px] py-5 px-10 text-xl text-white outline-none focus:border-white/20 shadow-inner placeholder:text-zinc-900 italic" placeholder={placeholder} onChange={onChange} /></div>); }