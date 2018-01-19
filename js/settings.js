console.log(chrome.i18n.getMessage("app_name") + ": init settings.js");

window.addEventListener('load', (evt) => {

   const App = {
      // debug: true,

      getUI: {
         bthSave: document.getElementById('bth-save-settings'),
         keySendEnter: document.getElementById('keySendEnter'),
      },

      // Saves options to localStorage/chromeSync.
      saveOptions: function (k) {
         var optionsSave = {};
         // optionsSave['keySendEnter'] = App.getUI.keySendEnter.checked ? true : false;
         optionsSave['keySendEnter'] = App.getUI.keySendEnter.value;
         Storage.setParams(optionsSave, false /*local*/ );

         // k.innerHTML = chrome.i18n.getMessage("opt_bth_save_process");
         k.innerHTML = chrome.i18n.getMessage("opt_bth_save_settings_processed");
         // k.classList.add("disabled");
         // k.classList.add("in-progress");
         setTimeout(function () {
            k.innerHTML = chrome.i18n.getMessage("opt_bth_save_settings");
            // k.classList.toggle("in-progress");
            // k.classList.remove("disabled");
         }, 1500);
         chrome.runtime.reload();
      },

      init: function () {
         var callback = (res) => Storage.restoreOptions(res);
         Storage.getParams(null, callback, false /*local*/ );
      },

      log: (msg, arg1) => {
         if (App.debug) console.log('[+] ' + msg.toString(), arg1 || '')
      }
   }

   App.init();

   App.getUI.bthSave.addEventListener("click", function () {
      App.saveOptions(this)
   });
});
