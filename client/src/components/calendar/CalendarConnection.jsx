import React, { useState, useEffect } from "react";
import {
  FaCalendarAlt,
  FaCheck,
  FaExclamationTriangle,
  FaSync,
  FaTimes,
} from "react-icons/fa";
import { toast } from "react-hot-toast";

const CalendarConnection = ({ onConnectionChange }) => {
  const [connectionStatus, setConnectionStatus] = useState({
    connected: false,
    loading: true,
    error: null,
    lastUsed: null,
    connectedAt: null,
  });

  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  useEffect(() => {
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setConnectionStatus((prev) => ({
          ...prev,
          loading: false,
          error: "Authentication required",
        }));
        return;
      }

      const response = await fetch(
        "http://localhost:5274/api/calendar/google/status",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setConnectionStatus({
          connected: data.connected,
          loading: false,
          error: null,
          lastUsed: data.lastUsed,
          connectedAt: data.connectedAt,
          tokenExpired: data.tokenExpired,
          shouldRefresh: data.shouldRefresh,
        });

        if (onConnectionChange) {
          onConnectionChange(data.connected);
        }
      } else {
        const errorData = await response.json();
        setConnectionStatus((prev) => ({
          ...prev,
          loading: false,
          error: errorData.error || "Failed to check connection",
        }));
      }
    } catch (error) {
      console.error("Error checking calendar connection:", error);
      setConnectionStatus((prev) => ({
        ...prev,
        loading: false,
        error: "Network error",
      }));
    }
  };

  const connectCalendar = async () => {
    setIsConnecting(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        "http://localhost:5274/api/calendar/google/auth-url",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Open authorization URL in new window
        const authWindow = window.open(
          data.authUrl,
          "google-auth",
          "width=500,height=600,scrollbars=yes,resizable=yes"
        );

        // Check if window is closed (user completed or cancelled auth)
        const checkClosed = setInterval(() => {
          if (authWindow.closed) {
            clearInterval(checkClosed);
            // Wait a bit and then check connection status
            setTimeout(() => {
              checkConnectionStatus();
            }, 1000);
          }
        }, 1000);

        toast.info("Please complete authorization in the popup window");
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to get authorization URL");
      }
    } catch (error) {
      console.error("Error connecting calendar:", error);
      toast.error("Failed to connect calendar");
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectCalendar = async () => {
    setIsDisconnecting(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        "http://localhost:5274/api/calendar/google/disconnect",
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        setConnectionStatus((prev) => ({
          ...prev,
          connected: false,
          lastUsed: null,
          connectedAt: null,
        }));
        toast.success("Calendar disconnected successfully");
        if (onConnectionChange) {
          onConnectionChange(false);
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to disconnect calendar");
      }
    } catch (error) {
      console.error("Error disconnecting calendar:", error);
      toast.error("Failed to disconnect calendar");
    } finally {
      setIsDisconnecting(false);
    }
  };

  const testConnection = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        "http://localhost:5274/api/calendar/google/test-connection",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Connection test failed");
      }
    } catch (error) {
      console.error("Error testing connection:", error);
      toast.error("Failed to test connection");
    }
  };

  const debugConnection = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        "http://localhost:5274/api/calendar/google/debug",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        toast.success(
          `Found ${data.totalRecords} OAuth records. Check console for details.`
        );
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Debug failed");
      }
    } catch (error) {
      console.error("Error debugging connection:", error);
      toast.error("Failed to debug connection");
    }
  };

  const refreshToken = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        "http://localhost:5274/api/calendar/google/refresh-token",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        toast.success("Token refreshed successfully");
        checkConnectionStatus();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to refresh token");
      }
    } catch (error) {
      console.error("Error refreshing token:", error);
      toast.error("Failed to refresh token");
    }
  };

  if (connectionStatus.loading) {
    return (
      <div className="p-2">
        <div className="flex items-center justify-center">
          <FaSync className="animate-spin text-primary-color mr-2" />
          <span className="text-white/80">Checking calendar connection...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <FaCalendarAlt className="mr-2 text-primary-color" />
          Google Calendar Integration
        </h3>
        {connectionStatus.connected && (
          <span className="bg-green-500/10 text-green-400 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center border border-green-500/20">
            <FaCheck className="mr-1" />
            Connected
          </span>
        )}
      </div>

      {connectionStatus.error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <FaExclamationTriangle className="text-red-400 mr-2" />
            <span className="text-red-300">{connectionStatus.error}</span>
          </div>
        </div>
      )}

      {connectionStatus.connected ? (
        <div className="space-y-4">
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <p className="text-green-300 mb-2">
              Your Google Calendar is connected! Appointments will be
              automatically added to your calendar.
            </p>
            {connectionStatus.connectedAt && (
              <p className="text-green-400 text-sm">
                Connected:{" "}
                {new Date(connectionStatus.connectedAt).toLocaleDateString()}
              </p>
            )}
            {connectionStatus.lastUsed && (
              <p className="text-green-400 text-sm">
                Last used:{" "}
                {new Date(connectionStatus.lastUsed).toLocaleDateString()}
              </p>
            )}
          </div>

          {connectionStatus.tokenExpired && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <div className="flex items-center">
                <FaExclamationTriangle className="text-yellow-400 mr-2" />
                <span className="text-yellow-300">
                  Your token has expired. Please refresh it.
                </span>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              onClick={testConnection}
              className="bg-primary-color/10 hover:bg-primary-color/20 text-primary-color border border-primary-color/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Test Connection
            </button>

            <button
              onClick={debugConnection}
              className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Debug
            </button>

            {connectionStatus.shouldRefresh && (
              <button
                onClick={refreshToken}
                className="bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Refresh Token
              </button>
            )}

            <button
              onClick={disconnectCalendar}
              disabled={isDisconnecting}
              className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center"
            >
              {isDisconnecting ? (
                <>
                  <FaSync className="animate-spin mr-2" />
                  Disconnecting...
                </>
              ) : (
                <>
                  <FaTimes className="mr-2" />
                  Disconnect
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-primary-color/10 border border-primary-color/20 rounded-lg p-4">
            <p className="text-white/90 mb-2">
              Connect your Google Calendar to automatically sync appointments
              with calendar invites and meeting links.
            </p>
            <ul className="text-white/80 text-sm space-y-1">
              <li>• Automatic calendar event creation</li>
              <li>• Email invitations with .ics files</li>
              <li>• Google Meet integration</li>
              <li>• Automatic reminders</li>
            </ul>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={connectCalendar}
              disabled={isConnecting}
              className="bg-primary-color hover:bg-primary-color/90 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center"
            >
              {isConnecting ? (
                <>
                  <FaSync className="animate-spin mr-2" />
                  Connecting...
                </>
              ) : (
                <>
                  <FaCalendarAlt className="mr-2" />
                  Connect Google Calendar
                </>
              )}
            </button>

            <button
              onClick={debugConnection}
              className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Debug
            </button>
          </div>

          <p className="text-xs text-white/60">
            By connecting, you'll be redirected to Google to authorize calendar
            access.
          </p>
        </div>
      )}
    </div>
  );
};

export default CalendarConnection;
