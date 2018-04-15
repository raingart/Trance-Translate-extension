console.log(i18n("app_name") + ": init eventListener.js");

let UI = {};

// When the popup HTML has loaded
window.addEventListener('load', (evt) => {

   UI = {
      translatedFrom: document.getElementsByName('lang-from')[0],
      translatedTo: document.getElementsByName('lang-to')[0],
      textOriginal: document.getElementsByName('text-original')[0] || document.querySelectorAll('textarea')[0],
      textTranslated: document.getElementsByName('text-translated')[0] || document.querySelectorAll('textarea')[1],
      exchangeLang: document.getElementsByName('bth-lang-exchange')[0],
      textToSpeakIn: document.getElementById('btn-text-to-speak-in'),
      textToSpeakOut: document.getElementById('btn-text-to-speak-out'),
      bthTranslate: document.getElementsByName('bth-translate')[0],
      bthOpenSettings: document.getElementsByName('bth-open-settings')[0]
   }

   App.init();

   // mouse move event
   //    document.addEventListener('mousemove', function(e) {
   //       mouseX = e.clientX;
   //       mouseY = e.clientY;
   //       pageX = e.pageX;
   //       pageY = e.pageY;
   //   }, false);


   // Attach the event handlers for nav, hint and insert features
   // document.addEventListener('keydown', handleNavKeys, true);
   // document.addEventListener('keyup', handleLinkKey, true);
   document.addEventListener('keydown', async (e) => {
      // if (e.altKey && e.which == 13)
      if (e.altKey && e.key.toLowerCase() == 'enter')
         App.speakPlay(UI.textToSpeakIn, {
            textToSpeak: UI.textOriginal.value,
            to_language: UI.translatedFrom.value.replace(/~/, ''), //clear prefix temp lang 
         });
      else if (e.shiftKey && e.ctrlKey)
         App.exchangeLanguages();
   });

   // Register the event handlers.
   UI.textOriginal.addEventListener("keydown", async (e) => {
      App.log('e:', e);

      let currentKeys = [];
      let storeKeys = App.tempSync.hotkeySend ? App.tempSync.hotkeySend.toLowerCase() : 'enter';

      if (e.ctrlKey && e.which == 13) { //ctrl
         currentKeys.push('ctrl')
         currentKeys.push('enter');
      } else if (e.shiftKey && e.which == 13) { //shift
         currentKeys.push('shift')
         currentKeys.push('enter');
      } else if (e.altKey) //alt
         currentKeys.push('alt');
      else if (e.which == 13) //enter
         currentKeys.push('enter');

      currentKeys = currentKeys.join("-").toString().toLowerCase();
      App.log('currentKeys ' + currentKeys);
      console.log('currentKeys ' + currentKeys);

      // key is press
      if (currentKeys == storeKeys) {
         console.log('hit: ' + storeKeys + '(setting)==' + currentKeys + '(now)');
         App.translate()
         e.preventDefault(); //prevent default behavior
      }
   });

   UI.textOriginal.addEventListener("input", function () {
      App.autoHeightTag(this);
   });

   // UI.textToSpeakIn.onclick = async(event) => {
   UI.textToSpeakIn.addEventListener("click", function () {
      App.speakPlay(this, {
         textToSpeak: UI.textOriginal.value,
         to_language: UI.translatedFrom.value.replace(/~/, ''), //clear prefix temp lang 
      });
   });

   UI.textToSpeakOut.addEventListener("click", function () {
      App.speakPlay(this, {
         textToSpeak: UI.textTranslated.value.split(/(\n\w+:\n1.)/)[0],
         to_language: UI.translatedTo.value,
      });
   });

   UI.exchangeLang.addEventListener("click", App.exchangeLanguages, false);

   UI.bthTranslate.addEventListener("click", function () {
      App.translate();

      this.classList.add("disabled");
      setTimeout(() => {
         this.classList.remove("disabled");
      }, 500);
   });

   UI.bthOpenSettings.addEventListener("click", function () {
      let iframeId = document.querySelectorAll('iframe')[0];
      iframeId.classList.toggle("hide");
      if (iframeId.src === '') {
         const manifest = chrome.runtime.getManifest();
         iframeId.src = manifest.options_page || options_ui.page;
      }

      iframeId.addEventListener('load', function () {
         App.autoHeightTag(this);
      })
   });

});
