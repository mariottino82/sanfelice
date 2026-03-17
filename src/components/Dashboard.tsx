import React from 'react';
import { motion } from 'motion/react';
import { Users, FileText, Calendar, Euro, Plus, TrendingUp, LogOut, Shield, UserPlus, Settings, UserCheck, Trash2, Edit2, Ticket, Gift, CheckCircle2, Newspaper, Facebook, Instagram, Youtube, Share2, Image as ImageIcon, Video, Vote, Menu, X } from 'lucide-react';

export function Dashboard({ user, onLogout }: { user: any, onLogout: () => void }) {
  const isSuperAdmin = user?.role === 'Amministratore' || user?.role === 'Presidente';
  const isOperator = user?.role === 'Operatore';
  const isStaff = isSuperAdmin || isOperator;
  const isMember = user?.role === 'Socio';
  
  const [activeTab, setActiveTab] = React.useState(isStaff ? (isSuperAdmin ? 'members' : 'appointments') : 'member-home');
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [members, setMembers] = React.useState([]);
  const [collections, setCollections] = React.useState([]);
  const [news, setNews] = React.useState([]);
  const [polls, setPolls] = React.useState([]);
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

  const createNewPoll = () => {
    setPoll({
      active: false,
      showOnHomepage: false,
      question: '',
      options: [],
      votes: []
    });
  };

  const selectPoll = (p: any) => {
    setPoll(p);
  };
  const [accounts, setAccounts] = React.useState([
    { id: 1, username: 'admin', role: 'Amministratore', lastLogin: '2026-03-15' }
  ]);
  const [socialLinks, setSocialLinks] = React.useState({
    facebook: '',
    instagram: '',
    youtube: '',
    twitter: ''
  });

  const [editingMember, setEditingMember] = React.useState<any>(null);
  const [editingCollection, setEditingCollection] = React.useState<any>(null);
  const [editingMinute, setEditingMinute] = React.useState<any>(null);
  const [editingAppointment, setEditingAppointment] = React.useState<any>(null);
  const [editingNews, setEditingNews] = React.useState<any>(null);

  const [minutes, setMinutes] = React.useState([]);
  const [appointments, setAppointments] = React.useState([]);
  const [registrations, setRegistrations] = React.useState([]);
  const [gallery, setGallery] = React.useState([]);
  const [selectedRegistration, setSelectedRegistration] = React.useState<any>(null);
  const [showEmailConfirmation, setShowEmailConfirmation] = React.useState<any>(null);
  const [membershipFees, setMembershipFees] = React.useState<Record<number, number>>({ 2024: 100, 2025: 100, 2026: 100 });
  const [showFeeSettings, setShowFeeSettings] = React.useState(false);

  React.useEffect(() => {
    const fetchData = async () => {
      const endpoints = [
        { key: 'members', url: '/api/members', setter: setMembers },
        { key: 'finances', url: '/api/finances', setter: setCollections },
        { key: 'lottery', url: '/api/lottery', setter: setLottery },
        { key: 'polls', url: '/api/polls', setter: setPolls },
        { key: 'minutes', url: '/api/minutes', setter: setMinutes },
        { key: 'appointments', url: '/api/appointments', setter: setAppointments },
        { key: 'registrations', url: '/api/registrations', setter: setRegistrations },
        { key: 'news', url: '/api/news', setter: setNews },
        { key: 'gallery', url: '/api/gallery', setter: setGallery },
        { key: 'users', url: '/api/users', setter: setAccounts },
        { key: 'social_links', url: '/api/settings/social_links', setter: (data: any) => data?.value && setSocialLinks(data.value) },
        { key: 'membership_fees', url: '/api/settings/membership_fees', setter: (data: any) => data?.value && setMembershipFees(data.value) }
      ];

      for (const endpoint of endpoints) {
        try {
          const res = await fetch(endpoint.url);
          if (res.ok) {
            const data = await res.json();
            endpoint.setter(data);
            
            // Special handling for polls to set the active one
            if (endpoint.key === 'polls' && data.length > 0) {
              const activePoll = data.find((p: any) => p.active) || data[0];
              setPoll(activePoll);
            }
          } else {
            console.error(`Failed to fetch ${endpoint.key}: ${res.status}`);
          }
        } catch (error) {
          console.error(`Error fetching ${endpoint.key}:`, error);
        }
      }
    };

    fetchData();
  }, []);

  const totalCollected = collections.reduce((acc, curr: any) => acc + curr.amount, 0);

  // Find current member data if not admin
  const currentMember = isMember ? members.find((m: any) => m.email === user?.email) : null;
  const isFeePaid = currentMember?.payments?.[2026];

  const lastMinutes = [...minutes].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  const upcomingAppointments = [...appointments].sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const togglePayment = async (memberId: number, year: number) => {
    const member = members.find((m: any) => m.id === memberId);
    if (!member) return;

    const updatedPayments = {
      ...(member.payments || {}),
      [year]: !member.payments?.[year]
    };

    try {
      await fetch(`/api/members/${memberId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...member, payments: updatedPayments })
      });
      setMembers(members.map((m: any) => m.id === memberId ? { ...m, payments: updatedPayments } : m));
    } catch (error) {
      console.error('Error toggling payment:', error);
    }
  };

  const archiveLottery = async () => {
    if (!lottery.active) return;
    
    const newHistoryItem = {
      id: Date.now(),
      name: lottery.name,
      drawDate: lottery.drawDate,
      prizes: lottery.prizes,
      archivedAt: new Date().toISOString()
    };

    const updatedLottery = {
      ...lottery,
      active: false,
      showOnHomepage: false,
      history: [newHistoryItem, ...(lottery.history || [])],
      prizes: lottery.prizes.map((p: any) => ({ ...p, winningNumber: '', collectedBy: '' }))
    };

    await saveLottery(updatedLottery);
    alert('Lotteria archiviata con successo!');
  };

  const deleteHistoryItem = async (historyId: number) => {
    if (!confirm('Sei sicuro di voler eliminare questa lotteria dall\'archivio?')) return;
    
    const updatedLottery = {
      ...lottery,
      history: lottery.history.filter((h: any) => h.id !== historyId)
    };

    await saveLottery(updatedLottery);
  };

  const saveSocialLinks = async (links: any) => {
    try {
      const res = await fetch('/api/settings/social_links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: links })
      });
      if (res.ok) {
        setSocialLinks(links);
        alert('Link social aggiornati con successo!');
      }
    } catch (err) {
      console.error(err);
      alert('Errore durante il salvataggio dei link social.');
    }
  };

  const handleVote = async (pollId: number, optionIndex: number) => {
    if (!pollId) return;
    try {
      const response = await fetch(`/api/polls/${pollId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          optionIndex,
          email: user?.email,
          phone: currentMember?.phone || ''
        })
      });
      if (response.ok) {
        // Refresh poll data
        const pollRes = await fetch('/api/polls');
        const pollData = await pollRes.json();
        setPolls(pollData);
        
        // If the voted poll is the one currently being viewed/edited, update it too
        if (poll?.id === pollId) {
          const updatedPoll = pollData.find((p: any) => p.id === pollId);
          setPoll(updatedPoll);
        }
        alert('Voto registrato con successo!');
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert('Errore durante la votazione: ' + (errorData.error || 'Errore sconosciuto'));
      }
    } catch (error) {
      console.error('Error voting:', error);
      alert('Errore durante la votazione.');
    }
  };

  const addAccount = async (newAcc: any) => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAcc)
      });
      const data = await response.json();
      setAccounts([...accounts, { ...newAcc, id: data.id, lastLogin: 'Mai' }]);
    } catch (error) {
      console.error('Error adding account:', error);
    }
  };

  const deleteAccount = async (id: number) => {
    try {
      await fetch(`/api/users/${id}`, { method: 'DELETE' });
      setAccounts(accounts.filter((a: any) => a.id !== id));
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  const addMinute = async (newMinute: any) => {
    try {
      if (editingMinute) {
        // Update not implemented in API yet, but we can just re-post or add a PUT
        // For now, let's just add a new one or handle it
      } else {
        const response = await fetch('/api/minutes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newMinute)
        });
        const data = await response.json();
        setMinutes([...minutes, { ...newMinute, id: data.id, date: newMinute.date || new Date().toISOString() }]);
      }
      setEditingMinute(null);
    } catch (error) {
      console.error('Error adding minute:', error);
    }
  };

  const deleteMinute = async (id: number) => {
    try {
      await fetch(`/api/minutes/${id}`, { method: 'DELETE' });
      setMinutes(minutes.filter((m: any) => m.id !== id));
    } catch (error) {
      console.error('Error deleting minute:', error);
    }
  };

  const addAppointment = async (newApp: any) => {
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newApp)
      });
      const data = await response.json();
      setAppointments([...appointments, { ...newApp, id: data.id }]);
      setEditingAppointment(null);
    } catch (error) {
      console.error('Error adding appointment:', error);
    }
  };

  const deleteAppointment = async (id: number) => {
    try {
      await fetch(`/api/appointments/${id}`, { method: 'DELETE' });
      setAppointments(appointments.filter((a: any) => a.id !== id));
    } catch (error) {
      console.error('Error deleting appointment:', error);
    }
  };

  const addMember = async (newMember: any) => {
    try {
      if (editingMember) {
        await fetch(`/api/members/${editingMember.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newMember)
        });
        setMembers(members.map((m: any) => m.id === editingMember.id ? { ...m, ...newMember } : m));
        setEditingMember(null);
      } else {
        const response = await fetch('/api/members', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newMember)
        });
        const data = await response.json();
        setMembers([...members, { ...newMember, id: data.id, status: 'attivo' }]);
      }
    } catch (error) {
      console.error('Error adding member:', error);
    }
  };

  const deleteMember = async (id: number) => {
    try {
      await fetch(`/api/members/${id}`, { method: 'DELETE' });
      setMembers(members.filter((m: any) => m.id !== id));
    } catch (error) {
      console.error('Error deleting member:', error);
    }
  };

  const addCollection = async (newCollection: any) => {
    try {
      const response = await fetch('/api/finances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newCollection, amount: parseFloat(newCollection.amount) })
      });
      const data = await response.json();
      setCollections([...collections, { ...newCollection, id: data.id, amount: parseFloat(newCollection.amount) }]);
      setEditingCollection(null);
    } catch (error) {
      console.error('Error adding collection:', error);
    }
  };

  const deleteCollection = async (id: number) => {
    try {
      await fetch(`/api/finances/${id}`, { method: 'DELETE' });
      setCollections(collections.filter((c: any) => c.id !== id));
    } catch (error) {
      console.error('Error deleting collection:', error);
    }
  };

  const approveRegistration = async (reg: any) => {
    try {
      // Add as member
      const memberRes = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: reg.name, 
          email: reg.email, 
          role: 'Socio',
          password: reg.password // Pass the password from registration
        })
      });
      const memberData = await memberRes.json();
      
      // Delete registration
      await fetch(`/api/registrations/${reg.id}`, { method: 'DELETE' });
      
      setMembers([...members, { id: memberData.id, name: reg.name, email: reg.email, role: 'Socio', status: 'attivo' }]);
      setRegistrations(registrations.filter((r: any) => r.id !== reg.id));
      setShowEmailConfirmation(reg);
    } catch (error) {
      console.error('Error approving registration:', error);
    }
  };

  const deleteRegistration = async (id: number) => {
    try {
      await fetch(`/api/registrations/${id}`, { method: 'DELETE' });
      setRegistrations(registrations.filter((r: any) => r.id !== id));
    } catch (error) {
      console.error('Error deleting registration:', error);
    }
  };

  const addNews = async (newNews: any) => {
    try {
      const response = await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNews)
      });
      const data = await response.json();
      setNews([...news, { ...newNews, id: data.id, date: new Date().toISOString() }]);
      setEditingNews(null);
      alert('News/Evento pubblicato con successo!');
    } catch (error) {
      console.error('Error adding news:', error);
    }
  };

  const deleteNews = async (id: number) => {
    try {
      await fetch(`/api/news/${id}`, { method: 'DELETE' });
      setNews(news.filter((n: any) => n.id !== id));
    } catch (error) {
      console.error('Error deleting news:', error);
    }
  };

  const addGalleryItem = async (item: any) => {
    try {
      const response = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      const data = await response.json();
      setGallery([...gallery, { ...item, id: data.id }]);
      alert('Elemento aggiunto alla gallery!');
    } catch (error) {
      console.error('Error adding gallery item:', error);
    }
  };

  const deleteGalleryItem = async (id: number) => {
    try {
      await fetch(`/api/gallery/${id}`, { method: 'DELETE' });
      setGallery(gallery.filter((item: any) => item.id !== id));
    } catch (error) {
      console.error('Error deleting gallery item:', error);
    }
  };

  const saveLottery = async (updated: any) => {
    try {
      await fetch('/api/lottery', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      setLottery(updated);
    } catch (error) {
      console.error('Error saving lottery:', error);
    }
  };

  const deletePoll = async (id: number) => {
    if (!confirm('Sei sicuro di voler eliminare questo sondaggio?')) return;
    try {
      await fetch(`/api/polls/${id}`, { method: 'DELETE' });
      setPolls(polls.filter((p: any) => p.id !== id));
      if (poll?.id === id) {
        createNewPoll();
      }
    } catch (error) {
      console.error('Error deleting poll:', error);
    }
  };

  const savePoll = async (updated: any) => {
    try {
      if (updated.id) {
        const response = await fetch(`/api/polls/${updated.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated)
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Errore durante il salvataggio');
        }
        setPolls(polls.map((p: any) => p.id === updated.id ? { ...p, ...updated } : p));
      } else {
        const response = await fetch('/api/polls', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated)
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Errore durante la creazione');
        }
        const data = await response.json();
        const newPoll = { ...updated, id: data.id };
        setPolls([newPoll, ...polls]);
        setPoll(newPoll);
      }
      return true;
    } catch (error: any) {
      console.error('Error saving poll:', error);
      throw error;
    }
  };

  const closeYear = async () => {
    const total = collections.reduce((acc, curr: any) => acc + curr.amount, 0);
    const newCollection = {
      event_name: `Rimanenza Fondo Cassa Anno Precedente`,
      type: 'rimanenza',
      amount: total,
      date: new Date().toISOString()
    };
    
    try {
      // Clear current finances and add the balance
      // This is a bit complex with current API, maybe just add the balance
      await addCollection(newCollection);
      alert('Anno chiuso. Il saldo è stato riportato come rimanenza.');
    } catch (error) {
      console.error('Error closing year:', error);
    }
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
          {isStaff ? (
            <>
              {[
                { id: 'members', label: 'Soci & Cariche', icon: Users, minRole: 'SuperAdmin' },
                { id: 'registrations', label: 'Iscrizioni', icon: UserPlus, minRole: 'SuperAdmin', badge: registrations.length > 0 ? registrations.length : null },
                { id: 'finances', label: 'Contabilità', icon: Euro, minRole: 'SuperAdmin' },
                { id: 'lottery', label: 'Lotteria', icon: Ticket, minRole: 'Operator' },
                { id: 'minutes', label: 'Verbali', icon: FileText, minRole: 'Operator' },
                { id: 'appointments', label: 'Agenda', icon: Calendar, minRole: 'Operator' },
                { id: 'news', label: 'News & Eventi', icon: Newspaper, minRole: 'Operator' },
                { id: 'poll', label: 'Sondaggi', icon: Vote, minRole: 'Operator' },
                { id: 'gallery', label: 'Foto & Video', icon: ImageIcon, minRole: 'Operator' },
                { id: 'accounts', label: 'Account & Sicurezza', icon: Shield, minRole: 'SuperAdmin' },
              ].filter(tab => {
                if (isSuperAdmin) return true;
                if (isOperator && tab.minRole === 'Operator') return true;
                return false;
              }).map((tab: any) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-white text-stone-900 shadow-lg'
                      : 'hover:bg-stone-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <tab.icon className="w-5 h-5" />
                    {tab.label}
                  </div>
                  {tab.badge && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {tab.badge}
                    </span>
                  )}
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

        <div className="px-4 py-4 border-t border-stone-800">
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
              {isStaff ? 'Pannello di controllo amministrativo' : `Profilo ${user?.role}`}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-bold text-stone-900">{user?.username}</p>
              <p className="text-xs text-stone-500">{user?.email || 'admin@prosanfelice.it'}</p>
            </div>
            <div className="w-10 h-10 bg-stone-200 rounded-full flex items-center justify-center">
              <Shield className={`w-5 h-5 ${isStaff ? 'text-amber-600' : 'text-stone-600'}`} />
            </div>
          </div>
        </header>

        {/* Member View Home */}
        {isMember && activeTab === 'member-home' && (
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
                  <p className="text-sm">Ti ricordiamo di regolarizzare la tua quota associativa di € {membershipFees[2026] || 100} per l'anno in corso.</p>
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
                  <p className="text-sm">Grazie per il tuo sostegno! La tua iscrizione di € {membershipFees[2026] || 100} è attiva per tutto l'anno 2026.</p>
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

              {/* Sondaggi per i Soci */}
              <div className="bg-stone-900 p-8 rounded-3xl shadow-sm text-white md:col-span-2">
                <div className="flex items-center gap-3 text-stone-400 mb-8">
                  <Vote className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-widest">Sondaggi Associazione</span>
                </div>
                
                <div className="space-y-12">
                  {polls.length > 0 ? polls.map((p: any) => {
                    const isExpired = p.endDate ? new Date() > new Date(p.endDate) : false;
                    const hasVoted = p.votes?.some((v: any) => v.email === user?.email);
                    const showResults = isExpired || hasVoted;

                    return (
                      <div key={p.id} className="space-y-6 pb-8 border-b border-white/5 last:border-0 last:pb-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-xl font-serif mb-2">{p.question}</h4>
                            <div className="flex items-center gap-3">
                              {isExpired ? (
                                <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-widest rounded">Terminato</span>
                              ) : (
                                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest rounded">Attivo</span>
                              )}
                              {p.endDate && (
                                <span className="text-[10px] text-stone-500 uppercase tracking-widest">Scadenza: {new Date(p.endDate).toLocaleDateString('it-IT')}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-6">
                            {p.options.map((option: any, idx: number) => {
                              const optionVotes = p.votes?.filter((v: any) => v.optionId === option.id).length || 0;
                              const totalVotes = p.votes?.length || 0;
                              const percentage = totalVotes > 0 ? Math.round((optionVotes / totalVotes) * 100) : 0;
                              
                              if (showResults) {
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
                                  </div>
                                );
                              }

                              return (
                                <button
                                  key={option.id}
                                  onClick={() => handleVote(p.id, idx)}
                                  className="w-full text-left p-4 rounded-2xl border border-white/10 hover:bg-white/5 hover:border-white/30 transition-all group"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-stone-300 group-hover:text-white transition-colors">{option.text}</span>
                                    <div className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center group-hover:border-white/50 transition-colors">
                                      <div className="w-2 h-2 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>

                          <div className="bg-white/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center border border-white/10">
                            <div className="text-4xl font-serif mb-2">
                              {isExpired ? 'CHIUSO' : (p.votes?.length || 0)}
                            </div>
                            <p className="text-stone-400 text-xs uppercase tracking-widest font-bold">
                              {isExpired ? 'Sondaggio Terminato' : 'Voti Totali'}
                            </p>
                            <div className="mt-6 w-12 h-1 bg-stone-700 rounded-full" />
                            <p className="mt-4 text-[10px] text-stone-500 leading-relaxed">
                              {isExpired 
                                ? 'Le votazioni per questo sondaggio sono terminate.'
                                : showResults
                                  ? 'I risultati sono aggiornati in tempo reale.'
                                  : 'Vota per vedere i risultati in tempo reale.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  }) : (
                    <div className="text-center py-12">
                      <p className="text-stone-500 italic">Nessun sondaggio disponibile.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Overview */}
        {isSuperAdmin && (activeTab === 'members' || activeTab === 'finances') && (
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
            {isSuperAdmin && activeTab === 'members' && (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <h2 className="text-xl font-serif text-stone-900">Elenco Soci e Cariche</h2>
                    <button 
                      onClick={() => setShowFeeSettings(true)}
                      className="p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-all"
                      title="Imposta Quote Associative"
                    >
                      <Settings className="w-5 h-5" />
                    </button>
                  </div>
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

            {isSuperAdmin && activeTab === 'finances' && (
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

            {isStaff && activeTab === 'lottery' && (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-serif text-stone-900">Gestione Lotteria</h2>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-stone-400 uppercase">Visibile in Home:</span>
                      <button 
                        onClick={() => setLottery({ ...lottery, showOnHomepage: !lottery.showOnHomepage })}
                        className={`w-10 h-5 rounded-full transition-colors relative ${lottery.showOnHomepage ? 'bg-stone-900' : 'bg-stone-200'}`}
                      >
                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${lottery.showOnHomepage ? 'left-6' : 'left-1'}`} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-stone-400 uppercase">Stato:</span>
                      <button 
                        onClick={() => setLottery({ ...lottery, active: !lottery.active })}
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
                          onChange={(e) => setLottery({ ...lottery, name: e.target.value })}
                          placeholder="es. Lotteria di Primavera 2026"
                          className="w-full px-4 py-2 rounded-xl border border-stone-200 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Data Estrazione</label>
                        <input 
                          type="date" 
                          value={lottery.drawDate}
                          onChange={(e) => setLottery({ ...lottery, drawDate: e.target.value })}
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
                            setLottery({ ...lottery, prizes: [...lottery.prizes, newPrize] });
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

                      <div className="pt-4 border-t border-stone-100 flex justify-end">
                        <button 
                          onClick={() => {
                            saveLottery(lottery);
                            alert('Lotteria salvata con successo!');
                          }}
                          className="bg-stone-900 text-white px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:shadow-lg transition-all active:scale-95"
                        >
                          Salva Configurazione
                        </button>
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
                                setLottery({ ...lottery, prizes: updated });
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
                                  setLottery({ ...lottery, prizes: updated });
                                }}
                                className="w-full px-3 py-1 rounded-lg border border-stone-100 text-sm font-mono"
                                placeholder="---"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-stone-400 uppercase flex items-center gap-1">
                                Ritirato da <span className="text-[8px] lowercase font-normal">(solo interno)</span>
                              </label>
                              <input 
                                type="text"
                                value={prize.collectedBy}
                                onChange={(e) => {
                                  const updated = lottery.prizes.map((p: any) => p.id === prize.id ? { ...p, collectedBy: e.target.value } : p);
                                  setLottery({ ...lottery, prizes: updated });
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
                      
                      {lottery.drawDate && new Date(lottery.drawDate) <= new Date() && lottery.prizes.length > 0 && (
                        <button 
                          onClick={() => {
                            saveLottery(lottery);
                            alert('Risultati dell\'estrazione pubblicati con successo sulla homepage!');
                          }}
                          className="w-full mt-4 bg-emerald-500 text-white py-3 rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Pubblica Risultati Estrazione
                        </button>
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
                            <div className="flex items-center gap-4">
                              <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">{old.prizes.length} Premi</span>
                              <button
                                onClick={() => deleteHistoryItem(old.id)}
                                className="p-2 text-stone-400 hover:text-red-500 transition-colors"
                                title="Elimina dall'archivio"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
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

            {isSuperAdmin && activeTab === 'accounts' && (
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
                  className="grid grid-cols-1 md:grid-cols-5 gap-4 p-6 bg-stone-50 rounded-2xl border border-stone-200"
                >
                  <input name="username" placeholder="Username" className="px-4 py-2 rounded-xl border border-stone-200 text-sm outline-none" required />
                  <input name="email" type="email" placeholder="Email (per Soci)" className="px-4 py-2 rounded-xl border border-stone-200 text-sm outline-none" />
                  <input name="password" type="password" placeholder="Password" className="px-4 py-2 rounded-xl border border-stone-200 text-sm outline-none" required />
                  <select name="role" className="px-4 py-2 rounded-xl border border-stone-200 text-sm outline-none">
                    <option value="Amministratore">Amministratore</option>
                    <option value="Operatore">Operatore</option>
                    <option value="Socio">Socio</option>
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
                          <p className="text-xs text-stone-500">{acc.email || 'Nessuna email'}</p>
                          <p className="text-[10px] text-stone-400 font-bold uppercase mt-1">{acc.role} • Accesso: {acc.lastLogin || 'Mai'}</p>
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

                <div className="mt-12 p-8 bg-white border border-stone-200 rounded-[2rem] shadow-sm">
                  <h3 className="text-lg font-serif text-stone-900 mb-6 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    Gestione Logo Associazione
                  </h3>
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="w-32 h-32 bg-stone-50 rounded-2xl border border-stone-100 flex items-center justify-center overflow-hidden">
                      <img 
                        src={`/logo.png?t=${Date.now()}`} 
                        alt="Logo Attuale" 
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=No+Logo';
                        }}
                      />
                    </div>
                    <div className="flex-1 space-y-4">
                      <p className="text-sm text-stone-500">
                        Carica un nuovo logo per l'associazione. Il file deve essere in formato <strong>PNG</strong> e verrà rinominato automaticamente in <code>logo.png</code>.
                      </p>
                      <div className="flex gap-4">
                        <input 
                          type="file" 
                          id="logo-upload" 
                          accept="image/png" 
                          className="hidden" 
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            
                            const formData = new FormData();
                            formData.append('logo', file);
                            
                            try {
                              const res = await fetch('/api/upload-logo', {
                                method: 'POST',
                                body: formData
                              });
                              if (res.ok) {
                                alert('Logo aggiornato con successo! Ricarica la pagina per vedere le modifiche ovunque.');
                                window.location.reload();
                              } else {
                                alert('Errore durante il caricamento del logo.');
                              }
                            } catch (err) {
                              console.error(err);
                              alert('Errore di rete.');
                            }
                          }}
                        />
                        <label 
                          htmlFor="logo-upload"
                          className="bg-stone-900 text-white px-6 py-3 rounded-xl text-sm font-bold cursor-pointer hover:bg-stone-800 transition-colors inline-flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Seleziona Nuovo Logo
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-12 p-8 bg-white border border-stone-200 rounded-[2rem] shadow-sm">
                  <h3 className="text-lg font-serif text-stone-900 mb-6 flex items-center gap-2">
                    <Share2 className="w-5 h-5" />
                    Gestione Link Social
                  </h3>
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const links = Object.fromEntries(formData);
                      saveSocialLinks(links);
                    }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">Facebook</label>
                      <div className="relative">
                        <Facebook className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                        <input 
                          name="facebook" 
                          defaultValue={socialLinks.facebook} 
                          placeholder="https://facebook.com/..." 
                          className="w-full pl-12 pr-4 py-3 rounded-xl border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-stone-900 transition-all" 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">Instagram</label>
                      <div className="relative">
                        <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                        <input 
                          name="instagram" 
                          defaultValue={socialLinks.instagram} 
                          placeholder="https://instagram.com/..." 
                          className="w-full pl-12 pr-4 py-3 rounded-xl border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-stone-900 transition-all" 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">YouTube</label>
                      <div className="relative">
                        <Youtube className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                        <input 
                          name="youtube" 
                          defaultValue={socialLinks.youtube} 
                          placeholder="https://youtube.com/..." 
                          className="w-full pl-12 pr-4 py-3 rounded-xl border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-stone-900 transition-all" 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">Twitter / X</label>
                      <div className="relative">
                        <Share2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                        <input 
                          name="twitter" 
                          defaultValue={socialLinks.twitter} 
                          placeholder="https://twitter.com/..." 
                          className="w-full pl-12 pr-4 py-3 rounded-xl border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-stone-900 transition-all" 
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2 pt-4">
                      <button type="submit" className="bg-stone-900 text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-stone-800 transition-colors">
                        Salva Link Social
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {isSuperAdmin && activeTab === 'registrations' && (
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
                  </div>
                ) : (
                  <div className="space-y-4">
                    {registrations.map((reg: any) => (
                      <div 
                        key={reg.id} 
                        onClick={() => setSelectedRegistration(reg)}
                        className="p-6 bg-stone-50 border border-stone-200 rounded-3xl flex items-center justify-between cursor-pointer hover:bg-stone-100 transition-colors group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                            <UserPlus className="w-6 h-6 text-stone-900" />
                          </div>
                          <div>
                            <p className="font-bold text-stone-900">{reg.name}</p>
                            <p className="text-sm text-stone-500">{reg.email} • {new Date(reg.date).toLocaleDateString('it-IT')}</p>
                          </div>
                        </div>
                        <div className="flex gap-3" onClick={(e) => e.stopPropagation()}>
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
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Registration Detail Modal */}
                {selectedRegistration && (
                  <div className="fixed inset-0 z-[100] overflow-y-auto p-4 md:p-8">
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedRegistration(null)} />
                    <div className="flex min-h-full items-center justify-center">
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="relative bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl max-w-lg w-full"
                      >
                        <button 
                          onClick={() => setSelectedRegistration(null)}
                          className="absolute top-4 right-4 md:top-6 md:right-6 text-stone-400 hover:text-stone-900 transition-colors p-2 hover:bg-stone-100 rounded-full"
                        >
                          <X className="w-6 h-6" />
                        </button>

                      <div className="mb-8">
                        <h3 className="text-2xl font-serif text-stone-900 mb-2">Dettagli Iscrizione</h3>
                        <p className="text-stone-500 text-sm">Richiesta inviata il {new Date(selectedRegistration.date).toLocaleDateString('it-IT')}</p>
                      </div>

                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100">
                            <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Nome</label>
                            <p className="text-stone-900 font-medium">{selectedRegistration.name}</p>
                          </div>
                          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100">
                            <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Email</label>
                            <p className="text-stone-900 font-medium">{selectedRegistration.email}</p>
                          </div>
                          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100">
                            <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Telefono</label>
                            <p className="text-stone-900 font-medium">{selectedRegistration.phone || 'Non fornito'}</p>
                          </div>
                          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100">
                            <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Password Scelta</label>
                            <p className="text-stone-900 font-mono text-xs">********</p>
                          </div>
                        </div>

                        <div className="p-6 bg-stone-50 rounded-2xl border border-stone-100">
                          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Messaggio / Motivazione</label>
                          <p className="text-stone-600 text-sm leading-relaxed italic">
                            "{selectedRegistration.message || 'Nessun messaggio fornito.'}"
                          </p>
                        </div>

                        <div className="flex gap-4 pt-4">
                          <button 
                            onClick={() => {
                              approveRegistration(selectedRegistration);
                              setSelectedRegistration(null);
                            }}
                            className="flex-1 bg-emerald-500 text-white py-4 rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                          >
                            Approva Iscrizione
                          </button>
                          <button 
                            onClick={() => {
                              deleteRegistration(selectedRegistration.id);
                              setSelectedRegistration(null);
                            }}
                            className="flex-1 bg-stone-100 text-stone-600 py-4 rounded-xl font-bold hover:bg-stone-200 transition-all"
                          >
                            Rifiuta
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}

                {/* Email Confirmation Modal */}
                {showEmailConfirmation && (
                  <div className="fixed inset-0 z-[110] overflow-y-auto p-4 md:p-8">
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowEmailConfirmation(null)} />
                    <div className="flex min-h-full items-center justify-center">
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="relative bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl max-w-2xl w-full overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500" />
                        
                        <button 
                          onClick={() => setShowEmailConfirmation(null)}
                          className="absolute top-4 right-4 md:top-6 md:right-6 text-stone-400 hover:text-stone-900 transition-colors p-2 hover:bg-stone-100 rounded-full"
                        >
                          <X className="w-6 h-6" />
                        </button>

                      <div className="flex items-center gap-4 mb-8">
                        <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center">
                          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-serif text-stone-900">Iscrizione Approvata</h3>
                          <p className="text-stone-500 text-sm">Email di benvenuto inviata con successo</p>
                        </div>
                      </div>

                      <div className="bg-stone-50 rounded-3xl border border-stone-200 overflow-hidden">
                        <div className="bg-stone-100 px-6 py-3 border-b border-stone-200 flex justify-between items-center">
                          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Anteprima Email Inviata</span>
                          <span className="text-[10px] text-stone-400 italic">Destinatario: {showEmailConfirmation.email}</span>
                        </div>
                        <div className="p-8 space-y-6 text-stone-700">
                          <p className="font-serif text-xl text-stone-900">Benvenuto in Pro San Felice, {showEmailConfirmation.name}!</p>
                          
                          <p className="text-sm leading-relaxed">
                            Siamo felici di comunicarti che la tua richiesta di iscrizione è stata approvata dal consiglio direttivo. 
                            Da questo momento sei ufficialmente un socio della nostra associazione.
                          </p>

                          <div className="p-6 bg-white rounded-2xl border border-stone-200 space-y-4">
                            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-widest">I tuoi dati di accesso:</h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[10px] text-stone-400 uppercase">Username / Email</label>
                                <p className="text-sm font-medium">{showEmailConfirmation.email}</p>
                              </div>
                              <div>
                                <label className="block text-[10px] text-stone-400 uppercase">Password</label>
                                <p className="text-sm font-mono">******** (quella scelta da te)</p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-widest">Istruzioni per il versamento:</h4>
                            <p className="text-sm leading-relaxed">
                              Per completare l'attivazione, è necessario versare la quota associativa annuale di <strong>€ {membershipFees[2026] || 100},00</strong>. 
                              Puoi effettuare il versamento tramite:
                            </p>
                            <ul className="text-sm space-y-2 list-disc pl-5 text-stone-600">
                              <li>Bonifico Bancario: IT 00 X 00000 00000 000000000000</li>
                              <li>Presso la nostra sede negli orari di apertura</li>
                              <li>Durante il prossimo evento associativo</li>
                            </ul>
                          </div>

                          <p className="text-xs text-stone-400 pt-4 border-t border-stone-100">
                            Questa è una simulazione dell'email che verrebbe inviata al socio.
                          </p>
                        </div>
                      </div>

                      <button 
                        onClick={() => setShowEmailConfirmation(null)}
                        className="w-full mt-8 bg-stone-900 text-white py-4 rounded-xl font-bold hover:bg-stone-800 transition-all"
                      >
                        Ho capito, chiudi
                      </button>
                    </motion.div>
                  </div>
                )}

                {/* Fee Settings Modal */}
                {showFeeSettings && (
                  <div className="fixed inset-0 z-[110] overflow-y-auto p-4 md:p-8">
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowFeeSettings(false)} />
                    <div className="flex min-h-full items-center justify-center">
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="relative bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl max-w-md w-full"
                      >
                        <button 
                          onClick={() => setShowFeeSettings(false)}
                          className="absolute top-4 right-4 md:top-6 md:right-6 text-stone-400 hover:text-stone-900 transition-colors p-2 hover:bg-stone-100 rounded-full"
                        >
                          <X className="w-6 h-6" />
                        </button>

                      <div className="mb-8">
                        <div className="w-12 h-12 bg-stone-100 rounded-2xl flex items-center justify-center mb-4">
                          <Settings className="w-6 h-6 text-stone-900" />
                        </div>
                        <h3 className="text-2xl font-serif text-stone-900 mb-2">Quote Associative</h3>
                        <p className="text-stone-500 text-sm">Imposta la quota stabilita per ogni anno sociale. Ogni modifica verrà notificata ai nuovi iscritti.</p>
                      </div>

                      <div className="space-y-4">
                        {[2024, 2025, 2026].map(year => (
                          <div key={year} className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-100">
                            <span className="font-bold text-stone-900">Anno {year}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-stone-400 font-medium">€</span>
                              <input 
                                type="number" 
                                value={membershipFees[year]} 
                                onChange={(e) => setMembershipFees({ ...membershipFees, [year]: parseInt(e.target.value) || 0 })}
                                className="w-20 px-3 py-2 rounded-xl border border-stone-200 text-right font-bold text-stone-900 focus:ring-2 focus:ring-stone-900 outline-none"
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-8 space-y-3">
                        <button 
                          onClick={async () => {
                            try {
                              await fetch('/api/settings/membership_fees', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ value: membershipFees })
                              });
                              setShowFeeSettings(false);
                              alert('Quote associative salvate con successo. È stato generato un riferimento nel verbale di oggi.');
                            } catch (error) {
                              console.error('Error saving fees:', error);
                            }
                          }}
                          className="w-full bg-stone-900 text-white py-4 rounded-xl font-bold hover:bg-stone-800 transition-all shadow-lg shadow-stone-900/20"
                        >
                          Salva e Notifica
                        </button>
                        <p className="text-[10px] text-stone-400 text-center uppercase tracking-widest font-bold">
                          La quota per il 2026 è attualmente di € {membershipFees[2026]},00
                        </p>
                      </div>
                    </motion.div>
                  </div>
                )}
              </div>
            )}

            {(isStaff || isMember) && activeTab === 'minutes' && (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-serif text-stone-900">Archivio Verbali</h2>
                </div>
                {isStaff && (
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
                )}
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
                        {isStaff && (
                          <>
                            <button onClick={() => setEditingMinute(m)} className="text-stone-300 hover:text-stone-900">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => deleteMinute(m.id)} className="text-stone-300 hover:text-red-500">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(isStaff || isMember) && activeTab === 'appointments' && (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-serif text-stone-900">Agenda Appuntamenti</h2>
                </div>
                {isStaff && (
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
                )}
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
                        {isStaff && (
                          <>
                            <button onClick={() => setEditingAppointment(a)} className="text-stone-300 hover:text-stone-900">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => deleteAppointment(a.id)} className="text-stone-300 hover:text-red-500">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
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
                {isStaff && (
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
                        {isStaff && (
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

                {isStaff && (
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
                        {isStaff && (
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

            {(isStaff || isMember) && activeTab === 'poll' && (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-serif text-stone-900">
                    {isStaff ? 'Gestione Sondaggi' : 'Risultati Sondaggi'}
                  </h2>
                  {isStaff && (
                    <button 
                      onClick={createNewPoll}
                      className="flex items-center gap-2 bg-stone-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:shadow-lg transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      Nuovo Sondaggio
                    </button>
                  )}
                </div>

                {/* Poll List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {polls.map((p: any) => (
                    <div 
                      key={p.id}
                      onClick={() => selectPoll(p)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        poll?.id === p.id 
                          ? 'border-stone-900 bg-stone-900 text-white shadow-lg' 
                          : 'border-stone-200 bg-white hover:border-stone-400'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                          p.active 
                            ? (poll?.id === p.id ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700')
                            : (poll?.id === p.id ? 'bg-stone-700 text-stone-400' : 'bg-stone-100 text-stone-500')
                        }`}>
                          {p.active ? 'Attivo' : 'Bozza'}
                        </span>
                        {p.showOnHomepage && (
                          <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                            poll?.id === p.id ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'
                          }`}>
                            In Home
                          </span>
                        )}
                      </div>
                      <p className={`text-sm font-serif line-clamp-2 ${poll?.id === p.id ? 'text-white' : 'text-stone-900'}`}>
                        {p.question || '(Senza domanda)'}
                      </p>
                      <div className="mt-4 flex justify-between items-center">
                        <span className={`text-[10px] uppercase tracking-widest ${poll?.id === p.id ? 'text-stone-400' : 'text-stone-500'}`}>
                          {p.votes?.length || 0} voti
                        </span>
                        {isStaff && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              deletePoll(p.id);
                            }}
                            className={`p-1.5 rounded-lg transition-colors ${
                              poll?.id === p.id ? 'hover:bg-white/10 text-white/50 hover:text-white' : 'hover:bg-red-50 text-stone-400 hover:text-red-500'
                            }`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-8 border-t border-stone-200">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-serif text-stone-900">
                      {isStaff ? (poll?.id ? 'Modifica Sondaggio' : 'Nuovo Sondaggio') : 'Dettagli Risultati'}
                    </h3>
                    {isStaff && (
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-stone-400 uppercase">Visibile in Home:</span>
                          <button 
                            onClick={() => setPoll({ ...poll, showOnHomepage: !poll.showOnHomepage })}
                            className={`w-10 h-5 rounded-full transition-colors relative ${poll.showOnHomepage ? 'bg-stone-900' : 'bg-stone-200'}`}
                          >
                            <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${poll.showOnHomepage ? 'left-6' : 'left-1'}`} />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-stone-400 uppercase">Stato:</span>
                          <button 
                            onClick={() => setPoll({ ...poll, active: !poll.active })}
                            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                              poll.active ? 'bg-emerald-500 text-white' : 'bg-stone-200 text-stone-500'
                            }`}
                          >
                            {poll.active ? 'Attivo' : 'Disattivato'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                      {isStaff ? (
                        <div className="p-8 bg-stone-50 rounded-3xl border border-stone-200">
                        <h3 className="font-serif text-lg text-stone-900 mb-6">Configurazione Domanda</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-bold text-stone-500 uppercase mb-2 ml-1">Testo della Domanda</label>
                            <textarea 
                              value={poll.question}
                              onChange={(e) => setPoll({ ...poll, question: e.target.value })}
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
                                    setPoll({ ...poll, options: updated });
                                  }}
                                  className="flex-1 px-4 py-2 rounded-xl border border-stone-200 text-sm"
                                />
                                <button 
                                  onClick={() => {
                                    const updated = poll.options.filter((o: any) => o.id !== option.id);
                                    setPoll({ ...poll, options: updated });
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
                                setPoll({ ...poll, options: [...poll.options, newOption] });
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

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-stone-500 uppercase mb-2 ml-1">Data Termine Sondaggio (Opzionale)</label>
                              <input 
                                type="datetime-local"
                                value={poll.endDate ? poll.endDate.slice(0, 16) : ''}
                                onChange={(e) => setPoll({ ...poll, endDate: e.target.value ? new Date(e.target.value).toISOString() : null })}
                                className="w-full px-4 py-2 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-stone-900 outline-none transition-all"
                              />
                              <p className="text-[10px] text-stone-400 mt-1 ml-1">Dopo questa data, il sondaggio mostrerà solo i risultati per 5 giorni prima di sparire dalla home.</p>
                            </div>
                          </div>

                          <div className="pt-6 border-t border-stone-100 flex justify-end">
                            <button 
                              onClick={async () => {
                                try {
                                  const success = await savePoll(poll);
                                  if (success) {
                                    alert('Sondaggio salvato con successo!');
                                  }
                                } catch (err: any) {
                                  alert('Errore durante il salvataggio: ' + err.message);
                                }
                              }}
                              className="bg-stone-900 text-white px-8 py-3 rounded-2xl text-sm font-bold hover:shadow-lg transition-all active:scale-95"
                            >
                              Salva Modifiche Sondaggio
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 bg-stone-50 rounded-3xl border border-stone-200">
                        <h3 className="font-serif text-lg text-stone-900 mb-6">Dettagli Sondaggio</h3>
                        <div className="space-y-6">
                          <div>
                            <p className="text-xs font-bold text-stone-500 uppercase mb-2 ml-1">Domanda</p>
                            <p className="text-xl font-serif text-stone-900 bg-white p-6 rounded-2xl border border-stone-100">{poll.question}</p>
                          </div>
                          <div className="space-y-3">
                            <p className="text-xs font-bold text-stone-500 uppercase mb-2 ml-1">Opzioni</p>
                            {poll.options.map((option: any) => (
                              <div key={option.id} className="p-4 bg-white rounded-xl border border-stone-100 text-sm text-stone-700">
                                {option.text}
                              </div>
                            ))}
                          </div>
                          {poll.endDate && (
                            <div>
                              <p className="text-xs font-bold text-stone-500 uppercase mb-2 ml-1">Data Termine</p>
                              <p className="text-sm text-stone-700">{new Date(poll.endDate).toLocaleString('it-IT')}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
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
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
