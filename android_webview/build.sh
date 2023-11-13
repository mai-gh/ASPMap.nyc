#!/usr/bin/sh
set -uex

AV=29
RDP="nyc/aspmap"
RDN="nyc.aspmap"
JAVAC="/usr/lib/jvm/java-17-openjdk/bin/javac"
ANDROIDJAR="/opt/android-sdk/platforms/android-${AV}/android.jar"

TOOLS="/opt/android-sdk/build-tools/${AV}.0.0"
AAPT2="${TOOLS}/aapt2"
DX="${TOOLS}/dx"
ZIPALIGN="${TOOLS}/zipalign"
APKSIGNER="${TOOLS}/apksigner"
ZIP="/usr/bin/zip"
ADB="/usr/bin/adb"

test -d build && rm -rf build; mkdir -p build/classes
test -d assets && rm -rf assets; mkdir assets
cp -r ../data assets
cp -r ../npm assets
cp ../index.html assets
cp ../main.js assets
cp ../style.css assets
cp ../asp.svg assets

$AAPT2 compile -v --dir res -o build/resources.zip
$AAPT2 link -v -A assets/ -I $ANDROIDJAR --manifest AndroidManifest.xml --java build/ -o build/link.apk build/resources.zip --auto-add-overlay
$JAVAC --release=9 -verbose -d build/classes --class-path $ANDROIDJAR src/$RDP/MainActivity.java build/$RDP/R.java
cd build/classes
$DX --dex --verbose --debug --min-sdk-version=26 --output=classes.dex $RDP/*.class
$ZIP -v -u ../link.apk classes.dex
$ZIPALIGN -v -f -p 4 ../link.apk ../zipout.apk
$APKSIGNER sign --verbose --ks ../../key.keystore --ks-pass pass:password --out ../final.apk ../zipout.apk

$ADB install ../final.apk
$ADB shell am start -n $RDN/.MainActivity
