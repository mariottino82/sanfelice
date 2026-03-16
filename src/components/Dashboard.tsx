import React from 'react';
import { motion } from 'motion/react';
import { Users, FileText, Calendar, Euro, Plus, TrendingUp, LogOut, Shield, UserPlus, Settings, UserCheck, Trash2, Edit2, Ticket, Gift, CheckCircle2, Newspaper, Facebook, Instagram, Youtube, Share2, Image as ImageIcon, Video, Vote, Menu, X } from 'lucide-react';

export function Dashboard({ user, onLogout }: { user: any, onLogout: () => void }) {
  const isAdmin = user?.role === 'Amministratore';
  const [activeTab, setActiveTab] = React.useState(isAdmin ? 'members' : 'member-home');
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [members, setMembers] = React.useState([]);
  const [collections, setCollections] = React.useState([]);
  const [news, setNews] = React.useState([]);
  const [lottery, setLottery] = React.useState<any>({
    active: false,
    showOnHomepage: true,
    name: '',
    drawDate: '',
    prizes: [],
    history: []
  });
  const [poll, setPoll] = React.useState<any>({
    active: false,
    showOnHomepage: true,
    question: '',
    options: [],
    votes: []
  });
  const [accounts, setAccounts] = React.useState([
    { id: 1, username: 'admin', role: 'Amministratore', lastLogin: '2026-03-15' }
  ]);

  const [editingMember, setEditingMember] = React.useState<any>(null);
  const [editingCollection, setEditingCollection] = React.useState<any>(null);
  const [editingMinute, setEditingMinute] = React.useState<any>(null);
  const [editingAppointment, setEditingAppointment] = React.useState<any>(null);
  const [editingNews, setEditingNews] = React.useState<any>(null);

  const [minutes, setMinutes] = React.useState([]);
  const [appointments, setAppointments] = React.useState([]);
  const [registrations, setRegistrations] = React.useState([]);
  const [gallery, setGallery] = React.useState([]);

  React.useEffect(() => {
    const savedMembers = localStorage.getItem('members');
    const savedCollections = localStorage.getItem('collections');
    const savedLottery = localStorage.getItem('lottery');
    const savedPoll = localStorage.getItem('poll');
    const savedMinutes = localStorage.getItem('minutes');
    const savedAppointments = localStorage.getItem('appointments');
    const savedRegistrations = localStorage.getItem('registrations');
    const savedAccounts = localStorage.getItem('accounts');
    const savedNews = localStorage.getItem('news');
    const savedGallery = localStorage.getItem('gallery');
    
    if (savedMembers) setMembers(JSON.parse(savedMembers));
    else {
      const initialMembers = [
        { id: 1, name: 'Mario Rossi', email: 'mario@example.com', status: 'attivo', role: 'Presidente', payments: { 2024: true, 2025: true, 2026: true } },
        { id: 2, name: 'Luigi Verdi', email: 'luigi@example.com', status: 'attivo', role: 'Vicepresidente', payments: { 2024: true, 2025: true, 2026: false } }
      ];
      setMembers(initialMembers);
      localStorage.setItem('members', JSON.stringify(initialMembers));
    }

    if (savedCollections) setCollections(JSON.parse(savedCollections));
    else {
      setCollections([]);
      localStorage.setItem('collections', JSON.stringify([]));
    }

    if (savedLottery) setLottery(JSON.parse(savedLottery));
    if (savedPoll) setPoll(JSON.parse(savedPoll));
    if (savedMinutes) setMinutes(JSON.parse(savedMinutes));
    if (savedAppointments) setAppointments(JSON.parse(savedAppointments));
    if (savedRegistrations) setRegistrations(JSON.parse(savedRegistrations));
    if (savedAccounts) setAccounts(JSON.parse(savedAccounts));
    
    if (savedNews) setNews(JSON.parse(savedNews));
    else {
      const demoNews = [
        {
          id: 1,
          title: "Festa Patronale di San Felice",
          date: "2024-05-15",
          category: "evento",
          content: "La tradizionale festa con processione, musica dal vivo e stand gastronomici. Un momento di unione per tutta la comunità.",
          imageUrl: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=800"
        },
        {
          id: 2,
          title: "Sagra d'Estate",
          date: "2024-07-20",
          category: "evento",
          content: "Una serata dedicata ai sapori del territorio e alla convivialità. Degustazioni di prodotti tipici e musica popolare.",
          imageUrl: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=800"
        },
        {
          id: 3,
          title: "Assemblea dei Soci",
          date: "2024-12-22",
          category: "news",
          content: "Si terrà l'assemblea annuale per il rinnovo delle cariche e la presentazione del bilancio. Partecipazione caldamente consigliata.",
          imageUrl: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=800"
        }
      ];
      setNews(demoNews);
      localStorage.setItem('news', JSON.stringify(demoNews));
    }

    if (savedGallery) setGallery(JSON.parse(savedGallery));
    else {
      const demoGallery = [
        { id: 1, type: 'image', url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800' },
        { id: 2, type: 'image', url: 'https://images.unsplash.com/photo-1472653431158-6364773b2a56?auto=format&fit=crop&q=80&w=800' },
        { id: 3, type: 'video', url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800' },
        { id: 4, type: 'image', url: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=800' },
        { id: 5, type: 'image', url: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&q=80&w=800' },
        { id: 6, type: 'video', url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=800' },
      ];
      setGallery(demoGallery);
      localStorage.setItem('gallery', JSON.stringify(demoGallery));
    }
  }, []);

  const totalCollected = collections.reduce((acc, curr: any) => acc + curr.amount, 0);

  // Find current member data if not admin
  const currentMember = !isAdmin ? members.find((m: any) => m.email === user?.email) : null;
  const isFeePaid = currentMember?.payments?.[2026];

  const lastMinutes = [...minutes].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  const upcomingAppointments = [...appointments].sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const saveMembers = (updated: any) => {
    setMembers(updated);
    localStorage.setItem('members', JSON.stringify(updated));
  };

  const saveCollections = (updated: any) => {
    setCollections(updated);
    localStorage.setItem('collections', JSON.stringify(updated));
  };

  const saveLottery = (updated: any) => {
    setLottery(updated);
    localStorage.setItem('lottery', JSON.stringify(updated));
  };

  const savePoll = (updated: any) => {
    setPoll(updated);
    localStorage.setItem('poll', JSON.stringify(updated));
  };

  const saveMinutes = (updated: any) => {
    setMinutes(updated);
    localStorage.setItem('minutes', JSON.stringify(updated));
  };

  const saveAppointments = (updated: any) => {
    setAppointments(updated);
    localStorage.setItem('appointments', JSON.stringify(updated));
  };

  const saveRegistrations = (updated: any) => {
    setRegistrations(updated);
    localStorage.setItem('registrations', JSON.stringify(updated));
  };

  const saveAccounts = (updated: any) => {
    setAccounts(updated);
    localStorage.setItem('accounts', JSON.stringify(updated));
  };

  const saveNews = (updated: any) => {
    setNews(updated);
    localStorage.setItem('news', JSON.stringify(updated));
  };

  const saveGallery = (updated: any) => {
    setGallery(updated);
    localStorage.setItem('gallery', JSON.stringify(updated));
  };

  const addMinute = (newMinute: any) => {
    if (editingMinute) {
      const updated = minutes.map((m: any) => m.id === editingMinute.id ? { ...m, ...newMinute } : m);
      saveMinutes(updated);
      setEditingMinute(null);
    } else {
      const updated = [...minutes, { ...newMinute, id: Date.now(), date: new Date().toISOString() }];
      saveMinutes(updated);
    }
  };

  const deleteMinute = (id: number) => {
    const updated = minutes.filter((m: any) => m.id !== id);
    saveMinutes(updated);
  };

  const addAppointment = (newApp: any) => {
    if (editingAppointment) {
      const updated = appointments.map((a: any) => a.id === editingAppointment.id ? { ...a, ...newApp } : a);
      saveAppointments(updated);
      setEditingAppointment(null);
    } else {
      const updated = [...appointments, { ...newApp, id: Date.now() }];
      saveAppointments(updated);
    }
  };

  const deleteAppointment = (id: number) => {
    const updated = appointments.filter((a: any) => a.id !== id);
    saveAppointments(updated);
  };

  const addMember = (newMember: any) => {
    if (editingMember) {
      const updated = members.map((m: any) => m.id === editingMember.id ? { ...m, ...newMember } : m);
      saveMembers(updated);
      setEditingMember(null);
    } else {
      const updated = [...members, { ...newMember, id: Date.now(), status: 'attivo', payments: { 2024: false, 2025: false, 2026: true } }];
      saveMembers(updated);
    }
  };

  const togglePayment = (memberId: number, year: number) => {
    const updated = members.map((m: any) => {
      if (m.id === memberId) {
        const currentPayments = m.payments || {};
        return { ...m, payments: { ...currentPayments, [year]: !currentPayments[year] } };
      }
      return m;
    });
    saveMembers(updated);
  };

  const deleteMember = (id: number) => {
    const updated = members.filter((m: any) => m.id !== id);
    saveMembers(updated);
  };

  const addCollection = (newCollection: any) => {
    if (editingCollection) {
      const updated = collections.map((c: any) => c.id === editingCollection.id ? { ...c, ...newCollection, amount: parseFloat(newCollection.amount) } : c);
      saveCollections(updated);
      setEditingCollection(null);
    } else {
      const updated = [...collections, { ...newCollection, id: Date.now(), amount: parseFloat(newCollection.amount) }];
      saveCollections(updated);
    }
  };

  const deleteCollection = (id: number) => {
    const updated = collections.filter((c: any) => c.id !== id);
    saveCollections(updated);
  };

  const approveRegistration = (reg: any) => {
    const newMember = {
      id: Date.now(),
      name: reg.name,
      email: reg.email,
      role: 'Socio',
      status: 'attivo',
      payments: { 2024: false, 2025: false, 2026: true }
    };
    const updatedMembers = [...members, newMember];
    saveMembers(updatedMembers);
    const updatedRegistrations = registrations.filter((r: any) => r.id !== reg.id);
    saveRegistrations(updatedRegistrations);
    alert('Iscrizione approvata con successo! Il nuovo socio è stato aggiunto all\'elenco.');
  };

  const deleteRegistration = (id: number) => {
    saveRegistrations(registrations.filter((r: any) => r.id !== id));
  };

  const addNews = (newNews: any) => {
    if (editingNews) {
      const updated = news.map((n: any) => n.id === editingNews.id ? { ...n, ...newNews } : n);
      saveNews(updated);
      setEditingNews(null);
      alert('News/Evento aggiornato con successo!');
    } else {
      const updated = [...news, { ...newNews, id: Date.now(), date: new Date().toISOString() }];
      saveNews(updated);
      alert('News/Evento pubblicato con successo!');
    }
  };

  const deleteNews = (id: number) => {
    const updated = news.filter((n: any) => n.id !== id);
    saveNews(updated);
  };

  const addGalleryItem = (item: any) => {
    const updated = [...gallery, { ...item, id: Date.now() }];
    saveGallery(updated);
    alert('Elemento aggiunto alla gallery!');
  };

  const deleteGalleryItem = (id: number) => {
    const updated = gallery.filter((item: any) => item.id !== id);
    saveGallery(updated);
  };

  const addAccount = (newAcc: any) => {
    const updated = [...accounts, { ...newAcc, id: Date.now(), lastLogin: 'Mai' }];
    saveAccounts(updated);
  };

  const deleteAccount = (id: number) => {
    saveAccounts(accounts.filter((a: any) => a.id !== id));
  };

  const archiveLottery = () => {
    const { history, ...current } = lottery;
    const updated = {
      active: false,
      showOnHomepage: false,
      drawDate: '',
      prizes: [],
      history: [...(history || []), { ...current, id: Date.now(), archivedAt: new Date().toISOString() }]
    };
    saveLottery(updated);
  };

  const closeYear = () => {
    const total = collections.reduce((acc, curr: any) => acc + curr.amount, 0);
    const updated = [{
      id: Date.now(),
      event_name: `Rimanenza Fondo Cassa Anno Precedente`,
      type: 'rimanenza',
      amount: total,
      date: new Date().toISOString()
    }];
    saveCollections(updated);
  };

  const cariche = ['Presidente', 'Vicepresidente', 'Segretario', 'Tesoriere', 'Socio'];

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <div className="lg:hidden bg-stone-900 text-white p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
          <span className="font-serif font-bold">Pro San Felice</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-stone-800 rounded-lg transition-colors"
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-stone-900 text-stone-400 flex flex-col transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:h-screen
      `}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-12 h-12 flex items-center justify-center overflow-hidden">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="w-full h-full object-contain" 
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h2 className="text-white font-serif text-xl font-bold leading-tight">Pro San Felice</h2>
            <p className="text-[10px] text-stone-500 uppercase tracking-widest">Area Riservata</p>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          {isAdmin ? (
            <>
              {[
                { id: 'members', label: 'Soci & Cariche', icon: Users },
                { id: 'registrations', label: 'Iscrizioni', icon: UserPlus },
                { id: 'finances', label: 'Contabilità', icon: Euro },
                { id: 'lottery', label: 'Lotteria', icon: Ticket },
                { id: 'minutes', label: 'Verbali', icon: FileText },
                { id: 'appointments', label: 'Agenda', icon: Calendar },
                { id: 'news', label: 'News & Eventi', icon: Newspaper },
                { id: 'poll', label: 'Sondaggi', icon: Vote },
                { id: 'gallery', label: 'Foto & Video', icon: ImageIcon },
                { id: 'accounts', label: 'Account & Sicurezza', icon: Shield },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-white text-stone-900 shadow-lg'
                      : 'hover:bg-stone-800 hover:text-white'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </>
          ) : (
            <>
              {[
                { id: 'member-home', label: 'Home Socio', icon: UserCheck },
                { id: 'news', label: 'News & Eventi', icon: Newspaper },
                { id: 'gallery', label: 'Foto & Video', icon: ImageIcon },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-white text-stone-900 shadow-lg'
                      : 'hover:bg-stone-800 hover:text-white'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </>
          )}
        </nav>

        <div className="p-4 border-t border-stone-800">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-400/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Esci
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-serif text-stone-900">
              {activeTab === 'members' && 'Gestione Soci'}
              {activeTab === 'registrations' && 'Nuove Iscrizioni'}
              {activeTab === 'finances' && 'Contabilità & Raccolte'}
              {activeTab === 'lottery' && 'Gestione Lotteria'}
              {activeTab === 'minutes' && 'Archivio Verbali'}
              {activeTab === 'appointments' && 'Agenda Appuntamenti'}
              {activeTab === 'news' && 'News & Eventi'}
              {activeTab === 'accounts' && 'Gestione Account'}
              {activeTab === 'poll' && 'Gestione Sondaggi'}
              {activeTab === 'member-home' && `Benvenuto, ${user?.username}`}
            </h1>
            <p className="text-stone-500 text-sm mt-1">
              {isAdmin ? 'Pannello di controllo amministrativo' : `Profilo ${user?.role}`}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-bold text-stone-900">{user?.username}</p>
              <p className="text-xs text-stone-500">{user?.email || 'admin@prosanfelice.it'}</p>
            </div>
            <div className="w-10 h-10 bg-stone-200 rounded-full flex items-center justify-center">
              <Shield className={`w-5 h-5 ${isAdmin ? 'text-amber-600' : 'text-stone-600'}`} />
            </div>
          </div>
        </header>

        {/* Member View Home */}
        {!isAdmin && activeTab === 'member-home' && (
          <div className="space-y-8">
            {/* Alerts */}
            {!isFeePaid && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 p-4 rounded-2xl flex items-center gap-4 text-red-800"
              >
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Euro className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold">Quota 2026 non versata</p>
                  <p className="text-sm">Ti ricordiamo di regolarizzare la tua quota associativa per l'anno in corso.</p>
                </div>
              </motion.div>
            )}

            {isFeePaid && (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center gap-4 text-emerald-800">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold">Quota 2026 in regola</p>
                  <p className="text-sm">Grazie per il tuo sostegno! La tua iscrizione è attiva per tutto l'anno 2026.</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Fondo Cassa */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-200">
                <div className="flex items-center gap-3 text-stone-500 mb-4">
                  <Euro className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-widest">Fondo Cassa Associazione</span>
                </div>
                <div className="text-5xl font-serif text-stone-900">€ {totalCollected.toLocaleString('it-IT')}</div>
                <p className="text-stone-400 text-xs mt-4 italic">Trasparenza e gestione condivisa delle risorse.</p>
              </div>

              {/* Prossimi Appuntamenti */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-200">
                <div className="flex items-center gap-3 text-stone-500 mb-6">
                  <Calendar className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-widest">Agenda Appuntamenti</span>
                </div>
                <div className="space-y-4">
                  {upcomingAppointments.length > 0 ? upcomingAppointments.slice(0, 3).map((app: any) => (
                    <div key={app.id} className="flex items-center gap-4 p-3 bg-stone-50 rounded-xl">
                      <div className="w-10 h-10 bg-white rounded-lg flex flex-col items-center justify-center border border-stone-100">
                        <span className="text-[10px] font-bold text-stone-400 uppercase">{new Date(app.date).toLocaleDateString('it-IT', { month: 'short' })}</span>
                        <span className="text-sm font-bold text-stone-900 leading-none">{new Date(app.date).getDate()}</span>
                      </div>
                      <div>
                        <p className="font-bold text-stone-900 text-sm">{app.title}</p>
                        <p className="text-xs text-stone-500">{new Date(app.date).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  )) : (
                    <p className="text-stone-400 text-sm italic">Nessun appuntamento in programma.</p>
                  )}
                </div>
              </div>

              {/* Ultimi Verbali */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-200 md:col-span-2">
                <div className="flex items-center gap-3 text-stone-500 mb-6">
                  <FileText className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-widest">Ultimi Verbali Incontri</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {lastMinutes.length > 0 ? lastMinutes.map((m: any) => (
                    <div key={m.id} className="p-4 border border-stone-100 rounded-2xl hover:bg-stone-50 transition-colors cursor-pointer group">
                      <div className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-white transition-colors">
                        <FileText className="w-5 h-5 text-stone-400" />
                      </div>
                      <p className="font-bold text-stone-900 text-sm mb-1">{m.title}</p>
                      <p className="text-[10px] text-stone-500 uppercase tracking-wider">{new Date(m.date).toLocaleDateString('it-IT')}</p>
                    </div>
                  )) : (
                    <p className="text-stone-400 text-sm italic col-span-full">Nessun verbale archiviato.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Overview */}
        {isAdmin && (activeTab === 'members' || activeTab === 'finances') && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-200">
              <div className="flex items-center gap-3 text-stone-500 mb-2">
                <Users className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Soci Totali</span>
              </div>
              <div className="text-4xl font-serif text-stone-900">{members.length}</div>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-200">
              <div className="flex items-center gap-3 text-stone-500 mb-2">
                <Euro className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Fondo Cassa</span>
              </div>
              <div className="text-4xl font-serif text-stone-900">€ {totalCollected.toLocaleString('it-IT')}</div>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-200">
              <div className="flex items-center gap-3 text-stone-500 mb-2">
                <UserCheck className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Iscrizioni 2026</span>
              </div>
              <div className="text-4xl font-serif text-stone-900">12</div>
            </div>
          </div>
        )}

        {/* Tab Content */}
        <div className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden">
          <div className="p-8">
            {isAdmin && activeTab === 'members' && (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-serif text-stone-900">Elenco Soci e Cariche</h2>
                </div>

                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const data = Object.fromEntries(formData);
                    addMember(data);
                    e.currentTarget.reset();
                  }}
                  className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-stone-50 rounded-2xl border border-stone-200"
                >
                  <input name="name" defaultValue={editingMember?.name} placeholder="Nome e Cognome" className="px-4 py-2 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-stone-900 outline-none" required />
                  <input name="email" defaultValue={editingMember?.email} type="email" placeholder="Email" className="px-4 py-2 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-stone-900 outline-none" />
                  <select name="role" defaultValue={editingMember?.role || 'Socio'} className="px-4 py-2 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-stone-900 outline-none" required>
                    {cariche.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <button type="submit" className="bg-stone-900 text-white py-2 rounded-xl text-sm font-medium hover:bg-stone-800">
                    {editingMember ? 'Salva Modifiche' : 'Aggiungi Socio'}
                  </button>
                  {editingMember && (
                    <button type="button" onClick={() => setEditingMember(null)} className="bg-stone-200 text-stone-600 py-2 rounded-xl text-sm font-medium hover:bg-stone-300">
                      Annulla
                    </button>
                  )}
                </form>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="text-stone-400 uppercase text-[10px] tracking-widest border-b border-stone-100">
                        <th className="pb-4 font-semibold">Nominativo</th>
                        <th className="pb-4 font-semibold">Carica</th>
                        <th className="pb-4 font-semibold">Email</th>
                        <th className="pb-4 font-semibold text-center">Quote (24/25/26)</th>
                        <th className="pb-4 font-semibold">Stato</th>
                        <th className="pb-4 font-semibold text-right">Azioni</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-50">
                      {members.map((member: any) => (
                        <tr key={member.id} className="group hover:bg-stone-50 transition-colors">
                          <td className="py-4 font-medium text-stone-900">{member.name}</td>
                          <td className="py-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                              member.role === 'Presidente' ? 'bg-amber-50 text-amber-600' : 'bg-stone-100 text-stone-600'
                            }`}>
                              {member.role || 'Socio'}
                            </span>
                          </td>
                          <td className="py-4 text-stone-500">{member.email}</td>
                          <td className="py-4">
                            <div className="flex justify-center gap-2">
                              {[2024, 2025, 2026].map(year => (
                                <button
                                  key={year}
                                  onClick={() => togglePayment(member.id, year)}
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all ${
                                    member.payments?.[year]
                                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                      : 'bg-stone-100 text-stone-400 border border-stone-200 hover:bg-stone-200'
                                  }`}
                                  title={`Quota ${year}`}
                                >
                                  {year.toString().slice(-2)}
                                </button>
                              ))}
                            </div>
                          </td>
                          <td className="py-4">
                            <span className="flex items-center gap-1.5 text-emerald-600 font-bold text-[10px] uppercase">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              {member.status}
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => setEditingMember(member)} className="text-stone-400 hover:text-stone-900 transition-colors p-2 bg-stone-100 rounded-lg" title="Modifica">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button onClick={() => deleteMember(member.id)} className="text-red-400 hover:text-white hover:bg-red-500 transition-all p-2 bg-red-50 rounded-lg border border-red-100" title="Elimina Definitivamente">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {isAdmin && activeTab === 'finances' && (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-serif text-stone-900">Registro Contabile</h2>
                  <button 
                    onClick={closeYear}
                    className="bg-amber-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-amber-600 transition-colors flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Chiusura Anno
                  </button>
                </div>

                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const data = Object.fromEntries(formData);
                    addCollection({ 
                      ...data, 
                      date: new Date().toISOString() 
                    });
                    e.currentTarget.reset();
                  }}
                  className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-stone-50 rounded-2xl border border-stone-200"
                >
                  <input name="event_name" defaultValue={editingCollection?.event_name} placeholder="Evento / Causale" className="px-4 py-2 rounded-xl border border-stone-200 text-sm md:col-span-2 focus:ring-2 focus:ring-stone-900 outline-none" required />
                  <select name="type" defaultValue={editingCollection?.type || 'evento'} className="px-4 py-2 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-stone-900 outline-none">
                    <option value="evento">Evento</option>
                    <option value="questua">Questua</option>
                    <option value="tesseramento">Tesseramento</option>
                    <option value="rimanenza">Rimanenza</option>
                  </select>
                  <input name="amount" defaultValue={editingCollection?.amount} type="number" step="0.01" placeholder="Importo (€)" className="px-4 py-2 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-stone-900 outline-none" required />
                  <button type="submit" className="md:col-span-4 bg-stone-900 text-white py-3 rounded-xl text-sm font-bold hover:bg-stone-800 shadow-lg shadow-stone-900/10">
                    {editingCollection ? 'Salva Modifiche' : 'Registra Transazione'}
                  </button>
                  {editingCollection && (
                    <button type="button" onClick={() => setEditingCollection(null)} className="md:col-span-4 bg-stone-200 text-stone-600 py-2 rounded-xl text-sm font-medium hover:bg-stone-300">
                      Annulla
                    </button>
                  )}
                </form>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="text-stone-400 uppercase text-[10px] tracking-widest border-b border-stone-100">
                        <th className="pb-4 font-semibold">Causale</th>
                        <th className="pb-4 font-semibold">Tipo</th>
                        <th className="pb-4 font-semibold">Data</th>
                        <th className="pb-4 font-semibold text-right">Importo</th>
                        <th className="pb-4 font-semibold text-right">Azioni</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-50">
                      {collections.map((item: any) => (
                        <tr key={item.id} className="hover:bg-stone-50 transition-colors">
                          <td className="py-4 font-medium text-stone-900">{item.event_name}</td>
                          <td className="py-4">
                            <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                              item.type === 'rimanenza' ? 'bg-amber-50 text-amber-600' : 'bg-stone-100 text-stone-600'
                            }`}>
                              {item.type}
                            </span>
                          </td>
                          <td className="py-4 text-stone-500">{new Date(item.date).toLocaleDateString('it-IT')}</td>
                          <td className={`py-4 text-right font-mono font-bold ${item.amount >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            € {item.amount.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => setEditingCollection(item)} className="text-stone-400 hover:text-stone-900 transition-colors p-1">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button onClick={() => deleteCollection(item.id)} className="text-stone-400 hover:text-red-600 transition-colors p-1">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {isAdmin && activeTab === 'lottery' && (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-serif text-stone-900">Gestione Lotteria</h2>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-stone-400 uppercase">Visibile in Home:</span>
                      <button 
                        onClick={() => saveLottery({ ...lottery, showOnHomepage: !lottery.showOnHomepage })}
                        className={`w-10 h-5 rounded-full transition-colors relative ${lottery.showOnHomepage ? 'bg-stone-900' : 'bg-stone-200'}`}
                      >
                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${lottery.showOnHomepage ? 'left-6' : 'left-1'}`} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-stone-400 uppercase">Stato:</span>
                      <button 
                        onClick={() => saveLottery({ ...lottery, active: !lottery.active })}
                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                          lottery.active ? 'bg-emerald-500 text-white' : 'bg-stone-200 text-stone-500'
                        }`}
                      >
                        {lottery.active ? 'Attiva' : 'Disattivata'}
                      </button>
                    </div>
                    <button 
                      onClick={archiveLottery}
                      className="text-stone-400 hover:text-stone-900 transition-colors"
                      title="Archivia Lotteria Corrente"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4 p-6 bg-stone-50 rounded-2xl border border-stone-200">
                    <h3 className="font-serif text-lg text-stone-900">Configurazione</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Nome Lotteria</label>
                        <input 
                          type="text" 
                          value={lottery.name || ''}
                          onChange={(e) => saveLottery({ ...lottery, name: e.target.value })}
                          placeholder="es. Lotteria di Primavera 2026"
                          className="w-full px-4 py-2 rounded-xl border border-stone-200 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Data Estrazione</label>
                        <input 
                          type="date" 
                          value={lottery.drawDate}
                          onChange={(e) => saveLottery({ ...lottery, drawDate: e.target.value })}
                          className="w-full px-4 py-2 rounded-xl border border-stone-200 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Aggiungi Premio</label>
                        <form 
                          onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            const name = formData.get('prize_name') as string;
                            const newPrize = { id: Date.now(), name, winningNumber: '', collectedBy: '' };
                            saveLottery({ ...lottery, prizes: [...lottery.prizes, newPrize] });
                            e.currentTarget.reset();
                          }}
                          className="flex gap-2"
                        >
                          <input name="prize_name" placeholder="Nome Premio" className="flex-1 px-4 py-2 rounded-xl border border-stone-200 text-sm" required />
                          <button type="submit" className="bg-stone-900 text-white p-2 rounded-xl">
                            <Plus className="w-5 h-5" />
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-serif text-lg text-stone-900">Elenco Premi & Vincitori</h3>
                    <div className="space-y-3">
                      {lottery.prizes.map((prize: any) => (
                        <div key={prize.id} className="p-4 bg-white border border-stone-200 rounded-2xl shadow-sm space-y-3">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <Gift className="w-5 h-5 text-amber-500" />
                              <span className="font-medium text-stone-900">{prize.name}</span>
                            </div>
                            <button 
                              onClick={() => {
                                const updated = lottery.prizes.filter((p: any) => p.id !== prize.id);
                                saveLottery({ ...lottery, prizes: updated });
                              }}
                              className="text-stone-300 hover:text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-stone-400 uppercase">N. Vincente</label>
                              <input 
                                type="text"
                                value={prize.winningNumber}
                                onChange={(e) => {
                                  const updated = lottery.prizes.map((p: any) => p.id === prize.id ? { ...p, winningNumber: e.target.value } : p);
                                  saveLottery({ ...lottery, prizes: updated });
                                }}
                                className="w-full px-3 py-1 rounded-lg border border-stone-100 text-sm font-mono"
                                placeholder="---"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-stone-400 uppercase">Ritirato da</label>
                              <input 
                                type="text"
                                value={prize.collectedBy}
                                onChange={(e) => {
                                  const updated = lottery.prizes.map((p: any) => p.id === prize.id ? { ...p, collectedBy: e.target.value } : p);
                                  saveLottery({ ...lottery, prizes: updated });
                                }}
                                className="w-full px-3 py-1 rounded-lg border border-stone-100 text-sm"
                                placeholder="Nome..."
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      {lottery.prizes.length === 0 && (
                        <p className="text-center text-stone-400 italic py-8">Nessun premio configurato</p>
                      )}
                    </div>
                  </div>
                </div>

                {lottery.history && lottery.history.length > 0 && (
                  <div className="mt-12 pt-12 border-t border-stone-100">
                    <h3 className="font-serif text-lg text-stone-900 mb-6">Archivio Storico Lotterie</h3>
                    <div className="space-y-4">
                      {lottery.history.map((old: any) => (
                        <div key={old.id} className="p-6 bg-stone-50 rounded-2xl border border-stone-200">
                          <div className="flex justify-between items-center mb-4">
                            <div>
                              <p className="font-bold text-stone-900">{old.name || 'Lotteria'}</p>
                              <p className="text-xs text-stone-500">Estrazione del {new Date(old.drawDate).toLocaleDateString('it-IT')}</p>
                              <p className="text-xs text-stone-500">Archiviata il {new Date(old.archivedAt).toLocaleDateString('it-IT')}</p>
                            </div>
                            <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">{old.prizes.length} Premi</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {old.prizes.map((p: any) => (
                              <div key={p.id} className="text-xs p-2 bg-white rounded-lg border border-stone-100">
                                <p className="font-bold text-stone-700">{p.name}</p>
                                <p className="text-stone-500">N. {p.winningNumber || '---'} • {p.collectedBy || 'Non ritirato'}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {isAdmin && activeTab === 'accounts' && (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-serif text-stone-900">Gestione Account</h2>
                </div>

                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const data = Object.fromEntries(formData);
                    addAccount(data);
                    e.currentTarget.reset();
                  }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-stone-50 rounded-2xl border border-stone-200"
                >
                  <input name="username" placeholder="Username" className="px-4 py-2 rounded-xl border border-stone-200 text-sm outline-none" required />
                  <select name="role" className="px-4 py-2 rounded-xl border border-stone-200 text-sm outline-none">
                    <option value="Amministratore">Amministratore</option>
                    <option value="Operatore">Operatore</option>
                  </select>
                  <button type="submit" className="bg-stone-900 text-white px-6 py-2 rounded-xl text-sm font-bold">Aggiungi Account</button>
                </form>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {accounts.map(acc => (
                    <div key={acc.id} className="p-6 border border-stone-200 rounded-3xl bg-stone-50 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-stone-900 text-white rounded-2xl flex items-center justify-center font-bold">
                          {acc.username[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-stone-900">{acc.username}</p>
                          <p className="text-xs text-stone-500">{acc.role} • Ultimo accesso: {acc.lastLogin}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => deleteAccount(acc.id)} className="text-stone-400 hover:text-red-600 transition-colors">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isAdmin && activeTab === 'registrations' && (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-serif text-stone-900">Nuove Iscrizioni</h2>
                </div>
                
                {registrations.length === 0 ? (
                  <div className="py-20 text-center">
                    <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <UserPlus className="w-10 h-10 text-stone-400" />
                    </div>
                    <h3 className="text-xl font-serif text-stone-900 mb-2">Nessuna nuova iscrizione</h3>
                    <p className="text-stone-500 max-w-xs mx-auto">Le richieste di iscrizione online appariranno qui per essere approvate.</p>
                    <button 
                      onClick={() => saveRegistrations([{ id: Date.now(), name: 'Test User', email: 'test@example.com', date: new Date().toISOString() }])}
                      className="mt-4 text-stone-400 text-xs underline"
                    >
                      Genera iscrizione di prova
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {registrations.map((reg: any) => (
                      <div key={reg.id} className="p-6 bg-stone-50 border border-stone-200 rounded-3xl flex items-center justify-between">
                        <div>
                          <p className="font-bold text-stone-900">{reg.name}</p>
                          <p className="text-sm text-stone-500">{reg.email} • {new Date(reg.date).toLocaleDateString('it-IT')}</p>
                        </div>
                        <div className="flex gap-3">
                          <button 
                            onClick={() => approveRegistration(reg)}
                            className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-emerald-600 transition-colors"
                          >
                            Approva
                          </button>
                          <button 
                            onClick={() => deleteRegistration(reg.id)}
                            className="bg-stone-200 text-stone-600 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-stone-300 transition-colors"
                          >
                            Rifiuta
                          </button>
                          <button 
                            onClick={() => {
                              saveRegistrations(registrations.filter((r: any) => r.id !== reg.id));
                            }}
                            className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all border border-red-100"
                          >
                            Cancella
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {isAdmin && activeTab === 'minutes' && (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-serif text-stone-900">Archivio Verbali</h2>
                </div>
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const title = formData.get('title') as string;
                    addMinute({ title });
                    e.currentTarget.reset();
                  }}
                  className="flex gap-4 p-6 bg-stone-50 rounded-2xl border border-stone-200"
                >
                  <input name="title" defaultValue={editingMinute?.title} placeholder="Titolo Verbale / Assemblea" className="flex-1 px-4 py-2 rounded-xl border border-stone-200 text-sm outline-none" required />
                  <button type="submit" className="bg-stone-900 text-white px-6 py-2 rounded-xl text-sm font-bold">
                    {editingMinute ? 'Salva' : 'Carica'}
                  </button>
                  {editingMinute && (
                    <button type="button" onClick={() => setEditingMinute(null)} className="bg-stone-200 text-stone-600 px-6 py-2 rounded-xl text-sm font-bold">
                      Annulla
                    </button>
                  )}
                </form>
                <div className="space-y-3">
                  {minutes.map((m: any) => (
                    <div key={m.id} className="flex items-center justify-between p-4 bg-white border border-stone-200 rounded-2xl">
                      <div className="flex items-center gap-4">
                        <FileText className="w-5 h-5 text-stone-400" />
                        <div>
                          <p className="font-medium text-stone-900">{m.title}</p>
                          <p className="text-xs text-stone-500">{new Date(m.date).toLocaleDateString('it-IT')}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setEditingMinute(m)} className="text-stone-300 hover:text-stone-900">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteMinute(m.id)} className="text-stone-300 hover:text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isAdmin && activeTab === 'appointments' && (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-serif text-stone-900">Agenda Appuntamenti</h2>
                </div>
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const data = Object.fromEntries(formData);
                    addAppointment(data);
                    e.currentTarget.reset();
                  }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-stone-50 rounded-2xl border border-stone-200"
                >
                  <input name="title" defaultValue={editingAppointment?.title} placeholder="Titolo Appuntamento" className="px-4 py-2 rounded-xl border border-stone-200 text-sm outline-none" required />
                  <input name="date" defaultValue={editingAppointment?.date} type="datetime-local" className="px-4 py-2 rounded-xl border border-stone-200 text-sm outline-none" required />
                  <button type="submit" className="bg-stone-900 text-white px-6 py-2 rounded-xl text-sm font-bold">
                    {editingAppointment ? 'Salva' : 'Aggiungi'}
                  </button>
                  {editingAppointment && (
                    <button type="button" onClick={() => setEditingAppointment(null)} className="bg-stone-200 text-stone-600 px-6 py-2 rounded-xl text-sm font-bold">
                      Annulla
                    </button>
                  )}
                </form>
                <div className="space-y-3">
                  {appointments.map((a: any) => (
                    <div key={a.id} className="flex items-center justify-between p-4 bg-white border border-stone-200 rounded-2xl">
                      <div className="flex items-center gap-4">
                        <Calendar className="w-5 h-5 text-stone-400" />
                        <div>
                          <p className="font-medium text-stone-900">{a.title}</p>
                          <p className="text-xs text-stone-500">{new Date(a.date).toLocaleString('it-IT')}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setEditingAppointment(a)} className="text-stone-300 hover:text-stone-900">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteAppointment(a.id)} className="text-stone-300 hover:text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'news' && (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-serif text-stone-900">News & Eventi</h2>
                </div>
                {isAdmin && (
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const data = Object.fromEntries(formData);
                      addNews(data);
                      e.currentTarget.reset();
                    }}
                    className="space-y-4 p-6 bg-stone-50 rounded-2xl border border-stone-200"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input name="title" defaultValue={editingNews?.title} placeholder="Titolo News / Evento" className="px-4 py-2 rounded-xl border border-stone-200 text-sm outline-none" required />
                      <select name="category" defaultValue={editingNews?.category || 'news'} className="px-4 py-2 rounded-xl border border-stone-200 text-sm outline-none">
                        <option value="news">News</option>
                        <option value="evento">Evento</option>
                      </select>
                    </div>
                    <textarea name="content" defaultValue={editingNews?.content} placeholder="Contenuto della news..." className="w-full px-4 py-2 rounded-xl border border-stone-200 text-sm outline-none h-32" required />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative">
                        <ImageIcon className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                        <input name="imageUrl" defaultValue={editingNews?.imageUrl} placeholder="URL Immagine" className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 text-sm outline-none" />
                      </div>
                      <div className="relative">
                        <Video className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                        <input name="videoUrl" defaultValue={editingNews?.videoUrl} placeholder="URL Video (YouTube/Vimeo)" className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 text-sm outline-none" />
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <button type="submit" className="bg-stone-900 text-white px-8 py-2 rounded-xl text-sm font-bold">
                        {editingNews ? 'Salva Modifiche' : 'Pubblica News'}
                      </button>
                      {editingNews && (
                        <button type="button" onClick={() => setEditingNews(null)} className="bg-stone-200 text-stone-600 px-8 py-2 rounded-xl text-sm font-bold">
                          Annulla
                        </button>
                      )}
                    </div>
                  </form>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {news.length === 0 && (
                    <div className="col-span-full py-12 text-center bg-stone-50 rounded-3xl border border-dashed border-stone-300">
                      <Newspaper className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                      <p className="text-stone-500">Nessuna news o evento pubblicato.</p>
                    </div>
                  )}
                  {news.map((n: any) => (
                    <div key={n.id} className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm group">
                      {n.imageUrl && (
                        <div className="h-48 overflow-hidden">
                          <img src={n.imageUrl} alt={n.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                        </div>
                      )}
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-2">
                          <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${
                            n.category === 'evento' ? 'bg-amber-100 text-amber-700' : 'bg-stone-100 text-stone-700'
                          }`}>
                            {n.category}
                          </span>
                          <span className="text-[10px] text-stone-400 font-bold uppercase">{new Date(n.date).toLocaleDateString('it-IT')}</span>
                        </div>
                        <h3 className="font-serif text-lg text-stone-900 mb-2">{n.title}</h3>
                        <p className="text-sm text-stone-500 line-clamp-2 mb-4">{n.content}</p>
                        {isAdmin && (
                          <div className="flex justify-end gap-2">
                            <button onClick={() => setEditingNews(n)} className="p-2 text-stone-400 hover:text-stone-900 bg-stone-100 rounded-lg transition-colors" title="Modifica">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => deleteNews(n.id)} className="p-2 text-red-400 hover:text-white hover:bg-red-500 bg-red-50 border border-red-100 rounded-lg transition-all" title="Elimina Definitivamente">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'gallery' && (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-serif text-stone-900">Foto & Video Gallery</h2>
                </div>

                {isAdmin && (
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const data = Object.fromEntries(formData);
                      addGalleryItem(data);
                      e.currentTarget.reset();
                    }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-stone-50 rounded-2xl border border-stone-200"
                  >
                    <input name="url" placeholder="URL Immagine o Video" className="px-4 py-2 rounded-xl border border-stone-200 text-sm outline-none md:col-span-2" required />
                    <select name="type" className="px-4 py-2 rounded-xl border border-stone-200 text-sm outline-none">
                      <option value="image">Immagine</option>
                      <option value="video">Video</option>
                    </select>
                    <button type="submit" className="md:col-span-3 bg-stone-900 text-white py-3 rounded-xl text-sm font-bold hover:bg-stone-800 transition-colors">
                      Aggiungi alla Gallery
                    </button>
                  </form>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {gallery.map((item: any) => (
                    <div key={item.id} className="relative aspect-square rounded-2xl overflow-hidden group">
                      <img src={item.url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        {item.type === 'video' && <Video className="w-6 h-6 text-white" />}
                        {isAdmin && (
                          <button 
                            onClick={() => deleteGalleryItem(item.id)}
                            className="p-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all shadow-lg flex items-center gap-2"
                            title="Elimina Definitivamente"
                          >
                            <Trash2 className="w-5 h-5" />
                            <span className="text-xs font-bold uppercase">Elimina</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {gallery.length === 0 && (
                    <div className="col-span-full py-20 text-center border-2 border-dashed border-stone-200 rounded-3xl">
                      <ImageIcon className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                      <p className="text-stone-400">La gallery è vuota.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {isAdmin && activeTab === 'poll' && (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-serif text-stone-900">Gestione Sondaggio</h2>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-stone-400 uppercase">Visibile in Home:</span>
                      <button 
                        onClick={() => savePoll({ ...poll, showOnHomepage: !poll.showOnHomepage })}
                        className={`w-10 h-5 rounded-full transition-colors relative ${poll.showOnHomepage ? 'bg-stone-900' : 'bg-stone-200'}`}
                      >
                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${poll.showOnHomepage ? 'left-6' : 'left-1'}`} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-stone-400 uppercase">Stato:</span>
                      <button 
                        onClick={() => savePoll({ ...poll, active: !poll.active })}
                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                          poll.active ? 'bg-emerald-500 text-white' : 'bg-stone-200 text-stone-500'
                        }`}
                      >
                        {poll.active ? 'Attivo' : 'Disattivato'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="p-8 bg-stone-50 rounded-3xl border border-stone-200">
                      <h3 className="font-serif text-lg text-stone-900 mb-6">Configurazione Domanda</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-stone-500 uppercase mb-2 ml-1">Testo della Domanda</label>
                          <textarea 
                            value={poll.question}
                            onChange={(e) => savePoll({ ...poll, question: e.target.value })}
                            placeholder="Cosa ne pensi delle nuove attività dell'associazione?"
                            className="w-full px-4 py-3 rounded-2xl border border-stone-200 text-sm focus:ring-2 focus:ring-stone-900 outline-none transition-all h-24"
                          />
                        </div>
                        
                        <div className="space-y-4">
                          <label className="block text-xs font-bold text-stone-500 uppercase mb-2 ml-1">Opzioni di Risposta</label>
                          {poll.options.map((option: any) => (
                            <div key={option.id} className="flex gap-2">
                              <input 
                                type="text"
                                value={option.text}
                                onChange={(e) => {
                                  const updated = poll.options.map((o: any) => o.id === option.id ? { ...o, text: e.target.value } : o);
                                  savePoll({ ...poll, options: updated });
                                }}
                                className="flex-1 px-4 py-2 rounded-xl border border-stone-200 text-sm"
                              />
                              <button 
                                onClick={() => {
                                  const updated = poll.options.filter((o: any) => o.id !== option.id);
                                  savePoll({ ...poll, options: updated });
                                }}
                                className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-colors"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          ))}
                          <form 
                            onSubmit={(e) => {
                              e.preventDefault();
                              const formData = new FormData(e.currentTarget);
                              const text = formData.get('option_text') as string;
                              const newOption = { id: Date.now(), text };
                              savePoll({ ...poll, options: [...poll.options, newOption] });
                              e.currentTarget.reset();
                            }}
                            className="flex gap-2"
                          >
                            <input name="option_text" placeholder="Aggiungi opzione..." className="flex-1 px-4 py-2 rounded-xl border border-stone-200 text-sm" required />
                            <button type="submit" className="bg-stone-900 text-white px-4 py-2 rounded-xl text-sm font-bold">
                              Aggiungi
                            </button>
                          </form>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="p-8 bg-stone-900 rounded-3xl text-white">
                      <h3 className="font-serif text-lg mb-6">Risultati in tempo reale</h3>
                      <div className="space-y-6">
                        {poll.options.map((option: any) => {
                          const optionVotes = poll.votes?.filter((v: any) => v.optionId === option.id).length || 0;
                          const totalVotes = poll.votes?.length || 0;
                          const percentage = totalVotes > 0 ? Math.round((optionVotes / totalVotes) * 100) : 0;
                          
                          return (
                            <div key={option.id} className="space-y-2">
                              <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                                <span className="text-stone-400">{option.text}</span>
                                <span>{percentage}%</span>
                              </div>
                              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${percentage}%` }}
                                  className="h-full bg-white"
                                />
                              </div>
                              <p className="text-[10px] text-stone-500">{optionVotes} voti</p>
                            </div>
                          );
                        })}
                        {poll.options.length === 0 && (
                          <p className="text-stone-500 text-sm italic text-center py-4">Nessuna opzione configurata</p>
                        )}
                      </div>
                      <div className="mt-8 pt-8 border-t border-white/10">
                        <p className="text-xs text-stone-400">Totale votanti: <span className="text-white font-bold">{poll.votes?.length || 0}</span></p>
                      </div>
                    </div>

                    <div className="p-6 bg-white border border-stone-200 rounded-3xl shadow-sm">
                      <h3 className="font-serif text-lg text-stone-900 mb-4">Dettaglio Votanti</h3>
                      <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                        {poll.votes?.map((vote: any, idx: number) => (
                          <div key={idx} className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                            <p className="text-xs font-bold text-stone-900 truncate">{vote.email}</p>
                            <p className="text-[10px] text-stone-500">{vote.phone}</p>
                            <p className="text-[10px] text-stone-400 mt-1">{new Date(vote.date).toLocaleString('it-IT')}</p>
                          </div>
                        ))}
                        {(!poll.votes || poll.votes.length === 0) && (
                          <p className="text-stone-400 text-xs italic text-center py-4">Nessun voto registrato</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
