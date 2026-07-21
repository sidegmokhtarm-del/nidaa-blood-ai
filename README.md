# Nidaa Blood AI

Nidaa Blood AI is a privacy-first prototype for coordinating urgent hospital
blood-donation appeals with nearby opt-in donors. It helps a family turn an
Arabic or English hospital request into a clear, time-limited community appeal
without publishing patient identity or making medical decisions.

**OpenAI Build Week 2026 — Apps for Your Life**

- Live prototype: https://nidaa-blood-ai.sidegmokhtarm.chatgpt.site
- Demo video: https://www.youtube.com/watch?v=bqJjrSecdpk

> This is a demonstration with fictional data. Nidaa does not determine donor
> eligibility, blood compatibility, or treatment. Hospitals remain the final
> authority and complete all official screening.

## What the prototype demonstrates

- Arabic and English urgent-appeal input
- Structured extraction of hospital, blood group, donor count, deadline, and area
- Removal of patient names and other identifying details from public alerts
- Clear flags for information that the requester still needs to confirm
- Review-before-publish workflow
- Blood-group-filtered community appeals and opt-in donor responses
- Time-limited alerts, automatic-closure design, and hospital-controlled screening
- Responsive mobile and desktop interface

## How Codex and GPT-5.6 were used

### Codex

Codex supported the complete product workflow: translating the healthcare idea
into a narrow prototype, designing the bilingual interface, implementing the
React application and API route, reviewing privacy and safety boundaries,
testing the interactions, and iterating on the demo experience.

### GPT-5.6

The optional server route in `app/api/analyze/route.ts` uses GPT-5.6 structured
outputs to transform a free-text hospital request into a small JSON object. Its
system instruction requires the model to:

- extract only information stated by the requester;
- remove names, IDs, diagnoses, phone numbers, and room numbers;
- never infer donor eligibility or blood compatibility;
- keep the requester's language; and
- return missing-information prompts when details are incomplete.

For a reproducible public demonstration, the application also has a constrained
fictional fallback when no OpenAI API key is configured or an API request fails.
The interface labels that response as demo mode.

## Technology

- React 19 and TypeScript
- Next-compatible Vinext runtime on Vite
- Cloudflare Worker-compatible deployment
- OpenAI Responses API with GPT-5.6 structured outputs
- CSS responsive design
- Node test runner

## Run locally

### Prerequisites

- Node.js 22.13 or later
- npm
- Linux, macOS, or WSL (the provided verified-build scripts target a Linux shell)

### Setup

```bash
git clone <your-repository-url>
cd nidaa-blood-ai
npm ci
```

Optional: create `.env.local` to enable the live GPT-5.6 analysis route.

```bash
OPENAI_API_KEY=your_openai_api_key
```

Never commit a real API key. Without this variable, the safe fictional demo
fallback works automatically.

Start the development server:

```bash
npm run dev
```

Open the local URL shown in the terminal.

## Sample data

English example:

```text
I am at Riyadh Central Hospital. The blood bank asked us to bring two eligible
A+ donors today before 9 PM. Please do not share the patient's name. Contact me
through the app.
```

Arabic example:

```text
أنا في مستشفى الرياض المركزي. طلب منا بنك الدم إحضار متبرعين اثنين من فصيلة A+
اليوم قبل الساعة 9 مساءً. الرجاء عدم نشر اسم المريض والتواصل معي عبر التطبيق.
```

The community-board records included in the UI are fictional demonstration data.

## Test and validate

```bash
npm test
npm run lint
```

`npm test` builds the application, validates the deployable artifact, and checks
rendered metadata. Manual testing should also cover:

1. Switch between English and Arabic.
2. Create an appeal from either sample request.
3. Review the structured fields and privacy notice.
4. Publish the fictional appeal and filter the community board.
5. Open an appeal and record donor interest.
6. Confirm that the UI always sends eligibility decisions back to the hospital.

## Safety and privacy boundaries

- No real patient or donor data is required for the demo.
- Public appeal cards never display patient names.
- The model is instructed not to infer medical eligibility or compatibility.
- Donor interest is not an approval to donate.
- The hospital's official process remains mandatory.
- Real deployment would require local legal, privacy, security, abuse-prevention,
  hospital-verification, and low-connectivity/offline review.

## Project structure

```text
app/page.tsx                 Main bilingual interactive prototype
app/globals.css              Responsive visual system
app/api/analyze/route.ts     GPT-5.6 structured-output route and demo fallback
tests/                       Rendered-output tests
scripts/                     Verified install/build helpers
```

## License

Released under the [MIT License](LICENSE).
