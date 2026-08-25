import { defineCliConfig } from 'sanity/cli';

export default defineCliConfig({
  api: {
    projectId: 'aydnlbgw',
    dataset: 'production',
  },

  // Vastgelegd zodat `sanity deploy` niet interactief om een hostname vraagt.
  studioHost: 'gameinside',
});
