import React from 'react';
import { motion } from 'motion/react';
import { Vote, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';

interface PollOption {
  id: number;
  text: string;
  votes: number;
}

interface Poll {
  id: number;
  question: string;
  options: PollOption[];
  totalVotes: number;
  active: boolean;
  showOnHomepage: boolean;
  endDate?: string;
  type: 'poll' | 'election';
}

export function PollSection() {
  const [polls, setPolls] = React.useState<Poll[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchPolls = async () => {
      try {
        const response = await fetch('/api/polls');
        if (response.ok) {
          const data = await response.json();
          // Only show active polls marked for homepage and of type 'poll'
          setPolls(data.filter((p: Poll) => p.active && p.showOnHomepage && p.type === 'poll'));
        }
      } catch (error) {
        console.error('Error fetching polls:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPolls();
  }, []);

  if (isLoading) {
    return (
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-stone-300 mx-auto" />
        </div>
      </section>
    );
  }

  if (polls.length === 0) return null;

  return (
    <section className="py-24 bg-white overflow-hidden" id="sondaggi">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.3em] mb-4 block">Consultazioni Soci</span>
            <h2 className="text-4xl md:text-5xl font-serif text-stone-900 leading-tight">
              La tua opinione <br />
              <span className="text-stone-400 italic">conta per noi</span>
            </h2>
          </motion.div>
          <motion.p 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-stone-500 max-w-md text-lg"
          >
            Partecipa ai sondaggi attivi dell'associazione. Le votazioni sono riservate esclusivamente ai soci registrati.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {polls.map((poll, index) => (
            <motion.div
              key={poll.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative bg-stone-50 rounded-[3rem] p-10 md:p-12 border border-stone-100 hover:bg-stone-900 hover:border-stone-900 transition-all duration-500"
            >
              <div className="flex justify-between items-start mb-8">
                <div className="w-14 h-14 bg-white text-stone-900 rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-white/10 group-hover:text-white transition-all">
                  <Vote className="w-7 h-7" />
                </div>
                <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-wider group-hover:bg-emerald-500 group-hover:text-white transition-all">
                  Votazione Aperta
                </span>
              </div>

              <h3 className="text-2xl md:text-3xl font-serif text-stone-900 mb-6 leading-tight group-hover:text-white transition-colors">
                {poll.question}
              </h3>

              <div className="space-y-4 mb-10">
                {poll.options.map((option) => (
                  <div key={option.id} className="flex items-center gap-3 text-stone-500 group-hover:text-stone-400 transition-colors">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm font-medium">{option.text}</span>
                  </div>
                ))}
              </div>

              <div className="pt-8 border-t border-stone-200 group-hover:border-white/10 flex items-center justify-between">
                <div className="text-stone-400 group-hover:text-stone-500">
                  <p className="text-[10px] font-bold uppercase tracking-widest">Partecipanti</p>
                  <p className="text-lg font-serif text-stone-900 group-hover:text-white">{poll.totalVotes}</p>
                </div>
                <a
                  href={`/vota/${poll.id}`}
                  className="inline-flex items-center gap-3 bg-stone-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-stone-800 group-hover:bg-white group-hover:text-stone-900 transition-all shadow-xl shadow-stone-900/10 group-hover:shadow-white/10"
                >
                  Vota Ora
                  <ArrowRight className="w-5 h-5" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
