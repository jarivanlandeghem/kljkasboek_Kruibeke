describe('Login flow', () => {
  beforeEach(() => {
    // ensure no token is present
    cy.clearLocalStorage();
  });

  it('logs in successfully with valid credentials', () => {
    // mock session POST to return a token
    cy.intercept('POST', 'http://localhost:3000/api/session', {
      statusCode: 200,
      body: { token: 'fake-jwt-token' },
    }).as('loginRequest');

    // mock users/me to return a user object after login
    cy.intercept('GET', 'http://localhost:3000/api/users/me', {
      statusCode: 200,
      body: { userid: 2, voornaam: 'Pieter', roles: ['user'] },
    }).as('meRequest');

    cy.visit('http://localhost:5173/login');

    cy.get('[data-cy=email_input]').clear().type('pieter@example.com');
    cy.get('[data-cy=password_input]').clear().type('correct-password');
    cy.get('[data-cy=login_submit]').click();

    cy.wait('@loginRequest');
    cy.wait('@meRequest');

    // assert token stored
    cy.window().then((win) => {
      expect(win.localStorage.getItem('jwtToken')).to.exist;
    });

    // after successful login the home page should show a welcome header
    cy.get('h1').should('contain.text', 'Welkom');
  });

  it('shows an error on invalid credentials', () => {
    cy.intercept('POST', 'http://localhost:3000/api/session', {
      statusCode: 401,
      body: { statusCode: 401, message: 'Unauthorized' },
    }).as('loginFail');

    cy.visit('http://localhost:5173/login');

    cy.get('[data-cy=email_input]').clear().type('wrong@example.com');
    cy.get('[data-cy=password_input]').clear().type('bad-password');
    cy.get('[data-cy=login_submit]').click();

    cy.wait('@loginFail');

    // the Login page opens an error dialog; check that its text contains the failure message
    cy.contains('Het opgegeven emailadres of wachtwoord is onjuist.').should('be.visible');
  });
});
