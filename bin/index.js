#!/usr/bin/env node --no-warnings=ExperimentalWarning

import { Option, program } from 'commander'
import { enc } from '../src/enc.js'
import {
  AVAILABLE_FORMATS,
  FORMATS_DESC,
  parseFormatArg,
} from '../src/formats.js'

program
  .version('1.0.0', '-v, --version', 'print enc version')
  .description(
    `Media encoder (ffmpeg wrapper)

  It helps to convert media files into different
  formats in a simplier way with frendly UI showing
  progress, eta and compression rate.
`
  )
  .option('-d, --dir [value]', 'output directory')
  .option('-c, --custom <value>', 'use custom ffmpeg options')
  .addOption(
    new Option('-f, --format <format>', 'output format')
      .choices(AVAILABLE_FORMATS)
      .default('mp4')
      .argParser(parseFormatArg)
  )
  .addHelpText(
    'after',
    `
Hint:
  You can also use short names for the "--format" argument.
  For example, instead of "--format sd:480p" you can type
  "--format sd" or "--format 480p".

Formats:
${FORMATS_DESC}`
  )
  .argument('<files...>', 'one or more files to encode')
  .action((files, options) => enc(files, options))
  .addHelpText(
    'after',
    `
Examples:

  $ enc <filename>

  Since "--format" argument is default to "mp3", this command
  will get the audio from your input file and create a new
  <filename>.mp3 file inside the current directory.

  $ enc *

  It will convert all files from the current directory to mp3.

  $ enc -f hd <filename>

  It will convert the <filename> video to hd:720p format and
  create a new <filename_hd>.mp4 file inside the current
  directory.
`
  )

if (process.argv.length <= 2) {
  program.help()
} else {
  program.parse(process.argv)
}
