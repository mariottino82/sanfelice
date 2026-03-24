import React from 'react';
import { motion } from 'motion/react';
import { Calendar, MapPin, Ticket, ArrowLeft, Trophy, Sparkles, Star, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { SEO } from '../components/SEO';
import { BookingModal } from '../components/BookingModal';
import { TicketView } from '../components/TicketView';
import { EventDetailModal } from '../components/EventDetailModal';

export function EventsPage({ onLoginClick, onRegisterClick, onDonationClick }: any) {
  const [events, setEvents] = React.useState<any[]>([]);
  const [lotteries, setLotteries] = React.useState<any[]>([]);
  const [contests, setContests] = React.useState<any[]>([]);
  const [bookingEvents, setBookingEvents] = React.useState<any[]>([]);
  const [selectedBookingEvent, setSelectedBookingEvent] = React.useState<any>(null);
  const [selectedEventForDetail, setSelectedEventForDetail] = React.useState<any>(null);
  const [showBookingModal, setShowBookingModal] = React.useState(false);
  const [showEventDetailModal, setShowEventDetailModal] = React.useState(false);
  const [showTicketView, setShowTicketView] = React.useState(false);
  const [lastBooking, setLastBooking] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch News (Events)
        const newsRes = await fetch('/api/news');
        const newsData = await newsRes.json();
        setEvents(newsData.filter((item: any) => 
          item.category === 'evento' && 
          item.title && 
          item.date &&
          item.showOnHomepage === 1 &&
          !isNaN(new Date(item.date).getTime())
        ));

        // Fetch Lotteries
        const lotteryRes = await fetch('/api/lottery');
        const lotteryData = await lotteryRes.json();
        if (lotteryData && lotteryData.showOnHomepage === 1 && lotteryData.name && lotteryData.drawDate && !isNaN(new Date(lotteryData.drawDate).getTime())) {
          setLotteries([lotteryData]);
        } else {
          setLotteries([]);
        }

        // Fetch Contests
        const contestRes = await fetch('/api/contests');
        const contestData = await contestRes.json();
        setContests(contestData.filter((c: any) => 
          c.title && 
          c.startDate && 
          c.showOnHomepage === 1 &&
          !isNaN(new Date(c.startDate).getTime())
        ));

        // Fetch Booking Events
        const bookingRes = await fetch('/api/booking-events');
        const bookingData = await bookingRes.json();
        setBookingEvents(bookingData.filter((b: any) => 
          b.title && 
          b.date && 
          b.showOnHomepage === 1 &&
          !isNaN(new Date(b.date).getTime())
        ));

      } catch (error) {
        console.error('Error fetching events data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    window.scrollTo(0, 0);
  }, []);

  const handleBookingSuccess = (bookingData: any) => {
    setLastBooking(bookingData);
    setShowBookingModal(false);
    setShowTicketView(true);
  };

  const allEvents = [
    ...events.map(e => ({ ...e, type: 'news_event' })),
    ...lotteries.map(l => ({ ...l, type: 'lottery' })),
    ...contests.map(c => ({ ...c, type: 'contest' })),
    ...bookingEvents.map(b => ({ ...b, type: 'booking' }))
  ].sort((a, b) => {
    const dateA = new Date(a.date || a.startDate || a.drawDate || a.createdAt || 0).getTime();
    const dateB = new Date(b.date || b.startDate || b.drawDate || b.createdAt || 0).getTime();
    return dateB - dateA;
  });

  return (
    <div className="min-h-screen bg-stone-50">
      <SEO 
        title="Eventi - Pro San Felice" 
        description="Scopri tutti gli eventi, le sagre, i concorsi e le manifestazioni organizzate dall'Associazione Pro San Felice."
      />
      <Navbar 
        onLoginClick={onLoginClick} 
        onRegisterClick={onRegisterClick} 
        onDonationClick={onDonationClick}
      />
      
      <main className="pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <Link to="/" className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors mb-6 group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Torna alla Home
            </Link>
            <h1 className="text-5xl font-serif text-stone-900 mb-4">Eventi & Manifestazioni</h1>
            <p className="text-stone-600 max-w-2xl">
              Partecipa alle nostre iniziative: sagre, feste tradizionali, concorsi e rassegne culturali. 
              Unisciti a noi per celebrare le tradizioni di Colle d'Anchise e del Molise.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-24">
              <div className="w-12 h-12 border-4 border-stone-200 border-t-stone-900 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {allEvents.map((item, index) => (
                <motion.div
                  key={`${item.type}-${item.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => {
                    setSelectedEventForDetail(item);
                    setShowEventDetailModal(true);
                  }}
                  className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all group cursor-pointer border border-stone-100"
                >
                  <div className="h-64 overflow-hidden relative">
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=800'}
                      alt={item.title}
                      className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ${
                        (new Date(item.date || item.endDate || item.startDate || item.drawDate || item.createdAt).setHours(23, 59, 59, 999) < new Date().getTime()) ? 'grayscale opacity-75' : ''
                      }`}
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      <span className={`
                        px-3 py-1 bg-white/90 backdrop-blur-sm text-stone-900 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm
                        ${item.type === 'booking' ? 'text-amber-600' : ''}
                        ${item.type === 'lottery' ? 'text-emerald-600' : ''}
                        ${item.type === 'contest' ? 'text-indigo-600' : ''}
                        ${item.type === 'news_event' ? 'text-stone-900' : ''}
                      `}>
                        {item.type === 'booking' && 'Prenotazione'}
                        {item.type === 'lottery' && 'Lotteria'}
                        {item.type === 'contest' && 'Concorso'}
                        {item.type === 'news_event' && 'Evento'}
                      </span>
                      {new Date(item.date || item.endDate || item.startDate || item.drawDate || item.createdAt).setHours(23, 59, 59, 999) < new Date().getTime() && (
                        <span className="px-3 py-1 bg-stone-900 text-white rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg">
                          Evento terminato
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-8">
                    <div className="flex items-center gap-4 text-xs text-stone-400 font-bold uppercase tracking-widest mb-4">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(item.date || item.startDate || item.drawDate || item.createdAt).toLocaleDateString('it-IT')}
                      </span>
                      {item.location && (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" />
                          {item.location}
                        </span>
                      )}
                    </div>

                    <h2 className="text-2xl font-serif text-stone-900 mb-4 leading-tight group-hover:text-stone-700 transition-colors">{item.title}</h2>
                    
                    <p className="text-stone-600 text-sm leading-relaxed line-clamp-3 mb-8">
                      {item.description || item.excerpt || item.content}
                    </p>

                    <div className="flex items-center justify-between pt-6 border-t border-stone-100">
                      {item.type === 'booking' ? (
                        new Date(item.date).setHours(23, 59, 59, 999) < new Date().getTime() ? (
                          <span className="text-stone-400 font-bold text-xs uppercase tracking-widest">Iniziativa terminata</span>
                        ) : item.soldTickets >= item.totalTickets ? (
                          <span className="text-red-500 font-bold text-xs uppercase tracking-widest">Sold Out</span>
                        ) : (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedBookingEvent(item);
                              setShowBookingModal(true);
                            }}
                            className="flex items-center gap-2 bg-stone-900 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-stone-800 transition-all shadow-lg shadow-stone-900/10"
                          >
                            Prenota Ora <Ticket className="w-4 h-4" />
                          </button>
                        )
                      ) : (
                        <div className="flex items-center gap-2 text-stone-900 font-bold text-xs uppercase tracking-widest group-hover:gap-4 transition-all">
                          Scopri di più <ArrowRight className="w-4 h-4" />
                        </div>
                      )}

                      <div className="flex gap-2">
                        {item.type === 'lottery' && <Trophy className="w-5 h-5 text-amber-500" />}
                        {item.type === 'contest' && <Sparkles className="w-5 h-5 text-indigo-500" />}
                        {item.type === 'booking' && <Star className="w-5 h-5 text-amber-500 fill-amber-500" />}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {allEvents.length === 0 && (
                <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border border-dashed border-stone-200">
                  <Calendar className="w-16 h-16 text-stone-200 mx-auto mb-6" />
                  <p className="text-stone-400 font-serif text-xl">Nessun evento disponibile al momento.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <BookingModal 
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        event={selectedBookingEvent}
        onSuccess={handleBookingSuccess}
      />

      <TicketView 
        isOpen={showTicketView}
        onClose={() => setShowTicketView(false)}
        booking={lastBooking}
      />

      <EventDetailModal 
        isOpen={showEventDetailModal}
        onClose={() => setShowEventDetailModal(false)}
        event={selectedEventForDetail}
        onBook={(event) => {
          setSelectedBookingEvent(event);
          setShowBookingModal(true);
        }}
      />
    </div>
  );
}
