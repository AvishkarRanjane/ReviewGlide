/**
 * ReviewGlide — Smart Dynamic Review Generator Engine
 * Customized for Avishkar Photos
 */

export const TAG_PRESETS = {
  5: [
    { id: "fast_friendly", label: "⚡ Fast & Friendly", phrase: "The photography session was incredibly smooth, professional, and friendly." },
    { id: "top_quality", label: "⭐ Exceptional Quality", phrase: "The photo quality, lighting, and editing exceeded all my expectations." },
    { id: "professional", label: " Professional Studio", phrase: "Avishkar is a true professional with amazing attention to detail." },
    { id: "great_value", label: " Great Pricing", phrase: "Fair pricing with top-tier output." },
    { id: "highly_recommend", label: " Highly Recommended", phrase: "I would highly recommend Avishkar Photos to anyone looking for stunning photography." }
  ],
  4: [
    { id: "solid_work", label: " Great Work", phrase: "Overall great experience and solid photography work." },
    { id: "good_lighting", label: " Good Lighting & Edits", phrase: "Appreciated the nice lighting and clean edits." },
    { id: "punctual", label: " Punctual Delivery", phrase: "Delivered the photos on time as promised." }
  ],
  3: [
    { id: "decent", label: " Decent Session", phrase: "Decent photo session, met standard expectations." },
    { id: "average", label: " Fair Output", phrase: "The photos turned out okay." }
  ],
  2: [
    { id: "needs_work", label: "⚠️ Room for Improvement", phrase: "The experience was okay but could use better communication." }
  ],
  1: [
    { id: "disappointed", label: " Unsatisfactory", phrase: "Was disappointed with the overall experience." }
  ]
};

export const BASE_SENTENCES = {
  5: [
    "Had an absolute 5-star experience with Avishkar Photos! {tags} Will definitely come back for future photo sessions.",
    "Outstanding photography and service from Avishkar Photos! {tags} Truly impressed by the results.",
    "Five stars all around! {tags} Avishkar captured everything perfectly."
  ],
  4: [
    "Really happy with my experience at Avishkar Photos. {tags} Great quality work.",
    "Solid photography service! {tags} Thanks for the good experience."
  ],
  3: [
    "An okay experience overall at Avishkar Photos. {tags} Met basic expectations."
  ],
  2: [
    "My visit was below expectations. {tags} Hope for better service next time."
  ],
  1: [
    "Disappointed with this visit. {tags} Would appreciate addressing customer concerns."
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
