const DEFAULT_SERVER = "https://rsstodolist.appspot.com/";
const DEFAULT_FEED = "somename";

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

    browser.contextMenus.create({
      id: "rsstodolist-link",
      title: `Send link to ${server}?n=${feed}`,
      contexts: ["link"]
    });
}

chrome.storage.local.get('prefs', initRightClick);

browser.contextMenus.onClicked.addListener(function (info, tab) {
    var url = [ server, "add",
        "?name=", encodeURIComponent(feed),
        "&url=", info.linkUrl
    ].join("");
    send(url, server + "?n=" + encodeURIComponent(feed));
});

function updateValues(f, s) {
    feed = f || DEFAULT_FEED;
    server = s || DEFAULT_URL;

    browser.contextMenus.update("rsstodolist-link", {
      title: `Send link to ${server}?n=${feed}`
    });
}

function notify(status, msg) {
    chrome.notifications.create("rsstodolist-notification", {
        type: "basic",
        title: "rsstodolist : " + (status ? "success" : "error"),
        iconUrl: status ? "imgs/ok.png" : "imgs/error.png",
        message: msg
    });
}

function send (url, server) {
    return new Promise((resolve) => {
        var req = new XMLHttpRequest();
        req.open('GET', url, true);
        req.onreadystatechange = () => {
            if (req.readyState == 4) {
                var success = req.status === 200;
                var msg = success ? "Feed " + server + " updated" : "Error when updating " + server
                notify(success, msg);
                if (success) {
                    resolve();
                }
            }
        };
        req.send(null);
    });
}

