const User = require("../models/User");
const Doubt = require("../models/Doubt");
const StudyGroup = require("../models/StudyGroup");

const resourceMap = {
  "AI": [
    { title: "Intro to Artificial Intelligence", link: "https://www.youtube.com/watch?v=JMUxmLyrhSk", platform: "YouTube", icon: "🎥" },
    { title: "Machine Learning Roadmap", link: "https://roadmap.sh/ai-data-scientist", platform: "Roadmap", icon: "📄" },
    { title: "Deep Learning Specialization", link: "https://www.coursera.org/specializations/deep-learning", platform: "Coursera", icon: "🎓" },
    { title: "Neural Networks from Scratch", link: "https://nnfs.io/", platform: "Website", icon: "📘" },
    { title: "TensorFlow Documentation", link: "https://www.tensorflow.org/learn", platform: "Docs", icon: "📄" }
  ],
  "DBMS": [
    { title: "Database Management Systems", link: "https://www.youtube.com/watch?v=HXV3zeJZ1EQ", platform: "YouTube", icon: "🎥" },
    { title: "SQL Fundamentals", link: "https://www.w3schools.com/sql/", platform: "Website", icon: "📘" },
    { title: "PostgreSQL Tutorial", link: "https://www.postgresqltutorial.com/", platform: "Tutorial", icon: "💻" },
    { title: "Database Design Course", link: "https://www.youtube.com/watch?v=ztHopE5Wnpc", platform: "YouTube", icon: "🎥" },
    { title: "MongoDB University", link: "https://learn.mongodb.com/", platform: "Course", icon: "🎓" }
  ],
  "DSA": [
    { title: "Data Structures and Algorithms", link: "https://www.youtube.com/watch?v=8hly31xKli0", platform: "YouTube", icon: "🎥" },
    { title: "LeetCode Grind 75", link: "https://www.techinterviewhandbook.org/grind75", platform: "Platform", icon: "💻" },
    { title: "NeetCode 150", link: "https://neetcode.io/", platform: "Website", icon: "💻" },
    { title: "HackerRank Problem Solving", link: "https://www.hackerrank.com/domains/algorithms", platform: "Platform", icon: "🔥" },
    { title: "GeeksforGeeks DSA", link: "https://www.geeksforgeeks.org/data-structures/", platform: "Docs", icon: "📄" },
    { title: "Dynamic Programming Guide", link: "https://www.youtube.com/watch?v=oBt53YbR9Kk", platform: "YouTube", icon: "🎥" }
  ],
  "Web Dev": [
    { title: "Full Stack Web Development", link: "https://www.youtube.com/watch?v=nu_pCVPKzTk", platform: "YouTube", icon: "🎥" },
    { title: "React Official Docs", link: "https://react.dev/", platform: "Docs", icon: "📄" },
    { title: "MDN Web Docs", link: "https://developer.mozilla.org/", platform: "Docs", icon: "📘" },
    { title: "CSS Tricks", link: "https://css-tricks.com/", platform: "Website", icon: "🎨" },
    { title: "Node.js Crash Course", link: "https://www.youtube.com/watch?v=fBNz5xF-Kx4", platform: "YouTube", icon: "🎥" },
    { title: "FreeCodeCamp Curriculum", link: "https://www.freecodecamp.org/", platform: "Platform", icon: "💻" }
  ],
  "Java": [
     { title: "Java Programming Masterclass", link: "https://www.youtube.com/watch?v=eIrMbAQSU34", platform: "YouTube", icon: "🎥" },
     { title: "Core Java for Beginners", link: "https://www.javatpoint.com/java-tutorial", platform: "Tutorial", icon: "📄" },
     { title: "Spring Boot Tutorial", link: "https://www.youtube.com/watch?v=9SGDpanrc8U", platform: "YouTube", icon: "🎥" },
     { title: "Object Oriented Programming in Java", link: "https://www.coursera.org/specializations/object-oriented-programming", platform: "Coursera", icon: "🎓" }
  ]
};

