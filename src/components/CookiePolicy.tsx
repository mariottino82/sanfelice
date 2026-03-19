import React from 'react';
import { motion } from 'motion/react';
import { Cookie, ArrowLeft } from 'lucide-react';

export const CookiePolicy = ({ onBack }: { onBack: () => void }) => {
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-stone-50 py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button 
          onClick={onBack}
          className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Torna alla Home
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 md:p-12 rounded-[2rem] shadow-sm border border-stone-100"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-stone-100 rounded-2xl flex items-center justify-center">
              <Cookie className="w-6 h-6 text-stone-900" />
            </div>
            <h1 className="text-3xl md:text-4xl font-serif text-stone-900">Informativa sui Cookie</h1>
          </div>

          <div className="prose prose-stone max-w-none space-y-6 text-stone-600 leading-relaxed">
            <section>
              <h2 className="text-xl font-serif text-stone-900 mb-3">1. Cosa sono i Cookie?</h2>
              <p>
                I cookie sono piccoli file di testo che i siti visitati dall'utente inviano al suo terminale (solitamente al browser), dove vengono memorizzati per essere poi ritrasmessi agli stessi siti alla successiva visita del medesimo utente.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-serif text-stone-900 mb-3">2. Tipologia di Cookie Utilizzati</h2>
              <p>Questo sito utilizza le seguenti tipologie di cookie:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Cookie Tecnici (Essenziali):</strong> necessari per il corretto funzionamento del sito e per consentire la navigazione e l'utilizzo dei servizi richiesti (es. login, gestione sessione).</li>
                <li><strong>Cookie di Analisi (Statistici):</strong> utilizzati per raccogliere informazioni, in forma aggregata, sul numero degli utenti e su come questi visitano il sito stesso, al fine di migliorarne le prestazioni.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-serif text-stone-900 mb-3">3. Cookie di Terze Parti</h2>
              <p>
                Il sito può includere componenti di terze parti (es. Google Maps, video YouTube, pulsanti social) che possono installare i propri cookie. Questi cookie sono gestiti direttamente dalle terze parti e il Titolare non ha controllo su di essi. Si invita a consultare le rispettive informative privacy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-serif text-stone-900 mb-3">4. Come Gestire o Disabilitare i Cookie</h2>
              <p>
                L'utente può gestire le preferenze relative ai cookie direttamente all'interno del proprio browser ed impedire – ad esempio – che terze parti possano installarne. Tramite le preferenze del browser è inoltre possibile eliminare i cookie installati in passato.
              </p>
              <p className="mt-2">
                È importante notare che disabilitando tutti i cookie, il funzionamento di questo sito potrebbe essere compromesso.
              </p>
              <p className="mt-2">
                Per maggiori informazioni su come gestire i cookie nei principali browser, è possibile consultare i seguenti link:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-stone-900 underline">Google Chrome</a></li>
                <li><a href="https://support.mozilla.org/it/kb/Attivare%20e%20disattivare%20i%20cookie" target="_blank" rel="noopener noreferrer" className="text-stone-900 underline">Mozilla Firefox</a></li>
                <li><a href="https://support.apple.com/it-it/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-stone-900 underline">Apple Safari</a></li>
                <li><a href="https://support.microsoft.com/it-it/windows/eliminare-e-gestire-i-cookie-168dab11-0753-043d-7c16-ede5947fc64d" target="_blank" rel="noopener noreferrer" className="text-stone-900 underline">Microsoft Edge</a></li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-serif text-stone-900 mb-3">5. Consenso</h2>
              <p>
                Proseguendo la navigazione sul sito, l'utente acconsente all'utilizzo dei cookie tecnici strettamente necessari per le finalità sopra indicate.
              </p>
            </section>

            <div className="pt-8 border-t border-stone-100 text-sm italic">
              Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT')}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
