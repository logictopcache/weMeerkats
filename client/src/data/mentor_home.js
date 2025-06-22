export const mentorHomeData = {
  java: {
    title: "Java Development",
    mentors: [
      {
        id: 1,
        name: "John Doe",
        expertise: "Java Backend",
        rating: 4.8,
        image: "/mentors/java1.png",
        availability: "Mon, Wed, Fri"
      },
      // Add more Java mentors...
    ]
  },
  uiux: {
    title: "UI/UX Design",
    mentors: [
      {
        id: 1,
        name: "Sarah Smith",
        expertise: "Product Design",
        rating: 4.9,
        image: "/mentors/uiux1.png",
        availability: "Tue, Thu"
      },
      // Add more UI/UX mentors...
    ]
  },
  webdev: {
    title: "Web Development",
    mentors: [
      {
        id: 1,
        name: "Mike Johnson",
        expertise: "Full Stack",
        rating: 4.7,
        image: "/mentors/web1.png",
        availability: "Mon, Wed"
      },
      // Add more Web Dev mentors...
    ]
  }
};

export const activeMenteesData = [
  {
    id: 1,
    name: "Bella Caio",
    image: "/mentee1.png",
    learningSkills: "Learning Skills",
    skills: ["Java", "Web development", "UI/UX"],
    nextSession: "12-11-2024"
  },
  {
    id: 2,
    name: "Bella Caio",
    image: "/mentee1.png",
    learningSkills: "Learning Skills",
    skills: ["Java", "Web development", "UI/UX"],
    nextSession: "12-11-2024"
  },
  {
    id: 3,
    name: "Bella Caio",
    image: "/mentee1.png",
    learningSkills: "Learning Skills",
    skills: ["Java", "Web development", "UI/UX"],
    nextSession: "12-11-2024"
  },
  // Add more mentees as needed...
];

export const menteeProfileData = {
  id: 1,
  name: "Bella Caio",
  image: "/mentee1.png",
  bio: "Mentoring as a web developer since 3 years. I have done my as senior web developers in different software houses",
  skillsToLearn: ["HTML", "CSS", "Java", "React", "Node Js"],
  progressStatus: [
    { skill: "Java", completion: 30 },
    { skill: "Programming", completion: 90 },
    { skill: "UI/UX", completion: 50 }
  ],
  upcomingSessions: [
    { mentorName: "Devin Mia", courseName: "Java", date: "10/11/2024", time: "11:00 am - 12:00pm" },
    { mentorName: "Sarah Mia", courseName: "UI UX", date: "10/11/2024", time: "10:00 am - 13:00pm" },
    // Add more sessions as needed...
  ]
};
