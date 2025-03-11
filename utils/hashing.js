import bcrypt, { compare, hash } from 'bcryptjs';
import {createHmac} from 'node:crypto'

export function doHash(value, saltValue) {
  const result = hash(value, saltValue);
  return result;
}

export function validateUser(password, hashedPassword) {
  const result = compare(password, hashedPassword);
  return result;
}


export function hmacProcess(value, key) {
    const result = createHmac('sha256', key).update(value).digest('hex')
    return result
}