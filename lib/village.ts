export const villageKinds = ['house','tree','flowers','fence','well','bench','lamp','hay','crystal','water','path','zone'] as const;
export type VillageKind = typeof villageKinds[number];
export type VillageObject = {id:string;kind:VillageKind;x:number;y:number;w:number;h:number;label:string};
export type Villager = {id:string;name:string;reference:string;skin:string;x:number;y:number;voice:number;dialogues:string[]};
export type VillageWorld = {name:string;width:number;height:number;spawn:{x:number;y:number};objects:VillageObject[];npcs:Villager[]};
export const solidKinds:readonly string[]=['house','tree','fence','well','water','crystal'];
export function canWalk(world:VillageWorld,x:number,y:number){return x>=.4&&y>=.4&&x<world.width-.4&&y<world.height-.4&&!world.objects.some(o=>solidKinds.includes(o.kind)&&x+.28>o.x&&x-.28<o.x+o.w&&y+.28>o.y&&y-.28<o.y+o.h);}
export function defaultVillage():VillageWorld{
 const objects:VillageObject[]=[];let count=0;
 const add=(kind:VillageKind,x:number,y:number,w=1,h=1,label='')=>objects.push({id:'seed-'+count++,kind,x,y,w,h,label});
 add('path',3,21,58,3);add('path',30,3,3,38);add('path',8,9,48,2);add('path',8,33,48,2);
 add('zone',3,3,25,16,'Quartier du bouclier');add('zone',35,3,26,16,'Camp du manhunt');add('zone',3,26,25,15,'Forge des lances');add('zone',35,26,26,15,'Jardin des potions');
 add('house',10,5,6,5,'La forge');add('house',21,12,5,4,'Le bouclier');add('house',42,5,6,5,'Le refuge');add('house',51,13,5,4,'Le guetteur');add('house',10,28,6,5,'Les lances');add('house',43,28,6,5,'L’alchimiste');add('well',35,20,2,2);add('water',51,28,8,9);
 for(let i=0;i<15;i++){add('tree',2+(i*11)%58,2+(i*7)%38,2,2);add('flowers',6+(i*13)%53,4+(i*9)%34,2,1);}
 add('bench',25,23,2,1);add('hay',18,30,2,2);add('crystal',38,31,1,2);add('lamp',29,18);add('lamp',34,25);
 return {name:'Le Village des champions',width:64,height:44,spawn:{x:31.5,y:22.5},objects,npcs:[
 {id:'shield',name:'Neth, le gardien',reference:'Neth Shield',skin:'Technoblade',x:27,y:20,voice:0,dialogues:['Un bouclier bien levé vaut mieux qu’une attaque précipitée. Attends le bon moment !','Ici, on protège le troupeau. Regarde ton adversaire, puis punis son ouverture.']},
 {id:'hunt',name:'Le coureur masqué',reference:'Manhunt · clin d’œil à Dream',skin:'Dream',x:40,y:12,voice:1,dialogues:['Tu vois ce chemin ? Je connais déjà trois façons de semer les chasseurs.','La meilleure arme du manhunt ? Une idée que personne n’a encore eue. Et un seau d’eau.']},
 {id:'pot',name:'Pot, l’alchimiste',reference:'Iron Pot',skin:'IntelEdits',x:39,y:25,voice:2,dialogues:['Garde une potion à portée de main. Un combo ne pardonne pas un inventaire mal rangé !','Recule, soigne-toi, puis reprends le rythme. Le duel n’est pas fini tant que tu tiens debout.']},
 {id:'spear',name:'Le maître des lances',reference:'DiamondSpear · Spear SMP',skin:'ClownPierce',x:19,y:33,voice:3,dialogues:['La portée est ton amie. Fais un pas de côté, puis frappe au bon instant.','Une lance en diamant brille. Mais c’est le placement qui gagne le combat.']},
 {id:'mace',name:'Mace, le voltigeur',reference:'Diamond Mace',skin:'fruitberries',x:35,y:35,voice:4,dialogues:['Regarde en haut ! Le prochain adversaire pourrait arriver du ciel.','Prends de la hauteur, prépare ta chute… et pense à ton atterrissage !']},
 {id:'legend',name:'Le roi de l’arène',reference:'PvP · hommage à Technoblade',skin:'Technoblade',x:31,y:16,voice:5,dialogues:['Une couronne ne fait pas gagner les duels. L’entraînement, oui.','Même les meilleurs ont commencé avec une épée en bois. Alors, retourne t’entraîner !']}
 ]};
}
export function validateVillage(input:unknown):VillageWorld{
 if(!input||typeof input!=='object')throw new Error('Carte invalide.');const a=input as Record<string,unknown>;
 const num=(v:unknown,min:number,max:number)=>{if(typeof v!=='number'||!Number.isFinite(v)||v<min||v>max)throw new Error('Coordonnées invalides.');return v;};
 const text=(v:unknown,max:number)=>{if(typeof v!=='string'||v.length>max)throw new Error('Texte invalide ou trop long.');return v.trim();};
 const width=num(a.width,32,96),height=num(a.height,24,72);if(!Number.isInteger(width)||!Number.isInteger(height))throw new Error('Taille invalide.');
 if(!Array.isArray(a.objects)||a.objects.length>500||!Array.isArray(a.npcs)||a.npcs.length>60)throw new Error('Maximum : 500 décors et 60 habitants.');
 const ids=new Set<string>();const id=(v:unknown)=>{const s=text(v,80);if(!/^[a-zA-Z0-9_-]+$/.test(s)||ids.has(s))throw new Error('Identifiants invalides.');ids.add(s);return s;};
 const objects=a.objects.map((o:VillageObject)=>{if(!o||!villageKinds.includes(o.kind))throw new Error('Décor inconnu.');const x=num(o.x,0,width-1),y=num(o.y,0,height-1),w=num(o.w,1,width),h=num(o.h,1,height);if(x+w>width||y+h>height)throw new Error('Un décor dépasse la carte.');return {id:id(o.id),kind:o.kind,x,y,w,h,label:text(o.label,60)};});
 const npcs=a.npcs.map((n:Villager)=>{if(!n||!Array.isArray(n.dialogues)||!n.dialogues.length||n.dialogues.length>12)throw new Error('Chaque habitant doit avoir 1 à 12 dialogues.');const skin=text(n.skin,36);if(!/^(?:[a-zA-Z0-9_]{1,16}|[a-fA-F0-9-]{32,36})$/.test(skin))throw new Error('Skin : pseudo Minecraft ou UUID uniquement.');const voice=num(n.voice,0,5);if(!Number.isInteger(voice))throw new Error('Voix invalide.');return {id:id(n.id),name:text(n.name,50),reference:text(n.reference,100),skin,x:num(n.x,.4,width-.4),y:num(n.y,.4,height-.4),voice,dialogues:n.dialogues.map(d=>text(d,400))};});
 const spawn=a.spawn as VillageWorld['spawn'];if(!spawn)throw new Error('Point d’arrivée manquant.');const world={name:text(a.name,80),width,height,spawn:{x:num(spawn.x,.4,width-.4),y:num(spawn.y,.4,height-.4)},objects,npcs};
 if(!canWalk(world,world.spawn.x,world.spawn.y)||npcs.some(n=>!canWalk(world,n.x,n.y)))throw new Error('L’arrivée et les habitants doivent être placés sur un passage libre.');return world;
}
