var $feed = document.querySelector('#feed');
var $title = document.querySelector("#title");
var $desc = document.querySelector("#description");
var $more = document.querySelector('#more');
var $less = document.querySelector('legend');
var $detail = document.querySelector('fieldset');
var $defaultServer = document.querySelector('#defaultServer');
var $customServer = document.querySelector('#customServer');
var $url = document.querySelector('input[type=url]');

self.on('message', function(message) {
    console.log('messages', message);
    if (message.feed !== undefined) {
        $feed.value = message.feed;
    }
    if (message.title !== undefined) {
        $title.value = message.title;
    }
    if (message.description !== undefined) {
        $desc.value = message.description;
    }
    if (message.customServer === true) {
        $customServer.setAttribute('checked', 'checked');
    } else {
        $defaultServer.setAttribute('checked', 'checked');
    }
    if (message.customUrl !== undefined) {
        $url.value = message.customUrl;
    }
});

var init = function() {
    var onKeyUp = function(event) {
        if(event.keyCode == 13) {
            document.querySelector("input[data-action=add]").click();
        }
    };
    $feed.addEventListener('keyup', onKeyUp, false);

    var onActionClick = function () {
        self.postMessage({
            'action': this.getAttribute("data-action"), 
            'title': $title.value, 
            'description': $desc.value, 
            'feed': $feed.value,
            'customServer': ($customServer.checked) ? true : false,
            'customUrl': ($url.value.length > 0) ? $url.value : undefined
        });
    };
    var actions = document.querySelectorAll('.action');
    for(var i = 0; i < actions.length; i++) {
        actions[i].addEventListener('click', onActionClick, false);
    }

    var onMoreClick = function() {
        if ($detail.style.display === 'none') {
            $more.style.display = 'none';
            $detail.style.display = 'block';
            self.postMessage({'action': 'expand'});
        } else {
            $more.style.display = 'block';
            $detail.style.display = 'none';
            self.postMessage({'action': 'collapse'});
        }
    };
    $more.addEventListener('click', onMoreClick, false);
    $less.addEventListener('click', onMoreClick, false);

    var onUrlChange = function() {
        $customServer.checked = true;
    };
    $url.addEventListener('focus', onUrlChange, false);
};

self.postMessage({'action': 'ready'});
init();

