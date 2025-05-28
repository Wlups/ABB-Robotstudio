// used to append interfaces to omnicore sdk so that created app and AppStudio can use
import API from './ecosystem-base.js';
import {Logger} from './../function/log-helper.js';

const factoryApiVariableMonitor = function (es) {
  const logModule = 'ecosystem-variable';

  /**
   * @alias API.VARIABLEMONITOR
   * @namespace
   */
  es.VARIABLEMONITOR = new (function () {
    const subscribeRes = async function (variable, func) {
      try {
        if (es.isSubscriptionBlocked) {
          Logger.w(logModule, 'API.VARIABLEMONITOR: Subscription disabled, monitor variable');
          return;
        }
        variable.addCallbackOnChanged(func);
        await variable.subscribe();
      } catch (e) {
        return API.rejectWithStatus(`Subscription to ${variable.symbolName} failed.`, e);
      }
    };

    /**
     * Subscribe to rapid variable
     * @alias monitorVariable
     * @memberof API.VARIABLEMONITOR
     * @param {object} [variableObj] - the description of variable
     * @param {function} [callback] - Callback function called when variable changes
     *
     * @example
     * API.VARIABLEMONITOR.monitorVariable(
     *  {type: 'tooldata', task: 'task1', module: 'module1', name: 'Wobj_1'},
     *  (v)=>{
     *    console.log(v);
     *  }
     * )
     */
    this.monitorVariable = async function (
      variableObj = {type: 'tooldata', task: 'task1', module: 'module1', name: 'Wobj_1'},
      callback = null,
    ) {
      const resourceName = `${variableObj.type}-${variableObj.task}-${variableObj.module}-${variableObj.name}`;

      //read the state the first time
      const variableData = await RWS.Rapid.getData(variableObj.task, variableObj.module, variableObj.name);
      typeof callback === 'function' && callback(await variableData.getRawValue());
      if (this[resourceName] === undefined) {
        try {
          //Remind:这一块是为了修复，初始化时候一个信号被订阅了多次的bug，因为没有赋值，会在初始化的时候重复订阅
          this[resourceName] = 'initialize value';
          const cbVariable = function (data) {
            Logger.i(logModule, `Variable value: ${data}`);
            this[resourceName] = data || '';
            es._events.trigger(resourceName, this[resourceName]);
            Logger.i(logModule, `Triggered variable value:${this[resourceName]}`);
          };
          Logger.i(logModule, `Subscribed variable: ${resourceName}`);
          subscribeRes(variableData, cbVariable.bind(this));
        } catch (e) {
          return API.rejectWithStatus('Failed to subscribe variable', e);
        }
      }

      es._events.on(resourceName, callback);
    };
  })();

  es.constructedVariableMonitor = true;
};

if (typeof API.constructedVariableMonitor === 'undefined') {
  factoryApiVariableMonitor(API);
}

export default API;
export {factoryApiVariableMonitor};
