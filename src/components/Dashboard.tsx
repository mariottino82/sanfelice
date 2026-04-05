import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, FileText, Calendar, Euro, Plus, TrendingUp, LogOut, Shield, UserPlus, Settings, UserCheck, Trash2, Edit2, Ticket, Gift, CheckCircle2, Newspaper, Facebook, Instagram, Youtube, Share2, Image as ImageIcon, Video, Vote, Menu, X, ShieldCheck, Wand2, Download, Upload, Trophy, ClipboardCheck, Mail, Phone, XCircle, AlertCircle, ChevronRight, ChevronLeft, Building, Save, Send, Loader2, Inbox, Archive, RotateCcw, Reply, Forward, Paperclip, MoreVertical, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Search, Zap, RefreshCw, CreditCard, BarChart, Heart, Copy, ExternalLink, FileCheck } from 'lucide-react';
import { MeetingMinutesWizard } from './MeetingMinutesWizard';
import { BookingsManagement } from './BookingsManagement';
import { DonationsManagement } from './DonationsManagement';
import { PollsManagement } from './PollsManagement';
import { VotazioniSection } from './VotazioniSection';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'sonner';

const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = url;
  });
};

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
  
  // Visitors State
  const [visitorsData, setVisitorsData] = React.useState<any>(null);

  // Email Client State
  const [emails, setEmails] = React.useState<any[]>([]);
  const [folders, setFolders] = React.useState<any[]>([]);
  const [selectedFolder, setSelectedFolder] = React.useState('INBOX');
  const [selectedEmail, setSelectedEmail] = React.useState<any>(null);
  const [isComposing, setIsComposing] = React.useState(false);
  const [composeData, setComposeData] = React.useState<any>({ to: '', subject: '', body: '', attachments: [] });
  const [emailSearchQuery, setEmailSearchQuery] = React.useState('');
  const [emailPage, setEmailPage] = React.useState(1);
  const [isLoadingEmails, setIsLoadingEmails] = React.useState(false);
  const [emailTotalPages, setEmailTotalPages] = React.useState(1);
  const [isReplying, setIsReplying] = React.useState(false);
  const [isForwarding, setIsForwarding] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [showVoteModal, setShowVoteModal] = React.useState(false);
  const [hasDismissedVoteModal, setHasDismissedVoteModal] = React.useState(false);
  const [pendingVotePoll, setPendingVotePoll] = React.useState<any>(null);
  const [members, setMembers] = React.useState([]);
  const [collections, setCollections] = React.useState([]);
  const [news, setNews] = React.useState([]);
  const [polls, setPolls] = React.useState([]);
  const [lottery, setLottery] = React.useState<any>({
    active: false,
    showOnHomepage: true,
    name: '',
    drawDate: '',
    ticketsCount: 1000,
    ticketPrice: 2.50,
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

  const [bookingEvents, setBookingEvents] = React.useState<any[]>([]);
  const [bookings, setBookings] = React.useState<any[]>([]);
  const [editingBookingEvent, setEditingBookingEvent] = React.useState<any>(null);
  const [bookingEventToDelete, setBookingEventToDelete] = React.useState<any>(null);
  const [bookingToDelete, setBookingToDelete] = React.useState<any>(null);
  const [selectedBookingEventForDetails, setSelectedBookingEventForDetails] = React.useState<any>(null);
  const [isDeletingBooking, setIsDeletingBooking] = React.useState(false);
  const [isSavingBookingEvent, setIsSavingBookingEvent] = React.useState(false);

  React.useEffect(() => {
    // Check for active internal elections that the user hasn't voted in
    const checkPendingVotes = () => {
      const userIdentifier = user?.email || user?.username;
      if (!userIdentifier || polls.length === 0 || showVoteModal || hasDismissedVoteModal) return;
      
      const pending = polls.find((p: any) => {
        const isElection = p.type === 'election';
        const isActive = p.active;
        const hasNotVoted = !p.votes || !Array.isArray(p.votes) || !p.votes.includes(userIdentifier);
        
        let isNotExpired = true;
        if (p.endDate) {
          const end = new Date(p.endDate);
          if (p.endDate.includes('T') === false) {
            end.setHours(23, 59, 59, 999);
          }
          isNotExpired = end > new Date();
        }

        return isElection && isActive && isNotExpired && hasNotVoted;
      });
      
      if (pending) {
        setPendingVotePoll(pending);
        setShowVoteModal(true);
      }
    };
    
    checkPendingVotes();
  }, [polls, user?.email, user?.username, showVoteModal, hasDismissedVoteModal]);

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
  const [associationDetails, setAssociationDetails] = React.useState({
    name: 'Pro San Felice',
    address: 'Via Salita la Chiesa, 19 - 86020 - Colle d\'Anchise (CB)',
    cf: '92083740701',
    email: 'sanfeliceassociazione@gmail.com',
    legalRepresentative: '___________________________',
    municipality: 'Colle d\'Anchise',
    province: 'CB',
    phone: ''
  });

  const [emailSettings, setEmailSettings] = React.useState<any>({
    smtp_host: 'smtp.gmail.com',
    smtp_port: '465',
    smtp_user: '',
    smtp_pass: '',
    imap_host: 'imap.gmail.com',
    imap_port: '993',
    imap_user: '',
    imap_pass: '',
    imap_tls: true,
    protocol: 'imap',
    from_email: '',
    from_name: ''
  });

  const [paypalSettings, setPaypalSettings] = React.useState<any>({
    paypal_me_link: '',
    instructions: 'Per completare la prenotazione, effettua il pagamento tramite PayPal.me. Una volta completato, clicca sul pulsante di conferma.'
  });

  const [emailForm, setEmailForm] = React.useState({
    to: '',
    subject: '',
    message: ''
  });
  const [isSendingEmail, setIsSendingEmail] = React.useState(false);

  const [liveStream, setLiveStream] = React.useState({
    active: false,
    url: '',
    type: 'youtube'
  });
  const [isTestingConnection, setIsTestingConnection] = React.useState(false);

  const handleSendEmail = async () => {
    if (!emailForm.to || !emailForm.subject || !emailForm.message) {
      setNotification({ message: 'Compila tutti i campi', type: 'error' });
      return;
    }

    setIsSendingEmail(true);
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: emailForm.to,
          subject: emailForm.subject,
          text: emailForm.message,
          html: `<div style="font-family: sans-serif; line-height: 1.6; color: #333;">
            ${emailForm.message.replace(/\n/g, '<br>')}
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #777;">
              Questa è una comunicazione automatica da <strong>${associationDetails.name}</strong>.
            </p>
          </div>`
        })
      });

      if (response.ok) {
        setNotification({ message: 'Email inviata con successo!', type: 'success' });
        setEmailForm({ to: '', subject: '', message: '' });
      } else {
        const error = await response.json();
        setNotification({ message: `Errore: ${error.error}`, type: 'error' });
      }
    } catch (error) {
      setNotification({ message: 'Errore di connessione', type: 'error' });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const [editingMember, setEditingMember] = React.useState<any>(null);
  const [editingCollection, setEditingCollection] = React.useState<any>(null);
  const [showSponsorshipModal, setShowSponsorshipModal] = React.useState(false);

  const [isSendingContestComm, setIsSendingContestComm] = React.useState(false);
  const [selectedContestForComm, setSelectedContestForComm] = React.useState<any>(null);
  const [contestCommForm, setContestCommForm] = React.useState({
    title: '',
    message: '',
    attachment: null as File | null
  });
  const [contestCommHistory, setContestCommHistory] = React.useState<any[]>([]);
  const [isLoadingCommHistory, setIsLoadingCommHistory] = React.useState(false);

  const fetchContestCommHistory = async (contestId: number) => {
    setIsLoadingCommHistory(true);
    try {
      const response = await fetch(`/api/contests/${contestId}/communications`);
      if (response.ok) {
        const data = await response.json();
        setContestCommHistory(data);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setIsLoadingCommHistory(false);
    }
  };

  const handleSendContestComm = async () => {
    if (!contestCommForm.title || !contestCommForm.message) {
      toast.error('Inserisci titolo e messaggio');
      return;
    }

    setIsSendingContestComm(true);
    const formData = new FormData();
    formData.append('title', contestCommForm.title);
    formData.append('message', contestCommForm.message);
    if (contestCommForm.attachment) {
      formData.append('attachment', contestCommForm.attachment);
    }

    try {
      const response = await fetch(`/api/contests/${selectedContestForComm.id}/send-communication`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Comunicazione inviata a ${data.recipientsCount} iscritti!`);
        setContestCommForm({ title: '', message: '', attachment: null });
        fetchContestCommHistory(selectedContestForComm.id);
      } else {
        const error = await response.json();
        toast.error(`Errore: ${error.error}`);
      }
    } catch (error) {
      toast.error('Errore durante l\'invio');
    } finally {
      setIsSendingContestComm(false);
    }
  };
  const [showStatementModal, setShowStatementModal] = React.useState(false);
  const [statementDates, setStatementDates] = React.useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [sponsorshipData, setSponsorshipData] = React.useState<any>({
    companyName: '',
    address: '',
    vatNumber: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'BONIFICO',
    description: "Erogazione liberale festività San Felice 2026 - Colle d'Anchise (CB)"
  });
  const [editingMinute, setEditingMinute] = React.useState<any>(null);
  const [editingAppointment, setEditingAppointment] = React.useState<any>(null);
  const [editingNews, setEditingNews] = React.useState<any>(null);
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setNotification({ message: 'Testo copiato negli appunti!', type: 'success' });
    });
  };

  const shareOnFacebook = (url: string) => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(fbUrl, '_blank', 'width=600,height=400');
  };

  const generateSocialPost = (item: any, type: 'news' | 'contest') => {
    const baseUrl = window.location.origin;
    const link = type === 'news' ? `${baseUrl}/news/${item.id}` : `${baseUrl}/contests/${item.id}`;
    
    let text = `📢 ${item.title.toUpperCase()} 📢\n\n`;
    text += `${item.content || item.description}\n\n`;
    
    if (type === 'contest') {
      text += `📅 Inizio: ${new Date(item.startDate).toLocaleDateString('it-IT')}\n`;
      text += `📅 Fine: ${new Date(item.endDate).toLocaleDateString('it-IT')}\n`;
      text += `💰 Costo: ${item.cost > 0 ? `€ ${item.cost}` : 'Gratuito'}\n\n`;
    } else {
      text += `📅 Data: ${new Date(item.date).toLocaleDateString('it-IT')}\n\n`;
    }
    
    text += `Scopri di più sul nostro sito:\n🔗 ${link}\n\n`;
    text += `#ProSanFelice #ColleDAnchise #Molise #EventiMolise #SagreMolise`;
    
    return text;
  };

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
  const [emailToDelete, setEmailToDelete] = React.useState<string | null>(null);
  const [sponsors, setSponsors] = React.useState([]);
  const [editingSponsor, setEditingSponsor] = React.useState<any>(null);
  const [sponsorToDelete, setSponsorToDelete] = React.useState<any>(null);
  const [sponsorImageFile, setSponsorImageFile] = React.useState<File | null>(null);
  const [bookingEventImageFile, setBookingEventImageFile] = React.useState<File | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = React.useState(false);
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

  const addSponsor = async (newSponsor: any) => {
    try {
      let imagePath = newSponsor.image;
      
      if (sponsorImageFile) {
        const formData = new FormData();
        formData.append('image', sponsorImageFile);
        const uploadRes = await fetch('/api/sponsors/upload', {
          method: 'POST',
          body: formData
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          imagePath = uploadData.path;
        } else {
          throw new Error('Errore durante il caricamento dell\'immagine');
        }
      }

      const sponsorData = { ...newSponsor, image: imagePath };
      const method = newSponsor.id ? 'PUT' : 'POST';
      const url = newSponsor.id ? `/api/sponsors/${newSponsor.id}` : '/api/sponsors';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sponsorData)
      });
      
      if (response.ok) {
        setEditingSponsor(null);
        setSponsorImageFile(null);
        setNotification({ message: newSponsor.id ? 'Sponsor aggiornato con successo!' : 'Sponsor creato con successo!', type: 'success' });
        await fetchData();
      } else {
        const errorData = await response.json();
        setNotification({ message: 'Errore dal server: ' + (errorData.error || 'Errore sconosciuto'), type: 'error' });
      }
    } catch (error) {
      console.error('Error adding sponsor:', error);
      setNotification({ message: error instanceof Error ? error.message : 'Errore di connessione', type: 'error' });
    }
  };

  const deleteSponsor = async (id: number) => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/sponsors/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setSponsorToDelete(null);
        setNotification({ message: 'Sponsor eliminato con successo!', type: 'success' });
        await fetchData();
      }
    } catch (error) {
      setNotification({ message: 'Errore di connessione', type: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  const reorderSponsors = async (direction: 'up' | 'down', sponsor: any) => {
    const currentIndex = sponsors.findIndex((s: any) => s.id === sponsor.id);
    if (currentIndex === -1) return;

    const newSponsors = [...sponsors];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= newSponsors.length) return;

    // Swap positions
    const temp = newSponsors[currentIndex];
    newSponsors[currentIndex] = newSponsors[targetIndex];
    newSponsors[targetIndex] = temp;

    // Update position values
    const updatedSponsors = newSponsors.map((s: any, index: number) => ({
      ...s,
      position: index
    }));

    setSponsors(updatedSponsors);

    try {
      const response = await fetch('/api/sponsors/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sponsors: updatedSponsors })
      });

      if (!response.ok) {
        throw new Error('Errore durante il riordinamento');
      }
    } catch (error) {
      console.error('Error reordering sponsors:', error);
      setNotification({ message: 'Errore durante il riordinamento', type: 'error' });
      await fetchData(); // Revert to server state
    }
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

  const handleGalleryUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUploadingGallery(true);
    const formData = new FormData(e.currentTarget);
    const fileInput = e.currentTarget.querySelector('input[type="file"]') as HTMLInputElement;
    const files = fileInput?.files;
    if (!files || files.length === 0) {
      setNotification({ message: 'Seleziona almeno un file', type: 'error' });
      return;
    }

    const uploadData = new FormData();
    for (let i = 0; i < files.length; i++) {
      uploadData.append('files', files[i]);
    }

    try {
      const res = await fetch('/api/upload-gallery', {
        method: 'POST',
        body: uploadData
      });
      if (res.ok) {
        const newItems = await res.json();
        setGallery(prev => [...newItems, ...prev]);
        setNotification({ message: `${newItems.length} elementi aggiunti alla gallery!`, type: 'success' });
        (e.target as HTMLFormElement).reset();
      } else {
        setNotification({ message: 'Errore durante il caricamento', type: 'error' });
      }
    } catch (err) {
      console.error(err);
      setNotification({ message: 'Errore di rete', type: 'error' });
    } finally {
      setIsUploadingGallery(false);
    }
  };

  const handleDeleteGallery = async (id: number) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/gallery/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setGallery(prev => prev.filter(item => item.id !== id));
        setNotification({ message: 'Elemento eliminato!', type: 'success' });
        setGalleryItemToDelete(null);
      } else {
        setNotification({ message: 'Errore durante l\'eliminazione', type: 'error' });
      }
    } catch (err) {
      console.error(err);
      setNotification({ message: 'Errore di rete', type: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

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
      { key: 'email_settings', url: '/api/settings/email_settings', setter: (data: any) => {
        if (data?.value) {
          setEmailSettings((prev: any) => ({ ...prev, ...data.value }));
        }
      } },
      { key: 'association_details', url: '/api/settings/association_details', setter: (data: any) => data?.value && setAssociationDetails(data.value) },
      { key: 'membership_fees', url: '/api/settings/membership_fees', setter: (data: any) => data?.value && setMembershipFees(data.value) },
      { key: 'sponsors', url: '/api/sponsors', setter: setSponsors },
      { key: 'booking_events', url: '/api/booking-events', setter: setBookingEvents },
      { key: 'bookings', url: '/api/bookings', setter: setBookings },
      { key: 'paypal_settings', url: '/api/settings/paypal_settings', setter: (data: any) => data?.value && setPaypalSettings(data.value) },
      { key: 'live_stream', url: '/api/settings/live_stream', setter: (data: any) => data?.value && setLiveStream(data.value) }
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

  const handleEmailFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setComposeData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...newFiles]
      }));
    }
  };

  const fetchEmailFolders = React.useCallback(async () => {
    if (!isStaff) return;
    try {
      const res = await fetch('/api/emails/folders');
      if (res.ok) {
        const data = await res.json();
        setFolders(data.folders || []);
      }
    } catch (err) {
      console.error('Error fetching folders:', err);
    }
  }, [isStaff]);

  const fetchEmails = React.useCallback(async () => {
    if (!isStaff) return;
    setIsLoadingEmails(true);
    try {
      const params = new URLSearchParams({
        folder: selectedFolder,
        page: emailPage.toString(),
        search: emailSearchQuery
      });
      
      // Add a timeout to the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 seconds timeout
      
      try {
        const res = await fetch(`/api/emails?${params}`, { signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (res.ok) {
          const data = await res.json();
          setEmails(data.emails || []);
          setEmailTotalPages(data.totalPages || 1);
        } else {
          const errorData = await res.json();
          setNotification({ message: errorData.error || 'Errore nel recupero delle email', type: 'error' });
        }
      } catch (err: any) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
          setNotification({ message: 'La richiesta è andata in timeout. Il server email potrebbe essere lento o non raggiungibile.', type: 'error' });
        } else {
          console.error('Error fetching emails:', err);
          setNotification({ message: 'Errore di connessione durante il recupero delle email', type: 'error' });
        }
      }
    } finally {
      setIsLoadingEmails(false);
    }
  }, [isStaff, selectedFolder, emailPage, emailSearchQuery]);

  const fetchEmailDetail = async (uid: string) => {
    try {
      const res = await fetch(`/api/emails/${uid}?folder=${selectedFolder}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedEmail(data);
      } else {
        const errData = await res.json();
        setNotification({ message: errData.error || 'Errore nel recupero del dettaglio', type: 'error' });
      }
    } catch (err) {
      console.error('Error fetching email detail:', err);
      setNotification({ message: 'Errore di connessione', type: 'error' });
    }
  };

  const moveEmailToTrash = async (uid: string) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/emails/${uid}/trash`, { method: 'POST' });
      if (res.ok) {
        setSelectedEmail(null);
        setEmailToDelete(null);
        fetchEmails();
        setNotification({ message: 'Email spostata nel cestino', type: 'success' });
      } else {
        const errData = await res.json();
        setNotification({ message: errData.error || 'Errore durante lo spostamento nel cestino', type: 'error' });
      }
    } catch (err) {
      console.error('Error moving to trash:', err);
      setNotification({ message: 'Errore di connessione', type: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  const sendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('to', composeData.to);
    formData.append('subject', composeData.subject);
    formData.append('body', composeData.body);
    if (composeData.replyTo) formData.append('replyTo', composeData.replyTo);
    if (composeData.inReplyTo) formData.append('inReplyTo', composeData.inReplyTo);
    if (composeData.references) formData.append('references', JSON.stringify(composeData.references));
    
    if (composeData.attachments && composeData.attachments.length > 0) {
      for (let i = 0; i < composeData.attachments.length; i++) {
        formData.append('attachments', composeData.attachments[i]);
      }
    }

    try {
      const res = await fetch('/api/emails/send', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        setIsComposing(false);
        setComposeData({ to: '', subject: '', body: '', attachments: [] });
        setNotification({ message: 'Email inviata con successo!', type: 'success' });
        if (selectedFolder === 'Sent') fetchEmails();
      } else {
        const err = await res.json();
        setNotification({ message: 'Errore nell\'invio: ' + err.error, type: 'error' });
      }
    } catch (err) {
      console.error('Error sending email:', err);
      setNotification({ message: 'Errore di rete nell\'invio.', type: 'error' });
    }
  };

  const fetchVisitorsData = React.useCallback(async () => {
    if (!isSuperAdmin) return;
    try {
      const res = await fetch('/api/admin/visitors');
      if (res.ok) {
        const data = await res.json();
        setVisitorsData(data);
      }
    } catch (err) {
      console.error('Error fetching visitors data:', err);
    }
  }, [isSuperAdmin]);

  React.useEffect(() => {
    if (activeTab === 'email') {
      fetchEmailFolders();
      fetchEmails();
    }
    if (activeTab === 'visitors') {
      fetchVisitorsData();
    }
  }, [activeTab, fetchEmailFolders, fetchEmails, fetchVisitorsData]);

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
    if (!lottery.active) {
      toast.error('Nessuna lotteria attiva da archiviare');
      return;
    }
    
    const toastId = toast.loading('Archiviazione lotteria in corso...');
    try {
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
      toast.success('Lotteria archiviata con successo!', { id: toastId });
    } catch (error) {
      console.error('Error archiving lottery:', error);
      toast.error('Errore durante l\'archiviazione della lotteria', { id: toastId });
    }
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

  const saveLiveStream = async (stream: any) => {
    try {
      const res = await fetch('/api/settings/live_stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: stream })
      });
      if (res.ok) {
        setLiveStream(stream);
        toast.success('Impostazioni Live Stream aggiornate!');
      }
    } catch (err) {
      console.error(err);
      toast.error('Errore durante il salvataggio del Live Stream.');
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

  const [showResetConfirm, setShowResetConfirm] = React.useState(false);

  const reset2026Payments = async () => {
    setIsDeleting(true);
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
      setShowResetConfirm(false);
    } catch (error) {
      console.error('Error resetting 2026 payments:', error);
      setNotification({ message: 'Errore durante l\'azzeramento delle iscrizioni.', type: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  const generateLotteryMinutesPDF = async (lotteryData: any) => {
    const doc = new jsPDF();
    try {
      // Header with Logo
      try {
        const logoImg = await loadImage('/logo.png');
        doc.addImage(logoImg, 'PNG', 15, 10, 25, 25);
      } catch (e) {}

      // Association Info
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(associationDetails.name.toUpperCase(), 45, 15);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(`${associationDetails.address} - ${associationDetails.municipality}`, 45, 20);
      doc.setDrawColor(200, 200, 200);
      doc.line(15, 38, 195, 38);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('VERBALE DI ESTRAZIONE DEI PREMI', 105, 50, { align: 'center' });
      doc.setFontSize(13);
      doc.text(`LOTTERIA "${lotteryData.name.toUpperCase()}"`, 105, 58, { align: 'center' });

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      const drawDate = new Date(lotteryData.drawDate);
      const text = `L'anno ${drawDate.getFullYear()}, il giorno ${drawDate.getDate()} del mese di ${drawDate.toLocaleString('it-IT', { month: 'long' })}, alle ore 18:00, presso la sede dell'Associazione "${associationDetails.name}" sita in ${associationDetails.address}, si è proceduto alle operazioni di estrazione dei premi relativi alla lotteria locale denominata "${lotteryData.name}".`;
      
      doc.text(doc.splitTextToSize(text, 180), 15, 75);

      doc.text(`Sono presenti per la Commissione di Estrazione:`, 15, 95);
      doc.text(`1. ${associationDetails.legalRepresentative} (Presidente)`, 20, 102);
      doc.text(`2. _________________________________ (Segretario)`, 20, 109);
      doc.text(`3. _________________________________ (Testimone/Rappresentante Comune)`, 20, 116);

      doc.text(`Si dà atto che le operazioni di vendita dei biglietti si sono concluse regolarmente e che sono stati venduti n. ${lotteryData.ticketsCount || '____'} biglietti.`, 15, 130);
      
      doc.setFont('helvetica', 'bold');
      doc.text('RISULTATI DELL\'ESTRAZIONE:', 15, 145);
      doc.setFont('helvetica', 'normal');

      const tableData = lotteryData.prizes.map((p: any, index: number) => [
        `${index + 1}° Premio`,
        p.name,
        p.winningNumber || '---'
      ]);

      autoTable(doc, {
        startY: 150,
        head: [['Posizione', 'Descrizione Premio', 'Numero Vincente']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [40, 40, 40], textColor: [255, 255, 255] },
        styles: { fontSize: 9 }
      });

      const finalY = (doc as any).lastAutoTable.finalY + 15;
      
      const conclusionText = `Le operazioni di estrazione si sono svolte in modo pubblico e regolare, senza alcun reclamo da parte dei presenti. Il presente verbale, redatto in duplice copia, viene letto, confermato e sottoscritto.`;
      doc.text(doc.splitTextToSize(conclusionText, 180), 15, finalY);

      doc.text('Firme della Commissione:', 15, finalY + 25);
      doc.text('___________________________', 15, finalY + 40);
      doc.text('___________________________', 105, finalY + 40, { align: 'center' });
      doc.text('___________________________', 195, finalY + 40, { align: 'right' });

      return doc;
    } catch (err) {
      console.error('Error generating minutes PDF:', err);
      throw err;
    }
  };

  const generateLotteryRequestPDF = async (lotteryData: any) => {
    const doc = new jsPDF();
    try {
      // Header with Logo
      try {
        const logoImg = await loadImage('/logo.png');
        doc.addImage(logoImg, 'PNG', 15, 10, 25, 25);
      } catch (e) {}

      // Association Info in Header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(associationDetails.name.toUpperCase(), 45, 15);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(`${associationDetails.address} - ${associationDetails.municipality} (${associationDetails.province})`, 45, 20);
      doc.text(`C.F. ${associationDetails.cf} - Email: ${associationDetails.email}`, 45, 24);
      doc.setDrawColor(200, 200, 200);
      doc.line(15, 38, 195, 38);

      // Recipients
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      let recipientY = 50;
      doc.text('Spett.le', 120, recipientY);
      doc.setFont('helvetica', 'bold');
      doc.text(`Sig. Sindaco del Comune di ${associationDetails.municipality || 'Colle d\'Anchise'}`, 120, recipientY + 5);
      doc.text('Resp. Ufficio SUAP Manifestazioni', 120, recipientY + 10);
      doc.setFont('helvetica', 'normal');
      doc.text('Sede Municipale', 120, recipientY + 15);
      
      doc.text('e p.c.', 120, recipientY + 25);
      doc.setFont('helvetica', 'bold');
      doc.text('Al Segretario Comunale', 120, recipientY + 30);

      // Subject
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`OGGETTO: Comunicazione di svolgimento di lotteria locale ai sensi del D.P.R. 430/2001.`, 15, 95);
      doc.line(15, 97, 195, 97);

      // Body
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const bodyText = `Il sottoscritto ${associationDetails.legalRepresentative}, nato a ________________ il _______________, residente in ____________________, in qualità di Presidente e Legale Rappresentante dell'Associazione "${associationDetails.name}", con sede legale in ${associationDetails.address}, C.F. ${associationDetails.cf},`;
      
      const bodyLines = doc.splitTextToSize(bodyText, 180);
      doc.text(bodyLines, 15, 105);

      doc.setFont('helvetica', 'bold');
      doc.text('DICHIARA', 105, 125, { align: 'center' });
      doc.setFont('helvetica', 'normal');

      const declarationText = `che l'Associazione intende organizzare una lotteria locale denominata "${lotteryData.name}", il cui ricavato sarà destinato al finanziamento delle attività istituzionali e alla promozione del territorio, come previsto dallo statuto associativo.`;
      doc.text(doc.splitTextToSize(declarationText, 180), 15, 135);

      doc.setFont('helvetica', 'bold');
      doc.text('COMUNICA ALTRESI\'', 15, 155);
      doc.setFont('helvetica', 'normal');
      
      doc.text(`- Periodo di svolgimento: dal ${new Date().toLocaleDateString('it-IT')} al ${new Date(lotteryData.drawDate).toLocaleDateString('it-IT')};`, 15, 162);
      doc.text(`- Data e luogo dell'estrazione: ${new Date(lotteryData.drawDate).toLocaleDateString('it-IT')} alle ore 18:00 presso la sede sociale;`, 15, 169);
      doc.text(`- Numero di biglietti emessi: ${lotteryData.ticketsCount || '____'} (serie unica);`, 15, 176);
      doc.text(`- Prezzo unitario del biglietto: € ${lotteryData.ticketPrice || '2,50'}.`, 15, 183);

      doc.text('Si allega alla presente il regolamento dettagliato della lotteria con l\'elenco completo dei premi in palio.', 15, 195);

      // Footer
      doc.text('Distinti saluti.', 15, 215);
      doc.text('Luogo e data:', 15, 230);
      doc.text(`${associationDetails.municipality}, ${new Date().toLocaleDateString('it-IT')}`, 15, 235);
      
      doc.text('Firma del Rappresentante Legale', 140, 235, { align: 'center' });
      doc.text('___________________________', 140, 245, { align: 'center' });

      return doc;
    } catch (err) {
      console.error('Error generating request PDF:', err);
      throw err;
    }
  };

  const generateLotteryRegulationsPDF = async (lotteryData: any) => {
    const doc = new jsPDF();
    try {
      // Header with Logo
      try {
        const logoImg = await loadImage('/logo.png');
        doc.addImage(logoImg, 'PNG', 15, 10, 25, 25);
      } catch (e) {}

      // Association Info
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(associationDetails.name.toUpperCase(), 45, 15);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(`${associationDetails.address} - ${associationDetails.municipality}`, 45, 20);
      doc.setDrawColor(200, 200, 200);
      doc.line(15, 38, 195, 38);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('REGOLAMENTO DELLA LOTTERIA LOCALE', 105, 50, { align: 'center' });
      doc.setFontSize(13);
      doc.text(`"${lotteryData.name.toUpperCase()}"`, 105, 58, { align: 'center' });

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      let currentY = 75;
      const margin = 15;
      const width = 180;

      const articles = [
        {
          title: 'Art. 1 - Organizzazione',
          content: `La lotteria è organizzata dall'Associazione "${associationDetails.name}", con sede in ${associationDetails.address}, C.F. ${associationDetails.cf}, rappresentata dal Presidente ${associationDetails.legalRepresentative}.`
        },
        {
          title: 'Art. 2 - Finalità',
          content: `Il ricavato della vendita dei biglietti sarà interamente devoluto al finanziamento delle attività istituzionali dell'Associazione e alla promozione di eventi socio-culturali nel territorio di ${associationDetails.municipality}.`
        },
        {
          title: 'Art. 3 - Partecipazione',
          content: `La partecipazione è aperta a tutti i cittadini. I biglietti sono numerati in serie unica da 0001 a ${lotteryData.ticketsCount || '____'}. Il prezzo di vendita di ogni singolo biglietto è fissato in € ${lotteryData.ticketPrice || '2,50'}.`
        },
        {
          title: 'Art. 4 - Premi in palio',
          content: `I premi messi in palio, in ordine di importanza, sono i seguenti:`
        }
      ];

      articles.forEach(art => {
        doc.setFont('helvetica', 'bold');
        doc.text(art.title, margin, currentY);
        currentY += 6;
        doc.setFont('helvetica', 'normal');
        const lines = doc.splitTextToSize(art.content, width);
        doc.text(lines, margin, currentY);
        currentY += (lines.length * 5) + 5;
      });

      // Prizes Table
      const tableData = lotteryData.prizes.map((p: any, i: number) => [`${i + 1}° Premio`, p.name]);
      autoTable(doc, {
        startY: currentY,
        head: [['Posizione', 'Descrizione del Premio']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [60, 60, 60], textColor: [255, 255, 255] },
        margin: { left: margin }
      });

      currentY = (doc as any).lastAutoTable.finalY + 10;

      const remainingArticles = [
        {
          title: 'Art. 5 - Estrazione',
          content: `L'estrazione pubblica dei premi avverrà il giorno ${new Date(lotteryData.drawDate).toLocaleDateString('it-IT')} alle ore 18:00 presso la sede dell'Associazione. Durante l'estrazione sarà redatto apposito verbale.`
        },
        {
          title: 'Art. 6 - Ritiro dei premi',
          content: `I vincitori potranno ritirare i premi entro 30 giorni dalla data di estrazione, previa presentazione del biglietto vincente in originale. Decorso tale termine, i premi non ritirati resteranno di proprietà dell'Associazione.`
        },
        {
          title: 'Art. 7 - Privacy',
          content: `I dati personali dei partecipanti saranno trattati nel rispetto della normativa vigente (GDPR 679/2016) esclusivamente per le finalità legate alla presente lotteria.`
        }
      ];

      remainingArticles.forEach(art => {
        if (currentY > 250) {
          doc.addPage();
          currentY = 20;
        }
        doc.setFont('helvetica', 'bold');
        doc.text(art.title, margin, currentY);
        currentY += 6;
        doc.setFont('helvetica', 'normal');
        const lines = doc.splitTextToSize(art.content, width);
        doc.text(lines, margin, currentY);
        currentY += (lines.length * 5) + 5;
      });

      doc.text('Il presente regolamento è a disposizione dei soci e dei partecipanti presso la sede sociale.', margin, currentY + 10);

      return doc;
    } catch (err) {
      console.error('Error generating regulations PDF:', err);
      throw err;
    }
  };

  const saveLotteryDoc = async (doc: jsPDF, filename: string, type: 'regulations' | 'request' | 'minutes') => {
    const blob = doc.output('blob');
    const file = new File([blob], filename, { type: 'application/pdf' });
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/lottery/upload-doc', {
        method: 'POST',
        body: formData
      });
      if (response.ok) {
        const data = await response.json();
        const fieldName = type === 'regulations' ? 'regulations_path' : 
                         type === 'request' ? 'municipality_request_path' : 'minutes_path';
        
        const updatedLottery = { ...lottery, [fieldName]: data.path };
        await saveLottery(updatedLottery);
        setLottery(updatedLottery);
        return data.path;
      }
    } catch (error) {
      console.error('Error saving lottery doc:', error);
    }
    return null;
  };

  const generateReceiptPDF = async (financeData: any) => {
    console.log('[PDF] Starting generation with data:', financeData);
    try {
      const doc = new jsPDF();
      const company = typeof financeData.company_details === 'string' ? JSON.parse(financeData.company_details) : financeData.company_details;
      
      console.log('[PDF] Company details parsed:', company);

      // Header
      try {
        console.log('[PDF] Attempting to add logo from /logo.png');
        const logoImg = await loadImage('/logo.png');
        doc.addImage(logoImg, 'PNG', 15, 10, 30, 30);
        console.log('[PDF] Logo added successfully');
      } catch (e) {
        console.warn('[PDF] Logo not found or failed to load:', e);
      }
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.setTextColor(40, 40, 40);
      doc.text('ASSOCIAZIONE PRO SAN FELICE', 200, 20, { align: 'right' });
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text('Via Salita la Chiesa, 19 - 86020 - Colle d\'Anchise (CB)', 200, 26, { align: 'right' });
      doc.text('Codice Fiscale: 92083740701', 200, 31, { align: 'right' });
      doc.text('Email: sanfeliceassociazione@gmail.com', 200, 36, { align: 'right' });
      
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(15, 50, 200, 50);
      
      // Titolo Ricevuta
      doc.setFontSize(13);
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
      
      doc.setFontSize(9);
      doc.setTextColor(40, 40, 40);
      doc.setFont('helvetica', 'bold');
      doc.text((company.companyName || '').toUpperCase(), 125, 75, { maxWidth: 70 });
      doc.setFont('helvetica', 'normal');
      doc.text((company.address || '').toUpperCase(), 125, 85, { maxWidth: 70 });
      if (company.city) doc.text(company.city.toUpperCase(), 125, 90);
      doc.text(`P.IVA / C.F. ${company.vatNumber || ''}`, 125, 95);
      
      // Corpo
      doc.setFontSize(11);
      doc.setTextColor(60, 60, 60);
      const bodyText = `L'Associazione Pro San Felice dichiara di aver ricevuto in data ${new Date(financeData.date).toLocaleDateString('it-IT')} la somma di € ${Math.abs(financeData.amount).toLocaleString('it-IT', { minimumFractionDigits: 2 })} a titolo di erogazione liberale per il sostegno delle attività istituzionali dell'associazione.`;
      const splitBody = doc.splitTextToSize(bodyText, 170);
      doc.text(splitBody, 15, 120);
      
      // Table
      console.log('[PDF] Generating table with autoTable');
      autoTable(doc, {
        startY: 140,
        head: [['DESCRIZIONE', 'IMPORTO']],
        body: [[`EROGAZIONE LIBERALE - ${financeData.event_name}`, `€ ${Math.abs(financeData.amount).toLocaleString('it-IT', { minimumFractionDigits: 2 })}` ]],
        theme: 'grid',
        headStyles: { 
          fillColor: [40, 40, 40], 
          textColor: [255, 255, 255], 
          fontSize: 9, 
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
      
      const finalY = (doc as any).lastAutoTable?.finalY || 200;
      console.log('[PDF] Table generated, finalY:', finalY);
      
      // Payment Info
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('DETTAGLI PAGAMENTO', 15, finalY + 20);
      doc.setFont('helvetica', 'normal');
      doc.text(`Metodo: ${company.paymentMethod || 'BONIFICO'}`, 15, finalY + 27);
      doc.text('IBAN: IT36L0760103800001067338085', 15, finalY + 33);
      doc.text('Banca: Poste Italiane', 15, finalY + 39);
      
      // Signature
      doc.setFontSize(10);
      doc.text('Il Presidente', 150, finalY + 30);
      doc.setFont('helvetica', 'italic');
      doc.text('Associazione Pro San Felice', 150, finalY + 45);
      
      // Legal Note
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      const legalNote = "Il presente contributo, ai sensi dell'art. 83 del D.Lgs. 117/2017 (Codice del Terzo Settore), è deducibile o detraibile nei limiti previsti dalla normativa vigente, a condizione che il versamento sia eseguito tramite sistemi di pagamento tracciabili.";
      const splitNote = doc.splitTextToSize(legalNote, 170);
      doc.text(splitNote, 15, 280);

      console.log('[PDF] Generation complete');
      return doc;
    } catch (err) {
      console.error('[PDF] Fatal error during PDF generation:', err);
      throw err;
    }
  };

  const handleSponsorshipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('--- Sponsorship Submission Started ---');
    
    try {
      if (!sponsorshipData.date) {
        throw new Error('Data mancante');
      }

      const year = new Date(sponsorshipData.date).getFullYear();
      if (isNaN(year)) {
        throw new Error('Data non valida');
      }

      console.log('Year calculated:', year);
      
      if (!Array.isArray(collections)) {
        console.error('Collections is not an array:', collections);
        throw new Error('Errore interno: dati finanziari non caricati correttamente');
      }

      const yearReceipts = collections.filter((c: any) => c.social_year === year && c.receipt_number);
      const nextNumber = yearReceipts.length + 1;
      
      console.log('Next receipt number:', nextNumber);

      const amount = parseFloat(sponsorshipData.amount);
      if (isNaN(amount)) {
        throw new Error('Importo non valido');
      }
      
      const financeData = {
        event_name: sponsorshipData.description,
        type: 'sponsorizzazione',
        amount: amount,
        date: sponsorshipData.date,
        company_details: JSON.stringify(sponsorshipData),
        receipt_number: nextNumber.toString(),
        social_year: year
      };

      console.log('Finance data prepared:', financeData);

      // Generate PDF
      console.log('Calling generateReceiptPDF...');
      const doc = await generateReceiptPDF(financeData);
      
      console.log('Generating blob from PDF...');
      const pdfBlob = doc.output('blob');
      console.log('PDF blob generated, size:', pdfBlob.size, 'bytes');
      
      if (pdfBlob.size < 100) {
        throw new Error('Il PDF generato sembra essere vuoto o corrotto');
      }

      // Upload PDF
      const formData = new FormData();
      formData.append('file', pdfBlob, `ricevuta_${nextNumber}_${year}.pdf`);
      
      console.log('Uploading PDF to server...');
      const uploadRes = await fetch('/api/finances/upload-receipt', {
        method: 'POST',
        body: formData
      });
      
      console.log('Upload response status:', uploadRes.status);
      if (!uploadRes.ok) {
        const errorText = await uploadRes.text();
        console.error('Upload failed:', errorText);
        let errorData;
        try { errorData = JSON.parse(errorText); } catch(e) {}
        throw new Error(`Errore caricamento PDF: ${errorData?.error || uploadRes.statusText}`);
      }
      
      const uploadData = await uploadRes.json();
      console.log('PDF uploaded successfully, path:', uploadData.path);
      
      // Save to DB
      console.log('Saving record to database...');
      const response = await fetch('/api/finances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...financeData, receipt_path: uploadData.path })
      });
      
      console.log('DB save response status:', response.status);
      if (response.ok) {
        const dbData = await response.json();
        console.log('Record saved to DB, ID:', dbData.id);
        
        setCollections([{ ...financeData, id: dbData.id, receipt_path: uploadData.path }, ...collections]);
        setShowSponsorshipModal(false);
        setNotification({ message: 'Sponsorizzazione e ricevuta create con successo!', type: 'success' });
        
        // Download PDF for the user
        try {
          console.log('Triggering browser download of PDF...');
          doc.save(`ricevuta_${nextNumber}_${year}.pdf`);
          console.log('Download triggered');
        } catch (downloadErr) {
          console.error('Error during PDF download trigger:', downloadErr);
          // Don't throw here, the record is already saved
        }
      } else {
        const errorText = await response.text();
        console.error('DB save failed:', errorText);
        let errorData;
        try { errorData = JSON.parse(errorText); } catch(e) {}
        throw new Error(`Errore salvataggio database: ${errorData?.error || response.statusText}`);
      }
    } catch (error: any) {
      console.error('CRITICAL ERROR in handleSponsorshipSubmit:', error);
      setNotification({ message: `Errore: ${error.message || 'Errore durante la creazione della sponsorizzazione.'}`, type: 'error' });
    } finally {
      console.log('--- Sponsorship Submission Finished ---');
    }
  };

  const generateStatementPDF = async () => {
    console.log('[PDF] Starting Statement generation...');
    try {
      const doc = new jsPDF();
      const start = new Date(statementDates.startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(statementDates.endDate);
      end.setHours(23, 59, 59, 999);
      
      // Calculate initial balance (sum of all amounts before startDate)
      const initialBalance = collections
        .filter((c: any) => new Date(c.date) < start)
        .reduce((sum: number, c: any) => sum + c.amount, 0);

      // Filter operations in range
      const periodOperations = collections
        .filter((c: any) => {
          const d = new Date(c.date);
          return d >= start && d <= end;
        })
        .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // --- BANK STYLE HEADER ---
      // Background for header
      doc.setFillColor(245, 245, 240);
      doc.rect(0, 0, 210, 60, 'F');
      
      try {
        const logoImg = await loadImage('/logo.png');
        doc.addImage(logoImg, 'PNG', 15, 10, 25, 25);
      } catch (e) {
        console.warn('[PDF] Logo not found or failed to load in statement:', e);
      }
      
      doc.setTextColor(40, 40, 40);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('ASSOCIAZIONE PRO SAN FELICE', 45, 20);
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text('Sede Legale: Via San Felice, Colle d\'Anchise (CB)', 45, 26);
      doc.text('Codice Fiscale: 92024760706', 45, 31);
      
      doc.setDrawColor(200, 200, 200);
      doc.line(15, 45, 195, 45);
      
      // Statement Info Box
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(220, 220, 220);
      doc.roundedRect(140, 10, 60, 30, 3, 3, 'FD');
      
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('ESTRATTO CONTO', 145, 18);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(`Periodo: ${start.toLocaleDateString('it-IT')} - ${end.toLocaleDateString('it-IT')}`, 145, 24);
      doc.text(`Data Stampa: ${new Date().toLocaleDateString('it-IT')}`, 145, 29);

      // --- SUMMARY SECTION ---
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(40, 40, 40);
      doc.text('RIEPILOGO MOVIMENTI', 15, 70);
      
      const totalIn = periodOperations.filter((op: any) => op.amount > 0).reduce((s, op) => s + op.amount, 0);
      const totalOut = periodOperations.filter((op: any) => op.amount < 0).reduce((s, op) => s + Math.abs(op.amount), 0);
      const finalBalance = initialBalance + totalIn - totalOut;

      autoTable(doc, {
        startY: 75,
        head: [['Descrizione', 'Importo']],
        body: [
          ['Saldo Iniziale', `€ ${initialBalance.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`],
          ['Totale Entrate (+)', `€ ${totalIn.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`],
          ['Totale Uscite (-)', `€ ${totalOut.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`],
          ['SALDO FINALE', `€ ${finalBalance.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`]
        ],
        theme: 'plain',
        styles: { fontSize: 9, cellPadding: 2 },
        columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } },
        headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
        tableWidth: 80,
        margin: { left: 15 }
      });

      // --- OPERATIONS TABLE ---
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('DETTAGLIO OPERAZIONI', 15, (doc as any).lastAutoTable.finalY + 15);

      let currentBalance = initialBalance;
      const tableBody = periodOperations.map((op: any) => {
        currentBalance += op.amount;
        return [
          new Date(op.date).toLocaleDateString('it-IT'),
          op.event_name.toUpperCase(),
          op.type.toUpperCase().replace('_', ' '),
          op.amount > 0 ? `+ ${op.amount.toLocaleString('it-IT', { minimumFractionDigits: 2 })}` : '',
          op.amount < 0 ? `- ${Math.abs(op.amount).toLocaleString('it-IT', { minimumFractionDigits: 2 })}` : '',
          `${currentBalance.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`
        ];
      });

      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 20,
        head: [['DATA', 'CAUSALE', 'TIPO', 'ENTRATE (€)', 'USCITE (€)', 'SALDO (€)']],
        body: tableBody,
        theme: 'grid',
        headStyles: { 
          fillColor: [50, 50, 50], 
          textColor: [255, 255, 255], 
          fontSize: 8, 
          halign: 'center',
          cellPadding: 3
        },
        bodyStyles: { fontSize: 8, cellPadding: 3 },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 'auto' },
          2: { cellWidth: 30 },
          3: { halign: 'right', textColor: [0, 128, 0] },
          4: { halign: 'right', textColor: [200, 0, 0] },
          5: { halign: 'right', fontStyle: 'bold' }
        },
        alternateRowStyles: { fillColor: [250, 250, 250] }
      });

      // Footer
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Pagina ${i} di ${pageCount} - Associazione Pro San Felice - Estratto Conto Analitico`,
          105,
          285,
          { align: 'center' }
        );
      }

      doc.save(`estratto_conto_${statementDates.startDate}_${statementDates.endDate}.pdf`);
      setShowStatementModal(false);
    } catch (err) {
      console.error('[PDF] Error generating statement:', err);
      setNotification({ message: 'Errore durante la generazione dell\'estratto conto.', type: 'error' });
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
      setNews([{ ...newNews, id: data.id, date: newNews.date || new Date().toISOString() }, ...news]);
      setEditingNews(null);
      alert('News/Evento pubblicato con successo!');
    } catch (error) {
      console.error('Error adding news:', error);
    }
  };

  const updateNews = async (updated: any) => {
    try {
      const response = await fetch(`/api/news/${updated.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      if (response.ok) {
        setNews(news.map((n: any) => n.id === updated.id ? updated : n));
        setEditingNews(null);
        alert('News/Evento aggiornato con successo!');
      }
    } catch (error) {
      console.error('Error updating news:', error);
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
    const toastId = toast.loading('Salvataggio lotteria in corso...');
    try {
      // Auto-generate regulations if missing and name/drawDate are present
      let finalLottery = { ...updated };
      if (!finalLottery.regulations_path && finalLottery.name && finalLottery.drawDate) {
        try {
          const doc = await generateLotteryRegulationsPDF(finalLottery);
          const blob = doc.output('blob');
          const file = new File([blob], 'regolamento_lotteria.pdf', { type: 'application/pdf' });
          const formData = new FormData();
          formData.append('file', file);
          const uploadResponse = await fetch('/api/lottery/upload-doc', {
            method: 'POST',
            body: formData
          });
          if (uploadResponse.ok) {
            const uploadData = await uploadResponse.json();
            finalLottery.regulations_path = uploadData.path;
            toast.success('Regolamento auto-generato e caricato con successo', { id: toastId });
          }
        } catch (err) {
          console.error('Error auto-generating regulations:', err);
          toast.error('Errore nell\'auto-generazione del regolamento', { id: toastId });
        }
      }

      const response = await fetch('/api/lottery', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalLottery)
      });
      
      if (response.ok) {
        setLottery(finalLottery);
        toast.success('Lotteria salvata con successo', { id: toastId });
      } else {
        throw new Error('Errore nel salvataggio');
      }
    } catch (error) {
      console.error('Error saving lottery:', error);
      toast.error('Errore durante il salvataggio della lotteria', { id: toastId });
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

  const addBookingEvent = async (event: any) => {
    setIsSavingBookingEvent(true);
    try {
      let imagePath = event.image;
      
      if (bookingEventImageFile) {
        const formData = new FormData();
        formData.append('image', bookingEventImageFile);
        const uploadRes = await fetch('/api/booking-events/upload', {
          method: 'POST',
          body: formData
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          imagePath = uploadData.path;
        } else {
          throw new Error('Errore durante il caricamento dell\'immagine');
        }
      }

      const eventData = { ...event, image: imagePath };
      const method = event.id ? 'PUT' : 'POST';
      const url = event.id ? `/api/booking-events/${event.id}` : '/api/booking-events';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      });
      if (response.ok) {
        setEditingBookingEvent(null);
        setBookingEventImageFile(null);
        setNotification({ message: event.id ? 'Evento aggiornato!' : 'Evento creato!', type: 'success' });
        await fetchData();
      }
    } catch (error) {
      setNotification({ message: error instanceof Error ? error.message : 'Errore durante il salvataggio', type: 'error' });
    } finally {
      setIsSavingBookingEvent(false);
    }
  };

  const deleteBookingEvent = async (id: number) => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/booking-events/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setBookingEventToDelete(null);
        setNotification({ message: 'Evento eliminato!', type: 'success' });
        await fetchData();
      }
    } catch (error) {
      setNotification({ message: 'Errore durante l\'eliminazione', type: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };
  const cariche = ['Presidente', 'Vicepresidente', 'Segretario', 'Tesoriere', 'Socio'];

  return (
    <>
      {/* Voting Modal Popup */}
      <AnimatePresence>
        {showVoteModal && pendingVotePoll && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[3rem] p-8 md:p-12 max-w-lg w-full shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-stone-50 rounded-bl-[5rem] -mr-16 -mt-16" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 bg-stone-900 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-stone-900/20">
                    <Vote className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">Votazione Interna Soci</span>
                    <h2 className="text-2xl font-serif text-stone-900">Nuova Votazione Attiva</h2>
                  </div>
                </div>

                <div className="mb-10">
                  <h3 className="text-xl md:text-2xl font-serif text-stone-800 leading-tight mb-4">
                    {pendingVotePoll.question}
                  </h3>
                  {pendingVotePoll.endDate && (
                    <p className="text-stone-400 text-xs font-medium uppercase tracking-wider">
                      Scade il: {new Date(pendingVotePoll.endDate).toLocaleDateString('it-IT')}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  <a
                    href={`/vota/${pendingVotePoll.id}`}
                    onClick={() => {
                      setShowVoteModal(false);
                      setHasDismissedVoteModal(true);
                    }}
                    className="w-full bg-stone-900 text-white py-5 rounded-2xl font-bold hover:bg-stone-800 transition-all flex items-center justify-center gap-3 shadow-xl shadow-stone-900/20"
                  >
                    Vota Ora
                    <ArrowRight className="w-5 h-5" />
                  </a>
                  <button
                    onClick={() => {
                      setShowVoteModal(false);
                      setHasDismissedVoteModal(true);
                    }}
                    className="w-full py-4 text-stone-400 text-sm font-bold uppercase tracking-widest hover:text-stone-900 transition-colors"
                  >
                    Decidi più tardi
                  </button>
                </div>
                
                <p className="text-[10px] text-stone-400 text-center mt-8 leading-relaxed">
                  Il tuo voto è segreto e fondamentale per la vita dell'associazione.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                { id: 'members', label: 'Soci & Cariche', icon: Users, minRole: 'Operator' },
                { id: 'donations', label: 'Donazioni', icon: Heart, minRole: 'Operator' },
                { id: 'registrations', label: 'Iscrizioni', icon: UserPlus, minRole: 'SuperAdmin', badge: registrations.length > 0 ? registrations.length : null },
                { id: 'finances', label: 'Contabilità', icon: Euro, minRole: 'Operator' },
                { id: 'lottery', label: 'Lotteria', icon: Ticket, minRole: 'Operator' },
                { id: 'minutes', label: 'Verbali', icon: FileText, minRole: 'Operator' },
                { id: 'contests', label: 'Concorsi', icon: Trophy, minRole: 'Operator' },
                { id: 'appointments', label: 'Agenda', icon: Calendar, minRole: 'Operator' },
                { id: 'news', label: 'News', icon: Newspaper, minRole: 'Operator' },
                { id: 'poll-admin', label: 'Gestione Sondaggi', icon: Settings, minRole: 'Operator' },
                { id: 'votazioni', label: 'Votazioni Soci', icon: Vote, minRole: 'Operator' },
                { id: 'poll', label: 'Sondaggi Pubblici', icon: BarChart, minRole: 'Operator' },
                { id: 'bookings', label: 'Prenotazioni', icon: Ticket, minRole: 'Operator' },
                { id: 'sponsors', label: 'Sponsor & Pubblicità', icon: Building, minRole: 'Operator' },
                { id: 'gallery', label: 'Foto & Video', icon: ImageIcon, minRole: 'Operator' },
                { id: 'email', label: 'Email & Comunicazioni', icon: Mail, minRole: 'Operator' },
                { id: 'visitors', label: 'Visitatori', icon: BarChart, minRole: 'SuperAdmin' },
                { id: 'association', label: 'Associazione', icon: Building, minRole: 'SuperAdmin' },
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
                { id: 'votazioni', label: 'Votazioni Interne', icon: Vote },
                { id: 'poll', label: 'Sondaggi Pubblici', icon: BarChart },
                { id: 'minutes', label: 'Verbali', icon: FileText },
                { id: 'news', label: 'News', icon: Newspaper },
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
            <div className="px-4 py-2 text-[10px] text-stone-600 uppercase tracking-widest font-mono">
              Dashboard v1.1.1
            </div>
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
            <h1 className="text-3xl font-serif text-stone-900 flex items-center gap-3">
              {activeTab === 'members' && 'Gestione Soci'}
              {activeTab === 'donations' && 'Gestione Donazioni'}
              {activeTab === 'registrations' && 'Nuove Iscrizioni'}
              {activeTab === 'finances' && 'Contabilità & Raccolte'}
              {activeTab === 'lottery' && 'Gestione Lotteria'}
              {activeTab === 'minutes' && 'Archivio Verbali'}
              {activeTab === 'contests' && 'Concorsi & Rassegne'}
              {activeTab === 'appointments' && 'Agenda Appuntamenti'}
              {activeTab === 'news' && 'News'}
              {activeTab === 'poll-admin' && 'Gestione Sondaggi'}
              {activeTab === 'votazioni' && 'Votazioni Soci'}
              {activeTab === 'poll' && 'Sondaggi Pubblici'}
              {activeTab === 'bookings' && 'Gestione Prenotazioni'}
              {activeTab === 'association' && 'Dati Associazione'}
              {activeTab === 'accounts' && 'Gestione Account'}
              {activeTab === 'email' && 'Email & Comunicazioni'}
              {activeTab === 'member-home' && `Benvenuto, ${user?.username}`}
              <span className="text-[10px] font-mono text-stone-400 bg-stone-100 px-2 py-1 rounded-full">v1.1.1</span>
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

            {/* Active Polls Notification for Members */}
            {polls.filter((p: any) => p.active).length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl flex items-center justify-between gap-4 mb-8"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                    <Vote className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-emerald-900 font-bold">Sondaggi Attivi</h3>
                    <p className="text-emerald-700 text-sm">Ci sono nuove votazioni disponibili. La tua opinione è importante!</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('poll')}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 whitespace-nowrap"
                >
                  Partecipa ora
                </button>
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
                    const userIdentifier = user?.email || user?.username;
                    const hasVoted = userIdentifier && p.votes?.includes(userIdentifier);
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
        {isStaff && (activeTab === 'members' || activeTab === 'finances') && (
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
                {isSuperAdmin && members.filter((m: any) => m.payments?.[2026] || m.payments?.['2026']).length > 0 && (
                  <button 
                    onClick={() => setShowResetConfirm(true)}
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
            {activeTab === 'donations' && <DonationsManagement />}
            {isStaff && activeTab === 'members' && (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <h2 className="text-xl font-serif text-stone-900">Elenco Soci e Cariche</h2>
                    {isSuperAdmin && (
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
                    )}
                  </div>
                </div>

                <form 
                  key={editingMember ? editingMember.id : 'new'}
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

            {isStaff && activeTab === 'finances' && (
              <div className="space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h2 className="text-xl font-serif text-stone-900">Registro Contabile</h2>
                    <p className="text-sm text-stone-500">Gestione entrate, uscite e sponsorizzazioni</p>
                  </div>
                  <div className="flex gap-3">
                    {isSuperAdmin && (
                      <button 
                        onClick={() => setShowStatementModal(true)}
                        className="bg-white text-stone-700 border border-stone-200 px-4 py-2 rounded-xl text-sm font-bold hover:bg-stone-50 transition-colors flex items-center gap-2 shadow-sm"
                      >
                        <Download className="w-4 h-4" />
                        Estratto Conto
                      </button>
                    )}
                    {isSuperAdmin && (
                      <button 
                        onClick={() => setShowSponsorshipModal(true)}
                        className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-lg shadow-emerald-900/10"
                      >
                        <Plus className="w-4 h-4" />
                        Nuova Sponsorizzazione
                      </button>
                    )}
                    {isSuperAdmin && (
                      <button 
                        onClick={closeYear}
                        className="bg-stone-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-stone-800 transition-colors flex items-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Chiusura Anno
                      </button>
                    )}
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
                  key={editingCollection?.id || 'new'}
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

            {showStatementModal && (
              <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
                >
                  <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50">
                    <div>
                      <h3 className="text-xl font-serif text-stone-900">Stampa Estratto Conto</h3>
                      <p className="text-xs text-stone-500">Seleziona l'intervallo di date</p>
                    </div>
                    <button onClick={() => setShowStatementModal(false)} className="text-stone-400 hover:text-stone-900 transition-colors">
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  
                  <div className="p-8 space-y-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-2">Data Inizio</label>
                        <input 
                          type="date"
                          value={statementDates.startDate}
                          onChange={e => setStatementDates({...statementDates, startDate: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-900 outline-none text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-2">Data Fine</label>
                        <input 
                          type="date"
                          value={statementDates.endDate}
                          onChange={e => setStatementDates({...statementDates, endDate: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-900 outline-none text-sm"
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-4 pt-4">
                      <button 
                        onClick={() => setShowStatementModal(false)}
                        className="flex-1 px-6 py-4 rounded-2xl bg-stone-100 text-stone-600 font-bold hover:bg-stone-200 transition-colors"
                      >
                        Annulla
                      </button>
                      <button 
                        onClick={generateStatementPDF}
                        className="flex-1 px-6 py-4 rounded-2xl bg-stone-900 text-white font-bold hover:bg-stone-800 transition-colors shadow-xl shadow-stone-900/20 flex items-center justify-center gap-2"
                      >
                        <Download className="w-5 h-5" />
                        Stampa PDF
                      </button>
                    </div>
                  </div>
                </motion.div>
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
                      onClick={() => setLotteryToDelete(lottery)}
                      className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-all"
                      title="Elimina Lotteria"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
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
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-stone-500 uppercase mb-1">N. Biglietti</label>
                          <input 
                            type="number" 
                            value={lottery.ticketsCount || ''}
                            onChange={(e) => setLottery({ ...lottery, ticketsCount: parseInt(e.target.value) })}
                            className="w-full px-4 py-2 rounded-xl border border-stone-200 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Prezzo (€)</label>
                          <input 
                            type="number" 
                            step="0.10"
                            value={lottery.ticketPrice || ''}
                            onChange={(e) => setLottery({ ...lottery, ticketPrice: parseFloat(e.target.value) })}
                            className="w-full px-4 py-2 rounded-xl border border-stone-200 text-sm"
                          />
                        </div>
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

                      <div className="pt-4 border-t border-stone-100 flex flex-col items-end gap-2">
                        <button 
                          onClick={() => {
                            saveLottery(lottery);
                          }}
                          className="bg-stone-900 text-white px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:shadow-lg transition-all active:scale-95"
                        >
                          Salva Configurazione
                        </button>
                        {lottery.regulations_path && (
                          <a 
                            href={lottery.regulations_path} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[10px] text-stone-400 hover:text-stone-900 flex items-center gap-1 transition-colors"
                          >
                            <FileText className="w-3 h-3" />
                            Visualizza Regolamento Attuale
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-serif text-lg text-stone-900">Documentazione</h3>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className={`w-5 h-5 ${lottery.regulations_path ? 'text-emerald-500' : 'text-stone-300'}`} />
                          <div>
                            <p className="text-sm font-bold text-stone-900">Regolamento Lotteria</p>
                            <p className="text-[10px] text-stone-500 uppercase">Step 1: Configurazione</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {lottery.regulations_path && (
                            <a 
                              href={lottery.regulations_path} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="p-2 text-stone-400 hover:text-stone-900"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          )}
                          <button 
                            onClick={async () => {
                              const doc = await generateLotteryRegulationsPDF(lottery);
                              await saveLotteryDoc(doc, 'regolamento_lotteria.pdf', 'regulations');
                            }}
                            className="px-3 py-1 bg-stone-900 text-white rounded-lg text-[10px] font-bold uppercase"
                          >
                            {lottery.regulations_path ? 'Rigenera' : 'Genera'}
                          </button>
                        </div>
                      </div>

                      <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Mail className={`w-5 h-5 ${lottery.municipality_request_path ? 'text-emerald-500' : 'text-stone-300'}`} />
                          <div>
                            <p className="text-sm font-bold text-stone-900">Comunicazione Comune</p>
                            <p className="text-[10px] text-stone-500 uppercase">Step 2: Autorizzazione</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {lottery.municipality_request_path && (
                            <a 
                              href={lottery.municipality_request_path} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="p-2 text-stone-400 hover:text-stone-900"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          )}
                          <button 
                            onClick={async () => {
                              const doc = await generateLotteryRequestPDF(lottery);
                              await saveLotteryDoc(doc, 'comunicazione_comune.pdf', 'request');
                            }}
                            className="px-3 py-1 bg-stone-900 text-white rounded-lg text-[10px] font-bold uppercase"
                          >
                            {lottery.municipality_request_path ? 'Rigenera' : 'Genera'}
                          </button>
                        </div>
                      </div>

                      <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <ClipboardCheck className={`w-5 h-5 ${lottery.minutes_path ? 'text-emerald-500' : 'text-stone-300'}`} />
                          <div>
                            <p className="text-sm font-bold text-stone-900">Verbale di Estrazione</p>
                            <p className="text-[10px] text-stone-500 uppercase">Step 3: Post-Estrazione</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {lottery.minutes_path && (
                            <a 
                              href={lottery.minutes_path} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="p-2 text-stone-400 hover:text-stone-900"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          )}
                          <button 
                            disabled={!lottery.prizes.every((p: any) => p.winningNumber)}
                            onClick={async () => {
                              const doc = await generateLotteryMinutesPDF(lottery);
                              await saveLotteryDoc(doc, 'verbale_estrazione.pdf', 'minutes');
                            }}
                            className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase ${
                              lottery.prizes.every((p: any) => p.winningNumber) 
                                ? 'bg-stone-900 text-white' 
                                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                            }`}
                          >
                            {lottery.minutes_path ? 'Rigenera' : 'Genera'}
                          </button>
                        </div>
                      </div>
                    </div>

                    <h3 className="font-serif text-lg text-stone-900 pt-4">Elenco Premi & Vincitori</h3>
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
                                const updatedLottery = { ...lottery, prizes: updated };
                                setLottery(updatedLottery);
                                saveLottery(updatedLottery);
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
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-serif text-stone-900 flex items-center gap-2">
                          <CreditCard className="w-5 h-5" />
                          Configurazione Pagamenti (PayPal.me)
                        </h3>
                      </div>
                      
                      <div className="space-y-6">
                        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                          <p className="text-sm text-blue-800 leading-relaxed">
                            <strong className="text-blue-900">Integrazione PayPal.me:</strong> 
                            Inserisci il tuo link PayPal.me per ricevere pagamenti per gli eventi a pagamento. 
                            Gli utenti verranno reindirizzati a questo link per completare la transazione prima di ricevere il biglietto.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                          <div className="space-y-2">
                            <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">Link PayPal.me</label>
                            <input 
                              value={paypalSettings.paypal_me_link}
                              onChange={(e) => setPaypalSettings({ ...paypalSettings, paypal_me_link: e.target.value })}
                              className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-stone-900 transition-all"
                              placeholder="https://paypal.me/tuonome"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">Istruzioni di Pagamento</label>
                            <textarea 
                              value={paypalSettings.instructions}
                              onChange={(e) => setPaypalSettings({ ...paypalSettings, instructions: e.target.value })}
                              rows={3}
                              className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-stone-900 transition-all"
                              placeholder="Istruzioni che l'utente vedrà durante il checkout..."
                            />
                          </div>
                        </div>

                        <button 
                          onClick={async () => {
                            try {
                              const response = await fetch('/api/settings/paypal_settings', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ value: paypalSettings })
                              });
                              if (response.ok) {
                                setNotification({ message: 'Impostazioni PayPal salvate!', type: 'success' });
                              }
                            } catch (error) {
                              setNotification({ message: 'Errore durante il salvataggio', type: 'error' });
                            }
                          }}
                          className="flex items-center gap-2 px-8 py-3 bg-stone-900 text-white rounded-xl text-sm font-bold hover:bg-stone-800 transition-all shadow-lg shadow-stone-900/20"
                        >
                          <Save className="w-4 h-4" />
                          Salva Impostazioni PayPal
                        </button>
                      </div>
                    </div>

                    <div className="mt-12 p-8 bg-white border border-stone-200 rounded-[2rem] shadow-sm">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-serif text-stone-900 flex items-center gap-2">
                          <Mail className="w-5 h-5" />
                          Configurazione Email (SMTP & POP3 Gmail)
                        </h3>
                        <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-amber-100">
                          <AlertCircle className="w-3 h-3" />
                          Nota per Gmail
                        </div>
                      </div>
                      
                      <div className="space-y-6">
                        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                          <p className="text-sm text-amber-800 leading-relaxed">
                            <strong className="text-amber-900">Importante per Gmail:</strong> Google ha rimosso il supporto alle "App meno sicure". 
                            <br /><br />
                            1. <strong>DEVI attivare la Verifica in due passaggi</strong> e generare una <strong>Password per le App</strong> (16 caratteri). 
                            <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" className="ml-1 underline font-bold hover:text-amber-900">Genera qui la Password per le App &rarr;</a>
                            <br /><br />
                            2. <strong>DEVI ABILITARE IMAP/POP3</strong> nelle impostazioni di Gmail: Ingranaggio &rarr; Visualizza tutte le impostazioni &rarr; Inoltro e POP/IMAP &rarr; Attiva IMAP.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2 md:col-span-2">
                            <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">Protocollo Ricezione</label>
                            <div className="flex gap-4">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                  type="radio" 
                                  name="protocol" 
                                  value="imap" 
                                  checked={emailSettings.protocol === 'imap' || !emailSettings.protocol} 
                                  onChange={() => setEmailSettings({ ...emailSettings, protocol: 'imap' })}
                                  className="w-4 h-4 text-stone-900 focus:ring-stone-900"
                                />
                                <span className="text-sm font-medium text-stone-700">IMAP (Consigliato)</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                  type="radio" 
                                  name="protocol" 
                                  value="pop3" 
                                  checked={emailSettings.protocol === 'pop3'} 
                                  onChange={() => setEmailSettings({ ...emailSettings, protocol: 'pop3' })}
                                  className="w-4 h-4 text-stone-900 focus:ring-stone-900"
                                />
                                <span className="text-sm font-medium text-stone-700">POP3</span>
                              </label>
                            </div>
                          </div>

                          {(!emailSettings.protocol || emailSettings.protocol === 'imap') ? (
                            <>
                              <div className="space-y-2">
                                <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">Server IMAP</label>
                                <input 
                                  value={emailSettings.imap_host || ''}
                                  onChange={(e) => setEmailSettings({ ...emailSettings, imap_host: e.target.value })}
                                  className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-stone-900 transition-all"
                                  placeholder="imap.gmail.com"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">Porta IMAP (SSL)</label>
                                <div className="flex gap-2">
                                  <input 
                                    value={emailSettings.imap_port || ''}
                                    onChange={(e) => setEmailSettings({ ...emailSettings, imap_port: e.target.value, imap_tls: e.target.value === '993' })}
                                    className="flex-1 px-4 py-3 rounded-xl border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-stone-900 transition-all"
                                    placeholder="993"
                                  />
                                  <button
                                    onClick={() => setEmailSettings({ ...emailSettings, imap_tls: !emailSettings.imap_tls })}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all ${
                                      emailSettings.imap_tls 
                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                                        : 'bg-stone-50 border-stone-200 text-stone-500'
                                    }`}
                                  >
                                    {emailSettings.imap_tls ? 'SSL ON' : 'SSL OFF'}
                                  </button>
                                </div>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="space-y-2">
                                <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">Server POP3</label>
                                <input 
                                  value={emailSettings.pop_host || ''}
                                  onChange={(e) => setEmailSettings({ ...emailSettings, pop_host: e.target.value })}
                                  className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-stone-900 transition-all"
                                  placeholder="pop.gmail.com"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">Porta POP3 (SSL)</label>
                                <div className="flex gap-2">
                                  <input 
                                    value={emailSettings.pop_port || ''}
                                    onChange={(e) => setEmailSettings({ ...emailSettings, pop_port: e.target.value, pop_tls: e.target.value === '995' })}
                                    className="flex-1 px-4 py-3 rounded-xl border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-stone-900 transition-all"
                                    placeholder="995"
                                  />
                                  <button
                                    onClick={() => setEmailSettings({ ...emailSettings, pop_tls: !emailSettings.pop_tls })}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all ${
                                      emailSettings.pop_tls 
                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                                        : 'bg-stone-50 border-stone-200 text-stone-500'
                                    }`}
                                  >
                                    {emailSettings.pop_tls ? 'SSL ON' : 'SSL OFF'}
                                  </button>
                                </div>
                              </div>
                            </>
                          )}

                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">Server SMTP</label>
                        <input 
                          value={emailSettings.smtp_host}
                          onChange={(e) => setEmailSettings({ ...emailSettings, smtp_host: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-stone-900 transition-all"
                          placeholder="smtp.gmail.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">Porta SMTP</label>
                        <input 
                          value={emailSettings.smtp_port}
                          onChange={(e) => setEmailSettings({ ...emailSettings, smtp_port: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-stone-900 transition-all"
                          placeholder="465"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">Username (Email)</label>
                        <input 
                          value={emailSettings.smtp_user}
                          onChange={(e) => {
                              const val = e.target.value;
                              setEmailSettings({ 
                                  ...emailSettings, 
                                  smtp_user: val, 
                                  pop_user: val,
                                  imap_user: val,
                                  from_email: emailSettings.from_email || val
                              });
                          }}
                          className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-stone-900 transition-all"
                          placeholder="tuaemail@esempio.it"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">Password</label>
                        <input 
                          type="password"
                          value={emailSettings.smtp_pass}
                          onChange={(e) => {
                              const val = e.target.value;
                              setEmailSettings({ 
                                  ...emailSettings, 
                                  smtp_pass: val, 
                                  pop_pass: val,
                                  imap_pass: val
                              });
                          }}
                          className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-stone-900 transition-all"
                          placeholder="••••••••••••"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">Email Mittente</label>
                        <input 
                          value={emailSettings.from_email}
                          onChange={(e) => setEmailSettings({ ...emailSettings, from_email: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-stone-900 transition-all"
                          placeholder="tuaemail@gmail.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">Nome Mittente</label>
                        <input 
                          value={emailSettings.from_name}
                          onChange={(e) => setEmailSettings({ ...emailSettings, from_name: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-stone-900 transition-all"
                          placeholder="Associazione Colle d'Anchise"
                        />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4 pt-4">
                      <button 
                        onClick={async () => {
                          try {
                            const response = await fetch('/api/settings/email_settings', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ value: emailSettings })
                            });
                            if (response.ok) {
                              setNotification({ message: 'Impostazioni email salvate!', type: 'success' });
                            }
                          } catch (error) {
                            setNotification({ message: 'Errore durante il salvataggio', type: 'error' });
                          }
                        }}
                        className="flex items-center gap-2 px-8 py-3 bg-stone-900 text-white rounded-xl text-sm font-bold hover:bg-stone-800 transition-all shadow-lg shadow-stone-900/20"
                      >
                        <Save className="w-4 h-4" />
                        Salva Impostazioni
                      </button>
                      <button 
                        disabled={isTestingConnection}
                        onClick={async () => {
                          setIsTestingConnection(true);
                          try {
                            const endpoint = emailSettings.protocol === 'imap' ? '/api/emails/test-imap' : '/api/emails/test';
                            const response = await fetch(endpoint, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify(emailSettings)
                            });
                            const data = await response.json();
                            if (response.ok) {
                              setNotification({ message: data.message, type: 'success' });
                            } else {
                              setNotification({ message: data.error, type: 'error' });
                            }
                          } catch (error) {
                            setNotification({ message: 'Errore di connessione al server', type: 'error' });
                          } finally {
                            setIsTestingConnection(false);
                          }
                        }}
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-stone-200 text-stone-900 rounded-xl text-sm font-bold hover:bg-stone-50 transition-all disabled:opacity-50"
                      >
                        {isTestingConnection ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        Testa {emailSettings.protocol === 'imap' ? 'IMAP' : 'POP3'}
                      </button>
                      <button 
                        disabled={isTestingConnection}
                        onClick={async () => {
                          setIsTestingConnection(true);
                          try {
                            const response = await fetch('/api/emails/test-smtp', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify(emailSettings)
                            });
                            const data = await response.json();
                            if (response.ok) {
                              setNotification({ message: data.message, type: 'success' });
                            } else {
                              setNotification({ message: data.error, type: 'error' });
                            }
                          } catch (error) {
                            setNotification({ message: 'Errore di connessione SMTP', type: 'error' });
                          } finally {
                            setIsTestingConnection(false);
                          }
                        }}
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-stone-200 text-stone-900 rounded-xl text-sm font-bold hover:bg-stone-50 transition-all disabled:opacity-50"
                      >
                        {isTestingConnection ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        Testa SMTP
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isStaff && activeTab === 'registrations' && (
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
                          {isSuperAdmin && (
                            <>
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
                            </>
                          )}
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
                      key={editingMinute ? editingMinute.id : 'new'}
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
                    key={editingAppointment ? editingAppointment.id : 'new'}
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

            {activeTab === 'bookings' && (
              <BookingsManagement 
                bookingEvents={bookingEvents}
                bookings={bookings}
                onAddEvent={addBookingEvent}
                onDeleteEvent={(event) => setBookingEventToDelete(event)}
                onDeleteBooking={(booking) => setBookingToDelete(booking)}
                isSaving={isSavingBookingEvent}
                isDeleting={isDeleting}
                imageFile={bookingEventImageFile}
                onImageChange={setBookingEventImageFile}
              />
            )}

            {activeTab === 'news' && (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-serif text-stone-900">News</h2>
                </div>
                {isStaff && (
                  <form 
                    key={editingNews ? editingNews.id : 'new'}
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const data: any = Object.fromEntries(formData);
                      // Handle checkbox
                      data.showOnHomepage = formData.get('showOnHomepage') ? 1 : 0;
                      
                      if (editingNews) {
                        updateNews({ ...editingNews, ...data });
                      } else {
                        addNews(data);
                      }
                      e.currentTarget.reset();
                    }}
                    className="space-y-4 p-6 bg-stone-50 rounded-2xl border border-stone-200"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input name="title" defaultValue={editingNews?.title} placeholder="Titolo News / Evento" className="px-4 py-2 rounded-xl border border-stone-200 text-sm outline-none" required />
                      <div className="flex gap-2">
                        <select name="category" defaultValue={editingNews?.category || 'news'} className="flex-1 px-4 py-2 rounded-xl border border-stone-200 text-sm outline-none">
                          <option value="news">News</option>
                          <option value="evento">Evento</option>
                        </select>
                        <input type="date" name="date" defaultValue={editingNews?.date ? new Date(editingNews.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]} className="px-4 py-2 rounded-xl border border-stone-200 text-sm outline-none" />
                      </div>
                    </div>
                    <textarea name="content" defaultValue={editingNews?.content} placeholder="Contenuto della news..." className="w-full px-4 py-2 rounded-xl border border-stone-200 text-sm outline-none h-32" required />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative">
                        <ImageIcon className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                        <input name="image" defaultValue={editingNews?.image} placeholder="URL Immagine" className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 text-sm outline-none" />
                      </div>
                      <div className="relative">
                        <Video className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                        <input name="video" defaultValue={editingNews?.video} placeholder="URL Video (YouTube/Vimeo)" className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 text-sm outline-none" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        name="showOnHomepage" 
                        id="news_showOnHomepage"
                        defaultChecked={editingNews ? (editingNews.showOnHomepage === 1 || editingNews.showOnHomepage === true || editingNews.showOnHomepage === '1') : false}
                        className="w-4 h-4 rounded border-stone-300 text-stone-900 focus:ring-stone-500"
                      />
                      <label htmlFor="news_showOnHomepage" className="text-sm text-stone-600">Mostra in homepage</label>
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
                      {n.image && (
                        <div className="h-48 overflow-hidden">
                          <img src={n.image} alt={n.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                        </div>
                      )}
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex gap-2">
                            <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${
                              n.category === 'evento' ? 'bg-amber-100 text-amber-700' : 'bg-stone-100 text-stone-700'
                            }`}>
                              {n.category}
                            </span>
                            {(n.showOnHomepage === 1 || n.showOnHomepage === true || n.showOnHomepage === '1') && (
                              <span className="px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-emerald-100 text-emerald-700">
                                Homepage
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-stone-400 font-bold uppercase">{new Date(n.date).toLocaleDateString('it-IT')}</span>
                        </div>
                        <h3 className="font-serif text-lg text-stone-900 mb-2">{n.title}</h3>
                        <p className="text-sm text-stone-500 line-clamp-2 mb-4">{n.content}</p>
                        <div className="flex justify-between items-center">
                          <div className="flex gap-2">
                            <button 
                              onClick={() => shareOnFacebook(`${window.location.origin}/news/${n.id}`)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Condividi su Facebook"
                            >
                              <Facebook className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => copyToClipboard(generateSocialPost(n, 'news'))}
                              className="p-2 text-stone-500 hover:bg-stone-50 rounded-lg transition-colors"
                              title="Copia testo per Social"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                          {isStaff && (
                            <div className="flex gap-2">
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
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'gallery' && (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-serif text-stone-900">Foto & Video Gallery</h2>
                  {isStaff && gallery.some((item: any) => !item.url.startsWith('/uploads/') && !item.url.includes('youtube') && !item.url.includes('youtu.be')) && (
                    <button 
                      onClick={async () => {
                        if (confirm('Sei sicuro di voler rimuovere tutti i link esterni (Facebook, ecc.) che potrebbero essere rotti? Questa azione non può essere annullata.')) {
                          try {
                            const res = await fetch('/api/gallery-clean-external', { method: 'DELETE' });
                            if (res.ok) {
                              const data = await res.json();
                              setGallery(prev => prev.filter((item: any) => item.url.startsWith('/uploads/') || item.url.includes('youtube') || item.url.includes('youtu.be')));
                              setNotification({ message: `Rimosse ${data.deletedCount} voci esterne rotte.`, type: 'success' });
                            }
                          } catch (err) {
                            console.error(err);
                          }
                        }
                      }}
                      className="text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-1.5 px-3 py-1.5 bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Rimuovi Link Esterni Rotti
                    </button>
                  )}
                </div>

                {isStaff && (
                  <form 
                    onSubmit={handleGalleryUpload}
                    className="flex flex-col md:flex-row gap-4 p-6 bg-stone-50 rounded-2xl border border-stone-200"
                  >
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">Carica Foto o Video (Multiplo)</label>
                      <input 
                        type="file" 
                        name="files" 
                        accept="image/*,video/*"
                        multiple
                        className="w-full px-4 py-2 bg-white rounded-xl border border-stone-200 text-sm outline-none" 
                        required 
                      />
                    </div>
                    <button 
                      type="submit" 
                      disabled={isUploadingGallery}
                      className="bg-stone-900 text-white px-8 py-2 rounded-xl text-sm font-bold hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 self-end md:mb-0.5 disabled:opacity-50"
                    >
                      {isUploadingGallery ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                      {isUploadingGallery ? 'Caricamento...' : 'Carica nella Gallery'}
                    </button>
                  </form>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {gallery.map((item: any) => (
                    <div key={item.id} className="relative aspect-square rounded-2xl overflow-hidden group">
                      {item.type === 'video' ? (
                        <div className="w-full h-full bg-stone-100 flex items-center justify-center">
                          <Video className="w-12 h-12 text-stone-300" />
                        </div>
                      ) : (
                        item.url && (
                          <img 
                            src={item.url} 
                            className="w-full h-full object-cover" 
                            referrerPolicy="no-referrer" 
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              const container = target.closest('.group');
                              if (container) (container as HTMLElement).style.display = 'none';
                            }}
                          />
                        )
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        {item.type === 'video' && <Video className="w-6 h-6 text-white" />}
                        {isStaff && (
                          <button 
                            onClick={() => setGalleryItemToDelete(item.id)}
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

            {(isStaff || isMember) && activeTab === 'poll-admin' && isStaff && (
              <PollsManagement />
            )}

            {(isStaff || isMember) && activeTab === 'votazioni' && (
              <VotazioniSection 
                user={user} 
                onOpenVoteModal={(poll) => {
                  setPendingVotePoll(poll);
                  setShowVoteModal(true);
                  setHasDismissedVoteModal(false);
                }}
              />
            )}

            {(isStaff || isMember) && activeTab === 'poll' && (
              isStaff ? (
                <div className="space-y-8">
                  <div className="bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-sm">
                    <h3 className="text-xl font-serif text-stone-900 mb-4">Sondaggi Pubblici</h3>
                    <p className="text-stone-500 text-sm mb-6">
                      I sondaggi pubblici sono visibili sulla homepage. Puoi gestirli dalla sezione "Gestione Sondaggi".
                    </p>
                    <button
                      onClick={() => setActiveTab('poll-admin')}
                      className="bg-stone-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-stone-800 transition-all"
                    >
                      Vai a Gestione Sondaggi
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {polls.filter((p: any) => p.active && p.type === 'poll').length === 0 ? (
                      <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border border-stone-100">
                        <div className="w-16 h-16 bg-stone-50 text-stone-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <BarChart className="w-8 h-8" />
                        </div>
                        <p className="text-stone-400 font-medium">Non ci sono sondaggi pubblici attivi al momento.</p>
                      </div>
                    ) : (
                      polls.filter((p: any) => p.active && p.type === 'poll').map((p: any) => {
                        const userIdentifier = user?.email || user?.username;
                        const hasVoted = userIdentifier && p.votes?.includes(userIdentifier);
                        return (
                          <motion.div
                            key={p.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-sm hover:shadow-md transition-all group"
                          >
                            <div className="flex justify-between items-start mb-6">
                              <div className="w-12 h-12 bg-stone-50 text-stone-900 rounded-2xl flex items-center justify-center group-hover:bg-stone-900 group-hover:text-white transition-all">
                                <BarChart className="w-6 h-6" />
                              </div>
                              {hasVoted && (
                                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" /> Hai votato
                                </span>
                              )}
                            </div>
                            <h3 className="text-xl font-serif text-stone-900 mb-4 leading-tight">{p.question}</h3>
                            {p.endDate && (
                              <p className="text-stone-400 text-xs mb-8">Scade il: {new Date(p.endDate).toLocaleDateString('it-IT')}</p>
                            )}
                            
                            <button
                              onClick={() => window.open(`/vota/${p.id}`, '_blank')}
                              className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                                hasVoted 
                                  ? 'bg-stone-100 text-stone-600 hover:bg-stone-200' 
                                  : 'bg-stone-900 text-white hover:bg-stone-800 shadow-lg shadow-stone-900/20'
                              }`}
                            >
                              {hasVoted ? 'Vedi Risultati' : 'Vota Ora'}
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          </motion.div>
                        );
                      })
                    )}
                  </div>
                </div>
              )
            )}

            {isStaff && activeTab === 'email' && (
              <div className="h-[calc(100vh-12rem)] flex flex-col bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
                {/* Email Header/Toolbar */}
                <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
                  <div className="flex items-center gap-4 flex-1 max-w-xl">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                      <input 
                        type="text" 
                        placeholder="Cerca nelle email..." 
                        value={emailSearchQuery}
                        onChange={(e) => setEmailSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && fetchEmails()}
                        className="w-full pl-10 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-stone-900 transition-all"
                      />
                    </div>
                    <button 
                      onClick={() => { setEmailPage(1); fetchEmails(); }}
                      className="p-2 text-stone-500 hover:text-stone-900 bg-white border border-stone-200 rounded-xl transition-all"
                      title="Aggiorna"
                    >
                      <RotateCcw className={`w-4 h-4 ${isLoadingEmails ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                  <button 
                    onClick={() => {
                      setComposeData({ to: '', subject: '', body: '', attachments: [] });
                      setIsReplying(false);
                      setIsForwarding(false);
                      setIsComposing(true);
                    }}
                    className="flex items-center gap-2 px-6 py-2.5 bg-stone-900 text-white rounded-xl font-bold hover:bg-stone-800 transition-all shadow-lg shadow-stone-900/20"
                  >
                    <Plus className="w-4 h-4" />
                    Scrivi
                  </button>
                </div>

                <div className="flex-1 flex overflow-hidden">
                  {/* Folders Sidebar */}
                  <div className="w-64 border-r border-stone-100 bg-stone-50/30 overflow-y-auto p-4 space-y-1 hidden md:block">
                    {folders.map((folder) => (
                      <button
                        key={folder.path}
                        onClick={() => { setSelectedFolder(folder.path); setEmailPage(1); setSelectedEmail(null); }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          selectedFolder === folder.path 
                            ? 'bg-stone-900 text-white shadow-md' 
                            : 'text-stone-600 hover:bg-stone-100'
                        }`}
                      >
                        {folder.name.toLowerCase().includes('inbox') || folder.special === '\\Inbox' ? <Inbox className="w-4 h-4" /> :
                         folder.name.toLowerCase().includes('sent') || folder.special === '\\Sent' ? <Send className="w-4 h-4" /> :
                         folder.name.toLowerCase().includes('trash') || folder.special === '\\Trash' ? <Trash2 className="w-4 h-4" /> :
                         folder.name.toLowerCase().includes('archive') || folder.special === '\\Archive' ? <Archive className="w-4 h-4" /> :
                         folder.name.toLowerCase().includes('draft') || folder.special === '\\Drafts' ? <FileText className="w-4 h-4" /> :
                         folder.name.toLowerCase().includes('spam') || folder.special === '\\Junk' ? <AlertCircle className="w-4 h-4" /> :
                         <Mail className="w-4 h-4" />}
                        <span className="truncate">{folder.name}</span>
                      </button>
                    ))}
                  </div>

                  {/* Email List or Detail */}
                  <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
                    {selectedEmail ? (
                      <div className="h-full flex flex-col bg-white">
                        {/* Detail Header */}
                        <div className="p-4 border-b border-stone-100 flex items-center justify-between sticky top-0 bg-white z-10">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => setSelectedEmail(null)}
                              className="p-2 hover:bg-stone-100 rounded-xl transition-all text-stone-500"
                              title="Indietro"
                            >
                              <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div className="h-8 w-[1px] bg-stone-100 mx-2"></div>
                            <button 
                              onClick={() => {
                                setComposeData({
                                  to: selectedEmail.from.address,
                                  subject: `Re: ${selectedEmail.subject}`,
                                  body: `\n\n--- In data ${new Date(selectedEmail.date).toLocaleString('it-IT')}, ${selectedEmail.from.name || selectedEmail.from.address} ha scritto:\n\n${selectedEmail.text}`,
                                  attachments: [],
                                  replyTo: selectedEmail.from.address,
                                  inReplyTo: selectedEmail.uid
                                });
                                setIsReplying(true);
                                setIsForwarding(false);
                                setIsComposing(true);
                              }}
                              className="flex items-center gap-2 px-4 py-2 hover:bg-stone-100 rounded-xl transition-all text-sm font-medium text-stone-600"
                            >
                              <Reply className="w-4 h-4" />
                              Rispondi
                            </button>
                            <button 
                              onClick={() => {
                                setComposeData({
                                  to: '',
                                  subject: `Fwd: ${selectedEmail.subject}`,
                                  body: `\n\n--- Messaggio Inoltrato ---\nDa: ${selectedEmail.from.name || selectedEmail.from.address}\nData: ${new Date(selectedEmail.date).toLocaleString('it-IT')}\nOggetto: ${selectedEmail.subject}\n\n${selectedEmail.text}`,
                                  attachments: [],
                                  references: [selectedEmail.uid]
                                });
                                setIsForwarding(true);
                                setIsReplying(false);
                                setIsComposing(true);
                              }}
                              className="flex items-center gap-2 px-4 py-2 hover:bg-stone-100 rounded-xl transition-all text-sm font-medium text-stone-600"
                            >
                              <Forward className="w-4 h-4" />
                              Inoltra
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => setEmailToDelete(selectedEmail.uid)}
                              className="p-2 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all text-stone-400"
                              title="Elimina"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>

                        {/* Detail Content */}
                        <div className="p-8 max-w-4xl mx-auto w-full">
                          <h1 className="text-2xl font-serif text-stone-900 mb-6">{selectedEmail.subject}</h1>
                          
                          <div className="flex items-start gap-4 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-400 font-bold text-lg">
                              {(selectedEmail.from.name || selectedEmail.from.address)[0].toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <p className="font-bold text-stone-900 truncate">
                                  {selectedEmail.from.name || selectedEmail.from.address}
                                </p>
                                <p className="text-xs text-stone-400 font-medium">
                                  {new Date(selectedEmail.date).toLocaleString('it-IT', { 
                                    day: '2-digit', month: 'long', year: 'numeric', 
                                    hour: '2-digit', minute: '2-digit' 
                                  })}
                                </p>
                              </div>
                              <p className="text-xs text-stone-500 truncate">
                                A: {selectedEmail.to.name || selectedEmail.to.address || 'Me'}
                              </p>
                            </div>
                          </div>

                          {/* Email Body */}
                          <div className="prose prose-stone max-w-none mb-12">
                            {selectedEmail.html ? (
                              <div 
                                dangerouslySetInnerHTML={{ __html: selectedEmail.html }} 
                                className="email-content-html"
                              />
                            ) : (
                              <pre className="whitespace-pre-wrap font-sans text-stone-700 leading-relaxed">
                                {selectedEmail.text}
                              </pre>
                            )}
                          </div>

                          {/* Attachments */}
                          {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                            <div className="border-t border-stone-100 pt-8">
                              <h3 className="text-sm font-bold text-stone-900 mb-4 flex items-center gap-2">
                                <Paperclip className="w-4 h-4" />
                                Allegati ({selectedEmail.attachments.length})
                              </h3>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {selectedEmail.attachments.map((att: any, idx: number) => (
                                  <a 
                                    key={idx}
                                    href={`/api/emails/${selectedEmail.uid}/attachment/${att.part}?folder=${selectedFolder}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-3 border border-stone-100 rounded-2xl hover:bg-stone-50 transition-all group"
                                  >
                                    <div className="w-10 h-10 rounded-xl bg-stone-50 flex items-center justify-center text-stone-400 group-hover:bg-white transition-all">
                                      <FileText className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-stone-900 truncate">{att.filename}</p>
                                      <p className="text-[10px] text-stone-400 uppercase font-bold">
                                        {(att.size / 1024).toFixed(1)} KB
                                      </p>
                                    </div>
                                    <Download className="w-4 h-4 text-stone-300 group-hover:text-stone-900 transition-all" />
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : isLoadingEmails ? (
                      <div className="h-full flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-stone-300 animate-spin" />
                      </div>
                    ) : emails.length > 0 ? (
                      <div className="divide-y divide-stone-50">
                        {emails.map((email) => (
                          <div 
                            key={email.uid}
                            onClick={() => fetchEmailDetail(email.uid)}
                            className={`p-4 cursor-pointer transition-all hover:bg-stone-50 group border-l-4 ${
                              email.flags?.includes('\\Seen') ? 'border-transparent' : 'border-stone-900 bg-stone-50/50'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <p className={`text-sm truncate flex-1 ${email.flags?.includes('\\Seen') ? 'text-stone-600' : 'font-bold text-stone-900'}`}>
                                {email.from?.name || email.from?.address || 'Sconosciuto'}
                              </p>
                              <span className="text-[10px] text-stone-400 font-bold uppercase ml-2">
                                {new Date(email.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}
                              </span>
                            </div>
                            <p className={`text-sm truncate ${email.flags?.includes('\\Seen') ? 'text-stone-500' : 'font-semibold text-stone-800'}`}>
                              {email.subject || '(Nessun oggetto)'}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              {email.hasAttachments && <Paperclip className="w-3 h-3 text-stone-400" />}
                              <p className="text-xs text-stone-400 line-clamp-1 flex-1">
                                {email.preview || 'Nessuna anteprima disponibile'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-stone-400 p-8">
                        <Mail className="w-12 h-12 mb-4 opacity-20" />
                        <p>Nessuna email trovata in questa cartella.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pagination Footer */}
                <div className="p-4 border-t border-stone-100 bg-stone-50/50 flex items-center justify-between">
                  <p className="text-xs text-stone-500 font-medium">
                    Pagina {emailPage} di {emailTotalPages}
                  </p>
                  <div className="flex gap-2">
                    <button 
                      disabled={emailPage === 1}
                      onClick={() => setEmailPage(p => Math.max(1, p - 1))}
                      className="p-2 rounded-lg border border-stone-200 bg-white disabled:opacity-50 hover:bg-stone-50 transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button 
                      disabled={emailPage === emailTotalPages}
                      onClick={() => setEmailPage(p => Math.min(emailTotalPages, p + 1))}
                      className="p-2 rounded-lg border border-stone-200 bg-white disabled:opacity-50 hover:bg-stone-50 transition-all"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {isStaff && activeTab === 'sponsors' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-serif text-stone-900">Sponsor & Pubblicità</h2>
                    <p className="text-stone-500 mt-1">Gestisci gli sponsor da visualizzare sulla homepage.</p>
                  </div>
                  <button 
                    onClick={() => {
                      setEditingSponsor({ 
                        name: '', 
                        image: '', 
                        startDate: new Date().toISOString().split('T')[0], 
                        endDate: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0], 
                        active: 1,
                        position: sponsors.length
                      });
                      setSponsorImageFile(null);
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-2xl font-bold hover:bg-stone-800 transition-all shadow-lg shadow-stone-900/20"
                  >
                    <Plus className="w-5 h-5" />
                    Nuovo Sponsor
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sponsors.map((sponsor: any, index: number) => (
                    <div 
                      key={sponsor.id} 
                      className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all group relative cursor-pointer"
                      onClick={() => {
                        setEditingSponsor(sponsor);
                        setSponsorImageFile(null);
                      }}
                    >
                      <div className="aspect-video bg-stone-100 relative overflow-hidden">
                        {sponsor.image ? (
                          <img src={sponsor.image} alt={sponsor.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-400">
                            <ImageIcon className="w-12 h-12 opacity-20" />
                          </div>
                        )}
                        
                        {/* Reorder Controls */}
                        {sponsors.length > 1 && (
                          <div className="absolute left-4 top-4 flex flex-col gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                reorderSponsors('up', sponsor);
                              }}
                              disabled={index === 0}
                              className="p-2 bg-white/90 backdrop-blur-sm text-stone-900 rounded-lg hover:bg-white disabled:opacity-30 shadow-sm transition-all"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                reorderSponsors('down', sponsor);
                              }}
                              disabled={index === sponsors.length - 1}
                              className="p-2 bg-white/90 backdrop-blur-sm text-stone-900 rounded-lg hover:bg-white disabled:opacity-30 shadow-sm transition-all"
                            >
                              <ArrowDown className="w-4 h-4" />
                            </button>
                          </div>
                        )}

                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingSponsor(sponsor);
                              setSponsorImageFile(null);
                            }}
                            className="p-3 bg-white text-stone-900 rounded-xl hover:scale-110 transition-transform"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSponsorToDelete(sponsor);
                            }}
                            className="p-3 bg-red-600 text-white rounded-xl hover:scale-110 transition-transform"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                        <div className="absolute top-4 right-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${sponsor.active ? 'bg-emerald-500 text-white' : 'bg-stone-500 text-white'}`}>
                            {sponsor.active ? 'Attivo' : 'Inattivo'}
                          </span>
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="font-serif text-xl text-stone-900 mb-2">{sponsor.name}</h3>
                        <div className="flex items-center gap-4 text-xs text-stone-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(sponsor.startDate).toLocaleDateString('it-IT')}
                          </div>
                          <ChevronRight className="w-3 h-3" />
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(sponsor.endDate).toLocaleDateString('it-IT')}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {sponsors.length === 0 && (
                  <div className="text-center py-20 bg-stone-50 rounded-[2rem] border-2 border-dashed border-stone-200">
                    <Building className="w-16 h-16 text-stone-200 mx-auto mb-4" />
                    <p className="text-stone-400 font-serif text-xl">Nessun sponsor registrato</p>
                    <button 
                      onClick={() => setEditingSponsor({ name: '', image: '', startDate: new Date().toISOString().split('T')[0], endDate: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0], active: 1 })}
                      className="mt-4 text-stone-900 font-bold hover:underline"
                    >
                      Aggiungi il primo sponsor
                    </button>
                  </div>
                )}
              </div>
            )}

            {isSuperAdmin && activeTab === 'visitors' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-serif text-stone-900">Statistiche Visitatori</h2>
                    <p className="text-stone-500 mt-1">Monitora gli accessi al sito web.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                      <Users className="w-6 h-6 text-stone-900" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-stone-400 uppercase tracking-widest">Visite Totali</p>
                      <p className="text-3xl font-serif text-stone-900">{visitorsData?.totalVisits || 0}</p>
                    </div>
                  </div>
                  <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                      <BarChart className="w-6 h-6 text-stone-900" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-stone-400 uppercase tracking-widest">Ultimi 30 Giorni</p>
                      <p className="text-3xl font-serif text-stone-900">{visitorsData?.recentVisits?.length || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
                  <div className="p-6 border-b border-stone-100">
                    <h3 className="text-lg font-serif text-stone-900">Dettaglio Accessi (Ultimi 30 gg)</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-stone-50 text-stone-500 font-medium">
                        <tr>
                          <th className="px-6 py-4">Data e Ora</th>
                          <th className="px-6 py-4">Indirizzo IP</th>
                          <th className="px-6 py-4">Dispositivo</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {visitorsData?.recentVisits?.map((visit: any) => (
                          <tr key={visit.id} className="hover:bg-stone-50/50 transition-colors">
                            <td className="px-6 py-4">{new Date(visit.timestamp).toLocaleString('it-IT')}</td>
                            <td className="px-6 py-4 font-mono text-xs">{visit.ip}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                                visit.deviceType === 'Mobile' ? 'bg-blue-50 text-blue-600' :
                                visit.deviceType === 'Tablet' ? 'bg-purple-50 text-purple-600' :
                                'bg-stone-100 text-stone-600'
                              }`}>
                                {visit.deviceType}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {(!visitorsData?.recentVisits || visitorsData.recentVisits.length === 0) && (
                          <tr>
                            <td colSpan={3} className="px-6 py-8 text-center text-stone-500 italic">
                              Nessun dato disponibile per gli ultimi 30 giorni.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {isSuperAdmin && activeTab === 'association' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-serif text-stone-900">Dati Associazione</h2>
                    <p className="text-stone-500 mt-1">Configura le informazioni legali dell'associazione per i documenti ufficiali.</p>
                  </div>
                  <button 
                    onClick={async () => {
                      try {
                        const response = await fetch('/api/settings/association_details', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ value: associationDetails })
                        });
                        if (response.ok) {
                          setNotification({ message: 'Dati salvati con successo!', type: 'success' });
                        }
                      } catch (error) {
                        setNotification({ message: 'Errore durante il salvataggio', type: 'error' });
                      }
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-2xl font-bold hover:bg-stone-800 transition-all shadow-lg shadow-stone-900/20"
                  >
                    <Save className="w-5 h-5" />
                    Salva Modifiche
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-8 bg-white border border-stone-200 rounded-3xl shadow-sm space-y-6">
                    <h3 className="font-serif text-xl text-stone-900">Informazioni Generali</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">Nome Associazione</label>
                        <input 
                          value={associationDetails.name}
                          onChange={(e) => setAssociationDetails({ ...associationDetails, name: e.target.value })}
                          className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:ring-2 focus:ring-stone-900 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">Sede Legale (Indirizzo)</label>
                        <input 
                          value={associationDetails.address}
                          onChange={(e) => setAssociationDetails({ ...associationDetails, address: e.target.value })}
                          className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:ring-2 focus:ring-stone-900 outline-none transition-all"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">Comune</label>
                          <input 
                            value={associationDetails.municipality}
                            onChange={(e) => setAssociationDetails({ ...associationDetails, municipality: e.target.value })}
                            className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:ring-2 focus:ring-stone-900 outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">Provincia</label>
                          <input 
                            value={associationDetails.province}
                            onChange={(e) => setAssociationDetails({ ...associationDetails, province: e.target.value })}
                            className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:ring-2 focus:ring-stone-900 outline-none transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">Codice Fiscale</label>
                        <input 
                          value={associationDetails.cf}
                          onChange={(e) => setAssociationDetails({ ...associationDetails, cf: e.target.value })}
                          className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:ring-2 focus:ring-stone-900 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-8 bg-white border border-stone-200 rounded-3xl shadow-sm space-y-6">
                    <h3 className="font-serif text-xl text-stone-900">Rappresentanza Legale</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">Rappresentante Legale (Nome e Cognome)</label>
                        <input 
                          value={associationDetails.legalRepresentative}
                          onChange={(e) => setAssociationDetails({ ...associationDetails, legalRepresentative: e.target.value })}
                          className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:ring-2 focus:ring-stone-900 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">Email di Contatto</label>
                        <input 
                          value={associationDetails.email}
                          onChange={(e) => setAssociationDetails({ ...associationDetails, email: e.target.value })}
                          className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:ring-2 focus:ring-stone-900 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">Telefono</label>
                        <input 
                          value={associationDetails.phone}
                          onChange={(e) => setAssociationDetails({ ...associationDetails, phone: e.target.value })}
                          className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:ring-2 focus:ring-stone-900 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>
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

                <div className="mt-12 p-8 bg-white border border-stone-200 rounded-[2rem] shadow-sm">
                  <h3 className="text-lg font-serif text-stone-900 mb-6 flex items-center gap-2">
                    <Video className="w-5 h-5 text-red-500" />
                    Gestione Diretta Live Streaming
                  </h3>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-100">
                      <div>
                        <p className="font-bold text-stone-900">Stato Diretta</p>
                        <p className="text-xs text-stone-500">Attiva o disattiva la visualizzazione della diretta in homepage</p>
                      </div>
                      <button
                        onClick={() => {
                          const updated = { ...liveStream, active: !liveStream.active };
                          setLiveStream(updated);
                          saveLiveStream(updated);
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                          liveStream.active ? 'bg-red-500' : 'bg-stone-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            liveStream.active ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">Tipo Streaming</label>
                        <select
                          value={liveStream.type}
                          onChange={(e) => setLiveStream({ ...liveStream, type: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-stone-900 transition-all bg-white"
                        >
                          <option value="youtube">YouTube Live</option>
                          <option value="facebook">Facebook Live</option>
                          <option value="streamyard">StreamYard On-Air</option>
                          <option value="other">Altro (IPCam / HLS)</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">URL Diretta</label>
                        <input
                          type="text"
                          value={liveStream.url}
                          onChange={(e) => setLiveStream({ ...liveStream, url: e.target.value })}
                          placeholder="Inserisci l'URL della diretta..."
                          className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-stone-900 transition-all"
                        />
                      </div>
                    </div>

                    <div className="pt-4 flex gap-4">
                      <button
                        onClick={() => saveLiveStream(liveStream)}
                        className="bg-stone-900 text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-stone-800 transition-colors"
                      >
                        Salva Impostazioni Live
                      </button>
                      {liveStream.type === 'streamyard' && (
                        <a 
                          href="https://streamyard.com" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="px-8 py-3 border border-stone-200 text-stone-600 rounded-xl text-sm font-bold hover:bg-stone-50 transition-colors flex items-center gap-2"
                        >
                          Apri StreamYard <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>

                    <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                      <p className="text-xs text-amber-800 leading-relaxed">
                        <strong>Nota:</strong> Per le dirette da smartphone, puoi usare YouTube Live o Facebook Live e incollare qui l'URL della trasmissione. 
                        Se usi <strong>StreamYard On-Air</strong>, incolla l'URL della tua trasmissione On-Air (es. streamyard.com/on-air/...). 
                        Per le IPCam, assicurati che l'URL sia accessibile pubblicamente (es. stream HLS .m3u8).
                      </p>
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
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addContest({ ...contest, showOnHomepage: !contest.showOnHomepage });
                                }}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                                  contest.showOnHomepage ? 'bg-emerald-500 text-white' : 'bg-stone-200 text-stone-500'
                                }`}
                              >
                                {contest.showOnHomepage ? 'Attiva' : 'Disattivata'}
                              </button>
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
                              onClick={() => shareOnFacebook(`${window.location.origin}/contests/${contest.id}`)}
                              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-blue-100 transition-all"
                              title="Condividi su Facebook"
                            >
                              <Facebook className="w-4 h-4" />
                              Facebook
                            </button>
                            <button 
                              onClick={() => copyToClipboard(generateSocialPost(contest, 'contest'))}
                              className="flex items-center gap-2 px-4 py-2 bg-stone-100 text-stone-600 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-stone-200 transition-all"
                              title="Copia testo per Social"
                            >
                              <Copy className="w-4 h-4" />
                              Copia Testo
                            </button>
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
                                setSelectedContestForComm(contest);
                                fetchContestCommHistory(contest.id);
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
                    {editingContest.id && (
                      <button 
                        type="button" 
                        onClick={() => {
                          setContestToDelete(editingContest);
                          setEditingContest(null);
                        }}
                        className="px-6 py-4 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all flex items-center gap-2 mr-auto"
                      >
                        <Trash2 className="w-4 h-4" />
                        Elimina Definitivamente
                      </button>
                    )}
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
        {accountToDelete && (
          <ConfirmationModal 
            isOpen={!!accountToDelete}
            onClose={() => setAccountToDelete(null)}
            onConfirm={async () => {
              setIsDeleting(true);
              try {
                const response = await fetch(`/api/users/${accountToDelete.id}`, { method: 'DELETE' });
                if (response.ok) {
                  setNotification({ message: 'Account eliminato con successo!', type: 'success' });
                  await fetchData();
                  setAccountToDelete(null);
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
            title="Elimina Account"
            message={`Sei sicuro di voler eliminare l'account "${accountToDelete.username}"?`}
            isDeleting={isDeleting}
          />
        )}

        {collectionToDelete && (
          <ConfirmationModal 
            isOpen={!!collectionToDelete}
            onClose={() => setCollectionToDelete(null)}
            onConfirm={async () => {
              setIsDeleting(true);
              try {
                const response = await fetch(`/api/finances/${collectionToDelete.id}`, { method: 'DELETE' });
                if (response.ok) {
                  setNotification({ message: 'Operazione eliminata e numerazione ricalcolata!', type: 'success' });
                  await fetchData();
                  setCollectionToDelete(null);
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
            title="Elimina Operazione"
            message={`Sei sicuro di voler eliminare l'operazione "${collectionToDelete.event_name}"? ${collectionToDelete.receipt_number ? `Questa azione ricalcolerà anche la numerazione delle ricevute per l'anno ${collectionToDelete.social_year}.` : ''}`}
            isDeleting={isDeleting}
          />
        )}

        {/* Compose Email Modal */}
        {isComposing && (
          <motion.div 
            key="compose-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[130] flex items-center justify-center p-4"
          >
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsComposing(false)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-3xl h-[85vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-stone-900 rounded-xl flex items-center justify-center text-white">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-serif text-stone-900">
                      {isReplying ? 'Rispondi' : isForwarding ? 'Inoltra' : 'Nuovo Messaggio'}
                    </h3>
                    <p className="text-xs text-stone-400 font-bold uppercase tracking-widest">Componi Email</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsComposing(false)}
                  className="p-2 hover:bg-stone-100 rounded-xl transition-all text-stone-400 hover:text-stone-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                <div className="space-y-4">
                  <div className="flex items-center gap-4 border-b border-stone-100 pb-2">
                    <span className="text-sm font-bold text-stone-400 w-12">A:</span>
                    <input 
                      type="text"
                      value={composeData.to}
                      onChange={(e) => setComposeData({ ...composeData, to: e.target.value })}
                      placeholder="Indirizzo email destinatario"
                      className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-stone-900"
                    />
                  </div>
                  <div className="flex items-center gap-4 border-b border-stone-100 pb-2">
                    <span className="text-sm font-bold text-stone-400 w-12">Oggetto:</span>
                    <input 
                      type="text"
                      value={composeData.subject}
                      onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                      placeholder="Oggetto del messaggio"
                      className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-stone-900"
                    />
                  </div>
                </div>

                <textarea 
                  value={composeData.body}
                  onChange={(e) => setComposeData({ ...composeData, body: e.target.value })}
                  placeholder="Scrivi qui il tuo messaggio..."
                  className="w-full h-64 bg-stone-50 rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-stone-900 transition-all resize-none border border-stone-100"
                />

                {/* Attachments List */}
                {composeData.attachments.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Allegati ({composeData.attachments.length})</h4>
                    <div className="flex flex-wrap gap-2">
                      {composeData.attachments.map((file, idx) => (
                        <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-stone-100 rounded-lg text-xs font-medium text-stone-700 border border-stone-200">
                          <Paperclip className="w-3 h-3" />
                          <span className="truncate max-w-[150px]">{file.name}</span>
                          <button 
                            onClick={() => setComposeData({
                              ...composeData,
                              attachments: composeData.attachments.filter((_, i) => i !== idx)
                            })}
                            className="hover:text-red-600 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-stone-100 bg-stone-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <label className="p-2 hover:bg-stone-200 rounded-xl transition-all text-stone-600 cursor-pointer" title="Allega file">
                    <Paperclip className="w-5 h-5" />
                    <input 
                      type="file" 
                      multiple 
                      className="hidden" 
                      onChange={handleEmailFileChange}
                    />
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setIsComposing(false)}
                    className="px-6 py-2.5 text-stone-600 font-bold hover:bg-stone-100 rounded-xl transition-all"
                  >
                    Annulla
                  </button>
                  <button 
                    onClick={sendEmail}
                    disabled={isLoadingEmails}
                    className="flex items-center gap-2 px-8 py-2.5 bg-stone-900 text-white rounded-xl font-bold hover:bg-stone-800 transition-all shadow-lg shadow-stone-900/20 disabled:opacity-50"
                  >
                    {isLoadingEmails ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Invia
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

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
                  Vuoi eliminare definitivamente la lotteria <span className="font-bold text-stone-900">"{lotteryToDelete.name}"</span>{lotteryToDelete.id ? " dall'archivio" : ""}?
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setLotteryToDelete(null)} className="flex-1 py-4 rounded-xl font-bold text-stone-500 hover:bg-stone-50 transition-all">Annulla</button>
                  <button 
                    onClick={async () => {
                      let updatedLottery;
                      // If it has an ID and it's not the current one (ID 1), it's a history item
                      if (lotteryToDelete.id && lotteryToDelete.id != 1) {
                        updatedLottery = {
                          ...lottery,
                          history: (lottery.history || []).filter((h: any) => h.id != lotteryToDelete.id)
                        };
                      } else {
                        // Otherwise it's the current lottery, so we reset it
                        updatedLottery = {
                          ...lottery,
                          active: false,
                          showOnHomepage: false,
                          name: '',
                          drawDate: '',
                          ticketsCount: 1000,
                          ticketPrice: 2.50,
                          prizes: [],
                          regulations_path: null,
                          municipality_request_path: null,
                          minutes_path: null,
                          history: lottery.history || []
                        };
                      }
                      await saveLottery(updatedLottery);
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
          <ConfirmationModal 
            isOpen={!!pollToDelete}
            onClose={() => setPollToDelete(null)}
            onConfirm={async () => {
              setIsDeleting(true);
              try {
                const response = await fetch(`/api/polls/${pollToDelete.id}`, { method: 'DELETE' });
                if (response.ok) {
                  setPolls(polls.filter((p: any) => p.id !== pollToDelete.id));
                  if (poll?.id === pollToDelete.id) {
                    createNewPoll();
                  }
                  setNotification({ message: 'Sondaggio eliminato', type: 'success' });
                  setPollToDelete(null);
                }
              } catch (error) {
                setNotification({ message: 'Errore durante l\'eliminazione', type: 'error' });
              } finally {
                setIsDeleting(false);
              }
            }}
            title="Elimina Sondaggio"
            message={`Vuoi eliminare il sondaggio "${pollToDelete.question}"?`}
            isDeleting={isDeleting}
            icon={<Vote className="w-8 h-8 text-red-600" />}
          />
        )}

        {minuteToDelete && (
          <ConfirmationModal 
            isOpen={!!minuteToDelete}
            onClose={() => setMinuteToDelete(null)}
            onConfirm={async () => {
              setIsDeleting(true);
              try {
                const response = await fetch(`/api/minutes/${minuteToDelete.id}`, { method: 'DELETE' });
                if (response.ok) {
                  setNotification({ message: 'Verbale eliminato!', type: 'success' });
                  await fetchData();
                  setMinuteToDelete(null);
                }
              } catch (error) {
                setNotification({ message: 'Errore di connessione', type: 'error' });
              } finally {
                setIsDeleting(false);
              }
            }}
            title="Elimina Verbale"
            message={`Sei sicuro di voler eliminare il verbale del ${new Date(minuteToDelete.date).toLocaleDateString('it-IT')}?`}
            isDeleting={isDeleting}
            icon={<FileText className="w-8 h-8 text-red-600" />}
          />
        )}

        {appointmentToDelete && (
          <ConfirmationModal 
            isOpen={!!appointmentToDelete}
            onClose={() => setAppointmentToDelete(null)}
            onConfirm={async () => {
              setIsDeleting(true);
              try {
                const response = await fetch(`/api/appointments/${appointmentToDelete.id}`, { method: 'DELETE' });
                if (response.ok) {
                  setNotification({ message: 'Appuntamento eliminato!', type: 'success' });
                  await fetchData();
                  setAppointmentToDelete(null);
                }
              } catch (error) {
                setNotification({ message: 'Errore di connessione', type: 'error' });
              } finally {
                setIsDeleting(false);
              }
            }}
            title="Elimina Appuntamento"
            message={`Sei sicuro di voler eliminare l'appuntamento "${appointmentToDelete.title}"?`}
            isDeleting={isDeleting}
            icon={<Calendar className="w-8 h-8 text-red-600" />}
          />
        )}

        {memberToDelete && (
          <ConfirmationModal 
            isOpen={!!memberToDelete}
            onClose={() => setMemberToDelete(null)}
            onConfirm={async () => {
              setIsDeleting(true);
              try {
                const response = await fetch(`/api/members/${memberToDelete.id}`, { method: 'DELETE' });
                if (response.ok) {
                  setNotification({ message: 'Socio eliminato!', type: 'success' });
                  await fetchData();
                  setMemberToDelete(null);
                }
              } catch (error) {
                setNotification({ message: 'Errore di connessione', type: 'error' });
              } finally {
                setIsDeleting(false);
              }
            }}
            title="Elimina Socio"
            message={`Sei sicuro di voler eliminare il socio ${memberToDelete.name} ${memberToDelete.surname}?`}
            isDeleting={isDeleting}
            icon={<Users className="w-8 h-8 text-red-600" />}
          />
        )}

        {newsToDelete && (
          <ConfirmationModal 
            isOpen={!!newsToDelete}
            onClose={() => setNewsToDelete(null)}
            onConfirm={async () => {
              setIsDeleting(true);
              try {
                const response = await fetch(`/api/news/${newsToDelete.id}`, { method: 'DELETE' });
                if (response.ok) {
                  setNotification({ message: 'Notizia eliminata!', type: 'success' });
                  await fetchData();
                  setNewsToDelete(null);
                }
              } catch (error) {
                setNotification({ message: 'Errore di connessione', type: 'error' });
              } finally {
                setIsDeleting(false);
              }
            }}
            title="Elimina Notizia"
            message={`Sei sicuro di voler eliminare la notizia "${newsToDelete.title}"?`}
            isDeleting={isDeleting}
            icon={<Newspaper className="w-8 h-8 text-red-600" />}
          />
        )}

        {galleryItemToDelete && (
          <ConfirmationModal 
            isOpen={!!galleryItemToDelete}
            onClose={() => setGalleryItemToDelete(null)}
            onConfirm={async () => {
              setIsDeleting(true);
              try {
                const response = await fetch(`/api/gallery/${galleryItemToDelete.id}`, { method: 'DELETE' });
                if (response.ok) {
                  setNotification({ message: 'Elemento rimosso dalla galleria!', type: 'success' });
                  await fetchData();
                  setGalleryItemToDelete(null);
                }
              } catch (error) {
                setNotification({ message: 'Errore di connessione', type: 'error' });
              } finally {
                setIsDeleting(false);
              }
            }}
            title="Elimina dalla Galleria"
            message="Sei sicuro di voler eliminare questo elemento dalla galleria?"
            isDeleting={isDeleting}
            icon={<ImageIcon className="w-8 h-8 text-red-600" />}
          />
        )}

        {memberRegistrationToDelete && (
          <ConfirmationModal 
            isOpen={!!memberRegistrationToDelete}
            onClose={() => setMemberRegistrationToDelete(null)}
            onConfirm={async () => {
              setIsDeleting(true);
              try {
                const response = await fetch(`/api/registrations/${memberRegistrationToDelete.id}`, { method: 'DELETE' });
                if (response.ok) {
                  setNotification({ message: 'Iscrizione eliminata!', type: 'success' });
                  await fetchData();
                  setMemberRegistrationToDelete(null);
                }
              } catch (error) {
                setNotification({ message: 'Errore di connessione', type: 'error' });
              } finally {
                setIsDeleting(false);
              }
            }}
            title="Elimina Iscrizione"
            message={`Sei sicuro di voler eliminare l'iscrizione di ${memberRegistrationToDelete.name}?`}
            isDeleting={isDeleting}
            icon={<UserPlus className="w-8 h-8 text-red-600" />}
          />
        )}

        {galleryItemToDelete && (
          <ConfirmationModal 
            isOpen={!!galleryItemToDelete}
            onClose={() => setGalleryItemToDelete(null)}
            onConfirm={() => handleDeleteGallery(galleryItemToDelete)}
            title="Elimina Elemento"
            message="Sei sicuro di voler eliminare questo elemento dalla galleria?"
            isDeleting={isDeleting}
            icon={<Trash2 className="w-8 h-8 text-red-600" />}
          />
        )}

        {showResetConfirm && (
          <ConfirmationModal 
            isOpen={showResetConfirm}
            onClose={() => setShowResetConfirm(false)}
            onConfirm={reset2026Payments}
            title="Azzera Iscrizioni 2026"
            message="Sei sicuro di voler azzerare tutte le iscrizioni per l'anno 2026? Questa operazione non è reversibile."
            isDeleting={isDeleting}
            icon={<AlertCircle className="w-8 h-8 text-red-600" />}
          />
        )}

        {emailToDelete && (
          <ConfirmationModal 
            isOpen={!!emailToDelete}
            onClose={() => setEmailToDelete(null)}
            onConfirm={() => moveEmailToTrash(emailToDelete)}
            title="Sposta nel cestino"
            message="Sei sicuro di voler spostare questa email nel cestino?"
            isDeleting={isDeleting}
            icon={<Trash2 className="w-8 h-8 text-red-600" />}
          />
        )}

        {sponsorToDelete && (
          <ConfirmationModal 
            isOpen={!!sponsorToDelete}
            onClose={() => setSponsorToDelete(null)}
            onConfirm={() => deleteSponsor(sponsorToDelete.id)}
            title="Elimina Sponsor"
            message={`Sei sicuro di voler eliminare lo sponsor "${sponsorToDelete?.name}"? Questa azione non può essere annullata.`}
            isDeleting={isDeleting}
            icon={<Building className="w-8 h-8 text-red-600" />}
          />
        )}

        {bookingEventToDelete && (
          <ConfirmationModal 
            isOpen={!!bookingEventToDelete}
            onClose={() => setBookingEventToDelete(null)}
            onConfirm={() => deleteBookingEvent(bookingEventToDelete.id)}
            title="Elimina Evento"
            message={`Sei sicuro di voler eliminare l'evento "${bookingEventToDelete?.title}"? Verranno eliminate anche tutte le prenotazioni associate.`}
            isDeleting={isDeleting}
            icon={<Ticket className="w-8 h-8 text-red-600" />}
          />
        )}

        {bookingToDelete && (
          <ConfirmationModal 
            isOpen={!!bookingToDelete}
            onClose={() => setBookingToDelete(null)}
            onConfirm={async () => {
              setIsDeleting(true);
              try {
                const res = await fetch(`/api/bookings/${bookingToDelete.id}`, { method: 'DELETE' });
                if (res.ok) {
                  setBookingToDelete(null);
                  setNotification({ message: 'Prenotazione eliminata!', type: 'success' });
                  await fetchData();
                }
              } catch (err) {
                setNotification({ message: 'Errore durante l\'eliminazione', type: 'error' });
              } finally {
                setIsDeleting(false);
              }
            }}
            title="Elimina Prenotazione"
            message={`Sei sicuro di voler eliminare la prenotazione di "${bookingToDelete?.name}"?`}
            isDeleting={isDeleting}
            icon={<Users className="w-8 h-8 text-red-600" />}
          />
        )}

        {editingSponsor && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-[2rem] p-8 max-w-lg w-full shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-serif text-stone-900">
                  {editingSponsor.id ? 'Modifica Sponsor' : 'Nuovo Sponsor'}
                </h3>
                <button onClick={() => setEditingSponsor(null)} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
                  <X className="w-6 h-6 text-stone-400" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">Nome Sponsor</label>
                  <input 
                    value={editingSponsor.name}
                    onChange={(e) => setEditingSponsor({ ...editingSponsor, name: e.target.value })}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:ring-2 focus:ring-stone-900 outline-none transition-all"
                    placeholder="es. Ristorante Da Mario"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">Data Inizio</label>
                    <input 
                      type="date"
                      value={editingSponsor.startDate}
                      onChange={(e) => setEditingSponsor({ ...editingSponsor, startDate: e.target.value })}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:ring-2 focus:ring-stone-900 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">Data Fine</label>
                    <input 
                      type="date"
                      value={editingSponsor.endDate}
                      onChange={(e) => setEditingSponsor({ ...editingSponsor, endDate: e.target.value })}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:ring-2 focus:ring-stone-900 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">Stato</label>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setEditingSponsor({ ...editingSponsor, active: 1 })}
                      className={`flex-1 py-3 rounded-xl border-2 transition-all font-bold text-xs uppercase tracking-widest ${editingSponsor.active ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-stone-100 text-stone-400'}`}
                    >
                      Attivo
                    </button>
                    <button 
                      onClick={() => setEditingSponsor({ ...editingSponsor, active: 0 })}
                      className={`flex-1 py-3 rounded-xl border-2 transition-all font-bold text-xs uppercase tracking-widest ${!editingSponsor.active ? 'border-stone-500 bg-stone-50 text-stone-700' : 'border-stone-100 text-stone-400'}`}
                    >
                      Inattivo
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">Immagine Sponsor</label>
                  <div className="flex flex-col gap-4">
                    { (editingSponsor.image || sponsorImageFile) && (
                      <div className="aspect-video rounded-2xl overflow-hidden border border-stone-200">
                        <img 
                          src={sponsorImageFile ? URL.createObjectURL(sponsorImageFile) : editingSponsor.image} 
                          alt="Preview" 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer" 
                        />
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input 
                        type="file" 
                        id="sponsor-image-upload" 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setSponsorImageFile(file);
                          }
                        }}
                      />
                      <button 
                        onClick={() => document.getElementById('sponsor-image-upload')?.click()}
                        className="flex-1 py-3 bg-stone-100 text-stone-900 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-stone-200 transition-all flex items-center justify-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        Carica Immagine
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-6 flex gap-3">
                  <button 
                    onClick={() => setEditingSponsor(null)}
                    className="flex-1 py-4 rounded-2xl font-bold text-stone-500 hover:bg-stone-50 transition-all"
                  >
                    Annulla
                  </button>
                  <button 
                    onClick={() => addSponsor(editingSponsor)}
                    className="flex-1 py-4 bg-stone-900 text-white rounded-2xl font-bold hover:bg-stone-800 transition-all shadow-lg shadow-stone-900/20"
                  >
                    {editingSponsor.id ? 'Aggiorna' : 'Crea'}
                  </button>
                </div>
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
        {selectedContestForComm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[90] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
                <div>
                  <h2 className="text-2xl font-black text-stone-900 tracking-tight">Invia Comunicazione</h2>
                  <p className="text-stone-500 text-sm font-medium mt-1">Concorso: {selectedContestForComm.title}</p>
                </div>
                <button 
                  onClick={() => setSelectedContestForComm(null)}
                  className="p-3 hover:bg-white rounded-2xl transition-all shadow-sm border border-transparent hover:border-stone-200 group"
                >
                  <X className="w-6 h-6 text-stone-400 group-hover:text-stone-900" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 ml-1">Titolo Comunicazione</label>
                    <input
                      type="text"
                      value={contestCommForm.title}
                      onChange={(e) => setContestCommForm({ ...contestCommForm, title: e.target.value })}
                      className="w-full px-6 py-4 bg-stone-50 border-2 border-transparent focus:border-stone-900 rounded-2xl transition-all outline-none font-medium"
                      placeholder="Es: Aggiornamento date concorso"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 ml-1">Messaggio</label>
                    <textarea
                      value={contestCommForm.message}
                      onChange={(e) => setContestCommForm({ ...contestCommForm, message: e.target.value })}
                      className="w-full px-6 py-4 bg-stone-50 border-2 border-transparent focus:border-stone-900 rounded-2xl transition-all outline-none font-medium min-h-[200px] resize-none"
                      placeholder="Scrivi qui il contenuto della comunicazione..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 ml-1">Allegato (Documento o Immagine)</label>
                    <div className="relative group">
                      <input
                        type="file"
                        onChange={(e) => setContestCommForm({ ...contestCommForm, attachment: e.target.files?.[0] || null })}
                        className="hidden"
                        id="contest-comm-attachment"
                      />
                      <label
                        htmlFor="contest-comm-attachment"
                        className="flex items-center justify-center gap-3 w-full px-6 py-8 bg-stone-50 border-2 border-dashed border-stone-200 rounded-2xl cursor-pointer group-hover:border-stone-900 group-hover:bg-stone-100/50 transition-all"
                      >
                        {contestCommForm.attachment ? (
                          <div className="flex items-center gap-3">
                            <FileCheck className="w-6 h-6 text-emerald-600" />
                            <span className="font-bold text-stone-900">{contestCommForm.attachment.name}</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <Paperclip className="w-8 h-8 text-stone-400 group-hover:text-stone-900 transition-colors" />
                            <span className="text-sm font-bold text-stone-500 group-hover:text-stone-900">Clicca per allegare un file</span>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-stone-100">
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] text-stone-400 mb-4">Storico Comunicazioni</h3>
                  {isLoadingCommHistory ? (
                    <div className="flex justify-center py-8">
                      <div className="w-6 h-6 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : contestCommHistory.length > 0 ? (
                    <div className="space-y-4">
                      {contestCommHistory.map((comm) => (
                        <div key={comm.id} className="p-4 bg-stone-50 rounded-2xl border border-stone-100">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-stone-900">{comm.title}</h4>
                            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                              {new Date(comm.sentAt).toLocaleString('it-IT')}
                            </span>
                          </div>
                          <p className="text-sm text-stone-600 line-clamp-2 mb-2">{comm.message}</p>
                          <div className="flex items-center gap-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {JSON.parse(comm.recipients).length} Destinatari
                            </span>
                            {comm.attachmentPath && (
                              <a 
                                href={comm.attachmentPath} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-stone-900 hover:underline"
                              >
                                <Paperclip className="w-3 h-3" />
                                Allegato
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-8 text-stone-400 text-sm font-medium italic">Nessuna comunicazione inviata in precedenza.</p>
                  )}
                </div>
              </div>

              <div className="p-8 bg-stone-50 border-t border-stone-100 flex gap-4">
                <button
                  onClick={() => setSelectedContestForComm(null)}
                  className="flex-1 py-4 rounded-2xl font-bold text-stone-500 hover:bg-white transition-all border border-transparent hover:border-stone-200"
                >
                  Chiudi
                </button>
                <button
                  onClick={handleSendContestComm}
                  disabled={isSendingContestComm}
                  className="flex-1 py-4 bg-stone-900 text-white rounded-2xl font-bold hover:bg-stone-800 transition-all shadow-lg shadow-stone-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSendingContestComm ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Invio in corso...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Invia a tutti gli iscritti
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
    </>
  );
}
