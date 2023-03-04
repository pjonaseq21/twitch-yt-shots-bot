const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
const fs = require('fs');
const axios = require('axios');
const { spawn } = require('child_process');
const path = require('path');

async function convertTwitchClipToMp4(url) {
  // Pobranie klipu
  const clipResponse = await axios.get(url);

  // Pobranie linku do klipu wideo
  const videoUrl = clipResponse.data.thumbnail_url
    .replace('-preview-480x272.jpg', '.mp4');

  // Pobranie nazwy pliku
  const fileName = path.basename(videoUrl);

  // Pobranie pliku wideo
  const videoResponse = await axios({
    url: videoUrl,
    method: 'GET',
    responseType: 'stream',
  });

  // Zapisanie pliku wideo na dysku
  const videoPath = path.join(__dirname, fileName);
  videoResponse.data.pipe(fs.createWriteStream(videoPath));

  // Konwersja pliku wideo na plik MP4 za pomocą FFMPEG
  const outputPath = path.join(__dirname, `${path.parse(fileName).name}.mp4`);
  const ffmpeg = spawn('ffmpeg', ['-i', videoPath, '-c:v', 'libx264', '-c:a', 'copy', outputPath]);

  ffmpeg.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  ffmpeg.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
  });

  ffmpeg.on('close', (code) => {
    console.log(`Konwersja zakończona z kodem ${code}`);
    fs.unlinkSync(videoPath);
  });
}

// Przykładowe użycie
convertTwitchClipToMp4('https://www.twitch.tv/kanalgraczak/clip/FitBenevolentParrotKeyboardCat');