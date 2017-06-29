if [ -f rsstodolist.zip ]; then
    rm rsstodolist.zip
fi;
zip -r rsstodolist.zip manifest.json *.js *.html imgs
