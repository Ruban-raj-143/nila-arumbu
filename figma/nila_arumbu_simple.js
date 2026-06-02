// Nila Arumbu — Figma Design Script (JavaScript)
// Scripter-ல் paste பண்ணி ▶ Run click பண்ணுங்க

const C = {
  primary: {r:0.388,g:0.400,b:0.945},
  purple:  {r:0.545,g:0.361,b:0.965},
  pink:    {r:0.925,g:0.282,b:0.600},
  green:   {r:0.086,g:0.639,b:0.404},
  red:     {r:0.863,g:0.149,b:0.149},
  yellow:  {r:0.851,g:0.467,b:0.024},
  white:   {r:1,g:1,b:1},
  s900:    {r:0.059,g:0.090,b:0.122},
  s700:    {r:0.220,g:0.259,b:0.310},
  s500:    {r:0.392,g:0.451,b:0.514},
  s300:    {r:0.792,g:0.835,b:0.882},
  s100:    {r:0.945,g:0.961,b:0.976},
  s50:     {r:0.973,g:0.980,b:0.988},
  bg:      {r:0.945,g:0.961,b:0.980},
};

async function f(family, style) {
  await figma.loadFontAsync({ family, style });
}

function rect(w, h, color, radius) {
  const r = figma.createRectangle();
  r.resize(w, h);
  r.fills = [{ type:"SOLID", color }];
  r.cornerRadius = radius || 0;
  return r;
}

async function text(str, size, color, weight) {
  await f("Inter", weight || "Regular");
  const t = figma.createText();
  t.fontName = { family:"Inter", style: weight || "Regular" };
  t.characters = str;
  t.fontSize = size;
  t.fills = [{ type:"SOLID", color }];
  return t;
}

function frame(name, w, h, color) {
  const fr = figma.createFrame();
  fr.name = name;
  fr.resize(w, h);
  fr.fills = [{ type:"SOLID", color: color || C.white }];
  fr.clipsContent = true;
  return fr;
}

function add(parent, node, x, y) {
  parent.appendChild(node);
  node.x = x;
  node.y = y;
}

async function sidebar(parent) {
  const sb = frame("Sidebar", 256, 900, C.white);
  add(parent, sb, 0, 0);
  const logo = rect(36, 36, C.primary, 10);
  add(sb, logo, 20, 22);
  const lt = await text("N", 18, C.white, "Bold");
  add(sb, lt, 30, 29);
  const bn = await text("Nila Arumbu", 14, C.s900, "Bold");
  add(sb, bn, 64, 28);
  const bs = await text("Decision Support", 11, C.s500, "Regular");
  add(sb, bs, 64, 46);
  const navItems = [
    ["Overview","🏠 Dashboard","👶 Children"],
    ["Daily Work","📅 Attendance","📈 Growth","⚡ Development"],
    ["Care","📋 Referrals","⚠️ Risk Engine","📚 Learning"],
    ["Engage","💬 WhatsApp","🎤 Voice"],
    ["Reports","📊 Supervisor"],
  ];
  let ny = 88;
  for (const group of navItems) {
    const gl = await text(group[0].toUpperCase(), 10, C.s300, "SemiBold");
    add(sb, gl, 20, ny); ny += 20;
    for (let i = 1; i < group.length; i++) {
      const ni = await text(group[i], 13, C.s700, "Regular");
      add(sb, ni, 28, ny); ny += 38;
    }
    ny += 6;
  }
  const footBg = rect(256, 72, C.s50);
  add(sb, footBg, 0, 828);
  const av = rect(34, 34, C.purple, 17);
  add(sb, av, 16, 836);
  const avt = await text("LD", 12, C.white, "Bold");
  add(sb, avt, 24, 844);
  const un = await text("Lakshmi Devi", 13, C.s900, "SemiBold");
  add(sb, un, 58, 836);
  const ur = await text("Anganwadi Worker", 11, C.s500, "Regular");
  add(sb, ur, 58, 854);
}

