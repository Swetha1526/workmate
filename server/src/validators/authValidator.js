/**
 * Auth payload validators
 */

export const validateRegisterInput = (data) => {
  const errors = {};
  const { name, email, password, phone, role, customerType } = data;

  if (!name || !name.trim()) {
    errors.name = 'Full name is required';
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!email || !emailRegex.test(email.trim())) {
    errors.email = 'Valid email is required';
  }

  if (!password || password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  if (!phone || !phone.trim()) {
    errors.phone = 'Phone number is required';
  }

  // Security: Public registration can ONLY be 'customer' or 'worker'
  if (role && !['customer', 'worker'].includes(role)) {
    errors.role = 'Public registration is only permitted for customer or worker';
  }

  if (role === 'customer' && customerType && !['individual', 'business'].includes(customerType)) {
    errors.customerType = 'Customer type must be either individual or business';
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
};

export const validateLoginInput = (data) => {
  const errors = {};
  const { email, password } = data;

  if (!email || !email.trim()) {
    errors.email = 'Email address is required';
  }

  if (!password) {
    errors.password = 'Password is required';
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
};
