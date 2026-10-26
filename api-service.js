const API_BASE_URL = 'http://localhost:3000/api';

async function fetchSkills() {
  const response = await fetch(`${API_BASE_URL}/skills`);
  if (!response.ok) {
    throw new Error(`Failed to fetch skills (${response.status})`);
  }
  return response.json();
}

async function createSkill(skillData) {
  const response = await fetch(`${API_BASE_URL}/skills`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(skillData),
  });
  if (!response.ok) {
    throw new Error(`Failed to create skill (${response.status})`);
  }
  return response.json();
}

window.apiService = { fetchSkills, createSkill };