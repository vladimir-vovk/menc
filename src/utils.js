import fs from 'fs'
import path from 'path'
import { spawn } from 'child_process'
import { formatInfo } from './formats.js'
import { createRequire } from 'module'

export const say = (phrase) => {
  switch (process.platform) {
    case 'darwin':
      spawn('say', [phrase])
      break
    case 'linux':
      spawn('spd-say', [phrase])
      break
    case 'win32':
      spawn('mshta', [`vbscript:Execute("CreateObject(""SAPI.SpVoice"").Speak(""${phrase}"")(window.close)")`])
      break
  }
}

const modulePath = () => {
  const require = createRequire(import.meta.url)
  const paths = require.resolve.paths('chalk').map(p => path.join(p, 'chalk'))
  const chalkPath = paths.find(p => fs.existsSync(p))
  return path.join(chalkPath, '../..')
}

export const version = () => {
  const pjson = JSON.parse(fs.readFileSync(path.join(modulePath(), 'package.json'), 'utf8'))
  return pjson?.version

}

export const playSound = (filename) => {
  const soundFile = path.join(modulePath(), `./assets/${filename}`)
  spawn('ffplay', ['-nodisp', '-autoexit', soundFile], { detached: true })
}

export const ffmpegArgs = (format) => {
  const info = formatInfo(format)
  return info.args
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

export const outCustomName = (customArgs) => {
  // The last should be the output file name
  return customArgs.split(' ').pop()
}

export const outFilename = (filename, options) => {
  const dir = outDir(options.dir)
  const info = formatInfo(options.format)
  const { ext, filePostfix: postfix } = info
  const nameParts = filename.split('.')
  const name = nameParts.length > 1 ? nameParts.slice(0, -1).join('.') : nameParts[0]
  const outputName = `${dir}${name}${postfix}.${ext}`

  // check if input filename equals output filename
  if (filename === outputName) {
    return `${dir}${name}-${timestamp()}${postfix}.${ext}`
  }

  return outputName
}


export const pause = () => {
  return new Promise(resolve => {
    setTimeout(resolve, 100)
  })
}

export const ffmpegInstalled = async () => {
  const ffmpeg = spawn('ffmpeg', ['-version'])

  const isInstalled = await new Promise(resolve => {
    ffmpeg.on('error', _ => {
      resolve(false)
    })

    ffmpeg.on('close', code => {
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
    console.log('❌ The ffmpeg is not installed.')
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
