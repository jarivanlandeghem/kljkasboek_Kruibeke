describe('Transactions flows', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.window().then((win) => {
      win.localStorage.setItem('jwtToken', 'fake-jwt-token');
    });

    cy.intercept('GET', 'http://localhost:3000/api/users/me', { statusCode: 200, body: { userid: 2, voornaam: 'Test', roles: ['admin'] } }).as('me');
    cy.fixture('transacties.json').then((data) => {
      cy.intercept('GET', 'http://localhost:3000/api/transacties', { statusCode: 200, body: data }).as('getTransacties');
    });
    cy.fixture('categories.json').then((cats) => {
      cy.intercept('GET', 'http://localhost:3000/api/categorieen', { statusCode: 200, body: cats }).as('getCategories');
    });
  });

  it('adds a new transaction successfully', () => {
    cy.intercept('POST', 'http://localhost:3000/api/transacties', (req) => {
      req.reply({ statusCode: 201, body: { transactieID: 99, ...req.body } });
    }).as('createTrans');

    cy.visit('http://localhost:5173/transactions');
    cy.wait(['@me', '@getTransacties']);

    cy.get('[data-cy=transactions_new]').click();

    cy.get('[data-cy=transaction_add_beschrijving]').type('Test transactie');
    cy.get('[data-cy=transaction_add_bedrag]').type('12,34');
    // set the date value directly (MUI DatePicker input can be wrapped)
    cy.get('[data-cy=transaction_add_datum]').then(($input) => {
      const el = $input[0];
      el.value = '2025-11-20';
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });

    cy.get('[data-cy=transaction_add_save]').click();
    cy.wait('@createTrans').its('request.body').then((body) => {
      expect(body.beschrijving).to.equal('Test transactie');
      expect(body.bedrag).to.be.a('number');
    });

    // dialog should close
    cy.get('[data-cy=transaction_add_beschrijving]').should('not.exist');
  });

  it('hides add/import buttons for normal user', () => {
    // intercept as regular user
    cy.intercept('GET', 'http://localhost:3000/api/users/me', { statusCode: 200, body: { userid: 2, voornaam: 'Test', roles: ['user'] } }).as('meUser');
    cy.visit('http://localhost:5173/transactions');
    cy.wait('@meUser');
    cy.get('[data-cy=transactions_new]').should('not.exist');
    cy.get('[data-cy=transactions_import]').should('not.exist');
  });

  it('shows validation errors when adding invalid transaction', () => {
    cy.visit('http://localhost:5173/transactions');
    cy.wait(['@me', '@getTransacties']);

    cy.get('[data-cy=transactions_new]').click();
    // submit empty
    cy.get('[data-cy=transaction_add_save]').click();

    cy.contains('Beschrijving is verplicht').should('be.visible');
    cy.contains('Bedrag is verplicht').should('be.visible');
  });

  it('imports CSV file and shows success alert', () => {
    cy.intercept('POST', 'http://localhost:3000/api/transacties', { statusCode: 201, body: { ok: true } }).as('postImported');

    cy.visit('http://localhost:5173/transactions');
    cy.wait(['@me', '@getTransacties']);

    // stub alert
    const alertStub = cy.stub();
    cy.on('window:alert', alertStub);

    cy.get('[data-cy=transactions_import]').click();
    // wait for file input to appear and attach file
    cy.get('input[type=file]', { timeout: 10000 }).first().selectFile('cypress/fixtures/transactions_import.csv', { force: true });
    // Click the import/process button the importer exposes (common labels)
    cy.contains('button', /importeren|importeer|import|start|volgende/i, { timeout: 5000 }).click({ force: true });

    // wait for posts triggered by importer
    cy.wait('@postImported');
    cy.then(() => {
      expect(alertStub.getCall(0)).to.exist;
    });
  });

  it('sends PDF report when confirmed', () => {
    cy.intercept('POST', 'http://localhost:3000/api/transacties/report', { statusCode: 200, body: { ok: true } }).as('postReport');

    cy.visit('http://localhost:5173/transactions');
    cy.wait(['@me', '@getTransacties']);

    cy.window().then((win) => {
      cy.stub(win, 'confirm').returns(true);
      const alertStub = cy.stub(win, 'alert');
      cy.get('[data-cy=transactions_pdf]').click();
      cy.wait('@postReport');
      cy.wrap(null).then(() => {
        expect(alertStub).to.have.been.calledWithMatch(/Succes/);
      });
    });
  });

  it('changes category via dropdown and sends PUT', () => {
    cy.intercept('PUT', 'http://localhost:3000/api/transacties/*/categorieen', (req) => {
      req.reply({ statusCode: 200, body: { ok: true, ...req.body } });
    }).as('putCats');

    cy.visit('http://localhost:5173/transactions');
    cy.wait(['@me', '@getTransacties', '@getCategories']);

    // open first transaction category1 input and pick first option
    // open specific input for transactieID 1 and pick first option
    cy.get('[data-cy=transaction_1_cat1]').click({ force: true });
    cy.get('ul[role=listbox] li').contains('Boodschappen').click();
    cy.wait('@putCats').its('request.body').then((body) => {
      expect(body.categorieIDs).to.be.an('array');
    });
  });

  it('sorts transactions by date', () => {
    cy.visit('http://localhost:5173/transactions');
    cy.wait(['@me', '@getTransacties']);

    // initial sort is new->old, first row should contain 'Salaris' (most recent)
    cy.get('table tbody tr').first().contains('Salaris');

    // change sort to old->new
    cy.get('select').select('old');
    // now first row should be 'Boodschappen'
    cy.get('table tbody tr').first().contains('Boodschappen');
  });

  it('edits a transaction and handles invalid input', () => {
    cy.intercept('PUT', 'http://localhost:3000/api/transacties/*', (req) => {
      req.reply({ statusCode: 200, body: { ok: true, ...req.body } });
    }).as('putTrans');

    cy.visit('http://localhost:5173/transactions');
    cy.wait(['@me', '@getTransacties']);

    cy.get('[data-cy=transaction_edit_1]').click();
    // set invalid amount
    cy.get('[data-cy=transaction_edit_bedrag_1]').clear();
    cy.get('[data-cy=transaction_edit_bedrag_1]').then(($el) => {
      // set a non-numeric value directly on number input to trigger NaN
      $el[0].value = 'not-a-number';
      $el[0].dispatchEvent(new Event('input', { bubbles: true }));
    });

    // simulate server-side validation error: intercept PUT and return 400
    cy.intercept('PUT', 'http://localhost:3000/api/transacties/*', (req) => {
      req.reply(400, { message: 'Ongeldig bedrag' });
    }).as('putTransFail');

    cy.get('[data-cy=transaction_edit_save_1]').click();
    cy.wait('@putTransFail');
    // dialog should show the server error message
    cy.contains('Ongeldig bedrag').should('be.visible');

    // now set valid amount and save — stub a successful PUT for this action
    cy.intercept('PUT', 'http://localhost:3000/api/transacties/*', (req) => {
      req.reply({ statusCode: 200, body: { ok: true, ...req.body } });
    }).as('putTransSuccess');
    cy.get('[data-cy=transaction_edit_bedrag_1]').clear();
    cy.get('[data-cy=transaction_edit_bedrag_1]').type('25');
    cy.get('[data-cy=transaction_edit_save_1]').click();
    cy.wait('@putTransSuccess').its('request.body').then((body) => {
      expect(body.bedrag).to.be.a('number');
    });
  });

  it('deletes a transaction', () => {
    cy.intercept('DELETE', 'http://localhost:3000/api/transacties/*', { statusCode: 200, body: { ok: true } }).as('deleteTrans');

    cy.visit('http://localhost:5173/transactions');
    cy.wait(['@me', '@getTransacties']);

    cy.get('[data-cy=transaction_delete_1]').click();
    cy.wait('@deleteTrans');
  });

  it('search filters transactions', () => {
    cy.visit('http://localhost:5173/transactions');
    cy.wait(['@me', '@getTransacties']);

    cy.get('[data-cy=transactions_search]').type('Salaris');
    cy.get('table tbody tr').should('have.length', 1).and('contain.text', 'Salaris');
  });
});
