const { SiteSettings } = require('../models');

// There is exactly one SiteSettings document. Since there's no natural
// unique field to key it on, we enforce "only one" here rather than in
// the schema: always read/write via this service, never SiteSettings
// directly, and it will create the default doc on first read.
async function getOrCreateSettings() {
  let settings = await SiteSettings.findOne();
  if (!settings) {
    settings = await SiteSettings.create({});
  }
  return settings;
}

async function updateSettings(patch) {
  const settings = await getOrCreateSettings();
  Object.assign(settings, patch);
  await settings.save();
  return settings;
}

module.exports = { getOrCreateSettings, updateSettings };
