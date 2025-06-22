import { useState } from "react";
import {
  submitMentorProfile,
  submitLearnerProfile,
} from "../services/api/profileService";

export const useProfileForm = (role) => {
  const initialState =
    role === "mentor"
      ? {
          phone: "",
          bio: "",
          profilePictureUrl: "",
          education: [
            {
              degree: "",
              universityName: "",
              location: "",
              duration: "",
              description: "",
            },
          ],
          designation: "",
          workExperiences: [
            {
              title: "",
              companyName: "",
              location: "",
              duration: "",
              description: "",
            },
          ],
          certification: "",
          expertise: "",
          skills: [],
        }
      : {
          education: [
            {
              universityName: "",
              degree: "",
              duration: "",
              location: "",
              description: "",
            },
          ],
          bio: "",
          skills: [],
        };

  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (submitData) => {
    try {
      setLoading(true);
      const response = await (role === "mentor"
        ? submitMentorProfile(submitData)
        : submitLearnerProfile(submitData));
      return response;
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    setFormData,
    loading,
    handleSubmit,
  };
};
