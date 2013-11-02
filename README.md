Description 
===========

rsstodolist is a service to build RSS feed, hosted on Google App Engine, at https://rsstodolist.appspot.com.


If you’re concerned about privacy, you can deploy the code on your own server (https://github.com/paulgreg/rsstodolist-server).

This is the rsstodolist add-on for Firefox, allowing to add URL to a RSS feed.
Add-on is available on Mozilla Add-on repository : https://addons.mozilla.org/fr/firefox/addon/rss-todolist-addon/


Run and deploy
--------------

First, you need to install the [Firefox SDK Add-on](https://addons.mozilla.org/en-US/developers/docs/sdk/latest/).

Then, 

   * from the add-on SDK, launch `source bin/activate`, 
   * then `cd` into to thoses sources, 
   * and type `cfx run` to run the extension in a new Firefox instance,
   * you can also run `cfx xpi` to package an XPI.
