const { google } = require('googleapis');
const fs = require('fs');


// Ustaw swoje dane autoryzacyjne:
const CLIENT_ID = '';
const CLIENT_SECRET = '';
const REDIRECT_URI = 'http://localhost:8080';
const REFRESH_TOKEN = 'https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fyoutube.force-ssl&response_type=code&client_id=YOUR_CLIENT_ID_HERE&redirect_uri=urn%3Aietf%3Awg%3Aoauth%3A2.0%3Aoob'; // pusty łańcuch

// Stwórz obiekt OAuth2:
const auth = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

// Funkcja do pobierania tokena dostępu:
function getAccessToken() {
  return new Promise((resolve, reject) => {
    auth.on('tokens', (tokens) => {
      if (tokens.access_token) {
        resolve(tokens.access_token);
      } else {
        reject(new Error('Brak tokena dostępu.'));
      }
    });

    // Ustaw refresh token:
    auth.setCredentials({ refresh_token: REFRESH_TOKEN });

    // Pobierz nowy token dostępu:
    auth.getAccessToken();
  });
}

// Stwórz obiekt YouTube API:
const youtube = google.youtube({
  version: 'v3',
  auth: auth
});

// Ścieżka do pliku z filmem:
const videoPath = './vods/vod0.mp4';

// Dane filmu:
const videoData = {
  snippet: {
    title: 'Tytuł filmu',
    description: 'Opis filmu',
    tags: ['tag1', 'tag2'],
    categoryId: '22'
  },
  status: {
    privacyStatus: 'private'
  }
};

// Wczytaj wielkość pliku w bajtach:
const videoFileSize = fs.statSync(videoPath).size;

// Strumień z pliku z filmem:
const videoStream = fs.createReadStream(videoPath);

// Wywołaj funkcję YouTube API do dodania filmu do Reels:
getAccessToken().then((accessToken) => {
  youtube.videos.insert(
    {
      part: 'snippet,status',
      notifySubscribers: false,
      media: {
        body: videoStream
      },
      requestBody: videoData,
      mediaSize: videoFileSize,
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    },
    (err, res) => {
      if (err) {
        console.log('Błąd:', err);
        return;
      }
      console.log('Film został dodany:', res.data);
    }
  );
}).catch((err) => {
  console.log('Błąd:', err);
});