async function topbar(parent, title) {
  const tb = rect(1184, 56, C.white);
  add(parent, tb, 0, 0);
  const tt = await text(title, 15, C.s700, "SemiBold");
  add(parent, tt, 32, 18);
  const syncBg = rect(80, 28, {r:0.94,g:0.99,b:0.96}, 14);
  add(parent, syncBg, 1080, 14);
  const st = await text("✓ Synced", 11, C.green, "Medium");
  add(parent, st, 1090, 21);
}

async function screen01_Login() {
  const s = frame("01 — Login", 1440, 900, C.s50);
  add(figma.currentPage, s, 0, 0);
  const left = frame("Left", 720, 900, C.primary);
  add(s, left, 0, 0);
  const lb = rect(56,56,{r:1,g:1,b:1},14); lb.opacity=0.2; add(left,lb,64,72);
  const lt = await text("N",28,C.white,"Bold"); add(left,lt,80,84);
  const ti = await text("Nila Arumbu",48,C.white,"Bold"); add(left,ti,64,168);
  const tg = await text("Integrated Early Childhood\nDecision Support Platform",20,{r:0.78,g:0.8,b:1},"Regular"); add(left,tg,64,248);
  const p1 = await text("👁️  Every Child Seen",16,C.white,"Medium"); add(left,p1,64,368);
  const p2 = await text("⚠️  Every Risk Identified",16,C.white,"Medium"); add(left,p2,64,412);
  const p3 = await text("✅  Every Referral Closed",16,C.white,"Medium"); add(left,p3,64,456);
  const tags = await text("Tamil Nadu   •   ICDS   •   Anganwadi",13,{r:0.7,g:0.75,b:1},"Regular"); add(left,tags,64,820);

  const right = frame("Right", 720, 900, C.white);
  add(s, right, 720, 0);
  const wt = await text("Welcome back",32,C.s900,"Bold"); add(right,wt,160,200);
  const ws = await text("Sign in to your account",15,C.s500,"Regular"); add(right,ws,160,248);
  const el = await text("Email",14,C.s700,"Medium"); add(right,el,160,310);
  const eb = rect(400,48,C.s100,12); add(right,eb,160,332);
  const ep = await text("worker@nilarumbu.gov.in",13,C.s300,"Regular"); add(right,ep,176,348);
  const pl = await text("Password",14,C.s700,"Medium"); add(right,pl,160,402);
  const pb = rect(400,48,C.s100,12); add(right,pb,160,422);
  const pp = await text("••••••••",18,C.s300,"Regular"); add(right,pp,176,434);
  const btn = rect(400,52,C.primary,14); add(right,btn,160,498);
  const bt = await text("Sign In",15,C.white,"SemiBold"); add(right,bt,332,512);
  const cb = rect(400,80,C.s50,12); add(right,cb,160,580);
  const ct = await text("Demo Credentials",12,C.s500,"SemiBold"); add(right,ct,176,596);
  const c1 = await text("👤 worker@nilarumbu.gov.in  ·  Worker@2024",12,C.s700,"Regular"); add(right,c1,176,616);
  const c2 = await text("👑 admin@nilarumbu.gov.in  ·  NilaAdmin@2024",12,C.s700,"Regular"); add(right,c2,176,636);
  print("✓ Screen 1: Login");
}

