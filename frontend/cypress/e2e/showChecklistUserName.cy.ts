import { mockMe } from '../fixtures/mockMe';
import { mockOnboarding } from '../fixtures/mockOnboarding';

describe('Manager Overview Page -> /show-checklist ', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/me', mockMe);
    cy.intercept('GET', '**/onboarding', mockOnboarding);
    cy.visit('http://localhost:3000/manager-overview');
    cy.get('.zebratable-tbody tr')
      .eq(0)
      .within(() => {
        // Check if the button exists
        cy.get('button[aria-label="Visa nyanställningschecklista för Mar Han"]')
          .should('exist')
          // Click the button
          .click();
      });

    // Verify the URL after clicking the button
    cy.url().should('include', '/show-checklist');
  });

  // Header
  it('checks the presence and content of the status element', () => {
    cy.get('div[role="status"][aria-label="Nuvarande fas status: Försenad"]')
      .should('be.visible')
      .should('have.class', 'text-white')
      .should('have.class', 'h-[45px]')
      .should('have.class', 'w-44')
      .should('have.class', 'rounded-xl')
      .should('have.class', 'border-[1px]')
      .should('have.class', 'border-slate-500')
      .should('have.class', 'flex')
      .should('have.class', 'items-center')
      .should('have.class', 'justify-center')
      .should('have.class', 'bg-red-700')
      .should('have.text', 'Försenad');
  });

  it('validates the content of the onboarding checklist for Mar Han (Medarbetare is the  selected radiovalue', () => {
    cy.contains('span', 'Min översikt').should('exist');
    cy.contains('svg', 'Gå tillbaka till översikt').should('exist');
    cy.contains('a', 'Tillbaka till översikt').should('exist');
    cy.contains('h1', 'Checklista Mar Han').should('exist');
  });

  it('validates the structure and content of the profile container', () => {
    cy.visit('http://localhost:3000/show-checklist/aaa12bbb');

    cy.get('.profile-container.minimal[aria-label="Användar profil"]').within(() => {
      cy.get('.profile-picture').within(() => {
        cy.get('.profile-picture-img[role="img"][aria-label="Foto av den inloggade anställda"]').should(
          'have.attr',
          'style',
          'background-image: url("http://localhost:3001/api/employee/123123123/personimage?width=224");'
        );
      });

      cy.get('p.profile-title').should('have.text', 'Mel Eli');

      cy.get('p.profile-subtitle').should('have.text', ' ');
    });
  });

  it('validates the structure and content of the fieldset container', () => {
    cy.visit('http://localhost:3000/show-checklist/aaa12bbb');

    cy.get('fieldset.mt-12').within(() => {
      cy.get('legend.mb-2.text-2xl.font-semibold').should('have.text', 'Visa Checklista');

      cy.get('input[type="radio"][id="chef-radio"]').check();

      // Check if 'Chef' radio button is checked
      cy.get('input[type="radio"]#chef-radio[name="employment title"]')
        .should('have.value', 'Chef')
        .should('be.checked'); // Assert that the radio button is checked

      cy.get('label[for="chef-radio"]').should('contain.text', 'Chef');

      cy.get('input[type="radio"]#medarbetare-radio[name="employment title"]')
        .should('have.value', 'Medarbetare')
        .should('not.be.checked'); // Assert that the radio button is not checked

      cy.get('label[for="medarbetare-radio"]').should('contain.text', 'Medarbetare');
    });
  });
  // Test case: checks if clicking on the 'Min översikt' element navigate the user back to the manager overview page
  it('navigates back to the manager overview page when the "Min översikt" element are clicked', () => {
    cy.visit('http://localhost:3000/show-checklist/aaa12bbb');

    const minOversikt = 'span:contains("Min översikt")';
    const managerOverviewUrl = 'http://localhost:3000/manager-overview';

    // Wait for a while to ensure the element is attached to the DOM
    cy.wait(500);

    // Test clicking on the 'Min översikt' element
    cy.get(minOversikt).should('exist').eq(0).click();
    cy.url().should('eq', managerOverviewUrl);

    // Navigate back to the initial page (e.g., checklist page)
    cy.visit('http://localhost:3000/show-checklist');
  });
});

describe('Test for Checklist Page, for both Radio Values', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/me', mockMe);
    cy.intercept('GET', '**/onboarding', mockOnboarding);
    cy.visit('http://localhost:3000/manager-overview');
    cy.get('.zebratable-tbody tr')
      .eq(0)
      .within(() => {
        cy.get('button[aria-label="Visa nyanställningschecklista för Mar Han"]').should('exist').click();
      });
    cy.url().should('include', '/show-checklist');
  });

  context('when Chef is selected', () => {
    beforeEach(() => {
      cy.get('input[type="radio"][id="chef-radio"]').check();
    });

    it('checks the content of the checklist page', () => {
      cy.get('header[aria-label="Inför första dagen - Klart senast 2023-02-27"]').should('exist');
      cy.get('h2').contains('Inför första dagen');
      cy.get('input[type="checkbox"][value="Klart-false"]').should('exist');
      cy.get('input[type="checkbox"][value="Ej aktuellt-false"]').should('exist');
    });

    it('checks the content of the activity description and the "Läs mer" button', () => {
      // Find the container with the activity description
      cy.get('td.zebratable-tbody-td').within(() => {
        cy.get('h3')
          .contains('Boka in den nyanställde på kommunens gemensamma Infoträff för nya medarbetare')
          .should('exist');

        // Check the "Läs mer" button
        cy.get('button.textAccordion-toggle')
          .should('have.attr', 'aria-expanded', 'false')
          .within(() => {
            cy.contains('span', 'Läs mer').should('exist');
            cy.get('svg[data-testid="KeyboardArrowDownIcon"]')
              .should('have.attr', 'viewBox', '0 0 24 24')
              .should('have.attr', 'aria-hidden', 'true');
          });
      });
    });

    it('checks the content that appears when the "Läs mer" button is clicked', () => {
      // Find the first "Läs mer" button and click it
      cy.get('button.textAccordion-toggle[aria-expanded="false"]:first').click();

      // Check the content that appears after clicking the button
      cy.get('div.task-text').within(() => {
        cy.get(
          'a[href="https://intranat.sundsvall.se/inloggad/s/anstallning-och-arbetsmiljo/ny-pa-jobbet/introduktion-for-dig-som-ar-nyanstalld/utbildningar/informationstraff-for-nya-medarbetare"]'
        )
          .contains(
            'https://intranat.sundsvall.se/inloggad/s/anstallning-och-arbetsmiljo/ny-pa-jobbet/introduktion-for-dig-som-ar-nyanstalld/utbildningar/informationstraff-for-nya-medarbetare'
          )
          .should('exist');

        // Verify that the external link is accessible and returns a 200 status code
        cy.request({
          url: 'https://intranat.sundsvall.se/inloggad/s/anstallning-och-arbetsmiljo/ny-pa-jobbet/introduktion-for-dig-som-ar-nyanstalld/utbildningar/informationstraff-for-nya-medarbetare',
          followRedirect: true,
        }).then((response) => {
          expect(response.status).to.eq(200);
        });
      });

      // Check the "Dölj information" button
      cy.get('button.textAccordion-toggle[aria-expanded="true"]').within(() => {
        cy.contains('span', 'Dölj information').should('exist');
        cy.get('svg[data-testid="KeyboardArrowUpIcon"]')
          .should('have.attr', 'viewBox', '0 0 24 24')
          .should('have.attr', 'aria-hidden', 'true');
      });
    });

    it('checks that the content reverts back to "Läs mer" button when "Dölj information" is clicked', () => {
      // Find the first "Läs mer" button and click it
      cy.get('button.textAccordion-toggle[aria-expanded="false"]:first').click();

      // Find the "Dölj information" button and click it
      cy.get('button.textAccordion-toggle[aria-expanded="true"]:first').click();

      // Check that the "Läs mer" button is visible again
      cy.get('button.textAccordion-toggle[aria-expanded="false"]:first').contains('Läs mer').should('exist');
    });

    it('checks that clicking the "Lägg till en aktivitet" button displays the new activity section', () => {
      // Find the first "Lägg till en aktivitet" button and click it
      cy.get('button[aria-label="Lägg till en aktivitet"]:first').click();

      // Check if the new activity section is visible
      cy.get('section.mb-20').within(() => {
        cy.get('p.font-semibold').contains('Aktivitet').should('exist');
        cy.get('input[aria-label="Beskrivning"]').should('exist');
        cy.get('input[aria-label="Brödtext/Länk"]').should('exist');
        cy.get('button[aria-label="Spara aktivitet"]').should('exist');
      });
    });
  });

  context('when Medarbetare is selected', () => {
    beforeEach(() => {
      cy.get('input[type="radio"][id="medarbetare-radio"]').check();
    });

    it('checks the content of the checklist page', () => {
      cy.get('header[aria-label="Information till dig som är nyanställd - Klart senast 2023-08-28"]').should('exist');
      cy.get('h2').contains('Information till dig som är nyanställd');
      cy.get('input[type="checkbox"][value="Klart-false"]').should('exist');
      cy.get('input[type="checkbox"][value="Ej aktuellt-false"]').should('exist');
    });

    it('checks the content of the activity description and the "Läs mer" button', () => {
      // Find the container with the activity description
      cy.get('td.zebratable-tbody-td').within(() => {
        cy.get('h3')
          .contains(
            'Läs in dig på informationen som finns under varje rubrik på Inloggad och bocka succesivt av här i din checklista. Utbildningsinformation för delarna 1–6 hittar du på Inloggad och länkas direkt här i checklistan'
          )
          .should('exist');

        // Check the "Läs mer" button
        cy.get('button.textAccordion-toggle')
          .should('have.attr', 'aria-expanded', 'false')
          .within(() => {
            cy.contains('span', 'Läs mer').should('exist');
            cy.get('svg[data-testid="KeyboardArrowDownIcon"]')
              .should('have.attr', 'viewBox', '0 0 24 24')
              .should('have.attr', 'aria-hidden', 'true');
          });
      });
    });

    it('checks the content that appears when the "Läs mer" button is clicked', () => {
      // Find the first "Läs mer" button and click it
      cy.get('button.textAccordion-toggle[aria-expanded="false"]:first').click();

      // Check the content that appears after clicking the button
      cy.get('div.task-text').within(() => {
        cy.get(
          'a[href="https://intranat.sundsvall.se/inloggad/s/anstallning-och-arbetsmiljo/ny-pa-jobbet/introduktion-for-dig-som-ar-nyanstalld"]'
        )
          .contains(
            'https://intranat.sundsvall.se/inloggad/s/anstallning-och-arbetsmiljo/ny-pa-jobbet/introduktion-for-dig-som-ar-nyanstalld'
          )
          .should('exist');

        // Verify that the external link is accessible and returns a 200 status code
        cy.request({
          url: 'https://intranat.sundsvall.se/inloggad/s/anstallning-och-arbetsmiljo/ny-pa-jobbet/introduktion-for-dig-som-ar-nyanstalld',
          followRedirect: true,
        }).then((response) => {
          expect(response.status).to.eq(200);
        });
      });

      // Check the "Dölj information" button
      cy.get('button.textAccordion-toggle[aria-expanded="true"]').within(() => {
        cy.contains('span', 'Dölj information').should('exist');
        cy.get('svg[data-testid="KeyboardArrowUpIcon"]')
          .should('have.attr', 'viewBox', '0 0 24 24')
          .should('have.attr', 'aria-hidden', 'true');
      });
    });

    it('checks that the content reverts back to "Läs mer" button when "Dölj information" is clicked', () => {
      // Find the first "Läs mer" button and click it
      cy.get('button.textAccordion-toggle[aria-expanded="false"]:first').click();

      // Find the "Dölj information" button and click it
      cy.get('button.textAccordion-toggle[aria-expanded="true"]:first').click();

      // Check that the "Läs mer" button is visible again
      cy.get('button.textAccordion-toggle[aria-expanded="false"]:first').contains('Läs mer').should('exist');
    });

    it('checks that clicking the "Lägg till en aktivitet" button displays the new activity section', () => {
      // Find the first "Lägg till en aktivitet" button and click it
      cy.get('button[aria-label="Lägg till en aktivitet"]:first').click();

      // Check if the new activity section is visible
      cy.get('section.mb-20').within(() => {
        cy.get('p.font-semibold').contains('Aktivitet').should('exist');
        cy.get('input[aria-label="Beskrivning"]').should('exist');
        cy.get('input[aria-label="Brödtext/Länk"]').should('exist');
        cy.get('button[aria-label="Spara aktivitet"]').should('exist');
      });
    });
  });
});
