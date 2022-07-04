const { program } = require('commander');
const ytdl = require('ytdl-core');
const progress = require('progress');
const mergeStreams = require('./src/utils/mergeStreams');

async function download(link, path, title) {
  try {
    const videoInfo = await ytdl.getInfo(link);

    const audio = ytdl(link, { quality: 'highestaudio' });
    const video = ytdl(link, { quality: 'highestvideo' });

    let bar = new progress('Downloading [:bar] :percent :etas', {
      complete: String.fromCharCode(0x2588),
      total: parseInt(videoInfo.videoDetails.lengthSeconds) * 1000,
    });

    let total = 0;

    mergeStreams(video, audio, `${path}/${title}.mp4`, (progress) => {
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