async function screen02_Dashboard() {
  const s = frame("02 — Dashboard", 1440, 900, C.bg);
  add(figma.currentPage, s, 1500, 0);
  await sidebar(s);
  const main = frame("Main", 1184, 900, C.bg);
  add(s, main, 256, 0);
  await topbar(main, "Dashboard");
  const hero = rect(1120,120,C.primary,20); add(main,hero,32,72);
  const hg = await text("Good Morning 👋",13,{r:0.78,g:0.8,b:1},"Regular"); add(main,hg,48,88);
  const hn = await text("Lakshmi",28,C.white,"Bold"); add(main,hn,48,108);
  const hs = await text("Every child seen. Every risk identified. Every referral closed.",14,{r:0.8,g:0.83,b:1},"Regular"); add(main,hs,48,148);
  const stats = [{l:"Children",v:"12",c:C.primary},{l:"Pending",v:"4",c:{r:0.976,g:0.451,b:0.086}},{l:"Escalated",v:"3",c:C.red},{l:"Follow-Ups",v:"2",c:C.purple}];
  for (let i=0;i<stats.length;i++) {
    const sc = rect(262,90,C.white,16); add(main,sc,32+i*278,216);
    const sv = await text(stats[i].v,32,stats[i].c,"Bold"); add(main,sv,56+i*278,228);
    const sl = await text(stats[i].l,12,C.s500,"Regular"); add(main,sl,56+i*278,268);
  }
  const rc = rect(540,300,C.white,16); add(main,rc,32,330);
  const rt = await text("Recently Registered",16,C.s900,"Bold"); add(main,rt,56,350);
  const names = ["Aravind Kumar","Priya Devi","Murugan Selvam","Deepa Raj","Karthik Babu"];
  for (let i=0;i<names.length;i++) {
    const av = rect(32,32,C.primary,16); add(main,av,56,386+i*52);
    const nt = await text(names[i],14,C.s900,"SemiBold"); add(main,nt,100,394+i*52);
  }
  const qc = rect(560,300,C.white,16); add(main,qc,608,330);
  const qt = await text("Quick Actions",16,C.s900,"Bold"); add(main,qt,632,350);
  const qa = [["➕ Register Child",C.primary],["📅 Attendance",{r:0.235,g:0.627,b:0.898}],["📈 Growth",C.green],["📚 Learning",{r:0.98,g:0.58,b:0.11}]];
  for (let i=0;i<qa.length;i++) {
    const qb = rect(124,60,qa[i][1],14); add(main,qb,632+i*136,386);
    const ql = await text(qa[i][0],11,C.white,"SemiBold"); add(main,ql,642+i*136,410);
  }
  print("✓ Screen 2: Dashboard");
}

async function screen03_Children() {
  const s = frame("03 — Children List", 1440, 900, C.bg);
  add(figma.currentPage, s, 3000, 0);
  await sidebar(s);
  const main = frame("Main", 1184, 900, C.bg);
  add(s, main, 256, 0);
  await topbar(main, "Children");
  const title = await text("Children",28,C.s900,"Bold"); add(main,title,32,72);
  const sub = await text("12 registered",14,C.s500,"Regular"); add(main,sub,32,108);
  const btn = rect(160,44,C.primary,12); add(main,btn,960,80);
  const bt = await text("+ Register Child",13,C.white,"SemiBold"); add(main,bt,976,94);
  const card = rect(1120,660,C.white,16); add(main,card,32,142);
  const sb = rect(280,40,C.s100,10); add(main,sb,48,158);
  const sp = await text("🔍 Search…",13,C.s300,"Regular"); add(main,sp,64,170);
  const kids=[{n:"Aravind Kumar",a:"4y 2m",g:"MALE",r:"RED",s:78},{n:"Priya Devi",a:"4y 10m",g:"FEMALE",r:"YELLOW",s:52},{n:"Murugan Selvam",a:"3y 4m",g:"MALE",r:"GREEN",s:12},{n:"Deepa Raj",a:"3y 8m",g:"FEMALE",r:"YELLOW",s:48},{n:"Karthik Babu",a:"4y 6m",g:"MALE",r:"GREEN",s:8},{n:"Saanvi Moorthy",a:"3y 11m",g:"FEMALE",r:"RED",s:82},{n:"Balamurugan Siva",a:"5y 0m",g:"MALE",r:"RED",s:76}];
  const rc={RED:C.red,YELLOW:C.yellow,GREEN:C.green};
  const gc={MALE:C.primary,FEMALE:C.pink,OTHER:C.purple};
  for(let i=0;i<kids.length;i++){
    const k=kids[i]; const ry=214+i*58;
    const av=rect(36,36,gc[k.g]||C.primary,18); add(main,av,48,ry);
    const init=k.n.split(" ").map(n=>n[0]).join("");
    const at=await text(init,12,C.white,"Bold"); add(main,at,56,ry+10);
    const nt=await text(k.n,14,C.s900,"SemiBold"); add(main,nt,96,ry+2);
    const ag=await text(`${k.a} · ${k.g}`,12,C.s500,"Regular"); add(main,ag,96,ry+20);
    const bb=rect(100,24,{r:rc[k.r].r,g:rc[k.r].g,b:rc[k.r].b},12); bb.opacity=0.15; add(main,bb,880,ry+6);
    const label=k.r==="RED"?"● High":"●Med";
    const bt2=await text(`${label} · ${k.s}`,11,rc[k.r],"SemiBold"); add(main,bt2,886,ry+12);
  }
  print("✓ Screen 3: Children List");
}

