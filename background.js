import { load, send } from "./common.js";

const MENU_ADD = 'rsstodolist-add'
const MENU_DEL = 'rsstodolist-del'

chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
        id: MENU_ADD,
        title: `Add link`,
        contexts: ["link"]
    })

    chrome.contextMenus.create({
        id: MENU_DEL,
        title: `Remove link`,
        contexts: ["link"]
    })
})

chrome.contextMenus.onClicked.addListener(info => {
    load(prefs => {
        send(prefs.server, info.menuItemId === MENU_ADD, prefs.feed, info.linkUrl)
    })
})
