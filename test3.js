const express = require('express');
const { google } = require('googleapis');
const app = express();

// Ustaw swoje dane autoryzacyjne:
const CLIENT_ID = '';
const CLIENT_SECRET = '';
const REDIRECT_URI = 'http://localhost:8080/oauth2callback';
const SCOPES = ['https://www.googleapis.com/auth/youtube.force-ssl'];

// Stwórz obiekt OAuth2:
const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

// Funkcja do generowania linku do autoryzacji:
function getAuthUrl() {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  return authUrl;
}

// Endpoint do przekierowania po autoryzacji:
app.get('/oauth2callback', async (req, res) => {
  const { code } = req.query;
  try {
    const { tokens } = await oauth2Client.getToken(code);
    console.log('Token dostępu:', tokens.access_token);
    console.log('Refresh token:', tokens.refresh_token);
    res.send('Autoryzacja przebiegła pomyślnie.');
  } catch (error) {
    console.error('Błąd autoryzacji:', error);
    res.send('Błąd autoryzacji.');
  }
});

// Endpoint do generowania linku do autoryzacji:
app.get('/authUrl', (req, res) => {
  const authUrl = getAuthUrl();
  res.send(authUrl);
});

// Uruchom serwer na porcie 3000:
app.listen(8080, () => {
  console.log('Serwer uruchomiony na porcie 3000.');
});