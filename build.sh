#!/bin/bash

rm -rf dist

electron-builder --mac

electron-builder --win

electron-builder --linux


#electron-packager ./ Atlys --platform=win32 --arch=x64 --overwrite --asar=true --icon=img/icon.ico --prune=true

#electron-packager ./ Atlys --platform=linux --arch=x64 --overwrite --asar=true --icon=img/logo.png --prune=true --out=release-builds
