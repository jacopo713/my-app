import { TestPhase } from '../TestInstructions';
import { testInstructions } from '../TestInstructions';

interface TestInstructionsProps {
  phase: TestPhase;
}

export default function TestInstructions({ phase }: TestInstructionsProps) {
  const instructions = testInstructions[phase];

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">{instructions.title}</h2>
        <p className="text-gray-600 mb-4">{instructions.description}</p>
        <div className="space-y-4">
          <h3 className="font-bold text-gray-800">Passaggi:</h3>
          <ul className="list-disc list-inside text-gray-600">
            {instructions.steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ul>
        </div>
        <div className="space-y-4 mt-6">
          <h3 className="font-bold text-gray-800">Consigli:</h3>
          <ul className="list-disc list-inside text-gray-600">
            {instructions.tips.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
