/* eslint-disable no-prototype-builtins */
// extension of RWS for support of external client access
// load this file just after rws-api/omnicore-rws.js to overwrite RWS.Network.send method
import API from './ecosystem-base.js';
import {Logger} from './../function/log-helper.js';

const RMMPStatus = {
  GRANTED: 'GRANTED',
  PENDING: 'PENDING',
  REJECTED: 'REJECTED',
};

const logModule = 'ecosystem-remote';

export const factoryApiNetwork = function (n) {
  /**
   * @alias API.NETWORK
   * @namespace
   * @private
   */
  n.NETWORK = new (function () {
    this._connected = true;
    this.heartBeatTimer = 30000;

    /**
     * mount the RWS
     * @alias mountRWS
     * @memberof API.NETWORK
     *
     * @example
     * API.NETWORK.mountRWS()
     */
    this.mountRWS = function () {
      // omnicore-rws.js
      RWS.init();
      // rapiddata-rws.js
      RWS.initCache();
    };

    /**
     * unmount the RWS
     * @alias unmountRWS
     * @memberof API.NETWORK
     *
     * @example
     * API.NETWORK.unmountRWS()
     */
    this.unmountRWS = async function () {
      try {
        await API.RWS.releaseMastership();
      } catch (error) {
        return API.rejectWithStatus('Failed to release all mastership requests.', error);
      }

      // // omnicore-rws.js
      // RWS.__unload = true;
      // RWS.Subscriptions.unsubscribeToAll();
    };

    this.onStatusChanged = function (callback) {
      API._events.on('statusChanged', callback);
    };

    Object.defineProperty(this, 'connected', {
      get: function () {
        return this._connected;
      },
      set: function (value) {
        this.heartBeatTimer = value ? 30000 : 2000;
        if (this._connected !== value) {
          this._connected = value;
          API._events.trigger('statusChanged', value);
        }
      },
    });
  })();

  n.constructedNetwork = true;
};

if (typeof API.constructeNetwork === 'undefined') {
  factoryApiNetwork(API);
}

