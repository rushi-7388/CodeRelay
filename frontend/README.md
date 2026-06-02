## CodeRelay – Collaborative DSA Practice Platform (Frontend)

This folder contains the **React + Vite frontend** for **CodeRelay**, a collaborative coding and DSA practice platform.
The backend (Express, MongoDB, Clerk, Stream) lives in the separate `backend` folder and is not modified here.

### High‑level idea

- **Authentication**: handled by Clerk (`ClerkProvider` in `main.jsx`, guards in `App.jsx`).
- **Sessions**: you create interview‑style coding sessions around a problem, invite or auto‑join a partner, and collaborate via video + shared problem statement.
- **Problems**: a curated DSA problem set (`data/problems.js`) rendered in multiple pages and used when creating sessions.
- **Execution**: JavaScript runs locally in the browser; other languages are sent to the external Piston API (if available).

You can present this project as **a full workflow** from login → exploring problems → creating sessions → coding together → reviewing history.

---

## 1. Frontend architecture

- `main.jsx`
  - Boots React with:
    - `BrowserRouter` (client‑side routing),
    - `ClerkProvider` (auth),
    - `QueryClientProvider` (React Query for data fetching),
    - `App` as the root component.
- `App.jsx`
  - Defines all routes and protects them based on `isSignedIn`:
    - `/` → `HomePage` (public landing page).
    - `/dashboard` → `DashboardPage` (requires sign‑in).
    - `/problems` → `ProblemsPage` (requires sign‑in).
    - `/problem/:id` → `ProblemPage` (single problem view).
    - `/session/:id` → `SessionPage` (live coding + video).
- `index.css`
  - Tailwind + DaisyUI setup.
  - All theming and component styles come from these utilities.

**Core folders:**

- `components/` – reusable UI:
  - `Navbar`, `WelcomeSection`, `StatsCards`, `ActiveSessions`, `RecentSessions`,
    `CodeEditorPanel`, `OutputPanel`, `CreateSessionModal`, `VideoCallUI`, etc.
- `pages/` – page‑level layouts:
  - `HomePage`, `DashboardPage`, `ProblemsPage`, `ProblemPage`, `SessionPage`.
- `hooks/` – custom hooks for API / Stream:
  - `useSessions` – wraps session API in React Query hooks.
  - `useStreamClient` – sets up Stream Video + Chat for live calls.
- `lib/` – utilities and integration code:
  - `axios.js` – Axios instance configured with `VITE_API_URL`.
  - `stream.js` – Stream client setup.
  - `piston.js` – code execution integration (Piston + local JS runner).
  - `utils.js` – helpers like `getDifficultyBadgeClass`.
- `data/problems.js`
  - The “database” of problems used in the UI (title, description, examples, constraints, starter code).

---

## 2. Authentication & routing flow

1. **Clerk setup**
   - `main.jsx` reads `VITE_CLERK_PUBLISHABLE_KEY` and wraps the app in `ClerkProvider`.
2. **Route protection**
   - `App.jsx` calls `useUser()`:
     - If `!isLoaded`, render nothing (avoids flicker).
     - If `!isSignedIn`, any protected route redirects back to `/`.
   - Result:
     - Unauthenticated users see only `HomePage`.
     - Signed‑in users can access `/dashboard`, `/problems`, `/problem/:id`, `/session/:id`.

You can explain to the examiner: **auth state comes from Clerk, and React Router plus `Navigate` enforces which routes need sign‑in.**

---

## 3. Dashboard workflow (`/dashboard`)

File: `pages/DashboardPage.jsx`

1. **Data fetching**
   - Uses hooks from `hooks/useSessions.js`:
     - `useActiveSessions()` → GET `/api/sessions/active`.
     - `useMyRecentSessions()` → GET `/api/sessions/my-recent`.
   - React Query manages loading, caching, and refetching.
2. **Top section**
   - `Navbar` (global nav + theme toggle + user avatar).
   - `WelcomeSection` – personalized greeting with “Create Session” CTA.
3. **Stats + live sessions**
   - `StatsCards`:
     - **Active Sessions** – current active session count.
     - **Completed Sessions** – total past sessions.
     - **Sessions today + hardest difficulty today** – computed from `recentSessions`.
   - `ActiveSessions`:
     - Lists each active session card (problem, difficulty, host, capacity, status).
     - “Join” / “Rejoin” buttons navigate to `/session/:id`.
