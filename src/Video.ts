import ytdl from 'ytdl-core';
import progress from 'progress';
import mergeStreams from './utils/mergeStreams';
import extractAudio from './utils/extractAudio';

class Video {
  url: string;
  output: string;
  title: string;
  constructor(url: string, output: string, title: string) {
    this.url = url;
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
          const currentProgress = parseInt(progress.out_time_ms) / 1000;
          if (isNaN(currentProgress)) return;

          bar.tick(currentProgress - total);
          total += currentProgress - total;
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
        const currentProgress = parseInt(progress.out_time_ms) / 1000;
        if (isNaN(currentProgress)) return;

        bar.tick(currentProgress - total);
        total += currentProgress - total;
      });
    } catch (err) {
      console.log(err);
    }
  }
}

export default Video;
