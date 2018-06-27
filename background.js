const DEFAULT_SERVER = "https://rsstodolist.appspot.com/";
const DEFAULT_FEED = "somename";

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

function notify(success, server) {
    chrome.notifications.create("rsstodolist-notification", {
        type: "basic",
        title: "rsstodolist : " + (success ? "success" : "error"),
        iconUrl: success ? "imgs/ok.png" : "imgs/error.png",
        message: success ? "Feed " + server + " updated" : "Error when updating " + server
    });
}

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
