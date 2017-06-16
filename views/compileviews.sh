export PATH=/home/prototype/Code/hybridd/node/bin:/opt/meta/bin:/usr/local/bin:/usr/bin:/bin:/usr/local/games:/usr/games

#!/bin/sh
echo "Compiling all views..."
HERE="`pwd`";
cd "`cd $( dirname $BASH_SOURCE[0] ) && pwd`"
for D in *; do
    if [ -d "${D}" ]; then
        echo " - compiling ${D}..."
	cd ${D}
	../../node/bin/node main.js
	cd ..
    fi
done
cd "${HERE}"
echo "All done."
