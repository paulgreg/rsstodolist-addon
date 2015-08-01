var { ToggleButton } = require("sdk/ui/button/toggle");
var tabs = require("sdk/tabs");
var panels = require("sdk/panel");
var Request = require('sdk/request').Request;
var data = require("sdk/self").data;
var storage = require("sdk/simple-storage").storage;
var notifications = require("sdk/notifications");

var appspotServerUrl = "https://rsstodolist.appspot.com/";
var server = appspotServerUrl;

var initialHeight = 50;
var expandedHeight= 180;

var updateStorage = function(message) {
    server = (message.customServer) ? message.customUrl : appspotServerUrl;
    if (storage.feed !== message.feed) {
        storage.feed = message.feed;
    }
    if (storage.customServer !== message.customServer) {
        storage.customServer = message.customServer;
    }
    if (storage.customUrl !== message.customUrl) {
        storage.customUrl = message.customUrl;
    }
};

var panel = panels.Panel({
    contentURL: data.url("rsstodolist.html"),
    contentScriptFile: [data.url("interactions.js")],
    width: 380,
    height: initialHeight,
    onMessage: function(message) {
        switch(message.action) {
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
    },
    onHide: function() {
        button.state('window', {checked: false});
    }
});

var button = ToggleButton({
    id: "rsstodolist",
    label: "RSS Todo List",
    icon: "./icon.png",
    onChange: function(state) {
        if (state.checked) {
            initializeUI();
            panel.show({
                position: button
            });
        }
    }
});

var initializeUI = function() {
    this.panel.postMessage({
        'feed': storage.feed,
        'title': tabs.activeTab.title,
        'description': '',
        'customServer': storage.customServer || false,
        'customUrl': storage.customUrl
    });
};

var sendRequest = function(message) {
    var url = server + message.action +"?name="+ message.feed +"&title="+ encodeURIComponent(message.title || "")  +"&description="+ encodeURIComponent(message.description || "") +"&url="+ encodeURIComponent(tabs.activeTab.url);
    Request({
        url: url,
        onComplete: function(response){
            if(response.status == 200) {
                notifications.notify({
                    text: "Feed '"+ server + storage.feed +"' updated",
                    iconURL: data.url("icon.png")
                });
            } else {
                console.error("Sending request ERROR : " + response.status);
                notifications.notify({
                    text: "A problem occured while updating feed '"+ server + storage.feed +"'",
                    iconURL: data.url("icon.png")
                });
            }
        }
    }).get();
};
