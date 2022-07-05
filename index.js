const { program } = require('commander');
const ytdl = require('ytdl-core');
const Video = require('./src/Video.js');

async function videoInfo(query, format = 'mp4', thumbnailStatus = false) {
  let output = query.output;
  const info = await ytdl.getInfo(query.link);
  const { title, thumbnails } = info.videoDetails;
  const thumbnailUrl = thumbnails[4].url;
  console.log(
    'Downloading: ' +
      title +
      '\nDestination folder: ' +
      (output != undefined ? output : __dirname)
  );
  output = output || __dirname;
  const video = new Video(query.link, thumbnailUrl, output, title);
  if (thumbnailStatus) return video.getThumbnail();
  if (format === 'mp4') video.getVideoMP4();
  else if (format === 'mp3') video.getAudioMP3();
}

program
  .option('-l, --link <char>')
  .option('-o, --output <char>')
  .option('--mp3')
  .option('--thumbnail')
  .action((query) => {
    videoInfo(query, query.mp3 ? 'mp3' : 'mp4', query.thumbnail ? true : false);
  });

program.parse();

const options = program.opts();
