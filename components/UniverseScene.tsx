import type { CSSProperties } from "react";
import { universeThemes, type UniverseTheme } from "@/lib/appearance";

export function UniverseScene({ theme, preview = false }: { theme: UniverseTheme; preview?: boolean }) {
  const palette = universeThemes.find(t => t.id === theme)!;
  return <svg className={`universeScene scene-${theme} ${preview ? "scenePreview" : ""}`} viewBox="0 0 1200 700" preserveAspectRatio="xMidYMax slice" aria-hidden="true" shapeRendering="crispEdges" style={{ "--universe-accent": palette.accent } as CSSProperties}>
    {preview && <path d="M0 0h1200v700H0z" fill={palette.sky} />}
    <g fill={palette.middle}><path d="M0 570h100v-60h150v35h190v-50h130v60h190v-40h170v55h170v130H0z" /></g>
    <g fill={palette.accent} className="universeLandmarks"><Landmarks theme={theme} /></g>
    <g className="universeSparkles" fill="#fff7cb">{Array.from({ length: 14 }, (_, i) => <path key={i} d="M-3-10h6v7h7v6H3v7h-6V3h-7v-6h7z" transform={`translate(${55 + i * 83},${65 + (i * 71) % 250})`} style={{ "--twinkle-delay": `${-i * .8}s` } as CSSProperties} />)}</g>
    <g className="universeDrifter" fill={palette.accent}><SkyObject theme={theme} /></g>
  </svg>;
}
function City({ clock = false }: { clock?: boolean }) {
  return <>{[0, 1, 2, 3, 4, 5, 6, 7].map(i => <g key={i} transform={`translate(${i * 165 - 25},${440 - i % 3 * 60})`}><path d={`M0 0h110v${260+i%3*60}H0z`} /><path d="M10-18h90v18H10z" /><g fill="#f8ebbd" opacity=".6">{Array.from({ length: 9 }, (_, j) => <path key={j} d={`M${18+j%3*29} ${30+Math.floor(j/3)*45}h13v20h-13z`} />)}</g></g>)}{clock && <g><path d="M165 235h82v465h-82zM175 210h62v25h-62zM185 160h42v50h-42zM201 130h10v30h-10z"/><path d="M176 255h60v60h-60z" fill="#f5edce"/><path d="M202 267h7v23h-7zM206 283h18v7h-18z" fill="#8f887e"/></g>}</>;
}
function Castle({ moon = false }: { moon?: boolean }) {
  return <><path d="M75 480h190v220H75zM40 380h70v320H40zM240 330h70v370h-70zM1020 410h120v290h-120zM995 320h55v380h-55zM1110 360h65v340h-65z"/><path d="M20 380l55-80 55 80zM220 330l55-85 55 85zM980 320l42-65 43 65zM1095 360l48-70 47 70z" fill={moon ? "#c5b5d8" : "#797d9a"}/><path d="M135 570h65v130h-65zM1060 590h48v110h-48z" fill="#e9e4ed"/><g fill="#f3e5b2"><path d="M61 420h25v35H61zM265 370h22v35h-22zM1008 365h22v32h-22zM1128 405h23v32h-23z"/></g></>;
}
function Tree({ x, y = 390 }: { x: number; y?: number }) {
  return <g transform={`translate(${x},${y})`}><path d="M50 100h30v210H50z" fill="#a29170"/><path d="M0 40h25V0h80v30h30v85h-30v30H25v-30H0z"/></g>;
}
function Ship({ viking = false }: { viking?: boolean }) {
  return <g><path d="M45 570h235l-45 75H90z" fill="#ae9477"/><path d="M152 385h14v195h-14z" fill="#987f65"/><path d="M169 390h92v136h-92z" fill={viking ? "#e9d5c6" : "#f5edd9"}/><path d="M195 390h20v136h-20z" fill={viking ? "#b69182" : "#d4c1a0"}/><path d="M70 620h180v8H70z" fill="#91765b"/></g>;
}
function Landmarks({ theme }: { theme: UniverseTheme }) {
  switch (theme) {
    case "blocklands": return <><path d="M0 580h170v120H0zM160 640h150v60H160zM1000 520h200v180h-200zM1070 460h130v60h-130z"/><path d="M0 610h170v90H0zM1000 550h200v150h-200z" fill="#b4a282"/><Tree x={45}/><Tree x={1020} y={280}/><path d="M260 570h35v55h-35zM235 550h85v25h-85z" fill="#c99683"/></>;
    case "end": return <><path d="M40 455h180v20h40l-85 90h-65l-90-90h20zM870 360h240v30h35l-100 110h-90l-110-110h25z" fill="#c1b79a"/><path d="M120 235h27v220h-27zM965 110h30v250h-30z" fill="#9486a5"/><path d="M110 235h47v18h-47zM956 110h48v20h-48z" fill="#d1a1df"/></>;
    case "redstonelab": return <><path d="M0 620h1200v80H0z" fill="#c7c5b6"/><g fill="none" stroke="#ce8c79" strokeWidth="9"><path d="M20 550h130V400h130v120h130M880 580h110V440h180v-90M60 660h310v-90M960 650h200"/></g><path d="M125 385h45v40h-45zM970 425h45v40h-45zM260 500h40v40h-40z" fill="#e6bc8c"/></>;
    case "ocean": return <><path d="M0 570h1200v130H0z" fill="#9ecbd3"/><path d="M840 625h360v75H840zM920 580h240v45H920z" fill="#e3d2a6"/><Ship/><Tree x={990} y={350}/><g stroke="#dbebdf" strokeWidth="8"><path d="M30 670h180M500 605h210M780 675h170"/></g></>;
    case "ninjavillage": return <><path d="M900 300h300v400H900z" fill="#c5b293"/><path d="M935 340h45v60h-45zM1030 330h45v60h-45zM1125 355h45v60h-45z" fill="#e4d3b3"/>{[0,1].map(i=><g key={i} transform={`translate(${55+i*760},${440-i*10})`}><path d="M15 0h155v210H15z" fill="#c5a382"/><path d="M0 0l95-65 95 65zM-20 70l115-55 115 55z" fill="#a88275"/><path d="M65 115h55v95H65z" fill="#e8d5b3"/></g>)}</>;
    case "platform": return <><path d="M50 510h90v190H50zM35 490h120v30H35zM1030 450h110v250h-110zM1010 430h150v35h-150z"/><g fill="#e4c384"><path d="M250 420h55v55h-55zM330 420h55v55h-55zM410 420h55v55h-55z"/></g><path d="M349 434h17v8h-10v9h-7zM351 457h7v7h-7z" fill="#fff3cb"/><path d="M780 610h200v90H780zM820 570h160v40H820zM870 530h110v40H870z" fill="#bfa184"/></>;
    case "speedcoast": return <><path d="M0 590h1200v110H0z" fill="#b6a57d"/><path d="M0 590h1200v20H0z"/><circle cx="190" cy="485" r="105" fill="none" stroke="#98b587" strokeWidth="40"/>{[400,480,560,1020].map(x=><circle key={x} cx={x} cy={430+(x%3)*18} r="22" fill="none" stroke="#dcc477" strokeWidth="10"/>)}<Tree x={1000}/></>;
    case "pokeprairie": return <><Tree x={30}/><Tree x={1040}/><path d="M190 535h200v165H190z" fill="#ccbaa1"/><path d="M175 535l115-80 120 80z" fill="#c09e95"/><circle cx="1070" cy="520" r="57" fill="#f5eedc"/><path d="M1013 520a57 57 0 0 1 114 0z" fill="#d6948b"/><path d="M1015 518h111v7h-111z" fill="#928a7e"/><circle cx="1070" cy="522" r="15" fill="#f3ead8" stroke="#928a7e" strokeWidth="7"/></>;
    case "wizardcastle": return <><Castle/><path d="M850 600h350v100H850z" fill="#b0bbc6"/><path d="M120 360l5 18 18 5-18 5-5 18-5-18-18-5 18-5z" fill="#f4e6b3"/></>;
    case "galaxy": return <><circle cx="190" cy="210" r="94" fill="#b5bbd4"/><ellipse cx="190" cy="210" rx="140" ry="30" fill="none" stroke="#d0c9b8" strokeWidth="18" transform="rotate(-25 190 210)"/><circle cx="1030" cy="390" r="76" fill="#afc5c9"/><path d="M810 620h300v80H810zM850 570h220v50H850z" fill="#bac0d3"/></>;
    case "nordic": return <><path d="M0 580l210-340 210 340zM760 580l220-390 220 390z"/><path d="M135 360l75-120 74 120h-46l-28-35-25 35zM895 345l85-155 85 155h-58l-27-40-30 40z" fill="#f2f4e9"/><path d="M0 600h1200v100H0z" fill="#adc6d0"/><Ship viking/></>;
    case "hauntedcity": return <><City/><path d="M1040 285h50v18h20v70h-18v-12h-16v12h-16v-12h-20v12h-20v-70h20z" fill="#c0d7a5"/><path d="M1042 314h12v18h-12zM1077 314h12v18h-12zM1056 344h23v8h-23z" fill="#8bad7c"/></>;
    case "dreamland": return <><path d="M0 585h150v-65h150v65h900v115H0z" fill="#e5c5d3"/>{[120,970,1110].map((x,i)=><g key={x}><path d={`M${x} ${500-i*40}h13v200h-13z`} fill="#d4b9ad"/><circle cx={x+6} cy={500-i*40} r="57" fill={i%2?'#d6c5e7':'#eacb9a'}/><path d={`M${x-24} ${490-i*40}h60v13h-60z`} fill="#f9eadc"/></g>)}<path d="M860 370l15 30 34 5-25 24 6 34-30-16-30 16 6-34-25-24 34-5z" fill="#f3d592"/></>;
    case "london": return <><City clock/><path d="M0 650h1200v50H0z" fill="#c1c4bd"/><path d="M915 580h105v100H915zM923 555h90v25h-90z" fill="#b49a95"/><path d="M930 590h25v30h-25zM977 590h25v30h-25z" fill="#e6e6d7"/></>;
    case "starship": return <><path d="M0 620h1200v80H0zM0 0h30v620H0zM1170 0h30v620h-30z" fill="#a9bdc9"/><path d="M45 180h210v290H45zM925 180h210v290H925z" fill="#a7b3cb"/><path d="M65 200h170v245H65zM945 200h170v245H945z" fill="#d6dfed"/><circle cx="150" cy="310" r="55" fill="#b8c5d9"/><path d="M950 505h160v115H950zM40 505h170v115H40z"/><path d="M965 520h130v45H965z" fill="#c1dfd8"/><path d="M72 530h35v30H72zM124 530h35v30h-35z" fill="#d6bfaa"/></>;
    case "spiritforest": return <><Tree x={0} y={270}/><Tree x={110} y={350}/><Tree x={980} y={320}/><Tree x={1100} y={240}/><path d="M190 510h6v190h-6zM163 470h62v40h-62z" fill="#a19a84"/><path d="M171 478h46v20h-46z" fill="#e1e7d6"/><path d="M935 595h130v20H935zM945 615h10v65h-10zM1044 615h10v65h-10z" fill="#b3a58a"/></>;
    case "moonpalace": return <><Castle moon/><circle cx="985" cy="150" r="78" fill="#f5ecd1"/><circle cx="1022" cy="120" r="67" fill="#ddd5ee"/><path d="M135 520h60v14h-60zM1055 550h65v14h-65z" fill="#f1e7dc"/></>;
    case "webcity": return <><City/><g fill="none" stroke="#f2ece5" strokeWidth="3"><path d="M0 130l280 190M0 130l180 310M0 130l330 60M1050 30l150 170M1050 30l-70 190M1050 30l150 20M0 210q100-65 160 13M0 300q125-70 242 0M1060 100q56 12 98-6"/></g></>;
    case "hyrule": return <><Tree x={0}/><Tree x={1060}/><path d="M830 490h40v210h-40zM1030 490h40v210h-40zM810 460h280v50H810z" fill="#c0b59a"/><path d="M900 365l30-50 30 50zM870 415l30-50 30 50zM930 415l30-50 30 50z" fill="#d9c782"/><path d="M105 600h160v100H105zM135 545h100v55H135z" fill="#b2b49b"/></>;
    case "saiyanarena": return <><path d="M0 630h280v70H0zM0 510h150v120H0zM1050 440h150v260h-150zM990 550h210v150H990z" fill="#cfb38f"/><path d="M80 550h175v80H80zM60 530h215v20H60z" fill="#e7d5b1"/><path d="M82 530l85-60 85 60z" fill="#ba9b87"/><path d="M710 650h280v50H710z"/><path d="M735 625h235v25H735z" fill="#e5d1ae"/></>;
    case "gotham": return <><City/><path d="M80 635l110-420 80 420z" fill="#f4e7b2" opacity=".3"/><circle cx="190" cy="215" r="57" fill="#f4e6b4" opacity=".8"/><path d="M153 205h15l7 9h30l7-9h15v18h-17l-20 13-20-13h-17z" fill="#919aad"/></>;
  }
}
function SkyObject({ theme }: { theme: UniverseTheme }) {
  if (["galaxy", "starship"].includes(theme)) return <><path d="M490 150h90l25 20-25 20h-90l-25-20z"/><path d="M520 140h30v60h-30z"/><path d="M508 160h40v20h-40z" fill="#dceae9"/></>;
  if (["end", "gotham"].includes(theme)) return <path d="M490 180l-20-35 50 15 15-12 15 12 50-15-20 35h-30l-15 15-15-15z"/>;
  if (["redstonelab", "pokeprairie", "saiyanarena"].includes(theme)) return <path d="M550 120h-35l-25 50h30l-15 45 65-65h-35z" fill="#e5c27c"/>;
  if (["ocean", "nordic"].includes(theme)) return <path d="M490 180l35-20 10 15 10-15 35 20-35-8-10 12-10-12z" fill="#f8f4de"/>;
  return <path d="M510 165h20v-15h30v15h35v18h-15v10h-80v-10h-15v-18z" fill="#f7f4e6"/>;
}
