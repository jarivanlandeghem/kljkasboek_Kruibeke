describe('Evenementen Beheer - admin flows', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.window().then((win) => win.localStorage.setItem('jwtToken', 'fake-jwt-token'));
    // make the user an admin so admin view is visible
    cy.intercept('GET', 'http://localhost:3000/api/users/me', { statusCode: 200, body: { userid: 1, voornaam: 'Admin', email: 'admin@example.com', roles: ['ADMIN'] } }).as('me');
  });

  it('Opens Nieuw Evenement dialog and validates required fields (stays open on invalid)', () => {
    const events = [];
    cy.intercept('GET', 'http://localhost:3000/api/evenementen', { statusCode: 200, body: events }).as('getEvents');

    cy.visit('http://localhost:5173/aanwezigheden');
    cy.wait(['@me', '@getEvents']);

    // switch to beheer tab
    cy.contains('Mijn Agenda').should('exist');
    cy.contains('Beheer').click();

    // click Evenement Toevoegen
    cy.contains('Evenement Toevoegen').click();

    // dialog title should be 'Nieuw'
    cy.contains('Nieuw').should('be.visible');

    // submit without filling required fields
    cy.contains('Nieuw').closest('div').within(() => {
      cy.contains('Opslaan').click();
    });

    // the Naam input should be marked invalid (required) and the dialog should remain open
    cy.contains('Naam').should('exist').invoke('attr', 'for').then((id) => {
      cy.get(`[id="${id}"]`).should('have.attr', 'aria-invalid', 'true');
    });
    cy.contains('Nieuw').should('be.visible');

    // now fill all required fields and ensure POST is sent
    cy.contains('Nieuw').closest('div').within(() => {
      cy.contains('Naam').invoke('attr', 'for').then((id) => cy.get(`[id="${id}"]`).type('Test Event'));
      cy.contains('Datum').invoke('attr', 'for').then((id) => cy.get(`[id="${id}"]`).type('2025-12-10'));
      cy.contains('Start').invoke('attr', 'for').then((id) => cy.get(`[id="${id}"]`).type('10:00'));
      cy.contains('Eind').invoke('attr', 'for').then((id) => cy.get(`[id="${id}"]`).type('12:00'));
      cy.contains('Beschrijving').invoke('attr', 'for').then((id) => cy.get(`[id="${id}"]`).type('Beschrijving hier'));
      // no need to interact with Type select for this test (naam and datum are required)
    });

    cy.intercept('POST', 'http://localhost:3000/api/evenementen', (req) => {
      expect(req.body.naam).to.equal('Test Event');
      req.reply({ statusCode: 201, body: { evenementID: 555, ...req.body } });
    }).as('postEvent');

    cy.contains('Nieuw').closest('div').within(() => {
      cy.contains('Opslaan').click();
    });

    cy.wait('@postEvent');
    cy.contains('Nieuw').should('not.exist');
  });

  it('Opent Aanwezigen lijst en verstuurt PDF naar gebruiker', () => {
    const events = [ { evenementID: 200, naam: 'Event Met Aanwezigen', datum: '2025-12-15', startuur: '09:00', einduur: '11:00', type: 'ACTIVITEIT' } ];

    const attendees = { items: [ { aanwezigheidID: 1, voornaam: 'Pieter', familienaam: 'Peeters', email: 'pieter@example.com' } ] };

    cy.intercept('GET', 'http://localhost:3000/api/evenementen', { statusCode: 200, body: events }).as('getEvents2');
    // when opening attendee dialog the component will fetch this path:
    cy.intercept('GET', 'http://localhost:3000/api/aanwezigheden/event/200', { statusCode: 200, body: attendees }).as('getAttendees');

    cy.visit('http://localhost:5173/aanwezigheden');
    cy.wait(['@me', '@getEvents2']);

    // open beheer view
    cy.contains('Beheer').click();

    // click the Groups icon (Aanwezigen & PDF)
    // find the tile for our event and click the first IconButton (Groups)
    cy.contains('Event Met Aanwezigen').closest('.MuiPaper-root').within(() => {
      cy.get('button').eq(0).click();
    });

    cy.wait('@getAttendees');
    cy.contains('Event Met Aanwezigen').should('be.visible');

    // intercept PDF POST and stub alert
    const alertStub = cy.stub();
    cy.on('window:alert', alertStub);
    cy.intercept('POST', 'http://localhost:3000/api/evenementen/200/pdf-aanwezigheden', (req) => {
      expect(req.body.email).to.equal('admin@example.com');
      req.reply({ statusCode: 200, body: { ok: true } });
    }).as('postPdf');

    cy.contains('Mail PDF naar mij').click();
    cy.wait('@postPdf');
    cy.wrap(null).then(() => {
      expect(alertStub.getCall(0)).to.exist;
      expect(alertStub.getCall(0).args[0]).to.match(/PDF verzonden naar/);
    });
  });

  it('Bewerkt en verwijdert een evenement', () => {
    const events = [ { evenementID: 300, naam: 'Te Bewerken', datum: '2025-12-20', startuur: '13:00', einduur: '15:00', type: 'ACTIVITEIT' } ];
    cy.intercept('GET', 'http://localhost:3000/api/evenementen', { statusCode: 200, body: events }).as('getEvents3');

    cy.visit('http://localhost:5173/aanwezigheden');
    cy.wait(['@me', '@getEvents3']);

    // switch to beheer and click edit for the event
    cy.contains('Beheer').click();
    cy.contains('Te Bewerken').closest('.MuiPaper-root').within(() => {
      // second icon is edit (Groups, Edit, Delete)
      cy.get('button').eq(1).click();
    });

    // dialog title should be 'Bewerken'
    cy.contains('Bewerken').should('be.visible');

    // change name and submit -> intercept PATCH
    // set the Naam field globally (Dialog fields render in a portal)
    cy.contains('Naam').should('exist').invoke('attr', 'for').then((id) => {
      cy.get(`[id="${id}"]`).clear();
      cy.get(`[id="${id}"]`).type('Bewerkt Naam');
    });

    cy.intercept('PATCH', 'http://localhost:3000/api/evenementen/300', (req) => {
      expect(req.body.naam).to.equal('Bewerkt Naam');
      req.reply({ statusCode: 200, body: { ok: true } });
    }).as('patchEvent');

    // click the global Opslaan button inside the dialog (force in case of overlay)
    cy.contains('button', 'Opslaan').click({ force: true });

    cy.wait('@patchEvent');
    cy.contains('Bewerken').should('not.exist');

    // delete the event
    // prepare DELETE intercept, stub confirm, then click delete button inside the event paper
    cy.intercept('DELETE', 'http://localhost:3000/api/evenementen/300', { statusCode: 200, body: { ok: true } }).as('delEvent');
    cy.contains('Te Bewerken').closest('.MuiPaper-root').within(() => {
      cy.window().then((win) => cy.stub(win, 'confirm').returns(true));
      cy.get('button').eq(2).click();
    });
    cy.wait('@delEvent');
  });
});
