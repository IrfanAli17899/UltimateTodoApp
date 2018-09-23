// Set this to true for production
var doCache = true;

// Name our cache
var CACHE_NAME = 'todo-cache-v1';

var filesToCache = [
  '/src/app.js',
  '/src/components/TodoItem.js',
  '/src/index.js',
  '/',
];

// Delete old caches that are not our current one!
self.addEventListener("activate", event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys()
      .then(keyList =>
        Promise.all(keyList.map(key => {
          if (!cacheWhitelist.includes(key)) {
            console.log('Deleting cache: ' + key)
            return caches.delete(key);
          } else {
            console.log( "keeping key:", key);
          }
        }))
      )
  );
});

// The first time the user starts up the PWA, 'install' is triggered.
self.addEventListener('install', function(event) {
  if (doCache) {
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then(function(cache) {
          // Get the assets manifest so we can see what our js file is named
          // This is because webpack hashes it
          fetch("asset-manifest.json")
            .then((response) => {
              return response.json();
            })
            .then(assets => {
              console.log( "asset manifest:", assets);
              // Open a cache and cache our files
              // We want to cache the page and the main.js generated by webpack
              // We could also cache any static assets like CSS or images
              const urlsToCache = [
                "/",
                assets["main.js"],
                assets["main.css"]
              ]
              cache.addAll(urlsToCache)
              console.log('cached');
            })
        })
    );
  }
});

// When the webpage goes to fetch files, we intercept that request and serve up the matching files
// if we have them
self.addEventListener('fetch', function(event) {
    if (doCache) {
      // if some condition
      // always go to network first, then cache results
      // e.respondWith(
      //   caches.open(dataCacheName).then(function(cache) {
      //     return fetch(e.request).then(function(response){
      //       cache.put(e.request.url, response.clone());
      //       return response;
      //     });
      //   })
      // );
      // else ...
      // this is cache first, fallback network
      event.respondWith(
          caches.match(event.request).then(function(response) {
              return response || fetch(event.request);
          })
      );
    }
});