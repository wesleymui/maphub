// ***********************************************************
// This example support/component.ts is processed and
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
import './commands'
import React from 'react';
import { mount } from 'cypress/react18'
import ThemeProvider from '../../src/context/themeProvider';
import { firaSans, sofiaSansCondensed, boxIcons } from '../../src/app/fonts/fonts';

// Augment the Cypress namespace to include type definitions for
// your custom command.
// Alternatively, can be defined in cypress/support/component.d.ts
// with a <reference path="./component" /> at the top of your spec.
declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount
    }
  }
}

Cypress.Commands.add('mount', (component, options = {}) => {
  return mount((
    <body className={`${firaSans.variable} ${sofiaSansCondensed.variable} ${boxIcons.variable}`}>
      <ThemeProvider>
        {component}
      </ThemeProvider>
    </body>
  ), options);
})

// Example use:
// cy.mount(<MyComponent />)