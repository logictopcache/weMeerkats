import { BrowserRouter, Route, Routes } from "react-router-dom";
import { SocketProvider } from "./contexts/SocketContext";
import PageLayout from "./components/layout/PageLayout";
import SignIn from "./pages/signin/SignIn";
import Mentee from "./pages/mentee/Mentee";
import Mentor from "./pages/mentor/Mentor";
import Home from "./pages/home/Home";
import LandingPage from "./pages/landingpage/LandingPage";
import Home_Mentor from "./pages/mentor/home/Home_Mentor";
import Request from "./pages/mentor/requests/Request";
import MenteeProfile from "./pages/mentor/mprofile/MenteeProfile";
import AppointmentCalender from "./pages/mentor/calendar/AppointmentCalender";
import ProgressTrack from "./pages/mentor/progress/ProgressTrack";
import Message_Mentor from "./pages/mentor/messages/Message_Mentor";
import AppointmentCalendar from "./pages/mentee/calendar/AppointmentCalendar";
import ProgressTracking from "./pages/mentee/progress/ProgressTracking";
import QuizApp from "./pages/mentee/quiz/QuizApp";
import Message_Mentee from "./pages/mentee/messages/Messages_Mentee";
import Search_Mentors from "./pages/mentee/search/Search_Mentors";
import MentorProfile from "./pages/mentee/mprofile/MentorProfile";
import BookAppointment from "./pages/mentee/book/BookAppointment";
import SignUp from "./pages/signup/SignUp";
import VerifyOTP from "./pages/verify-otp/VerifyOTP";
import LearnFromAI from "./pages/mentee/learn/LearnFromAI";
import UpdateAvailability from "./pages/mentor/availability/MentorAvailability";
import Home_Mentee from "./pages/mentee/home/Home_Mentee";
import PrivateRoute from "./components/PrivateRoute";
import { ToastContainer } from "react-toastify";
import Terms from "./pages/legal/Terms";
import Privacy from "./pages/legal/Privacy";
import Cookies from "./pages/legal/Cookies";
import SkillDetails from "./pages/mentee/progress/SkillDetails";
import MenteeProfilePage from "./pages/mentee/profile/MenteeProfile";
import MentorProfilePage from "./pages/mentor/profile/MentorProfile";
import { Toaster } from "react-hot-toast";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import PendingApproval from "./pages/PendingApproval";
import AccountRejected from "./pages/AccountRejected";

function App() {
  const layoutRoutes = [
    {
      path: "/mentee/calendar",
      element: (
        <PrivateRoute>
          <AppointmentCalendar />
        </PrivateRoute>
      ),
    },
    {
      path: "/mentor/requests",
      element: (
        <PrivateRoute>
          <Request />
        </PrivateRoute>
      ),
    },
    {
      path: "/mentor/mprofile",
      element: (
        <PrivateRoute>
          <MenteeProfile />
        </PrivateRoute>
      ),
    },
    {
      path: "/mentor/calendar",
      element: (
        <PrivateRoute>
          <AppointmentCalender />
        </PrivateRoute>
      ),
    },
    {
      path: "/mentee/progress",
      element: (
        <PrivateRoute>
          <ProgressTracking />
        </PrivateRoute>
      ),
    },
    {
      path: "/mentee/progress/skill/:skillName",
      element: (
        <PrivateRoute>
          <SkillDetails />
        </PrivateRoute>
      ),
    },
    {
      path: "/mentee/quizapp",
      element: (
        <PrivateRoute>
          <QuizApp />
        </PrivateRoute>
      ),
    },
    {
      path: "/mentor/progress",
      element: (
        <PrivateRoute>
          <ProgressTrack />
        </PrivateRoute>
      ),
    },
    {
      path: "/mentor/messages",
      element: (
        <PrivateRoute>
          <Message_Mentor />
        </PrivateRoute>
      ),
    },
    {
      path: "/mentee/messages",
      element: (
        <PrivateRoute>
          <Message_Mentee />
        </PrivateRoute>
      ),
    },
    {
      path: "/mentee/search",
      element: (
        <PrivateRoute>
          <Search_Mentors />
        </PrivateRoute>
      ),
    },
    {
      path: "/mentee/mprofile",
      element: (
        <PrivateRoute>
          <MentorProfile />
        </PrivateRoute>
      ),
    },
    {
      path: "/mentee/book",
      element: (
        <PrivateRoute>
          <BookAppointment />
        </PrivateRoute>
      ),
    },
    {
      path: "mentee/learn",
      element: (
        <PrivateRoute>
          <LearnFromAI />
        </PrivateRoute>
      ),
    },
    {
      path: "/mentee/profile",
      element: (
        <PrivateRoute>
          <MenteeProfilePage />
        </PrivateRoute>
      ),
    },
    {
      path: "/mentor/profile",
      element: (
        <PrivateRoute>
          <MentorProfilePage />
        </PrivateRoute>
      ),
    },
    {
      path: "/mentor/home",
      element: (
        <PrivateRoute>
          <Home_Mentor />
        </PrivateRoute>
      ),
    },
    {
      path: "/mentee/home",
      element: (
        <PrivateRoute>
          <Home_Mentee />
        </PrivateRoute>
      ),
    },
    {
      path: "/mentor/availability",
      element: (
        <PrivateRoute>
          <UpdateAvailability />
        </PrivateRoute>
      ),
    },
  ];

  const plainRoutes = [
    { path: "/", element: <LandingPage /> },
    { path: "/signin", element: <SignIn /> },
    { path: "/signup", element: <SignUp /> },
    { path: "/mentee", element: <Mentee /> },
    { path: "/mentor", element: <Mentor /> },
    { path: "/terms", element: <Terms /> },
    { path: "/privacy", element: <Privacy /> },
    { path: "/cookies", element: <Cookies /> },
    { path: "/admin/login", element: <AdminLogin /> },
    { path: "/admin/dashboard", element: <AdminDashboard /> },
    { path: "/pending-approval", element: <PendingApproval /> },
    { path: "/account-rejected", element: <AccountRejected /> },
    {
      path: "/home",
      element: (
        <PrivateRoute>
          <Home />
        </PrivateRoute>
      ),
    },
    { path: "/verify-otp", element: <VerifyOTP /> },
  ];

  return (
    <>
      <Toaster position="top-right" />
      <SocketProvider>
        <BrowserRouter>
          <Routes>
            {/* Routes with PageLayout */}
            {layoutRoutes.map(({ path, element }) => (
              <Route
                key={path}
                path={path}
                element={<PageLayout>{element}</PageLayout>}
              />
            ))}

            {/* Routes without PageLayout */}
            {plainRoutes.map(({ path, element }) => (
              <Route key={path} path={path} element={element} />
            ))}
          </Routes>
        </BrowserRouter>
      </SocketProvider>
      <ToastContainer
        position="bottom-left"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </>
  );
}

export default App;
