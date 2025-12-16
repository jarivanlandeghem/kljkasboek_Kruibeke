// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Disable CSS animations/transitions to avoid flakiness in tests
Cypress.on('window:before:load', (win) => {
	const style = win.document.createElement('style');
	style.innerHTML = `* { transition-duration: 0s !important; animation-duration: 0s !important; }`;
	win.document.head.appendChild(style);
});
