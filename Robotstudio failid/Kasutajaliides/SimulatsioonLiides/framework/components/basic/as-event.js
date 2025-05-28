/**
 * Event manager base class
 * @class TComponents.Eventing_A
 * @memberof TComponents
 * @ignore
 */
export class Eventing_A {
  constructor() {
    /**
     * @type {Object.<string, function[]>}
     */
    this.events = {};
  }

  /**
   * Subscribe to an event
   * @alias on
   * @memberof TComponents.Eventing_A
   * @param {string} eventName - Name of the triggering event
   * @param {function} callback - Function to be called when the event is triggered
   * @param {boolean} [strict=true] - If true (default), checking whether the function has been added is done by function object comparison,
   * otherwise, the comparison is done only by function.name
   */
  on(eventName, callback, strict = true) {
    if (typeof callback !== 'function') throw new Error('callback is not a valid function');
    const handlers = this.events[eventName] || [];

    if (handlers.some((cb) => cb.name === callback.name) && !strict) return;
    if (handlers.includes(callback)) return;
    handlers.push(callback);
    this.events[eventName] = handlers;
  }

  /**
   * Unsubscribe from an event
   * @alias off
   * @memberof TComponents.Eventing_A
   * @param {string} eventName - Name of the triggering event
   * @param {function} callback - Function to be removed from the event's callbacks
   * @returns {boolean} - True if the callback was removed, false if it was not found
   */
  off(eventName, callback) {
    const handlers = this.events[eventName];
    if (!handlers || handlers.length === 0) {
      return false;
    }
    const index = handlers.indexOf(callback);
    if (index > -1) {
      handlers.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Subscribe to an event, but the callback is called only once
   * @alias once
   * @memberof TComponents.Eventing_A
   * @param {string} eventName - Name of the triggering event
   * @param {function} callback - Function to be called when the event is triggered
   * @returns {boolean} - True if the callback was added, false if it was already added
   */
  once(eventName, callback) {
    if (typeof callback !== 'function') throw new Error('callback is not a valid function');
    const handlers = this.events[eventName] || [];
    if (handlers.includes(callback)) return false;

    const onceCallback = (...data) => {
      callback(...data);
      this.off(eventName, onceCallback);
    };
    handlers.push(onceCallback);
    this.events[eventName] = handlers;
    return true;
  }

  /**
   * Trigger all callbacks subscribed to an event
   * @alias trigger
   * @memberof TComponents.Eventing_A
   * @param {string} eventName - Name of the event to be triggered
   * @param {...any} data - Data passed to the callback as input parameters
   */
  trigger(eventName, ...data) {
    const handlers = this.events[eventName];
    if (!handlers || handlers.length === 0) {
      return;
    }
    handlers.forEach((callback) => {
      callback(...data);
    });
  }

  /**
   * Get the number of callbacks subscribed to an event
   * @alias count
   * @memberof TComponents.Eventing_A
   * @param {string} eventName - Name of the triggering event
   * @returns {number} - Number of callbacks subscribed to the event
   */
  count(eventName) {
    return this.events[eventName] ? this.events[eventName].length : 0;
  }

  /**
   * Clean up a specific event
   * @memberof TComponents.Eventing_A
   * @param {string} eventName - The event name you want to clean
   */
  cleanEvent(eventName) {
    if (this.events[eventName]) {
      const handlers = this.events[eventName];
      handlers.forEach((callback) => {
        this.off(eventName, callback);
      });
      // Optionally, remove the event from the events registry
      delete this.events[eventName];
    }
  }

  /**
   * Clean up all registered events except those in the ignore list
   * @alias cleanUpEvents
   * @memberof TComponents.Eventing_A
   * @param {string[]} [ignores=['before:init', 'after:render']] - Event list you don't want to clean
   */
  cleanUpEvents(ignores = ['before:init', 'after:render']) {
    for (const eventName in this.events) {
      if (!ignores.includes(eventName) && Object.prototype.hasOwnProperty.call(this.events, eventName)) {
        const handlers = this.events[eventName];
        handlers.forEach((callback) => {
          this.off(eventName, callback);
        });
      }
    }
  }

  /**
   * Check if an event has been registered already
   * @alias hasEvent
   * @memberof TComponents.Eventing_A
   * @param {string} eventName - Name of the triggering event
   * @returns {boolean} - True if the event has been registered already, false otherwise
   */
  hasEvent(eventName) {
    return Object.prototype.hasOwnProperty.call(this.events, eventName);
  }

  /**
   * Check if any event has been registered already
   * @alias anyEventRegistered
   * @memberof TComponents.Eventing_A
   * @returns {boolean} - True if any event has been registered already, false otherwise
   */
  anyEvent() {
    return Object.keys(this.events).length > 0;
  }
}
