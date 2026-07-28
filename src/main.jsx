import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowDownRight, ArrowLeft, ArrowRight, ArrowUpRight, AtSign, Check, Mail, Menu, Sparkles, X } from 'lucide-react';
import './styles.css';
import { supabase } from './lib/supabase';

const projects = [
  { name: 'Solstice', type: '3D Visual', year: '2024', className: 'solstice', category: '3D', description: 'A sun-drenched study in liquid geometry, warmth, and impossible materials.' },
  { name: 'Inner Bloom', type: 'Character Art', year: '2024', className: 'bloom', category: 'Character', description: 'A portrait about softness, self-possession, and the emotional language of colour.' },
  { name: 'Maison 04', type: 'Brand World', year: '2023', className: 'maison', category: 'Direction', description: 'An architectural visual system for a fictional house of considered objects.' },
  { name: 'Soft Armour', type: 'Editorial', year: '2023', className: 'armour', category: 'Editorial', description: 'Digital couture built around texture, contrast, and a quietly defiant silhouette.' },
];

const defaultSettings = { artistName:'hazecreates', eyebrow:'Independent visual artist - available worldwide', headline:'Making the unreal feel at home.', intro:'A digital artist shaping vivid worlds, expressive characters, and visuals that linger long after the scroll.', email:'hello@hazecreates.com', behance:'https://www.behance.net/', instagram:'https://instagram.com/', availability:'Available for selected commissions' };
const mapSettings = row => row ? ({...row, artistName:row.artist_name}) : defaultSettings;
const mapProject = row => ({...row, _id:row.id, artClass:row.art_class, behanceUrl:row.behance_url, order:row.sort_order, imageUrl:row.image_url||null});
const dbSettings = setting => ({artist_name:setting.artistName, eyebrow:setting.eyebrow, headline:setting.headline, intro:setting.intro, email:setting.email, behance:setting.behance, instagram:setting.instagram, availability:setting.availability, updated_at:new Date().toISOString()});
const dbProject = project => ({name:project.name,type:project.type,year:project.year,category:project.category,art_class:project.artClass,description:project.description,behance_url:project.behanceUrl,featured:project.featured,sort_order:project.order||0,image_url:project.imageUrl||null});
const navItems = [['work', 'Selected work'], ['about', 'About'], ['contact', "Let's talk"]];

