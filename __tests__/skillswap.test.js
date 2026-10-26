const { filterSkillsByCategory } = require('../skillswap-functions');
const { calculateTotalCosts } = require('../skillswap-functions');
const { matchSkillsToUser } = require('../skillswap-functions');

describe('filterSkillsByCategory', () => {
  const skills = [
    { title: 'Python Tutoring', category: 'Programming', price: 20 },
    { title: 'Guitar Lessons', category: 'Music', price: 15 },
    { title: 'Resume Review', category: 'Career', price: 0 },
    { title: 'Web Development', category: 'Programming', price: 25 }
  ];

  test('filters skills by category "Programming"', () => {
    const result = filterSkillsByCategory(skills, 'Programming');
    expect(result).toEqual([
      { title: 'Python Tutoring', category: 'Programming', price: 20 },
      { title: 'Web Development', category: 'Programming', price: 25 }
    ]);
  });

  test('handles "All" category', () => {
    const result = filterSkillsByCategory(skills, 'All');
    expect(result).toEqual(skills);
  });

  test('returns an empty array when no matches', () => {
    const result = filterSkillsByCategory(skills, 'Cooking');
    expect(result).toEqual([]);
  });
});

describe('calculateTotalCosts', () => {
  test.each([
    [20, 2, 40],
    [25, 1.5, 37.5],
    [18, 3, 54]
  ])('calculates the total for rate %s and hours %s', (hourlyRate, hours, expected) => {
    expect(calculateTotalCosts(hourlyRate, hours)).toBe(expected);
  });

  test('returns zero for free sessions and zero hours', () => {
    expect(calculateTotalCosts(0, 3)).toBe(0);
    expect(calculateTotalCosts(20, 0)).toBe(0);
  });
});

describe('matchSkillsToUser', () => {
  const skills = [
    { title: 'Python Tutoring', category: 'Programming', price: 20 },
    { title: 'JavaScript Help', category: 'Programming', price: 25 },
    { title: 'Guitar Lessons', category: 'Music', price: 15 },
    { title: 'Resume Review', category: 'Career', price: 0 }
  ];

  test('matches the requested category within the maximum price', () => {
    const needs = { category: 'Programming', maxPrice: 30 };
    expect(matchSkillsToUser(needs, skills)).toEqual(skills.slice(0, 2));
  });

  test('filters category matches by the maximum price', () => {
    const needs = { category: 'Programming', maxPrice: 20 };
    expect(matchSkillsToUser(needs, skills)).toEqual([skills[0]]);
  });

  test('returns an empty array when no skill matches', () => {
    const needs = { category: 'Cooking', maxPrice: 100 };
    expect(matchSkillsToUser(needs, skills)).toEqual([]);
  });

  test('includes free skills when the maximum price is zero', () => {
    const needs = { category: 'Career', maxPrice: 0 };
    expect(matchSkillsToUser(needs, skills)).toEqual([skills[3]]);
  });
});