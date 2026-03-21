import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, MapPin, Clock, Ticket, CheckCircle2, Loader2, Mail, Phone, User, ArrowRight } from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: any;
  onSuccess: (bookingData: any) => void;
}

export function BookingModal({ isOpen, onClose, event, onSuccess }: BookingModalProps) {
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    phone: '',
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [step, setStep] = React.useState<'details' | 'payment'>('details');
  const [paypalSettings, setPaypalSettings] = React.useState<any>(null);

  React.useEffect(() => {
    if (isOpen) {
      fetch('/api/settings/paypal_settings')
        .then(res => res.json())
        .then(data => {
          if (data?.value) setPaypalSettings(data.value);
        })
        .catch(err => console.error('Error fetching paypal settings:', err));
    }
  }, [isOpen]);

  if (!event) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (event.price > 0 && step === 'details') {
      setStep('payment');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id,
          ...formData,
          paymentStatus: event.price > 0 ? 'paid' : 'free'
        })
      });

      if (response.ok) {
        const data = await response.json();
        onSuccess({ ...data, ...formData, eventTitle: event.title, eventDate: event.date, eventTime: event.time });
        setStep('details');
        setFormData({ name: '', email: '', phone: '' });
      } else {
        const errData = await response.json();
        setError(errData.error || 'Errore durante la prenotazione');
      }
    } catch (err) {
      setError('Errore di connessione');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="bg-white rounded-3xl overflow-hidden max-w-2xl w-full shadow-2xl flex flex-col md:flex-row"
          >
            {/* Left Side: Event Info */}
            <div className="md:w-1/2 bg-stone-900 text-white p-8 flex flex-col">
              <div className="relative h-40 rounded-2xl overflow-hidden mb-6">
                <img 
                  src={event.image || 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=800'} 
                  alt={event.title}
                  className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest">
                    Prenotazione
                  </span>
                </div>
              </div>
              
              <h3 className="text-2xl font-serif mb-4">{event.title}</h3>
              
              <div className="space-y-4 text-stone-400 text-sm">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-amber-500" />
                  <span>{new Date(event.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-amber-500" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Ticket className="w-4 h-4 text-amber-500" />
                  <span className="text-white font-bold">€ {event.price.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-auto pt-8 border-t border-white/10">
                <p className="text-xs text-stone-500 leading-relaxed italic">
                  La prenotazione è vincolante. Riceverai il biglietto digitale via email dopo la conferma.
                </p>
              </div>
            </div>

            {/* Right Side: Form / Payment */}
            <div className="md:w-1/2 p-8 relative">
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 text-stone-400 hover:text-stone-900 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <AnimatePresence mode="wait">
                {step === 'details' ? (
                  <motion.div
                    key="details"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h4 className="text-xl font-serif text-stone-900 mb-6">Dati Prenotazione</h4>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">Nome e Cognome</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                          <input 
                            required
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-100 rounded-xl text-sm focus:ring-2 focus:ring-stone-900 outline-none transition-all"
                            placeholder="Mario Rossi"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">Email</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                          <input 
                            required
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-100 rounded-xl text-sm focus:ring-2 focus:ring-stone-900 outline-none transition-all"
                            placeholder="mario.rossi@esempio.it"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">Cellulare</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                          <input 
                            required
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                            className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-100 rounded-xl text-sm focus:ring-2 focus:ring-stone-900 outline-none transition-all"
                            placeholder="+39 333 1234567"
                          />
                        </div>
                      </div>

                      {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl flex items-center gap-2">
                          <X className="w-4 h-4" />
                          {error}
                        </div>
                      )}

                      <div className="pt-4">
                        <button
                          type="submit"
                          className="w-full py-4 bg-stone-900 text-white rounded-xl font-bold hover:bg-stone-800 transition-all shadow-lg shadow-stone-900/20 flex items-center justify-center gap-2"
                        >
                          {event.price > 0 ? 'Vai al Pagamento' : 'Conferma Prenotazione'}
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                      </div>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="payment"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <h4 className="text-xl font-serif text-stone-900">Pagamento</h4>
                    
                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                      <p className="text-sm text-amber-800 leading-relaxed">
                        {paypalSettings?.instructions || 'Per completare la prenotazione, effettua il pagamento tramite PayPal.me.'}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <a 
                        href={`${paypalSettings?.paypal_me_link}/${event.price}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-3 w-full py-4 bg-[#0070ba] text-white rounded-xl font-bold hover:bg-[#005ea6] transition-all shadow-lg shadow-blue-900/10"
                      >
                        Paga con PayPal.me
                        <ArrowRight className="w-5 h-5" />
                      </a>

                      <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="w-full py-4 bg-stone-900 text-white rounded-xl font-bold hover:bg-stone-800 transition-all shadow-lg shadow-stone-900/20 flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            Ho effettuato il pagamento
                            <CheckCircle2 className="w-5 h-5" />
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => setStep('details')}
                        className="w-full py-2 text-stone-400 text-xs font-bold uppercase tracking-widest hover:text-stone-900 transition-colors"
                      >
                        Torna ai dati
                      </button>
                    </div>

                    {error && (
                      <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl flex items-center gap-2">
                        <X className="w-4 h-4" />
                        {error}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <p className="mt-6 text-[10px] text-stone-400 text-center">
                I tuoi dati saranno trattati nel rispetto della privacy. 
                Riceverai una copia del biglietto via email.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
