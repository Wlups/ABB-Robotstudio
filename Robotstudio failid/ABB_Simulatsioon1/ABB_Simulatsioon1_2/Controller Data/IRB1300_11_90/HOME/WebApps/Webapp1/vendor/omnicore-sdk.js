// App SDK 1.5.0

// Copyright (c) 2020-2024 ABB

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software (the "Software"), to deal in the Software without
// restriction, including without limitation the rights to use, copy, modify,
// merge, publish, distribute, sublicense, and/or sell copies of the Software,
// and to permit persons to whom the Software is furnished to do so, subject to
// the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// The manuals related to the Software and the information therein are not
// included in these permissions and must not be reproduced, distributed,
// copied, or disclosed to third parties without ABB's written permission.
// ABB reserves all rights regarding Intellectual Property Rights in such
// manuals and information therein.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.

'use strict';

var App = App || {};

if (typeof App.constructed === 'undefined') {
  (function (o) {
    o.APP_LIB_VERSION = '1.5.0';
    const init = () => {};
    window.addEventListener('load', init, false);
    const isWebView = () => {
      return (
        ('chrome' in window && 'webview' in window.chrome && 'postMessage' in window.chrome.webview) ||
        ('external' in window && 'notify' in window.external)
      );
    };
    const postWebViewMessage = (message) => {
      if ('chrome' in window && 'webview' in window.chrome && 'postMessage' in window.chrome.webview) {
        window.chrome.webview.postMessage(message);
      } else if ('external' in window && 'notify' in window.external) {
        window.external.notify(message);
      } else {
        throw new Error('Could not post WebView message, WebView not recognized.');
      }
    };
    o.setBusyState = function (state) {
      let busyFlag = 'false';
      if (state == true) {
        busyFlag = 'true';
      }
      if (isWebView()) {
        postWebViewMessage(`IsBusy ${busyFlag}`);
      }
    };
    let onGetAppTypeListeners = [];
    o.getTpuType = function () {
      if (isWebView()) {
        let listener = {
          promise: null,
          resolve: null,
          reject: null,
        };
        listener.promise = new Promise((resolve, reject) => {
          listener.resolve = resolve;
          listener.reject = reject;
          setTimeout(() => {
            var temp = [];
            let length = onGetAppTypeListeners.length;
            for (let iii = 0; iii < length; iii++) {
              let item = onGetAppTypeListeners.shift();
              if (item !== listener) {
                temp.push(item);
              }
            }
            onGetAppTypeListeners = temp;
            reject('Request timed out.');
          }, 3e3);
        });
        onGetAppTypeListeners.push(listener);
        postWebViewMessage('GetTpuType');
        return listener.promise;
      } else {
        let response = JSON.stringify({
          isTpu: false,
          machineName: '',
        });
        return Promise.resolve(response);
      }
    };
    o.onGetTpuType = async (data) => {
      let length = onGetAppTypeListeners.length;
      for (let iii = 0; iii < length; iii++) {
        onGetAppTypeListeners.shift().resolve(data);
      }
    };
    o.Interaction = new (function () {
      this.closeApp = function () {
        if (isWebView()) {
          postWebViewMessage('CloseApp');
        }
      };
      let activeMessage = null;
      this.onSendMessageResponse = async (data) => {
        if (activeMessage === null) {
          console.log('No active message.');
        }
        activeMessage.resolve(data);
        activeMessage = null;
      };
      this.sendMessage = function (message) {
        const checkMessage = (msg) => {
          if (msg.hasOwnProperty('AppName') === false) {
            console.error(`'AppName' not present in message.`);
            return false;
          }
          if (msg.hasOwnProperty('Message') === false) {
            console.error(`'Message' not present in message.`);
            return false;
          }
          return true;
        };
        if (isWebView()) {
          if (checkMessage(message) === false) {
            return Promise.reject('Message is not of supported type.');
          }
          let listener = {
            promise: null,
            resolve: null,
            reject: null,
          };
          listener.promise = new Promise((resolve, reject) => {
            listener.resolve = resolve;
            listener.reject = reject;
            setTimeout(() => {
              activeMessage = null;
              reject('Request timed out.');
            }, 3e3);
          });
          activeMessage = listener;
          let messageString = JSON.stringify(message);
          postWebViewMessage(`SendMessage ${messageString}`);
          return listener.promise;
        } else {
          return Promise.reject('Messages not supported.');
        }
      };
      this.onMessageReceived = async (info) => {
        let status = '';
        if (typeof appMessageReceived === 'function') {
          try {
            await Promise.resolve(appMessageReceived(info))
              .then((x) => {
                if (x == true) return Promise.resolve();
                return Promise.reject();
              })
              .then(() => (status = ''))
              .catch(() => (status = "'appMessageReceived' failed."));
          } catch (error) {
            console.error(
              `onMessageReceived failed to execute, function 'appMessageReceived' may be faulty. >>> ${error}`,
            );
            status = "'appMessageReceived' failed to execute.";
          }
        } else {
          status = "'appMessageReceived' not found.";
          console.error(status);
        }
        if (isWebView()) {
          postWebViewMessage(`SendMessageResponse ${status}`);
        }
      };
      let activeRequest = null;
      this.onNavigateToResponse = (data) => {
        if (activeRequest === null) {
          console.log('No active request.');
          return Promise.reject('No active request.');
        }
        try {
          let status = JSON.parse(data);
          if (status.Success === true) {
            activeRequest.resolve();
          } else {
            let s = `Request failed, '${status.Reason}'.`;
            console.log(s);
            activeRequest.reject(s);
          }
          activeRequest = null;
        } catch (exception) {
          activeRequest.reject(exception.message);
          activeRequest = null;
          console.error(`Exception: ${exception.message}`);
        }
      };
      this.sendNavigateToRequest = (info) => {
        if (activeRequest !== null) {
          console.warn('Request already active.');
          return Promise.reject('Request already active.');
        }
        if (isWebView()) {
          let listener = {
            promise: null,
            resolve: null,
            reject: null,
          };
          listener.promise = new Promise((resolve, reject) => {
            listener.resolve = resolve;
            listener.reject = reject;
          });
          activeRequest = listener;
          let infoText = JSON.stringify(info);
          postWebViewMessage(`NavigateTo ${infoText}`);
          return listener.promise;
        } else {
          return Promise.reject('No external window.');
        }
      };
      this.onNavigateTo = async (info) => {
        let navigateToStatus = '';
        if (typeof appNavigateTo === 'function') {
          try {
            await Promise.resolve(appNavigateTo(info))
              .then((x) => {
                if (x == true) return Promise.resolve();
                return Promise.reject();
              })
              .then(() => (navigateToStatus = ''))
              .catch(() => (navigateToStatus = "'appNavigateTo' failed."));
          } catch (error) {
            console.error("onNavigateTo failed to execute, function 'appNavigateTo' may be faulty.");
          }
        } else {
          navigateToStatus = "'appNavigateTo' not found.";
          console.error(navigateToStatus);
        }
        if (isWebView()) {
          postWebViewMessage(`NavigateToResponse ${navigateToStatus}`);
        }
      };
    })();
    o.Activation = new (function () {
      this.onActivate = async () => {
        let activateStatus = 'false';
        if (typeof appActivate === 'function') {
          try {
            await Promise.resolve(appActivate())
              .then((x) => {
                if (x == true) return Promise.resolve();
                return Promise.reject();
              })
              .then(() => (activateStatus = 'true'))
              .catch(() => (activateStatus = 'false'));
          } catch (error) {
            console.error("onActivate failed to execute, function 'appActivate' may be faulty.");
          }
        } else {
          activateStatus = 'true';
        }
        if (isWebView()) {
          postWebViewMessage(`Activated ${activateStatus}`);
        }
      };
      this.onDeactivate = async () => {
        let deactivateStatus = 'false';
        if (typeof appDeactivate === 'function') {
          try {
            await Promise.resolve(appDeactivate())
              .then((x) => {
                if (x == true) return Promise.resolve();
                return Promise.reject();
              })
              .then(() => (deactivateStatus = 'true'))
              .catch(() => (deactivateStatus = 'false'));
          } catch (error) {
            console.error("onDeactivate failed to execute, function 'appDeactivate' may be faulty.");
          }
        } else {
          deactivateStatus = 'true';
        }
        if (isWebView()) {
          postWebViewMessage(`Deactivated ${deactivateStatus}`);
        }
      };
    })();
    o.constructed = true;
  })(App);
  window['_onGetTpuType'] = App.onGetTpuType;
  window['_onNavigateTo'] = App.Interaction.onNavigateTo;
  window['_onNavigateToResponse'] = App.Interaction.onNavigateToResponse;
  window['_onSendMessage'] = App.Interaction.onMessageReceived;
  window['_onSendMessageResponse'] = App.Interaction.onSendMessageResponse;
  window['_onActivate'] = App.Activation.onActivate;
  window['_onDeactivate'] = App.Activation.onDeactivate;
}

// App SDK 1.5.0

// Copyright (c) 2020-2024 ABB

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software (the "Software"), to deal in the Software without
// restriction, including without limitation the rights to use, copy, modify,
// merge, publish, distribute, sublicense, and/or sell copies of the Software,
// and to permit persons to whom the Software is furnished to do so, subject to
// the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// The manuals related to the Software and the information therein are not
// included in these permissions and must not be reproduced, distributed,
// copied, or disclosed to third parties without ABB's written permission.
// ABB reserves all rights regarding Intellectual Property Rights in such
// manuals and information therein.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.

('use strict');

var RWS = RWS || {};

if (typeof RWS.constructedMain === 'undefined') {
  (function (o) {
    o.RWS_LIB_VERSION = '1.5.0';
    const HTTP_REQUEST_TIMEOUT = 3e4;
    const COMMON_TIMEOUT = 120;
    const VC_NOT_SUPPORTED = 'Not supported on virtual controller.';
    const SHARED_TAG = '%%SHARED%%';
    const UNASSIGNED_TAG = '%%UNASSIGNED%%';
    let debugType = 1;
    let debugSeverity = 2;
    let isVirtual = null;
    let isVirtualResolvers = [];
    const isWebView = () => {
      return (
        ('chrome' in window && 'webview' in window.chrome && 'postMessage' in window.chrome.webview) ||
        ('external' in window && 'notify' in window.external)
      );
    };
    const postWebViewMessage = (message) => {
      if ('chrome' in window && 'webview' in window.chrome && 'postMessage' in window.chrome.webview) {
        window.chrome.webview.postMessage(message);
      } else if ('external' in window && 'notify' in window.external) {
        window.external.notify(message);
      } else {
        throw new Error('Could not post WebView message, WebView not recognized.');
      }
    };
    o.isVirtualController = async () => {
      if (isVirtual === null) {
        const promise = new Promise((resolve) => {
          isVirtualResolvers.push(resolve);
        });
        await promise;
      }
      return isVirtual;
    };
    o.init = async () => {
      try {
        const res = await o.Network.get('/ctrl');
        let obj = null;
        try {
          obj = JSON.parse(res.responseText);
        } catch (error) {
          throw 'Could not parse JSON.';
        }
        for (const item of obj._embedded.resources) {
          if (item._type === 'ctrl-identity-info-li') {
            isVirtual = item['ctrl-type'] === 'Virtual Controller';
            window.setTimeout(() => {
              for (const resolver of isVirtualResolvers) {
                resolver();
              }
              isVirtualResolvers = [];
            }, 0);
            break;
          }
        }
        if (isVirtual === null) {
          throw 'No controller type found.';
        }
      } catch (err) {
        console.error(`Init failed to read controller type. >>> ${err}`);
      }
      o.Network.heartBeat();
      if (isWebView()) {
        postWebViewMessage('GetCookies');
      }
    };
    // window.addEventListener('load', o.init, false);
    o.__unload = false;
    let cleanupStarted = false;
    let creatingSubscriptionGroupAndWebSocket = null;
    const initiateCleanup = async function (initiatedByTPU = true) {
      if (cleanupStarted) {
        return;
      }
      let cleanupStatus = 'true';
      if (initiatedByTPU) {
        if (typeof appCleanUp === 'function') {
          try {
            cleanupStatus = (await appCleanUp()) ? 'true' : 'false';
          } catch (error) {
            cleanupStatus = 'false';
            console.error("onCleanUp failed to execute, function 'appCleanUp' may be faulty.");
          }
        }
      }
      if (!cleanupStarted) {
        cleanupStarted = true;
        if (initiatedByTPU) {
          await creatingSubscriptionGroupAndWebSocket;
        }
        let res;
        res = o.Mastership.releaseAll();
        if (initiatedByTPU) {
          try {
            await res;
          } catch (error) {
            console.error('Mastership.releaseAll failed. ' + JSON.stringify(error));
          }
        }
        res = o.MotionMastership.releaseAll();
        if (initiatedByTPU) {
          try {
            await res;
          } catch (error) {
            console.error('MotionMastership.releaseAll failed. ' + JSON.stringify(error));
          }
        }
        o.__unload = true;
        res = o.Subscriptions.unsubscribeToAll();
        if (initiatedByTPU) {
          try {
            await res;
          } catch (error) {
            console.error('Subscriptions.unsubscribeToAll failed. ' + JSON.stringify(error));
          }
          postWebViewMessage(`CleanedUp ${cleanupStatus}`);
        }
      }
    };
    window['_onAppSDKCleanup'] = initiateCleanup;
    window.addEventListener(
      'beforeunload',
      () => {
        initiateCleanup(false);
        return null;
      },
      false,
    );
    function encodePath(path) {
      let s = path.split('/');
      let p = '';
      for (let item of s) {
        p += encodeURIComponent(item) + '/';
      }
      return p.slice(0, -1);
    }
    function rejectWithStatus(message, item = {}) {
      let r = createStatusObject(message, item);
      return Promise.reject(r);
    }
    function createStatusObject(message, item = {}) {
      let r = {};
      try {
        let msg = '';
        if (typeof message === 'string' && message !== null) msg = message;
        r.message = msg;
        if (typeof item === 'Error') {
          if (r.message.length <= 0) r.message = `Exception: ${item.message}`;
          else r.message += ` >>> Exception: ${item.message}`;
        } else if (typeof item === 'string') {
          if (r.message.length <= 0) r.message = item;
          else r.message += ` >>> ${item}`;
        } else if (item.hasOwnProperty('message')) {
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
    o.setDebug = (dtype = 0, severity = 2) => {
      debugType = dtype;
      debugSeverity = severity;
    };
    o.isDebugActive = (x) => {
      return x >= debugSeverity;
    };
    o.writeDebug = (text, severity = 0) => {
      if (debugSeverity > severity) return;
      const getFileRef = (stack) => {
        let splits = stack.split('\n');
        let s = '';
        for (let iii = 2; iii < splits.length; iii++) {
          s = splits[iii].trim();
          if (s !== 'at Promise (native code)') break;
        }
        return s.slice(3);
      };
      let t = '';
      if (debugType === 1) {
        t = text;
      } else if (debugType === 2) {
        let s = getFileRef(new Error().stack);
        t = `${text}   [${s}]`;
      } else if (debugType === 3) {
        if (severity >= 3) {
          let errStack = new Error().stack;
          let splits = errStack.split('\n');
          let s = '';
          for (let iii = 2; iii < splits.length; iii++) {
            s += '   ' + splits[iii].trim().slice(3) + '\n';
          }
          t = `${text}\nCall stack:\n${s.trim()}`;
        } else {
          let s = getFileRef(new Error().stack);
          t = `${text}   [${s}]`;
        }
      }
      if (debugType > 0) {
        if (severity === 0) {
          console.log(t);
        } else if (severity === 1) {
          console.info(t);
        } else if (severity === 2) {
          console.warn(t);
        } else if (severity === 3) {
          console.error(t);
        }
      }
    };
    const isNonEmptyString = (x) => {
      if (x === null) return false;
      if (typeof x !== 'string') return false;
      if (x === '') return false;
      return true;
    };
    function verifyDataType(data, reference) {
      if (data === Object(data)) {
        if (reference !== Object(reference)) {
          return 'Unexpected data type.';
        }
        let s = '';
        for (let item of Object.keys(data)) {
          if (reference.hasOwnProperty(item) === true) {
            if (typeof data[item] !== typeof reference[item]) {
              s += `Unexpected data type, property '${item}'\n`;
            }
          } else {
            s += `Unexpected property '${item}'\n`;
          }
        }
        if (s.length > 0) s = s.slice(0, -1);
        return s;
      } else {
        if (typeof data !== typeof reference) {
          return 'Unexpected data type.';
        }
      }
      return '';
    }
    var errorCodeCache = {};
    function verifyReturnCode(json) {
      return new Promise((resolve, reject) => {
        try {
          if (json.hasOwnProperty('state') === false) return resolve(undefined);
          let errors = [];
          let returnValues = {};
          for (let iii = 0; iii < json.state.length; iii++) {
            let item = json.state[iii];
            for (let subitem in item) {
              if (item[subitem].hasOwnProperty('_links')) {
                let x1 = item[subitem]['_links'];
                if (x1.hasOwnProperty('error')) {
                  let x2 = x1['error'];
                  if (x2.hasOwnProperty('href')) {
                    let errUrl = x2['href'];
                    if (errorCodeCache.hasOwnProperty(errUrl)) {
                      returnValues[subitem] = errorCodeCache[errUrl];
                      continue;
                    }
                    errors.push(
                      o.Network.get(errUrl)
                        .then((x) => {
                          let obj = getReponseAsJSON(x);
                          let r = {
                            name: obj.state[0].name,
                            code: obj.state[0].code,
                            severity: obj.state[0].severity,
                            description: obj.state[0].description,
                          };
                          errorCodeCache[errUrl] = r;
                          returnValues[subitem] = r;
                          return Promise.resolve();
                        })
                        .catch((err) => {
                          let errStr = `Failed to get error code, url '${errUrl}'. >>> ${err}`;
                          o.writeDebug(errStr, 3);
                          return Promise.resolve();
                        }),
                    );
                  }
                }
              }
            }
          }
          if (errors.length > 0) {
            return Promise.all(errors).then(() => reject(returnValues));
          }
          if (Object.keys(returnValues).length > 0) {
            return reject(returnValues);
          }
          return resolve(undefined);
        } catch (error) {
          o.writeDebug(`Failed to get error code. >>> ${error}`, 2);
          return resolve(undefined);
        }
        return resolve(undefined);
      });
    }
    function verfifyErrorCode(text) {
      let code = '';
      try {
        let obj = parseJSON(text);
        if (typeof obj !== 'undefined') {
          if (obj.hasOwnProperty('status') === false || obj.status.hasOwnProperty('code') === false)
            throw new Error('JSON does not include status code.');
          code = obj.status.code;
        } else {
          o.writeDebug(`Could not parse JSON error code. >>> ${text}`, 2);
          if (text.startsWith('<?xml') === true) {
            let parser = new DOMParser();
            let data = parser.parseFromString(text, 'text/xml');
            let items = data.getElementsByTagName('div')[0].getElementsByTagName('span');
            for (let iii = 0; iii < items.length; iii++) {
              let className = items[iii].getAttribute('class');
              if (className === 'code') {
                code = items[iii].innerHTML;
                break;
              }
            }
          } else {
            let idx1 = text.indexOf('"code":');
            let idx2 = text.indexOf(', "msg":');
            if (idx1 >= 0 && idx2 >= 0 && idx2 > idx1) {
              code = text.substring(idx1 + 7, idx2);
            }
          }
          if (code == '') return Promise.resolve(undefined);
        }
      } catch (error) {
        let errStr = `Failed to get error code. >>> ${error}`;
        o.writeDebug(errStr, 0);
        return Promise.reject(errStr);
      }
      return getStatusCode(code);
    }
    function getStatusCode(code) {
      let url = `/rw/retcode?code=${encodeURIComponent(code)}`;
      if (errorCodeCache.hasOwnProperty(url)) {
        return Promise.resolve(errorCodeCache[url]);
      } else {
        return o.Network.get(url)
          .then((x) => {
            let obj = getReponseAsJSON(x);
            let r = {
              name: obj.state[0].name,
              code: obj.state[0].code,
              severity: obj.state[0].severity,
              description: obj.state[0].description,
            };
            errorCodeCache[url] = r;
            return Promise.resolve(r);
          })
          .catch((err) => {
            let errStr = `Failed to get error code, url '${errUrl}'. >>> ${err}`;
            o.writeDebug(errStr, 3);
            return Promise.reject(errStr);
          });
      }
    }
    function getReponseAsJSON(request) {
      return parseJSON(request.responseText);
    }
    function parseJSON(json) {
      try {
        return JSON.parse(json);
      } catch (error) {
        o.writeDebug(`Failed to parse JSON. >>> ${error}`, 0);
        return undefined;
      }
    }
    function requestMastership() {
      return o.Mastership.request()
        .then(() => Promise.resolve())
        .catch((err) => Promise.reject(rejectWithStatus('Could not get Mastership.', err)));
    }
    function releaseMastership() {
      return o.Mastership.release()
        .then(() => Promise.resolve())
        .catch((err) => {
          o.writeDebug(`Could not release Mastership. >>> ${err.message}`);
          return Promise.resolve();
        });
    }
    function requestMotionMastership() {
      return o.MotionMastership.request()
        .then(() => Promise.resolve())
        .catch((err) => Promise.reject(rejectWithStatus('Could not get motion mastership.', err)));
    }
    function releaseMotionMastership() {
      return o.MotionMastership.release()
        .then(() => Promise.resolve())
        .catch((err) => {
          o.writeDebug(`Could not release motion mastership. >>> ${err.message}`);
          return Promise.resolve();
        });
    }
    function waitProgressCompletion(location, timeout = 60) {
      if (isNaN(timeout) == true || timeout < 0) return Promise.reject('timeout not valid.');
      const checkProgress = (loops) => {
        if (loops <= 0) {
          let s = `${location} did not complete within ${timeout}s.`;
          return Promise.reject(s);
        }
        const wait1s = () => new Promise((resolve) => setTimeout(resolve, 1e3));
        return wait1s()
          .then(() => {
            return o.Network.get(location).then((res2) => {
              let json2 = parseJSON(res2.responseText);
              if (typeof json2 === 'undefined') return Promise.reject();
              let code = 0;
              let ready = false;
              for (const item of json2.state) {
                if (item._type === 'progress' && item.state === 'ready') {
                  ready = true;
                  code = item.code;
                  break;
                }
              }
              if (ready === true) return Promise.resolve(code);
              else return Promise.reject();
            });
          })
          .then((x1) => {
            return Promise.resolve(x1);
          })
          .catch(() => {
            return checkProgress(loops - 1);
          });
      };
      return checkProgress(timeout);
    }
    o.Rapid = new (function () {
      this.MonitorResources = {
        execution: 'execution',
        programPointer: 'program-pointer',
        motionPointer: 'motion-pointer',
        uiInstruction: 'uiinstr',
      };
      this.RegainModes = {
        continue: 'continue',
        regain: 'regain',
        clear: 'clear',
        enterConsume: 'enter_consume',
      };
      this.ExecutionModes = {
        continue: 'continue',
        stepIn: 'step_in',
        stepOver: 'step_over',
        stepOut: 'step_out',
        stepBackwards: 'step_backwards',
        stepToLast: 'step_to_last',
        stepToMotion: 'step_to_motion',
      };
      this.CycleModes = {
        forever: 'forever',
        asIs: 'as_is',
        once: 'once',
      };
      this.Conditions = {
        none: 'none',
        callChain: 'callchain',
      };
      this.StopModes = {
        cycle: 'cycle',
        instruction: 'instruction',
        stop: 'stop',
        quickStop: 'quick_stop',
      };
      this.UseTSPOptions = {
        normal: 'normal',
        allTasks: 'all_tasks',
      };
      this.SearchMethods = {
        block: 1,
        scope: 2,
      };
      this.SymbolTypes = {
        undefined: 0,
        constant: 1,
        variable: 2,
        persistent: 4,
        function: 8,
        procedure: 16,
        trap: 32,
        module: 64,
        task: 128,
        routine: 8 + 16 + 32,
        rapidData: 1 + 2 + 4,
        any: 255,
      };
      this.ExecutionStates = {
        running: 'running',
        stopped: 'stopped',
      };
      this.UiinstrEvents = {
        send: 'send',
        post: 'post',
        abort: 'abort',
      };
      this.UiinstrExecLevels = {
        user: 'user',
        normal: 'normal',
      };
      this.TaskTypes = {
        normal: 'normal',
        static: 'static',
        semistatic: 'semistatic',
        unknown: 'unknown',
      };
      this.TaskStates = {
        empty: 'empty',
        initiated: 'initiated',
        linked: 'linked',
        loaded: 'loaded',
        uninitialized: 'uninitialized',
      };
      this.TaskExecutionStates = {
        ready: 'ready',
        stopped: 'stopped',
        started: 'started',
        uninitialized: 'uninitialized',
      };
      this.TaskActiveStates = {
        on: 'on',
        off: 'off',
      };
      this.TaskTrustLevels = {
        sys_fail: 'sys_fail',
        sys_halt: 'sys_halt',
        sys_stop: 'sys_stop',
        none: 'none',
      };
      this.TaskExecutionLevels = {
        none: 'none',
        normal: 'normal',
        trap: 'trap',
        user: 'user',
        unknown: 'unknown',
      };
      this.TaskExecutionModes = {
        continous: 'continous',
        step_over: 'step_over',
        step_in: 'step_in',
        step_out_of: 'step_out_of',
        step_back: 'step_back',
        step_last: 'step_last',
        stepwise: 'stepwise',
        unknown: 'unknown',
      };
      this.TaskExecutionTypes = {
        none: 'none',
        normal: 'normal',
        interrupt: 'interrupt',
        external_interrupt: 'external_interrupt',
        user_routine: 'user_routine',
        event_routine: 'event_routine',
        unknown: 'unknown',
      };
      this.DataSymbolTypes = {
        constant: 'constant',
        variable: 'variable',
        persistent: 'persistent',
      };
      this.DataScopes = {
        local: 'local',
        task: 'task',
        global: 'global',
      };
      let abortingServiceRoutine = false;
      function Monitor(resource, task = '') {
        if (
          typeof resource !== 'string' ||
          (resource.toLowerCase() !== o.Rapid.MonitorResources.execution &&
            resource.toLowerCase() !== o.Rapid.MonitorResources.programPointer &&
            resource.toLowerCase() !== o.Rapid.MonitorResources.motionPointer &&
            resource.toLowerCase() !== o.Rapid.MonitorResources.uiInstruction)
        ) {
          o.writeDebug('Unable to create Rapid Monitor: Illegal resource.', 3);
          return;
        }
        if (
          task === null ||
          (resource !== o.Rapid.MonitorResources.execution &&
            resource !== o.Rapid.MonitorResources.uiInstruction &&
            task === '')
        ) {
          o.writeDebug('Unable to create Monitor: Illegal task.', 3);
          return;
        }
        let resourceName = resource;
        const urls = {
          execution: '/rw/rapid/execution',
          'program-pointer': `/rw/rapid/tasks/${encodeURIComponent(task)}/pcp`,
          'motion-pointer': `/rw/rapid/tasks/${encodeURIComponent(task)}/pcp`,
          uiinstr: '/rw/rapid/uiinstr/active',
        };
        const resourceStrings = {
          execution: '/rw/rapid/execution;ctrlexecstate',
          'program-pointer': `/rw/rapid/tasks/${encodeURIComponent(task)}/pcp;programpointerchange`,
          'motion-pointer': `/rw/rapid/tasks/${encodeURIComponent(task)}/pcp;motionpointerchange`,
          uiinstr: '/rw/rapid/uiinstr;uievent',
        };
        var callbacks = [];
        this.getTitle = function () {
          return urls[resourceName];
        };
        this.getResourceString = function () {
          return resourceStrings[resourceName];
        };
        this.addCallbackOnChanged = function (callback) {
          if (typeof callback !== 'function') throw new Error('callback is not a valid function');
          callbacks.push(callback);
        };
        this.onchanged = async function (newValue) {
          let parsedValue = {};
          switch (resourceName) {
            case 'execution':
              if (newValue.hasOwnProperty('ctrlexecstate')) parsedValue = newValue['ctrlexecstate'];
              break;

            case 'program-pointer':
            case 'motion-pointer':
              let pp = {};
              pp['moduleName'] = newValue.hasOwnProperty('module-name') ? newValue['module-name'] : '';
              pp['routineName'] = newValue.hasOwnProperty('routine-name') ? newValue['routine-name'] : '';
              pp['beginPosition'] = newValue.hasOwnProperty('BegPosLine') ? newValue.BegPosLine : '';
              if (newValue.hasOwnProperty('BegPosCol')) {
                pp['beginPosition'] += ',' + newValue.BegPosCol;
              }
              pp['endPosition'] = newValue.hasOwnProperty('EndPosLine') ? newValue.EndPosLine : '';
              if (newValue.hasOwnProperty('EndPosCol')) {
                pp['endPosition'] += ',' + newValue.EndPosCol;
              }
              pp['hasValue'] =
                pp['moduleName'] !== '' ||
                pp['routineName'] !== '' ||
                pp['beginPosition'] !== '' ||
                pp['endPosition'] !== '';
              parsedValue = pp;
              break;

            case 'uiinstr':
              let t = null;
              try {
                t = await processUIInstr(newValue);
              } catch (error) {
                o.writeDebug(`processUIInstr failed. >>> ${error.toString()}`, 2);
              }
              parsedValue = t;
              break;

            default:
              o.writeDebug(`Unhandled event, '${JSON.stringify(newValue)}'`);
              return;
          }
          for (let iii = 0; iii < callbacks.length; iii++) {
            try {
              callbacks[iii](parsedValue);
            } catch (error) {
              o.writeDebug(`Rapid.Monitor callback failed. >>> ${error.toString()}`, 3);
            }
          }
        };
        const processUIInstr = async (uiinstr) => {
          if (uiinstr.hasOwnProperty('instr') === false || uiinstr.hasOwnProperty('event') === false) {
            o.writeDebug(`Unhandled uiinstr event, '${JSON.stringify(uiinstr)}'`);
            return;
          }
          if (uiinstr['instr'] === 'UIMsgWrite') {
            o.writeDebug(`Unhandled uiinstr event, 'UIMsgWrite' not supported`);
            return;
          }
          let stack = uiinstr['stack'].split('/');
          let data = {
            instruction: uiinstr['instr'],
            event: uiinstr['event'].toLowerCase(),
            task: stack[1],
            message: uiinstr['msg'].replace(/^"/g, '').replace(/"$/g, ''),
            executionLevel: uiinstr['execlv'].toLowerCase(),
          };
          switch (uiinstr['event']) {
            case 'POST':
              data['id'] = '';
              break;

            case 'SEND':
              data['id'] = stack[2].slice(2);
              let t = `/rw/rapid/uiinstr/active/params/RAPID/${data.task}/%$${data.id}`;
              let callUrl = encodePath(t);
              await o.Network.get(callUrl)
                .then((res) => {
                  let obj = parseJSON(res.responseText);
                  if (typeof obj === 'undefined') return o.writeDebug('Could not parse JSON.');
                  let parameters = {};
                  for (const item of obj._embedded.resources) {
                    let val = getUIInstrData(item);
                    if (val !== null) parameters[item._title] = val;
                  }
                  data['parameters'] = parameters;
                })
                .catch((err) =>
                  o.writeDebug(
                    `Failed to get parameters for uiinstr event for instruction '${uiinstr['instr']}' >>> ${err}`,
                    2,
                  ),
                );
              break;

            case 'ABORT':
              data['id'] = stack[2].slice(2);
              break;

            default:
              o.writeDebug(`Unsupported uiinstr event '${uiinstr['event']}' for instruction '${uiinstr['instr']}'`);
              return;
          }
          return data;
        };
        const getUIInstrData = (item) => {
          if (item.hasOwnProperty('_type') === false || item._type !== 'rap-uiparams-li') return null;
          if (item.hasOwnProperty('_title') === false) return null;
          if (item.value === null) return null;
          let symbol = null;
          switch (item._title) {
            case 'Buttons':
            case 'Icon':
            case 'MaxTime':
            case 'BreakFlag':
            case 'TPAnswer':
            case 'InitValue':
            case 'MinValue':
            case 'MaxValue':
            case 'Increment':
            case 'ResultIndex':
              symbol = parseFloat(item.value);
              break;

            case 'TPCompleted':
            case 'Wrap':
            case 'DIpass':
            case 'DOpass':
            case 'PersBoolPassive':
            case 'AsInteger':
              symbol = item.value.toUpperCase() == 'TRUE';
              break;

            case 'Result':
            case 'Header':
            case 'Image':
            case 'InstrUsingIMessageBox':
            case 'TPText':
            case 'TPFK1':
            case 'TPFK2':
            case 'TPFK3':
            case 'TPFK4':
            case 'TPFK5':
            case 'InitString':
              symbol = item.value.replace(/^"/g, '').replace(/"$/g, '');
              break;

            case 'MsgArray':
            case 'BtnArray':
            case 'ListItems':
              symbol = JSON.parse(item.value);
              break;

            default:
              o.writeDebug(`Unhandled symbol type '${item._title}'`);
              return null;
          }
          return symbol;
        };
        const raiseEvent = async () => {
          const getValue = async () => {
            let rawValue = await o.Network.get(urls[resourceName])
              .then((x1) => {
                let obj = parseJSON(x1.responseText);
                if (typeof obj === 'undefined') return Promise.reject('Could not parse JSON.');
                return obj;
              })
              .catch((err) => {
                if (
                  err.hasOwnProperty('httpStatus') &&
                  err.httpStatus.hasOwnProperty('code') &&
                  err.httpStatus.code !== 404
                ) {
                  let s = JSON.stringify(err);
                  o.writeDebug(`Rapid.raiseEvent failed getting value. >>> ${s}`);
                }
                return null;
              });
            if (rawValue === null) return null;
            let parsedValue = null;
            switch (resourceName) {
              case 'execution':
                if (rawValue.hasOwnProperty('state') && rawValue['state'].length > 0) {
                  let state = rawValue['state'][0];
                  if (state.hasOwnProperty('ctrlexecstate')) {
                    parsedValue = state['ctrlexecstate'];
                  }
                }
                break;

              case 'program-pointer':
              case 'motion-pointer':
                let pointers = parsePointers(rawValue);
                if (resourceName === 'program-pointer') {
                  parsedValue = pointers.programPointer;
                } else {
                  parsedValue = pointers.motionPointer;
                }
                break;

              case 'uiinstr':
                if (rawValue.hasOwnProperty('state')) parsedValue = await processUIInstr(rawValue.state[0]);
                break;

              default:
                o.writeDebug(`Unsupported resource '${resourceName}'`);
                break;
            }
            return parsedValue;
          };
          let value = await getValue();
          if (value === null) return;
          for (let iii = 0; iii < callbacks.length; iii++) {
            try {
              callbacks[iii](value);
            } catch (error) {
              o.writeDebug(`Rapid.Monitor callback failed. >>> ${error.toString()}`, 3);
            }
          }
        };
        this.subscribe = function (raiseInitial = false) {
          if (raiseInitial === true) return o.Subscriptions.subscribe([this], raiseEvent);
          return o.Subscriptions.subscribe([this]);
        };
        this.unsubscribe = function () {
          return o.Subscriptions.unsubscribe([this]);
        };
      }
      this.getMonitor = function (resource, taskName) {
        return new Monitor(resource, taskName);
      };
      function Task(name) {
        var taskName = name;
        var taskType = null;
        var taskState = null;
        var executionState = null;
        var activeState = null;
        var isMotionTask = null;
        var trustLevel = null;
        var id = null;
        var executionLevel = null;
        var executionMode = null;
        var executionType = null;
        var progEntrypoint = null;
        var bindRef = null;
        var taskInForeground = null;
        this.getName = function () {
          return taskName;
        };
        this.getProperties = function () {
          return refreshProperties()
            .then(() => {
              var properties = {
                name: taskName,
                taskType: taskType,
                taskState: taskState,
                executionState: executionState,
                activeState: activeState,
                isMotionTask: isMotionTask,
                trustLevel: trustLevel,
                id: id,
                executionLevel: executionLevel,
                executionMode: executionMode,
                executionType: executionType,
                progEntrypoint: progEntrypoint,
                bindRef: bindRef,
                taskInForeground: taskInForeground,
              };
              return Promise.resolve(properties);
            })
            .catch((err) => Promise.reject(err));
        };
        function ServiceRoutine(urlToRoutine) {
          var routineUrl = urlToRoutine;
          var routineName = '';
          (function () {
            let splits = routineUrl.split('/');
            routineName = splits.pop();
          })();
          this.getName = function () {
            return routineName;
          };
          this.getUrl = function () {
            return routineUrl;
          };
          this.setPP = function () {
            let t = `/rw/rapid/tasks/${taskName}/pcp/routine`;
            let callUrl = `${encodePath(t)}?mastership=implicit`;
            let body = `routine=${encodeURIComponent(routineName)}&userlevel=TRUE`;
            return o.Network.post(callUrl, body)
              .then(() => Promise.resolve())
              .catch((err) => rejectWithStatus('Failed to set PP to service routine.', err));
          };
        }
        this.getServiceRoutines = function () {
          let callUrl = `/rw/rapid/tasks/${taskName}/serviceroutine`;
          return o.Network.get(callUrl)
            .then((res) => {
              let obj = parseJSON(res.responseText);
              if (typeof obj === 'undefined') return Promise.reject('Could not parse JSON.');
              let serviceRoutines = [];
              for (const item of obj.state) {
                if (item._type === 'rap-task-routine' && item['service-routine'] === 'TRUE') {
                  if (item.hasOwnProperty('url-to-routine') === false) continue;
                  let sr = new ServiceRoutine(item['url-to-routine']);
                  serviceRoutines.push(sr);
                }
              }
              return Promise.resolve(serviceRoutines);
            })
            .catch((err) => rejectWithStatus('Failed to get service routines.', err));
        };
        this.getData = function (moduleName, symbolName) {
          return RWS.Rapid.getData(taskName, moduleName, symbolName);
        };
        var refreshProperties = function () {
          const replacables = {
            SysFail: 'sys_fail',
            SysHalt: 'sys_halt',
            SysStop: 'sys_stop',
            StepOver: 'step_over',
            StepIn: 'step_in',
            StepOutOf: 'step_out_of',
            StepBack: 'step_back',
            StepLast: 'step_last',
            StepWise: 'stepwise',
            Inter: 'interrupt',
            ExInter: 'external_interrupt',
            UsRout: 'user_routine',
            EvRout: 'event_routine',
          };
          const processString = function (text) {
            if (typeof text !== 'string' || text === null) return '';
            if (replacables.hasOwnProperty(text) === false) return text.toLowerCase();
            return replacables[text];
          };
          return o.Network.get(`/rw/rapid/tasks/${encodeURIComponent(taskName)}`)
            .then((res) => {
              let obj = parseJSON(res.responseText);
              if (typeof obj === 'undefined') return Promise.reject('Could not parse JSON.');
              let itemFound = false;
              for (const item of obj.state) {
                if (item._type === 'rap-task') {
                  taskType = processString(item.type);
                  taskState = processString(item.taskstate);
                  executionState = processString(item.excstate);
                  activeState = processString(item.active);
                  if (item.hasOwnProperty('motiontask')) {
                    isMotionTask = item.motiontask.toLowerCase() === 'true';
                  } else {
                    isMotionTask = false;
                  }
                  trustLevel = processString(item.trust);
                  id = parseInt(item.taskID);
                  executionLevel = processString(item.execlevel);
                  executionMode = processString(item.execmode);
                  executionType = processString(item.exectype);
                  progEntrypoint = item.prodentrypt;
                  if (item.hasOwnProperty('bind_ref')) {
                    bindRef = item.bind_ref.toLowerCase() === 'true';
                  } else {
                    bindRef = false;
                  }
                  taskInForeground = item.task_in_forgnd;
                  itemFound = true;
                  break;
                }
              }
              if (itemFound === false) {
                return Promise.reject('Could not find symbol rap-task value in RWS response');
              }
              return Promise.resolve('Success');
            })
            .catch((err) => rejectWithStatus('Failed getting properties.', err));
        };
        this.getProgramInfo = function () {
          return o.Network.get(`/rw/rapid/tasks/${encodeURIComponent(taskName)}/program`)
            .then((res) => {
              if (typeof res.responseText == 'undefined' || res.responseText === '') {
                return Promise.resolve({
                  name: '',
                  entrypoint: '',
                });
              }
              let obj = parseJSON(res.responseText);
              if (typeof obj === 'undefined') return Promise.reject('Could not parse JSON.');
              let programInfo = {};
              for (const item of obj.state) {
                if (item._type === 'rap-program') {
                  programInfo.name = item.name;
                  programInfo.entrypoint = item.entrypoint;
                }
              }
              return Promise.resolve(programInfo);
            })
            .catch((err) => rejectWithStatus('Failed getting program info.', err));
        };
        this.getModuleNames = function () {
          return o.Network.get(`/rw/rapid/tasks/${encodeURIComponent(taskName)}/modules`)
            .then((res) => {
              let obj = parseJSON(res.responseText);
              if (typeof obj === 'undefined') return Promise.reject('Could not parse JSON.');
              let modules = {};
              modules.programModules = [];
              for (const item of obj.state) {
                if (item._type === 'rap-module-info-li' && item.type === 'ProgMod') {
                  modules.programModules.push(item.name);
                }
              }
              modules.systemModules = [];
              for (const item of obj.state) {
                if (item._type === 'rap-module-info-li' && item.type === 'SysMod') {
                  modules.systemModules.push(item.name);
                }
              }
              return Promise.resolve(modules);
            })
            .catch((err) => rejectWithStatus('Failed getting module name.', err));
        };
        this.getModule = function (moduleName) {
          return RWS.Rapid.getModule(taskName, moduleName);
        };
        this.movePPToRoutine = function (routineName, userLevel = false, moduleName = undefined) {
          if (typeof routineName !== 'string') return Promise.reject("Parameter 'routineName' is not a string.");
          if (typeof userLevel !== 'boolean') return Promise.reject("Parameter 'userLevel' is not a boolean.");
          let url = `/rw/rapid/tasks/${encodeURIComponent(taskName)}/pcp/routine?mastership=implicit`;
          let moduleArg = moduleName ? `&module=${encodeURIComponent(moduleName)}` : '';
          let body = `routine=${encodeURIComponent(routineName)}${moduleArg}&userlevel=${userLevel}`;
          return o.Network.post(url, body)
            .then(() => Promise.resolve())
            .catch((err) => rejectWithStatus('Failed to set PP to routine.', err));
        };
        this.abortServiceRoutine = async () => {
          const ERR_MSG = 'Could not abort service routine.';
          if (abortingServiceRoutine) {
            throw createStatusObject(ERR_MSG, 'Abort process already in progress.');
          }
          abortingServiceRoutine = true;
          try {
            await o.Mastership.request();
          } catch (e) {
            this.abortServiceRoutine = false;
            throw createStatusObject(ERR_MSG, e);
          }
          try {
            let props = await this.getProperties();
            if (props.executionLevel === o.Rapid.TaskExecutionLevels.user) {
              await o.Network.post(`/rw/rapid/tasks/${encodeURIComponent(taskName)}/abortexeclevel`);
            } else {
              throw 'Current execution level is not "user".';
            }
          } catch (e) {
            throw createStatusObject(ERR_MSG, e);
          } finally {
            try {
              await o.Mastership.release();
            } catch (e) {}
            abortingServiceRoutine = false;
          }
        };
        this.getPointers = function () {
          let callUrl = `/rw/rapid/tasks/${encodeURIComponent(taskName)}/pcp`;
          return o.Network.get(callUrl)
            .then((res) => {
              let obj = parseJSON(res.responseText);
              if (typeof obj === 'undefined') return Promise.reject('Could not parse JSON.');
              let pcp = parsePointers(obj);
              return Promise.resolve(pcp);
            })
            .catch((err) => rejectWithStatus('Failed getting pointers.', err));
        };
      }
      function Module(task, module) {
        var taskName = isNonEmptyString(task) === true ? task : '';
        var moduleName = isNonEmptyString(module) === true ? module : '';
        var fileName = null;
        var attributes = null;
        this.getName = function () {
          return moduleName;
        };
        this.getTaskName = function () {
          return taskName;
        };
        this.getFileName = function () {
          return fileName;
        };
        this.getAttributes = function () {
          return attributes;
        };
        this.getProperties = function () {
          return refreshProperties()
            .then(() => {
              var properties = {
                taskName: taskName,
                moduleName: moduleName,
                fileName: fileName,
                attributes: attributes,
              };
              return Promise.resolve(properties);
            })
            .catch((err) => Promise.reject(err));
        };
        this.getData = function (symbolName) {
          return new Data(taskName, moduleName, symbolName);
        };
        var refreshProperties = function () {
          let url = `/rw/rapid/tasks/${encodeURIComponent(taskName)}/modules/${encodeURIComponent(moduleName)}`;
          return o.Network.get(url)
            .then((res) => {
              let obj = parseJSON(res.responseText);
              if (typeof obj === 'undefined') return Promise.reject('Could not parse JSON.');
              let itemFound = false;
              for (const item of obj.state) {
                if (item._type === 'rap-module') {
                  fileName = item.filename;
                  attributes = item.attribute;
                  itemFound = true;
                  break;
                }
              }
              if (itemFound === false) {
                return Promise.reject('Could not find symbol rap-module value in RWS response');
              }
              return Promise.resolve('Success');
            })
            .catch((err) => rejectWithStatus('Failed getting properties.', err));
        };
      }
      function Data(task, module, symbol) {
        var taskName = isNonEmptyString(task) === true ? task : '';
        var moduleName = isNonEmptyString(module) === true ? module : '';
        var symbolName = isNonEmptyString(symbol) === true ? symbol : '';
        var dataType = null;
        var symbolType = null;
        var dataTypeURL = null;
        var symbolValue = null;
        var dimensions = null;
        var scope = null;
        var parsedType = null;
        var isSharedModule = taskName === SHARED_TAG && moduleName === SHARED_TAG;
        var symbolTitle =
          isSharedModule === true ? `RAPID/${symbolName}` : `RAPID/${taskName}/${moduleName}/${symbolName}`;
        var hasValidSetup = (function () {
          if (taskName === null || moduleName === null || symbolName === null) return false;
          if (taskName === '' || moduleName === '' || symbolName === '') return false;
          return true;
        })();
        this.getTitle = function () {
          return symbolTitle;
        };
        this.getProperties = function () {
          return refreshProperties()
            .then(() => {
              var properties = {
                taskName: taskName,
                moduleName: moduleName,
                symbolName: symbolName,
                dataType: dataType,
                symbolType: symbolType,
                dimensions: dimensions,
                scope: scope,
                dataTypeURL: dataTypeURL,
              };
              return Promise.resolve(properties);
            })
            .catch((err) => Promise.reject(err));
        };
        this.getName = function () {
          return symbolName;
        };
        this.getModuleName = function () {
          return moduleName;
        };
        this.getTaskName = function () {
          return taskName;
        };
        this.getDataType = function () {
          if (dataType !== null) return Promise.resolve(dataType);
          return refreshProperties()
            .then(() => Promise.resolve(dataType))
            .catch((err) => Promise.reject(err));
        };
        this.getSymbolType = function () {
          if (symbolType !== null) return Promise.resolve(symbolType);
          return refreshProperties()
            .then(() => Promise.resolve(symbolType))
            .catch((err) => Promise.reject(err));
        };
        this.getDimensions = function () {
          if (dimensions !== null) return Promise.resolve(dimensions);
          return refreshProperties()
            .then(() => Promise.resolve(dimensions))
            .catch((err) => Promise.reject(err));
        };
        this.getScope = function () {
          if (scope !== null) return Promise.resolve(scope);
          return refreshProperties()
            .then(() => Promise.resolve(scope))
            .catch((err) => Promise.reject(err));
        };
        this.getTypeURL = function () {
          if (dataTypeURL !== null) return Promise.resolve(dataTypeURL);
          return refreshProperties()
            .then(() => Promise.resolve(dataTypeURL))
            .catch((err) => Promise.reject(err));
        };
        this.getValue = function () {
          if (symbolValue !== null) {
            if (parsedType === null) {
              return RWS.RapidData.Type.getType(this)
                .then((x) => {
                  parsedType = x;
                  return RWS.RapidData.Value.parseRawValue(parsedType, symbolValue);
                })
                .catch((err) => Promise.reject(err));
            }
            return RWS.RapidData.Value.parseRawValue(parsedType, symbolValue);
          }
          return this.fetch()
            .then(() => {
              return RWS.RapidData.Type.getType(this)
                .then((x) => {
                  parsedType = x;
                  return RWS.RapidData.Value.parseRawValue(parsedType, symbolValue);
                })
                .catch((err) => Promise.reject(err));
            })
            .catch((err) => Promise.reject(err));
        };
        const getArrayType = (base, indexes) => {
          if (base.isArray === false) throw new Error(`Type '${base.type}' is not an array.`);
          if (indexes.length > base.dimensions.length)
            throw new Error('More indexes provided than array contains dimensions.');
          let ret = JSON.parse(JSON.stringify(base));
          for (let iii = 0; iii < indexes.length; iii++) {
            ret.dimensions.shift();
          }
          if (ret.dimensions.length <= 0) ret.isArray = false;
          ret.url = dataTypeURL;
          return ret;
        };
        this.getArrayItem = async function (...indexes) {
          if (dimensions === null || dimensions.length <= 0)
            return rejectWithStatus('Get array item failed. >>> Cannot access data as array.');
          if (indexes.length > dimensions.length)
            return rejectWithStatus('Get array item failed. >>> More indexes provided than array contains dimensions.');
          for (let iii = 0; iii < indexes.length; iii++) {
            if (typeof indexes[iii] !== 'number' || dimensions[iii] < indexes[iii] || indexes[iii] < 1)
              return rejectWithStatus('Get array item failed. >>> Index out of bounds.');
          }
          if (parsedType === null) {
            parsedType = await RWS.RapidData.Type.getType(this);
          }
          let arrayType = null;
          try {
            arrayType = getArrayType(parsedType, indexes);
          } catch (error) {
            return rejectWithStatus('Failed to get array item.', error);
          }
          return fetchItem(indexes)
            .then((x) => RWS.RapidData.Value.parseRawValue(arrayType, x))
            .catch((err) => rejectWithStatus('Error fetching value.', err));
        };
        this.getRecordItem = function (...components) {
          let indexes = [];
          let type = null;
          return getParsedType(this)
            .then((x1) => getRecordIndexes(x1, components, indexes))
            .then((x2) => {
              type = x2.type;
              return fetchItem(x2.indexes);
            })
            .then((x3) => RWS.RapidData.Value.parseRawValue(type, x3))
            .catch((err) => rejectWithStatus('Get record item failed.', err));
        };
        this.getRawValue = function () {
          if (symbolValue !== null) {
            return Promise.resolve(symbolValue);
          }
          return this.fetch()
            .then(() => Promise.resolve(symbolValue))
            .catch((err) => Promise.reject(err));
        };
        this.setValue = (value) => {
          if (hasValidSetup === false) return Promise.reject(`Symbol path '${getSymbolUrl()}' not valid.`);
          let url = getSymbolUrl() + '/data';
          let sVal = RWS.RapidData.String.stringify(value);
          let hasMastership = false;
          let error = null;
          return requestMastership()
            .then(() => {
              hasMastership = true;
              return o.Network.post(url, 'value=' + encodeURIComponent(sVal));
            })
            .catch((err) => {
              if (hasMastership === true) {
                error = err;
                return Promise.resolve();
              }
              return rejectWithStatus('Failed to get Mastership.', err);
            })
            .then(() => releaseMastership())
            .then(() => {
              if (error !== null) return rejectWithStatus('Failed to set value.', error);
              return Promise.resolve();
            });
        };
        this.setRawValue = (value, ...indexes) => {
          if (hasValidSetup === false) return rejectWithStatus(`Symbol path '${getSymbolUrl()}' not valid.`);
          let sInd = '';
          if (indexes !== null && Array.isArray(indexes) && indexes.length > 0) {
            sInd = '{';
            for (let iii = 0; iii < indexes.length; iii++) {
              sInd += indexes[iii].toString();
              if (iii < indexes.length - 1) sInd += ',';
            }
            sInd += '}';
          }
          let url = getSymbolUrl() + encodeURIComponent(sInd) + '/data';
          let hasMastership = false;
          let error = null;
          return requestMastership()
            .then(() => {
              hasMastership = true;
              return o.Network.post(url, 'value=' + encodeURIComponent(value));
            })
            .catch((err) => {
              if (hasMastership === true) {
                error = err;
                return Promise.resolve();
              }
              return rejectWithStatus('Failed to get Mastership.', err);
            })
            .then(() => releaseMastership())
            .then(() => {
              if (error !== null) return rejectWithStatus('Failed to set raw value.', error);
              return Promise.resolve();
            });
        };
        this.setArrayItem = function (value, ...indexes) {
          if (dimensions === null || dimensions.length <= 0)
            return rejectWithStatus('Set array item failed. >>> Cannot access data as array.');
          if (indexes.length > dimensions.length)
            return rejectWithStatus('Set array item failed. >>> More indexes provided than array contains dimensions.');
          for (let iii = 0; iii < indexes.length; iii++) {
            if (typeof indexes[iii] !== 'number' || dimensions[iii] < indexes[iii] || indexes[iii] < 1)
              return rejectWithStatus('Set array item failed. >>> Index out of bounds.');
          }
          let sVal = RWS.RapidData.String.stringify(value);
          return setItem(indexes, sVal);
        };
        this.setRecordItem = function (value, ...components) {
          let indexes = [];
          return getParsedType(this)
            .then((x1) => getRecordIndexes(x1, components, indexes))
            .then(() => {
              let sVal = RWS.RapidData.String.stringify(value);
              return setItem(indexes, sVal);
            })
            .catch((err) => rejectWithStatus('Set record item failed.', err));
        };
        this.fetch = function () {
          if (hasValidSetup === false) return rejectWithStatus(`Symbol path '${getSymbolUrl()}' not valid.`);
          const processData = (json) => {
            for (const item of json.state) {
              if (item._type === 'rap-data') {
                symbolValue = item.value;
                break;
              }
            }
          };
          let url = getSymbolUrl() + '/data';
          return o.Network.get(url)
            .then((res) => {
              let json = parseJSON(res.responseText);
              if (json === undefined) return reject('Could not parse JSON..');
              return verifyReturnCode(json)
                .then(() => {
                  processData(json);
                  return Promise.resolve('Fetched Data!');
                })
                .catch((errors) => {
                  if (errors.hasOwnProperty('pgmname_ret')) {
                    let err = errors['pgmname_ret'];
                    if (err.hasOwnProperty('code') === false || err.code !== '-1073445865') {
                      return Promise.reject(err);
                    }
                    if (dimensions.length > 0) {
                      return fetchByItem();
                    }
                    return Promise.reject('Data is too large to retrieve.');
                  }
                  processData(json);
                  return Promise.resolve('Fetched Data!');
                });
            })
            .catch((err) => rejectWithStatus('Error fetching Rapid data value.', err));
        };
        const getParsedType = function (data) {
          if (parsedType !== null && typeof parsedType !== 'undefined') return Promise.resolve(parsedType);
          return RWS.RapidData.Type.getType(data)
            .then((x) => {
              parsedType = x;
              return Promise.resolve(x);
            })
            .catch((err) => Promise.reject(err));
        };
        const getRecordIndexes = function (rdType, components, indexes = []) {
          let component = '';
          try {
            if (components.length <= 0)
              return Promise.resolve({
                type: rdType,
                indexes: indexes,
              });
            if (rdType.isRecord === false)
              return Promise.reject(`Get record indexes failed. >>> Data type '${rdType.url}' is not a Record.`);
            component = components.shift();
            for (let iii = 0; iii < rdType.components.length; iii++) {
              if (rdType.components[iii].name === component) {
                indexes.push(iii + 1);
                let t = RWS.getCachedSymbolType(rdType.components[iii].type.url);
                if (typeof t === 'undefined')
                  return Promise.reject(
                    `Get record indexes failed. >>> Component '${component}' not found in Record '${rdType.type}'.`,
                  );
                return getRecordIndexes(t, components, indexes);
              }
            }
          } catch (error) {
            o.writeDebug(`Get record indexes failed.\n${error}'`, 3);
            return Promise.reject(`Get record indexes failed. >>> ${error}'`);
          }
          return Promise.reject(
            `Get record indexes failed. >>> Component '${component}' not found in Record '${rdType.type}'.`,
          );
        };
        const fetchItem = function (indexes) {
          return new Promise((resolve, reject) => {
            let s = '{';
            for (let iii = 0; iii < indexes.length; iii++) {
              s += indexes[iii];
              if (iii < indexes.length - 1) s += ',';
            }
            s += '}';
            let url = `${getSymbolUrl()}${encodeURIComponent(s)}/data`;
            return o.Network.get(url)
              .then((res) => {
                let obj = parseJSON(res.responseText);
                if (obj === undefined) return Promise.reject('Could not parse JSON.');
                for (const item of obj.state) {
                  if (item._type === 'rap-data') {
                    return resolve(item.value);
                  }
                }
                reject(
                  createStatusObject(
                    `Data not found when fetching Rapid data item with index = ${indexes.toString()}.`,
                  ),
                );
              })
              .catch((err) =>
                reject(createStatusObject(`Error fetching Rapid data item with index = ${indexes.toString()}.`, err)),
              );
          });
        };
        const setItem = function (indexes, value) {
          let url = null;
          let body = null;
          try {
            let s = '{';
            for (let iii = 0; iii < indexes.length; iii++) {
              s += indexes[iii];
              if (iii < indexes.length - 1) s += ',';
            }
            s += '}';
            url = `${getSymbolUrl()}${encodeURIComponent(s)}/data`;
            body = `value=${encodeURIComponent(value)}`;
          } catch (error) {
            let s = `Failed to set item value. >>> ${error}`;
            o.writeDebug(s);
            return rejectWithStatus(s);
          }
          return o.Mastership.request()
            .then(() => {
              return o.Network.post(url, body)
                .then(() => {
                  return o.Mastership.release()
                    .then(() => Promise.resolve('Value set!'))
                    .catch((err) => Promise.reject('Item value set but failed to release mastership. >>> ' + err));
                })
                .catch((err) => {
                  let handled = false;
                  let error = JSON.stringify(err);
                  return o.Mastership.release()
                    .then(() => {
                      handled = true;
                      return Promise.reject('Failed to set item value. >>> ' + error);
                    })
                    .catch((err2) => {
                      if (handled === true) {
                        return Promise.reject(err2);
                      } else {
                        return Promise.reject(
                          'Failed to set item value. >>> ' +
                            error +
                            ' >>> Failed to release mastership. >>> ' +
                            JSON.stringify(err2),
                        );
                      }
                    });
                });
            })
            .catch((err) => rejectWithStatus('setItem failed.', err));
        };
        const fetchByItem = function () {
          return new Promise((resolve, reject) => {
            let s = '[';
            let parts = [];
            for (let iii = 1; iii <= dimensions[0]; iii++) {
              let url = `${getSymbolUrl()}{${iii.toString()}}/data`;
              parts.push(
                () =>
                  new Promise((resolve, reject) => {
                    o.Network.get(url)
                      .then((res) => {
                        let obj = parseJSON(res.responseText);
                        if (obj === undefined) return Promise.reject('Could not parse JSON.');
                        for (const item of obj.state) {
                          if (item._type === 'rap-data') {
                            s += item.value + ',';
                            break;
                          }
                        }
                        return resolve();
                      })
                      .catch((err) => reject(`Error fetching Rapid data value >>> ${err}`));
                  }),
              );
            }
            return parts
              .reduce((partChain, currentPart) => partChain.then(currentPart), Promise.resolve())
              .then(() => {
                symbolValue = s.slice(0, -1) + ']';
                resolve('Fetched Data!');
              })
              .catch((err) => reject(err));
          });
        };
        var refreshProperties = function () {
          if (hasValidSetup === false) return Promise.reject(`Symbol path '${getSymbolUrl()}' not valid.`);
          let url = getSymbolUrl() + '/properties';
          return o.Network.get(url)
            .then((res) => {
              let obj = parseJSON(res.responseText);
              if (obj === undefined) return Promise.reject('Could not parse JSON.');
              for (const item of obj._embedded.resources) {
                if (
                  item._type === 'rap-symproppers' ||
                  item._type === 'rap-sympropvar' ||
                  item._type === 'rap-sympropconstant'
                ) {
                  if (item.symtyp === 'per') symbolType = 'persistent';
                  else if (item.symtyp === 'con') symbolType = 'constant';
                  else if (item.symtyp === 'var') symbolType = 'variable';
                  else symbolType = item.symtyp;
                  if (item.hasOwnProperty('local') && item.local.toLowerCase() === 'true') scope = 'local';
                  else if (
                    symbolType === 'persistent' &&
                    item.hasOwnProperty('taskpers') &&
                    item.taskpers.toLowerCase() === 'true'
                  )
                    scope = 'task';
                  else if (
                    symbolType === 'variable' &&
                    item.hasOwnProperty('taskvar') &&
                    item.taskvar.toLowerCase() === 'true'
                  )
                    scope = 'task';
                  else scope = 'global';
                  dataType = item.dattyp;
                  dataTypeURL = item.typurl;
                  dimensions = [];
                  if (isNonEmptyString(item.dim.trim()) === true) {
                    let splits = item.dim.trim().split(' ');
                    for (const s of splits) {
                      dimensions.push(parseInt(s));
                    }
                  }
                  break;
                }
              }
              if (dataType === null || dataTypeURL === null) {
                return Promise.reject("Could not find symbol's data value in RWS response.");
              }
              return Promise.resolve();
            })
            .catch((err) => rejectWithStatus('Failed getting properties.', err));
        };
        var callbacks = [];
        this.addCallbackOnChanged = function (callback) {
          if (typeof callback !== 'function') throw new Error('callback is not a valid function');
          callbacks.push(callback);
        };
        this.onchanged = async (newValue) => {
          if (
            newValue !== null &&
            typeof newValue === 'object' &&
            typeof newValue.value === 'string' &&
            newValue.value.trim().length > 0
          ) {
            symbolValue = newValue.value;
          } else {
            try {
              await this.fetch();
            } catch (error) {
              o.writeDebug(`Failed to get value for '${this.getTitle()}'. >>> ${error}`);
            }
          }
          for (let iii = 0; iii < callbacks.length; iii++) {
            try {
              callbacks[iii](symbolValue);
            } catch (error) {
              o.writeDebug(`Rapid.Data callback failed. >>> ${error.toString()}`, 3);
            }
          }
        };
        this.getResourceString = function () {
          return getSymbolUrl() + '/data;value';
        };
        const raiseEvent = async () => {
          this.onchanged(null);
        };
        this.subscribe = function (raiseInitial = false) {
          if (raiseInitial === true) return o.Subscriptions.subscribe([this], raiseEvent);
          return o.Subscriptions.subscribe([this]);
        };
        this.unsubscribe = function () {
          return o.Subscriptions.unsubscribe([this]);
        };
        function getSymbolUrl() {
          let url = '/rw/rapid/symbol/RAPID/';
          url +=
            isSharedModule === true
              ? encodeURIComponent(symbolName)
              : `${encodeURIComponent(taskName)}/${encodeURIComponent(moduleName)}/${encodeURIComponent(symbolName)}`;
          return url;
        }
      }
      function parsePointers(obj) {
        let pcp = {};
        pcp.programPointer = {};
        pcp.motionPointer = {};
        for (const item of obj.state) {
          if (item._type === 'pcp-info' && item._title === 'progpointer') {
            pcp.programPointer['moduleName'] = item.hasOwnProperty('modulemame') ? item.modulemame : '';
            pcp.programPointer['routineName'] = item.hasOwnProperty('routinename') ? item.routinename : '';
            pcp.programPointer['beginPosition'] = item.hasOwnProperty('beginposition') ? item.beginposition : '';
            pcp.programPointer['endPosition'] = item.hasOwnProperty('endposition') ? item.endposition : '';
            pcp.programPointer['hasValue'] =
              pcp.programPointer['moduleName'] !== '' ||
              pcp.programPointer['routineName'] !== '' ||
              pcp.programPointer['beginPosition'] !== '' ||
              pcp.programPointer['endPosition'] !== '';
          }
          if (item._type === 'pcp-info' && item._title === 'motionpointer') {
            pcp.motionPointer['moduleName'] = item.hasOwnProperty('modulename') ? item.modulename : '';
            pcp.motionPointer['routineName'] = item.hasOwnProperty('routinename') ? item.routinename : '';
            pcp.motionPointer['beginPosition'] = item.hasOwnProperty('begposition') ? item.begposition : '';
            pcp.motionPointer['endPosition'] = item.hasOwnProperty('endposition') ? item.endposition : '';
            pcp.motionPointer['hasValue'] =
              pcp.motionPointer['moduleName'] !== '' ||
              pcp.motionPointer['routineName'] !== '' ||
              pcp.motionPointer['beginPosition'] !== '' ||
              pcp.motionPointer['endPosition'] !== '';
          }
        }
        return pcp;
      }
      this.getTasks = function () {
        return o.Network.get('/rw/rapid/tasks')
          .then((res) => {
            let obj = parseJSON(res.responseText);
            if (typeof obj === 'undefined') return Promise.reject('Could not parse JSON.');
            let tasks = [];
            for (const item of obj._embedded.resources) {
              if (item._type === 'rap-task-li') {
                tasks.push(new Task(item.name));
              }
            }
            return Promise.resolve(tasks);
          })
          .catch((err) => rejectWithStatus('Error getting task list.', err));
      };
      this.getTask = function (taskName) {
        let task = new Task(taskName);
        return task
          .getProperties()
          .then(() => Promise.resolve(task))
          .catch((err) => Promise.reject(err));
      };
      this.getProgramInfo = function (taskName) {
        return new Task(taskName).getProgramInfo();
      };
      this.getModuleNames = function (taskName) {
        return new Task(taskName).getModuleNames();
      };
      this.getModule = function (taskName, moduleName) {
        let mod = new Module(taskName, moduleName);
        return mod
          .getProperties()
          .then(() => Promise.resolve(mod))
          .catch((err) => Promise.reject(err));
      };
      this.getData = function (taskName, moduleName, symbolName) {
        let data = new Data(taskName, moduleName, symbolName);
        return data
          .getProperties()
          .then(() => Promise.resolve(data))
          .catch((err) => Promise.reject(err));
      };
      this.setDataValue = function (taskName, moduleName, symbolName, value, ...indexes) {
        return new Data(taskName, moduleName, symbolName).setRawValue(value, ...indexes);
      };
      this.getSharedData = function (symbolName) {
        let data = new Data(SHARED_TAG, SHARED_TAG, symbolName);
        return data
          .getProperties()
          .then(() => Promise.resolve(data))
          .catch((err) => Promise.reject(err));
      };
      this.setSharedDataValue = function (symbolName, value) {
        return new Data(SHARED_TAG, SHARED_TAG, symbolName).setRawValue(value);
      };
      this.getExecutionState = () => {
        return o.Network.get('/rw/rapid/execution')
          .then((res) => {
            let obj = parseJSON(res.responseText);
            if (typeof obj === 'undefined') return Promise.reject('Could not parse JSON.');
            let mode = null;
            for (const item of obj.state) {
              if (item._type === 'rap-execution') {
                mode = item.ctrlexecstate;
                break;
              }
            }
            if (mode === null) {
              return Promise.reject('Could not find the execution state in RWS response');
            }
            return Promise.resolve(mode);
          })
          .catch((err) => rejectWithStatus('Could not get the execution state.', err));
      };
      this.startExecution = ({
        regainMode = 'continue',
        executionMode = 'continue',
        cycleMode = 'forever',
        condition = 'none',
        stopAtBreakpoint = true,
        enableByTSP = true,
      } = {}) => {
        const validRegainModes = {
          continue: 'continue',
          regain: 'regain',
          clear: 'clear',
          enter_consume: 'enterconsume',
        };
        const validExecutionModes = {
          continue: 'continue',
          step_in: 'stepin',
          step_over: 'stepover',
          step_out: 'stepout',
          step_backwards: 'stepback',
          step_to_last: 'steplast',
          step_to_motion: 'stepmotion',
        };
        const validCycleModes = {
          forever: 'forever',
          as_is: 'asis',
          once: 'once',
        };
        const validConditions = {
          none: 'none',
          call_chain: 'callchain',
        };
        if (validRegainModes.hasOwnProperty(regainMode) === false) rejectWithStatus("Illegal parameter 'regainMode'");
        if (validExecutionModes.hasOwnProperty(executionMode) === false)
          rejectWithStatus("Illegal parameter 'executionMode'");
        if (validCycleModes.hasOwnProperty(cycleMode) === false) rejectWithStatus("Illegal parameter 'cycleMode'");
        if (validConditions.hasOwnProperty(condition) === false) rejectWithStatus("Illegal parameter 'condition'");
        let body = '';
        body += 'regain=' + encodeURIComponent(validRegainModes[regainMode]);
        body += '&execmode=' + encodeURIComponent(validExecutionModes[executionMode]);
        body += '&cycle=' + encodeURIComponent(validCycleModes[cycleMode]);
        body += '&condition=' + encodeURIComponent(validConditions[condition]);
        if (stopAtBreakpoint === true) body += '&stopatbp=enabled';
        else body += '&stopatbp=disabled';
        if (enableByTSP === true) body += '&alltaskbytsp=true';
        else body += '&alltaskbytsp=false';
        return o.Network.post('/rw/rapid/execution/start', body)
          .then(() => Promise.resolve())
          .catch((err) => rejectWithStatus('Could not start execution.', err));
      };
      this.stopExecution = ({stopMode = 'stop', useTSP = 'normal'} = {}) => {
        const validStopModes = {
          cycle: 'cycle',
          instruction: 'instr',
          stop: 'stop',
          quick_stop: 'qstop',
        };
        const validUseTSPOptions = {
          normal: 'normal',
          all_tasks: 'alltask',
        };
        if (validStopModes.hasOwnProperty(stopMode) === false) rejectWithStatus("Illegal parameter 'stopMode'");
        if (validUseTSPOptions.hasOwnProperty(useTSP) === false) rejectWithStatus("Illegal parameter 'useTSP'");
        let body = '';
        body += 'stopmode=' + encodeURIComponent(validStopModes[stopMode]);
        body += '&usetsp=' + encodeURIComponent(validUseTSPOptions[useTSP]);
        return o.Network.post('/rw/rapid/execution/stop', body)
          .then(() => Promise.resolve())
          .catch((err) => rejectWithStatus('Could not stop execution.', err));
      };
      this.resetPP = () => {
        let body = '';
        let hasMastership = false;
        let error = null;
        return requestMastership()
          .then(() => {
            hasMastership = true;
            return o.Network.post('/rw/rapid/execution/resetpp', body);
          })
          .catch((err) => {
            if (hasMastership === true) {
              error = err;
              return Promise.resolve();
            }
            return rejectWithStatus('Failed to get Mastership.', err);
          })
          .then(() => releaseMastership())
          .then(() => {
            if (error !== null) return rejectWithStatus('Failed to reset PP.', error);
            return Promise.resolve();
          });
      };
      this.getDefaultSearchProperties = () => {
        return {
          isInstalled: false,
          isShared: false,
          method: this.SearchMethods.block,
          searchURL: 'RAPID',
          types: this.SymbolTypes.any,
          recursive: true,
          skipShared: false,
          isInUse: false,
        };
      };
      this.searchSymbols = (properties = this.getDefaultSearchProperties(), dataType = '', regexp = '') => {
        const rwsSymbolType = {
          con: 'constant',
          var: 'variable',
          per: 'pers',
          fun: 'function',
          prc: 'procedure',
          trp: 'trap',
          mod: 'module',
          tsk: 'task',
        };
        const checkProperties = (properties) => {
          let errors = [];
          const validProperties = [
            'isInstalled',
            'isShared',
            'method',
            'searchURL',
            'types',
            'recursive',
            'skipShared',
            'isInUse',
          ];
          let keys = Object.keys(properties);
          for (let iii = 0; iii < keys.length; iii++) {
            if (validProperties.includes(keys[iii]) === false)
              errors.push(`Properties include unknown setting '${keys[iii]}'`);
          }
          if (properties.hasOwnProperty('isInstalled') !== true) {
            errors.push("Search property 'isInstalled' is missing.");
          } else {
            if (typeof properties.isInstalled !== 'boolean') errors.push("Search property 'isInstalled' is invalid.");
          }
          if (properties.hasOwnProperty('isShared') !== true) {
            errors.push("Search property 'isShared' is missing.");
          } else {
            if (typeof properties.isShared !== 'boolean') errors.push("Search property 'isShared' is invalid.");
          }
          if (properties.hasOwnProperty('method') !== true) {
            errors.push("Search property 'method' is missing.");
          } else {
            if (properties.method !== this.SearchMethods.block && properties.method !== this.SearchMethods.scope)
              errors.push("Search property 'method' is invalid.");
            if (properties.hasOwnProperty('searchURL') !== true) {
              errors.push("Search property 'searchURL' is missing.");
            } else {
              if (typeof properties.searchURL !== 'string') errors.push("Search property 'searchURL' is invalid.");
            }
          }
          if (properties.hasOwnProperty('types') !== true) {
            errors.push("Search property 'types' is missing.");
          } else {
            if (typeof properties.types !== 'number') errors.push("Search property 'types' is invalid.");
          }
          if (properties.hasOwnProperty('recursive') !== true) {
            errors.push("Search property 'recursive' is missing.");
          } else {
            if (typeof properties.recursive !== 'boolean') errors.push("Search property 'recursive' is invalid.");
          }
          if (properties.hasOwnProperty('skipShared') !== true) {
            errors.push("Search property 'skipShared' is missing.");
          } else {
            if (typeof properties.skipShared !== 'boolean') errors.push("Search property 'skipShared' is invalid.");
          }
          if (properties.hasOwnProperty('isInUse') !== true) {
            errors.push("Search property 'isInUse' is missing.");
          } else {
            if (typeof properties.isInUse !== 'boolean') errors.push("Search property 'isInUse' is invalid.");
          }
          return errors;
        };
        const getBodyText = (properties, dataType, regexp) => {
          let text = ``;
          if ((properties.method & this.SearchMethods.scope) == this.SearchMethods.scope) text = `view=scope`;
          else if ((properties.method & this.SearchMethods.block) == this.SearchMethods.block) text = `view=block`;
          text += `&blockurl=${encodeURIComponent(properties.searchURL)}`;
          if ((properties.types & this.SymbolTypes.constant) == this.SymbolTypes.constant) text += `&symtyp=con`;
          if ((properties.types & this.SymbolTypes.variable) == this.SymbolTypes.variable) text += `&symtyp=var`;
          if ((properties.types & this.SymbolTypes.persistent) == this.SymbolTypes.persistent) text += `&symtyp=per`;
          if ((properties.types & this.SymbolTypes.function) == this.SymbolTypes.function) text += `&symtyp=fun`;
          if ((properties.types & this.SymbolTypes.procedure) == this.SymbolTypes.procedure) text += `&symtyp=prc`;
          if ((properties.types & this.SymbolTypes.trap) == this.SymbolTypes.trap) text += `&symtyp=trp`;
          if ((properties.types & this.SymbolTypes.module) == this.SymbolTypes.module) text += `&symtyp=mod`;
          if ((properties.types & this.SymbolTypes.task) == this.SymbolTypes.task) text += `&symtyp=tsk`;
          text += `&recursive=${properties.recursive.toString().toUpperCase()}`;
          text += `&skipshared=${properties.skipShared.toString().toUpperCase()}`;
          text += `&onlyused=${properties.isInUse.toString().toUpperCase()}`;
          if (regexp !== '') text += `&regexp=${regexp}`;
          if (dataType !== '') {
            if (properties.isShared === true || properties.isInstalled === true) {
              text += `&dattyp=${dataType}`;
            } else {
              let typurl = dataType.startsWith('/') ? dataType : `/${dataType}`;
              typurl = typurl.toUpperCase().startsWith('/RAPID') ? typurl : encodeURIComponent(`RAPID${typurl}`);
              text += `&typurl=${typurl}`;
            }
          }
          return text;
        };
        const getSymbol = (item) => {
          let symbol = {};
          if (item.hasOwnProperty('name')) {
            symbol['name'] = item['name'];
          } else {
            symbol['name'] = '';
          }
          if (item.hasOwnProperty('symburl')) {
            symbol['scope'] = item['symburl'].split('/');
          } else {
            symbol['scope'] = [];
          }
          if (item.hasOwnProperty('symtyp')) {
            if (rwsSymbolType.hasOwnProperty(item['symtyp'])) {
              symbol['symbolType'] = rwsSymbolType[item['symtyp']];
            } else {
              symbol['symbolType'] = '';
            }
          } else {
            symbol['symbolType'] = '';
          }
          if (item.hasOwnProperty('dattyp')) {
            symbol['dataType'] = item['dattyp'];
          } else {
            symbol['dataType'] = '';
          }
          return symbol;
        };
        const doSearch = (url, body, symbols) => {
          if (url === '') return Promise.resolve(symbols);
          return o.Network.post(url, body)
            .then((res) => {
              let obj = parseJSON(res.responseText);
              if (typeof obj === 'undefined') return Promise.reject('Could not parse JSON.');
              if (obj._links.hasOwnProperty('next')) {
                url = '/rw/rapid/' + obj._links['next'].href;
              } else {
                url = '';
              }
              for (const item of obj._embedded.resources) {
                let sym = getSymbol(item);
                symbols.push(sym);
              }
              return doSearch(url, body, symbols);
            })
            .catch((err) => Promise.reject(err));
        };
        let errList = checkProperties(properties);
        if (errList.length > 0) {
          let s = errList.reduce((a, c) => a + '\n' + c, '').trim();
          return rejectWithStatus('Indata contains errors.', s);
        }
        let body = getBodyText(properties, dataType, regexp);
        let symbols = [];
        let url = '/rw/rapid/symbols/search';
        return doSearch(url, body, symbols)
          .then(() => Promise.resolve(symbols))
          .catch((err) => rejectWithStatus('Failed to search symbols.', err));
      };
    })();
    o.IO = new (function () {
      this.NetworkPhysicalState = {
        halted: 'halted',
        running: 'running',
        error: 'error',
        startup: 'startup',
        init: 'init',
        unknown: 'unknown',
      };
      this.NetworkLogicalState = {
        stopped: 'stopped',
        started: 'started',
        unknown: 'unknown',
      };
      this.DevicePhysicalState = {
        deact: 'deact',
        running: 'running',
        error: 'error',
        unconnect: 'unconnect',
        unconfg: 'unconfg',
        startup: 'startup',
        init: 'init',
        unknown: 'unknown',
      };
      this.DeviceLogicalState = {
        disabled: 'disabled',
        enabled: 'enabled',
        unknown: 'unknown',
      };
      this.SignalQuality = {
        bad: 'bad',
        good: 'good',
        unknown: 'unknown',
      };
      this.SignalType = {
        DI: 'DI',
        DO: 'DO',
        AI: 'AI',
        AO: 'AO',
        GI: 'GI',
        GO: 'GO',
      };
      function Network(network) {
        var isUnassigned = network === UNASSIGNED_TAG;
        var networkPath = isUnassigned === true ? '' : `networks/${encodeURIComponent(network)}`;
        var networkName = isNonEmptyString(network) === true ? network : '';
        var physicalState = null;
        var logicalState = null;
        this.getName = function () {
          return networkName;
        };
        this.getPhysicalState = function () {
          if (physicalState !== null) return Promise.resolve(physicalState);
          return this.fetch()
            .then(() => Promise.resolve(physicalState))
            .catch((err) => Promise.reject(err));
        };
        this.getLogicalState = function () {
          if (logicalState !== null) return Promise.resolve(logicalState);
          return this.fetch()
            .then(() => Promise.resolve(logicalState))
            .catch((err) => Promise.reject(err));
        };
        this.getDevice = function (deviceName) {
          if (isUnassigned) return rejectWithStatus('Not allowed as Network is unassigned.');
          return RWS.IO.getDevice(networkName, deviceName);
        };
        this.fetch = function () {
          if (isUnassigned) return rejectWithStatus('Network is not valid, as it is unassigned.');
          return o.Network.get(`/rw/iosystem/${networkPath}`)
            .then((res) => {
              let obj = parseJSON(res.responseText);
              if (typeof obj === 'undefined') return Promise.reject('Could not parse JSON.');
              for (const item of obj._embedded.resources) {
                if (item._type === 'ios-network-li') {
                  physicalState = item.pstate;
                  logicalState = item.lstate;
                  break;
                }
              }
              return Promise.resolve();
            })
            .catch((err) => rejectWithStatus('Failed updating network data.', err));
        };
      }
      this.createSignal_internal = (network, device, signal) => {
        return new Signal(network, device, signal);
      };
      function Device(network, device) {
        var isUnassigned = network === UNASSIGNED_TAG || device === UNASSIGNED_TAG;
        var devicePath =
          isUnassigned === true ? '' : `devices/${encodeURIComponent(network)}/${encodeURIComponent(device)}`;
        var networkName = isNonEmptyString(network) === true ? network : '';
        var deviceName = isNonEmptyString(device) === true ? device : '';
        var physicalState = null;
        var logicalState = null;
        this.getName = function () {
          return deviceName;
        };
        this.getNetworkName = function () {
          return networkName;
        };
        this.getNetwork = function () {
          return RWS.IO.getNetwork(networkName);
        };
        this.getPhysicalState = function () {
          if (physicalState !== null) return Promise.resolve(physicalState);
          return this.fetch()
            .then(() => Promise.resolve(physicalState))
            .catch((err) => Promise.reject(err));
        };
        this.getLogicalState = function () {
          if (logicalState !== null) return Promise.resolve(logicalState);
          return this.fetch()
            .then(() => Promise.resolve(logicalState))
            .catch((err) => Promise.reject(err));
        };
        this.getSignal = function (signalName) {
          let signal = RWS.IO.createSignal_internal(networkName, deviceName, signalName);
          return signal
            .fetch()
            .then(() => Promise.resolve(signal))
            .catch((err) => Promise.reject(err));
        };
        this.fetch = function () {
          if (isUnassigned) return rejectWithStatus('Device is not valid, as it is unassigned.');
          return o.Network.get(`/rw/iosystem/${devicePath}`)
            .then((res) => {
              let obj = parseJSON(res.responseText);
              if (typeof obj === 'undefined') return Promise.reject('Could not parse JSON.');
              for (const item of obj._embedded.resources) {
                if (item._type === 'ios-device-li') {
                  physicalState = item.pstate;
                  logicalState = item.lstate;
                  break;
                }
              }
              return Promise.resolve();
            })
            .catch((err) => rejectWithStatus('Failed updating device data.', err));
        };
      }
      function Signal(
        network,
        device,
        signal,
        _category = null,
        _signalType = null,
        _signalValue = null,
        _isSimulated = null,
        _quality = null,
        _accessLvl = null,
        _writeAccess = null,
        _safeLvl = null,
      ) {
        let isUnassigned = network === UNASSIGNED_TAG && device === UNASSIGNED_TAG;
        let signalPath =
          isUnassigned === true
            ? `${encodeURIComponent(signal)}`
            : `${encodeURIComponent(network)}/${encodeURIComponent(device)}/${encodeURIComponent(signal)}`;
        let networkName = isNonEmptyString(network) === true ? network : '';
        let deviceName = isNonEmptyString(device) === true ? device : '';
        let signalName = isNonEmptyString(signal) === true ? signal : '';
        let category = _category;
        let signalType = _signalType;
        let signalValue = _signalValue;
        let isSimulated = _isSimulated;
        let quality = _quality;
        let accessLvl = _accessLvl;
        let writeAccess = _writeAccess;
        let safeLvl = _safeLvl;
        this.getPath = function () {
          return signalPath;
        };
        this.getName = function () {
          return signalName;
        };
        this.getNetworkName = function () {
          return networkName;
        };
        this.getDeviceName = function () {
          return deviceName;
        };
        this.getTitle = function () {
          return signalName;
        };
        this.getIsSimulated = function () {
          if (isSimulated !== null) return Promise.resolve(isSimulated);
          return this.fetch()
            .then(() => Promise.resolve(isSimulated))
            .catch((err) => Promise.reject(err));
        };
        this.getQuality = function () {
          if (quality !== null) return Promise.resolve(quality);
          return this.fetch()
            .then(() => Promise.resolve(quality))
            .catch((err) => Promise.reject(err));
        };
        this.getCategory = function () {
          if (category !== null) return Promise.resolve(category);
          return this.fetch()
            .then(() => Promise.resolve(category))
            .catch((err) => Promise.reject(err));
        };
        this.getType = function () {
          if (signalType !== null) return Promise.resolve(signalType);
          return this.fetch()
            .then(() => Promise.resolve(signalType))
            .catch((err) => Promise.reject(err));
        };
        this.getAccessLevel = function () {
          if (accessLvl !== null && accessLvl !== undefined) return Promise.resolve(accessLvl);
          return this.fetch()
            .then(() => Promise.resolve(accessLvl))
            .catch((err) => Promise.reject(err));
        };
        this.getWriteAccess = function () {
          if (writeAccess !== null && writeAccess !== undefined) return Promise.resolve(writeAccess);
          return this.fetch()
            .then(() => Promise.resolve(writeAccess))
            .catch((err) => Promise.reject(err));
        };
        this.getSafeLevel = function () {
          if (safeLvl !== null && safeLvl !== undefined) return Promise.resolve(safeLvl);
          return this.fetch()
            .then(() => Promise.resolve(safeLvl))
            .catch((err) => Promise.reject(err));
        };
        this.getValue = function () {
          if (signalValue !== null) return Promise.resolve(signalValue);
          return this.fetch()
            .then(() => Promise.resolve(signalValue))
            .catch((err) => Promise.reject(err));
        };
        this.getDevice = function () {
          if (isUnassigned) return rejectWithStatus('Not allowed as Signal is unassigned.');
          return RWS.IO.getDevice(networkName, deviceName);
        };
        this.fetch = function () {
          return o.Network.get(`/rw/iosystem/signals/${signalPath}`)
            .then((res) => {
              let obj = parseJSON(res.responseText);
              if (typeof obj === 'undefined') return Promise.reject('Could not parse JSON.');
              for (const item of obj._embedded.resources) {
                if (item._type === 'ios-signal-li') {
                  signalType = item.type;
                  if (signalType === 'AI' || signalType === 'AO') {
                    signalValue = parseFloat(item.lvalue);
                  } else {
                    signalValue = parseInt(item.lvalue);
                  }
                  isSimulated = item.lstate === 'simulated';
                  quality = item.quality;
                  category = item.category;
                  accessLvl = item['access-level'];
                  writeAccess = item['write-access'];
                  safeLvl = item['safe-level'];
                  break;
                }
              }
              return Promise.resolve('Refreshed Signal.');
            })
            .catch((err) => rejectWithStatus('Failed refreshing data.', err));
        };
        this.setValue = (value) => {
          let hasMastership = false;
          let error = null;
          return requestMastership()
            .then(() => {
              hasMastership = true;
              return o.Network.post(
                `/rw/iosystem/signals/${signalPath}/set-value`,
                `lvalue=${encodeURIComponent(value)}`,
              );
            })
            .catch((err) => {
              if (hasMastership === true) {
                error = err;
                return Promise.resolve();
              }
              return rejectWithStatus('Failed to get Mastership.', err);
            })
            .then(() => releaseMastership())
            .then(() => {
              if (error !== null) return rejectWithStatus('Failed to set value.', error);
              return Promise.resolve();
            });
        };
        var callbacks = [];
        this.addCallbackOnChanged = function (callback) {
          if (typeof callback !== 'function') throw new Error('callback is not a valid function');
          callbacks.push(callback);
        };
        this.onchanged = function (newValue) {
          let lvalue = '';
          if (newValue.hasOwnProperty('lvalue')) lvalue = newValue['lvalue'];
          if (signalType === 'AI' || signalType === 'AO') signalValue = parseFloat(lvalue);
          else signalValue = parseInt(lvalue);
          for (let iii = 0; iii < callbacks.length; iii++) {
            try {
              callbacks[iii](signalValue);
            } catch (error) {
              o.writeDebug(`IO.Signal callback failed. >>> ${error.toString()}`, 3);
            }
          }
        };
        this.getResourceString = function () {
          return `/rw/iosystem/signals/${encodePath(signalPath)};state`;
        };
        const raiseEvent = async () => {
          try {
            await this.fetch();
          } catch (error) {
            o.writeDebug(`IO.Signal fetch failed. >>> ${error.toString()}`, 3);
          }
          for (let iii = 0; iii < callbacks.length; iii++) {
            try {
              callbacks[iii](signalValue);
            } catch (error) {
              o.writeDebug(`IO.Signal callback failed. >>> ${error.toString()}`, 3);
            }
          }
        };
        this.subscribe = function (raiseInitial = false) {
          if (raiseInitial === true) return o.Subscriptions.subscribe([this], raiseEvent);
          return o.Subscriptions.subscribe([this]);
        };
        this.unsubscribe = function () {
          return o.Subscriptions.unsubscribe([this]);
        };
      }
      this.getSignal = function (signal) {
        return this.searchSignals({
          name: signal,
        })
          .then((x) => {
            if (x.length < 1) return rejectWithStatus('Error getting signal.', 'Signal not found.');
            let s = null;
            const signalLower = signal.toLowerCase();
            for (let iii = 0; iii < x.length; iii++) {
              if (x[iii].getName().toLowerCase() === signalLower) {
                s = x[iii];
                break;
              }
            }
            if (s === null) return rejectWithStatus('Error getting signal.', 'Signal not found.');
            return Promise.resolve(s);
          })
          .catch((err) => Promise.reject(err));
      };
      this.setSignalValue = function (signal, value) {
        return this.getSignal(signal)
          .then((x) => x.setValue(value))
          .catch((err) => rejectWithStatus('Error setting signal.', err));
      };
      this.searchSignals = async (filter = {}) => {
        async function _searchSignalsImpl(filter, offset = 0) {
          const CHUNK_SIZE = 100;
          let body = '';
          const refObject = {
            name: '',
            device: '',
            network: '',
            category: '',
            'category-pon': '',
            type: '',
            invert: true,
            blocked: true,
          };
          const s = verifyDataType(filter, refObject);
          if (s !== '') {
            throw createStatusObject('Failed searching signal.', s);
          }
          try {
            Object.keys(filter).forEach((key) => {
              body += `${key}=${encodeURIComponent(filter[key])}&`;
            });
            body = body.slice(0, -1);
          } catch (error) {
            throw createStatusObject('Failed searching signal.', error);
          }
          const signals = [];
          let obj;
          try {
            const rwsRes = await o.Network.post(
              `/rw/iosystem/signals/signal-search-ex?start=${encodeURIComponent(offset)}&limit=${encodeURIComponent(CHUNK_SIZE)}`,
              body,
              {
                Accept: 'application/hal+json;v=2.0',
              },
            );
            obj = parseJSON(rwsRes.responseText);
            if (typeof obj === 'undefined') throw 'Could not parse JSON.';
            for (const item of obj._embedded.resources) {
              if (item._type === 'ios-signal-li') {
                const path = item._title.split('/');
                let networkName = UNASSIGNED_TAG;
                let deviceName = UNASSIGNED_TAG;
                let signalName = '';
                if (path.length === 1) {
                  signalName = path[0];
                } else if (path.length === 3) {
                  networkName = path[0];
                  deviceName = path[1];
                  signalName = path[2];
                } else {
                  console.error(`Invalid signal data: '${item._title}'`);
                  continue;
                }
                let signalValue;
                if (item.type === 'AI' || item.type === 'AO') {
                  signalValue = parseFloat(item.lvalue);
                } else {
                  signalValue = parseInt(item.lvalue);
                }
                const signal = new Signal(
                  networkName,
                  deviceName,
                  signalName,
                  item.category,
                  item.type,
                  signalValue,
                  item.lstate === 'simulated',
                  item.quality,
                  item['access-level'],
                  item['write-access'],
                  item['safe-level'],
                );
                signals.push(signal);
              }
            }
          } catch (error) {
            throw createStatusObject('Failed searching signal.', error);
          }
          if (obj !== undefined && obj._links !== undefined && obj._links.next !== undefined) {
            for (const sig of await _searchSignalsImpl(filter, offset + CHUNK_SIZE)) {
              signals.push(sig);
            }
          }
          return signals;
        }
        return await _searchSignalsImpl(filter);
      };
      this.getNetwork = function (networkName) {
        let url = '/rw/iosystem/networks';
        let body = `name=${encodeURIComponent(networkName)}`;
        return o.Network.post(url, body)
          .then((res) => {
            let obj = parseJSON(res.responseText);
            if (typeof obj === 'undefined') return Promise.reject('Could not parse JSON.');
            for (const item of obj._embedded.resources) {
              if (item._type !== 'ios-network-li') continue;
              if (item.name === networkName) {
                let network = new Network(networkName);
                return Promise.resolve(network);
              }
            }
            return Promise.reject(`Network '${networkName}' not found.`);
          })
          .catch((err) => rejectWithStatus('Failed to search networks.', err));
      };
      this.getDevice = function (networkName, deviceName) {
        let url = '/rw/iosystem/devices';
        let body = `network=${encodeURIComponent(networkName)}&name=${encodeURIComponent(deviceName)}`;
        return o.Network.post(url, body)
          .then((res) => {
            let obj = parseJSON(res.responseText);
            if (typeof obj === 'undefined') return Promise.reject('Could not parse JSON.');
            for (const item of obj._embedded.resources) {
              if (item._type !== 'ios-device-li') continue;
              if (item.name === deviceName) {
                let device = new Device(networkName, deviceName);
                return Promise.resolve(device);
              }
            }
            return Promise.reject(`Device '${deviceName}' not found on network '${networkName}'.`);
          })
          .catch((err) => rejectWithStatus('Failed to search devices.', err));
      };
    })();
    o.CFG = new (function () {
      this.LoadMode = {
        add: 'add',
        replace: 'replace',
        'add-with-reset': 'add-with-reset',
      };
      function Domain(name) {
        var domainName = name;
        this.getName = function () {
          return domainName;
        };
        this.getTypes = function () {
          const processGet = (url, instances) => {
            if (url === '') return Promise.resolve(instances);
            return o.Network.get(url)
              .then((res) => {
                let obj = parseJSON(res.responseText);
                if (typeof obj === 'undefined') return Promise.reject('Could not parse JSON.');
                if (obj._links.hasOwnProperty('next')) {
                  url = '/rw/cfg/' + encodeURI(obj._links['next'].href);
                } else {
                  url = '';
                }
                for (const item of obj._embedded.resources) {
                  if (item._type !== 'cfg-dt-li') continue;
                  let i = new Type(this, item._title);
                  types.push(i);
                }
                return processGet(url, types);
              })
              .catch((err) => Promise.reject(err));
          };
          let types = [];
          let url = '/rw/cfg/' + encodeURIComponent(domainName);
          return processGet(url, types)
            .then(() => Promise.resolve(types))
            .catch((err) => rejectWithStatus('Failed to get types.', err));
        };
        this.getInstances = function (type) {
          return new Type(this, type).getInstances();
        };
        this.getInstanceByName = function (type, name) {
          return new Type(this, type).getInstanceByName(name);
        };
        this.getInstanceById = function (type, id) {
          return new Type(this, type).getInstanceById(id);
        };
        this.createInstance = function (type, name = '') {
          return new Type(this, type).createInstance(name);
        };
        this.updateAttributesByName = function (type, name, attributes) {
          return new Type(this, type).updateAttributesByName(name, attributes);
        };
        this.updateAttributesById = function (type, id, attributes) {
          return new Type(this, type).updateAttributesById(id, attributes);
        };
        this.deleteInstanceByName = function (type, name) {
          return new Type(this, type).deleteInstanceByName(name);
        };
        this.deleteInstanceById = async function (type, id) {
          return new Type(this, type).deleteInstanceById(id);
        };
        this.saveToFile = function (filePath) {
          let path = `/fileservice/${filePath}`;
          let body = `filepath=${encodeURIComponent(path)}`;
          return o.Network.post('/rw/cfg/' + encodePath(domainName) + '/saveas', body)
            .then(() => Promise.resolve())
            .catch((err) => rejectWithStatus('Failed to save file.', err));
        };
      }
      function Type(domain, name) {
        var parent = domain;
        var domainName = parent.getName();
        var typeName = name;
        this.getName = function () {
          return typeName;
        };
        this.getDomainName = function () {
          return domainName;
        };
        this.getDomain = function () {
          return parent;
        };
        this.getInstances = function () {
          const getInstance = (item) => {
            let id = item.instanceid;
            let attributes = {};
            let name = '';
            for (var u = 0; u < item.attrib.length; u++) {
              attributes[item.attrib[u]._title] = item.attrib[u].value;
              if (typeof item.attrib[u]._title === 'string' && item.attrib[u]._title.toLowerCase() === 'name')
                name = item.attrib[u].value;
            }
            return new Instance(this, id, name, attributes);
          };
          const checkExists = (instances, instance) => {
            for (const i of instances) {
              if (i.getInstanceId() === instance.getInstanceId()) return true;
            }
            return false;
          };
          const processGet = (url, instances) => {
            if (url === '') return Promise.resolve(instances);
            return o.Network.get(url)
              .then((res) => {
                let obj = parseJSON(res.responseText);
                if (typeof obj === 'undefined') return Promise.reject('Could not parse JSON.');
                if (obj._links.hasOwnProperty('next')) {
                  let splits = obj._links['next'].href.split('?');
                  if (splits.length === 2) {
                    url =
                      '/rw/cfg/' +
                      encodeURIComponent(domainName) +
                      '/' +
                      encodeURIComponent(typeName) +
                      '/instances?' +
                      splits[1];
                  } else {
                    url = '';
                  }
                } else {
                  url = '';
                }
                if (obj._embedded.resources.length === 0) url = '';
                for (const item of obj._embedded.resources) {
                  if (item._type !== 'cfg-dt-instance-li') continue;
                  let i = getInstance(item);
                  if (checkExists(instances, i) === false) instances.push(i);
                }
                return processGet(url, instances);
              })
              .catch((err) => Promise.reject(err));
          };
          let instances = [];
          let url = '/rw/cfg/' + encodeURIComponent(domainName) + '/' + encodeURIComponent(typeName) + '/instances';
          return processGet(url, instances)
            .then(() => Promise.resolve(instances))
            .catch((err) => rejectWithStatus('Failed to get instances.', err));
        };
        this.getInstanceByName = function (name) {
          return o.Network.get(
            '/rw/cfg/' +
              encodeURIComponent(domainName) +
              '/' +
              encodeURIComponent(typeName) +
              '/instances/' +
              encodeURIComponent(name),
          )
            .then((res) => {
              let obj = parseJSON(res.responseText);
              if (typeof obj === 'undefined') return Promise.reject('Could not parse JSON.');
              let attributes = {};
              let instanceName = '';
              let instanceId = '';
              for (const item of obj.state) {
                if (item._type === 'cfg-dt-instance') {
                  instanceId = item.instanceid;
                  for (var iii = 0; iii < item.attrib.length; iii++) {
                    attributes[item.attrib[iii]._title] = item.attrib[iii].value;
                    if (typeof item.attrib[iii]._title === 'string' && item.attrib[iii]._title.toLowerCase() === 'name')
                      instanceName = item.attrib[iii].value;
                  }
                  break;
                }
              }
              if (instanceName !== '') {
                return Promise.resolve(new Instance(this, instanceId, instanceName, attributes));
              } else {
                return Promise.reject('Incorrect instance returned.');
              }
            })
            .catch((err) => rejectWithStatus(`Could not get instance '${name}'.`, err));
        };
        this.getInstanceById = function (id) {
          return o.Network.get(
            '/rw/cfg/' +
              encodeURIComponent(domainName) +
              '/' +
              encodeURIComponent(typeName) +
              '/instances/' +
              encodeURIComponent(id),
          )
            .then((res) => {
              let obj = parseJSON(res.responseText);
              if (typeof obj === 'undefined') return Promise.reject('Could not parse JSON.');
              let attributes = {};
              let instanceName = '';
              let instanceId = '';
              for (const item of obj.state) {
                if (item._type === 'cfg-dt-instance') {
                  instanceId = item.instanceid;
                  for (var iii = 0; iii < item.attrib.length; iii++) {
                    attributes[item.attrib[iii]._title] = item.attrib[iii].value;
                    if (typeof item.attrib[iii]._title === 'string' && item.attrib[iii]._title.toLowerCase() === 'name')
                      instanceName = item.attrib[iii].value;
                  }
                  break;
                }
              }
              if (instanceId !== '') {
                return Promise.resolve(new Instance(this, instanceId, instanceName, attributes));
              } else {
                return Promise.reject('Incorrect instance returned.');
              }
            })
            .catch((err) => rejectWithStatus(`Could not get instance '${id}'.`, err));
        };
        this.createInstance = function (name = '') {
          let body = 'name=';
          let uri =
            '/rw/cfg/' +
            encodeURIComponent(domainName) +
            '/' +
            encodeURIComponent(typeName) +
            '/instances/create-default';
          if (typeof name === 'string' && name !== '') {
            body += encodeURIComponent(name);
          }
          return o.Network.post(uri, body)
            .then((x1) => Promise.resolve(x1))
            .catch((err) => rejectWithStatus('Failed to create instance.', err));
        };
        this.updateAttributesByName = function (name, attributes) {
          return this.getInstanceByName(name)
            .then((instance) => {
              let inst = instance.updateAttributes(attributes);
              return Promise.resolve(inst);
            })
            .catch((err) => rejectWithStatus('Could not update attributes.', err));
        };
        this.updateAttributesById = function (id, attributes) {
          return this.getInstanceById(id)
            .then((instance) => {
              let inst = instance.updateAttributes(attributes);
              return Promise.resolve(inst);
            })
            .catch((err) => rejectWithStatus('Could not update attributes.', err));
        };
        this.deleteInstanceByName = async function (name) {
          try {
            let instance = await this.getInstanceByName(name);
            return await instance.delete();
          } catch (e) {
            throw createStatusObject('Could not delete instance.', e);
          }
        };
        this.deleteInstanceById = async function (id) {
          try {
            let instance = await this.getInstanceById(id);
            return await instance.delete();
          } catch (e) {
            throw createStatusObject('Could not delete instance.', e);
          }
        };
      }
      function Instance(type, id, name, attributes) {
        var parent = type;
        var instanceId = id;
        var instanceName = name;
        var domainName = parent.getDomainName();
        var typeName = parent.getName();
        var instanceAttributes = attributes;
        this.getInstanceId = function () {
          return instanceId;
        };
        this.getInstanceName = function () {
          return instanceName;
        };
        this.getTypeName = function () {
          return typeName;
        };
        this.getType = function () {
          return parent;
        };
        this.getAttributes = function () {
          return instanceAttributes;
        };
        this.updateAttributes = function (attributes) {
          var body = '';
          for (let item in attributes) {
            body += item + '=' + encodeURIComponent('[' + attributes[item] + ',1]') + '&';
          }
          body = body.replace(/&$/g, '');
          var uri =
            '/rw/cfg/' +
            encodeURIComponent(domainName) +
            '/' +
            encodeURIComponent(typeName) +
            '/instances/' +
            encodeURIComponent(instanceId);
          return o.Network.post(uri, body)
            .then(() => {
              try {
                for (let item in attributes) {
                  if (instanceAttributes[item] !== undefined) {
                    instanceAttributes[item] = attributes[item];
                  } else {
                    let s = instanceName == '' ? instanceId : instanceName;
                    o.writeDebug("attribute '" + item + "' does not exist on instance '" + s + "'");
                  }
                }
              } catch (error) {
                o.writeDebug('Failed updating Instance object.');
              }
              return Promise.resolve();
            })
            .catch((err) => rejectWithStatus('Failed updating attributes.', err));
        };
        this.delete = async function () {
          try {
            const uri = `/rw/cfg/${encodeURIComponent(domainName)}/${encodeURIComponent(typeName)}/instances/${encodeURIComponent(instanceName == '' ? instanceId : instanceName)}`;
            await o.Network.delete(uri);
          } catch (e) {
            throw createStatusObject('Error when deleting CFG instance.', e);
          }
        };
      }
      this.getDomains = function () {
        return o.Network.get('/rw/cfg')
          .then((res) => {
            let obj = parseJSON(res.responseText);
            if (typeof obj === 'undefined') return Promise.reject('Could not parse JSON.');
            let domains = [];
            for (const item of obj._embedded.resources) {
              if (item._type === 'cfg-domain-li') {
                domains.push(new Domain(item._title));
              }
            }
            if (domains.length == 0) {
              return Promise.reject('Could not find any domains in RWS response');
            }
            return Promise.resolve(domains);
          })
          .catch((err) => rejectWithStatus('Failed getting domains.', err));
      };
      this.saveConfiguration = function (domain, filePath) {
        return new Domain(domain).saveToFile(filePath);
      };
      this.verifyConfigurationFile = function (filePath, action = 'add') {
        if (isNonEmptyString(filePath) === false) return rejectWithStatus("Invalid parameter 'filePath'.");
        if (typeof action === 'string') action = action.toLowerCase();
        if (action !== 'add' && action !== 'replace' && action !== 'add-with-reset')
          return rejectWithStatus("Invalid parameter 'action'.");
        let body = `filepath=${encodeURIComponent(filePath)}&action-type=${encodeURIComponent(action)}`;
        return o.Network.post('/rw/cfg/validate', body)
          .then(() => Promise.resolve())
          .catch((err) => rejectWithStatus(`Failed to verify the file '${filePath}'.`, err));
      };
      this.loadConfiguration = function (filePath, action = 'add') {
        if (isNonEmptyString(filePath) === false) return rejectWithStatus("Invalid parameter 'filePath'.");
        if (typeof action === 'string') action = action.toLowerCase();
        if (action !== 'add' && action !== 'replace' && action !== 'add-with-reset')
          return rejectWithStatus("Invalid parameter 'action'.");
        let body = `filepath=${encodeURIComponent(filePath)}&action-type=${encodeURIComponent(action)}`;
        return o.Network.post('/rw/cfg/load', body)
          .then((res) => {
            let location = res.getResponseHeader('Location');
            if (location !== null) {
              return waitProgressCompletion(location, COMMON_TIMEOUT)
                .then((code) => getStatusCode(code))
                .then((status) => {
                  if (status.severity.toLowerCase() === 'error')
                    return Promise.reject({
                      message: 'Progress resource reported error.',
                      controllerStatus: status,
                    });
                  return Promise.resolve();
                })
                .catch((err) => Promise.reject(err));
            }
            o.writeDebug(
              'loadConfiguration: Failed to get the location of progress resource. The file will be loaded but the call returns before it has completed.',
              2,
            );
            return Promise.resolve();
          })
          .catch((err) => rejectWithStatus(`Failed to load the file '${filePath}'.`, err));
      };
      this.getTypes = function (domain) {
        return new Domain(domain).getTypes();
      };
      this.getInstances = function (domain, type) {
        return new Domain(domain).getInstances(type);
      };
      this.getInstanceByName = function (domain, type, name) {
        return new Domain(domain).getInstanceByName(type, name);
      };
      this.getInstanceById = function (domain, type, id) {
        return new Domain(domain).getInstanceById(type, id);
      };
      this.createInstance = function (domain, type, name = '') {
        return new Domain(domain).createInstance(type, name);
      };
      this.updateAttributesByName = function (domain, type, name, attributes) {
        return new Domain(domain).updateAttributesByName(type, name, attributes);
      };
      this.updateAttributesById = function (domain, type, id, attributes) {
        return new Domain(domain).updateAttributesById(type, id, attributes);
      };
      this.deleteInstanceByName = function (domain, type, name) {
        return new Domain(domain).deleteInstanceByName(type, name);
      };
      this.deleteInstanceById = function (domain, type, id) {
        return new Domain(domain).deleteInstanceByName(type, id);
      };
    })();
    o.Controller = new (function () {
      const replacables = {
        init: 'initializing',
        motoron: 'motors_on',
        motoroff: 'motors_off',
        guardstop: 'guard_stop',
        emergencystop: 'emergency_stop',
        emergencystopreset: 'emergency_stop_resetting',
        sysfail: 'system_failure',
        INIT: 'initializing',
        AUTO_CH: 'automatic_changing',
        MANF_CH: 'manual_full_changing',
        MANR: 'manual_reduced',
        MANF: 'manual_full',
        AUTO: 'automatic',
        UNDEF: 'undefined',
      };
      const processString = function (text) {
        if (typeof text !== 'string' || text === null) return '';
        if (replacables.hasOwnProperty(text) === false) return text.toLowerCase();
        return replacables[text];
      };
      this.MonitorResources = {
        controllerState: 'controller-state',
        operationMode: 'operation-mode',
      };
      this.RestartModes = {
        restart: 'restart',
        shutdown: 'shutdown',
        bootApplication: 'boot_application',
        resetSystem: 'reset_system',
        resetRapid: 'reset_rapid',
        revertToAutoSave: 'revert_to_auto',
      };
      this.BackupIgnoreMismatches = {
        all: 'all',
        systemId: 'system-id',
        templateId: 'template-id',
        none: 'none',
      };
      this.BackupInclude = {
        all: 'all',
        cfg: 'cfg',
        modules: 'modules',
      };
      this.ControllerStates = {
        initializing: 'initializing',
        motors_on: 'motors_on',
        motors_off: 'motors_off',
        guard_stop: 'guard_stop',
        emergency_stop: 'emergency_stop',
        emergency_stop_resetting: 'emergency_stop_resetting',
        system_failure: 'system_failure',
      };
      this.MotorsState = {
        motors_on: 'motors_on',
        motors_off: 'motors_off',
      };
      this.OperationModes = {
        initializing: 'initializing',
        automatic_changing: 'automatic_changing',
        manual_full_changing: 'manual_full_changing',
        manual_reduced: 'manual_reduced',
        manual_full: 'manual_full',
        automatic: 'automatic',
        undefined: 'undefined',
      };
      this.SettableOperationModes = {
        manual: 'manual',
        manual_full: 'manual_full',
        automatic: 'automatic',
      };
      this.BackupStatus = {
        ok: 'ok',
        system_id_mismatch: 'system_id_mismatch',
        template_id_mismatch: 'template_id_mismatch',
        file_or_directory_missing: 'file_or_directory_missing',
        cfg_file_corrupt: 'cfg_file_corrupt',
      };
      function Monitor(resource) {
        if (
          resource.toLowerCase() !== o.Controller.MonitorResources.controllerState &&
          resource.toLowerCase() !== o.Controller.MonitorResources.operationMode
        ) {
          o.writeDebug('Unable to create Controller Monitor: Illegal resource.', 3);
          return;
        }
        let resourceName = resource;
        const urls = {
          'controller-state': '/rw/panel/ctrl-state',
          'operation-mode': '/rw/panel/opmode',
        };
        const resourceStrings = {
          'controller-state': '/rw/panel/ctrl-state',
          'operation-mode': '/rw/panel/opmode',
        };
        var callbacks = [];
        this.getTitle = function () {
          return urls[resourceName];
        };
        this.getResourceString = function () {
          return resourceStrings[resourceName];
        };
        this.addCallbackOnChanged = function (callback) {
          if (typeof callback !== 'function') throw new Error('callback is not a valid function');
          callbacks.push(callback);
        };
        this.onchanged = function (newValue) {
          let parsedValue = {};
          switch (resourceName) {
            case 'controller-state':
              if (newValue.hasOwnProperty('ctrlstate')) parsedValue = processString(newValue['ctrlstate']);
              break;

            case 'operation-mode':
              if (newValue.hasOwnProperty('opmode')) parsedValue = processString(newValue['opmode']);
              break;

            default:
              parsedValue = '';
          }
          for (let iii = 0; iii < callbacks.length; iii++) {
            try {
              callbacks[iii](parsedValue);
            } catch (error) {
              o.writeDebug(`Controller.Monitor callback failed. >>> ${error.toString()}`, 3);
            }
          }
        };
        const raiseEvent = async () => {
          const getValue = async () => {
            let rawValue = await o.Network.get(urls[resourceName])
              .then((x1) => {
                let obj = parseJSON(x1.responseText);
                if (typeof obj === 'undefined') return Promise.reject('Could not parse JSON.');
                return obj;
              })
              .catch((err) => {
                let s = JSON.stringify(err);
                o.writeDebug(`Controller.raiseEvent failed getting value. >>> ${s}`);
                return null;
              });
            if (rawValue === null) return null;
            if (rawValue.hasOwnProperty('state') === false) return null;
            let state = rawValue['state'][0];
            let parsedValue = null;
            switch (resourceName) {
              case 'controller-state':
                if (state.hasOwnProperty('ctrlstate')) parsedValue = processString(state['ctrlstate']);
                break;

              case 'operation-mode':
                if (state.hasOwnProperty('opmode')) parsedValue = processString(state['opmode']);
                break;

              default:
                o.writeDebug(`Unsupported resource '${resourceName}'`);
            }
            return parsedValue;
          };
          let value = await getValue();
          if (value === null) return;
          for (let iii = 0; iii < callbacks.length; iii++) {
            try {
              callbacks[iii](value);
            } catch (error) {
              o.writeDebug(`Controller.Monitor callback failed. >>> ${error.toString()}`, 3);
            }
          }
        };
        this.subscribe = function (raiseInitial = false) {
          if (raiseInitial === true) return o.Subscriptions.subscribe([this], raiseEvent);
          return o.Subscriptions.subscribe([this]);
        };
        this.unsubscribe = function () {
          return o.Subscriptions.unsubscribe([this]);
        };
      }
      this.getMonitor = function (resource) {
        return new Monitor(resource);
      };
      this.isVirtualController = async () => {
        return await o.isVirtualController();
      };
      this.getControllerState = () => {
        return o.Network.get('/rw/panel/ctrl-state')
          .then((res) => {
            let obj = parseJSON(res.responseText);
            if (typeof obj === 'undefined') return Promise.reject('Could not parse JSON.');
            let state = null;
            for (const item of obj.state) {
              if (item._type === 'pnl-ctrlstate') {
                state = processString(item.ctrlstate);
                break;
              }
            }
            if (state === null) {
              return Promise.reject('Could not find the controller state in RWS response');
            }
            return Promise.resolve(state);
          })
          .catch((err) => rejectWithStatus('Could not get controller state.', err));
      };
      this.setMotorsState = (state) => {
        let body = 'ctrl-state=';
        if (typeof state === 'string' && state.toLowerCase() === 'motors_on') {
          body += 'motoron';
        } else if (typeof state === 'string' && state.toLowerCase() == 'motors_off') {
          body += 'motoroff';
        } else {
          return rejectWithStatus('Unknown state.');
        }
        return o.Network.post('/rw/panel/ctrl-state', body)
          .then(() => Promise.resolve())
          .catch((err) => rejectWithStatus('Could not set motors state.', err));
      };
      this.getOperationMode = () => {
        return o.Network.get('/rw/panel/opmode')
          .then((req) => {
            let obj = null;
            try {
              obj = JSON.parse(req.responseText);
            } catch (error) {
              return Promise.reject('Could not parse JSON.');
            }
            let mode = null;
            for (const item of obj.state) {
              if (item._type === 'pnl-opmode') {
                mode = processString(item.opmode);
                break;
              }
            }
            if (mode === null) {
              return Promise.reject('Could not find the controller operation mode in RWS response');
            }
            return Promise.resolve(mode);
          })
          .catch((err) => rejectWithStatus('Could not get controller operation mode.', err));
      };
      this.setOperationMode = (mode) => {
        if (typeof mode !== 'string') return rejectWithStatus("Invalid parameter, 'mode' is not a string.");
        mode = mode.toLowerCase();
        let body = '';
        if (mode === 'automatic') body = 'opmode=auto';
        else if (mode === 'manual') body = 'opmode=man';
        else if (mode === 'manual_full') body = 'opmode=manf';
        else return rejectWithStatus(`Invalid parameter mode='${mode}'.`);
        return o.Network.post('/rw/panel/opmode', body)
          .then(() => Promise.resolve())
          .catch((err) => rejectWithStatus('Could not set controller operation mode.', err));
      };
      this.restartController = (mode = 'restart') => {
        if (typeof mode !== 'string') return rejectWithStatus("Invalid parameter, 'mode' is not a string.");
        mode = mode.toLowerCase();
        let body = '';
        if (mode === 'restart') body = 'restart-mode=restart';
        else if (mode === 'shutdown') body = 'restart-mode=shutdown';
        else if (mode === 'boot_application') body = 'restart-mode=xstart';
        else if (mode === 'reset_system') body = 'restart-mode=istart';
        else if (mode === 'reset_rapid') body = 'restart-mode=pstart';
        else if (mode === 'revert_to_auto') body = 'restart-mode=bstart';
        else return rejectWithStatus(`'@{mode}' is not a valid restart mode.`);
        return o.Network.post('/ctrl/restart?mastership=implicit', body)
          .then(() => Promise.resolve())
          .catch((err) => rejectWithStatus('Restart failed.', err));
      };
      this.getEnvironmentVariable = (variable) => {
        if (typeof variable !== 'string') return rejectWithStatus('Illegal environment variable.');
        return o.Network.get(`/ctrl/${encodeURIComponent(variable)}`)
          .then((res) => {
            let obj = parseJSON(res.responseText);
            if (typeof obj === 'undefined') return Promise.reject('Could not parse JSON.');
            let value = '';
            for (const item of obj.state) {
              if (item._type === 'ctrl-env') {
                value = item['value'];
                break;
              }
            }
            if (value === '') return Promise.reject('value not found.');
            return Promise.resolve(value);
          })
          .catch((err) => rejectWithStatus(`Could not get environment variable '${variable}'.`, err));
      };
      this.getTime = () => {
        return o.Network.get('/ctrl/clock')
          .then((res) => {
            let obj = parseJSON(res.responseText);
            if (typeof obj === 'undefined') return Promise.reject('Could not parse JSON.');
            let datetime = '';
            for (const item of obj.state) {
              if (item._type === 'ctrl-clock-info') {
                datetime = item['datetime'];
                break;
              }
            }
            if (datetime === '') return Promise.reject("'datetime' not found.");
            return Promise.resolve(datetime);
          })
          .catch((err) => rejectWithStatus('Could not get time.', err));
      };
      this.getTimezone = async () => {
        try {
          if ((await o.isVirtualController()) === true) {
            throw createStatusObject(VC_NOT_SUPPORTED);
          }
          const res = await o.Network.get('/ctrl/clock/timezone');
          const obj = parseJSON(res.responseText);
          if (typeof obj === 'undefined') {
            throw 'Could not parse JSON.';
          }
          let timezone = '';
          for (const item of obj.state) {
            if (item._type === 'ctrl-timezone') {
              timezone = item.timezone;
              break;
            }
          }
          if (timezone === '') {
            throw "'ctrl-timezone' not found.";
          }
          return timezone;
        } catch (e) {
          throw createStatusObject('Could not get timezone.', e);
        }
      };
      this.getIdentity = () => {
        return o.Network.get('/ctrl/identity')
          .then((res) => {
            let obj = parseJSON(res.responseText);
            if (typeof obj === 'undefined') return Promise.reject('Could not parse JSON.');
            let identity = '';
            for (const item of obj.state) {
              if (item._type === 'ctrl-identity-info') {
                identity = item['ctrl-name'];
                break;
              }
            }
            if (identity === '') return Promise.reject("'ctrl-name' not found.");
            return Promise.resolve(identity);
          })
          .catch((err) => rejectWithStatus('Could not get identity.', err));
      };
      this.getNetworkSettings = async () => {
        try {
          if ((await o.isVirtualController()) === true) {
            throw createStatusObject(VC_NOT_SUPPORTED);
          }
          const res = await o.Network.get('/ctrl/network');
          const obj = parseJSON(res.responseText);
          if (typeof obj === 'undefined') {
            throw 'Could not parse JSON.';
          }
          const settingsList = [];
          for (const item of obj.state) {
            if (item._type === 'ctrl-netw') {
              let settings = {
                id: item.title,
                logicalName: item['logical-name'],
                network: item['network'],
                address: item['addr'],
                mask: item['mask'],
                primaryDNS: item['dns-primary'],
                secondaryDNS: item['dns-secondary'],
                DHCP: item['dhcp'].toLowerCase() === 'true',
                gateway: item['gateway'],
              };
              settingsList.push(settings);
            }
          }
          return settingsList;
        } catch (err) {
          throw createStatusObject('Could not get network settings.', err);
        }
      };
      this.getNetworkConnections = async () => {
        try {
          if ((await o.isVirtualController()) === true) {
            throw createStatusObject(VC_NOT_SUPPORTED);
          }
          const res = await o.Network.get('/ctrl/network/advanced');
          const obj = parseJSON(res.responseText);
          if (typeof obj === 'undefined') {
            throw 'Could not parse JSON.';
          }
          const connectionsList = [];
          for (const item of obj.state) {
            if (item._type === 'ctrl-netw-adv') {
              let connection = {
                id: item.title,
                MACAddress: item['mac-address'],
                connected: item['media-state'].toLowerCase() === 'plugged',
                enabled: item['enabled'].toLowerCase() === 'true',
                speed: item['speed'],
              };
              connectionsList.push(connection);
            }
          }
          return connectionsList;
        } catch (err) {
          throw createStatusObject('Could not get network connections.', err);
        }
      };
      this.verifyOption = (option) => {
        if (typeof option !== 'string' || option === '') return rejectWithStatus("Invalid parameter 'option'.");
        let uri = '/ctrl/options/' + encodeURIComponent(option);
        return o.Network.get(uri)
          .then(() => Promise.resolve(true))
          .catch((err) => {
            if (
              err.hasOwnProperty('httpStatus') &&
              err.httpStatus.hasOwnProperty('code') &&
              err.httpStatus.code === 404
            )
              return Promise.resolve(false);
            else return rejectWithStatus('Failed to verify option.', err);
          });
      };
      this.createBackup = (path, timeout = 60) => {
        if (typeof path !== 'string' || path === '') return rejectWithStatus('Invalid path.');
        if (typeof timeout !== 'number' || timeout <= 0) return rejectWithStatus('Invalid timeout.');
        let p = `/fileservice/${path}`;
        let body = `backup=${encodeURIComponent(p)}`;
        return o.Network.post('/ctrl/backup/create', body)
          .then((res) => {
            let location = res.getResponseHeader('Location');
            if (location !== null) {
              return waitProgressCompletion(location, timeout)
                .then((code) => getStatusCode(code))
                .then((status) => {
                  if (status.severity.toLowerCase() === 'error')
                    return Promise.reject({
                      message: 'Progress resource reported error.',
                      controllerStatus: status,
                    });
                  return Promise.resolve();
                })
                .catch((err) => Promise.reject(err));
            }
            o.writeDebug(
              'createBackup: Failed to get the location of progress resource. The backup will be created but the call returns before it has completed.',
              2,
            );
            return Promise.resolve();
          })
          .catch((err) => rejectWithStatus('Backup process failed.', err));
      };
      this.verifyBackup = (
        path,
        {
          ignoreMismatches = this.BackupIgnoreMismatches.none,
          includeControllerSettings = true,
          includeSafetySettings = true,
          include = this.BackupInclude.all,
        } = {},
      ) => {
        const replacables = {
          ACCEPTED: 'ok',
          RESTORE_MISMATCH_SYSTEM_ID: 'system_id_mismatch',
          RESTORE_MISMATCH_TEMPLATE_ID: 'template_id_mismatch',
          DIR_NOT_COMPLETE: 'file_or_directory_missing',
          CFG_DATA_INCORRECT: 'cfg_file_corrupt',
        };
        const processString = function (text) {
          if (typeof text !== 'string' || text === null) return '';
          if (replacables.hasOwnProperty(text) === false) return text.toLowerCase();
          return replacables[text];
        };
        if (typeof path !== 'string' || path === '') return rejectWithStatus('Invalid path.');
        if (
          ignoreMismatches !== 'all' &&
          ignoreMismatches !== 'system-id' &&
          ignoreMismatches !== 'template-id' &&
          ignoreMismatches !== 'none'
        )
          return rejectWithStatus("Invalid parameter 'ignoreMismatches'.");
        if (typeof includeControllerSettings !== 'boolean')
          return rejectWithStatus("Invalid parameter 'includeControllerSettings'.");
        if (typeof includeSafetySettings !== 'boolean')
          return rejectWithStatus("Invalid parameter 'includeSafetySettings'.");
        if (include !== 'cfg' && include !== 'modules' && include !== 'all')
          return rejectWithStatus("Invalid parameter 'include'.");
        let p = `/fileservice/${path}`;
        let body = `backup=${encodeURIComponent(p)}`;
        body += '&ignore=' + encodeURIComponent(ignoreMismatches);
        body += '&include-cs=' + encodeURIComponent(includeControllerSettings.toString());
        body += '&include-ss=' + encodeURIComponent(includeSafetySettings.toString());
        body += '&include=' + encodeURIComponent(include);
        return o.Network.post('/ctrl/backup/check-restore', body)
          .then((res) => {
            let obj = parseJSON(res.responseText);
            if (typeof obj === 'undefined') return Promise.reject('Could not parse JSON.');
            let statuses = [];
            for (const item of obj.state) {
              if (item._type === 'ctrl-checkrestore' && item['status'] !== 'ACCEPTED') {
                let status = {
                  status: processString(item['status']),
                  path: item['path'] === undefined ? '' : item['path'],
                };
                statuses.push(status);
              }
            }
            return Promise.resolve(statuses);
          })
          .catch((err) => rejectWithStatus('Verify backup failed.', err));
      };
      this.restoreBackup = (
        path,
        {
          ignoreMismatches = this.BackupIgnoreMismatches.none,
          deleteDir = true,
          includeSafetySettings = true,
          include = this.BackupInclude.all,
        } = {},
      ) => {
        if (typeof path !== 'string' || path === '') return rejectWithStatus('Invalid path.');
        if (
          ignoreMismatches !== 'all' &&
          ignoreMismatches !== 'system-id' &&
          ignoreMismatches !== 'template-id' &&
          ignoreMismatches !== 'none'
        )
          return rejectWithStatus("Invalid parameter 'ignoreMismatches'.");
        if (typeof deleteDir !== 'boolean') return rejectWithStatus("Invalid parameter 'deleteDir'.");
        if (typeof includeSafetySettings !== 'boolean')
          return rejectWithStatus("Invalid parameter 'includeSafetySettings'.");
        if (include !== 'cfg' && include !== 'modules' && include !== 'all')
          return rejectWithStatus("Invalid parameter 'include'.");
        let p = `/fileservice/${path}`;
        let body = `backup=${encodeURIComponent(p)}`;
        body += '&ignore=' + encodeURIComponent(ignoreMismatches);
        body += '&delete-dir=' + encodeURIComponent(deleteDir.toString());
        body += '&include-ss=' + encodeURIComponent(includeSafetySettings.toString());
        body += '&include=' + encodeURIComponent(include);
        return o.Mastership.request()
          .then(() => {
            return o.Network.post('/ctrl/backup/restore', body)
              .then(() => Promise.resolve('Restore started.'))
              .catch((err) => {
                return o.Mastership.release()
                  .then(() => Promise.reject('Could not start restore. >>> ' + err))
                  .catch((err) =>
                    Promise.reject('Could not start restore and failed to release mastership. >>> ' + err),
                  );
              });
          })
          .catch((err) => rejectWithStatus('Failed to restore backup.', err));
      };
      this.compress = (srcPath, destPath, timeout = 60) => {
        if (typeof srcPath !== 'string' || srcPath === '') return rejectWithStatus("Invalid 'srcPath'.");
        if (typeof destPath !== 'string' || destPath === '') return rejectWithStatus("Invalid 'destPath'.");
        if (isNaN(timeout) == true || timeout < 0) return rejectWithStatus("Invalid 'timeout'.");
        let p1 = `/fileservice/${srcPath}`;
        let p2 = `/fileservice/${destPath}`;
        let body = `srcpath=${encodeURIComponent(p1)}&dstpath=${encodeURIComponent(p2)}`;
        return o.Network.post('/ctrl/compress', body)
          .then((res) => {
            let location = res.getResponseHeader('Location');
            if (location !== null) {
              return waitProgressCompletion(location, timeout)
                .then((code) => getStatusCode(code))
                .then((status) => {
                  if (status.severity.toLowerCase() === 'error')
                    return Promise.reject({
                      message: 'Progress resource reported error.',
                      controllerStatus: status,
                    });
                  return Promise.resolve();
                })
                .catch((err) => Promise.reject(err));
            }
            o.writeDebug(
              'compress: Failed to get the location of progress resource. The file will be compressed but the call returns before it has completed.',
              2,
            );
            return Promise.resolve();
          })
          .catch((err) => rejectWithStatus('Failed to compress file.', err));
      };
      this.decompress = (srcPath, destPath, timeout = 60) => {
        if (typeof srcPath !== 'string' || srcPath === '') return Promise.reject('Invalid srcPath.');
        if (typeof destPath !== 'string' || destPath === '') return Promise.reject('Invalid destPath.');
        if (isNaN(timeout) == true || timeout < 0) return Promise.reject('timeout not valid.');
        let p1 = `/fileservice/${srcPath}`;
        let p2 = `/fileservice/${destPath}`;
        let body = `srcpath=${encodeURIComponent(p1)}&dstpath=${encodeURIComponent(p2)}`;
        return o.Network.post('/ctrl/decompress', body)
          .then((res) => {
            let location = res.getResponseHeader('Location');
            if (location !== null) {
              return waitProgressCompletion(location, timeout)
                .then((code) => getStatusCode(code))
                .then((status) => {
                  if (status.severity.toLowerCase() === 'error')
                    return Promise.reject({
                      message: 'Progress resource reported error.',
                      controllerStatus: status,
                    });
                  return Promise.resolve();
                })
                .catch((err) => Promise.reject(err));
            }
            o.writeDebug(
              'decompress: Failed to get the location of progress resource. The file will be decompressed but the call returns before it has completed.',
              2,
            );
            return Promise.resolve();
          })
          .catch((err) => rejectWithStatus('Failed to decompress file.', err));
      };
      this.saveDiagnostics = async (destPath, timeout = 60) => {
        try {
          if ((await o.isVirtualController()) === true) {
            throw createStatusObject(VC_NOT_SUPPORTED);
          }
          if (typeof destPath !== 'string' || destPath === '') {
            throw "Invalid 'destPath'.";
          }
          if (isNaN(timeout) == true || timeout < 0) {
            throw "Invalid 'timeout'.";
          }
          const p = `/fileservice/${destPath}`;
          const body = `dstpath=${encodeURIComponent(p)}`;
          const res = await o.Network.post('/ctrl/diagnostics/save', body);
          const location = res.getResponseHeader('Location');
          if (location !== null) {
            const code = await waitProgressCompletion(location, timeout);
            const status = await getStatusCode(code);
            if (status.severity.toLowerCase() === 'error') {
              throw {
                message: 'Progress resource reported error.',
                controllerStatus: status,
              };
            }
          } else {
            throw 'saveDiagnostics: Failed to get the location of progress resource. The diagnostics might be successful but the call returns before it has completed.';
          }
        } catch (err) {
          throw createStatusObject('Problem while save diagnostics.', err);
        }
      };
    })();
    o.FileSystem = new (function () {
      const toDate = function (text) {
        try {
          let t = text.replace(/[T]/g, '-');
          t = t.replace(/[ ]/g, '');
          t = t.replace(/[:]/g, '-');
          let splits = t.split('-');
          if (splits.length !== 6) {
            throw new Error('Incorrect number of fields.');
          }
          for (let iii = 0; iii < splits.length; iii++) {
            if (splits[iii] === '') {
              throw new Error(`Field ${iii} is empty.`);
            }
          }
          return new Date(splits[0], splits[1] - 1, splits[2], splits[3], splits[4], splits[5]);
        } catch (error) {
          RWS.writeDebug(`Failed to convert '${text}' to date. >>> ${error}`);
          return new Date();
        }
      };
      function Directory(path = '$HOME') {
        let dirPath = path;
        let dirContents = {
          directories: [],
          files: [],
        };
        let isDeleted = false;
        this.getPath = function () {
          return dirPath;
        };
        this.getProperties = function () {
          if (isDeleted === true) return rejectWithStatus('Directory has been deleted.');
          let path = dirPath.substring(0, dirPath.lastIndexOf('/'));
          let dir = dirPath.substring(dirPath.lastIndexOf('/') + 1);
          if (isNonEmptyString(path) === false) return rejectWithStatus('Could not get directory.');
          return RWS.FileSystem.getDirectory(path)
            .then((x1) => x1.getContents())
            .then((x2) => {
              for (let item of x2.directories) {
                if (item.name === dir) return Promise.resolve(item);
              }
              return Promise.reject('Directory not found.');
            })
            .catch((err) => rejectWithStatus(err));
        };
        this.getContents = function () {
          if (isDeleted === true) return rejectWithStatus('Directory has been deleted.');
          if (dirContents !== null) return Promise.resolve(dirContents);
          return this.fetch()
            .then(() => Promise.resolve(dirContents))
            .catch((err) => rejectWithStatus(err));
        };
        this.delete = function () {
          if (isDeleted === true) return rejectWithStatus('Directory has been deleted.');
          if (isNonEmptyString(dirPath) === false) return rejectWithStatus("Directory's path is not a valid string.");
          let path = `/fileservice/${encodePath(dirPath)}`;
          return o.Network.delete(path)
            .then(() => {
              isDeleted = true;
              return Promise.resolve();
            })
            .catch((err) => rejectWithStatus('Failed deleting directory.', err));
        };
        this.create = function (newDirectory) {
          if (isDeleted === true) return rejectWithStatus('Directory has been deleted.');
          if (isNonEmptyString(newDirectory) === false)
            return rejectWithStatus("New directory's name is not a valid string.");
          if (isNonEmptyString(dirPath) === false) return rejectWithStatus("Directory's path is not a valid string.");
          let path = `/fileservice/${encodePath(dirPath)}/create`;
          let body = `fs-newname=${encodeURIComponent(newDirectory)}`;
          return o.Network.post(path, body)
            .then(() => this.fetch())
            .then(() => RWS.FileSystem.getDirectory(`${dirPath}/${newDirectory}`))
            .then((dir) => Promise.resolve(dir))
            .catch((err) => rejectWithStatus('Failed creating directory.', err));
        };
        this.createFileObject = function (fileName) {
          if (isDeleted === true) return rejectWithStatus('Directory has been deleted.');
          if (isNonEmptyString(fileName) === false) return rejectWithStatus("New file's name is not a valid string.");
          if (isNonEmptyString(dirPath) === false) return rejectWithStatus("Directory's path is not a valid string.");
          return RWS.FileSystem.createFileObject(`${dirPath}/${fileName}`);
        };
        this.rename = function (newName) {
          if (isDeleted === true) return rejectWithStatus('Directory has been deleted.');
          if (isNonEmptyString(newName) === false)
            return rejectWithStatus("New directory's name is not a valid string.");
          if (isNonEmptyString(dirPath) === false) return rejectWithStatus("Directory's path is not a valid string.");
          let path = `/fileservice/${encodePath(dirPath)}/rename`;
          let body = `fs-newname=${encodeURIComponent(newName)}`;
          return o.Network.post(path, body)
            .then(() => {
              let splits = dirPath.split('/');
              let path = '';
              for (let iii = 0; iii < splits.length - 1; iii++) {
                path += splits[iii] + '/';
              }
              dirPath = path + newName;
              return Promise.resolve();
            })
            .catch((err) => rejectWithStatus('Failed renaming directory.', err));
        };
        this.copy = function (copyPath, overwrite, isRelativePath = true) {
          if (isDeleted === true) return rejectWithStatus('Directory has been deleted.');
          if (isNonEmptyString(copyPath) === false)
            return rejectWithStatus("New directory's name is not a valid string.");
          if (isNonEmptyString(dirPath) === false) return rejectWithStatus("Directory's path is not a valid string.");
          if (typeof overwrite !== 'boolean') return rejectWithStatus("Parameter 'overwrite' is not of valid type.");
          if (typeof isRelativePath !== 'boolean')
            return rejectWithStatus("Parameter 'isRelativePath' is not of valid type.");
          let path = `/fileservice/${encodePath(dirPath)}/copy`;
          let body = '';
          if (isRelativePath === true) {
            body = `fs-newname=${encodeURIComponent(copyPath)}&fs-overwrite=${overwrite}`;
          } else {
            let p = `/fileservice/${copyPath}`;
            body = `fs-newname=${encodeURIComponent(p)}&fs-overwrite=${overwrite}`;
          }
          return o.Network.post(path, body)
            .then(() => Promise.resolve())
            .catch((err) => rejectWithStatus('Failed copying directory.', err));
        };
        this.fetch = function () {
          if (isNonEmptyString(dirPath) === false) return rejectWithStatus("Directory's path is not a valid string.");
          const getFile = (item) => {
            let file = {};
            if (item.hasOwnProperty('_title')) {
              file['name'] = item['_title'];
            } else {
              file['name'] = '';
              return file;
            }
            if (item.hasOwnProperty('fs-cdate')) {
              file['created'] = toDate(item['fs-cdate']);
            } else {
              file['created'] = new Date();
            }
            if (item.hasOwnProperty('fs-mdate')) {
              file['modified'] = toDate(item['fs-mdate']);
            } else {
              file['modified'] = new Date();
            }
            if (item.hasOwnProperty('fs-size')) {
              file['size'] = parseFloat(item['fs-size']);
            } else {
              file['size'] = -1;
            }
            if (item.hasOwnProperty('fs-readonly')) {
              file['isReadOnly'] = item['fs-readonly'].toUpperCase() == 'TRUE';
            } else {
              file['isReadOnly'] = false;
            }
            return file;
          };
          const getDirectory = (item) => {
            let directory = {};
            if (item.hasOwnProperty('_title')) {
              directory['name'] = item['_title'];
            } else {
              directory['name'] = '';
              return directory;
            }
            if (item.hasOwnProperty('fs-cdate')) {
              directory['created'] = toDate(item['fs-cdate']);
            } else {
              directory['created'] = new Date();
            }
            if (item.hasOwnProperty('fs-mdate')) {
              directory['modified'] = toDate(item['fs-mdate']);
            } else {
              directory['modified'] = new Date();
            }
            return directory;
          };
          const getContent = (url, content) => {
            if (url === '') return Promise.resolve(content);
            return o.Network.get(url)
              .then((res) => {
                let obj = parseJSON(res.responseText);
                if (typeof obj === 'undefined') return Promise.reject('Could not parse JSON.');
                if (obj._links.hasOwnProperty('next')) {
                  url = `/fileservice/${encodePath(dirPath)}/${obj._links['next'].href}`;
                } else {
                  url = '';
                }
                for (const item of obj._embedded.resources) {
                  if (item['_type'] === 'fs-file') {
                    let file = getFile(item);
                    content.files.push(file);
                  } else if (item['_type'] === 'fs-dir') {
                    let directory = getDirectory(item);
                    content.directories.push(directory);
                  }
                }
                return getContent(url, content);
              })
              .catch((err) => Promise.reject(err));
          };
          let content = {
            directories: [],
            files: [],
          };
          let url = `/fileservice/${encodePath(dirPath)}`;
          return getContent(url, content)
            .then((res) => {
              dirContents = res;
              isDeleted = false;
              return Promise.resolve();
            })
            .catch((err) => rejectWithStatus('Failed to fetch directory contents.', err));
        };
      }
      function File(path) {
        let filePath = path;
        let contentType = '';
        let contents = null;
        let isDeleted = false;
        this.getContentType = function () {
          return contentType;
        };
        this.getProperties = function () {
          if (isDeleted === true) return rejectWithStatus('File has been deleted.');
          let dir = filePath.substring(0, filePath.lastIndexOf('/'));
          let file = filePath.substring(filePath.lastIndexOf('/') + 1);
          if (isNonEmptyString(dir) === false) return rejectWithStatus('Could not get directory.');
          return RWS.FileSystem.getDirectory(dir)
            .then((x1) => x1.getContents())
            .then((x2) => {
              for (let item of x2.files) {
                if (item.name === file) return Promise.resolve(item);
              }
              return Promise.reject('File not found.');
            })
            .catch((err) => rejectWithStatus(err));
        };
        this.getContents = function () {
          if (isDeleted === true) return rejectWithStatus('File has been deleted.');
          if (contents !== null) return Promise.resolve(contents);
          return this.fetch()
            .then(() => Promise.resolve(contents))
            .catch((err) => rejectWithStatus(err));
        };
        this.setContents = function (newContents = '') {
          if (isDeleted === true) {
            writeDebug('File has been deleted.');
            return false;
          }
          if (newContents === null) {
            writeDebug('Contents can not be null.');
            return false;
          }
          contents = newContents;
          return true;
        };
        this.fileExists = function () {
          let url = `/fileservice/${encodePath(filePath)}`;
          return o.Network.head(url)
            .then(() => {
              isDeleted = false;
              return Promise.resolve(true);
            })
            .catch((err) => {
              if (err.hasOwnProperty('httpStatus') === true && err.httpStatus.code === 404) {
                return Promise.resolve(false);
              }
              return rejectWithStatus('Failed checking file exist.', err);
            });
        };
        this.save = async function (overwrite, isBinary = false) {
          if (isDeleted === true) return rejectWithStatus('File has been deleted.');
          if (isNonEmptyString(filePath) === false) return rejectWithStatus("File's path is not a valid string.");
          if (typeof overwrite !== 'boolean') return rejectWithStatus("Parameter 'overwrite' is not of valid type.");
          if (typeof isBinary !== 'boolean') return rejectWithStatus("Parameter 'isBinary' is not of valid type.");
          let url = `/fileservice/${encodePath(filePath)}`;
          let body = contents;
          if (overwrite === false) {
            let status = await this.fileExists()
              .then((x1) => Promise.resolve(x1))
              .catch((err) => rejectWithStatus(`Save file failed.`, err));
            if (status === true) return rejectWithStatus(`File '${filePath}' already exists.`);
          }
          let contentType = {};
          if (isBinary === true) {
            contentType['Content-Type'] = 'application/octet-stream;v=2.0';
          } else {
            contentType['Content-Type'] = 'text/plain;v=2.0';
          }
          return o.Network.send('PUT', url, contentType, body)
            .then(() => Promise.resolve())
            .catch((err) => rejectWithStatus('Failed saving file.', err));
        };
        this.delete = function () {
          if (isDeleted === true) return rejectWithStatus('File has been deleted.');
          if (isNonEmptyString(filePath) === false) return rejectWithStatus("File's path is not a valid string.");
          let path = `/fileservice/${encodePath(filePath)}`;
          return o.Network.delete(path)
            .then(() => {
              isDeleted = true;
              return Promise.resolve();
            })
            .catch((err) => rejectWithStatus('Failed deleting file.', err));
        };
        this.rename = function (newName) {
          if (isDeleted === true) return rejectWithStatus('File has been deleted.');
          if (isNonEmptyString(newName) === false) return rejectWithStatus("New file's name is not a valid string.");
          if (isNonEmptyString(filePath) === false) return rejectWithStatus("File's path is not a valid string.");
          let path = `/fileservice/${encodePath(filePath)}/rename`;
          let body = `fs-newname=${encodeURIComponent(newName)}`;
          return o.Network.post(path, body)
            .then(() => Promise.resolve())
            .catch((err) => rejectWithStatus('Failed renaming file.', err));
        };
        this.copy = function (copyName, overwrite, isRelativePath = true) {
          if (isDeleted === true) return rejectWithStatus('File has been deleted.');
          if (isNonEmptyString(copyName) === false) return rejectWithStatus("New file's name is not a valid string.");
          if (typeof overwrite !== 'boolean') return rejectWithStatus("Parameter 'overwrite' is not of valid type.");
          if (typeof isRelativePath !== 'boolean')
            return rejectWithStatus("Parameter 'isRelativePath' is not of valid type.");
          if (isNonEmptyString(filePath) === false) return rejectWithStatus("File's path is not a valid string.");
          let path = `/fileservice/${encodePath(filePath)}/copy`;
          let body = '';
          if (isRelativePath === true) {
            body = `fs-newname=${encodeURIComponent(copyName)}&fs-overwrite=${overwrite}`;
          } else {
            let p = `/fileservice/${copyName}`;
            body = `fs-newname=${encodeURIComponent(p)}&fs-overwrite=${overwrite}`;
          }
          return o.Network.post(path, body)
            .then(() => Promise.resolve())
            .catch((err) => rejectWithStatus('Failed copying file.', err));
        };
        this.fetch = function () {
          if (isNonEmptyString(filePath) === false) return rejectWithStatus("File's path is not a valid string.");
          let path = `/fileservice/${encodePath(filePath)}`;
          return o.Network.get(path)
            .then((res) => {
              contentType = res.getResponseHeader('content-type');
              contents = res.responseText;
              isDeleted = false;
              return Promise.resolve();
            })
            .catch((err) => rejectWithStatus('Failed fetching contents.', err));
        };
      }
      this.getDirectory = function (directoryPath) {
        if (isNonEmptyString(directoryPath) === false)
          return rejectWithStatus(`Parameter 'directoryPath' is not a valid string.`);
        let directory = new Directory(directoryPath);
        return directory
          .fetch()
          .then(() => Promise.resolve(directory))
          .catch((err) => Promise.reject(err));
      };
      this.createDirectory = function (directoryPath) {
        if (isNonEmptyString(directoryPath) === false)
          return rejectWithStatus(`Parameter 'directoryPath' is not a valid string.`);
        let replaced = directoryPath.replace('\\', '/');
        let path = replaced.substring(0, replaced.lastIndexOf('/'));
        let newDirectory = replaced.substring(replaced.lastIndexOf('/') + 1);
        let directory = new Directory(path);
        return directory.create(newDirectory);
      };
      this.getFile = function (filePath) {
        if (isNonEmptyString(filePath) === false)
          return rejectWithStatus(`Parameter 'filePath' is not a valid string.`);
        let file = new File(filePath);
        return file
          .fetch()
          .then(() => Promise.resolve(file))
          .catch((err) => Promise.reject(err));
      };
      this.createFileObject = function (filePath) {
        if (isNonEmptyString(filePath) === false)
          return rejectWithStatus(`Parameter 'filePath' is not a valid string.`);
        return new File(filePath);
      };
    })();
    o.Elog = new (function () {
      this.EventType = {
        informational: 'informational',
        warning: 'warning',
        error: 'error',
      };
      this.DomainId = {
        common: 0,
        operational: 1,
        system: 2,
        hardware: 3,
        program: 4,
        motion: 5,
        io: 7,
        user: 8,
        safety: 9,
        internal: 10,
        process: 11,
        configuration: 12,
        rapid: 15,
        connectedServices: 17,
      };
      function Event(number, language = 'en') {
        var sequenceNumber = number;
        var languageId = language;
        var eventType = null;
        var timeStamp = null;
        var code = null;
        var title = null;
        var description = null;
        var consequences = null;
        var causes = null;
        var actions = null;
        var args = [];
        this.getContents = function () {
          if (this.isValid() === true) {
            return Promise.resolve({
              sequenceNumber: sequenceNumber,
              eventType: eventType,
              timeStamp: timeStamp,
              code: code,
              title: title,
              description: description,
              consequences: consequences,
              causes: causes,
              actions: actions,
              arguments: args,
            });
          }
          return fetch()
            .then(() => {
              return Promise.resolve({
                sequenceNumber: sequenceNumber,
                eventType: eventType,
                timeStamp: timeStamp,
                code: code,
                title: title,
                description: description,
                consequences: consequences,
                causes: causes,
                actions: actions,
                arguments: args,
              });
            })
            .catch((err) => Promise.reject(err));
        };
        this.isValid = function () {
          if (typeof sequenceNumber !== 'number' || sequenceNumber < 0) return false;
          if (typeof languageId !== 'string' || languageId === '') return false;
          if (typeof eventType !== 'string' || eventType === null) return false;
          if (timeStamp instanceof Date === false || timeStamp === null) return false;
          if (typeof code !== 'number' || code === null) return false;
          if (typeof title !== 'string' || title === null) return false;
          if (typeof description !== 'string' || description === null) return false;
          if (typeof consequences !== 'string' || consequences === null) return false;
          if (typeof causes !== 'string' || causes === null) return false;
          if (typeof actions !== 'string' || actions === null) return false;
          return true;
        };
        function parseDateTime(text) {
          if (typeof text !== 'string' || text === '') return null;
          try {
            let s = text.replace(/[T]/g, '-');
            s = s.replace(/[ ]/g, '');
            s = s.replace(/[:]/g, '-');
            let splits = s.split('-');
            return new Date(splits[0], splits[1] - 1, splits[2], splits[3], splits[4], splits[5]);
          } catch (error) {
            o.writeDebug('Failed parsing date.');
            return null;
          }
        }
        function fetch() {
          if (typeof sequenceNumber !== 'number' || sequenceNumber < 0)
            return rejectWithStatus('Illegal sequence number.');
          let url = `/rw/elog/seqnum/${encodeURIComponent(sequenceNumber)}?lang=${encodeURIComponent(languageId)}`;
          return o.Network.get(url)
            .then((res) => {
              if (res.status === 204)
                return Promise.reject(`Event with sequence number '${sequenceNumber}' not found.`);
              let obj = parseJSON(res.responseText);
              if (typeof obj === 'undefined') return Promise.reject('Could not parse JSON.');
              for (const item of obj.state) {
                if (item._type === 'elog-message') {
                  switch (item.msgtype) {
                    case '1':
                      eventType = 'informational';
                      break;

                    case '2':
                      eventType = 'warning';
                      break;

                    case '3':
                      eventType = 'error';
                      break;

                    default:
                      eventType = item.msgtype;
                      break;
                  }
                  timeStamp = parseDateTime(item.tstamp);
                  code = parseInt(item.code);
                  title = item.title;
                  description = item.desc;
                  consequences = item.conseqs;
                  causes = item.causes;
                  actions = item.actions;
                  if (item.hasOwnProperty('argv')) {
                    for (const argument of item.argv) {
                      args.push({
                        type: argument.type,
                        value: argument.value,
                      });
                    }
                  }
                  break;
                }
              }
              return Promise.resolve();
            })
            .catch((err) => rejectWithStatus('Failed to get event info.', err));
        }
      }
      function Domain(number) {
        var domainNumber = number;
        var bufferSize = -1;
        this.getDomainNumber = function () {
          return domainNumber;
        };
        this.clearElog = () => {
          if (typeof domainNumber !== 'number' || domainNumber < 0) return rejectWithStatus('Illegal domain number.');
          let body = '';
          let url = `/rw/elog/${encodeURIComponent(domainNumber)}/clear`;
          return o.Network.post(url, body)
            .then(() => Promise.resolve())
            .catch((err) => rejectWithStatus('Failed to clear elog.', err));
        };
        this.getNumberOfEvents = () => {
          if (typeof domainNumber !== 'number' || domainNumber < 0) return rejectWithStatus('Illegal domain number.');
          let url = `/rw/elog/${encodeURIComponent(domainNumber)}?resource=info`;
          return o.Network.get(url)
            .then((res) => {
              let obj = parseJSON(res.responseText);
              if (typeof obj === 'undefined') return Promise.reject('Could not parse JSON.');
              let buffSize = 0;
              let numOfEvents = 0;
              for (const item of obj._embedded.resources) {
                if (item._type === 'elog-domain') {
                  buffSize = item.buffsize;
                  numOfEvents = item.numevts;
                  break;
                }
              }
              bufferSize = parseInt(buffSize);
              numOfEvents = parseInt(numOfEvents);
              return Promise.resolve(numOfEvents);
            })
            .catch((err) => rejectWithStatus('Failed getting number of events.', err));
        };
        this.getBufferSize = function () {
          if (typeof domainNumber !== 'number' || domainNumber < 0) return rejectWithStatus('Illegal domain number.');
          if (bufferSize < 0) {
            return this.getNumberOfEvents()
              .then(() => Promise.resolve(bufferSize))
              .catch((err) => Promise.reject(err));
          }
          return Promise.resolve(bufferSize);
        };
        this.getEvents = (language = 'en') => {
          if (typeof domainNumber !== 'number' || domainNumber < 0) return rejectWithStatus('Illegal domain number.');
          let events = {};
          return this.getEventsPaged(language, 200, 1)
            .then((x) => {
              for (let item in x.events) {
                events[item] = x.events[item];
              }
              if (x.numberOfPages > 1) {
                let calls = [];
                for (let iii = 2; iii <= x.numberOfPages; iii++) {
                  calls.push(this.getEventsPaged(language, 200, iii));
                }
                return Promise.all(calls)
                  .then((res) => {
                    res.sort((a, b) => {
                      return a.page - b.page;
                    });
                    for (let e of res) {
                      for (let item in e.events) {
                        events[item] = e.events[item];
                      }
                    }
                    return Promise.resolve(events);
                  })
                  .catch((err) => Promise.reject(err));
              }
              return Promise.resolve(events);
            })
            .catch((err) => Promise.reject(err));
        };
        this.getEventsPaged = (language = 'en', count = 50, page = 1) => {
          if (typeof domainNumber !== 'number' || domainNumber < 0) return rejectWithStatus('Illegal domain number.');
          if (typeof count !== 'number' || count < 0) count = 50;
          if (count > 200) count = 200;
          if (typeof page !== 'number' || page < 0) return rejectWithStatus('Illegal page number.');
          let url = `/rw/elog/${encodeURIComponent(domainNumber)}?start=${encodeURIComponent(page)}&limit=${encodeURIComponent(count)}`;
          return o.Network.get(url)
            .then((res) => {
              let obj = parseJSON(res.responseText);
              if (typeof obj === 'undefined') return Promise.reject('Could not parse JSON.');
              let numOfPages = page;
              if (obj._links.hasOwnProperty('last') === true) {
                let splits = obj._links.last.href.split('?')[1].split('&');
                for (let s of splits) {
                  if (s.startsWith('start=')) {
                    numOfPages = parseInt(s.replace('start=', ''));
                    break;
                  }
                }
              }
              let events = {};
              for (const item of obj._embedded.resources) {
                if (item._type === 'elog-message-li') {
                  let splits = item._links.self.href.split('/');
                  let seqNum = parseInt(splits[1]);
                  events[seqNum] = new Event(seqNum, language);
                }
              }
              return Promise.resolve({
                page: page,
                numberOfPages: numOfPages,
                requestedCount: count,
                events: events,
              });
            })
            .catch((err) => rejectWithStatus('Failed getting events.', err));
        };
        var callbacks = [];
        this.addCallbackOnChanged = function (callback) {
          if (typeof callback !== 'function') throw new Error('callback is not a valid function');
          callbacks.push(callback);
        };
        this.onchanged = function (newValue) {
          let seqnum = newValue['seqnum'];
          let num = Number.parseInt(seqnum);
          for (let iii = 0; iii < callbacks.length; iii++) {
            try {
              callbacks[iii](num);
            } catch (error) {
              o.writeDebug(`Elog.Domain callback failed. >>> ${error.toString()}`, 3);
            }
          }
        };
        this.getTitle = function () {
          return `/rw/elog/${encodeURIComponent(domainNumber)}`;
        };
        this.getResourceString = function () {
          return `/rw/elog/${encodeURIComponent(domainNumber)}`;
        };
        this.subscribe = function () {
          return o.Subscriptions.subscribe([this]);
        };
        this.unsubscribe = function () {
          return o.Subscriptions.unsubscribe([this]);
        };
      }
      this.clearElogAll = () => {
        return o.Network.post('/rw/elog/clearall')
          .then(() => Promise.resolve())
          .catch((err) => rejectWithStatus('Failed to clear elogs.', err));
      };
      this.clearElog = (domainNumber) => {
        return new Domain(domainNumber).clearElog();
      };
      this.getBufferSize = (domainNumber) => {
        return new Domain(domainNumber).getBufferSize();
      };
      this.getNumberOfEvents = (domainNumber) => {
        return new Domain(domainNumber).getNumberOfEvents();
      };
      this.getEvents = (domainNumber, language = 'en') => {
        return new Domain(domainNumber).getEvents(language);
      };
      this.getEventsPaged = (domainNumber, language = 'en', count = 50, page = 1) => {
        return new Domain(domainNumber).getEventsPaged(language, count, page);
      };
      this.getEvent = (sequenceNumber, language = 'en') => {
        return new Event(sequenceNumber, language);
      };
      this.getDomain = function (domainNumber) {
        return new Domain(domainNumber);
      };
    })();
    o.UAS = new (function () {
      let currentUserInfo = null;
      this.getUser = () => {
        if (currentUserInfo !== null) return Promise.resolve(currentUserInfo);
        return o.Network.get('/users/login-info')
          .then((res) => {
            let obj = parseJSON(res.responseText);
            if (typeof obj === 'undefined') return Promise.reject('Could not parse JSON.');
            let info = {};
            for (const item of obj.state) {
              if (item._type === 'user-login-info') {
                info['alias'] = item['user-alias'];
                info['name'] = item['user-name'];
                info['locale'] = item['user-locale'].toLowerCase();
                info['application'] = item['user-application'];
                info['location'] = item['user-location'];
                break;
              }
            }
            if (Object.keys(info).length !== 5) throw new Error('Could not get complete user info.');
            currentUserInfo = info;
            return Promise.resolve(currentUserInfo);
          })
          .catch((err) => rejectWithStatus('Failed to get user info.', err));
      };
      this.getGrants = () => {
        return o.Network.get('/uas/grants')
          .then((res) => {
            let obj = parseJSON(res.responseText);
            if (typeof obj === 'undefined') return Promise.reject('Could not parse JSON.');
            let grants = {};
            for (const item of obj.state) {
              if (item._type === 'grant-info') {
                let grant = {};
                grant['reference'] = item['grant-name'];
                grant['name'] = item['display-name'];
                grant['description'] = item['grant-description'];
                grants[item['grant-name']] = grant;
              }
            }
            return Promise.resolve(grants);
          })
          .catch((err) => rejectWithStatus('Failed to get grants.', err));
      };
      this.hasGrant = (grant) => {
        if (isNonEmptyString(grant) === false)
          return rejectWithStatus('Failed to verify grant', "Inparameter 'grant' is not a valid string.");
        return o.Network.get(`/users/grant-exists?grant=${encodeURIComponent(grant)}`)
          .then((res) => {
            let obj = parseJSON(res.responseText);
            if (typeof obj === 'undefined') return Promise.reject('Could not parse JSON.');
            let status = false;
            for (const item of obj.state) {
              if (item._type === 'user-grant-status') {
                status = item['status'].toLowerCase() === 'true';
                break;
              }
            }
            return Promise.resolve(status);
          })
          .catch((err) => {
            if (err.hasOwnProperty('httpStatus') && err.httpStatus.code === 400) {
              if (err.hasOwnProperty('controllerStatus') && err.controllerStatus.name === 'SYS_CTRL_E_INVALID_GRANT') {
                return Promise.resolve(false);
              }
            }
            return rejectWithStatus('Failed to verify grant.', err);
          });
      };
      this.hasRole = (role) => {
        if (isNonEmptyString(role) === false)
          return rejectWithStatus('Failed to verify role', "Inparameter 'role' is not a valid string.");
        return this.getUser()
          .then(() => o.Network.get(`/uas/users/${encodeURIComponent(currentUserInfo.name)}/roles`))
          .then((res) => {
            let obj = parseJSON(res.responseText);
            if (typeof obj === 'undefined') return Promise.reject('Could not parse JSON.');
            for (const item of obj.state) {
              if (item._type === 'user-role') {
                if (item['rolename'].toLowerCase() === role.toLowerCase()) return Promise.resolve(true);
              }
            }
            return Promise.resolve(false);
          })
          .catch((err) => rejectWithStatus('Failed to verify role.', err));
      };
    })();
    o.Subscriptions = new (function () {
      var websocket = null;
      var websocketLocation = null;
      var subscriptionGroup = null;
      var currentSubscriptions = {};
      var timeoutID = null;
      const SOCKET_CLOSE_INTERVAL = 500;
      const SOCKET_CLOSE_RETRY_COUNT = 20;
      const wait = (time) => new Promise((resolve) => setTimeout(resolve, time));
      const waitSocketRemoved = async (loops) => {
        if (loops <= 0) return Promise.reject('WebSocket closing timeout.');
        if (websocket === null) return Promise.resolve();
        if (
          websocket !== null &&
          (websocket.readyState === WebSocket.CLOSED || websocket.readyState === WebSocket.CLOSING)
        ) {
          await wait(SOCKET_CLOSE_INTERVAL).then(() => waitSocketRemoved(loops - 1));
        }
      };
      this.connectWebsocket = () => {
        return new Promise((resolve, reject) => {
          if (websocketLocation == null || subscriptionGroup == null) {
            reject('No websocket location');
            return;
          }
          websocket = new WebSocket(websocketLocation, 'rws_subscription');
          websocket.onopen = function (evt) {
            o.writeDebug('WebSocket connected');
            clearTimeout(timeoutID);
            timeoutID = null;
            resolve('Created Websocket!');
          };
          websocket.onmessage = function (evt) {
            let parser = new DOMParser();
            let data = parser.parseFromString(evt.data, 'text/xml');
            let listitems = data.getElementsByTagName('li');
            if (listitems.length <= 0) return;
            for (let iii = 0; iii < listitems.length; iii++) {
              let event = listitems[iii];
              let itemClass = event.getAttribute('class');
              if (itemClass === null) continue;
              let subResource = '';
              if (itemClass === 'rap-ui-ev') {
                subResource = '/rw/rapid/uiinstr;uievent';
              } else {
                subResource = event.getElementsByTagName('a')[0].getAttribute('href');
              }
              let newValue = {};
              let items = event.getElementsByTagName('span');
              for (let iii = 0; iii < items.length; iii++) {
                let className = items[iii].getAttribute('class');
                newValue[className] = items[iii].innerHTML;
              }
              if (subResource.startsWith('/rw/rapid/symbol/RAPID/')) {
                subResource += ';value';
              }
              if (subResource.startsWith('/rw/elog/')) {
                subResource = subResource.substring(0, subResource.lastIndexOf('/'));
              }
              if (currentSubscriptions.hasOwnProperty(subResource)) {
                for (let iii = 0; iii < currentSubscriptions[subResource].length; iii++) {
                  if (currentSubscriptions[subResource][iii].onchanged !== undefined)
                    currentSubscriptions[subResource][iii].onchanged(newValue);
                }
              }
            }
          };
          websocket.onclose = function (evt) {
            o.writeDebug('WebSocket closing ' + subscriptionGroup);
            if (Object.keys(currentSubscriptions).length != 0) {
              -o.writeDebug('Subscriptions found on close!');
              o.Subscriptions.unsubscribeToAll();
            }
            websocket = null;
            websocketLocation = null;
            subscriptionGroup = null;
            currentSubscriptions = {};
            clearTimeout(timeoutID);
            timeoutID = null;
          };
          websocket.onerror = function (evt) {
            o.writeDebug('WebSocket reports Error');
          };
          timeoutID = setTimeout(() => {
            if (websocket !== null && websocket.readyState !== WebSocket.OPEN) {
              websocket = null;
              websocketLocation = null;
              subscriptionGroup = null;
              currentSubscriptions = {};
              timeoutID = null;
              reject('Error: Trying to connect websocket!');
            }
          }, 15e3);
        });
      };
      const processSubscribe = async (newSubscriptions) => {
        if (cleanupStarted) {
          return rejectWithStatus('Subscription refused, app cleanup started.');
        }
        let priority = '1';
        if (
          websocket !== null &&
          (websocket.readyState === WebSocket.CLOSED || websocket.readyState === WebSocket.CLOSING)
        ) {
          await waitSocketRemoved(SOCKET_CLOSE_RETRY_COUNT).catch((err) => reject(err));
        }
        if (
          websocket !== null &&
          (websocket.readyState === WebSocket.CONNECTING || websocket.readyState === WebSocket.OPEN)
        ) {
          let body = '';
          for (let iii = 0; iii < newSubscriptions.length; iii++) {
            if (
              newSubscriptions[iii].getResourceString === undefined ||
              newSubscriptions[iii].getResourceString() === ''
            ) {
              let title =
                newSubscriptions[iii].getTitle() !== undefined ? newSubscriptions[iii].getTitle() : '<Unknown>';
              o.writeDebug(`Subscribe on '${title}' rejected as subscription resource string not set.`, 2);
              continue;
            }
            let subscription = newSubscriptions[iii];
            let resource = subscription.getResourceString();
            if (currentSubscriptions[resource] !== undefined && currentSubscriptions[resource].length !== 0) {
              currentSubscriptions[resource].push(subscription);
            } else {
              currentSubscriptions[resource] = [subscription];
              if (iii != 0) body += '&';
              let idx = (iii + 1).toString();
              body += `resources=${idx}&${idx}=${encodeURIComponent(resource)}&${idx}-p=${priority}`;
            }
          }
          if (body === '') {
            return Promise.resolve('OK');
          }
          let url = '/subscription/' + encodeURIComponent(subscriptionGroup);
          o.writeDebug(`Subscribe on '${url}', ${body}`, 0);
          return o.Network.put(url, body)
            .then(() => Promise.resolve())
            .catch((err) => rejectWithStatus('Failed to add subscription(s).', err));
        } else {
          currentSubscriptions = {};
          websocketLocation = null;
          websocket = null;
          let body = '';
          for (let iii = 0; iii < newSubscriptions.length; iii++) {
            if (
              newSubscriptions[iii].getResourceString === undefined ||
              newSubscriptions[iii].getResourceString() === ''
            ) {
              let title =
                newSubscriptions[iii].getTitle() !== undefined ? newSubscriptions[iii].getTitle() : '<Unknown>';
              o.writeDebug(`Subscription on '${title}' rejected as subscription resource string not set.`, 2);
              continue;
            }
            let subscription = newSubscriptions[iii];
            let resource = subscription.getResourceString();
            if (currentSubscriptions[resource] !== undefined && currentSubscriptions[resource].length !== 0) {
              currentSubscriptions[resource].push(subscription);
            } else {
              currentSubscriptions[resource] = [subscription];
              if (iii != 0) body += '&';
              let idx = (iii + 1).toString();
              body += `resources=${idx}&${idx}=${encodeURIComponent(resource)}&${idx}-p=${priority}`;
            }
          }
          let unblockCleanupProcess;
          creatingSubscriptionGroupAndWebSocket = new Promise((resolver) => {
            unblockCleanupProcess = () => {
              creatingSubscriptionGroupAndWebSocket = null;
              resolver();
            };
          });
          o.writeDebug(`Subscribe on '/subscription', ${body}`, 0);
          return o.Network.post('/subscription', body)
            .then((res) => {
              websocketLocation = res.getResponseHeader('location');
              subscriptionGroup = websocketLocation.substring(websocketLocation.indexOf('poll/') + 5);
              return this.connectWebsocket()
                .then(() => {
                  return Promise.resolve('Subscribed');
                })
                .catch((err) => {
                  return Promise.reject(err);
                })
                .finally(() => {
                  unblockCleanupProcess();
                });
            })
            .catch((err) => {
              unblockCleanupProcess();
              return rejectWithStatus('Failed to add subscription(s).', err);
            });
        }
      };
      const processUnsubscribe = (removedSubscription) => {
        if (websocket !== null && websocket.readyState !== WebSocket.OPEN) {
          return rejectWithStatus('WebSocket not open.');
        }
        if (removedSubscription.getResourceString === undefined || removedSubscription.getResourceString() === '') {
          let title = removedSubscription.getTitle() !== undefined ? removedSubscription.getTitle() : '<Unknown>';
          return rejectWithStatus(`Unsubscribe on '${title}' rejected as subscription resource not set.`, 2);
        }
        let resource = removedSubscription.getResourceString();
        let array = currentSubscriptions[resource];
        if (array === undefined) {
          return rejectWithStatus(
            'Cannot unsubscribe from ' +
              removedSubscription.getTitle() +
              ' because there are no subscriptions to that signal!',
          );
        }
        var index = array.indexOf(removedSubscription);
        if (index > -1) {
          array.splice(index, 1);
        } else {
          return rejectWithStatus(
            'Cannot unsubscribe from ' +
              removedSubscription.getTitle() +
              ' because there are no subscriptions to that signal data object!',
          );
        }
        if (currentSubscriptions[resource].length == 0) {
          delete currentSubscriptions[resource];
          let url = `/subscription/${encodeURIComponent(subscriptionGroup)}/${resource}`;
          o.writeDebug(`Unsubscribe on '${url}'`, 0);
          return o.Network.delete(url)
            .then(() => {
              if (Object.keys(currentSubscriptions) <= 0) {
                if (websocket !== null) {
                  websocket.close();
                }
              }
              return Promise.resolve();
            })
            .catch((err) => rejectWithStatus('Failed to unsubscribe to subscription(s).', err));
        }
        return Promise.resolve();
      };
      var opQueue = [];
      var opBusy = false;
      function processOperation() {
        if (!opBusy && opQueue.length > 0) {
          opBusy = true;
          let item = opQueue.pop();
          if (RWS.isDebugActive(0)) {
            let op = item.operation1 === processUnsubscribe ? 'Unsubscribe' : 'Subscribe';
            let d = '';
            if (item.operation1 === processUnsubscribe) {
              d = item.indata.getResourceString();
            } else {
              for (let iii = 0; iii < item.indata.length; iii++) {
                d += item.indata[iii].getResourceString();
                if (iii < item.indata.length - 1) d += ',';
              }
            }
            o.writeDebug(`Add ${op}, '${d}'`, 0);
          }
          item
            .operation1(item.indata)
            .then(() => {
              if (typeof item.operation2 !== 'undefined' && item.operation2 !== null) {
                return item.operation2();
              }
              return Promise.resolve();
            })
            .then(() => {
              if (typeof item.resolve !== 'undefined') {
                item.resolve();
              }
              opBusy = false;
              setTimeout(() => {
                processOperation();
              }, 0);
            })
            .catch((err) => {
              o.writeDebug(`processOperation failed to run operation. >>> ${err.message}`);
              if (typeof item.reject !== 'undefined') {
                item.reject(err);
              }
              opBusy = false;
              setTimeout(() => {
                processOperation();
              }, 0);
            });
        }
      }
      this.subscribe = (newSubscriptions, initialEvent = null) => {
        if (cleanupStarted) {
          return rejectWithStatus('Subscription refused, app cleanup started.');
        } else {
          return new Promise((resolve, reject) => {
            opQueue.unshift({
              resolve: resolve,
              reject: reject,
              operation1: processSubscribe,
              operation2: initialEvent,
              indata: newSubscriptions,
            });
            setTimeout(() => {
              processOperation();
            }, 0);
          });
        }
      };
      this.unsubscribe = (removedSubscriptions) => {
        return new Promise((resolve, reject) => {
          for (let iii = 0; iii < removedSubscriptions.length; iii++) {
            opQueue.unshift({
              resolve: resolve,
              reject: reject,
              operation1: processUnsubscribe,
              indata: removedSubscriptions[iii],
            });
          }
          setTimeout(() => {
            processOperation();
          }, 0);
        });
      };
      this.unsubscribeToAll = () => {
        if (websocket !== null && websocket.readyState !== WebSocket.OPEN) {
          return Promise.resolve();
        }
        if (subscriptionGroup != null) {
          let subscriptionGroup_temp = subscriptionGroup;
          websocket = null;
          websocketLocation = null;
          subscriptionGroup = null;
          currentSubscriptions = {};
          if (isWebView()) {
            if (o.__unload === true) {
              postWebViewMessage('DeleteSubscriptionGroup ' + subscriptionGroup_temp);
              return Promise.resolve();
            } else {
              return o.Network.delete('/subscription/' + encodeURIComponent(subscriptionGroup_temp))
                .then(() => {
                  Promise.resolve();
                })
                .catch((err) => {
                  rejectWithStatus('Failed to unsubscribe to all.', err);
                });
            }
          } else {
            if (navigator.userAgent.toLowerCase().indexOf('firefox') < 0) {
              return fetch('/subscription/' + encodeURIComponent(subscriptionGroup_temp), {
                method: 'DELETE',
                keepalive: true,
                headers: {
                  Accept: 'application/hal+json;v=2.0;',
                },
              })
                .then(() => {
                  Promise.resolve();
                })
                .catch((err) => {
                  `Failed to unsubscribe to all : ${JSON.stringify(err)}`;
                });
            } else {
              return o.Network.delete('/subscription/' + encodeURIComponent(subscriptionGroup_temp))
                .then(() => {
                  Promise.resolve();
                })
                .catch((err) => {
                  rejectWithStatus('Failed to unsubscribe to all.', err);
                });
            }
          }
        } else {
          return Promise.resolve();
        }
      };
    })();
    o.Mastership = new (function () {
      var mastershipCounter = 0;
      var opBusy = false;
      var onRequestedListeners = [];
      var onReleasedListeners = [];
      this.request = () => {
        if (cleanupStarted) {
          return rejectWithStatus('Mastership request refused, app cleanup started.');
        } else {
          try {
            o.writeDebug('Requesting mastership..');
            let listener = {
              promise: null,
              resolve: null,
              reject: null,
            };
            listener.promise = new Promise((resolve, reject) => {
              listener.resolve = resolve;
              listener.reject = reject;
            });
            onRequestedListeners.push(listener);
            if (isWebView()) {
              postWebViewMessage('RequestMastership');
            } else {
              setTimeout(() => {
                processMastership();
              }, 0);
            }
            return listener.promise;
          } catch (error) {
            return rejectWithStatus('Failed to get mastership.', error);
          }
        }
      };
      this.release = () => {
        try {
          o.writeDebug('Releasing mastership..');
          let listener = {
            promise: null,
            resolve: null,
            reject: null,
          };
          listener.promise = new Promise((resolve, reject) => {
            listener.resolve = resolve;
            listener.reject = reject;
          });
          onReleasedListeners.push(listener);
          if (isWebView()) {
            postWebViewMessage('ReleaseMastership');
          } else {
            setTimeout(() => {
              processMastership();
            }, 0);
          }
          return listener.promise;
        } catch (error) {
          return rejectWithStatus('Failed to release mastership.', error);
        }
      };
      this.onRequested = async (data) => {
        let length = onRequestedListeners.length;
        try {
          if (JSON.parse(data).success === true) {
            for (let iii = 0; iii < length; iii++) {
              mastershipCounter++;
              onRequestedListeners.shift().resolve('Mastership acquired!');
            }
          } else {
            for (let iii = 0; iii < length; iii++) {
              onRequestedListeners.shift().reject('Could not acquire Mastership!');
            }
            o.writeDebug('Could not acquire Mastership!', 3);
          }
        } catch (exception) {
          for (let iii = 0; iii < length; iii++) {
            onRequestedListeners.shift().reject(exception.message);
          }
          o.writeDebug('Exception: ' + exception.message, 3);
        }
      };
      this.onReleased = async (data) => {
        let length = onReleasedListeners.length;
        try {
          if (JSON.parse(data).success === true) {
            for (let iii = 0; iii < length; iii++) {
              mastershipCounter = mastershipCounter <= 1 ? 0 : mastershipCounter - 1;
              onReleasedListeners.shift().resolve('Mastership released!');
            }
          } else {
            for (let iii = 0; iii < length; iii++) {
              onReleasedListeners.shift().reject('Could not release Mastership!');
            }
            o.writeDebug('Could not release Mastership!', 3);
          }
        } catch (exception) {
          for (let iii = 0; iii < length; iii++) {
            onReleasedListeners.shift().reject(exception.message);
          }
          o.writeDebug('Exception: ' + exception.message, 3);
        }
      };
      async function processMastership() {
        try {
          if (opBusy === false && onRequestedListeners.length > 0) {
            opBusy = true;
            let item = onRequestedListeners.pop();
            if (cleanupStarted) {
              item.reject(createStatusObject('Mastership request refused, app cleanup started.'));
              return;
            }
            if (++mastershipCounter > 1) {
              item.resolve();
            } else {
              await o.Network.send('POST', '/rw/mastership/edit/request', {
                'Content-Type': 'application/x-www-form-urlencoded;v=2.0',
              })
                .then(() => item.resolve())
                .catch((err) => {
                  mastershipCounter = mastershipCounter <= 1 ? 0 : mastershipCounter - 1;
                  o.writeDebug('Could not acquire Mastership. >>> ' + err.message);
                  item.reject(createStatusObject('Could not acquire Mastership.', err));
                });
            }
            opBusy = false;
            setTimeout(() => processMastership(), 0);
          } else if (opBusy === false && onReleasedListeners.length > 0) {
            opBusy = true;
            let item = onReleasedListeners.pop();
            if (mastershipCounter < 1) {
              o.writeDebug('Releasing mastership, though counter is 0.', 1);
            }
            mastershipCounter = mastershipCounter <= 1 ? 0 : mastershipCounter - 1;
            if (mastershipCounter > 0) {
              item.resolve();
            } else {
              await o.Network.send('POST', '/rw/mastership/edit/release', {
                'Content-Type': 'application/x-www-form-urlencoded;v=2.0',
              })
                .then(() => item.resolve())
                .catch((err) => {
                  o.writeDebug('Could not release Mastership. >>> ' + err.message);
                  item.reject(createStatusObject('Could not release Mastership.', err));
                });
            }
            opBusy = false;
            setTimeout(() => processMastership(), 0);
          }
        } catch (error) {
          o.writeDebug(`Failed to process mastership operation. >>> ${error}`, 2);
          opBusy = false;
          setTimeout(() => processMastership(), 0);
        }
      }
      this.releaseAll = () => {
        try {
          let count = mastershipCounter;
          if (isWebView()) {
            for (let iii = 0; iii < count; iii++) {
              postWebViewMessage('ReleaseMastership');
            }
          } else {
            mastershipCounter = 0;
            if (navigator.userAgent.toLowerCase().indexOf('firefox') >= 0) {
              o.Network.post('/rw/mastership/edit/release');
            } else {
              return fetch('/rw/mastership/edit/release', {
                method: 'POST',
                keepalive: true,
                headers: {
                  Accept: 'application/hal+json;v=2.0;',
                  'Content-Type': 'application/x-www-form-urlencoded;v=2.0',
                },
              })
                .then(() => {
                  Promise.resolve();
                })
                .catch((err) => {
                  `Failed to release all mastership: ${JSON.stringify(err)}`;
                });
            }
          }
          return Promise.resolve();
        } catch (error) {
          return rejectWithStatus('Failed to release all mastership requests.', error);
        }
      };
    })();
    o.MotionMastership = new (function () {
      var motionMastershipCounter = 0;
      var opBusy = false;
      var onRequestedListeners = [];
      var onReleasedListeners = [];
      this.request = () => {
        if (cleanupStarted) {
          return rejectWithStatus('Motion mastership request refused, app cleanup started.');
        } else {
          try {
            o.writeDebug('Requesting motion mastership..');
            let listener = {
              promise: null,
              resolve: null,
              reject: null,
            };
            listener.promise = new Promise((resolve, reject) => {
              listener.resolve = resolve;
              listener.reject = reject;
            });
            onRequestedListeners.push(listener);
            if (isWebView()) {
              postWebViewMessage('RequestMotionMastership');
            } else {
              setTimeout(() => {
                processMotionMastership();
              }, 0);
            }
            return listener.promise;
          } catch (error) {
            return rejectWithStatus('Failed to get motion mastership.', error);
          }
        }
      };
      this.release = () => {
        try {
          o.writeDebug('Releasing motion mastership..');
          let listener = {
            promise: null,
            resolve: null,
            reject: null,
          };
          listener.promise = new Promise((resolve, reject) => {
            listener.resolve = resolve;
            listener.reject = reject;
          });
          onReleasedListeners.push(listener);
          if (isWebView()) {
            postWebViewMessage('ReleaseMotionMastership');
          } else {
            setTimeout(() => {
              processMotionMastership();
            }, 0);
          }
          return listener.promise;
        } catch (error) {
          return rejectWithStatus('Failed to release motion mastership.', error);
        }
      };
      this.onRequested = async (data) => {
        let length = onRequestedListeners.length;
        try {
          if (JSON.parse(data).success === true) {
            for (let iii = 0; iii < length; iii++) {
              motionMastershipCounter++;
              onRequestedListeners.shift().resolve('Motion mastership acquired!');
            }
          } else {
            for (let iii = 0; iii < length; iii++) {
              onRequestedListeners.shift().reject('Could not acquire motion mastership!');
            }
            o.writeDebug('Could not acquire motion mastership!', 3);
          }
        } catch (exception) {
          for (let iii = 0; iii < length; iii++) {
            onRequestedListeners.shift().reject(exception.message);
          }
          o.writeDebug('Exception: ' + exception.message, 3);
        }
      };
      this.onReleased = async (data) => {
        let length = onReleasedListeners.length;
        try {
          if (JSON.parse(data).success === true) {
            for (let iii = 0; iii < length; iii++) {
              motionMastershipCounter = motionMastershipCounter <= 1 ? 0 : motionMastershipCounter - 1;
              onReleasedListeners.shift().resolve('Motion mastership released!');
            }
          } else {
            for (let iii = 0; iii < length; iii++) {
              onReleasedListeners.shift().reject('Could not release motion mastership!');
            }
            o.writeDebug('Could not release motion mastership!', 3);
          }
        } catch (exception) {
          for (let iii = 0; iii < length; iii++) {
            onReleasedListeners.shift().reject(exception.message);
          }
          o.writeDebug('Exception: ' + exception.message, 3);
        }
      };
      async function processMotionMastership() {
        try {
          if (opBusy === false && onRequestedListeners.length > 0) {
            opBusy = true;
            let item = onRequestedListeners.pop();
            if (cleanupStarted) {
              item.reject(createStatusObject('Motion mastership request refused, app cleanup started.'));
              return;
            }
            if (++motionMastershipCounter > 1) {
              item.resolve();
            } else {
              await o.Network.send('POST', '/rw/mastership/motion/request', {
                'Content-Type': 'application/x-www-form-urlencoded;v=2.0',
              })
                .then(() => item.resolve())
                .catch((err) => {
                  motionMastershipCounter = motionMastershipCounter <= 1 ? 0 : motionMastershipCounter - 1;
                  o.writeDebug('Could not acquire motion mastership. >>> ' + err.message);
                  item.reject(createStatusObject('Could not acquire motion mastership.', err));
                });
            }
            opBusy = false;
            setTimeout(() => processMotionMastership(), 0);
          } else if (opBusy === false && onReleasedListeners.length > 0) {
            opBusy = true;
            let item = onReleasedListeners.pop();
            if (motionMastershipCounter < 1) {
              o.writeDebug('Releasing motion mastership, though counter is 0.', 1);
            }
            motionMastershipCounter = motionMastershipCounter <= 1 ? 0 : motionMastershipCounter - 1;
            if (motionMastershipCounter > 0) {
              item.resolve();
            } else {
              await o.Network.send('POST', '/rw/mastership/motion/release', {
                'Content-Type': 'application/x-www-form-urlencoded;v=2.0',
              })
                .then(() => item.resolve())
                .catch((err) => {
                  o.writeDebug('Could not release motion mastership. >>> ' + err.message);
                  item.reject(createStatusObject('Could not release motion mastership.', err));
                });
            }
            opBusy = false;
            setTimeout(() => processMotionMastership(), 0);
          }
        } catch (error) {
          o.writeDebug(`Failed to process motion mastership operation. >>> ${error}`, 2);
          opBusy = false;
          setTimeout(() => processMotionMastership(), 0);
        }
      }
      this.releaseAll = () => {
        try {
          let count = motionMastershipCounter;
          if (isWebView()) {
            for (let iii = 0; iii < count; iii++) {
              postWebViewMessage('ReleaseMotionMastership');
            }
          } else {
            motionMastershipCounter = 0;
            if (navigator.userAgent.toLowerCase().indexOf('firefox') >= 0) {
              o.Network.post('/rw/mastership/motion/release');
            } else {
              return fetch('/rw/mastership/motion/release', {
                method: 'POST',
                keepalive: true,
                headers: {
                  Accept: 'application/hal+json;v=2.0;',
                  'Content-Type': 'application/x-www-form-urlencoded;v=2.0',
                },
              })
                .then(() => {
                  Promise.resolve();
                })
                .catch((err) => {
                  `Failed to release all motion mastership: ${JSON.stringify(err)}`;
                });
            }
          }
          return Promise.resolve();
        } catch (error) {
          return rejectWithStatus('Failed to release all motion mastership requests.', error);
        }
      };
    })();
    o.Network = new (function () {
      this.setCookies = (data) => {
        let cookies = JSON.parse(data).cookies;
        let index = 0;
        while ((index = cookies.indexOf(';')) != -1) {
          let cookie = cookies.substr(0, index);
          document.cookie = cookie;
          if (cookies.length < index + 3) break;
          cookies = cookies.substr(index + 2);
        }
        return 'Cookies updated!';
      };
      this.heartBeat = () => {
        this.get('/').then(
          (msg) => {},
          (error) => o.writeDebug(`Heartbeat Failed.  >>>  ${error.httpStatus.code} ${error.httpStatus.text}`, 3),
        );
        setTimeout(this.heartBeat, 3e4);
      };
      this.send = (method, path, requestHeaders = {}, body = null) => {
        return new Promise((resolve, reject) => {
          let req = new XMLHttpRequest();
          if (o.__unload !== true) {
            req.timeout = HTTP_REQUEST_TIMEOUT;
          }
          req.ontimeout = () => {
            o.writeDebug('Request timed out.', 2);
            reject('RWS request timed out.');
          };
          req.onerror = () => {
            o.writeDebug(`Send error. ${method + ' ' + path}`, 2);
            reject('Send error.');
          };
          req.onreadystatechange = () => {
            if (req.readyState === 4) {
              if (req.status === 0) return;
              if (Math.floor(req.status / 100) !== 2) {
                let r = {
                  message: '',
                  httpStatus: {
                    code: req.status,
                    text: req.statusText,
                  },
                };
                if (req.responseText !== null && req.responseText !== '') {
                  return verfifyErrorCode(req.responseText)
                    .then((x) => {
                      let call = body === null ? path : `${path} ${body}`;
                      if (x.severity.toLowerCase() === 'error') {
                        o.writeDebug(`RWS call '${call}', ${x.severity}: ${x.name}, '${x.description}'`, 1);
                      }
                      r.controllerStatus = x;
                      return reject(r);
                    })
                    .catch(() => reject(r));
                }
                return reject(r);
              } else {
                if (path === '/') {
                  resolve(req);
                  return;
                }
                if (req.responseText === null || req.responseText === '') return resolve(req);
                if (req.getResponseHeader('Content-Type') !== 'application/hal+json;v=2.0') return resolve(req);
                let json = parseJSON(req.responseText);
                if (json === undefined) return resolve(req);
                return verifyReturnCode(json)
                  .then(() => resolve(req))
                  .catch((errors) => {
                    let s = body === null ? path : `${path} ${body}`;
                    for (let item in errors) {
                      if (errors[item].severity.toLowerCase() === 'error') {
                        o.writeDebug(
                          `RWS call '${s}', ${errors[item].severity}: '${item}' - ${errors[item].name}, '${errors[item].description}'`,
                          1,
                        );
                      }
                    }
                    resolve(req);
                    return;
                  });
              }
            }
          };
          try {
            req.open(method, path, o.__unload === true ? false : true);
            for (var key in requestHeaders) {
              var value = requestHeaders[key];
              req.setRequestHeader(key, value);
            }
            if (body !== null) req.send(body);
            else req.send();
          } catch (exception) {
            reject('Error during communication with RWS! Exception: ' + exception.message);
            return;
          }
        }).catch((err) => Promise.reject(err));
      };
      this.get = (path, additionalRequestHeaders = {}) => {
        return this.send(
          'GET',
          path,
          Object.assign(
            {
              Accept: 'application/hal+json;v=2.0',
            },
            additionalRequestHeaders,
          ),
        );
      };
      this.post = (path, body, additionalRequestHeaders = {}) => {
        return this.send(
          'POST',
          path,
          Object.assign(
            {
              'Content-Type': 'application/x-www-form-urlencoded;v=2.0',
              Accept: 'application/hal+json;v=2.0',
            },
            additionalRequestHeaders,
          ),
          body,
        );
      };
      this.put = (path, body, additionalRequestHeaders = {}) => {
        return this.send(
          'PUT',
          path,
          Object.assign(
            {
              'Content-Type': 'application/x-www-form-urlencoded;v=2.0',
            },
            additionalRequestHeaders,
          ),
          body,
        );
      };
      this.delete = (path, additionalRequestHeaders = {}) => {
        return this.send(
          'DELETE',
          path,
          Object.assign(
            {
              Accept: 'application/hal+json;v=2.0',
            },
            additionalRequestHeaders,
          ),
        );
      };
      this.options = (path, additionalRequestHeaders = {}) => {
        return this.send(
          'OPTIONS',
          path,
          Object.assign(
            {
              Accept: 'application/xhtml+xml;v=2.0',
            },
            additionalRequestHeaders,
          ),
        );
      };
      this.head = (path, additionalRequestHeaders = {}) => {
        return this.send(
          'HEAD',
          path,
          Object.assign(
            {
              Accept: 'application/xhtml+xml;v=2.0',
            },
            additionalRequestHeaders,
          ),
        );
      };
    })();
    o.constructedMain = true;
  })(RWS);
  window['_onMastershipRequested'] = RWS.Mastership.onRequested;
  window['_onMastershipReleased'] = RWS.Mastership.onReleased;
  window['_onMotionMastershipRequested'] = RWS.MotionMastership.onRequested;
  window['_onMotionMastershipReleased'] = RWS.MotionMastership.onReleased;
  window['_setCookies'] = RWS.Network.setCookies;
}

if (typeof RWS.constructedRapidData === 'undefined') {
  (function (rd) {
    rd.RAPIDDATA_LIB_VERSION = '1.5.0';
    let monitor = null;
    rd.initCache = () => {
      rd.resetSymbolTypeCache();
      monitor = new Monitor();
    };
    // window.addEventListener('load', rd.initCache, false);
    function Monitor() {
      let taskChangeMonitors = [];
      let excStateMonitors = [];
      let blockClear = false;
      let tasks = [];
      (async function () {
        tasks = await RWS.Rapid.getTasks();
        for (let iii = 0; iii < tasks.length; iii++) {
          let props = await tasks[iii].getProperties();
          if (props.type !== 'normal') continue;
          let name = tasks[iii].getName();
          let taskChange = new TaskChangeMonitor(name);
          let excState = new ExcStateMonitor(name);
          taskChangeMonitors.push(taskChange);
          excStateMonitors.push(excState);
        }
      })();
      function TaskChangeMonitor(task) {
        let resourceString = `/rw/rapid/tasks/${encodeURIComponent(task)};taskchange`;
        let resourceUrl = `/rw/rapid/tasks/${encodeURIComponent(task)}`;
        this.getTitle = function () {
          return resourceUrl;
        };
        this.getResourceString = function () {
          return resourceString;
        };
        this.onchanged = function (newValue) {
          if (blockClear === true) {
            blockClear = false;
            return;
          }
          if (newValue.hasOwnProperty('task-name') && newValue['task-name'] === task) {
            RWS.removeSymbolTypes(task);
          }
        };
        RWS.Subscriptions.subscribe([this]).catch(() =>
          RWS.writeDebug(`Failed to subscribe to task changes for '${task}'.`, 2),
        );
      }
      function ExcStateMonitor(task) {
        let resourceString = `/rw/rapid/tasks/${encodeURIComponent(task)};excstate`;
        let resourceUrl = `/rw/rapid/tasks/${encodeURIComponent(task)}`;
        this.getTitle = function () {
          return resourceUrl;
        };
        this.getResourceString = function () {
          return resourceString;
        };
        this.onchanged = function (newValue) {
          if (newValue.hasOwnProperty('task-name') && newValue['task-name'] === task) {
            let state = newValue.hasOwnProperty('pgmtaskexec-state') ? newValue['pgmtaskexec-state'] : '';
            if (state === 'started') blockClear = true;
          }
        };
        RWS.Subscriptions.subscribe([this]).catch(() =>
          RWS.writeDebug('Failed to subscribe to execution state changes.', 2),
        );
      }
    }
    function getEmptyDataType() {
      return {
        type: '',
        url: '',
        isAtomic: false,
        isArray: false,
        dimensions: [],
        isAlias: false,
        aliasTypeUrl: '',
        isRecord: false,
        numberOfComponents: 0,
        components: [],
      };
    }
    let symbolTypeCache = {};
    rd.resetSymbolTypeCache = function () {
      symbolTypeCache = {};
      symbolTypeCache['RAPID/num'] = getEmptyDataType();
      symbolTypeCache['RAPID/num']['type'] = 'num';
      symbolTypeCache['RAPID/num']['url'] = 'RAPID/num';
      symbolTypeCache['RAPID/num']['isAtomic'] = true;
      symbolTypeCache['RAPID/dnum'] = getEmptyDataType();
      symbolTypeCache['RAPID/dnum']['type'] = 'dnum';
      symbolTypeCache['RAPID/dnum']['url'] = 'RAPID/dnum';
      symbolTypeCache['RAPID/dnum']['isAtomic'] = true;
      symbolTypeCache['RAPID/string'] = getEmptyDataType();
      symbolTypeCache['RAPID/string']['type'] = 'string';
      symbolTypeCache['RAPID/string']['url'] = 'RAPID/string';
      symbolTypeCache['RAPID/string']['isAtomic'] = true;
      symbolTypeCache['RAPID/bool'] = getEmptyDataType();
      symbolTypeCache['RAPID/bool']['type'] = 'bool';
      symbolTypeCache['RAPID/bool']['url'] = 'RAPID/bool';
      symbolTypeCache['RAPID/bool']['isAtomic'] = true;
      symbolTypeCache['RAPID/btnres'] = getEmptyDataType();
      symbolTypeCache['RAPID/btnres']['type'] = 'btnres';
      symbolTypeCache['RAPID/btnres']['url'] = 'RAPID/btnres';
      symbolTypeCache['RAPID/btnres']['isAlias'] = true;
      symbolTypeCache['RAPID/btnres']['aliasTypeUrl'] = 'RAPID/num';
      symbolTypeCache['RAPID/robjoint'] = getEmptyDataType();
      symbolTypeCache['RAPID/robjoint']['type'] = 'robjoint';
      symbolTypeCache['RAPID/robjoint']['url'] = 'RAPID/robjoint';
      symbolTypeCache['RAPID/robjoint']['isRecord'] = true;
      symbolTypeCache['RAPID/robjoint']['numberOfComponents'] = 6;
      symbolTypeCache['RAPID/robjoint']['components'] = [];
      symbolTypeCache['RAPID/robjoint']['components'].push({
        name: 'rax_1',
        type: symbolTypeCache['RAPID/num'],
      });
      symbolTypeCache['RAPID/robjoint']['components'].push({
        name: 'rax_2',
        type: symbolTypeCache['RAPID/num'],
      });
      symbolTypeCache['RAPID/robjoint']['components'].push({
        name: 'rax_3',
        type: symbolTypeCache['RAPID/num'],
      });
      symbolTypeCache['RAPID/robjoint']['components'].push({
        name: 'rax_4',
        type: symbolTypeCache['RAPID/num'],
      });
      symbolTypeCache['RAPID/robjoint']['components'].push({
        name: 'rax_5',
        type: symbolTypeCache['RAPID/num'],
      });
      symbolTypeCache['RAPID/robjoint']['components'].push({
        name: 'rax_6',
        type: symbolTypeCache['RAPID/num'],
      });
      symbolTypeCache['RAPID/extjoint'] = getEmptyDataType();
      symbolTypeCache['RAPID/extjoint']['type'] = 'extjoint';
      symbolTypeCache['RAPID/extjoint']['url'] = 'RAPID/extjoint';
      symbolTypeCache['RAPID/extjoint']['isRecord'] = true;
      symbolTypeCache['RAPID/extjoint']['numberOfComponents'] = 6;
      symbolTypeCache['RAPID/extjoint']['components'] = [];
      symbolTypeCache['RAPID/extjoint']['components'].push({
        name: 'eax_a',
        type: symbolTypeCache['RAPID/num'],
      });
      symbolTypeCache['RAPID/extjoint']['components'].push({
        name: 'eax_b',
        type: symbolTypeCache['RAPID/num'],
      });
      symbolTypeCache['RAPID/extjoint']['components'].push({
        name: 'eax_c',
        type: symbolTypeCache['RAPID/num'],
      });
      symbolTypeCache['RAPID/extjoint']['components'].push({
        name: 'eax_d',
        type: symbolTypeCache['RAPID/num'],
      });
      symbolTypeCache['RAPID/extjoint']['components'].push({
        name: 'eax_e',
        type: symbolTypeCache['RAPID/num'],
      });
      symbolTypeCache['RAPID/extjoint']['components'].push({
        name: 'eax_f',
        type: symbolTypeCache['RAPID/num'],
      });
      symbolTypeCache['RAPID/jointtarget'] = getEmptyDataType();
      symbolTypeCache['RAPID/jointtarget']['type'] = 'jointtarget';
      symbolTypeCache['RAPID/jointtarget']['url'] = 'RAPID/jointtarget';
      symbolTypeCache['RAPID/jointtarget']['isRecord'] = true;
      symbolTypeCache['RAPID/jointtarget']['numberOfComponents'] = 2;
      symbolTypeCache['RAPID/jointtarget']['components'] = [];
      symbolTypeCache['RAPID/jointtarget']['components'].push({
        name: 'robax',
        type: symbolTypeCache['RAPID/robjoint'],
      });
      symbolTypeCache['RAPID/jointtarget']['components'].push({
        name: 'extax',
        type: symbolTypeCache['RAPID/extjoint'],
      });
      symbolTypeCache['RAPID/pos'] = getEmptyDataType();
      symbolTypeCache['RAPID/pos']['type'] = 'pos';
      symbolTypeCache['RAPID/pos']['url'] = 'RAPID/pos';
      symbolTypeCache['RAPID/pos']['isRecord'] = true;
      symbolTypeCache['RAPID/pos']['numberOfComponents'] = 3;
      symbolTypeCache['RAPID/pos']['components'] = [];
      symbolTypeCache['RAPID/pos']['components'].push({
        name: 'x',
        type: symbolTypeCache['RAPID/num'],
      });
      symbolTypeCache['RAPID/pos']['components'].push({
        name: 'y',
        type: symbolTypeCache['RAPID/num'],
      });
      symbolTypeCache['RAPID/pos']['components'].push({
        name: 'z',
        type: symbolTypeCache['RAPID/num'],
      });
      symbolTypeCache['RAPID/orient'] = getEmptyDataType();
      symbolTypeCache['RAPID/orient']['type'] = 'orient';
      symbolTypeCache['RAPID/orient']['url'] = 'RAPID/orient';
      symbolTypeCache['RAPID/orient']['isRecord'] = true;
      symbolTypeCache['RAPID/orient']['numberOfComponents'] = 4;
      symbolTypeCache['RAPID/orient']['components'] = [];
      symbolTypeCache['RAPID/orient']['components'].push({
        name: 'q1',
        type: symbolTypeCache['RAPID/num'],
      });
      symbolTypeCache['RAPID/orient']['components'].push({
        name: 'q2',
        type: symbolTypeCache['RAPID/num'],
      });
      symbolTypeCache['RAPID/orient']['components'].push({
        name: 'q3',
        type: symbolTypeCache['RAPID/num'],
      });
      symbolTypeCache['RAPID/orient']['components'].push({
        name: 'q4',
        type: symbolTypeCache['RAPID/num'],
      });
      symbolTypeCache['RAPID/pose'] = getEmptyDataType();
      symbolTypeCache['RAPID/pose']['type'] = 'pose';
      symbolTypeCache['RAPID/pose']['url'] = 'RAPID/pose';
      symbolTypeCache['RAPID/pose']['isRecord'] = true;
      symbolTypeCache['RAPID/pose']['numberOfComponents'] = 2;
      symbolTypeCache['RAPID/pose']['components'] = [];
      symbolTypeCache['RAPID/pose']['components'].push({
        name: 'trans',
        type: symbolTypeCache['RAPID/pos'],
      });
      symbolTypeCache['RAPID/pose']['components'].push({
        name: 'rot',
        type: symbolTypeCache['RAPID/orient'],
      });
      symbolTypeCache['RAPID/confdata'] = getEmptyDataType();
      symbolTypeCache['RAPID/confdata']['type'] = 'confdata';
      symbolTypeCache['RAPID/confdata']['url'] = 'RAPID/confdata';
      symbolTypeCache['RAPID/confdata']['isRecord'] = true;
      symbolTypeCache['RAPID/confdata']['numberOfComponents'] = 4;
      symbolTypeCache['RAPID/confdata']['components'] = [];
      symbolTypeCache['RAPID/confdata']['components'].push({
        name: 'cf1',
        type: symbolTypeCache['RAPID/num'],
      });
      symbolTypeCache['RAPID/confdata']['components'].push({
        name: 'cf4',
        type: symbolTypeCache['RAPID/num'],
      });
      symbolTypeCache['RAPID/confdata']['components'].push({
        name: 'cf6',
        type: symbolTypeCache['RAPID/num'],
      });
      symbolTypeCache['RAPID/confdata']['components'].push({
        name: 'cfx',
        type: symbolTypeCache['RAPID/num'],
      });
      symbolTypeCache['RAPID/robtarget'] = getEmptyDataType();
      symbolTypeCache['RAPID/robtarget']['type'] = 'robtarget';
      symbolTypeCache['RAPID/robtarget']['url'] = 'RAPID/robtarget';
      symbolTypeCache['RAPID/robtarget']['isRecord'] = true;
      symbolTypeCache['RAPID/robtarget']['numberOfComponents'] = 4;
      symbolTypeCache['RAPID/robtarget']['components'] = [];
      symbolTypeCache['RAPID/robtarget']['components'].push({
        name: 'trans',
        type: symbolTypeCache['RAPID/pos'],
      });
      symbolTypeCache['RAPID/robtarget']['components'].push({
        name: 'rot',
        type: symbolTypeCache['RAPID/orient'],
      });
      symbolTypeCache['RAPID/robtarget']['components'].push({
        name: 'robconf',
        type: symbolTypeCache['RAPID/confdata'],
      });
      symbolTypeCache['RAPID/robtarget']['components'].push({
        name: 'extax',
        type: symbolTypeCache['RAPID/extjoint'],
      });
      symbolTypeCache['RAPID/zonedata'] = getEmptyDataType();
      symbolTypeCache['RAPID/zonedata']['type'] = 'zonedata';
      symbolTypeCache['RAPID/zonedata']['url'] = 'RAPID/zonedata';
      symbolTypeCache['RAPID/zonedata']['isRecord'] = true;
      symbolTypeCache['RAPID/zonedata']['numberOfComponents'] = 7;
      symbolTypeCache['RAPID/zonedata']['components'] = [];
      symbolTypeCache['RAPID/zonedata']['components'].push({
        name: 'finep',
        type: symbolTypeCache['RAPID/bool'],
      });
      symbolTypeCache['RAPID/zonedata']['components'].push({
        name: 'pzone_tcp',
        type: symbolTypeCache['RAPID/num'],
      });
      symbolTypeCache['RAPID/zonedata']['components'].push({
        name: 'pzone_ori',
        type: symbolTypeCache['RAPID/num'],
      });
      symbolTypeCache['RAPID/zonedata']['components'].push({
        name: 'pzone_eax',
        type: symbolTypeCache['RAPID/num'],
      });
      symbolTypeCache['RAPID/zonedata']['components'].push({
        name: 'zone_ori',
        type: symbolTypeCache['RAPID/num'],
      });
      symbolTypeCache['RAPID/zonedata']['components'].push({
        name: 'zone_leax',
        type: symbolTypeCache['RAPID/num'],
      });
      symbolTypeCache['RAPID/zonedata']['components'].push({
        name: 'zone_reax',
        type: symbolTypeCache['RAPID/num'],
      });
      symbolTypeCache['RAPID/wobjdata'] = getEmptyDataType();
      symbolTypeCache['RAPID/wobjdata']['type'] = 'wobjdata';
      symbolTypeCache['RAPID/wobjdata']['url'] = 'RAPID/wobjdata';
      symbolTypeCache['RAPID/wobjdata']['isRecord'] = true;
      symbolTypeCache['RAPID/wobjdata']['numberOfComponents'] = 5;
      symbolTypeCache['RAPID/wobjdata']['components'] = [];
      symbolTypeCache['RAPID/wobjdata']['components'].push({
        name: 'robhold',
        type: symbolTypeCache['RAPID/bool'],
      });
      symbolTypeCache['RAPID/wobjdata']['components'].push({
        name: 'ufprog',
        type: symbolTypeCache['RAPID/bool'],
      });
      symbolTypeCache['RAPID/wobjdata']['components'].push({
        name: 'ufmec',
        type: symbolTypeCache['RAPID/string'],
      });
      symbolTypeCache['RAPID/wobjdata']['components'].push({
        name: 'uframe',
        type: symbolTypeCache['RAPID/pose'],
      });
      symbolTypeCache['RAPID/wobjdata']['components'].push({
        name: 'oframe',
        type: symbolTypeCache['RAPID/pose'],
      });
      symbolTypeCache['RAPID/loaddata'] = getEmptyDataType();
      symbolTypeCache['RAPID/loaddata']['type'] = 'loaddata';
      symbolTypeCache['RAPID/loaddata']['url'] = 'RAPID/loaddata';
      symbolTypeCache['RAPID/loaddata']['isRecord'] = true;
      symbolTypeCache['RAPID/loaddata']['numberOfComponents'] = 6;
      symbolTypeCache['RAPID/loaddata']['components'] = [];
      symbolTypeCache['RAPID/loaddata']['components'].push({
        name: 'mass',
        type: symbolTypeCache['RAPID/num'],
      });
      symbolTypeCache['RAPID/loaddata']['components'].push({
        name: 'cog',
        type: symbolTypeCache['RAPID/pos'],
      });
      symbolTypeCache['RAPID/loaddata']['components'].push({
        name: 'aom',
        type: symbolTypeCache['RAPID/orient'],
      });
      symbolTypeCache['RAPID/loaddata']['components'].push({
        name: 'ix',
        type: symbolTypeCache['RAPID/num'],
      });
      symbolTypeCache['RAPID/loaddata']['components'].push({
        name: 'iy',
        type: symbolTypeCache['RAPID/num'],
      });
      symbolTypeCache['RAPID/loaddata']['components'].push({
        name: 'iz',
        type: symbolTypeCache['RAPID/num'],
      });
      symbolTypeCache['RAPID/tooldata'] = getEmptyDataType();
      symbolTypeCache['RAPID/tooldata']['type'] = 'tooldata';
      symbolTypeCache['RAPID/tooldata']['url'] = 'RAPID/tooldata';
      symbolTypeCache['RAPID/tooldata']['isRecord'] = true;
      symbolTypeCache['RAPID/tooldata']['numberOfComponents'] = 3;
      symbolTypeCache['RAPID/tooldata']['components'] = [];
      symbolTypeCache['RAPID/tooldata']['components'].push({
        name: 'robhold',
        type: symbolTypeCache['RAPID/bool'],
      });
      symbolTypeCache['RAPID/tooldata']['components'].push({
        name: 'tframe',
        type: symbolTypeCache['RAPID/pose'],
      });
      symbolTypeCache['RAPID/tooldata']['components'].push({
        name: 'tload',
        type: symbolTypeCache['RAPID/loaddata'],
      });
      symbolTypeCache['RAPID/speeddata'] = getEmptyDataType();
      symbolTypeCache['RAPID/speeddata']['type'] = 'speeddata';
      symbolTypeCache['RAPID/speeddata']['url'] = 'RAPID/speeddata';
      symbolTypeCache['RAPID/speeddata']['isRecord'] = true;
      symbolTypeCache['RAPID/speeddata']['numberOfComponents'] = 4;
      symbolTypeCache['RAPID/speeddata']['components'] = [];
      symbolTypeCache['RAPID/speeddata']['components'].push({
        name: 'v_tcp',
        type: symbolTypeCache['RAPID/num'],
      });
      symbolTypeCache['RAPID/speeddata']['components'].push({
        name: 'v_ori',
        type: symbolTypeCache['RAPID/num'],
      });
      symbolTypeCache['RAPID/speeddata']['components'].push({
        name: 'v_leax',
        type: symbolTypeCache['RAPID/num'],
      });
      symbolTypeCache['RAPID/speeddata']['components'].push({
        name: 'v_reax',
        type: symbolTypeCache['RAPID/num'],
      });
    };
    rd.removeSymbolTypes = function (task, module = '') {
      let symbolUrl = `RAPID/${task}/`;
      if (typeof module === 'string' && module !== '') symbolUrl += module;
      let newDictionary = {};
      for (let item in symbolTypeCache) {
        if (item.startsWith(symbolUrl) == false) {
          newDictionary[item] = symbolTypeCache[item];
        }
      }
      symbolTypeCache = newDictionary;
    };
    rd.getCachedSymbolTypeNames = function () {
      let keys = Object.keys(symbolTypeCache);
      return keys;
    };
    rd.getCachedSymbolType = function (type) {
      if (typeof symbolTypeCache[type] !== 'undefined') return symbolTypeCache[type];
      return undefined;
    };
    rd.RapidData = new (function () {
      this.Type = new (function () {
        this.getType = function (rapidData) {
          if (typeof rapidData.getDataType === 'undefined') {
            RWS.writeDebug('rapidData is not a valid Data object', 3);
            return Promise.reject('rapidData is not a valid Data object');
          }
          return processData(rapidData);
        };
        function parseJSON(json) {
          try {
            return JSON.parse(json);
          } catch (error) {
            return undefined;
          }
        }
        function copyProperties(fromObject) {
          if (fromObject instanceof Object) {
            let toObject = getEmptyDataType();
            for (const property in fromObject) {
              if (fromObject.hasOwnProperty(property)) {
                if (Array.isArray(fromObject[property])) {
                  toObject[property] = [];
                  for (let iii = 0; iii < fromObject[property].length; iii++) {
                    if (typeof fromObject[property][iii] === 'number') {
                      toObject[property].push(fromObject[property][iii]);
                    } else {
                      let dt = copyProperties(fromObject[property][iii]);
                      toObject[property].push(dt);
                    }
                  }
                } else {
                  toObject[property] = fromObject[property];
                }
              }
            }
            return toObject;
          } else {
            throw new Error('Not a supported datatype.');
          }
        }
        function processData(data) {
          return getProperties(data.getTitle())
            .then((item) => {
              let datatype = processDataType(item);
              return Promise.resolve(datatype);
            })
            .catch((err) => Promise.reject(`Failed to parse data. >>> ${err}`));
        }
        async function processDataType(item) {
          let datatype = getEmptyDataType();
          if (symbolTypeCache.hasOwnProperty(item.symburl)) {
            datatype = copyProperties(symbolTypeCache[item.symburl]);
            return datatype;
          }
          switch (item.symtyp) {
            case 'atm':
              datatype['isAtomic'] = true;
              datatype['type'] = item.name;
              datatype['url'] = item.symburl;
              symbolTypeCache[item.symburl] = copyProperties(datatype);
              break;

            case 'con':
            case 'var':
            case 'per':
              let subitem1 = await getProperties(item.typurl);
              datatype = await processDataType(subitem1);
              datatype['type'] = item.dattyp;
              datatype['url'] = item.symburl;
              datatype['isArray'] = item.ndim !== '0';
              if (datatype['isArray'] === true) {
                datatype['dimensions'] = [];
                let splits = item.dim.trim().split(' ');
                for (const s of splits) {
                  datatype['dimensions'].push(parseInt(s));
                }
              }
              symbolTypeCache[item.symburl] = copyProperties(datatype);
              break;

            case 'ali':
              datatype['type'] = item.name;
              datatype['isAlias'] = true;
              datatype['aliasTypeUrl'] = item.typurl;
              if (symbolTypeCache.hasOwnProperty(item.typurl) === false) {
                let subitem2 = await getProperties(item.typurl);
                await processDataType(subitem2);
              }
              datatype['url'] = item.symburl;
              symbolTypeCache[item.symburl] = copyProperties(datatype);
              break;

            case 'rcp':
              let subitem3 = await getProperties(item.typurl);
              datatype = await processDataType(subitem3);
              datatype['type'] = item.dattyp;
              datatype['url'] = item.symburl;
              symbolTypeCache[item.symburl] = copyProperties(datatype);
              break;

            case 'rec':
              datatype['type'] = item.name;
              datatype['isRecord'] = true;
              datatype['numberOfComponents'] = parseInt(item.ncom);
              try {
                let x1 = await getRecordComponents(item.symburl);
                datatype['components'] = x1;
              } catch (err) {
                console.warn(err);
              }
              datatype['url'] = item.symburl;
              symbolTypeCache[item.symburl] = copyProperties(datatype);
              break;

            default:
              datatype['type'] = 'unknown';
          }
          return datatype;
        }
        function getProperties(symbolUrl) {
          let url = '/rw/rapid/symbol/' + encodeURIComponent(symbolUrl) + '/properties';
          return RWS.Network.get(url)
            .then((x1) => {
              let obj = parseJSON(x1.responseText);
              if (obj.hasOwnProperty('_embedded')) {
                for (const item of obj._embedded.resources) {
                  switch (item._type) {
                    case 'rap-sympropconstant':
                    case 'rap-sympropvar':
                    case 'rap-symproppers':
                    case 'rap-sympropalias':
                    case 'rap-symproprecord':
                    case 'rap-sympropreccomp-li':
                    case 'rap-sympropatomic':
                      return Promise.resolve(item);

                    default:
                      continue;
                  }
                }
              } else if (obj.hasOwnProperty('state')) {
                for (const item of obj.state) {
                  switch (item._type) {
                    case 'rap-sympropconstant':
                    case 'rap-sympropvar':
                    case 'rap-symproppers':
                    case 'rap-sympropalias':
                    case 'rap-symproprecord':
                    case 'rap-sympropreccomp-li':
                    case 'rap-sympropatomic':
                      return Promise.resolve(item);

                    default:
                      continue;
                  }
                }
              }
              return Promise.reject('No valid datatype found.');
            })
            .catch((x2) => Promise.reject(x2));
        }
        async function getRecordComponents(symbolUrl) {
          const doSearch = (url, body, symbols) => {
            if (url === '') return Promise.resolve(symbols);
            return RWS.Network.post(url, body)
              .then(async (res) => {
                let obj = null;
                try {
                  obj = JSON.parse(res.responseText);
                } catch (error) {
                  return Promise.reject('Could not parse JSON response from RWS');
                }
                if (obj._links.hasOwnProperty('next')) {
                  url = '/rw/rapid/' + obj._links['next'].href;
                } else {
                  url = '';
                }
                if (obj.hasOwnProperty('_embedded') && obj['_embedded'].hasOwnProperty('resources')) {
                  for (const item of obj._embedded.resources) {
                    if (item._type === 'rap-sympropreccomp-li' && item.symburl.startsWith(symbolUrl + '/')) {
                      symbols.push(item);
                    }
                  }
                }
                return doSearch(url, body, symbols);
              })
              .catch((err) => Promise.reject(err));
          };
          let components = [];
          try {
            let url = '/rw/rapid/symbols/search';
            let body = '';
            let splits = symbolUrl.split('/');
            if (splits.length <= 2)
              body = `view=block&blockurl=RAPID&symtyp=rcp&recursive=TRUE&skipshared=FALSE&onlyused=FALSE`;
            else
              body = `view=block&blockurl=${encodeURIComponent(symbolUrl)}&symtyp=rcp&recursive=FALSE&skipshared=FALSE&onlyused=FALSE`;
            let items = await doSearch(url, body, []);
            let temp = items.sort((x1, x2) => parseInt(x1.comnum) - parseInt(x2.comnum));
            for (const item of temp) {
              let subType = await processDataType(item);
              components.push({
                name: item.name,
                type: subType,
              });
            }
          } catch (err) {
            return Promise.reject(`Could not read record components >>> ${err}`);
          }
          return Promise.resolve(components);
        }
      })();
      this.Value = new (function () {
        this.parseRawValue = function (rapidType, value) {
          if (rapidType === null || typeof rapidType !== 'object') {
            let err = 'rapidType is not a valid data type object';
            RWS.writeDebug(err, 3);
            return Promise.reject(err);
          }
          if (value === null || typeof value !== 'string') {
            let err = 'value is not a valid string';
            RWS.writeDebug(err, 3);
            return Promise.reject(err);
          }
          return parseData(rapidType, value);
        };
        async function parseData(rapidType, dataValue) {
          try {
            let aliasType = {};
            if (rapidType.isAlias) {
              if (symbolTypeCache.hasOwnProperty(rapidType.aliasTypeUrl)) {
                aliasType = symbolTypeCache[rapidType.aliasTypeUrl];
              } else {
                return Promise.reject('Could not parse data. Illegal alias value.');
              }
            }
            if (rapidType.isArray) {
              let tempType = rapidType;
              if (rapidType.isAlias) {
                tempType.isAlias = false;
                tempType.aliasTypeUrl = '';
                tempType.isArray = aliasType.isArray;
                tempType.isAtomic = aliasType.isAtomic;
                tempType.isRecord = aliasType.isRecord;
                if (tempType.isRecord) tempType.components = aliasType.components;
                tempType.type = aliasType.type;
              }
              if (rapidType.dimensions.length === 1) {
                return await parseArray(tempType, dataValue);
              }
              return await parseMatrix(tempType, dataValue);
            }
            if (rapidType.isRecord || (rapidType.isAlias && aliasType.isRecord)) {
              let dataType = rapidType.isAlias ? aliasType : rapidType;
              return await parseRecord(dataType, dataValue);
            }
            if (rapidType.isAtomic || (rapidType.isAlias && aliasType.isAtomic)) {
              let dataType = rapidType.isAlias ? aliasType : rapidType;
              switch (dataType.type) {
                case 'num':
                case 'dnum':
                  return Promise.resolve(parseFloat(dataValue));

                case 'string':
                  return Promise.resolve(RWS.RapidData.String.cleanupString(dataValue));

                case 'bool':
                  let b = dataValue.toUpperCase() == 'TRUE';
                  return Promise.resolve(b);

                default:
                  return Promise.reject('Could not parse data. Illegal atomic value.');
              }
            }
            return Promise.reject('Unknown data type.');
          } catch (err) {
            return Promise.reject(`parseData failed >>> ${err}`);
          }
        }
        async function parseArray(dataType, valueString) {
          let s = valueString.replace(/^\[/g, '').replace(/\]$/g, '');
          if (dataType.isRecord) {
            let recordValues = await parseRecordArray(dataType, valueString.trim());
            return Promise.resolve(recordValues);
          }
          if (dataType.isAtomic) {
            switch (dataType.type) {
              case 'num':
              case 'dnum':
                let numSplits = s.split(',');
                let numValues = [];
                for (const value of numSplits) {
                  numValues.push(parseFloat(value));
                }
                return Promise.resolve(numValues);

              case 'string':
                let stringValues = await parseStringArray(valueString.trim());
                return Promise.resolve(stringValues);

              case 'bool':
                let boolSplits = s.split(',');
                let boolValues = [];
                for (const value of boolSplits) {
                  let b = value.toUpperCase() == 'TRUE';
                  boolValues.push(b);
                }
                return Promise.resolve(boolValues);

              default:
                return Promise.reject('Could not parse data. Illegal array value.');
            }
          }
        }
        async function parseMatrix(dataType, valueString) {
          if (dataType.isRecord) {
            let matrixValues = await parseRecordMatrix(dataType, valueString.trim());
            return Promise.resolve(matrixValues);
          }
          switch (dataType.type) {
            case 'num':
            case 'dnum':
              let numValues = parseNumMatrix(valueString, dataType.dimensions);
              return Promise.resolve(numValues);

            case 'string':
              let stringValues = parseStringMatrix(valueString.trim(), dataType.dimensions);
              return Promise.resolve(stringValues);

            case 'bool':
              let boolValues = parseBoolMatrix(valueString, dataType.dimensions);
              return Promise.resolve(boolValues);

            default:
              return Promise.reject('Could not parse data. Illegal array value.');
          }
        }
        const groupObjects = (collection, count) =>
          collection.reduce(
            (acc, curr, idx) => (idx % count == 0 ? acc.push([curr]) : acc[acc.length - 1].push(curr)) && acc,
            [],
          );
        function parseBoolMatrix(valueString, dimensions) {
          let boolMatrix = valueString.replace(/\[/g, '').replace(/\]/g, '').split(',');
          for (let iii = 0; iii < boolMatrix.length; iii++) {
            boolMatrix[iii] = boolMatrix[iii].toUpperCase() == 'TRUE';
          }
          for (let iii = dimensions.length; iii >= 1; iii--) {
            boolMatrix = groupObjects(boolMatrix, dimensions[iii - 1]);
          }
          return boolMatrix[0];
        }
        function parseNumMatrix(valueString, dimensions) {
          let numMatrix = valueString.replace(/\[/g, '').replace(/\]/g, '').split(',');
          for (let iii = 0; iii < numMatrix.length; iii++) {
            numMatrix[iii] = parseFloat(numMatrix[iii]);
          }
          for (let iii = dimensions.length; iii >= 1; iii--) {
            numMatrix = groupObjects(numMatrix, dimensions[iii - 1]);
          }
          return numMatrix[0];
        }
        function parseStringMatrix(valueString, dimensions) {
          let stringMatrix = parseStringArray(valueString);
          for (let iii = dimensions.length; iii >= 1; iii--) {
            stringMatrix = groupObjects(stringMatrix, dimensions[iii - 1]);
          }
          return stringMatrix[0];
        }
        function parseStringArray(valueString) {
          let text = valueString.trim();
          let extractedStrings = [];
          let even = true;
          let n = 0;
          let start = -1;
          while (n >= 0) {
            n = text.indexOf('"', n);
            if (n >= 0) {
              if (start === -1) start = n;
              even = even === false;
              if (even === true && (text[n + 1] === ']' || text[n + 1] === ',')) {
                let s = text.substring(start + 1, n);
                extractedStrings.push(s);
                start = -1;
              }
              n++;
            }
          }
          return extractedStrings;
        }
        function getRandomString(length, text) {
          const r = (max) => {
            return Math.floor(Math.random() * Math.floor(max));
          };
          const x = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
          let c = '';
          for (let iii = 0; iii < length; iii++) c += x[r(x.length)];
          if (text === null || text === '') return c;
          while (text.includes(c) == true) {
            for (let iii = 0; iii < length; iii++) c += x[r(x.length)];
          }
          return c;
        }
        async function getElements(valueString) {
          try {
            let rndStr = getRandomString(5, valueString);
            const rndTemplate = (index) => {
              return `${rndStr}_${index}_`;
            };
            let text = valueString.trim();
            let replacedStrings = {};
            let idx = 0;
            let even = true;
            let n = 0;
            let start = -1;
            while (n >= 0) {
              n = text.indexOf('"', n);
              if (n >= 0) {
                if (start === -1) start = n;
                even = even === false;
                if (even === true && (text[n + 1] === ']' || text[n + 1] === ',')) {
                  let s = text.substring(start, n + 1);
                  let r = rndTemplate(idx++);
                  replacedStrings[r] = s;
                  text = text.replace(s, r);
                  n += r.length - s.length;
                  start = -1;
                }
                n++;
              }
            }
            let components = text.replace(/\[/g, '').replace(/\]/g, '').split(',');
            let retVal = {
              components: components,
              replacedStrings: replacedStrings,
            };
            return Promise.resolve(retVal);
          } catch (err) {
            return Promise.reject(`getComponents failed >>> ${err}`);
          }
        }
        async function parseRecordArray(dataType, valueString) {
          try {
            let elements = await getElements(valueString);
            let array = [];
            for (let iii = 0; iii < dataType.dimensions[0]; iii++) {
              let record = {};
              for (let jjj = 0; jjj < dataType.components.length; jjj++) {
                record[dataType.components[jjj].name] = await parseComponentData(
                  dataType.components[jjj].type,
                  elements.components,
                  elements.replacedStrings,
                );
              }
              array.push(record);
            }
            return Promise.resolve(array);
          } catch (err) {
            return Promise.reject(`parseRecordArray failed >>> ${err}`);
          }
        }
        async function parseRecordMatrix(dataType, valueString) {
          try {
            let elements = await getElements(valueString);
            let count = 1;
            for (let x1 = 0; x1 < dataType.dimensions.length; x1++) {
              count *= dataType.dimensions[x1];
            }
            let matrix = [];
            for (let x2 = 0; x2 < count; x2++) {
              let record = {};
              for (let x3 = 0; x3 < dataType.components.length; x3++) {
                record[dataType.components[x3].name] = await parseComponentData(
                  dataType.components[x3].type,
                  elements.components,
                  elements.replacedStrings,
                );
              }
              matrix.push(record);
            }
            for (let x4 = dataType.dimensions.length; x4 >= 1; x4--) {
              matrix = groupObjects(matrix, dataType.dimensions[x4 - 1]);
            }
            return Promise.resolve(matrix[0]);
          } catch (err) {
            return Promise.reject(`parseRecordMatrix failed >>> ${err}`);
          }
        }
        async function parseRecord(dataType, valueString) {
          try {
            if (dataType.isAlias) {
              if (symbolTypeCache.hasOwnProperty(dataType.aliasTypeUrl)) {
                let type = symbolTypeCache[dataType.aliasTypeUrl];
                return parseRecord(type, valueString);
              }
              return Promise.reject('Could not parse record data. Illegal alias value.');
            }
            let elements = await getElements(valueString);
            let record = {};
            for (let iii = 0; iii < dataType.components.length; iii++) {
              record[dataType.components[iii].name] = await parseComponentData(
                dataType.components[iii].type,
                elements.components,
                elements.replacedStrings,
              );
            }
            return Promise.resolve(record);
          } catch (err) {
            return Promise.reject(`parseRecord failed >>> ${err}`);
          }
        }
        async function parseComponentData(dataType, components, replacedStrings) {
          try {
            if (dataType.isAlias) {
              if (symbolTypeCache.hasOwnProperty(dataType.aliasTypeUrl)) {
                let type = symbolTypeCache[dataType.aliasTypeUrl];
                return parseComponentData(type, components, replacedStrings);
              }
              return Promise.reject('Could not parse data. Illegal alias value.');
            }
            if (dataType.isRecord) {
              let record = {};
              for (let iii = 0; iii < dataType.components.length; iii++) {
                record[dataType.components[iii].name] = await parseComponentData(
                  dataType.components[iii].type,
                  components,
                  replacedStrings,
                );
              }
              return Promise.resolve(record);
            }
            if (dataType.isAtomic) {
              let component = components.shift();
              switch (dataType.type) {
                case 'num':
                case 'dnum':
                  return Promise.resolve(parseFloat(component));

                case 'string':
                  return Promise.resolve(RWS.RapidData.String.cleanupString(replacedStrings[component]));

                case 'bool':
                  let b = component.toUpperCase() == 'TRUE';
                  return Promise.resolve(b);

                default:
                  return Promise.reject('Could not parse data. Illegal atomic value.');
              }
            }
            return Promise.reject('Unknown data type.');
          } catch (err) {
            return Promise.reject(`parseComponentData failed >>> ${err}`);
          }
        }
        this.setValue = function (rapidData, value) {
          if (typeof rapidData.getDataType === 'undefined') {
            let err = 'rapidData is not a valid Data object';
            RWS.writeDebug(err, 3);
            return Promise.reject(err);
          }
          return rapidData.setValue(value);
        };
      })();
      this.String = new (function () {
        this.cleanupString = function (rapidString) {
          let jsString = '';
          try {
            jsString = rapidString.replace(/^"/g, '').replace(/"$/g, '');
            jsString = jsString.replace(/\\\\/g, '\\');
            jsString = jsString.replace(/""/g, '"');
          } catch (err) {
            jsString = '';
          }
          return jsString;
        };
        this.stringify = function (value, s = '') {
          try {
            if (typeof value !== 'object') {
              let temp = value.toString();
              if (typeof value === 'string') {
                temp = temp.replace(/\\/g, '\\\\');
                temp = temp.replace(/\"/g, '""');
                temp = `"${temp}"`;
              }
              s += temp;
            } else {
              s += '[';
              for (let item in value) {
                s = this.stringify(value[item], s) + ',';
              }
              s = s.slice(0, -1);
              s += ']';
            }
            return s;
          } catch (error) {
            RWS.writeDebug(`stringify failed to make a string of '${value.toString()}' >>> ${error}`);
          }
        };
      })();
    })();
    rd.constructedRapidData = true;
  })(RWS);
}

// App SDK 1.5.0

// Copyright (c) 2020-2024 ABB

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software (the "Software"), to deal in the Software without
// restriction, including without limitation the rights to use, copy, modify,
// merge, publish, distribute, sublicense, and/or sell copies of the Software,
// and to permit persons to whom the Software is furnished to do so, subject to
// the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// The manuals related to the Software and the information therein are not
// included in these permissions and must not be reproduced, distributed,
// copied, or disclosed to third parties without ABB's written permission.
// ABB reserves all rights regarding Intellectual Property Rights in such
// manuals and information therein.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.

('use strict');

// fpComponentsLoadCSS("fp-components/fp-components-button-a.css");

var FPComponents = FPComponents || {};

(function (o) {
  if (!o.hasOwnProperty('Button_A')) {
    o.Button_A = class {
      constructor() {
        this._anchor = null;
        this._root = null;
        this._divIcon = null;
        this._divText = null;
        this._icon = null;
        this._enabled = true;
        this._onclick = null;
        this._text = '';
        this._highlight = false;
      }
      get parent() {
        return this._anchor;
      }
      get onclick() {
        return this._onclick;
      }
      set onclick(f) {
        this._onclick = f;
      }
      get enabled() {
        return this._enabled;
      }
      set enabled(e) {
        this._enabled = e ? true : false;
        this._updateClassNames();
      }
      get text() {
        return this._text;
      }
      set text(t) {
        this._text = t;
        if (this._divText !== null) {
          this._divText.textContent = t;
        }
      }
      get highlight() {
        return this._highlight;
      }
      set highlight(h) {
        this._highlight = h ? true : false;
        this._updateClassNames();
      }
      get icon() {
        return this._icon;
      }
      set icon(i) {
        this._icon = i === null ? null : i.replace(/\\/g, '/');
        if (this._root == null) {
          return;
        }
        if (!i) {
          if (this._divIcon !== null) {
            this._root.removeChild(this._divIcon);
            this._divIcon = null;
          }
          return;
        }
        if (this._divIcon == null) {
          this._addIcon();
          return;
        }
        this._divIcon.style.backgroundImage = `url("${this._urlEncode(this._icon)}")`;
      }
      _urlEncode(url) {
        const urlItems = url.split('/');
        const escapedItems = [];
        for (const item of urlItems) {
          escapedItems.push(encodeURIComponent(item));
        }
        return escapedItems.join('/');
      }
      _updateClassNames() {
        if (this._root !== null) {
          this._root.className = this._enabled === true ? 'fp-components-button' : 'fp-components-button-disabled';
          if (this._highlight) {
            this._root.className += ' fp-components-button-highlight';
          }
        }
      }
      attachToId(nodeId) {
        let element = document.getElementById(nodeId);
        if (element === null) {
          console.log('Could not find element with id: ' + nodeId);
          return false;
        }
        return this.attachToElement(element);
      }
      attachToElement(element) {
        this._anchor = element;
        return this.rebuild();
      }
      _addIcon() {
        if (this._root) {
          this._divIcon = document.createElement('div');
          this._divIcon.style.backgroundImage = `url("${this._urlEncode(this._icon)}")`;
          this._divIcon.className = 'fp-components-button-icon';
          this._root.prepend(this._divIcon);
        }
      }
      rebuild() {
        let divButton = document.createElement('div');
        let divText = document.createElement('span');
        divText.className = 'fp-components-button-text';
        divText.textContent = this._text;
        divButton.onclick = () => {
          if (this._onclick !== null && this._enabled === true) {
            this._onclick();
          }
        };
        divButton.appendChild(divText);
        this._root = divButton;
        this._divText = divText;
        if (this._icon) {
          this._addIcon();
        }
        this._updateClassNames();
        this._anchor.appendChild(divButton);
      }
    };
    o.Button_A.VERSION = '1.5.0';
  }
})(FPComponents);

// App SDK 1.5.0

// Copyright (c) 2020-2024 ABB

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software (the "Software"), to deal in the Software without
// restriction, including without limitation the rights to use, copy, modify,
// merge, publish, distribute, sublicense, and/or sell copies of the Software,
// and to permit persons to whom the Software is furnished to do so, subject to
// the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// The manuals related to the Software and the information therein are not
// included in these permissions and must not be reproduced, distributed,
// copied, or disclosed to third parties without ABB's written permission.
// ABB reserves all rights regarding Intellectual Property Rights in such
// manuals and information therein.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.

('use strict');

// fpComponentsLoadCSS("fp-components/fp-components-checkbox-a.css");

var FPComponents = FPComponents || {};

(function (o) {
  if (!o.hasOwnProperty('Checkbox_A')) {
    o.Checkbox_A = class {
      constructor() {
        this._anchor = null;
        this._root = null;
        this._button = null;
        this._scale = 1;
        this._enabled = true;
        this._onclick = null;
        this._checked = false;
        this._desc = null;
        this._descDiv = null;
      }
      get parent() {
        return this._anchor;
      }
      get onclick() {
        return this._onclick;
      }
      set onclick(f) {
        this._onclick = f;
      }
      get enabled() {
        return this._enabled;
      }
      set enabled(e) {
        this._enabled = e ? true : false;
        this._updateClassNames();
      }
      get checked() {
        return this._checked;
      }
      set checked(c) {
        this._checked = c ? true : false;
        this._updateClassNames();
      }
      get desc() {
        return this._desc;
      }
      set desc(d) {
        this._desc = d;
        if (this._root == null) {
          return;
        }
        if (!d) {
          if (this._descDiv !== null) {
            this._root.removeChild(this._descDiv);
          }
          this._descDiv = null;
          return;
        }
        if (this._descDiv == null) {
          this._createDesc(this._root);
          return;
        }
        this._descDiv.textContent = d;
      }
      _createDesc(parent) {
        let divdesc = document.createElement('div');
        divdesc.className = 'fp-components-checkbox-desc';
        divdesc.textContent = this._desc;
        parent.appendChild(divdesc);
        this._descDiv = divdesc;
      }
      _updateClassNames() {
        if (this._button !== null) {
          if (this._checked == true) {
            this._button.className =
              this._enabled === true
                ? 'fp-components-checkbox-checked'
                : 'fp-components-checkbox-checked fp-components-checkbox-disabled';
          } else {
            this._button.className =
              this._enabled === true
                ? 'fp-components-checkbox'
                : 'fp-components-checkbox fp-components-checkbox-disabled';
          }
        }
      }
      attachToId(nodeId) {
        let element = document.getElementById(nodeId);
        if (element === null) {
          console.log('Could not find element with id: ' + nodeId);
          return false;
        }
        return this.attachToElement(element);
      }
      attachToElement(element) {
        this._anchor = element;
        return this.rebuild();
      }
      _paintCanvas(canvas, color) {
        let s = this._scale;
        canvas.height = s * 20;
        canvas.width = s * 20;
        let ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.translate(s * 10, s * 10);
        ctx.translate(-s * 0.5, -s * 2.5);
        ctx.rotate(45 * (Math.PI / 180));
        ctx.translate(-3 * s, -6 * s);
        ctx.moveTo(0, s * 13);
        ctx.lineTo(s * 7, s * 13);
        ctx.lineTo(s * 7, 0);
        ctx.strokeStyle = color;
        ctx.lineCap = 'butt';
        ctx.lineWidth = s * 2.5;
        ctx.stroke();
      }
      rebuild() {
        let checkBoxDiv = document.createElement('div');
        checkBoxDiv.className = 'fp-components-checkbox-root';
        let divButton = document.createElement('div');
        let canvas1 = document.createElement('canvas');
        let canvas2 = document.createElement('canvas');
        this._paintCanvas(canvas1, 'white');
        this._paintCanvas(canvas2, 'white');
        divButton.appendChild(canvas1);
        divButton.appendChild(canvas2);
        checkBoxDiv.onclick = () => {
          if (this._enabled == true) {
            this._checked = this._checked == true ? false : true;
            this._updateClassNames();
            if (this._onclick !== null) {
              this._onclick(this._checked);
            }
          }
        };
        this._button = divButton;
        checkBoxDiv.appendChild(divButton);
        if (this._desc !== null) {
          this._createDesc(checkBoxDiv);
        }
        this._root = checkBoxDiv;
        this._updateClassNames();
        if (this._scale !== 1) {
          this.scale = this._scale;
        }
        this._anchor.appendChild(checkBoxDiv);
      }
      set scale(s) {
        this._scale = s;
        if (this._button !== null) {
          this._button.style.borderWidth = (2 * s).toString() + 'px';
          this._button.style.borderRadius = (3 * s).toString() + 'px';
          this._button.style.width = (20 * s).toString() + 'px';
          this._button.style.height = (20 * s).toString() + 'px';
          let canvases = this._button.getElementsByTagName('canvas');
          this._paintCanvas(canvases[0], 'white');
          this._paintCanvas(canvases[1], 'white');
        }
      }
      get scale() {
        return this._scale;
      }
    };
    o.Checkbox_A.VERSION = '1.5.0';
  }
})(FPComponents);

// App SDK 1.5.0

// Copyright (c) 2020-2024 ABB

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software (the "Software"), to deal in the Software without
// restriction, including without limitation the rights to use, copy, modify,
// merge, publish, distribute, sublicense, and/or sell copies of the Software,
// and to permit persons to whom the Software is furnished to do so, subject to
// the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// The manuals related to the Software and the information therein are not
// included in these permissions and must not be reproduced, distributed,
// copied, or disclosed to third parties without ABB's written permission.
// ABB reserves all rights regarding Intellectual Property Rights in such
// manuals and information therein.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.

('use strict');

function fpComponentsLoadCSS(href) {
  let head = document.getElementsByTagName('head')[0];
  let link = document.createElement('link');
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.href = href;
  head.appendChild(link);
}

const FP_COMPONENTS_COMMON_VERSION = '1.5.0';

// fpComponentsLoadCSS("fp-components/fp-components-common.css");

const FP_COMPONENTS_KEYBOARD_ALPHA = {};

const FP_COMPONENTS_KEYBOARD_NUM = {};

function fpComponentsKeyboardShow(
  callback,
  initialText = null,
  label = null,
  variant = null,
  regex = null,
  validator = null,
) {
  var __fpComponentsKeyboardCallback = callback;
  var __fpComponentsKeyboardLabel = label;
  var __fpComponentsKeyboardRegex = regex;
  var __fpComponentsKeyboardValidator = validator;
  const INPUT_OK = {};
  function cancel() {
    document.getElementById('fp-components-keyboard-id').style.display = 'none';
    document.getElementById('fp-components-keyboard-background-id').style.display = 'none';
    document.getElementById('fp-components-keyboard-input-id').value = '';
    if (__fpComponentsKeyboardCallback !== null && typeof __fpComponentsKeyboardCallback === 'function') {
      __fpComponentsKeyboardCallback(null);
    }
  }
  function validateInput() {
    let isMatch = false;
    let f = document.getElementById('fp-components-keyboard-input-id');
    if (
      __fpComponentsKeyboardRegex === null ||
      __fpComponentsKeyboardRegex.test === undefined ||
      __fpComponentsKeyboardRegex.test(f.value)
    ) {
      isMatch = true;
    }
    if (isMatch && __fpComponentsKeyboardValidator !== null && typeof __fpComponentsKeyboardValidator === 'function') {
      isMatch = __fpComponentsKeyboardValidator(f.value);
    }
    f.style.color = isMatch ? 'black' : 'red';
    let okButton = document.getElementById('fp-components-keyboard-ok-id');
    if (okButton) {
      if (isMatch) {
        okButton.classList.remove('fp-components-keyboard-disabled-button');
        okButton.onclick = () => {
          input(INPUT_OK);
        };
      } else {
        okButton.classList.add('fp-components-keyboard-disabled-button');
        okButton.onclick = null;
      }
    }
  }
  function input(c) {
    let f = document.getElementById('fp-components-keyboard-input-id');
    if (f === null) {
      return;
    }
    if (typeof c === 'string') {
      let oldSelStart = f.selectionStart;
      if (f.selectionStart != f.selectionEnd) {
        f.value = f.value.slice(0, oldSelStart) + f.value.slice(f.selectionEnd);
      }
      f.value = f.value.slice(0, oldSelStart) + c + f.value.slice(oldSelStart);
      f.selectionStart = oldSelStart;
      f.selectionEnd = oldSelStart;
      f.selectionStart = oldSelStart + 1;
      f.selectionEnd = f.selectionStart;
    } else if (c === INPUT_OK) {
      if (__fpComponentsKeyboardCallback !== null && typeof __fpComponentsKeyboardCallback === 'function') {
        document.getElementById('fp-components-keyboard-id').style.display = 'none';
        document.getElementById('fp-components-keyboard-background-id').style.display = 'none';
        let inputField = document.getElementById('fp-components-keyboard-input-id');
        let val = inputField.value;
        inputField.value = '';
        __fpComponentsKeyboardCallback(val);
      }
    }
    validateInput();
  }
  let existing = document.getElementById('fp-components-keyboard-id');
  if (existing === null) {
    let divKeyboard = document.createElement('div');
    divKeyboard.className = 'fp-components-keyboard';
    divKeyboard.id = 'fp-components-keyboard-id';
    let divTop = document.createElement('div');
    divTop.className = 'fp-components-keyboard-toparea';
    divTop.id = 'fp-components-keyboard-toparea-id';
    divKeyboard.appendChild(divTop);
    let divLabel = document.createElement('div');
    divLabel.className = 'fp-components-keyboard-label';
    divKeyboard.appendChild(divLabel);
    let okBtn = document.createElement('div');
    okBtn.innerHTML = 'OK';
    okBtn.id = 'fp-components-keyboard-ok-id';
    okBtn.className = 'fp-components-keyboard-button fp-components-keyboard-ok';
    divTop.appendChild(okBtn);
    let cancelBtn = document.createElement('div');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.id = 'fp-components-keyboard-button-id';
    cancelBtn.className = 'fp-components-keyboard-button';
    divTop.appendChild(cancelBtn);
    let f = document.createElement('input');
    f.className = 'fp-components-keyboard-input';
    f.id = 'fp-components-keyboard-input-id';
    f.autocomplete = 'off';
    f.addEventListener('keyup', (ev) => {
      if (ev.key === 'Enter') {
        if (okBtn.onclick) {
          okBtn.onclick();
        }
      }
    });
    divTop.appendChild(f);
    let hand = document.createElement('div');
    hand.id = 'fp-components-keyboard-hand-id';
    hand.className = 'fp-components-keyboard-hand';
    let handImg = document.createElement('div');
    hand.appendChild(handImg);
    divTop.appendChild(hand);
    let divBackshade = document.createElement('div');
    divBackshade.id = 'fp-components-keyboard-background-id';
    divBackshade.className = 'fp-components-keyboard-background';
    let body = document.getElementsByTagName('body')[0];
    body.appendChild(divBackshade);
    body.appendChild(divKeyboard);
    existing = divKeyboard;
  }
  let bg = document.getElementById('fp-components-keyboard-background-id');
  let okBtn = document.getElementById('fp-components-keyboard-ok-id');
  let cancelBtn = document.getElementById('fp-components-keyboard-button-id');
  let handDiv = document.getElementById('fp-components-keyboard-hand-id');
  let inputField = document.getElementById('fp-components-keyboard-input-id');
  bg.onclick = () => {
    cancel();
  };
  okBtn.onclick = () => {
    input(INPUT_OK);
  };
  cancelBtn.onclick = () => {
    cancel();
  };
  inputField.addEventListener('input', validateInput);
  inputField.onfocus = () => {
    handDiv.classList.add('fp-components-keyboard-hand-hide');
  };
  inputField.value = initialText === null ? '' : initialText.toString();
  bg.style.display = 'block';
  existing.style.display = 'block';
  if (handDiv.classList.contains('fp-components-keyboard-hand-hide')) {
    handDiv.classList.remove('fp-components-keyboard-hand-hide');
  }
  let labelDiv = document.getElementsByClassName('fp-components-keyboard-label')[0];
  labelDiv.textContent = __fpComponentsKeyboardLabel === null ? ' ' : __fpComponentsKeyboardLabel;
  validateInput();
}

var __fpComponentsDebugWindowLock = false;

var __fpComponentsDebugWindowCmd = null;

function fpComponentsEnableLog() {
  const NORMAL = 1;
  const INFO = 2;
  const ERROR = 3;
  const WARN = 4;
  function currentTime() {
    function pad(n) {
      return ('00' + n).slice(-2);
    }
    let now = new Date();
    return pad(now.getHours()) + ':' + pad(now.getMinutes()) + '.' + pad(now.getSeconds());
  }
  function updateClock() {
    let clock = document.getElementById('fp-debugwindow-clock');
    clock.textContent = currentTime();
    setTimeout(updateClock, 1e3);
  }
  function logToDebugWindow(message, level) {
    let debugWindowContent = document.getElementById('fp-debugwindow-content');
    if (debugWindowContent !== null) {
      let now = new Date();
      let newEntry = document.createElement('pre');
      if (level === ERROR) {
        newEntry.style.fontWeight = 'bold';
        newEntry.style.textDecoration = 'underline';
      } else if (level === WARN) {
        newEntry.style.fontWeight = 'bold';
      } else if (level === INFO) {
        newEntry.style.fontStyle = 'italic';
      }
      newEntry.textContent = '§ ' + currentTime() + ' - ' + message;
      debugWindowContent.appendChild(newEntry);
      if (debugWindowContent.children.length > 1e3) {
        debugWindowContent.removeChild(debugWindowContent.children[0]);
      }
      if (!__fpComponentsDebugWindowLock) {
        debugWindowContent.scrollTop = debugWindowContent.scrollHeight;
      }
    }
  }
  let divWindow = document.createElement('div');
  divWindow.id = 'fp-debugwindow';
  let divGrid = document.createElement('div');
  divGrid.id = 'fp-debugwindow-grid';
  let divMenu = document.createElement('div');
  divMenu.id = 'fp-debugwindow-menu';
  let pClock = document.createElement('p');
  pClock.id = 'fp-debugwindow-clock';
  pClock.style.display = 'inline-block';
  pClock.textContent = 'xx:xx.xx';
  divMenu.appendChild(pClock);
  let divMinimize = document.createElement('div');
  divMinimize.className = 'fp-debugwindow-button';
  divMinimize.onclick = minimizeFPComponentsLog;
  divMinimize.textContent = 'Minimize';
  divMenu.appendChild(divMinimize);
  let divClear = document.createElement('div');
  divClear.className = 'fp-debugwindow-button';
  divClear.onclick = clearFPComponentsLog;
  divClear.textContent = 'Clear';
  divMenu.appendChild(divClear);
  let divGhost = document.createElement('div');
  divGhost.id = 'fp-debugwindow-ghostbutton';
  divGhost.className = 'fp-debugwindow-button';
  divGhost.onclick = ghostFPComponentsLog;
  divGhost.textContent = 'Ghost';
  divMenu.appendChild(divGhost);
  let divLock = document.createElement('div');
  divLock.id = 'fp-debugwindow-scrollbutton';
  divLock.className = 'fp-debugwindow-button';
  divLock.onclick = lockScrollFPComponentsLog;
  divLock.textContent = 'Lock scroll';
  divMenu.appendChild(divLock);
  let divCmd = document.createElement('div');
  divCmd.id = 'fp-debugwindow-cmdbutton';
  divCmd.className = 'fp-debugwindow-button';
  divCmd.onclick = cmdFPComponentsLog;
  divCmd.textContent = 'New command';
  divMenu.appendChild(divCmd);
  let divCmdReuse = document.createElement('div');
  divCmdReuse.id = 'fp-debugwindow-cmdbuttonreuse';
  divCmdReuse.className = 'fp-debugwindow-button';
  divCmdReuse.onclick = () => cmdFPComponentsLog(true);
  divCmdReuse.textContent = 'Re-use command';
  divMenu.appendChild(divCmdReuse);
  divGrid.appendChild(divMenu);
  let divContent = document.createElement('div');
  divContent.id = 'fp-debugwindow-content';
  divGrid.appendChild(divContent);
  divWindow.appendChild(divGrid);
  let divBody = document.getElementsByTagName('body')[0];
  divBody.appendChild(divWindow);
  let divRaise = document.createElement('div');
  divRaise.id = 'fp-debugwindow-minimized';
  divRaise.onclick = raiseFPComponentsLog;
  divBody.appendChild(divRaise);
  updateClock();
  if (
    ('external' in window && 'notify' in window.external) ||
    ('chrome' in window && 'webview' in window.chrome && 'postMessage' in window.chrome.webview)
  ) {
    function format(messages) {
      return messages
        .map((message) => {
          if (typeof message === 'object') {
            return JSON.stringify(message);
          } else {
            return message;
          }
        })
        .join(' ');
    }
    let originalConsoleLog = console.log;
    console.log = (...messages) => {
      logToDebugWindow(format(messages), NORMAL);
      originalConsoleLog.apply(console, messages);
    };
    let originalConsoleInfo = console.info;
    console.info = (...messages) => {
      logToDebugWindow(format(messages), INFO);
      originalConsoleInfo.apply(console, messages);
    };
    let originalConsoleWarn = console.warn;
    console.warn = (...messages) => {
      logToDebugWindow(format(messages), WARN);
      originalConsoleWarn.apply(console, messages);
    };
    let originalConsoleError = console.error;
    console.error = (...messages) => {
      logToDebugWindow(format(messages), ERROR);
      originalConsoleError.apply(console, messages);
    };
  } else {
    logToDebugWindow(
      "Not running in embedded browser. Please open the browser's JavaScript console to see log messages or to enter commmands.",
    );
  }
  window.addEventListener('error', (e) => {
    console.error(e.filename + ' (' + e.lineno + ':' + e.colno + '): ' + e.message);
  });
}

function ghostFPComponentsLog() {
  let debugWindow = document.getElementById('fp-debugwindow');
  if (debugWindow !== null) {
    debugWindow.style.opacity = '0.5';
    debugWindow.style.pointerEvents = 'none';
    let ghostButton = document.getElementById('fp-debugwindow-ghostbutton');
    ghostButton.textContent = 'Solid';
    ghostButton.onclick = solidFPComponentsLog;
  }
}

function solidFPComponentsLog() {
  let debugWindow = document.getElementById('fp-debugwindow');
  if (debugWindow !== null) {
    debugWindow.style.opacity = '1';
    debugWindow.style.pointerEvents = 'all';
    let ghostButton = document.getElementById('fp-debugwindow-ghostbutton');
    ghostButton.textContent = 'Ghost';
    ghostButton.onclick = ghostFPComponentsLog;
  }
}

function lockScrollFPComponentsLog() {
  let debugWindow = document.getElementById('fp-debugwindow');
  if (debugWindow !== null) {
    __fpComponentsDebugWindowLock = true;
    let scrollButton = document.getElementById('fp-debugwindow-scrollbutton');
    scrollButton.textContent = 'Auto-scroll';
    scrollButton.onclick = autoScrollFPComponentsLog;
  }
}

function autoScrollFPComponentsLog() {
  let debugWindow = document.getElementById('fp-debugwindow');
  if (debugWindow !== null) {
    __fpComponentsDebugWindowLock = false;
    let scrollButton = document.getElementById('fp-debugwindow-scrollbutton');
    scrollButton.textContent = 'Lock scroll';
    scrollButton.onclick = lockScrollFPComponentsLog;
  }
}

function clearFPComponentsLog() {
  let debugWindowContent = document.getElementById('fp-debugwindow-content');
  if (debugWindowContent !== null) {
    while (debugWindowContent.firstChild) {
      debugWindowContent.removeChild(debugWindowContent.firstChild);
    }
  }
}

function raiseFPComponentsLog() {
  let debugWindow = document.getElementById('fp-debugwindow');
  if (debugWindow !== null) debugWindow.style.display = 'block';
  let debugWindowMinimized = document.getElementById('fp-debugwindow-minimized');
  if (debugWindowMinimized !== null) debugWindowMinimized.style.display = 'none';
}

function minimizeFPComponentsLog() {
  let debugWindow = document.getElementById('fp-debugwindow');
  if (debugWindow !== null) debugWindow.style.display = 'none';
  let debugWindowMinimized = document.getElementById('fp-debugwindow-minimized');
  if (debugWindowMinimized !== null) debugWindowMinimized.style.display = 'block';
}

function cmdFPComponentsLog(reuse = false) {
  minimizeFPComponentsLog();
  fpComponentsKeyboardShow(
    async (cmd) => {
      function logErr(msg, msgJSON, e) {
        console.error(`${msg} ${e}`);
        if (typeof e !== 'string' && typeof e !== 'number') {
          console.error(`${msgJSON} ${JSON.stringify(e)}`);
        }
      }
      if (cmd) {
        console.log(`Executing: ${cmd}`);
        __fpComponentsDebugWindowCmd = cmd;
        try {
          let value = eval(cmd);
          console.log(`Return value: ${value}`);
          if (value && typeof value.then === 'function') {
            value
              .then((asyncValue) => {
                console.log(`Async return value: ${asyncValue}`);
                console.log(`Async return value type: ${typeof asyncValue}`);
                if (typeof asyncValue !== 'string' && typeof asyncValue !== 'number') {
                  console.log(`Return value as JSON: ${JSON.stringify(asyncValue)}`);
                }
                window.r = asyncValue;
                console.log("Async response value saved in global variable 'r'");
              })
              .catch((e) => {
                logErr('Async operation was rejected. Message:', 'Rejection message as JSON:', e);
              });
          } else {
            console.log(`Return value type: ${typeof value}`);
            if (typeof value !== 'string' && typeof value !== 'number') {
              console.log(`Return value as JSON: ${JSON.stringify(value)}`);
            }
            window.r = value;
            console.log("Response value saved in global variable 'r'");
          }
        } catch (e) {
          logErr('Exception:', 'Exception as JSON:', e);
        }
      }
      raiseFPComponentsLog();
    },
    reuse === true ? __fpComponentsDebugWindowCmd : null,
    "Enter a JavaScript expression, result will be stored in global variable 'r'",
  );
}

// App SDK 1.5.0

// Copyright (c) 2020-2024 ABB

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software (the "Software"), to deal in the Software without
// restriction, including without limitation the rights to use, copy, modify,
// merge, publish, distribute, sublicense, and/or sell copies of the Software,
// and to permit persons to whom the Software is furnished to do so, subject to
// the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// The manuals related to the Software and the information therein are not
// included in these permissions and must not be reproduced, distributed,
// copied, or disclosed to third parties without ABB's written permission.
// ABB reserves all rights regarding Intellectual Property Rights in such
// manuals and information therein.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.

('use strict');

// fpComponentsLoadCSS("fp-components/fp-components-contextmenu-a.css");

var FPComponents = FPComponents || {};

(function (o) {
  if (!o.hasOwnProperty('Contextmenu_A')) {
    o.Contextmenu_A = class {
      constructor() {
        this._anchor = null;
        this._root = null;
        this._buttonDiv = null;
        this._backgroundHitAreaDiv = null;
        this._popupMenuDiv = null;
        this._model = {
          content: [],
        };
        this._enabled = true;
      }
      get parent() {
        return this._anchor;
      }
      get model() {
        return this._model;
      }
      set model(m) {
        this._model = m;
        this._createMenuFromModel();
      }
      get enabled() {
        return this._enabled;
      }
      set enabled(e) {
        this._enabled = e ? true : false;
        this._updateClassNames();
        if (!this._enabled) {
          this.hide();
        }
      }
      _createMenuFromModel() {
        let menuDiv = this._popupMenuDiv;
        if (menuDiv !== null) {
          while (menuDiv.firstChild) {
            menuDiv.removeChild(menuDiv.firstChild);
          }
        }
        if (this._model == null || typeof this._model !== 'object' || !Array.isArray(this._model.content)) {
          throw 'Bad model format';
        }
        function div() {
          return document.createElement('div');
        }
        let atLeastOneIcon = false;
        if (menuDiv !== null) {
          for (const e of this._model.content) {
            if (e !== null && typeof e == 'object') {
              if (e.type === 'button') {
                let outerdiv = div();
                let icondiv = div();
                let textdiv = div();
                if (e.enabled === undefined || e.enabled == true) {
                  outerdiv.className = 'fp-components-context-button';
                } else {
                  outerdiv.className = 'fp-components-context-button fp-components-context-button-disabled';
                }
                outerdiv.appendChild(icondiv);
                outerdiv.appendChild(textdiv);
                if (e.icon !== undefined) {
                  icondiv.style.backgroundImage = `url("${e.icon}")`;
                  atLeastOneIcon = true;
                }
                if (e.label !== undefined) {
                  textdiv.textContent = e.label;
                }
                if (e.enabled === undefined || e.enabled == true) {
                  outerdiv.onclick = () => {
                    this._backgroundHitAreaDiv.style.display = null;
                    this._popupMenuDiv.style.display = null;
                    if (typeof e.onclick === 'function') {
                      e.onclick();
                    }
                  };
                }
                menuDiv.appendChild(outerdiv);
              } else if (e.type === 'label') {
                let outerdiv = div();
                let textdiv = div();
                let dotline = div();
                outerdiv.className = 'fp-components-context-label';
                outerdiv.appendChild(textdiv);
                outerdiv.appendChild(dotline);
                if (e.label !== undefined) {
                  textdiv.textContent = e.label;
                }
                menuDiv.appendChild(outerdiv);
              } else if (e.type === 'gap') {
                let gapdiv = div();
                let linediv = div();
                gapdiv.className = 'fp-components-context-gap';
                menuDiv.appendChild(gapdiv);
                gapdiv.appendChild(linediv);
              }
            }
          }
          if (!atLeastOneIcon) {
            let icons = menuDiv.querySelectorAll('.fp-components-context-button > :nth-child(1)');
            for (let i of icons) {
              i.style.display = 'none';
            }
          }
        }
      }
      show() {
        if (this._root !== null) {
          let body = document.getElementsByTagName('body')[0];
          body.appendChild(this._backgroundHitAreaDiv);
          body.appendChild(this._popupMenuDiv);
          let popupMenuDiv = this._popupMenuDiv;
          let buttonDiv = this._buttonDiv;
          this._backgroundHitAreaDiv.style.display = 'block';
          popupMenuDiv.style.display = 'block';
          let buttonBcr = buttonDiv.getBoundingClientRect();
          function setTop(t) {
            popupMenuDiv.style.top = t + 'px';
          }
          let top = buttonBcr.top;
          top += 48;
          setTop(top);
          let popupMenuBcr = popupMenuDiv.getBoundingClientRect();
          let distanceFromBottom = window.innerHeight - popupMenuBcr.bottom;
          if (distanceFromBottom < 30) {
            top -= 31 - distanceFromBottom;
            setTop(top);
          }
          popupMenuBcr = popupMenuDiv.getBoundingClientRect();
          let distanceFromTop = popupMenuBcr.top;
          if (distanceFromTop < 30) {
            top += 31 - distanceFromTop;
            setTop(top);
          }
          function setLeft(t) {
            popupMenuDiv.style.left = t + 'px';
          }
          let left = buttonBcr.left;
          left += 0 - popupMenuDiv.offsetWidth / 2 + buttonDiv.offsetWidth / 2;
          setLeft(left);
          popupMenuBcr = popupMenuDiv.getBoundingClientRect();
          let distancefromLeft = popupMenuBcr.left;
          if (distancefromLeft < 30) {
            left += 31 - distancefromLeft;
            setLeft(left);
          }
          popupMenuBcr = popupMenuDiv.getBoundingClientRect();
          let distancefromRight = window.innerWidth - popupMenuBcr.right;
          if (distancefromRight < 30) {
            left -= 31 - distancefromRight;
            setLeft(left);
          }
        }
      }
      hide() {
        if (this._root !== null) {
          let body = document.getElementsByTagName('body')[0];
          try {
            body.removeChild(this._popupMenuDiv);
            body.removeChild(this._backgroundHitAreaDiv);
          } catch (e) {}
          this._backgroundHitAreaDiv.style.display = null;
          this._popupMenuDiv.style.display = null;
        }
      }
      _updateClassNames() {
        if (this._root !== null) {
          this._root.className = 'fp-components-base fp-components-context';
          if (this._enabled) {
            this._buttonDiv.className = 'fp-components-context-basebutton';
          } else {
            this._buttonDiv.className = 'fp-components-context-basebutton fp-components-context-basebutton-disabled';
          }
        }
      }
      attachToId(nodeId) {
        let element = document.getElementById(nodeId);
        if (element === null) {
          console.log('Could not find element with id: ' + nodeId);
          return false;
        }
        return this.attachToElement(element);
      }
      attachToElement(element) {
        this._anchor = element;
        return this.rebuild();
      }
      rebuild() {
        function div() {
          return document.createElement('div');
        }
        let wrapperDiv = div();
        let buttonDiv = div();
        let backgroundHitAreaDiv = div();
        let popupMenuDiv = div();
        wrapperDiv.appendChild(buttonDiv);
        backgroundHitAreaDiv.classList.add('fp-components-context-menu-background');
        popupMenuDiv.classList.add('fp-components-context-menu');
        this._root = wrapperDiv;
        this._buttonDiv = buttonDiv;
        this._backgroundHitAreaDiv = backgroundHitAreaDiv;
        this._popupMenuDiv = popupMenuDiv;
        buttonDiv.onclick = () => {
          if (this._enabled) {
            this.show();
          }
        };
        backgroundHitAreaDiv.onmousedown = () => {
          this.hide();
        };
        this._updateClassNames();
        this._anchor.appendChild(wrapperDiv);
        if (this._model !== null) {
          this._createMenuFromModel();
        }
      }
    };
    o.Contextmenu_A.VERSION = '1.5.0';
  }
})(FPComponents);

// App SDK 1.5.0

// Copyright (c) 2020-2024 ABB

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software (the "Software"), to deal in the Software without
// restriction, including without limitation the rights to use, copy, modify,
// merge, publish, distribute, sublicense, and/or sell copies of the Software,
// and to permit persons to whom the Software is furnished to do so, subject to
// the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// The manuals related to the Software and the information therein are not
// included in these permissions and must not be reproduced, distributed,
// copied, or disclosed to third parties without ABB's written permission.
// ABB reserves all rights regarding Intellectual Property Rights in such
// manuals and information therein.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.

('use strict');

// fpComponentsLoadCSS("fp-components/fp-components-digital-a.css");

var FPComponents = FPComponents || {};

(function (o) {
  if (!o.hasOwnProperty('Digital_A')) {
    o.Digital_A = class {
      constructor() {
        this._anchor = null;
        this._root = null;
        this._onclick = null;
        this._active = false;
        this._desc = null;
        this._descDiv = null;
      }
      get parent() {
        return this._anchor;
      }
      get onclick() {
        return this._onclick;
      }
      set onclick(f) {
        this._onclick = f;
      }
      get active() {
        return this._active;
      }
      set active(a) {
        this._active = a == true;
        if (this._root !== null) {
          this._root.textContent = this._active ? '1' : '0';
        }
        this._updateClassNames();
      }
      get desc() {
        return this._desc;
      }
      set desc(d) {
        this._desc = d;
        if (this._container == null) {
          return;
        }
        if (!d) {
          if (this._descDiv !== null) {
            this._container.removeChild(this._descDiv);
          }
          this._descDiv = null;
          return;
        }
        if (this._descDiv === null) {
          this._createDesc();
          return;
        }
        this._descDiv.textContent = d;
      }
      _createDesc() {
        let descDiv = document.createElement('div');
        descDiv.className = 'fp-components-digital-a-desc';
        descDiv.textContent = this._desc;
        this._container.appendChild(descDiv);
        this._descDiv = descDiv;
      }
      _updateClassNames() {
        if (this._root !== null) {
          this._root.className = 'fp-components-digital-a';
          if (this._active) {
            this._root.className += ' fp-components-digital-a-active';
          }
        }
      }
      attachToId(nodeId) {
        let element = document.getElementById(nodeId);
        if (element === null) {
          console.log('Could not find element with id: ' + nodeId);
          return false;
        }
        return this.attachToElement(element);
      }
      attachToElement(element) {
        this._anchor = element;
        return this.rebuild();
      }
      rebuild() {
        let divContainer = document.createElement('div');
        let divIndicator = document.createElement('div');
        divContainer.className = 'fp-components-digital-a-container';
        divIndicator.textContent = this._active ? '1' : '0';
        divContainer.onclick = () => {
          if (this._onclick !== null) {
            this._onclick();
          }
        };
        divContainer.appendChild(divIndicator);
        this._container = divContainer;
        this._root = divIndicator;
        if (this._desc !== null) {
          this._createDesc();
        }
        this._updateClassNames();
        this._anchor.appendChild(divContainer);
      }
    };
    o.Digital_A.VERSION = '1.5.0';
  }
})(FPComponents);

// App SDK 1.5.0

// Copyright (c) 2020-2024 ABB

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software (the "Software"), to deal in the Software without
// restriction, including without limitation the rights to use, copy, modify,
// merge, publish, distribute, sublicense, and/or sell copies of the Software,
// and to permit persons to whom the Software is furnished to do so, subject to
// the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// The manuals related to the Software and the information therein are not
// included in these permissions and must not be reproduced, distributed,
// copied, or disclosed to third parties without ABB's written permission.
// ABB reserves all rights regarding Intellectual Property Rights in such
// manuals and information therein.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.

('use strict');

// fpComponentsLoadCSS("fp-components/fp-components-dropdown-a.css");

var FPComponents = FPComponents || {};

(function (o) {
  if (!o.hasOwnProperty('Dropdown_A')) {
    o.Dropdown_A = class {
      constructor() {
        this._leftTruncate = false;
        this._anchor = null;
        this._root = null;
        this._descDiv = null;
        this._container = null;
        this._canvasArrow = null;
        this._onselection = null;
        this._enabled = true;
        this.model = {
          items: [],
        };
        this._selected = null;
        this._desc = null;
        this._divOverlay = null;
        this._divMenu = null;
      }
      get parent() {
        return this._anchor;
      }
      get onselection() {
        return this._onselection;
      }
      set onselection(f) {
        this._onselection = f;
      }
      get enabled() {
        return this._enabled;
      }
      set enabled(e) {
        this._enabled = e ? true : false;
        this._updateClassNames();
        if (this._root !== null && !this._enabled) {
          this._hide();
        }
      }
      get model() {
        return this._model;
      }
      set model(m) {
        this._model = m;
        this.rebuild();
      }
      get desc() {
        return this._desc;
      }
      set desc(l) {
        this._desc = l;
        if (this._container === null) {
          return;
        }
        if (!l) {
          if (this._descDiv !== null) {
            this._container.removeChild(this._descDiv);
          }
          this._descDiv = null;
          return;
        }
        if (this._descDiv === null) {
          this._createDesc();
          return;
        }
        this._descDiv.textContent = l;
      }
      get leftTruncate() {
        return this._leftTruncate;
      }
      set leftTruncate(b) {
        this._leftTruncate = b;
        this.rebuild();
      }
      get selected() {
        return this._selected;
      }
      set selected(s) {
        if (s !== null) {
          if (typeof s !== 'number' || s < 0) {
            console.log('Dropdown selection must be an index number');
            return;
          }
        }
        this._selected = s;
        if (this._root !== null) {
          if (this._divMenu !== null && this._divMenu !== undefined) {
            let items = this._divMenu.getElementsByTagName('p');
            for (let i = 0; i < items.length; i++) {
              if (s === null || s != i) {
                items[i].style.backgroundColor = null;
                items[i].style.color = null;
              } else {
                items[i].style.backgroundColor = 'var(--fp-color-BLUE-60)';
                items[i].style.color = 'var(--fp-color-WHITE)';
              }
            }
          }
          if (this._model === null) {
            this._root.getElementsByTagName('p')[0].innerHTML = '&nbsp;';
          } else {
            if (s !== null && this._model.items !== undefined && this._model.items.length >= s + 1) {
              let text = this._model.items[s].toString();
              if (this._leftTruncate) {
                text = text.split('').reverse().join('');
              }
              this._root.getElementsByTagName('p')[0].textContent = text;
            } else {
              this._root.getElementsByTagName('p')[0].innerHTML = '&nbsp;';
            }
          }
        }
      }
      _createDesc() {
        let divdesc = document.createElement('span');
        divdesc.textContent = this._desc;
        divdesc.className = 'fp-components-dropdown-desc';
        this._container.prepend(divdesc);
        this._descDiv = divdesc;
      }
      _updateClassNames() {
        if (this._root !== null) {
          if (this._enabled) {
            this._root.className = 'fp-components-dropdown';
          } else {
            this._root.className = 'fp-components-dropdown fp-components-dropdown-disabled';
          }
        }
      }
      attachToId(nodeId) {
        let element = document.getElementById(nodeId);
        if (element === null) {
          console.log('Could not find element with id: ' + nodeId);
          return false;
        }
        return this.attachToElement(element);
      }
      attachToElement(element) {
        this._anchor = element;
        return this.rebuild();
      }
      _drawArrow() {
        if (this._canvasArrow !== null) {
          let ctx = this._canvasArrow.getContext('2d');
          ctx.clearRect(0, 0, this._canvasArrow.width, this._canvasArrow.height);
          ctx.beginPath();
          ctx.moveTo(2, 3);
          ctx.lineTo(7, 8);
          ctx.lineTo(12, 3);
          ctx.strokeStyle = this._enabled ? '#333333' : '#999999';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }
      _hide() {
        try {
          document.body.removeChild(this._divMenu);
        } catch (elementNotFound) {}
        try {
          document.body.removeChild(this._divOverlay);
        } catch (elementNotFound) {}
      }
      _show() {
        let divBox = this._root;
        this.selected = this.selected;
        this._divMenu.style.minWidth = `${divBox.offsetWidth}px`;
        document.body.appendChild(this._divOverlay);
        document.body.appendChild(this._divMenu);
        let bcrBox = divBox.getBoundingClientRect();
        let top = bcrBox.top - this._divMenu.offsetHeight / 2 + divBox.offsetHeight / 2;
        this._divMenu.style.top = top + 'px';
        let left = bcrBox.left;
        this._divMenu.style.left = left + 'px';
        let bcr = this._divMenu.getBoundingClientRect();
        let distanceFromBottom = window.innerHeight - bcr.bottom;
        if (distanceFromBottom < 30) {
          top -= 31 - distanceFromBottom;
          this._divMenu.style.top = top + 'px';
        }
        bcr = this._divMenu.getBoundingClientRect();
        let distanceFromTop = bcr.top;
        if (distanceFromTop < 30) {
          top += 31 - distanceFromTop;
          this._divMenu.style.top = top + 'px';
        }
        bcr = this._divMenu.getBoundingClientRect();
        distanceFromBottom = window.innerHeight - bcr.bottom;
        if (distanceFromBottom < 30) {
          this._divMenu.style.maxHeight = window.innerHeight - 70 + 'px';
        }
        if (typeof this._selected === 'number') {
          this._divMenu.scrollTop =
            this._divMenu.children[this._selected].offsetTop -
            (this._divMenu.offsetHeight / 2 - this._divMenu.children[this._selected].offsetHeight / 2);
        }
      }
      rebuild() {
        if (this._model === null || this._anchor === null) {
          return false;
        }
        while (this._anchor.firstChild) {
          this._anchor.removeChild(this._anchor.firstChild);
        }
        this._canvasArrow = document.createElement('canvas');
        let divContainer = document.createElement('div');
        divContainer.className = 'fp-components-dropdown-container';
        let divBox = document.createElement('div');
        let pBox = document.createElement('p');
        this._divMenu = document.createElement('div');
        this._divMenu.className = 'fp-components-dropdown-menu';
        this._divOverlay = document.createElement('div');
        this._divOverlay.className = 'fp-components-dropdown-overlay';
        this._divOverlay.onclick = (e) => {
          e.stopPropagation();
          this._hide();
        };
        let items = this._model.items;
        if (items !== undefined && Array.isArray(items)) {
          for (let i = 0; i < items.length; i++) {
            let item = items[i];
            let pItem = document.createElement('p');
            pItem.textContent = item.toString();
            pItem.onclick = (e) => {
              e.stopPropagation();
              this._hide();
              if (!this._enabled) {
                return;
              }
              this.selected = i;
              if (typeof this._onselection === 'function') {
                this._onselection(i, item);
              }
            };
            this._divMenu.appendChild(pItem);
          }
        }
        divBox.onclick = () => {
          if (this._enabled) {
            this._show();
          }
        };
        if (this._leftTruncate) {
          pBox.className = 'fp-components-dropdown-selected-truncate-left';
        } else {
          pBox.className = 'fp-components-dropdown-selected-truncate-right';
        }
        divBox.appendChild(pBox);
        this._canvasArrow.height = 12;
        this._canvasArrow.width = 15;
        this._drawArrow();
        divBox.appendChild(this._canvasArrow);
        divContainer.appendChild(divBox);
        this._root = divBox;
        this._container = divContainer;
        if (this._desc) {
          this._createDesc();
        }
        this._updateClassNames();
        this._anchor.appendChild(divContainer);
        this.selected = this._selected;
        return true;
      }
    };
    o.Dropdown_A.VERSION = '1.5.0';
  }
})(FPComponents);

// App SDK 1.5.0

// Copyright (c) 2020-2024 ABB

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software (the "Software"), to deal in the Software without
// restriction, including without limitation the rights to use, copy, modify,
// merge, publish, distribute, sublicense, and/or sell copies of the Software,
// and to permit persons to whom the Software is furnished to do so, subject to
// the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// The manuals related to the Software and the information therein are not
// included in these permissions and must not be reproduced, distributed,
// copied, or disclosed to third parties without ABB's written permission.
// ABB reserves all rights regarding Intellectual Property Rights in such
// manuals and information therein.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.

('use strict');

// fpComponentsLoadCSS("fp-components/fp-components-Filesystemdialog-a.css");

var FPComponents = FPComponents || {};

(function (o) {
  if (!o.hasOwnProperty('Filesystemdialog_A')) {
    o.Filesystemdialog_A = class {
      constructor() {}
      static select(
        selectionMode = `${FPComponents.Filesystemdialog_A.SelectionMode.Single}`,
        fileSystemObjectType = `${FPComponents.Filesystemdialog_A.FileSystemObjectType.File}`,
        textHeading = null,
        validFileEndings = null,
        defaultFolderPath = `${FPComponents.Filesystemdialog_A.ROOT_FOLDER_HOME}`,
      ) {
        if (
          selectionMode !== `${FPComponents.Filesystemdialog_A.SelectionMode.Single}` &&
          selectionMode !== `${FPComponents.Filesystemdialog_A.SelectionMode.Multi}`
        ) {
          throw new Error("FpComponents.Filesystemdialog_A.select() - Argument: 'selectionMode' is invalid");
        }
        if (
          fileSystemObjectType !== `${FPComponents.Filesystemdialog_A.FileSystemObjectType.File}` &&
          fileSystemObjectType !== `${FPComponents.Filesystemdialog_A.FileSystemObjectType.Folder}`
        ) {
          throw new Error("FpComponents.Filesystemdialog_A.select() - Argument: 'fileSystemObjectType' is invalid.");
        }
        return new Promise(async (resolve, reject) => {
          let bgDiv;
          let dialogHeading;
          let rootFolderDivs = [];
          let dropDownSort;
          let btnParent;
          let btnRefresh;
          let btnFolderSelectDiv;
          let btnFolderSelect;
          let pathBreadCrumbsDiv;
          let folderContentTable;
          let selectionLabelDiv;
          let selectionCountDiv;
          let selectionNameDiv;
          let btnCancel;
          let btnConfirm;
          let selectionDropdown;
          let currentFolderPath = `${FPComponents.Filesystemdialog_A.ROOT_FOLDER_HOME}`;
          let multiSelectFolders = false;
          let prevSelectedSortIndex = -1;
          let fullPathSingleSelect = '';
          createConstantDom();
          createDynamicDom();
          setupCommonEventListeners();
          updateSelectionStates();
          await updateCurrentFolder(currentFolderPath);
          await updateCurrentFolder(defaultFolderPath);
          btnCancel.onclick = () => {
            resolve(null);
            bgDiv.remove();
          };
          btnConfirm.onclick = () => {
            if (selectionMode === `${FPComponents.Filesystemdialog_A.SelectionMode.Multi}`) {
              resolve(selectionDropdown.model.items);
            } else {
              resolve([fullPathSingleSelect]);
            }
            bgDiv.remove();
          };
          function createConstantDom() {
            bgDiv = document.createElement('div');
            bgDiv.className = 'fp-components-filesystemdialog-bg';
            bgDiv.style.display = 'flex';
            let mainDiv = document.createElement('div');
            mainDiv.className = 'fp-components-filesystemdialog-main';
            let topDiv = document.createElement('div');
            topDiv.className = 'fp-components-filesystemdialog-top';
            dialogHeading = document.createElement('div');
            dialogHeading.className = 'fp-components-filesystemdialog-heading';
            let midDiv = document.createElement('div');
            midDiv.className = 'fp-components-filesystemdialog-mid';
            let midLeftDiv = document.createElement('div');
            midLeftDiv.className = 'fp-components-filesystemdialog-mid-left';
            let rootFoldersDiv = document.createElement('div');
            rootFoldersDiv.className = 'fp-components-filesystemdialog-root-folder';
            let rootFolderTopicDiv = document.createElement('div');
            rootFolderTopicDiv.className = 'fp-components-filesystemdialog-root-folder-topic';
            rootFolderTopicDiv.textContent = 'Root folders';
            let rootFolderListDiv = document.createElement('div');
            rootFolderListDiv.className = 'fp-components-filesystemdialog-root-folder-list';
            let rootFolderHomeIcon = document.createElement('img');
            rootFolderHomeIcon.src = 'vendor/fp-components/img/folder.png'; // Use absolute path instead of './', or the image cannot be found
            rootFolderHomeIcon.className = 'fp-components-filesystemdialog-root-folder-icon';
            let rootFolderHomeDiv = document.createElement('div');
            rootFolderHomeDiv.className = 'fp-components-filesystemdialog-root-folder-list-item';
            let rootFolderHomeLabel = document.createElement('div');
            rootFolderHomeLabel.className = 'fp-components-filesystemdialog-root-folder-label';
            rootFolderHomeLabel.textContent = 'HOME';
            rootFolderHomeDiv.appendChild(rootFolderHomeIcon);
            rootFolderHomeDiv.appendChild(rootFolderHomeLabel);
            let rootFolderTempIcon = document.createElement('img');
            rootFolderTempIcon.src = 'vendor/fp-components/img/folder.png';
            rootFolderTempIcon.className = 'fp-components-filesystemdialog-root-folder-icon';
            let rootFolderTempDiv = document.createElement('div');
            rootFolderTempDiv.className = 'fp-components-filesystemdialog-root-folder-list-item';
            let rootFolderTempLabel = document.createElement('div');
            rootFolderTempLabel.className = 'fp-components-filesystemdialog-root-folder-label';
            rootFolderTempLabel.textContent = 'TEMP';
            rootFolderTempDiv.appendChild(rootFolderTempIcon);
            rootFolderTempDiv.appendChild(rootFolderTempLabel);
            let rootFolderBackupIcon = document.createElement('img');
            rootFolderBackupIcon.src = 'vendor/fp-components/img/folder.png';
            rootFolderBackupIcon.className = 'fp-components-filesystemdialog-root-folder-icon';
            let rootFolderBackupDiv = document.createElement('div');
            rootFolderBackupDiv.className = 'fp-components-filesystemdialog-root-folder-list-item';
            let rootFolderBackupLabel = document.createElement('div');
            rootFolderBackupLabel.className = 'fp-components-filesystemdialog-root-folder-label';
            rootFolderBackupLabel.textContent = 'BACKUP';
            rootFolderBackupDiv.appendChild(rootFolderBackupIcon);
            rootFolderBackupDiv.appendChild(rootFolderBackupLabel);
            let midRightDiv = document.createElement('div');
            midRightDiv.className = 'fp-components-filesystemdialog-mid-right';
            let navigationDiv = document.createElement('div');
            navigationDiv.className = 'fp-components-filesystemdialog-navigation';
            let dropDownSortDiv = document.createElement('div');
            dropDownSortDiv.className = 'fp-components-filesystemdialog-sort';
            dropDownSort = new FPComponents.Dropdown_A();
            dropDownSort.attachToElement(dropDownSortDiv);
            dropDownSort.selected = 0;
            prevSelectedSortIndex = -1;
            dropDownSort.model = {
              items: ['Name', 'Byte size', 'Created', 'Modified'],
            };
            let btnParentDiv = document.createElement('div');
            btnParentDiv.className = 'fp-components-filesystemdialog-navigation-button';
            btnParent = new FPComponents.Button_A();
            btnParent.text = 'Navigate up';
            btnParent.attachToElement(btnParentDiv);
            let btnRefreshDiv = document.createElement('div');
            btnRefreshDiv.className = 'fp-components-filesystemdialog-navigation-button';
            btnRefresh = new FPComponents.Button_A();
            btnRefresh.text = 'Refresh';
            btnRefresh.attachToElement(btnRefreshDiv);
            btnFolderSelectDiv = document.createElement('div');
            btnFolderSelectDiv.className = 'fp-components-filesystemdialog-navigation-button';
            btnFolderSelect = new FPComponents.Button_A();
            btnFolderSelect.text = 'Select folders';
            btnFolderSelect.attachToElement(btnFolderSelectDiv);
            pathBreadCrumbsDiv = document.createElement('div');
            pathBreadCrumbsDiv.className = 'fp-components-filesystemdialog-navigation-breadcrumbs';
            let tableScrollDiv = document.createElement('div');
            tableScrollDiv.className = 'fp-components-filesystemdialog-table-scroll';
            folderContentTable = document.createElement('table');
            folderContentTable.className = 'fp-components-filesystemdialog-folder-content';
            let botDiv = document.createElement('div');
            botDiv.className = 'fp-components-filesystemdialog-bot';
            let selectionDiv = document.createElement('div');
            selectionDiv.className = 'fp-components-filesystemdialog-file-selection';
            selectionLabelDiv = document.createElement('div');
            selectionLabelDiv.className = 'fp-components-filesystemdialog-file-selection-label';
            selectionLabelDiv.textContent = 'Selected file:';
            selectionCountDiv = document.createElement('div');
            selectionCountDiv.className = 'fp-components-filesystemdialog-file-selection-count';
            selectionCountDiv.textContent = '[0]';
            selectionNameDiv = document.createElement('div');
            let mainButtonDiv = document.createElement('div');
            mainButtonDiv.className = 'fp-components-filesystemdialog-buttons';
            let btnConfirmDiv = document.createElement('div');
            btnConfirmDiv.className = 'fp-components-filesystemdialog-button';
            btnConfirm = new FPComponents.Button_A();
            btnConfirm.text = 'Confirm';
            btnConfirm.highlight = true;
            btnConfirm.attachToElement(btnConfirmDiv);
            btnConfirm.enabled = false;
            let btnCancelDiv = document.createElement('div');
            btnCancelDiv.className = 'fp-components-filesystemdialog-button';
            btnCancel = new FPComponents.Button_A();
            btnCancel.text = 'Cancel';
            btnCancel.attachToElement(btnCancelDiv);
            rootFolderDivs = [];
            rootFolderDivs.push(rootFolderHomeDiv);
            rootFolderDivs.push(rootFolderTempDiv);
            rootFolderDivs.push(rootFolderBackupDiv);
            multiSelectFolders = false;
            document.body.appendChild(bgDiv);
            bgDiv.appendChild(mainDiv);
            mainDiv.appendChild(topDiv);
            topDiv.appendChild(dialogHeading);
            mainDiv.appendChild(pathBreadCrumbsDiv);
            mainDiv.appendChild(midDiv);
            midDiv.appendChild(midLeftDiv);
            midLeftDiv.appendChild(rootFoldersDiv);
            rootFoldersDiv.appendChild(rootFolderTopicDiv);
            rootFoldersDiv.appendChild(rootFolderListDiv);
            rootFolderListDiv.appendChild(rootFolderHomeDiv);
            rootFolderListDiv.appendChild(rootFolderTempDiv);
            rootFolderListDiv.appendChild(rootFolderBackupDiv);
            midDiv.appendChild(midRightDiv);
            midRightDiv.appendChild(navigationDiv);
            navigationDiv.appendChild(dropDownSortDiv);
            navigationDiv.appendChild(btnParentDiv);
            navigationDiv.appendChild(btnRefreshDiv);
            navigationDiv.appendChild(btnFolderSelectDiv);
            tableScrollDiv.appendChild(folderContentTable);
            midRightDiv.appendChild(tableScrollDiv);
            mainDiv.appendChild(botDiv);
            botDiv.appendChild(selectionLabelDiv);
            botDiv.appendChild(selectionCountDiv);
            botDiv.appendChild(selectionNameDiv);
            botDiv.appendChild(mainButtonDiv);
            mainButtonDiv.appendChild(btnCancelDiv);
            mainButtonDiv.appendChild(btnConfirmDiv);
          }
          function createDynamicDom() {
            btnFolderSelectDiv.style.display = 'none';
            if (selectionMode === `${FPComponents.Filesystemdialog_A.SelectionMode.Multi}`) {
              selectionNameDiv.className = 'fp-components-filesystemdialog-selection-name-dropdown';
              selectionDropdown = new FPComponents.Dropdown_A();
              selectionDropdown.attachToElement(selectionNameDiv);
              selectionDropdown.model = {
                items: [],
              };
              selectionDropdown.leftTruncate = true;
            } else {
              selectionNameDiv.className = 'fp-components-filesystemdialog-selection-name-field';
            }
            if (fileSystemObjectType === `${FPComponents.Filesystemdialog_A.FileSystemObjectType.File}`) {
              if (selectionMode === `${FPComponents.Filesystemdialog_A.SelectionMode.Single}`) {
                textHeading === null
                  ? (dialogHeading.textContent = 'Select a file')
                  : (dialogHeading.textContent = textHeading);
                selectionLabelDiv.textContent = 'Selected file';
              } else {
                textHeading === null
                  ? (dialogHeading.textContent = 'Select files')
                  : (dialogHeading.textContent = textHeading);
                selectionLabelDiv.textContent = 'Selected files';
              }
            } else {
              if (selectionMode === `${FPComponents.Filesystemdialog_A.SelectionMode.Single}`) {
                textHeading === null
                  ? (dialogHeading.textContent = 'Select a folder')
                  : (dialogHeading.textContent = textHeading);
                selectionLabelDiv.textContent = 'Selected folder';
              } else {
                textHeading === null
                  ? (dialogHeading.textContent = 'Select folders')
                  : (dialogHeading.textContent = textHeading);
                selectionLabelDiv.textContent = 'Selected folders';
                btnFolderSelectDiv.style.display = 'block';
                btnFolderSelectDiv.style.width = '150px';
                btnFolderSelect.text = 'Enable selection';
                btnFolderSelect.onclick = () => {
                  multiSelectFolders = !multiSelectFolders;
                  if (multiSelectFolders) {
                    btnFolderSelect.text = 'Disable selection';
                  } else {
                    btnFolderSelect.text = 'Enable selection';
                  }
                };
              }
            }
          }
          function setupCommonEventListeners() {
            rootFolderDivs.forEach((clickedDiv) => {
              clickedDiv.onclick = async () => {
                if (multiSelectFolders) {
                  const rootFolderPath = '$' + clickedDiv.textContent;
                  if (clickedDiv.className.includes('fp-components-filesystemdialog-root-folder-list-item-active')) {
                    clickedDiv.className = 'fp-components-filesystemdialog-root-folder-list-item';
                    const index = selectionDropdown.model.items.indexOf(rootFolderPath);
                    if (index >= 0) {
                      selectionDropdown.model.items.splice(index, 1);
                    }
                    if (selectionDropdown.model.items.length > 0) {
                      selectionDropdown.selected = 0;
                    }
                  } else {
                    clickedDiv.className = 'fp-components-filesystemdialog-root-folder-list-item-active';
                    selected = true;
                    if (!selectionDropdown.model.items.includes(rootFolderPath)) {
                      selectionDropdown.model.items.push(rootFolderPath);
                      const index = selectionDropdown.model.items.indexOf(rootFolderPath);
                      selectionDropdown.selected = index;
                    }
                  }
                  selectionDropdown.model = selectionDropdown.model;
                  updateSelectionStates();
                } else {
                  switch (clickedDiv.textContent.toLowerCase()) {
                    case 'home':
                      await updateCurrentFolder(`${FPComponents.Filesystemdialog_A.ROOT_FOLDER_HOME}`);
                      break;

                    case 'temp':
                      await updateCurrentFolder(`${FPComponents.Filesystemdialog_A.ROOT_FOLDER_TEMP}`);
                      break;

                    case 'backup':
                      await updateCurrentFolder(`${FPComponents.Filesystemdialog_A.ROOT_FOLDER_BACKUP}`);
                      break;

                    default:
                      break;
                  }
                }
              };
            });
            dropDownSort.onselection = (selectedIndex, selectedText) => {
              sortFolderContent(selectedIndex, selectedText);
            };
            btnRefresh.onclick = async () => {
              await updateCurrentFolder();
            };
            btnParent.onclick = () => {
              navigateToParentFolder();
            };
            if (selectionMode === `${FPComponents.Filesystemdialog_A.SelectionMode.Multi}`) {
              selectionDropdown.onselection = async function (selectedIndex, selectedPath) {
                await navigateToFolder(selectedPath);
              };
            } else {
              selectionNameDiv.onclick = async function () {
                await navigateToFolder(fullPathSingleSelect);
              };
            }
          }
          function updateSelectionStates() {
            if (selectionMode === `${FPComponents.Filesystemdialog_A.SelectionMode.Single}`) {
              if (fullPathSingleSelect === null || fullPathSingleSelect === undefined) {
                fullPathSingleSelect = '';
              }
              if (fullPathSingleSelect.length < 1) {
                btnConfirm.enabled = false;
              } else {
                btnConfirm.enabled = true;
              }
              if (fullPathSingleSelect.length > 0) {
                selectionCountDiv.textContent = '[1]';
              } else {
                selectionCountDiv.textContent = '[0]';
              }
            } else {
              if (selectionDropdown.model.items.length < 1) {
                btnConfirm.enabled = false;
              } else {
                btnConfirm.enabled = true;
              }
              if (
                selectionDropdown.selected < 0 ||
                selectionDropdown.selected > selectionDropdown.model.items.length - 1
              ) {
                selectionDropdown.selected = 0;
              }
              selectionDropdown.enabled = selectionDropdown.model.items.length > 0;
              selectionCountDiv.textContent = '[' + selectionDropdown.model.items.length + ']';
            }
          }
          async function navigateToFolder(fileSystemObjectPath) {
            try {
              let targetFolder = fileSystemObjectPath.substring(0, fileSystemObjectPath.lastIndexOf('/'));
              if (typeof targetFolder !== 'string' || targetFolder.length < 1) {
                targetFolder = fileSystemObjectPath;
              }
              if (targetFolder !== currentFolderPath) {
                await updateCurrentFolder(targetFolder);
              }
            } catch (err) {
              return;
            }
          }
          async function updateCurrentFolder(newFolderPath = null) {
            let prevFolderPath = currentFolderPath;
            let directory = null;
            let directoryContent = [];
            if (newFolderPath !== null) {
              try {
                while (
                  newFolderPath.length > 0 &&
                  (newFolderPath.charAt(newFolderPath.length - 1) === '\\' ||
                    newFolderPath.charAt(newFolderPath.length - 1) === '/')
                ) {
                  newFolderPath = newFolderPath.slice(0, newFolderPath.length - 1);
                }
                currentFolderPath = newFolderPath;
              } catch (error) {}
            }
            try {
              directory = await RWS.FileSystem.getDirectory(currentFolderPath);
              directoryContent = await directory.getContents();
              if (
                !newFolderPath
                  .toLowerCase()
                  .includes(`${FPComponents.Filesystemdialog_A.ROOT_FOLDER_HOME}`.toLowerCase()) &&
                !newFolderPath
                  .toLowerCase()
                  .includes(`${FPComponents.Filesystemdialog_A.ROOT_FOLDER_TEMP}`.toLowerCase()) &&
                !newFolderPath
                  .toLowerCase()
                  .includes(`${FPComponents.Filesystemdialog_A.ROOT_FOLDER_BACKUP}`.toLowerCase())
              ) {
                throw new Error('Invalid root folder.');
              }
            } catch (errFetchContent) {
              currentFolderPath = prevFolderPath;
              return;
            }
            let isFile = fileSystemObjectType === `${FPComponents.Filesystemdialog_A.FileSystemObjectType.File}`;
            if (selectionMode === `${FPComponents.Filesystemdialog_A.SelectionMode.Single}`) {
              let exist = await fileSystemObjectExists(fullPathSingleSelect, isFile);
              if (!exist) {
                fullPathSingleSelect = '';
                selectionNameDiv.textContent = fullPathSingleSelect;
                updateSelectionStates();
              }
            } else {
              let pathsToRemove = [];
              for (let i = 0; i < selectionDropdown.model.items.length; i++) {
                const fileSysObjPath = selectionDropdown.model.items[i];
                let exist = await fileSystemObjectExists(fileSysObjPath, isFile);
                if (!exist) {
                  pathsToRemove.push(fileSysObjPath);
                }
              }
              if (pathsToRemove.length > 0) {
                pathsToRemove.forEach((fileSysObjPath) => {
                  let i = selectionDropdown.model.items.indexOf(fileSysObjPath);
                  if (i >= 0) {
                    selectionDropdown.model.items.splice(i, 1);
                  }
                });
                selectionDropdown.model = selectionDropdown.model;
                updateSelectionStates();
              }
            }
            await displayDirectoryContent(directoryContent);
            if (
              currentFolderPath === `${FPComponents.Filesystemdialog_A.ROOT_FOLDER_HOME}` ||
              currentFolderPath === `${FPComponents.Filesystemdialog_A.ROOT_FOLDER_TEMP}` ||
              currentFolderPath === `${FPComponents.Filesystemdialog_A.ROOT_FOLDER_BACKUP}`
            ) {
              btnParent.enabled = false;
            } else {
              btnParent.enabled = true;
            }
            pathBreadCrumbsDiv.textContent = currentFolderPath;
            if (fileSystemObjectType === `${FPComponents.Filesystemdialog_A.FileSystemObjectType.Folder}`) {
              if (selectionMode === `${FPComponents.Filesystemdialog_A.SelectionMode.Single}`) {
                fullPathSingleSelect = currentFolderPath;
                selectionNameDiv.textContent = fullPathSingleSelect.split('').reverse().join('');
              }
              updateSelectionStates();
            }
          }
          async function fileSystemObjectExists(path, isFile = true) {
            if (isFile) {
              try {
                let fileObj = await RWS.FileSystem.createFileObject(path);
                if (fileObj.fileExists()) {
                  return true;
                }
              } catch (error) {}
              return false;
            }
            try {
              await RWS.FileSystem.getDirectory(path);
              return true;
            } catch (error) {}
            return false;
          }
          async function displayDirectoryContent(directoryContent) {
            const fileSysObjArr = [];
            const fileArr = directoryContent.files;
            const dirArr = directoryContent.directories;
            if (fileSystemObjectType === `${FPComponents.Filesystemdialog_A.FileSystemObjectType.File}`) {
              dirArr.forEach((dir) => {
                fileSysObjArr.push({
                  type: `${FPComponents.Filesystemdialog_A.FileSystemObjectType.Folder}`,
                  content: dir,
                });
              });
              if (validFileEndings !== null && validFileEndings.length > 0) {
                fileArr.forEach((file) => {
                  validFileEndings.forEach((fileEnding) => {
                    if (fileEnding.trim().length > 0) {
                      if (file.name.toLowerCase().endsWith(fileEnding.toLowerCase())) {
                        fileSysObjArr.push({
                          type: `${FPComponents.Filesystemdialog_A.FileSystemObjectType.File}`,
                          content: file,
                        });
                      }
                    }
                  });
                });
              } else {
                fileArr.forEach((file) => {
                  fileSysObjArr.push({
                    type: `${FPComponents.Filesystemdialog_A.FileSystemObjectType.File}`,
                    content: file,
                  });
                });
              }
            } else {
              dirArr.forEach((dir) => {
                fileSysObjArr.push({
                  type: `${FPComponents.Filesystemdialog_A.FileSystemObjectType.Folder}`,
                  content: dir,
                });
              });
            }
            clearCurrentFolderContent();
            fileSysObjArr.forEach((fileSystemObject) => {
              const row = document.createElement('tr');
              const fileSystemObjectName = `${fileSystemObject.content.name}`;
              const tdIcon = document.createElement('td');
              const iconDiv = document.createElement('div');
              const icon = document.createElement('img');
              icon.className = 'fp-components-filesystemdialog-folder-content-object-icon';
              row.appendChild(tdIcon);
              tdIcon.appendChild(iconDiv);
              iconDiv.appendChild(icon);
              const td1 = document.createElement('td');
              td1.className = 'fp-components-filesystemdialog-folder-content-object-name';
              td1.textContent = fileSystemObjectName;
              row.appendChild(td1);
              const td2 = document.createElement('td');
              td2.style.wordBreakbreak = 'break-all';
              td2.style.paddingRight = '10px';
              td2.className = 'fp-components-filesystemdialog-folder-content-object-size';
              row.appendChild(td2);
              function getFormatedDate(obj) {
                let str = JSON.stringify(fileSystemObject.content.modified);
                str = str.replace(/["]/g, '');
                str = str.replace(/[T]/g, ', ');
                return str.substring(0, str.lastIndexOf('.'));
              }
              const td3 = document.createElement('td');
              td3.className = 'fp-components-filesystemdialog-folder-content-object-last-created';
              const createdDate = getFormatedDate(fileSystemObject.content.created);
              td3.textContent = createdDate;
              row.appendChild(td3);
              const td4 = document.createElement('td');
              td4.className = 'fp-components-filesystemdialog-folder-content-object-last-modified';
              const modifiedDate = getFormatedDate(fileSystemObject.content.modified);
              td4.textContent = modifiedDate;
              row.appendChild(td4);
              if (fileSystemObject.type === `${FPComponents.Filesystemdialog_A.FileSystemObjectType.File}`) {
                icon.src = 'vendor/fp-components/img/file.png';
                row.className =
                  'fp-components-filesystemdialog-folder-content-object-unselected fp-components-filesystemdialog-file-object';
                td2.textContent = fileSystemObject.content.size;
                if (fileSystemObjectType === `${FPComponents.Filesystemdialog_A.FileSystemObjectType.File}`) {
                  row.onclick = () => {
                    let fileWasSelected = false;
                    if (selectionMode === `${FPComponents.Filesystemdialog_A.SelectionMode.Single}`) {
                      for (let i = 0; i < folderContentTable.children.length; i++) {
                        if (
                          folderContentTable.children[i] !== row &&
                          folderContentTable.children[i].className.includes(
                            'fp-components-filesystemdialog-file-object',
                          )
                        ) {
                          folderContentTable.children[i].className =
                            'fp-components-filesystemdialog-folder-content-object-unselected fp-components-filesystemdialog-file-object';
                        }
                      }
                    }
                    if (row.className.includes('fp-components-filesystemdialog-folder-content-object-unselected')) {
                      row.className =
                        'fp-components-filesystemdialog-folder-content-object-selected fp-components-filesystemdialog-file-object';
                      fileWasSelected = true;
                    } else {
                      row.className =
                        'fp-components-filesystemdialog-folder-content-object-unselected fp-components-filesystemdialog-file-object';
                      fileWasSelected = false;
                    }
                    handleFileSelection(fileSystemObject.content.name, fileWasSelected);
                  };
                }
              } else {
                icon.src = 'vendor/fp-components/img/folder.png';
                row.className =
                  'fp-components-filesystemdialog-folder-content-object-unselected fp-components-filesystemdialog-folder-object';
                td2.textContent = '-';
                row.onclick = async () => {
                  let folderWasSelected = false;
                  if (multiSelectFolders) {
                    if (row.className.includes('fp-components-filesystemdialog-folder-content-object-unselected')) {
                      row.className =
                        'fp-components-filesystemdialog-folder-content-object-selected fp-components-filesystemdialog-folder-object';
                      folderWasSelected = true;
                    } else {
                      row.className =
                        'fp-components-filesystemdialog-folder-content-object-unselected fp-components-filesystemdialog-folder-object';
                      folderWasSelected = false;
                    }
                  }
                  await handleFolderSelection(fileSystemObject.content.name, folderWasSelected);
                };
              }
              folderContentTable.appendChild(row);
            });
            const tableHeadingRow = document.createElement('tr');
            tableHeadingRow.className = 'fp-components-filesystemdialog-folder-content-table-heading-row';
            const thIcon = document.createElement('th');
            thIcon.style.width = '32px';
            const thName = document.createElement('th');
            thName.style.minWidth = '350px';
            const thSize = document.createElement('th');
            thSize.style.width = '100px';
            const thCreated = document.createElement('th');
            thCreated.style.width = '150px';
            const thModified = document.createElement('th');
            thModified.style.width = '150px';
            thName.textContent = 'Name';
            thSize.textContent = 'Byte size';
            thCreated.textContent = 'Created';
            thModified.textContent = 'Modified';
            tableHeadingRow.appendChild(thIcon);
            tableHeadingRow.appendChild(thName);
            tableHeadingRow.appendChild(thSize);
            tableHeadingRow.appendChild(thCreated);
            tableHeadingRow.appendChild(thModified);
            folderContentTable.insertBefore(tableHeadingRow, folderContentTable.firstChild);
            if (
              selectionMode === `${FPComponents.Filesystemdialog_A.SelectionMode.Single}` &&
              fileSystemObjectType === `${FPComponents.Filesystemdialog_A.FileSystemObjectType.Folder}`
            ) {
              return;
            }
            for (let i = 1; i < folderContentTable.children.length; i++) {
              const nameColumnindex = 1;
              const row = folderContentTable.children[i];
              const fileSysObjName = row.children[nameColumnindex].textContent;
              const path = currentFolderPath + '/' + fileSysObjName;
              let selectRow = false;
              if (selectionMode === `${FPComponents.Filesystemdialog_A.SelectionMode.Single}`) {
                if (fullPathSingleSelect === path) {
                  selectRow = true;
                }
              } else {
                if (selectionDropdown.model.items.includes(path)) {
                  selectRow = true;
                }
              }
              if (selectRow === true) {
                if (row.className.includes('fp-components-filesystemdialog-file-object')) {
                  row.className =
                    'fp-components-filesystemdialog-folder-content-object-selected fp-components-filesystemdialog-file-object';
                } else {
                  row.className =
                    'fp-components-filesystemdialog-folder-content-object-selected fp-components-filesystemdialog-folder-object';
                }
              }
            }
          }
          function handleFileSelection(fileName, fileWasSelected) {
            const filePath = currentFolderPath + '/' + fileName;
            if (fileWasSelected) {
              if (selectionMode === `${FPComponents.Filesystemdialog_A.SelectionMode.Single}`) {
                fullPathSingleSelect = filePath;
                selectionNameDiv.textContent = fullPathSingleSelect.split('').reverse().join('');
              } else {
                if (!selectionDropdown.model.items.includes(filePath)) {
                  selectionDropdown.model.items.push(filePath);
                  const index = selectionDropdown.model.items.indexOf(filePath);
                  selectionDropdown.selected = index;
                }
              }
            } else {
              if (selectionMode === `${FPComponents.Filesystemdialog_A.SelectionMode.Single}`) {
                fullPathSingleSelect = '';
                selectionNameDiv.textContent = fullPathSingleSelect;
              } else {
                const index = selectionDropdown.model.items.indexOf(filePath);
                if (index >= 0) {
                  selectionDropdown.model.items.splice(index, 1);
                }
                if (selectionDropdown.model.items.length > 0) {
                  selectionDropdown.selected = 0;
                }
              }
            }
            if (selectionMode === `${FPComponents.Filesystemdialog_A.SelectionMode.Multi}`) {
              selectionDropdown.model = selectionDropdown.model;
            }
            updateSelectionStates();
          }
          async function handleFolderSelection(folderName, folderWasSelected) {
            if (!multiSelectFolders || selectionMode === `${FPComponents.Filesystemdialog_A.SelectionMode.Single}`) {
              await navigateToSubFolder(folderName);
              return;
            }
            const folderPath = currentFolderPath + '/' + folderName;
            if (folderWasSelected) {
              if (selectionMode === `${FPComponents.Filesystemdialog_A.SelectionMode.Single}}`) {
                selectionDropdown.model.items = [];
              }
              if (!selectionDropdown.model.items.includes(folderPath)) {
                selectionDropdown.model.items.push(folderPath);
                const index = selectionDropdown.model.items.indexOf(folderPath);
                selectionDropdown.selected = index;
              }
            } else {
              if (selectionMode === `${FPComponents.Filesystemdialog_A.SelectionMode.Single}`) {
                selectionDropdown.model.items = [];
              } else {
                const index = selectionDropdown.model.items.indexOf(folderPath);
                if (index >= 0) {
                  selectionDropdown.model.items.splice(index, 1);
                }
                if (selectionDropdown.model.items.length > 0) {
                  selectionDropdown.selected = 0;
                }
              }
            }
            selectionDropdown.model = selectionDropdown.model;
            updateSelectionStates();
          }
          function sortFolderContent(selectedIndex, selectedText) {
            if (!folderContentTable || !folderContentTable.rows) {
              return;
            }
            const columnIndex = selectedIndex + 1;
            let fileRows = [];
            let folderRows = [];
            const rows = folderContentTable.rows;
            for (let i = 1; i < rows.length; i++) {
              if (rows[i].children[2].textContent === '-') {
                folderRows.push(rows[i]);
              } else {
                fileRows.push(rows[i]);
              }
            }
            folderRows.sort(compareCellsByColumnIndex(columnIndex));
            fileRows.sort(compareCellsByColumnIndex(columnIndex));
            if (prevSelectedSortIndex === columnIndex) {
              folderRows = folderRows.reverse();
              fileRows = fileRows.reverse();
            }
            while (folderContentTable.children.length > 1) {
              folderContentTable.children[folderContentTable.children.length - 1].remove();
            }
            folderRows.forEach((row) => {
              folderContentTable.appendChild(row);
            });
            fileRows.forEach((row) => {
              folderContentTable.appendChild(row);
            });
            prevSelectedSortIndex = columnIndex;
            function compareCellsByColumnIndex(columnIndex) {
              return function (a, b) {
                let str1 = a.children[columnIndex].textContent.toLowerCase();
                let str2 = b.children[columnIndex].textContent.toLowerCase();
                return compareCellValues(str1, str2);
              };
              function compareCellValues(str1, str2) {
                try {
                  let temp1 = parseInt(str1);
                  let temp2 = parseInt(str2);
                  if (typeof temp1 !== 'number' || isNaN(temp1)) {
                    temp1 = str1;
                  }
                  if (typeof temp2 !== 'number' || isNaN(temp2)) {
                    temp2 = str2;
                  }
                  return temp1 - temp2;
                } catch (error) {
                  return 0;
                }
              }
            }
          }
          async function navigateToParentFolder() {
            if (
              currentFolderPath === `${FPComponents.Filesystemdialog_A.ROOT_FOLDER_HOME}` ||
              currentFolderPath === `${FPComponents.Filesystemdialog_A.ROOT_FOLDER_TEMP}` ||
              currentFolderPath === `${FPComponents.Filesystemdialog_A.ROOT_FOLDER_BACKUP}`
            ) {
              return;
            }
            await updateCurrentFolder(currentFolderPath.substring(0, currentFolderPath.lastIndexOf('/')));
          }
          async function navigateToSubFolder(folderName) {
            try {
              await RWS.FileSystem.getDirectory(currentFolderPath + '/' + folderName);
            } catch (err) {
              return;
            }
            await updateCurrentFolder(currentFolderPath + '/' + folderName);
          }
          function clearCurrentFolderContent() {
            while (folderContentTable.firstChild) {
              folderContentTable.firstChild.remove();
            }
          }
        });
      }
    };
    o.Filesystemdialog_A.SelectionMode = {
      Single: 'single',
      Multi: 'multi',
    };
    o.Filesystemdialog_A.FileSystemObjectType = {
      File: 'file',
      Folder: 'folder',
    };
    o.Filesystemdialog_A.ROOT_FOLDER_HOME = `$HOME`;
    o.Filesystemdialog_A.ROOT_FOLDER_TEMP = `$TEMP`;
    o.Filesystemdialog_A.ROOT_FOLDER_BACKUP = `$BACKUP`;
    o.Filesystemdialog_A.VERSION = '1.5.0';
  }
})(FPComponents);

// App SDK 1.5.0

// Copyright (c) 2020-2024 ABB

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software (the "Software"), to deal in the Software without
// restriction, including without limitation the rights to use, copy, modify,
// merge, publish, distribute, sublicense, and/or sell copies of the Software,
// and to permit persons to whom the Software is furnished to do so, subject to
// the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// The manuals related to the Software and the information therein are not
// included in these permissions and must not be reproduced, distributed,
// copied, or disclosed to third parties without ABB's written permission.
// ABB reserves all rights regarding Intellectual Property Rights in such
// manuals and information therein.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.

('use strict');

// fpComponentsLoadCSS("fp-components/fp-components-foldin-a.css");

var FPComponents = FPComponents || {};

(function (o) {
  if (!o.hasOwnProperty('Foldin_A')) {
    o.Foldin_A = class {
      constructor() {
        this._anchor = null;
        this._width = '35vw';
        this._contentId = null;
        this._show = false;
        this._foldinOuterDiv = null;
        this._foldinInnerDiv = null;
        this._glassDiv = null;
      }
      get parent() {
        return this._anchor;
      }
      get width() {
        return this._width;
      }
      set width(w) {
        if (typeof w === 'string') {
          this._width = w;
        } else if (typeof w === 'number') {
          this._width = w.toString(10) + 'px';
        } else {
          this._width = w.toString();
        }
        if (this._show === true) {
          this._foldinOuterDiv.style.width = this._width;
          this._foldinInnerDiv.style.minWidth = this._width;
        }
      }
      get contentId() {
        return this._contentId;
      }
      set contentId(cId) {
        this._contentId = cId === null ? null : cId.toString();
        if (this._foldinInnerDiv !== null) {
          if (this._contentId === null) {
            this._foldinInnerDiv.removeAttribute('id');
          } else {
            this._foldinInnerDiv.id = this._contentId;
          }
        }
      }
      attachToBody() {
        let element = document.getElementsByTagName('body')[0];
        if (element === null) {
          console.log('Could not find body element');
          return false;
        }
        this._anchor = element;
        return this.rebuild();
      }
      rebuild() {
        if (this._anchor !== null) {
          let anchor = this._anchor;
          let foldinInnerDiv = document.createElement('div');
          foldinInnerDiv.className = 'fp-components-foldin-inner';
          if (this._contentId !== null) foldinInnerDiv.id = this._contentId;
          foldinInnerDiv.style.width = this._width;
          let foldinOuterDiv = document.createElement('div');
          foldinOuterDiv.className = 'fp-components-base fp-components-foldin';
          let glassDiv = document.createElement('div');
          glassDiv.className = 'fp-components-foldin-glasspane';
          glassDiv.onclick = () => {
            this.hide();
          };
          foldinOuterDiv.appendChild(foldinInnerDiv);
          anchor.appendChild(foldinOuterDiv);
          anchor.appendChild(glassDiv);
          this._foldinInnerDiv = foldinInnerDiv;
          this._foldinOuterDiv = foldinOuterDiv;
          this._glassDiv = glassDiv;
        }
      }
      show() {
        if (this._show === true) {
          return;
        }
        this._show = true;
        if (this._foldinOuterDiv !== null) {
          this._glassDiv.style.display = 'block';
          this._foldinOuterDiv.style.width = this._width;
          this._foldinInnerDiv.style.minWidth = this._width;
        }
      }
      hide() {
        if (this._show === false) {
          return;
        }
        this._show = false;
        if (this._foldinOuterDiv !== null) {
          this._glassDiv.style.display = 'none';
          this._foldinOuterDiv.style.width = '0';
        }
      }
    };
    o.Foldin_A.VERSION = '1.5.0';
  }
})(FPComponents);

// App SDK 1.5.0

// Copyright (c) 2020-2024 ABB

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software (the "Software"), to deal in the Software without
// restriction, including without limitation the rights to use, copy, modify,
// merge, publish, distribute, sublicense, and/or sell copies of the Software,
// and to permit persons to whom the Software is furnished to do so, subject to
// the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// The manuals related to the Software and the information therein are not
// included in these permissions and must not be reproduced, distributed,
// copied, or disclosed to third parties without ABB's written permission.
// ABB reserves all rights regarding Intellectual Property Rights in such
// manuals and information therein.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.

('use strict');

// fpComponentsLoadCSS("fp-components/fp-components-hamburgermenu-a.css");

var FPComponents = FPComponents || {};

(function (o) {
  if (!o.hasOwnProperty('Hamburgermenu_A')) {
    o.Hamburgermenu_A = class {
      constructor() {
        this._root = null;
        this._buttonDiv = null;
        this._titleDiv = null;
        this._contentPane = null;
        this._menuWrapper = null;
        this._menuDiv = null;
        this._menuContainer = null;
        this._anchor = null;
        this._overlayDiv = null;
        this._isOpen = false;
        this._alwaysVisible = true;
        this._title = null;
        this._activeViewId = null;
        this._dirty = false;
        this._views = [];
        this._onchange = null;
      }
      get parent() {
        return this._anchor;
      }
      get title() {
        return this._title;
      }
      set title(t) {
        this._title = t;
        if (this._titleDiv) {
          this._titleDiv.textContent = this._title;
        }
      }
      get onchange() {
        return this._onchange;
      }
      set onchange(o) {
        this._onchange = o;
      }
      get viewIdList() {
        let list = [];
        for (const v of this._views) {
          list.push(v.id);
        }
        return list;
      }
      get activeView() {
        return this._activeViewId;
      }
      set activeView(id) {
        if (id !== null) {
          let view;
          for (let v of this._views) {
            if (v.id === this._activeViewId) {
              view = v;
              break;
            }
          }
          if (view && this._root !== null) {
            view.scrollTop = this._contentPane.scrollTop;
          }
          if (this._onchange != null && typeof this._onchange === 'function') {
            let oldId = null;
            if (view) {
              oldId = view.id;
            }
            this._onchange(oldId, id);
          }
        }
        this._activeViewId = id;
        this._updateViews();
      }
      get alwaysVisible() {
        return this._alwaysVisible;
      }
      set alwaysVisible(a) {
        this._alwaysVisible = a;
        if (!this._root) {
          return;
        }
        this._updateMenu();
      }
      getViewButtonLabel(id) {
        for (const v of this._views) {
          if (v.id === id) {
            return v.label;
          }
        }
        return null;
      }
      addView(label, contentElement, icon, active = false) {
        if (typeof contentElement === 'string') {
          contentElement = document.getElementById(contentElement);
        }
        let id = {};
        let newView = {
          id: id,
          label: label,
          icon: icon,
          contentElement: contentElement,
          active: active,
        };
        this._views.push(newView);
        if (newView.active || this.activeView == null) {
          this.activeView = newView.id;
        }
        if (this._root !== null) {
          this._addViewButton(newView);
          this._updateViews(newView);
        }
        return id;
      }
      removeView(id) {
        const activeId = this.activeView;
        const view = this._views.find((v) => v.id === id);
        const activeView = this._views.find((v) => v.id === activeId);
        if (view) {
          let ix = this._views.indexOf(view);
          let activeIx = this._views.indexOf(activeView);
          if (ix >= 0) {
            this._views.splice(ix, 1);
          }
          if (this._root !== null) {
            this._removeViewButton(view);
          }
          if (this._views.length === 0) {
            this.activeView = null;
          } else if (activeIx < ix) {
            this.activeView = this._views[activeIx].id;
          } else if (activeIx == ix) {
            if (activeIx + 1 > this._views.length) {
              this.activeView = this._views[activeIx - 1].id;
            } else {
              this.activeView = this._views[activeIx].id;
            }
          } else {
            this.activeView = this._views[activeIx - 1].id;
          }
        }
      }
      setViewButtonLabel(id, newText) {
        const view = this._views.find((v) => v.id === id);
        if (view) {
          const textNode = view.menuButton.getElementsByTagName('p');
          if (textNode) {
            view.label = newText;
            textNode[0].textContent = view.label;
          }
        }
      }
      attachToId(nodeId) {
        let element = document.getElementById(nodeId);
        if (element === null) {
          console.log('Could not find element with id: ' + nodeId);
          return false;
        }
        return this.attachToElement(element);
      }
      attachToElement(element) {
        this._anchor = element;
        return this._build();
      }
      _updateViews() {
        if (this._root === null) {
          return;
        }
        if (this._dirty == false) {
          this._dirty = true;
          window.setTimeout(() => {
            this._dirty = false;
            if (this._root !== null) {
              let child;
              while ((child = this._contentPane.lastChild)) {
                this._contentPane.removeChild(child);
              }
              let currView;
              for (currView of this._views) {
                currView.menuButton.classList.remove(o.Hamburgermenu_A._MENU_BUTTON_ACTIVE);
                if (currView.id === this.activeView) {
                  if (currView.contentElement.parentElement !== null) {
                    currView.contentElement.parentElement.removeChild(currView.contentElement);
                  }
                  this._contentPane.appendChild(currView.contentElement);
                  this._contentPane.scrollTop = currView.scrollTop;
                  (function (view, scope) {
                    window.setTimeout(() => {
                      scope._contentPane.scrollTop = view.scrollTop;
                    }, 0);
                  })(currView, this);
                  if (currView.menuButton) {
                    currView.menuButton.classList.add(o.Hamburgermenu_A._MENU_BUTTON_ACTIVE);
                  }
                  window.setTimeout(() => {
                    var scrollHeight = this._menuDiv.scrollHeight;
                    if (scrollHeight > 0) {
                      this._menuDiv.style.backgroundPosition =
                        '0% 0%, 0% ' + (scrollHeight - 80) + 'px, 0% 0%, 0% 100%';
                    }
                  }, 0);
                } else {
                  if (
                    currView.contentElement &&
                    currView.contentElement.parentElement !== null &&
                    currView.contentElement.parentElement !== this._contentPane
                  ) {
                    currView.contentElement.parentElement.removeChild(currView.contentElement);
                  }
                }
              }
            }
          }, 0);
        }
      }
      _addViewButton(view) {
        let divNode = document.createElement('div');
        divNode.className = 'fp-components-hamburgermenu-a-menu__button';
        let imgNode = document.createElement('div');
        imgNode.className = 'fp-components-hamburgermenu-a-menu__button-icon';
        divNode.appendChild(imgNode);
        if (view.icon !== undefined) {
          imgNode.style.backgroundImage = `url("${view.icon}")`;
        }
        let pNode = document.createElement('p');
        if (view.label !== undefined) {
          pNode.appendChild(document.createTextNode(view.label));
          pNode.className = 'fp-components-hamburgermenu-a-menu__button-text';
        }
        divNode.appendChild(pNode);
        this._menuDiv.appendChild(divNode);
        divNode.onclick = () => {
          for (var i = 0; i < this._menuDiv.children.length; i++) {
            var child = this._menuDiv.children[i];
            child.classList.remove(o.Hamburgermenu_A._MENU_BUTTON_ACTIVE);
          }
          divNode.classList.add(o.Hamburgermenu_A._MENU_BUTTON_ACTIVE);
          if (this._isOpen) {
            this._toggleOpen();
          }
          this.activeView = view.id;
        };
        view.menuButton = divNode;
      }
      _removeViewButton(view) {
        if (view.contentElement.parentElement !== null) {
          view.contentElement.parentElement.removeChild(view.contentElement);
        }
        if (view.menuButton.parentElement !== null) {
          view.menuButton.style.width = '0';
          view.menuButton.style.height = '0';
          view.menuButton.style.margin = '0px';
          view.menuButton.style.overFlow = 'hidden';
          window.setTimeout(() => {
            view.menuButton.parentElement.removeChild(view.menuButton);
            view.menuButton = null;
            view.contentElement = null;
          }, 0);
        }
      }
      _toggleOpen() {
        if (this._isOpen) {
          this._menuDiv.classList.remove(o.Hamburgermenu_A._MENU_OPEN);
          this._overlayDiv.classList.remove(o.Hamburgermenu_A._MENU_OVERLAY_OPEN);
          this._menuContainer.classList.remove(o.Hamburgermenu_A._MENU_CONTAINER_OPEN);
        } else {
          this._menuDiv.classList.add(o.Hamburgermenu_A._MENU_OPEN);
          this._overlayDiv.classList.add(o.Hamburgermenu_A._MENU_OVERLAY_OPEN);
          this._menuContainer.classList.add(o.Hamburgermenu_A._MENU_CONTAINER_OPEN);
        }
        this._isOpen = !this._isOpen;
      }
      _updateMenu() {
        if (!this._alwaysVisible && this._menuContainer.classList.contains(o.Hamburgermenu_A._MENU_ALWAYS_VISIBLE)) {
          this._menuWrapper.classList.remove(o.Hamburgermenu_A._MENU_WRAPPER_VISIBLE);
          this._menuContainer.classList.remove(o.Hamburgermenu_A._MENU_ALWAYS_VISIBLE);
        }
        if (this._alwaysVisible && !this._menuContainer.classList.contains(o.Hamburgermenu_A._MENU_ALWAYS_VISIBLE)) {
          this._menuWrapper.classList.add(o.Hamburgermenu_A._MENU_WRAPPER_VISIBLE);
          this._menuContainer.classList.add(o.Hamburgermenu_A._MENU_ALWAYS_VISIBLE);
        }
      }
      _build() {
        if (this._anchor != null) {
          let container = document.createElement('div');
          container.className = 'fp-components-base fp-components-hamburgermenu-a-container';
          let overlay = document.createElement('div');
          overlay.className = 'fp-components-hamburgermenu-a-overlay';
          overlay.onclick = () => this._toggleOpen();
          let menuWrapperNode = document.createElement('div');
          menuWrapperNode.className = 'fp-components-hamburgermenu-a-menu__wrapper';
          let menuContainer = document.createElement('div');
          menuContainer.className = 'fp-components-hamburgermenu-a-menu__container';
          let buttonContainerNode = document.createElement('div');
          buttonContainerNode.className = 'fp-components-hamburgermenu-a-button-container';
          buttonContainerNode.onclick = () => this._toggleOpen();
          let button = document.createElement('div');
          button.className = 'fp-components-hamburgermenu-a-button';
          let menu = document.createElement('div');
          menu.className = 'fp-components-hamburgermenu-a-menu';
          var titleDiv = document.createElement('div');
          titleDiv.className = 'fp-components-hamburgermenu-a-menu__title-container';
          let titleTextDiv = document.createElement('div');
          titleTextDiv.className = 'fp-components-hamburgermenu-a-menu__title-text';
          titleTextDiv.textContent = this._title;
          let content = document.createElement('div');
          content.className = 'fp-components-hamburgermenu-a-container__content';
          container.appendChild(overlay);
          container.appendChild(menuWrapperNode);
          menuWrapperNode.appendChild(menuContainer);
          menuContainer.appendChild(titleDiv);
          titleDiv.appendChild(titleTextDiv);
          menuContainer.appendChild(menu);
          menuWrapperNode.appendChild(buttonContainerNode);
          buttonContainerNode.appendChild(button);
          container.appendChild(content);
          this._root = container;
          this._contentPane = content;
          this._menuWrapper = menuWrapperNode;
          this._menuContainer = menuContainer;
          this._menuDiv = menu;
          this._buttonDiv = buttonContainerNode;
          this._overlayDiv = overlay;
          this._titleDiv = titleDiv;
          this._updateMenu();
          for (const v of this._views) {
            this._addViewButton(v);
          }
          this._updateViews();
          this._anchor.appendChild(container);
        }
      }
    };
    o.Hamburgermenu_A.VERSION = '1.5.0';
    o.Hamburgermenu_A._MENU_OVERLAY_OPEN = 'fp-components-hamburgermenu-a-overlay--open';
    o.Hamburgermenu_A._MENU_CONTAINER_OPEN = 'fp-components-hamburgermenu-a-menu__container--open';
    o.Hamburgermenu_A._MENU_OPEN = 'fp-components-hamburgermenu-a--open';
    o.Hamburgermenu_A._MENU_WRAPPER_VISIBLE = 'fp-components-hamburgermenu-a-menu__wrapper--visible';
    o.Hamburgermenu_A._MENU_ALWAYS_VISIBLE = 'fp-components-hamburgermenu-a-menu__container--visible';
    o.Hamburgermenu_A._MENU_BUTTON_ACTIVE = 'fp-components-hamburgermenu-a-menu__button--active';
  }
})(FPComponents);

// App SDK 1.5.0

// Copyright (c) 2020-2024 ABB

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software (the "Software"), to deal in the Software without
// restriction, including without limitation the rights to use, copy, modify,
// merge, publish, distribute, sublicense, and/or sell copies of the Software,
// and to permit persons to whom the Software is furnished to do so, subject to
// the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// The manuals related to the Software and the information therein are not
// included in these permissions and must not be reproduced, distributed,
// copied, or disclosed to third parties without ABB's written permission.
// ABB reserves all rights regarding Intellectual Property Rights in such
// manuals and information therein.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.

('use strict');

// fpComponentsLoadCSS("fp-components/fp-components-input-a.css");

var FPComponents = FPComponents || {};

(function (o) {
  if (!o.hasOwnProperty('Input_A')) {
    o.Input_A = class {
      constructor() {
        this._anchor = null;
        this._root = null;
        this._descDiv = null;
        this._container = null;
        this._enabled = true;
        this._text = '';
        this._highlight = false;
        this._onchange = null;
        this._label = null;
        this._regex = null;
        this._validator = null;
        this._variant = null;
        this._desc = null;
      }
      get parent() {
        return this._anchor;
      }
      get enabled() {
        return this._enabled;
      }
      set enabled(e) {
        this._enabled = e ? true : false;
        this._updateClassNames();
      }
      get text() {
        return this._text;
      }
      set text(t) {
        this._text = t;
        if (this._root !== null) {
          this._root.getElementsByTagName('p')[0].textContent = this._text;
        }
      }
      get onchange() {
        return this._onchange;
      }
      set onchange(callback) {
        this._onchange = callback;
      }
      get label() {
        return this._label;
      }
      set label(l) {
        this._label = l;
      }
      get regex() {
        return this._regex;
      }
      set regex(r) {
        this._regex = r;
      }
      get validator() {
        return this._validator;
      }
      set validator(v) {
        this._validator = v;
      }
      get variant() {
        return this._variant;
      }
      set variant(v) {
        this._variant = v;
      }
      get desc() {
        return this._desc;
      }
      set desc(d) {
        this._desc = d;
        if (!this._container) {
          return;
        }
        if (!d) {
          if (this._descDiv !== null) {
            this._container.removeChild(this._descDiv);
          }
          this._descDiv = null;
          return;
        }
        if (this._descDiv === null) {
          this._createDesc();
          return;
        }
        this._descDiv.textContent = d;
      }
      _createDesc() {
        let divdesc = document.createElement('span');
        divdesc.className = 'fp-components-input-desc';
        divdesc.textContent = this._desc;
        this._container.prepend(divdesc);
        this._descDiv = divdesc;
      }
      _updateClassNames() {
        if (this._root !== null) {
          if (this._enabled === true) {
            this._root.className = 'fp-components-input';
          } else {
            this._root.className = 'fp-components-input fp-components-input-disabled';
          }
        }
      }
      attachToId(nodeId) {
        let element = document.getElementById(nodeId);
        if (element === null) {
          console.log('Could not find element with id: ' + nodeId);
          return false;
        }
        return this.attachToElement(element);
      }
      attachToElement(element) {
        this._anchor = element;
        return this.rebuild();
      }
      rebuild() {
        let divContainer = document.createElement('div');
        divContainer.className = 'fp-components-input-container';
        let divField = document.createElement('div');
        let pText = document.createElement('p');
        pText.textContent = this._text;
        divField.appendChild(pText);
        divContainer.appendChild(divField);
        divField.onclick = () => {
          if (this._enabled === true) {
            this._root.style.borderColor = 'rgb(0,120,215)';
            fpComponentsKeyboardShow(
              (result) => {
                this._root.style.borderColor = null;
                if (result !== null) {
                  this.text = result;
                  if (this._onchange !== null && typeof this._onchange === 'function') {
                    this._onchange(this._text);
                  }
                }
              },
              this._text,
              this._label,
              this._variant,
              this._regex,
              this._validator,
            );
          }
        };
        this._container = divContainer;
        this._root = divField;
        if (this._desc !== null) {
          this._createDesc();
        }
        this._updateClassNames();
        this._anchor.appendChild(divContainer);
      }
    };
    o.Input_A.VERSION = '1.5.0';
  }
})(FPComponents);

// App SDK 1.5.0

// Copyright (c) 2020-2024 ABB

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software (the "Software"), to deal in the Software without
// restriction, including without limitation the rights to use, copy, modify,
// merge, publish, distribute, sublicense, and/or sell copies of the Software,
// and to permit persons to whom the Software is furnished to do so, subject to
// the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// The manuals related to the Software and the information therein are not
// included in these permissions and must not be reproduced, distributed,
// copied, or disclosed to third parties without ABB's written permission.
// ABB reserves all rights regarding Intellectual Property Rights in such
// manuals and information therein.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.

('use strict');

var FPComponents = FPComponents || {};

(function (o) {
  if (!o.hasOwnProperty('Levelmeter_A')) {
    o.Levelmeter_A = class {
      constructor() {
        this._anchor = null;
        this._root = null;
        this._canvas = null;
        this._width = null;
        this._max = null;
        this._min = null;
        this._value = null;
        this._lim1 = null;
        this._lim2 = null;
        this._unit = null;
        this._dirty = false;
      }
      get parent() {
        return this._anchor;
      }
      get width() {
        return this._width;
      }
      set width(w) {
        this._width = w;
        this.repaintLater();
      }
      get max() {
        return this._max;
      }
      set max(m) {
        this._max = m;
        this.repaintLater();
      }
      get min() {
        return this._min;
      }
      set min(m) {
        this._min = m;
        this.repaintLater();
      }
      get value() {
        return this._value;
      }
      set value(v) {
        this._value = v;
        this.repaintLater();
      }
      get lim1() {
        return this._lim1;
      }
      set lim1(lim) {
        this._lim1 = lim;
        this.repaintLater();
      }
      get lim2() {
        return this._lim2;
      }
      set lim2(lim) {
        this._lim2 = lim;
        this.repaintLater();
      }
      get unit() {
        return this._unit;
      }
      set unit(u) {
        this._unit = u;
        this.repaintLater();
      }
      attachToId(nodeId) {
        let element = document.getElementById(nodeId);
        if (element === null) {
          console.log('Could not find element with id: ' + nodeId);
          return false;
        }
        return this.attachToElement(element);
      }
      attachToElement(element) {
        this._anchor = element;
        return this.rebuild();
      }
      repaintLater() {
        this._dirty = true;
        setTimeout(() => {
          this.paint();
        }, 0);
      }
      paint() {
        if (this._dirty === false) {
          return;
        }
        this._dirty = false;
        let canvas = this._canvas;
        if (canvas === null) {
          return;
        }
        let canvasWidthPix = typeof this._width === 'number' ? this._width : 200;
        let maxVal = typeof this._max === 'number' ? this._max : 100;
        let minVal = typeof this._min === 'number' ? this._min : 0;
        let curVal = typeof this._value === 'number' ? this._value : 0;
        let lim1Val = typeof this._lim1 === 'number' ? this._lim1 : 100;
        let lim2Val = typeof this._lim2 === 'number' ? this._lim2 : 100;
        let unit = this._unit !== null ? this._unit.toString() : '';
        let paddingLeftPix = 5;
        let paddingRightPix = paddingLeftPix;
        let paddingTopPix = 18;
        let paddingBottomPix = 18;
        let barWidthPix = canvasWidthPix - paddingLeftPix - paddingRightPix;
        let barHeightPix = 8;
        let fixedLabelsFontSize = 12;
        let curLabelFontSize = 14;
        let markerWidthPix = 2;
        let markerStickoutPix = 3;
        let fixedMarkerWidthPix = 2;
        let fixedMarkerStickoutPix = 3;
        let minText = `${minVal}${unit}`;
        let maxText = `${maxVal}${unit}`;
        let curText = `${curVal}${unit}`;
        function valToBarPix(val) {
          return (val - minVal) * (barWidthPix / (maxVal - minVal));
        }
        canvas.width = canvasWidthPix;
        canvas.height = barHeightPix + paddingTopPix + paddingBottomPix;
        let ctx = canvas.getContext('2d');
        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
        ctx.save();
        ctx.translate(paddingLeftPix, paddingTopPix);
        ctx.fillStyle = '#0CA919';
        ctx.fillRect(0, 0, barWidthPix, barHeightPix);
        if (lim1Val !== null) {
          ctx.fillStyle = '#FFD800';
          ctx.fillRect(valToBarPix(lim1Val), 0, barWidthPix - valToBarPix(lim1Val), barHeightPix);
        }
        if (lim2Val !== null) {
          ctx.fillStyle = '#F03040';
          ctx.fillRect(valToBarPix(lim2Val), 0, barWidthPix - valToBarPix(lim2Val), barHeightPix);
        }
        ctx.fillStyle = '#696969';
        ctx.font = `${fixedLabelsFontSize}px Segoe UI`;
        ctx.fillText(minText, 0, barHeightPix + fixedLabelsFontSize + markerStickoutPix);
        ctx.fillText(
          maxText,
          barWidthPix - ctx.measureText(maxText).width,
          barHeightPix + fixedLabelsFontSize + markerStickoutPix,
        );
        ctx.strokeStyle = '#696969';
        ctx.lineWidth = fixedMarkerWidthPix;
        ctx.beginPath();
        ctx.moveTo(0, -fixedMarkerStickoutPix);
        ctx.lineTo(0, barHeightPix + fixedMarkerStickoutPix);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(barWidthPix, -fixedMarkerStickoutPix);
        ctx.lineTo(barWidthPix, barHeightPix + fixedMarkerStickoutPix);
        ctx.stroke();
        ctx.strokeStyle = 'black';
        ctx.lineWidth = markerWidthPix;
        ctx.beginPath();
        ctx.moveTo(valToBarPix(curVal), -markerStickoutPix);
        ctx.lineTo(valToBarPix(curVal), barHeightPix + markerStickoutPix);
        ctx.stroke();
        ctx.fillStyle = 'black';
        ctx.font = `${curLabelFontSize}px Segoe UI Semibold`;
        let curLabelWidthPix = ctx.measureText(curText).width;
        let curLabelPosPix = valToBarPix(curVal);
        let curLabelOffsetPix = curLabelWidthPix / 2;
        if (curLabelPosPix + curLabelOffsetPix > barWidthPix) {
          ctx.fillText(curText, barWidthPix - curLabelWidthPix, -markerStickoutPix - 2);
        } else if (curLabelPosPix - curLabelOffsetPix < 0) {
          ctx.fillText(curText, 0, -markerStickoutPix - 2);
        } else {
          ctx.fillText(curText, curLabelPosPix - curLabelOffsetPix, -markerStickoutPix - 2);
        }
        ctx.restore();
      }
      rebuild() {
        if (this._anchor === null) {
          return false;
        }
        let divWrapper = document.createElement('div');
        divWrapper.style.display = 'flex';
        divWrapper.style.padding = '6px 0 6px 0';
        let canvas = document.createElement('canvas');
        divWrapper.appendChild(canvas);
        this._canvas = canvas;
        this._root = divWrapper;
        this._anchor.appendChild(divWrapper);
        this._dirty = true;
        this.paint();
      }
    };
    o.Levelmeter_A.VERSION = '1.5.0';
  }
})(FPComponents);

// App SDK 1.5.0

// Copyright (c) 2020-2024 ABB

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software (the "Software"), to deal in the Software without
// restriction, including without limitation the rights to use, copy, modify,
// merge, publish, distribute, sublicense, and/or sell copies of the Software,
// and to permit persons to whom the Software is furnished to do so, subject to
// the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// The manuals related to the Software and the information therein are not
// included in these permissions and must not be reproduced, distributed,
// copied, or disclosed to third parties without ABB's written permission.
// ABB reserves all rights regarding Intellectual Property Rights in such
// manuals and information therein.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.

('use strict');

var FPComponents = FPComponents || {};

(function (o) {
  if (!o.hasOwnProperty('Linechart_A')) {
    o.Linechart_A = class {
      constructor() {
        this._anchor = null;
        this._root = null;
        this._canvas = null;
        this._width = null;
        this._height = null;
        this._xMax = null;
        this._xMin = null;
        this._yMax = null;
        this._yMin = null;
        this._xStep = null;
        this._yStep = null;
        this._xLabels = null;
        this._yLabels = null;
        this._xAutoLabelStep = null;
        this._yAutoLabelStep = null;
        this._model = null;
        this._dirty = false;
      }
      get parent() {
        return this._anchor;
      }
      get width() {
        return this._width;
      }
      set width(w) {
        this._width = w;
        this.repaintLater();
      }
      get height() {
        return this._height;
      }
      set height(h) {
        this._height = h;
        this.repaintLater();
      }
      get xMax() {
        return this._xMax;
      }
      set xMax(x) {
        this._xMax = x;
        this.repaintLater();
      }
      get xMin() {
        return this._xMin;
      }
      set xMin(x) {
        this._xMin = x;
        this.repaintLater();
      }
      get yMax() {
        return this._yMax;
      }
      set yMax(y) {
        this._yMax = y;
        this.repaintLater();
      }
      get yMin() {
        return this._yMin;
      }
      set yMin(y) {
        this._yMin = y;
        this.repaintLater();
      }
      get xStep() {
        return this._xStep;
      }
      set xStep(x) {
        this._xStep = x;
        this.repaintLater();
      }
      get yStep() {
        return this._yStep;
      }
      set yStep(y) {
        this._yStep = y;
        this.repaintLater();
      }
      get xLabels() {
        return this._xLabels;
      }
      set xLabels(x) {
        this._xLabels = x;
        this.repaintLater();
      }
      get yLabels() {
        return this._yLabels;
      }
      set yLabels(y) {
        this._yLabels = y;
        this.repaintLater();
      }
      get xAutoLabelStep() {
        return this._xAutoLabelStep;
      }
      set xAutoLabelStep(x) {
        this._xAutoLabelStep = x;
        this.repaintLater();
      }
      get yAutoLabelStep() {
        return this._yAutoLabelStep;
      }
      set yAutoLabelStep(y) {
        this._yAutoLabelStep = y;
        this.repaintLater();
      }
      get model() {
        return this._model;
      }
      set model(m) {
        this._model = m;
        this.repaintLater();
      }
      attachToId(nodeId) {
        let element = document.getElementById(nodeId);
        if (element === null) {
          console.log('Could not find element with id: ' + nodeId);
          return false;
        }
        return this.attachToElement(element);
      }
      attachToElement(element) {
        this._anchor = element;
        return this.rebuild();
      }
      repaintLater() {
        this._dirty = true;
        setTimeout(() => {
          this.paint();
        }, 0);
      }
      paint() {
        if (this._dirty === false) {
          return;
        }
        this._dirty = false;
        let xMax = this._xMax;
        let xMin = this._xMin;
        let yMax = this._yMax;
        let yMin = this._yMin;
        let xStep = this._xStep;
        let yStep = this._yStep;
        let model = this._model;
        let canvas = this._canvas;
        if (canvas === null) {
          return;
        }
        let ctx = canvas.getContext('2d');
        canvas.width = this._width === null ? 640 : this._width;
        canvas.height = this._height === null ? 480 : this._height;
        ctx.fillStyle = 'black';
        ctx.font = '16px Segoe UI';
        ctx.save();
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
        if (!Array.isArray(model)) {
          return;
        }
        let autoXMax = false;
        let autoXMin = false;
        let autoYMax = false;
        let autoYMin = false;
        if (typeof xMax !== 'number') {
          xMax = null;
          autoXMax = true;
        }
        if (typeof xMin !== 'number') {
          xMin = null;
          autoXMin = true;
        }
        if (typeof yMax !== 'number') {
          yMax = null;
          autoYMax = true;
        }
        if (typeof yMin !== 'number') {
          yMin = null;
          autoYMin = true;
        }
        if (autoXMax || autoXMin || autoYMax || autoYMin) {
          for (let item of model) {
            if (Array.isArray(item.points)) {
              for (let p of item.points) {
                var xValue = parseFloat(p[0]);
                var yValue = parseFloat(p[1]);
                if (isNaN(xValue) || isNaN(yValue)) {
                  console.error(`Point ${p} was not a number!`);
                }
                if (autoXMax && (xMax === null || xValue > xMax)) xMax = xValue;
                if (autoXMin && (xMin === null || xValue < xMin)) xMin = xValue;
                if (autoYMax && (yMax === null || yValue > yMax)) yMax = yValue;
                if (autoYMin && (yMin === null || yValue < yMin)) yMin = yValue;
              }
            }
          }
        }
        if (xMax === null) xMax = 100;
        if (xMin === null) xMin = 0;
        if (yMax === null) yMax = 100;
        if (yMin === null) yMin = 0;
        function calcStep(max) {
          let magnitudes = 0;
          let max2 = max;
          let ret;
          if (max2 > 1) {
            while (max2 > 1) {
              max2 /= 10;
              magnitudes++;
            }
            ret = Math.pow(10, magnitudes - 1);
            if (max / ret < 5) {
              ret /= 2;
            }
            return ret;
          } else {
            return max;
          }
        }
        if (typeof xStep !== 'number') {
          xStep = calcStep(Math.max(Math.abs(xMin), Math.abs(xMax)));
        }
        if (typeof yStep !== 'number') {
          yStep = calcStep(Math.max(Math.abs(yMin), Math.abs(yMax)));
        }
        let yLabels = [];
        let yAutoLabelStep = this._yAutoLabelStep;
        if (yAutoLabelStep === null) {
          yAutoLabelStep = yStep;
        } else if (typeof yAutoLabelStep !== 'number') {
          yAutoLabelStep = 0;
        }
        if (yAutoLabelStep > 0) {
          yLabels.push([yMin, yMin]);
          for (let i = yMin + yAutoLabelStep - (yMin % yAutoLabelStep); i <= yMax; i += yAutoLabelStep) {
            yLabels.push([i, i]);
          }
        }
        if (Array.isArray(this._yLabels)) {
          for (let l of this._yLabels) {
            if (Array.isArray(l)) {
              yLabels.push(l);
            }
          }
        }
        let yLabelAreaWidth = 0;
        for (let l of yLabels) {
          let w = Math.ceil(ctx.measureText(l[0]).width);
          l[2] = w;
          if (w > yLabelAreaWidth) yLabelAreaWidth = w;
        }
        yLabelAreaWidth += 10;
        let xLabels = [];
        let xAutoLabelStep = this._xAutoLabelStep;
        if (xAutoLabelStep === null) {
          xAutoLabelStep = xStep;
        } else if (typeof xAutoLabelStep !== 'number') {
          xAutoLabelStep = 0;
        }
        if (xAutoLabelStep > 0) {
          xLabels.push([xMin, xMin]);
          for (let i = xMin + xAutoLabelStep - (xMin % xAutoLabelStep); i <= xMax; i += xAutoLabelStep) {
            xLabels.push([i, i]);
          }
        }
        if (Array.isArray(this._xLabels)) {
          for (let l of this._xLabels) {
            if (Array.isArray(l)) {
              xLabels.push(l);
            }
          }
        }
        let xLabelAreaWidth = 0;
        for (let l of xLabels) {
          let w = Math.ceil(ctx.measureText(l[0]).width);
          l[2] = w;
          if (w > xLabelAreaWidth) xLabelAreaWidth = w;
        }
        xLabelAreaWidth += 10;
        ctx.save();
        ctx.translate(yLabelAreaWidth, 8);
        drawChart(canvas.width - yLabelAreaWidth - 8 - 1, canvas.height - xLabelAreaWidth - 8 - 1);
        ctx.restore();
        function drawChart(wPix, hPix) {
          ctx.save();
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, wPix, hPix);
          ctx.restore();
          ctx.save();
          for (let l of yLabels) {
            ctx.fillStyle = 'white';
            ctx.fillRect(-(l[2] + 7), hPix - yPix(l[1]) - 8, l[2], 17);
            ctx.fillStyle = 'black';
            ctx.fillText(l[0], -(l[2] + 7), hPix - yPix(l[1]) + 6);
          }
          ctx.restore();
          for (let l of xLabels) {
            ctx.save();
            ctx.translate(xPix(l[1]), hPix);
            ctx.rotate(-Math.PI / 2);
            ctx.translate(-l[2] - 7, 5);
            ctx.fillStyle = 'white';
            ctx.fillRect(0, -16, l[2], 17);
            ctx.fillStyle = 'black';
            ctx.fillText(l[0], 0, 0);
            ctx.restore();
          }
          ctx.translate(0.5, 0.5);
          ctx.translate(0, hPix);
          ctx.scale(1, -1);
          ctx.beginPath();
          ctx.rect(xPix(xMin), yPix(yMin), xPix(xMax), yPix(yMax));
          ctx.clip();
          ctx.save();
          ctx.strokeStyle = 'rgb(217,234,244)';
          ctx.lineWidth = 1;
          if (xStep > 0) {
            for (let i = xMin - (xMin % xStep); i < xMax; i += xStep) {
              ctx.beginPath();
              ctx.moveTo(xPix(i), yPix(yMin));
              ctx.lineTo(xPix(i), yPix(yMax));
              ctx.stroke();
            }
          }
          if (yStep > 0) {
            for (let i = yMin - (yMin % yStep); i < yMax; i += yStep) {
              ctx.beginPath();
              ctx.moveTo(xPix(xMin), yPix(i));
              ctx.lineTo(xPix(xMax), yPix(i));
              ctx.stroke();
            }
          }
          ctx.restore();
          ctx.save();
          for (let item of model) {
            if (item.hidden === true) {
              continue;
            }
            if (
              item.red === undefined ||
              item.red === null ||
              item.green === undefined ||
              item.green === null ||
              item.blue === undefined ||
              item.blue === null
            ) {
              ctx.fillStyle = 'rgba(17,125,187,0.063)';
              ctx.strokeStyle = 'rgba(17,125,187,1)';
            } else {
              ctx.fillStyle = `rgba(${item.red},${item.green},${item.blue},0.063)`;
              ctx.strokeStyle = `rgba(${item.red},${item.green},${item.blue},1)`;
            }
            if (item.thickness === undefined || item.thickness === null) {
              ctx.lineWidth = 1;
            } else {
              ctx.lineWidth = item.thickness;
            }
            ctx.lineJoin = 'round';
            if (item.points !== undefined) {
              item.points.sort((a, b) => {
                return a[0] > b[0];
              });
              if (!(item.fill === false)) {
                let lastd = null;
                for (let d of item.points) {
                  if (lastd !== null) {
                    ctx.beginPath();
                    ctx.moveTo(xPix(lastd[0]), yPix(lastd[1]));
                    ctx.lineTo(xPix(d[0]), yPix(d[1]));
                    ctx.lineTo(xPix(d[0]), yPix(0));
                    ctx.lineTo(xPix(lastd[0]), yPix(0));
                    ctx.closePath();
                    ctx.fill();
                  }
                  lastd = d;
                }
              }
              ctx.beginPath();
              ctx.moveTo(xPix(item.points[0][0]), yPix(item.points[0][1]));
              for (let d of item.points) {
                ctx.lineTo(xPix(d[0]), yPix(d[1]));
              }
              ctx.stroke();
              if (item.dots !== false) {
                ctx.save();
                let lw = ctx.lineWidth;
                ctx.lineWidth = 1;
                ctx.fillStyle = ctx.strokeStyle;
                for (let d of item.points) {
                  ctx.beginPath();
                  ctx.arc(xPix(d[0]), yPix(d[1]), lw / 2 + 3, 0, 2 * Math.PI, false);
                  ctx.fill();
                }
                ctx.restore();
              }
            }
            if (item.yMarker !== undefined) {
              let yMarker = item.yMarker;
              if (!Array.isArray(yMarker)) {
                yMarker = [yMarker];
              }
              for (let ym of yMarker) {
                ctx.save();
                ctx.beginPath();
                ctx.moveTo(xPix(xMin), yPix(ym));
                ctx.lineTo(xPix(xMax), yPix(ym));
                ctx.stroke();
                ctx.restore();
              }
            }
            if (item.xMarker !== undefined) {
              let xMarker = item.xMarker;
              if (!Array.isArray(xMarker)) {
                xMarker = [xMarker];
              }
              for (let xm of xMarker) {
                ctx.save();
                ctx.beginPath();
                ctx.moveTo(xPix(xm), yPix(yMin));
                ctx.lineTo(xPix(xm), yPix(yMax));
                ctx.stroke();
                ctx.restore();
              }
            }
            if (item.xFunc !== undefined) {
              let xFunc = item.xFunc;
              if (!Array.isArray(xFunc)) {
                xFunc = [xFunc];
              }
              let xFuncStep = item.xFuncStep === undefined ? xStep : item.xFuncStep;
              for (let xf of xFunc) {
                if (typeof xf === 'function') {
                  ctx.save();
                  ctx.beginPath();
                  ctx.moveTo(xPix(xMin), yPix(xf(xMin)));
                  for (let i = xMin + xFuncStep; i < xMax + xFuncStep; i += xFuncStep) {
                    ctx.lineTo(xPix(i), yPix(xf(i)));
                  }
                  ctx.stroke();
                  ctx.restore();
                }
              }
            }
            if (item.yFunc !== undefined) {
              let yFunc = item.yFunc;
              if (!Array.isArray(yFunc)) {
                yFunc = [yFunc];
              }
              let yFuncStep = item.yFuncStep === undefined ? yStep : item.yFuncStep;
              for (let yf of yFunc) {
                if (typeof yf === 'function') {
                  ctx.save();
                  ctx.beginPath();
                  ctx.moveTo(xPix(yf(yMin)), yPix(yMin));
                  for (let i = yMin + yFuncStep; i < yMax + yFuncStep; i += yFuncStep) {
                    ctx.lineTo(xPix(yf(i)), yPix(i));
                  }
                  ctx.stroke();
                  ctx.restore();
                }
              }
            }
          }
          ctx.restore();
          ctx.save();
          ctx.strokeStyle = 'rgb(17,125,187)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(wPix, 0);
          ctx.lineTo(wPix, hPix);
          ctx.lineTo(0, hPix);
          ctx.lineTo(0, 0);
          ctx.stroke();
          ctx.restore();
          function xPix(x) {
            return Math.round(((x - xMin) / (xMax - xMin)) * wPix);
          }
          function yPix(y) {
            return Math.round(((y - yMin) / (yMax - yMin)) * hPix);
          }
        }
      }
      rebuild() {
        if (this._anchor === null) {
          return false;
        }
        let divWrapper = document.createElement('div');
        divWrapper.style.display = 'inline-flex';
        let canvas = document.createElement('canvas');
        divWrapper.appendChild(canvas);
        this._canvas = canvas;
        this._root = divWrapper;
        this._anchor.appendChild(divWrapper);
        this._dirty = true;
        this.paint();
      }
    };
    o.Linechart_A.VERSION = '1.5.0';
  }
})(FPComponents);

// App SDK 1.5.0

// Copyright (c) 2020-2024 ABB

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software (the "Software"), to deal in the Software without
// restriction, including without limitation the rights to use, copy, modify,
// merge, publish, distribute, sublicense, and/or sell copies of the Software,
// and to permit persons to whom the Software is furnished to do so, subject to
// the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// The manuals related to the Software and the information therein are not
// included in these permissions and must not be reproduced, distributed,
// copied, or disclosed to third parties without ABB's written permission.
// ABB reserves all rights regarding Intellectual Property Rights in such
// manuals and information therein.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.

('use strict');

// fpComponentsLoadCSS("fp-components/fp-components-menu-a.css");

var FPComponents = FPComponents || {};

(function (o) {
  if (!o.hasOwnProperty('Menu_A')) {
    o.Menu_A = class {
      constructor() {
        this._model = {};
        this._anchor = null;
      }
      get parent() {
        return this._anchor;
      }
      set model(model) {
        this._model = model;
        this.rebuild();
      }
      get model() {
        return this._model;
      }
      attachToId(nodeId) {
        let element = document.getElementById(nodeId);
        if (element === null) {
          console.log('Could not find element with id: ' + nodeId);
          return false;
        }
        return this.attachToElement(element);
      }
      attachToElement(element) {
        this._anchor = element;
        return this.rebuild();
      }
      rebuild() {
        if (this._anchor != null) {
          let containerNode = document.createElement('div');
          containerNode.className = 'fp-components-base fp-components-menu-a-container';
          let content = this._model.content;
          if (content !== undefined && Array.isArray(content)) {
            for (let item of content) {
              if (item.type === 'button') {
                let divNode = document.createElement('div');
                divNode.className = 'fp-components-menu-a-button';
                if (item.flash !== undefined && item.flash == true) {
                  divNode.className += ' fp-components-menu-a-button-flash';
                  if (item.flashColor) {
                    divNode.style.setProperty('--fp-components-menu-flash-color', item.flashColor);
                  }
                }
                if (item.icon !== undefined) {
                  let imgNode = document.createElement('div');
                  imgNode.className = 'fp-components-menu-a-button-icon';
                  imgNode.style.backgroundImage = `url("${item.icon}")`;
                  divNode.appendChild(imgNode);
                }
                let pNode = document.createElement('p');
                if (item.label !== undefined) pNode.appendChild(document.createTextNode(item.label));
                divNode.appendChild(pNode);
                containerNode.appendChild(divNode);
                if (item.arrow !== undefined && (item.arrow === true || item.arrow === 'true')) {
                  let arrowNode = document.createElement('div');
                  arrowNode.className = 'fp-components-menu-a-button-righticon';
                  arrowNode.style.backgroundImage = 'url("./fp-components/img/rightarrow.png")';
                  divNode.appendChild(arrowNode);
                }
                if (item.enabled === false) {
                  divNode.style.opacity = '0.25';
                } else {
                  if (item.onclick !== undefined) divNode.onclick = item.onclick;
                  divNode.className += ' fp-components-menu-a-button-enabled';
                }
              } else if (item.type === 'gap') {
                containerNode.appendChild(document.createElement('br'));
              } else if (item.type === 'label') {
                let divNode = document.createElement('div');
                divNode.className = 'fp-components-menu-a-label';
                let pNode = document.createElement('p');
                if (item.label !== undefined) pNode.appendChild(document.createTextNode(item.label));
                divNode.appendChild(pNode);
                containerNode.appendChild(divNode);
              }
            }
          }
          while (this._anchor.firstChild) {
            this._anchor.removeChild(this._anchor.firstChild);
          }
          this._anchor.appendChild(containerNode);
        }
      }
    };
    o.Menu_A.VERSION = '1.5.0';
  }
})(FPComponents);

// App SDK 1.5.0

// Copyright (c) 2020-2024 ABB

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software (the "Software"), to deal in the Software without
// restriction, including without limitation the rights to use, copy, modify,
// merge, publish, distribute, sublicense, and/or sell copies of the Software,
// and to permit persons to whom the Software is furnished to do so, subject to
// the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// The manuals related to the Software and the information therein are not
// included in these permissions and must not be reproduced, distributed,
// copied, or disclosed to third parties without ABB's written permission.
// ABB reserves all rights regarding Intellectual Property Rights in such
// manuals and information therein.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.

('use strict');

// fpComponentsLoadCSS("fp-components/fp-components-piechart-a.css");

var FPComponents = FPComponents || {};

(function (o) {
  if (!o.hasOwnProperty('Piechart_A')) {
    o.Piechart_A = class {
      constructor() {
        this._anchor = null;
        this._root = null;
        this._size = 300;
        this._donut = true;
        this._showLabels = true;
        this._labelsBelow = false;
        this._model = [];
        this._hue = 225;
        this._multiHue = false;
        this._centerText = '';
        this._topText = '';
        this._bottomText = '';
        this.__selected = null;
        this._onselection = null;
        this._dirty = false;
      }
      get parent() {
        return this._anchor;
      }
      get size() {
        return this._size;
      }
      set size(s) {
        let old = this._size;
        this._size = Number.parseFloat(s);
        if (old !== this._size) {
          this._update();
        }
      }
      get donut() {
        return this._donut;
      }
      set donut(d) {
        let old = this._donut;
        this._donut = d == true;
        if (old !== this._donut) {
          this._update();
        }
      }
      get showLabels() {
        return this._showLabels;
      }
      set showLabels(sl) {
        let old = this._showLabels;
        this._showLabels = sl == true;
        if (old !== this._showLabels) {
          this._update();
        }
      }
      get labelsBelow() {
        return this._labelsBelow;
      }
      set labelsBelow(lb) {
        let old = this._labelsBelow;
        this._labelsBelow = lb === true;
        if (old !== this._labelsBelow) {
          this._update();
        }
      }
      get model() {
        return this._model;
      }
      set model(m) {
        if (!Array.isArray(m)) {
          console.error('PieChart: Model is not an array.');
          return;
        }
        for (let e of m) {
          if (!Array.isArray(e)) {
            console.error('PieChart: Sector entry is not an array.');
          }
        }
        this._model = m;
        this._update();
      }
      appendData(value, label, color = null) {
        this._model.push([value, label, color]);
        this._update();
      }
      clearData() {
        this._model = [];
        this._update();
      }
      get hue() {
        return this._hue;
      }
      set hue(h) {
        let h2 = Number.parseFloat(h);
        h2 %= 360;
        while (h2 < 0) {
          h2 += 360;
        }
        if (h2 === -0) {
          h2 = 0;
        }
        this._hue = h2;
        this._update();
      }
      get multiHue() {
        return this._multiHue;
      }
      set multiHue(mh) {
        let old = this._multiHue;
        this._multiHue = mh == true;
        if (old !== this._multiHue) {
          this._update();
        }
      }
      get centerText() {
        return this._centerText;
      }
      set centerText(ct) {
        this._centerText = ct;
        this._update();
      }
      get topText() {
        return this._topText;
      }
      set topText(tt) {
        this._topText = tt;
        this._update();
      }
      get bottomText() {
        return this._bottomText;
      }
      set bottomText(bt) {
        this._bottomText = bt;
        this._update();
      }
      get selected() {
        return this._selected;
      }
      set selected(s) {
        let old = this._selected;
        if (Number.isInteger(s) && s < this._model.length && s >= 0) {
          this._selected = s;
        } else {
          this._selected = null;
        }
        if (old !== this._selected) {
          this._update();
        }
      }
      get _selected() {
        return this.__selected;
      }
      set _selected(s) {
        this.__selected = s;
        if (this._onselection !== null && typeof this._onselection === 'function') {
          if (this.__selected === null) {
            this._onselection(null, null);
          } else {
            this._onselection(this.__selected, this._model[this.__selected][0]);
          }
        }
      }
      get onselection() {
        return this._onselection;
      }
      set onselection(os) {
        this._onselection = os;
      }
      attachToId(nodeId) {
        let element = document.getElementById(nodeId);
        if (element === null) {
          console.log('Could not find element with id: ' + nodeId);
          return false;
        }
        return this.attachToElement(element);
      }
      attachToElement(element) {
        this._anchor = element;
        return this.rebuild();
      }
      _update() {
        if (!this._dirty) {
          this._dirty = true;
          setTimeout(() => {
            this._update();
          }, 0);
          return;
        }
        this._dirty = false;
        function createEmSvg(tag) {
          return document.createElementNS('http://www.w3.org/2000/svg', tag);
        }
        function calcCoordinate(centerX, centerY, radius, deg) {
          if (isNaN(deg)) {
            deg = 0;
          }
          var radians = (deg - 90 + ROTATION) * (Math.PI / 180);
          return {
            x: centerX + radius * Math.cos(radians),
            y: centerY + radius * Math.sin(radians),
          };
        }
        if (!this._root) {
          return;
        }
        if (this._selected >= this._model.length) {
          this._selected = null;
        }
        const SIZE = this._size;
        const CENTER_X = 99.5;
        const CENTER_Y = 99.5;
        const RADIUS = 90;
        const THICKNESS = this._donut ? 25 : 90;
        const SELECTED_THICKNESS_MOD = 3;
        const ROTATION = 0;
        const SECTORS = this._model;
        const LIGHTNESS_MAX = 85;
        const LIGHTNESS_MIN = 25;
        const LIGHTNESS_STEP = SECTORS.length > 1 ? (LIGHTNESS_MAX - LIGHTNESS_MIN) / (SECTORS.length - 1) : 0;
        const SATURATION_MAX = 100;
        const SATURATION_MIN = 50;
        const SATURATION_STEP = SECTORS.length > 1 ? (SATURATION_MAX - SATURATION_MIN) / (SECTORS.length - 1) : 0;
        const HUE_STEP = SECTORS.length > 1 ? 360 / SECTORS.length : 0;
        const CENTER_TEXT_FONT_BASE = 36;
        const TOP_TEXT_FONT_BASE = 20;
        const TOP_TEXT_OFFSET = -30;
        const BOTTOM_TEXT_FONT_BASE = 20;
        const BOTTOM_TEXT_OFFSET = 30;
        let total = 0;
        let sectorColors = [];
        for (let i = 0; i < SECTORS.length; i++) {
          let sectorsEntry = SECTORS[i];
          total += sectorsEntry[0];
          if (!sectorsEntry[2]) {
            if (this._multiHue) {
              sectorColors[i] = [
                'hsl(',
                `${(this._hue + HUE_STEP * i * 2 + (SECTORS.length % 2 === 0 && i >= SECTORS.length / 2 ? HUE_STEP : 0)) % 360},`,
                `${SATURATION_MAX - SATURATION_STEP * i}%,`,
                `${LIGHTNESS_MIN + LIGHTNESS_STEP * i}%`,
                ')',
              ].join('');
            } else {
              sectorColors[i] =
                `hsl(${this._hue},${SATURATION_MAX - SATURATION_STEP * i}%,${LIGHTNESS_MIN + LIGHTNESS_STEP * i}%)`;
            }
          } else {
            sectorColors[i] = sectorsEntry[2];
          }
        }
        let svg = createEmSvg('svg');
        svg.setAttribute('width', SIZE);
        svg.setAttribute('height', SIZE);
        svg.setAttribute('viewBox', '0 0 200 200');
        let offset = 0;
        let offsetSelected = 0;
        const createSector = (i) => {
          let isSelected = this._selected === i;
          if (isSelected) {
            offsetSelected = offset;
          }
          let sector = SECTORS[i];
          let sectorDegrees = (sector[0] / total) * 360;
          if (sectorDegrees >= 360) {
            sectorDegrees = 359.99;
          }
          let color = sectorColors[i];
          let path = createEmSvg('path');
          path.setAttribute('fill', color);
          path.setAttribute('stroke', this._donut && !isSelected ? 'white' : 'none');
          path.setAttribute('stroke-linejoin', 'none');
          path.setAttribute('stroke-width', '1');
          let outerRadius = RADIUS + (isSelected ? SELECTED_THICKNESS_MOD : 0);
          let innerRadius = RADIUS - THICKNESS + (isSelected && this._donut ? -SELECTED_THICKNESS_MOD : 0);
          let p0 = calcCoordinate(CENTER_X, CENTER_Y, outerRadius, offset);
          let p1 = calcCoordinate(CENTER_X, CENTER_Y, outerRadius, offset + sectorDegrees);
          let p2 = calcCoordinate(CENTER_X, CENTER_Y, innerRadius, offset + sectorDegrees);
          let p3 = calcCoordinate(CENTER_X, CENTER_Y, innerRadius, offset);
          path.setAttribute(
            'd',
            [
              `M${p0.x},${p0.y}`,
              `A${outerRadius},${outerRadius} 0 ${sectorDegrees > 180 ? 1 : 0},1 ${p1.x},${p1.y}`,
              `L${p2.x},${p2.y}`,
              `A${innerRadius},${innerRadius} 0 ${sectorDegrees > 180 ? 1 : 0},0 ${p3.x},${p3.y}`,
              'Z',
            ].join(' '),
          );
          path.onclick = (e) => {
            e.stopPropagation();
            this._selected = this._selected === i ? null : i;
            this._update();
          };
          svg.appendChild(path);
          offset += sectorDegrees;
        };
        for (let i = 0; i < SECTORS.length; i++) {
          createSector(i);
        }
        if (this._selected !== null) {
          offset = offsetSelected;
          createSector(this._selected);
        }
        let centerText;
        if (this._donut && this._centerText) {
          centerText = createEmSvg('text');
          centerText.textContent = this._centerText;
          centerText.setAttribute('x', `${CENTER_X}`);
          centerText.setAttribute('y', `${CENTER_Y}`);
          centerText.setAttribute('text-anchor', 'middle');
          centerText.setAttribute('dy', '0.35em');
          centerText.setAttribute('style', `font-size: ${CENTER_TEXT_FONT_BASE}px; font-weight: bold;`);
          svg.appendChild(centerText);
        }
        let topText;
        if (this._donut && this._topText) {
          topText = createEmSvg('text');
          topText.textContent = this._topText;
          topText.setAttribute('x', `${CENTER_X}`);
          topText.setAttribute('y', `${CENTER_Y + TOP_TEXT_OFFSET}`);
          topText.setAttribute('text-anchor', 'middle');
          topText.setAttribute('dy', '0.35em');
          topText.setAttribute('style', `font-size: ${TOP_TEXT_FONT_BASE}px; font-weight: bold;`);
          svg.appendChild(topText);
        }
        let bottomText;
        if (this._donut && this._bottomText) {
          bottomText = createEmSvg('text');
          bottomText.textContent = this._bottomText;
          bottomText.setAttribute('x', `${CENTER_X}`);
          bottomText.setAttribute('y', `${CENTER_Y + BOTTOM_TEXT_OFFSET}`);
          bottomText.setAttribute('text-anchor', 'middle');
          bottomText.setAttribute('dy', '0.35em');
          bottomText.setAttribute('style', `font-size: ${BOTTOM_TEXT_FONT_BASE}px; font-weight: bold;`);
          svg.appendChild(bottomText);
        }
        let labelsContainer = null;
        if (this._showLabels) {
          labelsContainer = document.createElement('div');
          labelsContainer.className = 'fp-components-pie-chart-labelscontainer';
          labelsContainer.style.maxWidth = `${SIZE}px`;
          if (this._labelsBelow) {
            labelsContainer.style.flexDirection = 'row';
            labelsContainer.style.flexWrap = 'wrap';
            labelsContainer.style.justifyContent = 'center';
          } else {
            labelsContainer.style.flexDirection = null;
            labelsContainer.style.flexWrap = null;
            labelsContainer.style.justifyItems = null;
          }
          for (let i = 0; i < SECTORS.length; i++) {
            let sector = SECTORS[i];
            let labelWrapper = document.createElement('div');
            labelWrapper.className = 'fp-components-pie-chart-labelwrapper';
            if (this._selected === i) {
              labelWrapper.className += ' fp-components-pie-chart-labelwrapper-selected';
            }
            let colorBox = document.createElement('div');
            colorBox.style.backgroundColor = sectorColors[i];
            labelWrapper.appendChild(colorBox);
            let name = document.createElement('div');
            name.textContent = sector[1];
            labelWrapper.appendChild(name);
            let value = document.createElement('div');
            value.textContent = `${sector[0]}`;
            labelWrapper.appendChild(value);
            labelWrapper.onclick = (e) => {
              e.stopPropagation();
              this._selected = this._selected === i ? null : i;
              this._update();
            };
            labelsContainer.appendChild(labelWrapper);
          }
        }
        while (this._root.firstChild) {
          this._root.removeChild(this._root.lastChild);
        }
        this._root.style.flexDirection = this._labelsBelow ? 'column' : null;
        this._root.appendChild(svg);
        if (labelsContainer !== null) {
          this._root.appendChild(labelsContainer);
        }
        function adjust(element, baseSize, widthFactor) {
          let fontSize = baseSize;
          while (element.getBBox().width > widthFactor * (RADIUS - THICKNESS) && fontSize > 1) {
            fontSize--;
            element.setAttribute('style', `font-size: ${fontSize}px; font-weight: bold;`);
          }
        }
        if (this._donut && this._centerText) {
          adjust(centerText, CENTER_TEXT_FONT_BASE, 1.6);
        }
        if (this._donut && this._topText) {
          adjust(topText, TOP_TEXT_FONT_BASE, 1.3);
        }
        if (this._donut && this._bottomText) {
          adjust(bottomText, BOTTOM_TEXT_FONT_BASE, 1.3);
        }
      }
      rebuild() {
        if (this._anchor === null) {
          return false;
        }
        while (this._anchor.firstChild) {
          this._anchor.removeChild(this._anchor.lastChild);
        }
        let root = document.createElement('div');
        root.className = 'fp-components-base fp-components-pie-chart';
        root.onclick = () => {
          this._selected = null;
          this._update();
        };
        this._root = root;
        this._anchor.appendChild(root);
        this._update();
      }
    };
    o.Piechart_A.VERSION = '1.5.0';
  }
})(FPComponents);

// App SDK 1.5.0

// Copyright (c) 2020-2024 ABB

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software (the "Software"), to deal in the Software without
// restriction, including without limitation the rights to use, copy, modify,
// merge, publish, distribute, sublicense, and/or sell copies of the Software,
// and to permit persons to whom the Software is furnished to do so, subject to
// the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// The manuals related to the Software and the information therein are not
// included in these permissions and must not be reproduced, distributed,
// copied, or disclosed to third parties without ABB's written permission.
// ABB reserves all rights regarding Intellectual Property Rights in such
// manuals and information therein.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.

('use strict');

// fpComponentsLoadCSS("fp-components/fp-components-popup-a.css");

var FPComponents = FPComponents || {};

(function (o) {
  if (!o.hasOwnProperty('Popup_A')) {
    o.Popup_A = class {
      constructor() {}
      static _createPopup() {
        let body = document.body;
        let bgDiv = document.createElement('div');
        bgDiv.className = 'fp-components-popup-bg';
        let popupDiv = document.createElement('div');
        popupDiv.className = 'fp-components-popup';
        let topBorderDiv = document.createElement('div');
        topBorderDiv.className = 'fp-components-popup-top-border';
        let contentDiv = document.createElement('div');
        contentDiv.className = 'fp-components-popup-content';
        let headerDiv = document.createElement('div');
        headerDiv.className = 'fp-components-popup-header';
        let bodyContentDiv = document.createElement('div');
        bodyContentDiv.className = 'fp-components-popup-body';
        let bottomDiv = document.createElement('div');
        bottomDiv.className = 'fp-components-popup-footer';
        let iconDiv = document.createElement('div');
        iconDiv.className = 'fp-components-popup-icon';
        iconDiv.style.display = 'none';
        let messageDiv = document.createElement('div');
        messageDiv.className = 'fp-components-popup-message';
        this._iconDiv = iconDiv;
        this._bgDiv = bgDiv;
        this._popupDiv = popupDiv;
        this._bodyContentDiv = bodyContentDiv;
        this._footerDiv = bottomDiv;
        this._contentDiv = contentDiv;
        this._headerDiv = headerDiv;
        this._messageDiv = messageDiv;
        body.appendChild(bgDiv);
        bgDiv.appendChild(popupDiv);
        popupDiv.appendChild(topBorderDiv);
        popupDiv.appendChild(contentDiv);
        contentDiv.appendChild(headerDiv);
        contentDiv.appendChild(bodyContentDiv);
        bodyContentDiv.appendChild(iconDiv);
        bodyContentDiv.appendChild(messageDiv);
        contentDiv.appendChild(bottomDiv);
      }
      static _init() {
        if (!this.hasOwnProperty('_inited')) {
          this._inited = true;
          this._queue = [];
          this._active = false;
          this._callback = null;
          this._createPopup();
        }
      }
      static message(header, message, callback = null, style = null) {
        this._init();
        let model = {
          header: [
            {
              type: 'text',
              text: header,
            },
          ],
          footer: [
            {
              type: 'button',
              highlight: true,
              text: 'OK',
              action: FPComponents.Popup_A.OK,
            },
          ],
        };
        model.content = this._unpackMessage(message);
        if (this._active) {
          this._queue.push([model, callback, style]);
          return;
        }
        this._model = model;
        this._callback = callback;
        this._active = true;
        this._clearDivs();
        this._handleStyle(style);
        this._show(model);
      }
      static confirm(header, message, callback = null, style = null) {
        this._init();
        let model = {
          header: [
            {
              type: 'text',
              text: header,
            },
          ],
          footer: [
            {
              type: 'button',
              text: 'Cancel',
              action: FPComponents.Popup_A.CANCEL,
            },
            {
              type: 'button',
              highlight: true,
              text: 'OK',
              action: FPComponents.Popup_A.OK,
            },
          ],
        };
        model.content = this._unpackMessage(message);
        if (this._active) {
          this._queue.push([model, callback, style]);
          return;
        }
        this._clearDivs();
        this._active = true;
        this._callback = callback;
        this._model = model;
        this._handleStyle(style);
        this._show(model);
      }
      static custom(model, callback = null) {
        this._init();
        if (this._active) {
          this._queue.push([model, callback, null]);
          return;
        }
        this._model = model;
        this._callback = callback;
        this._active = true;
        this._clearDivs();
        this._handleStyle(null);
        this._show(model);
      }
      static _parseModel(model, parent) {
        if (model !== undefined && Array.isArray(model)) {
          for (let item of model) {
            switch (item.type) {
              case 'button':
                let divContainer = document.createElement('div');
                var btn = new FPComponents.Button_A();
                btn.text = item.text;
                btn.highlight = item.highlight;
                if (item.closeDialog === false) {
                  btn.onclick = () => {
                    this._callback(item.action);
                  };
                } else {
                  btn.onclick = () => {
                    this.close(item.action);
                  };
                }
                btn.attachToElement(divContainer);
                parent.appendChild(divContainer);
                break;

              case 'text':
                let textDiv = null;
                if (typeof item.text !== 'string') {
                  item.text = `${item.text}`;
                }
                if (item.text.trim() !== '' || item.text.includes('\n')) {
                  textDiv = document.createElement('div');
                  textDiv.textContent = item.text;
                  if (parent === this._headerDiv) {
                    textDiv.className = 'fp-components-popup-header-text';
                  } else if (parent === this._messageDiv) {
                    textDiv.className = 'fp-components-popup-message-text';
                  }
                } else {
                  textDiv = document.createElement('br');
                }
                parent.appendChild(textDiv);
                break;
            }
          }
        }
      }
      static close(action) {
        if (this._inited) {
          if (this._bgDiv.parentNode !== null) {
            this._bgDiv.parentNode.removeChild(this._bgDiv);
          }
          this._clearDivs();
          if (this._active === true && typeof this._callback === 'function') {
            this._callback(action);
          }
          this._callback = null;
          if (this._queue.length > 0) {
            let popup = this._queue.shift();
            var model = popup[0];
            var callback = popup[1];
            var style = popup[2];
            this._active = true;
            this._callback = callback;
            this._handleStyle(style);
            this._show(model);
          } else {
            this._active = false;
          }
        }
      }
      static _clearDivs() {
        while (this._headerDiv.firstChild) {
          this._headerDiv.removeChild(this._headerDiv.firstChild);
        }
        while (this._messageDiv.firstChild) {
          this._messageDiv.removeChild(this._messageDiv.firstChild);
        }
        while (this._footerDiv.firstChild) {
          this._footerDiv.removeChild(this._footerDiv.firstChild);
        }
      }
      static _show(model) {
        if (model) {
          this._parseModel(model.header, this._headerDiv);
          this._parseModel(model.content, this._messageDiv);
          this._parseModel(model.footer, this._footerDiv);
          document.body.appendChild(this._bgDiv);
          return;
        }
      }
      static _unpackMessage(message) {
        var lineList = [];
        if (!Array.isArray(message)) {
          message = [message];
        }
        for (const line of message) {
          lineList.push({
            type: 'text',
            text: line,
          });
        }
        return lineList;
      }
      static _handleStyle(style) {
        if (!style) {
          this._iconDiv.style.display = 'none';
          return;
        }
        if (style == this.STYLE.INFORMATION) {
          this._iconDiv.className = 'fp-components-popup-icon';
        }
        if (style == this.STYLE.WARNING) {
          this._iconDiv.className = 'fp-components-popup-icon fp-components-popup-icon--warning';
        }
        if (style == this.STYLE.DANGER) {
          this._iconDiv.className = 'fp-components-popup-icon fp-components-popup-icon--danger';
        }
        this._iconDiv.style.display = 'block';
      }
    };
    o.Popup_A.VERSION = '1.5.0';
    o.Popup_A.OK = 'ok';
    o.Popup_A.CANCEL = 'cancel';
    o.Popup_A.NONE = 'none';
    o.Popup_A.STYLE = {
      INFORMATION: 'information',
      WARNING: 'warning',
      DANGER: 'danger',
    };
  }
})(FPComponents);

// App SDK 1.5.0

// Copyright (c) 2020-2024 ABB

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software (the "Software"), to deal in the Software without
// restriction, including without limitation the rights to use, copy, modify,
// merge, publish, distribute, sublicense, and/or sell copies of the Software,
// and to permit persons to whom the Software is furnished to do so, subject to
// the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// The manuals related to the Software and the information therein are not
// included in these permissions and must not be reproduced, distributed,
// copied, or disclosed to third parties without ABB's written permission.
// ABB reserves all rights regarding Intellectual Property Rights in such
// manuals and information therein.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.

('use strict');

// fpComponentsLoadCSS("fp-components/fp-components-radio-a.css");

var FPComponents = FPComponents || {};

(function (o) {
  if (!o.hasOwnProperty('Radio_A')) {
    o.Radio_A = class {
      constructor() {
        this._anchor = null;
        this._root = null;
        this._scale = 1;
        this._enabled = true;
        this._onclick = null;
        this._checked = false;
        this._desc = null;
        this._descDiv = null;
        this._container = null;
      }
      get parent() {
        return this._anchor;
      }
      get onclick() {
        return this._onclick;
      }
      set onclick(f) {
        this._onclick = f;
      }
      get enabled() {
        return this._enabled;
      }
      set enabled(e) {
        this._enabled = e ? true : false;
        this._updateClassNames();
      }
      get checked() {
        return this._checked;
      }
      set checked(c) {
        this._checked = c ? true : false;
        this._updateClassNames();
      }
      get desc() {
        return this._desc;
      }
      set desc(d) {
        this._desc = d;
        if (this._container === null) {
          return;
        }
        if (!d) {
          if (this._descDiv !== null) {
            this._container.removeChild(this._descDiv);
          }
          this._descDiv = null;
          return;
        }
        if (this._descDiv === null) {
          this._createDesc();
          return;
        }
        this._descDiv.textContent = d;
      }
      _createDesc() {
        let divdesc = document.createElement('span');
        divdesc.className = 'fp-components-radio-desc';
        divdesc.textContent = this._desc;
        this._container.appendChild(divdesc);
        this._descDiv = divdesc;
      }
      _updateClassNames() {
        if (this._root !== null) {
          if (this._checked == true) {
            this._root.className =
              this._enabled === true
                ? 'fp-components-radio-checked'
                : 'fp-components-radio-checked fp-components-radio-disabled';
          } else {
            this._root.className =
              this._enabled === true ? 'fp-components-radio' : 'fp-components-radio fp-components-radio-disabled';
          }
        }
      }
      attachToId(nodeId) {
        let element = document.getElementById(nodeId);
        if (element === null) {
          console.log('Could not find element with id: ' + nodeId);
          return false;
        }
        return this.attachToElement(element);
      }
      attachToElement(element) {
        this._anchor = element;
        return this.rebuild();
      }
      rebuild() {
        let divContainer = document.createElement('div');
        let divButton = document.createElement('div');
        divButton.appendChild(document.createElement('div'));
        divContainer.className = 'fp-components-radio-container';
        divContainer.onclick = () => {
          if (this._enabled == true && this._checked != true) {
            this._checked = true;
            this._updateClassNames();
            if (this._onclick !== null) {
              this._onclick();
            }
          }
        };
        divContainer.appendChild(divButton);
        this._container = divContainer;
        this._root = divButton;
        if (this._desc !== null) {
          this._createDesc();
        }
        this._updateClassNames();
        if (this._scale !== 1) {
          this.scale = this._scale;
        }
        this._anchor.appendChild(divContainer);
      }
      set scale(s) {
        this._scale = s;
        if (this._root !== null) {
          this._root.style.borderWidth = (2 * s).toString() + 'px';
          this._root.style.borderRadius = (12 * s).toString() + 'px';
          this._root.style.width = (24 * s).toString() + 'px';
          this._root.style.height = (24 * s).toString() + 'px';
          let markerDiv = this._root.getElementsByTagName('div')[0];
          markerDiv.style.width = (8 * s).toString() + 'px';
          markerDiv.style.height = (8 * s).toString() + 'px';
          markerDiv.style.borderRadius = (4 * s).toString() + 'px';
          markerDiv.style.marginLeft = (6 * s).toString() + 'px';
          markerDiv.style.marginTop = (6 * s).toString() + 'px';
        }
      }
      get scale() {
        return this._scale;
      }
    };
    o.Radio_A.VERSION = '1.5.0';
  }
})(FPComponents);

// App SDK 1.5.0

// Copyright (c) 2020-2024 ABB

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software (the "Software"), to deal in the Software without
// restriction, including without limitation the rights to use, copy, modify,
// merge, publish, distribute, sublicense, and/or sell copies of the Software,
// and to permit persons to whom the Software is furnished to do so, subject to
// the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// The manuals related to the Software and the information therein are not
// included in these permissions and must not be reproduced, distributed,
// copied, or disclosed to third parties without ABB's written permission.
// ABB reserves all rights regarding Intellectual Property Rights in such
// manuals and information therein.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.

('use strict');

// fpComponentsLoadCSS("fp-components/fp-components-slider-a.css");

var FPComponents = FPComponents || {};

(function (o) {
  if (!o.hasOwnProperty('Slider_A')) {
    o.Slider_A = class {
      constructor() {
        this._pointerdown = this._pointerdown.bind(this);
        this._pointermove = this._pointermove.bind(this);
        this._pointerup = this._pointerup.bind(this);
        this._horizontalPadding = 28;
        this._textPadding = 16;
        this._anchor = null;
        this._root = null;
        this._labelElement = null;
        this._valueElement = null;
        this._activeTrackElement = null;
        this._inactiveTrackElement = null;
        this._touchBoxElement = null;
        this._trackHandleElement = null;
        this._ticks = [];
        this._label = '';
        this._displayLabel = true;
        this._displayValue = true;
        this._unit = '';
        this._enabled = true;
        this._min = 0;
        this._max = 100;
        this._tickStep = 1;
        this._internalTickStep = this._tickStep;
        this._displayTicks = false;
        this._value = 0;
        this._width = 172;
        this._numberOfDecimals = 0;
        this._ondrag = null;
        this._onrelease = null;
        this._lastNotifiedValue = 0;
        this._startX = 0;
        this._startOffset = 0;
        this._xPosition = 0;
        this._rawXPosition = 0;
        this._pixelValue = 100 / this._width;
        this._active = false;
      }
      get parent() {
        return this._anchor;
      }
      get min() {
        return this._min;
      }
      set min(v) {
        if (isNaN(v)) {
          return;
        }
        this._min = v;
        if (this._anchor) {
          this._rebuild();
        }
      }
      get max() {
        return this._max;
      }
      set max(v) {
        if (isNaN(v)) {
          return;
        }
        this._max = v;
        if (this._anchor) {
          this._rebuild();
        }
      }
      get value() {
        return Number.parseFloat(this._value);
      }
      set value(v) {
        if (isNaN(v)) {
          return;
        }
        this._value = v;
        if (this._anchor) {
          this._rebuild();
        }
      }
      get label() {
        return this._label;
      }
      set label(v) {
        this._label = v;
        if (this._anchor) {
          this._updateLabel();
        }
      }
      get displayLabel() {
        return this._displayLabel;
      }
      set displayLabel(v) {
        this._displayLabel = v;
        if (this._anchor) {
          this._updateLabel();
        }
      }
      get displayValue() {
        return this._displayValue;
      }
      set displayValue(v) {
        this._displayValue = v;
        if (this._anchor) {
          this._updateLabel();
        }
      }
      get unit() {
        return this._unit;
      }
      set unit(v) {
        this._unit = v;
        if (this._anchor) {
          this._updateLabel();
        }
      }
      get tickStep() {
        return this._tickStep;
      }
      set tickStep(v) {
        if (isNaN(v)) {
          return;
        }
        if (v === 0) {
          return;
        }
        this._tickStep = v;
        if (this._anchor) {
          this._rebuild();
        }
      }
      get displayTicks() {
        return this._displayTicks;
      }
      set displayTicks(v) {
        this._displayTicks = v;
        if (this._anchor) {
          this._rebuild();
        }
      }
      get numberOfDecimals() {
        return this._numberOfDecimals;
      }
      set numberOfDecimals(v) {
        this._numberOfDecimals = v;
        if (this._anchor) {
          if (this._valueElement) {
            this._valueWidth =
              this._getTextWidth(this._max.toFixed(this._numberOfDecimals), '14px Segoe UI') + this._textPadding;
            this._valueElement.style.width = this._valueWidth + 'px';
            this._updateDynamicElements();
          }
        }
      }
      get width() {
        return this._width + 28;
      }
      set width(v) {
        if (isNaN(v) || v === null || v === undefined) {
          return;
        }
        this._width = v - 28;
        if (this._width < 1) {
          this._width = 1;
        }
        if (this._anchor) {
          this._rebuild();
        }
      }
      get enabled() {
        return this._enabled;
      }
      set enabled(e) {
        this._enabled = e ? true : false;
        this._updateClassNames();
      }
      get ondrag() {
        return this._ondrag;
      }
      set ondrag(f) {
        this._ondrag = f;
      }
      get onrelease() {
        return this._onrelease;
      }
      set onrelease(f) {
        this._onrelease = f;
      }
      _updateClassNames() {
        if (this._root !== null) {
          if (!this._enabled) {
            this._trackHandleElement.className =
              'fp-components-slider__track-handle fp-components-slider__track-handle--disabled';
            this._activeTrackElement.className = 'fp-components-slider__track fp-components-slider__track-disabled';
          } else {
            this._trackHandleElement.className =
              'fp-components-slider__track-handle fp-components-slider__track-handle--enabled';
            this._activeTrackElement.className = 'fp-components-slider__track fp-components-slider__track--active';
          }
        }
        this._updateTickMarks();
      }
      attachToId(nodeId) {
        let element = document.getElementById(nodeId);
        if (element === null) {
          console.log('Could not find element with id: ' + nodeId);
          return false;
        }
        return this.attachToElement(element);
      }
      attachToElement(element) {
        this._anchor = element;
        return this._rebuild();
      }
      _rebuild() {
        this._anchor.innerHTML = '';
        this._valueWidth =
          this._getTextWidth(this._max.toFixed(this._numberOfDecimals), '14px Segoe UI') + this._textPadding;
        this._pixelValue = (this._max - this._min) / this._width;
        this._xPosition = this._limitPosition((this._value - this._min) / this._pixelValue);
        let component = document.createElement('div');
        component.className = 'fp-components-base fp-components-slider';
        component.style = 'width: ' + this._width + 'px';
        this._createLabelPart(component);
        this._createRangePart(component);
        this._createMinMaxPart(component);
        this._root = component;
        this._anchor.appendChild(component);
        this._updateClassNames();
        this._rawXPosition = this._xPosition;
        this._updateDynamicElements();
      }
      _createLabelPart(component) {
        let divLabelContainer = document.createElement('div');
        divLabelContainer.className = 'fp-components-slider__labels-wrapper';
        let label = document.createElement('span');
        label.textContent = this._buildLabel();
        label.className = this._displayLabel ? 'fp-components-slider__label' : 'fp-components-slider__label--hidden';
        this._labelElement = label;
        divLabelContainer.appendChild(label);
        let divValue = document.createElement('span');
        divValue.className = 'fp-components-slider__value--hidden';
        divValue.style.left = this._xPosition + 'px';
        divValue.style.width = this._valueWidth + 'px';
        divValue.textContent = this._value;
        divLabelContainer.appendChild(divValue);
        this._valueElement = divValue;
        component.appendChild(divLabelContainer);
      }
      _createRangePart(component) {
        let divTrack = document.createElement('div');
        divTrack.className = 'fp-components-slider__range-wrapper';
        divTrack.style.width = this._width + 'px';
        divTrack.addEventListener('pointerdown', this._pointerdown);
        let divActiveTrack = document.createElement('div');
        divActiveTrack.className = 'fp-components-slider__track ';
        divActiveTrack.className += this._enabled
          ? 'fp-components-slider__track--active'
          : 'fp-components-slider__track--disabled';
        divActiveTrack.style.width = (this._value - this._min) / this._pixelValue + 'px';
        this._activeTrackElement = divActiveTrack;
        divTrack.appendChild(divActiveTrack);
        let divInavtiveTrack = document.createElement('div');
        divInavtiveTrack.className = 'fp-components-slider__track';
        divInavtiveTrack.style.marginLeft = (this._value - this._min) / this._pixelValue + 'px';
        divInavtiveTrack.style.width = (this._max - this._value) / this._pixelValue + 'px';
        this._inactiveTrackElement = divInavtiveTrack;
        divTrack.appendChild(divInavtiveTrack);
        this._internalTickStep = this._tickStep;
        let rangeLength = this._max - this._min;
        let numOfSteps = rangeLength / this._internalTickStep;
        let stepPixelWidth = this._width / numOfSteps;
        const minVisiblePixelWidth = 5;
        if (stepPixelWidth < minVisiblePixelWidth) {
          let newTickStep = this._internalTickStep;
          let stepFactor = 0;
          while (stepPixelWidth < minVisiblePixelWidth) {
            stepFactor += 1;
            newTickStep = this._internalTickStep * stepFactor;
            numOfSteps = rangeLength / newTickStep;
            stepPixelWidth = this._width / numOfSteps;
          }
          this._internalTickStep = newTickStep;
        }
        if (this.displayTicks) {
          divTrack.style.backgroundSize = stepPixelWidth.toString() + 'px 1px';
        } else {
          divTrack.style.backgroundSize = '0px 1px';
        }
        function createTickMark(pixelPosition) {
          let tickMark = document.createElement('div');
          tickMark.style.left = pixelPosition + 'px';
          return tickMark;
        }
        this._ticks = [];
        if (this._displayTicks) {
          let tickMarkStart = createTickMark(0);
          this._ticks.push(tickMarkStart);
          divTrack.appendChild(tickMarkStart);
          let tickMarkEnd = createTickMark(this._width);
          this._ticks.push(tickMarkEnd);
          divTrack.appendChild(tickMarkEnd);
        }
        let divTouchbox = document.createElement('div');
        divTouchbox.className = 'fp-components-slider__track-touchbox';
        divTouchbox.addEventListener('pointerdown', this._pointerdown);
        divTouchbox.style.left = this._xPosition + 'px';
        this._touchBoxElement = divTouchbox;
        divTouchbox.addEventListener('pointerover', (e) => {
          if (!this._active) {
            this._valueElement.className = 'fp-components-slider__value';
            this._valueElement.className += ' fp-components-slider__value--hover';
            this._rawXPosition = this._xPosition;
            this._updateDynamicElements();
          }
        });
        divTouchbox.addEventListener('pointerout', (e) => {
          if (!this._active) {
            this._valueElement.className = 'fp-components-slider__value';
            this._valueElement.className += ' fp-components-slider__value--hidden';
          }
        });
        divTrack.appendChild(divTouchbox);
        let divTrackHandle = document.createElement('div');
        divTrackHandle.className = 'fp-components-slider__track-handle';
        divTrackHandle.className += ' fp-components-slider__track--handle-enabled';
        this._trackHandleElement = divTrackHandle;
        divTouchbox.appendChild(divTrackHandle);
        component.appendChild(divTrack);
      }
      _createMinMaxPart(component) {
        let divMinMax = document.createElement('div');
        divMinMax.className = 'fp-components-slider__minmax-wrapper';
        let divMinValue = document.createElement('span');
        divMinValue.innerHTML = this._min;
        divMinValue.className = 'fp-components-slider__minmax-label';
        divMinValue.className += ' fp-components-slider__minmax-label--left';
        divMinMax.appendChild(divMinValue);
        let divSpacer = document.createElement('div');
        divSpacer.className = 'fp-components-slider__minmax-spacer';
        divMinMax.appendChild(divSpacer);
        let divMaxValue = document.createElement('span');
        divMaxValue.innerHTML = this._max;
        divMaxValue.className = 'fp-components-slider__minmax-label';
        divMaxValue.className += ' fp-components-slider__minmax-label--right';
        divMinMax.appendChild(divMaxValue);
        component.appendChild(divMinMax);
      }
      _updateDynamicElements() {
        let rawValue = this._min + this._xPosition * this._pixelValue;
        this._value = rawValue.toFixed(this._numberOfDecimals);
        this._labelElement.textContent = this._buildLabel();
        this._touchBoxElement.style.left = this._xPosition + 'px';
        this._valueElement.innerHTML = this._value;
        let maxPos = this._width - this._valueWidth / 2;
        let minPos = this._valueWidth / 2;
        if (this._rawXPosition >= maxPos) {
          this._valueElement.style.left = maxPos + 'px';
        } else if (this._rawXPosition <= minPos) {
          this._valueElement.style.left = minPos + 'px';
        } else {
          this._valueElement.style.left = this._rawXPosition + 'px';
        }
        this._activeTrackElement.style.width = (rawValue - this._min) / this._pixelValue + 'px';
        this._inactiveTrackElement.style.marginLeft = (rawValue - this._min) / this._pixelValue + 'px';
        this._inactiveTrackElement.style.width = (this._max - rawValue) / this._pixelValue + 'px';
        this._updateTickMarks();
      }
      _updateTickMarks() {
        this._ticks.forEach((item, index, array) => {
          let val = parseInt(item.style.left);
          if (val <= this._xPosition) {
            item.className = 'fp-components-slider__tick';
            if (this._enabled) {
              item.className += ' fp-components-slider__tick--selected';
            } else {
              item.className += ' fp-components-slider__tick--disabled';
            }
          } else {
            item.className = 'fp-components-slider__tick';
          }
        });
      }
      _limitPosition(position) {
        if (position < 0) {
          position = 0;
        }
        if (position > this._width) {
          position = this._width;
        }
        let value = position * this._pixelValue;
        let low = value - (value % this._tickStep);
        let high = low + this._tickStep;
        let distanceToLowerValue = value - low;
        let distanceToHigherValue = high - value;
        let valueToSet = distanceToLowerValue < distanceToHigherValue ? low : high;
        if (valueToSet === low && high > this._max && value <= this._max && value > low) {
          valueToSet = this._max;
        }
        return valueToSet / this._pixelValue;
      }
      _getTextWidth(text, font) {
        let canvas = document.createElement('canvas');
        let context = canvas.getContext('2d');
        context.font = font;
        let metrics = context.measureText(text);
        return metrics.width;
      }
      _buildLabel() {
        if (!this._displayLabel) {
          return;
        }
        let label = this._label;
        if (this._displayValue) {
          label += ' ' + this._value;
          if (this._unit) {
            label += this._unit;
          }
        }
        return label;
      }
      _updateLabel() {
        if (this._labelElement) {
          this._labelElement.className = this._displayLabel
            ? 'fp-components-slider__label'
            : 'fp-components-slider__label--hidden';
          this._labelElement.innerHTML = this._buildLabel();
        }
      }
      _pointerdown(e) {
        if (!this._enabled) {
          return;
        }
        this._active = true;
        this._startX = e.pageX;
        if (e.target.classList.contains('fp-components-slider__track-touchbox')) {
          this._startOffset = this._xPosition;
        } else {
          this._startOffset = e.offsetX;
          this._rawXPosition = this._startOffset;
          this._xPosition = this._limitPosition(this._startOffset);
          if (this._xPosition < 0) {
            this._xPosition = 0;
          }
          if (this._xPosition > this._width) {
            this._xPosition = this._width;
          }
          this._updateDynamicElements();
          if (this._ondrag) {
            this._ondrag(Number.parseFloat(this._value));
          }
        }
        this._valueElement.className = 'fp-components-slider__value';
        this._valueElement.className += ' fp-components-slider__value--active';
        this._trackHandleElement.className = 'fp-components-slider__track-handle';
        this._trackHandleElement.className += ' fp-components-slider__track-handle--enabled';
        this._trackHandleElement.className += ' fp-components-slider__track-handle--active';
        document.addEventListener('pointermove', this._pointermove);
        document.addEventListener('pointerup', this._pointerup);
      }
      _pointermove(e) {
        e.preventDefault();
        let dx = e.pageX - this._startX;
        this._rawXPosition = this._startOffset + dx;
        this._xPosition = this._limitPosition(this._startOffset + dx);
        if (this._xPosition < 0) {
          this._xPosition = 0;
        }
        if (this._xPosition > this._width) {
          this._xPosition = this._width;
        }
        this._updateDynamicElements();
        if (this._ondrag) {
          if (this._lastNotifiedValue != this._value) {
            this._ondrag(Number.parseFloat(this._value));
            this._lastNotifiedValue = this._value;
          }
        }
      }
      _pointerup(e) {
        this._active = false;
        document.removeEventListener('pointermove', this._pointermove);
        document.removeEventListener('pointerup', this._pointerup);
        this._labelElement.innerHTML = this._buildLabel();
        this._valueElement.className = 'fp-components-slider__value--hidden';
        this._trackHandleElement.className = 'fp-components-slider__track-handle';
        this._trackHandleElement.className += ' fp-components-slider__track-handle--enabled';
        if (this._onrelease) {
          this._onrelease(Number.parseFloat(this._value));
        }
      }
    };
    o.Slider_A.VERSION = '1.5.0';
  }
})(FPComponents);

// App SDK 1.5.0

// Copyright (c) 2020-2024 ABB

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software (the "Software"), to deal in the Software without
// restriction, including without limitation the rights to use, copy, modify,
// merge, publish, distribute, sublicense, and/or sell copies of the Software,
// and to permit persons to whom the Software is furnished to do so, subject to
// the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// The manuals related to the Software and the information therein are not
// included in these permissions and must not be reproduced, distributed,
// copied, or disclosed to third parties without ABB's written permission.
// ABB reserves all rights regarding Intellectual Property Rights in such
// manuals and information therein.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.

('use strict');

// fpComponentsLoadCSS("fp-components/fp-components-switch-a.css");

var FPComponents = FPComponents || {};

(function (o) {
  if (!o.hasOwnProperty('Switch_A')) {
    o.Switch_A = class {
      constructor() {
        this._anchor = null;
        this._onchange = null;
        this._root = null;
        this._knob = null;
        this._container = null;
        this._enabled = true;
        this._active = false;
        this._scale = 1;
        this._desc = null;
        this._descDiv = null;
      }
      get parent() {
        return this._anchor;
      }
      set onchange(func) {
        this._onchange = func;
      }
      get onchange() {
        return _onchange;
      }
      attachToId(nodeId) {
        let element = document.getElementById(nodeId);
        if (element === null) {
          console.log('Could not find element with id: ' + nodeId);
          return false;
        }
        return this.attachToElement(element);
      }
      attachToElement(element) {
        this._anchor = element;
        return this.rebuild();
      }
      set active(active) {
        if (this._root !== null) {
          if (active) {
            this._root.className = 'fp-components-switch-button fp-components-switch-button-active';
            if (this._scale != 1) {
              this._root.getElementsByTagName('div')[0].style.marginLeft = (16 * this._scale).toString() + 'px';
            }
          } else {
            this._root.className = 'fp-components-switch-button';
            if (this._scale != 1) {
              this._root.getElementsByTagName('div')[0].style.marginLeft = '0';
            }
          }
          if (!this._enabled) {
            this._root.className += ' fp-components-switch-button-disabled';
          }
        }
        this._active = active;
      }
      get active() {
        return this._active;
      }
      set enabled(enabled) {
        this._enabled = enabled;
        this.active = this._active;
      }
      get enabled() {
        return this._enabled;
      }
      get desc() {
        return this._desc;
      }
      set desc(d) {
        this._desc = d;
        if (this._container == null) {
          return;
        }
        if (!d) {
          if (this._descDiv !== null) {
            this._container.removeChild(this._descDiv);
          }
          this._descDiv = null;
          return;
        }
        if (this._descDiv == null) {
          this._createDesc();
          return;
        }
        this._descDiv.textContent = d;
      }
      _createDesc() {
        let divdesc = document.createElement('span');
        divdesc.className = 'fp-components-switch-button-desc';
        divdesc.textContent = this._desc;
        this._container.appendChild(divdesc);
        this._descDiv = divdesc;
      }
      handleClick() {
        if (this._enabled === true) {
          if (this._active === true) {
            this.active = false;
          } else {
            this.active = true;
          }
          if (this._onchange != null) {
            this._onchange(this._active);
          }
        }
      }
      rebuild() {
        if (this._anchor != null) {
          let divContainer = document.createElement('div');
          let divOuter = document.createElement('div');
          let divKnob = document.createElement('div');
          divOuter.appendChild(divKnob);
          divContainer.className = 'fp-components-switch-container';
          divContainer.onclick = () => this.handleClick();
          divContainer.appendChild(divOuter);
          this._container = divContainer;
          this._root = divOuter;
          this._knob = divKnob;
          if (this._desc !== null) {
            this._createDesc();
          }
          this._anchor.appendChild(this._container);
          this.active = this._active;
          if (this._scale !== 1) {
            this.scale = this._scale;
          }
        }
      }
      set scale(s) {
        this._scale = Number.parseFloat(s);
        if (this._root !== null) {
          if (s == 1) {
            this._root.style.borderRadius = null;
            this._root.style.height = null;
            this._root.style.width = null;
            this._knob.style.borderRadius = null;
            this._knob.style.borderWidth = null;
            this._knob.style.height = null;
            this._knob.style.width = null;
            this._knob.style.marginLeft = null;
          } else {
            this._root.style.borderRadius = (12 * s).toString() + 'px';
            this._root.style.height = (24 * s).toString() + 'px';
            this._root.style.width = (40 * s).toString() + 'px';
            this._knob.style.borderRadius = (12 * s).toString() + 'px';
            this._knob.style.borderWidth = (3 * s).toString() + 'px';
            this._knob.style.height = (24 * s).toString() + 'px';
            this._knob.style.width = (24 * s).toString() + 'px';
            if (this._active) {
              this._knob.style.marginLeft = (16 * s).toString() + 'px';
            } else {
              this._knob.style.marginLeft = '0';
            }
          }
        }
      }
      get scale() {
        return this._scale;
      }
    };
    o.Switch_A.VERSION = '1.5.0';
  }
})(FPComponents);

// App SDK 1.5.0

// Copyright (c) 2020-2024 ABB

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software (the "Software"), to deal in the Software without
// restriction, including without limitation the rights to use, copy, modify,
// merge, publish, distribute, sublicense, and/or sell copies of the Software,
// and to permit persons to whom the Software is furnished to do so, subject to
// the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// The manuals related to the Software and the information therein are not
// included in these permissions and must not be reproduced, distributed,
// copied, or disclosed to third parties without ABB's written permission.
// ABB reserves all rights regarding Intellectual Property Rights in such
// manuals and information therein.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.

('use strict');

// fpComponentsLoadCSS("fp-components/fp-components-tabcontainer-a.css");

var FPComponents = FPComponents || {};

(function (o) {
  if (!o.hasOwnProperty('Tabcontainer_A')) {
    o.Tabcontainer_A = class {
      constructor() {
        this._anchor = null;
        this._root = null;
        this._tabs = [];
        this._tabQueue = [];
        this.__activeTabId = undefined;
        this._tabBar = null;
        this._tabBarOuter = null;
        this._dirty = false;
        this._tabScrollDirty = false;
        this._userTabClosing = false;
        this._onplus = null;
        this._plusEnabled = true;
        this._plusButton = null;
        this._onchange = null;
        this._onuserclose = null;
        this._hiddenTabs = false;
        this._contentPane = null;
      }
      get parent() {
        return this._anchor;
      }
      get onplus() {
        return this._onplus;
      }
      set onplus(cb) {
        this._onplus = cb;
        this._updatePlusButton();
      }
      get onchange() {
        return this._onchange;
      }
      set onchange(c) {
        this._onchange = c;
      }
      get onuserclose() {
        return this._onuserclose;
      }
      set onuserclose(c) {
        this._onuserclose = c;
      }
      get plusEnabled() {
        return this._plusEnabled;
      }
      set plusEnabled(p) {
        this._plusEnabled = p == true;
        this._updatePlusButton();
      }
      get userTabClosing() {
        return this._userTabClosing;
      }
      set userTabClosing(u) {
        this._userTabClosing = u == true;
        this._updateTabs();
      }
      get hiddenTabs() {
        return this._hiddenTabs;
      }
      set hiddenTabs(h) {
        this._hiddenTabs = h == true;
        this._updateOuterTabBarVisibility();
      }
      get tabIdList() {
        let list = [];
        for (const t of this._tabs) {
          list.push(t.id);
        }
        return list;
      }
      get activeTab() {
        return this._activeTabId;
      }
      set activeTab(id) {
        let tab;
        for (let t of this._tabs) {
          if (t.id === this._activeTabId) {
            tab = t;
            break;
          }
        }
        if (tab) {
          tab.scrollTop = this._contentPane.scrollTop;
        }
        this._activeTabId = id;
        this._updateTabs();
      }
      get _activeTabId() {
        return this.__activeTabId;
      }
      set _activeTabId(id) {
        let old = this.__activeTabId;
        this.__activeTabId = id;
        if (this._onchange !== null && typeof this._onchange === 'function') {
          this._onchange(old, id);
        }
      }
      attachToId(nodeId) {
        let element = document.getElementById(nodeId);
        if (element === null) {
          console.log('Could not find element with id: ' + nodeId);
          return false;
        }
        return this.attachToElement(element);
      }
      attachToElement(element) {
        this._anchor = element;
        return this._rebuild();
      }
      addTab(title, contentElement, makeActive = false) {
        if (typeof contentElement === 'string') {
          contentElement = document.getElementById(contentElement);
        }
        let id = {};
        this._tabQueue.push({
          id: id,
          title: title,
          contentElement: contentElement,
          makeActive: makeActive,
        });
        this._updateTabs();
        return id;
      }
      getTabTitle(id) {
        for (const t of this._tabs) {
          if (t.id === id) {
            return t.title;
          }
        }
        return null;
      }
      setTabTitle(id, title) {
        var tab = this._tabs.find((t) => t.id === id);
        if (tab) {
          tab.title = title;
          if (tab.rootTitleDiv) {
            tab.rootTitleDiv.textContent = title;
          }
        }
      }
      removeTab(id) {
        this._tabQueue.push({
          id: id,
          delete: true,
        });
        this._updateTabs();
      }
      _scrollLeft() {
        this._tabBar.scrollLeft -= 200;
      }
      _scrollRight() {
        this._tabBar.scrollLeft += 200;
      }
      _plusButtonAction() {
        if (this._plusEnabled && typeof this._onplus === 'function') {
          this._onplus();
        }
      }
      _updateOuterTabBarVisibility() {
        if (this._tabBarOuter !== null) {
          if (this._hiddenTabs) {
            this._tabBarOuter.style.display = 'none';
          } else {
            this._tabBarOuter.style.display = null;
          }
        }
      }
      _updatePlusButton() {
        if (this._plusButton !== null) {
          if (this._onplus !== null && typeof this._onplus === 'function') {
            this._plusButton.style.display = null;
          } else {
            this._plusButton.style.display = 'none';
          }
          if (this._plusEnabled) {
            this._plusButton.style.backgroundImage = "url('./fp-components/img/svg/abb_plus_24.svg')";
            this._plusButton.style.backgroundColor = null;
            this._plusButton.className = o.Tabcontainer_A._SIDEBUTTON_ENABLED;
          } else {
            this._plusButton.style.backgroundImage = "url('./fp-components/img/svg/abb_plus_grey_mod_24.svg')";
            this._plusButton.style.backgroundColor = 'var(--fp-color-GRAY-10)';
            this._plusButton.className = o.Tabcontainer_A._SIDEBUTTON_DISABLED;
          }
        }
      }
      _updateScrollButtons(scrollToRight = false) {
        let t = this._tabBar;
        if (t.clientWidth === t.scrollWidth) {
          this._leftButton.style.display = 'none';
          this._rightButton.style.display = 'none';
        } else {
          this._leftButton.style.display = null;
          this._rightButton.style.display = null;
          if (scrollToRight) {
            t.scrollLeft = t.scrollWidth - t.clientWidth;
          }
          if (t.scrollLeft == 0) {
            this._leftButton.style.backgroundImage = "url('./fp-components/img/svg/abb_left_grey_mod_24.svg')";
            this._leftButton.style.backgroundColor = 'var(--fp-color-GRAY-10)';
            this._leftButton.className = o.Tabcontainer_A._SIDEBUTTON_DISABLED;
          } else {
            this._leftButton.style.backgroundImage = "url('./fp-components/img/svg/abb_left_24.svg')";
            this._leftButton.style.backgroundColor = null;
            this._leftButton.className = o.Tabcontainer_A._SIDEBUTTON_ENABLED;
          }
          if (t.scrollLeft === t.scrollWidth - t.clientWidth) {
            this._rightButton.style.backgroundImage = "url('./fp-components/img/svg/abb_right_grey_mod_24.svg')";
            this._rightButton.style.backgroundColor = 'var(--fp-color-GRAY-10)';
            this._rightButton.className = o.Tabcontainer_A._SIDEBUTTON_DISABLED;
          } else {
            this._rightButton.style.backgroundImage = "url('./fp-components/img/svg/abb_right_24.svg')";
            this._rightButton.style.backgroundColor = null;
            this._rightButton.className = o.Tabcontainer_A._SIDEBUTTON_ENABLED;
          }
        }
      }
      _tabBarChanged() {
        if (!this._tabScrollDirty) {
          this._tabScrollDirty = true;
          window.setTimeout(() => {
            this._tabScrollDirty = false;
            this._updateScrollButtons(false);
          }, 200);
        }
      }
      _updateTabs() {
        if (!this._dirty) {
          this._dirty = true;
          window.setTimeout(() => {
            this._dirty = false;
            if (this._root !== null) {
              let t;
              while ((t = this._tabQueue.shift())) {
                if (t.delete === true) {
                  this._removeTabImpl(t);
                } else {
                  this._addTabImpl(t);
                }
              }
              this._updateScrollButtons(false);
              let child;
              while ((child = this._contentPane.lastChild)) {
                this._contentPane.removeChild(child);
              }
              for (t of this._tabs) {
                if (t.id === this._activeTabId) {
                  if (this._userTabClosing) {
                    t.root.className = o.Tabcontainer_A._TAB_ACTIVE;
                  } else {
                    t.root.className = o.Tabcontainer_A._TAB_ACTIVE_NO_CLOSE;
                  }
                  if (t.contentElement.parentElement !== null) {
                    t.contentElement.parentElement.removeChild(t.contentElement);
                  }
                  this._contentPane.appendChild(t.contentElement);
                  this._contentPane.scrollTop = t.scrollTop;
                  (function (t, scope) {
                    window.setTimeout(() => {
                      scope._contentPane.scrollTop = t.scrollTop;
                    }, 0);
                  })(t, this);
                } else {
                  t.root.className = '';
                  if (t.contentElement.parentElement !== null && t.contentElement.parentElement !== this._contentPane) {
                    t.contentElement.parentElement.removeChild(t.contentElement);
                  }
                }
              }
            }
          }, 0);
        }
      }
      _addTabImpl(t) {
        let parent = t.contentElement.parentElement;
        if (parent !== null) {
          parent.removeChild(t.contentElement);
        }
        let tab = document.createElement('div');
        let top = document.createElement('div');
        let mid = document.createElement('div');
        let bottom = document.createElement('div');
        let text1 = document.createElement('div');
        let text2 = document.createElement('div');
        text2.textContent = t.title;
        let xButton = document.createElement('div');
        tab.appendChild(top);
        tab.appendChild(mid);
        mid.appendChild(text1);
        text1.appendChild(text2);
        mid.appendChild(xButton);
        tab.appendChild(bottom);
        (function (id, scope) {
          tab.addEventListener('click', (e) => {
            scope.activeTab = id;
            e.stopPropagation();
          });
          xButton.addEventListener('click', (e) => {
            e.stopPropagation();
            if (scope._onuserclose !== null && typeof scope._onuserclose === 'function') {
              if (scope._onuserclose(id)) {
                scope.removeTab(id);
              }
            } else {
              scope.removeTab(id);
            }
          });
        })(t.id, this);
        t.root = tab;
        t.rootTitleDiv = text2;
        this._tabs.push(t);
        this._tabBar.appendChild(tab);
        if (t.makeActive || this._activeTabId === undefined) {
          this._activeTabId = t.id;
          this._updateScrollButtons(true);
        } else {
          this._updateScrollButtons(false);
        }
      }
      _removeTabImpl(t) {
        for (let x = 0; x < this._tabs.length; x++) {
          let t2 = this._tabs[x];
          if (t2.id === t.id) {
            if (t2.contentElement.parentElement !== null) {
              t2.contentElement.parentElement.removeChild(t2.contentElement);
            }
            if (t2.root.parentElement !== null) {
              t2.root.style.width = '0';
              t2.root.style.minWidth = '0';
              t2.root.style.maxWidth = '0';
              t2.root.style.margin = '0px 0px 0px 0px';
              t2.root.style.overflowX = 'hidden';
              (function (root, scope) {
                window.setTimeout(() => {
                  root.parentElement.removeChild(root);
                  window.setTimeout(() => {
                    scope._updateScrollButtons();
                  }, 200);
                }, 300);
              })(t2.root, this);
            }
            this._tabs.splice(x, 1);
            if (this._activeTabId === t2.id) {
              let newIx;
              if (
                this._tabBar.clientWidth !== this._tabBar.scrollWidth &&
                this._tabBar.scrollLeft == this._tabBar.scrollWidth - this._tabBar.clientWidth
              ) {
                newIx = x - 1;
              } else {
                newIx = x;
              }
              if (newIx < 0) {
                newIx = 0;
              } else if (newIx >= this._tabs.length) {
                newIx = this._tabs.length - 1;
              }
              if (newIx < 0 || newIx >= this._tabs.length) {
                this._activeTabId = null;
              } else {
                this._activeTabId = this._tabs[newIx].id;
              }
            }
            break;
          }
        }
      }
      _rebuild() {
        let container = document.createElement('div');
        container.className = 'fp-components-tabcontainer';
        let leftButton = document.createElement('div');
        leftButton.className = 'fp-components-tabcontainer-sidebutton';
        let rightButton = document.createElement('div');
        rightButton.className = 'fp-components-tabcontainer-sidebutton';
        let plusButton = document.createElement('div');
        plusButton.className = 'fp-components-tabcontainer-sidebutton';
        let dynSpace = document.createElement('div');
        dynSpace.className = 'fp-components-tabcontainer-dynspace';
        let tabBar = document.createElement('div');
        tabBar.className = 'fp-components-tabcontainer-tabbar';
        let tabBarOuter = document.createElement('div');
        let content = document.createElement('div');
        rightButton.style.marginLeft = '8px';
        leftButton.onclick = () => {
          this._scrollLeft();
        };
        rightButton.onclick = () => {
          this._scrollRight();
        };
        plusButton.onclick = () => {
          this._plusButtonAction();
        };
        container.appendChild(tabBarOuter);
        tabBarOuter.appendChild(leftButton);
        tabBarOuter.appendChild(tabBar);
        tabBarOuter.appendChild(rightButton);
        tabBarOuter.appendChild(plusButton);
        tabBarOuter.appendChild(dynSpace);
        container.appendChild(content);
        this._root = container;
        this._tabBarOuter = tabBarOuter;
        this._tabBar = tabBar;
        this._contentPane = content;
        this._leftButton = leftButton;
        this._rightButton = rightButton;
        this._plusButton = plusButton;
        this._anchor.appendChild(container);
        tabBar.addEventListener('scroll', (e) => {
          this._tabBarChanged();
        });
        window.addEventListener('resize', (e) => {
          this._tabBarChanged();
        });
        this._updateTabs();
        this._updatePlusButton();
        this._updateScrollButtons(false);
        this._updateOuterTabBarVisibility();
      }
    };
    o.Tabcontainer_A.VERSION = '1.5.0';
    o.Tabcontainer_A._SIDEBUTTON_ENABLED =
      ' fp-components-tabcontainer-sidebutton fp-components-tabcontainer-sidebutton-active ';
    o.Tabcontainer_A._SIDEBUTTON_DISABLED = ' fp-components-tabcontainer-sidebutton ';
    o.Tabcontainer_A._TAB_ACTIVE_NO_CLOSE =
      ' fp-components-tabcontainer-activetab fp-components-tabcontainer-activetab-noclose ';
    o.Tabcontainer_A._TAB_ACTIVE = ' fp-components-tabcontainer-activetab ';
  }
})(FPComponents);

// App SDK 1.5.0

// Copyright (c) 2020-2024 ABB

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software (the "Software"), to deal in the Software without
// restriction, including without limitation the rights to use, copy, modify,
// merge, publish, distribute, sublicense, and/or sell copies of the Software,
// and to permit persons to whom the Software is furnished to do so, subject to
// the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// The manuals related to the Software and the information therein are not
// included in these permissions and must not be reproduced, distributed,
// copied, or disclosed to third parties without ABB's written permission.
// ABB reserves all rights regarding Intellectual Property Rights in such
// manuals and information therein.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.

('use strict');

// fpComponentsLoadCSS("fp-components/fp-components-toggle-a.css");

var FPComponents = FPComponents || {};

(function (o) {
  if (!o.hasOwnProperty('Toggle_A')) {
    o.Toggle_A = class {
      constructor() {
        this._anchor = null;
        this._root = null;
        this._model = null;
        this._toggleState = [];
        this._multi = false;
        this._singleAllowNone = false;
        this._onclick = null;
      }
      get parent() {
        return this._anchor;
      }
      get model() {
        return this._model;
      }
      set model(m) {
        this._model = m;
        this._updateFromModel();
      }
      get multi() {
        return this._multi;
      }
      set multi(m) {
        this._multi = m == true;
      }
      get singleAllowNone() {
        return this._singleAllowNone;
      }
      set singleAllowNone(s) {
        this._singleAllowNone = s == true;
      }
      get onclick() {
        return this._onclick;
      }
      set onclick(o) {
        if (o !== null && typeof o !== 'function') {
          throw 'onclick must be null or a function';
        }
        this._onclick = o;
      }
      attachToId(nodeId) {
        let element = document.getElementById(nodeId);
        if (element === null) {
          console.log('Could not find element with id: ' + nodeId);
          return false;
        }
        return this.attachToElement(element);
      }
      attachToElement(element) {
        this._anchor = element;
        return this._build();
      }
      setToggled(index, toggled = null, noLimitations = false) {
        if (noLimitations) {
          if (toggled === null) {
            toggled = !this._toggleState[index];
          } else {
            toggled = toggled == true;
          }
          this._toggleState[index] = toggled;
          this._updateFromModel();
        } else {
          this._setToggled(index, toggled, false);
        }
      }
      getToggledList() {
        let ret = [];
        for (const b of this._toggleState) {
          ret.push(b);
        }
        return ret;
      }
      doToggle(index, t) {
        this._toggleState[index] = t;
        this._root.children[index].className = t ? 'fp-components-toggle-on' : '';
        this._updateIcon(index, t);
      }
      _updateIcon(index, t) {
        var container = this._root.children[index];
        var img = container.getElementsByClassName('fp-components-toggle-icon')[0];
        if (Array.isArray(this._model)) {
          var item = this._model[index];
          var icon = t ? (item.toggledIcon ? item.toggledIcon : item.icon) : item.icon;
          if (icon) {
            container.style.padding = '6px 16px 6px 16px';
            img.style.backgroundImage = `url("${icon}")`;
            img.style.marginRight = '8px';
          } else {
            container.style.padding = '6px 32px 6px 8px';
            img.style.backgroundImage = 'none';
            img.style.marginRight = 'initial';
          }
        }
      }
      _setToggled(index, toggled = null, fireCallback = false) {
        if (typeof index !== 'number' || index < 0 || index > this._toggleState.length - 1) {
          return;
        }
        if (toggled === null) {
          toggled = !this._toggleState[index];
        } else {
          toggled = toggled == true;
          if (this._toggleState[index] == toggled) {
            return;
          }
        }
        let changed = [];
        let that_ = this;
        function handleChange(index, t) {
          if (that_._toggleState[index] !== t) {
            changed.push([index, t]);
          }
        }
        if (this._multi) {
          handleChange(index, toggled);
          this.doToggle(index, toggled);
        } else {
          if (toggled) {
            handleChange(index, toggled);
            this.doToggle(index, true);
            for (let i = 0; i < this._toggleState.length; i++) {
              if (i !== index) {
                handleChange(i, false);
                this.doToggle(i, false);
              }
            }
          } else {
            if (this._singleAllowNone) {
              handleChange(index, false);
              this.doToggle(index, false);
            }
          }
        }
        if (fireCallback && this._onclick !== null && changed.length > 0) {
          let all = this.getToggledList();
          this._onclick({
            changed: changed,
            all: all,
          });
        }
      }
      isToggled(index) {
        if (typeof index !== 'number' || index < 0 || index > this._toggleState.length - 1) {
          return undefined;
        }
        return this._toggleState[index];
      }
      _updateFromModel() {
        if (this._root == null) {
          return;
        }
        while (this._root.firstChild) {
          this._root.removeChild(this._root.firstChild);
        }
        if (Array.isArray(this._model)) {
          let i = 0;
          for (const item of this._model) {
            let button = document.createElement('div');
            let img = document.createElement('div');
            let label = document.createElement('div');
            img.className = 'fp-components-toggle-icon';
            label.textContent = item.text;
            button.appendChild(img);
            button.appendChild(label);
            var that = this;
            const index = i;
            button.onclick = () => {
              that._setToggled(index, null, true);
            };
            this._root.appendChild(button);
            if (this._toggleState.length <= i) {
              this._toggleState.push(false);
            } else {
              this.doToggle(i, this._toggleState[i]);
            }
            this._updateIcon(i, this._toggleState[i]);
            i++;
          }
        }
      }
      _build() {
        while (this._anchor.firstChild) {
          this._anchor.removeChild(this._anchor.firstChild);
        }
        let root = document.createElement('div');
        root.className = 'fp-components-base fp-components-toggle';
        this._root = root;
        this._anchor.appendChild(root);
        this._updateFromModel();
      }
    };
    o.Toggle_A.VERSION = '1.5.0';
  }
})(FPComponents);
window.RWS = window.RWS || RWS;
window.App = window.App || App;
window.FPComponents = window.FPComponents || FPComponents;
