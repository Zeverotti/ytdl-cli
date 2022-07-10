#! /usr/bin/env node

import { program } from 'commander';
import ytdl from 'ytdl-core';
import Video from './Video';
import { hmsToNumeric } from './utils/timeConversion';
import fs from 'fs';
import readline from 'readline';

async function videoInfo(
  query: any,
  format = 'mp4',
  thumbnailStatus = false,
  begin?: string,
  end?: string
) {
  let output = query.output;
  const info = await ytdl.getInfo(query.link);
  info.videoDetails.videoId;
  const { title } = info.videoDetails;
  console.log(
    'Downloading: ' +
      title +
      '\nDestination folder: ' +
      (output != undefined ? output : process.cwd())
  );
  output = output || process.cwd();
  const video = new Video(query.link, info.videoDetails.videoId, output, title);
  if (thumbnailStatus) return video.getThumbnail();
  if (format === 'mp4')
    return video.getVideoMP4(
      begin ? hmsToNumeric(begin).milliseconds : undefined,
      end ? hmsToNumeric(end).milliseconds : undefined
    );
  else if (format === 'mp3') return video.getAudioMP3();
}

const fileInput = async (query: any) => {
  const filePath = query.link;

  const rl = readline.createInterface({
    input: fs.createReadStream(filePath),
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    query.link = line;
    await videoInfo(
      query,
      query.mp3 ? 'mp3' : 'mp4',
      query.thumbnail ? true : false,
      query.begin,
      query.end
    );
  }
};

program
  .option('-l, --link <char>', 'Video url')
  .option('-o, --output <char>', 'Output folder')
  .option('--mp3', 'Download as audio in mp3 format')
  .option('--thumbnail', 'Download video thumbnail')
  .option('--begin <char>', 'Video beginning in HH:MM:SS format')
  .option('--end <char>', 'Video ending in HH:MM:SS format')
  .action((query) => {
    const isFile = fs.existsSync(query.link);
    if (isFile) return fileInput(query);

    videoInfo(
      query,
      query.mp3 ? 'mp3' : 'mp4',
      query.thumbnail ? true : false,
      query.begin,
      query.end
    );
  });

program.parse();

const options = program.opts();
