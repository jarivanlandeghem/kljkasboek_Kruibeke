describe('Kasjes page - budgetbeheer', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it('Admin kan budget aanpassen (PUT wordt gestuurd)', () => {
    // admin user
    cy.window().then((win) => win.localStorage.setItem('jwtToken', 'fake-jwt-token'));
    cy.intercept('GET', '**/api/users/me', { statusCode: 200, body: { userid: 1, voornaam: 'Admin', roles: ['ADMIN'] } }).as('me');

    const kasjes = [ { kasjeID: 10, groep: '-12', bedrag: 200 } ];
    cy.intercept('GET', '**/api/transacties*', { statusCode: 200, body: [] }).as('getTx');
    cy.intercept('GET', '**/api/kasjes*', { statusCode: 200, body: kasjes }).as('getKasjes');

    cy.visit('http://localhost:5173/kasjes');
    cy.wait(['@me', '@getTx', '@getKasjes']);

    // find the card for groep '-12' and click edit
    cy.contains('-12').closest('.rounded-2xl').within(() => {
      cy.contains('Jaarbudget').closest('div').within(() => {
        cy.get('button').should('exist').click();
      });
    });

    // input should appear; change value and save
    cy.contains('-12').closest('.rounded-2xl').within(() => {
      cy.get('input[type="number"]').should('exist').clear();
      cy.get('input[type="number"]').type('500');
      // prepare intercept for PUT and assert payload
      cy.intercept('PUT', '**/api/kasjes/10', (req) => {
        expect(req.body.bedrag).to.equal(500);
        req.reply({ statusCode: 200, body: { ok: true } });
      }).as('putKasje');

      // click save (green button)
      cy.get('button.text-green-600').click();
    });

    cy.wait('@putKasje');
    // after saving the edit mode should close (input removed)
    cy.get('input[type="number"]').should('not.exist');
  });

  it('Normale user ziet geen edit icoon', () => {
    // normal user
    cy.window().then((win) => win.localStorage.setItem('jwtToken', 'fake-jwt-token'));
    cy.intercept('GET', '**/api/users/me', { statusCode: 200, body: { userid: 2, voornaam: 'User', roles: ['user'] } }).as('meUser');

    const kasjes = [ { kasjeID: 11, groep: '-8', bedrag: 150 } ];
    cy.intercept('GET', '**/api/transacties*', { statusCode: 200, body: [] }).as('getTx2');
    cy.intercept('GET', '**/api/kasjes*', { statusCode: 200, body: kasjes }).as('getKasjes2');

    cy.visit('http://localhost:5173/kasjes');
    cy.wait(['@meUser', '@getTx2', '@getKasjes2']);

    // in the card for '-8' there should be no edit button inside the Jaarbudget area
    cy.contains('-8').closest('.rounded-2xl').within(() => {
      cy.contains('Jaarbudget').closest('div').within(() => {
        cy.get('button').should('not.exist');
      });
    });
  });
});
