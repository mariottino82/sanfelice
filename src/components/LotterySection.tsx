import React from 'react';
import { motion } from 'motion/react';
import { Gift, Ticket, Calendar, Trophy, CheckCircle2 } from 'lucide-react';

export function LotterySection() {
  const [lottery, setLottery] = React.useState<any>(null);

  React.useEffect(() => {
    const fetchLottery = async () => {
      try {
        const response = await fetch('/api/lottery');
        if (response.ok) {
          const data = await response.json();
          
          if (Number(data.showOnHomepage) === 1 || data.showOnHomepage === true) {
            setLottery(data);
          } else {
            setLottery(null);
          }
        }
      } catch (error) {
        console.error('Error fetching lottery:', error);
      }
    };
    fetchLottery();
  }, []);

  if (!lottery) return null;

  const isDrawPassed = lottery.drawDate && new Date(lottery.drawDate) <= new Date();

  return (
    <section id="lottery" className="py-24 bg-stone-50 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-widest mb-4"
          >
            <Ticket className="w-4 h-4" />
            {lottery.name || 'Lotteria Pro San Felice'}
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-serif text-stone-900 mb-4">
            {isDrawPassed ? 'Risultati Estrazione' : 'Premi in Palio'}
          </h2>
          <p className="text-stone-600 max-w-2xl mx-auto flex items-center justify-center gap-2">
            <Calendar className="w-4 h-4" />
            Data Estrazione: <span className="font-bold">{lottery.drawDate ? new Date(lottery.drawDate).toLocaleDateString('it-IT') : 'Da definire'}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {lottery.prizes.map((prize: any, index: number) => (
            <motion.div
              key={prize.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-8 rounded-3xl shadow-sm border border-stone-200 relative group hover:shadow-xl transition-all duration-500"
            >
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-stone-900 text-white rounded-2xl flex items-center justify-center font-serif text-xl font-bold shadow-lg group-hover:rotate-12 transition-transform">
                {index + 1}°
              </div>
              
              <div className="mb-6">
                <div className="w-14 h-14 bg-stone-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-amber-50 transition-colors">
                  <Gift className="w-8 h-8 text-stone-400 group-hover:text-amber-500 transition-colors" />
                </div>
                <h3 className="text-xl font-serif text-stone-900 mb-2">{prize.name}</h3>
              </div>

              {isDrawPassed && prize.winningNumber ? (
                <div className="mt-6 pt-6 border-t border-stone-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">N. Vincente</span>
                    <span className="text-2xl font-mono font-bold text-emerald-600 bg-emerald-50 px-4 py-1 rounded-xl">
                      {prize.winningNumber}
                    </span>
                  </div>
                  {prize.collectedBy && (
                    <div className="flex items-center gap-2 text-stone-500 text-sm italic">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Premio ritirato
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-6 pt-6 border-t border-stone-100">
                  <p className="text-stone-400 text-sm italic">In attesa dell'estrazione...</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {isDrawPassed && (
          <div className="mt-16 p-8 bg-stone-900 rounded-3xl text-white text-center">
            <Trophy className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-2xl font-serif mb-2">Congratulazioni ai vincitori!</h3>
            <p className="text-stone-400 text-sm max-w-lg mx-auto">
              I premi possono essere ritirati presso la nostra sede entro 30 giorni dall'estrazione presentando il biglietto vincente.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
