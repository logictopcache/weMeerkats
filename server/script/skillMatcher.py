#!/usr/bin/env python3
"""
Skill Matching Algorithm for Mentor-Mentee Matching
This script calculates compatibility scores between learners and mentors based on skill sets.
"""

import json
import sys
from typing import List, Dict, Any
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import re

class SkillMatcher:
    def __init__(self):
        # Define skill categories and their related skills for better matching
        self.skill_categories = {
            "Web Development": ["javascript", "react", "angular", "vue", "html", "css", "node.js", "express", "django", "flask", "php", "laravel", "wordpress"],
            "Mobile Development": ["react native", "flutter", "swift", "kotlin", "android", "ios", "xamarin", "ionic"],
            "Data Science": ["python", "r", "matplotlib", "pandas", "numpy", "scikit-learn", "tensorflow", "pytorch", "jupyter"],
            "DevOps": ["docker", "kubernetes", "aws", "azure", "gcp", "jenkins", "git", "ci/cd", "terraform"],
            "Database": ["sql", "mysql", "postgresql", "mongodb", "redis", "oracle", "sqlite"],
            "Cybersecurity": ["penetration testing", "ethical hacking", "network security", "cryptography", "security analysis"],
            "AI/ML": ["machine learning", "deep learning", "neural networks", "nlp", "computer vision", "reinforcement learning"],
            "Cloud Computing": ["aws", "azure", "gcp", "cloud architecture", "serverless", "microservices"],
            "Software Testing": ["unit testing", "integration testing", "selenium", "jest", "pytest", "qa"],
            "UI/UX": ["figma", "adobe xd", "sketch", "user research", "wireframing", "prototyping"]
        }
        
        # Initialize TF-IDF vectorizer for text-based skill matching
        self.vectorizer = TfidfVectorizer(
            lowercase=True,
            stop_words='english',
            ngram_range=(1, 2),
            max_features=1000
        )

    def normalize_skills(self, skills: List[str]) -> List[str]:
        """Normalize skill names for better matching"""
        normalized = []
        for skill in skills:
            # Convert to lowercase and remove special characters
            skill_clean = re.sub(r'[^\w\s]', '', skill.lower().strip())
            normalized.append(skill_clean)
        return normalized

    def calculate_skill_overlap(self, learner_skills: List[str], mentor_skills: List[str]) -> float:
        """Calculate direct skill overlap score"""
        learner_normalized = set(self.normalize_skills(learner_skills))
        mentor_normalized = set(self.normalize_skills(mentor_skills))
        
        if not learner_normalized or not mentor_normalized:
            return 0.0
        
        intersection = learner_normalized.intersection(mentor_normalized)
        union = learner_normalized.union(mentor_normalized)
        
        return len(intersection) / len(union) if union else 0.0

    def calculate_category_similarity(self, learner_skills: List[str], mentor_skills: List[str]) -> float:
        """Calculate similarity based on skill categories"""
        learner_normalized = [skill.lower() for skill in learner_skills]
        mentor_normalized = [skill.lower() for skill in mentor_skills]
        
        learner_categories = set()
        mentor_categories = set()
        
        # Find categories for learner skills
        for skill in learner_normalized:
            for category, category_skills in self.skill_categories.items():
                if any(cat_skill in skill for cat_skill in category_skills):
                    learner_categories.add(category)
        
        # Find categories for mentor skills
        for skill in mentor_normalized:
            for category, category_skills in self.skill_categories.items():
                if any(cat_skill in skill for cat_skill in category_skills):
                    mentor_categories.add(category)
        
        if not learner_categories or not mentor_categories:
            return 0.0
        
        intersection = learner_categories.intersection(mentor_categories)
        union = learner_categories.union(mentor_categories)
        
        return len(intersection) / len(union) if union else 0.0

    def calculate_text_similarity(self, learner_skills: List[str], mentor_skills: List[str]) -> float:
        """Calculate similarity using TF-IDF and cosine similarity"""
        try:
            # Combine skills into text for vectorization
            learner_text = " ".join(learner_skills)
            mentor_text = " ".join(mentor_skills)
            
            # Create documents for vectorization
            documents = [learner_text, mentor_text]
            
            # Fit and transform
            tfidf_matrix = self.vectorizer.fit_transform(documents)
            
            # Calculate cosine similarity
            similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
            
            return float(similarity)
        except Exception as e:
            print(f"Error in text similarity calculation: {e}", file=sys.stderr)
            return 0.0

    def calculate_expertise_bonus(self, mentor_data: Dict[str, Any]) -> float:
        """Calculate bonus score based on mentor expertise and experience"""
        bonus = 0.0
        
        # Bonus for verified mentors
        if mentor_data.get('isVerified', False):
            bonus += 0.1
        
        # Bonus for having education/experience
        if mentor_data.get('education') and len(mentor_data['education']) > 0:
            bonus += 0.05
        
        if mentor_data.get('workExperiences') and len(mentor_data['workExperiences']) > 0:
            bonus += 0.05
        
        # Bonus for having availability
        availability = mentor_data.get('availability', {})
        available_slots = 0
        for day_slots in availability.values():
            if isinstance(day_slots, list):
                available_slots += len([slot for slot in day_slots if slot.get('isAvailable', False)])
        
        if available_slots > 0:
            bonus += min(0.1, available_slots * 0.01)  # Max 0.1 bonus for availability
        
        return min(bonus, 0.3)  # Cap bonus at 0.3

    def calculate_matching_score(self, learner_skills: List[str], mentor_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate comprehensive matching score between learner and mentor"""
        mentor_skills = mentor_data.get('skills', [])
        
        if not learner_skills or not mentor_skills:
            return {
                'score': 0.0,
                'overlap_score': 0.0,
                'category_score': 0.0,
                'text_score': 0.0,
                'expertise_bonus': 0.0,
                'matched_skills': [],
                'total_score': 0.0
            }
        
        # Calculate individual scores
        overlap_score = self.calculate_skill_overlap(learner_skills, mentor_skills)
        category_score = self.calculate_category_similarity(learner_skills, mentor_skills)
        text_score = self.calculate_text_similarity(learner_skills, mentor_skills)
        expertise_bonus = self.calculate_expertise_bonus(mentor_data)
        
        # Find matched skills
        learner_normalized = set(self.normalize_skills(learner_skills))
        mentor_normalized = set(self.normalize_skills(mentor_skills))
        matched_skills = list(learner_normalized.intersection(mentor_normalized))
        
        # Calculate weighted total score
        # Weights: overlap (40%), category (30%), text (20%), expertise (10%)
        total_score = (
            overlap_score * 0.4 +
            category_score * 0.3 +
            text_score * 0.2 +
            expertise_bonus * 0.1
        )
        
        return {
            'score': round(total_score, 3),
            'overlap_score': round(overlap_score, 3),
            'category_score': round(category_score, 3),
            'text_score': round(text_score, 3),
            'expertise_bonus': round(expertise_bonus, 3),
            'matched_skills': matched_skills,
            'total_score': round(total_score, 3)
        }

    def rank_mentors(self, learner_skills: List[str], mentors: List[Dict[str, Any]], 
                    min_score: float = 0.1, max_results: int = 10) -> List[Dict[str, Any]]:
        """Rank mentors based on skill matching scores"""
        ranked_mentors = []
        
        for mentor in mentors:
            matching_result = self.calculate_matching_score(learner_skills, mentor)
            
            if matching_result['total_score'] >= min_score:
                ranked_mentor = {
                    **mentor,
                    'matching_score': matching_result['total_score'],
                    'matched_skills': matching_result['matched_skills'],
                    'score_breakdown': {
                        'overlap': matching_result['overlap_score'],
                        'category': matching_result['category_score'],
                        'text': matching_result['text_score'],
                        'expertise': matching_result['expertise_bonus']
                    }
                }
                ranked_mentors.append(ranked_mentor)
        
        # Sort by matching score (highest first)
        ranked_mentors.sort(key=lambda x: x['matching_score'], reverse=True)
        
        # Return top results
        return ranked_mentors[:max_results]

def main():
    """Main function to run skill matching from command line"""
    if len(sys.argv) != 3:
        print("Usage: python skillMatcher.py <learner_skills_json> <mentors_json>")
        sys.exit(1)
    
    try:
        # Parse input data
        learner_skills = json.loads(sys.argv[1])
        mentors = json.loads(sys.argv[2])
        
        # Initialize matcher
        matcher = SkillMatcher()
        
        # Rank mentors
        ranked_mentors = matcher.rank_mentors(learner_skills, mentors)
        
        # Output results
        result = {
            'ranked_mentors': ranked_mentors,
            'total_mentors_processed': len(mentors),
            'mentors_returned': len(ranked_mentors)
        }
        
        print(json.dumps(result, indent=2))
        
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main() 