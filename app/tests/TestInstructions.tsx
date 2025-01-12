const renderCurrentPhase = () => {
  const renderTest = () => {
    switch (phase) {
      case "intro":
        return (
          // ... (codice esistente per la fase "intro")
        );
      case "raven":
        return !testStarted ? (
          <TestInstructionsComponent phase={phase} onStart={() => setTestStarted(true)} />
        ) : (
          <RavenTest onComplete={handleRavenComplete} />
        );
      case "eyehand":
        return !testStarted ? (
          <TestInstructionsComponent phase={phase} onStart={() => setTestStarted(true)} />
        ) : (
          <EyeHandTest onComplete={handleEyeHandComplete} />
        );
      case "stroop":
        return !testStarted ? (
          <TestInstructionsComponent phase={phase} onStart={() => setTestStarted(true)} />
        ) : (
          <StroopTest onComplete={handleStroopComplete} />
        );
      case "speedreading":
        return !testStarted ? (
          <TestInstructionsComponent phase={phase} onStart={() => setTestStarted(true)} />
        ) : (
          <SpeedReadingTrainer onComplete={handleSpeedReadingComplete} />
        );
      case "memory":
        return !testStarted ? (
          <TestInstructionsComponent phase={phase} onStart={() => setTestStarted(true)} />
        ) : (
          <ShortTermMemoryTest onComplete={handleMemoryComplete} />
        );
      case "schulte":
        return !testStarted ? (
          <TestInstructionsComponent phase={phase} onStart={() => setTestStarted(true)} />
        ) : (
          <SchulteTable onComplete={handleSchulteComplete} />
        );
      case "rhythm":
        return !testStarted ? (
          <TestInstructionsComponent phase={phase} onStart={() => setTestStarted(true)} />
        ) : (
          <RhythmTest onComplete={handleRhythmComplete} />
        );
      case "results":
        return (
          // ... (codice esistente per la fase "results")
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4">
      {!testStarted && phase !== "intro" && phase !== "results" && (
        <TestInstructionsComponent
          phase={phase}
          onStart={() => setTestStarted(true)}
        />
      )}
      {(testStarted || phase === "intro" || phase === "results") && renderTest()}
    </div>
  );
};
