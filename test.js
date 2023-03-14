const { google } = require('googleapis');
const readline = require('readline');

const CLIENT_ID = '';
const CLIENT_SECRET = '';
const REDIRECT_URI = 'http://localhost:8080/oauth2callback';
const SCOPES = ['https://www.googleapis.com/auth/youtube.force-ssl'];

const auth = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function getAccessToken() {
  return new Promise((resolve, reject) => {
    const authUrl = auth.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });

    console.log(`Otwórz poniższy link i zezwól na dostęp do swojego konta Google:`);
    console.log(authUrl);

    rl.question('Podaj kod autoryzacyjny: ', (code) => {
      auth.getToken(code, (err, tokens) => {
        if (err) {
          reject(err);
        } else {
          resolve(tokens.access_token);
        }
        rl.close();
      });
    });
  });
}

getAccessToken().then((accessToken) => {
  console.log(`Otrzymano token dostępu: ${accessToken}`);
}).catch((err) => {
  console.error('Błąd podczas pobierania tokena dostępu:', err);
});