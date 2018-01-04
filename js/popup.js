console.log(chrome.i18n.getMessage("app_name") + ": init popup.js");

// When the popup HTML has loaded
window.addEventListener('load', (evt) => {

   const App = {
      debug: true,

      langlist: {
         /* beautify preserve:start */af:"Afrikaans",sq:"Albanian",am:"Amharic",ar:"Arabic",hy:"Armenian",az:"Azeerbaijani",eu:"Basque",be:"Belarusian",bn:"Bengali",bs:"Bosnian",bg:"Bulgarian",ca:"Catalan",ceb:"Cebuano","zh-CN":"Chinese","zh-TW":"中國傳統",co:"Corsican",hr:"Croatian",cs:"Czech",da:"Danish",nl:"Dutch",en:"English",eo:"Esperanto",et:"Estonian",fi:"Finnish",fr:"French",fy:"Frisian",gl:"Galician",ka:"Georgian",de:"German",el:"Greek",gu:"Gujarati",ht:"Haitian Creole",ha:"Hausa",haw:"Hawaiian",iw:"Hebrew",hi:"Hindi",hmn:"Hmong",hu:"Hungarian",is:"Icelandic",ig:"Igbo",id:"Indonesian",ga:"Irish",it:"Italian",ja:"Japanese",jw:"Javanese",kn:"Kannada",kk:"Kazakh",km:"Khmer",ko:"Korean",ku:"Kurdish",ky:"Kyrgyz",lo:"Lao",la:"Latin",lv:"Latvian",lt:"Lithuanian",lb:"Luxembourgish",mk:"Macedonian",mg:"Malagasy",ms:"Malay",ml:"Malayalam",mt:"Maltese",mi:"Maori",mr:"Marathi",mn:"Mongolian",my:"Myanmar",ne:"Nepali",no:"Norwegian",ny:"Nyanja",ps:"Pashto",fa:"Persian",pl:"Polish",pt:"Portuguese",pa:"Punjabi",ro:"Romanian",ru:"Russian",sm:"Samoan",gd:"Scots Gaelic",sr:"Serbian",st:"Sesotho",sn:"Shona",sd:"Sindhi",si:"Sinhala",sk:"Slovak",sl:"Slovenian",so:"Somali",es:"Spanish",su:"Sundanese",sw:"Swahili",sv:"Swedish",tl:"Tagalog",tg:"Tajik",ta:"Tamil",te:"Telugu",th:"Thai",tr:"Turkish",uk:"Ukrainian",ur:"Urdu",uz:"Uzbek",vi:"Vietnamese",cy:"Welsh",xh:"Xhosa",yi:"Yiddish",yo:"Yoruba",zu:"Zulu"/* beautify preserve:end */
      },

      analytics: () => {
         var x = document.createElement('script');
         x.src = '/lib/analytics.min.js';
         document.getElementsByTagName("head")[0].appendChild(x);
      },

      translate: (dispatch, apiName, callback) => {
         var dispatch = dispatch || {
            from_language: App.getUI.htmlTag.fromLang.value.replace(/~.+$/, ''),
            to_language: App.getUI.htmlTag.toLang.value,
            original_text: App.getUI.htmlTag.textOriginal.value,
         };

         if (dispatch.original_text) {
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
               "&tl=" + App.getUI.htmlTag.toLang.value +
               "&u=" + tab.url);
         });
      },

      getUI: {
         htmlTag: {
            fromLang: document.getElementById('from-lang'),
            toLang: document.getElementById('to-lang'),
            textOriginal: document.getElementById('original-text') ||
               document.querySelectorAll('textarea')[0],
            bthTranslate: document.getElementById('bth-translate'),
            translatedText: document.getElementById('translated-text') ||
               document.querySelectorAll('textarea')[1],
            exchangeLang: document.getElementById('bth-exchange-lang'),
            textInToSpeak: document.getElementById('btn-textIn-to-speak'),
            textOutToSpeak: document.getElementById('btn-textOut-to-speak'),
            bthTranslatePage: document.getElementById('bth-translate-page'),
         },

         fill: (parameter) => {
            App.getUI.htmlTag.textOriginal.value = App.getUI.htmlTag.textOriginal.value.trim();
            App.getUI.htmlTag.translatedText.value = parameter.translated_text;


            
            if (App.getUI.htmlTag.fromLang.value.replace(/~.+$/, '') == '') { //create Auto Detected (rapam)
               var autoLangCode = parameter.original_text ? '~' + parameter.detectLang : '';
               // App.getUI.htmlTag.fromLang[0].options[outSelected.options.length] = new Option(parameter.detectLang, '111');
               // selbox.options[selbox.options.length] = new Option("key","value")).setAttribute("key","value");
               App.getUI.htmlTag.fromLang[0].value = autoLangCode;
               App.getUI.htmlTag.fromLang[0].innerHTML = chrome.i18n.getMessage("translate_choice_source") + ' (' + App.langlist[parameter.detectLang] + ')';
            }

            App.getUI.autoExpand(App.getUI.htmlTag.textOriginal);
            App.getUI.autoExpand(App.getUI.htmlTag.translatedText);

            App.getUI.htmlTag.textOriginal.focus();
         },

         showLoading: (status) => {
            var i = 0;
            if (status) {
               var text = "loading";
               App.temploadingMessage = setInterval(() => {
                  App.getUI.htmlTag.translatedText.value = text + Array((++i % 4) + 1).join(".");
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
            // var fromLang_temp = App.getSelectedValue(App.getUI.htmlTag.fromLang.value);
            // var toLang_temp = App.getSelectedValue(App.getUI.htmlTag.toLang.value);
            var fromLang_temp = App.getUI.htmlTag.fromLang.value;
            var toLang_temp = App.getUI.htmlTag.toLang.value;

            App.getUI.setSelectedValue(App.getUI.htmlTag.fromLang, toLang_temp);
            App.getUI.setSelectedValue(App.getUI.htmlTag.toLang, fromLang_temp);

            var a = App.getUI.htmlTag.textOriginal;
            var b = App.getUI.htmlTag.translatedText;
            if (a.value == '') {
               b.value = [a.value, a.value = b.value][0];
            }
         },

         autoExpand: (t) => {
            t.style.height = 'inherit'
            t.style.height = t.scrollHeight + 'px'
         },

         fillSelect: (outSelected, loadOptionVal) => {
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
            if (reset) {
               chrome.storage.local.clear();
               chrome.storage.sync.clear();
               console.log('[chrome.storage] clear!');
            }

            var options_Storage = {};
            options_Storage['from-lang'] = App.getUI.htmlTag.fromLang.value;
            options_Storage['to-lang'] = App.getUI.htmlTag.toLang.value;
            options_Storage['original-text'] = App.getUI.htmlTag.textOriginal.value;
            options_Storage['translated-text'] = App.getUI.htmlTag.translatedText.value;

            return Storage.setParams(options_Storage, false);
         },

         // Restores select box state to saved value from localStorage/chromeSync.
         fillOptValue: (base) => {
            App.log("Load from Storage: \n" + JSON.stringify(base));
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

         // App.localStorage.update('clear')

         Storage.getParams(null,
            ((res) => {
               App.localStorage.fillOptValue(res)
               App.getUI.autoExpand(App.getUI.htmlTag.textOriginal);
               App.getUI.autoExpand(App.getUI.htmlTag.translatedText);
               App.getUI.htmlTag.textOriginal.focus();
               App.getUI.htmlTag.textOriginal.select();

               // restore Auto Detected (rapam)
               if (res['from-lang'].charAt(0) == '~') {
                  App.getUI.htmlTag.fromLang[0].value = res['from-lang'];
                  App.getUI.htmlTag.fromLang[0].innerHTML = chrome.i18n.getMessage("translate_choice_source") + ' (' + App.langlist[res['from-lang'].substr(1)] + ')';
               }

            }), false);

         // App.getSelectionText();

         App.getUI.fillSelect(App.getUI.htmlTag.fromLang, App.langlist);
         App.getUI.fillSelect(App.getUI.htmlTag.toLang, App.langlist);

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
   App.getUI.htmlTag.textOriginal.addEventListener("input", function () {
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
         textToSpeak: App.getUI.htmlTag.textOriginal.value,
         to_language: App.getUI.htmlTag.fromLang.value.replace(/~/, ''), //clear prefix temp lang 
      });
   };

   App.getUI.htmlTag.textOutToSpeak.onclick = function () {
      App.getUI.textToSpeak(this, {
         textToSpeak: App.getUI.htmlTag.translatedText.value,
         to_language: App.getUI.htmlTag.toLang.value,
      });
   };

   App.getUI.htmlTag.exchangeLang.addEventListener("click", App.getUI.exchangeLanguages, false);

   App.getUI.htmlTag.bthTranslate.addEventListener("click", (e) => {
      App.translate();
   });

   App.getUI.htmlTag.bthTranslatePage.addEventListener("click", (e) => {
      App.translatePage();
   });

   App.init();

});
