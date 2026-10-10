export type TransitionTheme='arcade'|'ranking'|'videos'|'discord'|'demo'|'admin'|'world';
export function transitionFor(path:string):{theme:TransitionTheme;title:string;hint:string}{
 if(path.startsWith('/jeux')||path.startsWith('/plateforme'))return {theme:'arcade',title:'Direction la prairie arcade !',hint:'Un saut, du blé, une nouvelle aventure.'};
 if(path.startsWith('/videos'))return {theme:'videos',title:'Le cinéma du troupeau',hint:'Silence… les moutons tournent !'};
 if(path.startsWith('/discord'))return {theme:'discord',title:'Le troupeau se rassemble',hint:'Rejoins le camp de base.'};
 if(path.startsWith('/demo'))return {theme:'demo',title:'Place à la visite guidée',hint:'Le berger te montre le chemin.'};
 if(path.startsWith('/admin'))return {theme:'admin',title:'Le cockpit du berger',hint:'Prêt à organiser la prairie ?'};
 return {theme:'ranking',title:'En route vers le classement',hint:'Que le meilleur mouton gagne !'};
}
export function animatedLink(href:string,base:string){try{const url=new URL(href,base),from=new URL(base);if(url.origin!==from.origin||!['http:','https:'].includes(url.protocol)||url.pathname===from.pathname&&url.search===from.search||/^\/(api|login|signin|signout)/.test(url.pathname))return null;return url;}catch{return null;}}
