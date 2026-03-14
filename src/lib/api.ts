export const NEXT_PUBLIC_API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://api-somino.up.railway.app').replace(/\/$/, '');
export const API_URL = `${NEXT_PUBLIC_API_URL}/api/v1`;
