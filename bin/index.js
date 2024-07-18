#!/usr/bin/env node

import { Option, program } from 'commander'
import { enc } from '../src/enc.js'
import {
  AVAILABLE_FORMATS,
  FORMATS_DESC,
  parseFormatArg,
} from '../src/formats.js'
import fs from 'fs'

const pjson = JSON.parse(fs.readFileSync('package.json', 'utf8'))

program
  .name('menc')
  .version(pjson.version, '-v, --version', 'print menc version')
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

  $ menc <filename>

  Since "--format" argument is default to "mp4", this command
  will compress your input file and create a new <filename>.mp4
  file inside the current directory.

  $ menc -d 123 *.mov

  It will compress all mov files from the current directory and
  put them inside the "123" sub-directory.

  $ menc -f hd <filename>

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
