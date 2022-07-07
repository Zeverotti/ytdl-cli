# ytdl-cli

ytdl-cli is a cli tool used for downloading videos from YouTube.

## Options

```
-l, --link <char>    Video url
-o, --output <char>  Output folder
--mp3                Download as audio in mp3 format
--thumbnail          Download video thumbnail
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

## License

MIT

[//]: #
[ffmpeg]: https://ffmpeg.org/
[node-ytdl-core]: https://github.com/fent/node-ytdl-core
