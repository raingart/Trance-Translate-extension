console.log(chrome.i18n.getMessage("app_name") + ": init settings.js");

window.addEventListener('load', (evt) => {

   const App = {
      // debug: true,

      getUI: {
         bthSave: document.getElementById('bth-save-settings'),
         hotkeySend: document.getElementById('hotkeySend'),
      },

      bthAnimation: function (k) {
         k.innerHTML = chrome.i18n.getMessage("opt_bth_save_settings_process");
         k.classList.add("disabled");
         k.classList.add("in-progress");
         setTimeout(function () {
            k.innerHTML = chrome.i18n.getMessage("opt_bth_save_settings_processed");
            k.classList.remove("in-progress");
         }, 1000);
         setTimeout(function () {
            k.innerHTML = chrome.i18n.getMessage("opt_bth_save_settings");
            // k.classList.toggle("in-progress");
            k.classList.remove("disabled");
            chrome.runtime.reload();
         }, 2000);
      },

      // Saves options to localStorage/chromeSync.
      saveOptions: function (b) {
         var optionsSave = {};
         optionsSave['hotkeySend'] = App.getUI.hotkeySend.value;

         // Storage.setParams(optionsSave, false /*local*/ );
         Storage.setParams(optionsSave, true /*sync*/ );

         App.bthAnimation(b)
      },

      init: function () {
         var callback = (res) => Storage.restoreOptions(res);
         Storage.getParams(null, callback, false /*local*/ );
      },

      log: (msg, arg1) => {
         var arg1 = arg1 === undefined ? '' : arg1;
         if (App.debug) console.log('[+] ' + msg.toString().trim(), arg1)
      },
   }

   App.init();

   App.getUI.bthSave.addEventListener("click", function () {
      App.saveOptions(this)
   });

   document.getElementById('donate').addEventListener("click", function (e) {
      const manifest = chrome.runtime.getManifest();
      var payment = '1DbKD1rQXobztpsqx2dPZeMz1nKyRJCm9b';
      // if (window.prompt("BTC payment:", payment))
      var url = 'https://blockchain.info/payment_request?address=' + payment;
      url += '&message=' + encodeURIComponent(manifest.short_name) + '+project';
      var win = window.open(url, '_blank');
   });
});
