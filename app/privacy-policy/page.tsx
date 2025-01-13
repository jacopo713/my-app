// app/privacy-policy/page.tsx
import React from 'react';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <div className="prose">
        <p>
          La tua privacy è importante per noi. Questa politica spiega come raccogliamo, utilizziamo e proteggiamo le tue informazioni personali.
        </p>

        <h2 className="text-2xl font-semibold mt-6">1. Raccolta dei Dati</h2>
        <p>
          Raccogliamo informazioni come nome, indirizzo email e dati di pagamento per fornire il servizio.
          Questi dati sono necessari per l&apos;elaborazione degli abbonamenti e dei pagamenti.
        </p>

        <h2 className="text-2xl font-semibold mt-6">2. Utilizzo dei Dati</h2>
        <p>
          Utilizziamo i tuoi dati per gestire il tuo account, elaborare i pagamenti e migliorare il servizio.
          Non condividiamo le tue informazioni con terze parti senza il tuo consenso.
        </p>

        <h2 className="text-2xl font-semibold mt-6">3. Sicurezza dei Dati</h2>
        <p>
          Adottiamo misure di sicurezza per proteggere i tuoi dati personali. Utilizziamo protocolli di crittografia
          e seguiamo le migliori pratiche per garantire la sicurezza delle informazioni.
        </p>

        <h2 className="text-2xl font-semibold mt-6">4. Diritti dell&apos;Utente</h2>
        <p>
          Hai il diritto di accedere, correggere o eliminare i tuoi dati personali in qualsiasi momento.
          Puoi contattarci per esercitare questi diritti.
        </p>

        <h2 className="text-2xl font-semibold mt-6">5. Modifiche alla Privacy Policy</h2>
        <p>
          Ci riserviamo il diritto di aggiornare questa politica in qualsiasi momento. Le modifiche saranno effettive
          immediatamente dopo la pubblicazione.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
