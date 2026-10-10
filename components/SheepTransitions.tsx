"use client";
import {useEffect,useRef,useState,type CSSProperties} from 'react';
import {Gamepad2,Trophy,Film,MessagesSquare,Clapperboard,Shield,Star} from 'lucide-react';
import {SheepSprite} from './SheepSprite';
import {animatedLink,transitionFor,type TransitionTheme} from '@/lib/ui-transitions';
type Scene={theme:TransitionTheme;title:string;hint:string;phase:'leave'|'arrive'|'switch';key:number};
type Burst={key:number;x:number;y:number};
const icons={arcade:Gamepad2,ranking:Trophy,videos:Film,discord:MessagesSquare,demo:Clapperboard,admin:Shield,world:Star};
export default function SheepTransitions(){
 const [scene,setScene]=useState<Scene|null>(null),[bursts,setBursts]=useState<Burst[]>([]);
 const sequence=useRef(0),busy=useRef(false);
 useEffect(()=>{const media=window.matchMedia('(prefers-reduced-motion: reduce)');const timers=new Set<ReturnType<typeof setTimeout>>();const later=(fn:()=>void,ms:number)=>{const t=setTimeout(()=>{timers.delete(t);fn();},ms);timers.add(t);return t;};let clearScene:ReturnType<typeof setTimeout>|null=null;
 const show=(detail:Omit<Scene,'key'>)=>{if(clearScene){clearTimeout(clearScene);timers.delete(clearScene);}setScene({...detail,key:++sequence.current});clearScene=later(()=>setScene(null),detail.phase==='arrive'?850:750);};
 try{const stored=sessionStorage.getItem('sheeptier-transition');sessionStorage.removeItem('sheeptier-transition');if(stored&&!media.matches){const marker=JSON.parse(stored);if(marker.path===location.pathname&&Date.now()-marker.at<15000)show({...transitionFor(location.pathname),phase:'arrive'});}}catch{}
 function click(e:MouseEvent){if(!(e.target instanceof Element)||media.matches)return;const target=e.target.closest<HTMLElement>('button,a[href],input[type=submit],input[type=button],[role=button]');if(!target||target.matches(':disabled,[aria-disabled=true],[data-no-animation]'))return;
 const box=target.getBoundingClientRect(),key=++sequence.current;const keyboard=e.detail===0;setBursts(old=>[...old.slice(-4),{key,x:keyboard?box.left+box.width/2:e.clientX,y:keyboard?box.top+box.height/2:e.clientY}]);later(()=>setBursts(old=>old.filter(b=>b.key!==key)),620);
 if(target instanceof HTMLAnchorElement){if(e.defaultPrevented||e.button!==0||e.ctrlKey||e.metaKey||e.altKey||e.shiftKey||target.hasAttribute('download')||target.target&&target.target!=='_self')return;const destination=animatedLink(target.href,location.href);if(!destination)return;e.preventDefault();if(busy.current)return;busy.current=true;show({...transitionFor(destination.pathname),phase:'leave'});try{sessionStorage.setItem('sheeptier-transition',JSON.stringify({path:destination.pathname,at:Date.now()}));}catch{}later(()=>location.assign(destination.href),440);return;}
 if(target.closest('.platformTabs,.gameTabs,.arcadeTabs,.sidebar')||target.matches('[aria-pressed]')&&!target.closest('.demoVoiceControls,.jukebox,.gameTouchControls')){const label=(target.textContent||'').trim().slice(0,65);show({theme:target.closest('.sidebar')?'admin':target.closest('.appearanceDialog')?'world':'arcade',title:label||'Une nouvelle aventure',hint:'Hop ! Le troupeau change de décor.',phase:'switch'});}
 }
 document.addEventListener('click',click);return()=>{document.removeEventListener('click',click);for(const t of timers)clearTimeout(t);busy.current=false;};
 },[]);
 const Icon=scene?icons[scene.theme]:Star;
 return <>{scene&&<div key={scene.key} className={`sheepTransition transition-${scene.theme} transition-${scene.phase}`} aria-hidden="true"><div className="transitionSky"><i/><i/><i/></div><div className="transitionTiles">{Array.from({length:16},(_,i)=><i key={i} style={{'--tile':i} as CSSProperties}/>)}</div><div className="transitionScene"><div className="transitionMedal"><Icon size={38}/></div><div className="transitionSheep"><SheepSprite skin={scene.theme==='arcade'?'hero':scene.theme==='ranking'?'royal':scene.theme==='discord'?'rainbow':scene.theme==='admin'?'farmer':'classic'}/><span className="transitionShadow"/></div><div className="transitionProps">{scene.theme==='arcade'?<><span>▣</span><span>✦</span><span>▣</span></>:scene.theme==='videos'||scene.theme==='demo'?<><Film size={30}/><Star size={20}/><Film size={30}/></>:<><Star size={20}/><Star size={30}/><Star size={20}/></>}</div><strong>{scene.title}</strong><small>{scene.hint}</small><div className="transitionProgress"><i/></div></div><div className="transitionHerd">{Array.from({length:5},(_,i)=><div key={i} style={{'--sheep':i} as CSSProperties}><SheepSprite/></div>)}</div></div>}{bursts.map(b=><div key={b.key} className="sheepClickBurst" style={{left:b.x,top:b.y}} aria-hidden="true"><span className="clickSheep"><SheepSprite/></span>{Array.from({length:6},(_,i)=><i key={i} style={{'--spark':i} as CSSProperties}/>)}</div>)}</>;
}
