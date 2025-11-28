describe('Register page', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.window().then((win) => {
      win.localStorage.setItem('jwtToken', 'fake-jwt-token');
    });

    cy.intercept('GET', 'http://localhost:3000/api/users/me', {
      statusCode: 200,
      body: { userid: 1, voornaam: 'Admin', roles: ['admin'] },
    }).as('me');
  });

  it('navigates to register page from dashboard', () => {
    cy.visit('http://localhost:5173/');
    cy.wait('@me');
    cy.get('[data-cy=home_register]').click();
    cy.location('pathname').should('include', '/register');
  });

  it('creates a new user successfully', () => {
    cy.intercept('POST', 'http://localhost:3000/api/users', (req) => {
      req.reply({
        statusCode: 201,
        body: { userid: 42, voornaam: req.body.voornaam || 'Test', email: req.body.email },
      });
    }).as('createUser');

    cy.visit('http://localhost:5173/register');
    cy.wait('@me');

    cy.get('[data-cy=register_voornaam]').type('Jan');
    cy.get('[data-cy=register_familienaam]').type('Jansen');
    cy.get('[data-cy=register_email]').type('jan.jansen@example.com');
    cy.get('[data-cy=register_password]').type('password123');
    cy.get('[data-cy=register_confirmPassword]').type('password123');

    cy.get('[data-cy=register_submit]').click();

    cy.wait('@createUser');
    cy.contains('Nieuwe gebruiker succesvol aangemaakt!').should('be.visible');
  });

  it('shows validation errors for invalid input', () => {
    cy.visit('http://localhost:5173/register');
    cy.wait('@me');

    // Submit empty form
    cy.get('[data-cy=register_submit]').click();
    cy.contains('Vul alle verplichte velden in').should('be.visible');

    // Now test password mismatch
    cy.get('[data-cy=register_voornaam]').type('Piet');
    cy.get('[data-cy=register_familienaam]').type('Pietersen');
    cy.get('[data-cy=register_email]').type('piet@example.com');
    cy.get('[data-cy=register_password]').type('password123');
    cy.get('[data-cy=register_confirmPassword]').type('different');
    cy.get('[data-cy=register_submit]').click();
    cy.contains('Wachtwoorden komen niet overeen').should('be.visible');
  });
});
