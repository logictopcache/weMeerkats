import PropTypes from "prop-types";
import { useMemo } from "react";
import Avvvatars from "avvvatars-react";
import { API_ENDPOINTS } from "../services/api/config";

const ProfileAvatar = ({
  name = "",
  email = "",
  image = null,
  size = "md",
  style = "character", // can be 'character' or 'shape'
}) => {
  const sizes = {
    sm: 32,
    md: 40,
    lg: 48,
    xl: 128,
  };

  const generateAvatar = useMemo(() => {
    if (typeof window === "undefined" || !window.Avataaars) {
      return null;
    }

    const nameInitials = name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();

    const options = {
      style: "circle",
      background: "#0c1631",
      width: sizes[size],
      height: sizes[size],
      // Generate consistent options based on email or name
      skin: ["light", "medium", "dark"][nameInitials.charCodeAt(0) % 3],
      top: style === "character" ? "shortHair" : "shortWaved",
      hairColor: ["brown", "black", "blonde"][nameInitials.charCodeAt(0) % 3],
      eyes: ["default", "happy", "wink"][nameInitials.charCodeAt(0) % 3],
      eyebrows: "defaultNatural",
      mouth: ["default", "smile", "serious"][nameInitials.charCodeAt(0) % 3],
      clothing: "blazerAndShirt",
      clothingColor: ["blue02", "gray01", "black"][
        nameInitials.charCodeAt(0) % 3
      ],
    };

    return window.Avataaars.create(options);
  }, [name, email, size, style]);

  // If an image URL is provided and it's valid, use it
  if (image && !image.includes("ui-avatars.com")) {
    // Construct full URL if it's just a filename
    const imageUrl = image.startsWith("http")
      ? image
      : `${API_ENDPOINTS.BASE_URL}/uploads/${image}`;

    return (
      <div style={{ width: sizes[size], height: sizes[size] }}>
        <img
          src={imageUrl}
          alt={name}
          className="rounded-full object-cover w-full h-full"
          onError={(e) => {
            // Fallback to generated avatar if image fails to load
            e.target.style.display = "none";
            const fallbackDiv =
              e.target.parentElement.querySelector(".fallback-avatar");
            if (fallbackDiv) {
              fallbackDiv.style.display = "block";
            }
          }}
        />
        <div className="fallback-avatar" style={{ display: "none" }}>
          <Avvvatars value={email || name} style={style} size={sizes[size]} />
        </div>
      </div>
    );
  }

  // Use generated Avataaars SVG
  if (generateAvatar) {
    return (
      <div
        className="rounded-full overflow-hidden"
        style={{ width: sizes[size], height: sizes[size] }}
        dangerouslySetInnerHTML={{ __html: generateAvatar }}
      />
    );
  }

  // Fallback to Avvvatars if Avataaars is not available
  return <Avvvatars value={email || name} style={style} size={sizes[size]} />;
};

ProfileAvatar.propTypes = {
  name: PropTypes.string,
  email: PropTypes.string,
  image: PropTypes.string,
  size: PropTypes.oneOf(["sm", "md", "lg", "xl"]),
  style: PropTypes.oneOf(["character", "shape"]),
};

ProfileAvatar.defaultProps = {
  size: "md",
  style: "character",
  image: null,
  email: "",
  name: "",
};

export default ProfileAvatar;
