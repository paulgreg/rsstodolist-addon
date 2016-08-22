if [ -f rsstodolist.zip ]; then
    rm rsstodolist.zip
fi;
zip --exclude build.sh -r rsstodolist.zip *
