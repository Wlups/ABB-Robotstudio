import API from './ecosystem-base.js';
import {factoryApiCfg} from './ecosystem-cfg.js';
import {factoryApiFile} from './ecosystem-file.js';
import {factoryApiMotion} from './ecosystem-motion.js';
import {factoryApiRapid} from './ecosystem-rapid.js';
import {factoryApiRws} from './ecosystem-rws.js';
import {factoryApiSignalMonitor} from './ecosystem-signal.js';
import {factoryApiVariableMonitor} from './ecosystem-variable.js';
import {factoryApiWebdataMonitor} from './ecosystem-webdata.js';
import {factoryApiUasManagement} from './ecosystem-uas.js';

import {factoryApiNetwork, overrideNetwork} from './ecosystem-remote.js';

if (typeof API.constructedCfg === 'undefined') {
  factoryApiCfg(API);
}

if (typeof API.constructedFile === 'undefined') {
  factoryApiFile(API);
}

if (typeof API.constructedMotion === 'undefined') {
  factoryApiMotion(API);
}

if (typeof API.constructedRapid === 'undefined') {
  factoryApiRapid(API);
}

if (typeof API.constructedRWS === 'undefined') {
  factoryApiRws(API);
}

if (typeof API.constructedNetwork === 'undefined') {
  factoryApiNetwork(API);
}

if (typeof API.constructedSignalMonitor === 'undefined') {
  factoryApiSignalMonitor(API);
}

if (typeof API.constructedVariableMonitor === 'undefined') {
  factoryApiVariableMonitor(API);
}

if (typeof API.constructedWebdataMonitor === 'undefined') {
  factoryApiWebdataMonitor(API);
}

if (typeof API.constructUasManagement === 'undefined') {
  factoryApiUasManagement(API);
}

export default API;
export {overrideNetwork};
