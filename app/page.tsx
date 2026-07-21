"use client";

import { FormEvent, useMemo, useState } from "react";

type Appeal = {
  id: number;
  bloodGroup: string;
  donorsNeeded: number;
  pledged: number;
  hospital: string;
  area: string;
  distance: string;
  deadline: string;
  verification: string;
  note: string;
  urgent?: boolean;
};

type Analysis = {
  hospital: string;
  bloodGroup: string;
  donorsNeeded: number;
  deadline: string;
  area: string;
  privacyNote: string;
  missingInformation: string[];
  mode: "gpt-5.6" | "demo";
};

const initialAppeals: Appeal[] = [
  {
    id: 1,
    bloodGroup: "A+",
    donorsNeeded: 2,
    pledged: 1,
    hospital: "Riyadh Central Hospital",
    area: "Al Sulaymaniyah",
    distance: "4.2 km",
    deadline: "Today · 9:00 PM",
    verification: "Request document supplied",
    note: "The hospital blood bank asked the family to bring eligible donors before tonight.",
    urgent: true,
  },
  {
    id: 2,
    bloodGroup: "O−",
    donorsNeeded: 3,
    pledged: 2,
    hospital: "North Riyadh Medical Center",
    area: "Al Nakheel",
    distance: "7.8 km",
    deadline: "Tomorrow · 11:00 AM",
    verification: "Requester phone verified",
    note: "Three willing donors requested. Final eligibility is determined only at the hospital.",
  },
  {
    id: 3,
    bloodGroup: "AB+",
    donorsNeeded: 1,
    pledged: 0,
    hospital: "Al Noor Community Hospital",
    area: "Al Malaz",
    distance: "9.1 km",
    deadline: "Tomorrow · 4:00 PM",
    verification: "Awaiting document review",
    note: "Appeal expires automatically after the hospital-requested time.",
  },
];

const englishExample =
  "I am at Riyadh Central Hospital. The blood bank asked us to bring two eligible A+ donors today before 9 PM. Please do not share the patient's name. Contact me through the app.";

const arabicExample =
  "أنا في مستشفى الرياض المركزي. طلب منا بنك الدم إحضار متبرعين اثنين من فصيلة A+ اليوم قبل الساعة 9 مساءً. الرجاء عدم نشر اسم المريض والتواصل معي عبر التطبيق.";

const copy = {
  en: {
    navRequests: "Active appeals",
    navCreate: "Create appeal",
    navSafety: "Safety",
    demo: "Interactive prototype · Fictional data · Riyadh",
    eyebrow: "Community response, hospital control",
    title: "Turn an urgent blood appeal into coordinated action.",
    subtitle:
      "Nidaa helps families reach willing nearby donors without exposing patient details or making medical decisions.",
    create: "Create an urgent appeal",
    seeAppeals: "See active appeals",
    radius: "Riyadh response radius",
    nearby: "12 opt-in donors nearby",
    alerted: "Only relevant donors are alerted",
    active: "Active community appeals",
    activeSub: "Fictional requests for demonstration only",
    all: "All groups",
    needed: "needed",
    responded: "responded",
    canHelp: "I can help",
    complete: "Response goal met",
    verified: "Transparency status",
    medical: "The hospital confirms eligibility and compatibility.",
    protected: "Designed for trust from the first alert",
    p1: "Minimum personal data",
    p1d: "Patient names and donor locations are never shown in a public appeal.",
    p2: "Clear verification",
    p2d: "Every appeal shows what was checked—and what was not.",
    p3: "Automatic closure",
    p3d: "Expired or fulfilled requests stop notifying donors.",
  },
  ar: {
    navRequests: "النداءات النشطة",
    navCreate: "إنشاء نداء",
    navSafety: "السلامة",
    demo: "نموذج تفاعلي · بيانات افتراضية · الرياض",
    eyebrow: "استجابة المجتمع، وقرار المستشفى",
    title: "حوّل نداء الدم العاجل إلى استجابة منظّمة.",
    subtitle:
      "نداء يساعد العائلات على الوصول إلى متبرعين راغبين بالقرب منهم دون كشف بيانات المريض أو اتخاذ قرارات طبية.",
    create: "إنشاء نداء عاجل",
    seeAppeals: "عرض النداءات",
    radius: "نطاق الاستجابة في الرياض",
    nearby: "12 متبرعًا مسجلًا بالقرب منك",
    alerted: "يتم تنبيه المتبرعين المناسبين فقط",
    active: "نداءات المجتمع النشطة",
    activeSub: "طلبات افتراضية للعرض فقط",
    all: "كل الفصائل",
    needed: "مطلوب",
    responded: "استجاب",
    canHelp: "يمكنني المساعدة",
    complete: "اكتمل العدد المطلوب",
    verified: "حالة الشفافية",
    medical: "المستشفى وحده يؤكد الأهلية والتوافق.",
    protected: "الثقة والسلامة منذ التنبيه الأول",
    p1: "أقل قدر من البيانات",
    p1d: "لا يظهر اسم المريض أو موقع المتبرع في النداء العام.",
    p2: "تحقق واضح",
    p2d: "كل نداء يوضح ما تم التحقق منه وما لم يتم.",
    p3: "إغلاق تلقائي",
    p3d: "تتوقف التنبيهات عند اكتمال الطلب أو انتهاء مدته.",
  },
};

