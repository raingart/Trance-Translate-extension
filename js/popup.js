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

      getUI: {
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
         bthOpenSettings: document.getElementById('bth-open-settings'),
      },

      analytics: () => {
         var x = document.createElement('script');
         x.src = '/lib/analytics.min.js';
         document.getElementsByTagName("head")[0].appendChild(x);
      },

      translate: (dispatch, callback) => {
         App.getUI.textOriginal.value = App.getUI.textOriginal.value.trim();
         var dispatch = dispatch || {
            from_language: App.getUI.translatedFrom.value.replace(/~.+$/, ''), //clear prefix temp lang 
            to_language: App.getUI.translatedTo.value,
            original_text: App.getUI.textOriginal.value,
         };

         if (dispatch.original_text) { //skip if empty text
            var callback = callback || ((parameter) => {
               App.log('resirve:', JSON.stringify(parameter));
               App.showLoading(false);
               App.fillReturn(parameter);
               App.localStorage.update();
            });
            App.showLoading(true);
            App.translate_source.toText(dispatch, callback);
         }
      },

      translatePage: () => {
         chrome.tabs.query({
            active: true,
            lastFocusedWindow: true
         }, (tabs) => {
            var tab = tabs[0];
            if (App.validURL(tab.url)) {
               App.translate_source.toPage({
                  to_language: App.getUI.translatedTo.value,
                  url: tab.url
               });
            } else
               alert(chrome.i18n.getMessage("msg_not_access_tab"));
         });
      },

      fillReturn: (parameter) => {
         if (App.getUI.translatedFrom.value.replace(/~.+$/, '') == '') { //create Auto Detected (rapam)
            App.getUI.translatedFrom[0].value = '~' + parameter.detectLang;
            App.getUI.translatedFrom[0].innerHTML = chrome.i18n.getMessage("translate_from_language") +
               ' (' + App.translate_source.langlist[parameter.detectLang] + ')';
         }

         App.getUI.textTranslated.value = parameter.translated_text;
         // App.getUI.textOriginal.value = App.getUI.textOriginal.value.trim();
         App.textareaAutoHeight(App.getUI.textOriginal);
         App.textareaAutoHeight(App.getUI.textTranslated);
         App.getUI.textOriginal.focus();
      },

      showLoading: (status) => {
         var i = 0;
         if (status) {
            var text = "loading";
            App.temploadingMessage = setInterval(() => {
               App.getUI.textTranslated.value = text + Array((++i % 4) + 1).join(".");
            }, 300);
         } else
            clearInterval(App.temploadingMessage);
      },

      helpHint: (outEl, typeN) => {
         var type1 = '';
         var type2 = '';
         if (typeN === 1) type1 = 'Ctrl+'
         else if (typeN === 2) type2 = 'Ctrl+'

         var el = outEl || document.createElement('div');
         el.className = 'item helpHint';
         el.innerHTML = '<span><i>"' + type1 + 'Enter"</i> - translate</span> | ';
         el.innerHTML += '<span><i>"' + type2 + 'Enter"</i> - newline</span>';
         document.getElementsByClassName('container')[0].appendChild(el);
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
         // var translatedFrom_temp = App.getSelectedValue(App.getUI.translatedFrom.value);
         // var translatedTo_temp = App.getSelectedValue(App.getUI.translatedTo.value);
         var translatedFrom_temp = App.getUI.translatedFrom.value.replace(/~.+$/, '');
         var translatedTo_temp = App.getUI.translatedTo.value;
         App.setSelectedLang(App.getUI.translatedFrom, translatedTo_temp);
         App.setSelectedLang(App.getUI.translatedTo, translatedFrom_temp);

          //exchange text in textarea
         var a = App.getUI.textOriginal;
         var b = App.getUI.textTranslated;
         if (a.value == '') {
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

         App.translate_source.toSpeak(args, (outAudio) => {
            outAudio.start(0);
            setTimeout(() => {
               ico.classList.toggle("icon-volume-down");
               ico.classList.remove("icon-volume-up");
               el.classList.remove("disabled");
            }, 1000);
         });
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
            }, (selection) => {
               if (selection && selection[0]) {
                  App.log('getSelectionText:', JSON.stringify(selection));
                  App.getUI.textOriginal.value = selection[0];
                  App.textareaAutoHeight(App.getUI.textOriginal);
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
         } else
            return true;
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
            optionsSave['lang-from'] = App.getUI.translatedFrom.value;
            optionsSave['lang-to'] = App.getUI.translatedTo.value;
            optionsSave['text-original'] = App.getUI.textOriginal.value;
            optionsSave['text-translated'] = App.getUI.textTranslated.value;

            Storage.setParams(optionsSave, false /*local*/ );
         },

         load: () => {
            var callback = ((res) => {
               Storage.restoreOptions(res)
               App.textareaAutoHeight(App.getUI.textOriginal);
               App.textareaAutoHeight(App.getUI.textTranslated);
               App.getUI.textOriginal.focus();
               App.getUI.textOriginal.select();

               App['tempSaveStorage'] = res;
               if (App.tempSaveStorage.keySendEnter)
                  App.getUI.bthTranslate.setAttribute("title", "Ctrl+Enter");

               // restore Auto Detected (rapam) in load
               if (res['lang-from'] && res['lang-from'].charAt(0) == '~') {
                  App.getUI.translatedFrom[0].value = res['lang-from'];
                  App.getUI.translatedFrom[0].innerHTML = chrome.i18n.getMessage("translate_from_language") + ' (' + App.translate_source.langlist[res['lang-from'].substr(1)] + ')';
               }
            });

            Storage.getParams(null, callback, false /*local*/ );
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

         // App.localStorage.update('clear')
         App.localStorage.load();

         App.getSelectionText();

         App.bildOptionTag(App.getUI.translatedFrom, App.translate_source.langlist);
         App.bildOptionTag(App.getUI.translatedTo, App.translate_source.langlist);

         App.temp_counter_keySendEnter = App.makeCounter();

         if (!App.debug)
            App.analytics();
      },

      log: (msg, arg1) => {
         if (App.debug) console.log('[+] ' + msg.toString(), arg1 || '')
      },

      makeCounter: () => {
         var currentCount = 1;
         return () => {
            return currentCount++;
         };
      }

      // langlist: lang.map(code => code.substr(0, 2).toLowerCase()),
      // return x<y ? -1 : x>y ? 1 : 0;
      // langlist: lang.forEach(function(value, key) {
      //    // console.log(key + ' = ' + value);
      //  }),
   };

   App.init();

   // mouse move event
   //    document.addEventListener('mousemove', function(e) {
   //       mouseX = e.clientX;
   //       mouseY = e.clientY;
   //       pageX = e.pageX;
   //       pageY = e.pageY;
   //   }, false);

   // Register the event handlers.

   // document.onkeyup = (e) => {
   document.addEventListener("keyup", function (e) { //eventPage
      var keySendEnter = App.tempSaveStorage.keySendEnter || null;
      // App.log('keySendEnter:', keySendEnter);

      if (e.shiftKey && e.which == 13) { //shift+Enter
         // App.log('>shift+Enter');
         App.getUI.textOriginal.value = App.getUI.textOriginal.value.trim();
         App.exchangeLanguages();

      } else if (e.ctrlKey && e.which == 13) { //ctrl+Enter
         // App.log('>ctrl+Enter');
         if (keySendEnter) App.translate();
         else App.getUI.textOriginal.value += '\n';

      } else if (e.which == 13 && !keySendEnter) { //Enter
         // App.log('>Enter');
         if (App.temp_counter_keySendEnter() === 3) {
            App.helpHint(false, App.tempSaveStorage.keySendEnter ? 1 : 2);
         }
         App.getUI.textOriginal.value = App.getUI.textOriginal.value.trim();
         App.translate();
      } else { //Other key
         App.temp_counter_keySendEnter = App.makeCounter();
      }
      App.textareaAutoHeight(App.getUI.textOriginal);
      return false;
   });
   // };

   // App.getUI.textToSpeakIn.onclick = function () {
   App.getUI.textToSpeakIn.addEventListener("click", function () {
      App.speakPlay(this, {
         textToSpeak: App.getUI.textOriginal.value,
         to_language: App.getUI.translatedFrom.value.replace(/~/, ''), //clear prefix temp lang 
      });
   });

   App.getUI.textToSpeakOut.addEventListener("click", function () {
      App.speakPlay(this, {
         textToSpeak: App.getUI.textTranslated.value,
         to_language: App.getUI.translatedTo.value,
      });
   });

   App.getUI.textOriginal.addEventListener("input", function () {
      App.textareaAutoHeight(this);
   });
   App.getUI.exchangeLang.addEventListener("click", App.exchangeLanguages, false);
   App.getUI.bthTranslate.addEventListener("click", function () {
      App.translate()
   });
   App.getUI.bthTranslatePage.addEventListener("click", App.translatePage, false);

   App.getUI.bthOpenSettings.addEventListener("click", function () {
      var iframeId = document.querySelectorAll('iframe')[0];
      iframeId.classList.toggle("hide");
      if (iframeId.src == '') {
         iframeId.src = '/html/settings.html';
         iframeId.onload = resizeIframe(this);
      }

      function resizeIframe(obj) {
         obj.style.height = obj.contentWindow.document.body.scrollHeight + 'px';
      }

   });

});
