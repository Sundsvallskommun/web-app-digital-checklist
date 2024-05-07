import { mockMe } from '../fixtures/mockMe';
import { mockOnboarding } from '../fixtures/mockOnboarding';

describe('Onboarding checklist for newly hired manager', () => {
  beforeEach(() => {
    const initialMockOnboarding = JSON.parse(JSON.stringify(mockOnboarding));
    cy.intercept('GET', '**/me', mockMe);
    cy.intercept('GET', '**/onboarding', initialMockOnboarding);
    cy.visit('http://localhost:3000/show-checklist');
  });

  it('validates the content of the onboarding checklist for newly hired manager', () => {
    // Header
    cy.contains('svg', 'Gå tillbaka till översikt').should('exist');
    cy.contains('a', 'Tillbaka till översikt').should('exist');
    cy.contains('h1', 'Checklista').should('exist');
    cy.contains('h2', 'Information till dig som är nyanställd').should('exist');
    cy.contains('div.mb-4 > p', 'Klart senast 2023-12-19').should('exist');
    cy.get('input[type="checkbox"][aria-label="Markera alla klart för Information till dig som är nyanställd"]').should(
      'exist'
    );
    // Phase/table section
    cy.get('table.zebratable').should('exist').and('have.attr', 'aria-label', '1 rader på 1 sidor');
    cy.get('tbody.zebratable-tbody > tr.zebratable-tbody-tr')
      .first()
      .within(() => {
        cy.get('td.zebratable-tbody-td')
          .first()
          .contains(
            'h3',
            'Läs in dig på informationen som finns under varje rubrik på Inloggad och bocka succesivt av här i din checklista. Utbildningsinformation för delarna 1–6 hittar du på Inloggad och länkas direkt här i checklistan'
          )
          .should('exist');

        cy.get('td.zebratable-tbody-td')
          .eq(1)
          .find(
            'input[type="checkbox"][aria-label="Markera uppgiften som slutförd Läs in dig på informationen som finns under varje rubrik på Inloggad och bocka succesivt av här i din checklista. Utbildningsinformation för delarna 1–6 hittar du på Inloggad och länkas direkt här i checklistan"]'
          )
          .should('exist');
      });
  });

  it('tests click event and content changes on the: Läs mer and Dölj information button', () => {
    // Check if the "Läs mer" button exists and is not expanded
    cy.get('button.textAccordion-toggle[aria-expanded="false"]')
      .should('exist')
      .contains('span', 'Läs mer')
      .should('exist');

    // Check if the SVG icon exists within the "Läs mer" button
    cy.get('button.textAccordion-toggle[aria-expanded="false"]')
      .find('svg[data-testid="KeyboardArrowDownIcon"]')
      .should('exist');

    // Click the "Läs mer" button
    cy.get('button.textAccordion-toggle[aria-expanded="false"]').eq(0).click();

    // Check if the "Dölj information" button exists and is expanded
    cy.get('button.textAccordion-toggle[aria-expanded="true"]')
      .should('exist')
      .contains('span', 'Dölj information')
      .should('exist');

    // Check if the SVG icon exists within the "Dölj information" button
    cy.get('button.textAccordion-toggle[aria-expanded="true"]')
      .find('svg[data-testid="KeyboardArrowUpIcon"]')
      .should('exist');

    // Check if the link is present after clicking the button
    cy.get(
      'div.task-text a[href="https://intranat.sundsvall.se/inloggad/s/anstallning-och-arbetsmiljo/ny-pa-jobbet/introduktion-for-dig-som-ar-nyanstalld"]'
    ).should('exist');

    // Click the "Dölj information" button
    cy.get('button.textAccordion-toggle[aria-expanded="true"]').eq(0).click();

    // Check if the "Läs mer" button exists and is not expanded
    cy.get('button.textAccordion-toggle[aria-expanded="false"]')
      .should('exist')
      .contains('span', 'Läs mer')
      .should('exist');

    // Check if the SVG icon exists within the "Läs mer" button
    cy.get('button.textAccordion-toggle[aria-expanded="false"]')
      .find('svg[data-testid="KeyboardArrowDownIcon"]')
      .should('exist');

    // Check if the link is not present after clicking the "Dölj information" button
    cy.get(
      'div.task-text a[href="https://intranat.sundsvall.se/inloggad/s/anstallning-och-arbetsmiljo/ny-pa-jobbet/introduktion-for-dig-som-ar-nyanstalld"]'
    ).should('not.exist');
  });

  it('tests if the link has the correct href attribute', () => {
    // Click the "Läs mer" button
    cy.get('button.textAccordion-toggle[aria-expanded="false"]').eq(0).click();

    // Get the link and check its href attribute
    cy.get(
      'div.task-text a[href="https://intranat.sundsvall.se/inloggad/s/anstallning-och-arbetsmiljo/ny-pa-jobbet/introduktion-for-dig-som-ar-nyanstalld"]'
    )
      .should('have.attr', 'href')
      .and(
        'equal',
        'https://intranat.sundsvall.se/inloggad/s/anstallning-och-arbetsmiljo/ny-pa-jobbet/introduktion-for-dig-som-ar-nyanstalld'
      );
  });

  it('toggles the checkbox state when clicked and triggers API call', () => {
    // Intercept the PUT request
    cy.intercept('PUT', 'http://localhost:3001/api/onboarding/tasks/update/*', {
      statusCode: 200,
      body: {
        success: true,
      },
    }).as('updateTask');

    const checkboxSelector =
      'td.zebratable-tbody-td input[type="checkbox"][aria-label="Markera uppgiften som slutförd Läs in dig på informationen som finns under varje rubrik på Inloggad och bocka succesivt av här i din checklista. Utbildningsinformation för delarna 1–6 hittar du på Inloggad och länkas direkt här i checklistan"]';

    // Check the initial state of the checkbox
    cy.get(checkboxSelector).should('not.be.checked');

    // Click the checkbox and verify it is checked
    cy.get(checkboxSelector).check();

    // Wait for the API call to complete and assert the request properties
    cy.wait('@updateTask').then((interception) => {
      assert.isNotNull(interception.response?.body, 'API call has data');
      assert.equal(interception.request.method, 'PUT', 'Request method is PUT');
      assert.equal(interception.response?.statusCode, 200, 'Status code is 200');
    });

    // Re-query the checkbox, then click it again and verify it is unchecked
    cy.get(checkboxSelector).uncheck();
  });

  it('Checking the Markera alla klart checkbox state is false/not checked, also checking the api call', () => {
    cy.intercept('POST', 'http://localhost:3001/api/onboarding/tasks/bulkUpdate', {
      statusCode: 200,
      body: {
        success: true,
      },
    }).as('bulkUpdate');

    const markeraAllaKlartSelector =
      'input[type="checkbox"][aria-label="Markera alla klart för Information till dig som är nyanställd"]';

    // Check the initial state of the "Markera alla klart" checkbox
    cy.get(markeraAllaKlartSelector).should('not.be.checked');

    // Click the "Markera alla klart" checkbox and verify all the checkboxes are checked
    cy.get(markeraAllaKlartSelector).click();

    // Wait for the API call to complete and assert the request properties
    cy.wait('@bulkUpdate').then((interception) => {
      assert.isNotNull(interception.response?.body, 'API call has data');
      assert.equal(interception.request.method, 'POST', 'Request method is POST');
      assert.equal(interception.response?.statusCode, 200, 'Status code is 200');
    });
  });

  it('Checking that the Markera alla klart checkbox state is true/checked', () => {
    const modifiedMockOnboarding = JSON.parse(JSON.stringify(mockOnboarding));
    modifiedMockOnboarding.data.asEmployeeChecklist.phases['9900'].tasks[0].completed = true;

    cy.intercept('GET', '**/onboarding', modifiedMockOnboarding).as('getOnboarding');
    cy.wait('@getOnboarding');
    const markeraAllaKlartSelector =
      'input[type="checkbox"][aria-label="Markera alla klart för Information till dig som är nyanställd"]';

    // Check the initial state of the "Markera alla klart" checkbox
    cy.get(markeraAllaKlartSelector).should('be.checked');
  });
});
