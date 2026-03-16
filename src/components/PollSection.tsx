import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Vote, Send, CheckCircle2, Phone, Mail } from 'lucide-react';

interface PollOption {
  id: number;
  text: string;
}

interface Poll {
  id: number;
  active: boolean;
  showOnHomepage: boolean;
  question: string;
  options: PollOption[];
  votes: any[];
}

export function PollSection() {
  const [poll, setPoll] = React.useState<Poll | null>(null);
  const [showVoteModal, setShowVoteModal] = React.useState(false);
  const [selectedOption, setSelectedOption] = React.useState<PollOption | null>(null);
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [voted, setVoted] = React.useState(false);

  React.useEffect(() => {
    const fetchPoll = async () => {
      try {
        const response = await fetch('/api/polls');
        const data = await response.json();
        if (data.length > 0) {
          // Find the poll specifically marked for the homepage
          const homepagePoll = data.find((p: any) => p.showOnHomepage);
          setPoll(homepagePoll || null);
        }
      } catch (error) {
        console.error('Error fetching poll:', error);
      }
    };
    fetchPoll();
  }, []);

  const handleVote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!poll || !selectedOption) return;

    try {
      const optionIndex = poll.options.findIndex(o => o.id === selectedOption.id);
      await fetch(`/api/polls/${poll.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionIndex, email, phone })
      });

      setVoted(true);
      
      setTimeout(() => {
        setShowVoteModal(false);
        setVoted(false);
        setEmail('');
        setPhone('');
        setSelectedOption(null);
      }, 2000);
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  if (!poll || !poll.showOnHomepage) return null;

  return (
    <section className="py-24 bg-stone-900 overflow-hidden relative">
      {/* Decorative background */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-white blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-white blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block text-stone-400 uppercase tracking-[0.3em] text-xs font-bold mb-6">
              La tua opinione conta
            </span>
            <h2 className="text-4xl md:text-5xl font-serif text-white mb-8 leading-tight">
              Partecipa al nostro <br />
              <span className="italic text-stone-300">Sondaggio</span>
            </h2>
            <p className="text-stone-400 text-lg mb-8 max-w-md font-light">
              Aiutaci a migliorare le nostre attività e a rendere San Felice un posto migliore per tutti.
            </p>
            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                <Vote className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">Votazione Pubblica</p>
                <p className="text-stone-500 text-xs uppercase tracking-widest">Aperta a tutti i cittadini</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl relative"
          >
            <h3 className="text-2xl font-serif text-stone-900 mb-8 text-center">
              {poll.question}
            </h3>

            <div className="space-y-4">
              {poll.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => {
                    setSelectedOption(option);
                    setShowVoteModal(true);
                  }}
                  className="w-full group relative flex items-center justify-between p-5 rounded-2xl border border-stone-100 hover:border-stone-900 hover:bg-stone-50 transition-all text-left"
                >
                  <span className="font-medium text-stone-700 group-hover:text-stone-900 transition-colors">
                    {option.text}
                  </span>
                  <div className="w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center group-hover:bg-stone-900 group-hover:border-stone-900 transition-all">
                    <div className="w-2 h-2 rounded-full bg-stone-200 group-hover:bg-white transition-all" />
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Vote Modal */}
      <AnimatePresence>
        {showVoteModal && (
          <div className="fixed inset-0 flex items-center justify-center z-[100] p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-stone-900/80 backdrop-blur-md"
              onClick={() => !voted && setShowVoteModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl max-w-md w-full overflow-hidden"
            >
              {/* Close Button - Ensuring it's visible and high z-index */}
              <button
                onClick={() => setShowVoteModal(false)}
                className="absolute top-6 right-6 text-stone-400 hover:text-stone-900 transition-colors z-[110] p-2 hover:bg-stone-100 rounded-full"
                aria-label="Chiudi"
              >
                <X className="w-6 h-6" />
              </button>

              {voted ? (
                <div className="text-center py-12">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <CheckCircle2 className="w-10 h-10" />
                  </motion.div>
                  <h3 className="text-2xl font-serif text-stone-900 mb-2">Grazie per il tuo voto!</h3>
                  <p className="text-stone-500">La tua opinione è stata registrata con successo.</p>
                </div>
              ) : (
                <>
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-stone-100 rounded-2xl mb-4">
                      <Vote className="w-8 h-8 text-stone-900" />
                    </div>
                    <h3 className="text-2xl font-serif text-stone-900">Conferma il tuo voto</h3>
                    <p className="text-stone-500 text-sm mt-2">
                      Hai scelto: <span className="font-bold text-stone-900">"{selectedOption?.text}"</span>
                    </p>
                  </div>

                  <form onSubmit={handleVote} className="space-y-5">
                    <div className="relative">
                      <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-12 pr-4 py-4 rounded-2xl border border-stone-200 focus:ring-2 focus:ring-stone-900 outline-none transition-all text-sm"
                          placeholder="la-tua@email.it"
                        />
                      </div>
                    </div>

                    <div className="relative">
                      <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">Cellulare</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full pl-12 pr-4 py-4 rounded-2xl border border-stone-200 focus:ring-2 focus:ring-stone-900 outline-none transition-all text-sm"
                          placeholder="+39 333 1234567"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-stone-900 text-white py-5 rounded-2xl font-bold hover:bg-stone-800 transition-all flex items-center justify-center gap-3 shadow-xl shadow-stone-900/20 mt-4"
                    >
                      Invia il mio voto
                      <Send className="w-4 h-4" />
                    </button>
                    
                    <p className="text-[10px] text-stone-400 text-center leading-relaxed px-4">
                      Partecipando al sondaggio accetti il trattamento dei dati personali secondo la nostra privacy policy.
                    </p>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
