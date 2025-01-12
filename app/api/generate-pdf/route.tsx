// app/api/generate-pdf/route.ts
import { NextResponse } from 'next/server';
import { admin, db } from '@/app/lib/firebaseAdmin';
import PDFDocument from 'pdfkit';

export async function POST(req: Request) {
  try {
    const { userId, testResults } = await req.json();

    if (!userId || !testResults) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verifica l'autenticazione
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      if (decodedToken.uid !== userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
    } catch (err) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Crea un nuovo documento PDF
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50
    });

    // Array per contenere i chunks del PDF
    const chunks: any[] = [];

    // Cattura i chunks del PDF
    doc.on('data', chunk => chunks.push(chunk));

    // Header
    doc
      .fontSize(25)
      .font('Helvetica-Bold')
      .text('Risultati Test del QI', { align: 'center' })
      .moveDown(0.5);

    // Data del test
    doc
      .fontSize(12)
      .font('Helvetica')
      .text(`Data: ${new Date().toLocaleDateString()}`)
      .moveDown(1);

    // Punteggio complessivo
    doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('Punteggio Complessivo')
      .moveDown(0.5);

    doc
      .fontSize(14)
      .font('Helvetica')
      .text(`${testResults.overallScore || 0} / 1000`)
      .moveDown(1);

    // Risultati dettagliati
    doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('Risultati Dettagliati')
      .moveDown(0.5);

    // Raven Test
    if (testResults.raven) {
      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('Test delle Matrici Progressive')
        .fontSize(12)
        .font('Helvetica')
        .text(`Punteggio: ${testResults.raven.score}`)
        .text(`Accuratezza: ${testResults.raven.accuracy}%`)
        .text(`Percentile: ${testResults.raven.percentile}°`)
        .moveDown(0.5);
    }

    // Eye-Hand Test
    if (testResults.eyeHand) {
      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('Test di Coordinazione Occhio-Mano')
        .fontSize(12)
        .font('Helvetica')
        .text(`Punteggio: ${testResults.eyeHand.score}`)
        .text(`Precisione: ${testResults.eyeHand.accuracy}%`)
        .text(`Deviazione Media: ${testResults.eyeHand.averageDeviation}ms`)
        .moveDown(0.5);
    }

    // Stroop Test
    if (testResults.stroop) {
      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('Test di Stroop')
        .fontSize(12)
        .font('Helvetica')
        .text(`Punteggio: ${testResults.stroop.score}`)
        .text(`Percentile: ${testResults.stroop.percentile}°`)
        .text(`Interferenza: ${testResults.stroop.interferenceScore}`)
        .moveDown(0.5);
    }

    // Speed Reading Test
    if (testResults.speedReading) {
      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('Test di Lettura Veloce')
        .fontSize(12)
        .font('Helvetica')
        .text(`Velocità: ${testResults.speedReading.wpm} parole/min`)
        .text(`Percentile: ${testResults.speedReading.percentile}°`)
        .moveDown(0.5);
    }

    // Memory Test
    if (testResults.memory) {
      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('Test di Memoria')
        .fontSize(12)
        .font('Helvetica')
        .text(`Punteggio: ${testResults.memory.score}`)
        .text(`Percentile: ${testResults.memory.percentile}°`)
        .text(`Valutazione: ${testResults.memory.evaluation}`)
        .moveDown(0.5);
    }

    // Schulte Test
    if (testResults.schulte) {
      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('Test di Schulte')
        .fontSize(12)
        .font('Helvetica')
        .text(`Punteggio: ${testResults.schulte.score}`)
        .text(`Tempo Medio: ${testResults.schulte.averageTime}s`)
        .text(`Percentile: ${testResults.schulte.percentile}°`)
        .moveDown(0.5);
    }

    // Rhythm Test
    if (testResults.rhythm) {
      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('Test del Ritmo')
        .fontSize(12)
        .font('Helvetica')
        .text(`Precisione: ${testResults.rhythm.precision}%`)
        .text(`Livello Raggiunto: ${testResults.rhythm.level}`)
        .moveDown(0.5);
    }

    // Note finali
    doc
      .moveDown(1)
      .fontSize(10)
      .font('Helvetica')
      .text('Questo report è stato generato automaticamente dal sistema di test del QI.', {
        align: 'center',
        color: '#666666'
      });

    // Finalizza il documento
    doc.end();

    // Concatena tutti i chunks in un buffer
    const pdfBuffer = Buffer.concat(chunks);

    // Imposta gli headers per il download del PDF
    const headers = new Headers();
    headers.append('Content-Type', 'application/pdf');
    headers.append('Content-Disposition', 'attachment; filename=test-results.pdf');

    return new Response(pdfBuffer, {
      headers,
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
