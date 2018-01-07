console.log(chrome.i18n.getMessage("app_name") + ": init popup.js");

// When the popup HTML has loaded
window.addEventListener('load', (evt) => {

   const App = {
      debug: true,

      translate_source: {
         langlist: GoogleTS_API.langlist,
         toText: GoogleTS_API.toTranslate,
         toPage: GoogleTS_API.toPage,
         toSpeak: GoogleTS_API.toSpeak
      },

      analytics: () => {
         var x = document.createElement('script');
         x.src = '/lib/analytics.min.js';
         document.getElementsByTagName("head")[0].appendChild(x);
      },

      translate: (dispatch, callback) => {
         var dispatch = dispatch || {
            from_language: App.getUI.htmlTag.translatedFrom.value.replace(/~.+$/, ''),
            to_language: App.getUI.htmlTag.translatedTo.value,
            original_text: App.getUI.htmlTag.textOriginal.value,
         };

         if (dispatch.original_text) { //skip if empty text
            var callback = callback || ((parameter) => {
               App.log('{"resirve"}', JSON.stringify(parameter));
               App.getUI.showLoading(false);
               App.getUI.fillReturn(parameter);
               App.localStorage.update();
            });
            App.getUI.showLoading(true);
            App.translate_source.toText(dispatch, callback);
         }
      },

      translatePage: () => {
         chrome.tabs.query({
            active: true,
            lastFocusedWindow: true
         }, function (tabs) {
            var tab = tabs[0];
            if (App.validURL(tab.url)) {
               App.translate_source.toPage({
                  to_language: App.getUI.htmlTag.translatedTo.value,
                  url: tab.url
               });
            } else {
               alert(chrome.i18n.getMessage("msg_not_access_tab"));
            }
         });
      },

      getUI: {
         htmlTag: {
            translatedFrom: document.getElementById('lang-from'),
            translatedTo: document.getElementById('lang-to'),
            textOriginal: document.getElementById('text-original') ||
               document.querySelectorAll('textarea')[0],
            textTranslated: document.getElementById('text-translated') ||
               document.querySelectorAll('textarea')[1],
            exchangeLang: document.getElementById('bth-lang-exchange'),
            textToSpeakIn: document.getElementById('btn-text-to-speak-in'),
            textToSpeakOut: document.getElementById('btn-text-to-speak-out'),
            bthTranslate: document.getElementById('bth-translate'),
            bthTranslatePage: document.getElementById('bth-translate-page'),
         },

         fillReturn: (parameter) => {
            if (App.getUI.htmlTag.translatedFrom.value.replace(/~.+$/, '') == '') { //create Auto Detected (rapam)
               App.getUI.htmlTag.translatedFrom[0].value = '~' + parameter.detectLang;
               App.getUI.htmlTag.translatedFrom[0].innerHTML = chrome.i18n.getMessage("translate_from_language") +
                  ' (' + App.translate_source.langlist[parameter.detectLang] + ')';
            }

            App.getUI.htmlTag.textTranslated.value = parameter.translated_text;
            App.getUI.htmlTag.textOriginal.value = App.getUI.htmlTag.textOriginal.value.trim();

            App.getUI.textareaAutoHeight(App.getUI.htmlTag.textOriginal);
            App.getUI.textareaAutoHeight(App.getUI.htmlTag.textTranslated);

            App.getUI.htmlTag.textOriginal.focus();
         },

         showLoading: (status) => {
            var i = 0;
            if (status) {
               var text = "loading";
               App.temploadingMessage = setInterval(() => {
                  App.getUI.htmlTag.textTranslated.value = text + Array((++i % 4) + 1).join(".");
               }, 300);
            } else {
               clearInterval(App.temploadingMessage);
            }
         },

         setSelectedLang: (selectObj, val) => {
            for (var n = 0; n < selectObj.children.length; n++) {
               var option = selectObj.children[n];
               if (option.value.charAt(0) == '~') { // clear "~LangCode"
                  option.value = '';
               }
               if (option.value === val) {
                  option.selected = true;
                  break
               }
            }
         },

         // getSelectedValue: (e) => {
         //    return e.children[e.selectedIndex].value
         // },

         exchangeLanguages: () => {
            // var translatedFrom_temp = App.getSelectedValue(App.getUI.htmlTag.translatedFrom.value);
            // var translatedTo_temp = App.getSelectedValue(App.getUI.htmlTag.translatedTo.value);
            var translatedFrom_temp = App.getUI.htmlTag.translatedFrom.value.replace(/~.+$/, '');
            var translatedTo_temp = App.getUI.htmlTag.translatedTo.value;
            App.getUI.setSelectedLang(App.getUI.htmlTag.translatedFrom, translatedTo_temp);
            App.getUI.setSelectedLang(App.getUI.htmlTag.translatedTo, translatedFrom_temp);

            var a = App.getUI.htmlTag.textOriginal;
            var b = App.getUI.htmlTag.textTranslated;
            if (a.value == '') { //exchange text in textarea
               b.value = [a.value, a.value = b.value][0];
            }
         },

         textareaAutoHeight: (t) => {
            t.style.height = 'inherit';
            t.style.height = t.scrollHeight + 3 + 'px';
         },

         bildOptionTag: (selbox, optionVal) => {
            for (var i in optionVal) {
               // new Option("key","value")).setAttribute("key","value");
               selbox.options[selbox.options.length] = new Option(optionVal[i], i);
               // var r = document.createElement("option");
               // r.value = i;
               // r.textContent = optionVal[i];
               // selectTag.appendChild(r)
            }
         },

         speakPlay: (el, args) => {
            el.classList.add("disabled");
            var ico = el.querySelectorAll('i')[0]; //ttf awesome icon
            ico.classList.toggle("icon-volume-down");
            ico.classList.add("icon-volume-up");

            App.translate_source.toSpeak(args, function (outAudio) {
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
            //or
            // chrome.tabs.query({active: true, currentWindow: true}, function(arrayOfTabs) {
            // console.log('tab.id:'+tab.url);
            chrome.tabs.executeScript( /*tab.id,*/ {
               code: "window.getSelection().toString();",
               allFrames: true
            }, function (selection) {
               App.log('getSelectionText:', selection);
               if (selection && selection[0]) {
                  App.getUI.htmlTag.textOriginal.value = selection[0];
                  App.getUI.textareaAutoHeight(App.getUI.htmlTag.textOriginal);
                  App.translate();
               }
            });
            //   });
         } catch (err) {
            // var e = new Error();
            // e.code = 'NO_ACCESS_TAB';
            // e.message = err.message;
            // reject(e);
         }
      },

      validURL: (str) => {
         var regex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
         if (!regex.test(str)) {
            console.log("Not valid URL", str);
            return false;
         } else {
            return true;
         }
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
            if (reset) {
               chrome.storage.local.clear();
               chrome.storage.sync.clear();
               console.log('[chrome.storage] clear!');
            }

            var optionsSave = {};
            optionsSave['lang-from'] = App.getUI.htmlTag.translatedFrom.value;
            optionsSave['lang-to'] = App.getUI.htmlTag.translatedTo.value;
            optionsSave['text-original'] = App.getUI.htmlTag.textOriginal.value;
            optionsSave['text-translated'] = App.getUI.htmlTag.textTranslated.value;

            Storage.setParams(optionsSave, false);
         },

         load: () => {
            var callback = ((res) => {
               App.localStorage.fillOptValue(res)
               App.getUI.textareaAutoHeight(App.getUI.htmlTag.textOriginal);
               App.getUI.textareaAutoHeight(App.getUI.htmlTag.textTranslated);
               App.getUI.htmlTag.textOriginal.focus();
               App.getUI.htmlTag.textOriginal.select();

               // restore Auto Detected (rapam) in load
               if (res['lang-from'] && res['lang-from'].charAt(0) == '~') {
                  App.getUI.htmlTag.translatedFrom[0].value = res['lang-from'];
                  App.getUI.htmlTag.translatedFrom[0].innerHTML = chrome.i18n.getMessage("translate_from_language") + ' (' + App.translate_source.langlist[res['lang-from'].substr(1)] + ')';
               }
            });

            Storage.getParams(null, callback, false);
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

         // Restores select box state to saved value from localStorage/chromeSync.
         fillOptValue: (base) => {
            App.log("Load from Storage:", JSON.stringify(base));
            for (var property in base) {
               var item = base[property];
               var opt = document.getElementById(property);
               if (opt) {
                  App.log("opt tag> " + property + ":" + item);
                  if (opt.options) //declarate tags options
                     App.getUI.setSelectedLang(opt, item);
                  else
                     opt.value = item
               }
            }
         },
      },

      init: () => {
         App.log('App Init');

         // App.localStorage.update('clear')
         App.localStorage.load();
         App.getSelectionText();

         App.getUI.bildOptionTag(App.getUI.htmlTag.translatedFrom, App.translate_source.langlist);
         App.getUI.bildOptionTag(App.getUI.htmlTag.translatedTo, App.translate_source.langlist);

         if (!App.debug)
            App.analytics();
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
      // .substr(0, 2).toUpperCase()
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
      }
      // } else if (e.which == 13) { //Enter
      //     App.translate();eventPage
      //     return false;
   });
   // };

   // mouse move event
   //    document.addEventListener('mousemove', function(e) {
   //       mouseX = e.clientX;
   //       mouseY = e.clientY;
   //       pageX = e.pageX;
   //       pageY = e.pageY;
   //   }, false);

   // Register the event handlers.
   App.getUI.htmlTag.textToSpeakIn.onclick = function () {
      App.getUI.speakPlay(this, {
         textToSpeak: App.getUI.htmlTag.textOriginal.value,
         to_language: App.getUI.htmlTag.translatedFrom.value.replace(/~/, ''), //clear prefix temp lang 
      });
   };

   App.getUI.htmlTag.textToSpeakOut.onclick = function () {
      App.getUI.speakPlay(this, {
         textToSpeak: App.getUI.htmlTag.textTranslated.value,
         to_language: App.getUI.htmlTag.translatedTo.value,
      });
   };

   App.getUI.htmlTag.textOriginal.addEventListener("input", function () {
      App.getUI.textareaAutoHeight(this);
   });
   App.getUI.htmlTag.exchangeLang.addEventListener("click", App.getUI.exchangeLanguages, false);
   App.getUI.htmlTag.bthTranslate.addEventListener("click", () => {
      App.translate()
   });
   App.getUI.htmlTag.bthTranslatePage.addEventListener("click", App.translatePage, false);

   App.init();

});
