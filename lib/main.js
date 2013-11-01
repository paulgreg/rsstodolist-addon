var widgets = require("widget");
var tabs = require("tabs");
var panels = require("panel");
var Request = require('request').Request;
var data = require("self").data;
var simpleStorage = require("simple-storage");
var notifications = require("notifications");

var serverUrl = "https://rsstodolist.appspot.com/";

var panel = panels.Panel({
   contentURL: data.url("rsstodolist.html"),
   contentScriptFile: [data.url("interactions.js")],
   width: 360,
   height: 50,
   onMessage: function(message) {
      if(message == 'ready') {
         transmitWebPageInfos();
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
   onMouseover: transmitWebPageInfos
});

var transmitWebPageInfos = function() {
   var title = tabs.activeTab.title;
   var feed = simpleStorage.storage.feed;

   this.panel.postMessage({'description': title, 'feed': feed});
};

var doAction = function(message) {
   if(message.feed && message.action) {
      simpleStorage.storage.feed = message.feed;

      switch(message.action) {
         case "goto": 
             tabs.open(serverUrl + "?name=" + message.feed); 
             break;
         case "add": 
         case "del":
             sendRequest(message); 
             break;
      }
   }
   panel.hide();
};

var sendRequest = function(message) {
    var url = serverUrl + message.action + "?name=" + message.feed + "&description=" + encodeURIComponent(message.description || "") + "&url=" + encodeURIComponent(tabs.activeTab.url);
    console.log("url", url);
    Request({
        url: url,
        onComplete: function(response){
            if(response.status == 200) {
                notifications.notify({
                    text: "Feed '" + simpleStorage.storage.feed + "' updated",
                    iconURL: data.url("icon.png")
                });
            } else {
                console.error("Sending request ERROR : " + response.status);
                notifications.notify({
                    text: "A problem occured while updating feed '" + simpleStorage.storage.feed + "'",
                    iconURL: data.url("icon.png")
                });
            }
        }
    }).get();
};
