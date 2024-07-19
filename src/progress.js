import chalk from 'chalk'

export class ProgressBar {
  constructor({ current, total, onComplete, stream, barSize, prefix } = {}) {
    this.stream = stream ?? process.stdout
    this.barSize = barSize ?? 30
    this.current = current ?? 0
    this.total = total ?? 100
    this.onComplete = onComplete
    this.etaData = [] // the data to calculate eta { value, time }
    this.prefix = prefix ?? ''
    this.info = ''
    this.status = 'running' // success, fail

    this.spinner = {
      frames: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
      interval: 80,
      index: 0,
      intervalId: null,
    }
  }

  percent = () => Math.floor(this.current / this.total * 100)

  bar = () => {
    const _progress = Math.floor(this.current / this.total * this.barSize)
    const progress = isNaN(_progress) || _progress < 0 ? 0 : _progress
    const isDone = progress === this.barSize
    const leftColor = isDone ? chalk.green : chalk.green
    const rightColor = chalk.gray

    const left = Array(progress).fill(leftColor('━'))

    if (progress > 0 && progress < this.barSize) {
      left[left.length - 1] = leftColor('╸')
    }
    const right = isDone ? [] : Array(this.barSize - progress).fill(rightColor('━'))

    const bar = `${left.join('')}${right.join('')}`
    const percent = chalk.yellow(`${String(this.percent()).padStart(3, ' ')}%`)
    const eta = chalk.blue(`${this.formatEta()}`)
    const prefix = this.prefix ? ` ${this.prefix}` : ''
    const spinner = this.getSpinner()

    if (this.status === 'success') {
      this.stream.clearLine()
      this.stream.cursorTo(0)
      return ` ${spinner}${prefix} ${chalk.yellow(this.info)}`
    }

    return ` ${spinner}${prefix} ${bar} ${percent} ${eta}`
  }

  getSpinner = () => {
    if (this.status === 'running') {
      return chalk.green(this.spinner.frames[this.spinner.index])
    } else {
      return this.status === 'success' ? chalk.green('✔') : chalk.red('✖')
    }
  }

  addEtaData = (value) => {
    this.etaData.push({ value, time: new Date().getTime() })
  }

  getEta = () => {
    if (this.etaData.length < 2) {
      return undefined
    }

    const length = this.etaData.length
    const last = this.etaData[length - 1]
    const prev = this.etaData[0]
    // velocity of changing value per second
    const velocity = (last.value - prev.value) / ((last.time - prev.time) / 1000)
    const left = this.total - last.value
    const eta = (left / velocity).toFixed(2) // seconds

    return eta
  }

  formatEta = () => {
    const eta = this.getEta()

    if (!eta || !isFinite(eta)) {
      return '-:--:--'
    }

    const hours = Math.floor(eta / 60 / 60)
    const minutes = Math.floor((eta - hours * 60 * 60) / 60)
    const seconds = Math.floor(eta - hours * 60 * 60 - minutes * 60)
    // const milli = Math.floor((eta - hours * 60 * 60 - minutes * 60 - seconds) * 100)
    const h = String(hours).padStart(1, '0')
    const mm = String(minutes).padStart(2, '0')
    const ss = String(seconds).padStart(2, '0')
    // const ms = String(milli).padStart(2, '0')
    // return `${h}:${mm}:${ss}.${ms}`

    return `${h}:${mm}:${ss}`
  }

  startSpinner = () => {
    const spinner = this.spinner
    spinner.intervalId = setInterval(() => {
      if (spinner.index === spinner.frames.length - 1) {
        spinner.index = 0
      } else {
        spinner.index++
      }

      this.render()
    }, spinner.interval)
  }

  stopSpinner = ({ status = 'success' }) => {
    this.status = status

    if (this.spinner.intervalId) {
      clearInterval(this.spinner.intervalId)
    }

    this.render()
  }

  start = () => {
    // disable cursor
    this.stream.write('\x1B[?25l')

    this.addEtaData(0)
    this.startSpinner()

    this.render()
  }

  render = () => {
    this.stream.cursorTo(0)
    this.stream.write(this.bar())
  }

  inc = () => {
    this.current++
    this.render()
    this.addEtaData(this.current)
  }

  dec = () => {
    this.current--
    this.render()
    this.addEtaData(this.current)
  }

  set = (value) => {
    this.current = value
    this.render()
    this.addEtaData(value)
  }

  stop = ({ clear, status = 'fail' } = {}) => {
    this.stopSpinner({ status })

    if (clear) {
      this.stream.clearLine()
      this.stream.cursorTo(0)
    }

    // enable cursor
    this.stream.write('\x1B[?25h')
    this.stream.write('\n')
  }

  finish = ({ clear, info = '' } = {}) => {
    this.info = info

    if (clear) {
      this.stop({ clear, status: 'success' })
      return
    }

    this.set(this.total)
    this.stop({ status: 'success' })

    this.onComplete?.()
  }
}
