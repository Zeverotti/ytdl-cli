import { program } from 'commander';
import ytdl from 'ytdl-core';
import Video from './Video';

async function videoInfo(query: any, format = 'mp4') {
  let output = query.output;
  const info = await ytdl.getInfo(query.link);
  const { title } = info.videoDetails;
  console.log(
    'Downloading: ' +
      title +
      '\nDestination folder: ' +
      (output != undefined ? output : __dirname)
  );
  output = output || __dirname;
  const video = new Video(query.link, output, title);
  format === 'mp4' ? video.getVideoMP4() : video.getAudioMP3();
}

program
  .option('-l, --link <char>')
  .option('-o, --output <char>')
  .option('--mp3')
  .action((query) => {
    videoInfo(query, query.mp3 ? 'mp3' : 'mp4');
  });

program.parse();

const options = program.opts();
