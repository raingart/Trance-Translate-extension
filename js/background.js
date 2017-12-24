// Handle the requests.
chrome.extension.onMessage.addListener(function (request, sender, sendResponse) {
   console.log(JSON.stringify(request));
   if (request.method == "translateSelectedText") {
      //   localStorage['targetLanguage'] = request.theTargetLanguage;
      //   sendResponse({TargetLanguage: localStorage['targetLanguage']});	  
      alert(1);
   }
   // else if(request.method == "getTranslatedText"){
   //   sendResponse({TranslatedText: localStorage['translatedText'],
   // 				TargetLanguage: localStorage["targetLanguage"],
   // 				SourceLanguage: localStorage["sourceLanguage"]});
   // }
   // else
   //   sendResponse({}); // snub them.
});

// chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
//     if (request.method == 'getSelection') {
//       sendResponse({data: window.getSelection().toString()});
//     }
//   });

// var sel = window.getSelection();
// var selectedText = sel.toString();
// chrome.extension.sendRequest({action: selectedText}, function(response) {
//   console.log('Start action sent');  
// });

// chrome.browserAction.setTitle({
//     title: chrome.i18n.getMessage("extTitle") 
//   });

var Core = {
   getPageDetails: function (callback) {
      // Inject the content script into the current page 
      chrome.tabs.executeScript(null, {
         file: '/js/content.js'
      });
      // Perform the callback when a message is received from the content script
      chrome.runtime.onMessage.addListener(function (message) {
         // Call the callback function
         callback(message);
      });
   },
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
      document.addEventListener("DOMContentLoaded", function () {
         console.log('Core.init()');
         Core.createContextMenu('selection-translate-google')
      })
   },
};
Core.init();

// Register the event handlers.
chrome.contextMenus.onClicked.addListener(function (info, tab) {
   console.log(info.menuItemId);

   if (info.menuItemId == "selection-translate-google") {
      var url = "http://translate.google.com/#" +
         "auto" + "|" +
         "ru" + "|" +
         encodeURIComponent(info.selectionText);
      Core.openUrl(url)
   }
});
