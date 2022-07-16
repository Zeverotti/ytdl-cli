# ytdl-cli

ytdl-cli is a cli tool used for downloading videos from YouTube.

## Options

```
-l, --link <char>    Video url
-o, --output <char>  Output folder
--mp3                Download as audio in mp3 format
--thumbnail          Download video thumbnail
--begin <char>       Video beginning in HH:MM:SS format
--end <char>         Video ending in HH:MM:SS format
-h, --help           display help for command
```

## Modules

ytdl-cli uses two main components which make it's functionality possible:

- [ffmpeg] - A complete, cross-platform solution to record, convert and stream audio and video.
- [node-ytdl-core] - A YouTube video downloader in javascript.

## Installation

Install [ytdl-cli](https://www.npmjs.com/package/@zeverotti/ytdl-cli) as a global npm dependency.

```sh
npm i -g @zeverotti/ytdl-cli
```

## Usage

ytdl-cli can be used by calling ytdl from your terminal:

```sh
ytdl -l https://youtu.be/d1VR2MMUVO0
```

#### Building from source

Clone the repository:

```sh
git clone https://github.com/Zeverotti/ytdl-cli
```

Install dependencies:

```sh
npm i
```

Build TypeScript source code:

```sh
npm run build
```

Run:

```sh
node build -l youtubelink # check options for more information on usage
```

Install globally:

```sh
npm i -g .
```

## File input

You can pass a file instead of a YouTube link, the program will read it line by line and download the videos located on those lines.

**videos.txt**

```
https://www.youtube.com/watch?v=d1VR2MMUVO0
https://www.youtube.com/watch?v=aqz-KE-bpKQ
```

`ytdl -l videos.txt`, will download the videos contained in `videos.txt`.

You can pass parameters to each video as you normally would when using the cli.

```
https://www.youtube.com/watch?v=d1VR2MMUVO0 --mp3
https://www.youtube.com/watch?v=aqz-KE-bpKQ --thumbnail
```

## YouTube API

Some features can't be directly provided by ytdl-core, for example extracting videos from a playlist or channel. Instead of opting for an unofficial solution like scraping, which in time will eventually break and require maintenance, ytdl-cli uses the official Google API for those features (API key required).

##### Obtaining the API key

Follow step 1 in ["Node.js Quickstart"](https://developers.google.com/youtube/v3/quickstart/nodejs#step_1_turn_on_the). Remember where `client_secret.json` is located.

##### Setting up the API key

Run the following command: `ytdl auth set -i client_secret.json` and follow the instructions.

#### Supported commands

##### Retrieve all videos in a playlist

`ytdl playlist -i playlist_url`, will download all videos in a playlist with default options.
`ytdl playlist -i playlist_url -f videos.txt`, will save all videos in a playlist inside a text file.
`ytdl playlist -i playlist_url -- -o videos --mp3`, you can pass options as you normally would when using the CLI.

## License

MIT

[//]: #
[ffmpeg]: https://ffmpeg.org/
[node-ytdl-core]: https://github.com/fent/node-ytdl-core
