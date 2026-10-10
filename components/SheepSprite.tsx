import type { CSSProperties } from "react";
import { shopSkins, type SheepSkin } from "@/lib/sheep-rewards";

export function SheepSprite({ skin = "classic" }: { skin?: SheepSkin }) {
  const costume = shopSkins.find(s => s.id === skin);
  const palette = costume ? { "--sheep-wool": costume.color, "--wool-shadow": `color-mix(in srgb, ${costume.color} 75%, #373a35)`, "--wool-texture": `color-mix(in srgb, ${costume.color} 85%, #fff)`, "--costume-accent": costume.accent } as CSSProperties : undefined;
  return <svg viewBox="0 0 88 62" className="walkingSheep" style={palette} aria-hidden="true" shapeRendering="crispEdges">
    <ellipse cx="42" cy="57" rx="30" ry="3" fill="#527a39" opacity=".25" />
    <g className="sheepLegsBack" fill="#655747"><path d="M18 38h7v16h-7zM53 38h7v16h-7z" /></g>
    <path d="M8 19h6V9h42v5h11v28h-6v6H14v-6H8z" fill="var(--wool-shadow)" />
    <path d="M8 19h6V9h42v5h7v18H17V19z" fill="var(--sheep-wool)" />
    <path d="M20 9h12v7H20zM42 14h14v7H42zM13 27h12v9H13z" fill="var(--wool-texture)" />
    {skin === "rainbow" && <g><path d="M14 14h8v25h-8z" fill="#eb7969"/><path d="M22 14h8v25h-8z" fill="#efc854"/><path d="M30 14h8v25h-8z" fill="#8dbf63"/><path d="M38 14h8v25h-8z" fill="#6ab4d4"/><path d="M46 14h8v25h-8z" fill="#a477c7"/></g>}
    {skin === "hero" && <><path d="M13 18h15v29H6V34h7z" fill="#cc4f4a"/><path d="M35 20h17v16H35z" fill="#dcac3b"/><path d="M39 22h9v4h-5v3h5v5h-9v-4h5v-2h-5z" fill="#fff4b5"/></>}
    {skin === "farmer" && <><path d="M24 31h31v16H24zM27 22h6v12h-6zM46 22h6v12h-6z" fill="#54849c"/><path d="M37 35h9v7h-9z" fill="#82adc2"/></>}
    {skin === "royal" && <><path d="M14 24h17v23H14z" fill="#9357ad"/><path d="M14 24h5v23h-5z" fill="#edc766"/><path d="M35 22h6v6h-6zM44 31h5v5h-5z" fill="#f2c653"/></>}
    {skin === "astronaut" && <><path d="M18 17h32v27H18z" fill="#d8e3e7"/><path d="M21 20h11v20H21z" fill="#9aafbb"/><path d="M36 23h12v11H36z" fill="#334e71"/><path d="M38 25h4v3h-4z" fill="#73d1e1"/><path d="M44 25h2v3h-2z" fill="#dd8a6b"/></>}
    {skin === "flower" && <g fill="#efa5c1"><path d="M26 20h6v4h4v6h-4v4h-6v-4h-4v-6h4zM43 29h6v4h4v6h-4v4h-6v-4h-4v-6h4z"/><path d="M27 25h4v4h-4zM44 34h4v4h-4z" fill="#edcf62"/></g>}
    {costume && <ShopPattern skin={skin} />}
    <g className="sheepLegsFront" fill="#7f6e57"><path d="M25 39h7v16h-7zM60 38h7v17h-7z" /></g>
    <path d="M59 18h18v25H59z" fill="#8a8070" /><path d="M59 18h18v7H59z" fill="var(--sheep-wool)" />
    <path d="M54 24h7v6h-7zM77 24h7v6h-7z" fill="#aa9680" />
    <path d="M60 28h5v5h-5zM72 28h5v5h-5z" fill="#fff" /><path d="M63 29h2v3h-2zM72 29h2v3h-2z" fill="#302f28" />
    <path d="M65 36h8v5h-8z" fill="#c4a9a0" /><path d="M65 36h2v2h-2zM71 36h2v2h-2z" fill="#695e53" />
    {skin === "farmer" && <><path d="M56 13h26v5H56zM62 5h14v9H62z" fill="#ddbd64"/><path d="M62 10h14v3H62z" fill="#977a3b"/></>}
    {skin === "royal" && <><path d="M59 7h5v5h4V5h5v7h4V7h5v12H59z" fill="#edc351"/><path d="M68 14h5v3h-5z" fill="#d95560"/></>}
    {skin === "flower" && <><path d="M57 13h23v5H57z" fill="#8dab57"/><path d="M60 11h5v5h-5zM72 11h5v5h-5z" fill="#e89abb"/></>}
    {skin === "astronaut" && <><path d="M55 15h27v30H55z" fill="#c5d9e4" opacity=".5"/><path d="M55 15h27v3H55zM55 42h27v3H55zM55 15h3v30h-3zM79 15h3v30h-3z" fill="#e7f3f6"/></>}
    {costume && <ShopHead skin={skin} />}
  </svg>;
}

