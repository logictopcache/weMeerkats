import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaArrowLeft,
  FaCalendarAlt,
} from "react-icons/fa";

const CalendarConnected = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const success = searchParams.get("success");
    const error = searchParams.get("error");

    if (success === "true") {
      setStatus("success");
      setMessage("Your Google Calendar has been connected successfully!");
    } else if (error) {
      setStatus("error");
      setMessage(getErrorMessage(error));
    } else {
      setStatus("error");
      setMessage("Unknown error occurred during calendar connection.");
    }
  }, [searchParams]);

  const getErrorMessage = (error) => {
    switch (error) {
      case "authorization_failed":
        return "Authorization failed. Please try connecting your calendar again.";
      case "access_denied":
        return "Access denied. You need to grant calendar permissions to use this feature.";
      case "invalid_request":
        return "Invalid request. Please try again.";
      default:
        return "An error occurred while connecting your calendar. Please try again.";
    }
  };

  const handleGoBack = () => {
    // Navigate back to the previous page or to a default page
    navigate(-1);
  };

  const handleGoToCalendar = () => {
    // Navigate to calendar/settings page
    navigate("/mentor/calendar");
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full mx-4">
          <div className="flex items-center justify-center mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
          <p className="text-center text-gray-600">
            Processing calendar connection...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full mx-4">
        <div className="text-center">
          {status === "success" ? (
            <>
              <FaCheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Success!
              </h2>
              <p className="text-gray-600 mb-6">{message}</p>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-green-800 mb-2">
                  What's next?
                </h3>
                <ul className="text-green-700 text-sm space-y-1 text-left">
                  <li>
                    • New appointments will be automatically added to your
                    calendar
                  </li>
                  <li>
                    • Participants will receive calendar invites via email
                  </li>
                  <li>
                    • Google Meet links will be included for virtual meetings
                  </li>
                  <li>• Reminders will be sent before each session</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleGoToCalendar}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
                >
                  <FaCalendarAlt className="mr-2" />
                  View Calendar
                </button>
                <button
                  onClick={handleGoBack}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
                >
                  <FaArrowLeft className="mr-2" />
                  Go Back
                </button>
              </div>
            </>
          ) : (
            <>
              <FaExclamationTriangle className="mx-auto h-16 w-16 text-red-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Connection Failed
              </h2>
              <p className="text-gray-600 mb-6">{message}</p>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-red-800 mb-2">
                  Troubleshooting
                </h3>
                <ul className="text-red-700 text-sm space-y-1 text-left">
                  <li>• Make sure you granted calendar permissions</li>
                  <li>• Check that your Google account is active</li>
                  <li>• Try clearing your browser cache and cookies</li>
                  <li>• Contact support if the issue persists</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleGoBack}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
                >
                  <FaArrowLeft className="mr-2" />
                  Try Again
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarConnected;
