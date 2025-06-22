const SkillCategory = require('../models/skillCategorySchema');

const initialCategories = [
    {
        "name": "Web Development",
        "skills": [
            {
                "name": "HTML",
                "baseProgress": 10,
                "description": "Structure and organize web content using HTML5",
                "prerequisites": []
            },
            {
                "name": "CSS",
                "baseProgress": 10,
                "description": "Style and layout web pages using CSS3",
                "prerequisites": ["HTML"]
            },
            {
                "name": "JavaScript",
                "baseProgress": 10,
                "description": "Add interactivity and dynamic behavior to web pages",
                "prerequisites": ["HTML", "CSS"]
            },
            {
                "name": "React",
                "baseProgress": 20,
                "description": "Build user interfaces with React.js framework",
                "prerequisites": ["JavaScript", "HTML", "CSS"]
            },
            {
                "name": "Next.js",
                "baseProgress": 30,
                "description": "Create server-side rendered React applications",
                "prerequisites": ["React", "JavaScript"]
            },
            {
                "name": "Tailwind CSS",
                "baseProgress": 10,
                "description": "Utility-first CSS framework for rapid UI development",
                "prerequisites": ["CSS", "HTML"]
            },
            {
                "name": "Material UI",
                "baseProgress": 10,
                "description": "React component library implementing Material Design",
                "prerequisites": ["React", "JavaScript"]
            }
        ]
    },
    {
        "name": "Mobile Development",
        "skills": [
            {
                "name": "React Native",
                "baseProgress": 25,
                "description": "Build native mobile applications using React",
                "prerequisites": ["JavaScript", "React"]
            },
            {
                "name": "Flutter",
                "baseProgress": 25,
                "description": "Create cross-platform applications using Dart",
                "prerequisites": []
            },
            {
                "name": "Swift",
                "baseProgress": 25,
                "description": "Develop iOS applications using Swift",
                "prerequisites": []
            },
            {
                "name": "Kotlin",
                "baseProgress": 25,
                "description": "Build Android applications using Kotlin",
                "prerequisites": []
            }
        ]
    },
    {
        "name": "Game Development",
        "skills": [
            {
                "name": "Unity",
                "baseProgress": 50,
                "description": "Create games using Unity game engine",
                "prerequisites": ["C#"]
            },
            {
                "name": "Unreal Engine",
                "baseProgress": 20,
                "description": "Develop games with Unreal Engine",
                "prerequisites": ["C++"]
            },
            {
                "name": "Blender",
                "baseProgress": 30,
                "description": "3D modeling and animation for games",
                "prerequisites": []
            }
        ]
    },
    {
        "name": "AI and Machine Learning",
        "skills": [
            {
                "name": "Python",
                "baseProgress": 30,
                "description": "Core Python programming for AI/ML",
                "prerequisites": []
            },
            {
                "name": "TensorFlow",
                "baseProgress": 30,
                "description": "Machine learning framework by Google",
                "prerequisites": ["Python"]
            },
            {
                "name": "PyTorch",
                "baseProgress": 20,
                "description": "Deep learning framework by Facebook",
                "prerequisites": ["Python"]
            },
            {
                "name": "Scikit-learn",
                "baseProgress": 20,
                "description": "Machine learning library for Python",
                "prerequisites": ["Python"]
            }
        ]
    },
    {
        "name": "Cloud Computing",
        "skills": [
            {
                "name": "AWS",
                "baseProgress": 30,
                "description": "Amazon Web Services cloud platform",
                "prerequisites": []
            },
            {
                "name": "Azure",
                "baseProgress": 30,
                "description": "Microsoft's cloud computing platform",
                "prerequisites": []
            },
            {
                "name": "Google Cloud",
                "baseProgress": 30,
                "description": "Google's cloud computing services",
                "prerequisites": []
            },
            {
                "name": "Docker",
                "baseProgress": 10,
                "description": "Containerization platform for applications",
                "prerequisites": []
            }
        ]
    },
    {
        "name": "Cyber Security",
        "skills": [
            {
                "name": "Penetration Testing",
                "baseProgress": 30,
                "description": "Security testing and vulnerability assessment",
                "prerequisites": ["Network Security"]
            },
            {
                "name": "Network Security",
                "baseProgress": 30,
                "description": "Securing computer networks and systems",
                "prerequisites": []
            },
            {
                "name": "Cryptography",
                "baseProgress": 40,
                "description": "Data encryption and security protocols",
                "prerequisites": ["Network Security"]
            }
        ]
    }
];

async function seedSkillCategories() {
    try {
        // Check if categories already exist
        const existingCategories = await SkillCategory.find();
        if (existingCategories.length === 0) {
            console.log('Seeding skill categories...');
            await SkillCategory.insertMany(initialCategories);
            console.log('Successfully seeded skill categories!');
        } else {
            console.log('Skill categories already exist, skipping seeding.');
        }
    } catch (error) {
        console.error('Error seeding skill categories:', error);
    }
}

module.exports = seedSkillCategories; 