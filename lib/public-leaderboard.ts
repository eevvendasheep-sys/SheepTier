import type {SiteDocument} from './store';
export function publicLeaderboard(doc:SiteDocument){
 return {settings:doc.site_settings[0]??null,
  modes:doc.gamemodes.filter(g=>g.enabled).sort((a,b)=>a.sort_order-b.sort_order),
  tiers:[...doc.tiers].sort((a,b)=>a.sort_order-b.sort_order),
  players:[...doc.players].sort((a,b)=>a.username.localeCompare(b.username)),rankings:doc.rankings};
}
