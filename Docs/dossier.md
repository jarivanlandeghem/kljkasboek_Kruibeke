# Dossier

> **Instructies:**
>
> - Vul dit dossier volledig in en zorg ervoor dat alle links correct zijn
> - In het geval je slechts één olod volgt, verwijder alle inhoud omtrent het andere olod uit dit document
> - Lees [Markdown Cheatsheet](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet) om te weten hoe een Markdown-bestand opgemaakt moet worden
> - Verwijder alle instructies (lijnen die starten met >) wanneer je klaar bent

## 📋 Studentgegevens

- **Student:** Aykon Kirhan
- **Studentennummer:** 202405274
- **E-mailadres:** <aykon.kirhan@student.hogent.be>
- **GitHub repository:** <https://github.com/HOGENT-frontendweb/frontendweb-2526-kirhanhuyghe>
- **Online versies:**
  - **Back-end:** <LINK_NAAR_ONLINE_BACKEND>
  - **Front-end:** <LINK_NAAR_ONLINE_FRONTEND>
- **Demo:** <LINK_NAAR_DEMO_VIDEO>

## 🔐 Logingegevens

> **Instructies:**
>
> - Vul de logingegevens in voor test accounts.
> - Zorg ervoor dat deze accounts representatieve data bevatten.
> - Voeg hieronder eventueel extra accounts toe voor administrators of andere rollen.

### Lokale omgeving

- **E-mailadres**: <test@example.com>
- **Wachtwoord**: testpassword
- **Rol**: admin/user

### Online omgeving

- **E-mailadres**: <test@example.com>
- **Wachtwoord**: testpassword
- **Rol**: admin/user

## 📖 Projectbeschrijving

> **Instructie:** Beschrijf hier duidelijk en beknopt waarover jouw project gaat. Wat is het doel? Wie is de doelgroep? Welke functionaliteiten biedt het?

Het kasboek is een programma waar je alle uitgaven/inkomsten kunt bijhouden van een vereniging. Deze kan je dan in categorieën steken en zo per categorie kijken wat het verschil is.

Functionaliteiten:
Lijst van alle uitgaven/inkomsten
Huidig saldo
Mededeling, datum, .. (zie excel)
Met filters
2 categorieën
Per categorie bekijken (en kunnen filteren)
Mogelijkheid om toe te voegen/verwijderen
Importeren uit kbc csv
Meerdere mensen toegang geven

>

![ERD]("frontendweb-2526-kirhanhuyghe\Docs\KIRHANHUYGHE_ERD_V1.png")

Vereniging – User: 1 → *

Vereniging – Rekening: 1 → *

User – Transactie: 1 → *

Rekening – Transactie: 1 → *

Transactie – Categorie: *↔* (via TransactieCategorie)

1. Vereniging

Bevat de algemene gegevens van een vereniging (zoals naam en adres).

Een vereniging kan meerdere gebruikers en meerdere rekeningen hebben.

2. User

Gebruikers zijn leden of beheerders van een vereniging.

Elk record bevat o.a. e-mail, naam, wachtwoord en rechtenniveau.

Elke gebruiker behoort tot één vereniging.

Een gebruiker kan meerdere transacties uitvoeren.

3. Rekening

Vertegenwoordigt een bankrekening van een vereniging.

Bevat o.a. het IBAN-nummer, type en naam van de houder.

Elke rekening hoort bij één vereniging maar kan meerdere transacties bevatten.

4. Transactie

Stelt een financiële verrichting voor.

Bevat gegevens zoals beschrijving, bedrag, type (inkomst of uitgave) en verwijzingen naar de rekening en de gebruiker die de transactie uitvoerde.

Eén transactie kan aan meerdere categorieën gekoppeld zijn (via een tussentabel).

5. Categorie

Geeft aan tot welk soort uitgave of inkomst een transactie behoort (bijv. “Lidgeld”, “Materiaal”, “Sponsoring”).

De relatie met transacties verloopt via de koppeltabel TransactieCategorie, omdat één transactie meerdere categorieën kan hebben en omgekeerd.

6. TransactieCategorie (koppeltabel)

