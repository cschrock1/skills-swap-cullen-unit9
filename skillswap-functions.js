function filterSkillsByCategory(skills, category) {
  if (category === 'All') {
    return skills;
  }
  return skills.filter((skill) => skill.category === category);
}

function calculateTotalCosts(hourlyRate, hours) {
  if (!Number.isFinite(hourlyRate) || hourlyRate < 0) {
    throw new RangeError('Hourly rate must be a finite, non-negative number.');
  }
  if (!Number.isFinite(hours) || hours < 0) {
    throw new RangeError('Hours must be a finite, non-negative number.');
  }
  return hourlyRate * hours;
}

function matchSkillsToUser(userNeeds, skills) {
  if (!userNeeds || typeof userNeeds.category !== 'string') {
    throw new TypeError('User needs must include a category.');
  }
  if (!Number.isFinite(userNeeds.maxPrice) || userNeeds.maxPrice < 0) {
    throw new RangeError('Maximum price must be a finite, non-negative number.');
  }
  return skills.filter(
    (skill) => skill.category === userNeeds.category && skill.price <= userNeeds.maxPrice
  );
}

const skillswapFunctions = {
  filterSkillsByCategory,
  calculateTotalCosts,
  matchSkillsToUser
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = skillswapFunctions;
}

if (typeof window !== "undefined") {
  window.SkillSwapFunctions = skillswapFunctions;
}