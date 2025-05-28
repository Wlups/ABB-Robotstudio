// used to append interfaces to omnicore sdk so that created app and AppStudio can use
import API from './ecosystem-base.js';
import {Logger} from './../function/log-helper.js';

const factoryApiUasManagement = function (es) {
  let logModule = 'ecosystem-uas';
  /**
   * @alias API.UAS
   * @namespace
   */
  es.UAS = new (function () {
    /**
     * Enum for all user grants
     * @readonly
     * @enum {string}
     * @memberof API.UAS
     */
    this.USERGRANTLIST = {
      //default
      UAS_CFG_WRITE: 'UAS_CFG_WRITE',
      UAS_BACKUP: 'UAS_BACKUP',
      UAS_CALIBRATE: 'UAS_CALIBRATE',
      UAS_CONTROLLER_PROPERTIES_WRITE: 'UAS_CONTROLLER_PROPERTIES_WRITE',
      UAS_EVENTLOG_CLEAR: 'UAS_EVENTLOG_CLEAR',
      UAS_FILE_ACCESS_READ: 'UAS_FILE_ACCESS_READ',
      UAS_FILE_ACCESS_READ_WRITE: 'UAS_FILE_ACCESS_READ_WRITE',
      UAS_IO_WRITE: 'UAS_IO_WRITE',
      UAS_REMOTE_WARMSTART: 'UAS_REMOTE_WARMSTART',
      UAS_RESTORE: 'UAS_RESTORE',
      UAS_RAPID_EDIT: 'UAS_RAPID_EDIT',
      UAS_RAPID_LOADPROGRAM: 'UAS_RAPID_LOADPROGRAM',
      UAS_RAPID_MODPOS: 'UAS_RAPID_MODPOS',
      UAS_RAPID_EXECUTE: 'UAS_RAPID_EXECUTE',
      UAS_RAPID_DEBUG: 'UAS_RAPID_DEBUG',
      UAS_SYSTEM_ADMINISTRATION: 'UAS_SYSTEM_ADMINISTRATION',
      UAS_SPEED_DECREASE: 'UAS_SPEED_DECREASE',
      UAS_RAPID_CURRVALUE: 'UAS_RAPID_CURRVALUE',
      UAS_REVOLUTION_COUNTER_UPDATE: 'UAS_REVOLUTION_COUNTER_UPDATE',
      UAS_SYSUPDATE: 'UAS_SYSUPDATE',
      UAS_REMOTE_LOGIN: 'UAS_REMOTE_LOGIN',
      UAS_NETWORK_SECURITY: 'UAS_NETWORK_SECURITY',
      UAS_REMOTE_MOUNT_FILE_ACCESS_READ_WRITE: 'UAS_REMOTE_MOUNT_FILE_ACCESS_READ_WRITE',
      // safety
      UAS_REMOTE_START_STOP_IN_AUTO: 'UAS_REMOTE_START_STOP_IN_AUTO',
      // file access in RW6
      UAS_FTP_READ: 'UAS_FTP_READ',
      UAS_FTP_WRITE: 'UAS_FTP_WRITE',
    };

    /**
     * Functions which has grant requirements
     * @alias GRANTTYPES
     * @memberof API.UAS
     * @readonly
     * @enum {number}
     */
    this.GRANTTYPES = {
      loadModule: 1,
      deploy: 2,
      updatePosition: 3,
      ioWrite: 4,
      editRAPID: 5,
      executeProgram: 6,
    };

    /**
     * Update user grants
     * @alias getUserGrants
     * @memberof API.UAS
     * @returns {Promise<string[]>}
     * @example
     * await API.UAS.getUserGrants()
     */
    this.getUserGrants = async function () {
      // get logged user name
      let loginInfo = await RWS.UAS.getUser();
      let userName = loginInfo['name'];

      let userGrants = await API.RWS.UAS.getGrantsOfUser(userName);

      return userGrants;
    };

    /**
     * Check if logged in user has function-required grants
     * @alias getUserGrants
     * @memberof API.UAS
     * @param {API.UAS.GRANTTYPES} [type] funciton types
     * @returns {Promise<boolean>}
     * @example
     * await API.UAS.hasSpecificGrants(API.UAS.GRANTTYPES.loadModule)
     */
    this.hasSpecificGrants = async function (type) {
      this.userGrants = await this.getUserGrants();

      let requiredGrants = [];

      switch (type) {
        case this.GRANTTYPES.loadModule:
          requiredGrants = [this.USERGRANTLIST.UAS_FILE_ACCESS_READ_WRITE, this.uasGrantList.UAS_RAPID_LOADPROGRAM];
          break;
        case this.GRANTTYPES.deploy:
          requiredGrants = [this.USERGRANTLIST.UAS_FILE_ACCESS_READ_WRITE];
          break;
        case this.GRANTTYPES.updatePosition:
          requiredGrants = [this.USERGRANTLIST.UAS_RAPID_CURRVALUE];
          break;
        case this.GRANTTYPES.ioWrite:
          requiredGrants = [this.USERGRANTLIST.UAS_IO_WRITE];
          break;
        case this.GRANTTYPES.editRAPID:
          requiredGrants = [this.USERGRANTLIST.UAS_RAPID_EDIT];
          break;
        case this.GRANTTYPES.executeProgram:
          requiredGrants = [this.USERGRANTLIST.UAS_RAPID_EXECUTE];
          break;
        default:
          break;
      }
      return requiredGrants.every((grant) => this.userGrants.includes(grant));
    };
  })();

  es.constructUasManagement = true;
};

if (typeof API.constructUasManagement === 'undefined') {
  factoryApiUasManagement(API);
}

export default API;
export {factoryApiUasManagement};
