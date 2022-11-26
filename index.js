import { load, save, send } from './common.js'

const body           = document.querySelector('body')
const $form          = document.querySelector('form')
const $add           = document.querySelector('#add')
const $del           = document.querySelector('#del')
const $goto          = document.querySelector('#goto')
const $feed          = document.querySelector('#feed')
const $title         = document.querySelector("#title")
const $desc          = document.querySelector("#description")
const $more          = document.querySelector('#more')
const $less          = document.querySelector('legend')
const $server        = document.querySelector('#server')
let   more           = false

const displayMore = (shouldDisplay) => {
    more = shouldDisplay
    body.classList[shouldDisplay ? 'add' : 'remove']('more')
    save($feed.value, $server.value, more)
}

$more.addEventListener('click', displayMore.bind(this, true), false)
$less.addEventListener('click', displayMore.bind(this, false), false)

const setPrefsInUI = (prefs) => {
    $feed.value = prefs.feed
    $server.value = prefs.server
    displayMore(prefs.more)
}

document.addEventListener('DOMContentLoaded', () => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        $title.value = tabs[0].title || ""
    })

    load(prefs => {
        setPrefsInUI(prefs)
    })

    $feed.select()
})

$goto.addEventListener('click', () => {
    save($feed.value, $server.value, more)
    chrome.tabs.create({
        url: `${$server.value}?name=${encodeURIComponent($feed.value)}`
    })
    window.close()
}, false)

const doAction = (e, add) => {
    e.stopPropagation()
    e.preventDefault()
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        save($feed.value, $server.value, more)
        console.log('doAction', add, tabs[0].url)
        send($server.value, add, $feed.value, tabs[0].url, $title.value, $desc.value)
        .then(() => {
            window.close()
        })
    })
}

$form.addEventListener('submit', e => doAction(e, true), false)
$add.addEventListener('click', e => doAction(e, true), false)
$del.addEventListener('click', e => doAction(e, false), false)