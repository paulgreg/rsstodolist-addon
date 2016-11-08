var $add           = document.querySelector('#add');
var $del           = document.querySelector('#del');
var $goto          = document.querySelector('#goto');
var $feed          = document.querySelector('#feed');
var $title         = document.querySelector("#title");
var $desc          = document.querySelector("#description");
var $more          = document.querySelector('#more');
var $less          = document.querySelector('legend');
var $detail        = document.querySelector('fieldset');
var $customServer  = document.querySelector('#customServer');
var $customUrl     = document.querySelector('input[type=url]');
var more           = false;

function getServer () {
    return $customServer.checked ? $customUrl.value : "https://rsstodolist.appspot.com/";
}

function openMore () {
    $more.style.display = 'none';
    $detail.style.display = 'block';
    more = true;
    save();
}

$more.addEventListener('click', openMore, false);

function save () {
    chrome.storage.local.set({
        'prefs': {
            'feed': $feed.value,
            'customUrl': $customUrl.value,
            'customServer': $customServer.checked,
            'more': more
        }
    });
}
function load (data) {
    if (data && data.prefs) {
        $feed.value = data.prefs.feed || "somename";
        $customUrl.value = data.prefs.customUrl || "https://";
        $customServer.checked = data.prefs.customServer;
        (data.prefs.more) && openMore();
    }
}

$goto.addEventListener('click', () => {
    chrome.tabs.create({
        url: getServer() + '?name=' + encodeURIComponent($feed.value)
    });
    save();
    window.close();
}, false);

function notify(status, msg) {
    chrome.notifications.create("rsstodolist-notification", {
        type: "basic",
        title: "rsstodolist : " + (status ? "success" : "error"),
        iconUrl: status ? "imgs/ok.png" : "imgs/error.png",
        message: msg
    });
}

function send (url, server) {
    var req = new XMLHttpRequest();
    req.open('GET', url, true);
    req.onreadystatechange = () => {
        if (req.readyState == 4) {
            var success = req.status === 200;
            var msg = success ? "Feed " + server + " updated" : "Error when updating " + server
            notify(success, msg);
            if (success) {
                save();
                window.close();
            }
        }
    };
    req.send(null);
}

$add.addEventListener('click', () => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        var url = [
            getServer(),
            "add",
            "?name=",
            encodeURIComponent($feed.value) ,
            "&title=",
            encodeURIComponent($title.value || "") ,
            "&description="+ encodeURIComponent($desc.value || "") ,
            "&url=",
            encodeURIComponent(tabs[0].url)
        ].join("");
        send(url, getServer() + "?n=" + encodeURIComponent($feed.value));
    });
}, false);

$del.addEventListener('click', () => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        var url = [
            getServer(),
            "del",
            "?name=",
            encodeURIComponent($feed.value) ,
            "&url=",
            encodeURIComponent(tabs[0].url)
        ].join("");
        send(url, getServer() + "?n=" + encodeURIComponent($feed.value));
    });
}, false);

$customUrl.addEventListener('focus', () => {
    $customServer.checked = true;
}, false);

$less.addEventListener('click', () => {
    $more.style.display = 'block';
    $detail.style.display = 'none';
    more = false;
    save();
}, false);

document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get('prefs', load);
    // timeout to mitigate that bug: https://bugzilla.mozilla.org/show_bug.cgi?id=1310019
    setTimeout(() => {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            $title.value = tabs[0].title || "";
        });
    }, 50)
    $feed.select();
});

