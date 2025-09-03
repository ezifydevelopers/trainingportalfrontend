
import { CourseModule, Quiz } from "@/types/course";

export const courseModules: CourseModule[] = [
  {
    id: 1,
    title: "Product & Company Knowledge (Geography)",
    description: "Learn about our company's global presence, products, and market positioning",
    videoUrl: "https://example.com/module1-video",
    content: `
      <h3>Company Overview</h3>
      <p>Our company operates across multiple geographical regions...</p>
      <h3>Product Portfolio</h3>
      <p>We offer a comprehensive range of products and services...</p>
    `,
    estimatedDuration: 45,
    order: 1,
    isLocked: false,
    completionCriteria: {
      videoWatched: true,
      quizPassed: true,
      minimumScore: 70
    }
  },
  {
    id: 2,
    title: "Hierarchy & Office Policies",
    description: "Understanding organizational structure and workplace policies",
    videoUrl: "https://example.com/module2-video",
    content: `
      <h3>Organizational Structure</h3>
      <p>Learn about our company hierarchy and reporting structure...</p>
      <h3>Office Policies</h3>
      <p>Important workplace guidelines and procedures...</p>
    `,
    estimatedDuration: 30,
    order: 2,
    isLocked: false,
    completionCriteria: {
      videoWatched: true,
      quizPassed: true,
      minimumScore: 70
    }
  },
  {
    id: 3,
    title: "Job Description (Email Marketing, Cold Calling, Leads, Sales)",
    description: "Detailed overview of your role and responsibilities",
    videoUrl: "https://example.com/module3-video",
    content: `
      <h3>Email Marketing</h3>
      <p>Best practices for email campaigns...</p>
      <h3>Cold Calling Techniques</h3>
      <p>Effective strategies for cold outreach...</p>
    `,
    estimatedDuration: 60,
    order: 3,
    isLocked: false,
    completionCriteria: {
      videoWatched: true,
      quizPassed: true,
      minimumScore: 70
    }
  },
  {
    id: 4,
    title: "Sales Process & CRM Usage",
    description: "Understanding the sales pipeline and CRM system",
    videoUrl: "https://example.com/module4-video",
    content: `
      <h3>Sales Pipeline</h3>
      <p>Understanding the stages of our sales process...</p>
      <h3>CRM System</h3>
      <p>How to use our CRM effectively...</p>
    `,
    estimatedDuration: 45,
    order: 4,
    isLocked: false,
    completionCriteria: {
      videoWatched: true,
      quizPassed: true,
      minimumScore: 70
    }
  },
  {
    id: 5,
    title: "Communication Skills",
    description: "Developing effective communication techniques",
    videoUrl: "https://example.com/module5-video",
    content: `
      <h3>Verbal Communication</h3>
      <p>Tips for clear and effective verbal communication...</p>
      <h3>Written Communication</h3>
      <p>Best practices for professional written communication...</p>
    `,
    estimatedDuration: 40,
    order: 5,
    isLocked: false,
    completionCriteria: {
      videoWatched: true,
      quizPassed: true,
      minimumScore: 70
    }
  },
  {
    id: 6,
    title: "Customer Service Excellence",
    description: "Delivering exceptional customer service",
    videoUrl: "https://example.com/module6-video",
    content: `
      <h3>Customer Service Principles</h3>
      <p>Core principles of excellent customer service...</p>
      <h3>Handling Difficult Situations</h3>
      <p>Strategies for managing challenging customer interactions...</p>
    `,
    estimatedDuration: 35,
    order: 6,
    isLocked: false,
    completionCriteria: {
      videoWatched: true,
      quizPassed: true,
      minimumScore: 70
    }
  },
  {
    id: 7,
    title: "Team Collaboration",
    description: "Working effectively in a team environment",
    videoUrl: "https://example.com/module7-video",
    content: `
      <h3>Team Dynamics</h3>
      <p>Understanding how to work effectively in teams...</p>
      <h3>Collaboration Tools</h3>
      <p>Using our collaboration platforms effectively...</p>
    `,
    estimatedDuration: 30,
    order: 7,
    isLocked: false,
    completionCriteria: {
      videoWatched: true,
      quizPassed: true,
      minimumScore: 70
    }
  },
  {
    id: 8,
    title: "Appraisals & Evaluations",
    description: "Performance review process and evaluation criteria",
    videoUrl: "https://example.com/module8-video",
    content: `
      <h3>Performance Reviews</h3>
      <p>How our evaluation process works...</p>
    `,
    estimatedDuration: 30,
    order: 8,
    isLocked: false,
    completionCriteria: {
      videoWatched: true,
      quizPassed: true,
      minimumScore: 70
    }
  },
  {
    id: 9,
    title: "Message from the CEO",
    description: "Welcome message and company vision from our CEO",
    videoUrl: "https://example.com/ceo-message",
    content: `
      <h3>CEO Welcome Message</h3>
      <p>A personal message from our CEO about our company culture and vision...</p>
    `,
    estimatedDuration: 15,
    order: 9,
    isLocked: false,
    completionCriteria: {
      videoWatched: true,
      quizPassed: false,
      minimumScore: 0
    }
  }
];

export const moduleQuizzes: Quiz[] = [
  {
    id: 1,
    moduleId: 1,
    passingScore: 70,
    maxAttempts: 3,
    questions: [
      {
        id: 1,
        question: "In which geographical regions does our company operate?",
        type: "multiple-choice",
        options: [
          "North America only",
          "North America and Europe",
          "Global presence across all continents",
          "Asia-Pacific only"
        ],
        correctAnswer: 2,
        explanation: "Our company has a global presence with operations across all major continents."
      },
      {
        id: 2,
        question: "What is our primary product focus?",
        type: "multiple-choice",
        options: [
          "Software solutions",
          "Manufacturing",
          "Consulting services",
          "All of the above"
        ],
        correctAnswer: 3,
        explanation: "We offer a diverse portfolio including software, manufacturing, and consulting."
      }
    ]
  }
];
