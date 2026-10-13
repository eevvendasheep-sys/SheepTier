# SheepTier sur Vercel Hobby

Importer le dépôt `eevvendasheep-sys/SheepTier`, branche `main`, framework Next.js, racine du dépôt. Utiliser le forfait Hobby gratuit et Node.js 22. Les données restent dans le projet Supabase existant ; aucune initialisation ou remise à zéro de la base.

Recopier les variables serveur existantes de Netlify vers l'environnement Production Vercel : `SUPABASE_DB_URL`, `SUPABASE_DB_CA_B64`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`, `ADMIN_SESSION_SECRET`. Ne jamais les mettre dans GitHub ni leur donner un préfixe `NEXT_PUBLIC_`. Configurer `SITE_URL` avec la nouvelle origine HTTPS puis redéployer si nécessaire.

Les cookies sont propres à chaque domaine : chaque utilisateur devra se reconnecter avec son compte existant. Les comptes et la progression synchronisée restent dans Supabase. Une progression d'invité stockée seulement dans le navigateur ne migre pas automatiquement entre domaines.

Après déploiement : vérifier l'accueil, `/api/leaderboard`, la connexion et la progression avec un compte existant, l'accès propriétaire, un logo, les clips et le village. Le nouveau classement regroupe les cinq lectures en une requête ; le cache public contient uniquement les champs publics.

Les vidéos utilisent déjà des envois signés directement vers Supabase ; aucun fichier vidéo de 20 Mo ne traverse le corps des fonctions Vercel. Les limites Supabase et Vercel restent applicables.

Bot Discord : fournir l'adresse de production Vercel au programme de connexion mis à jour. La clé `/rank` existante reste valide puisqu'elle est stockée dans la même base. Tester une attribution réelle souhaitée par un modérateur, sans créer de faux joueur sur la base de production.

Ne supprimer l'ancien hébergement qu'après validation. L'URL `netlify.app` ne peut pas être transférée à Vercel : le site recevra une nouvelle URL `vercel.app`.
