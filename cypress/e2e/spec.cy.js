describe('General', () => {
  // 👇 1
  it('draait de applicatie', () => {
    cy.visit('http://localhost:5173'); // 👈 2
    cy.get('h1').should('exist'); // 👈
  });
});