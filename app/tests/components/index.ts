// app/tests/components/index.ts

import RavenTest from './Raven';
import EyeHandTest from './EyeHand';
import StroopTest from './Stroop';
import SpeedReadingTrainer from './SpeedReading';
import ShortTermMemoryTest from './ShortTermMemoryTest';
import SchulteTable from './SchulteTable';
import RhythmTest from './RhythmTest'; // Importa il nuovo componente

// Export interfaces
export type { RavenTestProps } from './Raven';
export type { EyeHandTestProps } from './EyeHand';
export type { SpeedReadingTrainerProps } from './SpeedReading';


// Export components
export {
  RavenTest,
  EyeHandTest,
  StroopTest,
  SpeedReadingTrainer,
  ShortTermMemoryTest,
  SchulteTable,
  RhythmTest, // Esporta il nuovo componente
};
