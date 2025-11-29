describe('Profielpagina - wachtwoord wijzigen', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it('Gebruiker kan wachtwoord wijzigen (PUT wordt gestuurd)', () => {
    // authenticated user
    cy.window().then((win) => win.localStorage.setItem('jwtToken', 'fake-jwt-token'));
    cy.intercept('GET', 'http://localhost:3000/api/users/me', { statusCode: 200, body: { userid: 5, voornaam: 'Test', roles: ['user'] } }).as('me');

    cy.visit('http://localhost:5173/profile');
    cy.wait('@me');

    // fill form with valid data (use input[name] because MUI TextField renders name attr)
    cy.get('input[name="currentPassword"]').type('currentSecret');
    cy.get('input[name="newPassword"]').type('newSecret123');
    cy.get('input[name="confirmPassword"]').type('newSecret123');

    // intercept PUT and assert payload
    cy.intercept('PUT', 'http://localhost:3000/api/users/me/password', (req) => {
      expect(req.body.currentPassword).to.equal('currentSecret');
      expect(req.body.newPassword).to.equal('newSecret123');
      req.reply({ statusCode: 200, body: { ok: true } });
    }).as('putPassword');

    cy.get('button[type="submit"]').click();
    cy.wait('@putPassword');

    // success message and inputs cleared
    cy.contains('Wachtwoord succesvol gewijzigd!').should('exist');
    cy.get('input[name="currentPassword"]').should('have.value', '');
    cy.get('input[name="newPassword"]').should('have.value', '');
    cy.get('input[name="confirmPassword"]').should('have.value', '');
  });

  it('Foute invoer: nieuwe wachtwoorden komen niet overeen', () => {
    cy.window().then((win) => win.localStorage.setItem('jwtToken', 'fake-jwt-token'));
    cy.intercept('GET', 'http://localhost:3000/api/users/me', { statusCode: 200, body: { userid: 6, voornaam: 'Test2', roles: ['user'] } }).as('me2');

    cy.visit('http://localhost:5173/profile');
    cy.wait('@me2');

    cy.get('input[name="currentPassword"]').type('currentSecret');
    cy.get('input[name="newPassword"]').type('short1');
    cy.get('input[name="confirmPassword"]').type('different');

    cy.get('button[type="submit"]').click();

    cy.contains('Nieuwe wachtwoorden komen niet overeen').should('exist');
  });

  it('Foute invoer: nieuw wachtwoord te kort', () => {
    cy.window().then((win) => win.localStorage.setItem('jwtToken', 'fake-jwt-token'));
    cy.intercept('GET', 'http://localhost:3000/api/users/me', { statusCode: 200, body: { userid: 7, voornaam: 'Test3', roles: ['user'] } }).as('me3');

    cy.visit('http://localhost:5173/profile');
    cy.wait('@me3');

    cy.get('input[name="currentPassword"]').type('currentSecret');
    cy.get('input[name="newPassword"]').type('123');
    cy.get('input[name="confirmPassword"]').type('123');

    cy.get('button[type="submit"]').click();

    cy.contains('Wachtwoord moet minimaal 6 tekens lang zijn').should('exist');
  });

  it('Foute invoer: verkeerd huidig wachtwoord (backend error)', () => {
    cy.window().then((win) => win.localStorage.setItem('jwtToken', 'fake-jwt-token'));
    cy.intercept('GET', 'http://localhost:3000/api/users/me', { statusCode: 200, body: { userid: 8, voornaam: 'Test4', roles: ['user'] } }).as('me4');

    cy.visit('http://localhost:5173/profile');
    cy.wait('@me4');

    cy.get('input[name="currentPassword"]').type('wrongCurrent');
    cy.get('input[name="newPassword"]').type('validNew123');
    cy.get('input[name="confirmPassword"]').type('validNew123');

    // backend responds with 400 and error message
    cy.intercept('PUT', 'http://localhost:3000/api/users/me/password', (req) => {
      req.reply({ statusCode: 400, body: { message: 'Oud wachtwoord incorrect' } });
    }).as('putBad');

    cy.get('button[type="submit"]').click();
    cy.wait('@putBad');

    cy.contains('Oud wachtwoord incorrect').should('exist');
  });
});
