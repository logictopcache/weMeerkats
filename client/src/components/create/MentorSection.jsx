import { useProfileForm } from "../../hooks/useProfileForm";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { fetchSkills } from "../../services/api/skillsService";
// import { mentorProfileValidation, validateForm} from '../../utils/profileValidation';

const MentorSection = ({ title, subtitle }) => {
  const navigate = useNavigate();
  const { formData, setFormData, loading, handleSubmit } =
    useProfileForm("mentor");

  const [selectedSkills, setSelectedSkills] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExpertise, setSelectedExpertise] = useState([]);
  const [expertiseSearchTerm, setExpertiseSearchTerm] = useState("");
  const [selectedCertifications, setSelectedCertifications] = useState([]);
  const [certSearchTerm, setCertSearchTerm] = useState("");
  const [skillsList, setSkillsList] = useState([]);
  const [isLoadingSkills, setIsLoadingSkills] = useState(true);
  const [skillsError, setSkillsError] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null); // State for file

  const [errors, setErrors] = useState({});

  const [editingSlot, setEditingSlot] = useState(null);
  const durations = [30, 45, 60, 90, 120];

  const locationsList = [
    "Pakistan",
    "India",
    "United States",
    "United Kingdom",
    "Canada",
    "Australia",
    "Germany",
    "France",
    "Spain",
    "Italy",
    "Japan",
    "China",
    "Singapore",
    "UAE",
  ];

  const certificationsList = [
    "AWS Solutions Architect",
    "AWS Developer Associate",
    "Google Cloud Professional",
    "Azure Solutions Architect",
    "Certified Kubernetes Administrator",
    "CISSP",
    "PMP",
    "Scrum Master",
    "CCNA",
    "CompTIA A+",
    "Oracle Certified Professional",
    "MongoDB Certified Developer",
  ];

  const expertiseList = [
    "Web Development",
    "Mobile Development",
    "Cloud Architecture",
    "Database Design",
    "System Design",
    "DevOps Engineering",
    "Machine Learning Engineering",
    "Data Engineering",
    "Security Engineering",
    "UI/UX Design",
  ];

  useEffect(() => {
    const loadSkills = async () => {
      try {
        setIsLoadingSkills(true);
        const skills = await fetchSkills();
        setSkillsList(skills);
        setSkillsError(null);
      } catch (error) {
        setSkillsError("Failed to load skills. Please try again later.");
        console.error("Error loading skills:", error);
      } finally {
        setIsLoadingSkills(false);
      }
    };

    loadSkills();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEducationChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      education: [
        {
          ...prev.education[0],
          [field]: value,
        },
      ],
    }));
  };

  const handleWorkExperienceChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      workExperiences: [
        {
          ...prev.workExperiences[0],
          [field]: value,
        },
      ],
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
    } else {
      setProfilePicture(null);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!formData.education?.[0]?.universityName) {
      newErrors.education = [{ universityName: "University name is required" }];
    }

    if (!formData.education?.[0]?.degree) {
      newErrors.education = [
        { ...newErrors.education?.[0], degree: "Degree is required" },
      ];
    }

    if (!formData.workExperiences?.[0]?.title) {
      newErrors.workExperiences = [
        { title: "Work experience title is required" },
      ];
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const firstError = Object.values(newErrors)[0];
      if (typeof firstError === "string") {
        toast.error(firstError);
      } else if (Array.isArray(firstError)) {
        const firstArrayError = Object.values(firstError[0])[0];
        toast.error(firstArrayError);
      }
      return;
    }

    try {
      const submitData = new FormData();

      // Append basic information
      submitData.append("phone", formData.phone || "");
      submitData.append("bio", formData.bio || "");
      if (profilePicture) {
        submitData.append("image", profilePicture);
      }

      // Append education and work experience as JSON strings
      submitData.append("education", JSON.stringify(formData.education || []));
      submitData.append(
        "workExperiences",
        JSON.stringify(formData.workExperiences || [])
      );
      submitData.append("skills", JSON.stringify(formData.skills || []));
      submitData.append("expertise", JSON.stringify(formData.expertise || []));
      submitData.append(
        "certification",
        JSON.stringify(formData.certification || [])
      );
      submitData.append(
        "availability",
        JSON.stringify(formData.availability || {})
      );

      await handleSubmit(submitData);
      toast.success("Profile created successfully!");
      navigate("/mentor/home");
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(error.message || "Failed to create profile");
    }
  };
  const handleExpertiseSelect = (expertise) => {
    if (!selectedExpertise.includes(expertise)) {
      const updatedExpertise = [...selectedExpertise, expertise];
      setSelectedExpertise(updatedExpertise);
      setFormData((prev) => ({
        ...prev,
        expertise: updatedExpertise.join(", "),
      }));
    }
    setExpertiseSearchTerm("");
  };

  const handleExpertiseRemove = (expertiseToRemove) => {
    const updatedExpertise = selectedExpertise.filter(
      (exp) => exp !== expertiseToRemove
    );
    setSelectedExpertise(updatedExpertise);
    setFormData((prev) => ({
      ...prev,
      expertise: updatedExpertise.join(", "),
    }));
  };

  const handleCertificationSelect = (cert) => {
    if (!selectedCertifications.includes(cert)) {
      const updatedCerts = [...selectedCertifications, cert];
      setSelectedCertifications(updatedCerts);
      setFormData((prev) => ({
        ...prev,
        certification: updatedCerts.join(", "),
      }));
    }
    setCertSearchTerm("");
  };

  const handleCertificationRemove = (certToRemove) => {
    const updatedCerts = selectedCertifications.filter(
      (cert) => cert !== certToRemove
    );
    setSelectedCertifications(updatedCerts);
    setFormData((prev) => ({
      ...prev,
      certification: updatedCerts.join(", "),
    }));
  };

  const filteredExpertise = expertiseList.filter(
    (exp) =>
      exp.toLowerCase().includes(expertiseSearchTerm.toLowerCase()) &&
      !selectedExpertise.includes(exp)
  );

  const filteredCertifications = certificationsList.filter(
    (cert) =>
      cert.toLowerCase().includes(certSearchTerm.toLowerCase()) &&
      !selectedCertifications.includes(cert)
  );

  const handleSkillSelect = (skill) => {
    if (!selectedSkills.includes(skill)) {
      const updatedSkills = [...selectedSkills, skill];
      setSelectedSkills(updatedSkills);
      setFormData((prev) => ({
        ...prev,
        skills: updatedSkills,
      }));
    }
    setSearchTerm("");
  };

  const handleSkillRemove = (skillToRemove) => {
    const updatedSkills = selectedSkills.filter(
      (skill) => skill !== skillToRemove
    );
    setSelectedSkills(updatedSkills);
    setFormData((prev) => ({
      ...prev,
      skills: updatedSkills,
    }));
  };

  const filteredSkills = skillsList.filter(
    (skill) =>
      skill.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !selectedSkills.includes(skill)
  );

  const formSectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const sectionStyle =
    "bg-white/[0.02] backdrop-blur-sm rounded-xl p-6 border border-white/10";
  const inputStyle =
    "w-full px-4 py-3 rounded-lg bg-white/[0.03] border border-white/10 focus:border-primary-color text-white placeholder-white/40 transition-colors";
  const labelStyle = "text-white/90 block mb-2";
  const selectStyle =
    "w-full px-4 py-3 rounded-lg bg-white/[0.03] border border-white/10 focus:border-primary-color text-white transition-colors";
  const optionStyle = "bg-[#0A1128]";

  const handleSlotClick = (day, time) => {
    setEditingSlot({ day, time });
  };

  const handleSlotUpdate = (day, time, selectedSlotSkills, duration) => {
    setFormData((prev) => {
      const daySlots = prev.availability?.[day] || [];
      const updatedSlots = daySlots.filter((slot) => slot.startTime !== time);

      if (selectedSlotSkills.length > 0) {
        updatedSlots.push({
          startTime: time,
          isAvailable: true,
          skills: selectedSlotSkills,
          duration: duration,
        });
      }

      return {
        ...prev,
        availability: {
          ...prev.availability,
          [day]: updatedSlots,
        },
      };
    });
    setEditingSlot(null);
  };

  const SlotEditModal = ({ day, time, onClose }) => {
    const slot = formData.availability?.[day]?.find(
      (s) => s.startTime === time
    ) || { skills: [], duration: 60 };
    const [selectedSlotSkills, setSelectedSlotSkills] = useState(
      slot.skills || []
    );
    const [duration, setDuration] = useState(slot.duration || 60);

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-[#0c1631] rounded-2xl p-6 w-full max-w-md">
          <h3 className="text-xl font-semibold text-white mb-4">
            Edit Time Slot: {time}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-white/80 block mb-2">Your Skills</label>
              {selectedSkills.length === 0 ? (
                <div className="text-white/60 text-sm p-3 bg-white/5 rounded-lg">
                  Please add skills to your profile first
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {selectedSkills.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() =>
                        setSelectedSlotSkills((prev) =>
                          prev.includes(skill)
                            ? prev.filter((s) => s !== skill)
                            : [...prev, skill]
                        )
                      }
                      className={`px-3 py-2 rounded-lg text-sm ${
                        selectedSlotSkills.includes(skill)
                          ? "bg-primary-color text-white"
                          : "bg-white/[0.03] text-white/80"
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="text-white/80 block mb-2">
                Duration (minutes)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {durations.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDuration(d)}
                    className={`px-3 py-2 rounded-lg text-sm ${
                      duration === d
                        ? "bg-primary-color text-white"
                        : "bg-white/[0.03] text-white/80"
                    }`}
                  >
                    {d} min
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end pt-4 space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-white/[0.03] text-white/80 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() =>
                  handleSlotUpdate(day, time, selectedSlotSkills, duration)
                }
                className="px-4 py-2 bg-primary-color text-white rounded-lg"
                disabled={selectedSlotSkills.length === 0}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          {title && (
            <>
              {title.split(" ").slice(0, -2).join(" ")}{" "}
              <span className="text-primary-color">
                {title.split(" ").slice(-2).join(" ")}
              </span>
            </>
          )}
        </h1>
        {subtitle && (
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">{subtitle}</p>
        )}
      </motion.div>

      <motion.form
        onSubmit={handleFormSubmit}
        className="space-y-8"
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.2,
            },
          },
        }}
      >
        {/* Basic Information */}
        <motion.div variants={formSectionVariants} className={sectionStyle}>
          <h2 className="text-2xl font-semibold text-primary-color mb-6 flex items-center">
            <span className="w-8 h-8 rounded-lg bg-primary-color/20 flex items-center justify-center mr-3 text-lg">
              1
            </span>
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className={labelStyle}>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={inputStyle}
                  placeholder="Enter your phone number"
                />
              </div>
              <div>
                <label className={labelStyle}>Profile Picture</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className={`${inputStyle} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-color file:text-white hover:file:bg-primary-color/80 file:cursor-pointer`}
                />
                {profilePicture && (
                  <p className="text-sm text-primary-color mt-2">
                    Selected: {profilePicture.name}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className={labelStyle}>Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  className={`${inputStyle} min-h-[120px]`}
                  placeholder="Tell us about yourself and your mentoring experience..."
                  rows={4}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Education */}
        <motion.div variants={formSectionVariants} className={sectionStyle}>
          <h2 className="text-2xl font-semibold text-primary-color mb-6 flex items-center">
            <span className="w-8 h-8 rounded-lg bg-primary-color/20 flex items-center justify-center mr-3 text-lg">
              2
            </span>
            Education
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelStyle}>Degree</label>
              <select
                value={formData.education[0].degree}
                onChange={(e) =>
                  handleEducationChange("degree", e.target.value)
                }
                className={`${selectStyle} ${
                  errors.education?.[0]?.degree ? "border-red-500" : ""
                }`}
              >
                <option value="" className={optionStyle}>
                  Select Degree
                </option>
                <option value="Bachelors" className={optionStyle}>
                  Bachelors
                </option>
                <option value="Masters" className={optionStyle}>
                  Masters
                </option>
                <option value="PHD" className={optionStyle}>
                  PHD
                </option>
                <option value="Diploma" className={optionStyle}>
                  Diploma
                </option>
                <option value="Certificate" className={optionStyle}>
                  Certificate
                </option>
              </select>
            </div>
            <div>
              <label className={labelStyle}>University Name</label>
              <input
                type="text"
                value={formData.education[0].universityName}
                onChange={(e) =>
                  handleEducationChange("universityName", e.target.value)
                }
                className={`${inputStyle} ${
                  errors.education?.[0]?.universityName ? "border-red-500" : ""
                }`}
                placeholder="Enter university name"
              />
            </div>
            <div>
              <label className={labelStyle}>Duration</label>
              <select
                value={formData.education[0].duration}
                onChange={(e) =>
                  handleEducationChange("duration", e.target.value)
                }
                className={selectStyle}
              >
                <option value="" className={optionStyle}>
                  Select Duration
                </option>
                {Array.from({ length: 9 }, (_, i) => i + 2).map((years) => (
                  <option
                    key={years}
                    value={`${years} years`}
                    className={optionStyle}
                  >
                    {years} years
                  </option>
                ))}
                <option value="10+ years" className={optionStyle}>
                  10+ years
                </option>
              </select>
            </div>
            <div>
              <label className={labelStyle}>Location</label>
              <select
                value={formData.education[0].location}
                onChange={(e) =>
                  handleEducationChange("location", e.target.value)
                }
                className={selectStyle}
              >
                <option value="" className={optionStyle}>
                  Select Location
                </option>
                {locationsList.map((location) => (
                  <option
                    key={location}
                    value={location}
                    className={optionStyle}
                  >
                    {location}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className={labelStyle}>Description</label>
              <textarea
                value={formData.education[0].description}
                onChange={(e) =>
                  handleEducationChange("description", e.target.value)
                }
                className={inputStyle}
                rows={3}
                placeholder="Describe your educational background..."
              />
            </div>
          </div>
        </motion.div>

        {/* Work Experience */}
        <motion.div variants={formSectionVariants} className={sectionStyle}>
          <h2 className="text-2xl font-semibold text-primary-color mb-6 flex items-center">
            <span className="w-8 h-8 rounded-lg bg-primary-color/20 flex items-center justify-center mr-3 text-lg">
              3
            </span>
            Work Experience
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelStyle}>Title</label>
              <input
                type="text"
                value={formData.workExperiences[0].title}
                onChange={(e) =>
                  handleWorkExperienceChange("title", e.target.value)
                }
                className={`${inputStyle} ${
                  errors.workExperiences?.[0]?.title ? "border-red-500" : ""
                }`}
                placeholder="Enter your job title"
              />
            </div>
            <div>
              <label className={labelStyle}>Company Name</label>
              <input
                type="text"
                value={formData.workExperiences[0].companyName}
                onChange={(e) =>
                  handleWorkExperienceChange("companyName", e.target.value)
                }
                className={inputStyle}
                placeholder="Enter company name"
              />
            </div>
            <div>
              <label className={labelStyle}>Location</label>
              <input
                type="text"
                value={formData.workExperiences[0].location}
                onChange={(e) =>
                  handleWorkExperienceChange("location", e.target.value)
                }
                className={inputStyle}
                placeholder="Enter work location"
              />
            </div>
            <div>
              <label className={labelStyle}>Duration</label>
              <input
                type="text"
                value={formData.workExperiences[0].duration}
                onChange={(e) =>
                  handleWorkExperienceChange("duration", e.target.value)
                }
                className={inputStyle}
                placeholder="e.g., 2 years"
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelStyle}>Description</label>
              <textarea
                value={formData.workExperiences[0].description}
                onChange={(e) =>
                  handleWorkExperienceChange("description", e.target.value)
                }
                className={inputStyle}
                rows={3}
                placeholder="Describe your work responsibilities and achievements..."
              />
            </div>
          </div>
        </motion.div>

        {/* Skills & Expertise */}
        <motion.div
          variants={formSectionVariants}
          className={`${sectionStyle} relative z-50`}
        >
          <h2 className="text-2xl font-semibold text-primary-color mb-6 flex items-center">
            <span className="w-8 h-8 rounded-lg bg-primary-color/20 flex items-center justify-center mr-3 text-lg">
              4
            </span>
            Skills & Expertise
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelStyle}>Skills</label>
              <div className="relative">
                <div className="border border-white/10 p-4 rounded-lg bg-white/[0.03] min-h-[100px] focus-within:border-primary-color transition-colors">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedSkills.map((skill) => (
                      <motion.span
                        key={skill}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="bg-primary-color/20 text-primary-color px-4 py-1.5 rounded-full flex items-center gap-2 text-sm border border-primary-color/30"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleSkillRemove(skill)}
                          className="text-primary-color hover:text-white transition-colors"
                        >
                          ×
                        </button>
                      </motion.span>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-transparent outline-none text-white placeholder-white/40"
                    placeholder={
                      isLoadingSkills
                        ? "Loading skills..."
                        : skillsError
                        ? "Error loading skills"
                        : selectedSkills.length === 0
                        ? "Type or select skills..."
                        : "Add more skills..."
                    }
                    disabled={isLoadingSkills || skillsError}
                  />
                  {skillsError && (
                    <p className="text-red-500 text-sm mt-2">{skillsError}</p>
                  )}
                </div>
                {searchTerm &&
                  filteredSkills.length > 0 &&
                  !isLoadingSkills &&
                  !skillsError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute w-full mt-2 bg-[#0A1128] border border-white/10 rounded-lg shadow-xl max-h-60 overflow-y-auto"
                      style={{
                        top: "100%",
                        left: 0,
                        zIndex: 1000,
                      }}
                    >
                      {filteredSkills.map((skill) => (
                        <div
                          key={skill}
                          onClick={() => handleSkillSelect(skill)}
                          className="px-4 py-2 hover:bg-white/[0.03] cursor-pointer text-white/90 transition-colors first:rounded-t-lg last:rounded-b-lg"
                        >
                          {skill}
                        </div>
                      ))}
                    </motion.div>
                  )}
              </div>
            </div>

            <div>
              <label className={labelStyle}>Expertise</label>
              <div className="relative">
                <div className="border border-white/10 p-4 rounded-lg bg-white/[0.03] min-h-[100px] focus-within:border-primary-color transition-colors">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedExpertise.map((exp) => (
                      <motion.span
                        key={exp}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="bg-primary-color/20 text-primary-color px-4 py-1.5 rounded-full flex items-center gap-2 text-sm border border-primary-color/30"
                      >
                        {exp}
                        <button
                          type="button"
                          onClick={() => handleExpertiseRemove(exp)}
                          className="text-primary-color hover:text-white transition-colors"
                        >
                          ×
                        </button>
                      </motion.span>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={expertiseSearchTerm}
                    onChange={(e) => setExpertiseSearchTerm(e.target.value)}
                    className="w-full bg-transparent outline-none text-white placeholder-white/40"
                    placeholder={
                      selectedExpertise.length === 0
                        ? "Type or select expertise..."
                        : "Add more expertise..."
                    }
                  />
                </div>
                {expertiseSearchTerm && filteredExpertise.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute z-10 w-full mt-2 bg-[#0A1128] border border-white/10 rounded-lg shadow-xl"
                  >
                    {filteredExpertise.map((exp) => (
                      <div
                        key={exp}
                        onClick={() => handleExpertiseSelect(exp)}
                        className="px-4 py-2 hover:bg-white/[0.03] cursor-pointer text-white/90 transition-colors first:rounded-t-lg last:rounded-b-lg"
                      >
                        {exp}
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>
            </div>

            <div>
              <label className={labelStyle}>Certifications</label>
              <div className="relative">
                <div className="border border-white/10 p-4 rounded-lg bg-white/[0.03] min-h-[100px] focus-within:border-primary-color transition-colors">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedCertifications.map((cert) => (
                      <motion.span
                        key={cert}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="bg-primary-color/20 text-primary-color px-4 py-1.5 rounded-full flex items-center gap-2 text-sm border border-primary-color/30"
                      >
                        {cert}
                        <button
                          type="button"
                          onClick={() => handleCertificationRemove(cert)}
                          className="text-primary-color hover:text-white transition-colors"
                        >
                          ×
                        </button>
                      </motion.span>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={certSearchTerm}
                    onChange={(e) => setCertSearchTerm(e.target.value)}
                    className="w-full bg-transparent outline-none text-white placeholder-white/40"
                    placeholder={
                      selectedCertifications.length === 0
                        ? "Type or select certifications..."
                        : "Add more certifications..."
                    }
                  />
                </div>
                {certSearchTerm && filteredCertifications.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute z-10 w-full mt-2 bg-[#0A1128] border border-white/10 rounded-lg shadow-xl"
                  >
                    {filteredCertifications.map((cert) => (
                      <div
                        key={cert}
                        onClick={() => handleCertificationSelect(cert)}
                        className="px-4 py-2 hover:bg-white/[0.03] cursor-pointer text-white/90 transition-colors first:rounded-t-lg last:rounded-b-lg"
                      >
                        {cert}
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Availability Schedule */}
        <motion.div
          variants={formSectionVariants}
          className={`${sectionStyle} relative z-40`}
        >
          <h2 className="text-2xl font-semibold text-primary-color mb-6 flex items-center">
            <span className="w-8 h-8 rounded-lg bg-primary-color/20 flex items-center justify-center mr-3 text-lg">
              5
            </span>
            Weekly Availability
          </h2>
          <div className="space-y-6">
            {[
              "monday",
              "tuesday",
              "wednesday",
              "thursday",
              "friday",
              "saturday",
              "sunday",
            ].map((day) => (
              <motion.div
                key={day}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="p-4 bg-white/[0.02] rounded-lg border border-white/10"
              >
                <h3 className="text-lg text-white/90 capitalize mb-4">{day}</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {[
                    "09:00",
                    "10:00",
                    "11:00",
                    "12:00",
                    "13:00",
                    "14:00",
                    "15:00",
                    "16:00",
                    "17:00",
                    "18:00",
                    "19:00",
                    "20:00",
                  ].map((time) => {
                    const slot = formData.availability?.[day]?.find(
                      (s) => s.startTime === time
                    );
                    return (
                      <button
                        key={`${day}-${time}`}
                        type="button"
                        onClick={() => handleSlotClick(day, time)}
                        className={`
                          flex flex-col items-center justify-center gap-1 px-4 py-3 rounded-xl
                          transition-all duration-200 border text-sm font-medium
                          ${
                            slot
                              ? "bg-gradient-to-r from-primary-color to-blue-500 text-white border-transparent"
                              : "bg-white/[0.03] border-white/10 text-white/80 hover:bg-white/[0.06]"
                          }
                        `}
                      >
                        <div className="flex items-center gap-2">
                          <span>{time}</span>
                        </div>
                        {slot && (
                          <>
                            <div className="text-xs opacity-80">
                              {slot.duration}min
                            </div>
                            <div className="text-xs opacity-80 truncate max-w-full">
                              {slot.skills?.length} skills
                            </div>
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {editingSlot && (
          <SlotEditModal
            day={editingSlot.day}
            time={editingSlot.time}
            onClose={() => setEditingSlot(null)}
          />
        )}

        {/* Submit Button */}
        <motion.div variants={formSectionVariants} className="flex justify-end">
          <motion.button
            type="submit"
            disabled={loading}
            className="relative group px-8 py-4 bg-primary-color rounded-xl text-white font-medium overflow-hidden transition-all hover:shadow-lg disabled:opacity-50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary-color to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative">
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving Profile...
                </div>
              ) : (
                "Save Profile"
              )}
            </span>
          </motion.button>
        </motion.div>
      </motion.form>
    </div>
  );
};

export default MentorSection;
