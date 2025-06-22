export const featuresData = {
    resumeScanner: {
      title: "Resume Scanner & Searching Module",
      description: "Empowered by AI, our resume scanner analyzes your skills and goals to create ideal mentor-mentee matches based on search. Whether you're an expert or a newcomer, weMeerkats connects you with mentors aligned with your career path.",
      image: "/LandingPage/RSSM.png"
    },
    realTimeCommunication: {
      title: "Real-Time Communication",
      description: "Connect with mentors through seamless video calls and real-time messaging—no setup needed. Share resources instantly to enhance collaboration and keep all materials in one place.",
      subFeatures: [
        {
          title: "Live Meeting",
          image: "/LandingPage/RTC_Live_Meeting.png"
        },
        {
          title: "Real Time Chat",
          image: "/LandingPage/RTC_Real_Time_Chat.png"
        },
        {
          title: "Resource Upload",
          image: "/LandingPage/RTC_Resouce_Upload.png"
        }
      ]
    },
    progressTracking: {
      title: "Progress Tracking Dashboard",
      description: "Stay on track with real-time progress updates. Our interactive dashboard helps mentors and mentees monitor every milestone and celebrate growth together.",
      image: "/LandingPage/PTD.png"
    }
  };

export const testimonialData = {
  title: "Hear from Our Community",
  testimonials: [
    {
      avatar: "/LandingPage/Mentor-1.jpg",
      text: "As a mentor, I love the intuitive dashboard. It keeps me updated on each mentee's journey, making our sessions more productive and focused.",
      type: "mentor"
    },
    {
      avatar: "/LandingPage/Mentee-1.jpg",
      text: "Thanks to weMeerkats, I've gained practical insights and set meaningful goals with my mentor. It's an incredible platform for career growth.",
      type: "mentee"
    },
    {
      avatar: "/LandingPage/Mentor-2.jpg",
      text: "weMeerkats has transformed my mentoring experience. The matching process is spot-on, connecting me with mentees whose goals align with my expertise",
      type: "mentor"
    },
    {
      avatar: "/LandingPage/Mentee-1.jpg",
      text: "The mentor matching system is incredible! My mentor's expertise perfectly aligns with my career goals, and the platform's features help us maintain consistent progress and communication.",
      type: "mentee"
    },
    {
      avatar: "/LandingPage/Mentee-2.jpg",
      text: "I was matched with a mentor who really understands my field. The real-time progress updates keep me on track, and the communication tools make it easy to connect whenever I need guidance.",
      type: "mentee"
    },
    {
      avatar: "/LandingPage/Mentee-3.jpg",
      text: "The platform's mentor matching exceeded my expectations. Having regular check-ins and clear goals has accelerated my professional development tremendously.",
      type: "mentee"
    }
  ]
};

export const footerData = {
  description: "Empowering professionals through mentorship. Connect, learn, and grow with industry experts.",
  links: {
    product: [
      { name: 'Features', href: '#features' },
      { name: 'Community', href: '#community' },
    ],
    company: [
      { name: 'About', href: '#about' },
    ],
    support: [
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Cookies', href: '/cookies' },
    ],
  },
  social: [
    { name: 'twitter', url: 'https://twitter.com/meerkats' },
    { name: 'linkedin', url: 'https://linkedin.com/company/meerkats' },
    {name:'github', url:'https://github.com/company/meerkats'}
  ]
};