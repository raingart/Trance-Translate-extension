console.log(chrome.i18n.getMessage("app_name") + ": init background.js");

var Core = {
      createContextMenu: function (menuItemId) {
         chrome.contextMenus.create({
            id: menuItemId || 'test',
            title: chrome.i18n.getMessage("translate_context_menu"),
            contexts: ["selection"]
         });
      },

      notify: function (title, msg, icon) {
         var manifest = chrome.runtime.getManifest();
         chrome.notifications.create('info', {
            type: 'basic',
            iconUrl: icon || manifest.icons['48'], //48,128
            title: title || chrome.i18n.getMessage("app_name"),
            // "priority": 2,
            message: msg || ''
         }, function (notificationId) {
            chrome.notifications.onClicked.addListener(function (callback) {
               chrome.notifications.clear(notificationId);
               // chrome.notifications.clear(notificationId, callback);
            });
         });
      },

      translate: function (textToTranslate) {
         var textToTranslate = textToTranslate.trim();
         var dispatch = {
            from_language: Core.conf.fromLang,
            to_language: Core.conf.toLang,
            original_text: textToTranslate,
         };

         if (textToTranslate.length > 200) { //max notifyCallback symbols 
            GoogleTS_API.toWeb(dispatch);
         } else {
            var notifyCallback = function (params) {
               Core.notify(chrome.i18n.getMessage("app_short_name") +
                  ' [' + /*params.detectLang*/ Core.conf.fromLang + ' > ' + Core.conf.toLang + ']',
                  params.translated_text);
            };
         GoogleTS_API.toTranslate(dispatch, notifyCallback);
      }
   },

   loadDefaultSettings: function (res) {
      Core.conf = {};
      Core.conf.fromLang = res['lang-from'] && res['lang-from'].charAt(0) == '~' ? "auto" : res['lang-from'];
      Core.conf.toLang = res['lang-to'] || "en";
      console.log('loadDefaultSettings', JSON.stringify(Core.conf));
   },

   init: function () {
      console.log('Core init');

      var callback = function (res) {
         Core.loadDefaultSettings(res);
         Core.createContextMenu('selection-translate-google');
      };
      Storage.getParams(null, callback, false);
   },
};

// Register the event handlers.
chrome.contextMenus.onClicked.addListener(function (clickData, tab) {
   // console.log('clickData.menuItemId:', clickData.menuItemId);
   if (clickData.menuItemId == "selection-translate-google") {
      Core.translate(clickData.selectionText);
   }
   // else if (clickData.menuItemId == "test") {
   //    alert('clickData.menuItemId:\n'+ clickData.menuItemId)
   // }
});

// when install or update new version fired
// chrome.runtime.onInstalled && chrome.runtime.onInstalled.addListener(function(detail) {
//    if (detail.reason === 'update') {
//  if(parseInt(detail.previousVersion.replace(/\./g, '')) < 213) { // (v2.1.3)
//      chrome.storage.local.clear();
//      alert('app updated');
//  }
//    }
// });

// when update available
// chrome.runtime.onUpdateAvailable && chrome.runtime.onUpdateAvailable.addListener(function(detail) {
//    console.log(`Have a new version:${detail.version}`);
//    chrome.runtime.reload(); // install new version soon
// });

Core.init();
