import fs from 'fs'
import path from 'path'
import { spawn } from 'child_process'
import { createRequire } from 'module'
import chalk from 'chalk'
import { CommanderError, InvalidArgumentError } from 'commander'

import { formatInfo } from './formats.js'

export const parseTimeArg = (arg) => {
  const formattedArg =
    arg.replaceAll(':', '').length % 2 === 0 ? `00:00:${arg}` : `00:00:0${arg}`
  const time = formattedArg.slice(-8)
  const isValid = /^([0-9][0-9]):([0-5][0-9])(:[0-5][0-9])?$/.test(time)

  if (!isValid) {
    const error = `Allowed formats: <ss>, <mm:ss>, <hh:mm:ss>.`
    throw new InvalidArgumentError(error)
  }

  return time
}

const isTimeGreater = (startTime, endTime) => {
  const [hh1, mm1, ss1] = startTime.split(':')
  const time1 = parseInt(ss1) + parseInt(mm1) * 60 + parseInt(hh1) * 60 * 60
  const [hh2, mm2, ss2] = endTime.split(':')
  const time2 = parseInt(ss2) + parseInt(mm2) * 60 + parseInt(hh2) * 60 * 60

  return time2 > time1
}

export const validateArgs = (options) => {
  const { startTime, endTime } = options

  if (startTime && endTime) {
    if (!isTimeGreater(startTime, endTime)) {
      const error = `The end time "${endTime}" must be greater than the start time "${startTime}".`
      throw new CommanderError(1, 'invalid_trim_time', error)
    }
  }
}

export const say = (phrase) => {
  switch (process.platform) {
    case 'darwin':
      spawn('say', [phrase])
      break
    case 'linux':
      spawn('spd-say', [phrase])
      break
    case 'win32':
      spawn('mshta', [
        `vbscript:Execute("CreateObject(""SAPI.SpVoice"").Speak(""${phrase}"")(window.close)")`,
      ])
      break
  }
}

const mencPath = () => {
  const require = createRequire(import.meta.url)
  const paths = require.resolve
    .paths('menc')
    .filter((p) => p.includes(path.join('menc', 'node_modules')))
  return path.join(paths[0], '..')
}

export const version = () => {
  const uri = path.join(mencPath(), 'package.json')
  const file = fs.readFileSync(uri, 'utf8')
  const pjson = JSON.parse(file)
  return pjson?.version
}

export const playSound = (filename) => {
  const soundFile = path.join(mencPath(), `./assets/${filename}`)
  spawn('ffplay', ['-nodisp', '-autoexit', soundFile], { detached: true })
}

export const getOutputArgs = (options) => {
  if (options.custom) {
    return options.custom
  }

  const info = formatInfo(options.format)
  const args = [...info.args]

  if (options.copy) {
    args.push('-c', 'copy')
  }

  return args
}

export const getInputArgs = (options) => {
  const { custom, startTime, endTime } = options

  if (custom) {
    return []
  }

  const args = []

  if (startTime) {
    args.push('-ss', startTime)
  }

  if (endTime) {
    args.push('-to', endTime)
  }

  return args
}

export const fileExists = (filename) => {
  const exists = fs.existsSync(filename)

  if (!exists) {
    console.log(` ${chalk.red('✖')} File ${chalk.italic(filename)} not found!`)
  }

  return exists
}

export const isDir = (filename) => {
  return fs.lstatSync(filename).isDirectory()
}

const timestamp = () => {
  const date = new Date()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return `${hours}_${minutes}_${seconds}`
}

const outDir = (name) => {
  if (!name) {
    return ''
  }

  const dir = name === true ? timestamp() : name

  if (fs.existsSync(dir) && isDir(dir)) {
    return `${name}/`
  }

  try {
    fs.mkdirSync(dir)
  } catch (error) {
    process.stderr.write(` ⚠️ Can't create directory "${dir}": ${error}`)
    return ''
  }

  return `${dir}/`
}

export const shortenFilename = (filename) => {
  const name = filename.split(path.sep).pop()
  // 1234...5678.901
  if (name.length <= 11) {
    return name
  }

  return `${name.slice(0, 4)}..${name.slice(-8)}`
}

export const outCustomName = (customArgs) => {
  // The last should be the output file name
  return customArgs.split(' ').pop()
}

export const outFilename = (filename, options) => {
  if (options.custom) {
    return outCustomName(options.custom)
  }

  const dir = outDir(options.dir)
  const nameParts = filename.split('.')
  const inputExt = nameParts.slice(-1)

  const info = formatInfo(options.format)
  // If the "copy" arg is specified use the same file extension
  const { ext, filePostfix: postfix } = options.copy
    ? { ext: inputExt, filePostfix: '' }
    : info

  const name =
    nameParts.length > 1 ? nameParts.slice(0, -1).join('.') : nameParts[0]
  const outputName = `${dir}${name}${postfix}.${ext}`

  // check if input filename equals output filename
  if (filename === outputName) {
    return `${dir}${name}-${timestamp()}${postfix}.${ext}`
  }

  return outputName
}

export const pause = () => {
  return new Promise((resolve) => {
    setTimeout(resolve, 100)
  })
}

export const ffmpegInstalled = async () => {
  const ffmpeg = spawn('ffmpeg', ['-version'])

  const isInstalled = await new Promise((resolve) => {
    ffmpeg.on('error', (_) => {
      resolve(false)
    })

    ffmpeg.on('close', (code) => {
      if (code) {
        resolve(false)
      }

      resolve(true)
    })
  })

  if (isInstalled) {
    return true
  } else {
    console.log('')
    console.log(`${chalk.red('✖')} The ffmpeg is not installed.`)
    console.log('📦 Please install it first:')
    console.log('https://ffmpeg.org/download.html')
    console.log('')
    return false
  }
}

export const fileSize = (filename) => {
  const stats = fs.statSync(filename)
  return (stats.size / 1024 / 1024).toFixed(2)
}

export const random = (array) => {
  const i = Math.floor(array.length * Math.random())
  return array[i]
}
