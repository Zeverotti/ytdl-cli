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
  videoId: string;
  constructor(url: string, videoId: string, output: string, title: string) {
    this.url = url;
    this.output = output;
    this.title = title;
    this.videoId = videoId;
  }
  /**
   *
   * @param begin Beginning in milliseconds
   * @param end Ending in milliseconds
   */
  getVideoMP4(begin?: number, end?: number): Promise<void> {
    return new Promise(async (resolve, reject) => {
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

        const ffmpegProcess = mergeStreams(
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
        ffmpegProcess.on('exit', (exitCode: number | null) => {
          if (exitCode === 1) return reject();
          resolve();
        });
      } catch (err) {
        console.log(err);
      }
    });
  }

  getAudioMP3(): Promise<void> {
    return new Promise(async (resolve, reject) => {
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

        const ffmpegProcess = extractAudio(
          audio,
          `${this.output}/${this.title}.mp3`,
          (progress) => {
            const currentProgress = parseInt(progress.out_time_ms) / 1000;
            if (isNaN(currentProgress)) return;

            bar.tick(currentProgress - total);
            total += currentProgress - total;
          }
        );
        ffmpegProcess.on('exit', (exitCode: number | null) => {
          if (exitCode === 1) return reject();
          resolve();
        });
      } catch (err) {
        console.log(err);
      }
    });
  }

  async getThumbnail(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const file = fs.createWriteStream(`${this.output}/${this.title}.jpg`);
        https.get(
          `https://i.ytimg.com/vi/${this.videoId}/maxresdefault.jpg`,
          function (response) {
            response.pipe(file);

            file.on('finish', () => {
              file.close();
              console.log('Download Completed');
              resolve();
            });
            file.on('error', reject);
          }
        );
      } catch (err) {
        console.log(err);
      }
    });
  }
}

export default Video;
