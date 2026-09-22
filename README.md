# Lisnoti.com README

## Important info:

|Item|Info|
|:--|:--|
|Firebase project id|`lisnoti`|

## Firebase CLI

|Action|Command|
|:--|:--|
|<span style="background-color:#FF8;">**Always** set current directory</span>|`cd C:\Users\Tim Gordon\source\repos\Lisnoti\Lisnoti-site\`|
|Deploy|`firebase deploy --only hosting`|

## Running

1. [Only on a new computer setup] Install the *standalone* Firebase CLI binary for Windows from [here](https://firebase.google.com/docs/cli). Notes:

    - Windows Defender didn't like the exe.
    - I moved `firebase-tools-instant-win.exe` to the `C:\Program Files\Firebase\` folder and added a link to the Taskbar (which looks like a green hexagon).

1. Use `firebase login` if you are not already logged in.

1. Only when starting from scratch (because this will overwrite settings for an existing folder):

    - `firebase init` creates a new project in a project folder *you've already created*.
    - Select `Hosting: Configure files for Firebase Hosting ...`.

1. General info

    - For general management, use [this link](https://console.cloud.google.com/cloud-resource-manage)
    - To restore a deleted project use [this link](https://console.firebase.google.com/iam-admin/projects).

## The font files and stylesheets

The site is the Lisnoti font delivery service: other sites link `https://lisnoti.com/lisnoti.css`.
The font files and both stylesheets are written from the distribution repository next door by

    python update-fonts.py

which copies the released WOFF2 files into `fonts/<version>/` at the repository root, which is what GitHub Pages serves, and writes `lisnoti.css` (the sliced
service stylesheet) and `lisnoti-full.css` (one file a style). The version is in the path so that
a font file, once fetched, is never fetched again; a new release gets a new folder. Run it after
every release of the font. It needs `fontTools` (`pip install fonttools`).

Since 2.000 (21 September 2026) the site serves WOFF2 only: no WOFF 1 and no TTF on the web.
