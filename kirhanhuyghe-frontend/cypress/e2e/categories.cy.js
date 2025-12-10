describe('Categories page flows', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.window().then((win) => {
      win.localStorage.setItem('jwtToken', 'fake-jwt-token');
    });

    cy.intercept('GET', '**/api/users/me', { statusCode: 200, body: { userid: 2, voornaam: 'Test', roles: ['admin'] } }).as('me');
    cy.fixture('categories.json').then((cats) => {
      cy.intercept('GET', '**/api/categorieen*', { statusCode: 200, body: cats }).as('getCategories');
    });
  });

  it('shows table view by default and prompts selection', () => {
    // provide simple transacties so charts can render but no selection yet
    cy.intercept('GET', '**/api/transacties*', { statusCode: 200, body: [] }).as('getTransacties');

    cy.visit('http://localhost:5173/categories');
    cy.wait(['@me', '@getCategories', '@getTransacties']);

    cy.contains('Selecteer een categorie om transacties te bekijken.').should('be.visible');
    cy.contains('Tabel').should('be.visible');
  });

  it('selects a category and shows incomes, expenses and saldo; toggles to charts', () => {
    // craft transacties where each transaction references a category
    const tx = [
      { transactieID: 101, beschrijving: 'Kopen', datum: '2025-11-03', bedrag: 40, in_uit: 'UIT', categorieDetails: [{ categorieID: 10, categorienaam: 'Boodschappen' }] },
      { transactieID: 102, beschrijving: 'Verkoop', datum: '2025-11-05', bedrag: 20, in_uit: 'IN', categorieDetails: [{ categorieID: 10, categorienaam: 'Boodschappen' }] }
    ];

    cy.intercept('GET', '**/api/transacties*', { statusCode: 200, body: tx }).as('getTransacties');
    cy.fixture('categories.json').then((cats) => {
      cy.intercept('GET', '**/api/categorieen*', { statusCode: 200, body: cats }).as('getCategories2');
    });

    cy.visit('http://localhost:5173/categories');
    cy.wait(['@me', '@getCategories2', '@getTransacties']);

    // open the category Autocomplete and pick 'Boodschappen'
    cy.get('input[placeholder="Selecteer of typ een categorie"]').click();
    cy.get('ul[role=listbox] li').contains('Boodschappen').click();

    // Now table view should show two sections for incomes and expenses with the category name
    cy.contains('Inkomsten: Boodschappen').should('be.visible');
    cy.contains('Uitgaven: Boodschappen').should('be.visible');

    // bottom saldo bar should show the saldo text
    cy.contains('Saldo Boodschappen').should('be.visible');

    // switch to charts
    cy.contains('Grafieken').click();
    cy.contains('Analyse: Boodschappen').should('be.visible');
    // ensure at least one canvas rendered for charts
    cy.get('canvas').should('exist');
  });

  it('adds a category and shows validation for empty name', () => {
    cy.intercept('GET', '**/api/transacties*', { statusCode: 200, body: [] }).as('getTransactiesEmpty');
    cy.visit('http://localhost:5173/categories');
    cy.wait(['@me', '@getCategories', '@getTransactiesEmpty']);

    // stub alerts to assert messages
    const alertStub = cy.stub();
    cy.on('window:alert', alertStub);

    // open add dialog
    cy.contains('+ Categorie').click();
    // scope to modal so we target the correct inputs/buttons
    cy.get('div.fixed.inset-0.z-50').within(() => {
      // try to save with empty name
      cy.contains('Opslaan').click();
    });

    cy.wrap(null).then(() => {
      expect(alertStub.getCall(0)).to.exist;
      expect(alertStub.getCall(0).args[0]).to.match(/Geef een categorienaam op/);
    });

    // now provide a name and stub POST
    cy.get('div.fixed.inset-0.z-50').within(() => {
      cy.get('input[placeholder="Bijv. kilometervergoeding"]').type('TestCat');
    });
    cy.intercept('POST', 'http://localhost:3000/api/categorieen', (req) => {
      req.reply({ statusCode: 201, body: { categorieID: 999, categorienaam: req.body.arg?.categorienaam ?? req.body?.arg?.categorienaam ?? 'TestCat' } });
    }).as('postCat');

    cy.get('div.fixed.inset-0.z-50').within(() => {
      cy.contains('Opslaan').click();
    });
    cy.wait('@postCat');
    cy.wrap(null).then(() => {
      // last alert should indicate success
      const last = alertStub.getCall(alertStub.callCount - 1);
      expect(last).to.exist;
      expect(last.args[0]).to.match(/Categorie succesvol toegevoegd/);
    });
  });

  it('edits and deletes a selected category (with validation)', () => {
    // prepare one category and transactions
    const tx = [
      { transactieID: 201, beschrijving: 'X', datum: '2025-11-02', bedrag: 10, in_uit: 'IN', categorieDetails: [{ categorieID: 11, categorienaam: 'Salaris' }] }
    ];
    cy.intercept('GET', '**/api/transacties*', { statusCode: 200, body: tx }).as('getTransacties2');
    cy.fixture('categories.json').then((cats) => {
      cy.intercept('GET', '**/api/categorieen*', { statusCode: 200, body: cats }).as('getCategories3');
    });

    cy.visit('http://localhost:5173/categories');
    cy.wait(['@me', '@getCategories3', '@getTransacties2']);

    // select 'Salaris'
    cy.get('input[placeholder="Selecteer of typ een categorie"]').click();
    cy.get('ul[role=listbox] li').contains('Salaris').click();
    // ensure the Autocomplete shows the selected value
    cy.get('input[placeholder="Selecteer of typ een categorie"]').should('have.value', 'Salaris');

      // close any open listbox and ensure the edit button is enabled, then click it
      cy.get('body').type('{esc}');
      cy.get('div.mb-4').within(() => {
        cy.contains('Bewerken').should('be.visible').and('not.be.disabled');
        // force click to avoid overlay/backdrop interference in headless runs
        cy.contains('Bewerken').click({ force: true });
      });
      // wait for the edit dialog heading
      cy.contains('Categorie aanpassen', { timeout: 20000 }).should('be.visible');

    // stub alert and confirm
    const alertStub = cy.stub();
    cy.on('window:alert', alertStub);
    cy.window().then((win) => cy.stub(win, 'confirm').returns(true));

    // try to save with empty name to trigger validation (scope inside modal via its heading)
    cy.contains('Categorie aanpassen').closest('div').within(() => {
      cy.get('input[placeholder="Bijv. kilometervergoeding"]').clear();
      cy.contains('Opslaan').click();
    });

    cy.wrap(null).then(() => {
      expect(alertStub.getCall(0)).to.exist;
      expect(alertStub.getCall(0).args[0]).to.match(/Geef een categorienaam op/);
    });

    // now provide a new name and stub PUT
    cy.contains('Categorie aanpassen').closest('div').within(() => {
      cy.get('input[placeholder="Bijv. kilometervergoeding"]').type('Salaris Nieuw');
    });
    cy.intercept('PUT', '**/api/categorieen/*', (req) => {
      req.reply({ statusCode: 200, body: { ok: true } });
    }).as('putCat');

    cy.contains('Categorie aanpassen').closest('div').within(() => {
      cy.contains('Opslaan').click();
    });
    cy.wait('@putCat');
    // ensure the edit dialog closed (category list refresh is handled by onSaved/mutate)
    cy.contains('Categorie aanpassen').should('not.exist');

    // after successful save the modal closed; reopen the edit dialog to test delete
    cy.contains('Bewerken').should('not.be.disabled').click();
    cy.contains('Categorie aanpassen', { timeout: 10000 }).should('be.visible');

    // now delete: click delete button inside modal and intercept delete
    cy.intercept('DELETE', '**/api/categorieen/*', { statusCode: 200, body: { ok: true } }).as('delCat');
    cy.contains('Categorie aanpassen').closest('div').within(() => {
      cy.contains('Verwijder categorie').click();
    });
    cy.wait('@delCat');
    // after deletion the modal should close (category list refresh is handled by onSaved/mutate)
    cy.contains('Categorie aanpassen').should('not.exist');
  });

  it('does not show add/edit buttons for normal user', () => {
    cy.intercept('GET', '**/api/users/me', { statusCode: 200, body: { userid: 3, voornaam: 'Jan', roles: ['user'] } }).as('meUser');
    cy.intercept('GET', '**/api/transacties*', { statusCode: 200, body: [] }).as('getTransactiesEmpty2');
    cy.fixture('categories.json').then((cats) => {
      cy.intercept('GET', '**/api/categorieen*', { statusCode: 200, body: cats }).as('getCategories4');
    });

    cy.visit('http://localhost:5173/categories');
    cy.wait(['@meUser', '@getCategories4', '@getTransactiesEmpty2']);

    cy.contains('+ Categorie').should('not.exist');
    cy.contains('Bewerken').should('not.exist');
  });
});
