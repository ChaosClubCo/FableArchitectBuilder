# Security Posture

## 1. Threat Model

### Client-Side Execution
The application runs primarily in the client's browser (React/Vite).
- **Risk**: Game state (money, population) is stored in IndexedDB/LocalStorage and can be manipulated by the user.
- **Mitigation**: None currently implemented. State is non-authoritative (Single Player).
- **Status**: ACCEPTED RISK.

### API Key Exposure
- **Risk**: The `GoogleGenAI` client is initialized in `services/geminiService.ts` using `process.env.API_KEY`. In a standard Vite client-side build, `process.env` is often polyfilled or replaced. If the key is embedded in the build artifact, it is exposed to the public.
- **Mitigation**: Deployment must ensure keys are not bundled, or keys must be restricted by referer/IP at the provider level.
- **Status**: **HIGH RISK / UNKNOWN**. Requires verification of deployment config (Vercel/Netlify env handling).

### Prompt Injection
- **Risk**: User input via `WizardConsole` or game events is sent to the LLM.
- **Mitigation**: None visible in `geminiService.ts`.
- **Status**: OPEN.

## 2. Egress Rules
- **Allowed**: `generativelanguage.googleapis.com` (Gemini API).
- **Blocked**: All other external domains (enforced via CSP or CORS policies - Status: UNKNOWN).

## 3. Incident Response
- **Kill Switch**: No immediate remote kill switch identified for the application logic.
- **Key Rotation**: Manual rotation required via Google Cloud Console.

<!--
Source: code
Locator: services/geminiService.ts
Confidence: MEDIUM
Last Verified: 2023-10-27
-->