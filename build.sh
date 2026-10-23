#!/bin/sh
# Build index.html = src/game.html with three.min.js (r159) inlined.
# three.min.js: from npm "three@0.159.0" build/three.min.js (path via $THREE_JS, default /tmp/gdeps/three.min.js)
python3 - "$@" <<'PY'
import os
three=open(os.environ.get('THREE_JS','/tmp/gdeps/three.min.js')).read()
s=open('src/game.html').read(); open('index.html','w').write(s.replace('/*THREE_JS*/', three)); print('built index.html', len(s)+len(three))
PY
