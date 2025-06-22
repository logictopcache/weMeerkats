import { useState } from 'react';
import { signUpMentor, signUpMentee } from '../services/api/authService';

export const useSignUpForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'mentee',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (role) => {
    try {
      setLoading(true);
      setError(null);
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password
      };
      
      // Choose the appropriate signup function based on role
      const response = role === 'mentor' 
        ? await signUpMentor(userData)
        : await signUpMentee(userData);
      
      return {
        data: {
          id: response.id || response.userId,
          email: formData.email,
          role: role
        }
      };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    loading,
    error,
    handleInputChange,
    handleSubmit
  };
}; 