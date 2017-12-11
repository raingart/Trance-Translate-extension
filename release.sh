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
                  lib/*.js \
                  html/*.html \
                  css/*.css \
                  css/*/*.css \
                  manifest.json \

 # -z $TODAY
