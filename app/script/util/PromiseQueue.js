/*
 * Wire
 * Copyright (C) 2017 Wire Swiss GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see http://www.gnu.org/licenses/.
 *
 */

'use strict';

window.z = window.z || {};
window.z.util = z.util || {};

const SENDING_QUEUE_CONFIG = {
  UNBLOCK_INTERVAL: 60 * 1000,
};

z.util.PromiseQueue = class PromiseQueue {
  /**
   * Construct a new Promise Queue.
   *
   * @param {Object} [options={}] - Initialization options
   * @param {Number} options.timeout - Timeout in ms
   * @param {Boolean} options.paused - Initial paused state
   * @returns {PromiseQueue} Process Promises sequentially
   */
  constructor(options = {}) {
    const {timeout = SENDING_QUEUE_CONFIG.UNBLOCK_INTERVAL, paused = false} = options;

    this.logger = new z.util.Logger('z.util.PromiseQueue', z.config.LOGGER.OPTIONS);

    this._blocked = false;
    this._interval = undefined;
    this._paused = paused;
    this._timeout = timeout;
    this._queue = [];
    return this;
  }

  /**
   * Executes first function in the queue.
   * @returns {undefined} No return value
   */
  execute() {
    if (this._paused || this._blocked) return;

    const queue_entry = this._queue[0];
    if (queue_entry) {
      this._blocked = true;
      this._interval = window.setInterval(() => {
        if (!this._paused) {
          this._blocked = false;
          window.clearInterval(this._interval);
          this.logger.error('Promise queue failed, unblocking queue', this._queue);
          this.execute();
        }
      },
      this._timeout);

      queue_entry.fn()
      .catch((error) => {
        queue_entry.resolve_fn = undefined;
        queue_entry.reject_fn(error);
      })
      .then((response) => {
        if (queue_entry.resolve_fn) {
          queue_entry.resolve_fn(response);
        }
        window.clearInterval(this._interval);
        this._blocked = false;
        this._queue.shift();
        window.setTimeout(() => {
          return this.execute();
        },
        0);
      });
    }
  }

  /**
   * Get the number of queued functions.
   * @returns {Number} Number of queued functions
   */
  get_length() {
    return this._queue.length;
  }

  /**
   * Pause or resume the execution.
   * @param {Boolean} [should_pause=true] - Pause queue
   * @returns {undefined} No return value
   */
  pause(should_pause = true) {
    this._paused = should_pause;
    if (this._paused === false) {
      this.execute();
    }
  }

  /**
   * Queued function is executed when queue is empty or previous functions are executed.
   * @param {Function} fn - Function to be executed in queue order
   * @returns {Promise} Resolves when function was executed
   */
  push(fn) {
    return new Promise((resolve, reject) => {
      const queue_entry = {
        fn: fn,
        resolve_fn: resolve,
        reject_fn: reject,
      };

      this._queue.push(queue_entry);
      this.execute();
    });
  }
};