4. **History**
   - `RecentSessions`:
     - Grid of past sessions with:
       - Problem, difficulty badge, time since session, participant count.
       - “ACTIVE” badge for sessions still live.
     - Uses `createdAt` and `updatedAt` to show relative time.

**Flow to describe:**

> When I open `/dashboard`, React Query calls `useActiveSessions` and `useMyRecentSessions`. Those results feed into `StatsCards`, `ActiveSessions`, and `RecentSessions` so I can see what’s live now and what I solved recently.

---

## 4. Problem Explorer (`/problems`) – with new features

File: `pages/ProblemsPage.jsx`

**Core behaviour:**

- Loads all problems from `PROBLEMS` (static data).
- Computes counts of Easy / Medium / Hard.

**New features you can highlight:**

1. **Search by keyword**
   - State: `search`.
   - Filters problems where the query matches:
     - title,
     - category,
     - description text.
2. **Difficulty filter**
   - State: `difficulty` – `All | Easy | Medium | Hard`.
   - Problems are filtered before display.
3. **Bookmarks (local “playlist”)**
   - State: `bookmarkedIds`.
   - Stored in `localStorage` under `coderelay_bookmarked_problems`.
   - Each problem card has a small bookmark button:
     - Click toggles the bookmark without leaving the page.
   - A “Bookmarked only” toggle lets you view only saved problems.
4. **Footer stats**
   - Shows:
     - total number of problems,
     - count by difficulty,
     - number of bookmarked problems.

**How to explain it:**

> On the Problems page I implemented a search + filter + bookmark system. It uses React state and `useMemo` to compute a filtered list purely on the frontend. Bookmarks are saved in `localStorage` so each student can maintain their own custom problem playlist.

---

## 5. Session workflow (`/session/:id`)

File: `pages/SessionPage.jsx`

**Data & role detection:**

- Reads `id` from URL via `useParams`.
- Uses `useSessionById(id)` to fetch session details from `/api/sessions/:id`.
- Derives:
  - `isHost` – whether current Clerk user is the host.
  - `isParticipant` – whether current user already joined as participant.

**Auto‑join logic:**

- A `useEffect` checks:
  - If session is loaded,
  - If user is not host and not yet participant,
  - Then calls `useJoinSession().mutate(id)` to join automatically and refetch session.

**Video + chat (Stream):**

- `useStreamClient(session, loadingSession, isHost, isParticipant)` returns:
  - `streamClient`, `call`, `chatClient`, `channel`, `isInitializingCall`.
- Right‑hand panel renders:
  - While initializing: loading spinner and “Connecting to video call…”.
  - On success: `StreamVideo` → `StreamCall` → `VideoCallUI`.
  - On failure: fallback “Connection Failed” card.

**Problem panel:**

- Left‑top panel displays:
  - Title, difficulty badge (`getDifficultyBadgeClass`),
  - Host info and participants count,
  - Full description, examples, constraints – all from `PROBLEMS`.

### 5.1 Code editor + execution

**Code editor (`CodeEditorPanel`):**

- Uses `@monaco-editor/react` for VS Code‑like editor.
- Props:
  - `selectedLanguage`, `code`, `isRunning`,
  - `onLanguageChange`, `onCodeChange`, `onRunCode`.
- Reads icon and Monaco language from `LANGUAGE_CONFIG`.

**Execution (`lib/piston.js` + local JS runner):**

- For **JavaScript**:
  - Runs code **locally in the browser** using `eval`.
  - Temporarily overrides `console.log` to capture output lines.
  - Returns `{ success: true, output }` or `{ success: false, error }`.
- For **other languages (Python, Java)**:
  - Sends a POST request to Piston:
    - `https://emkc.org/api/v2/piston/execute`.
  - Includes language, version, and the code as a single file.
  - Parses `run.output` and `run.stderr` to build the response object.

`SessionPage` calls:

- `handleRunCode` → `executeCode(selectedLanguage, code)` and then passes the result to `OutputPanel`.

### 5.2 Autocomplete & persistence – **your custom features**

