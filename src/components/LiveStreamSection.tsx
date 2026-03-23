import React from 'react';
import { motion } from 'motion/react';
import { Radio, ExternalLink, Smartphone, Video } from 'lucide-react';

export function LiveStreamSection() {
  const [liveStream, setLiveStream] = React.useState<any>(null);

  React.useEffect(() => {
    const fetchLiveStream = async () => {
      try {
        const response = await fetch('/api/settings/live_stream');
        const data = await response.json();
        if (data.value) {
          setLiveStream(data.value);
        }
      } catch (error) {
        console.error('Error fetching live stream:', error);
      }
    };
    fetchLiveStream();
  }, []);

  if (!liveStream || !liveStream.active || !liveStream.url) return null;

  const isYouTube = liveStream.url.includes('youtube.com') || liveStream.url.includes('youtu.be');
  const isFacebook = liveStream.url.includes('facebook.com');
  const isStreamYard = liveStream.url.includes('streamyard.com/on-air');

  const getStreamYardEmbed = (url: string) => {
    // Convert https://streamyard.com/on-air/ABC123XYZ to https://streamyard.com/on-air/ABC123XYZ/embed
    const cleanUrl = url.split('?')[0].replace(/\/$/, '');
    if (cleanUrl.endsWith('/embed')) return cleanUrl;
    return `${cleanUrl}/embed`;
  };

  return (
    <section className="py-24 bg-stone-900 overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-600/20 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-full text-xs font-bold uppercase tracking-widest mb-6 animate-pulse"
            >
              <Radio className="w-4 h-4" />
              Live Ora
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-serif text-white mb-6">Segui la nostra Diretta Live</h2>
            <p className="text-stone-400 text-lg mb-8 max-w-xl">
              Non perderti nemmeno un momento dei nostri eventi. Guarda lo streaming in tempo reale direttamente dal tuo dispositivo.
            </p>
            
            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
              <div className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                <Smartphone className="w-5 h-5 text-amber-500" />
                <span className="text-stone-300 text-sm">Ottimizzato per Mobile</span>
              </div>
              <div className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                <Video className="w-5 h-5 text-amber-500" />
                <span className="text-stone-300 text-sm">Qualità HD</span>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="relative aspect-video bg-black rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 group"
            >
              {isYouTube ? (
                <iframe
                  src={`https://www.youtube.com/embed/${liveStream.url.includes('youtu.be') ? liveStream.url.split('/').pop()?.split('?')[0] : liveStream.url.split('v=')[1]?.split('&')[0]}?autoplay=1&mute=1`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : isFacebook ? (
                <iframe 
                  src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(liveStream.url)}&show_text=0&width=560`} 
                  className="w-full h-full"
                  style={{ border: 'none', overflow: 'hidden' }} 
                  allowFullScreen={true} 
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                />
              ) : isStreamYard ? (
                <iframe
                  src={getStreamYardEmbed(liveStream.url)}
                  className="w-full h-full"
                  allow="camera; microphone; autoplay; encrypted-media; fullscreen; display-capture"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-center p-8">
                  <Video className="w-16 h-16 text-stone-700 mb-4" />
                  <p className="text-stone-400 mb-6">Streaming esterno attivo</p>
                  <a 
                    href={liveStream.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-8 py-3 bg-amber-500 text-stone-900 rounded-xl font-bold uppercase tracking-widest hover:bg-amber-400 transition-all flex items-center gap-2"
                  >
                    Guarda la Diretta <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
