console.log('init translate');

const translateAPI = {
   debug: false,
   
   Google: (request, callback) => {
      translateAPI.log('google translate input:\n', JSON.stringify(request));

      if (request && request.sourceText) {
         let sl = request.sourceLanguage || 'auto';
         let tl = request.targetLanguage || 'en';
         let q = request.sourceText.trim();

         let type = request.type || 'json';
         let params = request.params || {};

         let url = "https://translate.googleapis.com/translate_a/single?client=gtx&dt=t" +
            '&sl=' + sl + 
            "&tl=" + tl + 
            "&q=" + encodeURI(q);
         translateAPI.log('url:', url);

         fetch(url, params) // async
            .then((res) => { //response checkStatus
               if (res.status >= 200 && res.status < 300) {
                  return Promise.resolve(res);
               } else {
                  return Promise.reject(new Error(res.statusText));
               }
            })
            .then((res) => {
               switch (type) {
                  case 'text':
                     return res.text();
                  case 'json':
                     return res.json();
                  case 'arrayBuffer':
                     return res.arrayBuffer();
                  // default:
                  //    return res.json();
               }
            })
            .then((res) => {
               translateAPI.log('[' + res.status + '] Request succeeded with JSON response', res);
               if (callback && typeof (callback) === "function") {
                  var res = translateAPI.clearResonse(res);
                  return callback(res);
               }
            })
            .catch((err) => {
               console.warn('[fetching translate data error]:', err);
               return false;
            });
      } else {
         console.warn('empty sourceText: ' + request.sourceText);
         return false;
      }
   },
   
   clearResonse: function (res) {
      // translateAPI.log('resirve: ' + JSON.stringify(res));
      return {
         'sourceText': res[0][0][1],
         'translatedText': function () {
            var p = '';
            for (var i in res[0]) {
               p += res[0][i][0];
               // translateAPI.log('translatedText: ' + p);
            }
            return p;
         }(), //res[0][0][0],
         'detectLang': res[2]
      }
   },

   log: (msg) => {
      if (translateAPI.debug)
         translateAPI.log('>> ' + msg.toString())
   }
};
