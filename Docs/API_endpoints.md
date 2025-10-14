# API Endpoints

| Functionaliteit              | HTTP Methode | Volledige URL                                      |
|------------------------------|---------------|---------------------------------------------------|
| Inloggen (komt nog aan bod)  | POST          | `http://localhost:3000/api/auth/login`            |
| Alle transacties ophalen     | GET           | `http://localhost:3000/api/transactions`          |
| Nieuwe transactie toevoegen  | POST          | `http://localhost:3000/api/transactions`          |
| Transactie bewerken          | PUT           | `http://localhost:3000/api/transactions/{id}`     |
| Transactie verwijderen       | DELETE        | `http://localhost:3000/api/transactions/{id}`     |
| Alle categorieën ophalen     | GET           | `http://localhost:3000/api/categories`            |
| Nieuwe categorie toevoegen   | POST          | `http://localhost:3000/api/categories`            |
| Alle gebruikers ophalen      | GET           | `http://localhost:3000/api/users`                 |
| Eén gebruiker ophalen        | GET           | `http://localhost:3000/api/users/{id}`            |
| Gebruiker verwijderen        | DELETE        | `http://localhost:3000/api/users/{id}`            |
| CSV-bestand importeren       | POST          | `http://localhost:3000/api/import/csv`            |

## HTTP Statuscodes

- 200 OK → succesvolle GET ( Het request is geslaagd.)
- 201 Created → bij POST (Een resource is aangemaakt met een POST request. Het antwoord bevat een empty body.)
- 204 No Content → bij DELETE zonder body (Een PUT, PATCH of DELETE request slaagt. Het antwoord bevat een empty body.)
- 400 Bad Request → foutieve invoer
- 401 Unauthorized → geen geldige token
- 404 Not Found → item bestaat niet
...

## Best practices

- Gebruik zelfverklarende endpoints (bv. /transactions, niet /getAllTransactions)
- Gebruik meervoudige naamwoorden voor collecties (/transactions, /users)
- Houd de API stateless (alle state via tokens, niet via sessies)
