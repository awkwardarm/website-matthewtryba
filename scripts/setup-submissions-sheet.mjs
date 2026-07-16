/**
 * ===========================================================
 * One-time setup / smoke test for the form-submissions sheet
 * ===========================================================
 *
 * Creates the "submissions" tab (if missing) with the header row
 * the Pages Functions write to, then appends one test row so the
 * service-account auth is proven end to end before deploying.
 *
 * Usage:
 *   node scripts/setup-submissions-sheet.mjs <spreadsheet-id>
 *
 * Reads the service account JSON from GOOGLE_SA_FILE, defaulting
 * to ~/Dev/tryba-secrets/sheets-service-account.json. The sheet
 * must already be shared with the service account as Editor.
 * ===========================================================
 */

import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { appendRow, SHEET_TAB, SHEET_COLUMNS } from '../lib/google-sheets.js';

const SA_FILE = process.env.GOOGLE_SA_FILE
    || `${homedir()}/Dev/tryba-secrets/sheets-service-account.json`;

const spreadsheetId = process.argv[2];
if (!spreadsheetId) {
    console.error('Usage: node scripts/setup-submissions-sheet.mjs <spreadsheet-id>');
    process.exit(1);
}

const sa = JSON.parse(readFileSync(SA_FILE, 'utf8'));

// Mirror the env object the Pages Functions receive, so this exercises
// the exact same code path (lib/google-sheets.js) that runs in production.
const env = {
    GOOGLE_SA_EMAIL: sa.client_email,
    GOOGLE_SA_PRIVATE_KEY: sa.private_key,
    SHEETS_ID: spreadsheetId
};

// --- 1. Ensure the tab exists -------------------------------------
// Direct API calls here (the lib only appends), with a token minted
// via Node's crypto — the final test append below goes through the
// lib's own Web Crypto path.
const token = await mintToken(sa);

const meta = await api(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties.title`, token);
const tabs = meta.sheets.map(s => s.properties.title);
console.log('Existing tabs:', tabs.join(', '));

if (!tabs.includes(SHEET_TAB)) {
    await api(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, token, {
        requests: [{ addSheet: { properties: { title: SHEET_TAB } } }]
    });
    console.log(`Created tab "${SHEET_TAB}"`);
}

// --- 2. Header row (only if A1 is empty) ---------------------------
const a1 = await api(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(SHEET_TAB)}!A1`, token);
if (!a1.values) {
    await api(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(SHEET_TAB)}!A1?valueInputOption=RAW`, token, { values: [SHEET_COLUMNS] }, 'PUT');
    console.log('Wrote header row:', SHEET_COLUMNS.join(' | '));
}

// --- 3. Test append through the ACTUAL production code path --------
const ok = await appendRow(env, SHEET_TAB, [
    new Date().toISOString(), 'test', 'Setup Script', 'setup@test.local', '', 'delete this row', ''
]);
console.log(ok ? 'Test row appended — setup verified. Delete the test row when done.'
              : 'Test append FAILED — see error above.');
process.exit(ok ? 0 : 1);

// -------------------------------------------------------------------
async function api(url, token, body, method) {
    const res = await fetch(url, {
        method: method || (body ? 'POST' : 'GET'),
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined
    });
    if (!res.ok) throw new Error(`${url}\n${res.status} ${await res.text()}`);
    return res.json();
}

async function mintToken(sa) {
    const now = Math.floor(Date.now() / 1000);
    const enc = s => Buffer.from(s).toString('base64url');
    const input = enc(JSON.stringify({ alg: 'RS256', typ: 'JWT' })) + '.' + enc(JSON.stringify({
        iss: sa.client_email,
        scope: 'https://www.googleapis.com/auth/spreadsheets',
        aud: 'https://oauth2.googleapis.com/token',
        iat: now, exp: now + 3600
    }));
    const { createSign } = await import('node:crypto');
    const signature = createSign('RSA-SHA256').update(input).sign(sa.private_key, 'base64url');
    const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion: `${input}.${signature}`
        })
    });
    if (!res.ok) throw new Error(`Token exchange failed: ${res.status} ${await res.text()}`);
    return (await res.json()).access_token;
}
