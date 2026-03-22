import React from 'react';
import { motion } from 'motion/react';
import { Heart, Loader2, Mail, Calendar, User, Search, Download, Trash2, CheckCircle2, Clock } from 'lucide-react';

export function DonationsManagement() {
  const [donations, setDonations] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isDeleting, setIsDeleting] = React.useState<number | null>(null);

  const fetchDonations = async () => {
    try {
      const response = await fetch('/api/admin/donations');
      const data = await response.json();
      setDonations(data);
    } catch (error) {
      console.error('Error fetching donations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchDonations();
  }, []);

  const deleteDonation = async (id: number) => {
    if (!window.confirm('Sei sicuro di voler eliminare questa donazione?')) return;
    setIsDeleting(id);
    try {
      const response = await fetch(`/api/admin/donations/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setDonations(prev => prev.filter(d => d.id !== id));
      }
    } catch (error) {
      console.error('Error deleting donation:', error);
    } finally {
      setIsDeleting(null);
    }
  };

  const filteredDonations = donations.filter(d => 
    `${d.firstName} ${d.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-serif text-stone-900">Gestione Donazioni</h2>
          <p className="text-stone-500 text-sm">Monitora le offerte libere ricevute tramite il sito.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Cerca donatore..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-stone-900 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-red-500 fill-red-500" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Totale Donazioni</p>
              <p className="text-2xl font-serif text-stone-900">{donations.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-stone-50 rounded-2xl flex items-center justify-center">
              <User className="w-6 h-6 text-stone-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Donatori Unici</p>
              <p className="text-2xl font-serif text-stone-900">
                {new Set(donations.map(d => d.email)).size}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-stone-50 rounded-2xl flex items-center justify-center">
              <Mail className="w-6 h-6 text-stone-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Email Inviate</p>
              <p className="text-2xl font-serif text-stone-900">{donations.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-stone-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200">
                <th className="px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Donatore</th>
                <th className="px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Contatti</th>
                <th className="px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Data & Ora</th>
                <th className="px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Stato</th>
                <th className="px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest text-right">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredDonations.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-stone-400 text-sm">
                    Nessuna donazione trovata.
                  </td>
                </tr>
              ) : (
                filteredDonations.map((donation) => (
                  <tr key={donation.id} className="hover:bg-stone-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-stone-100 rounded-full flex items-center justify-center text-stone-500 font-bold text-xs">
                          {donation.firstName[0]}{donation.lastName[0]}
                        </div>
                        <div className="font-medium text-stone-900">{donation.firstName} {donation.lastName}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-stone-500 text-sm">
                        <Mail className="w-3.5 h-3.5" />
                        {donation.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-stone-500 text-sm">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(donation.date).toLocaleDateString('it-IT', { 
                          day: '2-digit', 
                          month: '2-digit', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-600 border border-amber-100">
                        <Clock className="w-3 h-3" />
                        {donation.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => deleteDonation(donation.id)}
                        disabled={isDeleting === donation.id}
                        className="p-2 text-stone-400 hover:text-red-500 transition-colors disabled:opacity-50"
                        title="Elimina donazione"
                      >
                        {isDeleting === donation.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
