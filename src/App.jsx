import { useState } from "react";

// ── Тема ────────────────────────────────────────────────────────────────────
const T = {
  bg: "#f5f6fa", card: "#fff", cardAlt: "#f0f2f5", border: "#e8eaed",
  text: "#1a1a2e", textSec: "#6b7280", textMuted: "#9ca3af",
  green: "#16a34a", greenLight: "#dcfce7", greenBorder: "#bbf7d0",
  orange: "#f97316", yellow: "#eab308", accent: "#22c55e",
  radius: 16, radiusSm: 12,
  glass: "rgba(255,255,255,0.75)",
};

const S = {
  card: { background: T.card, borderRadius: T.radius, padding: 16, border: `1px solid ${T.border}` },
  btn: { border: "none", cursor: "pointer", fontWeight: 700, fontFamily: "inherit" },
  flex: { display: "flex", alignItems: "center" },
  page: { padding: "16px 16px 90px" },
};

// ── SVG Іконки ──────────────────────────────────────────────────────────────
const ICONS = {
  home: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  bag: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
  qr: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="8" height="8" rx="1"/><rect x="14" y="2" width="8" height="8" rx="1"/><rect x="2" y="14" width="8" height="8" rx="1"/><rect x="14" y="14" width="4" height="4" rx="0.5"/><line x1="22" y1="14" x2="22" y2="22"/><line x1="18" y1="22" x2="22" y2="22"/></svg>,
  chart: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  wallet: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  back: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  user: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  mail: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  lock: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
  phone: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>,
  check: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  download: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
};

// ── Дані ────────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "all", label: "Всі", icon: "🏪" },
  { id: "farm", label: "Ферма", icon: "🐔" },
  { id: "honey", label: "Мед", icon: "🍯" },
  { id: "veggies", label: "Городина", icon: "🥬" },
  { id: "dairy", label: "Молочне", icon: "🥛" },
  { id: "food", label: "Випічка", icon: "🍞" },
  { id: "handmade", label: "Handmade", icon: "🧵" },
  { id: "cafe", label: "Кафе", icon: "☕" },
];

const DEALS = [
  { id:1, cat:"farm", seller:"Ферма Петренків", avatar:"🌾", city:"Бориспіль", rating:4.9, deals:34,
    title:"Курчата бройлер живою вагою", unit:"кг", retail:95, group:68, min:2, max:10,
    joined:18, needed:30, days:3, desc:"Вирощені без антибіотиків. Природний корм. Забій в день доставки.",
    tags:["🌿 Без антибіотиків","🚗 Доставка Київ","📦 від 2 кг"], hot:true },
  { id:2, cat:"honey", seller:"Пасіка Коваля", avatar:"🐝", city:"Черкаси", rating:5.0, deals:67,
    title:"Акацієвий мед з пасіки", unit:"банка 1л", retail:380, group:260, min:1, max:5,
    joined:22, needed:25, days:1, desc:"Качаємо в серпні. Світлий, рідкий. Сертифікат якості є.",
    tags:["🏆 Сертифікат","🌸 Акація 2024","🚚 Нова Пошта"], hot:true },
  { id:3, cat:"food", seller:"Пекарня Оленки", avatar:"👩‍🍳", city:"Київ, Поділ", rating:4.8, deals:89,
    title:"Набір домашньої випічки (12 шт)", unit:"набір", retail:320, group:210, min:1, max:3,
    joined:9, needed:15, days:2, desc:"Круасани, булочки з маком, рогалики. Свіжа випічка щопонеділка.",
    tags:["🔥 Щопонеділка","🏠 Домашній рецепт","📍 Самовивіз Поділ"], hot:false },
  { id:4, cat:"veggies", seller:"Город дядька Миколи", avatar:"👨‍🌾", city:"Вишгород", rating:4.7, deals:21,
    title:"Картопля молода власного врожаю", unit:"кг", retail:28, group:17, min:5, max:50,
    joined:41, needed:50, days:2, desc:"Сорт Беллароза. Без хімії. Щойно з поля.",
    tags:["🌱 Без хімії","🚜 Власний врожай","📦 від 5 кг"], hot:true },
  { id:5, cat:"dairy", seller:"Молочна від Галини", avatar:"🐄", city:"Бровари", rating:4.9, deals:112,
    title:"Домашній сир та сметана (набір)", unit:"набір", retail:280, group:195, min:1, max:4,
    joined:7, needed:20, days:4, desc:"Сир 500г + сметана 400г. Свіже щовівторка та п'ятниця.",
    tags:["🥛 Від однієї корови","📅 Вт та Пт","🚗 Доставка Бровари-Київ"], hot:false },
  { id:6, cat:"handmade", seller:"Майстерня Тетяни", avatar:"🧶", city:"Київ, Оболонь", rating:4.6, deals:45,
    title:"Вишита сорочка (замовлення групою)", unit:"шт", retail:1800, group:1200, min:1, max:1,
    joined:6, needed:10, days:7, desc:"Ручна вишивка. Розміри S-XL. Тканина льон.",
    tags:["✋ Ручна робота","👗 Розміри S-XL","🎨 Авторська вишивка"], hot:false },
  { id:7, cat:"cafe", seller:"Кав'ярня Зерно", avatar:"☕", city:"Київ", rating:4.8, deals:203,
    title:"Купон: будь-яка кава × 5", unit:"купон", retail:175, group:110, min:1, max:10,
    joined:44, needed:50, days:1, desc:"Еспресо, лате, капучіно. Дійсний 60 днів.",
    tags:["☕ Будь-яка кава","📅 60 днів дії","📍 вул. Саксаганського 15"], hot:true },
  { id:8, cat:"farm", seller:"Ферма Петренків", avatar:"🌾", city:"Бориспіль", rating:4.9, deals:34,
    title:"Яйця домашні (лоток 30 шт)", unit:"лоток", retail:145, group:95, min:1, max:5,
    joined:12, needed:20, days:3, desc:"Несучки вільного вигулу. Жовток яскраво-помаранчевий.",
    tags:["🐔 Вільний вигул","🟠 Яскравий жовток","🚗 Доставка з курчатами"], hot:false },
];

