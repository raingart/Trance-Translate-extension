var Core = {
   createContextMenu: (menuItemId) => {
      chrome.contextMenus.create({
         id: menuItemId || 'test',
         title: chrome.i18n.getMessage("translateContext"),
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
      Core.createContextMenu('selection-translate-google');
   },
};

// Register the event handlers.
chrome.contextMenus.onClicked.addListener(function (clickData, tab) {
   console.log('clickData.menuItemId:', clickData.menuItemId);

   if (clickData.menuItemId == "selection-translate-google") {
      var url = "https://translate.google.com/#" +
         "auto" + "|" +
         "ru" + "|" +
         encodeURIComponent(clickData.selectionText);
      // Core.openUrl(url)
      prompt("Copy text below", url); 
   }
});

Core.init();
