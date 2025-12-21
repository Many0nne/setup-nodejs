# Modèle d’API REST Node.js (Express + TypeScript + Prisma)

Un starter minimal et réutilisable pour une API REST avec authentification JWT et PostgreSQL via Prisma.

## Aperçu

- Framework: Express (TypeScript strict)
- ORM: Prisma (Prisma v7 avec `prisma.config.ts`)
- Sécurité: Helmet, CORS, HPP, rate limiting sur les routes d’auth
- Logs: `pino` (joli en dev)
- Validation: `zod`
- Auth: JWT (HS256), mots de passe hachés (`bcryptjs` par défaut)
- Docs API: Swagger UI disponible sur `/docs`

## Prérequis

- Node.js 20+ (Dockerfile utilise Node 22)
- Docker Desktop (pour Postgres et Adminer)

## Démarrage (développement local)

1. Copier les variables d’environnement et adapter les valeurs:

````powershell
Copy-Item .env.example .env
2) Installer les dépendances:
```powershell
Push-Location "c:\Users\baril\Documents\DEV\projets\NodeJS-setup-back"
3) Lancer le serveur en dev (hot reload):
```powershell
npm run dev
4) Vérifier la santé du service:
````

GET http://localhost:3000/health

## Démarrage avec Docker (Postgres + Adminer + serveur)

Le projet inclut `compose.yaml` avec les services suivants:

- `postgres` (PostgreSQL 16, volume nommé `pg-data`)
- `adminer` (interface web DB sur `http://localhost:8080`)
- `server` (API). Au démarrage, le conteneur applique automatiquement les migrations Prisma (`prisma migrate deploy`) puis lance l’application.
  Commandes:

```powershell
docker compose up -d --build
# Arrêter et supprimer (y compris volumes) si vous repartez de zéro:
docker compose down -v
```

Connexion Adminer:

- Base de données: PostgreSQL
- Hôte/Serveur: `postgres`
- Utilisateur: `postgres`
- Mot de passe: `postgres`
- Base: `appdb`

Après une création de conteneur « from scratch », les tables (dont `User`) sont créées par les migrations.

## Variables d’environnement (`.env` / compose)

- `NODE_ENV` (default: `development`)
- `PORT` (default: `3000`)
- `JWT_SECRET` (utiliser une chaîne longue en prod)
- `BCRYPT_SALT_ROUNDS` (default: `10`)
- `DATABASE_URL` (ex: `postgresql://postgres:postgres@localhost:5432/appdb?schema=public` en local; dans Docker, la valeur est injectée via `compose.yaml`)

## Endpoints principaux

- `GET /health` — liveness/readiness (rapide, sans dépendance DB)
- `POST /api/auth/register` — body `{ email, password }` ; renvoie `{ user, token }`
- `POST /api/auth/login` — body `{ email, password }` ; renvoie `{ user, token }`
- `GET /api/users/me` — protégé (header `Authorization: Bearer <token>`)

Exemples PowerShell:

```powershell
# Register
$body = @{ email="user@example.com"; password="password123" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" -Method Post -ContentType "application/json" -Body $body
# Login
$body = @{ email="user@example.com"; password="password123" } | ConvertTo-Json
$login = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method Post -ContentType "application/json" -Body $body
$token = $login.token

# Me
Invoke-RestMethod -Uri "http://localhost:3000/api/users/me" -Headers @{ Authorization = "Bearer $token" }
```

## Documentation API (Swagger)

Swagger UI est servi à `http://localhost:3000/docs`.
Le schéma OpenAPI minimal est dans `src/docs/openapi.ts`.

## Prisma (v7)

- Fichier de config: `prisma.config.ts` (URL de datasource chargée depuis l’environnement)
- Schéma: `prisma/schema.prisma`
- Migrations: `prisma/migrations/*`

Commandes utiles:

```powershell
# Validation et génération du client
npx prisma validate --config ./prisma.config.ts
npx prisma generate --config ./prisma.config.ts

# Créer/appliquer une migration (dev local)
npx prisma migrate dev --name init --config ./prisma.config.ts

# Appliquer en déploiement (utilisé dans le conteneur server)
npx prisma migrate deploy --config ./prisma.config.ts

# Seed (optionnel)
npx prisma db seed --config ./prisma.config.ts
```

## Scripts NPM

- `dev`: démarrage en développement (watch)
- `build`: compilation TypeScript
- `start`: exécute le serveur compilé
- `test`: tests Jest + Supertest
- `migrate`: migrations Prisma (dev)
- `generate`: régénère le client Prisma
- `seed`: lance le script de seed

## Notes (Windows / bonnes pratiques)

- Sur Windows, privilégiez les volumes nommés Docker pour Postgres (meilleures perfs que les bind mounts NTFS).
- `bcryptjs` évite les soucis de build natif; vous pouvez passer à `bcrypt` si nécessaire.
- En prod, fournissez un `JWT_SECRET` long et stocké de manière sécurisée.
- Le endpoint `/health` est utile pour les probes Docker/Kubernetes et les checks d’uptime.

# Node.js REST API Template (Express + TypeScript + Prisma)

Minimal, reusable starter for a RESTful API with JWT auth and PostgreSQL via Prisma.

## Quick Start

1. Copy `.env.example` to `.env` and adjust values.
2. Install deps:

```powershell
Push-Location "c:\Users\baril\Documents\DEV\projets\NodeJS-setup-back"
npm install
Pop-Location
```

3. Start dev server:

```powershell
npm run dev
```

4. Health check: GET `http://localhost:3000/health`.

## Scripts

- `dev`: start with hot reload
- `build`: compile TypeScript
- `start`: run compiled server
- `test`: run Jest tests
- `migrate`: run Prisma migrations
- `generate`: regenerate Prisma client
- `seed`: run seed script

## Notes

- DB Docker Compose can be added later (`postgres` + named volume). For Windows, prefer named volumes over bind mounts.
- Uses `bcryptjs` to avoid native build issues on Windows; swap to `bcrypt` if you prefer.
