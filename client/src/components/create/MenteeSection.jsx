import { useProfileForm } from '../../hooks/useProfileForm';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';

const MenteeSection = ({ title, subtitle }) => {
  const navigate = useNavigate();
  const { formData, setFormData, loading, handleSubmit } = useProfileForm('mentee');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [errors, setErrors] = useState({});
  const [profilePicture, setProfilePicture] = useState(null); // State for file

  const skillsList = [
    'JavaScript', 'Python', 'Java', 'React', 'Node.js',
    'Angular', 'Vue.js', 'TypeScript', 'MongoDB', 'SQL'
  ];

  const locationsList = [
    'Pakistan', 'India', 'United States', 'United Kingdom',
    'Canada', 'Australia', 'Germany', 'France', 'Spain',
    'Italy', 'Japan', 'China', 'Singapore', 'UAE'
  ];

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!formData.education?.[0]?.universityName) {
      newErrors.education = [{ universityName: "University name is required" }];
    }

    if (!formData.education?.[0]?.degree) {
      newErrors.education = [{
        ...(newErrors.education?.[0] || {}),
        degree: "Degree is required"
      }];
    }

    if (!formData.education?.[0]?.location) {
      newErrors.education = [{
        ...(newErrors.education?.[0] || {}),
        location: "Location is required"
      }];
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const firstError = Object.values(newErrors)[0];
      if (typeof firstError === 'string') {
        toast.error(firstError);
      } else if (Array.isArray(firstError)) {
        const firstArrayError = Object.values(firstError[0])[0];
        toast.error(firstArrayError);
      }
      return;
    }

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('bio', formData.bio || '');
      submitData.append('education', JSON.stringify(formData.education));
      submitData.append('skills', JSON.stringify(formData.skills));
      if (profilePicture) {
        submitData.append('image', profilePicture);
        console.log('Profile picture appended:', profilePicture.name);
      }

      // Debug FormData contents
      for (let [key, value] of submitData.entries()) {
        console.log(`FormData: ${key} =`, value);
      }

      await handleSubmit(submitData);
      toast.success('Profile created successfully!');
      navigate('/mentee/home');
    } catch (error) {
      console.error('Submission error:', error);
      toast.error(error.message || 'Failed to create profile');
    }
  };

  const handleEducationChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      education: [{
        ...prev.education[0],
        [field]: value
      }]
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      console.log('Selected file:', file.name); // Debug
    } else {
      setProfilePicture(null);
    }
  };

  const handleSkillSelect = (skill) => {
    if (!selectedSkills.includes(skill)) {
      const updatedSkills = [...selectedSkills, skill];
      setSelectedSkills(updatedSkills);
      setFormData(prev => ({
        ...prev,
        skills: updatedSkills
      }));
    }
    setSearchTerm('');
  };

  const handleSkillRemove = (skillToRemove) => {
    const updatedSkills = selectedSkills.filter(skill => skill !== skillToRemove);
    setSelectedSkills(updatedSkills);
    setFormData(prev => ({
      ...prev,
      skills: updatedSkills
    }));
  };

  const filteredSkills = skillsList.filter(skill =>
    skill.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedSkills.includes(skill)
  );

  const formSectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
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
              {title.split(' ').slice(0, -2).join(' ')}{' '}
              <span className="text-primary-color">
                {title.split(' ').slice(-2).join(' ')}
              </span>
            </>
          )}
        </h1>
        {subtitle && (
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            {subtitle}
          </p>
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
              staggerChildren: 0.2
            }
          }
        }}
        encType="multipart/form-data"
      >
        {/* Basic Information Section */}
        <motion.div 
          variants={formSectionVariants}
          className="bg-white/[0.02] backdrop-blur-sm rounded-xl p-6 border border-white/10"
        >
          <h2 className="text-2xl font-semibold text-primary-color mb-6 flex items-center">
            <span className="w-8 h-8 rounded-lg bg-primary-color/20 flex items-center justify-center mr-3 text-lg">1</span>
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-white/90 block mb-2">Profile Picture</label>
                <div className="relative group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full px-4 py-3 rounded-lg bg-white/[0.03] border border-white/10 focus:border-primary-color text-white/90 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-primary-color/20 file:text-primary-color hover:file:bg-primary-color/30 transition-colors cursor-pointer"
                  />
                </div>
                <p className="text-white/50 text-sm mt-2">Recommended: Square image, max 5MB</p>
              </div>
            </div>

            <div>
              <label className="text-white/90 block mb-2">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg bg-white/[0.03] border border-white/10 focus:border-primary-color text-white placeholder-white/40 transition-colors min-h-[160px]"
                placeholder="Tell us about yourself..."
                rows={6}
              />
            </div>
          </div>
        </motion.div>

        {/* Education Section */}
        <motion.div 
          variants={formSectionVariants}
          className="bg-white/[0.02] backdrop-blur-sm rounded-xl p-6 border border-white/10"
        >
          <h2 className="text-2xl font-semibold text-primary-color mb-6 flex items-center">
            <span className="w-8 h-8 rounded-lg bg-primary-color/20 flex items-center justify-center mr-3 text-lg">2</span>
            Education
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-white/90 block mb-2">University Name</label>
              <input
                type="text"
                value={formData.education[0].universityName}
                onChange={(e) => handleEducationChange('universityName', e.target.value)}
                className={`w-full px-4 py-3 rounded-lg bg-white/[0.03] border ${
                  errors.education?.[0]?.universityName ? 'border-red-500' : 'border-white/10'
                } focus:border-primary-color text-white placeholder-white/40 transition-colors`}
                placeholder="Enter university name"
              />
              {errors.education?.[0]?.universityName && (
                <p className="text-red-500 text-sm mt-1">{errors.education[0].universityName}</p>
              )}
            </div>

            <div>
              <label className="text-white/90 block mb-2">Degree</label>
              <select
                value={formData.education[0].degree}
                onChange={(e) => handleEducationChange('degree', e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/[0.03] border border-white/10 focus:border-primary-color text-white transition-colors"
              >
                <option value="" className="bg-[#0A1128]">Select Degree</option>
                <option value="Bachelors" className="bg-[#0A1128]">Bachelors</option>
                <option value="Masters" className="bg-[#0A1128]">Masters</option>
                <option value="PHD" className="bg-[#0A1128]">PHD</option>
              </select>
            </div>

            <div>
              <label className="text-white/90 block mb-2">Duration</label>
              <select
                value={formData.education[0].duration}
                onChange={(e) => handleEducationChange('duration', e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/[0.03] border border-white/10 focus:border-primary-color text-white transition-colors"
              >
                <option value="" className="bg-[#0A1128]">Select Duration</option>
                <option value="2 years" className="bg-[#0A1128]">2 years</option>
                <option value="4 years" className="bg-[#0A1128]">4 years</option>
              </select>
            </div>

            <div>
              <label className="text-white/90 block mb-2">Location</label>
              <select
                value={formData.education[0].location}
                onChange={(e) => handleEducationChange('location', e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/[0.03] border border-white/10 focus:border-primary-color text-white transition-colors"
              >
                <option value="" className="bg-[#0A1128]">Select Location</option>
                {locationsList.map(location => (
                  <option key={location} value={location} className="bg-[#0A1128]">{location}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-white/90 block mb-2">Description</label>
              <textarea
                value={formData.education[0].description}
                onChange={(e) => handleEducationChange('description', e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/[0.03] border border-white/10 focus:border-primary-color text-white placeholder-white/40 transition-colors"
                rows={4}
                placeholder="Describe your educational experience..."
              />
            </div>
          </div>
        </motion.div>

        {/* Skills Section */}
        <motion.div 
          variants={formSectionVariants}
          className="bg-white/[0.02] backdrop-blur-sm rounded-xl p-6 border border-white/10"
        >
          <h2 className="text-2xl font-semibold text-primary-color mb-6 flex items-center">
            <span className="w-8 h-8 rounded-lg bg-primary-color/20 flex items-center justify-center mr-3 text-lg">3</span>
            Skills to Learn
          </h2>
          <div className="space-y-4">
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
                  placeholder={selectedSkills.length === 0 ? "Type or select skills you want to learn..." : "Add more skills..."}
                />
              </div>
              {searchTerm && filteredSkills.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute z-10 w-full mt-2 bg-[#0A1128] border border-white/10 rounded-lg shadow-xl"
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
        </motion.div>

        {/* Submit Button */}
        <motion.div 
          variants={formSectionVariants}
          className="flex justify-end"
        >
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
                'Save Profile'
              )}
            </span>
          </motion.button>
        </motion.div>
      </motion.form>
    </div>
  );
};

export default MenteeSection;