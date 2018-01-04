#!/bin/sh

# chmod a+x name.sh

FILENAME='Tractor'
# TODAY=$(date)

rm -v $FILENAME.zip
zip -r $FILENAME.zip \
                  _locales \
                  icons/16.png \
                  icons/48.png \
                  icons/128.png \
                  js/*.js \
                  lib/*.min.js \
                  html/popup.html \
                  css/tooltip/*.css \
                  css/*.css \
                  manifest.json \
                  # html/*.html \

 # -z $TODAY
