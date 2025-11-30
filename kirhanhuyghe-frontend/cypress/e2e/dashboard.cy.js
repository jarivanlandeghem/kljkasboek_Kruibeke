describe('Dashboard navigation', () => {
  beforeEach(() => {
    // set a fake token and mock users/me so the app thinks we're logged in
    cy.clearLocalStorage();
    cy.window().then((win) => {
      win.localStorage.setItem('jwtToken', 'fake-jwt-token');
    });

    cy.intercept('GET', 'http://localhost:3000/api/users/me', {
      statusCode: 200,
      body: { userid: 2, voornaam: 'Pieter', roles: ['user'] },
    }).as('me');
  });

  it('navigates to transactions page', () => {
    cy.visit('http://localhost:5173/');
    cy.wait('@me');
    // animations may cause the link to be briefly covered; force the click for stability
    cy.get('[data-cy=home_transactions]').click({ force: true });
    cy.location('pathname').should('include', '/transactions');
  });

  it('navigates to categories page', () => {
    cy.visit('http://localhost:5173/');
    cy.wait('@me');
    cy.get('[data-cy=home_categories]').click();
    cy.location('pathname').should('include', '/categories');
  });

  it('navigates to kasjes page', () => {
    cy.visit('http://localhost:5173/');
    cy.wait('@me');
    cy.get('[data-cy=home_kasjes]').click();
    cy.location('pathname').should('include', '/kasjes');
  });

  it('navigates to leiding page', () => {
    cy.visit('http://localhost:5173/');
    cy.wait('@me');
    cy.get('[data-cy=home_leiding]').click();
    cy.location('pathname').should('include', '/leiding');
  });

  it('navigates to aanwezigheden page', () => {
    cy.visit('http://localhost:5173/');
    cy.wait('@me');
    cy.get('[data-cy=home_aanwezigheden]').click();
    cy.location('pathname').should('include', '/aanwezigheden');
  });

  it('navigates to ronde page', () => {
    cy.visit('http://localhost:5173/');
    cy.wait('@me');
    cy.get('[data-cy=home_ronde]').click();
    cy.location('pathname').should('include', '/ronde');
  });

  it('does not show register link for normal user', () => {
    cy.visit('http://localhost:5173/');
    cy.wait('@me');
    cy.get('[data-cy=home_register]').should('not.exist');
  });
});
