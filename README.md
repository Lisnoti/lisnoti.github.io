# lisnoti.com

This repository produces the website [lisnoti.com](https://lisnoti.com).

The fonts themselves and associated documentation are in
[the Lisnoti repo](https://github.com/Lisnoti/Lisnoti).

The site serves two purposes.

1. It is the **user-friendly home page** for Lisnoti and Lisnoti Code.

2. It provides the **Lisnoti and Lisnoti Code font delivery service**. Websites can use the fonts simply by linking to stylesheets served at lisnoti.com:

    ```html
    <link rel="stylesheet" href="https://lisnoti.com/lisnoti.css">
    <link rel="stylesheet" href="https://lisnoti.com/lisnoti-code.css">
    ```

    and then naming the fonts in their styles, e.g.

    ```
    font-family: Lisnoti, system-ui, sans-serif;
    ```
    or
    ```
    font-family: 'Lisnoti Code', monospace;
    ```

    See [the Lisnoti](https://lisnoti.com/#using-lisnoti-for-websites) or [the Lisnoti Code](https://lisnoti.com/code/#using-lisnoti-code-for-websites) pages for more detail.

## Repo contents

| Path | Contents |
|:--|:--|
| `index.html` | *Lisnoti* webpage |
| `code/index.html` | *Lisnoti Code* webpage |
| `assets/` | Shared styles and scripts, and the character list for the glyph explorer |
| `lisnoti.css` | *Lisnoti* stylesheet &ndash; served in subsets |
| `lisnoti-monolithic.css` | *Lisnoti* stylesheet &ndash; one monolithic font file per style |
| `lisnoti-code.css` | *Lisnoti Code* stylesheet &ndash; served in subsets |
| `lisnoti-code-monolithic.css` | *Lisnoti Code* stylesheet &ndash; one monolithic font file per style |
| `fonts/<version>/`<br/> `fonts/code-<version>/` | The WOFF2 files referenced by the stylesheets |
| `fonts/compare/` | Monospaced fonts used for comparison on the Lisnoti Code page (including licences) |
| `vendor/temml/` | [Temml](https://temml.org), used to convert LaTeX to equations |
| `images/` | Type cards for *Lisnoti* and *Lisnoti Code* (`lisnoti-card.svg`, `lisnoti-code-card.svg`), the webpages’ icons (`lisnoti-logo.svg`, `lisnoti-code-logo.svg`) and their link-preview images for social media and chat apps |
| `sitemap.xml` | The list of pages for search engines |
| `lisnoti-full.css` (deprecated) | Older name for `lisnoti-monolithic.css` &ndash; will be removed in due course |

## Font files

The Lisnoti and Lisnoti Code files in `fonts/` are copied from [the Lisnoti repo](https://github.com/Lisnoti/Lisnoti) &ndash; they’re the same files.

The version names are included in the font paths, which means that
- web pages linking to the stylesheets on this site will end up with the latest versions of the fonts, whereas
- web pages that link direct to the fonts will stay on the versions specified in the paths used (just like if the fonts are downloaded and served direct).

Old version folders will be retained for the lifetime of this repo.

The site serves only WOFF2 files on the basis that they are compatible with all modern browsers.

## Licences

Lisnoti and Lisnoti Code, in `fonts/`, are under the
[SIL Open Font License 1.1](https://openfontlicense.org).

The comparison fonts in
`fonts/compare/` are under the same licence, with each font’s copyright notice in its folder.

[Temml](https://temml.org) is under the MIT licence in `vendor/temml/LICENSE`.

Everything else here is under the MIT
licence in [`LICENSE`](LICENSE).
