console.log(chrome.i18n.getMessage("app_name") + ": init background.js");

var Core = {
   createContextMenu: (menuItemId) => {
      chrome.contextMenus.create({
         id: menuItemId || 'test',
         title: chrome.i18n.getMessage("translate_context_menu"),
         contexts: ["selection"]
      });
   },
   openUrl: (url, isActiveTab) => {
      chrome.tabs.create({
         url: url,
         selected: isActiveTab
      })
   },
   init: function () {
      console.log('Core.init()');
      Storage.getParams(null, (e) => {
         Core["conf"] = e;
         Core.conf.fromLang = e.fromLang || "auto";
         Core.conf.toLang = e.toLang || "en";
      }, chrome.storage.local);
      Core.createContextMenu('selection-translate-google');
   },
};

// Register the event handlers.
chrome.contextMenus.onClicked.addListener(function (clickData, tab) {
   // console.log('clickData.menuItemId:', clickData.menuItemId);
   if (clickData.menuItemId == "selection-translate-google") {
      var url = "https://translate.google.com/#" +
         Core.conf.fromLang + "|" +
         Core.conf.toLang + "|" +
         encodeURIComponent(clickData.selectionText);
         
      Core.openUrl(url)
      // prompt("Copy text below", url); 
   }
});

Core.init();

// when install or update new version fired
browser.runtime.onInstalled && browser.runtime.onInstalled.addListener((detail) => {
   if(detail.reason === 'update') {
      //  if(parseInt(detail.previousVersion.replace(/\./g, '')) < 213) { // (v2.1.3)
      //      chrome.storage.local.clear();
      //      alert('app updated');
      //  }
   }
});

// when update available
browser.runtime.onUpdateAvailable && browser.runtime.onUpdateAvailable.addListener((detail) => {
   console.log(`Have a new version:${detail.version}`);
   browser.runtime.reload();  // install new version soon
});
