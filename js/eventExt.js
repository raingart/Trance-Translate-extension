console.log(i18n("app_name") + ": init eventExt.js");

const manifest = chrome.runtime.getManifest();

let uninstallUrl = "https://docs.google.com/forms/d/e/1FAIpQLSdgDabLtk8vapLTEXKoXucHVXLrDujBrXZg418mGrLE0zND2g/viewform?usp=pp_url&entry.1936476946&entry.1337380930&entry.1757501795=";
uninstallUrl += encodeURIComponent(manifest.short_name + ' (v' + manifest.version + ')');

chrome.runtime.setUninstallURL(uninstallUrl, function (details) {
   let lastError = chrome.runtime.lastError;
   if (lastError && lastError.message) {
      console.warn("Unable to set uninstall URL: " + lastError.message);
   } else {
      // The url is set
   }
});
