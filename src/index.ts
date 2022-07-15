#! /usr/bin/env node

import { Command } from 'commander';
import ytdl from 'ytdl-core';
import Video from './Video';
import { hmsToNumeric } from './utils/timeConversion';
import fs from 'fs';
import readline from 'readline';
import normalizeOutputPath from './utils/normalizeOutputPath';
import OAuth2Client from './OAuth2Client';
import Byteroo from 'byteroo';
import path from 'path';
import { google, youtube_v3 } from 'googleapis';
import progress from 'progress';

const storage = new Byteroo({
  name: 'ytdl-cli',
});

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

  const auth = command.command('auth');
  auth
    .command('set')
    .option('-i <char>')
    .action(async (query) => {
      const credentials = JSON.parse(fs.readFileSync(query.i).toString());
      const clientId = credentials.installed.client_id;
      const clientSecret = credentials.installed.client_secret;
      const googleApi = new OAuth2Client(storage);
      const oauth2Client = await googleApi.authenticate(clientId, clientSecret);
      console.log('Authenticated', oauth2Client._clientId);
    });
  auth.command('wipe').action(() => {
    const credentialsPath = path.join(storage.path, 'credentials');
    fs.rmSync(credentialsPath);
    console.log('Credentials deleted successfully');
  });

  command
    .command('playlist')
    .option('-i <char>')
    .option('-f, --file <char>', 'Export to file')
    .action(async (query) => {
      const service = google.youtube('v3');
      const googleApi = new OAuth2Client(storage);
      const oauth2Client = await googleApi.authenticate();

      const playlists = await service.playlists.list({
        id: query.i,
        part: ['id', 'contentDetails'],
        auth: oauth2Client,
      });
      if (!playlists.data.items) return;
      const playlist = playlists.data.items[0];
      if (!playlist) return;

      let bar = new progress('Retrieving items [:bar] :percent :etas', {
        complete: String.fromCharCode(0x2588),
        total: playlist.contentDetails?.itemCount || 0,
      });

      let results: youtube_v3.Schema$PlaylistItem[] = [];
      let nextPageToken: string | null | undefined = undefined;
      do {
        const params: youtube_v3.Params$Resource$Playlistitems$List = {
          playlistId: query.i,
          auth: oauth2Client,
          part: ['id', 'contentDetails'],
          maxResults: 50,
        };
        if (nextPageToken) params.pageToken = nextPageToken;
        const res = await service.playlistItems.list(params);
        nextPageToken = res.data.nextPageToken;
        bar.tick(res.data.items!.length);
        if (res.data.items) results = [...results, ...res.data.items];
      } while (nextPageToken);
      if (query.file) {
        fs.writeFileSync(
          query.file,
          results
            .map(
              (e) =>
                `https://www.youtube.com/watch?v=${e.contentDetails?.videoId}`
            )
            .join('\n')
        );
        console.log('Saved items to:', query.file);
      }
    });
  return command;
};

getProgram().parse();
