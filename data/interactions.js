var $feed = document.querySelector('#feed');
var $desc = document.querySelector("#description");
var $more = document.querySelector('#more');
var $less = document.querySelector('legend');
var $detail = document.querySelector('fieldset');
var $defaultServer = document.querySelector('#defaultServer');
var $customServer = document.querySelector('#customServer');
var $url = document.querySelector('input[type=url]');

self.on('message', function(infos) {
    $desc.value = infos && infos.description ? infos.description : $desc.value;
    $feed.value = infos && infos.feed ? infos.feed : $feed.value;
    if (infos && infos.customServer) {
        $customServer.setAttribute('checked', 'checked');
        $url.value = infos.customServer;
    } else {
        $defaultServer.setAttribute('checked', 'checked');
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
            'description': $desc.value, 
            'feed': $feed.value,
            'customServer': ($customServer.checked && $url.value.length > 7) ? $url.value : undefined
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

