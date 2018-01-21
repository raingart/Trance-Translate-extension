console.log(chrome.i18n.getMessage("app_name") + ": init background.js");

var Core = {
   // createContextMenu: function (menuItemId) {
   //    chrome.contextMenus.create({
   //       id: menuItemId || 'test',
   //       title: chrome.i18n.getMessage("translate_context_menu"),
   //       contexts: ["selection"]
   //    });
   // },

   translate_source: {
      toText: GoogleTS_API.toText,
      toPage: GoogleTS_API.toPage,
      toWeb: GoogleTS_API.toWeb
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

   validURL: (str) => {
      var regex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
      if (!regex.test(str)) {
         console.log("Not valid URL", str);
         return false;
      } else
         return true;
   },

   translatePage: () => {
      chrome.tabs.query({
         active: true,
         lastFocusedWindow: true
      }, (tabs) => {
         var tab = tabs[0];
         if (Core.validURL(tab.url)) {
            Core.translate_source.toPage({
               to_language: Core.conf.toLang,
               url: tab.url
            });
         } else
            alert(chrome.i18n.getMessage("msg_not_access_tab"));
      });
   },

   translateSelection: function (text) {
      var text = text.trim();
      
      var dispatch = {
         from_language: Core.conf.fromLang,
         to_language: Core.conf.toLang,
         original_text: text,
      };

      if (text.length > 200) { //max notifyCallback symbols 
         Core.translate_source.toWeb(dispatch);
      } else {
         var notifyCallback = function (params) {
            Core.notify(chrome.i18n.getMessage("app_short_name") +
               ' [' + /*params.detectLang*/ Core.conf.fromLang + ' > ' + Core.conf.toLang + ']',
               params.translated_text);
         };
         Core.translate_source.toText(dispatch, notifyCallback);
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
         // Core.createContextMenu('selection-translate-google');

         chrome.contextMenus.create({
            id: 'translate-selection',
            title: chrome.i18n.getMessage("context_menu_selection"),
            contexts: ["selection"]
         });
         chrome.contextMenus.create({
            id: 'translate-page',
            title: chrome.i18n.getMessage("context_menu_page"), 
            // onclick: getword,
         });

      };
      Storage.getParams(null, callback, false);
   },
};

Core.init();

// Register the event handlers.
chrome.contextMenus.onClicked.addListener(function (clickData, tab) {
   // console.log('clickData.menuItemId:', clickData.menuItemId);
   switch (clickData.menuItemId) {
      case 'translate-selection':
         Core.translateSelection(clickData.selectionText);
         break;
      case 'translate-page':
         Core.translatePage();
         break;
      // case 'test':
      //    alert('clickData.menuItemId:\n' + clickData.menuItemId)
      //    break;
         // default:
         //   console.log('Sorry, we are out of ' + expr + '.');
   }
});

var manifest = chrome.runtime.getManifest();
var uninstallUrl = "https://docs.google.com/forms/d/e/1FAIpQLSdgDabLtk8vapLTEXKoXucHVXLrDujBrXZg418mGrLE0zND2g/viewform?usp=pp_url&entry.1936476946&entry.1337380930&entry.1757501795=";
uninstallUrl += encodeURIComponent(manifest.short_name + ' (v' + manifest.version + ')');

chrome.runtime.setUninstallURL(uninstallUrl, function (details) {
   var lastError = chrome.runtime.lastError;
   if (lastError && lastError.message) {
      console.warn("Unable to set uninstall URL: " + lastError.message);
   } else {
      // The url is set
   }
});
