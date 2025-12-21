### Construire et lancer l’application

Quand vous êtes prêt, lancez:
`docker compose up --build`.

Votre application sera disponible sur http://localhost:3000.

Le service `server` applique automatiquement les migrations Prisma (`prisma migrate deploy`) au démarrage, puis lance l’API. Le service `postgres` utilise un volume nommé `pg-data` pour persister les données.

Adminer (interface BD): http://localhost:8080

- Type: PostgreSQL
- Hôte: `postgres` | Utilisateur: `postgres` | Mot de passe: `postgres` | Base: `appdb`

### Déployer dans le cloud

Construire l’image:
`docker build -t myapp .`

Si l’architecture CPU du cloud diffère (ex: Mac M1 vs amd64), construisez pour la bonne plateforme:
`docker build --platform=linux/amd64 -t myapp .`.

Puis poussez-la vers votre registre:
`docker push myregistry.com/myapp`.

Voir la Documentation « Getting started » de Docker pour plus de détails: https://docs.docker.com/go/get-started-sharing/

### Références

- Guide Node.js de Docker: https://docs.docker.com/language/nodejs/