const SELLER = {
  name:"Ферма Петренків", avatar:"🌾",
  fop:"ФОП Петренко Василь Іванович", ipn:"3456789012",
  iban:"UA213223130000026007233566001", bank:"АТ КБ «ПриватБанк»",
  group:"2 група", taxRate:"₴1,600/міс", city:"Бориспіль", rating:4.9,
};

const TRANSACTIONS = [
  { id:"T1", type:"income", desc:"Курчата × 4кг (Олена В.)", amount:272, date:"24.03 · 14:22" },
  { id:"T2", type:"income", desc:"Яйця × 2 лотки (Микола І.)", amount:190, date:"24.03 · 11:05" },
  { id:"T3", type:"withdrawal", desc:"Виведення на IBAN", amount:3200, date:"23.03 · 18:00" },
  { id:"T4", type:"hold", desc:"Очікує видачі: Курчата × 4кг", amount:272, date:"24.03 · 10:15" },
];

const ORDERS = [
  { id:"SC-8841", buyer:"Олена Василенко", avatar:"👩", item:"Курчата бройлер", qty:4, unit:"кг", amount:272, status:"paid" },
  { id:"SC-8842", buyer:"Микола Іваненко", avatar:"👨", item:"Яйця домашні", qty:2, unit:"лотки", amount:190, status:"done" },
  { id:"SC-8843", buyer:"Ірина Коваль", avatar:"👩‍🦱", item:"Курчата бройлер", qty:6, unit:"кг", amount:408, status:"paid" },
];

// ── Утиліти ─────────────────────────────────────────────────────────────────
const pct = d => Math.min(100, Math.round((d.joined / d.needed) * 100));
const disc = d => Math.round(((d.retail - d.group) / d.retail) * 100);
const progressColor = p => p >= 90 ? T.orange : p >= 60 ? T.yellow : T.accent;

// ── Компоненти UI ───────────────────────────────────────────────────────────
function Badge({ children, bg = T.greenLight, color = T.green }) {
  return <span style={{ background: bg, color, fontSize: 11, fontWeight: 800, padding: "3px 8px", borderRadius: 8 }}>{children}</span>;
}