function DropMark() {
  return (
    <span className="drop-mark" aria-hidden="true">
      <span>N</span>
    </span>
  );
}

function ProgressRing({ value, total }: { value: number; total: number }) {
  const percent = Math.min(100, Math.round((value / total) * 100));
  return (
    <div
      className="progress-ring"
      style={{ "--progress": `${percent * 3.6}deg` } as React.CSSProperties}
      aria-label={`${value} of ${total} donors responded`}
    >
      <span>
        <strong>{value}</strong>/{total}
      </span>
    </div>
  );
}

export default function Home() {
  const [language, setLanguage] = useState<"en" | "ar">("en");
  const [view, setView] = useState<"requests" | "create" | "safety">("requests");
  const [filter, setFilter] = useState("All");
  const [appeals, setAppeals] = useState(initialAppeals);
  const [selectedAppeal, setSelectedAppeal] = useState<Appeal | null>(null);
  const [appealText, setAppealText] = useState(englishExample);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const t = copy[language];

  const filteredAppeals = useMemo(
    () =>
      filter === "All"
        ? appeals
        : appeals.filter((appeal) => appeal.bloodGroup === filter),
    [appeals, filter],
  );

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 3200);
  }

  async function analyzeAppeal(event: FormEvent) {
    event.preventDefault();
    if (!appealText.trim()) return;
    setLoading(true);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appeal: appealText }),
      });
      if (!response.ok) throw new Error("Analysis failed");
      const data = (await response.json()) as Analysis;
      setAnalysis(data);
    } catch {
      setAnalysis({
        hospital: "Riyadh Central Hospital",
        bloodGroup: appealText.match(/(?:A|B|AB|O)[+-]/i)?.[0].toUpperCase() || "A+",
        donorsNeeded: /three|ثلاث/i.test(appealText) ? 3 : 2,
        deadline: "Today · 9:00 PM",
        area: "Riyadh",
        privacyNote: "Patient identity removed from the public alert.",
        missingInformation: ["Confirm the hospital entrance for blood-bank donors."],
        mode: "demo",
      });
    } finally {
      setLoading(false);
    }
  }

  function confirmInterest() {
    if (!selectedAppeal) return;
    setAppeals((current) =>
      current.map((appeal) =>
        appeal.id === selectedAppeal.id
          ? { ...appeal, pledged: Math.min(appeal.donorsNeeded, appeal.pledged + 1) }
          : appeal,
      ),
    );
    setSelectedAppeal(null);
    showToast("Your interest was shared. The hospital will complete all screening.");
  }

  function publishAppeal() {
    if (!analysis) return;
    const newAppeal: Appeal = {
      id: Date.now(),
      bloodGroup: analysis.bloodGroup,
      donorsNeeded: analysis.donorsNeeded,
      pledged: 0,
      hospital: analysis.hospital,
      area: analysis.area,
      distance: "Within your alert radius",
      deadline: analysis.deadline,
      verification: "Awaiting document review",
      note: "New privacy-safe community appeal created in this demo session.",
      urgent: true,
    };
    setAppeals((current) => [newAppeal, ...current]);
    setFilter("All");
    setView("requests");
    setAnalysis(null);
    showToast("Appeal published to the demo feed. Relevant donors were notified.");
  }

  return (
    <main dir={language === "ar" ? "rtl" : "ltr"}>
      <header className="site-header">
        <a className="brand" href="#top" onClick={() => setView("requests")}>
          <DropMark />
          <span>
            <strong>Nidaa</strong>
            <small>Blood AI</small>
          </span>
        </a>
        <nav aria-label="Main navigation">
          <button className={view === "requests" ? "active" : ""} onClick={() => setView("requests")}>
            {t.navRequests}
          </button>
          <button className={view === "create" ? "active" : ""} onClick={() => setView("create")}>
            {t.navCreate}
          </button>
          <button className={view === "safety" ? "active" : ""} onClick={() => setView("safety")}>
            {t.navSafety}
          </button>
        </nav>
        <button
          className="language-toggle"
          onClick={() => setLanguage(language === "en" ? "ar" : "en")}
          aria-label="Change language"
        >
          <span>{language === "en" ? "ع" : "EN"}</span>
          {language === "en" ? "العربية" : "English"}
        </button>
      </header>

      <div className="demo-ribbon">
        <span className="pulse-dot" /> {t.demo}
      </div>

      {view === "requests" && (
        <>
          <section className="hero" id="top">
            <div className="hero-copy">
              <div className="eyebrow"><span>✦</span>{t.eyebrow}</div>
              <h1>{t.title}</h1>
              <p>{t.subtitle}</p>
              <div className="hero-actions">
                <button className="button primary" onClick={() => setView("create")}>
                  {t.create} <span aria-hidden="true">→</span>
                </button>
                <a className="button secondary" href="#appeals">{t.seeAppeals}</a>
              </div>
              <div className="trust-row">
                <span><b>24h</b> auto-expiry</span>
                <span><b>0</b> patient names shown</span>
                <span><b>100%</b> hospital screening</span>
              </div>
            </div>

            <div className="radius-card" aria-label="Illustration of a private donor alert radius">
              <div className="radius-top">
                <div>
                  <span className="mini-label">{t.radius}</span>
                  <strong>{t.nearby}</strong>
                </div>
                <span className="live-pill"><i /> Live</span>
              </div>
              <div className="map-visual">
                <div className="road road-one" />
                <div className="road road-two" />
                <div className="radius-circle radius-one" />
                <div className="radius-circle radius-two" />
                <span className="donor-dot d1">A+</span>
                <span className="donor-dot d2">A+</span>
                <span className="donor-dot d3">A+</span>
                <div className="hospital-pin"><span>+</span></div>
                <div className="map-label">Hospital<br/><small>appeal origin</small></div>
              </div>
              <div className="radius-bottom">
                <span className="shield-icon">✓</span>
                <p><strong>{t.alerted}</strong><small>Exact donor locations stay private</small></p>
              </div>
            </div>
          </section>

          <section className="appeals-section" id="appeals">
            <div className="section-heading">
              <div>
                <span className="section-kicker">Community board</span>
                <h2>{t.active}</h2>
                <p>{t.activeSub}</p>
              </div>
              <div className="filters" aria-label="Filter by blood group">
                {["All", "A+", "O−", "AB+"].map((group) => (
                  <button key={group} className={filter === group ? "selected" : ""} onClick={() => setFilter(group)}>
                    {group === "All" ? t.all : group}
                  </button>
                ))}
              </div>
            </div>

            <div className="appeal-grid">
              {filteredAppeals.map((appeal) => {
                const full = appeal.pledged >= appeal.donorsNeeded;
                return (
                  <article className={`appeal-card ${appeal.urgent ? "urgent" : ""}`} key={appeal.id}>
                    <div className="appeal-card-top">
                      <div className="blood-badge"><span>{appeal.bloodGroup}</span><small>blood group</small></div>
                      <div className="appeal-title">
                        <div className="status-line">
                          {appeal.urgent && <span className="urgent-pill">Urgent today</span>}
                          <span className="time-pill">{appeal.deadline}</span>
                        </div>
                        <h3>{appeal.hospital}</h3>
                        <p><span>⌖</span> {appeal.area} · {appeal.distance}</p>
                      </div>
                      <ProgressRing value={appeal.pledged} total={appeal.donorsNeeded} />
                    </div>
                    <p className="appeal-note">{appeal.note}</p>
                    <div className="verification-row">
                      <span className="verified-check">✓</span>
                      <p><small>{t.verified}</small><strong>{appeal.verification}</strong></p>
                    </div>
                    <div className="card-footer">
                      <p><span>ⓘ</span>{t.medical}</p>
                      <button disabled={full} onClick={() => setSelectedAppeal(appeal)}>
                        {full ? t.complete : t.canHelp}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="trust-section">
            <div className="section-heading centered">
              <span className="section-kicker">Safety by design</span>
              <h2>{t.protected}</h2>
            </div>
            <div className="trust-grid">
              <article><span>01</span><h3>{t.p1}</h3><p>{t.p1d}</p></article>
              <article><span>02</span><h3>{t.p2}</h3><p>{t.p2d}</p></article>
              <article><span>03</span><h3>{t.p3}</h3><p>{t.p3d}</p></article>
            </div>
          </section>
        </>
      )}

      {view === "create" && (
        <section className="create-page">
          <div className="page-intro">
            <button className="back-link" onClick={() => setView("requests")}>← Back to appeals</button>
            <span className="section-kicker">AI appeal assistant</span>
            <h1>Create a clear, privacy-safe appeal</h1>
            <p>Write naturally in Arabic or English. GPT-5.6 structures the request, removes identifying details, and asks for anything missing.</p>
          </div>

          <div className="steps" aria-label="Appeal creation progress">
            <span className="current"><b>1</b> Write</span><i />
            <span className={analysis ? "current" : ""}><b>2</b> Review</span><i />
            <span><b>3</b> Alert donors</span>
          </div>

          <div className="create-grid">
            <form className="composer" onSubmit={analyzeAppeal}>
              <div className="panel-heading">
                <span className="ai-orb">✦</span>
                <div><h2>Describe the hospital request</h2><p>No medical language required</p></div>
              </div>
              <label htmlFor="appeal-text">What did the hospital ask for?</label>
              <textarea
                id="appeal-text"
                value={appealText}
                onChange={(event) => setAppealText(event.target.value)}
                maxLength={800}
                dir="auto"
              />
              <div className="textarea-meta">
                <button type="button" onClick={() => setAppealText(arabicExample)}>Use Arabic example</button>
                <span>{appealText.length}/800</span>
              </div>
              <div className="privacy-toggle">
                <span className="toggle on"><i /></span>
                <p><strong>Remove patient-identifying information</strong><small>Always on for public alerts</small></p>
                <span className="lock">⌑</span>
              </div>
              <button className="button primary analyze-button" disabled={loading || !appealText.trim()}>
                {loading ? <><span className="spinner" /> Structuring appeal…</> : <>✦ Analyze with GPT-5.6</>}
              </button>
              <p className="form-footnote">AI organizes the appeal. It never decides who can donate.</p>
            </form>

            <div className={`analysis-panel ${analysis ? "has-result" : ""}`}>
              {!analysis ? (
                <div className="empty-analysis">
                  <div className="document-icon"><span>✦</span></div>
                  <h2>Your structured alert appears here</h2>
                  <p>GPT-5.6 will identify the hospital, requested group, donor count and deadline—then flag missing details.</p>
                  <ul><li>Patient identity removed</li><li>Missing details highlighted</li><li>Every field remains editable</li></ul>
                </div>
              ) : (
                <>
                  <div className="result-heading">
                    <div><span className="success-check">✓</span><h2>Appeal ready to review</h2></div>
                    <span className={`model-pill ${analysis.mode}`}>
                      <i /> {analysis.mode === "gpt-5.6" ? "Powered by GPT-5.6" : "Demo analysis"}
                    </span>
                  </div>
                  <div className="field-grid">
                    <label>Hospital<input value={analysis.hospital} onChange={(e) => setAnalysis({...analysis, hospital: e.target.value})}/></label>
                    <label>Blood group<select value={analysis.bloodGroup} onChange={(e) => setAnalysis({...analysis, bloodGroup: e.target.value})}>{["A+","A−","B+","B−","AB+","AB−","O+","O−"].map(g => <option key={g}>{g}</option>)}</select></label>
                    <label>Willing donors requested<input type="number" min="1" max="20" value={analysis.donorsNeeded} onChange={(e) => setAnalysis({...analysis, donorsNeeded: Number(e.target.value)})}/></label>
                    <label>Deadline<input value={analysis.deadline} onChange={(e) => setAnalysis({...analysis, deadline: e.target.value})}/></label>
                    <label className="full-field">Area<input value={analysis.area} onChange={(e) => setAnalysis({...analysis, area: e.target.value})}/></label>
                  </div>
                  <div className="privacy-result"><span>✓</span><p><strong>Privacy check passed</strong><small>{analysis.privacyNote}</small></p></div>
                  {analysis.missingInformation.length > 0 && (
                    <div className="missing-result"><span>!</span><p><strong>One detail to confirm</strong><small>{analysis.missingInformation[0]}</small></p></div>
                  )}
                  <div className="publish-actions">
                    <button className="button primary" onClick={publishAppeal}>Publish demo appeal <span>→</span></button>
                    <button className="text-button" onClick={() => setAnalysis(null)}>Start again</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {view === "safety" && (
        <section className="safety-page">
          <div className="safety-hero">
            <span className="section-kicker">The safety boundary</span>
            <h1>Nidaa coordinates people.<br/>Hospitals make medical decisions.</h1>
            <p>The prototype is intentionally designed as a community communication layer—not a blood bank, medical device, or eligibility service.</p>
          </div>
          <div className="boundary-grid">
            <article className="nidaa-side">
              <span className="boundary-label">Nidaa can</span>
              <ul>
                <li><b>✓</b><span><strong>Structure an appeal</strong><small>Turn Arabic or English text into clear alert fields.</small></span></li>
                <li><b>✓</b><span><strong>Protect public privacy</strong><small>Remove patient names and hide exact donor locations.</small></span></li>
                <li><b>✓</b><span><strong>Coordinate responses</strong><small>Count willing people and close stale alerts.</small></span></li>
              </ul>
            </article>
            <article className="hospital-side">
              <span className="boundary-label">Only the hospital can</span>
              <ul>
                <li><b>+</b><span><strong>Confirm eligibility</strong><small>Health history, age, weight and donation intervals.</small></span></li>
                <li><b>+</b><span><strong>Test compatibility</strong><small>Blood grouping, crossmatching and clinical suitability.</small></span></li>
                <li><b>+</b><span><strong>Collect and use blood</strong><small>All donation happens under official local procedures.</small></span></li>
              </ul>
            </article>
          </div>
          <div className="safety-callout"><span>i</span><p><strong>Prototype notice</strong>This competition demo contains fictional hospitals, requests and donor responses. It is not for real emergencies.</p></div>
          <button className="button primary" onClick={() => setView("requests")}>Explore the demo</button>
        </section>
      )}

      <footer>
        <a className="brand footer-brand" href="#top"><DropMark/><span><strong>Nidaa</strong><small>Blood AI</small></span></a>
        <p>Community coordination for urgent hospital blood appeals.</p>
        <span>Built with Codex + GPT-5.6 · OpenAI Build Week 2026</span>
      </footer>

      {selectedAppeal && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setSelectedAppeal(null)}>
          <section className="response-modal" role="dialog" aria-modal="true" aria-labelledby="response-title" onMouseDown={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedAppeal(null)} aria-label="Close">×</button>
            <span className="blood-badge modal-badge"><span>{selectedAppeal.bloodGroup}</span><small>requested</small></span>
            <span className="section-kicker">Private response</span>
            <h2 id="response-title">Confirm you are willing to visit</h2>
            <p>Your response helps the family coordinate. It does not confirm that you are medically eligible to donate.</p>
            <div className="modal-destination"><span>+</span><p><strong>{selectedAppeal.hospital}</strong><small>{selectedAppeal.area} · {selectedAppeal.deadline}</small></p></div>
            <label className="confirm-check"><input type="checkbox" defaultChecked/> I understand the hospital will complete all screening.</label>
            <button className="button primary full-button" onClick={confirmInterest}>Share my interest</button>
            <small className="modal-privacy">Your exact location is never shared with the requester.</small>
          </section>
        </div>
      )}

      {toast && <div className="toast"><span>✓</span>{toast}</div>}
    </main>
  );
}
