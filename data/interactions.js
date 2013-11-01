self.on('message', function(infos) {
    if (infos) {
        if (infos.description) {
            document.querySelector("#description").value = infos.description;
        }
        if (infos.feed) {
            document.querySelector("#feed").value = infos.feed;
        }
    }
});

var init = function() {
    var onKeyUp = function(event) {
        if(event.keyCode == 13) {
            document.querySelector("input[data-action=add]").click();
        }
    };

    var postActions = function () {
        console.debug('postActions', this.getAttribute('data-action'));
        self.postMessage({
            'action': this.getAttribute("data-action"), 
            'description': document.querySelector("#description").value, 
            'feed': document.querySelector("#feed").value
        });
    };

    document.querySelector("#feed").addEventListener('keyup', onKeyUp, false);
    var actions = document.querySelectorAll(".action");
    for(var i = 0; i < actions.length; i++) {
        actions[i].addEventListener('click', postActions, false);
    }
};

self.postMessage("ready");
init();

