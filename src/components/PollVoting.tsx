import React from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Vote, CheckCircle2, AlertCircle, Loader2, ArrowLeft, LogIn, Mail, Lock, Send, User } from 'lucide-react';
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
  votes: string[];
  totalVotes: number;
  active: boolean;
  endDate?: string;
  type: 'poll' | 'election';
}

export function PollVoting() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const navigate = useNavigate();
  const [poll, setPoll] = React.useState<Poll | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedOptionIndex, setSelectedOptionIndex] = React.useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [hasVoted, setHasVoted] = React.useState(false);
  const [tokenMemberName, setTokenMemberName] = React.useState<string | null>(null);
  
  // Auth state
  const [user, setUser] = React.useState<any>(() => {
    const saved = localStorage.getItem('session_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loginData, setLoginData] = React.useState({ username: '', password: '' });
  const [isLoggingIn, setIsLoggingIn] = React.useState(false);

  const fetchPoll = React.useCallback(async () => {
    setIsLoading(true);
    try {
      if (token) {
        const response = await fetch(`/api/polls/${id}/token-info/${token}`);
        if (response.ok) {
          const data = await response.json();
          setPoll(data.poll);
          setTokenMemberName(data.memberName);
        } else {
          const data = await response.json();
          setError(data.error || 'Link di voto non valido o già utilizzato');
        }
      } else {
        const response = await fetch(`/api/polls/${id}`);
        if (response.ok) {
          const data = await response.json();
          setPoll(data);
          
          // Check if user already voted
          const userIdentifier = user?.email || user?.username;
          if (userIdentifier && data.votes && Array.isArray(data.votes) && data.votes.includes(userIdentifier)) {
            setHasVoted(true);
          }
        } else {
          setError('Sondaggio non trovato o non più attivo');
        }
      }
    } catch (error) {
      console.error('Error fetching poll:', error);
      setError('Errore di connessione');
    } finally {
      setIsLoading(false);
    }
  }, [id, user, token]);

  React.useEffect(() => {
    fetchPoll();
  }, [fetchPoll]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });
      const data = await response.json();
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('session_user', JSON.stringify(data.user));
        toast.success('Accesso effettuato');
      } else {
        toast.error(data.message || 'Credenziali errate');
      }
    } catch (error) {
      toast.error('Errore durante il login');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleVote = async () => {
    if (selectedOptionIndex === null || !poll) return;
    if (!token && !user) return;

    setIsSubmitting(true);
    try {
      const url = token ? `/api/polls/${poll.id}/vote-with-token` : `/api/polls/${poll.id}/vote`;
      const body = token 
        ? { token, optionIndex: selectedOptionIndex }
        : { optionIndex: selectedOptionIndex, email: user.email || user.username };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        setHasVoted(true);
        toast.success('Voto registrato con successo!');
        if (!token) fetchPoll(); // Refresh to show results if logged in
      } else {
        const data = await response.json();
        toast.error(data.error || 'Errore durante la votazione');
      }
    } catch (error) {
      toast.error('Errore di connessione');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <Loader2 className="w-10 h-10 animate-spin text-stone-400" />
      </div>
    );
  }

  if (error || !poll) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-serif text-stone-900 mb-4">Ops!</h2>
          <p className="text-stone-500 mb-8">{error || 'Sondaggio non disponibile'}</p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-stone-900 text-white py-4 rounded-xl font-bold hover:bg-stone-800 transition-all"
          >
            Torna alla Home
          </button>
        </div>
      </div>
    );
  }

  if (!user && !token) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl max-w-md w-full"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-stone-100 rounded-2xl mb-4">
              <LogIn className="w-8 h-8 text-stone-900" />
            </div>
            <h2 className="text-2xl font-serif text-stone-900">Accesso Richiesto</h2>
            <p className="text-stone-500 text-sm mt-2">Accedi per partecipare alla votazione</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
              <input
                type="text"
                required
                value={loginData.username}
                onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-900 outline-none transition-all text-sm"
                placeholder="Email o Username"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
              <input
                type="password"
                required
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-900 outline-none transition-all text-sm"
                placeholder="Password"
              />
            </div>
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-stone-900 text-white py-4 rounded-xl font-bold hover:bg-stone-800 transition-all flex items-center justify-center gap-2"
            >
              {isLoggingIn ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
              Accedi e Vota
            </button>
          </form>
          
          <button
            onClick={() => navigate('/')}
            className="w-full mt-4 text-stone-400 text-sm font-medium hover:text-stone-900 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Torna alla Home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden"
        >
          {/* Decorative element */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-stone-50 rounded-bl-[5rem] -mr-16 -mt-16" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-stone-900 text-white rounded-2xl flex items-center justify-center">
                {poll.type === 'election' ? <Lock className="w-6 h-6" /> : <Vote className="w-6 h-6" />}
              </div>
              <div>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">
                  {poll.type === 'election' ? 'Votazione Interna Soci' : 'Sondaggio Pubblico'}
                </span>
                <h1 className="text-2xl font-serif text-stone-900">
                  {poll.type === 'election' ? 'Esprimi la tua preferenza' : 'La tua opinione conta'}
                </h1>
                {tokenMemberName && (
                  <p className="text-xs text-stone-500 mt-1 flex items-center gap-1">
                    <User className="w-3 h-3" />
                    Votazione per: <span className="font-bold">{tokenMemberName}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="mb-10">
              <h2 className="text-xl md:text-2xl font-serif text-stone-800 leading-tight mb-4">
                {poll.question}
              </h2>
              {poll.endDate && (
                <p className="text-stone-400 text-xs font-medium uppercase tracking-wider">
                  Scade il: {new Date(poll.endDate).toLocaleDateString('it-IT')}
                </p>
              )}
            </div>

            {hasVoted ? (
              <div className="space-y-6">
                <div className="flex items-center gap-3 p-4 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 mb-8">
                  <CheckCircle2 className="w-6 h-6" />
                  <p className="text-sm font-bold uppercase tracking-wide">Il tuo voto è stato registrato in modo anonimo</p>
                </div>
                
                {(!poll.active || (poll.endDate && new Date(poll.endDate) < new Date())) ? (
                  <>
                    <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-4">Risultati Finali</h3>
                    <div className="space-y-4">
                      {poll.options.map((option) => {
                        const percentage = poll.totalVotes > 0 ? Math.round((option.votes / poll.totalVotes) * 100) : 0;
                        return (
                          <div key={option.id} className="space-y-2">
                            <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                              <span className="text-stone-600">{option.text}</span>
                              <span className="text-stone-900">{percentage}%</span>
                            </div>
                            <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full bg-stone-900"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="py-12 text-center bg-stone-50 rounded-3xl border border-stone-100">
                    <div className="w-16 h-16 bg-white text-stone-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Lock className="w-8 h-8" />
                    </div>
                    <p className="text-stone-500 font-medium px-6">
                      I risultati saranno visibili al termine della votazione.
                    </p>
                  </div>
                )}
                
                <div className="pt-8 mt-8 border-t border-stone-100 text-center">
                  <p className="text-stone-400 text-xs italic mb-6">Grazie per aver partecipato alla vita dell'associazione.</p>
                  <button
                    onClick={() => navigate('/')}
                    className="inline-flex items-center gap-2 text-stone-900 font-bold text-sm hover:gap-3 transition-all"
                  >
                    Torna alla Home <ArrowLeft className="w-4 h-4 rotate-180" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3 mb-8">
                  {poll.options.map((option, index) => (
                    <button
                      key={option.id}
                      onClick={() => setSelectedOptionIndex(index)}
                      className={`group relative flex items-center justify-between p-5 rounded-2xl border transition-all text-left ${
                        selectedOptionIndex === index 
                          ? 'border-stone-900 bg-stone-50 shadow-lg shadow-stone-900/5' 
                          : 'border-stone-100 hover:border-stone-300 hover:bg-stone-50/50'
                      }`}
                    >
                      <span className={`font-medium transition-colors ${
                        selectedOptionIndex === index ? 'text-stone-900' : 'text-stone-600'
                      }`}>
                        {option.text}
                      </span>
                      <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                        selectedOptionIndex === index 
                          ? 'bg-stone-900 border-stone-900' 
                          : 'border-stone-200 bg-white'
                      }`}>
                        {selectedOptionIndex === index && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleVote}
                  disabled={selectedOptionIndex === null || isSubmitting}
                  className="w-full bg-stone-900 text-white py-5 rounded-2xl font-bold hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 shadow-xl shadow-stone-900/20"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Registrazione in corso...
                    </>
                  ) : (
                    <>
                      Conferma e Invia Voto
                      <Send className="w-5 h-5" />
                    </>
                  )}
                </button>
                
                <p className="text-[10px] text-stone-400 text-center mt-6 leading-relaxed">
                  Il tuo voto è segreto. Il sistema registra solo che hai partecipato per evitare voti multipli, ma non associa la tua identità alla scelta effettuata.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
