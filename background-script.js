import { load, send } from "./common.js";

const MENU_ADD = 'rsstodolist-add'
const MENU_DEL = 'rsstodolist-del'

const installContextMenu = (prefs) =>
    chrome.contextMenus.removeAll(() => { 
        chrome.contextMenus.create({
            id: MENU_ADD,
            title: `Add link to feed « ${prefs.feed} »`,
            contexts: ["link"]
        })

        chrome.contextMenus.create({
            id: MENU_DEL,
            title: `Remove link from feed « ${prefs.feed} »`,
            contexts: ["link"]
        })

        chrome.contextMenus.onClicked.addListener(info => {
            send(
                prefs.server,
                info.menuItemId === MENU_ADD,
                prefs.feed,
                info.linkUrl,
                undefined,
                undefined,
                prefs.authUser,
                prefs.authPass
            )
        })
    })

load(prefs => installContextMenu(prefs))

chrome.storage.onChanged.addListener((o) => {
    const prefs = o?.prefs?.newValue
    if (prefs) installContextMenu(prefs)
})
