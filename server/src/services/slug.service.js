const slugify = require('slugify');

/**
 * Generates a unique slug for the given model by appending -2, -3, ...
 * if the base slug is already taken. Pass excludeId when updating an
 * existing document so it doesn't collide with itself.
 */
async function generateUniqueSlug(Model, text, excludeId = null) {
  const base = slugify(text, { lower: true, strict: true, trim: true });
  let slug = base;
  let counter = 2;

  while (true) {
    const query = { slug };
    if (excludeId) query._id = { $ne: excludeId };
    // eslint-disable-next-line no-await-in-loop
    const existing = await Model.findOne(query).select('_id');
    if (!existing) return slug;
    slug = `${base}-${counter}`;
    counter += 1;
  }
}

module.exports = { generateUniqueSlug };
