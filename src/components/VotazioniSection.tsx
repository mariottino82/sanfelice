import React from 'react';
import { motion } from 'motion/react';
import { Vote, CheckCircle2, XCircle, ArrowRight, Loader2, Lock } from 'lucide-react';
import { toast } from 'sonner';

interface PollOption {
  id: number;
  text: string;
  votes: number;
}

interface Poll {
  id: number;
  question: string;
  options: PollOption[];
  votes: string[]; // Array of emails
  totalVotes: number;
  active: boolean;
  showOnHomepage: boolean;
  endDate?: string;
  type: 'poll' | 'election';
}

export function VotazioniSection({ user }: { user: any }) {
  const [elections, setElections] = React.useState<Poll[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchElections = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/polls');
      if (response.ok) {
        const data = await response.json();
        // Filter for internal elections (type === 'election')
        setElections(data.filter((p: Poll) => p.type === 'election'));
      }
    } catch (error) {
      console.error('Error fetching elections:', error);
      toast.error('Errore nel caricamento delle votazioni');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchElections();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-serif text-stone-900">Votazioni Interne</h2>
          <p className="text-stone-500 text-sm mt-2">Partecipa alle consultazioni riservate ai soci dell'associazione.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-xl text-xs font-bold uppercase tracking-wider border border-purple-100">
          <Lock className="w-4 h-4" />
          Area Riservata
        </div>
      </div>

      {elections.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-[2.5rem] border border-stone-100">
          <div className="w-16 h-16 bg-stone-50 text-stone-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Vote className="w-8 h-8" />
          </div>
          <p className="text-stone-400 font-medium">Non ci sono votazioni interne attive al momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {elections.map((election) => {
            const hasVoted = user && election.votes.includes(user.email);
            const isExpired = election.endDate && new Date(election.endDate) < new Date();
            const showResults = !election.active || isExpired;
            
            return (
              <motion.div
                key={election.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
              >
                {/* Status Badge */}
                <div className="flex justify-between items-start mb-6">
                  {election.active ? (
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Aperta
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-stone-100 text-stone-500 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      <XCircle className="w-3.5 h-3.5" /> Chiusa
                    </span>
                  )}
                  {hasVoted && (
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      Già Votato
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-serif text-stone-900 mb-4 leading-tight">
                  {election.question}
                </h3>

                {election.endDate && (
                  <p className="text-stone-400 text-[10px] font-bold uppercase tracking-widest mb-6">
                    Scade il: {new Date(election.endDate).toLocaleDateString('it-IT')}
                  </p>
                )}

                <div className="space-y-3 mb-8">
                  {election.options.map((option) => {
                    const percentage = election.totalVotes > 0 ? Math.round((option.votes / election.totalVotes) * 100) : 0;
                    return (
                      <div key={option.id} className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                          <span className="text-stone-600">{option.text}</span>
                          {showResults && <span className="text-stone-900">{percentage}%</span>}
                        </div>
                        {showResults && (
                          <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-stone-900 transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-stone-50">
                  <div className="text-stone-400">
                    <p className="text-[10px] font-bold uppercase tracking-widest">Partecipanti</p>
                    <p className="text-lg font-serif text-stone-900">{election.totalVotes}</p>
                  </div>
                  
                  {election.active && !hasVoted ? (
                    <a
                      href={`/vota/${election.id}`}
                      className="inline-flex items-center gap-2 bg-stone-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-stone-800 transition-all shadow-lg shadow-stone-900/10"
                    >
                      Vota Ora
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  ) : (
                    <button
                      disabled
                      className="inline-flex items-center gap-2 bg-stone-100 text-stone-400 px-6 py-3 rounded-xl font-bold cursor-not-allowed"
                    >
                      {hasVoted ? 'Voto Registrato' : 'Votazione Chiusa'}
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
