<p align="center">
menc helps to convert media files into different formats in a simplier way with frendly UI showing progress, eta and compression rate. 📺
</p>

<h1 align="center">
Media Encoder (ffmpeg wrapper)
</h1>

<img src="./screen.gif" width="600"></img>

[Compress and Convert Your Videos with Command Line](https://dev.to/vladimirvovk/compress-and-convert-your-videos-with-command-line-38a1)

## Quick Start

1. Install [Node.js](https://nodejs.org/en/download/package-manager) or [Bun.sh](https://bun.sh/docs/installation).
2. Run `npx menc` or `bunx menc`.

## Usage

```
Usage: menc [options] <files...>

Media encoder (ffmpeg wrapper)

  It helps to convert media files into different
  formats in a simplier way with frendly UI showing
  progress, eta and compression rate.


Arguments:
  files                  one or more files to encode

Options:
  -v, --version          print enc version
  -d, --dir [value]      output directory
  -c, --custom <value>   use custom ffmpeg options
  -f, --format <format>  output format (choices: "mp3", "ogg", "mp4", "sd:480p",
                         "hd:720p", "fhd:1080p", "qhd:1440p", "2k:1080p", 
                         default: "mp4")
  -h, --help             display help for command

Hint:
  You can also use short names for the "--format" argument.
  For example, instead of "--format sd:480p" you can type
  "--format sd" or "--format 480p".

Formats:
  mp3 (mpeg-1 Audio Layer 3) is a music format that can compress a file by up to 95%.
  ogg is a multimedia container format that's commonly for audio and video files.
  mp4 a widely used multimedia file storage format for storing video.
  sd or 480p is a video format with 4:3 ratio and 640x480 size.
  hd or 720p is a video format with 16:9 ratio and 1280x720 size.
  fhd or 1080p is a video format with 16:9 ratio and 1920x1080 size.
  qhd or 1440p is a video format with 16:9 ratio and 2560x1440 size.
  2k video or 1080p is a video format with 1:1.77 ratio and 2048x1080 size.

Examples:

  $ enc <filename>

  Since "--format" argument is default to "mp4", this command
  will compress your input file and create a new <filename>.mp4
  file inside the current directory.

  $ enc -d 123 *.mov

  It will compress all mov files from the current directory and
  put them inside the "123" sub-directory.

  $ enc -f hd <filename>

  It will convert the <filename> video to hd:720p format and
  create a new <filename_hd>.mp4 file inside the current
  directory.
  ```
