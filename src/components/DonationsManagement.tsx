import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, Loader2, Mail, Calendar, User, Search, Download, Trash2, 
  CheckCircle2, Clock, XCircle, AlertCircle, Plus, Edit3, Send, 
  FileText, Euro, CreditCard, X, ChevronDown, RefreshCw, Check
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface Donation {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  amount: number;
  date: string;
  status: 'pending' | 'confirmed' | 'cancelled' | string;
  paymentMethod?: string;
  notes?: string;
}

export function DonationsManagement() {
  const [donations, setDonations] = React.useState<Donation[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [isDeleting, setIsDeleting] = React.useState<number | null>(null);

  // Email interaction modal
  const [emailModalDonation, setEmailModalDonation] = React.useState<Donation | null>(null);
  const [emailTemplate, setEmailTemplate] = React.useState<'reminder' | 'thankyou' | 'custom'>('thankyou');
  const [emailSubject, setEmailSubject] = React.useState('');
  const [emailMessage, setEmailMessage] = React.useState('');
  const [attachCertificate, setAttachCertificate] = React.useState(true);
  const [autoConfirmOnSend, setAutoConfirmOnSend] = React.useState(false);
  const [isSendingEmail, setIsSendingEmail] = React.useState(false);
  const [emailStatusAlert, setEmailStatusAlert] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Edit modal
  const [editModalDonation, setEditModalDonation] = React.useState<Donation | null>(null);
  const [isSavingEdit, setIsSavingEdit] = React.useState(false);

  // Create modal
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [isCreating, setIsCreating] = React.useState(false);
  const [newDonation, setNewDonation] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    amount: '20',
    status: 'confirmed',
    paymentMethod: 'contanti',
    notes: ''
  });

  const fetchDonations = async () => {
    try {
      const response = await fetch('/api/admin/donations');
      const data = await response.json();
      if (Array.isArray(data)) {
        setDonations(data);
      }
    } catch (error) {
      console.error('Error fetching donations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchDonations();
  }, []);

  // Set email templates
  const applyEmailTemplate = (template: 'reminder' | 'thankyou' | 'custom', donation: Donation) => {
    setEmailTemplate(template);
    if (template === 'thankyou') {
      setEmailSubject('Grazie di cuore per la tua donazione - Pro San Felice 2023');
      setEmailMessage(
        `Gentile ${donation.firstName} ${donation.lastName},\n\n` +
        `Ti ringraziamo calorosamente per la tua donazione${Number(donation.amount) > 0 ? ` di € ${Number(donation.amount).toFixed(2)}` : ''} a favore dell'Associazione Pro San Felice 2023.\n\n` +
        `Il tuo prezioso sostegno ci consente di continuare a custodire le nostre radici e a realizzare eventi per la nostra comunità.\n\n` +
        `In allegato trovi il tuo Attestato di Ringraziamento ufficiale.\n\n` +
        `Un cordiale saluto,\nIl Direttivo della Pro San Felice 2023`
      );
      setAttachCertificate(true);
      setAutoConfirmOnSend(donation.status !== 'confirmed');
    } else if (template === 'reminder') {
      setEmailSubject('Promemoria e istruzioni donazione - Pro San Felice 2023');
      setEmailMessage(
        `Gentile ${donation.firstName} ${donation.lastName},\n\n` +
        `Abbiamo ricevuto la tua richiesta di offerta a sostegno dell'Associazione Pro San Felice 2023.\n\n` +
        `Se non hai ancora completato il versamento, puoi farlo comodamente tramite:\n\n` +
        `• PayPal: https://www.paypal.com/ncp/payment/9UVU9QTPS3YQU\n` +
        `• Bonifico Bancario: IT00X0000000000000000000000 (Intestato a: Pro San Felice 2023 - Causale: Erogazione liberale)\n\n` +
        `Non appena ricevuta la donazione, provvederemo a rilasciarti l'Attestato ufficiale di ringraziamento.\n\n` +
        `Restiamo a tua disposizione per qualsiasi informazione.\n\n` +
        `Cordiali saluti,\nAssociazione Pro San Felice 2023`
      );
      setAttachCertificate(false);
      setAutoConfirmOnSend(false);
    } else {
      setEmailSubject(`Comunicazione per ${donation.firstName} ${donation.lastName} - Pro San Felice`);
      setEmailMessage(`Gentile ${donation.firstName},\n\n`);
      setAttachCertificate(false);
      setAutoConfirmOnSend(false);
    }
  };

  const openEmailModal = (donation: Donation) => {
    setEmailModalDonation(donation);
    setEmailStatusAlert(null);
    applyEmailTemplate(donation.status === 'pending' ? 'reminder' : 'thankyou', donation);
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailModalDonation) return;

    setIsSendingEmail(true);
    setEmailStatusAlert(null);

    try {
      const response = await fetch(`/api/admin/donations/${emailModalDonation.id}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: emailSubject,
          message: emailMessage,
          attachCertificate: attachCertificate,
          updateStatusToConfirmed: autoConfirmOnSend
        })
      });

      const result = await response.json();

      if (response.ok) {
        setEmailStatusAlert({
          type: 'success',
          text: `Email inviata con successo a ${emailModalDonation.email}!`
        });
        if (autoConfirmOnSend) {
          setDonations(prev => prev.map(d => d.id === emailModalDonation.id ? { ...d, status: 'confirmed' } : d));
        }
        setTimeout(() => {
          setEmailModalDonation(null);
        }, 1800);
      } else {
        setEmailStatusAlert({
          type: 'error',
          text: result.error || "Errore durante l'invio dell'email. Verifica le impostazioni SMTP."
        });
      }
    } catch (error: any) {
      setEmailStatusAlert({
        type: 'error',
        text: error.message || "Errore di connessione durante l'invio."
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleQuickStatusChange = async (id: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/donations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setDonations(prev => prev.map(d => d.id === id ? { ...d, status: newStatus } : d));
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalDonation) return;

    setIsSavingEdit(true);
    try {
      const response = await fetch(`/api/admin/donations/${editModalDonation.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editModalDonation)
      });

      if (response.ok) {
        setDonations(prev => prev.map(d => d.id === editModalDonation.id ? editModalDonation : d));
        setEditModalDonation(null);
      }
    } catch (error) {
      console.error('Error saving donation edit:', error);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleCreateDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const response = await fetch('/api/admin/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDonation)
      });

      if (response.ok) {
        setShowCreateModal(false);
        setNewDonation({
          firstName: '',
          lastName: '',
          email: '',
          amount: '20',
          status: 'confirmed',
          paymentMethod: 'contanti',
          notes: ''
        });
        fetchDonations();
      }
    } catch (error) {
      console.error('Error creating donation:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const deleteDonation = async (id: number) => {
    if (!window.confirm('Sei sicuro di voler eliminare questa registrazione di donazione?')) return;
    setIsDeleting(id);
    try {
      const response = await fetch(`/api/admin/donations/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setDonations(prev => prev.filter(d => d.id !== id));
      }
    } catch (error) {
      console.error('Error deleting donation:', error);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleExportExcel = () => {
    if (donations.length === 0) {
      alert('Nessuna donazione da esportare.');
      return;
    }

    const data = donations.map(d => ({
      ID: d.id,
      Nome: d.firstName,
      Cognome: d.lastName,
      Email: d.email,
      'Importo (€)': Number(d.amount) || 0,
      Stato: d.status === 'confirmed' ? 'Confermata' : d.status === 'pending' ? 'In attesa' : 'Annullata',
      'Metodo Pagamento': d.paymentMethod || 'Non specificato',
      Data: new Date(d.date).toLocaleString('it-IT'),
      Note: d.notes || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Donazioni');
    XLSX.writeFile(workbook, `Donazioni_ProSanFelice_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Calculations
  const totalAmountCollected = donations
    .filter(d => d.status === 'confirmed')
    .reduce((acc, d) => acc + (Number(d.amount) || 0), 0);

  const pendingAmount = donations
    .filter(d => d.status === 'pending')
    .reduce((acc, d) => acc + (Number(d.amount) || 0), 0);

  const pendingCount = donations.filter(d => d.status === 'pending').length;
  const confirmedCount = donations.filter(d => d.status === 'confirmed').length;

  const filteredDonations = donations.filter(d => {
    const matchesSearch = 
      `${d.firstName} ${d.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.notes && d.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && d.status === statusFilter;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-16">
        <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-serif text-stone-900">Gestione Donazioni</h2>
          <p className="text-stone-500 text-sm">Monitora le offerte, verifica gli importi e interagisci direttamente con i sostenitori.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-stone-900 text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-stone-800 transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Nuova Donazione
          </button>

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 bg-white border border-stone-200 text-stone-700 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-stone-50 transition-all shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            Esporta Excel
          </button>

          <button
            onClick={fetchDonations}
            className="p-2.5 bg-white border border-stone-200 text-stone-500 rounded-xl hover:text-stone-900 hover:bg-stone-50 transition-all"
            title="Aggiorna lista"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Totale Raccolto */}
        <div className="bg-white p-5 rounded-3xl border border-stone-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Totale Incassato</p>
            <p className="text-2xl font-serif font-bold text-emerald-700">
              € {totalAmountCollected.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-stone-400 font-medium">
              Da {confirmedCount} donazioni confermate
            </p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
            <Euro className="w-6 h-6" />
          </div>
        </div>

        {/* In Attesa */}
        <div className="bg-white p-5 rounded-3xl border border-stone-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">In Attesa (Pending)</p>
            <p className="text-2xl font-serif font-bold text-amber-600">
              {pendingCount} <span className="text-sm font-sans font-normal text-stone-400">(€ {pendingAmount.toFixed(2)})</span>
            </p>
            <p className="text-[11px] text-amber-700 font-medium">
              Da verificare o sollecitare
            </p>
          </div>
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Totale Donazioni */}
        <div className="bg-white p-5 rounded-3xl border border-stone-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Totale Registrazioni</p>
            <p className="text-2xl font-serif font-bold text-stone-900">{donations.length}</p>
            <p className="text-[11px] text-stone-400 font-medium">
              Offerte ricevute via web e sede
            </p>
          </div>
          <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500">
            <Heart className="w-6 h-6 fill-rose-500" />
          </div>
        </div>

        {/* Donatori Unici */}
        <div className="bg-white p-5 rounded-3xl border border-stone-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Donatori Unici</p>
            <p className="text-2xl font-serif font-bold text-stone-900">
              {new Set(donations.map(d => d.email.toLowerCase())).size}
            </p>
            <p className="text-[11px] text-stone-400 font-medium">Contatti distinti registrati</p>
          </div>
          <div className="w-12 h-12 bg-sky-50 rounded-2xl flex items-center justify-center text-sky-600">
            <User className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-white p-4 rounded-2xl border border-stone-200">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Cerca per nome, cognome, email o note..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-stone-900 outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mr-1 hidden md:inline">Stato:</span>
          {[
            { id: 'all', label: 'Tutte' },
            { id: 'pending', label: 'In Attesa' },
            { id: 'confirmed', label: 'Confermate' },
            { id: 'cancelled', label: 'Annullate' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-[2rem] border border-stone-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200">
                <th className="px-5 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Donatore</th>
                <th className="px-5 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Contatti</th>
                <th className="px-5 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Importo</th>
                <th className="px-5 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Data & Ora</th>
                <th className="px-5 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Stato</th>
                <th className="px-5 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest text-right">Interazione & Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredDonations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-stone-400 text-sm">
                    Nessuna donazione trovata per i criteri selezionati.
                  </td>
                </tr>
              ) : (
                filteredDonations.map((donation) => {
                  const isPending = donation.status === 'pending';
                  const isConfirmed = donation.status === 'confirmed';
                  const isCancelled = donation.status === 'cancelled';
                  const amount = Number(donation.amount) || 0;

                  return (
                    <tr key={donation.id} className="hover:bg-stone-50/80 transition-colors group">
                      {/* Donatore */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs uppercase shadow-sm ${
                            isConfirmed ? 'bg-emerald-100 text-emerald-800' :
                            isPending ? 'bg-amber-100 text-amber-800' :
                            'bg-stone-200 text-stone-700'
                          }`}>
                            {(donation.firstName?.[0] || 'D')}{(donation.lastName?.[0] || '')}
                          </div>
                          <div>
                            <div className="font-semibold text-stone-900 text-sm">
                              {donation.firstName} {donation.lastName}
                            </div>
                            {donation.paymentMethod && (
                              <div className="text-[10px] text-stone-400 uppercase font-medium flex items-center gap-1">
                                <CreditCard className="w-2.5 h-2.5" />
                                {donation.paymentMethod}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Contatti */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-stone-600 text-xs">
                          <Mail className="w-3.5 h-3.5 text-stone-400" />
                          <span className="font-mono">{donation.email}</span>
                        </div>
                      </td>

                      {/* Importo */}
                      <td className="px-5 py-4">
                        <div className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-stone-100/90 text-stone-900 border border-stone-200">
                          <span className="font-bold text-sm">
                            € {amount > 0 ? amount.toFixed(2) : '0.00'}
                          </span>
                        </div>
                      </td>

                      {/* Data & Ora */}
                      <td className="px-5 py-4 text-xs text-stone-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-stone-400" />
                          {new Date(donation.date).toLocaleDateString('it-IT', { 
                            day: '2-digit', 
                            month: '2-digit', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </td>

                      {/* Stato & Quick Selector */}
                      <td className="px-5 py-4">
                        <div className="relative inline-block">
                          <select
                            value={donation.status || 'pending'}
                            onChange={(e) => handleQuickStatusChange(donation.id, e.target.value)}
                            className={`text-[10px] font-bold uppercase tracking-wider py-1.5 pl-2.5 pr-6 rounded-full border cursor-pointer appearance-none transition-all outline-none ${
                              isConfirmed
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : isPending
                                ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 ring-2 ring-amber-400/20'
                                : 'bg-stone-100 text-stone-500 border-stone-200 hover:bg-stone-200'
                            }`}
                          >
                            <option value="pending">⏳ In Attesa (Pending)</option>
                            <option value="confirmed">✓ Confermata</option>
                            <option value="cancelled">✕ Annullata</option>
                          </select>
                          <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                        </div>
                      </td>

                      {/* Azioni & Interazione */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Interagisci / Invia Email */}
                          <button
                            onClick={() => openEmailModal(donation)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                              isPending
                                ? 'bg-amber-600 text-white hover:bg-amber-700 shadow-amber-600/20'
                                : 'bg-stone-900 text-white hover:bg-stone-800'
                            }`}
                            title="Invia email al donatore (ringraziamento / sollecito / info)"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>{isPending ? 'Sollecita / Contatta' : 'Invia Email'}</span>
                          </button>

                          {/* Scarica Attestato PDF */}
                          <a
                            href={`/api/admin/donations/${donation.id}/certificate`}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={`Attestato_Donazione_${donation.firstName}_${donation.lastName}.pdf`}
                            className="p-2 text-stone-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-stone-200"
                            title="Scarica Attestato di Ringraziamento (PDF)"
                          >
                            <FileText className="w-4 h-4" />
                          </a>

                          {/* Modifica */}
                          <button
                            onClick={() => setEditModalDonation({ ...donation })}
                            className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-all border border-stone-200"
                            title="Modifica importo o dati"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Elimina */}
                          <button
                            onClick={() => deleteDonation(donation.id)}
                            disabled={isDeleting === donation.id}
                            className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-stone-200 disabled:opacity-50"
                            title="Elimina donazione"
                          >
                            {isDeleting === donation.id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Interagisci con il Donatore / Invia Email */}
      <AnimatePresence>
        {emailModalDonation && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEmailModalDonation(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden border border-stone-100 max-h-[92vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-serif font-bold text-stone-900">
                      Interagisci con il Donatore
                    </h3>
                    <p className="text-xs text-stone-500">
                      Destinatario: <strong className="text-stone-800">{emailModalDonation.firstName} {emailModalDonation.lastName}</strong> ({emailModalDonation.email})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setEmailModalDonation(null)}
                  className="p-2 text-stone-400 hover:text-stone-900 rounded-full hover:bg-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSendEmail} className="p-6 space-y-4 overflow-y-auto flex-1">
                {/* Alert Notification if any */}
                {emailStatusAlert && (
                  <div className={`p-4 rounded-2xl flex items-center gap-3 text-sm ${
                    emailStatusAlert.type === 'success' 
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}>
                    {emailStatusAlert.type === 'success' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                    )}
                    <span>{emailStatusAlert.text}</span>
                  </div>
                )}

                {/* Templates Selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                    Seleziona Modello di Messaggio
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => applyEmailTemplate('thankyou', emailModalDonation)}
                      className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${
                        emailTemplate === 'thankyou'
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                          : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                      }`}
                    >
                      🎉 Ringraziamento Ufficiale
                    </button>

                    <button
                      type="button"
                      onClick={() => applyEmailTemplate('reminder', emailModalDonation)}
                      className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${
                        emailTemplate === 'reminder'
                          ? 'border-amber-600 bg-amber-50 text-amber-900'
                          : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                      }`}
                    >
                      ⏳ Sollecito / Coordinate
                    </button>

                    <button
                      type="button"
                      onClick={() => applyEmailTemplate('custom', emailModalDonation)}
                      className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${
                        emailTemplate === 'custom'
                          ? 'border-stone-900 bg-stone-100 text-stone-900'
                          : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                      }`}
                    >
                      ✍️ Personalizzato
                    </button>
                  </div>
                </div>

                {/* Subject */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                    Oggetto Email
                  </label>
                  <input
                    type="text"
                    required
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-stone-900 outline-none"
                    placeholder="Oggetto dell'email..."
                  />
                </div>

                {/* Message Body */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                    Testo del Messaggio
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-stone-900 outline-none resize-none font-sans"
                    placeholder="Scrivi qui il messaggio per il donatore..."
                  />
                </div>

                {/* Options / Checkboxes */}
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={attachCertificate}
                      onChange={(e) => setAttachCertificate(e.target.checked)}
                      className="w-4 h-4 rounded text-stone-900 focus:ring-stone-900"
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-stone-900">Allega Attestato di Ringraziamento (PDF)</span>
                      <p className="text-stone-500 text-[11px]">Genera il certificato nominale con importo e firma della Pro San Felice</p>
                    </div>
                  </label>

                  {emailModalDonation.status !== 'confirmed' && (
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoConfirmOnSend}
                        onChange={(e) => setAutoConfirmOnSend(e.target.checked)}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-600"
                      />
                      <div className="text-xs">
                        <span className="font-semibold text-stone-900">Aggiorna stato in "Confermata"</span>
                        <p className="text-stone-500 text-[11px]">Imposta automaticamente lo stato da pending a confermata</p>
                      </div>
                    </label>
                  )}
                </div>

                {/* Submit Buttons */}
                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEmailModalDonation(null)}
                    className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-bold text-xs uppercase tracking-wider hover:bg-stone-50"
                  >
                    Annulla
                  </button>

                  <button
                    type="submit"
                    disabled={isSendingEmail}
                    className="flex items-center gap-2 bg-stone-900 text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-stone-800 transition-all shadow-md shadow-stone-900/20 disabled:opacity-50 cursor-pointer"
                  >
                    {isSendingEmail ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Invio in corso...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Invia Email
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Modifica Dati / Importo Donazione */}
      <AnimatePresence>
        {editModalDonation && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditModalDonation(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-stone-100"
            >
              <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-stone-200 text-stone-700 rounded-xl flex items-center justify-center">
                    <Edit3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-serif font-bold text-stone-900">Modifica Donazione #{editModalDonation.id}</h3>
                    <p className="text-xs text-stone-500">Aggiorna importo, stato o informazioni del donatore</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditModalDonation(null)}
                  className="p-2 text-stone-400 hover:text-stone-900 rounded-full hover:bg-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Nome</label>
                    <input
                      type="text"
                      required
                      value={editModalDonation.firstName}
                      onChange={(e) => setEditModalDonation({ ...editModalDonation, firstName: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-stone-900 outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Cognome</label>
                    <input
                      type="text"
                      required
                      value={editModalDonation.lastName}
                      onChange={(e) => setEditModalDonation({ ...editModalDonation, lastName: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-stone-900 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Email</label>
                  <input
                    type="email"
                    required
                    value={editModalDonation.email}
                    onChange={(e) => setEditModalDonation({ ...editModalDonation, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-stone-900 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Importo (€)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 font-bold text-sm">€</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={editModalDonation.amount}
                        onChange={(e) => setEditModalDonation({ ...editModalDonation, amount: Number(e.target.value) })}
                        className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm font-bold text-stone-900 focus:ring-2 focus:ring-stone-900 outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Stato Donazione</label>
                    <select
                      value={editModalDonation.status}
                      onChange={(e) => setEditModalDonation({ ...editModalDonation, status: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm font-semibold bg-white focus:ring-2 focus:ring-stone-900 outline-none"
                    >
                      <option value="pending">⏳ In Attesa (Pending)</option>
                      <option value="confirmed">✓ Confermata</option>
                      <option value="cancelled">✕ Annullata</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Metodo di Pagamento</label>
                    <select
                      value={editModalDonation.paymentMethod || 'paypal'}
                      onChange={(e) => setEditModalDonation({ ...editModalDonation, paymentMethod: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm bg-white focus:ring-2 focus:ring-stone-900 outline-none"
                    >
                      <option value="paypal">PayPal</option>
                      <option value="bonifico">Bonifico Bancario</option>
                      <option value="contanti">Contanti / Sede</option>
                      <option value="altro">Altro</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Note Interne</label>
                    <input
                      type="text"
                      placeholder="Note opzionali..."
                      value={editModalDonation.notes || ''}
                      onChange={(e) => setEditModalDonation({ ...editModalDonation, notes: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-stone-900 outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditModalDonation(null)}
                    className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-bold text-xs uppercase tracking-wider hover:bg-stone-50"
                  >
                    Annulla
                  </button>

                  <button
                    type="submit"
                    disabled={isSavingEdit}
                    className="flex items-center gap-2 bg-stone-900 text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-stone-800 transition-all shadow-md disabled:opacity-50 cursor-pointer"
                  >
                    {isSavingEdit ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Salvataggio...
                      </>
                    ) : (
                      'Salva Modifiche'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Nuova Donazione Manuale */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-stone-100"
            >
              <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-serif font-bold text-stone-900">Registra Donazione Manuale</h3>
                    <p className="text-xs text-stone-500">Inserisci una donazione ricevuta in contanti, bonifico o evento</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 text-stone-400 hover:text-stone-900 rounded-full hover:bg-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateDonation} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Nome</label>
                    <input
                      type="text"
                      required
                      placeholder="Mario"
                      value={newDonation.firstName}
                      onChange={(e) => setNewDonation({ ...newDonation, firstName: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-stone-900 outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Cognome</label>
                    <input
                      type="text"
                      required
                      placeholder="Rossi"
                      value={newDonation.lastName}
                      onChange={(e) => setNewDonation({ ...newDonation, lastName: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-stone-900 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Email Sostenitore</label>
                  <input
                    type="email"
                    required
                    placeholder="mario.rossi@email.it"
                    value={newDonation.email}
                    onChange={(e) => setNewDonation({ ...newDonation, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-stone-900 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Importo (€)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 font-bold text-sm">€</span>
                      <input
                        type="number"
                        min="1"
                        step="0.01"
                        required
                        placeholder="20.00"
                        value={newDonation.amount}
                        onChange={(e) => setNewDonation({ ...newDonation, amount: e.target.value })}
                        className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm font-bold text-stone-900 focus:ring-2 focus:ring-stone-900 outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Stato</label>
                    <select
                      value={newDonation.status}
                      onChange={(e) => setNewDonation({ ...newDonation, status: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm font-semibold bg-white focus:ring-2 focus:ring-stone-900 outline-none"
                    >
                      <option value="confirmed">✓ Confermata</option>
                      <option value="pending">⏳ In Attesa (Pending)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Metodo Pagamento</label>
                    <select
                      value={newDonation.paymentMethod}
                      onChange={(e) => setNewDonation({ ...newDonation, paymentMethod: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm bg-white focus:ring-2 focus:ring-stone-900 outline-none"
                    >
                      <option value="contanti">Contanti / Sede</option>
                      <option value="bonifico">Bonifico Bancario</option>
                      <option value="paypal">PayPal</option>
                      <option value="altro">Altro</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Note Interne</label>
                    <input
                      type="text"
                      placeholder="Es. Ricevuto alla festa d'estate"
                      value={newDonation.notes}
                      onChange={(e) => setNewDonation({ ...newDonation, notes: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-stone-900 outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-bold text-xs uppercase tracking-wider hover:bg-stone-50"
                  >
                    Annulla
                  </button>

                  <button
                    type="submit"
                    disabled={isCreating}
                    className="flex items-center gap-2 bg-stone-900 text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-stone-800 transition-all shadow-md disabled:opacity-50 cursor-pointer"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Registrazione...
                      </>
                    ) : (
                      'Registra Donazione'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
