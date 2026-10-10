import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import ts from 'typescript';
const compile=source=>ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const rewardsUrl='data:text/javascript;base64,'+Buffer.from(compile(await readFile('lib/sheep-rewards.ts','utf8'))).toString('base64');
const {shopSkins}=await import(rewardsUrl);
const appearance=compile(await readFile('lib/appearance.ts','utf8')).replace('"./sheep-rewards"',JSON.stringify(rewardsUrl));
const models=await import('data:text/javascript;base64,'+Buffer.from(appearance).toString('base64'));
const {universeThemes,seasonalThemes,worldThemes,themeForSkin,parseAppearance,defaultAppearance}=models;
assert.equal(universeThemes.length,21);assert.equal(seasonalThemes.length,7);assert.equal(worldThemes.length,28);
assert.equal(new Set(worldThemes.map(t=>t.id)).size,28);
for(const skin of shopSkins){const matches=universeThemes.filter(t=>t.skins.includes(skin.id));assert.equal(matches.length,1,'Skin without unique matching decor: '+skin.id);assert.equal(themeForSkin(skin.id).id,matches[0].id);}
for(const theme of worldThemes){const selected=parseAppearance({...defaultAppearance,theme:theme.id,skin:'bat',animated:false,wool:'#abcdef'});assert.equal(selected.theme,theme.id);assert.equal(selected.skin,'bat');assert.equal(selected.animated,false);assert.deepEqual(parseAppearance(JSON.parse(JSON.stringify(selected))),selected);}
assert.equal(parseAppearance({theme:'unknown'}).theme,'classic');
assert.equal(themeForSkin('classic'),undefined);
const source=await readFile('components/UniverseScene.tsx','utf8');
const compiled=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
const sceneExports={};const require=createRequire(import.meta.url);
new Function('require','exports',compiled)(id=>id==='@/lib/appearance'?models:require(id),sceneExports);
const markup=universeThemes.map(theme=>renderToStaticMarkup(createElement(sceneExports.UniverseScene,{theme:theme.id})));
assert.equal(new Set(markup).size,21);
assert.ok(markup.every(svg=>svg.includes('universeLandmarks')&&svg.includes('universeDrifter')&&svg.includes('aria-hidden="true"')));
for(const theme of universeThemes){assert.ok(source.includes(`case "${theme.id}"`));const preview=renderToStaticMarkup(createElement(sceneExports.UniverseScene,{theme:theme.id,preview:true}));assert.ok(preview.includes('scenePreview'));assert.ok(preview.includes(theme.sky));}
const css=await readFile('app/seasons.css','utf8');assert.ok(css.includes('.scenePreview *{animation:none!important}'));assert.ok(css.includes('.universeScene *{animation:none!important}'));assert.ok(css.includes(':root[data-world-motion=off] .overworldBackdrop *{animation-play-state:paused!important}'));
console.log('Verified: 21 distinct decors, all 30 shop skins mapped, 28 persisted theme choices, previous seasons preserved, independent skin selection, SVG previews and reduced-motion controls.');
