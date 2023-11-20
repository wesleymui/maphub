import 'cypress-file-upload';

beforeEach(() => {
  cy.log('Running Initialization');
});

declare global {
  namespace Cypress {
    interface Chainable<Subject> {
      loadVatican(): Chainable<Element>;
    }
  }
}

Cypress.on('log:added', logObject => console.log(logObject));

const special = 'file.spss';

Cypress.Commands.add('loadVatican', () => {
  cy.visit('/create');
  cy.get('button:contains("File")').click();
  cy.get('span:contains("Import")').click();
  cy.get('span:contains("Import File From Local Desktop")').click();
  cy.get('#import-file-upload-button').selectFile(
    [
      // { filePath: 'VAT_adm0.shp', encoding: 'utf-8' },
      // { filePath: 'VAT_adm0.dbf', encoding: 'utf-8' },
      './cypress/fixtures/VAT_adm0.dbf',
      './cypress/fixtures/VAT_adm0.shp',
      // 'VAT_adm0.shx',
    ],
    {
      force: true,
    },
  );
  cy.get('span:contains("NAME_ISO")').click();
  cy.get('p:contains("Confirm")').click();
});

export {};
