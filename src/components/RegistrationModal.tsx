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
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white p-6 md:p-10 rounded-[2.5rem] shadow-2xl max-w-lg w-full overflow-hidden"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 text-stone-400 hover:text-stone-900 transition-colors z-10 p-2 hover:bg-stone-100 rounded-full"
            >
              <X className="w-6 h-6" />
            </button>

            {step === 'form' ? (
              <>
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-stone-100 rounded-2xl mb-4">
                    <UserPlus className="w-8 h-8 text-stone-900" />
                  </div>
                  <h3 className="text-2xl font-serif text-stone-900">Diventa Socio</h3>
                  <p className="text-stone-500 text-sm mt-2">Compila il modulo per richiedere l'iscrizione</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">Nome Completo</label>
                      <input 
                        name="name" 
                        required 
                        className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-900 outline-none transition-all" 
                        placeholder="Mario Rossi"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">Email</label>
                      <input 
                        name="email" 
                        type="email" 
                        required 
                        className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-900 outline-none transition-all" 
                        placeholder="mario@esempio.it"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">Password Account</label>
                    <input 
                      name="password" 
                      type="password" 
                      required 
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-900 outline-none transition-all" 
                      placeholder="Scegli una password sicura"
                    />
                    <p className="text-[10px] text-stone-400 mt-1 italic">Questa password verrà usata per accedere alla tua area riservata una volta approvato.</p>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">Telefono (Opzionale)</label>
                    <input 
                      name="phone" 
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-900 outline-none transition-all" 
                      placeholder="+39 333 1234567"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">Messaggio / Note</label>
                    <textarea 
                      name="message" 
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-900 outline-none transition-all resize-none" 
                      placeholder="Perché vuoi unirti a noi?"
                    />
                  </div>

                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-500 uppercase tracking-widest">Quota Associativa 2026</span>
                    <span className="text-lg font-serif text-stone-900">€ 100,00</span>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-medium">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-stone-900 text-white py-4 rounded-xl font-bold hover:bg-stone-800 transition-all transform active:scale-95 shadow-lg shadow-stone-900/20 disabled:opacity-50"
                  >
                    {loading ? 'Invio in corso...' : 'Invia Richiesta'}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full mb-6">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                </div>
                <h3 className="text-3xl font-serif text-stone-900 mb-4">Richiesta Inviata!</h3>
                <p className="text-stone-600 mb-8 leading-relaxed">
                  Grazie per aver richiesto di diventare socio. La tua richiesta è stata presa in carico e verrà valutata dal consiglio direttivo. Riceverai una conferma via email.
                </p>
                <button
                  onClick={onClose}
                  className="bg-stone-900 text-white px-10 py-4 rounded-xl font-bold hover:bg-stone-800 transition-all"
                >
                  Chiudi
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
