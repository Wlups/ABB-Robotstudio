import {API, TComponents, overrideNetwork, Logger} from './index.js';

((root) => {
  console.log('✔', 'Ecosystem-Framework: Loading API and TComponents...');
  root.API = API;
  root.TComponents = TComponents;
  root.overrideNetwork = overrideNetwork;
  root.Logger = Logger;
})(self !== undefined ? self : this);

export {API, TComponents, overrideNetwork};
