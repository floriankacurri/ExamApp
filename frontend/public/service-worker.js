const CACHE_NAME = 'exam-app-cache';

// Assets I want to cache
// const urlsToCache = [
//     '/',
//     '/index.html',
//     '/favicon.ico',
//     '/logout.svg',
//     '/loading.gif',
// ];

// Install event: cache files
self.addEventListener('install', event => {
    // event.waitUntil(
    //     caches.open(CACHE_NAME)
    //         .then(cache => cache.addAll(urlsToCache))
    // );
    self.skipWaiting();
});

// Activate event: clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames =>
            Promise.all(
                cacheNames.filter(name => name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            )
        )
    );
    self.clients.claim();
});

const isGET = (request) => request.method === 'GET';

const cacheTheRequest = async (request, response) => {
    // Putting only the get requests in cache
    if (isGET(request)) {
        console.log('Caching the request: ', request.url);
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request.clone(), response.clone());
    }
};

const getResponseFromCache = async (request) => {
    if (isGET(request)) {
        const cache = await caches.open(CACHE_NAME);
        return await cache.match(request);
    }
};

const processFetchEvent = async ({request}) => {
    try {
        const response = await fetch(request.clone());
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        await cacheTheRequest(request, response.clone());
        return response;
    } catch (fetchError) {
        try {
            console.log('[Offline Mode] Switching to getResponseFromCache ');
            return await getResponseFromCache(request);
        } catch (err) {
            console.warn('An error occurred when reading the request from cache. ', err);
        }
    }
};

const notCachedRequests = [
    /* We don't want to cache this request, beacuase it is used to determine if we are online or not. 
       If it is cached, the app would get the response and would think we are online. */
    'https://ipv4.icanhazip.com/', 
    'coloseum',
    'countdown',
    'anthem'
];

const shouldCache = (event) => {
    if (event.request.method !== 'GET') return false;
    let url = event.request.url.toLowerCase();
    for (let req of notCachedRequests){
        if (url.includes(req.toLowerCase())) {
            return false;
        }
    }
    return true;
};

// Fetch event: serve cached files if available
self.addEventListener('fetch', event => {
    console.log(event.request);
    
    if (shouldCache(event) && event.request.url.length < 100_000) {
        event.respondWith(processFetchEvent(event));
    }
});