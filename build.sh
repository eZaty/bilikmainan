#!/bin/bash
rm ../build/playroom.tar.gz
meteor build --settings settings.json --architecture=os.linux.x86_64 ../build
