#! /usr/bin/env node

import { Command } from 'commander';
import ytdl from 'ytdl-core';
import Video from './Video';
import { hmsToNumeric } from './utils/timeConversion';
import fs from 'fs';
import readline from 'readline';
import normalizeOutputPath from './utils/normalizeOutputPath';

async function videoInfo(
  query: any,
  format = 'mp4',
  thumbnailStatus = false,
  begin?: string,
  end?: string
) {
  let output = query.output || process.cwd();
  const info = await ytdl.getInfo(query.link);
  output = normalizeOutputPath(query, output, info);
  const { title } = info.videoDetails;
  console.log('Downloading:', title, '\nDestination folder:', output);
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
    let args = line.split(' ');
    const link = args.shift();
    args = [
      'node',
      'index.js',
      ...(line.split(' ').length > 1 ? [] : process.argv.slice(2)),
      '-l',
      link || '',
      ...args,
    ];
    try {
      await getProgram().parseAsync(args);
    } catch (err) {
      console.log('Skipped', link, 'due to error');
    }
  }
};

const getProgram = () => {
  const command = new Command();
  command
    .option('-l, --link <char>', 'Video url')
    .option('-o, --output <char>', 'Output folder')
    .option('--mp3', 'Download as audio in mp3 format')
    .option('--thumbnail', 'Download video thumbnail')
    .option('--begin <char>', 'Video beginning in HH:MM:SS format')
    .option('--end <char>', 'Video ending in HH:MM:SS format')
    .action((query) => {
      const isFile = fs.existsSync(query.link);
      if (isFile) return fileInput(query);

      return videoInfo(
        query,
        query.mp3 ? 'mp3' : 'mp4',
        query.thumbnail ? true : false,
        query.begin,
        query.end
      );
    });
  return command;
};

getProgram().parse();
