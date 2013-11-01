self.on('message', function(infos) {
   if(infos && infos.description) $("#description").val(infos.description);
   if(infos && infos.feed) $("#feed").val(infos.feed);
});

$(document).ready(function() {
   self.postMessage("ready");
   initResetField();
   initActionsButtons();
});

function initResetField() {
   $("#description").click(resetField);
   $("#feed").click(resetField);
}
function resetField() {
   $(this).val("");
}

function initActionsButtons() {
   $("#add").click(postActions);
   $("#del").click(postActions);
   $("#link").click(postActions);

   $("#description").keyup(onKeyUp);
   $("#feed").keyup(onKeyUp);
}

function onKeyUp(event) {
   if(event.keyCode == 13)
      $("#add").click();
}
function postActions() {
   self.postMessage({action: $(this).attr("id"), description:$("#description").val(), feed:$("#feed").val()});
}
