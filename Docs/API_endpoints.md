# API Endpoints

| Functionaliteit                         | HTTP Methode | Volledige URL                                              |
|-----------------------------------------|--------------|--------------------------------------------------------------|
| Login / Session aanmaken                | POST         | `http://localhost:3000/api/session`                          |
| Huidige gebruiker ophalen               | GET          | `http://localhost:3000/api/users/me`                         |
| Wachtwoord wijzigen                     | PUT          | `http://localhost:3000/api/users/me/password`                |
| Account aanvragen                       | POST         | `http://localhost:3000/api/users/request-account`            |
| Alle gebruikers ophalen                 | GET          | `http://localhost:3000/api/users`                            |
| Nieuwe gebruiker toevoegen              | POST         | `http://localhost:3000/api/users`                            |
| Eén gebruiker ophalen                   | GET          | `http://localhost:3000/api/users/{id}`                       |
| Gebruiker bewerken                      | PUT          | `http://localhost:3000/api/users/{id}`                       |
| Gebruiker verwijderen                   | DELETE       | `http://localhost:3000/api/users/{id}`                       |
| **Leiding Profiel**                     |              |                                                              |
| Nieuw profiel aanmaken                  | POST         | `http://localhost:3000/api/leiding-profiel`                  |
| Alle profielen ophalen                  | GET          | `http://localhost:3000/api/leiding-profiel`                  |
| Eén profiel ophalen                     | GET          | `http://localhost:3000/api/leiding-profiel/{id}`             |
| Profiel ophalen op user ID              | GET          | `http://localhost:3000/api/leiding-profiel/user/{userId}`    |
| Profiel bewerken                        | PATCH        | `http://localhost:3000/api/leiding-profiel/{id}`             |
| Profiel verwijderen                     | DELETE       | `http://localhost:3000/api/leiding-profiel/{id}`             |
| **Transacties**                         |              |                                                              |
| Alle transacties ophalen                | GET          | `http://localhost:3000/api/transacties`                      |
| Eén transactie ophalen                  | GET          | `http://localhost:3000/api/transacties/{id}`                 |
| Nieuwe transactie toevoegen             | POST         | `http://localhost:3000/api/transacties`                      |
| Transactie bewerken                     | PUT          | `http://localhost:3000/api/transacties/{id}`                 |
| Categorieën aan transactie toevoegen    | PUT          | `http://localhost:3000/api/transacties/{id}/categorieen`     |
| Transactie verwijderen                  | DELETE       | `http://localhost:3000/api/transacties/{id}`                 |
| Transactierapport genereren             | POST         | `http://localhost:3000/api/transacties/report`               |
| **Categorieën**                         |              |                                                              |
| Alle categorieën ophalen                | GET          | `http://localhost:3000/api/categorieen`                      |
| Eén categorie ophalen                   | GET          | `http://localhost:3000/api/categorieen/{id}`                 |
| Nieuwe categorie toevoegen              | POST         | `http://localhost:3000/api/categorieen`                      |
| Categorie bewerken                      | PUT          | `http://localhost:3000/api/categorieen/{id}`                 |
| Categorie verwijderen                   | DELETE       | `http://localhost:3000/api/categorieen/{id}`                 |
| **Evenementen**                         |              |                                                              |
| Alle evenementen ophalen                | GET          | `http://localhost:3000/api/evenementen`                      |
| Eén evenement ophalen                   | GET          | `http://localhost:3000/api/evenementen/{id}`                 |
| Nieuw evenement aanmaken                | POST         | `http://localhost:3000/api/evenementen`                      |
| Evenement bewerken                      | PATCH        | `http://localhost:3000/api/evenementen/{id}`                 |
| PDF aanwezigheden genereren             | POST         | `http://localhost:3000/api/evenementen/{id}/pdf-aanwezigheden` |
| Evenement verwijderen                   | DELETE       | `http://localhost:3000/api/evenementen/{id}`                 |
| **Aanwezigheden**                       |              |                                                              |
| Aanwezigheid registreren                | POST         | `http://localhost:3000/api/aanwezigheden`                    |
| Alle aanwezigheden ophalen              | GET          | `http://localhost:3000/api/aanwezigheden`                    |
| Eén aanwezigheid ophalen                | GET          | `http://localhost:3000/api/aanwezigheden/{id}`               |
| Aanwezigheden per evenement             | GET          | `http://localhost:3000/api/aanwezigheden/event/{evenementId}` |
| Aanwezigheden per gebruiker             | GET          | `http://localhost:3000/api/aanwezigheden/user/{userId}`      |
| Aanwezigheid bewerken                   | PATCH        | `http://localhost:3000/api/aanwezigheden/{id}`               |
| Aanwezigheid verwijderen                | DELETE       | `http://localhost:3000/api/aanwezigheden/{id}`               |
| **Rondes (Wijkverdeling)**              |              |                                                              |
| CSV importeren en ronde verwerken       | POST         | `http://localhost:3000/api/ronde/import`                     |
| Ronde-resultaat ophalen                 | GET          | `http://localhost:3000/api/ronde/{rondeId}/resultaat`        |
| **Kasjes (Budgetten)**                  |              |                                                              |
| Alle kasjes ophalen                     | GET          | `http://localhost:3000/api/kasjes`                           |
| Kasje bedrag bijwerken                  | PUT          | `http://localhost:3000/api/kasjes/{id}`                      |
| **Health Check**                        |              |                                                              |
| Server health controleren               | GET          | `http://localhost:3000/api/health/ping`                      |

## HTTP Statuscodes

- **200 OK** → Succesvolle GET request. De resource is opgehaald.
- **201 Created** → Succesvolle POST request. Een nieuwe resource is aangemaakt.
- **304 Not Modified** → De resource is niet veranderd sinds het vorige request (cache).
- **400 Bad Request** → Foutieve invoer of ongeldig verzoek.
- **401 Unauthorized** → Geen geldige JWT token of niet ingelogd.
- **404 Not Found** → De opgehaalde resource bestaat niet.
- **500 Internal Server Error** → Server error.

## Best Practices

- **Zelfverklarende endpoints**: `/api/transacties`, niet `/api/getAllTransactions`
- **Meervoudige naamwoorden voor collecties**: `/api/users`, `/api/evenementen`
- **Enkelvoudige naamwoorden voor specifieke items**: `/api/users/{id}`
- **Stateless API**: Alle state wordt via JWT tokens beheerd, niet via server-sessies
- **Consistente naming**: kebab-case voor URL paths (`/leiding-profiel`, niet `/leidingprofiel`)
- **Juiste HTTP methodes**: GET (lezen), POST (aanmaken), PUT/PATCH (bewerken), DELETE (verwijderen)
