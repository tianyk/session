/*!
 * express-session
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */

/**
 * Module dependencies.
 * @private
 */

var Store = require('./store')
var util = require('util')

/**
 * Shim setImmediate for node.js < 0.10
 * @private
 */

/* istanbul ignore next */
var defer = typeof setImmediate === 'function'
  ? setImmediate
  : function(fn){ process.nextTick(fn.bind.apply(fn, arguments)) }

/**
 * Module exports.
 */

module.exports = MemoryStore

/**
 * A session store in memory.
 * @public
 */

function MemoryStore() {
  Store.call(this)
  this.sessions = Object.create(null)
}

/**
 * Inherit from Store.
 */

util.inherits(MemoryStore, Store)

/**
 * Get all active sessions.
 *
 * @param {function} callback
 * @public
 */
// 获取所有有效的Session
MemoryStore.prototype.all = function all(callback) {
  var sessionIds = Object.keys(this.sessions)
  var sessions = Object.create(null)

  for (var i = 0; i < sessionIds.length; i++) {
    var sessionId = sessionIds[i]
    var session = getSession.call(this, sessionId)

    if (session) {
      sessions[sessionId] = session;
    }
  }

  callback && defer(callback, null, sessions)
}

/**
 * Clear all sessions.
 *
 * @param {function} callback
 * @public
 */
// 清空Session
MemoryStore.prototype.clear = function clear(callback) {
  this.sessions = Object.create(null)
  callback && defer(callback)
}

/**
 * Destroy the session associated with the given session ID.
 *
 * @param {string} sessionId
 * @public
 */
// 销毁Session
MemoryStore.prototype.destroy = function destroy(sessionId, callback) {
  delete this.sessions[sessionId]
  callback && defer(callback)
}

/**
 * Fetch session by the given session ID.
 *
 * @param {string} sessionId
 * @param {function} callback
 * @public
 */
// 获取一个有效的Session
MemoryStore.prototype.get = function get(sessionId, callback) {
  defer(callback, null, getSession.call(this, sessionId))
}

/**
 * Commit the given session associated with the given sessionId to the store.
 *
 * @param {string} sessionId
 * @param {object} session
 * @param {function} callback
 * @public
 */

/**
 * Get number of active sessions.
 *
 * @param {function} callback
 * @public
 */
// 获取Session的数量
MemoryStore.prototype.length = function length(callback) {
  this.all(function (err, sessions) {
    if (err) return callback(err)
    callback(null, Object.keys(sessions).length)
  })
}

// 设置一个Session
MemoryStore.prototype.set = function set(sessionId, session, callback) {
  this.sessions[sessionId] = JSON.stringify(session)
  callback && defer(callback)
}

/**
 * Touch the given session object associated with the given session ID.
 *
 * @param {string} sessionId
 * @param {object} session
 * @param {function} callback
 * @public
 */
// 直接替替换掉原Session的cookie
MemoryStore.prototype.touch = function touch(sessionId, session, callback) {
  var currentSession = getSession.call(this, sessionId)

  if (currentSession) {
    // update expiration
    currentSession.cookie = session.cookie
    this.sessions[sessionId] = JSON.stringify(currentSession)
  }

  callback && defer(callback)
}

/**
 * Get session from the store.
 * @private
 */
// 获取一个Session，采用懒删除的策略
function getSession(sessionId) {
  var sess = this.sessions[sessionId]

  if (!sess) {
    return
  }

  // parse
  sess = JSON.parse(sess)

  // 如果Session已经过期，就删掉它
  var expires = typeof sess.cookie.expires === 'string'
    ? new Date(sess.cookie.expires)
    : sess.cookie.expires

  // destroy expired session
  if (expires && expires <= Date.now()) {
    delete this.sessions[sessionId]
    return
  }

  return sess
}
