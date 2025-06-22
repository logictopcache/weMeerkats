import axios from 'axios';
import { API_ENDPOINTS } from './config';

export const fetchSkills = async () => {
  const token = localStorage.getItem('authToken');
  try {
    const response = await axios.get(API_ENDPOINTS.SKILL_CATEGORIES, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Extract skills from categories
    const categories = response.data.categories || [];
    const allSkills = categories.flatMap(category => 
      category.skills.map(skill => skill.name)
    );
    
    return allSkills;
  } catch (error) {
    console.error('Error fetching skills:', error);
    // Return default skills list if API fails
    return [
      "JavaScript",
      "Python",
      "Java",
      "React",
      "Node.js",
      "Angular",
      "Vue.js",
      "TypeScript",
      "MongoDB",
      "SQL"
    ];
  }
}; 