console.log(i18n("app_name") + ": init background.js");

const Core = {

   translateProvider: {
      toText: translateAPI['Google'].toText,
      toUrl: translateAPI['Google'].openNewTab,
      toWeb: translateAPI['Google'].toWeb
   },

   showNotification: (title, msg, icon) => {
      const manifest = chrome.runtime.getManifest();

      chrome.notifications.create('info', {
         type: 'basic', //'basic', 'image', 'list', 'progress'
         iconUrl: typeof (icon) === 'undefined' ? manifest.icons['48'] : '/icons/' + icon,
         title: title || i18n("app_name"),
         message: msg || '',
         // "priority": 2,
      }, function (notificationId) {
         chrome.notifications.onClicked.addListener(function (callback) {
            chrome.notifications.clear(notificationId, callback);
         });
      });
   },

   translatePage: () => {
      chrome.tabs.query({
         active: true,
         lastFocusedWindow: true
      }, (tabs) => {
         let tab = tabs[0];
         if (Core.isLink(tab.url)) {
            Core.translateProvider.toUrl({
               to_language: Core.conf.toLang,
               url: tab.url
            });
         } else
            alert(i18n("msg_not_access_tab"));
      });
   },

   translateToNotification: (str = required()) => {
      let text = str.toString().trim();

      let dispatch = {
         from_language: Core.conf.fromLang,
         to_language: Core.conf.toLang,
         original_text: text,
      };

      if (text.length > 200) { //max notifyCallback symbols 
         Core.translateProvider.toWeb(dispatch);

      } else {
         let notifyCallback = function (params) {
            Core.showNotification(i18n("app_short_name") +
               ' [' + /*params.detectLang*/ Core.conf.fromLang + ' > ' + Core.conf.toLang + ']', params.translated_text);
         };
         Core.translateProvider.toText(dispatch, notifyCallback);
      }
   },

   // selectionIndicator: () => {
   //       let selected = window.getSelection().toString();
   //       // let icon = selected.length ? '' : manifest.icons['16'];
   //       let icon = selected.length ? 'y' : 'n';

   //       // chrome.browserAction.setIcon({ path: icon });
   //       chrome.browserAction.setBadgeText({ text: icon });
   // },

   createContextMenu: () => {
      chrome.contextMenus.create({
         id: 'translate-context',
         title: i18n("context_menu_selection"),
         contexts: ["selection"]
      });
      chrome.contextMenus.create({
         id: 'translate-page',
         title: i18n("context_menu_page"),
         // onclick: getword,
      });
   },

   commandRun: (command, callback) => {
      switch (command) {
         case 'translate-context':
            let text = typeof callback === 'string' ? callback : false;
            Core.translateToNotification(text);
            break;
         case 'translate-hotkey':
            Core.getSelectionText(Core.translateToNotification);
            break;
         case 'translate-page':
            Core.translatePage();
            break;
         default:
            console.warn('Sorry, we are out of ' + command + '.');
      }
   },

   isLink: (link) => {
      return (/http:|https:|ftp:/.test(link.split('/')[0])) ? true : false;
   },

   getSelectionText: (callback) => {
      // chrome.tabs.query({active: true, currentWindow: true}, (tab) => {
      chrome.tabs.getSelected(null, (tab) => {
         if (Core.isLink(tab.url))
            chrome.tabs.executeScript({
               code: "window.getSelection().toString()",
               allFrames: true
            }, (selection) => {

               let selected = selection.filter((x) => {
                  return (x !== (undefined || null || ''));
               });

               if (selected.length) {
                  if (callback && typeof (callback) === "function") {
                     // return callback(selection.toString());
                     callback(selection.toString());
                  }
               }
            });
      });
   },

   // Register the event handlers.
   eventListener: () => {
      chrome.contextMenus.onClicked.addListener(function (clickData, tab) {
         // console.log('clickData.menuItemId:', clickData.menuItemId);
         Core.commandRun(clickData.menuItemId, clickData.selectionText);
      });

      // hotkey
      chrome.commands.onCommand.addListener(function (onCommand) {
         console.log('Command:', onCommand);

         Core.commandRun(onCommand);
      });

      // calls
      chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
         console.log('request', request);
         console.log('sender', sender);

         Core.commandRun(request.command || request, sendResponse);
      });
   },

   loadDefaultSettings: (res) => {
      Core.conf = {};
      Core.conf.fromLang = res['lang-from'] && res['lang-from'].charAt(0) == '~' ? "auto" : res['lang-from'];
      Core.conf.toLang = res['lang-to'] || "en";
      console.log('loadDefaultSettings', JSON.stringify(Core.conf));
   },

   init: () => {
      console.log('Core init');

      let callback = (res) => Core.loadDefaultSettings(res);
      Storage.getParams(null, callback, false);

      Core.createContextMenu();
      Core.eventListener();
   },
};

Core.init();
