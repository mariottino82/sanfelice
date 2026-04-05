import React from 'react';
import { motion } from 'motion/react';
import { Plus, Trash2, Edit2, CheckCircle2, XCircle, BarChart3, Share2, Copy, ExternalLink, Save, X, Loader2, MessageCircle, User, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface PollOption {
  id: number;
  text: string;
  votes: number;
}

interface Poll {
  id: number;
  question: string;
  options: PollOption[];
  votes: string[]; // Array of emails
  totalVotes: number;
  active: boolean;
  showOnHomepage: boolean;
  endDate?: string;
  type: 'poll' | 'election';
}

export function PollsManagement() {
  const [polls, setPolls] = React.useState<Poll[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [editingPoll, setEditingPoll] = React.useState<Partial<Poll> | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [pollToDelete, setPollToDelete] = React.useState<number | null>(null);
  const [showTokenModal, setShowTokenModal] = React.useState<number | null>(null);
  const [memberTokens, setMemberTokens] = React.useState<any[]>([]);
  const [isGeneratingTokens, setIsGeneratingTokens] = React.useState(false);
  const [isLoadingTokens, setIsLoadingTokens] = React.useState(false);

  const fetchPolls = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/polls');
      if (response.ok) {
        const data = await response.json();
        setPolls(data);
      }
    } catch (error) {
      console.error('Error fetching polls:', error);
      toast.error('Errore nel caricamento dei sondaggi');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchPolls();
  }, []);

  const fetchMemberTokens = async (pollId: number) => {
    setIsLoadingTokens(true);
    try {
      const response = await fetch(`/api/polls/${pollId}/tokens`);
      if (response.ok) {
        const data = await response.json();
        setMemberTokens(data);
      }
    } catch (error) {
      console.error('Error fetching tokens:', error);
      toast.error('Errore nel caricamento dei token');
    } finally {
      setIsLoadingTokens(false);
    }
  };

  const generateTokens = async (pollId: number) => {
    setIsGeneratingTokens(true);
    try {
      const response = await fetch(`/api/polls/${pollId}/generate-tokens`, { method: 'POST' });
      if (response.ok) {
        toast.success('Token generati per tutti i soci attivi');
        fetchMemberTokens(pollId);
      }
    } catch (error) {
      console.error('Error generating tokens:', error);
      toast.error('Errore nella generazione dei token');
    } finally {
      setIsGeneratingTokens(false);
    }
  };

  const copyWhatsAppLink = (pollId: number, token: string, memberName: string) => {
    const link = `${window.location.origin}/vota/${pollId}?token=${token}`;
    const text = `Ciao ${memberName}, ecco il tuo link unico e sicuro per votare nel sondaggio dell'Associazione Pro San Felice: ${link}. Il voto è anonimo e il link può essere usato una sola volta. Grazie!`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(link);
    
    // Open WhatsApp
    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encodedText}`, '_blank');
    
    toast.success('Link copiato e WhatsApp aperto');
  };

  const handleSavePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPoll?.question || !editingPoll?.options?.length) {
      toast.error('Compila tutti i campi obbligatori');
      return;
    }

    setIsSaving(true);
    try {
      const method = editingPoll.id ? 'PUT' : 'POST';
      const url = editingPoll.id ? `/api/polls/${editingPoll.id}` : '/api/polls';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingPoll)
      });

      if (response.ok) {
        toast.success(editingPoll.id ? 'Sondaggio aggiornato' : 'Sondaggio creato');
        setEditingPoll(null);
        fetchPolls();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Errore durante il salvataggio');
      }
    } catch (error) {
      console.error('Error saving poll:', error);
      toast.error('Errore di connessione');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePoll = async (id: number) => {
    try {
      const response = await fetch(`/api/polls/${id}`, { method: 'DELETE' });
      if (response.ok) {
        toast.success('Sondaggio eliminato');
        setPollToDelete(null);
        fetchPolls();
      }
    } catch (error) {
      console.error('Error deleting poll:', error);
      toast.error('Errore durante l\'eliminazione');
    }
  };

  const addOption = () => {
    const options = [...(editingPoll?.options || [])];
    const nextId = options.length > 0 ? Math.max(...options.map(o => o.id)) + 1 : 1;
    options.push({ id: nextId, text: '', votes: 0 });
    setEditingPoll({ ...editingPoll, options });
  };

  const removeOption = (id: number) => {
    const options = editingPoll?.options?.filter(o => o.id !== id) || [];
    setEditingPoll({ ...editingPoll, options });
  };

  const updateOption = (id: number, text: string) => {
    const options = editingPoll?.options?.map(o => o.id === id ? { ...o, text } : o) || [];
    setEditingPoll({ ...editingPoll, options });
  };

  const copyPollLink = (id: number) => {
    const link = `${window.location.origin}/vota/${id}`;
    navigator.clipboard.writeText(link);
    toast.success('Link copiato negli appunti');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-serif text-stone-900">Gestione Sondaggi</h2>
          <p className="text-stone-500 text-sm">Crea e gestisci le votazioni per i soci</p>
        </div>
        <button
          onClick={() => setEditingPoll({ 
            question: '', 
            options: [{ id: 1, text: '', votes: 0 }, { id: 2, text: '', votes: 0 }], 
            active: true,
            showOnHomepage: false,
            type: 'poll'
          })}
          className="bg-stone-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-stone-800 transition-all shadow-lg shadow-stone-900/20"
        >
          <Plus className="w-5 h-5" />
          Nuovo Sondaggio
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {polls.map((poll) => (
          <motion.div
            key={poll.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                {poll.active ? (
                  <span className="flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    <CheckCircle2 className="w-3 h-3" /> Attivo
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-2 py-1 bg-stone-100 text-stone-500 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    <XCircle className="w-3 h-3" /> Chiuso
                  </span>
                )}
                {poll.showOnHomepage && (
                  <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    Homepage
                  </span>
                )}
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  poll.type === 'election' ? 'bg-purple-50 text-purple-600' : 'bg-stone-100 text-stone-600'
                }`}>
                  {poll.type === 'election' ? 'Votazione Interna' : 'Sondaggio Pubblico'}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowTokenModal(poll.id);
                    fetchMemberTokens(poll.id);
                  }}
                  className="p-2 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                  title="Gestisci Link WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setEditingPoll(poll)}
                  className="p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-50 rounded-lg transition-all"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPollToDelete(poll.id)}
                  className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <h3 className="text-lg font-serif text-stone-900 mb-4">{poll.question}</h3>

            <div className="space-y-3 mb-6">
              {poll.options.map((option) => {
                const percentage = poll.totalVotes > 0 ? Math.round((option.votes / poll.totalVotes) * 100) : 0;
                return (
                  <div key={option.id} className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                      <span className="text-stone-600">{option.text}</span>
                      <span className="text-stone-900">{option.votes} voti ({percentage}%)</span>
                    </div>
                    <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-stone-900 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-stone-50">
              <div className="flex items-center gap-2 text-stone-400">
                <BarChart3 className="w-4 h-4" />
                <span className="text-xs font-medium">Totale: {poll.totalVotes} voti</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => copyPollLink(poll.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-50 text-stone-600 rounded-lg text-xs font-bold hover:bg-stone-100 transition-all"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copia Link
                </button>
                <a
                  href={`/vota/${poll.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 text-white rounded-lg text-xs font-bold hover:bg-stone-800 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Vedi
                </a>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Edit/Create Modal */}
      {editingPoll && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            onClick={() => !isSaving && setEditingPoll(null)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden"
          >
            <div className="p-8 border-b border-stone-100 flex justify-between items-center">
              <h3 className="text-2xl font-serif text-stone-900">
                {editingPoll.id ? 'Modifica Sondaggio' : 'Nuovo Sondaggio'}
              </h3>
              <button
                onClick={() => setEditingPoll(null)}
                className="text-stone-400 hover:text-stone-900 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSavePoll} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">Domanda</label>
                <textarea
                  required
                  value={editingPoll.question}
                  onChange={(e) => setEditingPoll({ ...editingPoll, question: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-900 outline-none transition-all text-sm"
                  rows={3}
                  placeholder="Inserisci la domanda del sondaggio..."
                />
              </div>

              <div className="space-y-4">
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">Opzioni di Risposta</label>
                {editingPoll.options?.map((option, index) => (
                  <div key={option.id} className="flex gap-3 items-center">
                    <div className="flex-1 relative">
                      <input
                        required
                        value={option.text}
                        onChange={(e) => updateOption(option.id, e.target.value)}
                        className="w-full pl-4 pr-10 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-900 outline-none transition-all text-sm"
                        placeholder={`Opzione ${index + 1}`}
                      />
                    </div>
                    {editingPoll.options!.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(option.id)}
                        className="p-3 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addOption}
                  className="w-full py-3 border-2 border-dashed border-stone-200 rounded-xl text-stone-400 hover:border-stone-900 hover:text-stone-900 transition-all text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Aggiungi Opzione
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">Tipo di Consultazione</label>
                  <select
                    value={editingPoll.type || 'poll'}
                    onChange={(e) => setEditingPoll({ ...editingPoll, type: e.target.value as 'poll' | 'election' })}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-900 outline-none transition-all text-sm"
                  >
                    <option value="poll">Sondaggio Pubblico</option>
                    <option value="election">Votazione Interna (Soci)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">Data Scadenza (Opzionale)</label>
                  <input
                    type="date"
                    value={editingPoll.endDate ? editingPoll.endDate.split('T')[0] : ''}
                    onChange={(e) => setEditingPoll({ ...editingPoll, endDate: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-900 outline-none transition-all text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className="relative inline-flex items-center">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={editingPoll.active}
                        onChange={(e) => setEditingPoll({ ...editingPoll, active: e.target.checked })}
                      />
                      <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-stone-900"></div>
                    </div>
                    <span className="text-xs font-bold text-stone-600 uppercase tracking-wider group-hover:text-stone-900 transition-colors">Attivo</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className="relative inline-flex items-center">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={editingPoll.showOnHomepage}
                        onChange={(e) => setEditingPoll({ ...editingPoll, showOnHomepage: e.target.checked })}
                      />
                      <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-stone-900"></div>
                    </div>
                    <span className="text-xs font-bold text-stone-600 uppercase tracking-wider group-hover:text-stone-900 transition-colors">Homepage</span>
                  </label>
                </div>

              <div className="pt-6 border-t border-stone-100 flex gap-4">
                <button
                  type="button"
                  onClick={() => setEditingPoll(null)}
                  className="flex-1 py-4 rounded-xl font-bold text-stone-500 hover:bg-stone-50 transition-all"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-4 bg-stone-900 text-white rounded-xl font-bold hover:bg-stone-800 transition-all shadow-lg shadow-stone-900/20 flex items-center justify-center gap-2"
                >
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Salva Sondaggio
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {pollToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl"
          >
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-serif text-stone-900 text-center mb-2">Elimina Sondaggio</h3>
            <p className="text-stone-500 text-center mb-8">
              Sei sicuro di voler eliminare questo sondaggio? Questa azione non può essere annullata.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setPollToDelete(null)}
                className="flex-1 py-3 rounded-xl font-bold text-stone-500 hover:bg-stone-50 transition-all"
              >
                Annulla
              </button>
              <button
                onClick={() => handleDeletePoll(pollToDelete)}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
              >
                Elimina
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* WhatsApp Tokens Modal */}
      {showTokenModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            onClick={() => setShowTokenModal(null)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-8 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
              <div>
                <h3 className="text-2xl font-serif text-stone-900">Link di Voto WhatsApp</h3>
                <p className="text-stone-500 text-sm">Invia link unici ai soci per votare senza password</p>
              </div>
              <button
                onClick={() => setShowTokenModal(null)}
                className="text-stone-400 hover:text-stone-900 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 overflow-y-auto flex-1">
              <div className="flex justify-between items-center mb-6">
                <div className="text-xs font-bold text-stone-400 uppercase tracking-widest">
                  Lista Soci ({memberTokens.length})
                </div>
                <button
                  onClick={() => generateTokens(showTokenModal)}
                  disabled={isGeneratingTokens}
                  className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-bold hover:bg-stone-800 transition-all disabled:opacity-50"
                >
                  {isGeneratingTokens ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                  Genera/Aggiorna Tutti i Link
                </button>
              </div>

              {isLoadingTokens ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-stone-300" />
                </div>
              ) : memberTokens.length === 0 ? (
                <div className="text-center py-20 bg-stone-50 rounded-3xl border border-stone-100">
                  <User className="w-12 h-12 text-stone-200 mx-auto mb-4" />
                  <p className="text-stone-400 font-medium">Nessun socio attivo trovato.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {memberTokens.map((m) => (
                    <div key={m.id} className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-100 group hover:bg-white hover:shadow-sm transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-stone-100 text-stone-400 group-hover:text-stone-900 transition-colors">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-stone-900 text-sm">{m.name}</p>
                          <p className="text-[10px] text-stone-500 uppercase tracking-wider">{m.phone || m.email || 'Nessun contatto'}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {m.used ? (
                          <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Votato
                          </span>
                        ) : m.token ? (
                          <button
                            onClick={() => copyWhatsAppLink(showTokenModal, m.token, m.name)}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/10"
                          >
                            <MessageCircle className="w-4 h-4" />
                            Invia Link
                          </button>
                        ) : (
                          <span className="text-[10px] text-stone-400 italic">Link non generato</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-6 bg-stone-50 border-t border-stone-100 text-center">
              <p className="text-[10px] text-stone-400 italic">
                I link sono unici per ogni socio e scadono dopo il primo utilizzo.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