async function screen04_ChildDetail() {
  const s = frame("04 — Child Detail", 1440, 900, C.bg);
  add(figma.currentPage, s, 4500, 0);
  await sidebar(s);
  const main = frame("Main", 1184, 900, C.bg);
  add(s, main, 256, 0);
  await topbar(main, "Child Detail");
  const back = rect(36,36,C.s100,10); add(main,back,32,72);
  const bt = await text("←",18,C.s700,"Regular"); add(main,bt,42,78);
  const name = await text("Aravind Kumar",28,C.s900,"Bold"); add(main,name,84,72);
  const rpill = rect(110,28,{r:0.99,g:0.93,b:0.93},14); add(main,rpill,312,78);
  const rt = await text("● High Risk · 78",12,C.red,"SemiBold"); add(main,rt,320,85);
  const pbtn = rect(120,32,C.white,10); pbtn.strokes=[{type:"SOLID",color:C.primary}]; pbtn.strokeWeight=1.5; add(main,pbtn,960,76);
  const pt = await text("View Passport",12,C.primary,"SemiBold"); add(main,pt,972,84);
  const dstats=[{l:"Attendance",v:"40%",c:C.red},{l:"Risk Score",v:"78",c:C.red},{l:"Referrals",v:"1",c:{r:0.98,g:0.58,b:0.11}},{l:"Sessions",v:"8/20",c:C.primary}];
  for(let i=0;i<dstats.length;i++){
    const dc=rect(262,90,C.white,16); add(main,dc,32+i*276,128);
    const dv=await text(dstats[i].v,28,dstats[i].c,"Bold"); add(main,dv,56+i*276,140);
    const dl=await text(dstats[i].l,12,C.s500,"Regular"); add(main,dl,56+i*276,178);
  }
  const rcard=rect(540,320,C.white,16); add(main,rcard,32,242);
  const rct=await text("Risk Breakdown",16,C.s900,"Bold"); add(main,rct,56,262);
  const rcs=await text("No black box — explainable score",12,C.s400,"Regular"); add(main,rcs,56,284);
  const factors=[{l:"Attendance",s:100},{l:"Nutrition",s:85},{l:"Development",s:55},{l:"Caregiver",s:55},{l:"Migration",s:60}];
  for(let i=0;i<factors.length;i++){
    const fy=308+i*46;
    const fl=await text(factors[i].l,13,C.s700,"Medium"); add(main,fl,56,fy);
    const fb=rect(460,8,C.s100,4); add(main,fb,56,fy+20);
    const fc=factors[i].s>=70?C.red:factors[i].s>=40?C.yellow:C.green;
    const ff=rect(460*factors[i].s/100,8,fc,4); add(main,ff,56,fy+20);
  }
  const refcard=rect(540,320,C.white,16); add(main,refcard,608,242);
  const reft=await text("Referrals",16,C.s900,"Bold"); add(main,reft,632,262);
  const newt=await text("+ New",13,C.primary,"SemiBold"); add(main,newt,1080,262);
  const ribg=rect(492,96,C.s50,12); add(main,ribg,632,306);
  const rit=await text("NRC",14,C.s900,"Bold"); add(main,rit,652,318);
  const esc=rect(90,22,{r:0.99,g:0.93,b:0.93},11); add(main,esc,990,314);
  const esct=await text("🚨 Escalated",11,C.red,"SemiBold"); add(main,esct,998,320);
  const rireason=await text("SAM detected — MUAC 10.5cm.\nNRC admission required.",12,C.s500,"Regular"); add(main,rireason,652,342);
  print("✓ Screen 4: Child Detail");
}