1. **Per‑session, per‑language code autosave**
   - In `SessionPage`:
     - `selectedLanguage` state (defaults to `"javascript"`).
     - Computes `codeStorageKey = session:${id}:code:${selectedLanguage}`.
   - `useEffect`:
     - On problem/language change:
       - Tries to load code from `localStorage[codeStorageKey]`.
       - If missing, falls back to `problemData.starterCode[selectedLanguage]`.
   - Another `useEffect`:
     - Whenever `code` changes, writes it back into `localStorage` with that key.

**Pitch it:**

> I implemented a per‑session code autosave feature. Even if the page reloads or the student navigates away, their last code for that specific session and language is restored automatically from localStorage.

2. **Per‑session notes in `OutputPanel`**

File: `components/OutputPanel.jsx`

- Now accepts `sessionId` and manages its own `notes` state.
- Two sections stacked:
  - Top: execution output (success / error).
  - Bottom: “Session Notes” textarea.
- Saves notes to:
  - `localStorage["session:${sessionId}:notes"]`.

**How to present it:**

> Below the output I added a Session Notes area. Students can type hints, edge cases, or feedback during the interview. The notes are auto‑saved locally per session ID, so they can close the browser and still see them when they come back.

---

## 6. Global Navbar & theming

File: `components/Navbar.jsx`

**Branding:**

- App name: **CodeRelay** with tagline “Collaborative DSA Playground”.
- Links:
  - `/problems`
  - `/dashboard`
- User menu from Clerk (`UserButton`) on the right.

**Theme toggle (your feature):**

- Cycles between DaisyUI themes: `night`, `winter`, `dracula`.
- Uses React state + `useEffect`:
  - Reads `coderelay_theme` from `localStorage` on mount.
  - Applies the theme via `document.documentElement.setAttribute("data-theme", theme)`.
  - Saves any change back to `localStorage`.
- Button shows a sun/moon icon and current theme name.

**How to explain it:**

> I added a theme toggle in the navbar that remembers the preference in localStorage. It uses DaisyUI’s theming system by setting `data-theme` on the root element, so the entire UI restyles instantly.

---

## 7. Landing page (`/`)

File: `pages/HomePage.jsx`

- Redesigned to match the CodeRelay brand:
  - Hero with badges for “Live Sessions”, “Problem Explorer”, and “Notes & Autosave”.
  - Primary CTA: “Start Coding Now” (opens Clerk sign‑in modal).
  - Secondary CTA: “See Features”.
- Stats section highlights:
  - Real‑time code execution.
  - Curated DSA problems.
  - Local notes & history.
- Features cards explain:
  - Live sessions for pair programming.
  - Smart problem explorer (search, filters, bookmarks).
  - Notes and progress tracking.

**Talking point:**

> The landing page is focused on explaining the unique value of CodeRelay – collaborative sessions plus personal progress tooling – instead of generic React/Vite boilerplate.

---

## 8. How to run the project (for demo)

From the repository root:

1. **Backend**
   - Go to `backend/`.
   - Ensure `.env` is configured (MongoDB URL, Clerk keys, Stream keys, etc.).
   - Install dependencies:
     - `npm install`
   - Start server:
     - `npm run dev`
   - Backend runs on `http://localhost:3000`.

2. **Frontend**
   - Go to `frontend/`.
   - Ensure `.env` has:
     - `VITE_CLERK_PUBLISHABLE_KEY`
     - `VITE_API_URL=http://localhost:3000/api`
     - `VITE_STREAM_API_KEY`
   - Install dependencies:
     - `npm install`
   - Start dev server:
     - `npm run dev`
   - Open the URL printed in the console (usually `http://localhost:5173`).

3. **Typical demo script**
   - Sign in with a Clerk user that also exists in the backend DB.
   - Visit `/problems`:
     - Show search, filters, and bookmarking.
   - Create a session from `/dashboard`:
     - Show that it appears in “Live Sessions”.
   - Enter `/session/:id`:
     - Show the problem statement, code editor, output, and notes.
     - Run the sample JavaScript solution and show captured output.
     - Type some notes and refresh the page to show they persist.
   - Return to `/dashboard`:
     - Show updated stats and “Your Past Sessions”.

This README now reflects the **actual app + your custom features**, and you can use it as a study guide to confidently answer questions in your evaluation.
