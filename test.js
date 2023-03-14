const {google} = require("googleapis")
const fs = require("fs")
const CLIENT_ID = '303317408228-1o558f4eucvljsurmg8b7t9sk7hplrip.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REFRESH_TOKEN = 'YOUR_REFRESH_TOKEN_HERE';
const  REDIRECT_URI = 'https://facebook.com'
const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI,
);


  oauth2Client.setCredentials({
    refresh_token: REFRESH_TOKEN
  });
const youtube = google.youtube({
    version: 'v3',
    auth: oauth2Client
  });



  const videoData = {
    snippet: {
      title: 'Tytuł twojego filmu',
      description: 'Opis twojego filmu',
      tags: ['Tag 1', 'Tag 2'],
      categoryId: '22'
    },
    status: {
      privacyStatus: 'private',
      selfDeclaredMadeForKids: false 
    }
  };


  const videoPath = './vods/vod0.mp4';
const videoFileSize = fs.statSync(videoPath).size;
const videoStream = fs.createReadStream(videoPath);


youtube.videos.insert({
    part: 'snippet,status',
    notifySubscribers: false,
    media: {
      body: videoStream
    },
    requestBody: videoData,
    mediaSize: videoFileSize,
  }, (err, res) => {
    if (err) {
      console.error('Błąd:', err);
    } else {
      console.log('Film został dodany!');
    }
  });