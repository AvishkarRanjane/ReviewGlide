/**
 * ReviewGlide — Smart Dynamic Review Generator Engine
 * Generates context-aware, authentic review text based on star ratings and selected highlight tags.
 */

export const TAG_PRESETS = {
  5: [
    { id: "excellent_service", label: "⚡ Fast & Friendly", phrase: "The service was exceptionally fast and friendly." },
    { id: "top_quality", label: "⭐ Top Quality", phrase: "The quality of work exceeded all my expectations." },
    { id: "professional", label: " Business Professional", phrase: "Highly professional team with incredible attention to detail." },
    { id: "great_value", label: " Fair Pricing", phrase: "Great value for money and transparent pricing." },
    { id: "clean_neat", label: " Clean & Organized", phrase: "The studio space was spotless and well organized." }
  ],
  4: [
    { id: "solid_service", label: " Solid Service", phrase: "Overall solid service and good customer experience." },
    { id: "good_quality", label: " Good Quality", phrase: "The output was of very good quality." },
    { id: "punctual", label: " Punctual", phrase: "Everything was delivered on time as promised." },
    { id: "helpful_staff", label: " Helpful Staff", phrase: "Staff was polite and willing to accommodate requests." }
  ],
  3: [
    { id: "decent", label: " Decent Experience", phrase: "Decent overall experience, met basic expectations." },
    { id: "average", label: " Average Speed", phrase: "Service speed was reasonable, though could be faster." },
    { id: "fair", label: " Fair Output", phrase: "The work quality was acceptable for the price." }
  ],
  2: [
    { id: "slow", label: "⏳ Slow Service", phrase: "Service was noticeably slower than expected." },
    { id: "needs_work", label: "⚠️ Needs Improvement", phrase: "There is clear room for improvement in communication." }
  ],
  1: [
    { id: "poor", label: " Unresponsive", phrase: "Unsatisfactory experience with poor responsiveness." },
    { id: "disappointed", label: " Disappointed", phrase: "Did not meet expectations or resolve my issues." }
  ]
};

export const BASE_SENTENCES = {
  5: [
    "I had a fantastic experience here! {tags} Would definitely recommend to anyone looking for top-notch service.",
    "Outstanding service from start to finish! {tags} I will certainly be coming back again.",
    "Five stars all around! {tags} Truly impressed by their dedication and craftsmanship."
  ],
  4: [
    "Really happy with my experience here. {tags} Solid work and would gladly visit again.",
    "Great overall experience. {tags} Appreciate their good communication and support."
  ],
  3: [
    "An okay experience overall. {tags} Meets standard expectations, nothing major to complain about.",
    "Average service visit. {tags} Satisfactory result."
  ],
  2: [
    "My visit was below expectations. {tags} Hope they work on improving service quality soon."
  ],
  1: [
    "Very disappointed with this visit. {tags} Would recommend addressing customer concerns promptly."
  ]
};

let variationIndex = 0;

export function generateReviewText(rating, selectedTagIds = []) {
  const templates = BASE_SENTENCES[rating] || BASE_SENTENCES[5];
  const template = templates[variationIndex % templates.length];
  
  const ratingTags = TAG_PRESETS[rating] || TAG_PRESETS[5];
  const activePhrases = ratingTags
    .filter(tag => selectedTagIds.includes(tag.id))
    .map(tag => tag.phrase);

  let tagsInsert = "";
  if (activePhrases.length > 0) {
    tagsInsert = activePhrases.join(" ") + " ";
  }

  return template.replace("{tags}", tagsInsert).trim();
}

export function rotateVariation() {
  variationIndex++;
}