function ShopPattern({ skin }: { skin: SheepSkin }) {
  const accent = "var(--costume-accent)";
  switch (skin) {
    case "kirby": return <><path d="M30 21h6v5h7v6h-7v7h-6v-7h-7v-6h7z" fill="#f6d66d"/><path d="M24 48h15v9H24zM57 48h17v9H57z" fill={accent}/></>;
    case "detective": return <><path d="M17 19h6v26h-6zM28 14h5v31h-5zM42 17h5v29h-5zM15 27h39v4H15zM15 38h41v4H15z" fill={accent}/><path d="M28 17h13v6H28z" fill="#e3ceb0"/></>;
    case "among": return <><path d="M8 18h14v27H8z" fill="#a43f44"/><path d="M29 19h22v16H29z" fill="#6697b0"/><path d="M31 21h18v10H31z" fill={accent}/><path d="M32 22h9v3h-9z" fill="#e5f6f5"/></>;
    case "totoro": return <><path d="M23 19h26v27H23z" fill={accent}/><path d="M27 25h4v-3h5v3h4v4h-4v-3h-5v3h-4zM29 35h4v-3h5v3h4v4h-4v-3h-5v3h-4z" fill="#7b8584"/><path d="M5 30h12v7H5zM1 28h7v6H1z" fill="#707c7a"/></>;
    case "strawhat": return <><path d="M15 16h15v30H15zM44 18h12v28H44z" fill={accent}/><path d="M14 40h43v8H14z" fill="#6092b4"/><path d="M18 40h7v5h-7zM46 40h7v5h-7z" fill="#e7d7bc"/></>;
    case "moon": return <><path d="M19 34h34v13H19zM19 18h34v7H19z" fill={accent}/><path d="M25 23h8v7h-8zM38 23h8v7h-8zM32 26h7v7h-7z" fill="#d9697a"/><path d="M31 17h9v5h-9z" fill="#f7f0da"/></>;
    case "web": return <><path d="M14 36h43v11H14z" fill={accent}/><g stroke="#633b49" strokeWidth="1.5" fill="none"><path d="M15 15l38 24M16 36l34-21M33 10v30M15 23h38M20 16l7 20h14l7-19"/></g><path d="M32 23h7v12h-7zM27 25h17v3H27zM27 31h17v3H27z" fill="#44384a"/></>;
    case "foresthero": return <><path d="M15 35h42v6H15z" fill="#795f40"/><path d="M32 35h8v7h-8z" fill="#d4b05d"/><path d="M21 18h20v24H21z" fill="#657d9c"/><path d="M23 20h16v3H23zM23 20h3v19h-3zM36 20h3v19h-3z" fill={accent}/><path d="M28 27h6v8h-6z" fill="#d3b56f"/></>;
    case "saiyan": return <><path d="M18 18h8v26h-8zM49 18h7v28h-7zM17 36h38v5H17z" fill={accent}/><path d="M31 20h15v14H31z" fill="#faf0d7"/><path d="M34 23h9v3h-9zM37 23h3v8h-3zM34 29h9v3h-9z" fill="#4f4740"/></>;
    case "bat": return <><path d="M13 16h16v32H3V36h10z" fill="#333945"/><path d="M15 39h42v6H15z" fill={accent}/><path d="M27 21h23v12H27z" fill={accent}/><path d="M29 23h6v3h7v-3h6v5h-5v3H34v-3h-5z" fill="#343a45"/></>;
    case "creeper": return <g fill={accent}><path d="M24 20h7v7h-7zM42 20h7v7h-7zM31 27h11v6H31zM27 33h19v8h-6v-4h-7v4h-6z"/><path d="M15 12h5v6h-5zM48 39h8v6h-8z" opacity=".4"/></g>;
    case "pig": return <g fill={accent}><path d="M24 25h20v12H24z"/><path d="M28 28h4v5h-4zM37 28h4v5h-4z" fill="#845757"/><path d="M5 30h7v4H5zM2 24h4v9H2z"/></g>;
    case "bee": return <><path d="M22 10h8v34h-8zM41 10h8v36h-8z" fill={accent}/><path d="M26 8V1h13v13H26zM42 9V2h13v15H42z" fill="#e3f2f2" opacity=".9"/></>;
    case "zombie": return <><path d="M14 22h43v19H14z" fill="#4f9d9f"/><path d="M14 40h45v8H14z" fill={accent}/><path d="M28 26h6v8h-6zM44 23h7v6h-7z" fill="#477d65"/></>;
    case "mushroom": return <><path d="M18 18h10v8H18zM36 32h12v8H36zM47 15h9v7h-9z" fill={accent}/><path d="M21 6h4v8h-4zM40 3h4v12h-4z" fill="#e6d5b6"/><path d="M16 3h14v5H16zM35 0h14v6H35z" fill="#cc5949"/></>;
    case "fox": return <><path d="M13 35h45v12H13z" fill={accent}/><path d="M0 23h11v19H0z" fill="#ba6937"/><path d="M0 20h10v9H0z" fill={accent}/></>;
    case "panda": return <><path d="M16 12h10v34H16zM46 16h12v31H46z" fill={accent}/><path d="M26 47h6v8h-6zM60 47h7v8h-7z" fill={accent}/></>;
    case "redstone": return <><path d="M16 27h11v5h-11zM24 20h5v21h-5zM26 35h24v5H26zM46 23h5v15h-5z" fill={accent}/><path d="M42 19h13v7H42z" fill="#493f3b"/><path d="M45 20h7v5h-7z" fill="#f5c178"/></>;
    case "pirate": return <><path d="M14 32h43v5H14z" fill="#faf0dc"/><path d="M13 41h45v7H13z" fill={accent}/><path d="M35 40h8v8h-8z" fill="#dfbd65"/></>;
    case "ninja": return <><path d="M13 16h8v28h-8zM52 20h7v27h-7zM16 35h42v6H16z" fill={accent}/><path d="M31 23h13v9H31z" fill="#f2bd71"/><path d="M35 25h5v5h-5z" fill={accent}/></>;
    case "plumber": return <><path d="M20 29h36v18H20zM24 19h6v14h-6zM45 19h6v14h-6z" fill={accent}/><path d="M25 31h4v4h-4zM47 31h4v4h-4z" fill="#f2d276"/></>;
    case "speedy": return <><path d="M5 14h13v9H5zM1 24h16v9H1zM7 37h14v7H7z" fill="#3472b6"/><path d="M30 26h19v18H30z" fill="#e3c6a0"/><path d="M24 50h13v7H24zM58 50h14v7H58z" fill={accent}/><path d="M29 50h4v7h-4zM63 50h4v7h-4z" fill="#fff6dc"/></>;
    case "lightning": return <><path d="M0 23h7v-8h7v10h-5v10H0z" fill="#e9cf55"/><path d="M2 32h7v5H2z" fill="#947150"/><path d="M28 20h12v8h-6v6h-8l5-8h-3z" fill="#fff2a0"/></>;
    case "wizard": return <><path d="M50 19h11v28H50z" fill="#a74746"/><path d="M50 24h11v4H50zM50 35h11v4H50z" fill={accent}/><path d="M18 37h25v4H18z" fill="#8d7150"/><path d="M40 34h4v7h-4z" fill="#f0cb7c"/></>;
    case "spaceknight": return <><path d="M13 18h17v29H6V30h7z" fill="#806a58"/><path d="M25 37h29v5H25z" fill="#564d48"/><path d="M41 14h5v26h-5z" fill={accent}/><path d="M41 37h5v9h-5z" fill="#59636a"/></>;
    case "viking": return <><path d="M20 18h7v28h-7zM43 18h7v28h-7zM18 34h35v6H18z" fill="#584937"/><path d="M28 27h13v12H28z" fill={accent}/><path d="M30 29h9v8h-9z" fill="#6f8b93"/></>;
    case "ghost": return <><path d="M12 15h17v29H12z" fill="#46504c"/><path d="M17 18h5v20h-5z" fill="#939c8b"/><path d="M37 19h11v5h4v13H33V24h4z" fill={accent}/><path d="M38 25h3v4h-3zM45 25h3v4h-3zM39 32h8v3h-8z" fill="#365444"/></>;
    case "ender": return <g fill={accent}><path d="M19 16h4v4h-4zM41 26h5v5h-5zM28 36h4v4h-4zM53 40h4v4h-4z"/><path d="M0 8h4v4H0zM82 45h4v4h-4z" opacity=".6"/></g>;
    case "diamond": return <><path d="M18 17h36v29H18z" fill="#4dabb8"/><path d="M21 19h28v4H21zM21 19h4v21h-4z" fill={accent}/><path d="M29 27h17v13H29z" fill="#86dedc"/><path d="M25 47h7v8h-7zM60 47h7v8h-7z" fill="#60c5ce"/></>;
    case "dragon": return <><path d="M16 17V0h6v5h7v6h6v10h-7v8H16zM35 17V0h6v5h7v6h6v10h-7v8H35z" fill="#7a618b"/><path d="M20 5h3v19h-3zM40 5h3v19h-3z" fill={accent}/><path d="M1 31h14v6H1zM0 23h5v10H0z" fill="#4c4359"/></>;
    default: return null;
  }
}

