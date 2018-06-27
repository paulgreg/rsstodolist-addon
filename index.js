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
    return $customServer.checked ? $customUrl.value : chrome.extension.getBackgroundPage().getDefaultServer();
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
        $feed.value = data.prefs.feed || chrome.extension.getBackgroundPage().DEFAULT_FEED;
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

function doAction(add) {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        var url = [
            getServer(),
            (add ? "add" : "del"),
            "?name=",
            encodeURIComponent($feed.value) ,
            "&title=",
            encodeURIComponent($title.value || "") ,
            "&description=",
            encodeURIComponent($desc.value || ""),
            "&url=",
            encodeURIComponent(tabs[0].url)
        ].join("");
        chrome.extension.getBackgroundPage().send(url, getServer() + "?n=" + encodeURIComponent($feed.value))
        .then(() => {
            save();
            window.close();
        });
    });
}

$add.addEventListener('click', () => { doAction(true) }, false);
$del.addEventListener('click', () => { doAction(false) }, false);

$customUrl.addEventListener('focus', () => { $customServer.checked = true; }, false);

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
    $feed.select();
});

