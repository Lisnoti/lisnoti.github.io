# lisnoti.com

This repository is the website [lisnoti.com](https://lisnoti.com), served by GitHub Pages
from the root of `main`. The font itself, its files for installing and its documentation are
in [Lisnoti/Lisnoti](https://github.com/Lisnoti/Lisnoti).

The site is also the Lisnoti font delivery service. Any website can use Lisnoti by linking
one stylesheet:

```html
<link rel="stylesheet" href="https://lisnoti.com/lisnoti.css">
```

and then naming Lisnoti in its styles, for example `font-family: Lisnoti, system-ui, sans-serif;`.
The home page explains the options.

## What is here

| file | what it is |
|:--|:--|
| `index.html` | the home page |
| `lisnoti.css` | the service stylesheet, which serves each style in 13 subsets so that a page fetches only the pieces it uses |
| `lisnoti-full.css` | the alternative stylesheet, one whole-font file a style |
| `fonts/<version>/` | the WOFF2 files both stylesheets name |
| `update-fonts.py` | writes the three items above from a release of the font |
| `test.html` | a one-line check that the service stylesheet loads |

## Updating the fonts

After each release of the font, with [Lisnoti/Lisnoti](https://github.com/Lisnoti/Lisnoti)
checked out beside this repository, run

    python update-fonts.py

It needs `fontTools` (`pip install fonttools`). It copies the released WOFF2 files into
`fonts/<version>/` and rewrites both stylesheets to point there.

The version is in the path because GitHub Pages gives every file a ten-minute cache lifetime
and cannot be configured to give a longer one. A new release therefore gets a new folder and
a new stylesheet, and never new bytes at an old URL. Leave an old version folder in place
until nothing links it: other sites may hold a cached copy of the old stylesheet.

The site serves WOFF2 only. Every browser in use reads it.

## Licences

The font files in `fonts/` are under the [SIL Open Font License 1.1](https://openfontlicense.org).
Everything else here is under the MIT licence in `LICENSE`.
