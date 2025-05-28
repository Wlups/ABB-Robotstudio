import API from './ecosystem-base.js';
import {Logger} from './../function/log-helper.js';

const factoryApiRws = function (rws) {
  /**
   * Extension of RWS not yet available at the omnicore.rws SDK
   * @alias API.RWS
   * @namespace
   */
  rws.RWS = new (function () {
    const logModule = 'ecosystem-rws';

    this.MASTERSHIP = {
      Nomaster: 'nomaster',
      Remote: 'remote',
      Local: 'local',
      Internal: 'internal',
    };

    this.LEADTHROUGHSTATUS = {
      Inactive: 'Inactive',
      Active: 'Active',
    };

    function parseJSON(json) {
      try {
        return JSON.parse(json);
      } catch (error) {
        return undefined;
      }
    }

    function rwsPost(url, body, error_msg) {
      return RWS.Network.post(url, body)
        .then((ret) => {
          return ret && ret.response ? Promise.resolve(JSON.parse(ret.response)) : Promise.resolve();
        })
        .catch((err) => {
          return API.rejectWithStatus(error_msg, err);
        });
    }

    /**
     * @typedef {'edit' | 'motion' } MastershipType
     * @memberof API.RWS
     */

    /**
     * @alias requestMastership
     * @memberof API.RWS
     * @param {MastershipType} type Mastership can be 'edit' and 'motion'
     * @returns {Promise<any>}
     * @example
     * API.RWS.requestMastership('edit')
     */
    const requestMastership = function (type = 'edit') {
      if (type === 'edit')
        return RWS.Mastership.request()
          .then(() => Promise.resolve())
          .catch((err) => API.rejectWithStatus('Could not get Mastership.', err));
      else if (type != '') type = type + '/';
      return rwsPost(`/rw/mastership/${type}request`, '', `Request ${type} mastership failed.`);
    };
    this.requestMastership = requestMastership;

    /**
     * @alias releaseMastership
     * @memberof API.RWS
     * @param {MastershipType} type Mastership can be 'edit' and 'motion'
     * @returns {Promise<any>}
     * @example
     * API.RWS.releaseMastership('edit')
     */
    const releaseMastership = function (type = 'edit') {
      if (type === 'edit')
        return RWS.Mastership.release()
          .then(() => Promise.resolve())
          .catch((err) => {
            RWS.writeDebug(`Could not release Mastership. >>> ${err.message}`);
            return Promise.resolve();
          });
      else if (type != '') type = type + '/';
      return rwsPost(`/rw/mastership/${type}release`, '', `Release ${type} mastership failed.`);
    };
    this.releaseMastership = releaseMastership;

    /**
     * @alias executeWithMastership
     * @memberof API.RWS
     * @param {any} args
     * @param {Function} func
     * @param {MastershipType} type
     * @returns {Promise<any>}
     */
    const executeWithMastership = async function (func, args, type = 'edit') {
      let hasMastership = false;
      let error = null;

      return requestMastership(type)
        .then(() => {
          hasMastership = true;
          func.apply(this, args);
        })
        .then(() => releaseMastership(type))
        .then(() => {
          if (error !== null) return console.error('Failed to set value.', error);
          return Promise.resolve();
        })
        .catch((err) => {
          if (hasMastership === true) {
            error = err;
            return Promise.resolve();
          }
          return API.rejectWithStatus('Failed to get Mastership.', err);
        });
    };
    /**
     * @alias getMastershipState
     * @memberof API.RWS
     * @param {string} type - Mastership can be 'edit' and 'motion'
     * @returns {Promise<string>}
     */
    this.getMastershipState = async function (type = 'edit') {
      try {
        let res = await RWS.Network.get(`/rw/mastership/${type}`);
        let obj = parseJSON(res.responseText);
        return obj['state'][0]['mastership'];
      } catch (err) {
        console.error(err);
      }
    };

    /**
     * @alias checkIfHeldMastership
     * @memberof API.RWS
     * @param {string} type - Mastership can be 'edit' and 'motion'
     * @returns {Promise<string>}
     * @example
     * // check if holding edit mastership
     * await API.RWS.checkIfHeldMastership()
     */
    this.checkIfHeldMastership = async function (type = 'edit') {
      try {
        let res = await RWS.Network.get(`/rw/mastership/${type}`);
        let obj = parseJSON(res.responseText);
        let state = obj['state'][0];
        return state && state.mastershipheldbyme && state.mastershipheldbyme == 'TRUE';
      } catch (err) {
        console.error(err);
      }
    };

    function parseResponse(res) {
      let items = [];
      let obj = parseJSON(res.responseText);
      if (typeof obj === 'undefined') return Promise.reject('Could not parse JSON.');

      let resources = obj._embedded.resources;
      resources.forEach((item) => {
        let it = {};
        it.name = item._title;
        for (let prop in item) {
          if (prop.indexOf('_') === -1) {
            it[prop] = item[prop];
          }
        }
        items.push(it);
      });
      return items;
    }

    /**
     * The API.RWS.MOTIONSYSTEM provides some motion related interfaces that has not been supported by Omnicore SDK.
     * @namespace MOTIONSYSTEM
     * @memberof API.RWS
     */
    this.MOTIONSYSTEM = new (function () {
      /**
       *
       * @typedef Mechunits
       * @prop {string} activationAllowed
       * @prop {string} driveModule
       * @prop {string} mode // 'Activated', ...
       * @prop {string} name
       * @memberof API.RWS.MOTIONSYSTEM
       */

      /**
       *
       * @typedef Mechunit
       * @prop {string} axes
       * @prop {string} axesTotal
       * @prop {string} coords
       * @prop {string} hasIntegratedUnit
       * @prop {string} isIntegratedUnit
       * @prop {string} jogMode
       * @prop {string} mode
       * @prop {string} payload
       * @prop {string} status
       * @prop {string} task
       * @prop {string} tool
       * @prop {string} totalPayload
       * @prop {string} type
       * @prop {string} wobj
       * @prop {string} name
       * @memberof API.RWS.MOTIONSYSTEM
       */

      /**
       * Get all mechanical units
       * @alias getMechunits
       * @memberof API.RWS.MOTIONSYSTEM
       * @returns {Promise<Mechunits[]>}
       * @example
       * const mechunits = await API.RWS.MOTIONSYSTEM.getMechunits();
       * console.log(mechunits); // Outputs an array of mechanical units
       */
      this.getMechunits = async function () {
        try {
          let res = await RWS.Network.get('/rw/motionsystem/mechunits');
          let items = [];
          let obj = parseJSON(res.responseText);
          if (typeof obj === 'undefined') return Promise.reject('Could not parse JSON.');

          let resources = obj._embedded.resources;
          resources.forEach((item) => {
            let it = {};
            it.name = item._title;
            for (let prop in item) {
              if (prop.indexOf('_') === -1) {
                it[prop] = item[prop];
              }
            }
            items.push(it);
          });
          return items;
        } catch (err) {
          return API.rejectWithStatus('Could not get mechunits.', err);
        }
      };

      /**
       * Get details of a specific mechanical unit
       * @alias getMechunit
       * @memberof API.RWS.MOTIONSYSTEM
       * @param {string} name Mechunit's name, e.g., 'ROB_1'
       * @returns {Promise<Mechunit>}
       * @example
       * const mechunit = await API.RWS.MOTIONSYSTEM.getMechunit('ROB_1');
       * console.log(mechunit); // Outputs details of the specified mechanical unit
       */
      this.getMechunit = async function (name = 'ROB_1') {
        try {
          let res = await RWS.Network.get(`/rw/motionsystem/mechunits/${name}?continue-on-err=1`);
          let obj = parseJSON(res.responseText);

          let mechunit = {};

          mechunit.axes = obj.state[0].axes;
          mechunit.axesTotal = obj.state[0]['axes-total'];
          mechunit.coords = obj.state[0]['coord-system'];
          mechunit.hasIntegratedUnit = obj.state[0]['has-integrated-unit'];
          mechunit.isIntegratedUnit = obj.state[0]['is-integrated-unit'];
          mechunit.jogMode = obj.state[0]['jog-mode'];
          mechunit.mode = obj.state[0]['mode'];
          mechunit.payload = obj.state[0]['payload-name'];
          mechunit.status = obj.state[0]['status'];
          mechunit.task = obj.state[0]['task-name'];
          mechunit.tool = obj.state[0]['tool-name'];
          mechunit.totalPayload = obj.state[0]['total-payload-name'];
          mechunit.type = obj.state[0]['type'];
          mechunit.wobj = obj.state[0]['wobj-name'];
          mechunit.name = obj.state[0]._title;

          return mechunit;
        } catch (err) {
          return API.rejectWithStatus('Could not get mechunit.', err);
        }
      };

      /**
       * @typedef SetMechunitProps
       * @prop {string} [name]
       * @prop {string} [tool]
       * @prop {string} [wobj]
       * @prop {string} [coords]
       * @prop {string} [jogMode]
       * @prop {string} [mode]
       * @prop {string} [payload]
       * @prop {string} [totalPayload]
       * @memberof API.RWS.MOTIONSYSTEM
       */

      /**
       * Set properties of a mechanical unit
       * @alias setMechunit
       * @memberof API.RWS.MOTIONSYSTEM
       * @param {SetMechunitProps} props
       * @returns {Promise<any>}
       * @example
       * await API.RWS.MOTIONSYSTEM.setMechunit({
       *   name: 'ROB_1',
       *   tool: 'Tool1',
       *   wobj: 'WObj1',
       * });
       */
      this.setMechunit = async function ({
        name = 'ROB_1',
        tool = '',
        wobj = '',
        coords = '',
        payload = '',
        totalPayload = '',
        mode = '',
        jogMode = '',
      } = {}) {
        let url = `/rw/motionsystem/mechunits/${name}?continue-on-err=1`;
        let body = '';
        body += tool ? 'tool=' + tool : '';
        body += wobj ? (body ? '&' : '') + 'wobj=' + wobj : '';
        body += payload ? (body ? '&' : '') + 'payload=' + payload : '';
        body += totalPayload ? (body ? '&' : '') + 'total-payload=' + totalPayload : '';
        body += mode ? (body ? '&' : '') + 'mode=' + mode : '';
        body += jogMode ? (body ? '&' : '') + 'jog-mode=' + jogMode : '';
        body += coords ? (body ? '&' : '') + 'coord-system=' + coords : '';

        let res = await rwsPost(url, body, 'Failed to set mechunit.');
        return res;
      };

      /**
       * Set robot position target
       * @alias setRobotPositionTarget
       * @memberof API.RWS.MOTIONSYSTEM
       * @param {API.MOTION.RobTarget} r
       * @returns {Promise<any>}
       * @example
       * const robTarget = {
       *   trans: { x: 100, y: 200, z: 300 },
       *   rot: { q1: 1, q2: 0, q3: 0, q4: 0 },
       *   robconf: { cf1: 0, cf4: 0, cf6: 0, cfx: 0 },
       *   extax: { eax_a: 0, eax_b: 0, eax_c: 0, eax_d: 0, eax_e: 0, eax_f: 0 },
       * };
       * await API.RWS.MOTIONSYSTEM.setRobotPositionTarget(robTarget);
       */
      this.setRobotPositionTarget = function (r) {
        if (r.trans === undefined || r.rot === undefined || r.robconf === undefined)
          return Promise.reject("Parameter 'r' is not a robtarget.");

        let url = `/rw/motionsystem/position-target`;
        let body = `pos-x=${r.trans.x}&pos-y=${r.trans.y}&pos-z=${r.trans.z}&orient-q1=${r.rot.q1}&orient-q2=${
          r.rot.q2
        }&orient-q3=${r.rot.q3}&orient-q4=${r.rot.q4}&config-j1=${r.robconf.cf1}&config-j4=${r.robconf.cf4}&config-j6=${
          r.robconf.cf6
        }&config-jx=${r.robconf.cfx}&extjoint-1=${r.extax ? r.extax.eax_a : 9e9}&extjoint-2=${
          r.extax ? r.extax.eax_b : 9e9
        }&extjoint-3=${r.extax ? r.extax.eax_c : 9e9}&extjoint-4=${r.extax ? r.extax.eax_d : 9e9}&extjoint-5=${
          r.extax ? r.extax.eax_e : 9e9
        }&extjoint-6=${r.extax ? r.extax.eax_f : 9e9}`;

        return rwsPost(url, body, 'Failed to set robot position.');
      };

      /**
       * Allows the robot to GoTo the position defined in jointtarget parameter
       * @alias setRobotPositionJoint
       * @memberof API.RWS.MOTIONSYSTEM
       * @param {API.MOTION.JointTarget} j
       * @returns {Promise<any>}
       * @example
       * const jointTarget = {
       *   robax: { rax_1: 0, rax_2: 0, rax_3: 0, rax_4: 0, rax_5: 0, rax_6: 0 },
       *   extax: { eax_a: 0, eax_b: 0, eax_c: 0, eax_d: 0, eax_e: 0, eax_f: 0 },
       * };
       * await API.RWS.MOTIONSYSTEM.setRobotPositionJoint(jointTarget);
       */
      this.setRobotPositionJoint = function (j) {
        if (j.robax === undefined) return Promise.reject("Parameter 'j' is not a jointtarget.");

        let url = `/rw/motionsystem/position-joint`;
        let body = `robjoint=${j.robax.rax_1},${j.robax.rax_2},${j.robax.rax_3},${j.robax.rax_4},${j.robax.rax_5},${
          j.robax.rax_6
        }&extjoint=${j.extax ? j.extax.eax_a : 9e9},${j.extax ? j.extax.eax_b : 9e9},${j.extax ? j.extax.eax_c : 9e9},${
          j.extax ? j.extax.eax_d : 9e9
        },${j.extax ? j.extax.eax_e : 9e9},${j.extax ? j.extax.eax_f : 9e9}`;

        return rwsPost(url, body, 'Failed to set joint position.');
      };

      /**
       * Perform jogging. This RWS has to be applied cyclically during jogging
       * @alias jog
       * @memberof API.RWS.MOTIONSYSTEM
       * @param {API.MOTION.JogData} jogdata Axis jogging speed
       * @param {number} ccount Counter value. Shall be obtained by {@link getChangeCount} before starting jogging
       * @returns {Promise<any>}
       * @example
       * const jogData = [10, 0, 0, 0, 0, 0]; // Jogging along axis 1
       * const changeCount = await API.RWS.MOTIONSYSTEM.getChangeCount();
       * await API.RWS.MOTIONSYSTEM.jog(jogData, changeCount);
       */
      this.jog = async function (jogdata, ccount) {
        let url = `/rw/motionsystem/jog`;
        let body = `axis1=${jogdata[0]}&axis2=${jogdata[1]}&axis3=${jogdata[2]}&axis4=${jogdata[3]}&axis5=${jogdata[4]}&axis6=${jogdata[5]}&ccount=${ccount}`;

        return rwsPost(url, body, 'Failed to jog.');
      };
      /**
       * Get the change count of motion system
       * @alias getChangeCount
       * @memberof API.RWS.MOTIONSYSTEM
       * @returns {Promise<number>}
       * @example
       * const changeCount = await API.RWS.MOTIONSYSTEM.getChangeCount();
       * console.log(`Change count: ${changeCount}`);
       */
      this.getChangeCount = async function () {
        try {
          let res = await RWS.Network.get(`/rw/motionsystem?resource=change-count`);
          let obj = parseJSON(res.responseText);
          return obj['state'][0]['change-count'];
        } catch (err) {
          return API.rejectWithStatus('Could not get change counter.', err);
        }
      };

      this.parseRobTarget = function (robTarget) {
        let rt = {trans: {}, rot: {}, robconf: {}, extax: {}};
        rt.trans.x = parseFloat(robTarget['x']);
        rt.trans.y = parseFloat(robTarget['y']);
        rt.trans.z = parseFloat(robTarget['z']);
        rt.rot.q1 = parseFloat(robTarget['q1']);
        rt.rot.q2 = parseFloat(robTarget['q2']);
        rt.rot.q3 = parseFloat(robTarget['q3']);
        rt.rot.q4 = parseFloat(robTarget['q4']);
        rt.robconf.cf1 = parseFloat(robTarget['cf1']);
        rt.robconf.cf4 = parseFloat(robTarget['cf4']);
        rt.robconf.cf6 = parseFloat(robTarget['cf6']);
        rt.robconf.cfx = parseFloat(robTarget['cfx']);
        rt.extax.eax_a = parseFloat(robTarget['eax_a']);
        rt.extax.eax_b = parseFloat(robTarget['eax_b']);
        rt.extax.eax_c = parseFloat(robTarget['eax_c']);
        rt.extax.eax_d = parseFloat(robTarget['eax_d']);
        rt.extax.eax_e = parseFloat(robTarget['eax_e']);
        rt.extax.eax_f = parseFloat(robTarget['eax_f']);

        return rt;
      };

      /**
       * @typedef RobTargetProps
       * @param {string} [tool]
       * @param {string} [wobj]
       * @param {string} [coords]
       * @param {string} [mechunit]
       * @memberof API.RWS.MOTIONSYSTEM
       */

      /**
       * Get the current robot position
       * @alias getRobTarget
       * @memberof API.RWS.MOTIONSYSTEM
       * @param {RobTargetProps} props
       * @returns {Promise<API.MOTION.RobTarget>}
       * @example
       * const robTarget = await API.RWS.MOTIONSYSTEM.getRobTarget('Tool1', 'WObj1');
       */
      this.getRobTarget = async function (tool = '', wobj = '', coords = '', mechunit = 'ROB_1') {
        let params = '';
        params += tool ? '?tool=' + tool : '';
        params += wobj ? (params ? '&' : '?') + 'wobj=' + wobj : '';
        params += coords ? (params ? '&' : '?') + 'coordinate=' + coords : '';

        let res = await RWS.Network.get(`/rw/motionsystem/mechunits/${mechunit}/robtarget${params}`);

        let obj = parseJSON(res.responseText);

        let rt = this.parseRobTarget(obj['state'][0]);

        return rt;
      };

      this.parseJointTarget = function (jointTarget, toDegrees = false) {
        let jt = {robax: {}, extax: {}};
        let factor = 180 / Math.PI;
        jt.robax.rax_1 = toDegrees ? parseFloat(jointTarget['rax_1']) * factor : parseFloat(jointTarget['rax_1']);
        jt.robax.rax_2 = toDegrees ? parseFloat(jointTarget['rax_2']) * factor : parseFloat(jointTarget['rax_2']);
        jt.robax.rax_3 = toDegrees ? parseFloat(jointTarget['rax_3']) * factor : parseFloat(jointTarget['rax_3']);
        jt.robax.rax_4 = toDegrees ? parseFloat(jointTarget['rax_4']) * factor : parseFloat(jointTarget['rax_4']);
        jt.robax.rax_5 = toDegrees ? parseFloat(jointTarget['rax_5']) * factor : parseFloat(jointTarget['rax_5']);
        jt.robax.rax_6 = toDegrees ? parseFloat(jointTarget['rax_6']) * factor : parseFloat(jointTarget['rax_6']);
        jt.extax.eax_a = parseFloat(jointTarget['eax_a']);
        jt.extax.eax_b = parseFloat(jointTarget['eax_b']);
        jt.extax.eax_c = parseFloat(jointTarget['eax_c']);
        jt.extax.eax_d = parseFloat(jointTarget['eax_d']);
        jt.extax.eax_e = parseFloat(jointTarget['eax_e']);
        jt.extax.eax_f = parseFloat(jointTarget['eax_f']);
        return jt;
      };

      /**
       * Get the current joints position
       * @alias getJointTarget
       * @memberof API.RWS.MOTIONSYSTEM
       * @param {string} mechunit
       * @returns {Promise<API.MOTION.JointTarget>}
       * @example
       * const jointTarget = await API.RWS.MOTIONSYSTEM.getJointTarget('ROB_1');
       * console.log(jointTarget); // Outputs the current joint positions
       */
      this.getJointTarget = async function (mechunit = 'ROB_1') {
        let res = await RWS.Network.get(`/rw/motionsystem/mechunits/${mechunit}/jointtarget`);
        let obj = parseJSON(res.responseText);

        let jt = this.parseJointTarget(obj['state'][0], false);

        return jt;
      };

      /**
       *
       * @typedef JointsSolutionProps
       * @prop {string} [mechUnit]
       * @prop {API.MOTION.RobTarget} robTarget
       * @prop {API.MOTION.ToolData} [toolData]
       */

      /**
       * Get all joint solutions
       * @alias getAllJointsSolution
       * @memberof API.RWS.MOTIONSYSTEM
       * @param {JointsSolutionProps} props
       * @returns {Promise<any>}
       */
      this.getAllJointsSolution = async function ({mechUnit = 'ROB_1', robTarget, toolData}) {
        /*
         * {
         *   curr_position*	string
         *   [x,y,z]
         *
         *   curr_ext_joints*	string
         *   [j1,j2,j3,j4,j5,j6]
         *
         *   tool_frame_position*	string
         *   [x, y, z]
         *
         *   curr_orientation*	string
         *   [u0, u1, u2, u3]
         *
         *   tool_frame_orientation*	string
         *   [u0, u1, u2, u3]
         *
         *   robot_fixed_object*	string
         *   TRUE|FALSE
         *
         *   robot_configuration*	string
         *   [quarter_rev_j1, quarter_rev_j4, quarter_rev_j6, quarter_rev_jx]
         *
         *   }
         */
        const r = robTarget;
        const t = toolData
          ? toolData
          : {robhold: true, tframe: {trans: {x: 0, y: 0, z: 0}, rot: {q1: 1, q2: 0, q3: 0, q4: 0}}};
        const toMeters = 0.001;

        if (r.trans === undefined || r.rot === undefined || r.robconf === undefined)
          return Promise.reject("Parameter 'robTarget' is not a robtarget.");

        let url = `/rw/motionsystem/mechunits/${mechUnit}/all-joints-solution`;
        let body = `curr_position=[${r.trans.x * toMeters},${r.trans.y * toMeters},${
          r.trans.z * toMeters
        }]&curr_ext_joints=[${r.extax ? r.extax.eax_a : 9e9},${r.extax ? r.extax.eax_b : 9e9},${
          r.extax ? r.extax.eax_c : 9e9
        },${r.extax ? r.extax.eax_d : 9e9},${r.extax ? r.extax.eax_e : 9e9},${
          r.extax ? r.extax.eax_f : 9e9
        }]&tool_frame_position=[${t.tframe.trans.x * toMeters},${t.tframe.trans.y * toMeters},${
          t.tframe.trans.z * toMeters
        }]&curr_orientation=[${r.rot.q1},${r.rot.q2},${r.rot.q3},${r.rot.q4}]&tool_frame_orientation=[${
          t.tframe.rot.q1
        },${t.tframe.rot.q2},${t.tframe.rot.q3},${t.tframe.rot.q4}]&robot_fixed_object=${
          t.robhold ? 'TRUE' : 'FALSE'
        }&robot_configuration=[${r.robconf.cf1},${r.robconf.cf4},${r.robconf.cf6},${r.robconf.cfx}]`;

        let res = await rwsPost(url, body, 'Failed to get Joints from Cartesian');

        let toDegree = 180 / Math.PI;
        let jtArray = res.state.map((jointData) => {
          let jt = {robax: {}, extax: {}, robconf: {}};

          jt.robax.rax_1 = parseFloat(jointData['robotjoint1']) * toDegree;
          jt.robax.rax_2 = parseFloat(jointData['robotjoint2']) * toDegree;
          jt.robax.rax_3 = parseFloat(jointData['robotjoint3']) * toDegree;
          jt.robax.rax_4 = parseFloat(jointData['robotjoint4']) * toDegree;
          jt.robax.rax_5 = parseFloat(jointData['robotjoint5']) * toDegree;
          jt.robax.rax_6 = parseFloat(jointData['robotjoint6']) * toDegree;
          jt.extax.eax_a = parseFloat(jointData['extjoint1']);
          jt.extax.eax_b = parseFloat(jointData['extjoint2']);
          jt.extax.eax_c = parseFloat(jointData['extjoint3']);
          jt.extax.eax_d = parseFloat(jointData['extjoint4']);
          jt.extax.eax_e = parseFloat(jointData['extjoint5']);
          jt.extax.eax_f = parseFloat(jointData['extjoint6']);
          jt.robconf.cf1 = parseInt(jointData['quarter_rev_j11']);
          jt.robconf.cf4 = parseInt(jointData['quarter_rev_j4']);
          jt.robconf.cf6 = parseInt(jointData['quarter_rev_j6']);
          jt.robconf.cfx = parseInt(jointData['quarter_rev_jx']);

          return jt;
        });

        return jtArray;
      };

      /**
       *
       * @typedef JontsFromCartesianProps
       * @prop {string} [mechUnit]
       * @prop {API.MOTION.RobTarget} robTarget
       * @prop {API.MOTION.ToolData} [toolData]
       * @prop {API.MOTION.JointTarget} jointTarget
       */

      /**
       * Get all joint solutions
       * @alias getJointsFromCartesian
       * @memberof API.RWS.MOTIONSYSTEM
       * @param {JontsFromCartesianProps} props
       * @returns {Promise<any>}
       */
      this.getJointsFromCartesian = async function ({mechUnit = 'ROB_1', robTarget, toolData, jointTarget}) {
        /*
         * {
         *    curr_position*	string
         *    [x,y,z]
         *
         *    curr_ext_joints*	string
         *    [j1,j2,j3,j4,j5,j6]
         *
         *    tool_frame_position*	string
         *    [x, y, z]
         *
         *    curr_orientation*	string
         *    [u0, u1, u2, u3]
         *
         *    tool_frame_orientation*	string
         *    [u0, u1, u2, u3]
         *
         *    old_rob_joints*	string
         *    [j1,j2,j3,j4,j5,j6]
         *
         *    old_ext_joints*	string
         *    [j1,j2,j3,j4,j5,j6]
         *
         *    robot_fixed_object*	string
         *    TRUE|FALSE
         *
         *    robot_configuration*	string
         *    [quarter_rev_j1, quarter_rev_j4, quarter_rev_j6, quarter_rev_jx]
         *
         *    elog_at_error*	string
         *    TRUE|FALSE
         *
         *  }
         */
        const r = robTarget;
        const j = jointTarget;
        const t = toolData
          ? toolData
          : {robhold: true, tframe: {trans: {x: 0, y: 0, z: 0}, rot: {q1: 1, q2: 0, q3: 0, q4: 0}}};

        const toRadians = Math.PI / 180;

        const toMeters = 0.001;

        if (r.trans === undefined || r.rot === undefined || r.robconf === undefined || j.robax === undefined)
          return Promise.reject("Parameter 'robTarget' is not a robtarget.");

        let url = `/rw/motionsystem/mechunits/${mechUnit}/joints-from-cartesian`;
        let body = `curr_position=[${r.trans.x * toMeters},${r.trans.y * toMeters},${
          r.trans.z * toMeters
        }]&curr_ext_joints=[${r.extax ? r.extax.eax_a : 9e9},${r.extax ? r.extax.eax_b : 9e9},${
          r.extax ? r.extax.eax_c : 9e9
        },${r.extax ? r.extax.eax_d : 9e9},${r.extax ? r.extax.eax_e : 9e9},${
          r.extax ? r.extax.eax_f : 9e9
        }]&tool_frame_position=[${t.tframe.trans.x},${t.tframe.trans.y},${t.tframe.trans.z}]&curr_orientation=[${
          r.rot.q1
        },${r.rot.q2},${r.rot.q3},${r.rot.q4}]&tool_frame_orientation=[${t.tframe.rot.q1},${t.tframe.rot.q2},${
          t.tframe.rot.q3
        },${t.tframe.rot.q4}]&old_rob_joints=[${j.robax.rax_1 * toRadians},${j.robax.rax_2 * toRadians},${
          j.robax.rax_3 * toRadians
        },${j.robax.rax_4 * toRadians},${j.robax.rax_5 * toRadians},${j.robax.rax_6 * toRadians}]&old_ext_joints=[${
          j.extax ? j.extax.eax_a : 9e9
        },${j.extax ? j.extax.eax_b : 9e9},${j.extax ? j.extax.eax_c : 9e9},${j.extax ? j.extax.eax_d : 9e9},${
          j.extax ? j.extax.eax_e : 9e9
        },${j.extax ? j.extax.eax_f : 9e9}]&robot_fixed_object=${t.robhold ? 'TRUE' : 'FALSE'}&robot_configuration=[${
          r.robconf.cf1
        },${r.robconf.cf4},${r.robconf.cf6},${r.robconf.cfx}]&elog_at_error=TRUE`;

        let res = await rwsPost(url, body, 'Failed to get Joints from Cartesian');

        let jt = {robax: {}, extax: {}};
        let toDegree = 180 / Math.PI;

        jt.robax.rax_1 = parseFloat(res.state[0]['robotjoint1']) * toDegree;
        jt.robax.rax_2 = parseFloat(res.state[0]['robotjoint2']) * toDegree;
        jt.robax.rax_3 = parseFloat(res.state[0]['robotjoint3']) * toDegree;
        jt.robax.rax_4 = parseFloat(res.state[0]['robotjoint4']) * toDegree;
        jt.robax.rax_5 = parseFloat(res.state[0]['robotjoint5']) * toDegree;
        jt.robax.rax_6 = parseFloat(res.state[0]['robotjoint6']) * toDegree;
        jt.extax.eax_a = parseFloat(res.state[0]['extjoint1']);
        jt.extax.eax_b = parseFloat(res.state[0]['extjoint2']);
        jt.extax.eax_c = parseFloat(res.state[0]['extjoint3']);
        jt.extax.eax_d = parseFloat(res.state[0]['extjoint4']);
        jt.extax.eax_e = parseFloat(res.state[0]['extjoint5']);
        jt.extax.eax_f = parseFloat(res.state[0]['extjoint6']);
        return jt;
      };

      /**
       * Get lead-through status
       * @alias getLeadThroughStatus
       * @memberof API.RWS.MOTIONSYSTEM
       * @param {string} mechunit
       * @returns {Promise<any>}
       * @example
       * const status = await API.RWS.MOTIONSYSTEM.getLeadThroughStatus('ROB_1');
       * console.log(`Lead-through status: ${status}`);
       */
      this.getLeadThroughStatus = async function (mechunit = 'ROB_1') {
        try {
          let ltRes = await RWS.Network.get(`/rw/motionsystem/mechunits/${mechunit}/lead-through`);
          let obj = parseJSON(ltRes.responseText);
          return obj['state'][0]['status'];
        } catch (e) {
          Logger.e(logModule, 'Get leadthrough status failed');
          return API.rejectWithStatus('Get leadthrough status failed.', e);
        }
      };
      /**
       * Set lead-through status
       * @alias setLeadThroughStatus
       * @memberof API.RWS.MOTIONSYSTEM
       * @param {string} type API.RWS.LEADTHROUGHSTATUS.Inactive | API.RWS.LEADTHROUGHSTATUS.Active
       * @param {string} disableAutoLoadCompensation Active if using precision mode. Supported from RW 7.6.
       * @param {string} mechunit
       * @returns {Promise<any>}
       * @example
       * await API.RWS.MOTIONSYSTEM.setLeadThroughStatus(
       *   API.RWS.LEADTHROUGHSTATUS.Active,
       *   'inactive',
       *   'ROB_1'
       * );
       * console.log('Lead-through status set successfully.');
       */
      this.setLeadThroughStatus = async function (type, disableAutoLoadCompensation = 'inactive', mechunit = 'ROB_1') {
        let data = 'status=' + type;
        let systemInfo = await API.RWS.CONTROLLER.getSystemInfo();
        if (parseInt(systemInfo['major']) == 7 && parseInt(systemInfo['minor']) >= 6) {
          data += '&disableautoloadcompensation=' + disableAutoLoadCompensation;
        }
        try {
          await RWS.Network.post('/rw/motionsystem/mechunits/' + mechunit + '/lead-through', data);
        } catch (e) {
          Logger.e(logModule, 'Set leadthrough status failed');
          return API.rejectWithStatus('Set leadthrough status failed.', e);
        }
      };
    })();

    /**
     * The API.RWS.RAPID provides some RAPID related interfaces that has not been supported by Omnicore SDK.
     * @namespace RAPID
     * @memberof API.RWS
     */
    this.RAPID = new (function () {
      /**
       * Load a module from the controller's HOME filesystem to RAPID
       * @alias loadModule
       * @memberof API.RWS.RAPID
       * @param {string} path Path to the module file in the HOME directory (including the file extension).
       * @param {boolean} [replace] If true, it will replace an existing module in RAPID with the same name.
       * @param {string} [taskName] Task's name.
       * @returns {Promise<any>}
       * @example
       * let url = `${this.path}/${this.name}${this.extension}`;
       * await API.RWS.RAPID.loadModule(url, true, 'T_ROB1');
       */
      this.loadModule = async function (path, replace = false, taskName = 'T_ROB1') {
        const f = async function () {
          return await RWS.Network.post(
            `/rw/rapid/tasks/${taskName}/loadmod?mastership=implicit`,
            'modulepath=' + path + '&replace=' + replace,
          );
        };
        return await executeWithMastership(f);
      };

      /**
       * Unload a RAPID module
       * @alias unloadModule
       * @memberof API.RWS.RAPID
       * @param {string} moduleName Module's name.
       * @param {string} [taskName] Task's name.
       * @returns {Promise<any>}
       * @example
       * await API.RWS.RAPID.unloadModule('MyModule', 'T_ROB1');
       */
      this.unloadModule = async function (moduleName, taskName = 'T_ROB1') {
        const f = function () {
          return RWS.Network.post(`/rw/rapid/tasks/${taskName}/unloadmod?mastership=implicit`, 'module=' + moduleName);
        };
        return await executeWithMastership(f);
      };

      /**
       * Get a RAPID module text
       * @alias getModuleText
       * @memberof API.RWS.RAPID
       * @param {*} moduleName Module's name
       * @param {*} taskName Task's name
       * @returns {Promise<any>} object containing the following structure
       * {
       *  change-count,
       *  module-length,
       *  module-text?,
       *  file-path?,
       *  _title,
       *  _type,
       * }
       * @example
       * const moduleText = await API.RWS.RAPID.getModuleText('MyModule', 'T_ROB1');
       */
      this.getModuleText = async function (moduleName, taskName = 'T_ROB1') {
        let res = await RWS.Network.get(`/rw/rapid/tasks/${taskName}/modules/${moduleName}/text`);
        var fixedResponse = res.responseText.replace(/""(.*?)""/g, '"$1"');
        let obj = parseJSON(fixedResponse);

        if (typeof obj === 'undefined') return Promise.reject('Could not parse JSON.');
        if (!obj.state[0]) return Promise.reject('Failed to get module text.');

        return obj.state[0];
      };

      /**
       * Set the content of a RAPID module
       * @alias setModuleText
       * @memberof API.RWS.RAPID
       * @param {string} moduleName Module's name.
       * @param {string} text The new content for the module.
       * @param {string} [taskName] Task's name.
       * @returns {Promise<any>}
       * @example
       * await API.RWS.RAPID.setModuleText("Module1",`MODULE Module1\r\nPROC proc1()\r\nTPWrite "123";\r\nENDPROC\r\nENDMODULE`), 'T_ROB1');
       */
      this.setModuleText = async function (moduleName, text, taskName = 'T_ROB1') {
        const url = `/rw/rapid/tasks/${taskName}/modules/${moduleName}/text`;
        const body = `text=${encodeURIComponent(text)}`;
        return await rwsPost(url, body, `Failed to set content of ${taskName}:${moduleName}.`);
      };

      /**
       * Set the content of a RAPID module within a specific range
       * @alias setModuleTextInRange
       * @memberof API.RWS.RAPID
       * @param {string} moduleName Module's name.
       * @param {string} text The new content to insert.
       * @param {number} startRow Starting row of the range.
       * @param {number} startCol Starting column of the range.
       * @param {number} endRow Ending row of the range.
       * @param {number} endCol Ending column of the range.
       * @param {string} [taskName] Task's name.
       * @param {string} [replaceMode] Replace mode, e.g., 'Replace'.
       * @returns {Promise<any>}
       * @example
       * await API.RWS.RAPID.setModuleTextInRange(
       *   'MyModule',
       *   'TPErase;',
       *   5,
       *   1,
       *   10,
       *   1,
       *   'T_ROB1',
       *   'Replace'
       * );
       */
      this.setModuleTextInRange = async function (
        moduleName,
        text,
        startRow,
        startCol,
        endRow,
        endCol,
        taskName = 'T_ROB1',
        replaceMode = 'Replace',
      ) {
        const url = `/rw/rapid/tasks/${taskName}/modules/${moduleName}/text/range`;
        const body = `replace-mode=${replaceMode}&query-mode=Force&startrow=${startRow}&startcol=${startCol}&endrow=${endRow}&endcol=${endCol}&text=${encodeURIComponent(
          text,
        )}`;
        return rwsPost(url, body, `Failed to set content of ${taskName}:${moduleName}.`);
      };

      /**
       * Move the program pointer to a specific cursor position
       * @alias movePPToCursor
       * @memberof API.RWS.RAPID
       * @param {string} moduleName Module's name.
       * @param {string} taskName Task's name.
       * @param {string} line Line number where the pointer is desired.
       * @param {string} column Column number where the pointer is desired.
       * @returns {Promise<any>}
       * @example
       * await API.RWS.RAPID.movePPToCursor('MyModule', 'T_ROB1', '10', '5');
       */
      this.movePPToCursor = function (moduleName, taskName, line, column) {
        if (typeof moduleName !== 'string') return Promise.reject("Parameter 'module' is not a string.");
        if (typeof line !== 'string') return Promise.reject("Parameter 'line' is not a string.");
        if (typeof column !== 'string') return Promise.reject("Parameter 'column' is not a string.");

        let url = `/rw/rapid/tasks/${encodeURIComponent(taskName)}/pcp/cursor?mastership=implicit`;
        let body = `module=${encodeURIComponent(moduleName)}&line=${encodeURIComponent(
          line,
        )}&column=${encodeURIComponent(column)}`;
        return rwsPost(url, body, 'Failed to set PP to cursor.');
      };

      /**
       * Set the program pointer to a specific routine
       * @alias setPPToRoutine
       * @memberof API.RWS.RAPID
       * @param {string} moduleName Module's name.
       * @param {string} routineName Routine's name.
       * @param {string} [taskName] Task's name.
       * @returns {Promise<any>}
       * @example
       * await API.RWS.RAPID.setPPToRoutine('MyModule', 'MainRoutine', 'T_ROB1');
       */
      this.setPPToRoutine = function (moduleName, routineName, taskName = 'T_ROB1') {
        let url = `/rw/rapid/tasks/${taskName}/pcp/routine-from-url`;
        let body = `routineurl=/RAPID/${taskName}/${moduleName}/${routineName}&userlevel=false`;
        return rwsPost(url, body, 'Failed to set PP to routine');
      };

      /**
       * Get information about program pointers
       * @alias getPointersInfo
       * @memberof API.RWS.RAPID
       * @param {string} [taskName] Task's name.
       * @returns {Promise<any>}
       * @example
       * const pointersInfo = await API.RWS.RAPID.getPointersInfo('T_ROB1');
       */
      this.getPointersInfo = async function (taskName = 'T_ROB1') {
        let res = await RWS.Network.get('/rw/rapid/tasks/' + taskName + '/pcp');
        let pcpInfo = JSON.parse(res.responseText)['state'];
        return pcpInfo;
      };

      /**
       * Synchronize the value of persistent variables in a specific module
       * @alias syncPers
       * @memberof API.RWS.RAPID
       * @param {string} moduleName Module's name.
       * @param {string} [taskName] Task's name.
       * @returns {Promise<any>}
       * @example
       * await API.RWS.RAPID.syncPers('MyModule', 'T_ROB1');
       */
      this.syncPers = function (moduleName, taskName = 'T_ROB1') {
        let url = `/rw/rapid/tasks/${taskName}/modules/${moduleName}/sync-pers`;
        return rwsPost(url, '', 'Failed to sync pers');
      };

      /**
       * Get service routines
       * @alias getServiceRoutines
       * @memberof API.RWS.RAPID
       * @param {string} exturl External URL for the service routines.
       * @param {boolean} allread Whether to include all readable routines.
       * @returns {Promise<any>}
       */
      this.getServiceRoutines = async function (exturl, allread) {
        let searchedResult = await RWS.Network.get('/rw/rapid/' + exturl + 'allread=' + (allread ? 'TRUE' : 'FALSE'));
        return JSON.parse(searchedResult.responseText);
      };

      /**
       * Set the cycle mode for program execution
       * @alias setCycleMode
       * @memberof API.RWS.RAPID
       * @param {string} mode Cycle mode, e.g., 'once' or 'forever'.
       * @returns {Promise<any>}
       * @example
       * await API.RWS.RAPID.setCycleMode('forever');
       */
      this.setCycleMode = async function (mode = 'once') {
        let url = `/rw/rapid/execution/cycle`;
        let body = `cycle=${mode}`;
        return rwsPost(url, body, 'Failed to set cycle mode');
      };

      /**
       * Get the current cycle mode for program execution
       * @alias getCycleMode
       * @memberof API.RWS.RAPID
       * @returns {Promise<string>} The current cycle mode.
       * @example
       * const cycleMode = await API.RWS.RAPID.getCycleMode();
       */
      this.getCycleMode = async function () {
        let res = await RWS.Network.get('/rw/rapid/execution');
        let executionInfo = JSON.parse(res.responseText)['state'][0];
        return executionInfo['cycle'];
      };

      /**
       * Class representing a RAPID task change monitor.
       * @class TaskChangeMonitor
       * @memberof API.RWS
       * @param {string} taskName
       */
      class TaskChangeMonitor {
        constructor(task = 'T_ROB1') {
          this.url = `/rw/rapid/tasks/${encodeURIComponent(task)}`;
          this.resourceString = `/rw/rapid/tasks/${encodeURIComponent(task)};taskchange`;
          this.callbacks = [];
        }

        getTitle() {
          return this.url;
        }

        getResourceString() {
          return this.resourceString;
        }

        addCallbackOnChanged(callback) {
          if (typeof callback !== 'function') {
            throw new Error('callback is not a valid function');
          }
          this.callbacks.push(callback);
        }

        async onchanged(newValue) {
          let parsedValue = {};
          let taskChangeInfo = {};

          taskChangeInfo['changeCount'] = Object.prototype.hasOwnProperty.call(newValue, 'change-count')
            ? newValue['change-count']
            : '';
          taskChangeInfo['changeType'] = Object.prototype.hasOwnProperty.call(newValue, 'changetype')
            ? newValue['changetype']
            : '';
          taskChangeInfo['moduleName'] = Object.prototype.hasOwnProperty.call(newValue, 'module-name')
            ? newValue['module-name']
            : '';
          taskChangeInfo['programName'] = Object.prototype.hasOwnProperty.call(newValue, 'program-name')
            ? newValue['program-name']
            : '';
          taskChangeInfo['taskName'] = Object.prototype.hasOwnProperty.call(newValue, 'task-name')
            ? newValue['task-name']
            : '';

          parsedValue = taskChangeInfo;
          for (let i = 0; i < this.callbacks.length; i++) {
            try {
              this.callbacks[i](parsedValue);
            } catch (error) {
              Logger.e('TaskChangeMonitor', 'Parse RAPID task change info failed');
              throw new Error('Parse RAPID task change info failed');
            }
          }
        }

        subscribe() {
          return RWS.Subscriptions.subscribe([this]);
        }

        unsubscribe() {
          return RWS.Subscriptions.unsubscribe([this]);
        }
      }

      /**
       * Gets an instance of a API.RAPID.TaskChangeMonitor class
       * @alias getTaskChangeMonitor
       * @memberof API.RAPID
       * @param {string} taskName - Task name
       * @returns {Promise<object>} - API.RAPID.TaskChangeMonitor
       * @example
       * let taskChangeMonitor = await API.RWS.getTaskChangeMonitor();
       * const taskchangeCb = function (data) {
       *    console.log('RAPID is changed');
       *  };
       * taskChangeMonitor.addCallbackOnChanged(taskchangeCb);
       * taskChangeMonitor.subscribe()
       */
      this.getTaskChangeMonitor = function (taskName = 'T_ROB1') {
        return new TaskChangeMonitor(taskName);
      };
    })();

    /**
     * The API.RWS.CFG provides some config related interfaces that has not been supported by Omnicore SDK.
     * @namespace CFG
     * @memberof API.RWS
     */
    this.CFG = new (function () {
      /**
       * Delete an existing entry from the configuraiton database
       * @alias deleteConfigInstance
       * @memberof API.RWS.CFG
       * @param {string} name The instance name
       * @param {string} type The instance type
       * @param {string} domain The instance domain
       * @returns {Promise<any>}
       * @example
       * // delete the signal configuration instance
       * await API.RWS.CFG.deleteConfigInstance("TestDO1", "EIO_SIGNAL"， "eio")
       */
      this.deleteConfigInstance = async function (name, type, domain) {
        const f = function () {
          return RWS.Network.delete(`/rw/cfg/${domain}/${type}/instances/${name}`);
        };
        return await executeWithMastership(f);
      };
    })();

    /**
     * The API.RWS.CONTROLLER class provides a set of controller-related interfaces that are not supported by the Omnicore SDK.
     * It includes methods for retrieving robot types, system information, and managing program execution settings such as speed ratio
     * @namespace CONTROLLER
     * @memberof API.RWS
     */
    this.CONTROLLER = new (function () {
      /**
       * Get the robot type
       * @alias getRobotType
       * @memberof API.RWS.CONTROLLER
       * @returns {Promise<string>} A promise with a string containing the robot type.
       * @example
       * const robotType = await API.RWS.CONTROLLER.getRobotType();
       * console.log(robotType); // Outputs the robot type
       */
      this.getRobotType = async function () {
        let robotType = await RWS.Network.get('/rw/system/robottype');
        return JSON.parse(robotType.responseText)['state'][0]['robot-type'];
      };

      /**
       * Get system information
       * @alias getSystemInfo
       * @memberof API.RWS.CONTROLLER
       * @returns {Promise<any>}
       * @example
       * const systemInfo = await API.RWS.CONTROLLER.getSystemInfo();
       * console.log(systemInfo);
       */
      this.getSystemInfo = async function () {
        let systemRes = await RWS.Network.get('/rw/system');
        let res = JSON.parse(systemRes.responseText);
        let result = {
          options: [],
          rwversionname: res['state'][0]['rwversionname'],
          major: res['state'][0]['major'],
          minor: res['state'][0]['minor'],
          build: res['state'][0]['build'],
          revision: res['state'][0]['revision'],
          date: res['state'][0]['date'],
          name: res['state'][0]['name'],
          sysid: res['state'][0]['sysid'],
        };
        let opts = res['_embedded']['resources'][0]['options'];
        for (const iterator of opts) {
          if (iterator['option'] != undefined) {
            result.options.push(iterator['option']);
          }
        }
        return result;
      };

      /**
       * Set speed ration for program execution; Only supports auto mode; Edit mastership is required.
       * @alias setSpeedRatio
       * @memberof API.RWS.CONTROLLER
       * @param {number} speedRatio
       * @returns {Promise<string>}
       * @example
       * await API.RWS.CONTROLLER.setSpeedRatio(50); // Sets the speed ratio to 50%
       */
      this.setSpeedRatio = async function (speedRatio) {
        return RWS.Network.post('/rw/panel/speedratio', 'speed-ratio=' + speedRatio.toString());
      };
      /**
       * Get speed ration for program execution;
       * @alias getSpeedRatio
       * @memberof API.RWS.CONTROLLER
       * @returns {Promise<number>}
       * @example
       * const speedRatio = await API.RWS.CONTROLLER.getSpeedRatio();
       * console.log(`Current speed ratio: ${speedRatio}%`);
       */
      this.getSpeedRatio = async function () {
        let speedRes = await RWS.Network.get('/rw/panel/speedratio');
        return parseInt(JSON.parse(speedRes.responseText)['state'][0]['speedratio']);
      };
    })();

    /**
     * The API.RWS.SIGNAL class provides a set of signal-related interfaces that are not supported by the Omnicore SDK.
     * @namespace SIGNAL
     * @memberof API.RWS
     */
    this.SIGNAL = new (function () {
      /**
       * Modify signal's value
       * @alias setSignalValue
       * @memberof API.RWS.SIGNAL
       * @param {string} signalName
       * @param {number} value
       * @param {string} mode: value | pulse | invert | toggle | delay
       * @param {number} pulses: Number of pulses.Pulses is required if mode is toggle/pulse.
       * @param {number} activePulse: Active pulse length for pulse/toggle mode, in ms
       * @param {number} passivePulse: Passive pulse length for pulse/toggle mode, in ms
       * @param {number} delay: Delay time for delay mode, in ms
       * @param {string} deviceType
       * @param {string} networkType
       * @param {*} attr
       * @example
       * await API.RWS.SIGNAL.setSignalValue("TestDO1","1");
       */
      this.setSignalValue = async function (
        signalName,
        value,
        {
          mode = '',
          pulses = 1,
          activePulse = 1000,
          passivePulse = 1000,
          delay = 1000,
          deviceType = '',
          networkType = '',
        } = {},
      ) {
        try {
          const isPulseParameterRequired = ['pulse', 'toggle'].includes(mode);
          const isDelayParameterRequired = ['delay'].includes(mode);
          await RWS.Network.post(
            '/rw/iosystem/signals/' +
              (networkType ? networkType + '/' : '') +
              (deviceType ? deviceType + '/' : '') +
              signalName +
              '/set-value',
            'lvalue=' +
              value +
              (mode ? `&mode=${mode}` : '') +
              (isPulseParameterRequired
                ? `&Pulses=${pulses}&ActivePulse=${activePulse}&PassivePulse=${passivePulse}`
                : '') +
              (isDelayParameterRequired ? `&Delay=${delay}` : ''),
          );
        } catch (error) {
          Logger.e(logModule, 'set signal value failed');
          throw new Error('set signal value failed');
        }
      };

      /**
       * Get signal's value
       * @alias getSignalValue
       * @memberof API.RWS.SIGNAL
       * @param {string} signalName
       * @param {string} deviceType
       * @param {string} networkType
       * @returns {Promise<string>}
       * @example
       * await API.RWS.SIGNAL.getSignalValue("TestDO1");
       */
      this.getSignalValue = async function (signalName, {deviceType = '', networkType = ''} = {}) {
        try {
          let signalRes = await RWS.Network.get(
            '/rw/iosystem/signals/' +
              (networkType ? networkType + '/' : '') +
              (deviceType ? deviceType + '/' : '') +
              signalName +
              ';state',
          );
          return JSON.parse(signalRes.responseText).state[0].lvalue;
        } catch (error) {
          Logger.e(logModule, 'get signal value failed');
          throw new Error('get signal value failed');
        }
      };
    })();

    /**
     * The API.RWS.UAS class provides a set of UAS-related interfaces that are not supported by the Omnicore SDK.
     * @namespace UAS
     * @memberof API.RWS
     */
    this.UAS = new (function () {
      /**
       * Modify signal's value
       * @alias getGrantsOfUser
       * @memberof API.RWS.UAS
       * @param {string} userName
       * @example
       * await API.RWS.UAS.getGrantsOfUser("admin")
       */
      this.getGrantsOfUser = async function (userName) {
        let userGrantsInfoRes = await RWS.Network.get(`/uas/users/${userName}/grants`);
        let userGrantsInfo = JSON.parse(userGrantsInfoRes.responseText).state;

        let userGrants = [];
        userGrantsInfo.forEach((info) => {
          userGrants.push(info.grantname);
        });

        return userGrants;
      };
    })();
  })();

  rws.constructedRWS = true;
};

if (typeof API.constructedRWS === 'undefined') {
  factoryApiRws(API);
}

export default API;
export {factoryApiRws};
