var body           = document.querySelector('body')
var $add           = document.querySelector('#add')
var $del           = document.querySelector('#del')
var $goto          = document.querySelector('#goto')
var $feed          = document.querySelector('#feed')
var $title         = document.querySelector("#title")
var $desc          = document.querySelector("#description")
var $more          = document.querySelector('#more')
var $less          = document.querySelector('legend')
var $detail        = document.querySelector('fieldset')
var $server        = document.querySelector('#server')
let more           = false

function displayMore (shouldDisplay) {
    more = shouldDisplay
    body.classList[shouldDisplay ? 'add' : 'remove']('more')
    save()
}

$more.addEventListener('click', displayMore.bind(this, true), false)
$less.addEventListener('click', displayMore.bind(this, false), false)

function save() {
    chrome.extension.getBackgroundPage().save($feed.value, $server.value, more)
}

function setPrefs (prefs) {
    console.log('setPrefs', prefs)
    $feed.value = prefs.feed
    $server.value = prefs.server
    displayMore(prefs.more)
}

document.addEventListener('DOMContentLoaded', () => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        $title.value = tabs[0].title || ""
    })

    const prefs = chrome.extension.getBackgroundPage().getPrefs()
    setPrefs(prefs)

    $feed.select()
})

$goto.addEventListener('click', () => {
    save()
    window.close()
    chrome.tabs.create({
        url: `${$server.value}?name=${encodeURIComponent($feed.value)}`
    })
}, false)

function doAction(add) {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        save()
        window.close()
        chrome.extension.getBackgroundPage().send($server.value, add, $feed.value, tabs[0].url, $title.value, $desc.value)
    })
}

$add.addEventListener('click', () => { doAction(true) }, false)
$del.addEventListener('click', () => { doAction(false) }, false)
$feed.addEventListener('keydown', (e) => {
    if (e.keyCode === 13) doAction(true)
}, false)
