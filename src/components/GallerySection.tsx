import React from 'react';
import { motion } from 'motion/react';
import { Play, Maximize2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function GallerySection() {
  const [media, setMedia] = React.useState<any[]>([]);

  React.useEffect(() => {
    const fetchGallery = async () => {
      try {
        const response = await fetch('/api/gallery');
        const data = await response.json();
        // Take only first 4-6 items for preview
        setMedia(data.slice(0, 6));
      } catch (error) {
        console.error('Error fetching gallery:', error);
      }
    };
    fetchGallery();
  }, []);

  if (media.length === 0) return null;

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="text-center md:text-left">
            <h2 className="text-sm uppercase tracking-widest text-stone-500 font-semibold mb-2">I Nostri Ricordi</h2>
            <h3 className="text-4xl font-serif text-stone-900">Foto & Video Gallery</h3>
          </div>
          <Link 
            to="/gallery" 
            className="group inline-flex items-center gap-2 px-8 py-4 bg-stone-900 text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-stone-800 transition-all shadow-lg hover:shadow-xl self-center md:self-auto"
          >
            Esplora la Gallery <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {media.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              viewport={{ once: true }}
              className="relative rounded-2xl overflow-hidden group cursor-pointer aspect-square shadow-sm hover:shadow-xl transition-all duration-500 border border-stone-100"
            >
              {item.type === 'video' ? (
                <div className="w-full h-full bg-stone-100 flex items-center justify-center relative group">
                  {(item.url.includes('youtube.com') || item.url.includes('youtu.be')) && (
                    <img
                      src={`https://img.youtube.com/vi/${item.url.includes('youtu.be') ? item.url.split('/').pop()?.split('?')[0] : item.url.split('v=')[1]?.split('&')[0]}/maxresdefault.jpg`}
                      alt={`Video thumbnail ${item.id}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=800';
                      }}
                    />
                  )}
                  {!(item.url.includes('youtube.com') || item.url.includes('youtu.be')) && (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-stone-900 text-white/50 group-hover:bg-stone-800 transition-colors">
                      <Play className="w-12 h-12 mb-2 opacity-50" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Video Locale</span>
                    </div>
                  )}
                </div>
              ) : (
                item.url && (
                  <img
                    src={item.url}
                    alt={`Gallery item ${item.id}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                )
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <Link to="/gallery" className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 self-center mb-auto mt-auto transform scale-50 group-hover:scale-100 transition-transform duration-300">
                  <Maximize2 className="w-5 h-5 text-white" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
