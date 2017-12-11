console.log('init translate');

const translateAPI = {
    Google: function (e, callback) {
        App.log('google translate input:\n' + JSON.stringify(e));

        if (!e || !e.sourceText) {
            console.log('empty sourceText: ' + e.sourceText);
            return false;
        }

        var sourceLang = e.sourceLang;
        var targetLang = e.targetLang || 'en';
        var sourceText = e.sourceText;

        var url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl="
            + sourceLang + "&tl=" + targetLang + "&dt=t&q=" + encodeURI(sourceText);

        // console.log('url:'+url);
        fetch(url).then(function (res) {
            // fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ru&hl=ru&dt=t&dt=bd&dj=1&source=icon&tk=467103.467103&q=${text}`).then(function (res) {
            if (res.status >= 200 && res.status < 300) {
                App.log('[200]');
                return Promise.resolve(res);
            } else {
                App.log('['+ res.status +']');
                return Promise.reject(new Error(res.statusText));
            }
        }).then(function (res) {
            App.log('[*]');
            return res.json();
        }).then(function (res, data) {
            App.log('[+] Request succeeded with JSON response', data);
            if (callback && typeof (callback) === "function") {
                return callback(res);
            }
        }).catch(function (err) {
            console.warn('[-] Request failed', err);
        });


    }
};