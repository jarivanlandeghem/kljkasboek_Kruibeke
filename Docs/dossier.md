# KLJ Portaal - Projectdossier

## 📋 Studentgegevens

### Student 1: Aykon Kirhan

- **Studentennummer:** 202405274
- **E-mailadres:** <aykon.kirhan@student.hogent.be>
- **Telefoonnummer:** +324 94 67 00 49

### Student 2: Jasper Huyghe

- **Studentennummer:** 202405272
- **E-mailadres:** <jasper.huyghe@student.hogent.be>
- **Telefoonnummer:** +324 99 91 24 05

---

## 🔗 Projectlinks

**GitHub Repository:** <https://github.com/HOGENT-frontendweb/frontendweb-2526-kirhanhuyghe>

**Online Versies:**

- Back-end: <https://frontendweb-2526-kirhanhuyghe-backend.onrender.com/>
- Front-end: <https://portaal.kljsgw.be/>
- Swagger documentatie <https://frontendweb-2526-kirhanhuyghe-backend.onrender.com/docs>

**Demo Video:** <https://hogent.cloud.panopto.eu/Panopto/Pages/Sessions/List.aspx?folderID=8d8e68af-0777-4a29-80be-b3b700fad82a>

---

## 🔐 Logingegevens

| Rol | E-mailadres | Wachtwoord |
|-----|-------------|------------|
| **Admin** | <jasper.huyghe@outlook.be> | hashed_pw_123 |
| **User** | <aykon.kirhan@kljsgw.be> | aykonkirhan |
| **Hoofdleiding** | <lander.leeman@kljsgw.be> | landerleeman |
| **Groepsverantwoordelijke** | <robbe.braem@kljsgw.be> | robbebraem |

---

## 🧐 Testen van de Applicatie

### ⚠️ Belangrijke Opmerking

Render blokkeert uitgaande SMTP-poorten, waardoor de mailfunctie in productie niet werkt. Dit kan wel perfect lokaal getest worden.

Bron: <https://render.com/changelog/free-web-services-will-no-longer-allow-outbound-traffic-to-smtp-ports>

CRON-jobs kunnen niet getest worden aangezien deze niet in de free tier van Render beschikbaar zijn.

### Email Exports Testen

**Voor evaluators (pre-configured):**

- Karine Samyn: <karine.samyn@hogent.be> | karinesamyn
- Andreas De Witte: <andreas.dewitte@hogent.be> | andreasdewitte
- Stappen 2-4 kunnen overgeslagen worden

**Stappen:**

1. Kopieer de .env-gegevens in de backend (gekregen via mail voor nodemailer configuratie)
2. Log in als Jasper Huyghe (<jasper.huyghe@outlook.be> | hashed_pw_123)
3. Maak een gebruiker aan op ../register met uw emailadres en wachtwoord (min. 8 tekens)
4. Klik op "Beheer gebruikers" en maak een nieuwe testaccount als admin
5. Navigeer naar "Transacties" en klik op "PDF rapport"
6. De PDF wordt binnen een minuut bezorgd (controleer ook spamfolder!)

### Ronde/Transacties CSV-Import Testen

De CSV-testbestanden bevinden zich in: `Docs/testbestanden`

**Stappen:**

1. Importeer het bestand voor leden bij "Leden"
2. Importeer het bestand voor leiding bij "Leiding"
3. Klik op de verwerkingsknop (verwerking kan even duren)

**💡 Tip:** Op het transactiescherm kunnen headers geklikt worden om de sortering te testen!

### Lokale Omgeving

Zie instructies hierboven en in de projectdocumentatie.

---

## 📖 Projectbeschrijving

Het KLJ Portaal biedt verschillende oplossingen en automatisaties voor problemen waar KLJ-afdelingen en soortgelijke verenigingen dagelijks mee te maken krijgen.

### Functionaliteiten

#### 🔑 Login & Authenticatie

- **Inloggen** via JWT-tokens
- **Login aanvragen** - Alleen admins kunnen handmatig logins aanmaken. Gebruikers vragen inloggegevens aan en ontvangen een bevestigingsmail

