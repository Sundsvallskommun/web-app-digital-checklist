import { mockMe } from '../fixtures/mockMe';
import { mockOnboarding } from '../fixtures/mockOnboarding';

describe('SSO Login Page -> /manager-overview', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/me', mockMe);
    cy.intercept('GET', '**/onboarding', mockOnboarding);

    cy.visit('http://localhost:3000/manager-overview');
  });

  it('displays the correct title', () => {
    cy.contains('h1', 'Checklistor för nyanställda').should('exist');
  });
});
