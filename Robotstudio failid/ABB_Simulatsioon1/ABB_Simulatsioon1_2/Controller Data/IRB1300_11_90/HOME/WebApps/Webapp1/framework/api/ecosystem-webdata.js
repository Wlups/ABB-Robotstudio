// used to append interfaces to omnicore sdk so that created app and AppStudio can use
import API from './ecosystem-base.js';
import {Logger} from './../function/log-helper.js';

const factoryApiWebdataMonitor = function (es) {
  const logModule = 'ecosystem-webdata';

  /**
   * @alias API.WEBDATAMONITOR
   * @namespace
   */
  es.WEBDATAMONITOR = new (function () {
    this.STATE = {};
    this.$on = [];

    this.createResourceName = function (key) {
      const name = `webdata-${key}`;
      this.$on.push(name);
      this.$on = [...new Set(this.$on)];
      return name;
    };

    this.splitKey = function (key = 'App.a') {
      Logger.i(logModule, `splitKey: ${key}`);
      return key
        .split('.')
        .map((k) => `['${k}']`)
        .join('');
    };

    this.initState = function (state) {
      Object.assign(this.STATE, state);
    };

    /**
     * Unsubscribes from the variable state
     *
     */
    this.unsubscribeAll = function () {
      this.$on.forEach((name) => {
        es._events.off(name);
      });
      this.$on = [];
    };

    /**
     * Subscribe to 'webdata'.
     * @alias monitorWebdata
     * @memberof API.WEBDATAMONITOR
     * @param {string} [key] - key the variable want to subscribe
     * @param {function} [callback] - callback function called when variable changes
     *
     * @example
     * API.WEBDATAMONITOR.monitorWebdata(
     *  "App.page.LayoutInfo_1.mode",
     *  (v)=>{
     *    console.log(v);
     *  }
     * )
     */
    this.monitorWebdata = async function (key = 'App.a', callback = null) {
      Logger.i(logModule, `splitKey: ${key}`);
      //read the state the first time
      if (typeof callback === 'function') {
        const keys = this.splitKey(key);
        const value = eval(`this.STATE${keys}`);
        //这里是防止上一个render还没有结束就立即通过callback触发一个新的render导致渲染出错
        //dynamicText-monitorWebdata-appendChild,确保一个render流程走完再触发新的render
        setTimeout(() => {
          callback(value);
        });
      }

      if (es.isSubscriptionBlocked) {
        Logger.w(logModule, 'API.Webdata: Subscription disabled, monitor webdata');
        return;
      }

      es._events.on(this.createResourceName(key), callback);
    };

    /**
     * update the variable's value of state.
     * @alias setWebdata
     * @memberof API.WEBDATAMONITOR
     * @param {string} [key] - key the variable of the state
     * @param {string} [value] - value the value wante to update
     *
     * @example
     * API.WEBDATAMONITOR.setWebdata(
     *  "App.page.LayoutInfo_1.mode",
     *   "manual"
     * )
     *
     */
    this.setWebdata = function (key = 'App.a', value) {
      //Reminder:the variable user got from codeEditor is "Webdata.App.a"
      const filterKey = key.replace('Webdata.', '');
      const keys = this.splitKey(filterKey);
      if (isNaN(value)) {
        eval(`this.STATE${keys} = "${value}"`);
      } else {
        eval(`this.STATE${keys} = ${value}`);
      }
      es._events.trigger(this.createResourceName(filterKey), value);
    };

    /**
     * get the variable's value of state.
     * @alias getWebdata
     * @memberof API.WEBDATAMONITOR
     * @param {string} [key] - key the variable of the state
     * @param {string} [value] - value the value wante to update
     *
     * @example
     * const webdataMode = API.WEBDATAMONITOR.getWebdata("App.page.LayoutInfo_1.mode");
     * console.log(webdataMode)
     *
     */
    this.getWebdata = function (key = 'App.a') {
      const keys = this.splitKey(key);
      return eval(`this.STATE${keys}`);
    };
  })();

  es.constructedWebdataMonitor = true;
};

if (typeof API.constructedWebdataMonitor === 'undefined') {
  factoryApiWebdataMonitor(API);
}

export default API;
export {factoryApiWebdataMonitor};
