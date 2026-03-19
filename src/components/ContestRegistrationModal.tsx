import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trophy, Calendar, Euro, CheckCircle2, ShieldCheck } from 'lucide-react';

interface ContestRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  contest: any;
}

export const ContestRegistrationModal: React.FC<ContestRegistrationModalProps> = ({ isOpen, onClose, contest }) => {
  const [isMinor, setIsMinor] = React.useState(false);
  const [privacyAccepted, setPrivacyAccepted] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  if (!contest) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!privacyAccepted) {
      alert('Devi accettare l\'informativa sulla privacy per procedere.');
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

    try {
      const response = await fetch('/api/contest-registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          contestId: contest.id,
          isMinor: isMinor ? 1 : 0,
          date: new Date().toISOString(),
          status: 'pending'
        })
      });

      if (response.ok) {
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          onClose();
        }, 3000);
      } else {
        alert('Errore durante l\'invio dell\'iscrizione. Riprova più tardi.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Errore di connessione. Riprova più tardi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] overflow-y-auto p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />
          <div className="flex min-h-full items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl max-w-2xl w-full overflow-hidden"
            >
              {isSuccess ? (
                <div className="text-center py-12 space-y-6">
                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-serif text-stone-900">Iscrizione Inviata!</h3>
                  <p className="text-stone-500 max-w-xs mx-auto">
                    La tua richiesta è stata presa in carico. Riceverai una conferma via email non appena verrà approvata.
                  </p>
                </div>
              ) : (
                <>
                  <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 md:top-6 md:right-6 text-stone-400 hover:text-stone-900 transition-colors z-50 p-2 bg-white/80 backdrop-blur-sm hover:bg-white rounded-full shadow-sm border border-stone-100"
                  >
                    <X className="w-6 h-6" />
                  </button>

                  <div className="space-y-6 mb-8">
                    {contest.image && (
                      <div className="w-full h-48 rounded-3xl overflow-hidden shadow-lg border border-stone-100">
                        <img 
                          src={contest.image} 
                          alt={contest.title} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <Trophy className="w-8 h-8 text-stone-900" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-serif text-stone-900">{contest.title}</h3>
                        <p className="text-stone-500 text-sm">Compila il modulo per partecipare</p>
                      </div>
                    </div>

                    {contest.description && (
                      <div className="p-6 bg-stone-50 rounded-3xl border border-stone-100">
                        <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-wrap">
                          {contest.description}
                        </p>
                      </div>
                    )}

                    {contest.prizes && (
                      <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
                        <div className="flex items-center gap-2 text-emerald-700 text-[10px] font-bold uppercase tracking-widest mb-3">
                          <Trophy className="w-3 h-3" />
                          Premi & Riconoscimenti
                        </div>
                        <p className="text-sm text-emerald-800 leading-relaxed whitespace-pre-wrap">
                          {contest.prizes}
                        </p>
                      </div>
                    )}

                    {contest.winners && JSON.parse(contest.winners).length > 0 && (
                      <div className="p-6 bg-stone-900 rounded-3xl text-white">
                        <div className="flex items-center gap-2 text-stone-400 text-[10px] font-bold uppercase tracking-widest mb-4">
                          <ShieldCheck className="w-3 h-3" />
                          Albo d'Oro / Vincitori Passati
                        </div>
                        <div className="space-y-3">
                          {JSON.parse(contest.winners).map((w: any, idx: number) => (
                            <div key={`${w.winnerName}-${w.year}-${idx}`} className="flex justify-between items-center py-2 border-b border-white/10 last:border-0">
                              <div>
                                <p className="text-xs font-bold">{w.winnerName}</p>
                                <p className="text-[10px] text-stone-400">{w.prize}</p>
                              </div>
                              <span className="text-[10px] font-bold text-stone-500">{w.year}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1 ml-1">Nome e Cognome Partecipante</label>
                          <input name="name" required className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-stone-900 outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1 ml-1">Email di Contatto</label>
                          <input name="email" type="email" required className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-stone-900 outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1 ml-1">Cellulare</label>
                          <input name="phone" type="tel" required className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-stone-900 outline-none" />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100 space-y-3">
                          <div className="flex items-center gap-3">
                            <input 
                              type="checkbox" 
                              id="isMinor" 
                              checked={isMinor} 
                              onChange={(e) => setIsMinor(e.target.checked)}
                              className="w-4 h-4 rounded border-stone-300 text-stone-900 focus:ring-stone-900"
                            />
                            <label htmlFor="isMinor" className="text-sm text-stone-700 font-medium">Il partecipante è minorenne</label>
                          </div>
                          
                          {isMinor && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="space-y-3 pt-2 border-t border-stone-200"
                            >
                              <div>
                                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Nome Genitore / Tutore</label>
                                <input name="parentName" required={isMinor} className="w-full px-3 py-2 rounded-lg border border-stone-200 text-xs focus:ring-2 focus:ring-stone-900 outline-none" />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Contatto Genitore (Email/Tel)</label>
                                <input name="parentContact" required={isMinor} className="w-full px-3 py-2 rounded-lg border border-stone-200 text-xs focus:ring-2 focus:ring-stone-900 outline-none" />
                              </div>
                            </motion.div>
                          )}
                        </div>

                        <div className="p-4 bg-stone-900 rounded-2xl text-white space-y-3">
                          <div className="flex items-center gap-2 text-stone-400 text-[10px] font-bold uppercase tracking-widest">
                            <Euro className="w-3 h-3" />
                            Quota di Partecipazione
                          </div>
                          <p className="text-2xl font-serif">
                            {contest.cost > 0 ? `€ ${contest.cost}` : 'Gratuito'}
                          </p>
                          <p className="text-[10px] text-stone-400 leading-relaxed">
                            {contest.cost > 0 ? 'Il pagamento verrà richiesto dopo l\'approvazione dell\'iscrizione.' : 'Partecipazione gratuita aperta a tutti i soci.'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100 space-y-4">
                      <div className="flex items-start gap-3">
                        <input 
                          type="checkbox" 
                          id="privacy" 
                          required 
                          checked={privacyAccepted}
                          onChange={(e) => setPrivacyAccepted(e.target.checked)}
                          className="mt-1 w-4 h-4 rounded border-stone-300 text-stone-900 focus:ring-stone-900"
                        />
                        <label htmlFor="privacy" className="text-xs text-stone-600 leading-relaxed">
                          Dichiaro di aver letto e accettato l'informativa sulla privacy. Acconsento al trattamento dei dati personali per le finalità legate allo svolgimento del concorso. {isMinor && 'In qualità di genitore/tutore, autorizzo la partecipazione del minore.'}
                        </label>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-stone-900 text-white py-4 rounded-xl font-bold hover:bg-stone-800 transition-all transform active:scale-95 shadow-lg shadow-stone-900/20 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? 'Invio in corso...' : 'Invia Iscrizione'}
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
