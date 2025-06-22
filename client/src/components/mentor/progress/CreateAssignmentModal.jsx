import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { createSkillAssignment } from '../../../services/api/mentorProgressApi';

const CreateAssignmentModal = ({ isOpen, onClose, skillName, mentee }) => {
  const modalRef = useRef();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    weightage: 25
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setFormData({
        title: '',
        description: '',
        weightage: 25
      });
      setError('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await createSkillAssignment({
        skillName,
        ...formData
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create assignment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div ref={modalRef} className="bg-[#111936] rounded-lg p-8 w-[600px] max-w-[90%] border border-white/10">
        <h2 className="text-2xl font-bold text-white mb-6">Create Assignment</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
          <div>
              <label className="block text-gray-300 mb-2">Skill</label>
            <input
              type="text"
                value={skillName}
              disabled
                className="w-full p-2 border border-white/10 rounded-md bg-[#0A1128] text-white"
            />
          </div>
          
            {mentee && (
          <div>
                <label className="block text-gray-300 mb-2">Mentee</label>
            <input
              type="text"
                  value={`${mentee.firstName} ${mentee.lastName}`}
                  disabled
                  className="w-full p-2 border border-white/10 rounded-md bg-[#0A1128] text-white"
            />
          </div>
            )}
          
          <div>
              <label className="block text-gray-300 mb-2">Assignment Title</label>
            <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full p-2 border border-white/10 rounded-md bg-[#0A1128] text-white focus:border-primary-color focus:ring-1 focus:ring-primary-color"
            />
          </div>
          
          <div>
              <label className="block text-gray-300 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                className="w-full p-2 border border-white/10 rounded-md bg-[#0A1128] text-white h-32 focus:border-primary-color focus:ring-1 focus:ring-primary-color"
              />
        </div>

          <div>
              <label className="block text-gray-300 mb-2">Weightage (%)</label>
              <input
                type="number"
                name="weightage"
                value={formData.weightage}
                onChange={handleChange}
                min="1"
                max="100"
                required
                className="w-full p-2 border border-white/10 rounded-md bg-[#0A1128] text-white focus:border-primary-color focus:ring-1 focus:ring-primary-color"
              />
            </div>
          </div>
          
          {error && (
            <div className="mt-4 text-red-500 text-sm">
              {error}
          </div>
          )}

        <div className="flex justify-end gap-4 mt-8">
          <button
              type="button"
            onClick={onClose}
              className="px-6 py-2 border border-white/10 rounded-full text-white hover:bg-white/5"
              disabled={isSubmitting}
          >
            Cancel
          </button>
            <button 
              type="submit"
              className="px-6 py-2 bg-primary-color text-white rounded-full hover:bg-opacity-90 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create'}
          </button>
        </div>
        </form>
      </div>
    </div>
  );
};

CreateAssignmentModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  skillName: PropTypes.string.isRequired,
  mentee: PropTypes.shape({
    _id: PropTypes.string,
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    email: PropTypes.string
  })
};

export default CreateAssignmentModal; 