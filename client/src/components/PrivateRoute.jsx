import { Navigate } from "react-router-dom";
import PropTypes from "prop-types";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("authToken");
  const emailVerified = localStorage.getItem("emailVerified") === "true";
  const verified = localStorage.getItem("verified") === "true";
  const rejected = localStorage.getItem("rejected") === "true";

  if (!token) {
    return <Navigate to="/signin" />;
  }

  if (!emailVerified) {
    return <Navigate to="/verify-otp" />;
  }

  if (rejected) {
    return <Navigate to="/account-rejected" />;
  }

  if (!verified) {
    return <Navigate to="/pending-approval" />;
  }

  return children;
};

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default PrivateRoute;
