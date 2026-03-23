import React from 'react';
import { motion } from 'motion/react';
import { Newspaper, ArrowLeft, Calendar, Clock, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { SEO } from '../components/SEO';

export function NewsPage({ onNewsClick, onLoginClick, onRegisterClick, onDonationClick }: any) {
  const [news, setNews] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch('/api/news');
        const data = await response.json();
        // Filter only news category
        setNews(data.filter((item: any) => item.category === 'news'));
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-stone-50">
      <SEO 
        title="News - Pro San Felice" 
        description="Resta aggiornato su tutte le novità e le comunicazioni dell'Associazione Pro San Felice."
      />
      <Navbar 
        onLoginClick={onLoginClick} 
        onRegisterClick={onRegisterClick} 
        onDonationClick={onDonationClick}
      />
      
      <main className="pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <Link to="/" className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors mb-6 group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Torna alla Home
            </Link>
            <h1 className="text-5xl font-serif text-stone-900 mb-4">News & Comunicazioni</h1>
            <p className="text-stone-600 max-w-2xl">
              Tutte le ultime novità, gli aggiornamenti e le storie dalla nostra comunità. 
              Resta sempre informato sulle attività dell'Associazione Pro San Felice.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-24">
              <div className="w-12 h-12 border-4 border-stone-200 border-t-stone-900 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {news.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => onNewsClick(item)}
                  className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all group cursor-pointer border border-stone-100"
                >
                  <div className="h-64 overflow-hidden relative">
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&q=80&w=800'}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-stone-900 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">
                        News
                      </span>
                    </div>
                  </div>
                  <div className="p-8">
                    <div className="flex items-center gap-4 text-xs text-stone-400 font-bold uppercase tracking-widest mb-4">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(item.date).toLocaleDateString('it-IT')}
                      </span>
                    </div>
                    <h2 className="text-2xl font-serif text-stone-900 mb-4 group-hover:text-stone-700 transition-colors">{item.title}</h2>
                    <p className="text-stone-600 text-sm leading-relaxed line-clamp-4 mb-8">
                      {item.excerpt || item.content}
                    </p>
                    <div className="flex items-center justify-between pt-6 border-t border-stone-100">
                      <span className="text-stone-900 font-bold text-xs uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all">
                        Leggi l'articolo completo <ArrowLeft className="w-4 h-4 rotate-180" />
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {news.length === 0 && (
                <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border border-dashed border-stone-200">
                  <Newspaper className="w-16 h-16 text-stone-200 mx-auto mb-6" />
                  <p className="text-stone-400 font-serif text-xl">Nessuna news disponibile al momento.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
