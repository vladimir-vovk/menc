import { InvalidArgumentError } from 'commander'

const mp3 = {
  name: 'mp3',
  ext: 'mp3',
  desc: 'mp3 (mpeg-1 Audio Layer 3) is a music format that can compress a file by up to 95%.',
  shortNames: ['mp3'],
  filePostfix: '',
  args: []
}

const ogg = {
  name: 'ogg',
  ext: 'ogg',
  desc: `ogg is a multimedia container format that's commonly for audio and video files.`,
  shortNames: ['ogg'],
  filePostfix: '',
  args: []
}

const mp4 = {
  name: 'mp4',
  ext: 'mp4',
  desc: 'mp4 a widely used multimedia file storage format for storing video.',
  shortNames: ['mp4'],
  filePostfix: '',
  args: []
}

const sd = {
  name: 'sd:480p',
  ext: 'mp4',
  desc: 'sd or 480p is a video format with 4:3 ratio and 640x480 size.',
  shortNames: ['sd', '480p'],
  filePostfix: '_sd',
  args: ['-vf', 'scale=640:480']
}

const hd = {
  name: 'hd:720p',
  ext: 'mp4',
  desc: 'hd or 720p is a video format with 16:9 ratio and 1280x720 size.',
  shortNames: ['hd', '720p'],
  filePostfix: '_hd',
  args: ['-vf', 'scale=1280:720']
}

const fhd = {
  name: 'fhd:1080p',
  ext: 'mp4',
  desc: 'fhd or 1080p is a video format with 16:9 ratio and 1920x1080 size.',
  shortNames: ['fhd', '1080p'],
  filePostfix: '_fhd',
  args: ['-vf', 'scale=1920:1080']
}

const qhd = {
  name: 'qhd:1440p',
  ext: 'mp4',
  desc: 'qhd or 1440p is a video format with 16:9 ratio and 2560x1440 size.',
  shortNames: ['qhd', '1440p'],
  filePostfix: '_qhd',
  args: ['-vf', 'scale=2560:1440']
}

const k2 = {
  name: '2k:1080p',
  ext: 'mp4',
  desc: '2k video or 1080p is a video format with 1:1.77 ratio and 2048x1080 size.',
  shortNames: ['2k'],
  filePostfix: '_2k',
  args: ['-vf', 'scale=2048:1080']
}

const k4 = {
  name: '4k:2160p',
  ext: 'mp4',
  desc: '4k (ultra hd) or 2160p is a video format with 1:1.9 ratio and 3840x2160 size.',
  shortNames: ['4k', 'uhd', '2160p'],
  filePostfix: '_4k',
  args: ['-vf', 'scale=3840:2160']
}

const k8 = {
  name: '8k:4320p',
  ext: 'mp4',
  desc: '8k (full ultra hd) or 4320p is a video format with 16∶9 ratio and 7680x4320 size.',
  shortNames: ['8k', '4320p'],
  filePostfix: '_8k',
  args: ['-vf', 'scale=7680:4320']
}

export const FORMATS = [mp3, ogg, sd, hd, fhd, qhd, k2]

export const AVAILABLE_FORMATS = FORMATS.map(format => format.name)

export const FORMATS_DESC = FORMATS.map(format => `  ${format.desc}\n`).join('').slice(0, -1)

export const parseFormatArg = (arg) => {
  const available = FORMATS.map(format => [format.name, ...format.shortNames]).flat()
  if (available.includes(arg)) {
    return arg
  }

  const error = `Allowed choices are ${AVAILABLE_FORMATS.join(', ')}`
  throw new InvalidArgumentError(error)
}

export const formatInfo = (name) => {
  const info = FORMATS.find(format => format.name === name || format.shortNames.includes(name))
  return info
}
