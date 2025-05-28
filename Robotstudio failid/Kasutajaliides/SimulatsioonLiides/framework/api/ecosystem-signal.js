// used to append interfaces to omnicore sdk so that created app and AppStudio can use
import API from './ecosystem-base.js';
import {Logger} from './../function/log-helper.js';

const factoryApiSignalMonitor = function (es) {
  const logModule = 'ecosystem-signal';

  /**
   * @alias API.SIGNALMONITOR
   * @namespace
   */
  es.SIGNALMONITOR = new (function () {
    /**
     * Enum for Monitor resources
     */
    this.MonitorResources = {
      'digital-signal': 'digital-signal',
    };

    const subscribeRes = async function (signal, func) {
      try {
        if (es.isSubscriptionBlocked) {
          Logger.w(logModule, 'API.Signal: Subscription disabled, monitor signal');
          return;
        }
        signal.addCallbackOnChanged(func);
        await signal.subscribe();
      } catch (e) {
        return API.rejectWithStatus(`Subscription to ${signal.getName()} failed.`, e);
      }
    };

    /**
     * Subscribe to digital-signal
     * @alias monitorDigitalSignal
     * @memberof API.SIGNALMONITOR
     * @param {object} [variableObj] - the description of signal
     * @param {function} [callback] - Callback function called when signal changes
     *
     * @example
     * API.SIGNALMONITOR.monitorDigitalSignal(
     *  {type: 'digitalsignal', name: 'ManualMode'},
     *  (v)=>{
     *    console.log(v);
     *  }
     * )
     */
    this.monitorDigitalSignal = async function (
      signalObj = {type: 'digitalsignal', name: 'ManualMode'},
      callback = null,
    ) {
      const resourceName = `${signalObj.type}-${signalObj.name}`;

      //read the state the first time
      var signalData = await API.SIGNAL.getSignal(signalObj.name);
      typeof callback === 'function' && callback(await signalData.signal.getValue());

      if (this[resourceName] === undefined) {
        try {
          //Remind:这一块是为了修复初始化时候一个信号被订阅了多次的bug，因为没有赋值，会在初始化的时候重复订阅
          this[resourceName] = 'initialize value';
          const cbDigitalSignal = function (data) {
            Logger.i(logModule, `Signal value:${data}`);
            this[resourceName] = data.toString() || '';
            es._events.trigger(resourceName, this[resourceName]);
            Logger.i(logModule, `Triggered signal value:${this[resourceName]}`);
          };
          Logger.i(logModule, `Signal subscribed:${resourceName}`);
          subscribeRes(signalData.signal, cbDigitalSignal.bind(this));
        } catch (e) {
          return API.rejectWithStatus('Failed to subscribe signal', e);
        }
      }
      es._events.on(resourceName, callback);
    };
  })();

  es.constructedSignalMonitor = true;
};

if (typeof API.constructedSignalMonitor === 'undefined') {
  factoryApiSignalMonitor(API);
}

export default API;
export {factoryApiSignalMonitor};
