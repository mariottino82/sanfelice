import React from 'react';
import { motion } from 'motion/react';
import { Calendar, MapPin, Clock, Ticket, ArrowRight, Trophy, Sparkles, Star } from 'lucide-react';
import { BookingModal } from './BookingModal';
import { TicketView } from './TicketView';
import { EventDetailModal } from './EventDetailModal';

export function EventsSection() {
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

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch News (Events)
        const newsRes = await fetch('/api/news');
        const newsData = await newsRes.json();
        setEvents(newsData.filter((item: any) => item.category === 'evento' && item.showOnHomepage === 1));

        // Fetch Lotteries
        const lotteryRes = await fetch('/api/lottery');
        const lotteryData = await lotteryRes.json();
        if (lotteryData && lotteryData.showOnHomepage) {
          setLotteries([lotteryData]);
        } else {
          setLotteries([]);
        }

        // Fetch Contests
        const contestRes = await fetch('/api/contests');
        const contestData = await contestRes.json();
        setContests(contestData.filter((c: any) => c.showOnHomepage));

        // Fetch Booking Events
        const bookingRes = await fetch('/api/booking-events');
        const bookingData = await bookingRes.json();
        setBookingEvents(bookingData.filter((b: any) => b.showOnHomepage));

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
    const dateA = new Date(a.date || a.startDate || a.createdAt || 0).getTime();
    const dateB = new Date(b.date || b.startDate || b.createdAt || 0).getTime();
    return dateB - dateA;
  });

  if (allEvents.length === 0) return null;

  return (
    <section id="eventi" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-sm uppercase tracking-widest text-stone-500 font-semibold mb-2">Le nostre iniziative</h2>
            <h3 className="text-4xl font-serif text-stone-900">Eventi & Attività</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {allEvents.map((item, index) => (
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
              className="bg-stone-50 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all group border border-stone-100 cursor-pointer"
            >
              <div className="h-56 overflow-hidden relative">
                <img
                  src={item.image || 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=800'}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4">
                  <span className={`
                    px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-white
                    ${item.type === 'booking' ? 'bg-amber-500' : ''}
                    ${item.type === 'lottery' ? 'bg-emerald-500' : ''}
                    ${item.type === 'contest' ? 'bg-indigo-500' : ''}
                    ${item.type === 'news_event' ? 'bg-stone-900' : ''}
                  `}>
                    {item.type === 'booking' && 'Prenotazione'}
                    {item.type === 'lottery' && 'Lotteria'}
                    {item.type === 'contest' && 'Concorso'}
                    {item.type === 'news_event' && 'Evento'}
                  </span>
                </div>
              </div>

              <div className="p-8">
                <div className="flex items-center gap-4 text-xs text-stone-500 mb-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(item.date || item.createdAt).toLocaleDateString('it-IT')}
                  </span>
                  {item.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {item.location}
                    </span>
                  )}
                </div>

                <h4 className="text-2xl font-serif text-stone-900 mb-4 leading-tight">{item.title}</h4>
                
                <p className="text-stone-600 text-sm leading-relaxed line-clamp-3 mb-8">
                  {item.description || item.excerpt || item.content}
                </p>

                <div className="flex items-center justify-between pt-6 border-t border-stone-200">
                  {item.type === 'booking' ? (
                    new Date(item.date).setHours(23, 59, 59, 999) < new Date().getTime() ? (
                      <span className="text-stone-500 font-bold text-xs uppercase tracking-widest">Evento non disponibile</span>
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

                  {item.type === 'lottery' && <Trophy className="w-5 h-5 text-amber-500" />}
                  {item.type === 'contest' && <Sparkles className="w-5 h-5 text-indigo-500" />}
                  {item.type === 'booking' && <Star className="w-5 h-5 text-amber-500 fill-amber-500" />}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

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
    </section>
  );
}
