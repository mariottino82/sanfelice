import React from 'react';
import { motion } from 'motion/react';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';

export function NewsEvents({ onNewsClick }: { onNewsClick: (news: any) => void }) {
  const [news, setNews] = React.useState<any[]>([]);

  React.useEffect(() => {
    const savedNews = localStorage.getItem('news');
    if (savedNews) {
      setNews(JSON.parse(savedNews));
    }
  }, []);

  const displayNews = news.length > 0 
    ? [...news].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) 
    : [
    {
      id: 1,
      title: "Festa Patronale di San Felice",
      date: "2024-05-15",
      category: "evento",
      content: "La tradizionale festa con processione, musica dal vivo e stand gastronomici. Un momento di unione per tutta la comunità.",
      imageUrl: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: 2,
      title: "Sagra d'Estate",
      date: "2024-07-20",
      category: "evento",
      content: "Una serata dedicata ai sapori del territorio e alla convivialità. Degustazioni di prodotti tipici e musica popolare.",
      imageUrl: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: 3,
      title: "Assemblea dei Soci",
      date: "2024-12-22",
      category: "news",
      content: "Si terrà l'assemblea annuale per il rinnovo delle cariche e la presentazione del bilancio. Partecipazione caldamente consigliata.",
      imageUrl: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=800"
    }
  ];

  return (
    <section id="news" className="py-24 bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-sm uppercase tracking-widest text-stone-500 font-semibold mb-2">Prossimi Appuntamenti</h2>
            <h3 className="text-4xl font-serif text-stone-900">News & Eventi</h3>
          </div>
          <button className="text-stone-900 font-medium hover:underline underline-offset-4">
            Vedi tutti
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {displayNews.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              onClick={() => onNewsClick(item)}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group cursor-pointer"
            >
              <div className="h-48 overflow-hidden relative">
                <img
                  src={item.imageUrl || 'https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&q=80&w=800'}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg ${
                    item.category === 'evento' ? 'bg-amber-500 text-white' : 'bg-stone-900 text-white'
                  }`}>
                    {item.category}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 text-sm text-stone-500 mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(item.date).toLocaleDateString('it-IT')}
                  </span>
                </div>
                <h4 className="text-xl font-serif text-stone-900 mb-2">{item.title}</h4>
                <p className="text-stone-600 text-sm leading-relaxed line-clamp-3 mb-6">
                  {item.content}
                </p>
                <div className="flex items-center gap-2 text-stone-900 font-bold text-xs uppercase tracking-widest group-hover:gap-4 transition-all">
                  Leggi di più <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
