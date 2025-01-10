// app/tests/components/index.ts

import RavenTest from './Raven';
import EyeHandTest from './EyeHand';
import StroopTest from './Stroop';
import SpeedReadingTrainer from './SpeedReadingTrainer'; // Importa il nuovo componente

// Export interfaces
export type { RavenTestProps } from './Raven';
export type { EyeHandTestProps } from './EyeHand';
export type { SpeedReadingTrainerProps } from './SpeedReadingTrainer'; // Esporta l'interfaccia del nuovo componente

// Export components
export {
  RavenTest,
  EyeHandTest,
  StroopTest,
  SpeedReadingTrainer, // Esporta il nuovo componente
};
