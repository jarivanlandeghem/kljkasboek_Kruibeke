// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
Cypress.Commands.add('login', (email, password) => { 
     Cypress.log({
    displayName: 'login',
  });
    cy.visit('http://localhost:5173/login'); cy.get('[data-cy=email_input]').clear(); 
    cy.get('[data-cy=email_input]').type(email); 
    cy.get('[data-cy=password_input]').clear(); 
    cy.get('[data-cy=password_input]').type(password);
    // support both `login_submit` and older `submit_btn` attribute names
    cy.get('[data-cy=login_submit], [data-cy=submit_btn]').first().click();
    // don't wait for an undefined alias here; tests should stub and wait for their own login intercepts

});

// Click helper: scroll into view, assert visible, wait a short moment, then click
Cypress.Commands.add(
  'clickWhenReady',
  { prevSubject: 'element' },
  (subject, options) => {
    return cy
      .wrap(subject)
      .scrollIntoView({ offset: { top: -100, left: 0 } })
      .should('be.visible')
      .wait(200)
      .click(options);
  },
);
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })