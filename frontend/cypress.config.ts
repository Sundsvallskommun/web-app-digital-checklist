import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    supportFile: false,
    baseUrl: 'http://localhost:3000',
    env: {
      userEmail: 'karin.andersson@example.com',
      userPassword: 'password',
      apiUrl: 'http://localhost:3001',
    },
    viewportWidth: 1440,
    viewportHeight: 1024,
    video: false,
    screenshotOnRunFailure: false,
    // The line below is needed to fix an intermittent error where
    // Cypress for some reason bypasses the route intercept and tries to
    // fetch from real backend instead, resulting in a 401 (since cypress is not
    // authorized). The error occurs seldomly and several tests in a suite may
    // pass when suddenly the tenth, eleventh, or.. fails.
    chromeWebSecurity: false,
    setupNodeEvents(on, config) {
      require('./cypress/plugins/index.ts')(on, config);

      // It's IMPORTANT to return the config object
      // with any changed environment variables
      return config;
    },
  },
});