function ProgressBar({ value, color = T.accent, height = 6 }) {
  return (
    <div style={{ height, background: T.cardAlt, borderRadius: height / 2, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${value}%`, background: color, borderRadius: height / 2, transition: "width .4s" }} />
    </div>
  );
}

function BackBtn({ onClick }) {
  return <button onClick={onClick} style={{ ...S.btn, ...S.flex, gap: 4, background: "none", color: T.green, fontSize: 14, padding: 0, marginBottom: 16 }}>{ICONS.back} Назад</button>;
}

function Icon({ emoji, size = 36 }) {
  return <div style={{ fontSize: size * 0.6, width: size, height: size, background: T.cardAlt, borderRadius: T.radiusSm, ...S.flex, justifyContent: "center" }}>{emoji}</div>;
}

function Input({ value, onChange, placeholder, icon, type = "text" }) {
  return (
    <div style={{ position: "relative" }}>
      {icon && <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: T.textMuted }}>{icon}</div>}
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        style={{ width: "100%", background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: icon ? "12px 16px 12px 42px" : "12px 16px", color: T.text, fontSize: 14, boxSizing: "border-box", outline: "none", fontFamily: "inherit" }} />
    </div>
  );
}

// ── Навігація (прозора) ─────────────────────────────────────────────────────
const NAV = [
  ["market", ICONS.home, "Маркет"],
  ["my", ICONS.bag, "Мої"],
  ["qr", ICONS.qr, "QR"],
  ["seller", ICONS.chart, "Бізнес"],
  ["wallet", ICONS.wallet, "Гаманець"],
];

function Nav({ tab, setTab }) {
  return (
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 72, background: T.glass, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderTop: `1px solid ${T.border}`, ...S.flex, zIndex: 100, padding: "0 8px" }}>
      {NAV.map(([t, icon, label]) => (
        <button key={t} onClick={() => setTab(t)} style={{ ...S.btn, flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, background: "transparent", color: tab === t ? T.green : T.textMuted, transition: "color .2s" }}>
          <div style={{ transform: tab === t ? "scale(1.1)" : "scale(1)", transition: "transform .2s" }}>{icon}</div>
          <span style={{ fontSize: 10, fontWeight: tab === t ? 800 : 600 }}>{label}</span>
          {tab === t && <div style={{ width: 20, height: 3, background: T.green, borderRadius: 2, marginTop: -2 }} />}
        </button>
      ))}
    </div>
  );
}

// ── Реєстрація / Онбордінг ──────────────────────────────────────────────────
function WelcomeScreen({ onStart }) {
  return (
    <div style={{ minHeight: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 24, textAlign: "center" }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>🛒</div>
      <h1 style={{ fontSize: 28, fontWeight: 900, color: T.text, marginBottom: 8 }}>СпільноКуп</h1>
      <p style={{ fontSize: 14, color: T.textSec, marginBottom: 32, lineHeight: 1.6 }}>Спільні покупки від малого бізнесу України. Економте до 40% купуючи разом!</p>
      <button onClick={onStart} style={{ ...S.btn, width: "100%", padding: 16, background: T.accent, color: "#fff", borderRadius: 14, fontSize: 16, marginBottom: 12 }}>
        Створити акаунт
      </button>
      <button onClick={onStart} style={{ ...S.btn, width: "100%", padding: 16, background: "transparent", color: T.green, borderRadius: 14, fontSize: 14, border: `1px solid ${T.border}` }}>
        Вже маю акаунт
      </button>
      <div style={{ marginTop: 32, background: T.cardAlt, borderRadius: T.radius, padding: 16, textAlign: "left" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 8 }}>{ICONS.download} Додати на головний екран:</div>
        <div style={{ fontSize: 12, color: T.textSec, lineHeight: 1.8 }}>
          <b>Android:</b> Chrome → ⋮ → «Додати на головний екран»<br/>
          <b>iPhone:</b> Safari → ⬆ → «На Початковий екран»
        </div>
      </div>
    </div>
  );
}

function RegisterScreen({ onDone }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pass, setPass] = useState("");
  const [city, setCity] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);

  if (step === 0) return (
    <div style={{ minHeight: "100%", display: "flex", flexDirection: "column", padding: 24 }}>
      <BackBtn onClick={() => {}} />
      <h2 style={{ fontSize: 22, fontWeight: 900, color: T.text, marginBottom: 4 }}>Реєстрація</h2>
      <p style={{ fontSize: 13, color: T.textSec, marginBottom: 24 }}>Крок 1 з 3 — Ваші дані</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
        <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ваше ім'я" icon={ICONS.user} />
        <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" icon={ICONS.mail} type="email" />
        <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+380 __ ___ __ __" icon={ICONS.phone} type="tel" />
        <Input value={pass} onChange={e => setPass(e.target.value)} placeholder="Пароль" icon={ICONS.lock} type="password" />
      </div>
      <button onClick={() => setStep(1)} disabled={!name || !email || !phone || !pass}
        style={{ ...S.btn, width: "100%", padding: 16, background: (name && email && phone && pass) ? T.accent : T.cardAlt, color: (name && email && phone && pass) ? "#fff" : T.textMuted, borderRadius: 14, fontSize: 15, marginTop: 24 }}>
        Далі
      </button>
    </div>
  );

  if (step === 1) return (
    <div style={{ minHeight: "100%", display: "flex", flexDirection: "column", padding: 24 }}>
      <BackBtn onClick={() => setStep(0)} />
      <h2 style={{ fontSize: 22, fontWeight: 900, color: T.text, marginBottom: 4 }}>Місто</h2>
      <p style={{ fontSize: 13, color: T.textSec, marginBottom: 24 }}>Крок 2 з 3 — Оберіть місто</p>
      <Input value={city} onChange={e => setCity(e.target.value)} placeholder="Ваше місто" />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
        {["Київ","Харків","Одеса","Дніпро","Львів","Бориспіль","Бровари","Вишгород","Черкаси"].map(c => (
          <button key={c} onClick={() => setCity(c)} style={{ ...S.btn, padding: "8px 14px", borderRadius: 12, fontSize: 12,
            background: city === c ? T.accent : T.cardAlt, color: city === c ? "#fff" : T.textSec }}>{c}</button>
        ))}
      </div>
      <div style={{ flex: 1 }} />
      <button onClick={() => { setStep(2); setSent(true); }} disabled={!city}
        style={{ ...S.btn, width: "100%", padding: 16, background: city ? T.accent : T.cardAlt, color: city ? "#fff" : T.textMuted, borderRadius: 14, fontSize: 15, marginTop: 24 }}>
        Далі
      </button>
    </div>
  );

  return (
    <div style={{ minHeight: "100%", display: "flex", flexDirection: "column", padding: 24 }}>
      <BackBtn onClick={() => setStep(1)} />
      <h2 style={{ fontSize: 22, fontWeight: 900, color: T.text, marginBottom: 4 }}>Підтвердження</h2>
      <p style={{ fontSize: 13, color: T.textSec, marginBottom: 24 }}>Крок 3 з 3 — Введіть код з SMS</p>
      <div style={{ ...S.card, background: T.greenLight, borderColor: T.greenBorder, textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: T.green }}>Код надіслано на {phone}</div>
      </div>
      <div style={{ ...S.flex, justifyContent: "center", gap: 10, marginBottom: 24 }}>
        {[0,1,2,3].map(i => (
          <input key={i} maxLength={1} value={code[i] || ""} onChange={e => {
            const v = e.target.value.replace(/\D/g, "");
            if (v) { const nc = code.split(""); nc[i] = v; setCode(nc.join("")); if (i < 3) e.target.nextSibling?.focus(); }
          }}
          style={{ width: 52, height: 60, textAlign: "center", fontSize: 24, fontWeight: 900, border: `2px solid ${code[i] ? T.accent : T.border}`, borderRadius: 14, outline: "none", color: T.text, fontFamily: "inherit" }} />
        ))}
      </div>
      <button onClick={() => { if (code.length >= 4) onDone({ name, email, phone, city }); }}
        disabled={code.length < 4}
        style={{ ...S.btn, width: "100%", padding: 16, background: code.length >= 4 ? T.accent : T.cardAlt, color: code.length >= 4 ? "#fff" : T.textMuted, borderRadius: 14, fontSize: 15 }}>
        Підтвердити
      </button>
      <button onClick={() => setSent(true)} style={{ ...S.btn, background: "transparent", color: T.textSec, fontSize: 13, padding: 12, marginTop: 8 }}>
        Надіслати ще раз
      </button>
    </div>
  );
}

// ── Картка угоди ────────────────────────────────────────────────────────────
function DealCard({ deal, onOpen, joined, onJoin }) {
  const p = pct(deal), d = disc(deal), isIn = joined[deal.id], col = progressColor(p);
  return (
    <div onClick={() => onOpen(deal)} style={{ ...S.card, borderRadius: 20, overflow: "hidden", cursor: "pointer", borderColor: isIn ? T.accent + "44" : T.border, boxShadow: deal.hot ? "0 4px 20px rgba(249,115,22,0.08)" : "0 1px 4px rgba(0,0,0,0.04)" }}>
      <div style={{ ...S.flex, gap: 6, padding: "10px 14px 0" }}>
        {deal.hot && <Badge bg={T.orange} color="#fff">🔥 ГАРЯЧЕ</Badge>}
        <span style={{ marginLeft: "auto" }}><Badge>-{d}%</Badge></span>
      </div>
      <div style={{ padding: "10px 14px 14px" }}>
        <div style={{ ...S.flex, gap: 8, marginBottom: 10 }}>
          <Icon emoji={deal.avatar} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{deal.seller}</div>
            <div style={{ fontSize: 10, color: T.textSec }}>📍{deal.city} · ⭐{deal.rating}</div>
          </div>
          {isIn && <div style={{ width: 28, height: 28, background: T.accent, borderRadius: "50%", ...S.flex, justifyContent: "center", color: "#fff" }}>{ICONS.check}</div>}
        </div>
        <div style={{ fontSize: 15, fontWeight: 800, color: T.text, marginBottom: 8, lineHeight: 1.3 }}>{deal.title}</div>
        <div style={{ ...S.flex, gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 22, fontWeight: 900, color: T.green }}>₴{deal.group}</span>
          <span style={{ fontSize: 12, color: T.textMuted, textDecoration: "line-through" }}>₴{deal.retail}</span>
          <span style={{ fontSize: 11, color: T.textSec }}>/ {deal.unit}</span>
        </div>
        <div style={{ marginBottom: 8 }}>
          <div style={{ ...S.flex, justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: T.textSec }}>Учасників</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: col }}>{deal.joined}/{deal.needed}</span>
          </div>
          <ProgressBar value={p} color={col} />
        </div>
        <div style={{ ...S.flex, justifyContent: "space-between" }}>
          <span style={{ fontSize: 11, color: T.textSec }}>⏰ {deal.days} {deal.days === 1 ? "день" : "дні"}</span>
          <button onClick={e => { e.stopPropagation(); onJoin(deal.id); }} style={{ ...S.btn, background: isIn ? T.green : T.accent, color: "#fff", borderRadius: 10, padding: "6px 14px", fontSize: 12 }}>
            {isIn ? "✓ В групі" : "Приєднатись"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Маркет ──────────────────────────────────────────────────────────────────
function MarketPage({ joined, onJoin, onOpen, user }) {
  const [cat, setCat] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("hot");

  let list = cat === "all" ? DEALS : DEALS.filter(d => d.cat === cat);
  if (search) list = list.filter(d => (d.title + d.seller).toLowerCase().includes(search.toLowerCase()));
  list = [...list].sort(sort === "new" ? (a, b) => b.id - a.id : sort === "disc" ? (a, b) => disc(b) - disc(a) : (a, b) => pct(b) - pct(a));

  return (
    <div>
      <div style={{ background: `linear-gradient(135deg, ${T.greenLight}, ${T.greenBorder})`, padding: "24px 16px 20px", marginBottom: 16 }}>
        <div style={{ ...S.flex, justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 900, color: T.text }}>СпільноКуп</div>
            <div style={{ fontSize: 11, color: T.green }}>{user ? `Привіт, ${user.name}!` : "Малий бізнес — великі можливості"}</div>
          </div>
          <div style={{ background: "rgba(22,163,74,0.1)", border: `1px solid ${T.accent}44`, borderRadius: T.radiusSm, padding: "8px 12px", textAlign: "center" }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: T.green }}>₴4 280 000</div>
            <div style={{ fontSize: 9, color: T.green }}>зекономлено разом</div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
          {[["847", "продавців"], ["12 430", "угод"], ["23", "міст"]].map(([v, l], i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: T.green }}>{v}</div>
              <div style={{ fontSize: 10, color: T.textSec, marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "0 16px 12px" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Пошук: курчата, мед, сир..."
          style={{ width: "100%", background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: "12px 16px", color: T.text, fontSize: 14, boxSizing: "border-box", outline: "none", fontFamily: "inherit" }} />
      </div>

      <div style={{ display: "flex", gap: 8, padding: "0 16px 12px", overflowX: "auto", scrollbarWidth: "none" }}>
        {CATEGORIES.map(c => (
          <button key={c.id} onClick={() => setCat(c.id)} style={{ ...S.btn, whiteSpace: "nowrap", padding: "8px 14px", borderRadius: 14, fontSize: 12,
            background: cat === c.id ? T.accent : T.card, color: cat === c.id ? "#fff" : T.textSec, border: `1px solid ${cat === c.id ? T.accent : T.border}` }}>{c.icon} {c.label}</button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 6, padding: "0 16px 16px" }}>
        {[["hot", "🔥 Гарячі"], ["new", "✨ Нові"], ["disc", "💰 Знижка"]].map(([s, l]) => (
          <button key={s} onClick={() => setSort(s)} style={{ ...S.btn, padding: "6px 12px", borderRadius: 10, fontSize: 11,
            background: sort === s ? T.greenLight : "transparent", color: sort === s ? T.green : T.textSec }}>{l}</button>
        ))}
      </div>

      <div style={{ padding: "0 16px 90px", display: "flex", flexDirection: "column", gap: 12 }}>
        {list.map(d => <DealCard key={d.id} deal={d} onOpen={onOpen} joined={joined} onJoin={onJoin} />)}
        {list.length === 0 && <div style={{ textAlign: "center", padding: "60px 0", color: T.textMuted }}><div style={{ fontSize: 48 }}>🔍</div><div style={{ marginTop: 12 }}>Нічого не знайдено</div></div>}
      </div>
    </div>
  );
}

// ── Деталі угоди ────────────────────────────────────────────────────────────
function DealDetail({ deal, onBack, joined, onJoin, onBuy }) {
  const [qty, setQty] = useState(deal.min);
  const p = pct(deal), d = disc(deal), isIn = joined[deal.id], col = progressColor(p);

  return (
    <div style={{ paddingBottom: 100 }}>
      <div style={{ background: `linear-gradient(180deg, ${T.greenLight}, ${T.card})`, padding: "20px 16px 24px" }}>
        <BackBtn onClick={onBack} />
        <div style={{ ...S.flex, gap: 8, marginBottom: 12 }}>
          {deal.hot && <Badge bg={T.orange} color="#fff">🔥 ГАРЯЧЕ</Badge>}
          <Badge>-{d}%</Badge>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: T.text, margin: "0 0 16px", lineHeight: 1.3 }}>{deal.title}</h1>
        <div style={{ ...S.card, background: T.greenLight, borderColor: T.greenBorder, ...S.flex, gap: 12 }}>
          <Icon emoji={deal.avatar} size={52} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: T.text }}>{deal.seller}</div>
            <div style={{ fontSize: 11, color: T.textSec, marginTop: 2 }}>📍{deal.city}</div>
            <div style={{ fontSize: 11, color: T.yellow, marginTop: 2 }}>⭐{deal.rating} · {deal.deals} угод</div>
          </div>
        </div>
      </div>

      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ ...S.card, background: T.greenLight, borderColor: T.greenBorder }}>
          <div style={{ ...S.flex, gap: 12, marginBottom: 8 }}>
            <span style={{ fontSize: 32, fontWeight: 900, color: T.green }}>₴{deal.group}</span>
            <span style={{ fontSize: 16, color: T.textMuted, textDecoration: "line-through" }}>₴{deal.retail}</span>
            <span style={{ fontSize: 14, color: T.textSec }}>/ {deal.unit}</span>
          </div>
          <div style={{ fontSize: 13, color: T.green }}>💰 Економія ₴{deal.retail - deal.group} на {deal.unit}</div>
        </div>

        <div style={S.card}>
          <div style={{ ...S.flex, justifyContent: "space-between", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: T.textSec }}>Зібрано учасників</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: T.text }}>{deal.joined} <span style={{ fontSize: 14, color: T.textMuted }}>/ {deal.needed}</span></div>
            </div>
          </div>
          <ProgressBar value={p} color={col} height={8} />
          <div style={{ ...S.flex, justifyContent: "space-between", fontSize: 12, marginTop: 8 }}>
            <span style={{ color: T.textSec }}>⏰ Залишилось: <b style={{ color: T.text }}>{deal.days} дн.</b></span>
            <span style={{ color: col, fontWeight: 700 }}>{p}% зібрано</span>
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {deal.tags.map((t, i) => <span key={i} style={{ background: T.cardAlt, color: T.textSec, fontSize: 12, padding: "6px 12px", borderRadius: 10 }}>{t}</span>)}
        </div>

        <div style={S.card}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 8 }}>📋 Опис</div>
          <div style={{ fontSize: 13, color: T.textSec, lineHeight: 1.6 }}>{deal.desc}</div>
        </div>

        {!isIn && (
          <div style={S.card}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 12 }}>📦 Кількість ({deal.unit})</div>
            <div style={{ ...S.flex, gap: 16, justifyContent: "center" }}>
              <button onClick={() => setQty(Math.max(deal.min, qty - 1))} style={{ ...S.btn, width: 44, height: 44, borderRadius: T.radiusSm, background: T.cardAlt, color: T.text, fontSize: 20 }}>−</button>
              <span style={{ fontSize: 28, fontWeight: 900, color: T.text, width: 60, textAlign: "center" }}>{qty}</span>
              <button onClick={() => setQty(Math.min(deal.max, qty + 1))} style={{ ...S.btn, width: 44, height: 44, borderRadius: T.radiusSm, background: T.accent, color: "#fff", fontSize: 20 }}>+</button>
            </div>
            <div style={{ fontSize: 12, color: T.textSec, marginTop: 8, textAlign: "center" }}>Мін. {deal.min} · Макс. {deal.max} {deal.unit}</div>
          </div>
        )}
      </div>

      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "12px 16px 24px", background: T.glass, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderTop: `1px solid ${T.border}`, zIndex: 50 }}>
        {isIn ? (
          <div style={{ ...S.flex, gap: 10 }}>
            <div style={{ flex: 1, background: T.greenLight, border: `1px solid ${T.accent}44`, borderRadius: 14, padding: 14, textAlign: "center" }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: T.green }}>✓ Ти в групі!</div>
            </div>
            <button onClick={() => onBuy(deal, qty)} style={{ ...S.btn, background: "#6366f1", color: "#fff", borderRadius: 14, padding: "14px 20px", fontSize: 13 }}>📱 QR</button>
          </div>
        ) : (
          <button onClick={() => { onJoin(deal.id); onBuy(deal, qty); }} style={{ ...S.btn, width: "100%", padding: 16, background: T.accent, borderRadius: 14, color: "#fff", fontSize: 16 }}>
            Приєднатись · ₴{deal.group * qty} за {qty} {deal.unit}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Мої покупки ─────────────────────────────────────────────────────────────
function MyDealsPage({ joined, onOpen }) {
  const my = DEALS.filter(d => joined[d.id]);
  return (
    <div style={S.page}>
      <h2 style={{ color: T.text, fontSize: 20, fontWeight: 900, marginBottom: 4 }}>Мої покупки</h2>
      <p style={{ color: T.textSec, fontSize: 13, marginBottom: 20 }}>{my.length} активних</p>
      {my.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <div style={{ fontSize: 56 }}>🛒</div>
          <div style={{ color: T.textMuted, marginTop: 16, fontSize: 14 }}>Ти ще не приєднався до жодної покупки</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {my.map(d => {
            const p = pct(d);
            return (
              <div key={d.id} onClick={() => onOpen(d)} style={{ ...S.card, cursor: "pointer", borderColor: T.accent + "33" }}>
                <div style={{ ...S.flex, gap: 12, marginBottom: 10 }}>
                  <Icon emoji={d.avatar} size={48} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: T.text, lineHeight: 1.3 }}>{d.title}</div>
                    <div style={{ fontSize: 11, color: T.textSec, marginTop: 2 }}>{d.seller}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: T.green }}>₴{d.group}</div>
                    <div style={{ fontSize: 10, color: T.textSec }}>/{d.unit}</div>
                  </div>
                </div>
                <div style={{ ...S.flex, gap: 12 }}>
                  <div style={{ flex: 1 }}><ProgressBar value={p} color={progressColor(p)} /></div>
                  <Badge bg={T.greenLight}>✓ В групі</Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── QR сторінка покупця ─────────────────────────────────────────────────────
function BuyerQRPage({ deal, qty, onBack }) {
  const total = deal.group * qty;
  return (
    <div style={S.page}>
      <BackBtn onClick={onBack} />
      <div style={{ ...S.card, textAlign: "center", padding: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.green, marginBottom: 16 }}>Ваш QR-код для отримання</div>
        <div style={{ background: T.cardAlt, borderRadius: T.radius, padding: 20, display: "inline-block", marginBottom: 16 }}>
          <div style={{ width: 180, height: 180, background: `repeating-conic-gradient(${T.text} 0% 25%, #fff 0% 50%) 0 0 / 20px 20px`, borderRadius: 8 }} />
        </div>
        <div style={{ fontSize: 13, color: T.textSec, marginBottom: 16 }}>{deal.title} × {qty} {deal.unit}</div>
        <div style={{ ...S.card, background: T.greenLight, borderColor: T.greenBorder }}>
          <div style={{ fontSize: 12, color: T.green }}>До сплати</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: T.green }}>₴{total}</div>
        </div>
      </div>
    </div>
  );
}

// ── QR Хаб ──────────────────────────────────────────────────────────────────
function QRHub() {
  return (
    <div style={S.page}>
      <h2 style={{ color: T.text, fontSize: 20, fontWeight: 900, marginBottom: 20 }}>QR-код</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {[["📱", "Покупець", "Покажи QR продавцю для отримання товару"], ["📷", "Продавець", "Скануй QR покупця для підтвердження видачі"]].map(([ico, title, desc]) => (
          <div key={title} style={{ ...S.card, ...S.flex, gap: 16, padding: 20, cursor: "pointer" }}>
            <Icon emoji={ico} size={56} />
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: T.text }}>{title}</div>
              <div style={{ fontSize: 12, color: T.textSec }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Дашборд продавця ────────────────────────────────────────────────────────
function SellerDashboard() {
  const active = ORDERS.filter(o => o.status === "paid");
  const done = ORDERS.filter(o => o.status === "done");
  const revenue = ORDERS.reduce((s, o) => s + o.amount, 0);

  return (
    <div style={S.page}>
      <div style={{ background: `linear-gradient(135deg, ${T.greenLight}, ${T.greenBorder})`, borderRadius: T.radius, padding: 20, marginBottom: 20 }}>
        <div style={{ ...S.flex, gap: 12, marginBottom: 16 }}>
          <Icon emoji={SELLER.avatar} size={48} />
          <div>
            <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>{SELLER.name}</div>
            <div style={{ fontSize: 11, color: T.green }}>📍 {SELLER.city} · ⭐{SELLER.rating}</div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
          {[[`₴${revenue}`, "Дохід"], [`${active.length}`, "Активні"], [`${done.length}`, "Завершені"]].map(([v, l], i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.7)", borderRadius: T.radiusSm, padding: 12, textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: T.green }}>{v}</div>
              <div style={{ fontSize: 10, color: T.textSec }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      <h3 style={{ color: T.text, fontSize: 16, fontWeight: 800, marginBottom: 12 }}>Активні замовлення</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
        {active.map(o => (
          <div key={o.id} style={{ ...S.card, ...S.flex, gap: 12 }}>
            <Icon emoji={o.avatar} size={44} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{o.buyer}</div>
              <div style={{ fontSize: 11, color: T.textSec }}>{o.item} × {o.qty} {o.unit}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: T.green }}>₴{o.amount}</div>
              <Badge bg="#fef9c3" color="#a16207">Оплачено</Badge>
            </div>
          </div>
        ))}
      </div>

      {done.length > 0 && <>
        <h3 style={{ color: T.text, fontSize: 16, fontWeight: 800, marginBottom: 12 }}>Завершені</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {done.map(o => (
            <div key={o.id} style={{ ...S.card, ...S.flex, gap: 12, opacity: 0.7 }}>
              <Icon emoji={o.avatar} size={36} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{o.buyer}</div>
                <div style={{ fontSize: 11, color: T.textSec }}>{o.item}</div>
              </div>
              <Badge>✓ Видано</Badge>
            </div>
          ))}
        </div>
      </>}
    </div>
  );
}

// ── Гаманець ────────────────────────────────────────────────────────────────
function WalletPage() {
  const icons = { income: "📥", withdrawal: "📤", hold: "⏳", tax: "📋" };
  const colors = { income: T.green, withdrawal: T.orange, hold: T.yellow, tax: "#ef4444" };

  return (
    <div style={S.page}>
      <div style={{ ...S.card, background: `linear-gradient(135deg, ${T.greenLight}, ${T.greenBorder})`, marginBottom: 20, textAlign: "center", padding: 24 }}>
        <div style={{ fontSize: 12, color: T.green, marginBottom: 4 }}>Баланс</div>
        <div style={{ fontSize: 36, fontWeight: 900, color: T.text }}>₴12 840</div>
        <div style={{ fontSize: 12, color: T.textSec, marginTop: 4 }}>Доступно до виведення: ₴9 640</div>
        <button style={{ ...S.btn, background: T.accent, color: "#fff", borderRadius: 14, padding: "12px 24px", fontSize: 14, marginTop: 16 }}>
          Вивести кошти
        </button>
      </div>

      <h3 style={{ color: T.text, fontSize: 16, fontWeight: 800, marginBottom: 12 }}>Транзакції</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {TRANSACTIONS.map(t => (
          <div key={t.id} style={{ ...S.card, ...S.flex, gap: 12 }}>
            <div style={{ fontSize: 24 }}>{icons[t.type]}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{t.desc}</div>
              <div style={{ fontSize: 11, color: T.textSec }}>{t.date}</div>
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: colors[t.type] }}>
              {t.type === "income" ? "+" : t.type === "withdrawal" ? "−" : ""}₴{t.amount}
            </div>
          </div>
        ))}
      </div>

      <div style={{ ...S.card, marginTop: 20 }}>
        <h3 style={{ color: T.text, fontSize: 16, fontWeight: 800, marginBottom: 12 }}>ФОП Профіль</h3>
        {[["Назва", SELLER.fop], ["ІПН", SELLER.ipn], ["IBAN", SELLER.iban], ["Банк", SELLER.bank], ["Група", SELLER.group], ["ЄП", SELLER.taxRate]].map(([k, v]) => (
          <div key={k} style={{ ...S.flex, justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${T.border}` }}>
            <span style={{ fontSize: 12, color: T.textSec }}>{k}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: T.text, textAlign: "right", maxWidth: "60%", wordBreak: "break-all" }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Головний компонент ──────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("spilnokup_user")); } catch { return null; }
  });
  const [authStep, setAuthStep] = useState(user ? null : "welcome");
  const [tab, setTab] = useState("market");
  const [page, setPage] = useState(null);
  const [joined, setJoined] = useState({});
  const [buyData, setBuyData] = useState(null);

  const onJoin = id => setJoined(j => ({ ...j, [id]: !j[id] }));
  const onOpen = deal => { setPage("detail"); setBuyData({ deal, qty: deal.min }); };
  const onBuy = (deal, qty) => { setBuyData({ deal, qty }); setPage("qr"); };
  const onRegDone = (data) => { localStorage.setItem("spilnokup_user", JSON.stringify(data)); setUser(data); setAuthStep(null); };

  const showNav = !page && !authStep;
  const isMobile = typeof window !== "undefined" && window.innerWidth <= 500;

  function renderContent() {
    if (authStep === "welcome") return <WelcomeScreen onStart={() => setAuthStep("register")} />;
    if (authStep === "register") return <RegisterScreen onDone={onRegDone} />;
    if (page === "detail" && buyData) return <DealDetail deal={buyData.deal} onBack={() => setPage(null)} joined={joined} onJoin={onJoin} onBuy={onBuy} />;
    if (page === "qr" && buyData) return <BuyerQRPage deal={buyData.deal} qty={buyData.qty} onBack={() => setPage(null)} />;
    switch (tab) {
      case "market": return <MarketPage joined={joined} onJoin={onJoin} onOpen={onOpen} user={user} />;
      case "my": return <MyDealsPage joined={joined} onOpen={onOpen} />;
      case "qr": return <QRHub />;
      case "seller": return <SellerDashboard />;
      case "wallet": return <WalletPage />;
      default: return null;
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", justifyContent: "center", alignItems: isMobile ? "stretch" : "flex-start", padding: isMobile ? 0 : "20px 0", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ width: isMobile ? "100%" : 390, height: isMobile ? "100vh" : 820, background: T.card, borderRadius: isMobile ? 0 : 44, overflow: "hidden", boxShadow: isMobile ? "none" : "0 20px 60px rgba(0,0,0,0.08)", position: "relative" }}>
        <div style={{ height: showNav ? "calc(100% - 72px)" : "100%", overflowY: "auto" }}>
          {renderContent()}
        </div>
        {showNav && <Nav tab={tab} setTab={setTab} />}
      </div>
    </div>
  );
}
