import React, { Suspense, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Link, Route, Routes, useNavigate, Navigate } from "react-router-dom";
import { BrowserRouter } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  ArrowDown,
  BarChart3,
  Bell,
  Brain,
  CheckCircle2,
  Cloud,
  ExternalLink,
  Download,
  Github,
  FileText,
  HeartPulse,
  Languages,
  LayoutDashboard,
  Lock,
  Menu,
  Mic,
  Moon,
  Play,
  Radio,
  Settings,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Stethoscope,
  Sun,
  UserRound,
  Users,
  WifiOff,
  X,
  Linkedin,
  Mail,
  Phone
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import mockData from "./data/mockData.json";
import "./styles.css";

const navItems = ["Home", "About", "How It Works", "AI Screening", "Doctor Dashboard", "Impact", "Research", "Contact"];

const { risks, evidence, tests, technology: tech, screeningQuestions, patientReports } = mockData;

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.65, ease: "easeOut" }
};

function App() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white text-slate-800 transition-colors dark:bg-slate-950 dark:text-slate-100">
        <Navbar dark={dark} setDark={setDark} />
        <AnimatePresence mode="wait">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/screening" element={<ScreeningPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/dashboard/patient" element={
                <RequireAuth allowedRole="Patient">
                  <PatientDashboard />
                </RequireAuth>
              } />
              <Route path="/dashboard/doctor" element={
                <RequireAuth allowedRole="Doctor">
                  <DoctorDashboardPage />
                </RequireAuth>
              } />
              <Route path="/dashboard/asha" element={
                <RequireAuth allowedRole="ASHA Worker">
                  <AshaDashboard />
                </RequireAuth>
              } />
            </Routes>
          </Suspense>
        </AnimatePresence>
      </div>
    </BrowserRouter>
  );
}

const authStorageKey = "shakti-auth";
const patientProfilesStorageKey = "shakti-patient-profiles";

function getStoredAuth() {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem(authStorageKey));
  } catch {
    return null;
  }
}

