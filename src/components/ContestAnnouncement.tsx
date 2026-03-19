import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Calendar, Euro, ArrowRight, X } from 'lucide-react';

interface ContestAnnouncementProps {
  onRegisterClick: (contest: any) => void;
}

export const ContestAnnouncement: React.FC<ContestAnnouncementProps> = ({ onRegisterClick }) => {
  const [contests, setContests] = React.useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    fetch('/api/contests')
      .then(res => res.json())
      .then(data => {
        const activeContests = data.filter((c: any) => c.showOnHomepage);
        setContests(activeContests);
      })
      .catch(err => console.error('Error fetching contests:', err));
  }, []);

  if (!isVisible || contests.length === 0) return null;

  const currentContest = contests[currentIndex];

  return (
    <div className="fixed bottom-8 left-8 z-[90] max-w-sm w-full">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentContest.id}
          initial={{ opacity: 0, x: -50, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -50, scale: 0.9 }}
          className="bg-white rounded-[2rem] shadow-2xl border border-stone-200 overflow-hidden group"
        >
          <button 
            onClick={() => setIsVisible(false)}
            className="absolute top-4 right-4 text-stone-400 hover:text-stone-900 transition-colors z-10 p-1 bg-white/80 backdrop-blur-sm rounded-full"
          >
            <X className="w-4 h-4" />
          </button>

          {currentContest.image && (
            <div className="h-40 overflow-hidden">
              <img 
                src={currentContest.image} 
                alt={currentContest.title} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
            </div>
          )}

          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-stone-100 text-stone-600 text-[10px] font-bold uppercase tracking-widest rounded">
                {currentContest.type}
              </span>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-widest rounded flex items-center gap-1">
                <Trophy className="w-3 h-3" />
                Concorso Aperto
              </span>
            </div>

            <h3 className="text-xl font-serif text-stone-900 leading-tight">
              {currentContest.title}
            </h3>

            <div className="grid grid-cols-2 gap-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">
              <div className="flex items-center gap-2">
                <Calendar className="w-3 h-3" />
                Fine: {new Date(currentContest.endDate).toLocaleDateString('it-IT')}
              </div>
              <div className="flex items-center gap-2">
                <Euro className="w-3 h-3" />
                {currentContest.cost > 0 ? `€ ${currentContest.cost}` : 'Gratuito'}
              </div>
            </div>

            <button
              onClick={() => onRegisterClick(currentContest)}
              className="w-full bg-stone-900 text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-stone-800 transition-all flex items-center justify-center gap-2 group"
            >
              Iscriviti Ora
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {contests.length > 1 && (
            <div className="flex justify-center gap-1 pb-4">
              {contests.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentIndex ? 'bg-stone-900 w-4' : 'bg-stone-200'}`}
                />
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