async function screen05_Referrals() {
  const s = frame("05 — Referrals", 1440, 900, C.bg);
  add(figma.currentPage, s, 0, 1000);
  await sidebar(s);
  const main = frame("Main", 1184, 900, C.bg);
  add(s, main, 256, 0);
  await topbar(main, "Referrals");
  const title=await text("Referrals",28,C.s900,"Bold"); add(main,title,32,72);
  const tabs=[{l:"🔍 Identified",a:false},{l:"📤 Referred",a:false},{l:"📅 Appt. Pending",a:true},{l:"🏥 Visited",a:false},{l:"🔄 Follow-Up",a:false}];
  let tx=32;
  for(const tab of tabs){
    const tw=tab.l.length*9+28;
    const tbg=rect(tw,38,tab.a?C.primary:C.white,12);
    if(!tab.a){tbg.strokes=[{type:"SOLID",color:C.s300}];tbg.strokeWeight=1;}
    add(main,tbg,tx,140);
    const tt=await text(tab.l,12,tab.a?C.white:C.s500,tab.a?"SemiBold":"Regular"); add(main,tt,tx+12,151);
    tx+=tw+8;
  }
  const lcard=rect(1120,540,C.white,16); add(main,lcard,32,200);
  const refs=[{n:"Aravind Kumar",t:"NRC",e:true},{n:"Saanvi Moorthy",t:"NRC",e:true},{n:"Balamurugan Siva",t:"PHC",e:false},{n:"Priya Devi",t:"PHC",e:false}];
  for(let i=0;i<refs.length;i++){
    const r=refs[i]; const ry=240+i*72;
    const icon=rect(40,40,{r:0.99,g:0.96,b:0.93},12); add(main,icon,50,ry);
    const it=await text("📋",16,C.white,"Regular"); add(main,it,56,ry+8);
    const nt=await text(r.n,14,C.s900,"SemiBold"); add(main,nt,106,ry+4);
    const tyt=await text(r.t,12,C.s400,"Regular"); add(main,tyt,106,ry+24);
    if(r.e){const eb=rect(88,22,{r:0.99,g:0.93,b:0.93},11); add(main,eb,320,ry+8); const et=await text("🚨 Escalated",11,C.red,"SemiBold"); add(main,et,328,ry+14);}
    const sb=rect(140,28,{r:0.99,g:0.97,b:0.88},14); add(main,sb,900,ry+6);
    const st=await text("📅 Appt. Pending",12,C.yellow,"SemiBold"); add(main,st,910,ry+14);
  }
  print("✓ Screen 5: Referrals");
}

async function screen06_Risk() {
  const s = frame("06 — Risk Engine", 1440, 900, C.bg);
  add(figma.currentPage, s, 1500, 1000);
  await sidebar(s);
  const main = frame("Main", 1184, 900, C.bg);
  add(s, main, 256, 0);
  await topbar(main, "Risk Engine");
  const title=await text("Risk Engine",28,C.s900,"Bold"); add(main,title,32,72);
  const sub=await text("Attendance 20% · Nutrition 25% · Development 25% · Caregiver 15% · Migration 15%",13,C.s500,"Regular"); add(main,sub,32,108);
  const lc=rect(1120,660,C.white,16); add(main,lc,32,142);
  const kids=[{n:"Aravind Kumar",r:"RED",s:78},{n:"Saanvi Moorthy",r:"RED",s:82},{n:"Balamurugan Siva",r:"RED",s:76},{n:"Priya Devi",r:"YELLOW",s:52},{n:"Deepa Raj",r:"YELLOW",s:48},{n:"Nandhini Krishnan",r:"YELLOW",s:45},{n:"Keerthana Rajan",r:"YELLOW",s:42},{n:"Murugan Selvam",r:"GREEN",s:12},{n:"Karthik Babu",r:"GREEN",s:8},{n:"Dinesh Pandian",r:"GREEN",s:6},{n:"Surya Vel",r:"GREEN",s:10},{n:"Varsha Nair",r:"GREEN",s:4}];
  const rc={RED:C.red,YELLOW:C.yellow,GREEN:C.green};
  for(let i=0;i<kids.length;i++){
    const k=kids[i]; const ry=178+i*42;
    const init=k.n.split(" ").map(n=>n[0]).join("");
    const av=rect(30,30,rc[k.r],15); av.opacity=0.15; add(main,av,50,ry);
    const at=await text(init,10,rc[k.r],"Bold"); add(main,at,56,ry+8);
    const nt=await text(k.n,13,C.s900,"SemiBold"); add(main,nt,90,ry+8);
    const bb=rect(280,8,C.s100,4); add(main,bb,560,ry+11);
    const bf=rect(280*k.s/100,8,rc[k.r],4); add(main,bf,560,ry+11);
    const label=k.r==="RED"?"● High Risk":k.r==="YELLOW"?"● Med Risk":"● Low Risk";
    const bt=await text(`${label} · ${k.s}`,11,rc[k.r],"SemiBold"); add(main,bt,880,ry+8);
  }
  print("✓ Screen 6: Risk Engine");
}

