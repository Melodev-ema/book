import {describe, expect, it} from 'vitest';
import {envProblems} from './env';

const valid = {
    SESSION_PASSWORD: 'x'.repeat(32),
    PDF_API_TOKEN: 'y'.repeat(24),
    DB_HOST: 'db',
    DB_NAME: 'livre',
    DB_USER: 'livre',
    BUILD_SITE_DOMAIN: 'livre.exemple.fr',
};

describe('envProblems', () => {
    it('ne signale rien quand tout est configuré', () => {
        expect(envProblems(valid)).toEqual([]);
    });

    it('signale les secrets absents ou trop courts', () => {
        const problems = envProblems({...valid, SESSION_PASSWORD: 'court', PDF_API_TOKEN: undefined});
        expect(problems).toHaveLength(2);
        expect(problems.join(' ')).toMatch(/SESSION_PASSWORD/);
        expect(problems.join(' ')).toMatch(/PDF_API_TOKEN/);
    });

    it('signale un build sans SITE_DOMAIN', () => {
        expect(envProblems({...valid, BUILD_SITE_DOMAIN: ''})).toEqual([expect.stringMatching(/SITE_DOMAIN/)]);
    });

    it('signale la base non configurée', () => {
        expect(envProblems({...valid, DB_HOST: ''})).toEqual([expect.stringMatching(/DB_HOST/)]);
    });
});
