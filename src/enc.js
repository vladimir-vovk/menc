import { spawn } from 'child_process'
import { parse } from 'ini'
import { outFilename, outCustomName, shortenFilename, isDir, fileExists,
         ffmpegInstalled, fileSize, ffmpegArgs, playSound, say } from './utils.js'
import { ProgressBar } from './progress.js'

const parseDuration = (data) => {
  const match = data.match(/Duration: (.{2}):(.{2}):(.{2}).(.{2})/)
  if (!match) {
    return 0
  }

  const hours = Number(match[1])
  const minutes = Number(match[2])
  const seconds = Number(match[3])
  const ms = Number(match[4].padEnd(3, '0'))

  // milli-seconds
  return ms + seconds * 1000 + minutes * 60 * 1000 + hours * 60 * 60 * 1000
}

const parseError = (data) => {
  const lines = data.split('\n')
  const lastLine = lines.length > 2 ? lines[lines.length - 2] : lines[0]

  if (lastLine?.startsWith('Error')) {
    return lastLine
  }
}

export const encode = async ({ filename, options, index, total }) => {
  const output = options.custom ? outCustomName(options.custom) : outFilename(filename, options)
  const args = options.custom ? [options.custom] : ffmpegArgs(options.format)

  let error = null
  let duration = 0 // total duration of input file
  let progress = 0 // current enc progress

  const inputName = shortenFilename(filename)
  const outputName = shortenFilename(output)
  const fileIndex = total > 1 ? `[${index}/${total}] ` : ''
  const bar = new ProgressBar({ prefix: `${fileIndex}${inputName} → ${outputName}` })
  bar.start()

  const spawnArgs = ['-y', '-progress', 'pipe:1', '-i', filename, ...args]
  if (output) {
    spawnArgs.push(output)
  }
  const ffmpeg = spawn('ffmpeg', spawnArgs)

  ffmpeg.stderr.on('data', data => {
    if (!duration) {
      duration = parseDuration(data.toString())
    }

    if (!error) {
      error = parseError(data.toString())
    }
  })

  ffmpeg.stdout.on('data', data => {
    const info = parse(data.toString())
    const microSeconds = Number(info['out_time_ms'])
    progress = Math.round(microSeconds / 1000) // milli-seconds
    bar.set(progress / duration * 100)
  })

  const result = await new Promise(resolve => {
    process.on('SIGINT', () => {
      error = ' The process is interrupted by the user...'
      ffmpeg.kill('SIGKILL')
      resolve(130)
    })

    ffmpeg.on('error', err => {
      error = err
      ffmpeg.kill('SIGKILL')
      resolve(2)
    })

    ffmpeg.on('close', code => {
      if (error) {
        bar.stop()
        console.log(` 🦆 ${error}`)
        console.log()
      } else {
        const inputSize = fileSize(filename)
        const outputSize = fileSize(output)
        const ratio = (inputSize / outputSize).toFixed(2)
        bar.finish({ info: `(${inputSize}Mb / ${outputSize}Mb) ${ratio}:1` })
      }

      resolve(code)
    })
  })

  return result
}

export const enc = async (files, options) => {
  if (!await ffmpegInstalled()) {
    process.exit(1)
  }

  // skipping directories
  const onlyFiles = files.filter(file => fileExists(file) && !isDir(file))

  let result
  let i = 0

  for (let filename of onlyFiles) {
    i++

    result = await encode({ filename, options, index: i, total: onlyFiles.length })

    // SIGINT
    if (result === 130) {
      break
    }
  }

  if (result === 0) {
    playSound('success.mp3')
    say('encoding finished')
  }

  return result
}