function ShopHead({ skin }: { skin: SheepSkin }) {
  const accent = "var(--costume-accent)";
  switch (skin) {
    case "kirby": return <><path d="M59 19h18v24H59z" fill="#ed9fc2"/><path d="M62 26h3v7h-3zM72 26h3v7h-3z" fill="#4c3c55"/><path d="M58 33h5v4h-5zM75 33h5v4h-5z" fill={accent}/><path d="M67 35h5v5h-5z" fill="#a54b6f"/></>;
    case "detective": return <><path d="M56 14h27v5H56zM60 8h18v9H60z" fill="#a78967"/><path d="M64 8h4v10h-4zM74 8h3v10h-3zM60 11h18v3H60z" fill={accent}/><path d="M71 39h12v3H71zM80 32h5v10h-5z" fill="#665042"/></>;
    case "among": return <><path d="M58 20h23v17H58z" fill="#5b8ca8"/><path d="M60 22h18v11H60z" fill={accent}/><path d="M61 23h10v3H61z" fill="#e4f4f1"/><path d="M60 36h18v7H60z" fill="#b94b50"/></>;
    case "totoro": return <><path d="M58 4h7v18h-7zM73 4h7v18h-7z" fill="#929b9a"/><path d="M60 26h7v8h-7zM72 26h7v8h-7z" fill="#f7f5e8"/><path d="M63 28h3v4h-3zM74 28h3v4h-3zM67 34h6v3h-6z" fill="#3e4541"/><path d="M53 34h10v2H53zM76 34h10v2H76z" fill="#56615c"/></>;
    case "strawhat": return <><path d="M54 13h30v6H54zM61 4h16v12H61z" fill="#e6c76f"/><path d="M61 10h16v4H61z" fill={accent}/><path d="M73 34h5v2h-5zM75 32h2v6h-2z" fill="#926657"/></>;
    case "moon": return <><path d="M56 15h5v25h-5zM78 15h5v26h-5zM58 9h7v9h-7zM74 9h7v9h-7z" fill="#e8cc62"/><path d="M60 20h18v3H60z" fill="#d9b45c"/><path d="M67 18h6v7h-6z" fill="#d05c76"/></>;
    case "web": return <><path d="M59 18h18v25H59z" fill="#d45555"/><path d="M59 28h9v7h-9zM70 28h9v7h-9z" fill="#5a3949"/><path d="M61 29h5v4h-5zM72 29h5v4h-5z" fill="#f6ece3"/><path d="M68 19h2v24h-2zM60 23h17v1H60zM60 38h17v1H60z" fill="#773e4b"/></>;
    case "foresthero": return <><path d="M54 15h26v5H54zM50 9h27v7H50zM46 5h25v6H46z" fill="#6c8e4c"/><path d="M58 20h5v7h-5zM75 20h5v7h-5z" fill="#d9bd6b"/><path d="M54 25h7v5h-7zM77 25h7v5h-7z" fill={accent}/></>;
    case "saiyan": return <><path d="M56 16V5h5v5h4V1h5v9h4V3h5v7h5v9H56z" fill="#ebd160"/><path d="M57 16h24v4H57z" fill="#d9b44c"/><path d="M61 27h6v2h-6zM72 27h6v2h-6z" fill="#496da1"/></>;
    case "bat": return <><path d="M58 18h21v19H58zM58 5h6v15h-6zM73 5h6v15h-6z" fill="#333945"/><path d="M60 28h7v3h-7zM71 28h7v3h-7z" fill="#f5efdc"/><path d="M64 36h11v7H64z" fill="#c2a487"/></>;
    case "creeper": return <path d="M61 27h5v6h-5zM72 27h5v6h-5zM66 33h6v4h-6zM63 37h12v5h-4v-2h-4v2h-4z" fill={accent}/>;
    case "pig": return <><path d="M59 19h18v24H59z" fill="#e9a0ac"/><path d="M62 28h3v3h-3zM72 28h3v3h-3z" fill="#55473f"/><path d="M63 34h12v7H63z" fill={accent}/><path d="M65 36h2v3h-2zM71 36h2v3h-2z" fill="#86525f"/></>;
    case "bee": return <><path d="M62 9h3v10h-3zM72 9h3v10h-3z" fill={accent}/><path d="M59 27h6v7h-6zM72 27h6v7h-6z" fill="#443e36"/></>;
    case "zombie": return <><path d="M59 18h18v25H59z" fill="#77a774"/><path d="M61 28h5v4h-5zM72 28h5v4h-5zM64 36h9v3h-9z" fill="#3e6650"/></>;
    case "mushroom": return <><path d="M56 14h26v5H56zM60 8h18v8H60z" fill="#c9574c"/><path d="M63 9h6v4h-6zM75 14h4v4h-4z" fill={accent}/></>;
    case "fox": return <><path d="M59 9h7v12h-7zM72 9h7v12h-7z" fill="#dc904a"/><path d="M61 12h3v5h-3zM74 12h3v5h-3z" fill="#423e33"/><path d="M61 33h16v10H61z" fill={accent}/><path d="M68 34h5v4h-5z" fill="#3a3c34"/></>;
    case "panda": return <><path d="M58 11h8v9h-8zM73 11h8v9h-8z" fill={accent}/><path d="M59 24h9v11h-9zM71 24h8v11h-8z" fill={accent}/><path d="M62 28h3v3h-3zM73 28h3v3h-3z" fill="#fff"/></>;
    case "redstone": return <><path d="M57 16h24v8H57z" fill="#b8a36e"/><path d="M60 19h18v6H60z" fill="#343b37"/><path d="M62 20h5v3h-5zM72 20h4v3h-4z" fill={accent}/></>;
    case "pirate": return <><path d="M54 13h29v6H54zM59 4h19v12H59z" fill={accent}/><path d="M65 7h7v5h-7z" fill="#eee9d5"/><path d="M71 26h8v8h-8zM58 21h22v3H58z" fill="#303536"/></>;
    case "ninja": return <><path d="M57 17h23v8H57z" fill={accent}/><path d="M63 18h12v6H63z" fill="#becbd0"/><path d="M66 19h6v3h-6z" fill="#53687b"/><path d="M54 20h4v8h-4z" fill={accent}/></>;
    case "plumber": return <><path d="M56 14h27v6H56zM60 6h18v11H60z" fill="#d94f47"/><path d="M65 8h9v6h-9z" fill="#fff1de"/><path d="M68 9h3v4h-3z" fill="#d94f47"/><path d="M62 34h14v4H62z" fill="#694b38"/></>;
    case "speedy": return <><path d="M58 8h8v13h-8zM74 8h7v13h-7z" fill="#4283ca"/><path d="M60 33h18v10H60z" fill="#e3c6a0"/></>;
    case "lightning": return <><path d="M58 2h6v19h-6zM75 2h6v19h-6z" fill="#e9cd4d"/><path d="M58 2h6v6h-6zM75 2h6v6h-6z" fill="#504737"/><path d="M57 33h6v6h-6zM76 33h6v6h-6z" fill={accent}/></>;
    case "wizard": return <><path d="M59 26h9v9h-9zM70 26h9v9h-9z" fill="#363a39"/><path d="M61 28h5v5h-5zM72 28h5v5h-5z" fill="#e6e4d5"/><path d="M67 29h4v2h-4z" fill="#363a39"/><path d="M69 17h5v3h-3v4h-3v-3h1z" fill={accent}/></>;
    case "spaceknight": return <><path d="M58 15h21v5H58zM55 20h5v22h-5zM77 20h5v22h-5z" fill="#806a58"/><path d="M62 37h12v6H62z" fill="#907859"/></>;
    case "viking": return <><path d="M58 11h21v10H58z" fill={accent}/><path d="M66 8h5v16h-5z" fill="#8b9a9e"/><path d="M51 5h6v11h6v5H51zM80 5h6v16H74v-5h6z" fill="#ece0ba"/></>;
    case "ghost": return <><path d="M57 16h23v9H57z" fill="#4e5146"/><path d="M61 18h15v5H61z" fill="#93b5aa"/></>;
    case "ender": return <><path d="M59 18h18v25H59z" fill="#393744"/><path d="M59 28h7v4h-7zM71 28h7v4h-7z" fill={accent}/></>;
    case "diamond": return <><path d="M56 15h25v5H56zM56 15h5v24h-5zM76 15h5v24h-5z" fill="#68bdc7"/><path d="M58 16h21v3H58z" fill={accent}/></>;
    case "dragon": return <><path d="M58 7h5v13h-5zM74 7h5v13h-5z" fill="#b0a2bb"/><path d="M59 28h7v4h-7zM71 28h7v4h-7z" fill={accent}/><path d="M65 40h3v4h-3zM72 40h3v4h-3z" fill="#e6e0e9"/></>;
    default: return null;
  }
}
