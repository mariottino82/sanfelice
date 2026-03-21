import React from 'react';
import { motion } from 'motion/react';
import { Plus, Edit2, Trash2, Calendar, MapPin, Clock, Ticket, Users, Download, Search, ChevronRight, CheckCircle2, XCircle, AlertCircle, Loader2, Image as ImageIcon, Star, Upload } from 'lucide-react';

interface BookingsManagementProps {
  bookingEvents: any[];
  bookings: any[];
  onAddEvent: (event: any) => void;
  onDeleteEvent: (event: any) => void;
  onDeleteBooking: (booking: any) => void;
  isSaving: boolean;
  isDeleting: boolean;
  imageFile: File | null;
  onImageChange: (file: File | null) => void;
}

export function BookingsManagement({ 
  bookingEvents, 
  bookings, 
  onAddEvent, 
  onDeleteEvent, 
  onDeleteBooking,
  isSaving,
  isDeleting,
  imageFile,
  onImageChange
}: BookingsManagementProps) {
  const [showEventModal, setShowEventModal] = React.useState(false);
  const [editingEvent, setEditingEvent] = React.useState<any>(null);
  const [selectedEventId, setSelectedEventId] = React.useState<number | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredEvents = bookingEvents.filter(e => 
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const eventBookings = selectedEventId 
    ? bookings.filter(b => b.eventId === selectedEventId)
    : [];

  const handleEditEvent = (event: any) => {
    setEditingEvent(event);
    setShowEventModal(true);
  };

  const handleAddEvent = () => {
    setEditingEvent({
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      time: '20:00',
      location: 'Colle d\'Anchise',
      price: 10,
      totalTickets: 100,
      showOnHomepage: true
    });
    setShowEventModal(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input 
            type="text"
            placeholder="Cerca eventi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-stone-900 outline-none transition-all"
          />
        </div>
        <button 
          onClick={handleAddEvent}
          className="bg-stone-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-stone-800 transition-all shadow-lg shadow-stone-900/10"
        >
          <Plus className="w-4 h-4" />
          Nuovo Evento
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Events List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest ml-1">Eventi in Programma</h3>
          {filteredEvents.length > 0 ? filteredEvents.map((event) => (
            <div 
              key={event.id}
              onClick={() => setSelectedEventId(event.id)}
              className={`p-6 rounded-2xl border transition-all cursor-pointer group ${selectedEventId === event.id ? 'bg-stone-900 border-stone-900 text-white shadow-xl' : 'bg-white border-stone-100 hover:border-stone-300'}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedEventId === event.id ? 'bg-white/10' : 'bg-stone-100'}`}>
                    <Star className={`w-6 h-6 ${selectedEventId === event.id ? 'text-amber-400' : 'text-stone-400'}`} />
                  </div>
                  <div>
                    <h4 className="font-serif text-lg mb-1">{event.title}</h4>
                    <div className={`flex items-center gap-4 text-xs ${selectedEventId === event.id ? 'text-stone-400' : 'text-stone-500'}`}>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(event.date).toLocaleDateString('it-IT')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {event.soldTickets} / {event.totalTickets}
                      </span>
                      <span className="font-bold">€ {event.price.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleEditEvent(event); }}
                    className={`p-2 rounded-lg transition-colors ${selectedEventId === event.id ? 'hover:bg-white/10 text-white' : 'hover:bg-stone-100 text-stone-400 hover:text-stone-900'}`}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDeleteEvent(event); }}
                    className={`p-2 rounded-lg transition-colors ${selectedEventId === event.id ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-50 text-red-400'}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )) : (
            <div className="text-center py-12 bg-stone-50 rounded-3xl border border-dashed border-stone-200">
              <Ticket className="w-12 h-12 text-stone-200 mx-auto mb-4" />
              <p className="text-stone-400 italic">Nessun evento creato.</p>
            </div>
          )}
        </div>

        {/* Bookings for Selected Event */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest ml-1">Prenotazioni Ricevute</h3>
          {selectedEventId ? (
            <div className="bg-stone-50 rounded-3xl p-6 border border-stone-100 min-h-[400px]">
              {eventBookings.length > 0 ? (
                <div className="space-y-3">
                  {eventBookings.map((booking) => (
                    <div key={booking.id} className="bg-white p-4 rounded-xl border border-stone-100 shadow-sm group">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-stone-900 text-sm">{booking.name}</p>
                          <p className="text-[10px] text-stone-500 uppercase tracking-widest">{booking.ticketNumber}</p>
                          <p className="text-[10px] text-stone-400 mt-1">{booking.email}</p>
                        </div>
                        <button 
                          onClick={() => onDeleteBooking(booking)}
                          className="p-1.5 text-stone-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <Users className="w-10 h-10 text-stone-200 mb-4" />
                  <p className="text-stone-400 text-xs italic">Nessuna prenotazione per questo evento.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-stone-50 rounded-3xl p-6 border border-dashed border-stone-200 flex flex-col items-center justify-center text-center h-[400px]">
              <ChevronRight className="w-8 h-8 text-stone-200 mb-2" />
              <p className="text-stone-400 text-xs italic">Seleziona un evento per vedere le prenotazioni.</p>
            </div>
          )}
        </div>
      </div>

      {/* Event Edit Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-serif text-stone-900">{editingEvent.id ? 'Modifica Evento' : 'Nuovo Evento'}</h3>
              <button onClick={() => setShowEventModal(false)} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
                <XCircle className="w-6 h-6 text-stone-400" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              onAddEvent(editingEvent);
              setShowEventModal(false);
            }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">Immagine Evento</label>
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 bg-stone-100 rounded-2xl overflow-hidden border border-stone-200 flex items-center justify-center">
                      {(editingEvent.image || imageFile) ? (
                        <img 
                          src={imageFile ? URL.createObjectURL(imageFile) : editingEvent.image} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-stone-300" />
                      )}
                    </div>
                    <div className="flex-1">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => onImageChange(e.target.files?.[0] || null)}
                        className="hidden" 
                        id="event-image-upload"
                      />
                      <label 
                        htmlFor="event-image-upload"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-xl text-sm font-bold text-stone-900 hover:bg-stone-50 cursor-pointer transition-all"
                      >
                        <Upload className="w-4 h-4" />
                        {editingEvent.image || imageFile ? 'Cambia Immagine' : 'Carica Immagine'}
                      </label>
                      <p className="text-[10px] text-stone-400 mt-2">JPG, PNG o WebP. Max 5MB.</p>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">Titolo Evento</label>
                  <input 
                    required
                    value={editingEvent.title}
                    onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-100 rounded-xl text-sm focus:ring-2 focus:ring-stone-900 outline-none transition-all"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">Descrizione</label>
                  <textarea 
                    required
                    rows={3}
                    value={editingEvent.description}
                    onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-100 rounded-xl text-sm focus:ring-2 focus:ring-stone-900 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">Data</label>
                  <input 
                    required
                    type="date"
                    value={editingEvent.date}
                    onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-100 rounded-xl text-sm focus:ring-2 focus:ring-stone-900 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">Ora</label>
                  <input 
                    required
                    type="time"
                    value={editingEvent.time}
                    onChange={(e) => setEditingEvent({ ...editingEvent, time: e.target.value })}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-100 rounded-xl text-sm focus:ring-2 focus:ring-stone-900 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">Luogo</label>
                  <input 
                    required
                    value={editingEvent.location}
                    onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-100 rounded-xl text-sm focus:ring-2 focus:ring-stone-900 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">Prezzo Biglietto (€)</label>
                  <input 
                    required
                    type="number"
                    step="0.01"
                    value={editingEvent.price}
                    onChange={(e) => setEditingEvent({ ...editingEvent, price: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-100 rounded-xl text-sm focus:ring-2 focus:ring-stone-900 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">Posti Totali</label>
                  <input 
                    required
                    type="number"
                    value={editingEvent.totalTickets}
                    onChange={(e) => setEditingEvent({ ...editingEvent, totalTickets: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-100 rounded-xl text-sm focus:ring-2 focus:ring-stone-900 outline-none transition-all"
                  />
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <input 
                    type="checkbox"
                    id="showOnHomepage"
                    checked={editingEvent.showOnHomepage}
                    onChange={(e) => setEditingEvent({ ...editingEvent, showOnHomepage: e.target.checked })}
                    className="w-5 h-5 rounded-lg border-stone-200 text-stone-900 focus:ring-stone-900"
                  />
                  <label htmlFor="showOnHomepage" className="text-sm font-medium text-stone-700">Mostra in Homepage</label>
                </div>
              </div>

              <div className="pt-8 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="flex-1 py-4 rounded-xl font-bold text-stone-500 hover:bg-stone-50 transition-all"
                >
                  Annulla
                </button>
                <button 
                  disabled={isSaving}
                  type="submit"
                  className="flex-1 py-4 bg-stone-900 text-white rounded-xl font-bold hover:bg-stone-800 transition-all shadow-lg shadow-stone-900/20 flex items-center justify-center gap-2"
                >
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingEvent.id ? 'Aggiorna Evento' : 'Crea Evento')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
