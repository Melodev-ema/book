import {randomBytes} from 'crypto';

export default function generateSiteToken(): string {
    return randomBytes(16).toString('base64url');
}
