import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, UserPlus, CheckCircle2 } from 'lucide-react';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RegistrationModal({ isOpen, onClose }: RegistrationModalProps) {
  const [step, setStep] = React.useState<'form' | 'success'>('form');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

    try {
      const response = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          date: new Date().toISOString()
        })
      });

      if (response.ok) {
        setStep('success');
      } else {
        setError('Errore durante l\'invio della richiesta. Riprova più tardi.');
      }
    } catch (err) {
      console.error(err);
      setError('Errore di rete. Verifica la tua connessione.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] overflow-y-auto p-3 md:p-8">
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
              className="relative bg-white p-4 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl max-w-lg w-full overflow-hidden"
            >
              <button 
                onClick={onClose}
                className="absolute top-3 right-3 md:top-6 md:right-6 text-stone-400 hover:text-stone-900 transition-colors z-50 p-1.5 md:p-2 bg-white/80 backdrop-blur-sm hover:bg-white rounded-full shadow-sm border border-stone-100"
              >
                <X className="w-4 h-4 md:w-6 md:h-6" />
              </button>

            {step === 'form' ? (
              <>
                <div className="text-center mb-5 md:mb-8">
                  <div className="inline-flex items-center justify-center w-10 h-10 md:w-16 md:h-16 bg-stone-100 rounded-lg md:rounded-2xl mb-3 md:mb-4">
                    <UserPlus className="w-5 h-5 md:w-8 md:h-8 text-stone-900" />
                  </div>
                  <h3 className="text-lg md:text-2xl font-serif text-stone-900">Diventa Socio</h3>
                  <p className="text-stone-500 text-[10px] md:text-sm mt-1 md:mt-2">Compila il modulo per richiedere l'iscrizione</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <div className="space-y-1">
                      <label className="block text-[9px] md:text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1">Nome Completo</label>
                      <input 
                        name="name" 
                        required 
                        className="w-full px-3 py-2 md:px-4 md:py-3 rounded-lg md:rounded-xl border border-stone-200 text-xs md:text-sm focus:ring-2 focus:ring-stone-900 outline-none transition-all" 
                        placeholder="Mario Rossi"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[9px] md:text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1">Email</label>
                      <input 
                        name="email" 
                        type="email" 
                        required 
                        className="w-full px-3 py-2 md:px-4 md:py-3 rounded-lg md:rounded-xl border border-stone-200 text-xs md:text-sm focus:ring-2 focus:ring-stone-900 outline-none transition-all" 
                        placeholder="mario@esempio.it"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] md:text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1">Password Account</label>
                    <input 
                      name="password" 
                      type="password" 
                      required 
                      className="w-full px-3 py-2 md:px-4 md:py-3 rounded-lg md:rounded-xl border border-stone-200 text-xs md:text-sm focus:ring-2 focus:ring-stone-900 outline-none transition-all" 
                      placeholder="Scegli una password sicura"
                    />
                    <p className="text-[8px] md:text-[10px] text-stone-400 mt-1 italic">Questa password verrà usata per accedere alla tua area riservata una volta approvato.</p>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] md:text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1">Telefono (Opzionale)</label>
                    <input 
                      name="phone" 
                      className="w-full px-3 py-2 md:px-4 md:py-3 rounded-lg md:rounded-xl border border-stone-200 text-xs md:text-sm focus:ring-2 focus:ring-stone-900 outline-none transition-all" 
                      placeholder="+39 333 1234567"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] md:text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1">Messaggio / Note</label>
                    <textarea 
                      name="message" 
                      rows={2}
                      className="w-full px-3 py-2 md:px-4 md:py-3 rounded-lg md:rounded-xl border border-stone-200 text-xs md:text-sm focus:ring-2 focus:ring-stone-900 outline-none transition-all resize-none" 
                      placeholder="Perché vuoi unirti a noi?"
                    />
                  </div>

                  {error && (
                    <div className="p-2.5 md:p-3 bg-red-50 border border-red-100 rounded-lg md:rounded-xl text-red-600 text-[9px] md:text-[10px] font-medium">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-stone-900 text-white py-2.5 md:py-4 rounded-lg md:rounded-xl font-bold text-xs md:text-base hover:bg-stone-800 transition-all transform active:scale-95 shadow-lg shadow-stone-900/20 disabled:opacity-50"
                  >
                    {loading ? 'Invio in corso...' : 'Invia Richiesta'}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-5 md:py-8">
                <div className="inline-flex items-center justify-center w-14 h-14 md:w-20 md:h-20 bg-emerald-100 rounded-full mb-3 md:mb-6">
                  <CheckCircle2 className="w-7 h-7 md:w-10 md:h-10 text-emerald-600" />
                </div>
                <h3 className="text-xl md:text-3xl font-serif text-stone-900 mb-2 md:mb-4">Richiesta Inviata!</h3>
                <p className="text-stone-600 text-xs md:text-base mb-5 md:mb-8 leading-relaxed">
                  Grazie per aver richiesto di diventare socio. La tua richiesta è stata presa in carico e verrà valutata dal consiglio direttivo. Riceverai una conferma via email.
                </p>
                <button
                  onClick={onClose}
                  className="bg-stone-900 text-white px-6 md:px-10 py-2.5 md:py-4 rounded-lg md:rounded-xl font-bold text-xs md:text-base hover:bg-stone-800 transition-all"
                >
                  Chiudi
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    )}
    </AnimatePresence>
  );
}
