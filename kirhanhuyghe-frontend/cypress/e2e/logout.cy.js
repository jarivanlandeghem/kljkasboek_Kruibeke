describe('Uitlog flow', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it('Klik op uitloggen navigeert naar /logout en terug naar login', () => {
    // set a token so navbar shows logout link
    cy.window().then((win) => win.localStorage.setItem('jwtToken', 'fake-jwt-token'));
    // stub /users/me so app has user data
    cy.intercept('GET', 'http://localhost:3000/api/users/me', { statusCode: 200, body: { userid: 9, voornaam: 'NavUser', familienaam: 'Test' } }).as('me');

    // visit home (private route) so navbar renders
    cy.visit('http://localhost:5173/home');
    cy.wait('@me');

    // click logout icon in navbar
    cy.get('img[alt="logout"]').should('be.visible').click();

    // should navigate to /logout
    cy.location('pathname').should('eq', '/logout');

    // wait until logout flow finished and success text appears
    cy.contains('Je bent succesvol uitgelogd', { timeout: 5000 }).should('exist');

    // click back to login
    cy.contains('Terug naar login').click();

    // should be on /login
    cy.location('pathname').should('eq', '/login');
  });
});
