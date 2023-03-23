const axios = require('axios');
const moment = require("moment")
const {pupet} = require("./pupeter")
const fs = require("fs")
require('dotenv').config();
const { exec } = require("child_process");
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
let arrayTitels = []
const clientId = process.env.CLIENT_ID; // zastąp swoją wartością
const clientSecret = process.env.CLIENT_SECRET; // zastąp swoją wartością
const grantType = 'client_credentials';
const scope = 'user:read:email';
const game_id = '743';
const language = 'pl';


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
        language: language,
        first: 30,
        started_at: moment().subtract(7, 'days').toISOString(),
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
    console.log(polishChessClips.length)

    //Tablica na linki do filmów
    let arrayClips = []
    for(let i = 0; i<polishChessClips.length;i++){
      arrayTitels.push(polishChessClips[i].title)
      arrayClips.push(polishChessClips[i].url)
    }
    console.log(arrayTitels[0])
    
    fs.writeFile('polish_chess_clips.json', JSON.stringify(polishChessClips), err => {
      if (err) {
        console.error('Błąd zapisu pliku:', err);
        return;
      }
      console.log(arrayClips)
      console.log(arrayClips.length)
      downloadAndConvertToMp4(arrayClips)
      console.log('Lista klipów zapisana do pliku polish_chess_clips.json');
    });
  } catch (error) {
    console.error('Błąd autoryzacji lub pobierania danych:', error);
  }
}

async function downloadAndConvertToMp4(urls) {
  try {
      for (let i = 0; i < urls.length; i++) {
          const clipId = urls[i].split('/').pop();
          console.log(clipId);
          const response = await axios.get(`https://api.twitch.tv/helix/clips?id=${clipId}`, {
              headers: {
                  'Client-ID': process.env.CLIENT_ID,
                  'Authorization': `Bearer ${await authorize()}`,
              },
          });

          // Pobieranie URL do pliku klipu
          const clipFileUrl = response.data.data[0].thumbnail_url.replace('-preview-480x272.jpg', '.mp4');

          // Pobieranie pliku klipu
          const clipFileResponse = await axios.get(clipFileUrl, {
              responseType: 'stream',
          });

          // Zapisanie pliku klipu
          const clipFileName = `./vods/vod${i}.mp4`;
          const writeStream = fs.createWriteStream(clipFileName);

          // Obsługa błędów podczas zapisywania pliku
          writeStream.on('error', (err) => {
              console.error(`Błąd podczas zapisywania pliku ${clipFileName}: ${err}`);
          });

          clipFileResponse.data.on('error', (err) => {
              console.error(`Błąd podczas pobierania pliku ${clipFileUrl}: ${err}`);

              // Jeśli wystąpi błąd podczas pobierania pliku, usuń zapisywany plik
              fs.unlinkSync(clipFileName);
          }).pipe(writeStream);

          await new Promise((resolve, reject) => {
              writeStream.on('finish', () => {
                  console.log(`Zapisano plik ${clipFileName} w całości.`);
                  resolve();
              });
          });
      }

      console.log("Wszystkie filmy zostały pobrane i zapisane.");
  } catch (error) {
      console.error('Błąd podczas pobierania danych z API Twitch:', error);
  }
}


 async function montageVideos(){
    let vodsNameList = []
     fs.readdir(__dirname +"/vods",(err,files)=>{
      if(err){
        console.log(err) 
      }
       files.forEach((x)=>{
         vodsNameList.push(x)
      })
       exec(`ffmpeg -i "./vods/vod0.mp4" -i "./vods/vod1.mp4" -i "./vods/vod2.mp4" -i "./vods/vod3.mp4" -i "./vods/vod4.mp4" -i "./vods/vod5.mp4" -i "./vods/vod6.mp4" -i "./vods/vod7.mp4" -i "./vods/vod8.mp4" -i "./vods/vod9.mp4" -filter_complex "[0:v][0:a][1:v][1:a][2:v][2:a][3:v][3:a][4:v][4:a][5:v][5:a][6:v][6:a][7:v][7:a][8:v][8:a][9:v][9:a]concat=n=10:v=1:a=1" -c:v libx264 -crf 23 -preset veryfast "test.mp4"`, (error, stdout, stderr) => {
          if (error) {
          console.error(`Błąd podczas wykonywania polecenia: ${error.message}`);
          return;
        }
        if (stderr) {
          console.error(`Błąd standardowego strumienia błędów: ${stderr}`);
          return;
        }
        console.log(`Polecenie wykonywane poprawnie: ${stdout}`);
      });
  
    })
  } //ffmpegffmpeg -i "vod0.mp4" -i "vod1.mp4" -filter_complex "[0:v][0:a][1:v][1:a]concat=n=2:v=1:a=1" -c:v libx264 -crf 23 -preset veryfast "nazwa_nowego_pliku.mp4" - przykladowa skladnia do montowania filmu w cmd

(async () => {
   await getPolishChessClips()
await montageVideos()
 await pupet()
})();

