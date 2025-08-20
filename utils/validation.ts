// Email validation
export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Password validation
export function validatePassword(password: string): boolean {
  return password.length >= 8;
}

// Name validation
export function validateName(name: string): boolean {
  return name.length >= 2 && /^[a-zA-Z\s]+$/.test(name);
}

// Phone validation
export function validatePhone(phone: string): boolean {
  return /^[\+]?[1-9][\d]{0,15}$/.test(phone);
}

// URL validation
export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Price validation
export function validatePrice(price: number): boolean {
  return price > 0 && isFinite(price);
}

// Integer validation
export function validateInteger(value: number): boolean {
  return Number.isInteger(value) && value >= 0;
}
