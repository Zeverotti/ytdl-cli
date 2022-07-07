import ytdl from 'ytdl-core';
import progress from 'progress';
import mergeStreams from './utils/mergeStreams';
import extractAudio from './utils/extractAudio';
import fs from 'fs';
import https from 'https';
import { numericToHms } from './utils/timeConversion';

class Video {
  url: string;
  output: string;
  title: string;
  thumbnailUrl: string;
  constructor(
    url: string,
    thumbnailUrl: string,
    output: string,
    title: string
  ) {
    this.url = url;
    this.output = output;
    this.title = title;
    this.thumbnailUrl = thumbnailUrl;
  }
  /**
   *
   * @param begin Beginning in milliseconds
   * @param end Ending in milliseconds
   */
  async getVideoMP4(begin?: number, end?: number) {
    try {
      const videoInfo = await ytdl.getInfo(this.url);

      const audio = ytdl(this.url, { quality: 'highestaudio' });
      const video = ytdl(this.url, { quality: 'highestvideo' });

      let bar = new progress('Downloading [:bar] :percent :etas', {
        complete: String.fromCharCode(0x2588),
        total: end
          ? end - (begin || 0)
          : parseInt(videoInfo.videoDetails.lengthSeconds) * 1000,
      });

      let total = 0;

      mergeStreams(
        video,
        audio,
        `${this.output}/${this.title}.mp4`,
        (progress) => {
          const currentProgress = parseInt(progress.out_time_ms) / 1000;
          if (isNaN(currentProgress)) return;

          bar.tick(currentProgress - total);
          total += currentProgress - total;
        },
        begin ? numericToHms(begin / 1000) : undefined,
        end ? numericToHms(end / 1000) : undefined
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
        const currentProgress = parseInt(progress.out_time_ms) / 1000;
        if (isNaN(currentProgress)) return;

        bar.tick(currentProgress - total);
        total += currentProgress - total;
      });
    } catch (err) {
      console.log(err);
    }
  }

  async getThumbnail() {
    try {
      const file = fs.createWriteStream(`${this.output}/${this.title}.webp`);
      https.get(this.thumbnailUrl, function (response) {
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

export default Video;
