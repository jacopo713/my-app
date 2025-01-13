// app/termini-e-condizioni/page.tsx
import React from 'react';

const TerminiECondizioniPage: React.FC = () => {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Termini e Condizioni</h1>
      <div className="prose">
        <p>
          Benvenuto nella nostra piattaforma. Utilizzando il nostro servizio, accetti i seguenti termini e condizioni.
          Ti preghiamo di leggere attentamente questo documento prima di procedere.
        </p>

        <h2 className="text-2xl font-semibold mt-6">1. Accettazione dei Termini</h2>
        <p>
          Accedendo e utilizzando questo servizio, accetti di essere vincolato da questi termini e condizioni.
          Se non accetti questi termini, ti preghiamo di non utilizzare il servizio.
        </p>

        <h2 className="text-2xl font-semibold mt-6">2. Pagamenti e Rinnovi</h2>
        <p>
          Il servizio è offerto con un periodo di prova gratuito di 7 giorni. Dopo il periodo di prova, verrà addebitato
          un costo di <strong>19,90€/mese</strong>. Puoi cancellare l&apos;abbonamento in qualsiasi momento.
        </p>

        <h2 className="text-2xl font-semibold mt-6">3. Responsabilità</h2>
        <p>
          Non siamo responsabili per eventuali danni diretti o indiretti derivanti dall&apos;uso del servizio.
          L&apos;utente è responsabile del proprio utilizzo della piattaforma.
        </p>

        <h2 className="text-2xl font-semibold mt-6">4. Modifiche ai Termini</h2>
        <p>
          Ci riserviamo il diritto di modificare questi termini e condizioni in qualsiasi momento.
          Le modifiche saranno effettive immediatamente dopo la pubblicazione.
        </p>
      </div>
    </div>
  );
};

export default TerminiECondizioniPage;
