import { useState, useEffect } from "react";
import MentorHeader from "../../../components/mentor/home/Header";
import Navigation from "../../../components/mentor/home/Navigation";
import MentorshipStatus from "../../../components/mentor/home/MentorshipStatus";
import ActiveMentees from "../../../components/mentor/home/ActiveMentees";
// import Footer from "../../../components/landingPage/Footer"
import { fetchMenteesProgress } from "../../../services/api/mentorProgressApi";

const Home_Mentor = () => {
  const [mentees, setMentees] = useState([]);

  useEffect(() => {
    const getMenteesProgress = async () => {
      try {
        const data = await fetchMenteesProgress();
        // Transform the data to match the expected format for ActiveMentees
        const transformedMentees = data.menteeProgress.map((progress) => ({
          _id: progress.learner._id,
          firstName: progress.learner.firstName,
          lastName: progress.learner.lastName,
          email: progress.learner.email,
          profilePictureUrl: progress.learner.profilePictureUrl, // Add profile picture URL
          skills: progress.skills,
          overallProgress: progress.overallProgress,
          completedSessions: progress.skills.reduce(
            (acc, skill) => acc + skill.completedAssignments,
            0
          ),
          totalSessions: progress.skills.reduce(
            (acc, skill) => acc + skill.totalAssignments,
            0
          ),
          startDate: progress.startDate,
        }));
        setMentees(transformedMentees);
      } catch (error) {
        console.error("Error fetching mentees progress:", error);
        setMentees([]); // Set empty array on error
      }
    };
    getMenteesProgress();
  }, []);

  return (
    <div className="min-h-screen bg-[#0A1128]">
      <MentorHeader />
      <Navigation />
      <MentorshipStatus />
      <div className="pb-8">
        <ActiveMentees mentees={mentees} />
      </div>
      {/* <Footer></Footer> */}
    </div>
  );
};

export default Home_Mentor;
