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


