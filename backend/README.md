# Backend - ProjetSpe4

## 📋 Table des matières

- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration des variables d'environnement](#configuration-des-variables-denvironnement)
- [Lancer MinIO](#lancer-minio)
- [Lancer l'application](#lancer-lapplication)
- [Commandes disponibles](#commandes-disponibles)
- [Base de données](#base-de-données)
- [Architecture](#architecture-du-projet)
- [Troubleshooting](#-troubleshooting)

---

## 🔧 Prérequis

Avant de commencer, assurez-vous d'avoir installé sur votre machine :

- **Node.js** (version 18.0.0 ou supérieure) - [Télécharger](https://nodejs.org/)
- **npm** (inclus avec Node.js) ou **yarn**
- **Docker** (pour MinIO et/ou MySQL) - [Télécharger](https://www.docker.com/products/docker-desktop)
- **MySQL** (version 8.0 ou supérieure) - [Télécharger](https://www.mysql.com/downloads/)
  - Ou utilisez Docker pour MySQL

---

## 📦 Installation

### 1. Cloner le repository

```bash
git clone <repository-url>
cd projet-spe-dev-4/backend
```

### 2. Installer les dépendances

```bash
npm install
```

Ou avec yarn :
```bash
yarn install
```

---

## 🔐 Configuration des variables d'environnement

Créez un fichier `.env` à la racine du répertoire `backend` :

```bash
cp .env.example .env  # Si le fichier existe
# Sinon, créez un nouveau fichier .env
```

Remplissez le fichier `.env` avec les variables suivantes :

```env
# Base de données MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_user
DB_PASS=your_password
DB_NAME=livecampus

# JWT (Token d'authentification)
JWT_SECRET=your_secret_key_here_change_this_in_production

# MinIO (stockage d'objets)
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=your_user
MINIO_SECRET_KEY=your_password
MINIO_BUCKET_NAME=your_bucket_name
```

---

## 🚀 Lancer MinIO

MinIO est un service de stockage d'objets compatible S3. Il est utilisé pour stocker les documents et fichiers. Vous avez deux options :

### Avec Docker

```bash
docker run -p 9000:9000 -p 9001:9001 \
  -e MINIO_ROOT_USER=your_user \
  -e MINIO_ROOT_PASSWORD=your_password \
  minio/minio server /data --console-address ":9001"
```

Cela lancera :
- **MinIO API** sur `http://localhost:9000`
- **MinIO Console** (interface web) sur `http://localhost:9001`

Pour arrêter MinIO :
```bash
docker stop <container_id>
# Trouvez l'ID du conteneur avec: docker ps
```
---
### Créer un bucket dans MinIO

1. Accédez à `http://localhost:9001`
2. Connectez-vous avec :
   - **Username** : `minioadmin`
   - **Password** : `minioadmin`
3. Cliquez sur le **+** pour créer un nouveau bucket
4. Nommez-le `documents`
5. Créez-le

---

## 🗄️ Base de données

### Configuration MySQL avec Docker

Si vous n'avez pas MySQL installé localement, vous pouvez utiliser Docker :

```bash
docker run --name mysql-livecampus \
  -e MYSQL_ROOT_PASSWORD=root_password \
  -e MYSQL_DATABASE=livecampus \
  -e MYSQL_USER=livecampus_user \
  -e MYSQL_PASSWORD=livecampus_password \
  -p 3306:3306 \
  -d mysql:8.0
```

Mettez à jour votre `.env` :
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=livecampus_user
DB_PASS=livecampus_password
DB_NAME=livecampus
```

### Exécuter les migrations

Avant de lancer l'application, créez les tables :

```bash
npm run migration:run
```

Pour générer une nouvelle migration :
```bash
npm run migration:generate -- --name NameOfMigration
```

Pour revenir à la migration précédente :
```bash
npm run migration:revert
```

---

## 🎯 Lancer l'application

### Démarrage rapide (développement)

1. **Configurez `.env`** (voir [Configuration](#configuration-des-variables-denvironnement))
2. **Lancez MinIO et MySQL** (voir ci-dessus)
3. **Installez les dépendances** :
   ```bash
   npm install
   ```
4. **Exécutez les migrations** :
   ```bash
   npm run migration:run
   ```
5. **Lancez l'application** :
   ```bash
   npm run start:dev
   ```

L'application sera disponible à `http://localhost:3000`

### Mode développement (avec rechargement automatique)

```bash
npm run start:dev
```

L'application se relance automatiquement à chaque changement de fichier.

### Mode production (compilation optimisée)

```bash
npm run build
npm run start:prod
```

### Mode debug (avec inspecteur Node.js)

```bash
npm run start:debug
```

Connectez-vous via le debugger de votre IDE (VSCode, WebStorm, etc.)

---

## 📝 Commandes disponibles

### Développement

| Commande | Description |
|----------|-------------|
| `npm run start:dev` | Lance l'application en mode développement avec rechargement automatique |
| `npm run start:debug` | Lance l'application en mode debug avec inspecteur Node.js |
| `npm run build` | Compile le projet TypeScript en JavaScript |

### Production

| Commande | Description |
|----------|-------------|
| `npm run start:prod` | Lance l'application compilée en production |

### Tests

| Commande | Description |
|----------|-------------|
| `npm test` | Exécute tous les tests |
| `npm run test:watch` | Lance les tests en mode observateur |
| `npm run test:cov` | Génère un rapport de couverture de tests |
| `npm run test:e2e` | Exécute les tests end-to-end |

### Code Quality

| Commande | Description |
|----------|-------------|
| `npm run lint` | Corrige les problèmes ESLint |
| `npm run format` | Formate le code avec Prettier |

### Base de données

| Commande | Description |
|----------|-------------|
| `npm run migration:generate -- --name MigrationName` | Génère une nouvelle migration |
| `npm run migration:run` | Exécute les migrations en attente |
| `npm run migration:revert` | Annule la dernière migration |

---

## 🏗️ Architecture du projet

```
backend/
├── src/
│   ├── app.controller.ts          # Contrôleur principal
│   ├── app.module.ts              # Module racine
│   ├── app.service.ts             # Service principal
│   ├── configuration.ts           # Configuration des variables d'env
│   ├── database/
│   │   ├── data-source.ts         # Configuration TypeORM
│   │   └── migrations/            # Migrations de base de données
│   ├── documents/                 # Module pour la gestion des documents
│   │   ├── controllers/           # Contrôleurs
│   │   ├── services/              # Services métier
│   │   ├── models/                # DTOs et entités
│   │   └── documents.module.ts    # Configuration du module
│   └── ...
├── test/                          # Tests e2e
├── .env                           # Variables d'environnement
├── package.json                   # Dépendances du projet
├── tsconfig.json                  # Configuration TypeScript
└── README.md                      # Ce fichier
```

---

## 🐛 Troubleshooting

### Erreur : "Cannot find module '@nestjs/core'"

**Solution** :
```bash
npm install
```

Assurez-vous que vous êtes dans le répertoire `/backend`.

### Erreur : "ECONNREFUSED" pour la base de données

**Vérifiez que** :
- MySQL est en cours d'exécution : `docker ps`
- Les paramètres `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS` sont corrects dans `.env`
- La base de données `livecampus` existe

**Solution rapide** :
```bash
docker ps  # Vérifier si MySQL est actif
docker logs mysql-livecampus  # Voir les logs si une erreur
```

### Erreur : "MinIO connection refused" ou "getaddrinfo ENOTFOUND"

**Vérifiez que** :
- MinIO est en cours d'exécution : `docker ps`
- `MINIO_ENDPOINT` est correct dans `.env` (généralement `localhost:9000`)
- Les clés d'accès MinIO sont correctes
- Le bucket `documents` existe dans MinIO

**Solution rapide** :
```bash
docker ps  # Vérifier si MinIO est actif
# Accédez à http://localhost:9001 pour vérifier l'interface
```

### Erreur de migration TypeORM : "TypeORM error"

**Assurez-vous que** :
- Le projet est compilé : `npm run build`
- Les migrations existent : `ls src/database/migrations/`
- La base de données est accessible

**Solution** :
```bash
npm run build
npm run migration:run
```

### Port 3000 déjà utilisé

**Solution** :
```bash
# Trouvez le processus utilisant le port 3000
lsof -i :3000

# Tuez le processus (remplacez PID par l'ID du processus)
kill -9 <PID>

# Ou changez le port en modifiant configuration.ts
```

### Problème de permissions sur les fichiers

```bash
# Donnez les permissions nécessaires
chmod -R 755 backend/
npm install
```

---

## 📚 Ressources

- [Documentation NestJS](https://docs.nestjs.com/)
- [Documentation TypeORM](https://typeorm.io/)
- [Documentation MinIO](https://docs.min.io/)
- [Documentation MySQL](https://dev.mysql.com/doc/)
- [Docker Documentation](https://docs.docker.com/)

---

## ✅ Checklist de démarrage

- [ ] Node.js et npm installés
- [ ] MySQL installé ou lancé avec Docker
- [ ] MinIO lancé avec Docker
- [ ] Dépendances installées (`npm install`)
- [ ] Fichier `.env` configuré avec les bonnes variables
- [ ] Migrations exécutées (`npm run migration:run`)
- [ ] Bucket `documents` créé dans MinIO
- [ ] Application lancée (`npm run start:dev`)
- [ ] Application accessible sur `http://localhost:3000`

---