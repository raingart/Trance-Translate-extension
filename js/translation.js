console.log(chrome.i18n.getMessage("app_name") + ": init translation.js");

const translateAPI = {
   // debug: true,

   fetch_a: (url, params, type, callback) => {
      // let result = JSON.parse(UrlFetchApp.fetch(url).getContentText());
      fetch(url, params) // async
         // .then((res) => { //response checkStatus
         //    if (res.status >= 200 && res.status < 300) {
         //       return Promise.resolve(res);
         //    } else {
         //       return Promise.reject(new Error(res.statusText));
         //    }
         // })
         .then((response) => {
            translateAPI.log('url:', url);
            if (response.status >= 200 && response.status < 300) {
               return response;
            } else {
               let error = new Error(response.statusText);
               error.response = response;
               throw error;
            }
         })
         .then((response) => {
            switch (type) {
               case 'text':
                  return response.text();
               case 'json':
                  return response.json();
               case 'arrayBuffer':
                  return response.arrayBuffer();
               default:
                  return response.text();
            }
         })
         .then((res) => {
            translateAPI.log('Request succeeded with response', res);
            if (callback && typeof (callback) === "function") {
               return callback(res);
            } else
               return res;
         })
         .catch((err) => {
            console.warn('[fetching translate data error]:', err);
            return false;
         });
   },

   Google: {
      speakText: (args, callback) => {
         translateAPI.log('Start Speaking!:\n', JSON.stringify(args));

         if (args && args.textToSpeak) {
            let textToSpeak = args.textToSpeak.trim();
            let to = args.to_language || 'en';

            textToSpeak = textToSpeak.replace(/%20| /g, '+');
            if (textToSpeak.substr(0, 1) == ' ' || textToSpeak.substr(0, 1) == '+') {
               textToSpeak = textToSpeak.substr(1, textToSpeak.length - 1);
               translateAPI.log(textToSpeak);
            }

            let soundUrl = 'https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob' +
               '&tl=' + to +
               '&q=' + textToSpeak;

            let type = args.type || 'arrayBuffer';
            let params = args.params || {};

            let audioCtx = new(window.AudioContext || window.webkitAudioContext)();
            let source = audioCtx.createBufferSource();

            let _callback = ((buffer) => {
               audioCtx.decodeAudioData(buffer, function (decodedData) {
                  source.buffer = decodedData;
                  source.connect(audioCtx.destination);
                  // source.loop = true;
                  // source.start(0);
               });
               // let audio = document.createElement('audio');
               // audio.onerror = function (event) {
               //    audio.onerror = null;
               //    audio.src = soundUrl;
               // };
               // audio.src = soundUrl;
               // audio.autoplay = true;
               // audio.play();
               if (callback && typeof (callback) === "function") {
                  return callback(source);
               }
            });

            translateAPI.fetch_a(soundUrl, params, type, _callback);
         } else {
            console.warn('textToSpeak empty:', request.textToSpeak);
            return false;
         }
      },

      translatedText: (request, callback) => {
         translateAPI.log('google translate input:\n', JSON.stringify(request));

         if (request && request.original_text) {
            let from = request.from_language || 'auto';
            let to = request.to_language || 'en';
            let q = request.original_text.trim();

            let type = request.type || 'json';
            let params = request.params || {};

            let url = "https://translate.googleapis.com/translate_a/single?client=gtx&dt=t" +
               '&sl=' + from +
               "&tl=" + to +
               "&q=" + encodeURI(q);

            let _callback = ((res) => {
               let translatedOut = translateAPI.Google.clearResonse(res);
               if (callback && typeof (callback) === "function") {
                  return callback(translatedOut);
               }
            });

            translateAPI.fetch_a(url, params, type, _callback);
         } else {
            console.warn('original_text empty:', request.q);
            return false;
         }
      },

      clearResonse: function (res) {
         translateAPI.log('resirve: ' + JSON.stringify(res));
         return {
            'original_text': res[0][0][1],
            'translated_text': function () {
               let p = '';
               for (let i in res[0]) { //res[0][0][0]
                  p += res[0][i][0];
                  // translateAPI.log('translatedText: ' + p);
               }
               return p;
            }(), //res[0][0][0],
            'detectLang': res[2]
         }
      },
   },

   log: (msg, msg1) => {
      if (translateAPI.debug)
         console.log('>> ' + msg.toString(), msg1)
   }
};
