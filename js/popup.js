
const App = {
    debug: false,

    translate: function (ev, callback_v) {
        var e = ev || {
            sourceLang: document.getElementById('fromLang').value || 'auto',
            targetLang: document.getElementById('toLang').value || 'en',
            sourceText: $("#text-to-translate").val()
        };
        var callback = callback_v || App.clearResonse;

        // App.uiIsLoading(false);
        App.ui.uiIsLoading(true);

        var st = translateAPI.Google(e, callback);
        if (!st) {
            App.ui.uiIsLoading(false);
        }
    },

    ui: {
        ui: function (e) {
            document.getElementById('translatedText').value = e.translatedText;
            App.ui.selectedOptionByVal(document.getElementById("fromLang"), e.detectLang);
        },

        uiIsLoading: function (status) {
            if (status) {
                var i = 0,
                    text = "loading";
                // var loadingSymbol = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
                App.loadingMessage = setInterval(function () {
                    // i = i < loadingSymbol.length - 1 ? ++i : 0;
                    $("#translatedText").val(
                        text + Array((++i % 4) + 1).join(".")
                        // loadingSymbol[i]
                    );
                }, 500);
                setTimeout(function () { document.getElementById("translate").disabled = false; }, 1000);
            }
            else {
                clearInterval(App.loadingMessage);
            }
        },

        selectedOptionByVal: function (selectName, optVal) {
            for (var opt, j = 0; opt = selectName.options[j]; j++) {
                if (opt.value == optVal) {
                    selectName.selectedIndex = j;
                    break;
                }
            }
        },

        ExchangeLanguages: function () {
            var fromLang = document.getElementById("fromLang"); //.selectedIndex
            var toLang = document.getElementById("toLang");

            var fromLang_temp = fromLang.value;
            var toLang_temp = toLang.value;

            App.ui.selectedOptionByVal(toLang, fromLang_temp);
            App.ui.selectedOptionByVal(fromLang, toLang_temp);

            var s = $('#text-to-translate');
            var t = $("#translatedText");

            t1_temp = t.val();
            s1_temp = s.val();

            t.val(s1_temp);
            s.val(t1_temp);
        },

        onPageDetailsReceived: function (details) {
            document.getElementById('text-to-translate').value = details.summary;
            App.translate();
        }
    },


    clearResonse: function (res) {
        App.log('resirve: ' + JSON.stringify(res));
        var text = {
            // return {
            'sourceText': res[0][0][1],
            'translatedText': res[0][0][0],
            'detectLang': res[2]
        };
        App.ui.ui(text);
    },

    config: {
        // Saves options to localStorage/chromeSync.
        update: function (reset) {
            if (reset) {
                localStorage.clear();
            }
            var options_Storage = {};

            options_Storage.fromLang = fromLang.value || 'auto';
            options_Storage.toLang = toLang.value || 'en';

            Storage.setParams(options_Storage, chrome.storage.local);
        },

        // Restores select box state to saved value from localStorage/chromeSync.
        load: function (base) {
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


    init: function () {
        App.log('App Init');

        window.onload = Storage.getParams(null, App.config.load, chrome.storage.local);

        var textarea = document.getElementsByTagName("textarea")[0];
        textarea.focus();
        textarea.select();

        for (var key in lang) {
            $("#fromLang, #toLang").append(
                '<option value="' +
                key +
                '">' +
                lang[key] +
                "</option>"
            );
        }
    },

    log: function (msg) {
        if (App.debug) {
            msg = String(msg) || NULL;
            console.log('>> ' + msg);
        }
    }
};


// When the popup HTML has loaded
window.addEventListener('load', function (evt) {

    $(document).on('input', 'textarea', function () {
        $(this).outerHeight(38).outerHeight(this.scrollHeight); // 38 or '1em' -min-height
    });

    $(document).on('click', '#translatedText', function () {
        $(this).outerHeight(38).outerHeight(this.scrollHeight); // 38 or '1em' -min-height
    });

    document.onkeyup = function (ev) {
        var e = ev || window.event; // for IE to cover IEs window event-object
        if (e.ctrlKey && e.which == 13) {
            App.translate();
            // document.getElementById('text-to-translate').value += '\n';
            // return false;
        } else if (e.shiftKey && e.which == 13) {
            App.ui.ExchangeLanguages();
            return false;
        } else if (e.which == 13) {
            App.translate();
            return false;
        }
    };

    // buttonSave.addEventListener("click", function (e) {
    //     App.config.update();
    // });

    // buttonSaveClear.addEventListener("click", function (e) {
    //     App.config.update(true);
    // });
    // document.getElementById("fromTextPlayer").addEventListener("click", function(event) { fromLangListener.play(this); }, false);

    exchangeFromTo.addEventListener("click", function (e) {
        App.ui.ExchangeLanguages();
    });

    translate.addEventListener("click", function (e) {
        App.translate();
        App.config.update();
    });

    // chrome.tabs.getSelected(null, function(tab) {
    //     chrome.tabs.sendRequest(tab.id, {method: 'getSelection'}, function (response) {
    //     //   document.getElementById('text-to-translate').value = response.data;
    //       console.log(response) ;
    //     });
    //   });

    chrome.runtime.getBackgroundPage(function (eventPage) {
        // Call the getPageInfo function in the event page, passing in 
        // our onPageDetailsReceived function as the callback. This injects 
        // content.js into the current tab's HTML
        eventPage.getPageDetails(App.ui.onPageDetailsReceived);
    });

    App.init();
});