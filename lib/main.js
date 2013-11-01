const widgets = require("widget");
const tabs = require("tabs");
const panels = require("panel");
const Request = require('request').Request;
var data = require("self").data;
var simpleStorage = require("simple-storage");
var notifications = require("notifications");

var serverUrl = "https://rsstodolist.appspot.com/";

var panel = panels.Panel({
   contentURL: data.url("rsstodolist.html"),
   contentScriptFile: [data.url("jquery-1.6.1.min.js"), data.url("rsstodolist.js")],
   width: 335,
   height: 37,
   onMessage: function(message) {
      if(message == 'ready') {
         transmitInfos();
      } else {
         doAction(message);
      }
   }
});

var widget = widgets.Widget({
   id: "rsstodolist",
   label: "RSS Todo List",
   contentURL: data.url("icon.png"),
   panel: panel,
   onMouseover: function() {
      transmitInfos();
   }
});

function transmitInfos() {
   var title = tabs.activeTab.title;
   var feed = simpleStorage.storage.feed;

   this.panel.postMessage({description: title, feed: feed});
}

function doAction(message) {
   if(message.feed && message.action) {
      simpleStorage.storage.feed = message.feed;

      switch(message.action) {
         case "link":
             tabs.open(serverUrl + "?name=" + message.feed); break;
         case "add": requestAddOrDel(message); break;
         case "del": requestAddOrDel(message); break;
         default: //console.debug(message.action);
      }
   }
   panel.hide();
}

function requestAddOrDel(message) {
   var url = constructAddOrDelUrl(message);
   Request({
      url: url,
      onComplete: function(response){
         if(response.status == 200) {
            notifications.notify({
               text: "Le flux " + simpleStorage.storage.feed + " a correctement été mis à jour",
               iconURL: data.url("icon.png")
            });
         } else {
            //console.error("Sending request ERROR : " + response.status);
            notifications.notify({
               text: "Un problème s'est produit lors de la mise à jour du flux  " + simpleStorage.storage.feed,
               iconURL: data.url("icon.png")
            });
         }
      }
   }).get();
}
function constructAddOrDelUrl(message) {
   return serverUrl + message.action + "?name=" + message.feed + "&description=" + encodeURIComponent(message.description || "") + "&url=" + encodeURIComponent(tabs.activeTab.url);
}