Verbindt Transactie en Categorie in een many-to-many-relatie.

Bestaat enkel uit twee foreign keys: transactieID en categorieID.

## ✅ Ontvankelijkheidscriteria

- [ ] Het project van Web Services voldoet aan **alle** ontvankelijkheidscriteria zoals beschreven in de rubrics.
- [ ] Het project van Front-end Web Development voldoet aan **alle** ontvankelijkheidscriteria zoals beschreven in de rubrics.

## 🚀 Extra technologieën

> **Instructie:** Beschrijf welke extra technologieën je hebt gebruikt. Vermeld waarom je deze hebt gekozen.

### Front-end Web Development

- <LINK_NAAR_NPM_PACKAGE>
  - [Reden van keuze]
- ...

### Web Services

- <LINK_NAAR_NPM_PACKAGE>
  - [Reden van keuze]
- ...

## 🤔 Reflectie

> **Instructie:** Reflecteer eerlijk over je leerproces en het project. Dit helpt zowel jezelf als de docenten om de cursus te verbeteren.

**Wat heb je geleerd?**

[Beschrijf je belangrijkste leermoment...]

**Wat vond je goed aan dit project?**

[Positieve aspecten...]

**Wat zou je anders doen?**

[Verbeterpunten voor jezelf...]

**Wat waren de grootste uitdagingen?**

[Moeilijkheden die je bent tegengekomen...]

**Wat zou je behouden aan de cursus?**

[Wat werkt goed...]

**Wat zou je toevoegen/aanpassen?**

[Suggesties voor verbetering...]

### Reflectie groepswerk

> **Instructies:**
>
> - Vul dit eerlijk in, we controleren ook de GitHub contributions en pull requests.
> - Verwijder deze sectie als je alleen hebt gewerkt.

**Hoe verliep het groepswerk?**

> **Instructie:** Vink voor elk groepslid één van de drie opties aan door een 'x' tussen de vierkante haken te plaatsen: `[x]`

- **[Naam student 1]:**

  - [ ] Ik heb minder bijgedragen dan mijn groepsgenoot
  - [ ] Ik heb evenveel bijgedragen als mijn groepsgenoot
  - [ ] Ik heb meer bijgedragen dan mijn groepsgenoot

- **[Naam student 2]:**
  - [ ] Ik heb minder bijgedragen dan mijn groepsgenoot
  - [ ] Ik heb evenveel bijgedragen als mijn groepsgenoot
  - [ ] Ik heb meer bijgedragen dan mijn groepsgenoot

**Welke functionaliteiten heeft elk groepslid toegevoegd voor Web Services?**

> **Instructie:** Geef per persoon een duidelijk overzicht van wat die heeft geïmplementeerd voor het project voor het olod Web Services.

- **[Naam student 1]:**

  - [Bijvoorbeeld: Gebruikersregistratie en login systeem]
  - [Bijvoorbeeld: Dashboard met overzicht functionaliteit]
  - [Bijvoorbeeld: Integratietesten voor product endpoints]

- **[Naam student 2]:**
  - [Bijvoorbeeld: Productcatalogus met zoek- en filterfunctionaliteit]
  - [Bijvoorbeeld: Winkelwagen en checkout proces]
  - [Bijvoorbeeld: Integratietesten voor winkelwagen endpoints]

**Welke functionaliteiten heeft elk groepslid toegevoegd voor Front-end Web Development?**

> **Instructie:** Geef per persoon een duidelijk overzicht van wat die heeft geïmplementeerd voor het project voor het olod Front-end Web Development.

- **[Naam student 1]:**

  - [Bijvoorbeeld: Gebruikersregistratie en login systeem]
  - [Bijvoorbeeld: Dashboard met overzicht functionaliteit]
  - [Bijvoorbeeld: Integratietesten voor product endpoints]

- **[Naam student 2]:**
  - [Bijvoorbeeld: Productcatalogus met zoek- en filterfunctionaliteit]
  - [Bijvoorbeeld: Winkelwagen en checkout proces]
  - [Bijvoorbeeld: Integratietesten voor winkelwagen endpoints]
