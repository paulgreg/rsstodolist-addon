# Manifest V3 migration problem

Firefox need a page which loads a script :

    "background": {
        "page": "background-page.html"
    },

where chrome works with service_worker :

    "background": {
        "service_worker": "background.js",
         "type": "module"
    },

Links :

  * https://stackoverflow.com/questions/75043889/manifest-v3-background-scripts-service-worker-on-firefox
  * https://extensionworkshop.com/documentation/develop/manifest-v3-migration-guide/#browser-action
