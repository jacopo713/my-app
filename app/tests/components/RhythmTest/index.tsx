[00:25:57.764] Running build in Washington, D.C., USA (East) – iad1
[00:25:57.878] Cloning github.com/jacopo713/my-app (Branch: main, Commit: 7271ee3)
[00:25:58.109] Cloning completed: 230.37ms
[00:26:02.798] Restored build cache from previous deployment (7G9JQwoWq3MEouHZxKWhtMqbefjW)
[00:26:02.869] Running "vercel build"
[00:26:03.675] Vercel CLI 39.2.5
[00:26:04.001] Installing dependencies...
[00:26:09.379] 
[00:26:09.379] up to date in 3s
[00:26:09.379] 
[00:26:09.380] 154 packages are looking for funding
[00:26:09.380]   run `npm fund` for details
[00:26:09.389] Detected Next.js version: 15.1.4
[00:26:09.393] Running "npm run build"
[00:26:09.531] 
[00:26:09.531] > my-app@0.1.0 build
[00:26:09.531] > next build
[00:26:09.531] 
[00:26:10.391]    ▲ Next.js 15.1.4
[00:26:10.391] 
[00:26:10.422]    Creating an optimized production build ...
[00:26:20.141]  ✓ Compiled successfully
[00:26:20.146]    Linting and checking validity of types ...
[00:26:24.345] 
[00:26:24.346] Failed to compile.
[00:26:24.346] 
[00:26:24.346] ./app/tests/components/RhythmTest/index.tsx
[00:26:24.346] 2:59  Error: 'useMemo' is defined but never used.  @typescript-eslint/no-unused-vars
[00:26:24.346] 78:56  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:26:24.346] 241:6  Warning: React Hook useCallback has a missing dependency: 'isLastLevel'. Either include it or remove the dependency array. Outer scope values like 'MELODIES' aren't valid dependencies because mutating them doesn't re-render the component.  react-hooks/exhaustive-deps
[00:26:24.346] 
[00:26:24.346] info  - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/app/api-reference/config/eslint#disabling-rules
[00:26:24.379] Error: Command "npm run build" exited with 1
[00:26:24.853] 
