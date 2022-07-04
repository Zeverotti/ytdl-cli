const { program } = require('commander');
const fs = require('fs');
const ytdl = require('ytdl-core');
const progress = require('progress');

async function download(link, path, title) {
    try {
      const yt = ytdl(link, {
          quality: 'highestvideo',
          filter: 'videoandaudio',
        })
        let bar;
        yt.on('response', (info) => {
          bar = new progress('Downloading [:bar] :percent :etas', {
            complete: String.fromCharCode(0x2588),
            total: parseInt(info.headers['content-length'], 10),
          });
        });
        yt.on('data', (data) => {
          bar.tick(data.length);
        }).pipe(fs.createWriteStream(`${path}/${title}.mp4`));
    } catch (err) {
      console.log(err);
    }
  }

async function videoInfo(query) {
    let path = query.path;
    const info = await ytdl.getInfo(query.link);
    const { title, videoId } = info.videoDetails;
    console.log('Downloading: ' + title + '\nDestination folder: ' + (path != undefined ? path : __dirname));
    if(path != undefined){
        await download(query.link, path, title);
    } else {
        await download(query.link, __dirname, title);
    }
    
}

program
    .option('-l, --link <char>')
    .option('-p, --path <char>')
    .action((query) => { videoInfo(query) });

program.parse();

const options = program.opts();

