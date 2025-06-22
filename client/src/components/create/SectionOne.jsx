import { useState } from "react";
import profilepic from "/create_account/createaccount.png";
import linkicon from "/create_account/link.png";
import PropTypes from 'prop-types';

const SectionOne = ({ formData, setFormData }) => {
  const [selectedGender, setSelectedGender] = useState("male");
  const [fileName, setFileName] = useState("Choose File");

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);
    } else {
      setFileName("Choose File");
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

  return (
    <div className="mt-5">
      <h1 className="text-3xl text-center">Create your Profile</h1>
      {/* Personal */}
      <div>
        <h2 className="text-green-text text-xl mt-10">Personal Information</h2>
        <div className="flex md:flex-row flex-col-reverse justify-between ml-5 align-baseline md:gap-10">
          <div className="md:w-2/5">
            <div className="md:my-3 ">
              <label className="text-lg" htmlFor="name">
                Name
              </label>
              <input
                type="text"
                className="border-[#59BBA9] border-2 p-3 flex items-center gap-2"
                id="name"
                name="name"
              />
            </div>
            <div className="my-3 ">
              <label className="text-lg" htmlFor="bio">
                Bio
              </label>
              <input
                type="text"
                className="border-[#59BBA9] border-2 p-3 flex items-center gap-2"
                id="bio"
                name="bio"
              />
            </div>
          </div>
          <div className="md:w-2/5">
            <div className="my-3">
              <label className="text-lg" htmlFor="profile">
                Profile Photo
              </label>
              <div className="border-[#59BBA9] h-[51px] border-2 flex items-center gap-2">
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  id="fileUpload"
                />
                <img src={linkicon} alt="" />
                <label
                  htmlFor="fileUpload"
                  className="cursor-pointer flex-grow text-sm text-gray-500 "
                >
                  {fileName}
                </label>
                <button
                  type="button"
                  className="bg-green-text text-lg px-6 py-[11px] text-white hover:bg-teal-600"
                  onClick={() => document.getElementById("fileUpload").click()}
                >
                  Upload
                </button>
              </div>
            </div>
            <div className="my-3 flex gap-4">
              <label className="text-lg" htmlFor="gender">
                Gender
              </label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={selectedGender === "male"}
                    onChange={() => setSelectedGender("male")}
                    className="appearance-none w-3 h-3 border border-blue-500 rounded-full checked:bg-white checked:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span>Male</span>
                </label>
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={selectedGender === "female"}
                    onChange={() => setSelectedGender("female")}
                    className="appearance-none w-3 h-3 border border-blue-500 rounded-full checked:bg-white checked:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span>Female</span>
                </label>
              </div>
            </div>
            <div className="my-3 flex gap-2">
              <label className="text-lg" htmlFor="country">
                Country
              </label>
              <select
                className="border-[#59BBA9] border-2 p-3 flex items-center gap-2"
                name="country"
                id="country"
              >
                <option value="pakistan">Pakistan</option>
                <option value="australia">Australia</option>
                <option value="germany">Germany</option>
              </select>
            </div>
          </div>
          <div className="w-[200px] md:w-1/5 flex items-end justify-end">
            <img className="my-5 w-full h-[150px]" src={profilepic} alt="" />
          </div>
        </div>
      </div>
      {/* Educational */}
      <div>
        <h2 className="text-green-text text-xl mt-10">
          Educational Information
        </h2>
        <div className="flex md:flex-row flex-col justify-between ml-5 align-baseline md:gap-10">
          <div className="md:w-2/5">
            <div className="my-3 flex gap-2">
              <label className="text-lg" htmlFor="degree">
                Degree
              </label>
              <select
                className="border-[#59BBA9] border-2 p-3 flex items-center gap-2"
                name="degree"
                value={formData.education[0]?.degree || ''}
                onChange={(e) => handleEducationChange('degree', e.target.value)}
              >
                <option value="Bachelors">Bachelors</option>
                <option value="Masters">Masters</option>
                <option value="PHD">PHD</option>
              </select>
            </div>
            <div className="my-3">
              <label className="text-lg" htmlFor="universityName">
                Institution
              </label>
              <input
                type="text"
                className="border-[#59BBA9] border-2 p-3 flex items-center gap-2 w-full"
                value={formData.education[0]?.universityName || ''}
                onChange={(e) => handleEducationChange('universityName', e.target.value)}
              />
            </div>
            <div className="my-3 flex gap-2">
              <label className="text-lg" htmlFor="location">
                Location
              </label>
              <select
                className="border-[#59BBA9] border-2 p-3 flex items-center gap-2"
                value={formData.education[0]?.location || ''}
                onChange={(e) => handleEducationChange('location', e.target.value)}
              >
                <option value="Pakistan">Pakistan</option>
                <option value="Australia">Australia</option>
                <option value="Germany">Germany</option>
              </select>
            </div>
          </div>
          <div className="md:w-2/5">
            <div className="my-3 flex gap-2">
              <label className="text-lg" htmlFor="duration">
                Year of Completion
              </label>
              <select
                className="border-[#59BBA9] border-2 p-3 flex items-center gap-2"
                value={formData.education[0]?.duration || ''}
                onChange={(e) => handleEducationChange('duration', e.target.value)}
              >
                <option value="2027">2027</option>
                <option value="2026">2026</option>
                <option value="2025">2025</option>
              </select>
            </div>
            <div className="my-3">
              <label className="text-lg" htmlFor="description">
                Major
              </label>
              <input
                type="text"
                className="border-[#59BBA9] border-2 p-3 flex items-center gap-2 w-full"
                value={formData.education[0]?.description || ''}
                onChange={(e) => handleEducationChange('description', e.target.value)}
              />
            </div>
            <div className="my-3 flex items-center justify-end gap-2">
              <button className="btn-account">Save</button>
              <button className="btn-account">Add More</button>
            </div>
          </div>

          <div className="w-1/5 flex items-end justify-end"></div>
        </div>
      </div>
    </div>
  );
};

SectionOne.propTypes = {
  formData: PropTypes.shape({
    education: PropTypes.arrayOf(PropTypes.shape({
      degree: PropTypes.string,
      universityName: PropTypes.string,
      location: PropTypes.string,
      duration: PropTypes.string,
      description: PropTypes.string
    }))
  }).isRequired,
  setFormData: PropTypes.func.isRequired
};

export default SectionOne;
