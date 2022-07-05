const ytdl = require('ytdl-core');
const progress = require('progress');
const mergeStreams = require('./utils/mergeStreams');
const fs = require('fs');
const extractAudio = require('./utils/extractAudio');
const https = require('https');

class Video {
  constructor(url, thumbnailUrl, output, title) {
    this.url = url;
    this.thumbnailUrl = thumbnailUrl;
    this.output = output;
    this.title = title;
  }

  async getVideoMP4() {
    try {
      const videoInfo = await ytdl.getInfo(this.url);

      const audio = ytdl(this.url, { quality: 'highestaudio' });
      const video = ytdl(this.url, { quality: 'highestvideo' });

      let bar = new progress('Downloading [:bar] :percent :etas', {
        complete: String.fromCharCode(0x2588),
        total: parseInt(videoInfo.videoDetails.lengthSeconds) * 1000,
      });

      let total = 0;

      mergeStreams(
        video,
        audio,
        `${this.output}/${this.title}.mp4`,
        (progress) => {
          const currentProgress = parseInt(
            parseInt(progress.out_time_ms) / 1000
          );
          if (isNaN(currentProgress)) return;

          bar.tick(currentProgress - total);
          total += currentProgress - total;

          bar.lastProgress = currentProgress;
        }
      );
    } catch (err) {
      console.log(err);
    }
  }

  async getAudioMP3() {
    try {
      const audioInfo = await ytdl.getInfo(this.url);

      console.log(this.output);
      const audio = ytdl(this.url, {
        quality: 'highestaudio',
      });

      let bar = new progress('Downloading [:bar] :percent :etas', {
        complete: String.fromCharCode(0x2588),
        total: parseInt(audioInfo.videoDetails.lengthSeconds) * 1000,
      });

      let total = 0;

      extractAudio(audio, `${this.output}/${this.title}.mp3`, (progress) => {
        const currentProgress = parseInt(parseInt(progress.out_time_ms) / 1000);
        if (isNaN(currentProgress)) return;

        bar.tick(currentProgress - total);
        total += currentProgress - total;

        bar.lastProgress = currentProgress;
      });
    } catch (err) {
      console.log(err);
    }
  }

  async getThumbnail() {
    try {
      console.log(this.thumbnailUrl);
      const file = fs.createWriteStream(`${this.output}/${this.title}.webp`);
      const request = https.get(this.thumbnailUrl, function (response) {
        response.pipe(file);

        file.on('finish', () => {
          file.close();
          console.log('Download Completed');
        });
      });
    } catch (err) {
      console.log(err);
    }
  }
}

module.exports = Video;
