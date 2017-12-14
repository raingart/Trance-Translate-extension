// When the popup HTML has loaded
window.onload = () => {
    // window.addEventListener('load', (evt) => {

    const App = {
        debug: false,
        // debug: true,

        translate: (e, source, callback) => {
            var e = e || {
                sourceLang: App.ui.getElement.sourceLang.value,
                targetLang: App.ui.getElement.targetLang.value,
                sourceText: App.ui.getElement.sourceText.value,
            };
            var callback = callback || App.ui.ui;
            var source = source || 'Google';

            // App.uiIsLoading(false);
            App.ui.uiIsLoading(true);

            var status = translateAPI[source](e, callback);
            if (!status) {
                App.ui.uiIsLoading(false);
            }
        },

        ui: {
            getElement: {
                sourceLang: document.getElementById('fromLang'),
                targetLang: document.getElementById('toLang'),
                // sourceText: document.getElementById('textToTranslate'),
                sourceText: document.querySelectorAll('textarea')[0],
                bthTranslate: document.getElementById('translate'),
                // translatedText: document.getElementById('translatedText'),
                translatedText: document.querySelectorAll('textarea')[1]
            },

            ui: (e) => {
                App.log('resirve: ' + JSON.stringify(e));
                App.ui.getElement.translatedText.value = e.translatedText;
                // document.getElementsByTagName("textarea")[1].select();
                App.ui.selectedOptionByVal(App.ui.getElement.sourceLang, e.detectLang);
            },

            uiIsLoading: (status) => {
                if (status) {
                    var i = 0,
                        text = "loading" + Array((++i % 4) + 1).join(".");
                    App.loadingMessage = setInterval(() => {
                        App.ui.getElement.translatedText.value = text;
                    }, 500);
                    setTimeout(() => {
                        App.ui.getElement.bthTranslate.disabled = false;
                    }, 1000);
                } else {
                    clearInterval(App.loadingMessage);
                }
            },

            selectedOptionByVal: (selectName, optVal) => {
                if (!selectName.options) return false;
                for (var opt, j = 0; opt = selectName.options[j]; j++) {
                    if (opt.value == optVal) {
                        selectName.selectedIndex = j;
                        break;
                    }
                }
            },

            ExchangeLanguages: () => {
                var fromLang_temp = App.ui.getElement.sourceLang.value;
                var toLang_temp = App.ui.getElement.targetLang.value;

                App.ui.selectedOptionByVal(App.ui.getElement.sourceLang, toLang_temp);
                App.ui.selectedOptionByVal(App.ui.getElement.targetLang, fromLang_temp);

                // var a = App.ui.getElement.sourceText;
                // var b = App.ui.getElement.translatedText;

                // b.value = [a.value, a.value = b.value][0];
            },

            autoExpand: (e) => {
                e.style.height = 'inherit'
                e.style.height = e.scrollHeight + 'px'
            },

            onPageDetailsReceived: (details) => {
                App.ui.getElement.sourceText.value = details.summary;
                App.translate();
            },
        },

        config: {
            // Saves options to localStorage/chromeSync.
            update: (reset) => {
                if (reset)
                    localStorage.clear();

                options_Storage = {};

                options_Storage.fromLang = App.ui.getElement.sourceLang.value || 'auto';
                options_Storage.toLang = App.ui.getElement.targetLang.value || 'en';
                options_Storage.textToTranslate = App.ui.getElement.sourceText.value;

                Storage.setParams(options_Storage, chrome.storage.local);
            },

            // Restores select box state to saved value from localStorage/chromeSync.
            load: (base) => {
                App.log("Load the configuration from localStorage: \n" + JSON.stringify(base));

                for (var property in base) {
                    var item = base[property];
                    App.log("item> " + property + ":" + item);
                    var el = document.getElementById(property);

                    if (el) {
                        App.log("item find tag> " + property + ":" + item);
                        App.ui.selectedOptionByVal(el, item);
                        // el.checked = item ? true : false; // Check/Uncheck
                    }
                }
            },
        },

        init: () => {
            App.log('App Init');
            Storage.getParams(null, App.config.load, chrome.storage.local);
            // window.onload = Storage.getParams(null, App.config.load, chrome.storage.local);
            App.ui.getElement.sourceText.focus();
            
            for (var i in lang) {
                App.ui.getElement.sourceLang.options[App.ui.getElement.sourceLang.options.length] = new Option(lang[i], i);
                App.ui.getElement.targetLang.options[App.ui.getElement.targetLang.options.length] = new Option(lang[i], i);
            }
            // var optionsHTML = [];
            // for (var key in lang) {
            //     optionsHTML.push( '<option value="' + key + '">' + lang[key] + '</option>' );
            // }
            // App.ui.getElement.sourceLang.innerHTML += optionsHTML.join('\n');
            // App.ui.getElement.targetLang.innerHTML += optionsHTML.join('\n');
        },

        log: (msg) => {
            if (App.debug)
                console.log('>> ' + String(msg))
        }
        //   const log = (parameter) => { console.log(parameter);};
    };


    // When the popup HTML has loaded
    // window.addEventListener('load', (evt) => {
    App.ui.getElement.sourceText.addEventListener("input", function () {
        App.ui.autoExpand(this)
    });

    App.ui.getElement.translatedText.addEventListener("click", function () {
        App.ui.autoExpand(this)
    });

    // document.onkeyup = (e) => {
    document.addEventListener("keyup", function (e) {
        if (e.ctrlKey && e.which == 13) {
            App.translate();
            // document.getElementById('textToTranslate').value += '\n';
            // return false;
        } else if (e.shiftKey && e.which == 13) {
            App.ui.ExchangeLanguages();
            return false;
        // } else if (e.which == 13) {
        //     App.translate();
        //     return false;
        }
    });
    // };

    // buttonSave.addEventListener("click", function (e) {
    //     App.config.update();
    // });

    // buttonSaveClear.addEventListener("click", function (e) {
    //     App.config.update(true);
    // });
    // document.getElementById("fromTextPlayer").addEventListener("click", function(event) { fromLangListener.play(this); }, false);

    document.getElementById("textToPlay").addEventListener("click", function (e) {
        var classes = this.querySelectorAll('i')[0]
        // this.querySelectorAll('i')[0].classList.toggle("icon-volume-up");
            classes.classList.toggle("icon-volume-off");
        if (classes.indexOf("icon-volume-up"))
            classes.classList.toggle("icon-volume-off");
    });

    exchangeFromTo.addEventListener("click", (e) => {
        App.ui.ExchangeLanguages();
    });

    translate.addEventListener("click", (e) => {
        App.translate();
        App.config.update();
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
        eventPage.getPageDetails(App.ui.onPageDetailsReceived);
    });

    App.init();
// });
};