async function screen07_Supervisor() {
  const s = frame("07 — Supervisor", 1440, 900, C.bg);
  add(figma.currentPage, s, 3000, 1000);
  await sidebar(s);
  const main = frame("Main", 1184, 900, C.bg);
  add(s, main, 256, 0);
  await topbar(main, "Supervisor Dashboard");
  const title=await text("Supervisor Dashboard",28,C.s900,"Bold"); add(main,title,32,72);
  const sub=await text("Platform-wide overview · 2026-06-02",13,C.s500,"Regular"); add(main,sub,32,108);
  const sstats=[{l:"Total Children",v:"12",c:C.primary},{l:"Centres",v:"3",c:{r:0.235,g:0.627,b:0.898}},{l:"Open Referrals",v:"7",c:{r:0.98,g:0.58,b:0.11}},{l:"Escalated",v:"3",c:C.red}];
  for(let i=0;i<sstats.length;i++){
    const sc=rect(262,90,C.white,16); add(main,sc,32+i*278,142);
    const sv=await text(sstats[i].v,32,sstats[i].c,"Bold"); add(main,sv,56+i*278,154);
    const sl=await text(sstats[i].l,12,C.s500,"Regular"); add(main,sl,56+i*278,194);
  }
  const rcard=rect(540,290,C.white,16); add(main,rcard,32,260);
  const rct=await text("Risk Distribution",16,C.s900,"Bold"); add(main,rct,56,280);
  const rcs=await text("12 children assessed",12,C.s400,"Regular"); add(main,rcs,56,302);
  const rbars=[{l:"Green — Low Risk",p:0.42,c:C.green},{l:"Yellow — Medium",p:0.33,c:C.yellow},{l:"Red — High Risk",p:0.25,c:C.red}];
  for(let i=0;i<rbars.length;i++){
    const by=326+i*56;
    const bl=await text(rbars[i].l,13,C.s700,"Medium"); add(main,bl,56,by);
    const bb=rect(460,10,C.s100,5); add(main,bb,56,by+22);
    const bf=rect(460*rbars[i].p,10,rbars[i].c,5); add(main,bf,56,by+22);
  }
  const ccard=rect(580,290,C.white,16); add(main,ccard,608,260);
  const cct=await text("Centre-wise Breakdown",16,C.s900,"Bold"); add(main,cct,632,280);
  const centres=[{n:"Chennai Central",g:2,y:2,r:1,t:5},{n:"Tambaram",g:1,y:1,r:1,t:3},{n:"Madurai South",g:2,y:1,r:1,t:4}];
  for(let i=0;i<centres.length;i++){
    const cy=318+i*68;
    const cn=await text(centres[i].n,14,C.s900,"SemiBold"); add(main,cn,632,cy);
    const bb=rect(500,10,C.s100,5); add(main,bb,632,cy+22);
    const gw=500*centres[i].g/centres[i].t; const yw=500*centres[i].y/centres[i].t; const rw=500*centres[i].r/centres[i].t;
    const gb=rect(gw,10,C.green,0); add(main,gb,632,cy+22);
    const yb=rect(yw,10,C.yellow,0); add(main,yb,632+gw,cy+22);
    const rb=rect(rw,10,C.red,0); add(main,rb,632+gw+yw,cy+22);
  }
  print("✓ Screen 7: Supervisor Dashboard");
}

