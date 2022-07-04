const { program } = require('commander');
const fs = require('fs');
const ytdl = require('ytdl-core');
const progress = require('progress');
const mergeStreams = require('./src/utils/mergeStreams');

async function download(link, path, title) {
  try {
    const audio = ytdl(link, { quality: 'highestaudio' });
    const video = ytdl(link, { quality: 'highestvideo' });

    video.on('response', (info) => {
      bar = new progress('Downloading [:bar] :percent :etas', {
        complete: String.fromCharCode(0x2588),
        total: parseInt(info.headers['content-length'], 10),
      });
    });
    video.on('data', (data) => {
      bar.tick(data.length);
    });

    const stream = mergeStreams(video, audio);
    stream.pipe(fs.createWriteStream(`${path}/${title}.mp4`));
  } catch (err) {
    console.log(err);
  }
}

async function videoInfo(query) {
  let path = query.path;
  const info = await ytdl.getInfo(query.link);
  const { title, videoId } = info.videoDetails;
  console.log(
    'Downloading: ' +
      title +
      '\nDestination folder: ' +
      (path != undefined ? path : __dirname)
  );
  if (path != undefined) {
    await download(query.link, path, title);
  } else {
    await download(query.link, __dirname, title);
  }
}

program
  .option('-l, --link <char>')
  .option('-p, --path <char>')
  .action((query) => {
    videoInfo(query);
  });

program.parse();

const options = program.opts();
