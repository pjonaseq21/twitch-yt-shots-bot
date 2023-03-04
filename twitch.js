const axios = require('axios');
const moment = require("moment")
const fs = require("fs")
require('dotenv').config();

const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
const { spawn } = require('child_process');
const path = require('path');

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const grantType = 'client_credentials';
const scope = 'user:read:email';
const language = 'pl';
const game_id = '743';


async function authorize(){
    const tokenResponse = await axios.post('https://id.twitch.tv/oauth2/token', null, {
        params: {
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: grantType,
          scope: scope,
        },
      });
  
      const accessToken = tokenResponse.data.access_token;
      return accessToken;
    }


async function getPolishChessClips() {
  try {
    // Autoryzacja
    const tokenResponse = await axios.post('https://id.twitch.tv/oauth2/token', null, {
      params: {
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: grantType,
        scope: scope,
      },
    });

    const accessToken = tokenResponse.data.access_token;

    // Pobranie listy klipów o szachach z Polski z tego tygodnia
    const clipResponse = await axios.get('https://api.twitch.tv/helix/clips', {
      params: {
        game_id: game_id,
        first: 10,
        started_at: moment().subtract(7, 'days').toISOString(),
        language: language,
      },
      headers: {
        'Client-ID': clientId,
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (clipResponse.status !== 200 && clipResponse.status !== 201) {
      console.log('Wystąpił błąd podczas pobierania klipów');
      return;
    }

    // Filtracja klipów, które mają ustawione język na "pl"
    const polishChessClips = clipResponse.data.data.filter(clip => clip.language === language);

    console.log('Klipy o szachach z Polski z tego tygodnia:', polishChessClips);
    
    fs.writeFile('polish_chess_clips.json', JSON.stringify(polishChessClips), err => {
      if (err) {
        console.error('Błąd zapisu pliku:', err);
        return;
      }
      console.log('Lista klipów zapisana do pliku polish_chess_clips.json');
    });
  } catch (error) {
    console.error('Błąd autoryzacji lub pobierania danych:', error);
  }
}
async function downloadTwitchClip(clipUrl, clientId) {
    try {
      // Pobranie informacji o klipie z Twitch API
      const accessToken = await authorize();
      const response = await axios.get(`https://api.twitch.tv/helix/clips?id=${clipUrl.replace('https://clips.twitch.tv/', '')}`, {
        headers: {
          'Client-ID': clientId,
          'Authorization': `Bearer ${accessToken}`,
        },
      });
  
      // Pobranie URL do pliku klipu
      const clipFileUrl = response.data.data[0].thumbnail_url.replace('-preview-480x272.jpg', '.mp4');
  
      // Pobranie pliku klipu
      const clipFileResponse = await axios.get(clipFileUrl, {
        responseType: 'stream',
      });
  
      // Zapisanie pliku klipu
      const clipFileName = 'clip.mp4';
      const writeStream = fs.createWriteStream(clipFileName);
      clipFileResponse.data.pipe(writeStream);
  
      // Konwersja pliku do formatu MP4 z wykorzystaniem ffmpeg
      ffmpeg(writeStream)
        .outputOptions('-c:v', 'copy')
        .outputOptions('-bsf:a', 'aac_adtstoasc')
        .outputOptions('-movflags', 'faststart')
        .on('error', (err) => {
          console.error('Błąd podczas konwersji:', err);
        })
        .on('end', () => {
          console.log('Konwersja zakończona!');
        })
        .pipe(fs.createWriteStream('clip.mp4'));
    } catch (error) {
      console.error('Błąd podczas pobierania danych z API Twitch:', error);
    }
  }
getPolishChessClips()