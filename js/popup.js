console.log("start " + chrome.i18n.getMessage("app_name"));

// When the popup HTML has loaded
window.addEventListener('load', (evt) => {

   const App = {
      debug: false,
      // debug: true,

      translate: (dispatch, apiName, callback) => {
         var dispatch = dispatch || {
            sourceLanguage: App.ui.getTag.sourceLang.value,
            targetLanguage: App.ui.getTag.targetLang.value,
            sourceText: App.ui.getTag.translateIn.value,
         };

         if (dispatch.sourceText) {
            var apiName = apiName || 'Google';
            var callback = callback || ((parameter) => {
               console.log('{"resirve"}', JSON.stringify(parameter));
               App.ui.fill(parameter);
               App.localStorage.update();
               App.ui.showLoading(false);
            });
            App.ui.showLoading(true);
            translateAPI[apiName](dispatch, callback);
         }
      },

      ui: {
         getTag: {
            sourceLang: document.getElementById('fromLang'),
            targetLang: document.getElementById('toLang'),
            translateIn: document.getElementById('translate-text-in') ||
               document.querySelectorAll('textarea')[0],
            bthTranslate: document.getElementById('bth-translate'),
            translatedOut: document.getElementById('translate-text-out') ||
               document.querySelectorAll('textarea')[1],
            // textToPlay: document.getElementById("bth-voicePlaying")
         },

         fill: (parameter) => {
            App.ui.getTag.translateIn.value = App.ui.getTag.translateIn.value.trim();
            App.ui.getTag.translatedOut.value = parameter.translatedText;
            // App.ui.setSelectedValue(App.ui.getTag.sourceLang, parameter.detectLang);
            if (App.ui.getTag.sourceLang.value == '') {
               App.ui.getTag.sourceLang[0].innerHTML = chrome.i18n.getMessage("translate_choice_source") + ' (' + lang[parameter.detectLang] + ')';
            }

            App.ui.autoExpand(App.ui.getTag.translateIn);
            App.ui.autoExpand(App.ui.getTag.translatedOut);

            App.ui.getTag.translateIn.focus();
         },

         showLoading: (status) => {
            var i = 0;
            if (status) {
               var text = "loading";
               App.temploadingMessage = setInterval(() => {
                  App.ui.getTag.translatedOut.value = text + Array((++i % 4) + 1).join(".");
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
            // var fromLang_temp = App.getSelectedValue(App.ui.getTag.sourceLang.value);
            // var toLang_temp = App.getSelectedValue(App.ui.getTag.targetLang.value);
            var fromLang_temp = App.ui.getTag.sourceLang.value;
            var toLang_temp = App.ui.getTag.targetLang.value;

            App.ui.setSelectedValue(App.ui.getTag.sourceLang, toLang_temp);
            App.ui.setSelectedValue(App.ui.getTag.targetLang, fromLang_temp);

            var a = App.ui.getTag.translateIn;
            var b = App.ui.getTag.translatedOut;
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
                  App.ui.getTag.translateIn.value = selection[0];
                  App.translate();
               }
            });
            //   });
         } catch (error) {

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
            options_Storage.fromLang = App.ui.getTag.sourceLang.value;
            options_Storage.toLang = App.ui.getTag.targetLang.value;
            options_Storage['translate-text-in'] = App.ui.getTag.translateIn.value;
            options_Storage['translate-text-out'] = App.ui.getTag.translatedOut.value;

            Storage.setParams(options_Storage, chrome.storage.local);
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
         
         Storage.getParams(null,
            (r) => {
               App.localStorage.fillOptValue(r)
               App.ui.autoExpand(App.ui.getTag.translateIn);
               App.ui.autoExpand(App.ui.getTag.translatedOut);
            }, chrome.storage.local);

         App.getSelectionText();

         App.ui.loadLangList(App.ui.getTag.sourceLang, lang);
         App.ui.loadLangList(App.ui.getTag.targetLang, lang);

         App.ui.getTag.translateIn.focus();
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
   App.ui.getTag.translateIn.addEventListener("input", function () {
      App.ui.autoExpand(this);
   });

  
   // document.getElementById("fromTextPlayer").addEventListener("click", function(event) { fromLangListener.play(this); }, false);

   // mouse move event
   //    document.addEventListener('mousemove', function(e) {
   //       mouseX = e.clientX;
   //       mouseY = e.clientY;
   //       pageX = e.pageX;
   //       pageY = e.pageY;
   //   }, false);

   // document.getElementById("bth-voicePlaying").addEventListener("click", function (e) {
   //    //    App.ui.getTag.textToPlay.addEventListener("click", function (e) {
   //    var classes = this.querySelectorAll('i')[0]
   //    classes.classList.toggle("icon-volume-down");
   //    classes.classList.toggle("icon-volume-up");
   // });

   exchangeFromTo.addEventListener("click", App.ui.exchangeLanguages, false);

   App.ui.getTag.bthTranslate.addEventListener("click", (e) => {
      App.translate();
   });

   App.init();

});
