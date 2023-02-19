import { load, send } from "./common.js";

const MENU_ADD = 'rsstodolist-add'
const MENU_DEL = 'rsstodolist-del'


browser.runtime.onInstalled.addListener(() => {

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

    chrome.contextMenus.onClicked.addListener(info => {
        load(prefs => {
            const link = info.linkText.startsWith("https://") || info.linkText.startsWith("http://") ? info.linkText : info.linkUrl
            console.log(link)
            send(prefs.server, info.menuItemId === MENU_ADD, prefs.feed, link)
        })
    })
})
