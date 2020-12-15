var body           = document.querySelector('body')
var $form          = document.querySelector('form')
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
    chrome.tabs.create({
        url: `${$server.value}?name=${encodeURIComponent($feed.value)}`
    })
    window.close()
}, false)

const doAction = (e, add) => {
    e.stopPropagation()
    e.preventDefault()
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        save()
        console.log('doAction', add, tabs[0].url)
        chrome.extension.getBackgroundPage().send($server.value, add, $feed.value, tabs[0].url, $title.value, $desc.value)
        window.close()
    })
}

$form.addEventListener('submit', e => doAction(e, true), false)
$add.addEventListener('click', e => doAction(e, true), false)
$del.addEventListener('click', e => doAction(e, false), false)