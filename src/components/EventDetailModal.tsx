import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, MapPin, Clock, Share2, Facebook, Instagram, Twitter, Trophy, Euro, Sparkles, Ticket } from 'lucide-react';

interface EventDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: any;
  onBook?: (event: any) => void;
  onRegisterContest?: (contest: any) => void;
}

export function EventDetailModal({ isOpen, onClose, event, onBook, onRegisterContest }: EventDetailModalProps) {
  if (!event) return null;

  const shareUrl = window.location.href;
  const shareText = `Scopri l'evento: ${event.title}`;

  const shareOnSocial = (platform: string) => {
    let url = '';
    switch (platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
        break;
      case 'instagram':
        alert('Copia il link e condividilo su Instagram!');
        return;
    }
    window.open(url, '_blank', 'width=600,height=400');
  };

  // Determine if contest or booking or news_event
  const isContest = event.type === 'contest' || Boolean(event.prizes) || (event.startDate && event.endDate && event.cost !== undefined);
  const isBooking = event.type === 'booking';

  // Active status calculation for contests
  const now = new Date();
  const startDate = event.startDate ? new Date(event.startDate) : (event.date ? new Date(event.date) : null);
  const endDate = event.endDate ? new Date(event.endDate) : (event.date ? new Date(event.date) : null);

  if (startDate) startDate.setHours(0, 0, 0, 0);
  if (endDate) endDate.setHours(23, 59, 59, 999);

  const isContestBeforeStart = startDate && now < startDate;
  const isContestAfterEnd = endDate && now > endDate;
  const isContestActive = !isContestBeforeStart && !isContestAfterEnd;

  // Booking calculations
  const isBookingPast = event.date && new Date(event.date).setHours(23, 59, 59, 999) < now.getTime();
  const isBookingSoldOut = isBooking && (event.soldTickets || 0) >= (event.totalTickets || Infinity);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-stone-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            className="bg-white rounded-2xl sm:rounded-[2.5rem] overflow-hidden max-w-4xl w-full max-h-[92vh] sm:max-h-[90vh] shadow-2xl flex flex-col md:flex-row relative my-auto border border-stone-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 sm:top-5 sm:right-5 z-30 p-2 bg-stone-900/80 text-white hover:bg-stone-900 sm:bg-white/80 sm:text-stone-900 sm:hover:bg-white backdrop-blur-md rounded-full shadow-md transition-all hover:scale-110"
              aria-label="Chiudi"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left Image Section - Responsive & Auto-Resized */}
            <div className="w-full md:w-1/2 min-h-[200px] xs:min-h-[240px] sm:min-h-[280px] md:min-h-[420px] max-h-[300px] xs:max-h-[340px] md:max-h-none relative flex-shrink-0 overflow-hidden bg-stone-950 flex items-center justify-center p-2 sm:p-4">
              {/* Blurred backdrop image for seamless ratio padding */}
              <img
                src={event.image || 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=800'}
                alt=""
                className="absolute inset-0 w-full h-full object-cover blur-xl opacity-35 scale-110 pointer-events-none"
                aria-hidden="true"
              />
              <img
                src={event.image || 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=800'}
                alt={event.title}
                className="relative z-10 w-full h-full max-h-[260px] xs:max-h-[300px] md:max-h-[480px] object-contain rounded-xl drop-shadow-xl"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent md:hidden pointer-events-none z-10" />
              
              {/* Mobile overlay title */}
              <div className="absolute bottom-3 left-4 right-12 text-white md:hidden z-20">
                <span className={`
                  px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest text-white inline-block mb-1 shadow-sm
                  ${isBooking ? 'bg-amber-500' : ''}
                  ${event.type === 'lottery' ? 'bg-emerald-500' : ''}
                  ${isContest ? 'bg-indigo-600' : ''}
                  ${event.type === 'news_event' ? 'bg-stone-900' : ''}
                `}>
                  {isBooking && 'Prenotazione'}
                  {event.type === 'lottery' && 'Lotteria'}
                  {isContest && 'Concorso'}
                  {event.type === 'news_event' && 'Evento'}
                </span>
                <h2 className="text-base sm:text-lg font-serif text-white leading-tight line-clamp-2">{event.title}</h2>
              </div>
            </div>

            {/* Right Text Content Section */}
            <div className="w-full md:w-1/2 p-4 sm:p-6 md:p-10 overflow-y-auto flex flex-col justify-between space-y-4 sm:space-y-6">
              <div>
                {/* Desktop Header */}
                <div className="hidden md:block mb-6">
                  <span className={`
                    px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-white mb-3 inline-block shadow-sm
                    ${isBooking ? 'bg-amber-500' : ''}
                    ${event.type === 'lottery' ? 'bg-emerald-500' : ''}
                    ${isContest ? 'bg-indigo-600' : ''}
                    ${event.type === 'news_event' ? 'bg-stone-900' : ''}
                  `}>
                    {isBooking && 'Prenotazione'}
                    {event.type === 'lottery' && 'Lotteria'}
                    {isContest && 'Concorso'}
                    {event.type === 'news_event' && 'Evento'}
                  </span>
                  <h2 className="text-2xl lg:text-3xl font-serif text-stone-900 leading-tight">{event.title}</h2>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-2.5 sm:gap-3 mb-4 sm:mb-6">
                  {/* Date or Date Range */}
                  <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl sm:rounded-2xl border border-stone-100">
                    <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                      <Calendar className="w-4 h-4 text-stone-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Data Evento</p>
                      <p className="text-stone-900 font-semibold text-xs sm:text-sm truncate">
                        {event.eventDate ? (
                          new Date(event.eventDate).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })
                        ) : event.startDate && event.endDate ? (
                          `${new Date(event.startDate).toLocaleDateString('it-IT')} - ${new Date(event.endDate).toLocaleDateString('it-IT')}`
                        ) : (
                          new Date(event.date || event.createdAt || event.drawDate || Date.now()).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })
                        )}
                      </p>
                    </div>
                  </div>

                  {/* If contest with registration period and separate eventDate, show Periodo Iscrizioni */}
                  {event.eventDate && event.startDate && event.endDate && (
                    <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl sm:rounded-2xl border border-stone-100">
                      <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                        <Calendar className="w-4 h-4 text-amber-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Periodo Iscrizioni</p>
                        <p className="text-stone-900 font-semibold text-xs sm:text-sm truncate">
                          {new Date(event.startDate).toLocaleDateString('it-IT')} - {new Date(event.endDate).toLocaleDateString('it-IT')}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Location */}
                  {event.location && (
                    <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl sm:rounded-2xl border border-stone-100">
                      <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                        <MapPin className="w-4 h-4 text-stone-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Luogo</p>
                        <p className="text-stone-900 font-semibold text-xs sm:text-sm truncate">{event.location}</p>
                      </div>
                    </div>
                  )}

                  {/* Time */}
                  {event.time && (
                    <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl sm:rounded-2xl border border-stone-100">
                      <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                        <Clock className="w-4 h-4 text-stone-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Orario</p>
                        <p className="text-stone-900 font-semibold text-xs sm:text-sm truncate">{event.time}</p>
                      </div>
                    </div>
                  )}

                  {/* Contest Cost */}
                  {isContest && event.cost !== undefined && (
                    <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl sm:rounded-2xl border border-stone-100">
                      <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                        <Euro className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Quota Partecipazione</p>
                        <p className="text-stone-900 font-semibold text-xs sm:text-sm truncate">
                          {Number(event.cost) > 0 ? `€ ${event.cost}` : 'Gratuito'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Contest Prizes */}
                  {isContest && event.prizes && (
                    <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl sm:rounded-2xl border border-emerald-100 col-span-1 sm:col-span-2 md:col-span-1">
                      <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                        <Trophy className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Premi & Riconoscimenti</p>
                        <p className="text-emerald-950 font-medium text-xs sm:text-sm leading-snug">{event.prizes}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="prose prose-stone prose-sm max-w-none mb-4 sm:mb-6">
                  <p className="text-stone-600 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {event.description || event.content || event.excerpt}
                  </p>
                </div>

                {/* Contest Winners if present */}
                {isContest && event.winners && (() => {
                  try {
                    const parsed = typeof event.winners === 'string' ? JSON.parse(event.winners) : event.winners;
                    if (Array.isArray(parsed) && parsed.length > 0) {
                      return (
                        <div className="mb-4 p-3.5 bg-stone-900 rounded-xl sm:rounded-2xl text-white">
                          <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                            <Trophy className="w-3.5 h-3.5 text-amber-400" /> Albo d'Oro / Vincitori Passati
                          </p>
                          <div className="space-y-1.5 text-xs">
                            {parsed.map((w: any, idx: number) => (
                              <div key={idx} className="flex justify-between items-center border-b border-white/10 pb-1 last:border-0 last:pb-0">
                                <span>{w.winnerName} ({w.year})</span>
                                <span className="text-stone-400 text-[10px]">{w.prize}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                  } catch (e) { return null; }
                  return null;
                })()}
              </div>

              {/* Action and Social Footer */}
              <div className="pt-4 border-t border-stone-100 flex flex-col space-y-3 mt-auto">
                {/* Registration / Booking Button Section */}
                <div>
                  {isContest ? (
                    isContestAfterEnd ? (
                      <div className="w-full bg-stone-100 border border-stone-200 text-stone-500 text-center py-3 rounded-xl sm:rounded-2xl text-xs font-bold uppercase tracking-wider">
                        Iscrizioni Concorso Chiuse
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <button
                          onClick={() => {
                            onClose();
                            if (onRegisterContest) {
                              onRegisterContest(event);
                            } else if (onBook) {
                              onBook(event);
                            }
                          }}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transform active:scale-[0.99] cursor-pointer"
                        >
                          <Sparkles className="w-4 h-4 text-amber-300" />
                          Iscriviti al Concorso
                        </button>
                        {isContestBeforeStart && (
                          <p className="text-[10px] text-center text-amber-700 font-semibold">
                            Iscrizioni aperte per questo concorso
                          </p>
                        )}
                      </div>
                    )
                  ) : isBooking ? (
                    isBookingPast ? (
                      <span className="block text-center text-stone-500 font-bold text-xs uppercase tracking-widest py-2">
                        Iniziativa terminata
                      </span>
                    ) : isBookingSoldOut ? (
                      <span className="block text-center text-red-500 font-bold text-xs uppercase tracking-widest py-2">
                        Sold Out
                      </span>
                    ) : (
                      <button 
                        onClick={() => {
                          onClose();
                          if (onBook) onBook(event);
                        }}
                        className="w-full bg-stone-900 text-white py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm uppercase tracking-widest hover:bg-stone-800 transition-all shadow-xl shadow-stone-900/20 flex items-center justify-center gap-2 transform active:scale-[0.99] cursor-pointer"
                      >
                        <Ticket className="w-4 h-4 text-amber-400" />
                        Prenota Ora
                      </button>
                    )
                  ) : (
                    /* Generic Event / News Event */
                    <button
                      onClick={() => {
                        onClose();
                        if (onRegisterContest) {
                          onRegisterContest(event);
                        } else if (onBook) {
                          onBook(event);
                        }
                      }}
                      className="w-full bg-stone-900 text-white py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm uppercase tracking-widest hover:bg-stone-800 transition-all shadow-xl shadow-stone-900/20 flex items-center justify-center gap-2 transform active:scale-[0.99] cursor-pointer"
                    >
                      <Ticket className="w-4 h-4 text-amber-400" />
                      Iscriviti all'Evento
                    </button>
                  )}
                </div>

                {/* Social Share Bar */}
                <div className="flex items-center justify-between pt-2">
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Condividi</p>
                  <div className="flex gap-2">
                    <button onClick={() => shareOnSocial('facebook')} className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-600 hover:text-blue-600" title="Condividi su Facebook">
                      <Facebook className="w-4 h-4" />
                    </button>
                    <button onClick={() => shareOnSocial('instagram')} className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-600 hover:text-pink-600" title="Condividi su Instagram">
                      <Instagram className="w-4 h-4" />
                    </button>
                    <button onClick={() => shareOnSocial('twitter')} className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-600 hover:text-sky-600" title="Condividi su Twitter">
                      <Twitter className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

