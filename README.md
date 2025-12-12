# Examenopdracht Front-end Web Development & Web Services

- Student: Aykon Kirhan
- Studentennummer: 202405274
- E-mailadres: <aykon.kirhan@student.hogent.be>

- Student: Jasper Huyghe
- Studentennummer: 202405272
- E-mailadres: <jasper.huyghe@student.hogent.be>

## Vereisten

Om dit project te kunnen draaien, moet je volgende software geïnstalleerd hebben:

- [NodeJS](https://nodejs.org) (versie ≥18)
- [pnpm](https://pnpm.io)
- [MySQL Community Server](https://dev.mysql.com/downloads/mysql/)

Aanbevolen versies

- **Node.js:** LTS (bijv. 18.x of 20.x)
- **pnpm:** recente versie (installeer globaal via `npm install -g pnpm`)

## Front-end

### Setup

1. Installeer de dependencies:

```bash
cd kirhanhuyghe-frontend
pnpm install
```

2. Maak een `.env`-bestand in de root van het frontend-project met de volgende inhoud:

```env
VITE_API_URL=http://localhost:3000/api
```

> Dit wijst de frontend naar de lokale backend.

### Opstarten

#### Development

```bash
cd kirhanhuyghe-frontend
pnpm run dev
```

- Zorg dat het `.env` bestand aanwezig is en correct ingesteld.
- De app is standaard beschikbaar op [http://localhost:5173](http://localhost:5173).

#### Production

```bash
pnpm run build
pnpm run preview
```

- Build de applicatie met `vite build`.
- Preview met `vite preview` of host de bestanden in `dist` via een server.

### Testen

1. Voer het volgende commando uit in je frontend map

```bash
cd kirhanhuyghe-frontend
pnpm test
```

2. Selecteer een van de testen. De testen worden dan automatisch uitgevoerd.

## Back-end

### Setup

1. Installeer de dependencies:

```bash
cd kirhanhuyghe-backend
pnpm install
```

2. Maak een `.env`-bestand in de root van het backend-project met de volgende inhoud:

```env
NODE_ENV=development
PORT=3000
CORS_ORIGINS=["http://localhost:5173"]
CORS_MAX_AGE=10800
DATABASE_URL=mysql://devusr:devpwd@localhost:3307/kirhanhuyghe
LOG_LEVELS=["log","error","warn","debug"]
AUTH_JWT_SECRET=eensuperveiligsecretvoorindevelopment 
GOOGLE_CLIENT_ID=vul_hier_jouw_client_id_in
GOOGLE_CLIENT_SECRET=vul_hier_jouw_client_secret_in
GOOGLE_REFRESH_TOKEN=vul_hier_jouw_refresh_token_in
```

> Pas indien nodig de `DATABASE_URL` aan voor jouw MySQL-configuratie.
>
> De mailservice werkt met Google OAuth 2.0. Omdat deze tokens je volledige toegang geven tot een Google account zetten wij dit niet in de readme. Zoals afgesproken krijgen deze lectors deze opgestuurd via mail.
> [OAuth 2.0 opzetten]((https://developers.google.com/identity/protocols/oauth2))
>
> In een echte omgeving wordt de JWT-secret uiteraard niet gedeeld. In deze leeromgeving werd afgesproken om dit wel te doen.

### Development

1. Voer databank migraties uit:

```bash

# Ga naar backend map (indien nog niet gedaan)
cd kirhanhuyghe-backend
# Start eerst de database (zie Docker sectie hieronder) of zorg dat je MySQL bereikbaar is
pnpm run db:migrate
# Optional: vul de database met voorbeelddata
pnpm run db:seed
```

2. Start de backend:

```bash
pnpm run start:dev
```

- De backend is standaard beschikbaar op [http://localhost:3000](http://localhost:3000).

### Docker (database via Docker Compose)

Het backend-project bevat een `docker-compose.yml` die een MySQL-container start. Gebruik Docker Compose om snel een lokale database te draaien voor development of tests.

- Ga naar de backend map:

```bash
cd kirhanhuyghe-backend
```

- Start de database:

```bash
docker compose up -d
```

- Stop en verwijder containers:

```bash
docker compose down
```

#### Test-database

Er is ook een `docker-compose.test.yml` aanwezig die een aparte MySQL-instance voor de testen start. Gebruik deze wanneer je de testomgeving wil opzetten:

```bash
docker compose -f docker-compose.test.yml up
```

Opmerkingen / tip

- Na het opstarten van de database kun je lokaal de migraties uitvoeren zodat de schema's worden aangemaakt:

```bash
c:\# vanuit project root of waar je zit, ga naar backend en run migraties:
cd kirhanhuyghe-backend
pnpm run db:migrate
```

- Als de backend nog niet in een container draait, draait de app lokaal (via `pnpm run start:dev`) en praat die met de DB-container via `localhost:3307`.

### Snelcheck & Troubleshooting

- Controleer dat de API bereikbaar is (voorbeeld):

```powershell
Invoke-RestMethod -Uri http://localhost:3000/api/aanwezigheden/event/30
# of via curl
curl http://localhost:3000/api/aanwezigheden/event/30
```

- Als bovenstaande call data teruggeeft maar de frontend geen data toont:
  - Controleer `VITE_API_URL` in `kirhanhuyghe-frontend/.env` (moet `http://localhost:3000/api` zijn)
  - Open browser DevTools → Network → bekijk de response body van het verzoek naar `/aanwezigheden/event/:id`
  - Controleer CORS-instellingen (`CORS_ORIGINS`) in backend `.env` bevat `http://localhost:5173`

- Zorg dat je migraties en seed uitvoert na het starten van de DB, anders zijn tabellen mogelijk leeg (geen users/events).

- Mailfunctionaliteit: vereist Google OAuth-gegevens. Als die ontbreken, werkt mail niet maar de rest van de applicatie draait wel.

### Voorbeeldcommando - volledige start (development)

```powershell
# 1) start DB (in backend folder) - zorgt voor database op poort 3307
cd kirhanhuyghe-backend; docker compose up -d

# 2) backend: install, migraties, seed en start
cd kirhanhuyghe-backend; pnpm install; pnpm run db:migrate; pnpm run db:seed; pnpm run start:dev

# 3) frontend: install en start
cd kirhanhuyghe-frontend; pnpm install; pnpm run dev
```

### Production

1. Installeer dependencies:

```bash
pnpm install
```

2. Build de applicatie:

```bash
pnpm run build
```

3. Deploy migraties:

```bash

pnpm run db:migrate
```

4. Start de productieversie:

```bash
node dist/main.js
```

### Testen

1. Zorg dat `.env.test` aanwezig is met test-configuratie.
2. Installeer dependencies:

```bash
pnpm install
```

3. Voer migraties uit voor testdatabase:

```bash
pnpm run migrate:test
```

4. Start de testen:

```bash
pnpm run test:jest
```

5. Voor coverage:

```bash
pnpm run test:cov
```

- Coverage-rapport wordt aangemaakt in `__tests__/coverage`. Open `index.html` in de browser om het te bekijken.

---
