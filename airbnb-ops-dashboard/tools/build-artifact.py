#!/usr/bin/env python3
"""Turn index.html into the fragment published as the claude.ai artifact.

The artifact host wraps the page in its own <html>/<head>/<body>, and the shared
database (not data/seed.js) is the source of truth there, so both are stripped.
Usage: python3 tools/build-artifact.py > /path/to/acelence-ops-board.html
"""
import sys, pathlib
s = pathlib.Path(__file__).resolve().parent.parent.joinpath("index.html").read_text()
for t in ['<!doctype html>\n','<html lang="en">\n','<head>\n','</head>\n','<body>\n','</body>\n','</html>\n',
          '<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n',
          '<script src="data/seed.js"></script>\n']:
    s = s.replace(t, '')
sys.stdout.write(s)
