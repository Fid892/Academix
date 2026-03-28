const User = require("../models/User");
const Doubt = require("../models/Doubt");
const StudyGroup = require("../models/StudyGroup");

const resourceMap = {
  "AI": [
    { title: "Intro to Artificial Intelligence", link: "https://www.youtube.com/watch?v=JMUxmLyrhSk", platform: "YouTube", icon: "🎥" },
    { title: "Machine Learning Roadmap", link: "https://roadmap.sh/ai-data-scientist", platform: "Roadmap", icon: "📄" }
  ],
  "DBMS": [
    { title: "Database Management Systems", link: "https://www.youtube.com/watch?v=HXV3zeJZ1EQ", platform: "YouTube", icon: "🎥" },
    { title: "SQL Fundamentals", link: "https://www.w3schools.com/sql/", platform: "Website", icon: "📘" }
  ],
  "DSA": [
    { title: "Data Structures and Algorithms", link: "https://www.youtube.com/watch?v=8hly31xKli0", platform: "YouTube", icon: "🎥" },
    { title: "LeetCode Grind 75", link: "https://www.techinterviewhandbook.org/grind75", platform: "Platform", icon: "💻" }
  ],
  "Web Dev": [
    { title: "Full Stack Web Development", link: "https://www.youtube.com/watch?v=nu_pCVPKzTk", platform: "YouTube", icon: "🎥" },
    { title: "React Official Docs", link: "https://react.dev/", platform: "Docs", icon: "📄" }
  ],
  "Java": [
     { title: "Java Programming Masterclass", link: "https://www.youtube.com/watch?v=eIrMbAQSU34", platform: "YouTube", icon: "🎥" },
  ]
};

const departmentMap = {
  "CSE": [
    { title: "Advanced Data Structures", link: "https://www.youtube.com/watch?v=RBSGKlAvoiM", platform: "YouTube", icon: "🎥" },
    { title: "Web Development Bootcamp", link: "https://www.udemy.com/", platform: "Course", icon: "📘" },
    { title: "Operating Systems", link: "https://www.youtube.com/watch?v=vBURTt97EkA", platform: "YouTube", icon: "🎥" }
  ],
  "ECE": [
    { title: "Signals and Systems", link: "https://www.youtube.com/watch?v=s8rsR_Tiva8", platform: "YouTube", icon: "🎥" },
    { title: "Microprocessors Explained", link: "https://www.youtube.com/watch?v=liRPtvjdI0I", platform: "YouTube", icon: "🎥" },
    { title: "Digital Logic Design", link: "https://www.youtube.com/watch?v=M0mx8S05v60", platform: "YouTube", icon: "🎥" }
  ],
  "EEE": [
    { title: "Electrical Circuits", link: "https://www.youtube.com/watch?v=3oJCZsE5DZI", platform: "YouTube", icon: "🎥" },
    { title: "Power Systems", link: "https://www.youtube.com/watch?v=1rA-v1e8dDk", platform: "YouTube", icon: "🎥" },
    { title: "Control Systems Engineering", link: "https://www.youtube.com/watch?v=vVjXlA25Xv8", platform: "YouTube", icon: "🎥" }
  ],
  "MECH": [
     { title: "Thermodynamics", link: "https://www.youtube.com/watch?v=9GMBpZZtjXM", platform: "YouTube", icon: "🎥" },
     { title: "Fluid Mechanics", link: "https://www.youtube.com/watch?v=fa0zHI6nLUo", platform: "YouTube", icon: "🎥" }
  ]
};

const trendingResources = [
  { title: "ChatGPT for Students", link: "https://openai.com/", platform: "AI Tool", icon: "🤖" },
  { title: "GitHub Student Developer Pack", link: "https://education.github.com/pack", platform: "Platform", icon: "💻" },
  { title: "Notion for Note-taking", link: "https://www.notion.so/", platform: "Tool", icon: "📝" },
  { title: "Cracking the Coding Interview", link: "https://www.amazon.com/Cracking-Coding-Interview-Programming-Questions/dp/0984782850", platform: "Book", icon: "📘" }
];

// Helper to determine dominant static subjects (Mocking analysis for undefined subjects)
const fallbackSubjects = ["DSA", "Web Dev"];

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

    res.status(200).json(recommended);
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
      deptResources = departmentMap["CSE"]; // Fallback
    }

    res.status(200).json(deptResources);
  } catch (error) {
    console.error("Error in getDepartmentRecommendations:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

exports.getTrendingRecommendations = async (req, res) => {
  try {
    res.status(200).json(trendingResources);
  } catch (error) {
    console.error("Error in getTrendingRecommendations:", error);
    res.status(500).json({ error: "Server Error" });
  }
};
