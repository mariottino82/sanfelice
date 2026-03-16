import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, X, Download, Maximize2 } from 'lucide-react';

export function Gallery() {
  const [media, setMedia] = React.useState<any[]>([]);
  const [selectedItem, setSelectedItem] = React.useState<any>(null);

  React.useEffect(() => {
    const savedGallery = localStorage.getItem('gallery');
    if (savedGallery) {
      setMedia(JSON.parse(savedGallery));
    } else {
      // Fallback to default if nothing in localStorage
      const defaultMedia = [
        { id: 1, type: 'image', url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800' },
        { id: 2, type: 'image', url: 'https://images.unsplash.com/photo-1472653431158-6364773b2a56?auto=format&fit=crop&q=80&w=800' },
        { id: 3, type: 'video', url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800' },
        { id: 4, type: 'image', url: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=800' },
        { id: 5, type: 'image', url: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&q=80&w=800' },
        { id: 6, type: 'video', url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=800' },
      ];
      setMedia(defaultMedia);
    }
  }, []);

  const handleDownload = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `pro-san-felice-gallery-${Date.now()}.${blob.type.split('/')[1] || 'jpg'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: open in new tab if fetch fails due to CORS
      window.open(url, '_blank');
    }
  };

  return (
    <section id="gallery" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-sm uppercase tracking-widest text-stone-500 font-semibold mb-2">I Nostri Ricordi</h2>
          <h3 className="text-4xl font-serif text-stone-900">Foto & Video Gallery</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {media.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              viewport={{ once: true }}
              onClick={() => setSelectedItem(item)}
              className="relative aspect-square rounded-2xl overflow-hidden group cursor-pointer"
            >
              <img
                src={item.url}
                alt={`Gallery item ${item.id}`}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                {item.type === 'video' ? (
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
                    <Play className="w-6 h-6 text-white fill-white" />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Maximize2 className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/95 backdrop-blur-sm"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute -top-12 right-0 text-white hover:text-stone-300 transition-colors"
              >
                <X className="w-8 h-8" />
              </button>

              <div className="w-full h-full rounded-2xl overflow-hidden bg-stone-900 flex items-center justify-center shadow-2xl border border-white/10">
                {selectedItem.type === 'video' ? (
                  <div className="relative w-full aspect-video">
                    {/* Assuming YouTube/Vimeo or direct URL. For demo we just show the image with a play button if it's not a real video URL */}
                    {selectedItem.url.includes('youtube.com') || selectedItem.url.includes('youtu.be') ? (
                      <iframe
                        src={selectedItem.url.replace('watch?v=', 'embed/')}
                        className="w-full h-full"
                        allowFullScreen
                      />
                    ) : (
                      <img
                        src={selectedItem.url}
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    )}
                  </div>
                ) : (
                  <img
                    src={selectedItem.url}
                    alt="Gallery item"
                    className="max-w-full max-h-[80vh] object-contain"
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>

              <div className="mt-6 flex gap-4">
                <button
                  onClick={() => handleDownload(selectedItem.url)}
                  className="flex items-center gap-2 px-6 py-3 bg-white text-stone-900 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-stone-100 transition-colors shadow-lg"
                >
                  <Download className="w-4 h-4" />
                  Scarica {selectedItem.type === 'video' ? 'Video' : 'Foto'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
