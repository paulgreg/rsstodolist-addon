var widgets = require("widget");
var tabs = require("tabs");
var panels = require("panel");
var Request = require('request').Request;
var data = require("self").data;
var simpleStorage = require("simple-storage");
var notifications = require("notifications");

var appspotServerUrl = "https://rsstodolist.appspot.com/";
var server = appspotServerUrl;

var initialHeight = 50;
var expandedHeight= 180;

var updateStorage = function(message) {
    simpleStorage.storage.feed = message.feed;
    if(message.customServer !== undefined) {
        server = message.customServer;
        simpleStorage.storage.customServer = message.customServer;
    }
};


var panel = panels.Panel({
    contentURL: data.url("rsstodolist.html"),
    contentScriptFile: [data.url("interactions.js")],
    width: 380,
    height: initialHeight,
    onMessage: function(message) {
        switch(message.action) {
            case 'ready':
                initializeUI();
                break;
            case 'collapse':
                this.height = initialHeight;
                break;
            case 'expand':
                this.height = expandedHeight;
                break;
            case 'goto':
                updateStorage(message);
                tabs.open(server +"?name="+ message.feed); 
                panel.hide();
                break;
            case 'add': 
            case 'del':
                updateStorage(message);
                sendRequest(message); 
                panel.hide();
                break;
        }
    }
});

var initializeUI = function() {
   this.panel.postMessage({
       'feed': simpleStorage.storage.feed,
       'description': tabs.activeTab.title,
       'customServer': simpleStorage.storage.customServer
   });
};

var widget = widgets.Widget({
   id: "rsstodolist",
   label: "RSS Todo List",
   contentURL: data.url("icon.png"),
   panel: panel,
   onMouseover: initializeUI.bind(this)
});

var sendRequest = function(message) {
    var url = server + message.action + "?name=" + message.feed + "&description=" + encodeURIComponent(message.description || "") + "&url=" + encodeURIComponent(tabs.activeTab.url);
    console.log("url", url);
    Request({
        url: url,
        onComplete: function(response){
            if(response.status == 200) {
                notifications.notify({
                    text: "Feed '"+ server + simpleStorage.storage.feed +"' updated",
                    iconURL: data.url("icon.png")
                });
            } else {
                console.error("Sending request ERROR : " + response.status);
                notifications.notify({
                    text: "A problem occured while updating feed '"+ server + simpleStorage.storage.feed +"'",
                    iconURL: data.url("icon.png")
                });
            }
        }
    }).get();
};
