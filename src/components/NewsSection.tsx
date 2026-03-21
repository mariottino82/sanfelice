import React from 'react';
import { motion } from 'motion/react';
import { Newspaper, ArrowRight } from 'lucide-react';

export function NewsSection({ onNewsClick }: { onNewsClick: (news: any) => void }) {
  const [news, setNews] = React.useState<any[]>([]);

  React.useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch('/api/news');
        const data = await response.json();
        // Filter only news category
        setNews(data.filter((item: any) => item.category === 'news'));
      } catch (error) {
        console.error('Error fetching news:', error);
      }
    };
    fetchNews();
  }, []);

  if (news.length === 0) return null;

  return (
    <section id="news" className="py-24 bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-sm uppercase tracking-widest text-stone-500 font-semibold mb-2">Ultime Notizie</h2>
            <h3 className="text-4xl font-serif text-stone-900">News</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {news.map((item, index) => (
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
                  src={item.image || 'https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&q=80&w=800'}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 text-sm text-stone-500 mb-3">
                  <span className="flex items-center gap-1">
                    <Newspaper className="w-4 h-4" />
                    {new Date(item.date).toLocaleDateString('it-IT')}
                  </span>
                </div>
                <h4 className="text-xl font-serif text-stone-900 mb-2">{item.title}</h4>
                <p className="text-stone-600 text-sm leading-relaxed line-clamp-3 mb-6">
                  {item.excerpt || item.content}
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
