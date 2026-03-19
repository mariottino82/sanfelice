import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, FileText, Calendar, Euro, Plus, TrendingUp, LogOut, Shield, UserPlus, Settings, UserCheck, Trash2, Edit2, Ticket, Gift, CheckCircle2, Newspaper, Facebook, Instagram, Youtube, Share2, Image as ImageIcon, Video, Vote, Menu, X, ShieldCheck, Wand2, Download, Upload, Trophy, ClipboardCheck, Mail, Phone, XCircle, AlertCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import { MeetingMinutesWizard } from './MeetingMinutesWizard';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const WinnerManagement = ({ initialWinners, onChange }: { initialWinners: any[], onChange: (winners: any[]) => void }) => {
  const [winners, setWinners] = React.useState(initialWinners.map(w => ({ ...w, id: w.id || Math.random().toString(36).substr(2, 9) })));

  const addWinner = () => {
    const newWinners = [...winners, { id: Math.random().toString(36).substr(2, 9), year: new Date().getFullYear(), winnerName: '', prize: '' }];
    setWinners(newWinners);
    onChange(newWinners);
  };

  const updateWinner = (id: string, field: string, value: any) => {
    const newWinners = winners.map(w => w.id === id ? { ...w, [field]: value } : w);
    setWinners(newWinners);
    onChange(newWinners);
  };

  const removeWinner = (id: string) => {
    const newWinners = winners.filter(w => w.id !== id);
    setWinners(newWinners);
    onChange(newWinners);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {winners.map((winner) => (
          <div key={winner.id} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-stone-50 rounded-xl border border-stone-100 relative group">
            <button 
              type="button"
              onClick={() => removeWinner(winner.id)}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
            >
              <X className="w-3 h-3" />
            </button>
            <div>
              <label className="block text-[8px] font-bold text-stone-400 uppercase tracking-widest mb-1 ml-1">Anno</label>
              <input 
                type="number" 
                value={winner.year} 
                onChange={(e) => updateWinner(winner.id, 'year', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-xs focus:ring-2 focus:ring-stone-900 outline-none"
              />
            </div>
            <div>
              <label className="block text-[8px] font-bold text-stone-400 uppercase tracking-widest mb-1 ml-1">Vincitore</label>
              <input 
                value={winner.winnerName} 
                onChange={(e) => updateWinner(winner.id, 'winnerName', e.target.value)}
                placeholder="Nome Vincitore"
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-xs focus:ring-2 focus:ring-stone-900 outline-none"
              />
            </div>
            <div>
              <label className="block text-[8px] font-bold text-stone-400 uppercase tracking-widest mb-1 ml-1">Premio</label>
              <input 
                value={winner.prize} 
                onChange={(e) => updateWinner(winner.id, 'prize', e.target.value)}
                placeholder="es. 1° Classificato"
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-xs focus:ring-2 focus:ring-stone-900 outline-none"
              />
            </div>
          </div>
        ))}
      </div>
      <button 
        type="button"
        onClick={addWinner}
        className="w-full py-3 border-2 border-dashed border-stone-200 rounded-xl text-stone-400 hover:border-stone-900 hover:text-stone-900 transition-all text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Aggiungi Vincitore all'Albo
      </button>
    </div>
  );
};

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Elimina', cancelText = 'Annulla', icon, isDeleting }: { isOpen: boolean, onClose: () => void, onConfirm: () => void, title: string, message: string, confirmText?: string, cancelText?: string, icon?: React.ReactNode, isDeleting?: boolean }) => {
  if (!isOpen) return null;
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl"
      >
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6">
          {icon || <Trash2 className="w-8 h-8 text-red-600" />}
        </div>
        <h3 className="text-xl font-serif text-stone-900 mb-2">{title}</h3>
        <p className="text-stone-500 text-sm mb-8">{message}</p>
        <div className="flex gap-3">
          <button 
            disabled={isDeleting}
            onClick={onClose} 
            className="flex-1 py-4 rounded-xl font-bold text-stone-500 hover:bg-stone-50 transition-all disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button 
            disabled={isDeleting}
            onClick={onConfirm}
            className="flex-1 py-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 disabled:opacity-50 flex items-center justify-center"
          >
            {isDeleting ? '...' : confirmText}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

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
  const [showSponsorshipModal, setShowSponsorshipModal] = React.useState(false);
  const [sponsorshipData, setSponsorshipData] = React.useState<any>({
    companyName: '',
    address: '',
    vatNumber: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'BONIFICO',
    description: 'Contributo volontario festività San Felice 2026 - Colle d\'Anchise (CB)'
  });
  const [editingMinute, setEditingMinute] = React.useState<any>(null);
  const [editingAppointment, setEditingAppointment] = React.useState<any>(null);
  const [editingNews, setEditingNews] = React.useState<any>(null);
  const [notification, setNotification] = React.useState<{message: string, type: 'success' | 'error'} | null>(null);

  React.useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const [contestToDelete, setContestToDelete] = React.useState<any>(null);
  const [registrationToDelete, setRegistrationToDelete] = React.useState<any>(null);
  const [lotteryToDelete, setLotteryToDelete] = React.useState<any>(null);
  const [pollToDelete, setPollToDelete] = React.useState<any>(null);
  const [accountToDelete, setAccountToDelete] = React.useState<any>(null);
  const [minuteToDelete, setMinuteToDelete] = React.useState<any>(null);
  const [appointmentToDelete, setAppointmentToDelete] = React.useState<any>(null);
  const [memberToDelete, setMemberToDelete] = React.useState<any>(null);
  const [collectionToDelete, setCollectionToDelete] = React.useState<any>(null);
  const [newsToDelete, setNewsToDelete] = React.useState<any>(null);
  const [galleryItemToDelete, setGalleryItemToDelete] = React.useState<any>(null);
  const [memberRegistrationToDelete, setMemberRegistrationToDelete] = React.useState<any>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [editingContest, setEditingContest] = React.useState<any>(null);
  const [showRegistrationDetails, setShowRegistrationDetails] = React.useState<any>(null);

  const handleContestImageUpload = async (contestId: number, file: File) => {
    setUploadingContestId(contestId);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`/api/contests/${contestId}/upload`, {
        method: 'POST',
        body: formData
      });
      if (response.ok) {
        const data = await response.json();
        setNotification({ message: 'Immagine caricata con successo!', type: 'success' });
        fetchData();
        return data.path;
      }
    } catch (error) {
      console.error('Error uploading contest image:', error);
      setNotification({ message: 'Errore durante il caricamento dell\'immagine.', type: 'error' });
    } finally {
      setUploadingContestId(null);
    }
    return null;
  };

  const addContest = async (newContest: any) => {
    console.log('Attempting to add/update contest:', newContest);
    try {
      const method = newContest.id ? 'PUT' : 'POST';
      const url = newContest.id ? `/api/contests/${newContest.id}` : '/api/contests';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newContest)
      });
      
      if (response.ok) {
        setEditingContest(null);
        setNotification({ message: newContest.id ? 'Concorso aggiornato con successo!' : 'Concorso creato con successo!', type: 'success' });
        await fetchData();
      } else {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        setNotification({ message: 'Errore dal server: ' + (errorData.error || 'Errore sconosciuto'), type: 'error' });
      }
    } catch (error) {
      console.error('Error adding/updating contest:', error);
      setNotification({ message: 'Errore di connessione o di sistema: ' + (error instanceof Error ? error.message : String(error)), type: 'error' });
    }
  };

  const deleteContest = (contest: any) => {
    setContestToDelete(contest);
  };

  const updateRegistrationStatus = async (id: number, status: string) => {
    try {
      const response = await fetch(`/api/contest-registrations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error updating registration status:', error);
    }
  };

  const deleteContestRegistration = (registration: any) => {
    setRegistrationToDelete(registration);
  };
  const [showContestRegistrationModal, setShowContestRegistrationModal] = React.useState<any>(null);

  const [minutes, setMinutes] = React.useState([]);
  const [contests, setContests] = React.useState([]);
  const [contestRegistrations, setContestRegistrations] = React.useState([]);
  const [appointments, setAppointments] = React.useState([]);
  const [registrations, setRegistrations] = React.useState([]);
  const [gallery, setGallery] = React.useState([]);
  const [selectedRegistration, setSelectedRegistration] = React.useState<any>(null);
  const [showEmailConfirmation, setShowEmailConfirmation] = React.useState<any>(null);
  const [membershipFees, setMembershipFees] = React.useState<Record<number, number>>({ 2024: 100, 2025: 100, 2026: 100 });
  const [showFeeSettings, setShowFeeSettings] = React.useState(false);
  const [showWizard, setShowWizard] = React.useState(false);
  const [uploadingMinuteId, setUploadingMinuteId] = React.useState<number | null>(null);
  const [uploadingContestId, setUploadingContestId] = React.useState<number | null>(null);

  const fetchData = React.useCallback(async () => {
    const endpoints = [
      { key: 'members', url: '/api/members', setter: setMembers },
      { key: 'finances', url: '/api/finances', setter: setCollections },
      { key: 'lottery', url: '/api/lottery', setter: setLottery },
      { key: 'polls', url: '/api/polls', setter: setPolls },
      { key: 'minutes', url: '/api/minutes', setter: setMinutes },
      { key: 'contests', url: '/api/contests', setter: setContests },
      { key: 'contest_registrations', url: '/api/contest-registrations', setter: setContestRegistrations },
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
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const exportContestRegistrations = (contestId: number) => {
    const contest = contests.find(c => c.id === contestId);
    const regs = contestRegistrations.filter(r => r.contestId === contestId);
    if (!contest || regs.length === 0) return;

    const headers = ['Nome', 'Email', 'Cellulare', 'Minorenne', 'Genitore', 'Email Genitore', 'Cellulare Genitore', 'Data'];
    const csvContent = [
      headers.join(','),
      ...regs.map(r => [
        `"${r.name}"`,
        `"${r.email}"`,
        `"${r.phone}"`,
        r.isMinor ? 'Sì' : 'No',
        `"${r.parentName || ''}"`,
        `"${r.parentEmail || ''}"`,
        `"${r.parentPhone || ''}"`,
        new Date(r.date).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `iscritti_${contest.title.replace(/\s+/g, '_').toLowerCase()}.csv`;
    link.click();
  };

  const [selectedYear, setSelectedYear] = React.useState<number | 'all'>('all');
  const [viewOnlyReceipts, setViewOnlyReceipts] = React.useState(false);

  const filteredCollections = collections.filter((item: any) => {
    const itemYear = new Date(item.date).getFullYear();
    const matchesYear = selectedYear === 'all' || itemYear === selectedYear || item.social_year === selectedYear;
    const matchesReceipt = !viewOnlyReceipts || item.receipt_path;
    return matchesYear && matchesReceipt;
  });

  const availableYears = Array.from(new Set([
    ...collections.map((c: any) => new Date(c.date).getFullYear()),
    ...collections.map((c: any) => c.social_year).filter(Boolean)
  ])).sort((a, b) => b - a);

  const totalCollected = filteredCollections.reduce((acc, curr: any) => acc + curr.amount, 0);

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
      id: `history-${Date.now()}-${Math.random()}`,
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

  const deleteHistoryItem = (item: any) => {
    setLotteryToDelete(item);
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

  const deleteAccount = (account: any) => {
    setAccountToDelete(account);
  };

  const addMinute = async (newMinute: any) => {
    try {
      const response = await fetch('/api/minutes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMinute)
      });
      if (response.ok) {
        fetchData();
      }
      setEditingMinute(null);
    } catch (error) {
      console.error('Error adding minute:', error);
    }
  };

  const deleteMinute = (minute: any) => {
    setMinuteToDelete(minute);
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

  const deleteAppointment = (app: any) => {
    setAppointmentToDelete(app);
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

  const deleteMember = (member: any) => {
    setMemberToDelete(member);
  };

  const addCollection = async (newCollection: any) => {
    try {
      const amount = parseFloat(newCollection.amount);
      const payload = { 
        ...newCollection, 
        amount: newCollection.type === 'uscita' ? -Math.abs(amount) : Math.abs(amount)
      };
      
      const response = await fetch('/api/finances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      setCollections([{ ...payload, id: data.id }, ...collections]);
      setEditingCollection(null);
      setNotification({ message: 'Transazione registrata con successo!', type: 'success' });
    } catch (error) {
      console.error('Error adding collection:', error);
      setNotification({ message: 'Errore durante la registrazione della transazione.', type: 'error' });
    }
  };

  const reset2026Payments = async () => {
    if (!window.confirm('Sei sicuro di voler azzerare tutte le iscrizioni per l\'anno 2026? Questa operazione non è reversibile.')) return;
    
    try {
      const updatedMembers = members.map((m: any) => {
        const currentPayments = typeof m.payments === 'string' ? JSON.parse(m.payments) : (m.payments || {});
        return {
          ...m,
          payments: { ...currentPayments, '2026': false }
        };
      });

      // Update all members on the server
      for (const member of updatedMembers) {
        await fetch(`/api/members/${member.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(member)
        });
      }

      setMembers(updatedMembers);
      setNotification({ message: 'Iscrizioni 2026 azzerate con successo!', type: 'success' });
    } catch (error) {
      console.error('Error resetting 2026 payments:', error);
      setNotification({ message: 'Errore durante l\'azzeramento delle iscrizioni.', type: 'error' });
    }
  };

  const generateReceiptPDF = async (financeData: any) => {
    const doc = new jsPDF();
    const company = typeof financeData.company_details === 'string' ? JSON.parse(financeData.company_details) : financeData.company_details;
    
    // Header
    try {
      doc.addImage('/logo.png', 'PNG', 15, 10, 35, 35);
    } catch (e) {
      console.warn('Logo not found for PDF');
    }
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(40, 40, 40);
    doc.text('ASSOCIAZIONE PRO SAN FELICE', 200, 20, { align: 'right' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Via Salita la Chiesa, 19 - 86020 - Colle d\'Anchise (CB)', 200, 26, { align: 'right' });
    doc.text('Codice Fiscale: 92083740701', 200, 31, { align: 'right' });
    doc.text('Email: prosanfelice@outlook.it', 200, 36, { align: 'right' });
    
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(15, 50, 200, 50);
    
    // Titolo Ricevuta
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    doc.text(`RICEVUTA EROGAZIONE LIBERALE nr. ${financeData.receipt_number}/${financeData.social_year}`, 15, 65);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Data emissione: ${new Date(financeData.date).toLocaleDateString('it-IT')}`, 15, 72);
    
    // Destinatario Box
    doc.setDrawColor(240, 240, 240);
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(120, 60, 80, 45, 3, 3, 'FD');
    
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('SPETT.LE / DESTINATARIO', 125, 68);
    
    doc.setFontSize(10);
    doc.setTextColor(40, 40, 40);
    doc.setFont('helvetica', 'bold');
    doc.text(company.companyName.toUpperCase(), 125, 75, { maxWidth: 70 });
    doc.setFont('helvetica', 'normal');
    doc.text(company.address.toUpperCase(), 125, 85, { maxWidth: 70 });
    if (company.city) doc.text(company.city.toUpperCase(), 125, 90);
    doc.text(`P.IVA / C.F. ${company.vatNumber}`, 125, 95);
    
    // Corpo
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    const bodyText = `L'Associazione Pro San Felice dichiara di aver ricevuto in data ${new Date(financeData.date).toLocaleDateString('it-IT')} la somma di € ${Math.abs(financeData.amount).toLocaleString('it-IT', { minimumFractionDigits: 2 })} a titolo di erogazione liberale per il sostegno delle attività istituzionali dell'associazione.`;
    const splitBody = doc.splitTextToSize(bodyText, 170);
    doc.text(splitBody, 15, 120);
    
    // Table
    (doc as any).autoTable({
      startY: 140,
      head: [['DESCRIZIONE', 'IMPORTO']],
      body: [[financeData.event_name, `€ ${Math.abs(financeData.amount).toLocaleString('it-IT', { minimumFractionDigits: 2 })}` ]],
      theme: 'grid',
      headStyles: { 
        fillColor: [40, 40, 40], 
        textColor: [255, 255, 255], 
        fontSize: 10, 
        fontStyle: 'bold',
        cellPadding: 5
      },
      bodyStyles: { 
        textColor: [40, 40, 40], 
        fontSize: 11,
        cellPadding: 8
      },
      columnStyles: {
        1: { halign: 'right', fontStyle: 'bold', cellWidth: 40 }
      },
      margin: { left: 15, right: 15 }
    });
    
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    
    // Payment Info
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('DETTAGLI PAGAMENTO', 15, finalY);
    doc.setFont('helvetica', 'normal');
    doc.text(`Metodo: ${company.paymentMethod || 'BONIFICO'}`, 15, finalY + 7);
    doc.text('IBAN: IT36L0760103800001067338085', 15, finalY + 13);
    doc.text('Banca: Poste Italiane', 15, finalY + 19);
    
    // Signature
    doc.setFontSize(10);
    doc.text('Il Presidente', 150, finalY + 10);
    doc.setFont('helvetica', 'italic');
    doc.text('Associazione Pro San Felice', 150, finalY + 25);
    
    // Legal Note
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    const legalNote = "Il presente contributo, ai sensi dell'art. 83 del D.Lgs. 117/2017 (Codice del Terzo Settore), è deducibile o detraibile nei limiti previsti dalla normativa vigente, a condizione che il versamento sia eseguito tramite sistemi di pagamento tracciabili.";
    const splitNote = doc.splitTextToSize(legalNote, 170);
    doc.text(splitNote, 15, 280);

    return doc;
  };

  const handleSponsorshipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const year = new Date(sponsorshipData.date).getFullYear();
    const yearReceipts = collections.filter((c: any) => c.social_year === year && c.receipt_number);
    const nextNumber = yearReceipts.length + 1;
    
    const financeData = {
      event_name: sponsorshipData.description,
      type: 'sponsorizzazione',
      amount: parseFloat(sponsorshipData.amount),
      date: sponsorshipData.date,
      company_details: JSON.stringify(sponsorshipData),
      receipt_number: nextNumber.toString(),
      social_year: year
    };

    // Generate PDF
    const doc = await generateReceiptPDF(financeData);
    const pdfBlob = doc.output('blob');
    
    // Upload PDF
    const formData = new FormData();
    formData.append('file', pdfBlob, `ricevuta_${nextNumber}_${year}.pdf`);
    
    try {
      const uploadRes = await fetch('/api/finances/upload-receipt', {
        method: 'POST',
        body: formData
      });
      const uploadData = await uploadRes.json();
      
      // Save to DB
      const response = await fetch('/api/finances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...financeData, receipt_path: uploadData.path })
      });
      
      if (response.ok) {
        const dbData = await response.json();
        setCollections([{ ...financeData, id: dbData.id, receipt_path: uploadData.path }, ...collections]);
        setShowSponsorshipModal(false);
        setNotification({ message: 'Sponsorizzazione e ricevuta create con successo!', type: 'success' });
        
        // Download PDF for the user
        doc.save(`ricevuta_${nextNumber}_${year}.pdf`);
      }
    } catch (error) {
      console.error('Error creating sponsorship:', error);
      setNotification({ message: 'Errore durante la creazione della sponsorizzazione.', type: 'error' });
    }
  };

  const deleteCollection = (collection: any) => {
    setCollectionToDelete(collection);
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

  const deleteRegistration = (reg: any) => {
    setMemberRegistrationToDelete(reg);
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

  const deleteNews = (newsItem: any) => {
    setNewsToDelete(newsItem);
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

  const deleteGalleryItem = (item: any) => {
    setGalleryItemToDelete(item);
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

  const deletePoll = (poll: any) => {
    setPollToDelete(poll);
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
        lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen
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
        
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto sidebar-scrollbar">
          {isStaff ? (
            <>
              {[
                { id: 'members', label: 'Soci & Cariche', icon: Users, minRole: 'SuperAdmin' },
                { id: 'registrations', label: 'Iscrizioni', icon: UserPlus, minRole: 'SuperAdmin', badge: registrations.length > 0 ? registrations.length : null },
                { id: 'finances', label: 'Contabilità', icon: Euro, minRole: 'SuperAdmin' },
                { id: 'lottery', label: 'Lotteria', icon: Ticket, minRole: 'Operator' },
                { id: 'minutes', label: 'Verbali', icon: FileText, minRole: 'Operator' },
                { id: 'contests', label: 'Concorsi', icon: Trophy, minRole: 'Operator' },
                { id: 'appointments', label: 'Agenda', icon: Calendar, minRole: 'Operator' },
                { id: 'news', label: 'News & Eventi', icon: Newspaper, minRole: 'Operator' },
                { id: 'poll', label: 'Sondaggi', icon: Vote, minRole: 'Operator' },
                { id: 'gallery', label: 'Foto & Video', icon: ImageIcon, minRole: 'Operator' },
                { id: 'accounts', label: 'Account & Sicurezza', icon: Shield, minRole: 'SuperAdmin' },
              ].filter(tab => {
                if (isSuperAdmin) return true;
                if (isStaff && tab.minRole === 'Operator') return true;
                if (isMember && ['minutes', 'appointments', 'news', 'gallery', 'contests'].includes(tab.id)) return true;
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
                { id: 'minutes', label: 'Verbali', icon: FileText },
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
          
          <div className="pt-4 mt-auto border-t border-stone-800">
            <button 
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-400/10 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Esci
            </button>
          </div>
        </nav>
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
              {activeTab === 'contests' && 'Concorsi & Rassegne'}
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
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-200 relative group">
              <div className="flex items-center gap-3 text-stone-500 mb-2">
                <UserCheck className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Iscrizioni 2026</span>
              </div>
              <div className="flex items-end justify-between">
                <div className="text-4xl font-serif text-stone-900">{members.filter((m: any) => m.payments?.[2026] || m.payments?.['2026']).length}</div>
                {members.filter((m: any) => m.payments?.[2026] || m.payments?.['2026']).length > 0 && (
                  <button 
                    onClick={reset2026Payments}
                    className="text-[10px] font-bold text-red-500 hover:text-red-700 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Azzera
                  </button>
                )}
              </div>
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
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowFeeSettings(true);
                      }}
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
                    {cariche.map((c, idx) => <option key={`${c}-${idx}`} value={c}>{c}</option>)}
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
                                    (member.payments?.[year] || member.payments?.[year.toString()])
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
                              <button onClick={() => deleteMember(member)} className="text-red-400 hover:text-white hover:bg-red-500 transition-all p-2 bg-red-50 rounded-lg border border-red-100" title="Elimina Definitivamente">
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
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h2 className="text-xl font-serif text-stone-900">Registro Contabile</h2>
                    <p className="text-sm text-stone-500">Gestione entrate, uscite e sponsorizzazioni</p>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setShowSponsorshipModal(true)}
                      className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-lg shadow-emerald-900/10"
                    >
                      <Plus className="w-4 h-4" />
                      Nuova Sponsorizzazione
                    </button>
                    <button 
                      onClick={closeYear}
                      className="bg-stone-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-stone-800 transition-colors flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Chiusura Anno
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 p-4 bg-stone-50 rounded-2xl border border-stone-200">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Filtra Anno:</span>
                    <select 
                      value={selectedYear} 
                      onChange={(e) => setSelectedYear(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                      className="px-3 py-1.5 rounded-lg border border-stone-200 text-xs font-bold outline-none focus:ring-2 focus:ring-stone-900"
                    >
                      <option value="all">Tutti gli anni</option>
                      {availableYears.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Solo con Ricevuta:</span>
                    <button 
                      onClick={() => setViewOnlyReceipts(!viewOnlyReceipts)}
                      className={`w-10 h-5 rounded-full transition-colors relative ${viewOnlyReceipts ? 'bg-emerald-600' : 'bg-stone-200'}`}
                    >
                      <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${viewOnlyReceipts ? 'left-6' : 'left-1'}`} />
                    </button>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Saldo Periodo:</span>
                    <span className={`text-sm font-mono font-bold ${totalCollected >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      € {totalCollected.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
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
                  className="grid grid-cols-1 md:grid-cols-5 gap-4 p-6 bg-stone-50 rounded-2xl border border-stone-200"
                >
                  <input name="event_name" defaultValue={editingCollection?.event_name} placeholder="Evento / Causale" className="px-4 py-2 rounded-xl border border-stone-200 text-sm md:col-span-2 focus:ring-2 focus:ring-stone-900 outline-none" required />
                  <select name="type" defaultValue={editingCollection?.type || 'entrata'} className="px-4 py-2 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-stone-900 outline-none">
                    <option value="entrata">Entrata (+)</option>
                    <option value="uscita">Uscita (-)</option>
                    <option value="saldo_iniziale">Saldo Iniziale</option>
                    <option value="questua">Questua</option>
                    <option value="tesseramento">Tesseramento</option>
                  </select>
                  <input name="amount" defaultValue={editingCollection?.amount} type="number" step="0.01" placeholder="Importo (€)" className="px-4 py-2 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-stone-900 outline-none" required />
                  <button type="submit" className="bg-stone-900 text-white py-2 rounded-xl text-sm font-bold hover:bg-stone-800 shadow-lg shadow-stone-900/10">
                    {editingCollection ? 'Salva' : 'Registra'}
                  </button>
                  {editingCollection && (
                    <button type="button" onClick={() => setEditingCollection(null)} className="bg-stone-200 text-stone-600 py-2 rounded-xl text-sm font-medium hover:bg-stone-300">
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
                        <th className="pb-4 font-semibold text-right">Ricevuta</th>
                        <th className="pb-4 font-semibold text-right">Azioni</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-50">
                      {filteredCollections.map((item: any) => (
                        <tr key={item.id} className="hover:bg-stone-50 transition-colors">
                          <td className="py-4 font-medium text-stone-900">
                            {item.event_name}
                            {item.social_year && (
                              <span className="ml-2 text-[10px] text-stone-400 font-bold">ANNO {item.social_year}</span>
                            )}
                          </td>
                          <td className="py-4">
                            <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                              item.type === 'uscita' ? 'bg-red-50 text-red-600' : 
                              item.type === 'entrata' ? 'bg-emerald-50 text-emerald-600' :
                              item.type === 'saldo_iniziale' ? 'bg-blue-50 text-blue-600' :
                              'bg-stone-100 text-stone-600'
                            }`}>
                              {item.type.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-4 text-stone-500">{new Date(item.date).toLocaleDateString('it-IT')}</td>
                          <td className={`py-4 text-right font-mono font-bold ${item.amount >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            € {item.amount.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-4 text-right">
                            {item.receipt_path ? (
                              <a 
                                href={item.receipt_path} 
                                target="_blank" 
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-bold text-[10px] uppercase bg-emerald-50 px-2 py-1 rounded-lg"
                              >
                                <FileText className="w-3 h-3" />
                                PDF
                              </a>
                            ) : '-'}
                          </td>
                          <td className="py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => setEditingCollection(item)} className="text-stone-400 hover:text-stone-900 transition-colors p-1">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button onClick={() => deleteCollection(item)} className="text-stone-400 hover:text-red-600 transition-colors p-1">
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

            {showSponsorshipModal && (
              <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
                >
                  <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50">
                    <div>
                      <h3 className="text-xl font-serif text-stone-900">Nuova Sponsorizzazione</h3>
                      <p className="text-xs text-stone-500">Generazione automatica ricevuta erogazione liberale</p>
                    </div>
                    <button onClick={() => setShowSponsorshipModal(false)} className="text-stone-400 hover:text-stone-900 transition-colors">
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  
                  <form onSubmit={handleSponsorshipSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Ragione Sociale / Nome</label>
                        <input 
                          required
                          value={sponsorshipData.companyName}
                          onChange={e => setSponsorshipData({...sponsorshipData, companyName: e.target.value})}
                          placeholder="Esempio: Azienda Agricola Rossi S.r.l."
                          className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-900 outline-none text-sm"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Indirizzo Sede</label>
                        <input 
                          required
                          value={sponsorshipData.address}
                          onChange={e => setSponsorshipData({...sponsorshipData, address: e.target.value})}
                          placeholder="Via, Civico, CAP, Città"
                          className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-900 outline-none text-sm"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">P.IVA / C.F.</label>
                        <input 
                          required
                          value={sponsorshipData.vatNumber}
                          onChange={e => setSponsorshipData({...sponsorshipData, vatNumber: e.target.value})}
                          placeholder="Partita IVA o Codice Fiscale"
                          className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-900 outline-none text-sm"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Importo (€)</label>
                        <input 
                          required
                          type="number"
                          step="0.01"
                          value={sponsorshipData.amount}
                          onChange={e => setSponsorshipData({...sponsorshipData, amount: e.target.value})}
                          placeholder="0.00"
                          className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-900 outline-none text-sm font-mono"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Data Versamento</label>
                        <input 
                          required
                          type="date"
                          value={sponsorshipData.date}
                          onChange={e => setSponsorshipData({...sponsorshipData, date: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-900 outline-none text-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Metodo di Pagamento</label>
                        <select 
                          value={sponsorshipData.paymentMethod}
                          onChange={e => setSponsorshipData({...sponsorshipData, paymentMethod: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-900 outline-none text-sm"
                        >
                          <option value="BONIFICO">Bonifico Bancario</option>
                          <option value="CONTANTI">Contanti</option>
                          <option value="ASSEGNO">Assegno</option>
                          <option value="POS">POS / Carta</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Città (per intestazione)</label>
                        <input 
                          value={sponsorshipData.city}
                          onChange={e => setSponsorshipData({...sponsorshipData, city: e.target.value})}
                          placeholder="es. 86020 Colle d'Anchise (CB)"
                          className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-900 outline-none text-sm"
                        />
                      </div>
                      
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Descrizione / Causale</label>
                        <textarea 
                          required
                          rows={2}
                          value={sponsorshipData.description}
                          onChange={e => setSponsorshipData({...sponsorshipData, description: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-900 outline-none text-sm resize-none"
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-4 pt-4">
                      <button 
                        type="button"
                        onClick={() => setShowSponsorshipModal(false)}
                        className="flex-1 px-6 py-4 rounded-2xl bg-stone-100 text-stone-600 font-bold hover:bg-stone-200 transition-colors"
                      >
                        Annulla
                      </button>
                      <button 
                        type="submit"
                        className="flex-1 px-6 py-4 rounded-2xl bg-stone-900 text-white font-bold hover:bg-stone-800 transition-colors shadow-xl shadow-stone-900/20 flex items-center justify-center gap-2"
                      >
                        <FileText className="w-5 h-5" />
                        Genera Ricevuta & Salva
                      </button>
                    </div>
                  </form>
                </motion.div>
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
                            const newPrize = { id: `prize-${Date.now()}-${Math.random()}`, name, winningNumber: '', collectedBy: '' };
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
                                onClick={() => deleteHistoryItem(old)}
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
                        <button onClick={() => deleteAccount(acc)} className="text-stone-400 hover:text-red-600 transition-colors">
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
                            onClick={() => deleteRegistration(reg)}
                            className="bg-stone-200 text-stone-600 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-stone-300 transition-colors"
                          >
                            Rifiuta
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {(isStaff || isMember) && activeTab === 'minutes' && (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-serif text-stone-900">Archivio Verbali</h2>
                  {isStaff && (
                    <button 
                      onClick={() => setShowWizard(true)}
                      className="flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-xl font-bold hover:bg-stone-800 transition-all shadow-lg shadow-stone-900/20"
                    >
                      <Wand2 className="w-5 h-5" /> Genera Verbale
                    </button>
                  )}
                </div>
                
                {isStaff && (
                  <div className="p-6 bg-stone-50 rounded-2xl border border-stone-200">
                    <p className="text-sm text-stone-500 mb-4">
                      Usa il wizard per generare un verbale professionale, oppure carica un file PDF esistente.
                    </p>
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        const title = formData.get('title') as string;
                        addMinute({ title });
                        e.currentTarget.reset();
                      }}
                      className="flex gap-4"
                    >
                      <input name="title" defaultValue={editingMinute?.title} placeholder="Titolo Verbale / Assemblea (per caricamento manuale)" className="flex-1 px-4 py-2 rounded-xl border border-stone-200 text-sm outline-none" required />
                      <button type="submit" className="bg-stone-900 text-white px-6 py-2 rounded-xl text-sm font-bold">
                        {editingMinute ? 'Salva' : 'Crea Voce'}
                      </button>
                      {editingMinute && (
                        <button type="button" onClick={() => setEditingMinute(null)} className="bg-stone-200 text-stone-600 px-6 py-2 rounded-xl text-sm font-bold">
                          Annulla
                        </button>
                      )}
                    </form>
                  </div>
                )}

                <div className="space-y-3">
                  {minutes.length > 0 ? minutes.map((m: any) => (
                    <div key={m.id} className="flex items-center justify-between p-4 bg-white border border-stone-200 rounded-2xl group hover:border-stone-400 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-stone-50 rounded-xl flex items-center justify-center">
                          <FileText className="w-5 h-5 text-stone-400" />
                        </div>
                        <div>
                          <p className="font-medium text-stone-900">{m.title}</p>
                          <p className="text-xs text-stone-500">{new Date(m.date).toLocaleDateString('it-IT')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {m.file_path ? (
                          <a 
                            href={m.file_path} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" /> PDF Firmato
                          </a>
                        ) : (
                          isStaff && (
                            <div className="relative">
                              <input 
                                type="file" 
                                accept=".pdf"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const formData = new FormData();
                                    formData.append('file', file);
                                    try {
                                      await fetch(`/api/minutes/${m.id}/upload`, {
                                        method: 'POST',
                                        body: formData
                                      });
                                      fetchData();
                                    } catch (error) {
                                      console.error('Error uploading minute:', error);
                                    }
                                  }
                                }}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                              />
                              <button className="flex items-center gap-2 px-3 py-1.5 bg-stone-100 text-stone-600 rounded-lg text-xs font-bold hover:bg-stone-200 transition-colors">
                                <Upload className="w-3.5 h-3.5" /> Carica Firmato
                              </button>
                            </div>
                          )
                        )}

                        {m.content && (
                          <button 
                            onClick={() => {
                              try {
                                const data = JSON.parse(m.content);
                                const doc = new jsPDF();
                                const margin = 20;
                                let y = 20;

                                // Header
                                doc.setDrawColor(200, 200, 200);
                                doc.line(margin, 35, 190, 35);
                                
                                doc.setFont('helvetica', 'bold');
                                doc.setFontSize(20);
                                doc.setTextColor(40, 40, 40);
                                doc.text('PRO SAN FELICE 2023', 105, y, { align: 'center' });
                                y += 10;
                                doc.setFontSize(10);
                                doc.setFont('helvetica', 'normal');
                                doc.setTextColor(100, 100, 100);
                                doc.text('Associazione di Promozione Sociale - San Felice del Molise (CB)', 105, y, { align: 'center' });
                                y += 15;

                                // Title Box
                                doc.setFillColor(245, 245, 240);
                                doc.rect(margin, y - 5, 170, 25, 'F');
                                doc.setDrawColor(40, 40, 40);
                                doc.rect(margin, y - 5, 170, 25, 'S');
                                
                                doc.setFont('helvetica', 'bold');
                                doc.setFontSize(14);
                                doc.setTextColor(0, 0, 0);
                                doc.text('VERBALE DI ADUNANZA', 105, y + 5, { align: 'center' });
                                y += 12;
                                doc.setFontSize(12);
                                doc.text(data.title.toUpperCase(), 105, y + 5, { align: 'center' });
                                y += 25;

                                // General Info
                                doc.setFontSize(11);
                                doc.setFont('helvetica', 'normal');
                                const introText = `L'anno ${data.date.split('-')[0]}, il giorno ${data.date.split('-')[2]} del mese di ${new Date(data.date).toLocaleString('it-IT', { month: 'long' })}, alle ore ${data.time}, presso ${data.location}, si è riunita l'${data.type} dell'Associazione "Pro San Felice 2023".`;
                                
                                const splitIntro = doc.splitTextToSize(introText, 170);
                                doc.text(splitIntro, margin, y);
                                y += (splitIntro.length * 6) + 5;

                                // Attendees
                                doc.setFont('helvetica', 'bold');
                                doc.text('Presidenza e Segreteria:', margin, y);
                                y += 6;
                                doc.setFont('helvetica', 'normal');
                                doc.text(`Assume la presidenza il Sig. ${data.president}.`, margin, y);
                                y += 6;
                                doc.text(`Funge da segretario il Sig. ${data.secretary}.`, margin, y);
                                y += 10;

                                doc.setFont('helvetica', 'bold');
                                doc.text('Presenti e Interventi:', margin, y);
                                y += 8;
                                
                                if (Array.isArray(data.attendees)) {
                                  data.attendees.forEach((attendee: any) => {
                                    if (y > 270) {
                                      doc.addPage();
                                      y = 20;
                                    }
                                    doc.setFont('helvetica', 'bold');
                                    doc.setFontSize(10);
                                    doc.text(`${attendee.name} (${attendee.role})`, margin + 5, y);
                                    y += 5;
                                    if (attendee.opinion) {
                                      doc.setFont('helvetica', 'italic');
                                      const opinionText = `Nota/Parere: ${attendee.opinion}`;
                                      const splitOpinion = doc.splitTextToSize(opinionText, 160);
                                      doc.text(splitOpinion, margin + 10, y);
                                      y += (splitOpinion.length * 5) + 2;
                                    } else {
                                      y += 2;
                                    }
                                  });
                                } else {
                                  doc.setFont('helvetica', 'normal');
                                  const attendeesText = data.attendees || 'Tutti i soci regolarmente iscritti.';
                                  const splitAttendees = doc.splitTextToSize(attendeesText, 170);
                                  doc.text(splitAttendees, margin + 5, y);
                                  y += (splitAttendees.length * 6) + 10;
                                }
                                y += 5;
                                doc.setFontSize(11);

                                // Agenda
                                doc.setFont('helvetica', 'bold');
                                doc.text('ORDINE DEL GIORNO:', margin, y);
                                y += 8;
                                data.agenda.forEach((item: any, index: number) => {
                                  doc.setFont('helvetica', 'normal');
                                  doc.text(`${index + 1}. ${item.title}`, margin + 5, y);
                                  y += 6;
                                });
                                y += 10;

                                // Discussion
                                doc.setFont('helvetica', 'bold');
                                doc.text('SVOLGIMENTO E DELIBERAZIONI:', margin, y);
                                y += 8;

                                data.agenda.forEach((item: any, index: number) => {
                                  if (y > 250) {
                                    doc.addPage();
                                    y = 20;
                                  }
                                  
                                  doc.setFont('helvetica', 'bold');
                                  doc.text(`Punto ${index + 1}: ${item.title}`, margin, y);
                                  y += 6;
                                  
                                  doc.setFont('helvetica', 'normal');
                                  const discText = `Discussione: ${item.discussion}`;
                                  const splitDisc = doc.splitTextToSize(discText, 170);
                                  doc.text(splitDisc, margin + 5, y);
                                  y += (splitDisc.length * 6) + 2;

                                  const decText = `Deliberazione: ${item.decision}`;
                                  const splitDec = doc.splitTextToSize(decText, 170);
                                  doc.setFont('helvetica', 'italic');
                                  doc.text(splitDec, margin + 5, y);
                                  y += (splitDec.length * 6) + 8;
                                });

                                // Footer
                                if (y > 240) {
                                  doc.addPage();
                                  y = 20;
                                }
                                y += 20;
                                doc.setFont('helvetica', 'normal');
                                doc.text('Non essendovi altro da deliberare, la seduta è tolta alle ore ________.', margin, y);
                                y += 30;

                                // Signatures
                                doc.text('Il Segretario', margin + 20, y);
                                doc.text('Il Presidente', 130, y);
                                y += 15;
                                doc.text('__________________________', margin + 10, y);
                                doc.text('__________________________', 120, y);

                                doc.save(`Verbale_${data.date}_${data.title.replace(/\s+/g, '_')}.pdf`);
                              } catch (e) {
                                console.error('Error parsing content:', e);
                              }
                            }}
                            className="p-2 text-stone-400 hover:text-stone-900 transition-colors"
                            title="Scarica PDF Generato"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}

                        {isStaff && (
                          <div className="flex gap-2 ml-2 pl-2 border-l border-stone-100">
                            <button onClick={() => setEditingMinute(m)} className="text-stone-300 hover:text-stone-900 transition-colors">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => deleteMinute(m)} className="text-stone-300 hover:text-red-500 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-12 border-2 border-dashed border-stone-100 rounded-[2rem]">
                      <FileText className="w-12 h-12 text-stone-100 mx-auto mb-4" />
                      <p className="text-stone-400">Nessun verbale presente in archivio.</p>
                    </div>
                  )}
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
                            <button onClick={() => deleteAppointment(a)} className="text-stone-300 hover:text-red-500">
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
                            <button onClick={() => deleteNews(n)} className="p-2 text-red-400 hover:text-white hover:bg-red-500 bg-red-50 border border-red-100 rounded-lg transition-all" title="Elimina Definitivamente">
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
                            onClick={() => deleteGalleryItem(item)}
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
                              deletePoll(p);
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
                                const newOption = { id: Date.now() + Math.random(), text };
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
                          {poll.votes?.map((vote: any) => (
                            <div key={`${vote.email}-${vote.date}`} className="p-3 bg-stone-50 rounded-xl border border-stone-100">
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

            {activeTab === 'contests' && (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-serif text-stone-900">Gestione Concorsi & Rassegne</h2>
                  <button 
                    onClick={() => setEditingContest({})}
                    className="flex items-center gap-2 bg-stone-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-stone-800 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Nuovo Concorso
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {contests.map((contest: any) => (
                    <div key={contest.id} className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm hover:shadow-md transition-all">
                      <div className="flex flex-col md:flex-row gap-6">
                        {contest.image && (
                          <div className="w-full md:w-48 h-32 rounded-2xl overflow-hidden flex-shrink-0">
                            <img src={contest.image} alt={contest.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                        )}
                        <div className="flex-1 space-y-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 bg-stone-100 text-stone-600 text-[10px] font-bold uppercase tracking-widest rounded">{contest.type}</span>
                                {contest.showOnHomepage ? (
                                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-widest rounded">In Homepage</span>
                                ) : (
                                  <span className="px-2 py-0.5 bg-stone-100 text-stone-400 text-[10px] font-bold uppercase tracking-widest rounded">Nascosto</span>
                                )}
                              </div>
                              <h3 className="text-xl font-serif text-stone-900">{contest.title}</h3>
                              <p className="text-stone-500 text-sm line-clamp-2">{contest.description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => setEditingContest(contest)}
                                className="p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-all"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => deleteContest(contest)}
                                className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                            <div className="space-y-1">
                              <p className="text-stone-400 uppercase font-bold tracking-widest">Inizio Iscrizioni</p>
                              <p className="text-stone-900">{new Date(contest.startDate).toLocaleDateString('it-IT')}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-stone-400 uppercase font-bold tracking-widest">Fine Iscrizioni</p>
                              <p className="text-stone-900">{new Date(contest.endDate).toLocaleDateString('it-IT')}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-stone-400 uppercase font-bold tracking-widest">Costo</p>
                              <p className="text-stone-900">{contest.cost > 0 ? `€ ${contest.cost}` : 'Gratuito'}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-stone-400 uppercase font-bold tracking-widest">Iscritti</p>
                              <p className="text-stone-900">{contestRegistrations.filter((r: any) => r.contestId === contest.id).length}</p>
                            </div>
                          </div>

                          <div className="pt-4 border-t border-stone-100 flex flex-wrap gap-3">
                            <button 
                              onClick={() => setShowRegistrationDetails(contest)}
                              className="flex items-center gap-2 px-4 py-2 bg-stone-100 text-stone-900 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-stone-200 transition-all"
                            >
                              <Users className="w-4 h-4" />
                              Gestisci Iscritti
                            </button>
                            <button 
                              onClick={() => exportContestRegistrations(contest.id)}
                              className="flex items-center gap-2 px-4 py-2 bg-stone-100 text-stone-900 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-stone-200 transition-all"
                            >
                              <Download className="w-4 h-4" />
                              Esporta Lista
                            </button>
                            <button 
                              onClick={() => {
                                // In a real app, this would open a communication modal
                                alert('Funzionalità di comunicazione in fase di sviluppo.');
                              }}
                              className="flex items-center gap-2 px-4 py-2 bg-stone-100 text-stone-900 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-stone-200 transition-all"
                            >
                              <Mail className="w-4 h-4" />
                              Invia Comunicazione
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <AnimatePresence mode="wait">
        {editingContest && (
          <motion.div 
            key="contest-modal" 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] overflow-y-auto p-4 md:p-8"
          >
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditingContest(null)} />
            <div className="flex min-h-full items-center justify-center">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl max-w-4xl w-full overflow-hidden"
              >
                <button 
                  onClick={() => setEditingContest(null)}
                  className="absolute top-4 right-4 md:top-6 md:right-6 text-stone-400 hover:text-stone-900 transition-colors z-50 p-2 bg-white/80 backdrop-blur-sm hover:bg-white rounded-full shadow-sm border border-stone-100"
                >
                  <X className="w-6 h-6" />
                </button>

                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center">
                    <Trophy className="w-8 h-8 text-stone-900" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-serif text-stone-900">{editingContest.id ? 'Modifica Concorso' : 'Nuovo Concorso'}</h3>
                    <p className="text-stone-500 text-sm">Configura i dettagli del concorso o rassegna</p>
                  </div>
                </div>

                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const data = Object.fromEntries(formData);
                    
                    // Get winners from hidden input
                    const winnersInput = e.currentTarget.querySelector('input[name="winners"]') as HTMLInputElement;
                    const winnersValue = winnersInput?.value || '[]';
                    
                    const contestData = { 
                      ...editingContest, 
                      ...data, 
                      cost: Number(data.cost) || 0,
                      showOnHomepage: data.showOnHomepage === 'on',
                      winners: winnersValue 
                    };
                    
                    addContest(contestData);
                  }}
                  className="space-y-8"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1 ml-1">Titolo</label>
                        <input name="title" defaultValue={editingContest.title} className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-stone-900 outline-none" required />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1 ml-1">Tipo (es. Pittura, Musica)</label>
                        <input name="type" defaultValue={editingContest.type} className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-stone-900 outline-none" required />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1 ml-1">Descrizione</label>
                        <textarea name="description" defaultValue={editingContest.description} className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-stone-900 outline-none h-32 resize-none" required />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1 ml-1">URL Immagine</label>
                        <input name="image" defaultValue={editingContest.image} className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-stone-900 outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1 ml-1">Carica Immagine (JPG/PNG)</label>
                        <div className="flex items-center gap-3">
                          <input 
                            type="file" 
                            accept="image/jpeg,image/png"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file && editingContest.id) {
                                await handleContestImageUpload(editingContest.id, file);
                              }
                            }}
                            className="hidden" 
                            id="contest-image-upload" 
                          />
                          <label 
                            htmlFor="contest-image-upload"
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-stone-200 text-stone-500 hover:border-stone-900 hover:text-stone-900 transition-all cursor-pointer text-xs font-bold uppercase tracking-widest"
                          >
                            {uploadingContestId === editingContest.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-stone-900 border-t-transparent" />
                            ) : (
                              <>
                                <Upload className="w-4 h-4" />
                                {editingContest.image ? 'Cambia Immagine' : 'Seleziona Immagine'}
                              </>
                            )}
                          </label>
                        </div>
                        {!editingContest.id && (
                          <p className="text-[10px] text-stone-400 mt-1 italic">Potrai caricare l'immagine dopo aver creato il concorso.</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1 ml-1">Inizio Iscrizioni</label>
                          <input name="startDate" type="date" defaultValue={editingContest.startDate ? new Date(editingContest.startDate).toISOString().split('T')[0] : ''} className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-stone-900 outline-none" required />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1 ml-1">Fine Iscrizioni</label>
                          <input name="endDate" type="date" defaultValue={editingContest.endDate ? new Date(editingContest.endDate).toISOString().split('T')[0] : ''} className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-stone-900 outline-none" required />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1 ml-1">Costo Iscrizione (€)</label>
                        <input name="cost" type="number" step="0.01" defaultValue={editingContest.cost} className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-stone-900 outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1 ml-1">Premi / Attestati</label>
                        <textarea name="prizes" defaultValue={editingContest.prizes} className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-stone-900 outline-none h-24 resize-none" />
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-stone-50 rounded-xl border border-stone-100">
                        <input 
                          type="checkbox" 
                          name="showOnHomepage" 
                          defaultChecked={editingContest.showOnHomepage} 
                          className="w-4 h-4 rounded border-stone-300 text-stone-900 focus:ring-stone-900"
                        />
                        <label className="text-sm text-stone-700 font-medium">Visualizza sulla Homepage</label>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-stone-100">
                    <h4 className="text-sm font-bold text-stone-900 uppercase tracking-widest mb-4">Albo Vincitori</h4>
                    <WinnerManagement 
                      initialWinners={editingContest.winners ? JSON.parse(editingContest.winners) : []} 
                      onChange={(winners) => {
                        const input = document.querySelector('input[name="winners"]') as HTMLInputElement;
                        if (input) input.value = JSON.stringify(winners);
                      }}
                    />
                    <input type="hidden" name="winners" defaultValue={editingContest.winners || '[]'} />
                  </div>

                  <div className="flex justify-end gap-4 pt-6 border-t border-stone-100">
                    <button 
                      type="button" 
                      onClick={() => setEditingContest(null)}
                      className="px-8 py-4 rounded-xl text-sm font-bold text-stone-500 hover:bg-stone-50 transition-all"
                    >
                      Annulla
                    </button>
                    <button 
                      type="submit"
                      className="px-12 py-4 bg-stone-900 text-white rounded-xl text-sm font-bold hover:bg-stone-800 transition-all shadow-lg shadow-stone-900/20"
                    >
                      {editingContest.id ? 'Salva Modifiche' : 'Crea Concorso'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </motion.div>
        )}

        {showRegistrationDetails && (
          <motion.div 
            key="registration-list-modal" 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] overflow-y-auto p-2 md:p-8"
          >
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowRegistrationDetails(null)} />
            <div className="flex min-h-full items-center justify-center">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-white p-4 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl max-w-5xl w-full overflow-hidden"
              >
                <button 
                  onClick={() => setShowRegistrationDetails(null)}
                  className="absolute top-4 right-4 md:top-6 md:right-6 text-stone-400 hover:text-stone-900 transition-colors z-50 p-2 bg-white/80 backdrop-blur-sm hover:bg-white rounded-full shadow-sm border border-stone-100"
                >
                  <X className="w-5 h-5 md:w-6 md:h-6" />
                </button>

                <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-stone-100 rounded-xl md:rounded-2xl flex items-center justify-center">
                    <Users className="w-6 h-6 md:w-8 md:h-8 text-stone-900" />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-2xl font-serif text-stone-900">Iscritti: {showRegistrationDetails.title}</h3>
                    <p className="text-stone-500 text-[10px] md:text-sm">Gestione partecipanti e comunicazioni</p>
                  </div>
                </div>

                <div className="overflow-x-auto -mx-4 px-4">
                  <table className="w-full text-left text-xs md:text-sm min-w-[600px]">
                    <thead>
                      <tr className="text-stone-400 uppercase text-[9px] md:text-[10px] tracking-widest border-b border-stone-100">
                        <th className="pb-4 font-semibold">Partecipante</th>
                        <th className="pb-4 font-semibold">Contatti</th>
                        <th className="pb-4 font-semibold">Minorenne</th>
                        <th className="pb-4 font-semibold">Stato</th>
                        <th className="pb-4 font-semibold text-right">Azioni</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-50">
                      {contestRegistrations
                        .filter((r: any) => r.contestId === showRegistrationDetails.id)
                        .map((reg: any) => (
                          <tr key={reg.id} className="group hover:bg-stone-50 transition-colors">
                            <td className="py-3 md:py-4">
                              <p className="font-medium text-stone-900">{reg.name}</p>
                              <p className="text-[9px] md:text-[10px] text-stone-400 uppercase tracking-widest">{new Date(reg.date).toLocaleDateString()}</p>
                            </td>
                            <td className="py-3 md:py-4">
                              <p className="text-stone-600">{reg.email}</p>
                              <p className="text-stone-500 text-[10px] md:text-xs">{reg.phone}</p>
                            </td>
                            <td className="py-3 md:py-4">
                              {reg.isMinor ? (
                                <div className="space-y-1">
                                  <span className="px-1.5 py-0.5 bg-amber-50 text-amber-600 text-[9px] md:text-[10px] font-bold uppercase rounded">Sì</span>
                                  <p className="text-[9px] md:text-[10px] text-stone-400">Genitore: {reg.parentName}</p>
                                </div>
                              ) : (
                                <span className="px-1.5 py-0.5 bg-stone-100 text-stone-400 text-[9px] md:text-[10px] font-bold uppercase rounded">No</span>
                              )}
                            </td>
                            <td className="py-3 md:py-4">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] md:text-[10px] font-bold uppercase ${
                                reg.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                              }`}>
                                {reg.status === 'confirmed' ? 'Confermato' : 'In Attesa'}
                              </span>
                            </td>
                            <td className="py-3 md:py-4 text-right">
                              <div className="flex items-center justify-end gap-1 md:gap-2">
                                {reg.status !== 'confirmed' && (
                                  <button 
                                    onClick={() => updateRegistrationStatus(reg.id, 'confirmed')}
                                    className="p-1.5 md:p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                    title="Conferma Iscrizione"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                  </button>
                                )}
                                <button 
                                  onClick={() => deleteContestRegistration(reg)}
                                  className="p-1.5 md:p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                  title="Elimina"
                                >
                                  <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      {contestRegistrations.filter((r: any) => r.contestId === showRegistrationDetails.id).length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-stone-400 italic text-xs md:text-sm">Nessun iscritto per questo concorso.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {selectedRegistration && (
          <motion.div 
            key="registration-detail-modal" 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] overflow-y-auto p-2 md:p-8"
          >
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedRegistration(null)} />
            <div className="flex min-h-full items-center justify-center">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-white p-5 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl max-w-2xl w-full overflow-hidden"
              >
                <button 
                  onClick={() => setSelectedRegistration(null)}
                  className="absolute top-4 right-4 md:top-6 md:right-6 text-stone-400 hover:text-stone-900 transition-colors z-50 p-2 bg-white/80 backdrop-blur-sm hover:bg-white rounded-full shadow-sm border border-stone-100"
                >
                  <X className="w-5 h-5 md:w-6 md:h-6" />
                </button>

                <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-stone-100 rounded-xl md:rounded-2xl flex items-center justify-center">
                    <UserPlus className="w-6 h-6 md:w-8 md:h-8 text-stone-900" />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-serif text-stone-900">Dettaglio Richiesta</h3>
                    <p className="text-stone-500 text-xs md:text-sm">Inviata il {new Date(selectedRegistration.date).toLocaleDateString('it-IT')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  <div className="space-y-4 md:space-y-6">
                    <div>
                      <label className="block text-[9px] md:text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Dati Anagrafici</label>
                      <p className="text-base md:text-lg font-medium text-stone-900">{selectedRegistration.name}</p>
                      <p className="text-sm text-stone-500">{selectedRegistration.email}</p>
                      <p className="text-sm text-stone-500">{selectedRegistration.phone || 'Nessun telefono'}</p>
                    </div>
                    <div>
                      <label className="block text-[9px] md:text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Messaggio del Socio</label>
                      <p className="text-xs md:text-stone-600 bg-stone-50 p-3 md:p-4 rounded-xl md:rounded-2xl border border-stone-100 italic">
                        "{selectedRegistration.message || 'Nessun messaggio accompagnatorio'}"
                      </p>
                    </div>
                  </div>

                  <div className="bg-stone-900 rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 text-white space-y-4 md:space-y-6">
                    <div className="flex items-center gap-2 md:gap-3 text-emerald-400">
                      <ShieldCheck className="w-4 h-4 md:w-5 md:h-5" />
                      <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest">Verifica Sicurezza</span>
                    </div>
                    <p className="text-xs md:text-sm text-stone-300 leading-relaxed">
                      L'approvazione creerà automaticamente un account socio con l'email fornita. Il socio riceverà una notifica di benvenuto.
                    </p>
                    <div className="pt-2 md:pt-4 space-y-2 md:space-y-3">
                      <button 
                        onClick={() => approveRegistration(selectedRegistration)}
                        className="w-full bg-emerald-500 text-white py-3 md:py-4 rounded-xl font-bold hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 text-sm md:text-base"
                      >
                        Approva Iscrizione
                      </button>
                      <button 
                        onClick={() => deleteRegistration(selectedRegistration)}
                        className="w-full bg-white/10 text-white py-3 md:py-4 rounded-xl font-bold hover:bg-white/20 transition-all text-sm md:text-base"
                      >
                        Rifiuta
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {showEmailConfirmation && (
          <motion.div 
            key="email-confirmation-modal" 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] overflow-y-auto p-2 md:p-8"
          >
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowEmailConfirmation(null)} />
            <div className="flex min-h-full items-center justify-center">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-white p-4 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl max-w-2xl w-full overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1.5 md:h-2 bg-emerald-500" />
                
                <button 
                  onClick={() => setShowEmailConfirmation(null)}
                  className="absolute top-4 right-4 md:top-6 md:right-6 text-stone-400 hover:text-stone-900 transition-colors z-50 p-2 bg-white/80 backdrop-blur-sm hover:bg-white rounded-full shadow-sm border border-stone-100"
                >
                  <X className="w-5 h-5 md:w-6 md:h-6" />
                </button>

              <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-emerald-100 rounded-xl md:rounded-2xl flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg md:text-2xl font-serif text-stone-900">Iscrizione Approvata</h3>
                  <p className="text-stone-500 text-[10px] md:text-sm">Email di benvenuto inviata con successo</p>
                </div>
              </div>

              <div className="bg-stone-50 rounded-2xl md:rounded-3xl border border-stone-200 overflow-hidden">
                <div className="bg-stone-100 px-4 md:px-6 py-2 md:py-3 border-b border-stone-200 flex flex-col md:flex-row md:justify-between md:items-center gap-1">
                  <span className="text-[8px] md:text-[10px] font-bold text-stone-400 uppercase tracking-widest">Anteprima Email Inviata</span>
                  <span className="text-[8px] md:text-[10px] text-stone-400 italic">Destinatario: {showEmailConfirmation.email}</span>
                </div>
                <div className="p-4 md:p-8 space-y-4 md:space-y-6 text-stone-700">
                  <p className="font-serif text-lg md:text-xl text-stone-900">Benvenuto in Pro San Felice, {showEmailConfirmation.name}!</p>
                  
                  <p className="text-xs md:text-sm leading-relaxed">
                    Siamo felici di comunicarti che la tua richiesta di iscrizione è stata approvata dal consiglio direttivo. 
                    Da questo momento sei ufficialmente un socio della nostra associazione.
                  </p>

                  <div className="p-4 md:p-6 bg-white rounded-xl md:rounded-2xl border border-stone-200 space-y-3 md:space-y-4">
                    <h4 className="text-[10px] md:text-xs font-bold text-stone-900 uppercase tracking-widest">I tuoi dati di accesso:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                      <div>
                        <label className="block text-[8px] md:text-[10px] text-stone-400 uppercase">Username / Email</label>
                        <p className="text-xs md:text-sm font-medium">{showEmailConfirmation.email}</p>
                      </div>
                      <div>
                        <label className="block text-[8px] md:text-[10px] text-stone-400 uppercase">Password</label>
                        <p className="text-xs md:text-sm font-mono">******** (quella scelta da te)</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 md:space-y-3">
                    <h4 className="text-[10px] md:text-xs font-bold text-stone-900 uppercase tracking-widest">Istruzioni per il versamento:</h4>
                    <p className="text-xs md:text-sm leading-relaxed">
                      Per completare l'attivazione, è necessario versare la quota associativa annuale stabilita. 
                      Puoi effettuare il versamento tramite:
                    </p>
                    <ul className="text-xs md:text-sm space-y-1 md:space-y-2 list-disc pl-5 text-stone-600">
                      <li>Bonifico Bancario: IT 00 X 00000 00000 000000000000</li>
                      <li>Presso la nostra sede negli orari di apertura</li>
                      <li>Durante il prossimo evento associativo</li>
                    </ul>
                  </div>

                  <p className="text-[10px] text-stone-400 pt-3 md:pt-4 border-t border-stone-100">
                    Questa è una simulazione dell'email che verrebbe inviata al socio.
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setShowEmailConfirmation(null)}
                className="w-full mt-6 md:mt-8 bg-stone-900 text-white py-3 md:py-4 rounded-xl font-bold hover:bg-stone-800 transition-all text-sm md:text-base"
              >
                Ho capito, chiudi
              </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {showFeeSettings && (
          <motion.div 
            key="fee-settings-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] overflow-y-auto p-2 md:p-8"
          >
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowFeeSettings(false)} />
            <div className="flex min-h-full items-center justify-center">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-white p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl max-w-md w-full"
              >
                <button 
                  onClick={() => setShowFeeSettings(false)}
                  className="absolute top-4 right-4 md:top-6 md:right-6 text-stone-400 hover:text-stone-900 transition-colors z-50 p-2 bg-white/80 backdrop-blur-sm hover:bg-white rounded-full shadow-sm border border-stone-100"
                >
                  <X className="w-5 h-5 md:w-6 md:h-6" />
                </button>

              <div className="mb-6 md:mb-8">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-stone-100 rounded-xl md:rounded-2xl flex items-center justify-center mb-4">
                  <Settings className="w-5 h-5 md:w-6 md:h-6 text-stone-900" />
                </div>
                <h3 className="text-xl md:text-2xl font-serif text-stone-900 mb-2">Quote Associative</h3>
                <p className="text-stone-500 text-xs md:text-sm">Imposta la quota stabilita per ogni anno sociale. Ogni modifica verrà notificata ai nuovi iscritti.</p>
              </div>

              <div className="space-y-3 md:space-y-4">
                {[2024, 2025, 2026].map(year => (
                  <div key={year} className="flex items-center justify-between p-3 md:p-4 bg-stone-50 rounded-xl md:rounded-2xl border border-stone-100">
                    <span className="font-bold text-stone-900 text-sm md:text-base">Anno {year}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-stone-400 font-medium text-sm md:text-base">€</span>
                      <input 
                        type="number" 
                        value={membershipFees[year]} 
                        onChange={(e) => setMembershipFees({ ...membershipFees, [year]: parseInt(e.target.value) || 0 })}
                        className="w-16 md:w-20 px-2 md:px-3 py-1.5 md:py-2 rounded-lg md:rounded-xl border border-stone-200 text-right font-bold text-stone-900 focus:ring-2 focus:ring-stone-900 outline-none text-sm md:text-base"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 md:mt-8 space-y-3">
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
                  className="w-full bg-stone-900 text-white py-3 md:py-4 rounded-xl font-bold hover:bg-stone-800 transition-all shadow-lg shadow-stone-900/20 text-sm md:text-base"
                >
                  Salva e Notifica
                </button>
              </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modali di Conferma Eliminazione */}
      <AnimatePresence mode="wait">
        {contestToDelete && (
          <motion.div 
            key="delete-contest-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-[1.5rem] md:rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl"
              >
                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6">
                  <Trash2 className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-serif text-stone-900 mb-2">Elimina Concorso</h3>
                <p className="text-stone-500 text-sm mb-8">
                  Sei sicuro di voler eliminare il concorso <span className="font-bold text-stone-900">"{contestToDelete.title}"</span>? Questa azione eliminerà anche tutte le iscrizioni associate.
                </p>
                <div className="flex gap-3">
                  <button 
                    disabled={isDeleting}
                    onClick={() => setContestToDelete(null)}
                    className="flex-1 py-4 rounded-xl font-bold text-stone-500 hover:bg-stone-50 transition-all disabled:opacity-50"
                  >
                    Annulla
                  </button>
                  <button 
                    disabled={isDeleting}
                    onClick={async () => {
                      setIsDeleting(true);
                      try {
                        const response = await fetch(`/api/contests/${contestToDelete.id}`, { method: 'DELETE' });
                        if (response.ok) {
                          setNotification({ message: 'Concorso eliminato con successo!', type: 'success' });
                          await fetchData();
                          setContestToDelete(null);
                        } else {
                          const errorData = await response.json();
                          setNotification({ message: 'Errore: ' + (errorData.error || 'Impossibile eliminare'), type: 'error' });
                        }
                      } catch (error) {
                        setNotification({ message: 'Errore di connessione', type: 'error' });
                      } finally {
                        setIsDeleting(false);
                      }
                    }}
                    className="flex-1 py-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 disabled:opacity-50 flex items-center justify-center"
                  >
                    {isDeleting ? 'Eliminazione...' : 'Elimina'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {registrationToDelete && (
            <motion.div 
              key="delete-registration-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-[1.5rem] md:rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl"
              >
                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6">
                  <UserPlus className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-serif text-stone-900 mb-2">Elimina Iscrizione</h3>
                <p className="text-stone-500 text-sm mb-8">
                  Sei sicuro di voler eliminare l'iscrizione di <span className="font-bold text-stone-900">{registrationToDelete.name}</span>?
                </p>
                <div className="flex gap-3">
                  <button 
                    disabled={isDeleting}
                    onClick={() => setRegistrationToDelete(null)}
                    className="flex-1 py-4 rounded-xl font-bold text-stone-500 hover:bg-stone-50 transition-all disabled:opacity-50"
                  >
                    Annulla
                  </button>
                  <button 
                    disabled={isDeleting}
                    onClick={async () => {
                      setIsDeleting(true);
                      try {
                        const response = await fetch(`/api/contest-registrations/${registrationToDelete.id}`, { method: 'DELETE' });
                        if (response.ok) {
                          setNotification({ message: 'Iscrizione eliminata!', type: 'success' });
                          await fetchData();
                          setRegistrationToDelete(null);
                        }
                      } catch (error) {
                        setNotification({ message: 'Errore di connessione', type: 'error' });
                      } finally {
                        setIsDeleting(false);
                      }
                    }}
                    className="flex-1 py-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all disabled:opacity-50"
                  >
                    {isDeleting ? '...' : 'Elimina'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {lotteryToDelete && (
            <motion.div 
              key="delete-lottery-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-[1.5rem] md:rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl"
              >
                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6">
                  <Ticket className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-serif text-stone-900 mb-2">Elimina Lotteria</h3>
                <p className="text-stone-500 text-sm mb-8">
                  Vuoi eliminare definitivamente la lotteria <span className="font-bold text-stone-900">"{lotteryToDelete.name}"</span> dall'archivio?
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setLotteryToDelete(null)} className="flex-1 py-4 rounded-xl font-bold text-stone-500 hover:bg-stone-50 transition-all">Annulla</button>
                  <button 
                    onClick={async () => {
                      const updatedLottery = {
                        ...lottery,
                        history: lottery.history.filter((h: any) => h.id !== lotteryToDelete.id)
                      };
                      await saveLottery(updatedLottery);
                      setNotification({ message: 'Lotteria eliminata dall\'archivio', type: 'success' });
                      setLotteryToDelete(null);
                    }}
                    className="flex-1 py-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all"
                  >
                    Elimina
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {pollToDelete && (
            <motion.div 
              key="delete-poll-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-[1.5rem] md:rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl"
              >
                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6">
                  <Vote className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-serif text-stone-900 mb-2">Elimina Sondaggio</h3>
                <p className="text-stone-500 text-sm mb-8">
                  Vuoi eliminare il sondaggio <span className="font-bold text-stone-900">"{pollToDelete.question}"</span>?
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setPollToDelete(null)} className="flex-1 py-4 rounded-xl font-bold text-stone-500 hover:bg-stone-50 transition-all">Annulla</button>
                  <button 
                    onClick={async () => {
                      try {
                        await fetch(`/api/polls/${pollToDelete.id}`, { method: 'DELETE' });
                        setPolls(polls.filter((p: any) => p.id !== pollToDelete.id));
                        if (poll?.id === pollToDelete.id) {
                          createNewPoll();
                        }
                        setNotification({ message: 'Sondaggio eliminato', type: 'success' });
                        setPollToDelete(null);
                      } catch (error) {
                        console.error('Error deleting poll:', error);
                        setNotification({ message: 'Errore durante l\'eliminazione', type: 'error' });
                      }
                    }}
                    className="flex-1 py-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all"
                  >
                    Elimina
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <MeetingMinutesWizard 
          isOpen={showWizard}
          onClose={() => setShowWizard(false)}
          onSuccess={() => {
            fetchData();
            setShowWizard(false);
          }}
        />

      <AnimatePresence>
        {notification && (
          <motion.div
            key="notification-toast"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100]"
          >
              <div className={`px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border ${
                notification.type === 'success' 
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-900' 
                  : 'bg-red-50 border-red-100 text-red-900'
              }`}>
                {notification.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
                <span className="text-sm font-medium">{notification.message}</span>
                <button 
                  onClick={() => setNotification(null)}
                  className="ml-2 p-1 hover:bg-black/5 rounded-lg transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
}
