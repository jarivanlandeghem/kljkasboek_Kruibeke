describe('User management dialog', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.window().then((win) => {
      win.localStorage.setItem('jwtToken', 'fake-jwt-token');
    });

    // return an admin user so the dialog button is visible
    cy.intercept('GET', 'http://localhost:3000/api/users/me', {
      statusCode: 200,
      body: { userid: 1, voornaam: 'Admin', roles: ['admin'] },
    }).as('me');

    // stub the users list
    cy.fixture('user_list.json').then((users) => {
      cy.intercept('GET', 'http://localhost:3000/api/users', {
        statusCode: 200,
        body: users
      }).as('getUsers');
    });
  });

  it('opens dialog and shows users', () => {
    cy.visit('http://localhost:5173/register');
    cy.wait('@me');
    cy.get('[data-cy=users_open_button]').click();
    cy.wait('@getUsers');

    // ensure list items are visible from fixture
    cy.get('[data-cy^=users_edit_]').should('have.length.greaterThan', 0);
    cy.contains('Admin: Beheer Gebruikers').should('be.visible');
  });

  it('edits a user roles and saves', () => {
    cy.intercept('PUT', 'http://localhost:3000/api/users/*', (req) => {
      // echo back the changed roles
      req.reply((res) => {
        res.send({ statusCode: 200, body: { ...req.body, userid: Number(req.url.split('/').pop()) } });
      });
    }).as('updateUser');

    cy.visit('http://localhost:5173/register');
    cy.wait('@me');
    cy.get('[data-cy=users_open_button]').click();
    cy.wait('@getUsers');

    // pick first edit button
    cy.get('[data-cy^=users_edit_]').first().then(($btn) => {
      const dataCy = $btn.attr('data-cy');
      // extract userid from attribute like users_edit_3
      const userid = dataCy.split('_').pop();

      cy.wrap($btn).click();

      // select a different role (toggle)
      cy.get(`[data-cy=users_select_${userid}]`).click();
      // choose 'admin' from the menu
      cy.get('ul[role=listbox] li').contains('admin').click();

      // ensure menu is closed: send Escape (MUI closes Select on ESC)
      cy.get('body').type('{esc}');
      cy.wait(100);
      cy.get('ul[role=listbox]').should('not.exist');

      cy.get(`[data-cy=users_save_${userid}]`).click();
      // assert the PUT request contained the updated roles (includes 'admin')
      cy.wait('@updateUser').its('request.body').then((body) => {
        expect(body.roles).to.include('admin');
      });
    });
  });

  it('can cancel editing', () => {
    cy.visit('http://localhost:5173/register');
    cy.wait('@me');
    cy.get('[data-cy=users_open_button]').click();
    cy.wait('@getUsers');

    cy.get('[data-cy^=users_edit_]').first().click();
    cy.get('[data-cy^=users_cancel_]').first().click();

    // ensure select is not visible anymore
    cy.get('[data-cy^=users_select_]').should('not.exist');
  });
});
