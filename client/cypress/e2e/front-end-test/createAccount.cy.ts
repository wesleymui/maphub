describe('successful registration', () => {
    it('should have valid input params', () => {
      cy.visit('/');
      cy.get('button:contains("Join Now")').click();
      cy.get('input#username')
        .type('mapHubber')
        .blur()
      
      cy.get('label#username-label').should('not.have.class', 'Mui-error');
  
      cy.get('input#email')
        .type('mapHubber@gmail.com')
        .blur()
  
      cy.wait(500);
      cy.get('label#email-label').should('not.have.class', 'Mui-error');

      cy.get('input#password')
        .type('mapHubber123')
        .blur()
      
      cy.wait(500)
      cy.get('label#password-label').should('not.have.class', 'Mui-error');

      cy.get('input#password-confirm')
        .type('mapHubber123')
        .blur()
      
      cy.wait(500)
      cy.get('label#password-confirm-label').should('not.have.class', 'Mui-error');

      cy.get('button:contains("Create Account")').click()

    }); 
  });
  