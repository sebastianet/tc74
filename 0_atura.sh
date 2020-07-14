#!/bin/bash

echo "+++ abans"
ps -ef | grep node | grep   -v grep   

toKILL=$(ps -ef | grep servidor | grep -v grep | awk '{print $2}')
echo "want to kill ($toKILL)."

if [[ -n $toKILL ]] 
then 
        sudo kill $toKILL 
fi

echo "+++ despres"
ps -ef | grep node | grep   -v grep   

exit 0
