const DEFAULT_SERVER = "https://rsstodolist.appspot.com/";
const DEFAULT_FEED = "somename";
let prefs

function save (feed, server, more) {
    prefs = {
        feed: feed || DEFAULT_FEED,
        server: server || DEFAULT_SERVER,
        more: more || prefs.more
    }
    console.log('save', prefs)
    chrome.storage.local.set({ prefs });
}

function load (data) {
    prefs = {
        feed: data.prefs && data.prefs.feed || DEFAULT_FEED,
        server: data.prefs && data.prefs.server || DEFAULT_SERVER,
        more: data.prefs && data.prefs.more || false
    }
    console.log('load', prefs)
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
        encodeURIComponent(feed) ,
        "&url=",
        encodeURIComponent(cleanUrl(url))
    ]
    if (title) {
        url.push([
            "&title=",
            encodeURIComponent(title)
        ])
    }
    if (description) {
        url.push([
            "&description=",
            encodeURIComponent(description)
        ])
    }

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

/*
const MENU_ADD = 'rsstodolist-add'
const MENU_DEL = 'rsstodolist-del'

var feed = DEFAULT_FEED;
var server = DEFAULT_SERVER;

function getDefaultFeed () {
    return DEFAULT_FEED;
}
function getDefaultServer () {
    return DEFAULT_SERVER;
}

function initRightClick (data) {
    if (data && data.prefs && data.prefs.feed) {
        feed = data.prefs.feed;
    }
    if (data && data.prefs && data.customServer && data.prefs.customUrl) {
        server = data.prefs.customUrl;
    }

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
chrome.storage.local.get('prefs', initRightClick);

chrome.contextMenus.onClicked.addListener(function (info, tab) {
    var url = [
        server,
        (info.menuItemId === MENU_ADD ? 'add' : 'del'),
        "?name=",
        encodeURIComponent(feed),
        "&url=",
        info.linkUrl
    ].join("");
    send(url, server + "?n=" + encodeURIComponent(feed));
});


function send (url, msg) {
    return new Promise((resolve) => {
        var req = new XMLHttpRequest();
        req.open('GET', url, true);
        req.onreadystatechange = () => {
            if (req.readyState == 4) {
                var success = req.status === 200;
                notify(success, msg);
                if (success) {
                    resolve();
                }
            }
        };
        req.send(null);
    });
}
*/
