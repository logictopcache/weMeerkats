import MeetingRequestList from "../../../components/mentor/requests/MeetingRequestList"
// import Footer from "../../../components/landingPage/Footer"
import MentorHeader from "../../../components/mentor/home/Header"
import Navigation from "../../../components/mentor/home/Navigation"
// import UnderDevelopmentModal from '../../../components/modals/UnderDevelopmentModal'

const Request = () => {
  return (
    <>
      <MentorHeader />
      <Navigation />
      <div className="relative">
        <MeetingRequestList />
        {/* <UnderDevelopmentModal /> */}
      </div>
    </>
  )
}

export default Request