import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./Dashboard";
import Admin from "./Admin";
import ManageAnnouncements from "./ManageAnnouncements";
import StudyGroups from "./StudyGroups";
import FacultyDashboard from "./FacultyDashboard";
import DoubtsPage from "./DoubtsPage";
import ProfilePage from "./ProfilePage";
import SmartLearningHub from "./SmartLearningHub";
import StudentFeedPage from "./StudentFeedPage";
import FacultyFeedPage from "./FacultyFeedPage";
import EditProfile from "./EditProfile";
import AnnouncementDetail from "./AnnouncementDetail";
import ChatPage from "./ChatPage";
import "./Login.css";

import SplitLoginPage from "./SplitLoginPage";

function App() {
  return (
    <Router>
      <Routes>

        {/* Login */}
        <Route path="/" element={<SplitLoginPage />} />
        <Route path="/login" element={<SplitLoginPage />} />



        {/* Student Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Admin Panel */}
        <Route path="/admin" element={<Admin />} />

        {/* Manage Announcements */}
        <Route path="/manage-announcements" element={<ManageAnnouncements />} />

        {/* ✅ NEW Study Groups Page */}
        <Route path="/study-groups/:groupId?" element={<StudyGroups />} />

        {/* ✅ NEW Faculty Dashboard */}
        <Route path="/faculty-dashboard" element={<FacultyDashboard />} />

        {/* ✅ NEW Doubts Page */}
        <Route path="/doubts" element={<DoubtsPage />} />

        {/* ✅ NEW Profile Page */}
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/edit" element={<EditProfile />} />
        <Route path="/profile/:userId" element={<ProfilePage />} />

        {/* ✅ NEW Smart Learning Hub Page */}
        <Route path="/smart-learning-hub" element={<SmartLearningHub />} />

        {/* ✅ NEW Split Feeds */}
        <Route path="/student-feed" element={<StudentFeedPage />} />
        <Route path="/faculty-feed" element={<FacultyFeedPage />} />

        {/* ✅ Split Detail Route */}
        <Route path="/announcement/:id" element={<AnnouncementDetail />} />

        {/* ✅ Chat Routes */}
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/chat/:conversationId" element={<ChatPage />} />
      </Routes>
    </Router>
  );
}

export default App;