const departmentMap = {
  "CSE": [
    { title: "Advanced Data Structures", link: "https://www.youtube.com/watch?v=RBSGKlAvoiM", platform: "YouTube", icon: "🎥" },
    { title: "Web Development Bootcamp", link: "https://www.udemy.com/", platform: "Course", icon: "📘" },
    { title: "Operating Systems", link: "https://www.youtube.com/watch?v=vBURTt97EkA", platform: "YouTube", icon: "🎥" },
    { title: "Computer Networks Tutorial", link: "https://www.youtube.com/watch?v=IPvYjXCsTg8", platform: "YouTube", icon: "🎥" },
    { title: "Compiler Design Fundamentals", link: "https://www.geeksforgeeks.org/compiler-design-tutorials/", platform: "Docs", icon: "📄" },
    { title: "Software Engineering Principles", link: "https://www.youtube.com/watch?v=bWfSGEqX2E4", platform: "YouTube", icon: "🎥" }
  ],
  "ECE": [
    { title: "Signals and Systems", link: "https://www.youtube.com/watch?v=s8rsR_Tiva8", platform: "YouTube", icon: "🎥" },
    { title: "Microprocessors Explained", link: "https://www.youtube.com/watch?v=liRPtvjdI0I", platform: "YouTube", icon: "🎥" },
    { title: "Digital Logic Design", link: "https://www.youtube.com/watch?v=M0mx8S05v60", platform: "YouTube", icon: "🎥" },
    { title: "VLSI Design Course", link: "https://nptel.ac.in/courses/117/101/117101058/", platform: "NPTEL", icon: "🎓" },
    { title: "Communication Systems", link: "https://www.youtube.com/watch?v=d_kR3O2bIEo", platform: "YouTube", icon: "🎥" }
  ],
  "EEE": [
    { title: "Electrical Circuits", link: "https://www.youtube.com/watch?v=3oJCZsE5DZI", platform: "YouTube", icon: "🎥" },
    { title: "Power Systems", link: "https://www.youtube.com/watch?v=1rA-v1e8dDk", platform: "YouTube", icon: "🎥" },
    { title: "Control Systems Engineering", link: "https://www.youtube.com/watch?v=vVjXlA25Xv8", platform: "YouTube", icon: "🎥" },
    { title: "Electric Machines", link: "https://nptel.ac.in/courses/108/105/108105017/", platform: "NPTEL", icon: "🎓" },
    { title: "Power Electronics", link: "https://www.youtube.com/watch?v=tQO1u1h904c", platform: "YouTube", icon: "🎥" }
  ],
  "MECH": [
     { title: "Thermodynamics", link: "https://www.youtube.com/watch?v=9GMBpZZtjXM", platform: "YouTube", icon: "🎥" },
     { title: "Fluid Mechanics", link: "https://www.youtube.com/watch?v=fa0zHI6nLUo", platform: "YouTube", icon: "🎥" },
     { title: "Machine Design", link: "https://www.youtube.com/watch?v=2T_2zP23o_s", platform: "YouTube", icon: "🎥" },
     { title: "Heat Transfer Basics", link: "https://nptel.ac.in/courses/112/101/112101097/", platform: "NPTEL", icon: "🎓" },
     { title: "Strength of Materials", link: "https://www.youtube.com/watch?v=I7X1vYv18s0", platform: "YouTube", icon: "🎥" }
  ]
};