function App() {
  const [page, setPage] = useState(() => location.pathname.replace(/^\/|\/$/g, '') || 'home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeProject, setActiveProject] = useState(null);
  const [content, setContent] = useState({ settings: defaultSettings, projects });

  useEffect(() => {
    const update = () => setPage(location.pathname.replace(/^\/|\/$/g, '') || 'home');
    addEventListener('popstate', update);
    return () => removeEventListener('popstate', update);
  }, []);
  useEffect(() => { if (!supabase) return; Promise.all([supabase.from('site_settings').select('*').limit(1).maybeSingle(), supabase.from('projects').select('*').order('sort_order')]).then(([settings, projectsResult]) => { if (!settings.error && !projectsResult.error && settings.data) setContent({settings:mapSettings(settings.data),projects:projectsResult.data.map(mapProject)}); }); }, []);

  const navigate = (next) => { const path = next === 'home' ? '/' : `/${next}`; history.pushState({}, '', path); setPage(next); setMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  return <main>
    <div className="grain" />
    <nav className="nav site-nav">
      <button className="brand" onClick={() => navigate('home')}>haze<span>creates</span></button>
      <div className="navlinks">{navItems.map(([to, label]) => <button className={page === to ? 'active' : ''} onClick={() => navigate(to)} key={to}>{label}{to === 'contact' && <ArrowUpRight size={14}/>}</button>)}</div>
      <button className="menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">{menuOpen ? <X/> : <Menu/>}</button>
    </nav>
    {menuOpen && <div className="mobile-nav">{navItems.map(([to,label]) => <button onClick={() => navigate(to)} key={to}>{label}</button>)}</div>}
    <div className="page-shell" key={page}>
      {page === 'home' && <Home navigate={navigate} openProject={setActiveProject} settings={content.settings} projects={content.projects}/>} 
      {page === 'work' && <Work openProject={setActiveProject} projects={content.projects} settings={content.settings}/>} 
      {page === 'about' && <About navigate={navigate}/>} 
      {page === 'contact' && <Contact settings={content.settings}/>} 
      {page === 'admin' && <SupabaseAdmin onContentChange={setContent}/>} 
    </div>
    <Footer navigate={navigate} settings={content.settings}/>
    {activeProject && <ProjectModal project={activeProject} close={() => setActiveProject(null)} />}
  </main>;
}

function Home({ navigate, openProject, settings, projects }) { return <>
  <section className="hero">
    <div className="hero-copy reveal"><p className="eyebrow"><i/> {settings.eyebrow}</p><h1>{settings.headline.split(' ').slice(0,-2).join(' ')} <em>{settings.headline.split(' ').slice(-2).join(' ')}</em></h1><p className="intro">{settings.intro}</p><button onClick={() => navigate('work')} className="button">Explore the work <ArrowDownRight size={18}/></button></div>
    <div className="hero-art" aria-label="abstract golden digital sculpture"><div className="sun"/><div className="arch arch-one"/><div className="arch arch-two"/><div className="orb"/><p>HAZE / 01</p></div><div className="hero-foot"><span>Scroll to wander</span><span>( 01 - 04 )</span></div>
  </section>
  <section className="marquee"><div>3D ART <b>✦</b> CHARACTER DESIGN <b>✦</b> DIGITAL WORLDS <b>✦</b> CREATIVE DIRECTION <b>✦</b> 3D ART <b>✦</b></div></section>
  <section className="work section"><div className="section-head reveal"><div><p className="eyebrow">01 / Selected work</p><h2>Small windows<br/>into <em>other places.</em></h2></div><p className="side-copy">A collection of independent explorations and commissioned work across art, culture, and imagination.</p></div><ProjectGrid projects={projects.filter(p => p.featured !== false).slice(0,4)} openProject={openProject}/><button onClick={() => navigate('work')} className="all-work">Explore all projects <ArrowUpRight size={16}/></button></section>
  <section className="services section"><div className="services-intro reveal"><p className="eyebrow">02 / The practice</p><h2>Built from<br/><em>curiosity.</em></h2><p>I combine detail-driven craft with a soft spot for strange ideas. Every visual is made to give your project its own atmosphere.</p></div><ServiceList/></section>
  <section className="statement"><Sparkles size={24}/><h2>Let's turn the thing in your<br/>head into a <em>whole world.</em></h2><button className="button light" onClick={() => navigate('contact')}>Start a project <ArrowUpRight size={18}/></button></section>
</> }

function Work({ openProject, projects, settings }) { const [filter, setFilter] = useState('All'); const categories = ['All', ...new Set(projects.map(p => p.category))]; const visible = filter === 'All' ? projects : projects.filter(p => p.category === filter); return <section className="inner-page work-page section"><div className="page-title reveal"><p className="eyebrow">01 / Archive</p><h1>Selected <em>work.</em></h1><p>Curious objects, character stories, and visual identities for brands with something to say.</p></div><div className="filters">{categories.map(x => <button className={filter === x ? 'selected' : ''} onClick={() => setFilter(x)} key={x}>{x}</button>)}</div><ProjectGrid projects={visible} openProject={openProject}/><a href={settings.behance} target="_blank" rel="noreferrer" className="all-work">More work on Behance <ArrowUpRight size={16}/></a></section> }

function About({ navigate }) { return <><section className="inner-page about-page section"><div className="page-title reveal"><p className="eyebrow">02 / About Haze</p><h1>Designed to<br/><em>stay with you.</em></h1></div><div className="about-grid"><div className="about-art"><div className="about-disc"/><span>HAZE<br/>CREATES<br/>STUDIO</span></div><div className="about-copy"><p className="lead">Hazecreates is the independent practice of a visual artist who believes the best work makes people pause.</p><p>I work across 3D, character illustration and art direction to make images that feel tactile, thoughtful and just a little unexpected.</p><p>Based online, working everywhere. I partner with artists, founders and creative teams from first spark to final frame.</p><button className="text-link" onClick={() => navigate('contact')}>Work with me <ArrowUpRight size={17}/></button></div></div></section><section className="services section"><div className="services-intro"><p className="eyebrow">What I can help with</p><h2>Made with<br/><em>intention.</em></h2></div><ServiceList/></section><section className="statement compact"><h2>Every good idea deserves<br/>a distinct <em>point of view.</em></h2></section></> }

function Contact({ settings }) { const [sent, setSent] = useState(false); const [form, setForm] = useState({name:'', email:'', project:'', budget:''}); const submit = (e) => { e.preventDefault(); window.location.href = `mailto:${settings.email}?subject=${encodeURIComponent('New project: '+form.name)}&body=${encodeURIComponent(form.project+'\nBudget: '+form.budget+'\nReply: '+form.email)}`; setSent(true); }; return <section className="inner-page contact-page section"><div className="page-title reveal"><p className="eyebrow">03 / Get in touch</p><h1>Make your next<br/>move <em>memorable.</em></h1><p>Tell me a little about what you are dreaming up. I usually reply within 2 business days.</p></div>{sent ? <div className="success-card"><span><Check size={26}/></span><h2>Your email draft is ready.</h2><p>Thank you, {form.name || 'friend'}. Send it in your email app and I'll be in touch soon.</p><button className="button" onClick={() => setSent(false)}>Send another note</button></div> : <form className="contact-form" onSubmit={submit}><label>Your name<input required value={form.name} onChange={e => setForm({...form,name:e.target.value})} placeholder="What should I call you?"/></label><label>Email address<input required type="email" value={form.email} onChange={e => setForm({...form,email:e.target.value})} placeholder="you@company.com"/></label><label>What are we making?<textarea required value={form.project} onChange={e => setForm({...form,project:e.target.value})} placeholder="A little about your project, timeline and goals..."/></label><label>Estimated budget<select value={form.budget} onChange={e => setForm({...form,budget:e.target.value})}><option value="">Select a range</option><option>$500 - $1,000</option><option>$1,000 - $3,000</option><option>$3,000+</option></select></label><button className="button" type="submit">Send inquiry <ArrowUpRight size={18}/></button></form>}</section> }

function ProjectGrid({ projects: items, openProject }) { return <div className="project-grid">{items.map((p, i) => <button className={'project '+(p.artClass || p.className)} onClick={() => openProject(p)} key={p._id || p.name}><div className="project-art" style={p.imageUrl ? {backgroundImage:`url(${p.imageUrl})`,backgroundSize:'cover',backgroundPosition:'center'} : {}}><span className="index">0{i+1}</span>{!p.imageUrl && <div className="art-object"/>}</div><div className="project-info"><div><h3>{p.name}</h3><p>{p.type} / {p.year}</p></div><span className="circle"><ArrowUpRight size={17}/></span></div></button>)}</div> }
function ServiceList() { return <div className="service-list"><div><span>01</span><h3>3D Modelling &amp;<br/>Visualisation</h3><ArrowUpRight/></div><div><span>02</span><h3>Full-body &amp;<br/>Character Art</h3><ArrowUpRight/></div><div><span>03</span><h3>Art Direction &amp;<br/>Campaign Worlds</h3><ArrowUpRight/></div></div> }
function ProjectModal({ project, close }) { return <div className="modal-backdrop" onMouseDown={close}><article className="project-modal" onMouseDown={e => e.stopPropagation()}><button className="modal-close" onClick={close}><X size={19}/></button><div className={'modal-art '+(project.imageUrl ? '' : (project.artClass || project.className))} style={project.imageUrl ? {backgroundImage:`url(${project.imageUrl})`,backgroundSize:'cover',backgroundPosition:'center'} : {}}>{!project.imageUrl && <div className="art-object"/>}</div><div className="modal-copy"><p className="eyebrow">{project.category} / {project.year}</p><h2>{project.name}</h2><p>{project.description}</p></div></article></div> }

function SupabaseAdmin({ onContentChange }) {
  const sessionRef = useRef(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [content, setContent] = useState(null);
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(null);

  useEffect(() => {
    if (!supabase) { setChecking(false); return; }
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session?.access_token) {
        sessionRef.current = data.session;
        setIsLoggedIn(true);
      }
      setChecking(false);
    });
  }, []);

  useEffect(() => {
    if (isLoggedIn) loadContent();
  }, [isLoggedIn]);

  const loadContent = async () => {
    setLoading(true);
    try {
      const [s, p] = await Promise.all([
        supabase.from('site_settings').select('*').limit(1).maybeSingle(),
        supabase.from('projects').select('*').order('sort_order')
      ]);
      const loadedSettings = (!s.error && s.data) ? mapSettings(s.data) : defaultSettings;
      const loadedProjects = (!p.error && p.data && p.data.length > 0) ? p.data.map(mapProject) : projects;
      const next = { settings: loadedSettings, projects: loadedProjects };
      setContent(next);
      onContentChange(next);
      if (s.error || p.error) setNotice(`Note: ${s.error?.message || p.error?.message}`);
    } catch (err) {
      setContent({ settings: defaultSettings, projects });
      setNotice(`Load error: ${err.message}`);
    }
    setLoading(false);
  };

  const uploadImage = async (file, projectIndex) => {
    setUploading(projectIndex);
    setNotice('');
    const ext = file.name.split('.').pop().toLowerCase();
    const filename = `project-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error: upErr } = await supabase.storage.from('project-images').upload(filename, file, { upsert: true, contentType: file.type });
    if (upErr) { setNotice(`Upload error: ${upErr.message}`); setUploading(null); return; }
    const { data: { publicUrl } } = supabase.storage.from('project-images').getPublicUrl(filename);
    setContent(prev => ({ ...prev, projects: prev.projects.map((x, n) => n === projectIndex ? { ...x, imageUrl: publicUrl } : x) }));
    setNotice('Image uploaded! Click Save project to keep it.');
    setUploading(null);
  };

  const login = async e => {
    e.preventDefault();
    setNotice('');
    if (!supabase) return setNotice('Supabase not configured.');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return setNotice(error.message);
    if (!data?.session) return setNotice('Login succeeded but no session returned.');
    sessionRef.current = data.session;
    setIsLoggedIn(true);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    sessionRef.current = null;
    setIsLoggedIn(false);
    setContent(null);
    setNotice('');
  };

  const saveSettings = async () => {
    setNotice('');
    const query = content.settings?.id
      ? supabase.from('site_settings').update(dbSettings(content.settings)).eq('id', content.settings.id)
      : supabase.from('site_settings').insert(dbSettings(content.settings));
    const { data, error } = await query.select().single();
    if (error) return setNotice(`Save error: ${error.message}`);
    const next = { ...content, settings: mapSettings(data) };
    setContent(next);
    onContentChange(next);
    setNotice('Website details saved.');
  };

  const saveProject = async p => {
    setNotice('');
    const query = p._id
      ? supabase.from('projects').update(dbProject(p)).eq('id', p._id)
      : supabase.from('projects').insert(dbProject(p));
    const { data, error } = await query.select().single();
    if (error) return setNotice(`Save error: ${error.message}`);
    const saved = mapProject(data);
    const list = p._id ? content.projects.map(x => x._id === saved._id ? saved : x) : [...content.projects, saved];
    const next = { ...content, projects: list };
    setContent(next);
    onContentChange(next);
    setNotice('Project saved.');
  };

  const removeProject = async id => {
    if (!confirm('Delete this project?')) return;
    setNotice('');
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) return setNotice(`Delete error: ${error.message}`);
    const next = { ...content, projects: content.projects.filter(p => p._id !== id) };
    setContent(next);
    onContentChange(next);
    setNotice('Project deleted.');
  };

  const addNewProject = () => setContent({ ...content, projects: [...content.projects, { name: 'New project', type: '3D Visual', year: '2025', category: '3D', artClass: 'solstice', description: '', behanceUrl: '', featured: true, order: content.projects.length + 1 }] });

  if (!supabase) return <section className="admin-page section"><div className="admin-login"><p className="eyebrow">Setup required</p><h1>Connect <em>Supabase.</em></h1><p>Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env, then restart Vite.</p></div></section>;
  if (checking) return <section className="admin-page section"><div className="admin-login"><p>Checking session...</p></div></section>;
  if (!isLoggedIn) return <section className="admin-page section"><div className="admin-login"><p className="eyebrow">Hazecreates / Admin</p><h1>Welcome <em>back.</em></h1><form onSubmit={login}><input required type="email" placeholder="Admin email" value={email} onChange={e => setEmail(e.target.value)} /><input required type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} /><button className="button" type="submit">Sign in <ArrowRight size={17} /></button></form>{notice && <p className="form-note">{notice}</p>}</div></section>;
  if (loading || !content) return <section className="admin-page section"><div className="admin-login"><p>Loading your studio...</p></div></section>;

  return <section className="admin-page section"><div className="admin-head"><div><p className="eyebrow">Hazecreates / Admin</p><h1>Studio <em>control.</em></h1></div><button onClick={logout} className="text-link">Sign out</button></div>{notice && <p className="save-note"><Check size={15} />{notice}</p>}<div className="admin-card"><h2>Website information</h2><div className="admin-fields">{[['artistName','Artist / brand name'],['eyebrow','Availability line'],['headline','Hero headline'],['intro','Hero intro'],['email','Email'],['behance','Behance URL'],['instagram','Instagram URL'],['availability','Footer availability']].map(([key, label]) => <label key={key}>{label}<input value={content.settings[key] || ''} onChange={e => setContent({ ...content, settings: { ...content.settings, [key]: e.target.value } })} /></label>)}</div><button className="button" onClick={saveSettings}>Save website details <Check size={17} /></button></div><div className="admin-card"><div className="admin-card-head"><h2>Projects</h2><button className="button small" onClick={addNewProject}>Add project</button></div>{content.projects.map((p, i) => <div className="project-editor" key={p._id || `new-${i}`}><div className="admin-fields">{[['name','Project name'],['type','Project type'],['year','Year'],['category','Category'],['artClass','Style (solstice, bloom, maison, armour)'],['description','Description']].map(([key, label]) => <label key={key}>{label}<input value={p[key] || ''} onChange={e => setContent({ ...content, projects: content.projects.map((x, n) => n === i ? { ...x, [key]: e.target.value } : x) })} /></label>)}<label style={{gridColumn:'1/-1'}}>{uploading === i ? 'Uploading...' : 'Artwork image (upload replaces CSS style)'}<input type="file" accept="image/*" disabled={uploading !== null} onChange={e => e.target.files[0] && uploadImage(e.target.files[0], i)} style={{background:'transparent',border:'1px dashed var(--line)',padding:'12px',cursor:'pointer',fontSize:'13px'}} />{p.imageUrl && <div style={{marginTop:'10px',position:'relative',display:'inline-block'}}><img src={p.imageUrl} alt="Project artwork" style={{width:'100%',maxHeight:'180px',objectFit:'cover',borderRadius:'4px',display:'block'}} /><button type="button" onClick={() => setContent({ ...content, projects: content.projects.map((x, n) => n === i ? { ...x, imageUrl: null } : x) })} style={{position:'absolute',top:'6px',right:'6px',background:'rgba(36,22,16,.75)',color:'#fff',border:0,borderRadius:'50%',width:'26px',height:'26px',cursor:'pointer',fontSize:'14px',display:'grid',placeItems:'center'}}>×</button></div>}</label></div><div className="editor-actions"><button className="button small" onClick={() => saveProject(p)}>Save project</button><button className="danger" onClick={() => p._id ? removeProject(p._id) : setContent({ ...content, projects: content.projects.filter((_, n) => n !== i) })}>Delete artwork</button></div></div>)}</div></section>;
}
function Footer({ navigate, settings }) { return <footer><div className="footer-top"><p className="eyebrow">{settings.availability}</p><button onClick={() => navigate('contact')}>{settings.email.split('@')[0]}@<em>{settings.email.split('@')[1]}</em><ArrowUpRight/></button></div><div className="footer-bottom"><span>© 2025 {settings.artistName}</span><div><a href={settings.behance} target="_blank" rel="noreferrer">Behance</a><a href={settings.instagram} target="_blank" rel="noreferrer"><AtSign size={15}/> Instagram</a><a href={`mailto:${settings.email}`}><Mail size={15}/> Email</a></div><span>Made with wonder.</span></div></footer> }
createRoot(document.getElementById('root')).render(<App/>);
