import React from 'react';
import { motion } from 'motion/react';
import { Calendar, MapPin, Clock, Ticket, ArrowRight, Trophy, Sparkles, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BookingModal } from './BookingModal';
import { TicketView } from './TicketView';
import { EventDetailModal } from './EventDetailModal';
import { ContestRegistrationModal } from './ContestRegistrationModal';

export function EventsSection() {
  const [events, setEvents] = React.useState<any[]>([]);
  const [lotteries, setLotteries] = React.useState<any[]>([]);
  const [contests, setContests] = React.useState<any[]>([]);
  const [bookingEvents, setBookingEvents] = React.useState<any[]>([]);
  const [selectedBookingEvent, setSelectedBookingEvent] = React.useState<any>(null);
  const [selectedEventForDetail, setSelectedEventForDetail] = React.useState<any>(null);
  const [selectedContestForRegistration, setSelectedContestForRegistration] = React.useState<any>(null);
  const [showBookingModal, setShowBookingModal] = React.useState(false);
  const [showEventDetailModal, setShowEventDetailModal] = React.useState(false);
  const [showContestRegistrationModal, setShowContestRegistrationModal] = React.useState(false);
  const [showTicketView, setShowTicketView] = React.useState(false);
  const [lastBooking, setLastBooking] = React.useState<any>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch News (Events)
        const newsRes = await fetch('/api/news');
        if (newsRes.ok) {
          const newsData = await newsRes.json();
          if (Array.isArray(newsData)) {
            const eventItems = newsData.filter((item: any) => 
              item.category === 'evento' && 
              item.title && 
              item.date &&
              !isNaN(new Date(item.date).getTime())
            );
            const homepageEvents = eventItems.filter((item: any) => 
              item.showOnHomepage === 1 || item.showOnHomepage === true || item.showOnHomepage === '1'
            );
            setEvents(homepageEvents.length > 0 ? homepageEvents : eventItems);
          }
        }

        // Fetch Lotteries
        const lotteryRes = await fetch('/api/lottery');
        const lotteryData = await lotteryRes.json();
        if (lotteryData && lotteryData.name && lotteryData.drawDate && !isNaN(new Date(lotteryData.drawDate).getTime()) && (Number(lotteryData.showOnHomepage) === 1 || lotteryData.showOnHomepage === true)) {
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
          !isNaN(new Date(c.startDate).getTime()) &&
          (Number(c.showOnHomepage) === 1 || c.showOnHomepage === true)
        ));

        // Fetch Booking Events
        const bookingRes = await fetch('/api/booking-events');
        const bookingData = await bookingRes.json();
        setBookingEvents(bookingData.filter((b: any) => 
          b.title && 
          b.date && 
          !isNaN(new Date(b.date).getTime()) &&
          (Number(b.showOnHomepage) === 1 || b.showOnHomepage === true)
        ));

      } catch (error) {
        console.error('Error fetching events data:', error);
      }
    };
    fetchData();
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

  if (allEvents.length === 0) return null;

  return (
    <section id="eventi" className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8 sm:mb-12">
          <div>
            <h2 className="text-xs sm:text-sm uppercase tracking-widest text-stone-500 font-semibold mb-1 sm:mb-2">Le nostre iniziative</h2>
            <h3 className="text-2xl sm:text-4xl font-serif text-stone-900">Eventi & Attività</h3>
          </div>
          <Link 
            to="/eventi"
            className="hidden md:flex items-center gap-2 text-stone-900 font-bold text-xs uppercase tracking-widest hover:gap-4 transition-all group"
          >
            Vedi tutti gli eventi <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {allEvents.map((item, index) => {
            const isContest = item.type === 'contest';
            const now = new Date();
            const contestStart = item.startDate ? new Date(item.startDate) : null;
            const contestEnd = item.endDate ? new Date(item.endDate) : null;
            if (contestStart) contestStart.setHours(0, 0, 0, 0);
            if (contestEnd) contestEnd.setHours(23, 59, 59, 999);
            
            const isContestActive = isContest && (!contestStart || now >= contestStart) && (!contestEnd || now <= contestEnd);

            return (
              <motion.div
                key={`${item.type}-${item.id}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                onClick={() => {
                  setSelectedEventForDetail(item);
                  setShowEventDetailModal(true);
                }}
                className="w-full bg-stone-50 rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all group border border-stone-200/60 cursor-pointer flex flex-col justify-between"
              >
                <div className="w-full">
                  <div className="h-48 sm:h-56 overflow-hidden relative w-full bg-stone-100">
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=800'}
                      alt={item.title}
                      className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
                        (new Date(item.date || item.endDate || item.startDate || item.drawDate || item.createdAt).setHours(23, 59, 59, 999) < new Date().getTime()) ? 'grayscale opacity-75' : ''
                      }`}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=800';
                      }}
                    />
                    <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex flex-col gap-1.5 sm:gap-2">
                      <span className={`
                        px-2.5 py-1 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-white shadow-sm
                        ${item.type === 'booking' ? 'bg-amber-500' : ''}
                        ${item.type === 'lottery' ? 'bg-emerald-500' : ''}
                        ${item.type === 'contest' ? 'bg-indigo-600' : ''}
                        ${item.type === 'news_event' ? 'bg-stone-900' : ''}
                      `}>
                        {item.type === 'booking' && 'Prenotazione'}
                        {item.type === 'lottery' && 'Lotteria'}
                        {item.type === 'contest' && 'Concorso'}
                        {item.type === 'news_event' && 'Evento'}
                      </span>
                      {new Date(item.date || item.endDate || item.startDate || item.drawDate || item.createdAt).setHours(23, 59, 59, 999) < new Date().getTime() && (
                        <span className="px-2.5 py-1 bg-stone-900 text-white rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-widest shadow-lg">
                          Terminato
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-4 sm:p-6 md:p-8">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] sm:text-xs text-stone-500 mb-2 sm:mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-stone-400" />
                        {new Date(item.date || item.startDate || item.drawDate || item.createdAt).toLocaleDateString('it-IT')}
                      </span>
                      {item.location && (
                        <span className="flex items-center gap-1 truncate max-w-[150px] sm:max-w-none">
                          <MapPin className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                          <span className="truncate">{item.location}</span>
                        </span>
                      )}
                    </div>

                    <h4 className="text-lg sm:text-xl md:text-2xl font-serif text-stone-900 mb-2 sm:mb-3 leading-snug line-clamp-3 break-words">{item.title}</h4>
                    
                    <p className="text-stone-600 text-xs sm:text-sm leading-relaxed line-clamp-3 mb-4 sm:mb-6 break-words">
                      {item.description || item.excerpt || item.content}
                    </p>
                  </div>
                </div>

                <div className="px-4 pb-4 sm:px-6 sm:pb-6 md:px-8 md:pb-8 pt-3 sm:pt-4 border-t border-stone-200/80 flex items-center justify-between">
                  {item.type === 'booking' ? (
                    new Date(item.date).setHours(23, 59, 59, 999) < new Date().getTime() ? (
                      <span className="text-stone-400 font-bold text-[10px] sm:text-xs uppercase tracking-widest">Iniziativa terminata</span>
                    ) : item.soldTickets >= item.totalTickets ? (
                      <span className="text-red-500 font-bold text-[10px] sm:text-xs uppercase tracking-widest">Sold Out</span>
                    ) : (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBookingEvent(item);
                          setShowBookingModal(true);
                        }}
                        className="flex items-center gap-1.5 bg-stone-900 text-white px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-xl font-bold text-[10px] sm:text-xs uppercase tracking-widest hover:bg-stone-800 transition-all shadow-lg shadow-stone-900/10 cursor-pointer"
                      >
                        Prenota Ora <Ticket className="w-3.5 h-3.5" />
                      </button>
                    )
                  ) : isContest ? (
                    isContestActive ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedContestForRegistration(item);
                          setShowContestRegistrationModal(true);
                        }}
                        className="flex items-center gap-1.5 bg-indigo-600 text-white px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-xl font-bold text-[10px] sm:text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
                      >
                        Iscriviti
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 text-stone-900 font-bold text-xs uppercase tracking-widest group-hover:gap-4 transition-all">
                        Scopri di più <ArrowRight className="w-4 h-4" />
                      </div>
                    )
                  ) : (
                    <div className="flex items-center gap-2 text-stone-900 font-bold text-xs uppercase tracking-widest group-hover:gap-4 transition-all">
                      Scopri di più <ArrowRight className="w-4 h-4" />
                    </div>
                  )}

                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <BookingModal 
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        event={selectedBookingEvent}
        onSuccess={handleBookingSuccess}
      />

      <ContestRegistrationModal
        isOpen={showContestRegistrationModal}
        onClose={() => setShowContestRegistrationModal(false)}
        contest={selectedContestForRegistration}
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
        onRegisterContest={(contest) => {
          setSelectedContestForRegistration(contest);
          setShowContestRegistrationModal(true);
        }}
      />
    </section>
  );
}

