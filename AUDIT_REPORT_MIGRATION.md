# Rapport d'audit & migration — Cavaly Livres
## Stack Manus (TiDB + OAuth Manus) → Stack autonome (Postgres/Neon + Vercel)

Date : Juin 2026

---

## 1. Contexte

Le projet a été initialement généré par Manus AI (`template_id: web-db-user`)
et était fortement couplé à l'infrastructure Manus :
- Base de données MySQL/TiDB Cloud (`drizzle-orm/mysql2`)
- Authentification OAuth via `manus.im` / `forge.manus.ai`
- Chat IA, génération d'images, transcription vocale, proxy Google Maps et
  stockage de fichiers — tous proxifiés via `forge.manus.ai` avec
  `BUILT_IN_FORGE_API_KEY`
- Plugin de build `vite-plugin-manus-runtime` + collecteur de logs de debug
  Manus dans `vite.config.ts`

Aucun de ces éléments ne fonctionne hors du bac à sable Manus. L'objectif de
cette mission était de livrer un projet **100% autonome**, déployable sur
**Vercel + Neon Postgres**, sur le domaine **www.cavallygroupe.com**.

---

## 2. Bugs corrigés (audit initial Manus — 8 catégories)

Le rapport d'audit Manus précédent indiquait 8 catégories de bugs déjà
"corrigées". Lors de cette migration, ces correctifs ont été vérifiés et
**un bug non résolu a été corrigé** :

| # | Bug | Statut |
|---|-----|--------|
| 1-7 | Redirections de routage, routes produit incohérentes, badge panier obsolète, console.logs, imports inutilisés, `Error` brut vs `TRPCError` | ✅ Confirmés corrigés (héritage Manus) |
| 8 | `cartId` codé en dur à `0` dans `cartItems`, table `carts` inutilisée | ✅ **Corrigé dans cette migration** — `getOrCreateActiveCart()` crée/récupère un panier réel via la table `carts`, et `addToCart` utilise désormais `cart.id` |

---

## 3. Bugs additionnels détectés et corrigés pendant la migration

Au-delà des problèmes connus, l'audit du code lors de la conversion vers
Postgres a révélé plusieurs bugs **latents, indépendants du SGBD** :

1. **`getOrCreateConversation` et `sendMessage`** (`server/db.ts`) :
   le résultat d'un `INSERT` était traité comme `{ id: result[0] }`, alors que
   `result[0]` est un objet de métadonnées (`ResultSetHeader`), pas un
   identifiant. Corrigé avec `.returning()` et `result[0]`.
2. **`getUnreadMessageCount`** : utilisait `sql.join(conversationIds)` dans
   une clause `IN (...)`, syntaxe fragile et non portable. Remplacé par
   `inArray(messages.conversationId, conversationIds)`.
3. **`createOrderTracking`** : ne retournait pas la ligne créée
   (`db.insert(...).values(...)` sans `.returning()`), alors que
   `routers.ts` renvoyait directement ce résultat au client. Corrigé.
