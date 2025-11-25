# Examenopdracht Front-end Web Development & Web Services

- Student: Aykon Kirhan
- Studentennummer: 202405274
- E-mailadres: <aykon.kirhan@student.hogent.be>

- Student: Jasper Huyghe
- Studentennummer: xxxxxxxxx TODO
- E-mailadres: <voornaam.naam@student.hogent.be>

## Vereisten

Om dit project te kunnen draaien, moet je volgende software geïnstalleerd hebben:

- [NodeJS](https://nodejs.org) (versie ≥18)
- [pnpm](https://pnpm.io)
- [MySQL Community Server](https://dev.mysql.com/downloads/mysql/)

## Front-end

### Setup

1. Installeer de dependencies:

```bash
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

- TODO

---

## Back-end

### Setup

1. Installeer de dependencies:

```bash
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
TODO bij ons zit dit opgedeeld.. mag dit??

### Development

1. Voer databank migraties uit:

```bash

pnpm run db:migrate
```

2. Start de backend:

```bash
pnpm run start:dev
```

- De backend is standaard beschikbaar op [http://localhost:3000](http://localhost:3000).

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
