import bcrypt, { compare, hash } from 'bcryptjs';

export function doHash(value, saltValue) {
  const result = hash(value, saltValue);
  return result;
}

export function validateUser(password, hashedPassword) {
  const result = compare(password, hashedPassword);
  return result;
}