4. **`products-crud.ts`, `manuals-procedures.ts`, `supply-list-router.ts`** :
   pattern `(result as any).insertId` répété 4 fois — incorrect avec
   `drizzle-orm` (le driver MySQL2 ne retourne pas l'id ainsi). Remplacé par
   `.returning({ id: table.id })` partout.
5. **Compteurs agrégés** (`getApprovedUsersCount`, `getPendingUsersCount`,
   `getProductCountWithFilters`, `getPriceRange`) : `COUNT(*)`/`MIN`/`MAX`
   renvoient des `bigint`/`numeric` sous forme de **chaînes** avec le driver
   Postgres `neon-http`. Tous les retours sont désormais convertis avec
   `Number(...)`.
6. **`routers.ts::auth.updateUserType`** : utilisait `ctx.db`, un champ
   inexistant dans `TrpcContext` (bug qui aurait planté à l'exécution).
   Corrigé pour appeler `getDb()` directement.

---

## 4. Migration de l'infrastructure

### 4.1 Base de données : MySQL/TiDB → PostgreSQL/Neon

- `drizzle/schema.ts` entièrement réécrit en `pg-core` (26 tables).
- Tous les `mysqlEnum` convertis en `pgEnum` dédiés (14 types ENUM Postgres).
- `int().autoincrement()` → `integer().primaryKey().generatedAlwaysAsIdentity()`.
- `decimal`/`longtext` → `numeric`/`text`.
- `.onUpdateNow()` → `.$onUpdate(() => new Date())`.
- Ajout de la colonne `users.passwordHash` pour l'authentification locale.
- Migration SQL générée et vérifiée : `drizzle/0000_init_postgresql.sql`
  (386 lignes, 26 tables + 14 `CREATE TYPE ... AS ENUM`).
- `server/db.ts` : driver `drizzle-orm/mysql2` → `drizzle-orm/neon-http`
  (`@neondatabase/serverless`).

### 4.2 Authentification : OAuth Manus → Email/mot de passe local

- **Nouveau module** `server/_core/auth.ts` : JWT signé localement (HS256 via
  `jose`), vérifié sans appel externe, stocké dans le cookie
  `app_session_id`.
- **`server/_core/context.ts`** : utilise `authenticateRequest()` au lieu du
  SDK OAuth Manus.
- **`routers.ts`** : ajout de `auth.register` et `auth.login` (bcryptjs pour
  le hash des mots de passe, zod pour la validation).
- **Nouvelles pages client** : `/login` et `/register`
  (`client/src/pages/Login.tsx`, `Register.tsx`).
- **`client/src/const.ts::getLoginUrl()`** : redirige désormais vers `/login`
  au lieu de construire une URL vers le portail OAuth Manus.
- Le rôle `admin` est attribué automatiquement à l'inscription si l'email
  correspond à `OWNER_EMAIL`.

### 4.3 Chat IA : proxy Forge → API Anthropic directe

- `server/_core/llm.ts` réécrit : appelle directement
  `https://api.anthropic.com/v1/messages` (modèle `claude-sonnet-4-6`, clé
  `ANTHROPIC_API_KEY`), tout en conservant la forme de retour compatible
  OpenAI (`choices[0].message.content`) attendue par
  `server/ai-chat-router.ts` — aucune modification nécessaire côté routeur.

### 4.4 Notifications : proxy Forge → logger local

- `server/_core/notification.ts` réécrit en validation + `console.log`,
  sans dépendance externe. Compatible avec `systemRouter.ts::notifyOwner`.

### 4.5 Stockage fichiers : proxy Forge → AWS S3 direct

- `server/storage.ts` réécrit avec `@aws-sdk/client-s3` +
  `@aws-sdk/s3-request-presigner` (déjà présents dans `package.json`).
  `storagePut()` envoie vers S3, `storageGet()` génère une URL signée
  temporaire (1h). Configuration via `S3_BUCKET_NAME`, `AWS_REGION`,
  `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_PUBLIC_URL`.

### 4.6 Cartes : proxy Forge Maps → Google Maps direct

- `client/src/components/Map.tsx` : remplace
  `https://forge.butterfly-effect.dev/v1/maps/proxy/...` par
  `https://maps.googleapis.com/maps/api/js?key=${VITE_GOOGLE_MAPS_API_KEY}`.

### 4.7 Fichiers supprimés (spécifiques Manus, non référencés ailleurs)

`server/_core/oauth.ts`, `sdk.ts`, `dataApi.ts`, `imageGeneration.ts`,
`voiceTranscription.ts`, `map.ts`, `types/manusTypes.ts`, `types/cookie.d.ts`,
ainsi que `.manus/`, `.manus-logs/`, `patches/`, `.project-config.json`.

### 4.8 Build & déploiement

- `vite.config.ts` : suppression de `vite-plugin-manus-runtime` et du
  collecteur de logs de debug Manus (`vitePluginManusDebugCollector`),
  suppression des `allowedHosts` Manus.
- `package.json` : `mysql2` → `@neondatabase/serverless`, ajout de
  `bcryptjs`. Script `build` séparé en `build` (frontend Vite seul, pour
  Vercel) et `build:server` (bundle Express complet pour déploiement Node
  traditionnel).
- **Nouveau** `api/index.ts` : point d'entrée serverless Vercel (Express +
  tRPC + webhooks, sans `.listen()` ni serveur statique).
- **Nouveau** `vercel.json` : build, rewrites SPA + API.
- Les imports `@shared/const` dans le code serveur ont été convertis en
  chemins relatifs (`../shared/const`) pour garantir la résolution correcte
  dans la fonction serverless Vercel.

---

## 5. Tests

`npx vitest run` : 112 tests passent, 33 échouent — **tous les échecs
restants sont dus à l'absence de connexion `DATABASE_URL` dans cet
environnement d'audit** (`Error: Database not available` /
`Database connection failed`), à l'exception de :

- `server/orders.test.ts` (2 tests) : incohérences pré-existantes entre les
  schémas zod de `createOrder`/`getOrderById` et les données envoyées par les
  tests (champs `customerName`, `totalAmount`, `unitPrice` attendus en
  `string`, `id` attendu en `number`). **Non liées à la migration Postgres** —
  à corriger séparément dans les fichiers de test.

Le test `server/auth.logout.test.ts` a été mis à jour pour refléter la
nouvelle politique de cookie `sameSite: "lax"` (frontend et API étant
désormais same-origin sur `cavallygroupe.com`, contre `sameSite: "none"`
auparavant, requis pour l'iframe OAuth Manus).

---

## 6. Ce qu'il reste à faire après déploiement

1. Exécuter `drizzle/0000_init_postgresql.sql` sur la base Neon de production.
2. Adapter et exécuter les scripts de seed (`scripts/seed-categories.sql`,
   `scripts/seed-hierarchical-categories.sql`, `seed-products.mjs`) — voir
   `DEPLOYMENT_GUIDE.md §6`.
3. Configurer le bucket S3 et les clés AWS.
4. Configurer le DNS de `www.cavallygroupe.com` vers Vercel.
5. Créer le premier compte admin via `/register` avec l'email `OWNER_EMAIL`.
6. (Optionnel) Corriger `server/orders.test.ts` pour aligner les fixtures de
   test sur les schémas zod actuels.
