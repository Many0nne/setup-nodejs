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

# NodeJS-setup-back

Ce dépôt contient le service backend du projet : une API Express en TypeScript avec authentification JWT, PostgreSQL via Prisma, et des outils pour le développement et le déploiement (Docker, logs, validation, documentation API).

## Présentation

- **Framework** : Express avec TypeScript
- **ORM** : Prisma (v7) configuré via `prisma.config.ts`
- **Authentification** : JWT (tokens d'accès), hachage des mots de passe avec `bcryptjs`
- **Validation** : `zod` pour la validation des requêtes
- **Sécurité** : Helmet, CORS, HPP, limitation de débit sur les routes d'authentification
- **Journalisation** : `pino`
- **Docs API** : OpenAPI/Swagger servi sur `/docs`

## Fonctionnalités

- Enregistrement et connexion des utilisateurs avec tokens JWT
- Support des refresh tokens (voir `src/repositories/refresh-token.repository.ts`)
- Routes protégées (ex. : `GET /api/users/me`)
- Migrations et seed de la base via Prisma
- Endpoint de vérification d'état à `/health`

## Démarrage (local)

1. Copier les variables d'environnement :

```
copy .env.example .env
```

2. Installer les dépendances :

```
npm install
```

3. Lancer le serveur en développement (rechargement à chaud) :

```
npm run dev
```

4. Vérifier que le service répond :

```
GET http://localhost:3000/health
```

## Exécution avec Docker (recommandé pour un environnement reproductible)

Le projet inclut `compose.yaml` pour une pile multi-conteneurs (Postgres, Adminer, serveur API).

Pour construire et démarrer les services :

```
docker compose up -d --build
```

Pour arrêter et supprimer les conteneurs (et les volumes si souhaité) :

```
docker compose down -v
```

Adminer (interface web pour la DB) est accessible sur `http://localhost:8080` avec la configuration de compose fournie.

Valeurs par défaut injectées par `compose` (si non modifiées) :

- Hôte : `postgres`
- Utilisateur : `postgres`
- Mot de passe : `postgres`
- Base : `appdb`

## Variables d'environnement importantes

- `NODE_ENV` (par défaut : `development`)
- `PORT` (par défaut : `3000`)
- `DATABASE_URL` (chaîne de connexion Prisma)
- `JWT_SECRET` (secret pour signer les tokens)
- `BCRYPT_SALT_ROUNDS` (par défaut : `10`)

Ne stockez pas les secrets de production dans le dépôt. Utilisez un gestionnaire de secrets ou injectez-les via CI/CD.

## Endpoints principaux

- `GET /health` — vérification d'état
- `POST /api/auth/register` — enregistrement (body : `{ email, password }`)
- `POST /api/auth/login` — authentification (body : `{ email, password }`)
- `GET /api/users/me` — route protégée retournant l'utilisateur courant (header `Authorization: Bearer <token>`)

Consultez `src/routes` et `src/controllers` pour les implémentations et les formats attendus.

## Prisma

- Schéma : `prisma/schema.prisma`
- Configuration : `prisma.config.ts`
- Migrations : `prisma/migrations/`

Commandes utiles :

```
npx prisma validate --config ./prisma.config.ts
npx prisma generate --config ./prisma.config.ts
npx prisma migrate dev --name <name> --config ./prisma.config.ts
npx prisma migrate deploy --config ./prisma.config.ts
npx prisma db seed --config ./prisma.config.ts
```

## Tests

- Les tests unitaires et d'intégration utilisent Jest. Lancer :

```
npm test
```

Les tests d'intégration peuvent nécessiter une base de test ; consultez `jest.config.cjs` pour les détails.

## Notes pour le développement

- Sur Windows, `bcryptjs` évite les problèmes de compilation native ; passez à `bcrypt` si vous souhaitez les performances natives et gérer la compilation dans CI.
- Assurez-vous que `JWT_SECRET` est suffisamment fort en production et prévoyez une stratégie de rotation.
- La route `/docs` expose l'UI OpenAPI ; mettez à jour `src/docs/openapi.ts` lorsque vous ajoutez des endpoints.

## Contribuer

- Créez des branches de fonctionnalité depuis `main`.
- Ajoutez ou modifiez les migrations Prisma dans `prisma/migrations`.
- Ajoutez des tests pour les nouveaux comportements et assurez-vous que `npm test` passe.

## Où regarder dans le code

- Démarrage du serveur : `src/server.ts`
- Configuration de l'application : `src/app.ts` et `src/config`
- Logique d'auth : `src/controllers/auth.controller.ts` et `src/services/auth.service.ts`
- Répertoire/service utilisateur : `src/repositories/user.repository.ts` et `src/services/user.service.ts`

---

Ce backend est conçu pour être utilisé avec un client frontend séparé (voir `React-setup-front` dans l'espace de travail). Il propose une API axée sur l'authentification, adaptée aux démonstrations et comme point de départ pour des projets de production.
