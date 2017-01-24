const EventEmitter = require('events')
const SerialPort = require('serialport')
const Hoek = require('hoek')

const defaultOptions = {
  port: '/dev/ttyUSB0',
  portOptions: {
    baudrate: 9600,
    databits: 8,
    stopbits: 1,
    parity: 'none',
    buffersize: 2048,
    parser: SerialPort.parsers.readline('1b1b1b1b01010101', 'hex')
  },
  pattern: {
    params: {
      total: new RegExp('070100010800.{24}(.{16})0177'),
      t1: new RegExp('070100010801.{24}(.{8})0177'),
      t2: new RegExp('070100010802.{24}(.{8})0177')
    }
  },
  maxChunkSize: 4096,
  autoStart: true,
  divisor: 10000
}

class Reader extends EventEmitter {
  constructor (options) {
    super()
    this.options = Hoek.applyToDefaults(defaultOptions, options || {})
    if (this.options.autoStart) this.start()
  }

  start () {
    this._chunk = ''
    this._port = new SerialPort(this.options.port, this.options.portOptions)
    this._port.on('data', this._onData.bind(this))
    this._port.on('error', this._onError.bind(this))
  }

  stop () {
    this._port.stop()
  }

  _onData (data) {
    var message = {}
    var hasKey = false
    Object.keys(this.options.pattern.params).forEach((key) => {
      const regex = this.options.pattern.params[key]
      const match = data.match(regex)
      if (match) {
        let value = match[match.length - 1]
        value = parseInt(value, 16) / this.options.divisor
        message[key] = value
        hasKey = true
      }
    })

    if (hasKey) {
      this._lastMessage = message
      this.emit('data', message)
    }
  }

  _onError (error) {
    this.emit('error', error)
  }
}

module.exports = Reader
