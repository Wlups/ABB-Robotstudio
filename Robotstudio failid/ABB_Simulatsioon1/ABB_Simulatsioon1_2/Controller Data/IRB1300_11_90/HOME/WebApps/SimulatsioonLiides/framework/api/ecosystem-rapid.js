import API from './ecosystem-base.js';
import {Logger} from './../function/log-helper.js';

export const factoryApiRapid = function (r) {
  const logModule = 'ecosystem-rapid';

  /**
   * The API.RAPID namespace provides a comprehensive set of interfaces for managing and interacting with RAPID programs on the controller.
   * It includes methods for controlling program execution, managing tasks, modules, and variables, as well as monitoring execution states and subscribing to variable changes.
   * This class simplifies the development and integration of RAPID-based automation solutions, enabling developers to efficiently interact with and control RAPID programs.
   * @alias API.RAPID
   * @namespace
   */
  r.RAPID = new (function () {
    this.variables = [];
    this.subscriptions = new Map();

    /**
     * @alias MODULETYPE
     * @memberof API.RAPID
     * @readonly
     * @enum {string}
     */
    const MODULETYPE = {
      Program: 'program',
      System: 'system',
    };
    this.MODULETYPE = MODULETYPE;

    const EXECUTIONSTATE = {
      Running: 'running',
      Stopped: 'stopped',
    };
    this.EXECUTIONSTATE = EXECUTIONSTATE;

    /**
     * @memberof API
     * @param {RWS.Rapid.MonitorResources} res
     * @param {Function} func
     * @param {string} [task]
     * @returns {Promise<any>}
     * @private
     */
    const subscribeRes = async function (res, func, task = 'T_ROB1') {
      try {
        if (API.isSubscriptionBlocked) {
          Logger.w(logModule, 'API.RAPID: Subscription disabled, monitor rapid');
          return;
        }

        const monitor = await RWS.Rapid.getMonitor(res, task);
        monitor.addCallbackOnChanged(func);
        await monitor.subscribe();
      } catch (e) {
        return API.rejectWithStatus(`Subscription to ${res} failed.`, e);
      }
    };

    /**
     * @typedef searchSymbolProps
     * @prop {string} [task] - task where the search takes place (default: 'T_ROB1')
     * @prop {string} [module] - module where the search takes place
     * @prop {boolean} [isInUse] only return symbols that are used in a Rapid program,
     * i.e. a type declaration that has no declared variable will not be returned when this flag is set true.
     * @prop {object} [dataType] - type of the data, e.g. 'num'(only one data type is supported)
     * @prop {number} [symbolType] - options can be equal one of the following values:
     *       <br>&emsp;undefined: 0
     *       <br>&emsp;constant: 1
     *       <br>&emsp;variable: 2
     *       <br>&emsp;persistent: 4
     *       <br>&emsp;function: 8
     *       <br>&emsp;procedure: 16
     *       <br>&emsp;trap: 32
     *       <br>&emsp;module: 64
     *       <br>&emsp;task: 128
     *       <br>&emsp;routine: 8 + 16 + 32
     *       <br>&emsp;rapidData: 1 + 2 + 4
     *       <br>&emsp;any: 255
     * @prop {string | Array} [name] name of the data symbol (not casesensitive)
     * @memberof API.RAPID
     */

    /**
     * @alias searchSymbol
     * @memberof API.RAPID
     * @param {searchSymbolProps} props
     * @returns {Promise<RWS.Rapid.SymbolSearchResult[]>}
     * A Promise with list of objects. Each object contains:
     *      <br>&emsp;(string) name name of the data symbol
     *      <br>&emsp;([string]) scope symbol scope
     *      <br>&emsp;(string) symbolType type of the symbol, e.g. 'pers'
     *      <br>&emsp;(string) dataType type of the data, e.g. 'num'
     * @private
     * @todo not yet working properly
     */
    const searchSymbol = async function ({
      task = 'T_ROB1',
      module = null,
      isInUse = false,
      dataType = '',
      symbolType = RWS.Rapid.SymbolTypes.rapidData,
      name = '',
    } = {}) {
      let elements = [];
      try {
        var properties = RWS.Rapid.getDefaultSearchProperties();
        let url = `RAPID/${task}`;
        if (module) url = url + `/${module}`;
        properties.searchURL = url;
        properties.types = symbolType;
        properties.isInUse = isInUse;
        var hits = [];
        if (name instanceof Array) {
          for (const index in name) {
            const regexp = name[index] !== '' ? `^.*${name[index]}.*$` : '';
            hits.push(...(await RWS.Rapid.searchSymbols(properties, dataType, regexp)));
          }
        } else {
          const regexp = name !== '' ? `^.*${name}.*$` : '';
          hits = await RWS.Rapid.searchSymbols(properties, dataType, regexp);
        }

        if (hits.length > 0) {
          for (let i = 0; i < hits.length; i++) {
            elements.push(hits[i]);
          }
        }
        return elements;
      } catch (e) {
        return API.rejectWithStatus(`Failed to search symbol ${name} -  module: ${module}`, e);
      }
    };

    /**
     * Search for available tasks
     * @alias searchTasks
     * @memberof API.RAPID
     * @param {string} [filter] Only symbols containing the string pattern
     * @param {boolean} [caseSensitive] If false (default) the filter applies non-case-sensitive, otherwise it is case-sensitive
     * @returns {Promise<object>}
     * @example
     * await API.RAPID.searchTasks()
     */
    this.searchTasks = async function (filter = '', caseSensitive = false) {
      if (typeof filter !== 'string') {
        throw new Error('The filter string should be a valid string.');
      }
      try {
        const allTasks = await RWS.Rapid.getTasks();
        const taskNames = allTasks.map((t) => t.getName());
        const flags = caseSensitive ? '' : 'i';
        const regex = new RegExp(filter, flags);
        const filteredTaskNames = taskNames.filter((element) => regex.test(element));

        return taskNames.filter((element) => regex.test(element));
      } catch (error) {
        return API.rejectWithStatus('Failed to get tasks', error);
      }
    };

    /**
     * Monitors changes to the Rapid program execution state. It is possible to provide
     * a callback function that will be called every time the state changes.
     * Current state is stored in{@link executionState} variable. Additionally, {@link isRunning}
     * is updated correspondingly.
     * @alias monitorExecutionState
     * @memberof API.RAPID
     * @param {function} [callback] - Callback function called when operation mode changes
     * @example
     * // The callback will be executed when execution status is changed
     * const execStatus = (value)=>{console.log("Execution status is:",value);}
     * await API.RAPID.monitorExecutionState(execStatus);
     */
    this.monitorExecutionState = async function (callback = null) {
      if (this.executionState === undefined) {
        try {
          this.executionState = await RWS.Rapid.getExecutionState();
          this.isRunning = this.executionState === RWS.Rapid.ExecutionStates.running ? true : false;
          const cbExecState = function (data) {
            this.executionState = data;
            data === RWS.Rapid.ExecutionStates.running ? (this.isRunning = true) : (this.isRunning = false);
            API._events.trigger('execution', data);
            Logger.i(logModule, `Execution status: ${this.executionState}`);
          };
          subscribeRes(RWS.Rapid.MonitorResources.execution, cbExecState.bind(this));
          callback(this.executionState);
        } catch (e) {
          return API.rejectWithStatus('Failed to subscribe execution state', e);
        }
      }
      API._events.on('execution', callback);
    };

    /**
     * Set program pointer to main
     * @alias setPPToMain
     * @memberof API.RAPID
     * @example
     * await API.RAPID.setPPToMain()
     */
    this.setPPToMain = async function () {
      try {
        await API.RWS.requestMastership('edit');
        await RWS.Rapid.resetPP();
      } catch (error) {
        Logger.e(logModule, 'Set program pointer to main failed');
        throw new Error('Set program pointer to main failed');
      } finally {
        await API.RWS.releaseMastership('edit');
      }
    };

    /**
     * Set program pointer to routine
     * @alias setPPToRoutine
     * @memberof API.RAPID
     * @example
     * await API.RAPID.setPPToRoutine("MainModule","proc1")
     */
    this.setPPToRoutine = async function (moduleName, routineName, taskName = 'T_ROB1') {
      if (!(moduleName && routineName)) return;

      try {
        await API.RWS.requestMastership('edit');
        await API.RWS.RAPID.setPPToRoutine(moduleName, routineName, taskName);
      } catch (error) {
        Logger.e(logModule, 'Set program pointer to routine failed');
        throw new Error('Set program pointer to routine failed');
      } finally {
        await API.RWS.releaseMastership('edit');
      }
    };

    /**
     * Get program pointer
     * @alias getProgramPointer
     * @memberof API.RAPID
     * @returns {Promise<objecy>} A promise with an object containing the program pointer information.
     * @example
     * await API.RAPID.getProgramPointer()
     */
    this.getProgramPointer = async function (taskName = 'T_ROB1') {
      try {
        let pcpInfo = await API.RWS.RAPID.getPointersInfo();
        let programPointer = pcpInfo[0];
        let beginPos =
          programPointer['beginPosition'] != undefined
            ? programPointer['beginPosition'].split(',')
            : [undefined, undefined];
        let endPos =
          programPointer['endPosition'] != undefined
            ? programPointer['endPosition'].split(',')
            : [undefined, undefined];
        let moduleName =
          programPointer['modulemame'] != undefined ? programPointer['modulemame'] : programPointer['modulename'];

        return {
          moduleName: moduleName,
          routineName: programPointer['routinename'],
          BegPosLine: beginPos[0],
          BegPosCol: beginPos[1],
          EndPosLine: endPos[0],
          EndPosCol: endPos[1],
        };
      } catch (error) {
        Logger.e(logModule, 'Get program pointer failed');
        throw new Error('Get program pointer failed');
      }
    };

    // this.monitorMechUnit = async function (callback = null) {
    //   try {
    //     if (typeof callback !== 'function' && callback !== null)
    //       throw new Error('callback is not a valid function');

    //     const cbMechUnit = function (data) {
    //       this.mechUnit = data;
    //       callback && callback(data);
    //     };
    //     subscribeRes('mechunit', cbMechUnit.bind(this));
    //   } catch (e) {
    //     return API.rejectWithStatus('Failed to subscribe execution state', e);
    //   }
    // };

    /**
     * @typedef startExecutionProps
     * @prop {string} regainMode - valid values: 'continue', 'regain', 'clear' or 'enter_consume'
     * @prop {string} execMode - valid values: 'continue', 'step_in', 'step_over', 'step_out', 'step_backwards', 'step_to_last' or 'step_to_motion'
     * @prop {string} cycleMode - valid values: 'forever', 'as_is' or 'once'
     * @prop {string} condition - valid values: 'none' or 'call_chain'
     * @prop {boolean} stopAtBreakpoint - stop at breakpoint
     * @prop {boolean} enableByTSP - all tasks according to task selection panel
     * @private
     */

    /**
     * Class representing a RAPID Task. It abstract usefull ready to use functionalities
     * which otherwise require greater effort when implementing only with the Omnicore SDK.
     * This class cannot be direct instantiated. Therefore the {@link API.RAPID.getTask()}
     * method instead.
     * @class Task
     * @memberof API.RAPID
     * @param {object} task - RWS.RAPID Task Object
     * @example
     * const task = await API.RAPID.getTask('T_ROB1');
     * const modules = await task.searchModules();
     * @see {@link https://developercenter.robotstudio.com/omnicore-sdk|Omnicore-SDK}
     */
    class Task {
      constructor(task) {
        this._task = task;
        this.name = task.getName();
      }

      /**
       * Load a module from the controller HOME files
       * @alias loadModule
       * @memberof API.RAPID.Task
       * @param {string} path Path to the module file in
       * the HOME directory (included extension of the module).
       * @param {boolean} replace If true, it will replace an existing module in RAPID with the same name
       * @example
       * let url = `${this.path}/${this.name}${this.extension}`;
       * await task.loadModule(url, true);
       */
      async loadModule(path, replace = false) {
        return await loadModule(path, replace, this.name);
      }

      /**
       * Unload a module from RAPID
       * @alias unloadModule
       * @memberof API.RAPID.Task
       * @param {string} module Module's name
       * @example
       * await task.unloadModule("MainModule");
       */
      async unloadModule(module) {
        return await unloadModule(module, this.name);
      }

      /**
       * @typedef stopExecutionProps
       * @prop {RWS.Rapid.StopModes} [stopMode] stop mode, valid values: 'cycle', 'instruction', 'stop' or 'quick_stop'
       * @prop {RWS.Rapid.UseTSPOptions.normal} [useTSP] use task selection panel, valid values: 'normal' or 'all_tasks'
       * @memberof API.RAPID.Task
       */

      /**
       * Stops the Rapid execution with the settings given in the parameter object. All or any of the defined parameters can be supplied, if a value is omitted a default value will be used. The default values are:
       * stopMode = 'stop'
       * useTSP = 'normal'
       * @alias stopExecution
       * @memberof API.RAPID.Task
       * @param {stopExecutionProps} props
       * @deprecated since version 1.1.0, use API.RAPID.stopExecution instead
       * @example
       * const task = await API.RAPID.getTask('T_ROB1');
       * await task.stopExecution();
       */
      async stopExecution({stopMode = RWS.Rapid.StopModes.stop, useTSP = RWS.Rapid.UseTSPOptions.normal} = {}) {
        var state = await RWS.Rapid.getExecutionState();
        if (state === RWS.Rapid.ExecutionStates.running) {
          await RWS.Rapid.stopExecution({
            stopMode,
            useTSP,
          });
        }
      }

      /**
       * @typedef { 'constant' | 'variable' | 'persistent'} VariableSymbolType ;
       * @memberof API.RAPID
       */

      /**
       * @typedef filterVariables
       * @prop {string} [name] Name of the data symbol (not casesensitive)
       * @prop {VariableSymbolType} [symbolType] valid values: 'constant', 'variable', 'persistent' (array with multiple values is supported)
       * @prop {string} [dataType] type of the data, e.g. 'num'(only one data type is supported)
       * i.e. a type declaration that has no declared variable will not be returned when this flag is set true.
       * @memberof API.RAPID
       */

      /**
       * Search for variable contained in a module
       * @alias searchVariables
       * @memberof API.RAPID.Task
       * @param {string} module - Module where the search takes place
       * @param {boolean} [isInUse] Only return symbols that are used in a Rapid program,
       * @param {filterVariables} [filter] See {@link filterVariables}
       * @returns {Promise<RWS.Rapid.SymbolSearchResult[]>}
       * @example
       * // list all num variables in MainModule of task T_ROB1
       * const task = await API.RAPID.getTask('T_ROB1');
       * await task.searchVariables("MainModule", false, {dataType: "num"});
       */
      async searchVariables(module = null, isInUse = false, filter = {}) {
        let searchFilter = {module, isInUse};
        let types;
        if (Object.prototype.hasOwnProperty.call(filter, 'symbolType')) {
          types = Array.isArray(filter.symbolType)
            ? filter.symbolType.reduce((all, entry, idx, arr) => {
                if (entry === 'rapidData') {
                  arr.splice(1); // eject early
                  return RWS.Rapid.SymbolTypes[entry];
                }
                return entry === 'constant' || entry === 'variable' || entry === 'persistent'
                  ? all + RWS.Rapid.SymbolTypes[entry]
                  : all;
              }, 0)
            : RWS.Rapid.SymbolTypes[filter.symbolType];
        } else {
          types = RWS.Rapid.SymbolTypes['rapidData:'];
        }
        if (types !== undefined) {
          searchFilter.symbolType = types;
        }

        searchFilter.task = this.name;
        if (Object.prototype.hasOwnProperty.call(filter, 'name')) searchFilter.name = filter.name;
        if (Object.prototype.hasOwnProperty.call(filter, 'dataType')) searchFilter.dataType = filter.dataType;
        return searchSymbol(searchFilter);
      }

      /**
       * Search for available module
       * @alias searchModules
       * @memberof API.RAPID.Task
       * @param {boolean} [isInUse] Only return symbols that are used in a Rapid program,
       * i.e. a type declaration that has no declared variable will not be returned when this flag is set true.
       * @param {string} [filter] Only symbols containing the string patern (not casesensitive)
       * @returns {Promise<RWS.Rapid.SymbolSearchResult[]>}
       * @example
       * const task = await API.RAPID.getTask('T_ROB1');
       * await task.searchModules()
       */
      async searchModules(isInUse = false, filter = '') {
        return searchSymbol({
          task: this.name,
          isInUse: isInUse,
          symbolType: RWS.Rapid.SymbolTypes.module,
          name: filter,
        });
      }

      /**
       * Search for procedures contained in a module
       * @alias searchProcedures
       * @memberof API.RAPID.Task
       * @param {string} module Module where the search takes place
       * @param {boolean} [isInUse] Only return symbols that are used in a Rapid program,
       * i.e. a type declaration that has no declared variable will not be returned when this flag is set true.
       * @param {string} [filter] Only symbols containing the string patern (not casesensitive)
       * @returns {Promise<RWS.Rapid.SymbolSearchResult[]>}
       * @example
       * const task = await API.RAPID.getTask('T_ROB1');
       * await task.searchProcedures()
       */
      async searchProcedures(module = null, isInUse = false, filter = '') {
        return searchSymbol({
          task: this.name,
          module: module,
          isInUse: isInUse,
          symbolType: RWS.Rapid.SymbolTypes.procedure,
          name: filter,
        });
      }

      /**
       * @typedef { 'procedure' | 'function' | 'trap'} RoutineSymbolType ;
       * @memberof API.RAPID
       */

      /**
       * @typedef filterRoutines
       * @prop {string} [name] Name of the data symbol (not casesensitive)
       * @prop {RoutineSymbolType} [symbolType] Valid values: 'procedure', 'function', 'trap' , 'routine'(array with multiple values is supported)
       * @memberof API.RAPID
       */

      /**
       * Search for routines contained in a module
       * @alias searchRoutines
       * @memberof API.RAPID.Task
       * @param {string} module Module where the search takes place
       * @param {boolean} [isInUse] Only return symbols that are used in a Rapid program,
       * @param {filterRoutines} [filter] See {@link filterRoutines}
       *
       * @returns {Promise<RWS.Rapid.SymbolSearchResult[]>}
       * @example
       * const task = await API.RAPID.getTask('T_ROB1');
       * await task.searchRoutines()
       */
      async searchRoutines(module = null, isInUse = false, filter = {}) {
        let types;
        if (Object.prototype.hasOwnProperty.call(filter, 'symbolType')) {
          types = Array.isArray(filter.symbolType)
            ? filter.symbolType.reduce((all, entry, idx, arr) => {
                if (entry === 'routine') {
                  arr.splice(1); // eject early
                  return RWS.Rapid.SymbolTypes[entry];
                }
                return entry === 'procedure' || entry === 'function' || entry === 'trap'
                  ? all + RWS.Rapid.SymbolTypes[entry]
                  : all;
              }, 0)
            : RWS.Rapid.SymbolTypes[filter.symbolType];
        } else {
          types = RWS.Rapid.SymbolTypes['routine'];
        }

        return searchSymbol({
          task: this.name,
          module: module,
          isInUse: isInUse,
          symbolType: types,
          name: filter.name,
        });
      }

      /**
       * Get the value of a variable
       * @alias getValue
       * @memberof API.RAPID.Task
       * @param {string} module - module containing the variable
       * @param {string} variable - variable name
       * @returns {Promise<object>}
       * @example
       * // get the variable value of RAPID variable n1 in MainModule
       * const task = await API.RAPID.getTask('T_ROB1');
       * await task.getValue("MainModule", "n1")
       */
      async getValue(module, variable) {
        try {
          var data = await this._task.getData(module, variable);
          // const properties = await data.getProperties();
          return await data.getValue();
        } catch (e) {
          return API.rejectWithStatus(
            `Variable ${variable} not found at ${this._task.getName()} : ${module} module.`,
            e,
          );
        }
      }

      /**
       * Set the value of a variable
       * @alias setValue
       * @memberof API.RAPID.Task
       * @param {string} module - module containing the variable
       * @param {string} variable - variable name
       * @param {object} value - value of the variable
       * @returns {Promise<object>}
       * @todo Valiation of value not yet applied
       * @example
       * // set the variable value of RAPID variable n1 in MainModule
       * const task = await API.RAPID.getTask('T_ROB1');
       * await task.setValue("MainModule", "aa",7);
       */
      async setValue(module, variable, value) {
        try {
          var data = await this._task.getData(module, variable);
          await data.setValue(value);
        } catch (err) {
          return API.rejectWithStatus(`Set variable ${module}:${variable} failed.`, err);
        }
      }

      /**
       * Gets and a an RWS Data object variable
       * @alias getVariable
       * @memberof API.RAPID.Task
       * @param {string} module - module containing the variable
       * @param {string} variable - variable name
       * @param {boolean} subscribe
       * @returns {Promise<object>} API.RAPID.Variable object
       * @see {@link https://developercenter.robotstudio.com/omnicore-sdk|Omnicore-SDK}
       * @example
       * const task = await API.RAPID.getTask('T_ROB1');
       * await task.getVariable("MainModule", "aa")
       */
      async getVariable(module, variable, subscribe = true) {
        return await getVariableInstance(this.name, module, variable, subscribe);
      }

      /**
       * Gets a module. This will retrieve the properties for the module from the controller and initialize the object.
       * @alias getModule
       * @memberof API.RAPID.Task
       * @param {object} module - The name of the module
       * @returns {Promise<object>} a RWS Module object
       * @see {@link https://developercenter.robotstudio.com/omnicore-sdk|Omnicore-SDK}
       * @example
       * const task = await API.RAPID.getTask('T_ROB1');
       * await task.getModule("MainModule")
       */
      async getModule(module) {
        return await this._task.getModule(module);
      }
    }

    /**
     * @typedef VariableProps
     * @prop {string} [taskName] task's name
     * @prop {string} [moduleName] module's name
     * @prop {string} [symbolName] symbol's name
     * @prop {string} [dataType] symbol's data type
     * @prop {string} [symbolType] the declaration type of the data, valid values:
     *     'constant'
     *     'variable'
     *     'persistent'
     * @prop {number[]} dimensions list of dimensions for arrays
     * @prop {string} [scope] the data's scope, valid values:
     *     'local'
     *     'task'
     *     'global'
     * @prop {string} [dataTypeURL] RWS URL to the data’s type symbol
     * @memberof API.RAPID
     */

    /**
     * Class representing a RAPID Variable.
     * @class Variable
     * @memberof API.RAPID
     * @param {RWS.Rapid.Data} variable
     * @param {VariableProps} props See {@link VariableProps}
     * @property {object} var Object returned by RWS.Rapid.getData().
     * @see {@link https://developercenter.robotstudio.com/omnicore-sdk|Omnicore-SDK}
     */
    class Variable extends API.Events {
      constructor(variable, props) {
        super();
        this.props = props;
        this.var = variable;
        this.callbacks = [];
        this._subscribed = false;
      }

      get name() {
        return this.props.symbolName;
      }

      get value() {
        return (async () => {
          try {
            await this.var.fetch();
            return await this.var.getValue();
          } catch (e) {
            return API.rejectWithStatus(`Failed to get value of variable "${this.name}"`, e);
          }
        })();
      }

      set value(v) {
        this.var && this.var.setValue(v);
      }

      async getValue() {
        try {
          await this.var.fetch();
          return await this.var.getValue();
        } catch (e) {
          return API.rejectWithStatus(`Failed to get value of variable "${this.name}"`, e);
        }
      }

      async setValue(v) {
        try {
          if (this.type === 'num' && typeof v === 'string') v = Number.parseInt(v);
          return this.var && (await this.var.setValue(v));
        } catch (e) {
          return API.rejectWithStatus(`Failed to set value of variable ${this.name}`, e);
        }
      }

      async setRawValue(v) {
        try {
          if (typeof v != 'string') throw 'Incorrect raw value';
          return this.var && (await this.var.setRawValue(v));
        } catch (e) {
          return API.rejectWithStatus(`Failed to set value of variable ${this.name}`, e);
        }
      }

      get type() {
        return this.props.dataType;
      }

      /**
       * Returns the declaration type of the data, valid values:
       * 'constant'
       * 'variable'
       * 'persistent'
       */
      get symbolType() {
        return this.props.symbolType;
      }

      /**
       * Subscribe to a RAPID variable
       * @alias subscribe
       * @param {boolean} raiseInitial raises an event after subscription
       * @returns {undefined | Promise<{}>} undefined at success, reject Promise at fail.
       * @memberof API.RAPID.Variable
       */
      async subscribe(raiseInitial = false) {
        try {
          await this._onChanged();

          if (!this._subscrided) {
            await this.var.subscribe(raiseInitial);
            this._subscrided = true;
          }
        } catch (e) {
          return API.rejectWithStatus(`Failed to subscribe variable "${this.name}"`, e);
        }
      }

      /**
       * Unsubscribe a RAPID variable
       * @alias unsubscribe
       * @returns {undefined | Promise<{}>} undefined at success, reject Promise at fail.
       * @memberof API.RAPID.Variable
       */
      async unsubscribe() {
        if (this._subscrided) {
          try {
            this._subscribed = false;
            return API.RAPID.unsubscribeVariable(this.props.taskName, this.props.moduleName, this.name);
          } catch (e) {
            return API.rejectWithStatus(`Failed to unsubscribe variable "${this.name}"`, e);
          }
        }
      }

      /**
       * Internal callback for variable specific handling. This method is called inside the subscribe method
       * @returns {undefined | Promise<{}>} undefined at success, reject Promise at fail.
       * @private
       */
      async _onChanged() {
        try {
          const cb = async (value) => {
            if (value === undefined) {
              value = await this.var.getValue();
            }
            this.trigger('changed', this._adapter(value));
          };

          this.var.addCallbackOnChanged(cb.bind(this));
        } catch (e) {
          return API.rejectWithStatus(`Failed to add callback on changed for "${this.name}"`);
        }
      }

      _adapter(value) {
        return value;
      }

      /**
       * Add a callback function to be executed when the variable value changes
       * @alias onChanged
       * @param {*} callback
       * @memberof API.RAPID.Variable
       */
      onChanged(callback) {
        this.on('changed', callback);
      }
    }

    /**
     * Class representing a RAPID Variable of type 'string'.
     * @class VariableString
     * @extends API.RAPID.Variable
     * @memberof API.RAPID
     * @param {string} variable
     * @param {VariableProps} props See {@link VariableProps}
     * @see {@link https://developercenter.robotstudio.com/omnicore-sdk|Omnicore-SDK}
     */
    class VariableString extends Variable {
      async getValue() {
        const value = await super.getValue();
        return value;
      }

      async setValue(value) {
        super.setValue(value);
      }

      _adapter(value) {
        return value.replace(/"$/, '').replace(/^"/, '');
      }
    }

    /**
     * Class representing a RAPID Variable of type 'bool'.
     * @class VariableBool
     * @extends API.RAPID.Variable
     * @memberof API.RAPID
     * @param {string} variable
     * @param {VariableProps} props See {@link VariableProps}
     * @see {@link https://developercenter.robotstudio.com/omnicore-sdk|Omnicore-SDK}
     */
    class VariableBool extends Variable {
      async getValue() {
        const value = (await super.getValue()) ? true : false;
        return value;
      }

      async setValue(value) {
        super.setValue(value);
      }

      _adapter(value) {
        return value === 'TRUE' || value === 'true' ? true : false;
      }
    }

    /**
     * Class representing a RAPID Variable of type 'num' and 'dnum'.
     * @class VariableNum
     * @extends API.RAPID.Variable
     * @memberof API.RAPID
     * @param {string} variable
     * @param {VariableProps} props See {@link VariableProps}
     * @see {@link https://developercenter.robotstudio.com/omnicore-sdk|Omnicore-SDK}
     */
    class VariableNum extends Variable {
      async getValue() {
        const value = await super.getValue();
        return this._getArrayItems(value);
      }

      async setValue(value) {
        const setArrayItems = function (array, variable, indices = []) {
          array.forEach((element, index) => {
            if (Array.isArray(element)) {
              setArrayItems(element, variable, [...indices, index + 1]);
            } else {
              variable.setArrayItem(Number(element), ...[...indices, index + 1]);
            }
          });
        };

        if (typeof value === 'string') value = JSON.parse(value);

        if (Array.isArray(value)) {
          setArrayItems(value, this.var);
        } else {
          super.setValue(Number(value));
        }
      }

      _adapter(value) {
        return this._getArrayItems(value);
      }

      _getArrayItems(value) {
        if (typeof value === 'string') value = JSON.parse(value);
        if (Array.isArray(value)) {
          const ret = value.map((v) => this._getArrayItems(v));
          return ret;
        } else {
          return Number(value);
        }
      }
    }

    /**
     * Class representing a RAPID Variable of type 'robtarget'.
     * @class VariableRobTarget
     * @extends API.RAPID.Variable
     * @memberof API.RAPID
     * @param {string} variable
     * @param {VariableProps} props See {@link VariableProps}
     * @see {@link https://developercenter.robotstudio.com/omnicore-sdk|Omnicore-SDK}
     */
    class VariableRobTarget extends Variable {
      async getValue() {
        const value = await super.getValue();
        // const parsedRobTarget = API.RWS.MOTIONSYSTEM.parseRobTarget(value);
        // return parsedRobTarget;
        return value;
      }

      async setValue(value) {
        super.setValue(value);
      }

      _adapter(value) {
        return value;
      }
    }

    /**
     * Class representing a RAPID Variable of type 'jointtarget'.
     * @class VariableJointTarget
     * @extends API.RAPID.Variable
     * @memberof API.RAPID
     * @param {string} variable
     * @param {VariableProps} props See {@link VariableProps}
     * @see {@link https://developercenter.robotstudio.com/omnicore-sdk|Omnicore-SDK}
     */
    class VariableJointTarget extends Variable {
      async getValue() {
        const value = await super.getValue();
        // const parsedJointTarget = API.RWS.MOTIONSYSTEM.parseJointTarget(value);
        // return parsedJointTarget;
        return value;
      }

      async setValue(value) {
        super.setValue(value);
      }

      _adapter(value) {
        return value;
      }
    }

    /**
     * Create a variable instance
     * @alias createVariableInstance
     * @memberof API.RAPID
     * @param {string} module the module name that the variable locates inside
     * @param {string} name The variable name
     * @param {string} task The task nameS
     * @example
     * let variableInstance = await API.RAPID.createVariableInstance("MainModule","aa");
     */
    this.createVariableInstance = async function (module, name, task = 'T_ROB1') {
      const v = await RWS.Rapid.getData(task, module, name);
      const p = await v.getProperties();

      let variable;

      if (p.dataType === 'string') variable = new VariableString(v, p);
      else if (p.dataType === 'bool') variable = new VariableBool(v, p);
      else if (p.dataType === 'num' || p.dataType === 'dnum') variable = new VariableNum(v, p);
      else if (p.dataType === 'robtarget') variable = new VariableRobTarget(v, p);
      else if (p.dataType === 'jointtarget') variable = new VariableJointTarget(v, p);
      else variable = new Variable(v, p);

      return variable;
    };

    /**
     * Get the data type of a variable
     * @alias getVariableType
     * @memberof API.RAPID
     * @param {string} module the module name that the variable locates inside
     * @param {string} name The variable name
     * @param {string} task The task nameS
     * @example
     * let type = await API.RAPID.getVariableType("MainModule","aa");
     */
    this.getVariableType = async function (module, name, task = 'T_ROB1') {
      try {
        const v = await RWS.Rapid.getData(task, module, name);
        const p = await v.getProperties();
        return p.dataType;
      } catch (error) {
        return '';
      }
    };

    /**
     * Get the properties of a variable
     * @alias getVariableProperties
     * @memberof API.RAPID
     * @param {string} module the module name that the variable locates inside
     * @param {string} name The variable name
     * @param {string} task The task nameS
     * @example
     * let props = await API.RAPID.getVariableProperties("MainModule","aa");
     */
    this.getVariableProperties = async function (module, name, task = 'T_ROB1') {
      try {
        const v = await RWS.Rapid.getData(task, module, name);
        const p = await v.getProperties();
        return p;
      } catch (error) {
        return {};
      }
    };

    /**
     * Get the value of a variable
     * @alias getVariableValue
     * @memberof API.RAPID
     * @param {string} module the module name that the variable locates inside
     * @param {string} name The variable name
     * @param {string} task The task nameS
     * @example
     * let value = await API.RAPID.getVariableValue("MainModule","aa");
     */
    this.getVariableValue = async function (module, name, task = 'T_ROB1') {
      let variable = await API.RAPID.createVariableInstance(module, name, task);
      let value = await variable.getValue();
      return value;
    };

    /**
     * Set the value of a variable
     * @alias setVariableValue
     * @memberof API.RAPID
     * @param {string} module the module name that the variable locates inside
     * @param {string} name The variable name
     * @param {string} task The task nameS
     * @param {boolean} syncPers Sync the variable immediately vale if true, ortherwise the variable value will be synchronized until the next sync action; Set to false if controller in running execution status;
     * @example
     * await API.RAPID.setVariableValue("MainModule","aa", 2,"T_ROB1",{syncPers:true});
     */
    this.setVariableValue = async function (module, name, value, task = 'T_ROB1', {syncPers = false} = {}) {
      try {
        let variable = await API.RAPID.createVariableInstance(module, name, task);
        // For variable whose data type is not string, the value is considered as raw value when the value type is string;
        if (
          typeof value == 'string' &&
          (variable.props.dataType != 'string' ||
            (variable.props.dataType == 'string' && variable.props.dimensions.length > 0))
        ) {
          await variable.setRawValue(value);
        } else {
          await variable.setValue(value);
        }
        if (syncPers) {
          await RWS.Mastership.request();
          await API.RWS.RAPID.syncPers(module); // don't know why it is needed twice
          await API.RWS.RAPID.syncPers(module);
        }
        //TComponents.Popup_A.info('Successfully update value!');
      } catch (err) {
        // TComponents.Popup_A.error(err, 'Failed to update value!');
        console.log(err);
        throw err;
      } finally {
        if (syncPers) {
          const bHeldEditMasterShip = await API.RWS.checkIfHeldMastership();
          if (bHeldEditMasterShip) {
            await RWS.Mastership.release();
          }
        }
      }
    };

    this.unsubscribeVariable = function (task, module, name) {
      const refName = task + ':' + module + ':' + name;
      let entry = this.subscriptions.get(refName);
      if (entry && --entry.count === 0) {
        entry.variable.unsubscribe();
        this.subscriptions.delete(refName);
      }
    };

    /**
     * Subscribe to a existing RAPID variable.
     * @alias getVariableInstance
     * @memberof API.RAPID
     * @param {string} task  - RAPID Task in which the variable is contained
     * @param {string} module -RAPID module where the variable is contained
     * @param {string} name - name of RAPID variable
     * @param {boolean} subscribe - subscribe to variable, default is true
     * @returns RWS.RAPID Data object
     * @private
     */
    const getVariableInstance = async (task, module, name, subscribe = true) => {
      if (task && module && name) {
        try {
          const refName = task + ':' + module + ':' + name;
          let entry = this.subscriptions.get(refName);

          if (entry) {
            entry.count++;
            return entry.variable;
          } else {
            let newVariable = await this.createVariableInstance(module, name, task);

            // double check case parallel async subscriptions just happened
            let entry = this.subscriptions.get(refName);
            if (!entry) {
              if (API.isSubscriptionBlocked) {
                Logger.w(logModule, `API.RAPID: Subscription disabled, variable: ${refName}`);
              } else {
                if (subscribe) {
                  this.subscriptions.set(refName, {variable: newVariable, count: 1});
                  if (newVariable.symbolType !== 'constant') newVariable.subscribe();
                }
              }
              return newVariable;
            } else {
              return entry.variable;
            }
          }
        } catch (e) {
          return API.rejectWithStatus(`Failed to subscribe to variable ${name} at ${task}->${module} module.`, e);
        }
      }
    };
    /**
     * Subscribe to a existing RAPID variable.
     * @alias getVariable
     * @memberof API.RAPID
     * @param {string} task  - RAPID Task in which the variable is contained
     * @param {string} module -RAPID module where the variable is contained
     * @param {string} name - name of RAPID variable
     * @param {boolean} subscribe - subscribe to variable, default is true
     * @returns {API.RAPID.Variable}
     */
    this.getVariable = getVariableInstance;

    /**
     * Gets an instance of a API.RAPID.Task class
     * @alias getTask
     * @memberof API.RAPID
     * @param {string} task - Task name
     * @returns {Promise<object>} - API.RAPID.Task
     * @example
     * await API.RAPID.getTask();
     */
    this.getTask = async function (task = 'T_ROB1') {
      const t = await RWS.Rapid.getTask(task);
      return new Task(t);
    };

    /**
     * Load a module from the controller HOME files
     * @alias loadModule
     * @memberof API.RAPID
     * @param {string} path Path to the module file in
     * the HOME directory (included extension of the module).
     * @param {boolean} replace If true, it will replace an existing module in RAPID with the same name
     * @param {string} taskName Task's name where the module belongs to
     * @example
     * let url = `${this.path}/${this.name}${this.extension}`;
     * await task.loadModule(url, true);
     */
    const loadModule = async function (path, replace = false, taskName = 'T_ROB1') {
      await API.RWS.RAPID.loadModule.apply(null, arguments);
    };
    this.loadModule = loadModule;

    /**
     * Get RAPID Module Text
     * @param {string} moduleName
     * @param {string} taskName
     * @returns {Promise<string>} containing the module text
     * @example
     * await API.RAPID.getModuleText("MainModule");
     */
    this.getModuleText = async function (moduleName, taskName = 'T_ROB1') {
      try {
        const res = await API.RWS.RAPID.getModuleText(moduleName, taskName);

        const moduleText = res['module-text'];
        if (moduleText) return moduleText;

        const filePath = res['file-path'];
        const fileContent = await API.FILESYSTEM.getFile(filePath);
        await API.FILESYSTEM.deleteFile(filePath);
        return fileContent;
      } catch (e) {
        API.rejectWithStatus(`Failed to get ${taskName}:${moduleName} text.`, e);
      }
    };

    /**
     * Set RAPID Module Text
     * @param {string} moduleName The module name
     * @param {string} text The text to write
     * @param {string} taskName The task name
     * @example
     * await API.RAPID.setModuleText("Module1",`MODULE Module1\r\nPROC proc1()\r\nTPWrite "123";\r\nENDPROC\r\nENDMODULE`);
     */
    this.setModuleText = async function (moduleName, text, taskName = 'T_ROB1') {
      try {
        await API.RWS.requestMastership('edit');
        await API.RWS.RAPID.setModuleText(moduleName, text, taskName);
        await API.RWS.releaseMastership('edit');
      } catch (e) {
        API.rejectWithStatus(`Failed to set ${taskName}:${moduleName} text.`, e);
      }
    };

    /**
     * Unload a RAPI module
     * @alias unloadModule
     * @memberof API.RAPID
     * @param {string} moduleName
     * @param {string} [taskName]
     * @example
     * await API.RAPID.unloadModule("Module1")
     */
    const unloadModule = async function (moduleName, taskName = 'T_ROB1') {
      // await API.RWS.requestMastership('edit');
      await API.RWS.RAPID.unloadModule.apply(null, arguments);
      // await API.RWS.releaseMastership('edit');
    };
    this.unloadModule = unloadModule;

    /**
     * Prepare actions before executing program / procedure
     */
    const prepareExecution = async function (setPP = true, moduleName = '', procName = '', taskName = 'T_ROB1') {
      let exeState = await RWS.Rapid.getExecutionState();
      if (exeState === RWS.Rapid.ExecutionStates.running) {
        throw new Error('Already in running status');
      }

      let ctrlState = await RWS.Controller.getControllerState();
      if (ctrlState !== API.CONTROLLER.STATE.MotorsOn) {
        throw new Error('Turn on the motors to execute procedure');
      }

      let bExecuteProc = moduleName && procName;
      if (bExecuteProc) {
        await API.RAPID.setPPToRoutine(moduleName, procName, taskName);
      } else {
        let pcpRes = await API.RAPID.getProgramPointer();
        if (!pcpRes['moduleName']) {
          if (setPP) {
            await API.RAPID.setPPToMain();
          } else {
            throw new Error('Cannot start execution as program pointer has not been set');
          }
        }
      }
    };

    /**
     * Set cycle mode
     * @alias setCycleMode
     * @memberof API.RAPID
     * @param {string} cycleMode 'forever' | 'once'
     * @example
     * await API.RAPID.setCycleMode("once")
     */
    this.setCycleMode = async function (cycleMode = 'once') {
      try {
        await RWS.Mastership.request();
        await API.RWS.RAPID.setCycleMode(cycleMode);
      } catch (e) {
        return API.rejectWithStatus(`Set cycle mode failed.`, e);
      } finally {
        await RWS.Mastership.release();
      }
    };

    /**
     * Restore cycle mode after program execution is stopped
     */
    const restoreCycleAfterProgramExecution = async function (preCycleMode, taskName = 'T_ROB1') {
      if (r.isSubscriptionBlocked) {
        Logger.w(logModule, 'API.RAPID: Subscription disabled, monitor execution status');
        return;
      }
      const monitor = RWS.Rapid.getMonitor(RWS.Rapid.MonitorResources.execution, taskName);
      const executionCallback = async function (data) {
        Logger.i(logModule, `program execution status: ${data}`);
        if (data == RWS.Rapid.ExecutionStates.stopped) {
          try {
            // restore cycle mode
            await API.RAPID.setCycleMode(preCycleMode);
            // unsubscribe resource after program stopped
            await monitor.unsubscribe();
          } catch (e) {
            return API.rejectWithStatus(`Restore cycle mode failed`, e);
          }
        }
      };
      // subscribe program execution status
      monitor.addCallbackOnChanged(executionCallback.bind(this));
      await monitor.subscribe();
    };

    /**
     * Start program execution
     * @alias startExecution
     * @memberof API.RAPID
     * @param {string} cycleMode cycle mode: forever|asis|once
     * @param {string} execMode execution mode: continue|stepin|stepover|stepout|stepback|steplast|stepmotion
     * @param {string} regainMode regain mode: continue|regain|clear
     * @param {boolean} setPP set program pointer to main if has no pp
     * @param {string} moduleName module name
     * @param {string} procName procedure name
     * @param {string} taskName task name
     * @example
     * let url = `${this.path}/${this.name}${this.extension}`;
     * await task.loadModule(url, true);
     */
    this.startExecution = async function ({
      cycleMode = 'once',
      execMode = 'continue',
      regainMode = 'continue',
      setPP = true,
      moduleName = '',
      procName = '',
      taskName = 'T_ROB1',
    } = {}) {
      // get current cycle mode
      let preCycleMode = await API.RWS.RAPID.getCycleMode();
      let cycle = cycleMode;

      await prepareExecution(setPP, moduleName, procName, taskName);

      try {
        await RWS.Rapid.startExecution({regainMode: regainMode, executionMode: execMode, cycleMode: cycle});
        await restoreCycleAfterProgramExecution(preCycleMode, taskName);
      } catch (error) {
        let executionState = await RWS.Rapid.getExecutionState();
        if (executionState == RWS.Rapid.ExecutionStates.running) {
          Logger.i(logModule, 'Regain is performing');
        } else {
          Logger.e(logModule, 'start program execution failed');
        }
      }
    };

    /**
     * @typedef stopExecutionProps
     * @prop {RWS.Rapid.StopModes} [stopMode] stop mode, valid values: 'cycle', 'instruction', 'stop' or 'quick_stop'
     * @prop {RWS.Rapid.UseTSPOptions.normal} [useTSP] use task selection panel, valid values: 'normal' or 'all_tasks'
     * @memberof API.RAPID
     */

    /**
     * Stops the Rapid execution with the settings given in the parameter object. All or any of the defined parameters can be supplied, if a value is omitted a default value will be used. The default values are:
     * stopMode = 'stop'
     * useTSP = 'normal'
     * @alias stopExecution
     * @memberof API.RAPID
     * @param {stopExecutionProps} props
     * @example
     * await API.RAPID.stopExecution();
     */
    this.stopExecution = async function ({
      stopMode = RWS.Rapid.StopModes.stop,
      useTSP = RWS.Rapid.UseTSPOptions.normal,
    } = {}) {
      var state = await RWS.Rapid.getExecutionState();
      if (state === RWS.Rapid.ExecutionStates.running) {
        await RWS.Rapid.stopExecution({
          stopMode,
          useTSP,
        });
      }
    };

    /**
     * Search all routines
     * @alias searchRoutines
     * @memberof API.RAPID
     * @param {boolean} allread include non-service routines if set true
     * @param {string} taskName task name
     * @returns {Promise<API.RAPID.routines[]>} a list of API.RAPID.routines
     * @example
     * await task.searchRoutines();
     */
    this.searchRoutines = async function (allread = true, taskName = 'T_ROB1') {
      // check execution status
      let exeState = await RWS.Rapid.getExecutionState();
      if (exeState === RWS.Rapid.ExecutionStates.running) {
        throw new Error('Cannot update routines during program execution');
      }
      let searchedResult = null;
      let searchFlag = false;
      let exturl = 'tasks/' + taskName + '/serviceroutine?';
      let result = [];
      try {
        while (!searchFlag) {
          let routineRes = await API.RWS.RAPID.getServiceRoutines(exturl, allread);
          let routines = routineRes['state'];

          for (const key in routines) {
            let url2RoutineArr = routines[key]['url-to-routine'].split('/');
            result.push({
              routineName: routines[key]['routine_name'],
              moduleName: url2RoutineArr[2],
              taskName: url2RoutineArr[1],
              bServiceRoutine: routines[key]['service-routine'] == 'TRUE',
            });
          }

          // Check if there's next page
          if (typeof routineRes._links.next == 'undefined') {
            searchFlag = true;
          } else {
            exturl = routineRes._links.next.href + (allread ? '&' : '');
          }
        }
        return result;
      } catch (error) {
        Logger.e(logModule, 'Search routine failed');
        throw new Error('Search routines failed');
      }
    };
  })();

  r.constructedRapid = true;
};

if (typeof API.constructedRapid === 'undefined') {
  factoryApiRapid(API);
}

export default API;
