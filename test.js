const assert = require('assert')
const EventEmitter = require('events')
const proxyquire = require('proxyquire')

// create reader with serialport stub
const Reader = proxyquire('./index.js', { 'serialport': EventEmitter })

describe('Reader', () => {
  describe('#on("data")', () => {
    it('should provide a message', (done) => {

      const reader = new Reader({ port: '/dev/ttyUSB0' })
      const serialStub = reader._port

      reader.on('data', (msg) => {
        assert.equal(msg.total, 197.4638, 'Total should be given')
        assert.equal(msg.t1, 197.4638, 't1 should be given')
        assert.equal(msg.t2, 0, 't2 should be given')
        // assert.equal(msg.w, 0, 'w should be given')
        done()
      })

      serialStub.emit('data', '1b1b1b1b010101017605003a95a9620062007263010176010105001387390b0649534b010e1f5a783c0101635cee007605003a95aa620062007263070177010b0649534b010e1f5a783c070100620affff72620165002582c67777078181c78203ff010101010449534b0177070100000009ff010101010b0649534b010e1f5a783c0177070100010800ff650000018201621e52ff5900000000001e216e0177070100010801ff0101621e52ff5900000000001e216e0177070100010802ff0101621e52ff5900000000000000000177070100100700ff0101621b520055000000da0177078181c78205ff010101018302e22de327ff72f076d2fbdb01cf88d170872a19232939373871d28b6725e7dae09b22976cd40eaf5fb409c74ac5493f30010101637c77007605003a95ab6200620072630201710163ead8001b1b1b1b1a00c8af')
    })
  })
})
