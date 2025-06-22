const validateField = (name, value, rules = {}) => {
  if (rules.required && !value) {
    return "This field is required";
  }

  if (name === 'email' && rules.pattern && !rules.pattern.test(value)) {
    return "Please provide a valid email address";
  }

  if (name === 'password' && rules.minLength && value.length < rules.minLength) {
    return "Password must be at least 6 characters long";
  }

  return '';
};

export const validateForm = (formData, rules) => {
  const errors = {};
  let isValid = true;

  Object.keys(rules).forEach(fieldName => {
    const error = validateField(fieldName, formData[fieldName], rules[fieldName]);
    if (error) {
      errors[fieldName] = error;
      isValid = false;
    }
  });

  return { isValid, errors };
}; 