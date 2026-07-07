import crypto from 'crypto';

const PEPPER = process.env.HASH_PEPPER || '';
const HMAC_KEY = process.env.HMAC_SECRET || '';

if (!PEPPER || !HMAC_KEY) {
  console.warn('[SECURITY] HASH_PEPPER or HMAC_SECRET not configured');
}

export function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

export function hashData(
  data: string,
  salt: string,
  type: 'document' | 'name' | 'dob' | 'phone'
): string {
  const normalized = normalizeForType(data, type);
  const payload = `${salt}:${normalized}:${PEPPER}`;
  
  return crypto
    .createHmac('sha256', HMAC_KEY)
    .update(payload)
    .digest('hex');
}

export function hashPartialNumber(
  fullNumber: string,
  salt: string
): string {
  // Extract last 4 digits
  const last4 = fullNumber.replace(/[\s-]/g, '').slice(-4);
  return hashData(last4, salt, 'document');
}

export function hashNamePrefix(
  fullName: string,
  salt: string
): string {
  // Extract first 3 letters of last name (assuming LASTNAME FIRSTNAME format)
  const normalized = fullName
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
  const prefix = normalized.split(' ')[0].slice(0, 3);
  return hashData(prefix, salt, 'name');
}

function normalizeForType(data: string, type: string): string {
  switch (type) {
    case 'document':
      return data.toUpperCase().replace(/[\s-]/g, '');
    case 'name':
      return data
        .toUpperCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    case 'dob':
      return new Date(data).toISOString().split('T')[0];
    case 'phone':
      return data.replace(/[\s-+]/g, '');
    default:
      return data;
  }
}

export function verifyHash(
  data: string,
  salt: string,
  type: 'document' | 'name' | 'dob' | 'phone',
  expectedHash: string
): boolean {
  const computedHash = hashData(data, salt, type);
  return crypto.timingSafeEqual(
    Buffer.from(computedHash),
    Buffer.from(expectedHash)
  );
}

// Generate tracking code (SDC-YYYY-XXXXXX)
export function generateTrackingCode(): string {
  const year = new Date().getFullYear();
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `SDC-${year}-${random}`;
}

// Generate 6-digit OTP
export function generateOtp(): string {
  return crypto.randomInt(100000, 999999).toString();
}

// Hash OTP for storage
export function hashOtp(otp: string): string {
  return crypto
    .createHash('sha256')
    .update(otp + PEPPER)
    .digest('hex');
}

// Verify OTP
export function verifyOtp(otp: string, hashedOtp: string): boolean {
  const computed = hashOtp(otp);
  return crypto.timingSafeEqual(
    Buffer.from(computed),
    Buffer.from(hashedOtp)
  );
}

// Hash for audit log chain
export function hashAuditEntry(previousHash: string, entry: object): string {
  const payload = JSON.stringify({ previousHash, ...entry });
  return crypto
    .createHash('sha256')
    .update(payload)
    .digest('hex');
}
