console.log(i18n("app_name") + ": init google_ts.js");

const translateAPI = {};

translateAPI.Google = {
   // debug: true,

   langlist: {
      /* beautify preserve:start */af:"Afrikaans",sq:"Albanian",am:"Amharic",ar:"العربية",hy:"Armenian",az:"Azeerbaijani",eu:"Basque",be:"Belarusian",bn:"Bengali",bs:"Bosnian",bg:"Bulgarian",ca:"Catalan",ceb:"Cebuano","zh-CN":"Chinese","zh-TW":"中國傳統",co:"Corsican",hr:"Croatian",cs:"Czech",da:"Danish",nl:"Dutch",en:"English",eo:"Esperanto",et:"Estonian",fi:"Finnish",fr:"French",fy:"Frisian",gl:"Galician",ka:"Georgian",de:"German",el:"Greek",gu:"Gujarati",ht:"Haitian Creole",ha:"Hausa",haw:"Hawaiian",iw:"Hebrew",hi:"Hindi",hmn:"Hmong",hu:"Hungarian",is:"Icelandic",ig:"Igbo",id:"Indonesian",ga:"Irish",it:"Italian",ja:"Japanese",jw:"Javanese",kn:"Kannada",kk:"Kazakh",km:"Khmer",ko:"Korean",ku:"Kurdish",ky:"Kyrgyz",lo:"Lao",la:"Latin",lv:"Latvian",lt:"Lithuanian",lb:"Luxembourgish",mk:"Macedonian",mg:"Malagasy",ms:"Malay",ml:"Malayalam",mt:"Maltese",mi:"Maori",mr:"Marathi",mn:"Mongolian",my:"Myanmar",ne:"Nepali",no:"Norwegian",ny:"Nyanja",ps:"Pashto",fa:"Persian",pl:"Polish",pt:"Portuguese",pa:"Punjabi",ro:"Romanian",ru:"Russian",sm:"Samoan",gd:"Scots Gaelic",sr:"Serbian",st:"Sesotho",sn:"Shona",sd:"Sindhi",si:"Sinhala",sk:"Slovak",sl:"Slovenian",so:"Somali",es:"Spanish",su:"Sundanese",sw:"Swahili",sv:"Swedish",tl:"Tagalog",tg:"Tajik",ta:"Tamil",te:"Telugu",th:"Thai",tr:"Turkish",uk:"Ukrainian",ur:"Urdu",uz:"Uzbek",vi:"Vietnamese",cy:"Welsh",xh:"Xhosa",yi:"Yiddish",yo:"Yoruba",zu:"Zulu"/* beautify preserve:end */
   },

   googleHost: 'https://translate.google.com/',

   openUrl: (url, isActiveTab) => {
      chrome.tabs.create({
         url: url,
         selected: isActiveTab
      })
   },

   toWeb: (args) => {
      translateAPI.Google.log('translate toWeb:', args.url);
      let url = translateAPI.Google.googleHost + "#" +
         args.from_language + "|" +
         args.to_language + "|" +
         encodeURIComponent(args.original_text.trim());

      translateAPI.Google.openUrl(url)
      // prompt("toWeb", url); 
   },

   toUrl: (args) => {
      translateAPI.Google.log('translate toUrl:', args.url);
      let url = translateAPI.Google.googleHost + 'translate?' +
         '&sl=' + 'auto' +
         "&tl=" + args.to_language +
         "&u=" + args.url;

      translateAPI.Google.openUrl(url)
      // prompt("toWeb", url); 
   },

   toSpeak: (request, callback) => {
      translateAPI.Google.log('Start Speaking!:\n', JSON.stringify(request));

      if (request && request.textToSpeak) {
         let textToSpeak = request.textToSpeak.trim();
         let to = request.to_language || 'en';

         textToSpeak = textToSpeak.replace(/%20| /g, '+');
         if (textToSpeak.substr(0, 1) == ' ' || textToSpeak.substr(0, 1) == '+') {
            textToSpeak = textToSpeak.substr(1, textToSpeak.length - 1);
            translateAPI.Google.log(textToSpeak);
         }

         let soundUrl = translateAPI.Google.googleHost + '/translate_tts?ie=UTF-8&client=tw-ob' +
            '&tl=' + to +
            '&q=' + textToSpeak;
            // '&q=' + encodeURIComponent(textToSpeak);
         // translateAPI.Google.log('url:', url);

         let type = request.type || 'arrayBuffer';
         let payload = request.payload || {};

         let _callback = ((buffer) => {
            let audioCtx = new(window.AudioContext || window.webkitAudioContext)();
            let source = audioCtx.createBufferSource();
            
            audioCtx.decodeAudioData(buffer, (decodedData) => {
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

         http.fetch(soundUrl, payload, type, _callback);
      } else {
         console.warn('textToSpeak empty:', request.textToSpeak);
         return false;
      }
   },

   toText: (request, callback) => {
      translateAPI.Google.log('google translate input:\n', JSON.stringify(request));

      if (request && request.original_text) {
         let from = request.from_language || 'auto';
         let to = request.to_language || 'en';
         let q = request.original_text.trim();

         let type = request.type || 'json';
         let payload = request.payload || {};

         let url = "https://translate.googleapis.com/translate_a/single?client=gtx&dt=t&dt=bd" +
         // let url = "https://translate.googleapis.com/translate_a/single?client=gtx&dt=t" +
         // hl:	EXT_LOCALE,   
            '&sl=' + from +
            "&tl=" + to +
            "&q=" + encodeURIComponent(q);

         let _callback = ((res) => {
            let translatedOut = translateAPI.Google.clearResonse(res);
            if (callback && typeof (callback) === "function") {
               return callback(translatedOut);
            }
         });

         http.fetch(url, payload, type, _callback);
      } else {
         console.warn('original_text empty:', request.q);
         return false;
      }
   },

   clearResonse: (res) => {
      translateAPI.Google.log('resirve: ' + JSON.stringify(res));
      return {
         'original_text': res[0][0][1],

         'translated_text': (() => {
            let out = [];
            // translated
            var sentences = res[0];
            for (let i in sentences)
               out.push( sentences[i][0] );

            out.push( "" );

            // dictionary
				if (res[1] && res[1].length) {
               let dict = res[1];
               for (let i in dict) {
						out.push( dict[i][0] + ":" );

						for (let j=0; j<dict[i][1].length; j++)
                     out.push( (j+1) + ". " + dict[i][1][j] );

						out.push( "" );
					}
            }
            // collect result
            return out.join('\n');
         })(),
         
         'detectLang': res[2],
      }
   },

   log: (msg, arg1) => {
      if (translateAPI.Google.debug) console.log('>> ' + msg.toString(), arg1 || '')
   }
};
