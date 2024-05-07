import { mockMe } from '../fixtures/mockMe';
import { mockOnboarding } from '../fixtures/mockOnboarding';

describe('Manager Overview Page -> Checklist for Logged in User', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/me', mockMe);
    cy.intercept('GET', '**/onboarding', mockOnboarding);
    cy.visit('http://localhost:3000/manager-overview');
  });

  it('renders the new employee table', () => {
    cy.get('.zebratable').should('exist');
  });

  it('displays the correct number of rows', () => {
    const numberOfRows = mockOnboarding.data.asManagerChecklists.length;
    cy.get('.zebratable-tbody tr').should('have.length', numberOfRows);
  });

  it('displays the correct table headers', () => {
    const expectedHeaders = ['Anställd', 'Användarnamn', 'Progress chef', 'Progress anställd'];

    cy.get('.zebratable-thead-th').each(($header, index) => {
      cy.wrap($header).should('contain', expectedHeaders[index]);
    });
  });

  it('displays the correct content in the first row', () => {
    cy.get('.zebratable-tbody tr')
      .eq(0)
      .within(() => {
        cy.get('.profile-title').should('contain', 'Mar Han');
        cy.get('.profile-subtitle').should('contain', 'Konsult');
        cy.get('h3').should('contain', 'Försenad gentemot Mar');
        cy.get('[aria-label="Medarbetare progress:"]').should('contain', '0/6');
        cy.get('button[aria-label="Visa nyanställningschecklista för Mar Han"]').should('exist');
      });
  });

  it('renders the "Visa min checklista" button and is not disabled', () => {
    cy.get('button[aria-label="Visa min checklista"]').should('exist').and('not.be.disabled');
  });

  it('successfully get Visa min anställnings checklista and the click event exist and send user on to http://localhost:3000/show-checklist', () => {
    cy.get('button[aria-label="Visa min checklista"]').should('exist').click();
    cy.url().should('eq', 'http://localhost:3000/show-checklist');
  });
});
