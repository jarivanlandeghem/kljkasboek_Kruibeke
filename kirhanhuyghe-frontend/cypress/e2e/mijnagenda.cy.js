describe('Aanwezigheden - Mijn Agenda flows', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.window().then((win) => win.localStorage.setItem('jwtToken', 'fake-jwt-token'));

    cy.intercept('GET', '**/api/users/me', { statusCode: 200, body: { userid: 2, voornaam: 'Test', roles: ['user'] } }).as('me');
  });

  it('Wijzigt status naar aanwezig (geen validatie errors)', () => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    const date1 = d.toISOString().split('T')[0];
    const events = [
      { evenementID: 100, naam: 'Mijn Test Event', datum: date1, startuur: '10:00', einduur: '12:00', type: 'ACTIVITEIT' }
    ];

    // attendance belongs to the current user and is already PRESENT
    const attendances = [
      { aanwezigheidID: 900, evenementID: 100, userID: 2, status: 'PRESENT', reden: null, aangepast_startuur: null, aangepast_einduur: null }
    ];

    cy.intercept('GET', '**/api/evenementen*', { statusCode: 200, body: events }).as('getEvents');
    cy.intercept('GET', '**/api/aanwezigheden*', { statusCode: 200, body: attendances }).as('getAttendances');

    cy.visit('http://localhost:5173/aanwezigheden');
    cy.wait(['@me', '@getEvents', '@getAttendances']);

    // open the attendance dialog for our event
    cy.contains('Mijn Test Event').closest('div').within(() => {
      cy.contains('Wijzigen').click();
    });

    // dialog should open
    cy.contains('Ben je erbij?').should('be.visible');

    // intercept PATCH and assert payload for PRESENT
    cy.intercept('PATCH', '**/api/aanwezigheden/*', (req) => {
      expect(req.body.status).to.equal('PRESENT');
      expect(req.body.reden).to.be.null;
      expect(req.body.aangepast_startuur).to.be.null;
      expect(req.body.aangepast_einduur).to.be.null;
      req.reply({ statusCode: 200, body: { ok: true } });
    }).as('patchPresent');

    cy.contains('Ben je erbij?').closest('div').within(() => {
      // Opslaan without changing should succeed and trigger PATCH
      cy.contains('Opslaan').click();
    });

    cy.wait('@patchPresent');
    cy.contains('Ben je erbij?').should('not.exist');
  });

  it('Wijzigt naar Aangepast (PARTIAL) and validates inputs', () => {
    const d2 = new Date();
    d2.setDate(d2.getDate() + 4);
    const date2 = d2.toISOString().split('T')[0];
    const events = [
      { evenementID: 101, naam: 'Aangepast Event', datum: date2, startuur: '09:00', einduur: '11:00', type: 'ACTIVITEIT' }
    ];

    const attendances = [
      { aanwezigheidID: 901, evenementID: 101, userID: 2, status: 'PRESENT' }
    ];

    cy.intercept('GET', '**/api/evenementen*', { statusCode: 200, body: events }).as('getEvents2');
    cy.intercept('GET', '**/api/aanwezigheden*', { statusCode: 200, body: attendances }).as('getAttendances2');

    cy.visit('http://localhost:5173/aanwezigheden');
    cy.wait(['@me', '@getEvents2', '@getAttendances2']);

    cy.contains('Aangepast Event').closest('div').within(() => {
      cy.contains('Wijzigen').click();
    });

    cy.contains('Ben je erbij?').should('be.visible');

    // click Aangepast and submit without filling required fields -> inputs should be marked invalid
    // click Aangepast and attempt to save (do not scope - labels may render in portal)
    cy.contains('button', 'Aangepast').click({ force: true });
    cy.contains('Opslaan').click();

    // the reason label/input should now exist globally
    cy.contains('Reden').should('exist').invoke('attr', 'for').then((id) => {
      cy.get(`[id="${id}"]`).should('have.attr', 'aria-invalid', 'true');
      cy.get(`[id="${id}"]`).clear();
      cy.get(`[id="${id}"]`).type('Ik moet vroeger vertrekken');
    });

    // fill the time inputs by their labels
    cy.contains('Van').should('exist').invoke('attr', 'for').then((id) => {
      cy.get(`[id="${id}"]`).type('09:30');
    });
    cy.contains('Tot').should('exist').invoke('attr', 'for').then((id) => {
      cy.get(`[id="${id}"]`).type('10:30');
    });

    // intercept patch and assert payload
    cy.intercept('PATCH', '**/api/aanwezigheden/*', (req) => {
      expect(req.body.status).to.equal('PARTIAL');
      expect(req.body.reden).to.equal('Ik moet vroeger vertrekken');
      expect(req.body.aangepast_startuur).to.equal('09:30');
      expect(req.body.aangepast_einduur).to.equal('10:30');
      req.reply({ statusCode: 200, body: { ok: true } });
    }).as('patchPartial');

    cy.contains('Ben je erbij?').closest('div').within(() => {
      cy.contains('Opslaan').click();
    });

    cy.wait('@patchPartial');
    cy.contains('Ben je erbij?').should('not.exist');
  });

  it('Wijzigt naar Afwezig (ABSENT) and validates reason', () => {
    const d3 = new Date();
    d3.setDate(d3.getDate() + 5);
    const date3 = d3.toISOString().split('T')[0];
    const events = [
      { evenementID: 102, naam: 'Afwezig Event', datum: date3, startuur: '14:00', einduur: '16:00', type: 'ACTIVITEIT' }
    ];
    const attendances = [
      { aanwezigheidID: 902, evenementID: 102, userID: 2, status: 'PRESENT' }
    ];

    cy.intercept('GET', '**/api/evenementen*', { statusCode: 200, body: events }).as('getEvents3');
    cy.intercept('GET', '**/api/aanwezigheden*', { statusCode: 200, body: attendances }).as('getAttendances3');

    cy.visit('http://localhost:5173/aanwezigheden');
    cy.wait(['@me', '@getEvents3', '@getAttendances3']);

    cy.contains('Afwezig Event').closest('div').within(() => {
      cy.contains('Wijzigen').click();
    });

    cy.contains('Ben je erbij?').should('be.visible');

    // select Afwezig and try to submit without reason -> textarea should be marked invalid
      // select Afwezig and try to save without reason
      cy.contains('button', 'Afwezig').click({ force: true });
      cy.contains('Opslaan').click();

      // reason label/input should be visible globally and invalid
      cy.contains('Reden').should('exist').invoke('attr', 'for').then((id) => {
        cy.get(`[id="${id}"]`).clear();
        cy.get(`[id="${id}"]`).type('Ziek');
      });

    cy.intercept('PATCH', '**/api/aanwezigheden/*', (req) => {
      expect(req.body.status).to.equal('ABSENT');
      expect(req.body.reden).to.equal('Ziek');
      expect(req.body.aangepast_startuur).to.be.null;
      expect(req.body.aangepast_einduur).to.be.null;
      req.reply({ statusCode: 200, body: { ok: true } });
    }).as('patchAbsent');

    cy.contains('Ben je erbij?').closest('div').within(() => {
      cy.contains('Opslaan').click();
    });

    cy.wait('@patchAbsent');
    cy.contains('Ben je erbij?').should('not.exist');
  });
});
