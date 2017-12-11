// This function is called onload in the popup code
function getPageDetails(callback) { 
    // Inject the content script into the current page 
    chrome.tabs.executeScript(null, { file: '/js/content.js' }); 
    // Perform the callback when a message is received from the content script
    chrome.runtime.onMessage.addListener(function(message)  { 
        // Call the callback function
        callback(message); 
    }); 
};

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