const trendingResources = [
  { title: "ChatGPT for Students", link: "https://openai.com/", platform: "AI Tool", icon: "🤖" },
  { title: "GitHub Student Developer Pack", link: "https://education.github.com/pack", platform: "Platform", icon: "💻" },
  { title: "Notion for Note-taking", link: "https://www.notion.so/", platform: "Tool", icon: "📝" },
  { title: "Cracking the Coding Interview", link: "https://www.amazon.com/Cracking-Coding-Interview-Programming-Questions/dp/0984782850", platform: "Book", icon: "📘" },
  { title: "Canva for Presentations", link: "https://www.canva.com/", platform: "Design", icon: "🎨" },
  { title: "Wolfram Alpha Optimizer", link: "https://www.wolframalpha.com/", platform: "Math", icon: "📐" },
  { title: "Google Scholar", link: "https://scholar.google.com/", platform: "Research", icon: "📖" },
  { title: "Coursera Free Courses", link: "https://www.coursera.org/courses?query=free", platform: "Platform", icon: "🎓" },
  { title: "edX University Content", link: "https://www.edx.org/", platform: "Platform", icon: "🎓" },
  { title: "Figma for UI/UX", link: "https://www.figma.com/", platform: "Design", icon: "🎨" }
];

// Helper to determine dominant static subjects (Mocking analysis for undefined subjects)
const fallbackSubjects = ["DSA", "Web Dev"];

// Random shuffle algorithm (Fisher-Yates) and slice
const getRandomResources = (array, count = 4) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return count > 0 ? shuffled.slice(0, count) : shuffled;
};

exports.getInterestsRecommendations = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : null;
    let recommended = [];

    if (userId) {
      // Analyze user activity
      const doubts = await Doubt.find({ postedBy: userId });
      const user = await User.findById(userId).populate("joinedGroups");
      
      const subjectFrequency = {};

      if (doubts) {
        doubts.forEach(d => {
          if (d.subject) {
             const sub = d.subject.trim().toUpperCase();
             subjectFrequency[sub] = (subjectFrequency[sub] || 0) + 1;
          }
        });
      }

      if (user && user.joinedGroups) {
        user.joinedGroups.forEach(g => {
          if (g.subject) {
             const sub = g.subject.trim().toUpperCase();
             subjectFrequency[sub] = (subjectFrequency[sub] || 0) + 1;
          }
        });
      }

      // Sort and get top subjects
      const sortedSubjects = Object.keys(subjectFrequency).sort((a, b) => subjectFrequency[b] - subjectFrequency[a]);
      
      let topSubjects = sortedSubjects.slice(0, 2);
      
      // Match with resource map
      const availableKeys = Object.keys(resourceMap).map(k => k.toUpperCase());
      
      let matchedKeys = topSubjects.map(ts => {
         return Object.keys(resourceMap).find(k => k.toUpperCase() === ts || ts.includes(k.toUpperCase()) || k.toUpperCase().includes(ts));
      }).filter(Boolean);

      if (matchedKeys.length === 0) {
         matchedKeys = fallbackSubjects;
      }

      // Populate recommendations
      matchedKeys.forEach(key => {
         recommended = recommended.concat(resourceMap[key]);
      });
    } else {
      // User not logged in or session expired
      recommended = [...resourceMap["AI"], ...resourceMap["DSA"]];
    }

    res.status(200).json(getRandomResources(recommended, 4));
  } catch (error) {
    console.error("Error in getInterestsRecommendations:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

exports.getDepartmentRecommendations = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : null;
    let deptResources = [];

    if (userId) {
      const user = await User.findById(userId);
      if (user && user.department) {
         const d = user.department.toUpperCase();
         const matchedDept = Object.keys(departmentMap).find(k => d.includes(k));
         if (matchedDept) {
            deptResources = departmentMap[matchedDept];
         }
      }
    }

    if (deptResources.length === 0) {
      deptResources = [...departmentMap["CSE"], ...departmentMap["ECE"]]; // Fallback combined
    }

    res.status(200).json(getRandomResources(deptResources, 4));
  } catch (error) {
    console.error("Error in getDepartmentRecommendations:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

exports.getTrendingRecommendations = async (req, res) => {
  try {
    res.status(200).json(getRandomResources(trendingResources, 4));
  } catch (error) {
    console.error("Error in getTrendingRecommendations:", error);
    res.status(500).json({ error: "Server Error" });
  }
};
