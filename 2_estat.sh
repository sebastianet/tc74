#!/bin/bash

szTxt="node"

echo "(1) +++ estat del node ($szTxt)"
ps -ef | grep $szTxt  | grep   -v grep   

echo "(2) +++ ports ($szTxt)"
sudo netstat -tulpn | grep LISTEN | grep node

exit 0
