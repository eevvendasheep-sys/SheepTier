"use client";
import {useEffect,useRef,useState} from 'react';
import {X} from 'lucide-react';
import {SheepSprite} from './SheepSprite';
const lines=[
 'Bêê ! Bienvenue dans mon petit coin de prairie.',
 'Je suis petit, mais mon ego est classé S tier.',
 'Un clic, une réplique. On appelle ça du bêê-vardage.',
 'Le blé ne pousse pas tout seul… enfin, dans le Clicker, presque.',
 'Un loup ? Où ça ? Je faisais juste une pause stratégique.',
 'Mon secret pour gagner ? Sauter. Puis resauter.',
 'Les portails de vol : enfin une bonne excuse pour avoir la tête dans les nuages.',
 'Tu peux changer mon décor. Mais pas mon amour du blé.',
 'La boutique vend des costumes. Mon charisme reste gratuit.',
 'Je ne triche pas. Je découvre des mécaniques inattendues.',
 'Un checkpoint, c’est un câlin pour les joueurs maladroits.',
 'La lave, c’est comme un bain… mais une seule fois.',
 'J’ai demandé une coupe au coiffeur. Il a sorti des cisailles.',
 'Un beau clip mérite son moment de gloire. Propose-le dans Vidéos !',
 'Le troupeau se retrouve sur Discord. Je ramène le foin.',
 'Tu débutes ? La Démo te montre toute la prairie.',
 'Crée ton niveau, termine-le et lance un défi à la communauté !',
 'Le note block a meilleur goût musical que les loups.',
 'Je suis en bas à gauche : la meilleure place pour surveiller le troupeau.',
 'Encore une partie ? Je savais qu’on allait bien s’entendre.'
];
export default function SheepCompanion(){const [phrase,setPhrase]=useState(''),[bounce,setBounce]=useState(0);const audio=useRef<HTMLAudioElement|null>(null);const bag=useRef<number[]>([]),last=useRef(-1),timer=useRef<ReturnType<typeof setTimeout>|null>(null);useEffect(()=>{const sound=new Audio('/audio/sheep-bleat.wav');sound.preload='auto';sound.volume=.65;audio.current=sound;return()=>{sound.pause();audio.current=null;if(timer.current)clearTimeout(timer.current);};},[]);function talk(){try{if(localStorage.getItem('sheeptier-button-sounds')!=='off'&&audio.current){audio.current.currentTime=0;void audio.current.play().catch(()=>{});}}catch{}if(!bag.current.length){bag.current=lines.map((_,i)=>i);for(let i=bag.current.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[bag.current[i],bag.current[j]]=[bag.current[j],bag.current[i]];}if(bag.current.at(-1)===last.current)[bag.current[0],bag.current[bag.current.length-1]]=[bag.current.at(-1)!,bag.current[0]];}const next=bag.current.pop()!;last.current=next;setPhrase(lines[next]);setBounce(v=>v+1);if(timer.current)clearTimeout(timer.current);timer.current=setTimeout(()=>setPhrase(''),8500);}
return <aside className="sheepCompanion" aria-label="Bêê, le compagnon de la prairie">{phrase&&<div className="companionBubble"><span role="status" aria-live="polite">{phrase}</span><button className="companionClose" aria-label="Fermer la réplique" onClick={()=>setPhrase('')}><X size={15}/></button></div>}<button className="companionButton" data-silent onClick={talk} aria-label="Faire parler Bêê le mouton" aria-expanded={!!phrase} title="Clique sur moi, j’ai plein de choses à te raconter !"><span className="companionSheep" key={bounce}><SheepSprite/></span><span className="companionName">Bêê !</span></button></aside>;}
