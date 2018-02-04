console.log(chrome.i18n.getMessage("app_name") + ": init popup.js");

try {

   // When the popup HTML has loaded
   window.addEventListener('load', (evt) => {

      const App = {
         // debug: true,

         translateProvider: {
            langlist: translateAPI['Google'].langlist,
            toText: translateAPI['Google'].toText,
            toSpeak: translateAPI['Google'].toSpeak
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
            bthOpenSettings: document.getElementById('bth-open-settings'),
         },

         clearText: () => {
            App.getUI.textOriginal.value = App.getUI.textOriginal.value.trim();
            App.getUI.textTranslated.value = App.getUI.textTranslated.value.trim();
            App.autoHeightTag(App.getUI.textOriginal);
            App.autoHeightTag(App.getUI.textTranslated);
         },

         translate: (dispatch, callback) => {
            App.exchangeText(); // if in ''

            var dispatch = dispatch || {
               from_language: App.getUI.translatedFrom.value.replace(/~.+$/, ''), //clear prefix temp lang 
               to_language: App.getUI.translatedTo.value,
               original_text: App.getUI.textOriginal.value,
            };

            if (dispatch.original_text) { //skip if empty text
               var callback = callback || ((parameter) => {
                  App.log('resirve:', JSON.stringify(parameter));
                  App.showLoading(false);

                  // if translated To == From invert lang
                  // set new callback
                  if (parameter.detectLang == dispatch.to_language &&
                     dispatch.from_language != dispatch.to_language) {
                     // App.setSelectOption(App.getUI.translatedTo, App.getUI.translatedFrom.value);
                     App.exchangeLanguages();
                     var callback = ((parameter) => {
                        App.log('resirve:', JSON.stringify(parameter));
                        App.showLoading(false);
                        App.makeReturn(parameter);
                        App.confStorage.update();
                        App.exchangeLanguages();
                     });
                     App.translate(false, callback);
                  } else {
                     App.makeReturn(parameter);
                     App.confStorage.update();
                  }
               });
               App.showLoading(true);
               App.clearText();
               App.translateProvider.toText(dispatch, callback);
            }
         },

         makeReturn: (parameter) => {
            App.getUI.textTranslated.value = parameter.translated_text;

            if (App.getUI.translatedFrom.value.replace(/~.+$/, '') == '') { //create Auto Detected (rapam)
               App.getUI.translatedFrom[0].value = '~' + parameter.detectLang;
               App.getUI.translatedFrom[0].innerHTML = chrome.i18n.getMessage("translate_from_language") +
                  ' (' + App.translateProvider.langlist[parameter.detectLang] + ')';
            }

            App.clearText();
            App.getUI.textOriginal.focus();
         },

         showLoading: (status) => {
            var i = 0;
            if (status) {
               var text = "loading";
               App.getUI.textTranslated.value = text;
               App.temploadingMessage = setInterval(() => {
                  App.getUI.textTranslated.value = text + Array((++i % 4) + 1).join(".");
               }, 300);
            } else
               clearInterval(App.temploadingMessage);
         },

         setSelectOption: (selectObj, val) => {
            for (var n = 0; n < selectObj.children.length; n++) {
               var option = selectObj.children[n];

               // start fix clear "~LangCode"
               if (option.value.charAt(0) == '~') option.value = '';
               if (val.charAt(0) == '~') val = '';
               // fix end

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
            App.setSelectOption(App.getUI.translatedFrom, translatedTo_temp);
            App.setSelectOption(App.getUI.translatedTo, translatedFrom_temp);

            App.exchangeText();
         },

         //exchange text in textarea
         exchangeText: () => {
            var a = App.getUI.textOriginal;
            var b = App.getUI.textTranslated;
            if (a.value == '') {
               b.value = [a.value, a.value = b.value][0];
            }
         },

         autoHeightTag: (obj) => {
            switch (obj.tagName.toLowerCase()) {
               case 'textarea':
                  obj.style.height = 'inherit';
                  obj.style.height = obj.scrollHeight + 3 + 'px';
                  break;
               case 'iframe':
                  obj.style.height = obj.contentWindow.document.body.scrollHeight + 'px';
                  break;
               default:
                  obj.style.height = 'auto';
            }
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

            App.translateProvider.toSpeak(args, (outAudio) => {
               outAudio.start(0);
               setTimeout(() => {
                  ico.classList.toggle("icon-volume-down");
                  ico.classList.remove("icon-volume-up");
                  el.classList.remove("disabled");
               }, 1000);
            });
         },

         getSelectionText: () => {
            // chrome.tabs.query({active: true, currentWindow: true}, function(arrayOfTabs) {
            chrome.tabs.getSelected(null, (tab) => {
               if (App.validURL(tab.url))
                  chrome.tabs.executeScript({
                     code: "window.getSelection().toString()",
                     allFrames: true
                  }, (selection) => {
                     // get all frames
                     var selected = selection.filter((x) => {
                        // return (x !== (undefined || null || ''));
                        return (x !== (undefined || null || '')) || false;
                     });
                     if (selected.length > 0) {
                        App.getUI.textOriginal.value = selected;
                        App.translate();
                     }
                  });
            });
         },

         validURL: (str) => {
            var regex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
            if (!regex.test(str)) {
               App.log("Not valid URL", str);
               return false;
            } else
               return true;
         },

         confStorage: {
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
               optionsSave['text-original'] = App.getUI.textOriginal.value.trim();
               optionsSave['text-translated'] = App.getUI.textTranslated.value;

               Storage.setParams(optionsSave, false /*local*/ );
            },

            load: () => {
               var callback = ((res) => {
                  Storage.restoreOptions(res);

                  App.clearText();
                  // App.getUI.textOriginal.focus();
                  App.getUI.textOriginal.select();

                  App.tempSaveStorage = res;
                  // App.getUI.bthTranslate.setAttribute("title", res.hotkeySend.replace(/-/, '+') || 'Enter');

                  // restore Auto Detected (rapam) in load
                  if (res['lang-from'] && res['lang-from'].charAt(0) == '~') {
                     App.getUI.translatedFrom[0].value = res['lang-from'];
                     App.getUI.translatedFrom[0].innerHTML = chrome.i18n.getMessage("translate_from_language") + ' (' + App.translateProvider.langlist[res['lang-from'].substr(1)] + ')';
                  }
               });

               Storage.getParams(null /*all*/ , callback, false /*local*/ );
            },
         },

         init: () => {
            App.log('App Init');

            // App.confStorage.update('clear')
            App.confStorage.load();

            App.getSelectionText();

            App.bildOptionTag(App.getUI.translatedFrom, App.translateProvider.langlist);
            App.bildOptionTag(App.getUI.translatedTo, App.translateProvider.langlist);
         },

         log: (msg, arg1) => {
            if (App.debug) console.log('[+] ' + msg.toString(), arg1 || '')
         },

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
      App.getUI.textOriginal.addEventListener("keydown", async (e) => {
         var storeHotKey = [];

         if (e.ctrlKey && e.which == 13) { //ctrl
            storeHotKey.push('ctrl')
            storeHotKey.push('enter');
         } else if (e.shiftKey && e.which == 13) { //shift
            storeHotKey.push('shift')
            storeHotKey.push('enter');
         } else if (e.which == 13) { //enter
            storeHotKey.push('enter');
         }
         // storeHotKey.push(String.fromCharCode(e.keyCode));

         var sendHotKey = App.tempSaveStorage.hotkeySend ?
            App.tempSaveStorage.hotkeySend.toLowerCase() : 'enter';

         var storeHotKey = storeHotKey.join("-").toString().toLowerCase();
         App.log('storeHotKey ' + storeHotKey);

         // key is press
         if (storeHotKey == sendHotKey) {
            App.log('hit: ' + sendHotKey + '(setting)==' + storeHotKey + '(now)');
            App.translate()
            e.preventDefault(); //prevent default behavior
         }
      });

      App.getUI.textOriginal.addEventListener("input", function () {
         App.autoHeightTag(this);
      });

      // App.getUI.textToSpeakIn.onclick = async(event) => {
      App.getUI.textToSpeakIn.addEventListener("click", function () {
         App.speakPlay(this, {
            textToSpeak: App.getUI.textOriginal.value,
            to_language: App.getUI.translatedFrom.value.replace(/~/, ''), //clear prefix temp lang 
         });
      });

      App.getUI.textToSpeakOut.addEventListener("click", function () {
         App.speakPlay(this, {
            textToSpeak: App.getUI.textTranslated.value.split(/(\n\w+:\n1.)/)[0],
            to_language: App.getUI.translatedTo.value,
         });
      });

      App.getUI.exchangeLang.addEventListener("click", App.exchangeLanguages, false);

      App.getUI.bthTranslate.addEventListener("click", function () {
         App.translate();
      });

      App.getUI.bthOpenSettings.addEventListener("click", function () {
         var iframeId = document.querySelectorAll('iframe')[0];
         iframeId.classList.toggle("hide");
         if (iframeId.src === '')
            iframeId.src = '/html/settings.html';

         iframeId.addEventListener('load', function () {
            App.autoHeightTag(this);
         })
      });

   });


} catch (err) {
   // var e = new Error();
   // e.code = 'NO_ACCESS_TAB';
   // e.message = err.message;
   // reject(e);
   console.warn(JSON.stringify(err));
}
