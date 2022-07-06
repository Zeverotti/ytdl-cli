#! /usr/bin/env node

import { program } from 'commander';
import ytdl from 'ytdl-core';
import Video from './Video';

async function videoInfo(query: any, format = 'mp4', thumbnailStatus = false) {
  let output = query.output;
  const info = await ytdl.getInfo(query.link);
  const { title, thumbnails } = info.videoDetails;
  const thumbnailUrl = thumbnails[thumbnails.length - 1].url;
  console.log(
    'Downloading: ' +
      title +
      '\nDestination folder: ' +
      (output != undefined ? output : process.cwd())
  );
  output = output || process.cwd();
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
