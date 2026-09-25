"""Bring the site's font files and stylesheets up to the release in ../Lisnoti.

The Lisnoti font delivery service is a stylesheet at the root of lisnoti.com that other
sites link, plus the WOFF2 files it names. This writes both from the distribution
repository next door -- `font-Lisnoti/Lisnoti-woff2/` for the slices and `lisnoti.css`,
`font-Lisnoti/Lisnoti-woff2-monolithic/` for the whole-font files and `lisnoti-full.css` -- so
the site never carries a font that was not released:

    <site>/fonts/<version>/Lisnoti-<style>-<slice>.woff2   the 13 slices a style, 52 files
    <site>/fonts/<version>/Lisnoti-<style>.woff2           the whole font, one file a style
    <site>/lisnoti.css        the sliced service stylesheet: a page fetches only the slices
                              for the characters it uses (a Latin page, about 27 KB a style)
    <site>/lisnoti-full.css   the whole-font stylesheet, for anyone who wants one file a
                              style, or who sets decomposed phonetics, where mark attachment
                              cannot cross two slice files

The two stylesheets are the release's own with the font URLs pointed at the versioned
folder. The version is in the path so that a font file, once a browser has it, is never
fetched again: GitHub Pages serves everything with a ten-minute cache lifetime and allows
no header configuration, and a new release gets a new folder and a new stylesheet rather
than new bytes at an old URL. Older version folders are left in place until nothing links
them. Stylesheet URLs are root-relative, so they resolve against lisnoti.com whichever
site links the stylesheet.

WOFF 1 and TTF are not served: WOFF 1 stopped being produced at 2.000, and TTF on the web
is only a fallback for browsers that predate WOFF2, of which none remain in use.

Usage:
    python update-fonts.py            update the site, which GitHub Pages serves from the
                                      repository root (Firebase served `public/` until
                                      21 September 2026)
    python update-fonts.py <folder>   update another site folder
"""

import os
import re
import shutil
import sys

from fontTools.ttLib import TTFont

HERE = os.path.dirname(os.path.abspath(__file__))
RELEASE = os.path.normpath(os.path.join(HERE, "..", "Lisnoti"))
SLICED = os.path.join(RELEASE, "font-Lisnoti", "Lisnoti-woff2")
WHOLE = os.path.join(RELEASE, "font-Lisnoti", "Lisnoti-woff2-monolithic")
STYLES = ("Regular", "Italic", "Bold", "BoldItalic")


def version_of(path):
    text = TTFont(path)["name"].getDebugName(5)
    found = re.search(r"\d+\.\d+", text or "")
    if not found:
        raise SystemExit("%s carries no version" % path)
    return found.group(0)


def main(site):
    sources = {"lisnoti.css": SLICED, "lisnoti-full.css": WHOLE}
    for name, source in sources.items():
        if not os.path.exists(os.path.join(source, name)):
            raise SystemExit("no %s in %s; release the font first" % (name, source))
    versions = set(version_of(os.path.join(WHOLE, "Lisnoti-%s.woff2" % s)) for s in STYLES)
    if len(versions) != 1:
        raise SystemExit("the released fonts disagree on their version: %s" % sorted(versions))
    version = versions.pop()
    folder = os.path.join(site, "fonts", version)
    os.makedirs(folder, exist_ok=True)
    prefix = "/fonts/%s/" % version

    copied = 0
    for source in (SLICED, WHOLE):
        for name in sorted(os.listdir(source)):
            if name.endswith(".woff2"):
                shutil.copyfile(os.path.join(source, name), os.path.join(folder, name))
                copied += 1

    for name, source in sources.items():
        css = open(os.path.join(source, name), encoding="utf-8").read()
        css = css.replace("src: url(Lisnoti-", "src: url(%sLisnoti-" % prefix)
        css = css.replace(" * To use: upload every .woff2 beside this file and link it, then set",
                          " * To use from any site: link https://lisnoti.com/lisnoti.css, then set")
        css = css.replace(" * should load the whole-file WOFF2 in dist/ instead of these subsets.",
                          " * should link https://lisnoti.com/lisnoti-full.css instead of this file.")
        css = css.replace(" * The whole font in each style, about 425 KB a style. The subset files\n"
                          " * in Lisnoti-woff2 serve the same font in pieces and are the\n"
                          " * better choice for most pages; use this one",
                          " * The whole font in each style, about 425 KB a style. lisnoti.css on\n"
                          " * this site serves the same font in subsets and is the better choice\n"
                          " * for most pages; link this one")
        with open(os.path.join(site, name), "w", encoding="utf-8", newline="\n") as fh:
            fh.write(css)
    print("Lisnoti %s: %d font files in %s, lisnoti.css and lisnoti-full.css written in %s"
          % (version, copied, folder, site))


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else HERE)
