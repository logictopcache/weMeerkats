export const validateField = (value, rules) => {
  if (rules.required && !value) {
    return rules.message || 'This field is required';
  }

  if (rules.minLength && value.length < rules.minLength) {
    return `Minimum ${rules.minLength} characters required`;
  }

  if (rules.maxLength && value.length > rules.maxLength) {
    return `Maximum ${rules.maxLength} characters allowed`;
  }

  if (rules.pattern && !rules.pattern.test(value)) {
    return rules.message || 'Invalid format';
  }

  if (rules.type === 'array' && rules.maxItems && value.length > rules.maxItems) {
    return `Maximum ${rules.maxItems} items allowed`;
  }

  return '';
};

export const validateForm = (formData, validationRules) => {
  const errors = {};

  Object.keys(validationRules).forEach(fieldName => {
    const value = formData[fieldName];
    const rules = validationRules[fieldName];

    if (rules.type === 'array' && rules.fields) {
      if (value && Array.isArray(value)) {
        const arrayErrors = value.map(item => {
          const itemErrors = {};
          Object.keys(rules.fields).forEach(fieldKey => {
            const error = validateField(item[fieldKey], rules.fields[fieldKey]);
            if (error) itemErrors[fieldKey] = error;
          });
          return itemErrors;
        });
        if (arrayErrors.some(err => Object.keys(err).length > 0)) {
          errors[fieldName] = arrayErrors;
        }
      }
    } else {
      const error = validateField(value, rules);
      if (error) errors[fieldName] = error;
    }
  });

  return errors;
};

export const mentorProfileValidation = {
  phone: {
    type: "string",
    pattern: /^\+?[\d\s-]{10,}$/,
    optional: true
  },
  bio: {
    type: "string",
    optional: true,
    maxLength: 1000
  },
  education: {
    type: "array",
    optional: true,
    fields: {
      degree: {
        type: "string",
        required: true,
        maxLength: 100
      },
      universityName: {
        type: "string",
        required: true,
        maxLength: 100
      },
      location: {
        type: "string",
        required: true,
        maxLength: 100
      },
      duration: {
        type: "string",
        required: true,
        maxLength: 50
      },
      description: {
        type: "string",
        maxLength: 500
      }
    }
  },
  workExperiences: {
    type: "array",
    optional: true,
    fields: {
      title: {
        type: "string",
        required: true,
        maxLength: 100
      },
      companyName: {
        type: "string",
        required: true,
        maxLength: 100
      },
      location: {
        type: "string",
        required: true,
        maxLength: 100
      },
      duration: {
        type: "string",
        required: true,
        maxLength: 50
      },
      description: {
        type: "string",
        maxLength: 500
      }
    }
  },
  expertise: {
    type: "array",
    optional: true,
    maxItems: 5,
    message: "Maximum 5 expertise areas allowed"
  },
  skills: {
    type: "array",
    optional: true,
    maxItems: 10,
    message: "Maximum 10 skills allowed"
  }
};

export const learnerProfileValidation = {
  fullName: {
    required: true,
    minLength: 2,
    maxLength: 50,
    message: "Full name is required and should be between 2-50 characters"
  },
  education: {
    type: "array",
    optional: true,
    fields: {
      degree: {
        type: "string",
        required: true,
        maxLength: 100
      },
      universityName: {
        type: "string",
        required: true,
        maxLength: 100
      },
      location: {
        type: "string",
        required: true,
        maxLength: 100
      },
      duration: {
        type: "string",
        required: true,
        maxLength: 50
      },
      description: {
        type: "string",
        maxLength: 500
      }
    }
  },
  bio: {
    type: "string",
    optional: true,
    maxLength: 1000
  },
  skills: {
    type: "array",
    optional: true,
    maxItems: 5,
    message: "Maximum 5 skills allowed"
  }
}; 