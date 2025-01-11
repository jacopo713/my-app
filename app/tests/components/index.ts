import RavenTest from './Raven';
import EyeHandTest from './EyeHand';
import StroopTest from './Stroop';
import SpeedReadingTrainer from './SpeedReading';
import ShortTermMemoryTest from './ShortTermMemoryTest'; // Importa il nuovo componente

// Export interfaces
export type { RavenTestProps } from './Raven';
export type { EyeHandTestProps } from './EyeHand';
export type { SpeedReadingTrainerProps } from './SpeedReading';
export type { ShortTermMemoryTestProps } from './ShortTermMemoryTest'; // Esporta l'interfaccia del nuovo componente

// Export components
export {
  RavenTest,
  EyeHandTest,
  StroopTest,
  SpeedReadingTrainer,
  ShortTermMemoryTest, // Esporta il nuovo componente
};