async function screen08_WhatsApp() {
  const s = frame("08 — WhatsApp", 1440, 900, C.bg);
  add(figma.currentPage, s, 4500, 1000);
  await sidebar(s);
  const main = frame("Main", 1184, 900, C.bg);
  add(s, main, 256, 0);
  await topbar(main, "Parent Engagement");
  const title=await text("Parent Engagement",28,C.s900,"Bold"); add(main,title,32,72);
  const sub=await text("WhatsApp மூலம் Tamil + English messages அனுப்புங்கள்.",13,C.s500,"Regular"); add(main,sub,32,108);
  const card=rect(836,660,C.white,16); add(main,card,32,142);
  const ct=await text("Send WhatsApp Message",18,C.s900,"Bold"); add(main,ct,56,166);
  const cs=await text("Bilingual Tamil + English templates",13,C.s400,"Regular"); add(main,cs,56,192);
  const cl=await text("Child",14,C.s700,"Medium"); add(main,cl,56,232);
  const cb=rect(760,48,C.s100,12); add(main,cb,56,254);
  const cv=await text("Aravind Kumar",14,C.s700,"Regular"); add(main,cv,76,270);
  const pl=await text("Parent WhatsApp Number",14,C.s700,"Medium"); add(main,pl,56,322);
  const pb=rect(760,48,C.s100,12); add(main,pb,56,344);
  const pv=await text("+91 6369713571",14,C.s700,"Regular"); add(main,pv,76,360);
  const tl=await text("Message Template",14,C.s700,"Medium"); add(main,tl,56,414);
  const tmpls=[{l:"📌 Daily Activity",d:"இன்றைய செயல்பாடு",a:true},{l:"📅 Weekly Reminder",d:"வாராந்திர நினைவூட்டல்",a:false},{l:"🏥 Referral Reminder",d:"மருத்துவ சந்திப்பு",a:false},{l:"🔴 Risk Alert",d:"உடனடி கவனிப்பு",a:false}];
  for(let i=0;i<tmpls.length;i++){
    const col=i%2; const row=Math.floor(i/2);
    const tx=56+col*388; const ty=440+row*66;
    const tbg=rect(370,54,tmpls[i].a?{r:0.94,g:0.95,b:1}:C.white,12);
    tbg.strokes=[{type:"SOLID",color:tmpls[i].a?C.primary:C.s300}]; tbg.strokeWeight=1.5;
    add(main,tbg,tx,ty);
    const tlt=await text(tmpls[i].l,13,tmpls[i].a?C.primary:C.s700,tmpls[i].a?"SemiBold":"Medium"); add(main,tlt,tx+12,ty+8);
    const tdt=await text(tmpls[i].d,11,C.s400,"Regular"); add(main,tdt,tx+12,ty+30);
  }
  const sbtn=rect(760,52,C.green,14); add(main,sbtn,56,606);
  const sbt=await text("💬 Send WhatsApp Message",15,C.white,"SemiBold"); add(main,sbt,230,620);
  print("✓ Screen 8: WhatsApp Engagement");
}

// ── RUN ALL ───────────────────────────────────────────────────────────────────
async function runAll() {
  figma.currentPage.name = "Nila Arumbu — All Screens";
  print("🎨 Creating Nila Arumbu design...\n");
  await screen01_Login();
  await screen02_Dashboard();
  await screen03_Children();
  await screen04_ChildDetail();
  await screen05_Referrals();
  await screen06_Risk();
  await screen07_Supervisor();
  await screen08_WhatsApp();
  figma.viewport.scrollAndZoomIntoView(figma.currentPage.children);
  print("\n✅ All 8 screens created successfully!");
  print("Nila Arumbu — Every Child Seen. Every Risk Identified. Every Referral Closed.");
}

runAll();
