console.log('init translate');

const translateAPI = {
   Google: function (e, callback) {
      console.log('google translate input:\n' + JSON.stringify(e));

      if (!e || !e.sourceText) {
         console.warn('empty sourceText: ' + e.sourceText);
         return false;
      }

      var sourceLang = e.sourceLang || 'auto';
      var targetLang = e.targetLang || 'en';
      var sourceText = e.sourceText;

      var url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=" +
         sourceLang + "&tl=" + targetLang + "&dt=t&q=" + encodeURI(sourceText);

      console.log('url:' + url);
      fetch(url).then(function (res) {
         // fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ru&hl=ru&dt=t&dt=bd&dj=1&source=icon&tk=467103.467103&q=${text}`).then(function (res) {
         if (res.status >= 200 && res.status < 300) {
            console.log('[200]');
            return Promise.resolve(res);
         } else {
            console.log('[' + res.status + ']');
            return Promise.reject(new Error(res.statusText));
         }
      }).then(function (res) {
         console.log('[*]');
         return res.json();
      }).then(function (res, data) {
         console.log('[+] Request succeeded with JSON response', res, data);
         if (callback && typeof (callback) === "function") {
            var res = translateAPI.clearResonse(res);
            return callback(res);
         }
      }).catch(function (err) {
         console.warn('[-] Request failed', err);
      });
   },

   clearResonse: function (res) {
      // console.log('resirve: ' + JSON.stringify(res));
      return {
         'sourceText': res[0][0][1],
         'translatedText': function () {
            var p = '';
            for (var i in res[0]) {
               p += res[0][i][0];
               // console.log('translatedText: ' + p);
            }
            return p;
         }(), //res[0][0][0],
         'detectLang': res[2]
      }
   }
};