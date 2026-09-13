import React, { useEffect, useRef, useState } from 'react';
import { 
  Play, Pause, RotateCcw, Volume2, VolumeX, Maximize2, Minimize2, 
  Tv, Radio, Copy, Check, Download, ExternalLink, ShieldAlert, 
  Info, Sliders, Activity, AlertTriangle, Monitor, Sparkles, Film, Square
} from 'lucide-react';
import { toast } from 'sonner';

const DEFAULT_STREAM_URL = 'http://fls-jkd328ed3.dns-cloud.net/live/PippoBaudo1/PippoBaudo123/374660.ts';

export function NetworkStreamPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<any>(null);

  const [streamUrl, setStreamUrl] = useState(DEFAULT_STREAM_URL);
  const [inputUrl, setInputUrl] = useState(DEFAULT_STREAM_URL);
  const [connectionMode, setConnectionMode] = useState<'proxy' | 'direct'>('proxy');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<'16/9' | '4/3' | 'auto' | 'cover'>('16/9');
  const [stats, setStats] = useState<{
    speedKbps?: number;
    droppedFrames?: number;
    bufferDuration?: number;
    resolution?: string;
  }>({});
  const [streamError, setStreamError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  // Stop and completely detach any existing stream/player
  const stopStream = () => {
    if (playerRef.current) {
      try {
        playerRef.current.pause();
        playerRef.current.unload();
        playerRef.current.detachMediaElement();
        playerRef.current.destroy();
      } catch (e) {
        console.warn('Error destroying player:', e);
      }
      playerRef.current = null;
    }
    if (videoRef.current) {
      try {
        videoRef.current.pause();
        videoRef.current.removeAttribute('src');
        videoRef.current.load();
      } catch (e) {}
    }
    setIsPlaying(false);
    setIsLoading(false);
    setStats({});
  };

  // Initialize and load stream
  const loadStream = async (targetUrl: string, mode: 'proxy' | 'direct') => {
    if (!videoRef.current) return;
    setStreamError(null);
    setIsLoading(true);
    setHasStarted(true);
    stopStream();

    const cleanUrl = targetUrl.trim();
    if (!cleanUrl) {
      setStreamError('Inserisci un URL valido per il flusso');
      setIsLoading(false);
      return;
    }

    // Determine actual source URL for player
    const effectiveUrl = mode === 'proxy' 
      ? `/api/stream/proxy?url=${encodeURIComponent(cleanUrl)}`
      : cleanUrl;

    console.log(`[StreamPlayer] Caricamento flusso (${mode}):`, effectiveUrl);

    try {
      // Dynamic import to avoid bundling mpegts.js into the main chunk and avoid memory leaks
      const mpegtsModule: any = await import('mpegts.js');
      const mpegts: any = mpegtsModule.default || mpegtsModule;

      if (mpegts && mpegts.isSupported()) {
        const player = mpegts.createPlayer({
          type: 'mse',
          isLive: true,
          url: effectiveUrl,
          hasAudio: true,
          hasVideo: true,
        }, {
          enableWorker: true,
          lazyLoad: true,
          liveBufferLatencyChasing: true,
          liveBufferLatencyMaxLatency: 3.0,
          liveBufferLatencyMinRemain: 1.0,
          autoCleanupSourceBuffer: true,
          autoCleanupMaxBackwardDuration: 15,
          autoCleanupMinBackwardDuration: 5,
        });

        playerRef.current = player;
        player.attachMediaElement(videoRef.current);
        player.load();

        const playPromise: any = player.play();
        if (playPromise && typeof playPromise.then === 'function') {
          playPromise
            .then(() => {
              setIsPlaying(true);
              setIsLoading(false);
              setStreamError(null);
            })
            .catch((err: any) => {
              console.warn('[StreamPlayer] Autoplay bloccato:', err);
              setIsLoading(false);
            });
        } else {
          setIsPlaying(true);
          setIsLoading(false);
        }

        player.on(mpegts.Events.ERROR, (errorType: string, errorDetail: string, errorInfo: any) => {
          console.error('[StreamPlayer] Evento errore:', errorType, errorDetail, errorInfo);
          setIsLoading(false);
          let userMsg = `Errore di riproduzione: ${errorDetail || errorType}`;
          if (errorDetail === 'NetworkError' || errorType === 'NetworkError') {
            userMsg = mode === 'proxy'
              ? 'Errore di connessione al flusso remoto. Spesso i flussi IPTV bloccano i server cloud e richiedono di essere aperti direttamente con VLC sul tuo dispositivo.'
              : 'Impossibile caricare direttamente lo stream dal browser (Mixed Content HTTP su HTTPS o CORS). Consigliamo di aprirlo direttamente con VLC Player.';
          }
          setStreamError(userMsg);
        });

        player.on(mpegts.Events.STATISTICS_INFO, (statInfo: any) => {
          setStats(prev => ({
            ...prev,
            speedKbps: statInfo.speed ? Math.round(statInfo.speed * 8 / 1024) : prev.speedKbps,
            droppedFrames: statInfo.droppedFrames ?? prev.droppedFrames,
          }));
        });

        player.on(mpegts.Events.MEDIA_INFO, (mediaInfo: any) => {
          if (mediaInfo.width && mediaInfo.height) {
            setStats(prev => ({
              ...prev,
              resolution: `${mediaInfo.width}x${mediaInfo.height}`,
            }));
          }
        });

      } else {
        // Fallback to native video tag
        videoRef.current.src = effectiveUrl;
        videoRef.current.play()
          .then(() => {
            setIsPlaying(true);
            setIsLoading(false);
          })
          .catch(err => {
            setStreamError(`Riproduzione nativa non supportata dal browser: ${err.message}. Usa VLC Player.`);
            setIsLoading(false);
          });
      }
    } catch (err: any) {
      console.error('[StreamPlayer] Inizializzazione mpegts fallita:', err);
      setStreamError(`Inizializzazione fallita: ${err.message}`);
      setIsLoading(false);
    }
  };

  // Do not auto-stream in background on mount - clean up on unmount
  useEffect(() => {
    return () => {
      stopStream();
    };
  }, []);

  // Sync buffer / video stats
  useEffect(() => {
    const interval = setInterval(() => {
      if (videoRef.current) {
        const v = videoRef.current;
        if (v.videoWidth && v.videoHeight) {
          setStats(prev => ({
            ...prev,
            resolution: `${v.videoWidth}x${v.videoHeight}`,
          }));
        }
        if (v.buffered && v.buffered.length > 0) {
          try {
            const end = v.buffered.end(v.buffered.length - 1);
            const duration = Math.max(0, end - v.currentTime);
            setStats(prev => ({
              ...prev,
              bufferDuration: Math.round(duration * 10) / 10,
            }));
          } catch (e) {}
        }
      }
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  const handlePlayToggle = () => {
    if (!videoRef.current) return;
    if (!hasStarted) {
      loadStream(streamUrl, connectionMode);
      return;
    }
    if (isPlaying) {
      if (playerRef.current) {
        playerRef.current.pause();
      } else {
        videoRef.current.pause();
      }
      setIsPlaying(false);
    } else {
      if (playerRef.current) {
        playerRef.current.play();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(true);
    }
  };

  const handleReload = () => {
    loadStream(streamUrl, connectionMode);
    toast.info('Riconnessione al flusso di rete in corso...');
  };

  const handleSubmitUrl = (e: React.FormEvent) => {
    e.preventDefault();
    setStreamUrl(inputUrl);
    loadStream(inputUrl, connectionMode);
    toast.success('Caricamento nuovo flusso avviato');
  };

  const handleResetDefault = () => {
    setInputUrl(DEFAULT_STREAM_URL);
    setStreamUrl(DEFAULT_STREAM_URL);
    loadStream(DEFAULT_STREAM_URL, connectionMode);
    toast.info('Ripristinato indirizzo predefinito');
  };

  const handleCopyStreamUrl = () => {
    navigator.clipboard.writeText(streamUrl);
    setCopied(true);
    toast.success('URL del flusso copiato negli appunti!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadM3U = () => {
    const url = `/api/stream/m3u?url=${encodeURIComponent(streamUrl)}&name=${encodeURIComponent('Flusso Live TS')}`;
    window.location.href = url;
    toast.success('Download file .M3U avviato (apribile con VLC)');
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const handleToggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
    if (!nextMuted && volume === 0) {
      setVolume(0.5);
      videoRef.current.volume = 0.5;
    }
  };

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(console.error);
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(console.error);
    }
  };

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col selection:bg-amber-500 selection:text-stone-950">
      {/* Top Header Bar */}
      <header className="border-b border-stone-800/80 bg-stone-900/60 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Tv className="w-5 h-5 text-stone-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
                Flusso di Rete MPEG-TS
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                VLC Stream
              </span>
            </div>
            <p className="text-xs text-stone-400">
              Sezione riservata riproduzione flussi diretti .TS (Transport Stream)
            </p>
          </div>
        </div>

        {/* Action pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCopyStreamUrl}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold border border-stone-700/60 transition-colors"
            title="Copia URL da incollare in VLC (Media -> Apri flusso di rete)"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
            <span>{copied ? 'Copiato!' : 'Copia per VLC'}</span>
          </button>

          <button
            onClick={handleDownloadM3U}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold transition-colors"
            title="Scarica file .m3u per avviare subito il flusso in VLC Player"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Scarica .M3U per VLC</span>
          </button>

          <a
            href={`vlc://${streamUrl}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold border border-stone-700/60 transition-colors"
            title="Tenta di aprire l'applicazione VLC registrata su questo computer"
          >
            <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
            <span>Apri in VLC</span>
          </a>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        
        {/* Stream Address Control Card */}
        <section className="bg-stone-900/70 border border-stone-800 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-sm">
          <form onSubmit={handleSubmitUrl} className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">
                Indirizzo di Rete Flusso (.ts / stream URL)
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="http://host/live/user/pass/stream.ts"
                  className="w-full bg-stone-950/80 border border-stone-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono text-amber-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none pr-10 transition-all"
                />
                {inputUrl && (
                  <button
                    type="button"
                    onClick={() => setInputUrl('')}
                    className="absolute right-3 text-stone-500 hover:text-stone-300 text-xs"
                    title="Cancella"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-end gap-2 pt-1">
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5 whitespace-nowrap"
              >
                <Play className="w-4 h-4 fill-stone-950" />
                <span>Carica Flusso</span>
              </button>

              <button
                type="button"
                onClick={handleResetDefault}
                className="bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold px-4 py-2.5 rounded-xl text-xs sm:text-sm border border-stone-700/60 transition-colors whitespace-nowrap"
                title="Ripristina l'indirizzo originale"
              >
                Predefinito
              </button>
            </div>
          </form>

          {/* Connection Mode Bar & Info */}
          <div className="mt-4 pt-3 border-t border-stone-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-stone-400 font-medium">Modalità Connessione:</span>
              <div className="inline-flex rounded-lg bg-stone-950 p-1 border border-stone-800">
                <button
                  type="button"
                  onClick={() => {
                    setConnectionMode('proxy');
                    loadStream(streamUrl, 'proxy');
                  }}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    connectionMode === 'proxy'
                      ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  Proxy Server (HTTPS/CORS)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConnectionMode('direct');
                    loadStream(streamUrl, 'direct');
                  }}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    connectionMode === 'direct'
                      ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  Diretto Browser
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 text-stone-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                MPEG-TS MSE Decoder
              </span>
              <button
                onClick={() => setShowStats(!showStats)}
                className={`flex items-center gap-1 hover:text-stone-200 text-xs px-2 py-0.5 rounded ${showStats ? 'bg-stone-800 text-amber-400' : ''}`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Statistiche</span>
              </button>
            </div>
          </div>
        </section>

        {/* Video Player Canvas / Container */}
        <section 
          ref={containerRef}
          className="relative bg-black rounded-2xl overflow-hidden border border-stone-800 shadow-2xl flex flex-col group"
        >
          {/* Main Video Viewport */}
          <div className="relative w-full bg-stone-950 flex items-center justify-center min-h-[360px] sm:min-h-[480px] lg:min-h-[580px] overflow-hidden">
            
            <video
              ref={videoRef}
              playsInline
              className={`w-full h-full transition-all duration-300 ${
                aspectRatio === '16/9' ? 'aspect-video object-contain' :
                aspectRatio === '4/3' ? 'aspect-[4/3] object-contain' :
                aspectRatio === 'cover' ? 'h-full w-full object-cover' :
                'h-full w-full object-contain'
              }`}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />

            {/* Initial Welcome & Launch Screen */}
            {!hasStarted && !isLoading && !streamError && (
              <div className="absolute inset-0 bg-stone-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-10">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4 text-amber-400 shadow-xl shadow-amber-500/10">
                  <Tv className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Flusso di Rete MPEG-TS</h3>
                <p className="text-sm text-stone-300 max-w-md mb-6 leading-relaxed">
                  Scegli la modalità preferita. Puoi riprodurlo direttamente su <strong className="text-amber-400">VLC Media Player</strong> (consigliato per stabilità e zero carico sul server) oppure avviare il decoder web nel browser.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => loadStream(streamUrl, connectionMode)}
                    className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-6 py-3 rounded-xl text-sm flex items-center gap-2.5 shadow-lg shadow-amber-500/25 transition-all hover:scale-105 active:scale-95"
                  >
                    <Play className="w-5 h-5 fill-stone-950" />
                    <span>Riproduci nel Browser</span>
                  </button>

                  <button
                    onClick={handleDownloadM3U}
                    className="bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold px-5 py-3 rounded-xl text-sm border border-stone-700 transition-all flex items-center gap-2"
                  >
                    <Download className="w-4 h-4 text-amber-400" />
                    <span>Scarica .M3U per VLC</span>
                  </button>

                  <button
                    onClick={handleCopyStreamUrl}
                    className="bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold px-4 py-3 rounded-xl text-sm border border-stone-700 transition-all flex items-center gap-2"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-stone-400" />}
                    <span>{copied ? 'Copiato!' : 'Copia Link VLC'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Loading Indicator Overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-stone-950/70 backdrop-blur-sm flex flex-col items-center justify-center z-10 gap-3">
                <div className="w-12 h-12 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
                <p className="text-sm font-medium text-stone-200 tracking-wide">
                  Connessione al flusso MPEG-TS...
                </p>
                <span className="text-xs text-stone-400 font-mono max-w-md text-center px-4 truncate">
                  {streamUrl}
                </span>
              </div>
            )}

            {/* Error or Restriction Message Overlay */}
            {streamError && (
              <div className="absolute inset-0 bg-stone-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-10">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4 text-amber-400">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Avviso Flusso di Rete</h3>
                <p className="text-sm text-stone-300 max-w-lg mb-4 leading-relaxed">
                  {streamError}
                </p>
                
                <div className="bg-stone-900/90 border border-stone-800 rounded-xl p-4 max-w-xl text-left text-xs text-stone-300 mb-6 space-y-2">
                  <div className="flex items-start gap-2 text-amber-400 font-semibold">
                    <Info className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>Suggerimento per flussi IPTV / Restrizioni IP:</span>
                  </div>
                  <p className="text-stone-400">
                    I server Xtream-Codes e IPTV spesso bloccano i datacenter cloud (errore 403 Forbidden) e accettano solo l'IP della tua connessione internet o un'applicazione come VLC Player.
                  </p>
                  <p className="text-stone-300 font-medium">
                    Puoi riprodurlo subito con VLC sul tuo dispositivo:
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={handleDownloadM3U}
                    className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    Scarica File .M3U e Apri con VLC
                  </button>
                  <button
                    onClick={handleCopyStreamUrl}
                    className="bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold px-4 py-2.5 rounded-xl text-xs sm:text-sm border border-stone-700 transition-colors flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4 text-amber-400" />
                    Copia Link per VLC
                  </button>
                  <button
                    onClick={handleReload}
                    className="bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold px-4 py-2.5 rounded-xl text-xs sm:text-sm border border-stone-700 transition-colors flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Riprova Connessione
                  </button>
                </div>
              </div>
            )}

            {/* Diagnostic stats overlay */}
            {showStats && (
              <div className="absolute top-4 left-4 bg-stone-900/90 border border-stone-700/80 rounded-xl p-3 text-xs font-mono text-stone-200 z-20 backdrop-blur-md shadow-2xl space-y-1 min-w-[200px]">
                <div className="flex justify-between border-b border-stone-800 pb-1 text-amber-400 font-bold">
                  <span>Diagnostica Stream</span>
                  <span className="text-[10px] uppercase">{connectionMode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Risoluzione:</span>
                  <span>{stats.resolution || 'In rilevamento...'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Bitrate:</span>
                  <span>{stats.speedKbps ? `${stats.speedKbps} kbps` : 'Live'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Buffer:</span>
                  <span>{stats.bufferDuration !== undefined ? `${stats.bufferDuration}s` : '0s'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Frame persi:</span>
                  <span>{stats.droppedFrames ?? 0}</span>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Player Controls Bar */}
          <div className="bg-stone-900/95 border-t border-stone-800 px-4 py-3 flex flex-wrap items-center justify-between gap-4 select-none">
            
            {/* Left Controls: Play/Pause, Reload, Live Indicator */}
            <div className="flex items-center gap-3">
              <button
                onClick={handlePlayToggle}
                className="w-10 h-10 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 flex items-center justify-center shadow-md shadow-amber-500/20 transition-transform active:scale-95"
                title={isPlaying ? 'Pausa' : 'Riproduci'}
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-stone-950" /> : <Play className="w-5 h-5 fill-stone-950 ml-0.5" />}
              </button>

              <button
                onClick={handleReload}
                className="w-9 h-9 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center transition-colors"
                title="Ricarica Flusso / Riconnetti"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={stopStream}
                className="w-9 h-9 rounded-lg bg-stone-800 hover:bg-red-500/20 text-stone-300 hover:text-red-400 flex items-center justify-center transition-colors"
                title="Ferma Flusso e Libera Risorse"
              >
                <Square className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-stone-950 border border-stone-800">
                <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-red-500 animate-pulse' : 'bg-stone-500'}`} />
                <span className="text-[11px] font-bold tracking-wider text-stone-300 uppercase">
                  {isPlaying ? 'IN DIRETTA' : 'IN PAUSA'}
                </span>
              </div>
            </div>

            {/* Middle Controls: Volume Slider */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleMute}
                className="text-stone-400 hover:text-stone-200 transition-colors p-1"
                title={isMuted ? 'Riattiva Audio' : 'Disattiva Audio'}
              >
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 sm:w-28 accent-amber-500 cursor-pointer h-1.5 bg-stone-800 rounded-lg"
              />
            </div>

            {/* Right Controls: Aspect Ratio, Fullscreen */}
            <div className="flex items-center gap-2">
              
              {/* Aspect Ratio Selector */}
              <div className="hidden sm:flex items-center gap-1 bg-stone-950 p-1 rounded-lg border border-stone-800 text-[11px] font-semibold text-stone-400">
                {(['16/9', '4/3', 'auto', 'cover'] as const).map(ratio => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={`px-2 py-0.5 rounded ${aspectRatio === ratio ? 'bg-stone-800 text-amber-400 font-bold' : 'hover:text-stone-200'}`}
                  >
                    {ratio === 'cover' ? 'Espandi' : ratio}
                  </button>
                ))}
              </div>

              {/* Fullscreen Button */}
              <button
                onClick={handleToggleFullscreen}
                className="w-9 h-9 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center transition-colors"
                title={isFullscreen ? 'Esci da schermo intero' : 'Schermo Intero'}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </section>

        {/* VLC Instructions & Information Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Card 1: Come aprire su VLC */}
          <div className="bg-stone-900/60 border border-stone-800 rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <h3 className="text-sm font-bold text-white">Apri Flusso di Rete su VLC</h3>
              </div>
              <p className="text-xs text-stone-400 leading-relaxed mb-4">
                In VLC Media Player premi <kbd className="bg-stone-800 text-stone-200 px-1.5 py-0.5 rounded border border-stone-700 text-[10px]">Ctrl + N</kbd> (o <kbd className="bg-stone-800 text-stone-200 px-1.5 py-0.5 rounded border border-stone-700 text-[10px]">Cmd + N</kbd> su Mac), incolla l'indirizzo e premi <strong>Riproduci</strong>.
              </p>
            </div>
            <button
              onClick={handleCopyStreamUrl}
              className="w-full py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold border border-stone-700 flex items-center justify-center gap-2 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
              <span>{copied ? 'Indirizzo Copiato!' : 'Copia Indirizzo per VLC'}</span>
            </button>
          </div>

          {/* Card 2: Playlist .M3U */}
          <div className="bg-stone-900/60 border border-stone-800 rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <h3 className="text-sm font-bold text-white">Avvio Diretto con File .M3U</h3>
              </div>
              <p className="text-xs text-stone-400 leading-relaxed mb-4">
                Scarica il file di playlist già configurato. Facendo doppio click sul file scaricato, il sistema lo aprirà direttamente nell'applicazione VLC senza dover incollare alcun link.
              </p>
            </div>
            <button
              onClick={handleDownloadM3U}
              className="w-full py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Scarica Playlist .M3U</span>
            </button>
          </div>

          {/* Card 3: Specifiche Tecniche */}
          <div className="bg-stone-900/60 border border-stone-800 rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <h3 className="text-sm font-bold text-white">Formato & Compatibilità</h3>
              </div>
              <div className="text-xs text-stone-400 space-y-1.5 mb-4">
                <p>• Formato: <strong>MPEG-2 Transport Stream (.ts)</strong></p>
                <p>• Protocollo: <strong>HTTP Live Stream</strong></p>
                <p>• Decoder: <strong>MPEGTS.js (Media Source Extensions)</strong></p>
                <p>• Riservato: <strong>Non indicizzato nei menu pubblici</strong></p>
              </div>
            </div>
            <div className="text-[11px] text-stone-500 italic">
              Accessibile solo tramite URL diretto.
            </div>
          </div>

        </section>

      </main>
    </div>
  );
}
