const { program } = require("commander");
const ytdl = require("ytdl-core");
const Video = require("./src/Video.js");

async function videoInfo(query) {
  let output = query.output;
  const info = await ytdl.getInfo(query.link);
  const { title } = info.videoDetails;
  console.log(
    "Downloading: " +
      title +
      "\nDestination folder: " +
      (output != undefined ? output : __dirname)
  );
  output = output || __dirname;
  const video = new Video(query.link, output, title);
  video.getVideoMP4();
}

program
  .option("-l, --link <char>")
  .option("-o, --output <char>")
  .action((query) => {
    videoInfo(query);
  });

program.parse();

const options = program.opts();
