export const DEFAULT_SERVER = "https://rsstodolist.eu/";
export const DEFAULT_FEED = "somename";

const prefs = {
    feed: DEFAULT_FEED,
    server: DEFAULT_SERVER,
    more: false,
    apiKey: ''
}

const addEndingSlash = (s = '') => {
    if (s.length !== 0 && !s.endsWith('/')) return `${s}/`
    return s
}

export const save = (feed, server, more, apiKey) => {
    prefs.feed = feed || DEFAULT_FEED
    prefs.server = addEndingSlash(server) || DEFAULT_SERVER
    prefs.more = Boolean(more)
    prefs.apiKey = apiKey || ''
    console.log('save', prefs)
    chrome.storage.local.set({ prefs })
}

export const load = (cb) => {
    const onLoad = (data) => {
        prefs.feed = data?.prefs?.feed ?? DEFAULT_FEED
        prefs.server = data?.prefs?.server ?? DEFAULT_SERVER
        prefs.more = data?.prefs?.more ?? false
        prefs.apiKey = data?.prefs?.apiKey ?? ''
        console.log('load', prefs)
        cb(prefs)
    }
    chrome.storage.local.get('prefs', onLoad)
}


export const getPrefsFromStorage = () => prefs

export const cleanUrl = (url) => url.replace(/&?utm_.+?(&|$)/g, '').replace(/(\?)$/, '')

const buildHeaders = (apiKey) => {
    if (!apiKey) return undefined
    return {
        'X-Api-Key': apiKey
    }
}

export const send = (server, add, feed, url, title, description, apiKey) => {
    if (!server || !feed || !url) {
        const message = 'No server, feed or url'
        notify(false, message)
        return Promise.reject(new Error(message))
    }
    const parts = [
        server,
        (add ? "add" : "del"),
        "?name=",
        encodeURIComponent(feed),
        "&url=",
        encodeURIComponent(cleanUrl(url))
    ]
    if (title) {
        parts.push(
            "&title=",
            encodeURIComponent(title)
        )
    }
    if (description) {
        parts.push(
            "&description=",
            encodeURIComponent(description)
        )
    }
    const fullUrl = parts.join('')
    console.log('send', fullUrl)

    return fetch(fullUrl, { headers: buildHeaders(apiKey) })
    .then(() => { notify(true, `Feed ${feed} updated`) })
    .catch(e => { 
        console.error(e)
        notify(false, `Error when updating ${feed}`) 
    })
}
export const fetchCount = (server, name, apiKey) => {
    const url = `${server}count?n=${name}`
    console.log(`fetchCount - ${url}`)
    return fetch(url, { headers: buildHeaders(apiKey) })
    .then(response => response.json())
    .then(json => formatNumber(json?.count || 0))
    .catch(e => {
        console.error(e)
        return 'N/A'
    })
}

export const fetchSuggest = (server, query, apiKey) => {
    const url = `${server}suggest?query=${query}`
    console.log(`fetchSuggest - ${url}`)
    return fetch(url, { headers: buildHeaders(apiKey) })
    .then(response => response.json())
    .catch(e => {
        console.error(e)
    })
}

export const notify = (success, message) => {
    chrome.notifications.create("rsstodolist-notification", {
        type: "basic",
        title: "rsstodolist : " + (success ? "success" : "error"),
        iconUrl: success ? "imgs/ok.png" : "imgs/error.png",
        message
    });
}

export const throttle = delay => fn => {
    let timeout
    return e => {
        clearTimeout(timeout)
        timeout = setTimeout(() => fn(e), delay)
    }
}

const MILLION = 1_000_000
const THOUSAND = 1_000

export const formatNumber = nb => {
    if (Number.isInteger(nb)) {
        if (nb >= MILLION) return `${(nb / MILLION).toFixed(1)}M`
        if (nb >= THOUSAND) return `${(nb / THOUSAND).toFixed(1)}K`
    }
    return nb
}
