console.log("start " + chrome.i18n.getMessage("app_name"));

// options: JSON.parse(browser.i18n.getMessage("languages")),

// When the popup HTML has loaded
window.addEventListener('load', (evt) => {

   const App = {
      debug: false,
      // debug: true,

      translate: (dispatch, apiName, callback) => {
         var dispatch = dispatch || {
            sourceLanguage: App.ui.getView.sourceLang.value,
            targetLanguage: App.ui.getView.targetLang.value,
            sourceText: App.ui.getView.translateIn.value,
         };
         
         if (dispatch.sourceText) {
            var apiName = apiName || 'Google';
            var callback = callback || ((parameter) => {
               console.log('resirve: ' + JSON.stringify(parameter));
               App.ui.ui(parameter);
               App.localStorage.update();
               App.ui.showLoading(false);
            });
            App.ui.showLoading(false);
            App.ui.showLoading(true);
            translateAPI[apiName](dispatch, callback);
         }
      },

      ui: {
         getView: {
            sourceLang: document.getElementById('fromLang'),
            targetLang: document.getElementById('toLang'),
            translateIn: document.getElementById('translate-text-in'),
            // translateIn: document.querySelectorAll('textarea')[0],
            bthTranslate: document.getElementById('bth-translate'),
            translatedOut: document.getElementById('translate-text-out'),
            // translatedOut: document.querySelectorAll('textarea')[1],
            // textToPlay: document.getElementById("bth-voicePlaying")
         },

         ui: (parameter) => {
            App.ui.getView.translatedOut.value = parameter.translatedText;
            // App.ui.setSelectedValue(App.ui.getView.sourceLang, parameter.detectLang);
            if (App.ui.getView.sourceLang.value == '') {
               App.ui.getView.sourceLang[0].innerHTML = chrome.i18n.getMessage("translate_choice_source") + ' (' + lang[parameter.detectLang] + ')';
            }
            App.ui.getView.translateIn.focus();
            App.ui.autoExpand(App.ui.getView.translatedOut);
         },

         showLoading: (status) => {
            var i = 0;
            if (status) {
               var text = "loading";
               App.temploadingMessage = setInterval(() => {
                  App.ui.getView.translatedOut.value = text + Array((++i % 4) + 1).join(".");
               }, 300);
            } else {
               clearInterval(App.temploadingMessage);
            }
         },

         setSelectedValue: (e, t) => {
            for (var n = 0; n < e.children.length; n++) {
               var r = e.children[n];
               if (r.value === t) {
                  r.selected = true;
                  break
               }
            }
         },

         // getSelectedValue: (e) => {
         //    return e.children[e.selectedIndex].value
         // },

         exchangeLanguages: () => {
            // var fromLang_temp = App.getSelectedValue(App.ui.getView.sourceLang.value);
            // var toLang_temp = App.getSelectedValue(App.ui.getView.targetLang.value);
            var fromLang_temp = App.ui.getView.sourceLang.value;
            var toLang_temp = App.ui.getView.targetLang.value;

            App.ui.setSelectedValue(App.ui.getView.sourceLang, toLang_temp);
            App.ui.setSelectedValue(App.ui.getView.targetLang, fromLang_temp);

            var a = App.ui.getView.translateIn;
            var b = App.ui.getView.translatedOut;
            if (a.value == '') {
               b.value = [a.value, a.value = b.value][0];
            }
         },

         autoExpand: (t) => {
            t.style.height = 'inherit'
            t.style.height = t.scrollHeight + 'px'
         },

         loadLangList: (outSelected, loadOptionVal) => {
            for (var i in loadOptionVal) {
               outSelected.options[outSelected.options.length] = new Option(lang[i], i.toLowerCase());
            }
         },

         // populateSelect: function (e, t) {
         //    for (var n in t) {
         //       try {
         //          var r = document.createElement("option");
         //          r.value = n;
         //          r.textContent = t[n];
         //          e.appendChild(r)
         //       } catch (e1) {}
         //    }
         //    return e
         // },
      },
      openUrl: (url, isActiveTab) => {
         chrome.tabs.create({
            url: url,
            selected: isActiveTab
         })
      },

      localStorage: {
         // Saves options to localStorage/chromeSync.
         update: (reset) => {
            if (reset)
               chrome.storage.local.clear();

            var options_Storage = {};
            options_Storage.fromLang = App.ui.getView.sourceLang.value;
            options_Storage.toLang = App.ui.getView.targetLang.value;
            options_Storage['translate-text-in'] = App.ui.getView.translateIn.value;

            Storage.setParams(options_Storage, chrome.storage.local);
         },

         // Restores select box state to saved value from localStorage/chromeSync.
         loadFillOpt: (base) => {
            App.log("Load the localStorageuration from localStorage: \n" + JSON.stringify(base));
            for (var property in base) {
               var item = base[property];
               // App.log("opt> " + property + ":" + item);
               var opt = document.getElementById(property);
               if (opt) {
                  App.log("opt tag> " + property + ":" + item);
                  if (opt.options) {
                     App.ui.setSelectedValue(opt, item);
                  } else {
                     opt.value = item
                  }
               }
            }
         },
         // loadDefaultSettings: function (e) {
         //    // App.localStorage.save("vm", e)
         //    console.log('loadDefaultSettings');

         // },
         // saveViewMode: function (e) {
         //    App.localStorage.save("vm", e)
         // },
         // save: function (e, t) {
         //    localStorage.setItem(e, t)
         // },
         // getValue: function (e) {
         //    return localStorage.getItem(e)
         // },
         // exists: function (e) {
         //    return localStorage[e] ? true : false
         // }
      },

      init: () => {
         App.log('App Init');
         // console.log('isFirstRun:', !App.localStorage.exists("isFirstRun"));
         // if (!App.localStorage.exists("isFirstRun")) {
         //    // App.localStorage.loadDefaultSettings();
         //    // App.localStorage.loadFill();
         //    App.openUrl("/html/settings.html")
         // } else {
         //    Storage.getParams(null, App.localStorage.loadFillOpt, chrome.storage.local);
         // }
         Storage.getParams(null, App.localStorage.loadFillOpt, chrome.storage.local);

         App.ui.loadLangList(App.ui.getView.sourceLang, lang);
         App.ui.loadLangList(App.ui.getView.targetLang, lang);
         App.ui.getView.translateIn.focus();

         //    var t = "selectionText";
         //   var n = 'ognt';
         //   var r = "auto";

         //    var i = "http://translate.google.com/#" + r + "|" + '' + "|" + encodeURIComponent(t);
         //    App.browser.openUrl(i, n === "ognt" ? true : false)
      },

      log: (msg) => {
         if (App.debug)
            console.log('>> ' + msg.toString())
      }
   };


   // document.onkeyup = (e) => {
   document.addEventListener("keyup", function (e) {
      if (e.ctrlKey && e.which == 13) { //ctrl+Enter
         console.log('ctrl+Enter');
         App.translate();
         // document.getElementById('textToTranslate').value += '\n';
         // return false;
      } else if (e.shiftKey && e.which == 13) { //shift+Enter
         console.log('shift+Enter');
         App.ui.exchangeLanguages();
         return false;
         // } else if (e.which == 13) { //Enter
         //     App.translate();eventPage
         //     return false;
      }
   });
   // };

   // Register the event handlers.
   App.ui.getView.translateIn.addEventListener("input", function () {
      App.ui.autoExpand(this)
   });

   App.ui.getView.translatedOut.addEventListener("click", function () {
      this.select();
   });


   // buttonSave.addEventListener("click", function (e) {
   //     App.localStorage.update();
   // });

   // buttonSaveClear.addEventListener("click", function (e) {
   //     App.localStorage.update(true);
   // });
   // document.getElementById("fromTextPlayer").addEventListener("click", function(event) { fromLangListener.play(this); }, false);

   // mouse move event
   //    document.addEventListener('mousemove', function(e) {
   //       mouseX = e.clientX;
   //       mouseY = e.clientY;
   //       pageX = e.pageX;
   //       pageY = e.pageY;
   //   }, false);

   // document.getElementById("bth-voicePlaying").addEventListener("click", function (e) {
   //    //    App.ui.getView.textToPlay.addEventListener("click", function (e) {
   //    var classes = this.querySelectorAll('i')[0]
   //    classes.classList.toggle("icon-volume-down");
   //    classes.classList.toggle("icon-volume-up");
   // });

   exchangeFromTo.addEventListener("click", App.ui.exchangeLanguages, false);
   //    exchangeFromTo.addEventListener("click", (e) => {
   //       App.ui.exchangeLanguages();
   //    });

   App.ui.getView.bthTranslate.addEventListener("click", (e) => {
      App.translate();
   });

   // chrome.tabs.getSelected(null, function(tab) {
   //     chrome.tabs.sendRequest(tab.id, {method: 'getSelection'}, function (response) {
   //     //   document.getElementById('textToTranslate').value = response.data;
   //       console.log(response) ;
   //     });
   //   });

   chrome.runtime.getBackgroundPage((eventPage) => {
      // Call the getPageInfo function in the event page, passing in 
      // our onPageDetailsReceived function as the callback. This injects 
      // content.js into the current tab's HTML
      eventPage.Background.getPageDetails(function (details) {
         // if (details.summary) {
         App.ui.getView.translateIn.value = details.summary;
         App.translate();
         // }
      });
   });

   //    chrome.tabs.getSelected(null, function(tab) {

   //       // Get the selected text. 
   //     chrome.tabs.sendMessage(tab.id, { method: "translateSelectedText" }, function (response) {	
   //       // alert(2)
   // });
   // });

   App.init();

});
