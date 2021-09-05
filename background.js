const DEFAULT_SERVER = "https://rsstodolist.eu/";
const DEFAULT_FEED = "somename";
const DEBUG = false
let prefs

const addEndingSlash = (s = '') => {
    if (s.length !== 0 && !s.endsWith('/')) return `${s}/`
    return s
}

function save (feed, server, more) {
    prefs = {
        feed: feed || DEFAULT_FEED,
        server: addEndingSlash(server) || DEFAULT_SERVER,
        more: !!more
    }
    if (DEBUG) console.log('save', prefs)
    chrome.storage.local.set({ prefs });
}

function load (data) {
    prefs = {
        feed: data.prefs && data.prefs.feed || DEFAULT_FEED,
        server: data.prefs && data.prefs.server || DEFAULT_SERVER,
        more: data.prefs && data.prefs.more || false
    }
    if (DEBUG) console.log('load', prefs)
}
chrome.storage.local.get('prefs', load)

function getPrefs () {
    return prefs
}

function cleanUrl (url) {
    return url.replace(/&?utm_.+?(&|$)/g, '')
}

function send(server, add, feed, url, title, description) {
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
    if (DEBUG) console.log('send', url.join(''))

    return fetch(url.join(''))
    .then(() => { notify(true, `Feed ${feed} updated`) })
    .catch(() => { notify(false, `Error when updating ${feed}`) })
}

function notify(success, message) {
    chrome.notifications.create("rsstodolist-notification", {
        type: "basic",
        title: "rsstodolist : " + (success ? "success" : "error"),
        iconUrl: success ? "imgs/ok.png" : "imgs/error.png",
        message
    });
}

//
// Right click
//
const MENU_ADD = 'rsstodolist-add'
const MENU_DEL = 'rsstodolist-del'

function initRightClick (data) {
    chrome.contextMenus.create({
      id: MENU_ADD,
      title: `Add link`,
      contexts: ["link"]
    });
    chrome.contextMenus.create({
      id: MENU_DEL,
      title: `Remove link`,
      contexts: ["link"]
    });
}
initRightClick()

chrome.contextMenus.onClicked.addListener(function (info, tab) {
    send(prefs.server, info.menuItemId === MENU_ADD, prefs.feed, info.linkUrl)
});
