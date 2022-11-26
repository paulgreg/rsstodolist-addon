export const DEFAULT_SERVER = "https://rsstodolist.eu/";
export const DEFAULT_FEED = "somename";

const prefs = {
    feed: DEFAULT_FEED,
    server: DEFAULT_SERVER,
    more: false
}

const addEndingSlash = (s = '') => {
    if (s.length !== 0 && !s.endsWith('/')) return `${s}/`
    return s
}

export const save = (feed, server, more) => {
    prefs.feed = feed || DEFAULT_FEED
    prefs.server = addEndingSlash(server) || DEFAULT_SERVER
    prefs.more = Boolean(more)
    console.log('save', prefs)
    chrome.storage.local.set({ prefs })
}

export const load = (cb) => {
    const onLoad = (data) => {
        prefs.feed = data?.prefs?.feed ?? DEFAULT_FEED
        prefs.server = data?.prefs?.server ?? DEFAULT_SERVER
        prefs.more = data?.prefs?.more ?? false
        console.log('load', prefs)
        cb(prefs)
    }
    chrome.storage.local.get('prefs', onLoad)
}


export const getPrefsFromStorage = () => prefs

export const cleanUrl = (url) => url.replace(/&?utm_.+?(&|$)/g, '').replace(/(\?)$/, '')

export const send = (server, add, feed, url, title, description) => {
    if (!server || !feed || !url) {
        const message = 'No server, feed or url'
        notify(false, message)
        return Promise.reject(new Error(message))
    }
    var url = [
        server,
        (add ? "add" : "del"),
        "?name=",
        encodeURIComponent(feed),
        "&url=",
        encodeURIComponent(cleanUrl(url))
    ]
    if (title) {
        url.push(
            "&title=",
            encodeURIComponent(title)
        )
    }
    if (description) {
        url.push(
            "&description=",
            encodeURIComponent(description)
        )
    }
    console.log('send', url.join(''))

    return fetch(url.join(''))
    .then(() => { notify(true, `Feed ${feed} updated`) })
    .catch(e => { 
        console.error(e)
        notify(false, `Error when updating ${feed}`) 
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