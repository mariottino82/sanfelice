import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, MapPin, Clock, Share2, Facebook, Instagram, Twitter } from 'lucide-react';

interface EventDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: any;
  onBook?: (event: any) => void;
}

export function EventDetailModal({ isOpen, onClose, event, onBook }: EventDetailModalProps) {
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
        // Instagram doesn't support direct sharing via URL in the same way
        alert('Copia il link e condividilo su Instagram!');
        return;
    }
    window.open(url, '_blank', 'width=600,height=400');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-stone-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 sm:p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white rounded-[2rem] overflow-hidden max-w-4xl w-full max-h-[90vh] shadow-2xl flex flex-col md:flex-row relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-6 right-6 z-10 p-2 bg-white/20 backdrop-blur-md text-white md:text-stone-900 md:bg-stone-100 rounded-full hover:scale-110 transition-all"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="w-full md:w-1/2 h-64 md:h-auto relative">
              <img
                src={event.image || 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=800'}
                alt={event.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:hidden" />
              <div className="absolute bottom-6 left-6 text-white md:hidden">
                <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold uppercase tracking-widest mb-2 inline-block">
                  {event.type === 'booking' && 'Prenotazione'}
                  {event.type === 'lottery' && 'Lotteria'}
                  {event.type === 'contest' && 'Concorso'}
                  {event.type === 'news_event' && 'Evento'}
                </span>
                <h2 className="text-2xl font-serif">{event.title}</h2>
              </div>
            </div>

            <div className="w-full md:w-1/2 p-8 md:p-12 overflow-y-auto">
              <div className="hidden md:block mb-8">
                <span className={`
                  px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-white mb-4 inline-block
                  ${event.type === 'booking' ? 'bg-amber-500' : ''}
                  ${event.type === 'lottery' ? 'bg-emerald-500' : ''}
                  ${event.type === 'contest' ? 'bg-indigo-500' : ''}
                  ${event.type === 'news_event' ? 'bg-stone-900' : ''}
                `}>
                  {event.type === 'booking' && 'Prenotazione'}
                  {event.type === 'lottery' && 'Lotteria'}
                  {event.type === 'contest' && 'Concorso'}
                  {event.type === 'news_event' && 'Evento'}
                </span>
                <h2 className="text-4xl font-serif text-stone-900 leading-tight">{event.title}</h2>
              </div>

              <div className="grid grid-cols-1 gap-6 mb-8">
                <div className="flex items-center gap-4 p-4 bg-stone-50 rounded-2xl border border-stone-100">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <Calendar className="w-5 h-5 text-stone-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Data</p>
                    <p className="text-stone-900 font-medium">{new Date(event.date || event.createdAt || event.startDate).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>

                {event.location && (
                  <div className="flex items-center gap-4 p-4 bg-stone-50 rounded-2xl border border-stone-100">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                      <MapPin className="w-5 h-5 text-stone-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Luogo</p>
                      <p className="text-stone-900 font-medium">{event.location}</p>
                    </div>
                  </div>
                )}

                {event.time && (
                  <div className="flex items-center gap-4 p-4 bg-stone-50 rounded-2xl border border-stone-100">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                      <Clock className="w-5 h-5 text-stone-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Orario</p>
                      <p className="text-stone-900 font-medium">{event.time}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="prose prose-stone prose-sm max-w-none mb-12">
                <p className="text-stone-600 leading-relaxed whitespace-pre-wrap">
                  {event.description || event.content || event.excerpt}
                </p>
              </div>

              <div className="flex items-center justify-between pt-8 border-t border-stone-100">
                <div className="flex items-center gap-4">
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Condividi</p>
                  <div className="flex gap-2">
                    <button onClick={() => shareOnSocial('facebook')} className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-600 hover:text-blue-600">
                      <Facebook className="w-5 h-5" />
                    </button>
                    <button onClick={() => shareOnSocial('instagram')} className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-600 hover:text-pink-600">
                      <Instagram className="w-5 h-5" />
                    </button>
                    <button onClick={() => shareOnSocial('twitter')} className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-600 hover:text-sky-600">
                      <Twitter className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                {event.type === 'booking' && (
                  new Date(event.date).setHours(23, 59, 59, 999) < new Date().getTime() ? (
                    <span className="text-stone-500 font-bold text-xs uppercase tracking-widest">Evento non disponibile</span>
                  ) : event.soldTickets >= event.totalTickets ? (
                    <span className="text-red-500 font-bold text-xs uppercase tracking-widest">Sold Out</span>
                  ) : (
                    <button 
                      onClick={() => {
                        onClose();
                        if (onBook) onBook(event);
                      }}
                      className="bg-stone-900 text-white px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-stone-800 transition-all shadow-xl shadow-stone-900/20"
                    >
                      Prenota Ora
                    </button>
                  )
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
