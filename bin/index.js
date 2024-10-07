#!/usr/bin/env node

import chalk from 'chalk'
import { Option, program } from 'commander'
import fs from 'fs'
import { enc } from '../src/enc.js'
import { version, parseTimeArg, validateArgs } from '../src/utils.js'
import {
  AVAILABLE_FORMATS,
  FORMATS_DESC,
  parseFormatArg,
} from '../src/formats.js'

program
  .name('menc')
  .version(version(), '-v, --version', 'prints version')
  .description(
    `Media encoder (ffmpeg wrapper)

  It helps to convert media files into different
  formats in a simplier way with frendly UI showing
  progress, eta and compression rate.
`
  )
  .option('-d, --dir <name>', 'output directory')
  .option('-s, --start-time <hh:mm:ss>', 'trim start time', parseTimeArg)
  .option('-e, --end-time <hh:mm:ss>', 'trim end time', parseTimeArg)
  .addOption(
    new Option('--copy', 'copy the input stream (the output will not to be re-encoded)')
      .conflicts('format')
  )
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
  .hook('preAction', command => {
    validateArgs(command.opts())
  })
  .action((files, options) => enc(files, options))
  .addHelpText(
    'after',
    `
Examples:
  $ npx menc <filename>

  Since "--format" argument is default to "mp4", this command
  will compress your input file and create a new <filename>.mp4
  file inside the current directory.

  $ npx menc -d 123 *.mov

  It will compress all mov files from the current directory and
  put them inside the "123" sub-directory.

  $ npx menc -f hd <filename>

  It will convert the <filename> video to hd:720p format and
  create a new <filename_hd>.mp4 file inside the current
  directory.

  $ npx menc -s 10 -e 1:09:04 <filename>

  Compress the input file into a new <filename>.mp4 starting
  from the 10'th second until 1:09:04.

  $ npx menc -e 1:05 --copy <filename>

  Trim the input file (no re-encoding) into a new file
  starting from the begining until 1:05.
`
  )

if (process.argv.length <= 2) {
  program.help()
} else {
  try {
    program.parse(process.argv)
  } catch (error) {
    console.log(` ${chalk.red('✖')} Error: ${error.message}`)
  }
}
