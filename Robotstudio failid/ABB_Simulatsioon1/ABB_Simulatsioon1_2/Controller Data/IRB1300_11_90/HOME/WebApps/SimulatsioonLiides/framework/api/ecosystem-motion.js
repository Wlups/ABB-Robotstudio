import API from './ecosystem-rws.js';
import {Logger} from './../function/log-helper.js';

export const factoryApiMotion = function (mot) {
  const logModule = 'ecosystem-motion';

  /**
   * The API.MOTION class provides a comprehensive set of interfaces for controlling and monitoring robot motion.
   * It includes methods for jogging, aligning, and moving the robot to specific positions, as well as retrieving and setting tools, work objects, and coordinate systems.
   * This class simplifies motion control operations, enabling developers to efficiently interact with and manage the robot's movement and positioning.
   * @alias API.MOTION
   * @namespace
   */
  mot.MOTION = new (function () {
    let ccounter = null;
    let jogStop = false;
    let isJogging = false;
    let jogTimeout = 0;

    /**
     * @alias JOGMODE
     * @memberof API.MOTION
     * @readonly
     * @enum {string}
     */
    this.JOGMODE = {
      Align: 'Align',
      GoToPos: 'GoToPos',
      ConfigurationJog: 'ConfigurationJog',
      Cartesian: 'Cartesian',
      AxisGroup1: 'AxisGroup1',
      AxisGroup2: 'AxisGroup2',
      Current: '',
    };

    /**
     * @alias COORDS
     * @memberof API.MOTION
     * @readonly
     * @enum {string}
     */
    this.COORDS = {
      Wobj: 'Wobj',
      Base: 'Base',
      Tool: 'Tool',
      World: 'World',
      Current: '',
    };

    this.MaxJogAxisSpeed = 2000;
    /**
     * @alias POSITIONTYPES
     * @memberof API.MOTION
     * @readonly
     * @enum {number}
     */
    this.POSITIONTYPES = {
      robtarget: 1,
      jointtarget: 2,
    };

    // /**
    //  * @typedef {number} JogDataIdx0
    //  * @typedef {number} JogDataIdx1
    //  * @typedef {number} JogDataIdx2
    //  * @typedef {number} JogDataIdx3
    //  * @typedef {number} JogDataIdx4
    //  * @typedef {number} JogDataIdx5
    //  * @type {[JogDataIdx0, JogDataIdx1, JogDataIdx2, JogDataIdx3, JogDataIdx4, JogDataIdx5]} JogData
    //  */

    /**
     * @typedef Trans
     * @prop {number} x
     * @prop {number} y
     * @prop {number} z
     * @memberof API.MOTION
     */

    /**
     * @typedef Rot
     * @prop {number} q1
     * @prop {number} q2
     * @prop {number} q3
     * @prop {number} q4
     * @memberof API.MOTION
     */

    /**
     * @typedef RobConf
     * @prop {number} cf1
     * @prop {number} cf4
     * @prop {number} cf6
     * @prop {number} cfx
     * @memberof API.MOTION
     */

    /**
     * @typedef ExtAx
     * @prop {number}  eax_a
     * @prop {number}  eax_b
     * @prop {number}  eax_c
     * @prop {number}  eax_d
     * @prop {number}  eax_e
     * @prop {number}  eax_f
     * @memberof API.MOTION
     */

    /**
     * @typedef RobTarget
     * @prop {Trans} trans
     * @prop {Rot} rot
     * @prop {RobConf} robconf
     * @prop {ExtAx} extax
     * @memberof API.MOTION
     */

    /**
     * @typedef RobAx
     * @prop {number} rax_1
     * @prop {number} rax_2
     * @prop {number} rax_3
     * @prop {number} rax_4
     * @prop {number} rax_5
     * @prop {number} rax_6
     * @memberof API.MOTION
     */

    /**
     * @typedef JointTarget
     * @prop {RobAx} robax
     * @prop {ExtAx} extax
     * @memberof API.MOTION
     */

    /**
     * @typedef executeJoggingProps
     * @prop {string} [tool]
     * @prop {string} [wobj]
     * @prop {COORDS} [coords]
     * @prop {JOGMODE} [jogMode]
     * @prop {JogData} [jogData]
     * @prop {RobTarget} [robTarget]
     * @prop {JointTarget} [jointTarget]
     * @prop {boolean} [doJoint]
     * @memberof API.MOTION
     */

    /**
     * Jogs the robot
     * @alias executeJogging
     * @memberof API.MOTION
     * @param {JOGMODE} [jogMode]
     * @param {JogData} [jogData]
     * @param {targetPosition} [robTarget] | [jointTarget]
     * @param {string} [tool]
     * @param {string} [wobj]
     * @param {COORDS} [coords]
     * @returns {undefined | Promise<{}>} - Promise rejected if failure
     * @example
     * // Perform aligning
     * await API.MOTION.executeJogging(API.MOTION.JOGMODE.Align)
     */
    this.executeJogging = async function (
      jogMode,
      {jogData = [500, 500, 500, 500, 500, 500], targetPosition = null, tool = '', wobj = '', coords = ''} = {},
    ) {
      try {
        jogStop = true;
        await API.RWS.requestMastership('motion');

        await prepareJogging(tool, wobj, coords, jogMode);

        await doJogging(jogData, targetPosition);
      } catch (err) {
        let bHeldMsh = await API.RWS.checkIfHeldMastership('motion');
        if (bHeldMsh) {
          await API.RWS.releaseMastership('motion');
        }
        return API.rejectWithStatus('Execute jogging failed.', err);
      }
    };

    /**
     * Prepares the MechUnit and ChangeCounter for jogging
     * @alias prepareJogging
     * @memberof API.MOTION
     * @param {string} tool
     * @param {string} wobj
     * @param {string} coords
     * @param {string} jogMode
     * @returns {undefined |Promise<{}>} - Undefined or reject Promise if fails.
     * @private
     */
    const prepareJogging = async function (tool = '', wobj = '', coords = '', jogMode = '') {
      try {
        await API.RWS.MOTIONSYSTEM.setMechunit({tool, wobj, jogMode, coords});

        ccounter = await API.RWS.MOTIONSYSTEM.getChangeCount();
      } catch (err) {
        return API.rejectWithStatus('Prepare jogging failed.', err);
      }
    };

    /**
     * Cyclic execution during jogging
     * @alias doJogging
     * @memberof API.MOTION
     * @private
     * @param {API.MOTION.JogData} jogData
     * @param {API.MOTION.RobTarget | API.MOTION.JointTarget} targetPosition
     * @param {boolean} once - If true, send jog command only once
     * @returns {undefined |Promise<{}>} - Undefined or reject Promise if fails.
     */
    const doJogging = async function (jogData, targetPosition = null, once = false) {
      jogStop = false;
      clearTimeout(jogTimeout);
      let opMode = await API.CONTROLLER.getOperationMode();
      let ctrlState = await API.CONTROLLER.getControllerState();
      if (ctrlState === API.CONTROLLER.STATE.MotorsOn && opMode === API.CONTROLLER.OPMODE.ManualR) {
        if (targetPosition !== null) {
          if (bJointTarget(targetPosition)) {
            await API.RWS.MOTIONSYSTEM.setRobotPositionJoint(targetPosition);
          } else {
            await API.RWS.MOTIONSYSTEM.setRobotPositionTarget(targetPosition);
          }
        }
        try {
          await API.MOTION.sendJogsinLoop(jogData, once);
        } catch (err) {
          jogStop = true;
          return API.rejectWithStatus('Do jogging failed.', err);
        }
      } else {
        jogStop = true;
        TComponents.Popup_A.warning(
          'Missing conditions to jog',
          `Motors should be on and controller should be in Manual mode`,
        );
        return API.rejectWithStatus(`Missing conditions to jog: CtrlState - ${ctrlState}, OpMode - ${opMode}`);
      }
    };

    /**
     * Send once/loop jog commands
     * @alias sendJogsinLoop
     * @memberof API.MOTION
     * @private
     * @param {API.MOTION.JogData} jogData
     * @param {boolean} once - If true, send jog command only once
     * @returns {undefined |Promise<{}>} - Undefined or reject Promise if fails.
     */
    this.sendJogsinLoop = async function (jogData, once = false) {
      await API.RWS.MOTIONSYSTEM.jog(jogData, ccounter);
      if (once) jogStop = true;
      if (!jogStop) {
        Logger.i(logModule, 'looping jog commands');
        jogTimeout = setTimeout(async () => await this.sendJogsinLoop(jogData, once), 200);
      }
    };

    /**
     * Stops any running jog
     * @alias stopJogging
     * @memberof API.MOTION
     * @returns {undefined |Promise<{}>} - Undefined or reject Promise if fails.
     * @example
     * await API.MOTION.stopJogging()
     */
    this.stopJogging = async function () {
      if (isJogging) {
        clearTimeout(jogTimeout);
        const jogData = [0, 0, 0, 0, 0, 0];
        jogStop = true;
        try {
          await API.RWS.MOTIONSYSTEM.jog(jogData, ccounter);
        } catch (err) {
          return API.rejectWithStatus('Stop jogging failed.', err);
        } finally {
          await API.RWS.releaseMastership('motion');
        }
        isJogging = false;
      }
    };

    /**
     * Gets the current position of the robot
     * @alias getRobotPosition
     * @memberof API.MOTION
     * @returns {Promise<object>} - Object containing current position of the robot
     * @example
     * await API.MOTION.getRobotPosition()
     */
    this.getRobotPosition = async function () {
      try {
        let robTarget = await API.RWS.MOTIONSYSTEM.getRobTarget();
        return robTarget;
      } catch (err) {
        return API.rejectWithStatus('Get robot position failed.', err);
      }
    };

    /**
     * Gets the current tool
     * @alias getTool
     * @memberof API.MOTION
     * @returns {Promise<object>} - Object containing current position of the robot
     * @example
     * await API.MOTION.getTool()
     */
    this.getTool = async function () {
      try {
        const mechUnit = await API.RWS.MOTIONSYSTEM.getMechunit();
        return mechUnit.tool;
      } catch (e) {
        return API.rejectWithStatus('Get tool failed.', e);
      }
    };

    /**
     * Gets the current working object
     * @alias getWobj
     * @memberof API.MOTION
     * @returns {Promise<object>} - Object containing current position of the robot
     * @example
     * await API.MOTION.getWobj()
     */
    this.getWobj = async function () {
      try {
        const mechUnit = await API.RWS.MOTIONSYSTEM.getMechunit();
        return mechUnit.wobj;
      } catch (e) {
        return API.rejectWithStatus('Get wobj failed.', e);
      }
    };

    /**
     * Gets the current coordinate system
     * @alias getCoord
     * @memberof API.MOTION
     * @returns {Promise<string>} - String containing current coordinate system of the robot
     * @example
     * await API.MOTION.getCoord()
     */
    this.getCoord = async function () {
      try {
        const mechUnit = await API.RWS.MOTIONSYSTEM.getMechunit();
        return mechUnit.coords;
      } catch (e) {
        return API.rejectWithStatus('Get coord failed.', e);
      }
    };

    /**
     * Gets the axis number of robot
     * @alias getAxisNumber
     * @memberof API.MOTION
     * @returns {Promise<number>} - Number containing the axis number of robot
     * @example
     * let axisNum = await API.MOTION.getAxisNumber()
     */
    this.getAxisNumber = async function () {
      if (typeof this.axisNumber == 'undefined') {
        const mechUnit = await API.RWS.MOTIONSYSTEM.getMechunit();
        this.axisNumber = parseInt(mechUnit.axes);
      }
      return this.axisNumber;
    };

    /**
     * Sets the active tool to the specified value
     * @alias getTool
     * @memberof API.MOTION
     * @param {string} tool - Name of the tool
     * @returns {Promise<object>} - Object containing current position of the robot
     * @example
     * await API.MOTION.setTool("tool0")
     */
    this.setTool = async function (tool) {
      try {
        await API.RWS.requestMastership('motion');
        await API.RWS.MOTIONSYSTEM.setMechunit({tool});
        await API.RWS.releaseMastership('motion');
      } catch (e) {
        return API.rejectWithStatus('Set tool failed.', e);
      }
    };

    /**
     * Sets the active working object to the specified value
     * @alias getWobj
     * @memberof API.MOTION
     * @param {string} value - Name of the working object
     * @returns {Promise<object>} - Object containing current position of the robot
     * @example
     * await API.MOTION.setWobj("wobj0")
     */
    this.setWobj = async function (value) {
      try {
        await API.RWS.requestMastership('motion');
        await API.RWS.MOTIONSYSTEM.setMechunit({wobj: value});
        await API.RWS.releaseMastership('motion');
      } catch (e) {
        return API.rejectWithStatus('Set wobj failed.', e);
      }
    };

    // TODO: add stopJogging as mouseup event for Align functionality
    /**
     * Perform align task
     * @alias align
     * @memberof API.MOTION
     * @param {number} speedRatio - Align speed ration: [1,100]
     * @param {API.MechUnits} tool wobj coord	- If empty, use active tool | wobj |coord as align tool
     * @returns {undefined |Promise<{}>} - Undefined or reject Promise if fails.
     * @example
     * await API.MOTION.align(10)
     */
    this.align = async function (speedRatio, {tool = '', wobj = '', coords = ''} = {}) {
      try {
        let speed = speedRatio > 100 ? 100 : speedRatio < 2 ? 2 : speedRatio;
        let speedValue = (this.MaxJogAxisSpeed * speed) / 100;
        let jogData = [0, 0, 0, 0, 0, 0];

        // check axis number
        let axisNumber = await this.getAxisNumber();
        if (axisNumber == 4) {
          jogData = [speedValue, speedValue, speedValue, speedValue, 0, 0];
        } else {
          jogData = [speedValue, speedValue, speedValue, speedValue, speedValue, speedValue];
        }

        const jogMode = API.MOTION.JOGMODE.Align;

        isJogging = true;

        await API.MOTION.executeJogging(jogMode, {jogData, tool, wobj, coords});
      } catch (e) {
        isJogging = false;
        Logger.e(logModule, 'perform align task failed');
        throw new Error('perform align task failed');
      }
    };

    // TODO: add stopJogging as mouseup event for GoTo functionality
    /**
     * Perform GOTO task
     * @alias goToPosition
     * @memberof API.MOTION
     * @param {number} speedRatio - Goto speed ration: [1,100]
     * @param {RobTarget | JointTarget} targetPosition - The target location for the GOTO task
     * @param {API.MechUnits} tool wobj coord	- If empty, use active tool | wobj |coord as align tool
     * @returns {undefined |Promise<{}>} - Undefined or reject Promise if fails.
     * @example
     * let variableValue = await API.RAPID.getVariableValue("MainModule","pos1");
     * await API.MOTION.goToPosition(10, variableValue)
     */
    this.goToPosition = async function (speedRatio, targetPosition, {tool = '', wobj = '', coords = ''} = {}) {
      try {
        if (!targetPosition) return;
        if (!bRobotTarget(targetPosition) && !bJointTarget(targetPosition)) return;

        const speed = speedRatio > 100 ? 100 : speedRatio < 2 ? 2 : speedRatio;
        let speedValue = (this.MaxJogAxisSpeed * speed) / 100;
        let jogData = [0, 0, 0, 0, 0, 0];

        // check axis number
        let axisNumber = await this.getAxisNumber();
        if (axisNumber == 4) {
          jogData = [speedValue, speedValue, speedValue, speedValue, 0, 0];
        } else {
          jogData = [speedValue, speedValue, speedValue, speedValue, speedValue, speedValue];
        }

        const jogMode = API.MOTION.JOGMODE.GoToPos;

        isJogging = true;

        await API.MOTION.executeJogging(jogMode, {jogData, targetPosition, tool, wobj, coords});
      } catch (e) {
        isJogging = false;
        Logger.e(logModule, 'perform goto task failed');
        throw new Error('perform goto task failed');
      }
    };

    /**
     * Teach current robot position
     * @alias teachPosition
     * @memberof API.MOTION
     * @param {API.MOTION.POSITIONTYPES} type Position type
     * @param {string} tool The tool used to teach position
     * @param {string} wobj The wobj used to teach position
     * @param {string} coords The coords used to teach position
     * @param {string} mechunit The mechunit used to teach position
     * @returns {undefined | Promise<{RobTarget}> | Promise<{JointTarget}>} - The teached position
     * @example
     * let position = await API.MOTION.teachPosition(API.MOTION.POSITIONTYPES.robtarget);
     */
    this.teachPosition = async function (type, {tool = '', wobj = '', coords = '', mechunit = 'ROB_1'} = {}) {
      let currentPosition;
      try {
        if (type == this.POSITIONTYPES.robtarget) {
          currentPosition = await API.RWS.MOTIONSYSTEM.getRobTarget(tool, wobj, coords, mechunit);
        } else if (type == this.POSITIONTYPES.jointtarget) {
          currentPosition = await API.RWS.MOTIONSYSTEM.getJointTarget(mechunit);
        }
        return currentPosition;
      } catch (error) {
        Logger.e(logModule, 'teach position failed');
        throw new Error('teach position failed');
      }
    };

    const bJointTarget = function (position) {
      return position.robax && position.extax;
    };

    const bRobotTarget = function (position) {
      return position.trans && position.rot && position.robconf && position.extax;
    };
  })();

  mot.constructedMotion = true;
};

if (typeof API.constructedMotion === 'undefined') {
  factoryApiMotion(API);
}

export default API;