export default API;
export function overrideNetwork(baseUrl) {
  // if (isElectron) {
  RWS.Network.heartBeatTimer = null;
  RWS.Network.heartBeat = () => {
    RWS.Network.get('/').then(
      (msg) => {},
      (error) => RWS.writeDebug(`Heartbeat Failed.`, 3),
    );
    if (RWS.Network.heartBeatTimer) {
      clearTimeout(RWS.Network.heartBeatTimer);
    }
    RWS.Network.heartBeatTimer = setTimeout(RWS.Network.heartBeat, 3e4);
  };

  RWS.Network.send = (method, path, requestHeaders = {}, body = null) => {
    // ---------- dependencies of RWS --------------
    const HTTP_REQUEST_TIMEOUT = 30000;
    var errorCodeCache = {};

    function parseJSON(json) {
      try {
        return JSON.parse(json);
      } catch (error) {
        RWS.writeDebug(`Failed to parse JSON. >>> ${error}`, 0);
        return undefined;
      }
    }

    function verifyReturnCode(json) {
      return new Promise((resolve, reject) => {
        try {
          if (Object.prototype.hasOwnProperty.call(json, 'state') === false) return resolve(undefined);

          let errors = [];
          let returnValues = {};
          for (let iii = 0; iii < json.state.length; iii++) {
            let item = json.state[iii];

            for (let subitem in item) {
              if (Object.prototype.hasOwnProperty.call(item[subitem], '_links')) {
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
                      RWS.Network.get(errUrl)
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
                          RWS.writeDebug(errStr, 3);
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
          RWS.writeDebug(`Failed to get error code. >>> ${error}`, 2);
          return resolve(undefined);
        }
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
          RWS.writeDebug(`Could not parse JSON error code. >>> ${text}`, 2);

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
        RWS.writeDebug(errStr, 0);
        return Promise.reject(errStr);
      }

      return getStatusCode(code);
    }

    function getStatusCode(code) {
      let url = `/rw/retcode?code=${encodeURIComponent(code)}`;
      if (errorCodeCache.hasOwnProperty(url)) {
        return Promise.resolve(errorCodeCache[url]);
      } else {
        return RWS.Network.get(url)
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
            let errStr = `Failed to get error code, url '${url}'. >>> ${err}`;
            RWS.writeDebug(errStr, 3);
            return Promise.reject(errStr);
          });
      }
    }

    function getReponseAsJSON(request) {
      return parseJSON(request.responseText);
    }

    // ---------------------------------------------

    return new Promise((resolve, reject) => {
      let req = new XMLHttpRequest();
      if (RWS.__unload !== true) {
        req.timeout = HTTP_REQUEST_TIMEOUT;
      }

      req.ontimeout = () => {
        RWS.writeDebug('Request timed out.', 2);
        reject('RWS request timed out.');
      };

      req.onerror = (res) => {
        RWS.writeDebug(`Send error. ${method + ' ' + path}`, 2);
        reject('Send error.');
      };

      req.onreadystatechange = () => {
        if (req.readyState === 4) {
          if (req.status === 0) return;

          if (Math.floor(req.status / 100) !== 2) {
            let r = {
              message: '',
              httpStatus: {code: req.status, text: req.statusText},
            };

            if (req.responseText !== null && req.responseText !== '') {
              return verfifyErrorCode(req.responseText)
                .then((x) => {
                  let call = body === null ? path : `${path} ${body}`;
                  if (x.severity.toLowerCase() === 'error') {
                    RWS.writeDebug(`RWS call '${call}', ${x.severity}: ${x.name}, '${x.description}'`, 1);
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
                    RWS.writeDebug(
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
        req.open(method, baseUrl + path, RWS.__unload === true ? false : true);

        for (var key in requestHeaders) {
          var value = requestHeaders[key];
          req.setRequestHeader(key, value);
        }
        if (body !== null) req.send(body);
        else req.send();
      } catch (exception) {
        reject('😡 Error during communication with RWS! Exception: ' + exception.message);
        return;
      }
    }).catch((err) => Promise.reject(err));
  };

  RWS.Network.unmountRWS = async function () {
    try {
      await RWS.Mastership.release(true);
    } catch (error) {
      return API.rejectWithStatus('Failed to release all mastership requests.', error);
    }
  };

  RWS.Subscriptions.UnSubscribeAS = (groupId) => {
    return fetch(baseUrl + '/subscription/' + groupId, {
      method: 'DELETE',
      keepalive: true,
      headers: {
        Accept: 'application/hal+json;v=2.0',
      },
    });
  };
  // below only work for AppStudio, not for in TPU
  RWS.Mastership.request = async () => {
    Logger.i(logModule, `requesting edit msh`);
    let _isInAutoMode = false;
    var _opmode = await RWS.Controller.getOperationMode();
    _isInAutoMode = _opmode === API.CONTROLLER.OPMODE.Auto;
    const parsedMsh = await RWS.Mastership.getStatus();
    if (parsedMsh.mastership == 'nomaster') {
      await RWS.Network.post('/rw/mastership/edit/request');
    } else if (parsedMsh.mastershipheldbyme && parsedMsh.mastershipheldbyme == 'TRUE') {
      return;
    } else {
      // when non-auto & a local client exists
      if (!_isInAutoMode) {
        try {
          await RWS.Mastership.reqRMMP();
          await API.sleep(1000);
          await RWS.Mastership.pollRMMPState();
        } catch (error) {
          Logger.w(logModule, `Could not request edit Mastership in manual mode. >>> request RMMP failed`);
          throw new Error('request RMMP failed');
        }
        await RWS.Network.post('/rw/mastership/edit/request');
      } else {
        // cannot request access when it is held by others in auto mode
        Logger.w(logModule, `Could not request edit Mastership in auto mode. >>> edit mastership is held by others`);
        throw new Error('edit mastership is held by others');
      }
    }
  };

  /**
   * Release edit mastership: only used for AppStudio
   * @memberof API.Mastership
   * @param {boolean} [bImplicit] For AppStudio, edit mastership is not supposed to be released in most cases; Set bImplicit to true to release edit msh forcely
   */
  RWS.Mastership.release = async (bImplicit = false) => {
    if (!bImplicit) return;
    const parsedMsh = await RWS.Mastership.getStatus();
    if (parsedMsh.mastershipheldbyme && parsedMsh.mastershipheldbyme == 'TRUE') {
      await RWS.Network.post('/rw/mastership/edit/release');
      await RWS.Mastership.relRMMP();
    }
  };

  RWS.Mastership.getStatus = async () => {
    const mshStatus = await RWS.Network.get('/rw/mastership/edit');
    const parsedMsh = JSON.parse(mshStatus.responseText).state[0];
    return parsedMsh;
  };

  RWS.Mastership.reqRMMP = async () => {
    var resRMMP = await RWS.Mastership.getRMMPState();
    if (resRMMP['rmmpheldbyme'] === 'false') {
      await RWS.Mastership.requestRMMP();
    } else if (resRMMP['rmmpheldbyme'] === 'true' && resRMMP['privilege'] != 'none') {
      // TODO: confirm if it is offical way to handle the case where TPU revoke the msh
      // The reason why add "privilege" is that it cannot request msh when rmmpheldbyme is true and privilege is 'modify'
      await RWS.Mastership.relRMMP();
      await RWS.Mastership.requestRMMP();
    }
  };

  RWS.Mastership.relRMMP = async () => {
    try {
      let resRMMP = await RWS.Mastership.getRMMPState();
      if (resRMMP['rmmpheldbyme'] === 'false') {
        return;
      } else if (resRMMP['rmmpheldbyme'] === 'true') {
        try {
          await RWS.Mastership.releaseRMMP();
        } catch (error) {
          Logger.w(logModule, `Could not request edit Mastership in manual mode. >>> release RMMP failed`);
          throw new Error('release RMMP failed');
        }
      }
    } catch (error) {
      Logger.w(logModule, `Could not request edit Mastership in manual mode. >>> get RMMP state failed`);
      throw new Error('get RMMP state failed');
    }
  };

  RWS.Mastership.getRMMPState = async () => {
    let rmmpStates = await RWS.Network.get('/users/rmmp');
    return JSON.parse(rmmpStates.responseText)['state'][0];
  };

  RWS.Mastership.requestRMMP = async (type = 'modify') => {
    await RWS.Network.post('/users/rmmp', `privilege=${type}`);
  };

  RWS.Mastership.pollRMMPStatus = async () => {
    let rmmpStates = await RWS.Network.get('/users/rmmp/poll');
    return JSON.parse(rmmpStates.responseText)['state'][0];
  };

  RWS.Mastership.releaseRMMP = async () => {
    return await RWS.Network.post('/users/rmmp/cancel', '');
  };

  RWS.Mastership.pollRMMPState = () => {
    return new Promise((resolve, reject) => {
      let timeout = 500;
      let poller = setInterval(async function () {
        try {
          var rmmp = await RWS.Mastership.pollRMMPStatus();
        } catch (error) {
          clearInterval(poller);
          Logger.w(logModule, `Could not request edit Mastership in manual mode. >>> Failed to poll RMMP status!`);
          reject('Failed to poll RMMP status!');
          return;
        }
        let rmmpStatus = rmmp.status;
        switch (rmmpStatus) {
          case RMMPStatus.GRANTED:
            clearInterval(poller);
            resolve(true);
            break;
          case RMMPStatus.REJECTED:
            clearInterval(poller);
            Logger.w(logModule, `Could not request edit Mastership in manual mode. >>> RMMP rejected by local client!`);
            reject('RMMP rejected');
            break;
          case RMMPStatus.PENDING:
            timeout -= 1; // 1000ms/1. 200ms/0.2.
            if (timeout < 0) {
              await RWS.Mastership.relRMMP();
              clearInterval(poller);
              Logger.w(
                logModule,
                `Could not request edit Mastership in manual mode. >>> RMMP request pending timeout!`,
              );
              reject('Pending timeout');
            }
            break;
          default:
        }
      }, 200);
    });
  };
}