function getStoredPatientProfiles() {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(patientProfilesStorageKey) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function savePatientProfile(name, password) {
  const trimmedName = name.trim();
  const trimmedPassword = password.trim();
  if (!trimmedName || !trimmedPassword) return null;

  const profiles = getStoredPatientProfiles();
  const existing = profiles.find((profile) => profile.name.toLowerCase() === trimmedName.toLowerCase() && profile.password === trimmedPassword);

  if (existing) {
    existing.lastSeen = new Date().toISOString();
    localStorage.setItem(patientProfilesStorageKey, JSON.stringify(profiles));
    return existing;
  }

  const profile = { name: trimmedName, password: trimmedPassword, lastSeen: new Date().toISOString() };
  profiles.unshift(profile);
  localStorage.setItem(patientProfilesStorageKey, JSON.stringify(profiles.slice(0, 25)));
  return profile;
}

function RequireAuth({ allowedRole, children }) {
  const auth = getStoredAuth();
  if (!auth || auth.role !== allowedRole) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function Navbar({ dark, setDark }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all ${scrolled ? "border-b border-slate-200/70 bg-white/88 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/86" : "bg-transparent"}`}>
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-6" aria-label="Primary navigation">
        <Link to="/" className="flex items-center gap-3 font-heading text-xl font-extrabold tracking-wide text-shakti-pink">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-shakti-pink to-shakti-purple text-white shadow-glow">
            <Sparkles size={20} />
          </span>
          SHAKTI AI
        </Link>
        <div className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <a key={item} href={item === "Home" ? "/#home" : `/#${slug(item)}`} className="rounded-full px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-shakti-pink/10 hover:text-shakti-pink dark:text-slate-200">
              {item}
            </a>
          ))}
        </div>
        <div className="hidden items-center gap-2 lg:flex">
          <button onClick={() => setDark(!dark)} className="icon-btn" aria-label="Toggle dark mode">
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <Link to="/login" className="btn btn-secondary">Login</Link>
        </div>
        <button onClick={() => setOpen(true)} className="icon-btn lg:hidden" aria-label="Open menu">
          <Menu />
        </button>
      </nav>
      {open && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm lg:hidden">
          <div className="ml-auto h-full w-80 max-w-[88vw] bg-white p-5 shadow-2xl dark:bg-slate-900">
            <div className="mb-6 flex items-center justify-between">
              <strong className="font-heading text-shakti-pink">SHAKTI AI</strong>
              <button className="icon-btn" onClick={() => setOpen(false)} aria-label="Close menu"><X /></button>
            </div>
            <div className="grid gap-2">
              {navItems.map((item) => (
                <a key={item} onClick={() => setOpen(false)} href={item === "Home" ? "/#home" : `/#${slug(item)}`} className="rounded-xl px-4 py-3 font-semibold hover:bg-slate-100 dark:hover:bg-white/10">
                  {item}
                </a>
              ))}
              <button onClick={() => setDark(!dark)} className="mt-2 flex items-center gap-3 rounded-xl px-4 py-3 text-left font-semibold hover:bg-slate-100 dark:hover:bg-white/10">
                {dark ? <Sun size={18} /> : <Moon size={18} />}
                {dark ? "Light Mode" : "Dark Mode"}
              </button>
              <Link to="/login" onClick={() => setOpen(false)} className="btn mt-4">Login</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function HomePage() {
  return (
    <main>
      <Hero />
      <Stats />
      <Problem />
      <Solution />
      <ScreeningSection />
      <DoctorDashboardPreview />
      <ExplainableAI />
      <RuralMode />
      <Technology />
      <Research />
      <Impact />
      <Testimonials />
      <Contact />
      <Footer />
    </main>
  );
}

function Hero() {
  return (
    <section id="home" className="hero relative isolate min-h-screen overflow-hidden pt-28">
      <NeuralBackground />
      <div className="mx-auto grid min-h-[calc(100vh-7rem)] max-w-7xl items-center gap-12 px-4 pb-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-6">
        <motion.div {...fadeUp}>
          <span className="pill"><ShieldCheck size={16} /> SHAKTI AI</span>
          <h1 className="mt-7 font-heading text-5xl font-extrabold leading-tight text-slate-950 dark:text-white sm:text-6xl lg:text-7xl">
            SHAKTI AI
            <span className="block bg-gradient-to-r from-shakti-pink via-shakti-purple to-shakti-teal bg-clip-text text-3xl text-transparent sm:text-4xl lg:text-5xl">Silent Health Crisis Detector for Women</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
            One 4-minute conversation. Five silent health conditions screened. AI-powered multilingual clinical decision support built for India and scalable globally.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/screening" className="btn"><Mic size={18} /> Start AI Screening</Link>
            <a href="#ai-screening" className="btn btn-secondary"><Play size={18} /> Watch Demo</a>
            <a href="#research" className="btn btn-ghost"><FileText size={18} /> Research Paper</a>
          </div>
          <div className="mt-8 flex flex-wrap gap-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
            {["English", "Tamil", "Hindi", "Telugu"].map((lang) => <span className="mini-chip" key={lang}>{lang}</span>)}
          </div>
        </motion.div>
        <HeroVisual />
      </div>
    </section>
  );
}

function HeroVisual() {
  return (
    <motion.div {...fadeUp} className="relative mx-auto w-full max-w-xl">
      <div className="absolute -left-8 top-12 z-10 hidden animate-float rounded-3xl border border-white/50 bg-white/80 p-4 shadow-glow backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80 sm:block">
        <HeartPulse className="text-shakti-pink" />
        <p className="mt-2 text-sm font-bold">Cardiac alert</p>
      </div>
      <div className="absolute -right-4 bottom-16 z-10 animate-float rounded-3xl border border-white/50 bg-white/80 p-4 shadow-teal backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80">
        <Languages className="text-shakti-teal" />
        <p className="mt-2 text-sm font-bold">Voice first</p>
      </div>
      <div className="relative overflow-hidden rounded-[2rem] border border-white/50 bg-white/72 p-5 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/72">
        <div className="health-illustration">
          <div className="doctor-panel">
            <div className="panel-top" />
            {risks.map((risk) => (
              <div className="risk-line" key={risk.name}>
                <span>{risk.name}</span>
                <b style={{ color: risk.color }}>{risk.level}</b>
              </div>
            ))}
          </div>
          <div className="woman-figure" aria-hidden="true">
            <div className="head" />
            <div className="hair" />
            <div className="body" />
            <div className="phone"><Mic size={24} /></div>
          </div>
          <div className="assistant-orb">
            {[0, 1, 2, 3, 4].map((i) => <span key={i} style={{ animationDelay: `${i * 0.12}s` }} />)}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Stats() {
  const stats = [
    ["401M+", "Women potentially benefiting from accessible screening"],
    ["5", "Conditions screened simultaneously"],
    ["4 Minutes", "Average AI conversation"],
    ["3+", "Indian Languages"]
  ];
  return (
    <section className="section bg-shakti-mist dark:bg-slate-900" id="about">
      <div className="mx-auto grid max-w-7xl gap-4 px-4 lg:grid-cols-4 lg:px-6">
        {stats.map(([value, label], index) => <StatCard key={label} value={value} label={label} index={index} />)}
      </div>
    </section>
  );
}

function StatCard({ value, label, index }) {
  return (
    <motion.div {...fadeUp} transition={{ delay: index * 0.08, duration: 0.6 }} className="glass-card p-6 text-center">
      <div className="font-heading text-4xl font-extrabold text-shakti-pink">{value}</div>
      <p className="mt-3 text-sm font-medium leading-6 text-slate-600 dark:text-slate-300">{label}</p>
    </motion.div>
  );
}

function Problem() {
  const cards = [
    ["Female Cardiac Disease", "Symptoms often appear as fatigue, breathlessness, jaw pain, or nausea rather than classic chest pain.", HeartPulse],
    ["Osteoporosis", "Often remains undetected until the first fracture.", Activity],
    ["Autoimmune Disorders", "Diagnosis can take several years because symptoms overlap with many other conditions.", Brain],
    ["Perimenopause & Mental Health", "Mood, sleep, and cognitive symptoms are frequently misunderstood.", Moon],
    ["PCOS & Metabolic Health", "Risk may remain unnoticed until diabetes or cardiovascular complications develop.", BarChart3]
  ];
  return (
    <section className="section" id="why-early-detection-matters">
      <SectionTitle eyebrow="Problem" title="Why Early Detection Matters" text="Silent conditions often move quietly through everyday symptoms. SHAKTI AI helps surface risk patterns early for clinical review." />
      <div className="mx-auto mt-12 grid max-w-7xl gap-5 px-4 md:grid-cols-2 lg:grid-cols-5 lg:px-6">
        {cards.map(([title, text, Icon], i) => (
          <motion.article {...fadeUp} transition={{ delay: i * 0.06, duration: 0.55 }} className="hover-card min-h-64 p-5" key={title}>
            <Icon className="mb-5 text-shakti-pink" size={34} />
            <h3 className="font-heading text-lg font-bold">{title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{text}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

function Solution() {
  const steps = ["Patient Speaks", "Speech Recognition", "Medical NLP", "Risk Prediction Engine", "Clinical Reasoning", "Doctor Dashboard"];
  return (
    <section className="section bg-shakti-mist dark:bg-slate-900" id="how-it-works">
      <SectionTitle eyebrow="Solution" title="Meet SHAKTI AI" text="SHAKTI AI conducts a natural multilingual voice conversation instead of requiring lengthy forms, then organizes clinical evidence for healthcare professionals." />
      <div className="mx-auto mt-10 max-w-5xl px-4 lg:px-6">
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step, i) => (
            <motion.div {...fadeUp} transition={{ delay: i * 0.07 }} className="workflow-step" key={step}>
              <span>{String(i + 1).padStart(2, "0")}</span>
              <strong>{step}</strong>
              {i < steps.length - 1 && <ArrowDown className="mx-auto mt-4 text-shakti-teal md:hidden" />}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ScreeningSection() {
  return (
    <section className="section" id="ai-screening">
      <SectionTitle eyebrow="Interactive Demo" title="AI Screening Demo" text="A voice-first clinical conversation with progress tracking, AI processing, and an explainable risk summary." />
      <div className="mx-auto mt-10 max-w-6xl px-4 lg:px-6">
        <ScreeningDemo compact />
      </div>
    </section>
  );
}

function ScreeningPage() {
  return (
    <main className="page-shell">
      <ScreeningDemo />
    </main>
  );
}

function ScreeningDemo({ compact = false }) {
  const recognitionRef = useRef(null);
  const [messages, setMessages] = useState([["AI", screeningQuestions[0]]]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [screeningResult, setScreeningResult] = useState(null);
  const [listening, setListening] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const speechSupported = typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);
  const done = Boolean(screeningResult) && !processing && !listening;
  const awaitingPatient = !done && !processing;

  useEffect(() => {
    return () => recognitionRef.current?.abort();
  }, []);

  const resetConversation = () => {
    recognitionRef.current?.abort();
    setMessages([["AI", screeningQuestions[0]]]);
    setQuestionIndex(0);
    setTranscript("");
    setScreeningResult(null);
    setListening(false);
    setProcessing(false);
    setVoiceError("");
  };

  const continueAfterPatient = (spokenText) => {
    const combinedTranscript = `${transcript} ${spokenText}`.trim();
    setTranscript(combinedTranscript);
    setMessages((current) => [...current, ["Patient", spokenText]]);

    if (questionIndex < screeningQuestions.length - 1) {
      const nextQuestion = questionIndex + 1;
      setProcessing(true);
      setTimeout(() => {
        setMessages((current) => [...current, ["AI", screeningQuestions[nextQuestion]]]);
        setQuestionIndex(nextQuestion);
        setProcessing(false);
      }, 700);
      return;
    }

    setProcessing(true);
    setMessages((current) => [...current, ["AI", "Thank you. I will analyze only what you said and prepare a clinical support summary."]]);
    setTimeout(() => {
      setScreeningResult(analyzeTranscript(combinedTranscript));
      setProcessing(false);
    }, 850);
  };

  const startVoiceRecording = () => {
    if (!awaitingPatient || listening) return;
    setVoiceError("");

    if (!speechSupported) {
      setVoiceError("Voice recognition is not available in this browser. Please open the app in Chrome or Edge and allow microphone access.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onstart = () => setListening(true);
    recognition.onerror = (event) => {
      setListening(false);
      setVoiceError(event.error === "no-speech" ? "I could not hear speech clearly. Please tap the mic and speak again." : "Microphone permission or speech recognition failed. Please allow microphone access and retry.");
    };
    recognition.onend = () => setListening(false);
    recognition.onresult = (event) => {
      const spokenText = Array.from(event.results)
        .map((result) => result[0]?.transcript || "")
        .join(" ")
        .trim();

      if (!spokenText) {
        setVoiceError("No speech was captured. Please tap the mic and answer again.");
        return;
      }

      continueAfterPatient(spokenText);
    };

    recognition.start();
  };

  const voiceButtonLabel = () => {
    if (done) return "Restart Screening";
    if (listening) return "Listening...";
    if (processing) return questionIndex >= screeningQuestions.length - 1 ? "Analyzing Symptoms..." : "SHAKTI is Thinking...";
    if (awaitingPatient) return "Record Patient Voice";
    return "Waiting for AI";
  };

  const handleVoiceButton = () => {
    if (done) {
      resetConversation();
      return;
    }
    startVoiceRecording();
  };

  const progress = done ? 100 : Math.min(96, ((questionIndex + 1) / screeningQuestions.length) * 100);

  return (
    <div className={`grid gap-6 ${compact ? "lg:grid-cols-[1fr_0.92fr]" : "lg:grid-cols-[0.95fr_1.05fr]"} ${compact ? "lg:items-start" : "lg:items-start"}`}>
      <div className="glass-card p-5 lg:sticky lg:top-24 lg:self-start">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-shakti-pink">Voice Assistant</p>
            <h2 className="mt-1 font-heading text-2xl font-bold">Multilingual Screening</h2>
          </div>
          <button onClick={handleVoiceButton} disabled={!done && (!awaitingPatient || listening || processing)} className={`mic-orb ${awaitingPatient && !listening && !processing ? "mic-orb-ready" : ""}`} aria-label={voiceButtonLabel()}>
            <Mic />
          </button>
        </div>
        <div className="mb-4 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
          <div className="h-full rounded-full bg-gradient-to-r from-shakti-pink to-shakti-teal transition-all" style={{ width: `${progress}%` }} />
        </div>
        <div className="min-h-96 space-y-3 rounded-3xl bg-slate-50 p-4 dark:bg-slate-950/60">
          {messages.map(([speaker, message], i) => (
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className={`chat ${speaker === "AI" ? "chat-ai" : "chat-user"}`} key={`${speaker}-${i}`}>
              <strong>{speaker}</strong>
              <p>{message}</p>
            </motion.div>
          ))}
          {listening && <Waveform label="Listening to patient voice..." />}
          {processing && <Processing label={questionIndex >= screeningQuestions.length - 1 ? "Analyzing symptoms from recorded voice..." : "SHAKTI is preparing the next clinical question..."} />}
          {awaitingPatient && !listening && !processing && (
            <div className="voice-prompt">
              <Mic size={18} />
              <span>Patient action required: tap the mic, speak naturally, then SHAKTI will continue.</span>
            </div>
          )}
          {voiceError && <div className="voice-error">{voiceError}</div>}
        </div>
        <button onClick={handleVoiceButton} disabled={!done && (!awaitingPatient || listening || processing)} className="btn mt-5 w-full justify-center disabled:cursor-not-allowed disabled:opacity-60">
          {voiceButtonLabel()} {done ? <Play size={18} /> : <Mic size={18} />}
        </button>
      </div>
      <RiskSummary visible={done && !processing} result={screeningResult} />
    </div>
  );
}

function Waveform({ label = "Listening..." }) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900">
      <Radio className="text-shakti-teal" />
      <span className="text-sm font-bold text-slate-600 dark:text-slate-200">{label}</span>
      <div className="flex h-10 items-center gap-1">
        {Array.from({ length: 18 }).map((_, i) => <span className="wavebar" style={{ animationDelay: `${i * 0.045}s` }} key={i} />)}
      </div>
    </div>
  );
}

function Processing({ label = "Analyzing symptoms..." }) {
  return (
    <div className="rounded-2xl border border-shakti-teal/30 bg-shakti-teal/10 p-4">
      <div className="mb-3 flex items-center gap-2 font-bold text-shakti-teal"><Brain className="animate-pulse" /> {label}</div>
      <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-5">
        {["Cardiac", "Bone", "Autoimmune", "Mental Health", "PCOS"].map((item) => <span className="mini-chip" key={item}>{item}</span>)}
      </div>
    </div>
  );
}

function RiskSummary({ visible, result }) {
  const displayRisks = result?.risks || risks.map((risk) => ({ ...risk, level: "Pending", value: 0 }));
  const displayEvidence = result?.evidence || [];

  return (
    <div className="glass-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-shakti-purple">Risk Summary</p>
          <h2 className="mt-1 font-heading text-2xl font-bold">Clinical Decision Support</h2>
        </div>
        <ShieldCheck className="text-shakti-teal" />
      </div>
      {!result && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white/70 p-4 text-sm font-semibold leading-6 text-slate-600 dark:border-white/10 dark:bg-slate-950/50 dark:text-slate-300">
          No risk decision yet. SHAKTI will score risks only after the patient records voice responses.
        </div>
      )}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {displayRisks.map((risk, i) => (
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={visible ? { opacity: 1, scale: 1 } : { opacity: 0.55, scale: 1 }} transition={{ delay: i * 0.09 }} className="risk-card" key={risk.name}>
            <span>{risk.name === "Osteoporosis" ? "Bone Health" : risk.name === "Perimenopause" ? "Perimenopause" : `${risk.name} Risk`}</span>
            <strong style={{ color: risk.color }}>{risk.level}</strong>
            <div><i style={{ width: `${risk.value}%`, background: risk.color }} /></div>
          </motion.div>
        ))}
      </div>
      {displayEvidence.length > 0 && (
        <div className="mt-6">
          <p className="mb-3 text-sm font-extrabold uppercase tracking-[0.18em] text-shakti-pink">Evidence from voice</p>
          <div className="flex flex-wrap gap-2">
            {displayEvidence.map((item) => <span className="evidence" key={item}><CheckCircle2 size={15} /> {item}</span>)}
          </div>
        </div>
      )}
      <p className="mt-6 rounded-2xl border border-amber-300/40 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-900 dark:bg-amber-300/10 dark:text-amber-100">
        This screening supports clinical decision-making and is not a medical diagnosis.
      </p>
    </div>
  );
}

function DoctorDashboardPreview() {
  return (
    <section className="section bg-shakti-mist dark:bg-slate-900" id="doctor-dashboard">
      <SectionTitle eyebrow="Clinician Workspace" title="Doctor Dashboard" text="A professional hospital dashboard for patient triage, evidence review, suggested tests, notes, and PDF export." />
      <div className="mx-auto mt-10 max-w-7xl px-4 lg:px-6">
        <DashboardFrame preview />
      </div>
    </section>
  );
}

function DoctorDashboardPage() {
  return (
    <main className="page-shell">
      <DashboardFrame />
    </main>
  );
}

function DashboardFrame({ preview = false }) {
  const [active, setActive] = useState("Dashboard");
  const [selectedPatient, setSelectedPatient] = useState(0);
  const dashboardItems = ["Dashboard", "Patients", "Analytics", "Reports"];
  const defaultPatients = [
    { name: "Meera Raman", age: 42, language: "Tamil + English", priority: "High", status: "Needs review", lastScreened: "Today", risk: "Cardiac" },
    { name: "Priya Nair", age: 38, language: "English + Malayalam", priority: "Medium", status: "Follow-up", lastScreened: "2h ago", risk: "Bone Health" },
    { name: "Ananya Rao", age: 46, language: "Telugu + Hindi", priority: "High", status: "Escalate", lastScreened: "Yesterday", risk: "Autoimmune" }
  ];
  const [patients, setPatients] = useState(() => {
    if (typeof window === "undefined") return defaultPatients;
    const storedPatients = JSON.parse(localStorage.getItem("shakti-doctor-patients") || "[]");
    return storedPatients.length ? storedPatients : defaultPatients;
  });
  const currentPatient = patients[selectedPatient] || patients[0];

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedPatients = JSON.parse(localStorage.getItem("shakti-doctor-patients") || "[]");
    if (storedPatients.length) {
      setPatients(storedPatients);
    }
  }, []);

  const renderContent = () => {
    if (active === "Patients") {
      return (
        <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="grid gap-3">
            {patients.map((patient, index) => (
              <button type="button" key={patient.name} onClick={() => setSelectedPatient(index)} className={`rounded-2xl border p-4 text-left transition ${selectedPatient === index ? "border-shakti-pink bg-shakti-pink/10 shadow-sm" : "border-slate-200 bg-white/70 dark:border-white/10 dark:bg-slate-950/60"}`}>
                <div className="flex items-center justify-between gap-2">
                  <strong className="font-heading text-lg">{patient.name}</strong>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold uppercase tracking-[0.16em] text-slate-600 dark:bg-slate-800 dark:text-slate-200">{patient.priority}</span>
                </div>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{patient.risk} • {patient.language}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <span className="rounded-full bg-white px-2.5 py-1 dark:bg-slate-900">{patient.lastScreened}</span>
                  <span className="rounded-full bg-white px-2.5 py-1 dark:bg-slate-900">{patient.status}</span>
                </div>
              </button>
            ))}
          </div>
          <Panel title="Selected Patient Snapshot">
            <div className="space-y-3 text-sm">
              <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 dark:border-white/10 dark:bg-slate-950/60">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-shakti-pink">Current focus</p>
                <h3 className="mt-2 font-heading text-xl font-bold">{currentPatient.name}</h3>
                <p className="mt-2 text-slate-600 dark:text-slate-300">{currentPatient.risk} risk • {currentPatient.language}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {[`Age ${currentPatient.age}`, `Last screened ${currentPatient.lastScreened}`, `Priority ${currentPatient.priority.toLowerCase()}`, `Status ${currentPatient.status}`].map((item) => <span className="mini-chip" key={item}>{item}</span>)}
              </div>
              <textarea className="min-h-32 w-full resize-none rounded-2xl border border-slate-200 bg-white p-4 outline-none focus:border-shakti-pink dark:border-white/10 dark:bg-slate-950" defaultValue={`Continue follow-up for ${currentPatient.name}. Note recent symptoms and escalation guidance.`} />
            </div>
          </Panel>
        </div>
      );
    }

    if (active === "Analytics") {
      return (
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="Risk Trend">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={[24, 36, 42, 58, 73, 81].map((value, index) => ({ label: `W${index + 1}`, value }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#D81B60" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </Panel>
          <Panel title="Screening Volume">
            <div className="space-y-3">
              {[
                ["Today", 18, "bg-shakti-pink"],
                ["This week", 64, "bg-shakti-purple"],
                ["This month", 214, "bg-shakti-teal"]
              ].map(([label, value, color]) => (
                <div key={label}>
                  <div className="mb-1 flex items-center justify-between text-sm font-semibold text-slate-600 dark:text-slate-300">
                    <span>{label}</span>
                    <span>{value}</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-800">
                    <div className={`h-3 rounded-full ${color}`} style={{ width: `${Math.min(100, Number(value) / 2.4)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      );
    }

    if (active === "Reports") {
      return (
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <Panel title="Recent Reports">
            <div className="space-y-3">
              {[
                ["High-risk cardiac review", "Generated 20 mins ago"],
                ["Bone health follow-up", "Generated 1 hr ago"],
                ["Autoimmune screening summary", "Generated yesterday"]
              ].map(([title, time]) => (
                <div key={title} className="rounded-2xl border border-slate-200 bg-white/70 p-4 dark:border-white/10 dark:bg-slate-950/60">
                  <div className="flex items-center justify-between gap-2">
                    <strong className="font-heading">{title}</strong>
                    <button onClick={downloadReport} className="rounded-full bg-shakti-pink px-3 py-1 text-xs font-bold text-white">Export</button>
                  </div>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{time}</p>
                </div>
              ))}
            </div>
          </Panel>
          <Panel title="Clinical Summary">
            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <p>3 patients require urgent review today.</p>
              <p>2 follow-up labs are pending from yesterday's screening.</p>
              <p>The dashboard is ready for export to PDF and clinician review.</p>
            </div>
          </Panel>
        </div>
      );
    }

    return (
      <div className="mt-6 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <Panel title="Patient Information">
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[`Age ${currentPatient.age}`, currentPatient.language, `Last screened ${currentPatient.lastScreened}`, `Priority ${currentPatient.priority.toLowerCase()}`].map((item) => <span className="mini-chip" key={item}>{item}</span>)}
          </div>
        </Panel>
        <Panel title="Risk Heatmap">
          <div className="grid gap-2 sm:grid-cols-5">
            {risks.map((risk) => <div className="heat-tile" style={{ "--tile": risk.color }} key={risk.name}><span>{risk.name}</span><b>{risk.level}</b></div>)}
          </div>
        </Panel>
        <Panel title="Evidence Panel">
          <div className="flex flex-wrap gap-2">{evidence.map((item) => <span className="evidence" key={item}><CheckCircle2 size={15} /> {item}</span>)}</div>
        </Panel>
        <Panel title="Suggested Tests">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{tests.map((test) => <span className="test-chip" key={test}>{test}</span>)}</div>
        </Panel>
        <Panel title="Timeline">
          <ResponsiveContainer width="100%" height={170}>
            <LineChart data={[20, 32, 48, 44, 61, 86].map((v, i) => ({ visit: `V${i + 1}`, risk: v }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="visit" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="risk" stroke="#D81B60" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </Panel>
        <Panel title="Consultation Notes">
          <textarea className="min-h-40 w-full resize-none rounded-2xl border border-slate-200 bg-white p-4 outline-none focus:border-shakti-pink dark:border-white/10 dark:bg-slate-950" defaultValue="Review cardiac symptoms and sleep changes. Consider ECG and lipid panel before next consultation." />
        </Panel>
      </div>
    );
  };

  return (
    <div className="dashboard-frame font-dashboard">
      <aside className="dashboard-sidebar">
        <strong>SmartCare AI</strong>
        {dashboardItems.map((item, i) => {
          const Icon = [LayoutDashboard, Users, BarChart3, FileText][i];
          return (
            <button type="button" onClick={() => setActive(item)} className={active === item ? "active" : ""} key={item}>
              <Icon size={18} /> {item}
            </button>
          );
        })}
      </aside>
      <div className="dashboard-main">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-shakti-pink">Today's Review</p>
            <h2 className="mt-1 font-heading text-2xl font-bold">{active}: {currentPatient.name}, {currentPatient.age}</h2>
          </div>
          <button onClick={() => downloadReport(currentPatient)} className="btn"><Download size={18} /> Download Report</button>
        </div>
        {renderContent()}
      </div>
    </div>
  );
}

function ExplainableAI() {
  const rows = [
    ["Patient Statement", "I feel tired and breathless sometimes", 92],
    ["Medical Evidence", "Fatigue, jaw discomfort, sleep disruption", 88],
    ["Clinical Guidelines", "Risk factors mapped to screening pathway", 81],
    ["Risk Prediction", "Cardiac and perimenopause risk elevated", 86],
    ["Doctor Recommendation", "Suggested evaluation and tests", 78]
  ];
  return (
    <section className="section" id="why-the-ai-suggested-these-risks">
      <SectionTitle eyebrow="Explainable AI" title="Why the AI Suggested These Risks" text="SHAKTI AI turns conversational signals into evidence that clinicians can inspect, question, and act on." />
      <div className="mx-auto mt-10 max-w-5xl px-4 lg:px-6">
        {rows.map(([label, text, score], i) => (
          <motion.div {...fadeUp} className="explain-row" key={label}>
            <span>{label}</span>
            <p>{text}</p>
            <b>{score}%</b>
            {i < rows.length - 1 && <ArrowDown className="absolute -bottom-5 left-8 text-shakti-teal" />}
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function RuralMode() {
  return (
    <section className="section bg-shakti-mist dark:bg-slate-900">
      <SectionTitle eyebrow="Offline First" title="Rural Healthcare Mode" text="Designed for ASHA workers and low-connectivity settings with offline storage and sync when internet is available." />
      <div className="mx-auto mt-10 grid max-w-6xl gap-6 px-4 lg:grid-cols-[0.85fr_1.15fr] lg:px-6">
        <div className="rural-visual">
          <Smartphone size={70} />
          <WifiOff className="absolute right-10 top-10 text-shakti-pink" size={38} />
          <span className="absolute bottom-8 left-8 rounded-2xl bg-white/80 px-4 py-3 font-bold shadow-lg dark:bg-slate-900/80">ASHA field screening</span>
        </div>
        <div className="grid gap-4">
          {["Voice Conversation", "Offline Storage", "Sync when Internet Available", "Hospital Dashboard"].map((item, i) => <div className="workflow-step text-left" key={item}><span>{i + 1}</span><strong>{item}</strong></div>)}
        </div>
      </div>
    </section>
  );
}

function Technology() {
  return (
    <section className="section" id="technology">
      <SectionTitle eyebrow="Stack" title="Technology Foundation" text="A modular stack for mobile screening, secure dashboards, clinical reasoning, and explainable analytics." />
      <div className="mx-auto mt-10 grid max-w-7xl gap-4 px-4 sm:grid-cols-2 lg:grid-cols-4 lg:px-6">
        {tech.map((item, i) => <motion.div {...fadeUp} transition={{ delay: i * 0.03 }} className="tech-card" key={item}><Cloud className="text-shakti-teal" /> {item}</motion.div>)}
      </div>
    </section>
  );
}

function Research() {
  const flow = ["Patient", "Speech-to-Text", "Medical NLP", "Risk Prediction Models", "Clinical Reasoning Engine", "SmartCare AI Dashboard"];
  return (
    <section className="section bg-shakti-mist dark:bg-slate-900" id="research">
      <SectionTitle eyebrow="Research" title="Clinical Decision Support Architecture" text="SHAKTI AI functions as a clinical decision support and early screening platform, helping prioritize women who may benefit from timely evaluation." />
      <div className="mx-auto mt-10 max-w-4xl px-4 lg:px-6">
        <div className="architecture">
          {flow.map((item, i) => <React.Fragment key={item}><div>{item}</div>{i < flow.length - 1 && <ArrowDown />}</React.Fragment>)}
        </div>
      </div>
    </section>
  );
}

function Impact() {
  const [region, setRegion] = useState("South");

  return (
    <section className="section" id="impact">
      <SectionTitle eyebrow="Impact" title="India-Scale Screening Potential" text="Earlier identification of women who may benefit from timely clinical evaluation." />
      <div className="mx-auto mt-10 grid max-w-6xl gap-6 px-4 lg:grid-cols-2 lg:px-6">
        <div className="india-map" aria-label="Interactive India map visualization">
          {["North", "West", "Central", "East", "South"].map((r, i) => (
            <button onClick={() => setRegion(r)} className={region === r ? "active" : ""} style={{ "--x": `${25 + i * 13}%`, "--y": `${24 + (i % 3) * 18}%` }} key={r}>
              {r}
            </button>
          ))}
          <div className="map-summary">
            <strong>{region} outreach selected</strong>
            <span>Estimated mobile screening cluster ready for ASHA-led deployment.</span>
          </div>
        </div>
        <div className="grid gap-4">
          <StatCard value="401 Million+" label="Potential Reach" />
          <StatCard value="4 Minutes" label="Average Screening Time" />
          <div className="glass-card p-6">
            <ResponsiveContainer width="100%" height={210}>
              <AreaChart data={[120, 180, 260, 310, 401].map((v, i) => ({ year: 2022 + i, reach: v }))}>
                <defs><linearGradient id="reach" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#D81B60" stopOpacity={0.35}/><stop offset="95%" stopColor="#D81B60" stopOpacity={0}/></linearGradient></defs>
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="reach" stroke="#D81B60" fill="url(#reach)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const items = [
    ["Doctor", "The evidence panel makes it easier to review risk signals quickly without losing clinical judgment."],
    ["Patient", "It felt like a calm conversation, not a long hospital form."],
    ["ASHA Worker", "Offline mode helps us continue screenings even when connectivity drops."],
    ["Hospital Administrator", "The dashboard supports prioritization and structured reporting for outreach programs."]
  ];
  return (
    <section className="section bg-shakti-mist dark:bg-slate-900">
      <SectionTitle eyebrow="Voices" title="Testimonials" />
      <div className="mx-auto mt-10 grid max-w-7xl gap-4 px-4 md:grid-cols-2 lg:grid-cols-4 lg:px-6">
        {items.map(([role, quote]) => <blockquote className="hover-card p-6" key={role}><p className="leading-7">"{quote}"</p><footer className="mt-5 font-bold text-shakti-pink">{role}</footer></blockquote>)}
      </div>
    </section>
  );
}

function Contact() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setSent(true);
  };

  return (
    <section className="section contact-section" id="contact">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 lg:grid-cols-[0.8fr_1.2fr] lg:px-6">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.28em] text-shakti-pink">IEEE WIE 2026</p>
          <h2 className="mt-3 font-heading text-3xl font-extrabold text-slate-950 dark:text-white sm:text-4xl">Bring earlier care closer to every woman.</h2>
          <p className="mt-4 max-w-lg leading-8 text-slate-600 dark:text-slate-300">Team SHAKTI AI is building a multilingual screening and clinical decision support layer for hospitals, public health teams, and community workers.</p>
          <div className="mt-8 grid gap-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
            <a className="contact-link" href="mailto:team@shaktiai.health"><Mail size={18} /> team@shaktiai.health</a>
            <a className="contact-link" href="tel:+918000000000"><Phone size={18} /> +91 80000 00000</a>
            <span className="contact-link"><ExternalLink size={18} /> Bengaluru, India</span>
          </div>
          <div className="mt-6 flex gap-3">
            <a className="icon-btn" href="https://github.com" target="_blank" rel="noreferrer" aria-label="SHAKTI AI on GitHub"><Github size={18} /></a>
            <a className="icon-btn" href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="SHAKTI AI on LinkedIn"><Linkedin size={18} /></a>
          </div>
        </div>
        <div className="contact-grid">
          <form className="glass-card p-6" onSubmit={handleSubmit}>
            <div className="mb-5">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-shakti-purple">Connect with Team SHAKTI</p>
              <h3 className="mt-2 font-heading text-2xl font-bold">Start a conversation</h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input className="field" placeholder="Full name" aria-label="Full name" required />
              <input className="field" type="email" placeholder="Work email" aria-label="Work email" required />
            </div>
            <textarea className="field mt-3 min-h-32 resize-none" placeholder="How can we collaborate?" aria-label="Message" required />
            {sent && <p className="mt-3 rounded-2xl bg-shakti-teal/10 p-3 text-sm font-semibold text-teal-800 dark:text-teal-200">Thanks. Your message is ready for the Team SHAKTI follow-up queue.</p>}
            <button className="btn mt-4" type="submit">Send message <ExternalLink size={17} /></button>
          </form>
          <div className="map-placeholder" aria-label="Map placeholder showing Bengaluru, India">
            <div className="map-grid" />
            <span className="map-pin">●</span>
            <div className="map-label"><strong>Team SHAKTI AI</strong><span>Bengaluru, India</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 py-10 text-white dark:border-white/10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 sm:flex-row sm:items-end sm:justify-between lg:px-6">
        <div>
          <Link to="/" className="font-heading text-xl font-extrabold tracking-wide text-white">SHAKTI <span className="text-shakti-pink">AI</span></Link>
          <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">Multilingual AI-powered clinical screening and decision support for women.</p>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-slate-300">
          <a href="#about" className="hover:text-white">About</a>
          <a href="#research" className="hover:text-white">Research</a>
          <a href="#contact" className="hover:text-white">Contact</a>
          <a href="#contact" className="hover:text-white">Privacy</a>
          <a href="#contact" className="hover:text-white">Terms</a>
        </div>
        <p className="text-sm text-slate-500">SHAKTI AI © 2026</p>
      </div>
    </footer>
  );
}

function LoginPage() {
  const navigate = useNavigate();
  const [loginValues, setLoginValues] = useState({
    Patient: { id: "", password: "" },
    Doctor: { id: "doctor@demo", password: "doctor123" },
    "ASHA Worker": { id: "asha@demo", password: "asha123" }
  });
  const [errorRole, setErrorRole] = useState("");
  const portals = [
    { role: "Patient", text: "Start screenings, view reports, manage appointments.", path: "/dashboard/patient", Icon: UserRound, id: "any email or name", password: "any password" },
    { role: "Doctor", text: "Review risk alerts, notes, analytics, and reports.", path: "/dashboard/doctor", Icon: Stethoscope, id: "doctor@demo", password: "doctor123" },
    { role: "ASHA Worker", text: "Manage offline screenings and village sync.", path: "/dashboard/asha", Icon: Users, id: "asha@demo", password: "asha123" }
  ];

  const handleLogin = (role, path) => {
    const values = loginValues[role];
    const portal = portals.find((item) => item.role === role);

    if (typeof window !== "undefined") {
      if (role === "Patient") {
        if (values.id.trim() && values.password.trim()) {
          const profile = savePatientProfile(values.id.trim(), values.password.trim());
          localStorage.setItem(authStorageKey, JSON.stringify({ role, id: values.id.trim(), name: profile?.name || values.id.trim(), password: values.password.trim(), timestamp: new Date().toISOString() }));
          setErrorRole("");
          navigate(path);
          return;
        }
      } else if (values.id === portal.id && values.password === portal.password) {
        localStorage.setItem(authStorageKey, JSON.stringify({ role, id: values.id, timestamp: new Date().toISOString() }));
        setErrorRole("");
        navigate(path);
        return;
      }
    }

    setErrorRole(role);
  };

  return (
    <main className="page-shell">
      <SectionTitle eyebrow="Secure Login" title="Choose Your Portal" text="Mock authentication for prototype demonstration." />
      <div className="mx-auto mt-10 grid max-w-6xl grid-cols-1 gap-5 px-4 sm:grid-cols-2 xl:grid-cols-3 lg:px-6">
        {portals.map(({ role, text, path, Icon, id, password }) => (
          <div className="hover-card flex h-full flex-col p-6" key={role}>
            <Icon className="text-shakti-pink" size={38} />
            <h2 className="mt-5 font-heading text-2xl font-bold">{role}</h2>
            <p className="mt-3 min-h-20 text-sm leading-6 text-slate-600 dark:text-slate-300">{text}</p>
            <input
              className="field mt-3"
              placeholder={`${role} ID`}
              aria-label={`${role} ID`}
              value={loginValues[role].id}
              onChange={(event) => setLoginValues((current) => ({ ...current, [role]: { ...current[role], id: event.target.value } }))}
            />
            <input
              className="field mt-3"
              placeholder="Password"
              type="password"
              aria-label="Password"
              value={loginValues[role].password}
              onChange={(event) => setLoginValues((current) => ({ ...current, [role]: { ...current[role], password: event.target.value } }))}
            />
            <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs font-semibold leading-5 text-slate-600 dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-300">
              <p className="font-bold text-slate-800 dark:text-slate-100">Demo credentials</p>
              <p>ID: {id}</p>
              <p>Password: {password}</p>
            </div>
            {errorRole === role && (
              <p className="mt-3 rounded-2xl border border-amber-300/40 bg-amber-50 p-3 text-sm font-semibold text-amber-900 dark:bg-amber-300/10 dark:text-amber-100">
                Use {id} and {password} for the {role.toLowerCase()} demo.
              </p>
            )}
            <button onClick={() => handleLogin(role, path)} className="btn mt-4 w-full justify-center"><Lock size={17} /> Login</button>
          </div>
        ))}
      </div>
    </main>
  );
}

function PatientDashboard() {
  return <Portal title="Patient Portal" items={["Start AI Screening", "Previous Reports", "Appointments", "Health Education", "Notifications", "Profile"]} icon={UserRound} showScreeningInline />;
}

function AshaDashboard() {
  const [active, setActive] = useState("Offline Screenings");
  const [patientRecords, setPatientRecords] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = JSON.parse(localStorage.getItem("shakti-doctor-patients") || "[]");
      return Array.isArray(stored) ? stored : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const syncPatients = () => {
      try {
        const stored = JSON.parse(localStorage.getItem("shakti-doctor-patients") || "[]");
        setPatientRecords(Array.isArray(stored) ? stored : []);
      } catch {
        setPatientRecords([]);
      }
    };

    syncPatients();
    window.addEventListener("storage", syncPatients);
    return () => window.removeEventListener("storage", syncPatients);
  }, []);

  const modules = [
    { title: "Offline Screenings", description: "Continue screenings in low-connectivity areas.", stats: ["12 pending", "3 completed today"] },
    { title: "Pending Synchronization", description: "Upload completed screenings once the network is back.", stats: ["5 uploads", "2 failed retries"] },
    { title: "Village Reports", description: "Review community health trends by village.", stats: ["Rural block A", "2 high-risk alerts"] },
    { title: "Daily Activity", description: "Track visits, referrals, and follow-up work.", stats: ["8 visits", "4 referrals"] },
    { title: "Patient List", description: "See the patients assigned for community follow-up.", stats: [`${patientRecords.length} patients`, `${Math.max(0, patientRecords.filter((item) => item.priority === "High").length)} high priority`] }
  ];

  const currentModule = modules.find((item) => item.title === active) || modules[0];

  return (
    <main className="page-shell">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="mb-8 flex items-center gap-4">
          <span className="grid h-14 w-14 place-items-center rounded-3xl bg-shakti-teal text-white"><Users /></span>
          <div>
            <h1 className="font-heading text-3xl font-bold">ASHA Worker Dashboard</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Community screening operations with live follow-up actions.</p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-3">
            {modules.map((item) => (
              <button
                key={item.title}
                type="button"
                onClick={() => setActive(item.title)}
                className={`w-full rounded-2xl border p-4 text-left transition ${active === item.title ? "border-shakti-teal bg-shakti-teal/10 shadow-sm" : "border-slate-200 bg-white/70 dark:border-white/10 dark:bg-slate-950/60"}`}
              >
                <div className="flex items-center justify-between">
                  <strong className="font-heading text-lg">{item.title}</strong>
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-shakti-teal">Open</span>
                </div>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.description}</p>
              </button>
            ))}
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/80">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-shakti-pink">Current Module</p>
            <h2 className="mt-2 font-heading text-2xl font-bold">{currentModule.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{currentModule.description}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {currentModule.stats.map((stat) => (
                <div key={stat} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-700 dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-200">
                  {stat}
                </div>
              ))}
            </div>
            {active === "Patient List" && patientRecords.length > 0 ? (
              <div className="mt-6 space-y-3">
                {patientRecords.slice(0, 5).map((patient) => (
                  <div key={`${patient.name}-${patient.timestamp}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-200">
                    <div className="flex items-center justify-between gap-2">
                      <strong>{patient.name}</strong>
                      <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold dark:bg-slate-900">{patient.priority}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{patient.risk} • {patient.symptoms}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-dashed border-shakti-teal/40 bg-shakti-teal/10 p-4 text-sm text-slate-700 dark:text-slate-200">
                Action ready: sync records, call patient, or review the next village visit.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function PatientIntakeFlow() {
  const prompts = [
    { key: "name", question: "Hello! I’m SHAKTI. What is your name?", label: "Your name" },
    { key: "age", question: "Thank you. What is your age?", label: "Your age" },
    { key: "symptoms", question: "Great. What symptoms are you experiencing today?", label: "Symptoms" }
  ];
  const storedAuth = getStoredAuth();
  const returningPatientName = storedAuth?.role === "Patient" && storedAuth.name ? storedAuth.name : "";
  const startingStep = returningPatientName ? 1 : 0;
  const [step, setStep] = useState(startingStep);
  const [input, setInput] = useState("");
  const [details, setDetails] = useState({ name: returningPatientName, age: "", symptoms: "" });
  const [messages, setMessages] = useState(() => {
    if (returningPatientName) {
      return [
        { speaker: "AI", text: `Welcome back, ${returningPatientName}. I’ll ask for your age and symptoms so your doctor can review your case.` },
        { speaker: "AI", text: prompts[1].question }
      ];
    }

    return [
      { speaker: "AI", text: "Hello! I’m SHAKTI. I’ll ask a few quick details so your doctor can review your case." },
      { speaker: "AI", text: prompts[0].question }
    ];
  });
  const [mode, setMode] = useState("text");
  const [listening, setListening] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const [analysisReport, setAnalysisReport] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [patientRecord, setPatientRecord] = useState(null);
  const speechSupported = typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);
  const intakeComplete = step >= prompts.length;
  const currentPrompt = prompts[step] || prompts[prompts.length - 1];

  const submitAnswer = (event) => {
    if (event) event.preventDefault();
    if (!input.trim()) return;

    const trimmed = input.trim();
    const currentPrompt = prompts[step];
    if (!currentPrompt) return;

    const nextDetails = { ...details, [currentPrompt.key]: trimmed };
    setDetails(nextDetails);
    setMessages((current) => [...current, { speaker: "Patient", text: trimmed }]);

    if (step < prompts.length - 1) {
      setMessages((current) => [...current, { speaker: "AI", text: prompts[step + 1].question }]);
      setStep((current) => current + 1);
      setInput("");
      return;
    }

    const symptomText = nextDetails.symptoms.toLowerCase();
    const risk = /pain|breath|chest|heart|fatigue/.test(symptomText) ? "Cardiac" : /bone|joint|back/.test(symptomText) ? "Bone Health" : /rash|fever|swollen|autoimmune/.test(symptomText) ? "Autoimmune" : "General";
    const priority = /pain|breath|chest|heart|severe/.test(symptomText) ? "High" : "Medium";
    const analysis = `SHAKTI summary: ${nextDetails.name}, age ${nextDetails.age}, reports ${nextDetails.symptoms}. Priority status is ${priority} and the system indicates ${risk.toLowerCase()} risk.`;
    const diagnosis = risk === "Cardiac"
      ? "Possible cardiac concern detected. Please review this with your doctor immediately."
      : risk === "Bone Health"
      ? "Bone health concern is likely. A follow-up evaluation is recommended."
      : risk === "Autoimmune"
      ? "Signs point to a possible autoimmune or inflammatory issue. Doctor review is advised."
      : "Symptoms appear general but medical review is still recommended for a clinical diagnosis.";
    const record = {
      name: nextDetails.name,
      age: nextDetails.age,
      language: "Patient intake",
      priority,
      status: "Needs review",
      lastScreened: "Just now",
      risk,
      symptoms: nextDetails.symptoms,
      timestamp: new Date().toISOString(),
      analysis,
      diagnosis
    };

    const storedPatients = JSON.parse(localStorage.getItem("shakti-doctor-patients") || "[]");
    storedPatients.unshift(record);
    localStorage.setItem("shakti-doctor-patients", JSON.stringify(storedPatients));

    setPatientRecord(record);
    setAnalysisReport(analysis);
    setDiagnosis(diagnosis);
    setMessages((current) => [
      ...current,
      { speaker: "AI", text: "Thanks. I’ve analyzed your responses and prepared a diagnosis summary." },
      { speaker: "AI", text: analysis },
      { speaker: "AI", text: `Diagnosis: ${diagnosis}` },
      { speaker: "AI", text: "Your full record has been sent securely to the doctor dashboard for review." }
    ]);
    setInput("");
    setStep(prompts.length);
  };

  const startVoiceRecording = () => {
    setVoiceError("");
    if (!speechSupported) {
      setVoiceError("Voice recognition is not available in this browser.");
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => setListening(true);
    recognition.onerror = (event) => {
      setListening(false);
      setVoiceError(event.error === "no-speech" ? "I couldn't hear you clearly. Please try again." : "Microphone permission was denied or recognition failed.");
    };
    recognition.onend = () => setListening(false);
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results).map((result) => result[0]?.transcript || "").join(" ").trim();
      if (transcript) {
        setInput(transcript);
      } else {
        setVoiceError("No speech was captured. Please try again.");
      }
    };
    recognition.start();
  };

  const downloadPatientReport = async () => {
    const patient = patientRecord;
    if (!patient) return;
    const { jsPDF } = await import("jspdf");
    const pdf = new jsPDF();
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(20);
    pdf.text("SHAKTI AI Patient Summary", 18, 24);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    pdf.text(`Name: ${patient.name}`, 18, 38);
    pdf.text(`Age: ${patient.age}`, 18, 46);
    pdf.text(`Symptoms: ${patient.symptoms}`, 18, 54, { maxWidth: 170 });
    pdf.text(`Risk: ${patient.risk}`, 18, 76);
    pdf.text(`Priority: ${patient.priority}`, 18, 84);
    pdf.text(`Diagnosis: ${patient.diagnosis}`, 18, 92, { maxWidth: 170 });
    pdf.text(`Report: ${patient.analysis}`, 18, 106, { maxWidth: 170 });
    pdf.text("Disclaimer: This is a screening summary and not a medical diagnosis.", 18, 136, { maxWidth: 170 });
    pdf.save("shakti-ai-patient-summary.pdf");
  };

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-slate-900/80">
      <div className="mb-4 rounded-2xl border border-shakti-pink/20 bg-shakti-pink/10 p-4 text-sm font-semibold text-shakti-pink">
        Choose voice or text input. SHAKTI will analyze your symptoms and create a report that your doctor can review.
      </div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => setMode("text")} className={`btn ${mode === "text" ? "bg-shakti-pink text-white" : "btn-secondary"}`}>Text</button>
        <button type="button" onClick={() => setMode("voice")} className={`btn ${mode === "voice" ? "bg-shakti-pink text-white" : "btn-secondary"}`}>Voice</button>
      </div>
      <div className="space-y-3 rounded-3xl bg-slate-50 p-4 dark:bg-slate-950/60">
        {messages.map((message, index) => (
          <div key={`${message.speaker}-${index}`} className={`chat ${message.speaker === "AI" ? "chat-ai" : "chat-user"}`}>
            <strong>{message.speaker}</strong>
            <p>{message.text}</p>
          </div>
        ))}
      </div>
      {!intakeComplete ? (
        mode === "voice" ? (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button type="button" onClick={startVoiceRecording} className="btn w-full sm:w-auto justify-center" disabled={listening}>
              {listening ? "Listening..." : "Record Voice"}
            </button>
            <input className="field flex-1" value={input} onChange={(event) => setInput(event.target.value)} placeholder={currentPrompt.label} aria-label={currentPrompt.label} />
          </div>
        ) : (
          <form onSubmit={submitAnswer} className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              className="field flex-1"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={currentPrompt.label}
              aria-label={currentPrompt.label}
            />
            <button type="submit" className="btn justify-center">Send</button>
          </form>
        )
      ) : (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-100 p-4 text-sm text-slate-700 dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-200">
          Intake complete. You can download your report below or continue on the patient dashboard.
        </div>
      )}
      {voiceError && <div className="mt-3 rounded-2xl border border-rose-300 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-100">{voiceError}</div>}
      {step >= prompts.length && patientRecord && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white/70 p-4 dark:border-white/10 dark:bg-slate-950/70">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-shakti-pink">Patient Summary</p>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{analysisReport}</p>
          <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">Diagnosis: {diagnosis}</p>
          <button type="button" onClick={downloadPatientReport} className="btn mt-4">Download Report</button>
        </div>
      )}
    </div>
  );
}

function Portal({ title, items, icon: Icon, showScreeningInline = false }) {
  const navigate = useNavigate();
  const [active, setActive] = useState(items[0]);
  const [showScreening, setShowScreening] = useState(showScreeningInline);

  const runPortalAction = (item) => {
    setActive(item);
    if (item === "Start AI Screening") {
      if (showScreeningInline) {
        setShowScreening(true);
        return;
      }
      navigate("/screening");
      return;
    }
    setShowScreening(false);
    if (item === "Previous Reports" || item === "Reports" || item === "Export Reports") downloadReport();
  };

  return (
    <main className="page-shell">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="mb-8 flex items-center gap-4">
          <span className="grid h-14 w-14 place-items-center rounded-3xl bg-shakti-pink text-white"><Icon /></span>
          <h1 className="font-heading text-3xl font-bold">{title}</h1>
        </div>
        {showScreeningInline && showScreening ? (
          <PatientIntakeFlow />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <button type="button" onClick={() => runPortalAction(item)} className={`portal-card hover-card p-6 text-left ${active === item ? "active" : ""}`} key={item}>
                <Bell className="text-shakti-teal" />
                <h2 className="mt-5 font-heading text-xl font-bold">{item}</h2>
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{portalCopy(item)}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function SectionTitle({ eyebrow, title, text }) {
  return (
    <motion.div {...fadeUp} className="mx-auto max-w-3xl px-4 text-center lg:px-6">
      {eyebrow && <p className="text-sm font-extrabold uppercase tracking-[0.28em] text-shakti-pink">{eyebrow}</p>}
      <h2 className="mt-3 font-heading text-3xl font-extrabold text-slate-950 dark:text-white sm:text-4xl">{title}</h2>
      {text && <p className="mt-4 text-base leading-8 text-slate-600 dark:text-slate-300">{text}</p>}
    </motion.div>
  );
}

function Panel({ title, children }) {
  return <section className="dash-panel"><h3>{title}</h3>{children}</section>;
}

function NeuralBackground() {
  return <div className="neural-bg" aria-hidden="true">{Array.from({ length: 22 }).map((_, i) => <span key={i} style={{ "--x": `${Math.random() * 100}%`, "--y": `${Math.random() * 100}%`, "--d": `${2 + Math.random() * 4}s` }} />)}</div>;
}

function PageLoader() {
  return <div className="grid min-h-screen place-items-center"><div className="mic-orb"><Sparkles /></div></div>;
}

function slug(value) {
  return value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function portalCopy(item) {
  const copy = {
    "Start AI Screening": "Open the voice assistant and begin the patient-led conversation.",
    "Previous Reports": "Download the latest mock risk report for review.",
    Appointments: "View upcoming consultation slots and follow-up reminders.",
    "Health Education": "Open condition-aware education modules for patients.",
    Notifications: "Review high-priority alerts and screening reminders.",
    Profile: "Manage demographic and language preferences.",
    "Offline Screenings": "Review locally saved village screenings.",
    "Pending Synchronization": "Check records waiting for internet sync.",
    "Village Reports": "Open village-level outreach summaries.",
    "Daily Activity": "Track today's screening progress.",
    "Patient List": "View patients assigned for community follow-up.",
    "Today's Patients": "Open the current clinical queue.",
    "High Priority Alerts": "Focus on patients with elevated screening risk.",
    Reports: "Download the current mock clinical report.",
    "Clinical Notes": "Review structured consultation notes.",
    Analytics: "Inspect screening trends and risk distribution.",
    "Patient History": "Open longitudinal screening records.",
    "Export Reports": "Download a PDF report with mock clinical data."
  };

  return copy[item] || "Prototype module ready for IEEE demo workflow.";
}

async function downloadReport(patient = null) {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF();
  const patientName = patient?.name || "Patient";
  const patientAge = patient?.age || "N/A";
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(216, 27, 96);
  pdf.setFontSize(22);
  pdf.text("SHAKTI AI Risk Report", 18, 22);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(30, 41, 59);
  pdf.setFontSize(11);
  pdf.text(`Patient: ${patientName} | Age: ${patientAge} | Screening: Voice AI prototype`, 18, 34);
  risks.forEach((risk, index) => pdf.text(`${risk.name}: ${risk.level} (${risk.value}%)`, 18, 50 + index * 10));
  pdf.text("Suggested Tests: ECG, Lipid Profile, HbA1c, Vitamin D, DEXA Scan, ANA Profile, ESR, CRP", 18, 110, { maxWidth: 170 });
  pdf.text("Disclaimer: This screening supports clinical decision-making and is not a medical diagnosis.", 18, 132, { maxWidth: 170 });
  pdf.save("shakti-ai-risk-report.pdf");
}

createRoot(document.getElementById("root")).render(<App />);