#### 💰 Transacties

- Manueel toevoegen of aanpassen van transacties
- Importeren van transacties uit CSV-bestand
- Sorteren van tabel op datum
- PDF-rapport genereren en per mail versturen (gesorteerd op categorieën)

#### 📊 Categorieën

- Categorie selecteren per transactie
- Grafische overzichten van alle categorieën
- Tabel-overzicht per categorie (inkomsten vs. uitgaven)
- Nuttige grafieken per categorie
- Optie om categorieën aan te maken/verwijderen

#### 👥 Leiding

- Overzicht van alle leidinggevenden
- Toevoegen, wijzigen of verwijderen van leiding (alleen admins)

#### ✅ Aanwezigheden

- Lijst van aankomende evenementen, activiteiten en vergaderingen
- Aanwezigheid toevoegen/aanpassen
- Evenementen toevoegen, wijzigen of verwijderen (alleen admins, hoofdleiding of groepsverantwoordelijken)
- Overzicht van alle aanwezigheiden
- Aanwezigheden als PDF per mail versturen (alleen bevoegden)
- **Automatische Reminders:**
  - 7 dagen vóór event: herinnering naar leidinggevenden
  - 4 dagen vóór event: alert naar hoofdleiding als geen antwoord
  - Alert naar groepsverantwoordelijken als onvoldoende mankracht

#### 🗺️ Ronde Maken

*Automatisering van jaarlijkse inschrijfrondes waarbij leiding huizen bezoeken.*

- Ronde een naam geven
- Leden- en leidinglijst importeren via CSV
- Algoritme berekent optimale route (kortste afstand)
- Overzicht per leidinggevende met:
  - Toegewezen huizen
  - Bewonersgegevens per adres
  - Google Maps link naar elk adres

#### 💳 Kasjes (Leeftijdsbudgetten)

- Jaarbudget aanpassen per leeftijdsgroep (alleen admin/hoofdleiding)
- Budget-overzicht per leeftijdsgroep
- Overzicht van recente transacties per groep

#### 👤 Profielpagina

- Wachtwoord wijzigen
- Gebruikersrollen beheren (alleen admin)

#### 🚪 Logout

- Simpele logout-pagina

#### ➕ Gebruiker Toevoegen

- Alleen admins kunnen nieuwe gebruikers aanmaken

---

## 🌳 Entity-Relationship Diagram (ERD)

![ERD](./KLJPORTAAL_ERD.png)

### Schema-Uitleg

#### 1. Kasboekhouding (Transacties & Categorieën)

Transacties vertegenwoordigen geld in- en uitgaande (inkomsten/uitgaven). Via de Transactie_Categorie join-tabel kunnen transacties in meerdere categorieën ingedeeld worden.

#### 2. Evenementen & Aanwezigheid

Evenementen zijn activiteiten, vergaderingen en uitstappen. De Aanwezigheid-tabel koppelt gebruikers aan evenementen met status (aanwezig/afwezig) en optionele aangepaste tijden.

#### 3. Ronde-Verdeling

**Ronde_Leiding:** Leidinggevenden met startpunt en coördinaten
**Ronde_Huizen:** Alle adressen in de wijk met coördinaten
**Ronde_Bewoners:** Bewonersgegevens per huis

Het algoritme berekent de optimale verdeling op basis van afstand.

#### 4. Kasjes (Groepsbudgetten)

Per leeftijdsgroep (bv. -8, -12, +16) en per jaar wordt het beschikbare budget bijgehouden.

#### 5. Samenhang

- **Users** zijn centraal: maken transacties aan, worden ingedeeld in rondes, registreren aanwezigheid
- **Leiding_Profiel** geeft extra info: telefoonnummer, leeftijdsgroep, functies
- **Rondes** zijn tijdelijk en project-gebonden
- **Kasjes** zijn permanent en jaarlijks

---

## ✅ Ontvankelijkheidscriteria

- ✅ Het project van **Web Services** voldoet aan alle ontvankelijkheidscriteria
- ✅ Het project van **Front-end Web Development** voldoet aan alle ontvankelijkheidscriteria

