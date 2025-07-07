require('dotenv').config(); // Load .env variables
const { google } = require('googleapis');
const readline = require('readline');

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

const SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.metadata'
];

function getAuthUrl() {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  });
}

async function getTokens(code) {
  const { tokens } = await oauth2Client.getToken(code);
  console.log('\nYour tokens:');
  console.log(JSON.stringify(tokens, null, 2));
  console.log('\nAdd the refresh_token to your .env as GOOGLE_REFRESH_TOKEN.');
}

async function main() {
  console.log('Visit this URL in your browser and approve access to Google Drive:');
  console.log(getAuthUrl());

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('\nPaste the code from the URL here: ', async (code) => {
    await getTokens(code.trim());
    rl.close();
  });
}

main();