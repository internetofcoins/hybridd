#!/bin/sh
OLDPATH=$PATH
WHEREAMI=`pwd`
export PATH=$WHEREAMI/../node/bin:"$PATH"
NODEINST=`which node`

echo "Compiling all views..."
HERE="`pwd`";
cd "`cd $( dirname $BASH_SOURCE[0] ) && pwd`"
for D in *; do
    if [ -d "${D}" ]; then
        echo " - compiling ${D}..."
	cd ${D}
	node main.js
	cd ..
    fi
done
cd "${HERE}"
echo "All done."
