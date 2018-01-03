console.log("start " + chrome.i18n.getMessage("app_name"));

// When the popup HTML has loaded
window.addEventListener('load', (evt) => {

   const App = {
      // debug: true,

      langlist: lang,

      analytics: () => {
         var x = document.createElement('script');
         x.src = '/lib/analytics.min.js';
         document.getElementsByTagName("head")[0].appendChild(x);
      },
      // <script src="/lib/analytics.min.js"></script>,

      translate: (dispatch, apiName, callback) => {
         var dispatch = dispatch || {
            from: App.getUI.htmlTag.sourceLang.value,
            to: App.getUI.htmlTag.targetLang.value,
            q: App.getUI.htmlTag.textareaFrom.value,
         };

         if (dispatch.q) {
            var apiName = apiName || 'Google';
            var callback = callback || ((parameter) => {
               console.log('{"resirve"}', JSON.stringify(parameter));
               App.getUI.fill(parameter);
               App.localStorage.update();
               App.getUI.showLoading(false);
            });
            App.getUI.showLoading(true);
            translateAPI[apiName].translatedText(dispatch, callback);
         }
      },

      translatePage: () => {
         chrome.tabs.query({
            active: true,
            lastFocusedWindow: true
         }, function (tabs) {
            var tab = tabs[0];
            App.log('translate active url:', tab.url);
            App.openUrl(
               'https://translate.google.com/translate?' +
               '&sl=' + 'auto' +
               "&tl=" + App.getUI.htmlTag.targetLang.value +
               "&u=" + tab.url);
         });
      },

      getUI: {
         htmlTag: {
            sourceLang: document.getElementById('fromLang'),
            targetLang: document.getElementById('toLang'),
            textareaFrom: document.getElementById('translate-text-in') ||
               document.querySelectorAll('textarea')[0],
            bthTranslate: document.getElementById('bth-translate'),
            textareaOut: document.getElementById('translate-text-out') ||
               document.querySelectorAll('textarea')[1],

            textInToSpeak: document.getElementById('btn-textIn-to-speak'),
            textOutToSpeak: document.getElementById('btn-textOut-to-speak'),
         },

         fill: (parameter) => {
            App.getUI.htmlTag.textareaFrom.value = App.getUI.htmlTag.textareaFrom.value.trim();
            App.getUI.htmlTag.textareaOut.value = parameter.translatedText;
            // App.getUI.setSelectedValue(App.getUI.htmlTag.sourceLang, parameter.detectLang);
            if (App.getUI.htmlTag.sourceLang.value == '') {
               App.getUI.htmlTag.sourceLang[0].innerHTML = chrome.i18n.getMessage("translate_choice_source") + ' (' + App.langlist[parameter.detectLang] + ')';
            }

            App.getUI.autoExpand(App.getUI.htmlTag.textareaFrom);
            App.getUI.autoExpand(App.getUI.htmlTag.textareaOut);

            App.getUI.htmlTag.textareaFrom.focus();
         },

         showLoading: (status) => {
            var i = 0;
            if (status) {
               var text = "loading";
               App.temploadingMessage = setInterval(() => {
                  App.getUI.htmlTag.textareaOut.value = text + Array((++i % 4) + 1).join(".");
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
            // var fromLang_temp = App.getSelectedValue(App.getUI.htmlTag.sourceLang.value);
            // var toLang_temp = App.getSelectedValue(App.getUI.htmlTag.targetLang.value);
            var fromLang_temp = App.getUI.htmlTag.sourceLang.value;
            var toLang_temp = App.getUI.htmlTag.targetLang.value;

            App.getUI.setSelectedValue(App.getUI.htmlTag.sourceLang, toLang_temp);
            App.getUI.setSelectedValue(App.getUI.htmlTag.targetLang, fromLang_temp);

            var a = App.getUI.htmlTag.textareaFrom;
            var b = App.getUI.htmlTag.textareaOut;
            if (a.value == '') {
               b.value = [a.value, a.value = b.value][0];
            }
         },

         autoExpand: (t) => {
            t.style.height = 'inherit'
            t.style.height = t.scrollHeight + 'px'
         },

         fillSelected: (outSelected, loadOptionVal) => {
            for (var i in loadOptionVal) {
               outSelected.options[outSelected.options.length] = new Option(loadOptionVal[i], i);
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

         textToSpeak: (e, args) => {
            e.classList.add("disabled");
            var ico = e.querySelectorAll('i')[0];
            ico.classList.toggle("icon-volume-down");
            ico.classList.add("icon-volume-up");

            translateAPI.Google.speakText(args, function (outAudio) {
               outAudio.start(0);
               setTimeout(() => {
                  ico.classList.toggle("icon-volume-down");
                  ico.classList.remove("icon-volume-up");
                  e.classList.remove("disabled");
               }, 1000);
            });
         }
      },

      getSelectionText: () => {
         try {
            // chrome.tabs.getSelected(null, function(tab){
            // chrome.tabs.query({active: true, currentWindow: true}, function(arrayOfTabs) {
            // console.log('tab.id:'+tab.url);
            chrome.tabs.executeScript( /*tab.id,*/ {
               code: "window.getSelection().toString();",
               allFrames: true
            }, function (selection) {
               App.log('getSelectionText:', selection);
               if (selection && selection[0]) {
                  App.getUI.htmlTag.textareaFrom.value = selection[0];
                  App.translate();
               }
            });
            //   });
         } catch (err) {
            var e = new Error();
            e.code = 'NO_ACCESS_TAB';
            e.message = err.message;
            reject(e);
         }
      },

      openUrl: (url, tab) => {
         chrome.tabs.create({
            url: url,
            selected: tab
         })
      },

      localStorage: {
         // Saves options to localStorage/chromeSync.
         update: (reset) => {
            if (reset)
               chrome.storage.local.clear();

            var options_Storage = {};
            options_Storage.fromLang = App.getUI.htmlTag.sourceLang.value;
            options_Storage.toLang = App.getUI.htmlTag.targetLang.value;
            options_Storage['translate-text-in'] = App.getUI.htmlTag.textareaFrom.value;
            options_Storage['translate-text-out'] = App.getUI.htmlTag.textareaOut.value;

            return Storage.setParams(options_Storage, chrome.storage.local);
         },

         // Restores select box state to saved value from localStorage/chromeSync.
         fillOptValue: (base) => {
            App.log("Load the localStorageuration from localStorage: \n" + JSON.stringify(base));
            for (var property in base) {
               var item = base[property];
               // App.log("opt> " + property + ":" + item);
               var opt = document.getElementById(property);
               if (opt) {
                  App.log("opt tag> " + property + ":" + item);
                  if (opt.options) {
                     App.getUI.setSelectedValue(opt, item);
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

         Storage.getParams(null,
            (r) => {
               App.localStorage.fillOptValue(r)
               App.getUI.autoExpand(App.getUI.htmlTag.textareaFrom);
               App.getUI.autoExpand(App.getUI.htmlTag.textareaOut);
            }, chrome.storage.local);

         App.getSelectionText();

         App.getUI.fillSelected(App.getUI.htmlTag.sourceLang, App.langlist);
         App.getUI.fillSelected(App.getUI.htmlTag.targetLang, App.langlist);

         App.getUI.htmlTag.textareaFrom.focus();

         // if (!App.debug)
         //    App.analytics();
      },

      log: (msg) => {
         if (App.debug)
            return console.log('>> ' + msg.toString())
      }

      // langlist: lang.map(code => code.toLowerCase()),
      // return x<y ? -1 : x>y ? 1 : 0;
      // langlist: lang.forEach(function(value, key) {
      //    // console.log(key + ' = ' + value);
      //  }),
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
         App.getUI.exchangeLanguages();
         return false;
         // } else if (e.which == 13) { //Enter
         //     App.translate();eventPage
         //     return false;
      }
   });
   // };

   // Register the event handlers.
   App.getUI.htmlTag.textareaFrom.addEventListener("input", function () {
      App.getUI.autoExpand(this);
   });


   // document.getElementById("fromTextPlayer").addEventListener("click", function(event) { fromLangListener.play(this); }, false);

   // mouse move event
   //    document.addEventListener('mousemove', function(e) {
   //       mouseX = e.clientX;
   //       mouseY = e.clientY;
   //       pageX = e.pageX;
   //       pageY = e.pageY;
   //   }, false);

   App.getUI.htmlTag.textInToSpeak.onclick = function () {
      App.getUI.textToSpeak(this, {
         textToSpeak: App.getUI.htmlTag.textareaFrom.value,
         to: App.getUI.htmlTag.sourceLang.value,
      });
   };

   App.getUI.htmlTag.textOutToSpeak.onclick = function () {
      App.getUI.textToSpeak(this, {
         textToSpeak: App.getUI.htmlTag.textareaOut.value,
         to: App.getUI.htmlTag.targetLang.value,
      });
   };

   exchangeFromTo.addEventListener("click", App.getUI.exchangeLanguages, false);

   App.getUI.htmlTag.bthTranslate.addEventListener("click", (e) => {
      App.translate();
   });

   document.getElementById('bth-translate-page').addEventListener("click", (e) => {
      ApplicationCache.translatePage();
   });

   App.init();

});
