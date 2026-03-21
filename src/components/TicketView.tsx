import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, MapPin, Clock, Ticket, User, Download, Share2, Printer, CheckCircle2, ShieldCheck } from 'lucide-react';

interface TicketViewProps {
  isOpen: boolean;
  onClose: () => void;
  booking: any;
}

export function TicketView({ isOpen, onClose, booking }: TicketViewProps) {
  if (!booking) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-stone-900/90 backdrop-blur-md z-[110] flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="max-w-4xl w-full py-8">
            <div className="flex justify-between items-center mb-8 px-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center overflow-hidden">
                  <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
                </div>
                <h3 className="text-xl font-serif text-white">Biglietto Elettronico</h3>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Ticket Container */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-white rounded-[2rem] overflow-hidden shadow-2xl flex flex-col md:flex-row print:shadow-none print:rounded-none"
            >
              {/* Left Side: Main Info */}
              <div className="md:w-2/3 p-10 relative">
                {/* Decorative Pattern */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-500 via-stone-900 to-amber-500" />
                
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-[0.3em] mb-2 block">Associazione Pro San Felice 2023</span>
                    <h2 className="text-4xl font-serif text-stone-900 leading-tight">{booking.eventTitle}</h2>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1 block">Codici Biglietto</span>
                    <div className="flex flex-col gap-1">
                      {(booking.ticketNumbers || [booking.ticketNumber]).map((tn: string, idx: number) => (
                        <span key={idx} className="text-lg font-mono font-bold text-stone-900">{tn}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-10">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">Data</span>
                    <div className="flex items-center gap-2 text-stone-900 font-bold">
                      <Calendar className="w-4 h-4 text-amber-500" />
                      <span>{new Date(booking.eventDate).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">Ora</span>
                    <div className="flex items-center gap-2 text-stone-900 font-bold">
                      <Clock className="w-4 h-4 text-amber-500" />
                      <span>{booking.eventTime}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">Luogo</span>
                    <div className="flex items-center gap-2 text-stone-900 font-bold">
                      <MapPin className="w-4 h-4 text-amber-500" />
                      <span>Colle d'Anchise (CB)</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">Nominativo</span>
                    <div className="flex items-center gap-2 text-stone-900 font-bold">
                      <User className="w-4 h-4 text-amber-500" />
                      <span>{booking.name}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-stone-100 flex justify-between items-end">
                  <div className="flex flex-col gap-2 text-stone-400">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-5 h-5 text-emerald-500" />
                      <span className="text-xs font-medium">Biglietti Validi e Confermati</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Ticket className="w-5 h-5 text-amber-500" />
                      <span className="text-xs font-medium">{booking.tickets || 1} Biglietti</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">Prezzo Totale</span>
                    <span className="text-2xl font-serif text-stone-900 font-bold">
                      {booking.price === 0 ? 'Gratuito' : `€ ${((booking.price ?? 10) * (booking.tickets || 1)).toFixed(2)}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Side: QR Code & Stub */}
              <div className="md:w-1/3 bg-stone-50 p-10 flex flex-col items-center justify-center relative border-l border-dashed border-stone-200">
                {/* Perforation Circles */}
                <div className="absolute -top-4 -left-4 w-8 h-8 bg-stone-900/90 rounded-full md:block hidden" />
                <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-stone-900/90 rounded-full md:block hidden" />

                <div className="bg-white p-4 rounded-2xl shadow-sm mb-6">
                  {/* Simulated QR Code */}
                  <div className="w-32 h-32 bg-stone-900 rounded-lg flex items-center justify-center p-2">
                    <div className="w-full h-full grid grid-cols-4 grid-rows-4 gap-1">
                      {Array.from({ length: 16 }).map((_, i) => (
                        <div 
                          key={i} 
                          className={`rounded-sm ${Math.random() > 0.5 ? 'bg-white' : 'bg-transparent'}`} 
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="text-center space-y-2">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">Scansiona all'ingresso</span>
                  <p className="text-[10px] text-stone-500 leading-relaxed">
                    Mostra questo QR Code al personale autorizzato per l'accesso all'evento.
                  </p>
                </div>

                <div className="mt-8 pt-8 border-t border-stone-200 w-full text-center">
                  <div className="flex items-center justify-center gap-2 text-stone-900 font-bold text-xs uppercase tracking-[0.2em]">
                    <Ticket className="w-4 h-4" />
                    {(booking.ticketNumbers && booking.ticketNumbers[0]) || booking.ticketNumber || 'SF-2026'}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Actions */}
            <div className="mt-8 flex flex-wrap justify-center gap-4 print:hidden">
              <button 
                onClick={handlePrint}
                className="bg-white text-stone-900 px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-stone-50 transition-all shadow-xl"
              >
                <Printer className="w-5 h-5" />
                Stampa Biglietto
              </button>
              <button className="bg-stone-800 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-stone-700 transition-all shadow-xl">
                <Download className="w-5 h-5" />
                Scarica PDF
              </button>
              <button className="bg-amber-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-amber-700 transition-all shadow-xl">
                <Share2 className="w-5 h-5" />
                Condividi
              </button>
            </div>

            <div className="mt-12 text-center text-stone-500 text-xs print:hidden">
              <p>© 2026 Associazione Pro San Felice 2023 - Tutti i diritti riservati</p>
              <p className="mt-2">Per assistenza: sanfeliceassociazione@gmail.com</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
