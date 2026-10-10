export function databaseFailure(error, phase){
 const raw=String(error?.code||'');const code=/^[A-Z0-9_]+$/.test(raw)?raw:'NON_IDENTIFIE';
 const hints={
  '28P01':'Mot de passe de BASE refusé. Vérifie le nouveau mot de passe et son encodage dans l’URI.',
  '28000':'Utilisateur / projet refusé. Recopie l’URI Transaction pooler depuis Connect.',
  'ENOTFOUND':'Adresse du pooler introuvable. Vérifie l’URI et la connexion Internet.',
  'ETIMEDOUT':'Connexion réseau expirée. Vérifie Internet, VPN et restrictions réseau du projet.',
  'ECONNREFUSED':'Connexion au serveur refusée. Vérifie le port du pooler et que le projet est actif.',
  'SELF_SIGNED_CERT_IN_CHAIN':'Certificat Supabase nécessaire. Télécharge-le depuis Database Settings → SSL Configuration → Download Certificate et place-le dans site/supabase-ca.crt.',
  'UNABLE_TO_VERIFY_LEAF_SIGNATURE':'Certificat Supabase nécessaire. Télécharge-le depuis Database Settings → SSL Configuration → Download Certificate et place-le dans site/supabase-ca.crt.',
  'UNABLE_TO_GET_ISSUER_CERT_LOCALLY':'Certificat Supabase nécessaire. Place le certificat officiel téléchargé dans site/supabase-ca.crt.',
  'ERR_TLS_CERT_ALTNAME_INVALID':'Le certificat ne correspond pas à l’hôte. Vérifie l’URI et le certificat du bon projet.',
  '42501':'Droits PostgreSQL insuffisants. Utilise l’URI du compte postgres du projet.',
  '42601':'Une commande SQL a été refusée. Partage ce code et l’étape affichée, sans URI ni mot de passe.'
 };
 return `PostgreSQL — étape : ${phase} — code : ${code}. ${hints[code]||'Partage uniquement cette ligne de diagnostic, sans clé ni URI.'}`;
}
