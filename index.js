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
    $feed.value = data.prefs.feed || "somename";
    $customUrl.value = data.prefs.customUrl || "https://";
    $customServer.checked = data.prefs.customServer;
    (data.prefs.more) && openMore();
}

$goto.addEventListener('click', () => {
    browser.tabs.create({
        url: getServer() + '?name=' + encodeURIComponent($feed.value)
    });
    save();
    window.close();
}, false);

function notify(status, msg) {
    browser.notifications.create("rsstodolist-notification", {
        type: "basic",
        iconUrl: status ? "ok.png" : "error.png",
        title: "rsstodolist " + (status ? "ok" : "error"),
        message: msg
    });
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
        var req = new XMLHttpRequest();
        req.open('GET', url, false);
        req.send(null);
        notify(req.status === 200, url);
        save();
        window.close();
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
        var req = new XMLHttpRequest();
        req.open('GET', url, false);
        req.send(null);
        notify(req.status === 200, url);
        save();
        window.close();
    });
}, false);


$less.addEventListener('click', () => {
    $more.style.display = 'block';
    $detail.style.display = 'none';
    more = false;
    save();
}, false);

document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get('prefs', load);
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        $title.value = tabs[0].title || "";
    });
});

