# Guide de déploiement — Cavaly Livres
## Vercel + Neon Postgres + www.cavallygroupe.com

Ce projet a été migré depuis la stack Manus (TiDB MySQL + OAuth Manus) vers une
stack autonome : **PostgreSQL (Neon)** + **authentification locale email/mot
de passe** + **déploiement Vercel**.

---

## 1. Créer la base de données Neon

1. Créer un compte sur [neon.tech](https://neon.tech) et un nouveau projet
   (région recommandée : `eu-central-1` pour la latence avec la CI).
2. Récupérer la chaîne de connexion (`DATABASE_URL`), format :
   ```
   postgresql://user:password@ep-xxxx.eu-central-1.aws.neon.tech/neondb?sslmode=require
   ```
3. Appliquer le schéma initial (26 tables + 14 types ENUM) :
   ```bash
   psql "$DATABASE_URL" -f drizzle/0000_init_postgresql.sql
   ```
   ou via drizzle-kit :
   ```bash
   DATABASE_URL="postgresql://..." npx drizzle-kit migrate
   ```

---

## 2. Variables d'environnement

Copier `.env.example` vers `.env` pour le développement local, et configurer
les mêmes variables dans **Vercel → Project Settings → Environment Variables**
(scope: Production + Preview).

Variables essentielles :

| Variable | Description |
|---|---|
| `DATABASE_URL` | Chaîne de connexion Neon (avec `?sslmode=require`) |
| `JWT_SECRET` | Secret aléatoire fort pour signer les cookies de session (`openssl rand -base64 48`) |
| `OWNER_EMAIL` | Email du compte administrateur (reçoit automatiquement le rôle `admin` à l'inscription) |
| `ANTHROPIC_API_KEY` | Clé API Anthropic (chatbot, analyse de listes scolaires) |
| `S3_BUCKET_NAME`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_PUBLIC_URL` | Stockage des fichiers (diplômes, listes scolaires, galeries produits) |
| `VITE_GOOGLE_MAPS_API_KEY` | Clé Google Maps JS API (cartes de livraison) |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Paiement par carte |
| `WAVE_*`, `MOOV_*`, `MTN_*`, `ORANGE_*` | Mobile Money (clés API + secrets webhook par opérateur) |
| `SMTP_*` | Envoi d'emails (confirmations de commande) |
| `SMS_*` | Envoi de SMS (notifications de commande) |
| `APP_URL`, `FRONTEND_URL`, `VITE_FRONTEND_URL` | `https://www.cavallygroupe.com` |

> ⚠️ Ne jamais réutiliser les anciennes valeurs Manus (`BUILT_IN_FORGE_API_KEY`,
> `OAUTH_SERVER_URL`, `VITE_APP_ID`, `VITE_OAUTH_PORTAL_URL`, `OWNER_OPEN_ID`,
> etc.) — elles ont été retirées du code et ne sont plus utilisées.

---

## 3. Création du compartiment S3

1. Créer un bucket S3 (ex. `cavally-groupe-uploads`) dans la région choisie.
2. Configurer une politique de lecture publique si les fichiers (couvertures
   de livres, galeries produits) doivent être accessibles directement via
   `S3_PUBLIC_URL` — ou placer un CDN/CloudFront devant le bucket.
3. Créer un utilisateur IAM avec une politique limitée à
   `s3:PutObject`, `s3:GetObject` sur ce bucket, et récupérer
   `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`.

---

## 4. Déploiement sur Vercel

### Via CLI

```bash
npm install -g vercel
cd cavaly-livres
vercel login
vercel link
vercel env pull .env          # optionnel, pour vérifier la config
vercel --prod
```

### Via Git (recommandé)

1. Pousser le projet sur un dépôt GitHub.
2. Sur [vercel.com](https://vercel.com), **Add New → Project**, importer le
   dépôt.
3. Vercel détecte `vercel.json` :
   - `buildCommand`: `npm run build` (build du frontend Vite → `dist/public`)
   - `outputDirectory`: `dist/public`
   - La fonction serverless `api/index.ts` gère toutes les routes `/api/*`
     (tRPC + webhooks mobile money) via Node.js sur Vercel Functions.
4. Renseigner toutes les variables d'environnement (section 2) avant le
   premier déploiement.
5. Lancer le déploiement.

---

## 5. Nom de domaine — www.cavallygroupe.com

1. Dans Vercel : **Project → Settings → Domains → Add** → saisir
   `www.cavallygroupe.com` (et `cavallygroupe.com` avec redirection vers le
   `www`).
2. Configurer chez le registrar/DNS du domaine `cavallygroupe.com` :
   - **CNAME** `www` → `cname.vercel-dns.com`
   - **A** `@` (apex) → `76.76.21.21` (IP Vercel, ou laisser Vercel proposer
     la valeur exacte affichée dans son interface)
3. Attendre la propagation DNS (jusqu'à 24h) puis vérifier le certificat TLS
   automatique (Let's Encrypt via Vercel).

---

## 6. Données initiales (seed)

Les scripts de seed d'origine (`seed-db.mjs`, `seed-products.mjs`,
`add-categories.mjs`, `scripts/seed-*.sql`) référencent l'ancien schéma
MySQL/TiDB et le driver `mysql2`. Pour peupler Neon :

- **Catégories / niveaux d'éducation** : adapter `scripts/seed-categories.sql`
  et `scripts/seed-hierarchical-categories.sql` — la syntaxe SQL est en
  grande partie compatible Postgres (vérifier les guillemets d'identifiants
  et les types `ENUM`, désormais `user_role`, `order_status`, etc. définis
  dans `drizzle/0000_init_postgresql.sql`).
- **Produits/comptes** : réécrire `seed-db.mjs`/`seed-products.mjs` en
  remplaçant `drizzle-orm/mysql2` par `drizzle-orm/neon-http` +
  `@neondatabase/serverless`, comme dans `server/db.ts`.

```bash
psql "$DATABASE_URL" -f scripts/seed-categories.sql
psql "$DATABASE_URL" -f scripts/seed-hierarchical-categories.sql
```

---

## 7. Création du premier compte administrateur

1. Définir `OWNER_EMAIL` (variable d'environnement) sur l'adresse email
   souhaitée pour l'administrateur **avant** l'inscription.
2. Aller sur `https://www.cavallygroupe.com/register` et créer un compte avec
   cette adresse email exacte.
3. Le compte recevra automatiquement le rôle `admin` (voir
   `server/db.ts::createUserWithPassword`).

---

## 8. Développement local

```bash
npm install --legacy-peer-deps
cp .env.example .env   # puis renseigner DATABASE_URL, JWT_SECRET, etc.
npm run dev             # serveur Express + Vite en mode dev, port 3000+
```

Build de production (frontend uniquement, pour Vercel) :
```bash
npm run build
```

Build complet incluant le serveur Express bundlé (déploiement Node
traditionnel hors Vercel, ex. VPS/Docker) :
```bash
npm run build:server
npm start
```