**Opmerking:** In overleg met meneer De Witte, om de demo korter te houden dan 15 minuten hebben we geen edge cases getest en hebben we de endpoints die in de frontend zichtbaar waren niet meer in postman getest. Ook hebben we de 'waarom' bij het gebruiken van de extra's visueel toegelicht maar niet uitgebreid besproken.

---

## 🚀 Extra Technologieën

### Front-end Web Development

| Technologie | Doel |
|------------|------|
| **[Material-UI](https://mui.com/material-ui/)** | Visuele upgrade, avatar, datepicker, iconen, custom forms & dialogs |
| **[dayjs](https://www.npmjs.com/package/dayjs)** | Datumsverwerking (dependency van MUI Datepicker) |
| **[TanStack Table](https://tanstack.com/table/latest)** | Geavanceerde tabel-functionaliteit met sortering (anders dan standaard React) |
| **[Chart.js](https://www.npmjs.com/package/chart.js)** | Visualisatie kasjes en categorieën |
| **[react-chartjs-2](https://react-chartjs-2.js.org/)** | React-componenten voor Chart.js |
| **[Framer Motion](https://www.npmjs.com/package/framer-motion)** | Animaties voor paginaladen en grafieken |
| **[react-csv-importer](https://www.npmjs.com/package/react-csv-importer)** | CSV-import functionaliteit |
| **[papaparse](https://www.npmjs.com/package/papaparse)** | CSV-parsing (dependency van react-csv-importer) |

### Web Services

| Technologie | Doel |
|------------|------|
| **[@faker-js/faker](https://www.npmjs.com/package/@faker-js/faker)** | Testdata generatie |
| **[nodemailer](https://nodemailer.com/)** | Email-functionaliteit (PDF-verstuur, aanvragen, reminders) |
| **[pdfkit](https://www.npmjs.com/package/pdfkit)** | PDF-rapporten genereren |

---

## 🤔 Reflectie

### Aykon Kirhan

#### Wat heb ik geleerd?

Tijdens het project heb ik veel nieuwe technologieën ontdekt. Het was leerrijk om niet alleen les-materiaal toe te passen, maar ook zelf libraries te mogen kiezen. Ik heb geleerd dat er enorm veel mogelijkheden zijn via libraries, en heb goede kennis opgedaan van pnpm-commando's.

#### Wat vond ik goed?

Ik was aangenaam verrast door wat we hebben bereikt. Het project is veel uitgebreider en professioneler dan verwacht. De UI/UX is gebruiksvriendelijk en de code is van hoge kwaliteit.

#### Wat zou ik anders doen?

Eerst een beter plan opstellen met alle benodigde functies en pagina's voordat ik begin met ontwerp en programmering.

#### Wat waren de grootste uitdagingen?

De hoeveelheid keren dat pagina's of functies braken na het toevoegen van nieuwe code. Cypress-testen werkten perfect, maar een week later werkte nog maar de helft.

#### Wat zou ik behouden?

De cursusopbouw met duidelijke inhoudsopgave en goed opgestelde commando's.

#### Wat zou ik toevoegen/aanpassen?

Grote blokken uitleg opdelen in kleinere stukjes met voorbeelden ertussen. Lange alinea's zijn moeilijk om te onthouden.

---

### Jasper Huyghe

#### Wat heb ik geleerd?

Veel hebben geleerd over routing, beveiliging, en hoe libraries als puzzelstukjes kunnen werken om de applicatie naar een hoger niveau te tillen.

#### Wat vond ik goed?

De applicatie ziet er modern en professioneel uit. Met name enkele geavanceerde algoritmes in de backend ben ik trots op.

#### Wat zou ik anders doen?

Meer naar het "grote plaatje" kijken in plaats van heel hard op één functie te focussen.

#### Wat waren de grootste uitdagingen?

Het CSV-bestandsformat van KBC Touch is slecht opgebouwd. Zorgen dat de applicatie dit zonder conversie kan lezen was zeer uitdagend.

#### Wat zou ik behouden?

De cursusopbouw en voorgekauwde code zijn top!

#### Wat zou ik toevoegen/aanpassen?

Minder grote tekstblokken. Beter gedocumenteerde code met comments in plaats van beschrijvende pijltjes.

---

### Reflectie Groepswerk

#### Samenwerking

Aykon en Jasper werken sinds het zesde middelbaar samen. Ze zijn goed op elkaar ingespeeld en kunnen elkaars tekortkomingen opvullen.

#### Bijdrage - Jasper

- ✅ **Evenveel bijgedragen als groepsgenoot**

Hoewel Jasper meer commits en coderegels heeft, is de bijdrage ongeveer 50/50. Veel complexe problemen, ideeën en designs werden samen achter de schermen uitgewerkt.

#### Bijdrage - Aykon

- ✅ **Evenveel bijgedragen als groepsgenoot**

Jasper heeft meer commits en coderegels geschreven, maar beiden hebben evenveel bijgedragen aan het succes van het project.

---

## 📋 Implementaties per Groepsgenoot

### Web Services

| Functionaliteit | Jasper | Aykon | Beide |
|---|:---:|:---:|:---:|
| **Login / Authenticatie** | ✅ JWT, guards, decorators | ✅ Bugfix, token-vervallen | |
| **Transacties CRUD** | ✅ Service, DTOs, controllers | ✅ Async refactoring, getById | |
| **CSV-import logica** | ✅ | ✅ KBC-formaat | ✅ |
| **Dubbele transactie check** | ✅ | | |
| **Categorieën CRUD** | ✅ Schema, service, endpoints | ✅ Categoriekeuze, join-logica | ✅ |
| **Gebruikers & Rollen** | ✅ Rol-based access, guards | ✅ Datagebruikers, Swagger | ✅ |
| **Kasjes / Budgets** | ✅ DB schema, seeding | | |
| **Mailfunctionaliteit** | ✅ Nodemailer | | |
| **Logging & Error Handling** | ✅ Global filters | | |
| **Database & ORM** | ✅ Drizzle, MySQL, Docker | | |
| **Registratie** | ✅ Hashing, default role | | |
| **Email Reminders** | ✅ | | |
| **PDF Exports** | ✅ | ✅ | ✅ |
| **CI/CD** | ✅ | | |
| **Testing** | | ✅ | |

### Front-end Web Development

| Functionaliteit | Jasper | Aykon | Beide |
|---|:---:|:---:|:---:|
| **Login / Authenticatie** | ✅ Auth context, JWT | ✅ Login-bugfix, logout | ✅ |
| **Transacties - Manueel** | ✅ Dialog, forms | ✅ Edit-popup werkend | ✅ |
| **Transacties - CSV-import** | ✅ Import-logica | ✅ CSV-fix | ✅ |
| **Transacties - Sorteren** | | ✅ | |
| **Transacties - PDF & Mail** | ✅ Rapport-opmaak | | |
| **Categorieën - Selectie** | ✅ | ✅ Dropdown-fix | ✅ |
| **Categorieën - Tabel** | | ✅ Kolommen verwijderd | |
| **Categorieën - CRUD** | ✅ Frontend-integratie | | |
| **Leiding - Overzicht & CRUD** | ✅ Pagina, admin-knop | | |
| **Aanwezigheden - Overzicht** | ✅ Frontend OK | | |
| **Aanwezigheden - Beheer** | ✅ | | |
| **Kasjes / Budgets** | ✅ Volledige UI, chart | | |
| **Profielpagina** | ✅ Wachtwoord, rollen | | |
| **Responsiveness** | ✅ | ✅ Layout, menu | ✅ |
| **Dark Mode** | ✅ | ✅ | ✅ (verwijderd) |
| **Routing & Navigatie** | ✅ | ✅ React Router | ✅ |
| **Gebruiker Toevoegen** | ✅ Admin-knop | | |
| **CI/CD** | ✅ | | |
| **Testing** | | ✅ | |

---

*Dossier opgesteld door Aykon Kirhan en Jasper Huyghe*
