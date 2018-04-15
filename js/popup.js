console.log(i18n("app_name") + ": init popup.js");

const App = {
   // DEBUG: true,

   translateProvider: {
      langlist: translateAPI['Google'].langlist,
      toText: translateAPI['Google'].toText,
      toSpeak: translateAPI['Google'].toSpeak
   },

   clearText: () => {
      UI.textOriginal.value = UI.textOriginal.value.trim();
      UI.textTranslated.value = UI.textTranslated.value.trim();
      App.autoHeightTag(UI.textOriginal);
      App.autoHeightTag(UI.textTranslated);
   },

   translate: (dispatch, callback) => {
      // block flude
      if (App.timerLoadingMsg) return false;

      App.exchangeText(); // if in ''

      let dispatch_ = dispatch || {
         from_language: UI.translatedFrom.value.replace(/~.+$/, ''), //clear prefix temp lang 
         to_language: UI.translatedTo.value,
         original_text: UI.textOriginal.value,
      };

      if (dispatch_.original_text) { //skip if empty text
         let callback_ = callback || ((parameter) => {
            App.log('resirve:', JSON.stringify(parameter));
            // console.log('resirve:', JSON.stringify(parameter));
            App.showLoading(false);

            // if translated To == From invert lang
            // set new callback
            console.log('parameter.detectLang: ' + parameter.detectLang);
            console.log('dispatch_.to_language: ' + dispatch_.to_language);
            if (parameter.detectLang == dispatch_.to_language &&
               dispatch_.from_language != dispatch_.to_language) {
               // App.setSelectOption(UI.translatedTo, UI.translatedFrom.value);
               App.exchangeLanguages();
               let callback = ((parameter) => {
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
         App.translateProvider.toText(dispatch_, callback_);
      }
   },

   makeReturn: (parameter) => {
      UI.textTranslated.value = parameter.translated_text;

      if (UI.translatedFrom.value.replace(/~.+$/, '') == '') { //create Auto Detected (rapam)
         UI.translatedFrom[0].value = '~' + parameter.detectLang;
         UI.translatedFrom[0].innerHTML = i18n("translate_from_language") +
            ' (' + App.translateProvider.langlist[parameter.detectLang] + ')';
      }

      App.clearText();
      UI.textOriginal.focus();
   },

   showLoading: (status) => {
      if (status && !App.timerLoadingMsg) {
         let i = 0;
         let msg = "loading";
         UI.textTranslated.value = msg;
         App.timerLoadingMsg = setInterval(() => {
            UI.textTranslated.value = msg + Array((++i % 4) + 1).join(".");
         }, 300);
      } else {
         clearInterval(App.timerLoadingMsg);
         App.timerLoadingMsg = false;
      }
   },

   setSelectOption: (selectObj, val) => {
      for (let i in selectObj.children) {
         let option = selectObj.children[i];

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
      // let translatedFrom_temp = App.getSelectedValue(UI.translatedFrom.value);
      // let translatedTo_temp = App.getSelectedValue(UI.translatedTo.value);
      // temp
      let temp_translatedFrom = UI.translatedFrom.value.replace(/~.+$/, '');
      let temp_translatedTo = UI.translatedTo.value;
      // aplay
      App.setSelectOption(UI.translatedFrom, temp_translatedTo);
      App.setSelectOption(UI.translatedTo, temp_translatedFrom);

      App.exchangeText();
   },

   //exchange text in textarea
   exchangeText: () => {
      let a = UI.textOriginal;
      let b = UI.textTranslated;
      if (a.value == '') {
         // b.value = [a.value, a.value = b.value][0];
         [a.value, b.value] = [b.value, a.value];
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
      for (let i in optionVal) {
         // new Option("key","value")).setAttribute("key","value");
         selbox.options[selbox.options.length] = new Option(optionVal[i], i);
         // let r = document.createElement("option");
         // r.value = i;
         // r.textContent = optionVal[i];
         // selectTag.appendChild(r)
      }
   },

   speakPlay: (el, args) => {
      // el.classList.add("disabled");
      let ico = el.querySelectorAll('i')[0]; //ttf awesome icon

      App.translateProvider.toSpeak(args, (audio) => {
         audio.start();
         // audio.play();

         ico.classList.replace("icon-volume-down", "icon-volume-up");

         // general
         audio.addEventListener('ended', function () {
            App.log('playing end');
            defaultIcon();
         });

         // spare
         // setTimeout(function () {
         //    defaultIcon();
         // }, 3000);

         function defaultIcon() {
            ico.classList.replace("icon-volume-up", "icon-volume-down");
            App.log('defaultIcon ' + el.classList.contains("icon-volume-down"));
            // el.classList.remove("disabled");
         }
      });
   },

   getSelectionText: () => {
      chrome.tabs.getSelected(null, (tab) => {
         if (App.isLink(tab.url))
            chrome.tabs.executeScript({
               code: "window.getSelection().toString()",
               allFrames: true
            }, (selection) => {

               let selected = selection.filter((x) => {
                  return (x !== (undefined || null || ''));
               });

               if (selected.length) {
                  UI.textOriginal.value = selected;
                  App.translate();
               }
            });
      });
   },

   isLink: (link) => {
      return (/http:|https:|ftp:/.test(link.split('/')[0])) ? true : false;
   },

   confStorage: {
      // Saves options to localStorage/chromeSync.
      update: (reset) => {
         if (reset) {
            chrome.storage.local.clear();
            chrome.storage.sync.clear();
            console.log('[chrome.storage] clear!');
         }

         let optionsSave = {};
         optionsSave['lang-from'] = UI.translatedFrom.value;
         optionsSave['lang-to'] = UI.translatedTo.value;
         optionsSave['text-original'] = UI.textOriginal.value.trim();
         optionsSave['text-translated'] = UI.textTranslated.value;

         Storage.setParams(optionsSave, false /*local*/ );
      },

      load: () => {
         // local get textarea and lang-to/from
         let callback = (res) => {
            UIr.restoreElmValue(res);

            App.clearText();
            
            // UI.textOriginal.focus();
            UI.textOriginal.select();

            // restore "Auto Detected (lang-code)"" in load
            if (res['lang-from'] && res['lang-from'].charAt(0) == '~') {
               UI.translatedFrom[0].value = res['lang-from'];
               UI.translatedFrom[0].innerHTML = i18n("translate_from_language") + ' (' + App.translateProvider.langlist[ res['lang-from'].substr(1) ] + ')';
            }
         };
         Storage.getParams(null, callback, false /* true=sync, false=local */ );

         // sync get option param
         let callback_sync = (res) => {
            App.tempSync = res;
            // fix title
            let hotkeySend = res.hotkeySend ? res.hotkeySend.replace(/-/, '+') : 'Enter';
            UI.bthTranslate.setAttribute("title", hotkeySend);
         }
         Storage.getParams(null /*all*/, callback_sync, true  /*true-sync / false-local*/ );
      },
   },

   init: () => {
      App.log('App Init');

      // App.confStorage.update('clear')
      App.confStorage.load();

      App.getSelectionText();

      App.bildOptionTag(UI.translatedFrom, App.translateProvider.langlist);
      App.bildOptionTag(UI.translatedTo, App.translateProvider.langlist);
   },

   log: (msg, args) => {
      let arg = args === undefined ? '' : args;
      App.DEBUG && console.log('[+] ' + msg.toString().trim(), arg)
   },

   // langlist: lang.map(code => code.substr(0, 2).toLowerCase()),
   // langlist: lang.forEach(function(value, key) {
   //    // console.log(key + ' = ' + value);
   //  }),
};
