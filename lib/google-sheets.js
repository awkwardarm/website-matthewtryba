/**
 * ===========================================================
 * Google Sheets append helper (Cloudflare Pages Functions)
 * ===========================================================
 *
 * Replaces Formbold as the form-submission log: each submission
 * is appended as one row to a Google Sheet, authenticated as a
 * Google service account (google-sheets-live-edit@...).
 *
 * Lives OUTSIDE functions/ so it never becomes a route — Pages
 * Functions bundle relative imports from anywhere in the repo.
 *
 * AUTH FLOW (no libraries needed):
 *   1. Build a JWT signed RS256 with the service account's
 *      private key (Web Crypto is built into the Workers runtime)
 *   2. Exchange it at Google's token endpoint for an access token
 *      (~1 hour); cached at module scope so warm isolates skip
 *      the round-trip
 *   3. POST the row to the Sheets API values:append endpoint
 *
 * REQUIRED ENVIRONMENT VARIABLES (Pages dashboard → Settings):
 *   GOOGLE_SA_EMAIL       service account client_email
 *   GOOGLE_SA_PRIVATE_KEY service account private_key (full PEM,
 *                         literal "\n" sequences are handled)
 *   SHEETS_ID             spreadsheet id from the sheet's URL
 *
 * The spreadsheet must be shared with GOOGLE_SA_EMAIL as Editor.
 * ===========================================================
 */

// Tab all form submissions land on, and its column order. The setup
// script (scripts/setup-submissions-sheet.mjs) creates the tab and
// header row to match.
export const SHEET_TAB = 'submissions';
export const SHEET_COLUMNS = ['Date (UTC)', 'Form', 'Name', 'Email', 'Links', 'Message', 'Google Ads Click ID'];

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const SCOPE = 'https://www.googleapis.com/auth/spreadsheets';

// Access token cache — isolates are reused between requests, so most
// submissions skip the token exchange entirely.
let cachedToken = null;
let cachedTokenExpiry = 0;

/**
 * appendRow() — append one row to a sheet tab. Returns true/false;
 * never throws (callers treat the sheet as best-effort — the Resend
 * notification email is the delivery guarantee).
 *
 * @param {object} env  — Pages Function env (needs the three vars above)
 * @param {string} tab  — tab (sheet) name inside the spreadsheet
 * @param {Array<string>} values — cell values, left to right
 */
export async function appendRow(env, tab, values) {
    if (!env.GOOGLE_SA_EMAIL || !env.GOOGLE_SA_PRIVATE_KEY || !env.SHEETS_ID) {
        console.error('Google Sheets env vars not configured — skipping sheet log');
        return false;
    }

    try {
        const token = await getAccessToken(env);
        const url = 'https://sheets.googleapis.com/v4/spreadsheets/'
            + encodeURIComponent(env.SHEETS_ID)
            + '/values/' + encodeURIComponent(tab)
            + ':append?valueInputOption=RAW&insertDataOption=INSERT_ROWS';

        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ values: [values] })
        });

        if (!res.ok) {
            console.error('Sheets append error:', res.status, await res.text());
            return false;
        }
        return true;
    } catch (err) {
        console.error('Sheets append failed:', err);
        return false;
    }
}

async function getAccessToken(env) {
    const now = Math.floor(Date.now() / 1000);
    if (cachedToken && now < cachedTokenExpiry - 60) {
        return cachedToken;
    }

    const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
    const claims = b64url(JSON.stringify({
        iss: env.GOOGLE_SA_EMAIL,
        scope: SCOPE,
        aud: TOKEN_URL,
        iat: now,
        exp: now + 3600
    }));
    const signingInput = `${header}.${claims}`;

    const key = await importPrivateKey(env.GOOGLE_SA_PRIVATE_KEY);
    const signature = await crypto.subtle.sign(
        'RSASSA-PKCS1-v1_5',
        key,
        new TextEncoder().encode(signingInput)
    );
    const jwt = `${signingInput}.${b64url(signature)}`;

    const res = await fetch(TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion: jwt
        })
    });

    if (!res.ok) {
        throw new Error(`Token exchange failed: ${res.status} ${await res.text()}`);
    }

    const data = await res.json();
    cachedToken = data.access_token;
    cachedTokenExpiry = now + (data.expires_in || 3600);
    return cachedToken;
}

/** Parse the service account PEM into a Web Crypto signing key. */
async function importPrivateKey(pem) {
    // Dashboard-pasted keys sometimes arrive with literal "\n" sequences.
    const cleaned = pem.replace(/\\n/g, '\n')
        .replace('-----BEGIN PRIVATE KEY-----', '')
        .replace('-----END PRIVATE KEY-----', '')
        .replace(/\s+/g, '');
    const der = Uint8Array.from(atob(cleaned), c => c.charCodeAt(0));

    return crypto.subtle.importKey(
        'pkcs8',
        der.buffer,
        { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
        false,
        ['sign']
    );
}

/** Base64url-encode a string or ArrayBuffer (JWT alphabet, no padding). */
function b64url(input) {
    const bytes = typeof input === 'string'
        ? new TextEncoder().encode(input)
        : new Uint8Array(input);
    let binary = '';
    for (const b of bytes) binary += String.fromCharCode(b);
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
