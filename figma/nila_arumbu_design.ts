// Nila Arumbu — Figma Design Script
// Paste this in Scripter plugin and press Run (▶)

const COLORS = {
  primary:   { r: 0.388, g: 0.400, b: 0.945 }, // #6366f1
  purple:    { r: 0.545, g: 0.361, b: 0.965 }, // #8b5cf6
  pink:      { r: 0.925, g: 0.282, b: 0.600 }, // #ec4899
  green:     { r: 0.086, g: 0.639, b: 0.404 }, // #16a34a
  red:       { r: 0.863, g: 0.149, b: 0.149 }, // #dc2626
  yellow:    { r: 0.851, g: 0.467, b: 0.024 }, // #d97706
  white:     { r: 1,     g: 1,     b: 1     },
  slate900:  { r: 0.059, g: 0.090, b: 0.122 }, // #0f172a
  slate700:  { r: 0.220, g: 0.259, b: 0.310 }, // #334155
  slate500:  { r: 0.392, g: 0.451, b: 0.514 }, // #64748b
  slate300:  { r: 0.792, g: 0.835, b: 0.882 }, // #cbd5e1
  slate100:  { r: 0.945, g: 0.961, b: 0.976 }, // #f1f5f9
  slate50:   { r: 0.973, g: 0.980, b: 0.988 }, // #f8fafc
  bgPage:    { r: 0.945, g: 0.961, b: 0.980 }, // #f1f5f9
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function rgb(c: {r:number,g:number,b:number}) { return {...c, a:1}; }

async function loadFont(family="Inter", style="Regular") {
  await figma.loadFontAsync({ family, style });
}

function makeRect(w:number, h:number, fill:{r:number,g:number,b:number}, radius=0): RectangleNode {
  const r = figma.createRectangle();
  r.resize(w, h);
  r.fills = [{ type:"SOLID", color: fill }];
  r.cornerRadius = radius;
  return r;
}

async function makeText(content:string, size:number, color:{r:number,g:number,b:number}, weight="Regular"): Promise<TextNode> {
  await loadFont("Inter", weight);
  const t = figma.createText();
  t.fontName = { family:"Inter", style:weight };
  t.characters = content;
  t.fontSize = size;
  t.fills = [{ type:"SOLID", color }];
  return t;
}

function makeFrame(name:string, w:number, h:number, fill:{r:number,g:number,b:number}=COLORS.white): FrameNode {
  const f = figma.createFrame();
  f.name = name;
  f.resize(w, h);
  f.fills = [{ type:"SOLID", color: fill }];
  return f;
}

// ── Screen 1: Login ───────────────────────────────────────────────────────────

async function createLoginScreen(x:number, y:number) {
  const screen = makeFrame("01 — Login", 1440, 900, COLORS.slate50);
  screen.x = x; screen.y = y;

  // Left gradient panel
  const left = makeFrame("Left Panel", 720, 900, COLORS.primary);
  left.fills = [{ type:"SOLID", color:COLORS.primary }];
  screen.appendChild(left);

  // Left content
  const logoBox = makeRect(56, 56, {r:1,g:1,b:1}, 16);
  logoBox.opacity = 0.2;
  logoBox.x = 64; logoBox.y = 80;
  left.appendChild(logoBox);

  const logoText = await makeText("N", 28, COLORS.white, "Bold");
  logoText.x = 80; logoText.y = 92;
  left.appendChild(logoText);

  const title = await makeText("Nila Arumbu", 48, COLORS.white, "Bold");
  title.x = 64; title.y = 180;
  left.appendChild(title);

  const tagline = await makeText("Integrated Early Childhood\nDecision Support Platform", 20, {r:0.8,g:0.82,b:1}, "Regular");
  tagline.x = 64; tagline.y = 260;
  left.appendChild(tagline);

  const pillars = ["👁️  Every Child Seen", "⚠️  Every Risk Identified", "✅  Every Referral Closed"];
  pillars.forEach(async (p, i) => {
    const pill = makeRect(280, 48, {r:1,g:1,b:1}, 12);
    pill.opacity = 0.15;
    pill.x = 64; pill.y = 380 + i * 64;
    left.appendChild(pill);
    const pt = await makeText(p, 15, COLORS.white, "Medium");
    pt.x = 80; pt.y = 395 + i * 64;
    left.appendChild(pt);
  });

  const tag = await makeText("Tamil Nadu   •   ICDS   •   Anganwadi", 13, {r:0.7,g:0.75,b:1}, "Regular");
  tag.x = 64; tag.y = 820;
  left.appendChild(tag);

  // Right login panel
  const right = makeFrame("Right Panel", 720, 900, COLORS.white);
  right.x = 720;
  screen.appendChild(right);

  const formTitle = await makeText("Welcome back", 32, COLORS.slate900, "Bold");
  formTitle.x = 160; formTitle.y = 220;
  right.appendChild(formTitle);

  const sub = await makeText("Sign in to your account to continue", 15, COLORS.slate500, "Regular");
  sub.x = 160; sub.y = 268;
  right.appendChild(sub);

  // Email field
  const emailLabel = await makeText("Email", 14, COLORS.slate700, "Medium");
  emailLabel.x = 160; emailLabel.y = 340;
  right.appendChild(emailLabel);

  const emailBox = makeRect(400, 48, COLORS.slate100, 12);
  emailBox.x = 160; emailBox.y = 362;
  right.appendChild(emailBox);

  const emailPlaceholder = await makeText("worker@nilarumbu.gov.in", 14, COLORS.slate300, "Regular");
  emailPlaceholder.x = 176; emailPlaceholder.y = 378;
  right.appendChild(emailPlaceholder);

  // Password field
  const pwLabel = await makeText("Password", 14, COLORS.slate700, "Medium");
  pwLabel.x = 160; pwLabel.y = 432;
  right.appendChild(pwLabel);

  const pwBox = makeRect(400, 48, COLORS.slate100, 12);
  pwBox.x = 160; pwBox.y = 454;
  right.appendChild(pwBox);

  const pwPlaceholder = await makeText("••••••••", 18, COLORS.slate300, "Regular");
  pwPlaceholder.x = 176; pwPlaceholder.y = 465;
  right.appendChild(pwPlaceholder);

  // Sign in button
  const btnBg = makeRect(400, 52, COLORS.primary, 14);
  btnBg.x = 160; btnBg.y = 530;
  right.appendChild(btnBg);

  const btnText = await makeText("Sign In", 15, COLORS.white, "SemiBold");
  btnText.x = 340; btnText.y = 543;
  right.appendChild(btnText);

  // Demo creds card
  const credCard = makeRect(400, 80, COLORS.slate50, 12);
  credCard.x = 160; credCard.y = 620;
  right.appendChild(credCard);

  const credTitle = await makeText("Demo Credentials", 12, COLORS.slate500, "SemiBold");
  credTitle.x = 176; credTitle.y = 636;
  right.appendChild(credTitle);

  const cred1 = await makeText("👤 worker@nilarumbu.gov.in  ·  Worker@2024", 12, COLORS.slate700, "Regular");
  cred1.x = 176; cred1.y = 656;
  right.appendChild(cred1);

  const cred2 = await makeText("👑 admin@nilarumbu.gov.in  ·  NilaAdmin@2024", 12, COLORS.slate700, "Regular");
  cred2.x = 176; cred2.y = 674;
  right.appendChild(cred2);

  figma.currentPage.appendChild(screen);
}

// ── Screen 2: Dashboard ───────────────────────────────────────────────────────

async function createDashboard(x:number, y:number) {
  const screen = makeFrame("02 — Dashboard", 1440, 900, COLORS.bgPage);
  screen.x = x; screen.y = y;

  // Sidebar
  const sidebar = makeFrame("Sidebar", 256, 900, COLORS.white);
  screen.appendChild(sidebar);

  // Logo
  const logoBg = makeRect(36, 36, COLORS.primary, 10);
  logoBg.x = 20; logoBg.y = 22;
  sidebar.appendChild(logoBg);
  const logoT = await makeText("N", 18, COLORS.white, "Bold");
  logoT.x = 30; logoT.y = 29;
  sidebar.appendChild(logoT);
  const brandName = await makeText("Nila Arumbu", 14, COLORS.slate900, "Bold");
  brandName.x = 64; brandName.y = 28;
  sidebar.appendChild(brandName);
  const brandSub = await makeText("Decision Support", 11, COLORS.slate500, "Regular");
  brandSub.x = 64; brandSub.y = 46;
  sidebar.appendChild(brandSub);

  // Nav groups
  const navGroups = [
    { label: "Overview", items: ["🏠 Dashboard", "👶 Children"] },
    { label: "Daily Work", items: ["📅 Attendance", "📈 Growth", "⚡ Development"] },
    { label: "Care Management", items: ["📋 Referrals", "⚠️ Risk Engine", "📚 Learning"] },
    { label: "Engagement", items: ["💬 WhatsApp", "🎤 Voice Input"] },
    { label: "Reports", items: ["📊 Supervisor"] },
  ];

  let navY = 90;
  for (const group of navGroups) {
    const groupLabel = await makeText(group.label.toUpperCase(), 10, COLORS.slate300, "SemiBold");
    groupLabel.x = 20; groupLabel.y = navY;
    sidebar.appendChild(groupLabel);
    navY += 22;

    for (let i = 0; i < group.items.length; i++) {
      const isActive = group.items[i] === "🏠 Dashboard";
      if (isActive) {
        const activeBg = makeRect(216, 36, COLORS.primary, 10);
        activeBg.x = 16; activeBg.y = navY - 4;
        sidebar.appendChild(activeBg);
      }
      const navItem = await makeText(group.items[i], 13, isActive ? COLORS.white : COLORS.slate700, isActive ? "SemiBold" : "Regular");
      navItem.x = 28; navItem.y = navY;
      sidebar.appendChild(navItem);
      navY += 40;
    }
    navY += 8;
  }

  // User footer
  const footerBg = makeRect(256, 80, COLORS.slate50);
  footerBg.x = 0; footerBg.y = 820;
  sidebar.appendChild(footerBg);
  const avatar = makeRect(36, 36, COLORS.purple, 18);
  avatar.x = 16; avatar.y = 832;
  sidebar.appendChild(avatar);
  const avatarT = await makeText("LD", 13, COLORS.white, "Bold");
  avatarT.x = 24; avatarT.y = 841;
  sidebar.appendChild(avatarT);
  const userName = await makeText("Lakshmi Devi", 13, COLORS.slate900, "SemiBold");
  userName.x = 60; userName.y = 833;
  sidebar.appendChild(userName);
  const userRole = await makeText("Anganwadi Worker", 11, COLORS.slate500, "Regular");
  userRole.x = 60; userRole.y = 851;
  sidebar.appendChild(userRole);

  // Main content area
  const main = makeFrame("Main", 1184, 900, COLORS.bgPage);
  main.x = 256;
  screen.appendChild(main);

  // Top bar
  const topbar = makeRect(1184, 56, COLORS.white);
  main.appendChild(topbar);
  const pageTitle = await makeText("Dashboard", 15, COLORS.slate700, "SemiBold");
  pageTitle.x = 32; pageTitle.y = 18;
  main.appendChild(pageTitle);

  // Sync badge
  const syncBadge = makeRect(80, 28, {r:0.94,g:0.99,b:0.96}, 14);
  syncBadge.x = 1080; syncBadge.y = 14;
  main.appendChild(syncBadge);
  const syncText = await makeText("✓ Synced", 12, COLORS.green, "Medium");
  syncText.x = 1090; syncText.y = 21;
  main.appendChild(syncText);

  // Hero banner
  const heroBg = makeRect(1120, 120, COLORS.primary, 20);
  heroBg.x = 32; heroBg.y = 80;
  main.appendChild(heroBg);
  const greet = await makeText("Good Morning 👋", 13, {r:0.7,g:0.75,b:1}, "Regular");
  greet.x = 48; greet.y = 96;
  main.appendChild(greet);
  const heroName = await makeText("Lakshmi", 28, COLORS.white, "Bold");
  heroName.x = 48; heroName.y = 116;
  main.appendChild(heroName);
  const heroSub = await makeText("Every child seen. Every risk identified. Every referral closed.", 14, {r:0.8,g:0.83,b:1}, "Regular");
  heroSub.x = 48; heroSub.y = 154;
  main.appendChild(heroSub);

  // Stat boxes on hero
  const stats = [
    { label: "Children", value: "12", emoji: "👶" },
    { label: "Pending Refs", value: "4",  emoji: "📋" },
  ];
  stats.forEach(async (s, i) => {
    const box = makeRect(120, 80, {r:1,g:1,b:1}, 12);
    box.opacity = 0.15;
    box.x = 920 + i * 136; box.y = 100;
    main.appendChild(box);
    const em = await makeText(s.emoji, 22, COLORS.white, "Regular");
    em.x = 940 + i * 136; em.y = 108;
    main.appendChild(em);
    const val = await makeText(s.value, 28, COLORS.white, "Bold");
    val.x = 940 + i * 136; val.y = 130;
    main.appendChild(val);
    const lbl = await makeText(s.label, 11, {r:0.8,g:0.83,b:1}, "Regular");
    lbl.x = 940 + i * 136; lbl.y = 162;
    main.appendChild(lbl);
  });

  // Stat cards row
  const cards = [
    { label:"Children",     value:"12", emoji:"👶", color:COLORS.primary },
    { label:"Pending Refs", value:"4",  emoji:"📋", color:{r:0.976,g:0.451,b:0.086} },
    { label:"Escalated",    value:"3",  emoji:"🚨", color:COLORS.red },
    { label:"Follow-Ups",   value:"2",  emoji:"🔄", color:COLORS.purple },
  ];
  cards.forEach(async (c, i) => {
    const card = makeRect(262, 100, COLORS.white, 16);
    card.x = 32 + i * 278; card.y = 224;
    main.appendChild(card);
    const em = await makeText(c.emoji, 24, COLORS.white, "Regular");
    em.x = 48 + i * 278; em.y = 236;
    main.appendChild(em);
    const val = await makeText(c.value, 32, c.color, "Bold");
    val.x = 48 + i * 278; val.y = 266;
    main.appendChild(val);
    const lbl = await makeText(c.label, 12, COLORS.slate500, "Regular");
    lbl.x = 48 + i * 278; lbl.y = 305;
    main.appendChild(lbl);
  });

  figma.currentPage.appendChild(screen);
}

// ── Screen 3: Children List ───────────────────────────────────────────────────

async function createChildrenList(x:number, y:number) {
  const screen = makeFrame("03 — Children List", 1440, 900, COLORS.bgPage);
  screen.x = x; screen.y = y;

  // Reuse sidebar visual
  const sidebar = makeRect(256, 900, COLORS.white);
  screen.appendChild(sidebar);
  const sidebarTitle = await makeText("Nila Arumbu", 14, COLORS.slate900, "Bold");
  sidebarTitle.x = 64; sidebarTitle.y = 28;
  screen.appendChild(sidebarTitle);

  const mainBg = makeFrame("Content", 1184, 900, COLORS.bgPage);
  mainBg.x = 256;
  screen.appendChild(mainBg);

  // Header
  const header = await makeText("Children", 28, COLORS.slate900, "Bold");
  header.x = 32; header.y = 72;
  mainBg.appendChild(header);
  const sub = await makeText("12 registered · 12 shown", 14, COLORS.slate500, "Regular");
  sub.x = 32; sub.y = 110;
  mainBg.appendChild(sub);

  // Register button
  const btnBg = makeRect(160, 44, COLORS.primary, 12);
  btnBg.x = 960; btnBg.y = 84;
  mainBg.appendChild(btnBg);
  const btnT = await makeText("+ Register Child", 14, COLORS.white, "SemiBold");
  btnT.x = 980; btnT.y = 97;
  mainBg.appendChild(btnT);

  // Table card
  const tableCard = makeRect(1120, 660, COLORS.white, 16);
  tableCard.x = 32; tableCard.y = 150;
  mainBg.appendChild(tableCard);

  // Search bar
  const searchBg = makeRect(300, 40, COLORS.slate100, 10);
  searchBg.x = 48; searchBg.y = 166;
  mainBg.appendChild(searchBg);
  const searchT = await makeText("🔍 Search by name or Aadhaar…", 13, COLORS.slate300, "Regular");
  searchT.x = 64; searchT.y = 178;
  mainBg.appendChild(searchT);

  // Children rows
  const children = [
    { name:"Aravind Kumar",     age:"4y 2m", gender:"MALE",   risk:"RED",    score:"78" },
    { name:"Priya Devi",        age:"4y 10m",gender:"FEMALE", risk:"YELLOW", score:"52" },
    { name:"Murugan Selvam",    age:"3y 4m", gender:"MALE",   risk:"GREEN",  score:"12" },
    { name:"Deepa Raj",         age:"3y 8m", gender:"FEMALE", risk:"YELLOW", score:"48" },
    { name:"Karthik Babu",      age:"4y 6m", gender:"MALE",   risk:"GREEN",  score:"8"  },
    { name:"Saanvi Moorthy",    age:"3y 11m",gender:"FEMALE", risk:"RED",    score:"82" },
    { name:"Balamurugan Siva",  age:"5y 0m", gender:"MALE",   risk:"RED",    score:"76" },
  ];

  const riskColors: Record<string, {r:number,g:number,b:number}> = {
    RED:    {r:0.99,g:0.93,b:0.93},
    YELLOW: {r:1,   g:0.97,b:0.88},
    GREEN:  {r:0.93,g:0.99,b:0.95},
  };
  const riskText: Record<string, {r:number,g:number,b:number}> = {
    RED:    COLORS.red,
    YELLOW: COLORS.yellow,
    GREEN:  COLORS.green,
  };

  children.forEach(async (c, i) => {
    const rowY = 220 + i * 58;
    if (i % 2 === 0) {
      const rowBg = makeRect(1120, 54, COLORS.slate50);
      rowBg.x = 0; rowBg.y = rowY - 10;
    }

    const gradColors: Record<string, {r:number,g:number,b:number}> = {
      MALE: COLORS.primary, FEMALE: COLORS.pink,
    };
    const avatar = makeRect(36, 36, gradColors[c.gender] || COLORS.purple, 18);
    avatar.x = 16; avatar.y = rowY;
    mainBg.appendChild(avatar);
    const initials = c.name.split(" ").map(n=>n[0]).join("");
    const avatarT = await makeText(initials, 12, COLORS.white, "Bold");
    avatarT.x = 24; avatarT.y = rowY + 10;
    mainBg.appendChild(avatarT);

    const nameT = await makeText(c.name, 14, COLORS.slate900, "SemiBold");
    nameT.x = 64; nameT.y = rowY;
    mainBg.appendChild(nameT);
    const ageT = await makeText(`${c.age} · ${c.gender}`, 12, COLORS.slate400, "Regular");
    ageT.x = 64; ageT.y = rowY + 20;
    mainBg.appendChild(ageT);

    const badgeBg = makeRect(90, 26, riskColors[c.risk], 13);
    badgeBg.x = 800; badgeBg.y = rowY + 4;
    mainBg.appendChild(badgeBg);
    const badgeLabel = c.risk === "RED" ? "High Risk" : c.risk === "YELLOW" ? "Med Risk" : "Low Risk";
    const badgeT = await makeText(`● ${badgeLabel} · ${c.score}`, 11, riskText[c.risk], "SemiBold");
    badgeT.x = 810; badgeT.y = rowY + 10;
    mainBg.appendChild(badgeT);
  });

  figma.currentPage.appendChild(screen);
}

// ── Screen 4: Child Detail ────────────────────────────────────────────────────

async function createChildDetail(x:number, y:number) {
  const screen = makeFrame("04 — Child Detail", 1440, 900, COLORS.bgPage);
  screen.x = x; screen.y = y;

  const sidebar = makeRect(256, 900, COLORS.white);
  screen.appendChild(sidebar);

  const main = makeFrame("Content", 1184, 900, COLORS.bgPage);
  main.x = 256;
  screen.appendChild(main);

  // Back + header
  const backBtn = makeRect(36, 36, COLORS.slate100, 10);
  backBtn.x = 32; backBtn.y = 72;
  main.appendChild(backBtn);
  const backT = await makeText("←", 18, COLORS.slate700, "Regular");
  backT.x = 42; backT.y = 78;
  main.appendChild(backT);

  const childName = await makeText("Aravind Kumar", 28, COLORS.slate900, "Bold");
  childName.x = 88; childName.y = 72;
  main.appendChild(childName);

  const riskPill = makeRect(110, 28, {r:0.99,g:0.93,b:0.93}, 14);
  riskPill.x = 316; riskPill.y = 78;
  main.appendChild(riskPill);
  const riskT = await makeText("● High Risk · 78", 12, COLORS.red, "SemiBold");
  riskT.x = 326; riskT.y = 85;
  main.appendChild(riskT);

  const passportBtn = makeRect(120, 32, COLORS.white, 10);
  passportBtn.x = 960; passportBtn.y = 76;
  passportBtn.strokes = [{ type:"SOLID", color:COLORS.primary }];
  passportBtn.strokeWeight = 1.5;
  main.appendChild(passportBtn);
  const passT = await makeText("View Passport", 12, COLORS.primary, "SemiBold");
  passT.x = 972; passT.y = 84;
  main.appendChild(passT);

  // 4 stat cards
  const detailStats = [
    { label:"Attendance Rate", value:"40%",  color:COLORS.red },
    { label:"Risk Score",      value:"78",   color:COLORS.red },
    { label:"Active Referrals",value:"1",    color:{r:0.98,g:0.58,b:0.11} },
    { label:"Sessions",        value:"8/20", color:COLORS.primary },
  ];
  detailStats.forEach(async (s, i) => {
    const card = makeRect(260, 90, COLORS.white, 16);
    card.x = 32 + i * 276; card.y = 130;
    main.appendChild(card);
    const val = await makeText(s.value, 28, s.color, "Bold");
    val.x = 50 + i * 276; val.y = 145;
    main.appendChild(val);
    const lbl = await makeText(s.label, 12, COLORS.slate500, "Regular");
    lbl.x = 50 + i * 276; lbl.y = 182;
    main.appendChild(lbl);
  });

  // Risk breakdown card
  const riskCard = makeRect(540, 340, COLORS.white, 16);
  riskCard.x = 32; riskCard.y = 248;
  main.appendChild(riskCard);
  const riskTitle = await makeText("Risk Breakdown", 16, COLORS.slate900, "Bold");
  riskTitle.x = 56; riskTitle.y = 268;
  main.appendChild(riskTitle);
  const riskSub = await makeText("Explainable score — no black box", 12, COLORS.slate500, "Regular");
  riskSub.x = 56; riskSub.y = 290;
  main.appendChild(riskSub);

  const riskFactors = [
    { label:"Attendance",   score:100, weight:"20%" },
    { label:"Nutrition",    score:85,  weight:"25%" },
    { label:"Development",  score:55,  weight:"25%" },
    { label:"Caregiver",    score:55,  weight:"15%" },
    { label:"Migration",    score:60,  weight:"15%" },
  ];
  riskFactors.forEach(async (f, i) => {
    const fy = 316 + i * 48;
    const labelT = await makeText(f.label, 13, COLORS.slate700, "Medium");
    labelT.x = 56; labelT.y = fy;
    main.appendChild(labelT);
    const weightT = await makeText(`${f.score}/100 · ${f.weight}`, 11, COLORS.slate400, "Regular");
    weightT.x = 380; weightT.y = fy;
    main.appendChild(weightT);
    const barBg = makeRect(460, 8, COLORS.slate100, 4);
    barBg.x = 56; barBg.y = fy + 20;
    main.appendChild(barBg);
    const barFill = makeRect(460 * f.score / 100, 8, f.score >= 70 ? COLORS.red : f.score >= 40 ? COLORS.yellow : COLORS.green, 4);
    barFill.x = 56; barFill.y = fy + 20;
    main.appendChild(barFill);
  });

  // Referrals card
  const refCard = makeRect(540, 340, COLORS.white, 16);
  refCard.x = 608; refCard.y = 248;
  main.appendChild(refCard);
  const refTitle = await makeText("Referrals", 16, COLORS.slate900, "Bold");
  refTitle.x = 632; refTitle.y = 268;
  main.appendChild(refTitle);
  const newRefT = await makeText("+ New", 13, COLORS.primary, "SemiBold");
  newRefT.x = 1080; newRefT.y = 268;
  main.appendChild(newRefT);

  const refItemBg = makeRect(492, 100, COLORS.slate50, 12);
  refItemBg.x = 632; refItemBg.y = 310;
  main.appendChild(refItemBg);
  const refType = await makeText("NRC", 14, COLORS.slate900, "Bold");
  refType.x = 650; refType.y = 322;
  main.appendChild(refType);
  const escPill = makeRect(80, 22, {r:0.99,g:0.93,b:0.93}, 11);
  escPill.x = 900; escPill.y = 318;
  main.appendChild(escPill);
  const escT = await makeText("🚨 Escalated", 11, COLORS.red, "SemiBold");
  escT.x = 908; escT.y = 324;
  main.appendChild(escT);
  const refReason = await makeText("SAM detected — MUAC 10.5cm. Severe\nunderweight (WAZ -3.5). NRC admission.", 12, COLORS.slate500, "Regular");
  refReason.x = 650; refReason.y = 346;
  main.appendChild(refReason);

  figma.currentPage.appendChild(screen);
}

// ── Screen 5: Referrals ───────────────────────────────────────────────────────

async function createReferrals(x:number, y:number) {
  const screen = makeFrame("05 — Referrals", 1440, 900, COLORS.bgPage);
  screen.x = x; screen.y = y;

  const sidebar = makeRect(256, 900, COLORS.white);
  screen.appendChild(sidebar);

  const main = makeFrame("Content", 1184, 900, COLORS.bgPage);
  main.x = 256;
  screen.appendChild(main);

  const title = await makeText("Referrals", 28, COLORS.slate900, "Bold");
  title.x = 32; title.y = 72;
  main.appendChild(title);
  const sub = await makeText("Track every referral from identification to closure.", 14, COLORS.slate500, "Regular");
  sub.x = 32; sub.y = 110;
  main.appendChild(sub);

  // Status tabs
  const tabs = [
    { label:"🔍 Identified",    active:false },
    { label:"📤 Referred",      active:false },
    { label:"📅 Appt. Pending", active:true  },
    { label:"🏥 Visited",       active:false },
    { label:"🔄 Follow-Up",     active:false },
  ];
  let tabX = 32;
  for (const tab of tabs) {
    const tw = tab.label.length * 9 + 32;
    const tabBg = makeRect(tw, 40, tab.active ? COLORS.primary : COLORS.white, 12);
    tabBg.x = tabX; tabBg.y = 148;
    if (!tab.active) {
      tabBg.strokes = [{ type:"SOLID", color: COLORS.slate300 }];
      tabBg.strokeWeight = 1;
    }
    main.appendChild(tabBg);
    const tabT = await makeText(tab.label, 13, tab.active ? COLORS.white : COLORS.slate600, tab.active ? "SemiBold" : "Regular");
    tabT.x = tabX + 14; tabT.y = 159;
    main.appendChild(tabT);
    tabX += tw + 10;
  }

  // Referral list
  const listCard = makeRect(1120, 560, COLORS.white, 16);
  listCard.x = 32; listCard.y = 210;
  main.appendChild(listCard);

  const referrals = [
    { name:"Aravind Kumar",    type:"NRC",      status:"APPOINTMENT_PENDING", escalated:true,  risk:"RED",    score:"78" },
    { name:"Saanvi Moorthy",   type:"NRC",      status:"APPOINTMENT_PENDING", escalated:true,  risk:"RED",    score:"82" },
    { name:"Balamurugan Siva", type:"PHC",      status:"APPOINTMENT_PENDING", escalated:false, risk:"RED",    score:"76" },
    { name:"Priya Devi",       type:"PHC",      status:"APPOINTMENT_PENDING", escalated:false, risk:"YELLOW", score:"52" },
  ];

  for (let i = 0; i < referrals.length; i++) {
    const r = referrals[i];
    const ry = 248 + i * 72;

    if (i % 2 === 0) {
      const rowBg = makeRect(1120, 68, COLORS.slate50);
      rowBg.x = 0; rowBg.y = ry - 8;
      main.appendChild(rowBg);
    }

    const icon = makeRect(40, 40, {r:0.99,g:0.96,b:0.93}, 12);
    icon.x = 16; icon.y = ry;
    main.appendChild(icon);
    const iconT = await makeText("📋", 18, COLORS.white, "Regular");
    iconT.x = 22; iconT.y = ry + 8;
    main.appendChild(iconT);

    const nameT = await makeText(r.name, 14, COLORS.slate900, "SemiBold");
    nameT.x = 72; nameT.y = ry + 2;
    main.appendChild(nameT);

    const typeT = await makeText(r.type, 12, COLORS.slate400, "Regular");
    typeT.x = 72; typeT.y = ry + 22;
    main.appendChild(typeT);

    if (r.escalated) {
      const escBg = makeRect(90, 22, {r:0.99,g:0.93,b:0.93}, 11);
      escBg.x = 280; escBg.y = ry + 8;
      main.appendChild(escBg);
      const escT = await makeText("🚨 Escalated", 11, COLORS.red, "SemiBold");
      escT.x = 288; escT.y = ry + 14;
      main.appendChild(escT);
    }

    // Status badge
    const badgeBg = makeRect(140, 28, {r:0.99,g:0.97,b:0.88}, 14);
    badgeBg.x = 880; badgeBg.y = ry + 6;
    main.appendChild(badgeBg);
    const badgeT = await makeText("📅 Appt. Pending", 12, COLORS.yellow, "SemiBold");
    badgeT.x = 892; badgeT.y = ry + 14;
    main.appendChild(badgeT);
  }

  figma.currentPage.appendChild(screen);
}

// ── Screen 6: Risk Engine ─────────────────────────────────────────────────────

async function createRiskEngine(x:number, y:number) {
  const screen = makeFrame("06 — Risk Engine", 1440, 900, COLORS.bgPage);
  screen.x = x; screen.y = y;

  const sidebar = makeRect(256, 900, COLORS.white);
  screen.appendChild(sidebar);

  const main = makeFrame("Content", 1184, 900, COLORS.bgPage);
  main.x = 256;
  screen.appendChild(main);

  const title = await makeText("Risk Engine", 28, COLORS.slate900, "Bold");
  title.x = 32; title.y = 72;
  main.appendChild(title);
  const sub = await makeText("Explainable risk scores — Attendance 20% · Nutrition 25% · Development 25% · Caregiver 15% · Migration 15%", 13, COLORS.slate500, "Regular");
  sub.x = 32; sub.y = 110;
  main.appendChild(sub);

  const listCard = makeRect(1120, 660, COLORS.white, 16);
  listCard.x = 32; listCard.y = 148;
  main.appendChild(listCard);

  const riskChildren = [
    { name:"Aravind Kumar",    risk:"RED",    score:78 },
    { name:"Saanvi Moorthy",   risk:"RED",    score:82 },
    { name:"Balamurugan Siva", risk:"RED",    score:76 },
    { name:"Priya Devi",       risk:"YELLOW", score:52 },
    { name:"Deepa Raj",        risk:"YELLOW", score:48 },
    { name:"Nandhini Krishnan",risk:"YELLOW", score:45 },
    { name:"Keerthana Rajan",  risk:"YELLOW", score:42 },
    { name:"Murugan Selvam",   risk:"GREEN",  score:12 },
    { name:"Karthik Babu",     risk:"GREEN",  score:8  },
    { name:"Dinesh Pandian",   risk:"GREEN",  score:6  },
    { name:"Surya Vel",        risk:"GREEN",  score:10 },
    { name:"Varsha Nair",      risk:"GREEN",  score:4  },
  ];

  const riskCol: Record<string, {r:number,g:number,b:number}> = {
    RED: COLORS.red, YELLOW: COLORS.yellow, GREEN: COLORS.green
  };
  const riskBg: Record<string, {r:number,g:number,b:number}> = {
    RED: {r:0.99,g:0.93,b:0.93},
    YELLOW: {r:1,g:0.97,b:0.88},
    GREEN: {r:0.93,g:0.99,b:0.95},
  };

  for (let i = 0; i < riskChildren.length; i++) {
    const c = riskChildren[i];
    const ry = 186 + i * 48;
    const initials = c.name.split(" ").map(n=>n[0]).join("");
    const avatar = makeRect(32, 32, riskBg[c.risk], 16);
    avatar.x = 16; avatar.y = ry;
    main.appendChild(avatar);
    const avT = await makeText(initials, 11, riskCol[c.risk], "Bold");
    avT.x = 22; avT.y = ry + 9;
    main.appendChild(avT);
    const nameT = await makeText(c.name, 14, COLORS.slate900, "SemiBold");
    nameT.x = 60; nameT.y = ry + 8;
    main.appendChild(nameT);

    const badge = makeRect(110, 24, riskBg[c.risk], 12);
    badge.x = 900; badge.y = ry + 4;
    main.appendChild(badge);
    const bLabel = c.risk === "RED" ? "● High Risk" : c.risk === "YELLOW" ? "● Med Risk" : "● Low Risk";
    const bT = await makeText(`${bLabel} · ${c.score}`, 11, riskCol[c.risk], "SemiBold");
    bT.x = 910; bT.y = ry + 10;
    main.appendChild(bT);

    // Mini progress bar
    const barBg = makeRect(300, 6, COLORS.slate100, 3);
    barBg.x = 560; barBg.y = ry + 13;
    main.appendChild(barBg);
    const barW = 300 * c.score / 100;
    const barFill = makeRect(barW, 6, riskCol[c.risk], 3);
    barFill.x = 560; barFill.y = ry + 13;
    main.appendChild(barFill);
  }

  figma.currentPage.appendChild(screen);
}

// ── Screen 7: Supervisor Dashboard ───────────────────────────────────────────

async function createSupervisor(x:number, y:number) {
  const screen = makeFrame("07 — Supervisor Dashboard", 1440, 900, COLORS.bgPage);
  screen.x = x; screen.y = y;

  const sidebar = makeRect(256, 900, COLORS.white);
  screen.appendChild(sidebar);

  const main = makeFrame("Content", 1184, 900, COLORS.bgPage);
  main.x = 256;
  screen.appendChild(main);

  const title = await makeText("Supervisor Dashboard", 28, COLORS.slate900, "Bold");
  title.x = 32; title.y = 72;
  main.appendChild(title);
  const sub = await makeText("Platform-wide overview · as of 2026-06-02", 13, COLORS.slate500, "Regular");
  sub.x = 32; sub.y = 110;
  main.appendChild(sub);

  // 4 stat cards
  const supStats = [
    { label:"Total Children",   value:"12", emoji:"👶", color:COLORS.primary },
    { label:"Centres",          value:"3",  emoji:"🏠", color:{r:0.235,g:0.627,b:0.898} },
    { label:"Open Referrals",   value:"7",  emoji:"📋", color:{r:0.98,g:0.58,b:0.11} },
    { label:"Escalated Cases",  value:"3",  emoji:"🚨", color:COLORS.red },
  ];
  supStats.forEach(async (s, i) => {
    const card = makeRect(262, 100, COLORS.white, 16);
    card.x = 32 + i * 278; card.y = 148;
    main.appendChild(card);
    const em = await makeText(s.emoji, 22, COLORS.white, "Regular");
    em.x = 50 + i * 278; em.y = 158;
    main.appendChild(em);
    const val = await makeText(s.value, 32, s.color, "Bold");
    val.x = 50 + i * 278; val.y = 180;
    main.appendChild(val);
    const lbl = await makeText(s.label, 12, COLORS.slate500, "Regular");
    lbl.x = 50 + i * 278; lbl.y = 220;
    main.appendChild(lbl);
  });

  // Risk Distribution card
  const riskCard = makeRect(540, 300, COLORS.white, 16);
  riskCard.x = 32; riskCard.y = 278;
  main.appendChild(riskCard);
  const riskTitle = await makeText("Risk Distribution", 16, COLORS.slate900, "Bold");
  riskTitle.x = 56; riskTitle.y = 298;
  main.appendChild(riskTitle);
  const riskSub = await makeText("12 children assessed", 12, COLORS.slate400, "Regular");
  riskSub.x = 56; riskSub.y = 320;
  main.appendChild(riskSub);

  const riskBars = [
    { label:"Green — Low Risk",    count:"5 (42%)",  color:COLORS.green,  pct:0.42 },
    { label:"Yellow — Medium Risk",count:"4 (33%)",  color:COLORS.yellow, pct:0.33 },
    { label:"Red — High Risk",     count:"3 (25%)",  color:COLORS.red,    pct:0.25 },
  ];
  riskBars.forEach(async (b, i) => {
    const by = 352 + i * 60;
    const lbl = await makeText(b.label, 13, COLORS.slate700, "Medium");
    lbl.x = 56; lbl.y = by;
    main.appendChild(lbl);
    const cnt = await makeText(b.count, 12, COLORS.slate400, "Regular");
    cnt.x = 400; cnt.y = by;
    main.appendChild(cnt);
    const barBg = makeRect(460, 10, COLORS.slate100, 5);
    barBg.x = 56; barBg.y = by + 22;
    main.appendChild(barBg);
    const barFill = makeRect(460 * b.pct, 10, b.color, 5);
    barFill.x = 56; barFill.y = by + 22;
    main.appendChild(barFill);
  });

  // Attendance
  const attRow = makeRect(460, 1, COLORS.slate100);
  attRow.x = 56; attRow.y = 534;
  main.appendChild(attRow);
  const attLabel = await makeText("Today's Attendance Rate", 13, COLORS.slate500, "Regular");
  attLabel.x = 56; attLabel.y = 546;
  main.appendChild(attLabel);
  const attVal = await makeText("0%", 15, COLORS.red, "Bold");
  attVal.x = 464; attVal.y = 546;
  main.appendChild(attVal);

  // Centre-wise card
  const centreCard = makeRect(580, 300, COLORS.white, 16);
  centreCard.x = 608; centreCard.y = 278;
  main.appendChild(centreCard);
  const centreTitle = await makeText("Centre-wise Risk Breakdown", 16, COLORS.slate900, "Bold");
  centreTitle.x = 632; centreTitle.y = 298;
  main.appendChild(centreTitle);

  const centres = [
    { name:"Chennai Central",  total:5, green:2, yellow:2, red:1 },
    { name:"Tambaram",         total:3, green:1, yellow:1, red:1 },
    { name:"Madurai South",    total:4, green:2, yellow:1, red:1 },
  ];
  centres.forEach(async (c, i) => {
    const cy = 336 + i * 72;
    const nameT = await makeText(c.name, 14, COLORS.slate900, "SemiBold");
    nameT.x = 632; nameT.y = cy;
    main.appendChild(nameT);
    const totalT = await makeText(`${c.total} children`, 12, COLORS.slate400, "Regular");
    totalT.x = 1080; totalT.y = cy;
    main.appendChild(totalT);
    // Stacked bar
    const barW = 500;
    const gw = barW * c.green / c.total;
    const yw = barW * c.yellow / c.total;
    const rw = barW * c.red / c.total;
    const gBar = makeRect(gw, 10, COLORS.green, 5);
    gBar.x = 632; gBar.y = cy + 22;
    main.appendChild(gBar);
    const yBar = makeRect(yw, 10, COLORS.yellow, 0);
    yBar.x = 632 + gw; yBar.y = cy + 22;
    main.appendChild(yBar);
    const rBar = makeRect(rw, 10, COLORS.red, 0);
    rBar.x = 632 + gw + yw; rBar.y = cy + 22;
    main.appendChild(rBar);
    const legend = await makeText(`● ${c.green} low  ● ${c.yellow} med  ● ${c.red} high`, 11, COLORS.slate400, "Regular");
    legend.x = 632; legend.y = cy + 40;
    main.appendChild(legend);
  });

  figma.currentPage.appendChild(screen);
}

// ── Screen 8: WhatsApp Engagement ────────────────────────────────────────────

async function createWhatsApp(x:number, y:number) {
  const screen = makeFrame("08 — WhatsApp Engagement", 1440, 900, COLORS.bgPage);
  screen.x = x; screen.y = y;

  const sidebar = makeRect(256, 900, COLORS.white);
  screen.appendChild(sidebar);

  const main = makeFrame("Content", 900, 900, COLORS.bgPage);
  main.x = 256;
  screen.appendChild(main);

  const title = await makeText("Parent Engagement", 28, COLORS.slate900, "Bold");
  title.x = 32; title.y = 72;
  main.appendChild(title);
  const sub = await makeText("WhatsApp மூலம் parents-க்கு Tamil + English messages அனுப்புங்கள்.", 14, COLORS.slate500, "Regular");
  sub.x = 32; sub.y = 110;
  main.appendChild(sub);

  const card = makeRect(836, 680, COLORS.white, 16);
  card.x = 32; card.y = 148;
  main.appendChild(card);

  const cardTitle = await makeText("Send WhatsApp Message", 18, COLORS.slate900, "Bold");
  cardTitle.x = 56; cardTitle.y = 172;
  main.appendChild(cardTitle);
  const cardSub = await makeText("Bilingual Tamil + English templates", 13, COLORS.slate400, "Regular");
  cardSub.x = 56; cardSub.y = 198;
  main.appendChild(cardSub);

  // Child dropdown
  const childLabel = await makeText("Child", 14, COLORS.slate700, "Medium");
  childLabel.x = 56; childLabel.y = 240;
  main.appendChild(childLabel);
  const childBox = makeRect(760, 48, COLORS.slate100, 12);
  childBox.x = 56; childBox.y = 262;
  main.appendChild(childBox);
  const childT = await makeText("Aravind Kumar", 14, COLORS.slate700, "Regular");
  childT.x = 76; childT.y = 278;
  main.appendChild(childT);

  // Phone field
  const phoneLabel = await makeText("Parent WhatsApp Number", 14, COLORS.slate700, "Medium");
  phoneLabel.x = 56; phoneLabel.y = 330;
  main.appendChild(phoneLabel);
  const phoneBox = makeRect(760, 48, COLORS.slate100, 12);
  phoneBox.x = 56; phoneBox.y = 352;
  main.appendChild(phoneBox);
  const phoneT = await makeText("+91 6369713571", 14, COLORS.slate700, "Regular");
  phoneT.x = 76; phoneT.y = 368;
  main.appendChild(phoneT);

  // Template grid
  const templateLabel = await makeText("Message Template", 14, COLORS.slate700, "Medium");
  templateLabel.x = 56; templateLabel.y = 422;
  main.appendChild(templateLabel);

  const templates = [
    { label:"📌 Daily Activity",      desc:"இன்றைய செயல்பாடு",     active:true  },
    { label:"📅 Weekly Reminder",     desc:"வாராந்திர நினைவூட்டல்", active:false },
    { label:"🏥 Referral Reminder",   desc:"மருத்துவ சந்திப்பு",    active:false },
    { label:"🧠 Development Tip",     desc:"வளர்ச்சி குறிப்பு",     active:false },
    { label:"📊 Progress Summary",    desc:"மாதாந்திர முன்னேற்றம்",  active:false },
    { label:"🔴 Risk Alert",          desc:"உடனடி கவனிப்பு",         active:false },
  ];
  templates.forEach(async (t, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const tx = 56 + col * 390;
    const ty = 448 + row * 68;
    const bg = makeRect(370, 56, t.active ? {r:0.94,g:0.95,b:1} : COLORS.white, 12);
    if (t.active) {
      bg.strokes = [{ type:"SOLID", color:COLORS.primary }];
      bg.strokeWeight = 1.5;
    } else {
      bg.strokes = [{ type:"SOLID", color:COLORS.slate300 }];
      bg.strokeWeight = 1;
    }
    bg.x = tx; bg.y = ty;
    main.appendChild(bg);
    const tLabel = await makeText(t.label, 13, t.active ? COLORS.primary : COLORS.slate700, t.active ? "SemiBold" : "Medium");
    tLabel.x = tx + 12; tLabel.y = ty + 10;
    main.appendChild(tLabel);
    const tDesc = await makeText(t.desc, 11, COLORS.slate400, "Regular");
    tDesc.x = tx + 12; tDesc.y = ty + 32;
    main.appendChild(tDesc);
  });

  // Send button
  const sendBtn = makeRect(760, 52, COLORS.green, 14);
  sendBtn.x = 56; sendBtn.y = 758;
  main.appendChild(sendBtn);
  const sendT = await makeText("💬 Send WhatsApp Message", 15, COLORS.white, "SemiBold");
  sendT.x = 266; sendT.y = 771;
  main.appendChild(sendT);

  figma.currentPage.appendChild(screen);
}

// ── Main runner ───────────────────────────────────────────────────────────────

async function main() {
  figma.currentPage.name = "Nila Arumbu — All Screens";

  print("🎨 Creating Nila Arumbu design system...");

  await createLoginScreen(0, 0);
  print("✓ Screen 1: Login");

  await createDashboard(1500, 0);
  print("✓ Screen 2: Dashboard");

  await createChildrenList(3000, 0);
  print("✓ Screen 3: Children List");

  await createChildDetail(4500, 0);
  print("✓ Screen 4: Child Detail");

  await createReferrals(0, 1000);
  print("✓ Screen 5: Referrals");

  await createRiskEngine(1500, 1000);
  print("✓ Screen 6: Risk Engine");

  await createSupervisor(3000, 1000);
  print("✓ Screen 7: Supervisor Dashboard");

  await createWhatsApp(4500, 1000);
  print("✓ Screen 8: WhatsApp Engagement");

  figma.viewport.scrollAndZoomIntoView(figma.currentPage.children);

  print("\n✅ All 8 screens created!");
  print("Total: Login, Dashboard, Children, Child Detail, Referrals, Risk Engine, Supervisor, WhatsApp");
  print("\nNila Arumbu — Every Child Seen. Every Risk Identified. Every Referral Closed.");
}

main();
