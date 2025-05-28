import {Logger} from './../function/log-helper.js';

/**
 * API Namespace
 * @namespace API
 */

const API = {};

// @ts-expect-error TODO: fix this
const factoryApiBase = function (es) {
  es.verbose = false;

  const logModule = 'ecosystem-base';

  /**
   * @alias init - called when window 'load' event occurs
   * @memberof API
   * @private
   */
  es.init = async () => {
    // await API.CONTROLLER._init()

    window.addEventListener('error', (e) => {
      Logger.e(logModule, e);
    });

    window.addEventListener('unhandledrejection', (evt) => {
      Logger.e(logModule, 'undandledrejection!!!!');
      Logger.e(logModule, evt);
      Logger.e(logModule, evt.reason);
    });

    window.addEventListener('uncaughtException', (error) => {
      Logger.e(logModule, 'uncaughtException');
      Logger.e(logModule, 'An error occurred:');
      Logger.e(logModule, error);
    });
  };
  window.addEventListener('load', es.init, false);

  es.__unload = false;

  /**
   * Clean up when the web page is closed
   */
  window.addEventListener(
    'beforeunload',
    () => {
      es.__unload = true;

      return null;
    },
    false,
  );

  /**
   * Modifies an Error so it can be used with JSON.strigify
   * @alias replaceErrors
   * @memberof API
   * @private
   * @param {any} key
   * @param {any} value
   * @returns {object}
   */
  const replaceErrors = function (key, value) {
    if (value instanceof Error) {
      var error = {};

      Object.getOwnPropertyNames(value).forEach(function (propName) {
        error[propName] = value[propName];
      });

      return error;
    }

    return value;
  };

  /**
   * Builds an status object.
   * @alias createStatusObject
   * @memberof API
   * @private
   * @param {string}  message
   * @param {Error | object | string}      item
   */
  function createStatusObject(message, item = {}) {
    let r = {};
    try {
      let msg = '';
      if (typeof message === 'string') msg = message;
      r.message = msg;

      if (item instanceof Error) {
        if (r.message.length <= 0) r.message = `Exception: ${item.message}`;
        else r.message += ` >>> Exception: ${item.message}`;
      } else if (typeof item === 'string') {
        if (r.message.length <= 0) r.message = item;
        else r.message += ` >>> ${item}`;
      } else if (Object.prototype.hasOwnProperty.call(item, 'message')) {
        r = JSON.parse(JSON.stringify(item));
        r.message = msg;
        if (typeof item.message === 'string' && item.message.length > 0) r.message += ` >>> ${item.message}`;
      }
    } catch (error) {
      r = {};
      r.message = `Failed to create status object. >>> Exception: ${error.message}`;
    }

    return r;
  }

  /**
   * Checks if input is a non empty string
   * @alias isNonEmptyString
   * @memberof API
   * @private
   * @param {any} x - String to be evaluated
   * @returns {boolean}
   */
  const isNonEmptyString = (x) => {
    if (x === null) return false;
    if (typeof x !== 'string') return false;
    if (x === '') return false;
    if (x === 'undefined') return false;

    return true;
  };

  /**
   * Disable monitor and variable subscriptions.
   * @param {} value
   */
  es.blockSubscription = (value = true) => {
    es.isSubscriptionBlocked = value;
  };

  /**
   * Rejects with status object.
   * @alias rejectWithStatus
   * @memberof API
   * @private
   * @param {string}  message
   * @param {object} item
   * @returns {Promise} Promise.reject with message and item information
   */
  es.rejectWithStatus = function (message, item = {}) {
    if (es.verbose) {
      Logger.i(logModule, message);
      Logger.e(logModule, item);
    }
    let r = createStatusObject(message, item);
    return Promise.reject(r);
  };

  /**
   * Generates an UUIDs (Universally Unique IDentifier)
   * @alias generateUUID
   * @memberof API
   * @returns {string} UUID
   * @example
   * let uuid = API.generateUUID()
   */
  // https://stackoverflow.com/questions/105034/how-do-i-create-a-guid-uuid/
  es.generateUUID = () => {
    // Public Domain/MIT
    var d = new Date().getTime(); //Timestamp
    var d2 = (typeof performance !== 'undefined' && performance.now && performance.now() * 1000) || 0; //Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16; //random number between 0 and 16
      if (d > 0) {
        //Use timestamp until depleted
        r = (d + r) % 16 | 0;
        d = Math.floor(d / 16);
      } else {
        //Use microseconds since page-load if supported
        r = (d2 + r) % 16 | 0;
        d2 = Math.floor(d2 / 16);
      }
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
  };

  /**
   * Asynchronous sleep function
   * @alias sleep
   * @memberof API
   * @param {number} ms - Time in miliseconds
   * @returns {Promise}
   * @example
   * await API.sleep(1000);
   */
  es.sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  /**
   * Asynchronous formatValue function
   * @alias formatValue
   * @memberof API
   * @param {any} value - origin value
   * @returns {any}
   * @example
   *  API.formatValue("\"666\"");
   */
  es.formatValue = (value) => {
    if (typeof value == 'string' && value.startsWith('"') && value.endsWith('"')) {
      return value.slice(1, -1);
    }
    return value;
  };

  /**
   * Timeout function - this can be used with Promise.race to escape another asynchronous function which takes longer than the timeout
   * @alias timeout
   * @memberof API
   * @param {number} ms - Time in miliseconds
   * @private
   */
  es.timeout = function (ms) {
    return new Promise(function (_, reject) {
      setTimeout(function () {
        reject(new Error(`Request took too long! Timeout after ${ms} milisecond`));
      }, ms);
    });
  };

  /**
   * Wait for a condition to be true. It can be used together with Promise.race and API.timeout for waiting for a condition with timeout
   * @alias waitForCondition
   * @memberof API
   * @param {function} func - Function containing the condition
   * @param {API.waitForConditionOptions} interval_ms - Interval in miliseconds
   * @returns {Promise}
   * @private
   */
  es.waitForCondition = async function (func, {interval_ms = 100, timeout_ms = 10000} = {}) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const interval = setInterval(async () => {
        try {
          const res = await func();
          if (res) {
            clearInterval(interval);
            resolve(true);
          } else if (Date.now() - startTime >= timeout_ms) {
            clearInterval(interval);
            resolve(false);
          }
        } catch (error) {
          clearInterval(interval);
          reject();
        }
      }, interval_ms);
    });
  };

  /**
   * @class API.Events
   * @memberof API
   * @private
   */
  es.Events = class Events {
    constructor() {
      this.events = {};
    }

    /**
     * Subscribe to an event
     * @alias on
     * @memberof API.Events
     * @param {string} eventName - name of the triggering event
     * @param {function} callback -function to be called when event is triggered
     */
    on(eventName, callback) {
      if (typeof callback !== 'function') throw new Error('callback is not a valid function');
      const handlers = this.events[eventName] || [];
      if (handlers.includes(callback)) return;
      handlers.push(callback);
      this.events[eventName] = handlers;
    }

    /**
     * remove Subscribes
     * @alias off
     * @memberof API.Events
     * @param {string} eventName - name of the off event
     */
    off(eventName) {
      if (this.events[eventName]) this.events[eventName] = [];
    }

    /**
     * Triggers all callback fuction that have subscribe to an event
     * @alias trigger
     * @memberof API.Events
     * @param {string} eventName - Name of the event to be triggered
     * @param {any} data - Data passed to the callback as input parameter
     */
    trigger(eventName, data = null) {
      const handlers = this.events[eventName];
      if (!handlers || handlers.length === 0) {
        return;
      }
      handlers.forEach((callback) => {
        callback(data);
      });
    }
  };
  es._events = new es.Events();

  /**
   * The API.CONTROLLER class provides a set of interfaces for managing and monitoring the robot controller's motor status, operation modes,and other.
   * It includes methods for subscribing to motor status, retrieving the current state or operation mode, and performing actions such as setting motor states or restarting the controller.
   * This class serves as a high-level abstraction for interacting with the robot controller.
   * @alias API.CONTROLLER
   * @namespace
   */
  es.CONTROLLER = new (function () {
    /**
     * @alias STATE
     * @memberof API.CONTROLLER
     * @readonly
     * @enum {string}
     */
    this.STATE = {
      /*the controller is starting up*/
      Init: 'initializing',
      /*motors on state*/
      MotorsOn: 'motors_on',
      /*motors off state*/
      MotorsOff: 'motors_off',
      /*stopped due to safety*/
      GuardStop: 'guard_stop',
      /*emergency stop state*/
      EStop: 'emergency_stop',
      /*emergency stop state resetting*/
      EStopR: 'emergency_stop_resetting',
      /*system failure state*/
      SysFailure: 'system_failure',
    };

    /**
     * @alias OPMODE
     * @memberof API.CONTROLLER
     * @readonly
     * @enum {string}
     */
    this.OPMODE = {
      Auto: 'automatic',
      Manual: 'manual',
      ManualR: 'manual_reduced',
      ManualFull: 'manual_full',
    };

    /**
     * @alias STATE
     * @memberof API.CONTROLLER
     * @readonly
     * @enum {string}
     */
    this.ROBOTTYPES = {
      IRB14050: /IRB 14050/,
      IRB1100: /IRB 1100/,
      IRB910: /IRB 910/,
      CRB1100: /CRB 1100/,
      CRB15000: /CRB 15000/,
      IRB1300: /IRB 1300/,
      CRB1300: /CRB 1300/,
    };

    /**
     * Gets robot type. Possible types:
     *    CRB 15000-5/0.95
     *    IRB 14050-0.5/0.5
     * @alias getRobotType
     * @memberof API.CONTROLLER
     * @returns {Promise<string>} A promise with a string containing the robot type.
     * @example
     * let robotType = await API.CONTROLLER.getRobotType()
     */
    this.getRobotType = async function () {
      if (typeof this.robotType == 'undefined') {
        this.robotType = await API.RWS.CONTROLLER.getRobotType();
      }
      return this.robotType;
    };

    /**
     * Check if the connected robot is IRB 14050
     * @alias getRobotType
     * @memberof API.CONTROLLER
     * @returns {Promise<boolean>} A promise with a boolean containing if the robot is single arm Yumi.
     * @example
     * let isSAY = await API.CONTROLLER.isSAY()
     */
    this.isSAY = async function () {
      let robotType = await this.getRobotType();
      return API.CONTROLLER.ROBOTTYPES.IRB14050.test(robotType);
    };

    /**
     * @memberof API.CONTROLLER
     * @param {RWS.Controller.MonitorResources} res
     * @param {Function} func
     * @returns {Promise<{}>}
     * @private
     */
    const subscribeRes = async function (res, func) {
      try {
        if (es.isSubscriptionBlocked) {
          Logger.w(logModule, 'API.CONTROLLER: Subscription disabled, monitor controller');
          return;
        }

        const monitor = await RWS.Controller.getMonitor(res);
        monitor.addCallbackOnChanged(func);
        await monitor.subscribe();
      } catch (e) {
        return API.rejectWithStatus(`Subscription to ${res} failed.`, e);
      }
    };

    /**
     * Subscribe to 'operation-mode'. Current state is stored in
     * {@link opMode}. Additionally, {@link isManReduced}
     * is updated with the corresponding value.
     * @alias monitorOperationMode
     * @memberof API.CONTROLLER
     * @param {function} [callback] - Callback function called when operation mode changes
     * @example
     * // The callback will be executed when operation mode is changed
     * const opMode = (value)=>{console.log("operation mode is:",value);}
     * await API.CONTROLLER.monitorOperationMode(opMode);
     */
    this.monitorOperationMode = async function (callback = null) {
      if (this.opMode === undefined) {
        try {
          /**
           * @alias opMode
           * @memberof API.CONTROLLER
           * @property {boolean} opMode Stores the operation mode.
           * This property is available only after calling API.CONTROLLER.monitorController()
           */
          this.opMode = await RWS.Controller.getOperationMode();
          /**
           * @alias isManual
           * @memberof API.CONTROLLER
           * @property {boolean} isManual true if operation mode is manual reduced, false otherwise
           * This property is available only after calling API.CONTROLLER.monitorController()
           */
          this.isManual = this.opMode === API.CONTROLLER.OPMODE.ManualR ? true : false;

          /**
           * @alias isAuto
           * @memberof API.CONTROLLER
           * @property {boolean} isAuto true if operation mode is manual reduced, false otherwise
           * This property is available only after calling API.CONTROLLER.monitorController()
           */
          this.isAuto = this.opMode === API.CONTROLLER.OPMODE.Auto ? true : false;
          const cbOpMode = function (data) {
            this.opMode = data;
            data === API.CONTROLLER.OPMODE.ManualR ? (this.isManual = true) : (this.isManual = false);
            data === API.CONTROLLER.OPMODE.Auto ? (this.isAuto = true) : (this.isAuto = false);
            es._events.trigger('op-mode', data);
            Logger.i(logModule, `Op mode: ${this.opMode}`);
          };
          subscribeRes(RWS.Controller.MonitorResources.operationMode, cbOpMode.bind(this));
          callback(this.opMode);
        } catch (e) {
          return API.rejectWithStatus('Failed to subscribe operation mode', e);
        }
      }

      es._events.on('op-mode', callback);
    };

    /**
     * Subscribe to 'controller-state' and 'operation-mode'. Current state is stored in
     * {@link ctrlState}. Additionally, {@link isMotOn}
     * is updated with the corresponding value.
     * @alias monitorControllerState
     * @memberof API.CONTROLLER
     * @param {function} [callback] - Callback function called when controller state changes
     * @example
     * // The callback will be executed when motor status is changed
     * const motorStatus = (value)=>{console.log("motor status is:",value);}
     * await API.CONTROLLER.monitorControllerState(motorStatus);
     */
    this.monitorControllerState = async function (callback) {
      if (this.ctrlState === undefined) {
        try {
          /**
           * @alias ctrlState
           * @memberof API.CONTROLLER
           * @property {string} ctrlState the current state of the controller.
           * This property is available only after calling API.CONTROLLER.monitorController()
           */
          this.ctrlState = await RWS.Controller.getControllerState();
          /**
           * @alias isMotOn
           * @memberof API.CONTROLLER
           * @property {boolean} isMotOn true if motors are on, false otherwise
           * This property is available only after calling API.CONTROLLER.monitorController()
           */
          this.isMotOn = this.ctrlState === API.CONTROLLER.STATE.MotorsOn ? true : false;
          const cbControllerState = function (data) {
            this.ctrlState = data;

            data === API.CONTROLLER.STATE.MotorsOn ? (this.isMotOn = true) : (this.isMotOn = false);
            es._events.trigger('controller-state', data);
            Logger.i(logModule, `controller-state: ${this.ctrlState}`);
          };
          subscribeRes(RWS.Controller.MonitorResources.controllerState, cbControllerState.bind(this));
          callback(this.ctrlState);
        } catch (e) {
          return API.rejectWithStatus('Failed to subscribe controller state', e);
        }
      }
      es._events.on('controller-state', callback);
    };

    // this.monitorMechUnit = async function (callback) {
    //   try {
    //     if (typeof callback !== 'function' && callback !== null)
    //       throw new Error('callback is not a valid function');

    //     const cbMechUnit = function (data) {
    //       this.mechUnit = data;

    //       callback && callback(data);
    //       API.verbose && console.log(this.mechUnit);
    //     };
    //     subscribeRes('mechunit', cbMechUnit.bind(this));
    //   } catch (e) {
    //     return API.rejectWithStatus('Failed to subscribe controller state', e);
    //   }
    // };

    /**
     * Set operation mode to manual
     * @alias setOpMode
     * @memberof API.CONTROLLER
     * @param {API.CONTROLLER.OPMODE} mode - The operation mode to be set
     * @example
     * // Set the operation mode to Auto mode
     * await API.CONTROLLER.setOpMode(API.CONTROLLER.OPMODE.Auto)
     */
    this.setOpMode = async function (mode) {
      if (mode === API.CONTROLLER.OPMODE.Manual) await this.setOpModeManual();
      else if (mode === API.CONTROLLER.OPMODE.Auto) await this.setOpModeAutomatic();
    };

    /**
     * Set operation mode to manual
     * @alias setOpModeManual
     * @memberof API.CONTROLLER
     * @example
     * await API.CONTROLLER.setOpModeManual()
     */
    this.setOpModeManual = async function () {
      await RWS.Controller.setOperationMode(API.CONTROLLER.OPMODE.Manual);
    };

    /**
     * Set operation mode to Automatic
     * @alias setOpModeAutomatic
     * @memberof API.CONTROLLER
     * @example
     * await API.CONTROLLER.setOpModeAutomatic()
     */
    this.setOpModeAutomatic = async function () {
      await RWS.Controller.setOperationMode(API.CONTROLLER.OPMODE.Auto);
    };

    /**
     * Gets operation mode. Possible modes are:
     *    <br>&emsp;'initializing' controller is starting up, but not yet ready
     *    <br>&emsp;'automatic_changing' automatic mode requested
     *    <br>&emsp;'manual_full_changing' manual full speed mode requested
     *    <br>&emsp;'manual_reduced' manual reduced speed mode
     *    <br>&emsp;'manual_full' manual full speed mode
     *    <br>&emsp;'automatic' automatic mode
     *    <br>&emsp;'undefined' undefined
     * @alias getOperationMode
     * @memberof API.CONTROLLER
     * @returns {Promise<RWS.Controller.OperationModes>} A promise with a string containing the operation mode.
     * @example
     * let opMode = await API.CONTROLLER.getOperationMode()
     */
    this.getOperationMode = function () {
      return (async () => {
        return await RWS.Controller.getOperationMode();
      })();
    };

    /**
     * Gets controller state. Possible states are:
     *  <br>&emsp;'initializing' the controller is starting up
     *  <br>&emsp;'motors_on' motors on state
     *  <br>&emsp;'motors_off' motors off state
     *  <br>&emsp;'guard_stop' stopped due to safety
     *  <br>&emsp;'emergency_stop' emergency stop state
     *  <br>&emsp;'emergency_stop_resetting' emergency stop state resetting
     *  <br>&emsp;'system_failure' system failure state
     * @alias getControllerState
     * @memberof API.CONTROLLER
     * @returns {Promise<RWS.Controller.ControllerStates>} A promise with a string containing the controller state.
     * @example
     * let controllerState = await API.CONTROLLER.getControllerState()
     */
    this.getControllerState = function () {
      return (async () => {
        return await RWS.Controller.getControllerState();
      })();
    };

    /**
     * Check if motor is on
     * @alias checkIfMotorIsOn
     * @memberof API.CONTROLLER
     * @returns {Promise<boolean>} A promise with a boolean containing if motor is in on status.
     * @example
     * let motorStatus = await API.CONTROLLER.checkIfMotorIsOn()
     */
    this.checkIfMotorIsOn = async function () {
      let motorState = await API.CONTROLLER.getControllerState();
      return motorState == API.CONTROLLER.STATE.MotorsOn;
    };

    /**
     * Set motor status to on/off
     * @alias setMotorsState
     * @memberof API.CONTROLLER
     * @param {API.CONTROLLER.STATE} state - The motor status to be set
     * @example
     * // Set motor on
     * await API.CONTROLLER.setMotorsState(API.CONTROLLER.STATE.MotorsOn)
     */
    this.setMotorsState = async function (state) {
      // return if wrong command
      if (![API.CONTROLLER.STATE.MotorsOn, API.CONTROLLER.STATE.MotorsOff].includes(state)) return;

      // return if already in expected state
      let motorState = await this.getControllerState();
      if (motorState == state) return;

      // return if in manual mode and the robot is not IRB 14050
      let opMode = await this.getOperationMode();
      let isSAY = await this.isSAY();
      if (!(isSAY || opMode == API.CONTROLLER.OPMODE.Auto)) return;

      try {
        await RWS.Controller.setMotorsState(state);
        if (state == API.CONTROLLER.STATE.MotorsOn) {
          await API.waitForCondition(this.checkIfMotorIsOn, {interval_ms: 100, timeout_ms: 2000});
        }
      } catch (e) {
        Logger.e(logModule, `Failed to set motor ${state}`);
        return API.rejectWithStatus(`Failed to set motor ${state}`, e);
      }
    };

    /**
     * Get the current language
     * @alias getLanguage
     * @memberof API.CONTROLLER
     * @returns {Promise<string>}
     * @example
     * await API.CONTROLLER.getLanguage()
     */
    this.getLanguage = async function () {
      return await RWS.Controller.getEnvironmentVariable('$LANGUAGE');
    };

    /**
     * Restarts the controller.  Possible modes are:
     *     <br>&emsp;'restart' normal warm start
     *     <br>&emsp;'shutdown' shut down the controller
     *     <br>&emsp;'boot_application' start boot application
     *     <br>&emsp;'reset_system' reset system
     *     <br>&emsp;'reset_rapid' reset Rapid
     *     <br>&emsp;'revert_to_auto' revert to last auto-save
     *     <br>&emsp;NOTE! An enum ‘RWS.Controller.RestartModes’ with the valid values is provided for ease of use.
     * @alias restart
     * @memberof API.CONTROLLER
     * @param [mode] - The parameter mode indicates what kind of restart is requested.
     * @returns {Promise<{}>}
     * @example
     * await API.CONTROLLER.restart()
     */
    this.restart = async function (mode = RWS.Controller.RestartModes.restart) {
      try {
        await API.sleep(1000);
        RWS.Subscriptions.unsubscribeToAll();
        await RWS.Controller.restartController(mode);
      } catch (e) {
        return API.rejectWithStatus('Failed to restart controller', e);
      }
    };
  })();

  es.constructedBase = true;
};

// const API = {};
factoryApiBase(API);

export default API;
