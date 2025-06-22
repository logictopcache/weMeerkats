import Navigation from "../../../components/mentee/home/Navigation"
import MenteeHeader from "../../../components/mentee/home/Header"
import Mentors from "../../../components/mentee/home/Mentors"
// import Footer from "../../../components/landingPage/Footer"

const Home_Mentee = () => {
  return (
    <div className="min-h-screen bg-[#0A1128]">
      <MenteeHeader />
      <Navigation />
      <Mentors />
      {/* <Footer /> */}
    </div>
  )
}

export default Home_Mentee