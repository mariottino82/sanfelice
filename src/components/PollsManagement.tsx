import React from 'react';
import { motion } from 'motion/react';
import { Plus, Trash2, Edit2, CheckCircle2, XCircle, BarChart3, Share2, Copy, ExternalLink, Save, X, Loader2 } from 'lucide-react';
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
}

export function PollsManagement() {
  const [polls, setPolls] = React.useState<Poll[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [editingPoll, setEditingPoll] = React.useState<Partial<Poll> | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [pollToDelete, setPollToDelete] = React.useState<number | null>(null);

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
            showOnHomepage: false
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
              </div>
              <div className="flex gap-2">
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
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">Data Scadenza (Opzionale)</label>
                  <input
                    type="date"
                    value={editingPoll.endDate ? editingPoll.endDate.split('T')[0] : ''}
                    onChange={(e) => setEditingPoll({ ...editingPoll, endDate: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-900 outline-none transition-all text-sm"
                  />
                </div>
                <div className="flex items-center gap-6 pt-6">
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
    </div>
  );
}
