// cypress/e2e/spec.cy.js
describe('General', () => {
  it('draait de applicatie', () => {
    cy.visit('http://localhost:5173');
    cy.get('h1').should('exist');
  });

  // 👇 1
  it('should login', () => {
    cy.login('jasper.huyghe@outlook.be','hashed_pw_123')
  });
});



