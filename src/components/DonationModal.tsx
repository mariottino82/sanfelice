import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, ExternalLink } from 'lucide-react';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DonationModal({ isOpen, onClose }: DonationModalProps) {
  const [formData, setFormData] = React.useState({
    firstName: '',
    lastName: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('pending_donation_id', data.id);
        // Redirect to PayPal immediately
        window.location.href = 'https://www.paypal.com/ncp/payment/9UVU9QTPS3YQU';
      }
    } catch (error) {
      console.error('Error submitting donation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
            className="relative bg-white rounded-[2rem] shadow-2xl max-w-md w-full overflow-hidden"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-900 transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="p-8">
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6">
                <Heart className="w-8 h-8 text-red-500 fill-red-500" />
              </div>

              <h3 className="text-2xl font-serif text-stone-900 mb-2">Sostieni la Pro San Felice</h3>
              <p className="text-stone-500 text-sm mb-8">
                Il tuo contributo ci aiuta a mantenere vive le tradizioni e a valorizzare il nostro territorio.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Nome</label>
                      <input
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-stone-900 outline-none transition-all"
                        placeholder="Mario"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Cognome</label>
                      <input
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-stone-900 outline-none transition-all"
                        placeholder="Rossi"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Email</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-stone-900 outline-none transition-all"
                      placeholder="mario.rossi@esempio.it"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-stone-900 text-white py-4 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-stone-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Elaborazione...' : (
                      <>
                        Procedi all'offerta <ExternalLink className="w-4 h-4" />
                      </>
                    )}
                  </button>
                  
                  <p className="text-[10px] text-stone-400 text-center mt-4">
                    Riceverai un'email con allegato un attestato di ringraziamento dopo aver effettuato la tua donazione.
                  </p>
                </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
