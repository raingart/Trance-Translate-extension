const http = {
   fetch: (url, payload, typeResponse, callback) => {
      // let result = JSON.parse(UrlFetchApp.fetch(url).getContentText());
      fetch(url, payload) // async
         // .then((res) => {
         //    if (res.status >= 200 && res.status < 300) {
         //       return Promise.resolve(res);
         //    } else {
         //       return Promise.reject(new Error(res.statusText));
         //    }
         // })
         .then((response) => { //response checkStatus
            if (response.status >= 200 && response.status < 300) {
               return response;
            } else {
               let error = new Error(response.statusText);
               error.response = response;
               throw error;
            }
         })
         .then((response) => {
            switch (typeResponse) {
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
            // console.log('Request succeeded with response', res);
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
/* 
   post: function (url, payload, resolve, error, notify) {
      var request = new XMLHttpRequest();

      request.open('POST', url, true);
      request.onload = onload;
      request.onerror = onerror;
      request.onprogress = onprogress;
      request.send(payload);

      function onload() {
         if (request.status === 200) {
            var respJSon = JSON.parse(request.responseText);
            resolve(respJSon);
         } else {
            if (error) {
               error(new Error('Status code was ' + request.status));
            }
         }
      }

      function onerror() {
         if (error) {
            error(new Error('Can\'t XHR ' + JSON.stringify(url)));
         }
      }

      function onprogress(event) {
         if (notify) {
            notify(event.loaded / event.total);
         }
      }
   },
   get: function (url, resolve, error, notify) {
      var request = new XMLHttpRequest();

      request.open('GET', url, true);
      request.onload = onload;
      request.onerror = onerror;
      request.onprogress = onprogress;
      request.send();

      function onload() {
         if (request.status === 200) {
            var respJSon = JSON.parse(request.responseText);
            resolve(respJSon);
         } else {
            if (error) {
               error(new Error('Status code was ' + request.status));
            }
         }
      }

      function onerror() {
         if (error) {
            error(new Error('Can\'t XHR ' + JSON.stringify(url)));
         }
      }

      function onprogress(event) {
         if (notify) {
            notify(event.loaded / event.total);
         }
      }
   } */
}
