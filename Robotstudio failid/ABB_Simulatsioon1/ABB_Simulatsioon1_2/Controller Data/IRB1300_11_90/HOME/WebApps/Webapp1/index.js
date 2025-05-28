
  
  import { App } from "./app.js"
  
  import TranslationResources from './locales/langs/index.js'
  // import { fpComponentsEnableLog } from "./omnicore-sdk.js";

  window.addEventListener('load', async function () {
    // RWS.setDebug(1, 0)
    fpComponentsEnableLog();
    RWS.initCache();
    await RWS.init();
    let language = 'en';
    try {
      const ctrlLanguage = await API.CONTROLLER.getLanguage();
      if(TranslationResources[ctrlLanguage]) {
        language = ctrlLanguage;
      }
    } catch (e) {
      console.error(e);
    }
    i18next.init({
      lng: language,
      debug: true,
      resources: TranslationResources,
    });
    TComponents.Component_A.setLanguageAdapter(i18next);

    const app = await new App(document.getElementById("root")).render()
  });
  