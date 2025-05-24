/**
 * Data validation utility for offline operations
 * Ensures data integrity before storing in offline queue
 */

// Validation rule types
export interface ValidationRules {
  required?: string[];
  format?: Record<string, RegExp>;
  minLength?: Record<string, number>;
  maxLength?: Record<string, number>;
  min?: Record<string, number>;
  max?: Record<string, number>;
  custom?: Record<string, (value: any) => boolean>;
}

// Validation result
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Validate data against rules
 * @param data Data to validate
 * @param rules Validation rules
 * @returns Validation result
 */
export function validateData(data: Record<string, any>, rules: ValidationRules): ValidationResult {
  const errors: Record<string, string> = {};

  // Check required fields
  if (rules.required) {
    for (const field of rules.required) {
      if (data[field] === undefined || data[field] === null || data[field] === '') {
        errors[field] = `${field} is required`;
      }
    }
  }

  // Check format rules
  if (rules.format) {
    for (const [field, regex] of Object.entries(rules.format)) {
      if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
        if (!regex.test(String(data[field]))) {
          errors[field] = `${field} has invalid format`;
        }
      }
    }
  }

  // Check minimum length
  if (rules.minLength) {
    for (const [field, minLength] of Object.entries(rules.minLength)) {
      if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
        if (String(data[field]).length < minLength) {
          errors[field] = `${field} must be at least ${minLength} characters`;
        }
      }
    }
  }

  // Check maximum length
  if (rules.maxLength) {
    for (const [field, maxLength] of Object.entries(rules.maxLength)) {
      if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
        if (String(data[field]).length > maxLength) {
          errors[field] = `${field} must be at most ${maxLength} characters`;
        }
      }
    }
  }

  // Check minimum value
  if (rules.min) {
    for (const [field, min] of Object.entries(rules.min)) {
      if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
        if (Number(data[field]) < min) {
          errors[field] = `${field} must be at least ${min}`;
        }
      }
    }
  }

  // Check maximum value
  if (rules.max) {
    for (const [field, max] of Object.entries(rules.max)) {
      if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
        if (Number(data[field]) > max) {
          errors[field] = `${field} must be at most ${max}`;
        }
      }
    }
  }

  // Check custom validation rules
  if (rules.custom) {
    for (const [field, validator] of Object.entries(rules.custom)) {
      if (data[field] !== undefined && data[field] !== null) {
        if (!validator(data[field])) {
          errors[field] = `${field} is invalid`;
        }
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// Common validation rules
export const commonValidationRules = {
  email: {
    format: {
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    maxLength: {
      email: 255,
    },
  },
  password: {
    minLength: {
      password: 8,
    },
    maxLength: {
      password: 100,
    },
  },
  phone: {
    format: {
      phone: /^\+?[\d\s-]{10,15}$/,
    },
  },
  url: {
    format: {
      url: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
    },
  },
};

// Entity-specific validation rules
export const entityValidationRules: Record<string, ValidationRules> = {
  profile: {
    required: ['id', 'userId', 'firstName', 'lastName', 'email'],
    format: {
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      phone: /^\+?[\d\s-]{10,15}$/,
    },
    maxLength: {
      firstName: 50,
      lastName: 50,
      bio: 500,
      title: 100,
    },
  },
  application: {
    required: ['id', 'userId', 'jobId'],
    maxLength: {
      coverLetter: 5000,
    },
  },
  jobAlert: {
    required: ['id', 'userId', 'keywords'],
    maxLength: {
      keywords: 200,
    },
  },
  resume: {
    required: ['id', 'userId', 'title'],
    maxLength: {
      title: 100,
    },
  },
};

/**
 * Validate entity data
 * @param entityType Type of entity
 * @param data Data to validate
 * @returns Validation result
 */
export function validateEntityData(
  entityType: string,
  data: Record<string, any>
): ValidationResult {
  const rules = entityValidationRules[entityType];
  if (!rules) {
    return { isValid: true, errors: {} };
  }
  return validateData(data, rules);
}
