#!/bin/sh

# chmod a+x release.sh

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
                  html/*.html \
                  css/*/*.css \
                  css/*.css \
                  manifest.json \
                  LICENSE \

#  -z $TODAY
