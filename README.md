# fx-watch-mac-os-tray-app

Forex watch mac os tray app.

<img src="https://github.com/primenumsdev/fx-watch-mac-os-tray-app/blob/main/forex.png" height="148">

[Download Mac OS](https://github.com/primenumsdev/fx-watch-mac-os-tray-app/releases/download/latest/FxWatch.dmg)

## How to Download and Install FxWatch
1. Download the Application
    - Visit the [GitHub Releases page](https://github.com/primenumsdev/fx-watch-mac-os-tray-app/releases) or the distribution website where FxWatch is hosted.
    - Find the latest release version and download the DMG file (e.g., FxWatch-0.0.2-arm64.dmg).
2. Open the DMG File
    - Locate the downloaded DMG file in your Downloads folder or where you saved it.
    - Double-click on the DMG file to open it. This will mount the disk image and open a new Finder window with the application.
3. Install the Application
    - In the Finder window that opens, drag the FxWatch application icon to the Applications folder. This installs the app on your system.
4. Open the Application


**The App is Not Signed:**
macOS may display a security warning and prevent the app from opening, indicating that the app is from an unidentified developer.

To Bypass Gatekeeper:

- Go to System Preferences > Security & Privacy.
Click on the General tab.
You should see a message saying “FxWatch was blocked from use because it is not from an identified developer.”
Click the Open Anyway button next to the message.
To Open the App:

- After clicking Open Anyway, close the Security & Privacy window.
You can now open FxWatch by going to your Applications folder and double-clicking on the FxWatch icon.

## Troubleshooting

**If You Encounter Issue:** 

If macOS is flagging the app as "damaged," you might need to clear the quarantine attributes, run the following command:

`xattr -rd com.apple.quarantine /Applications/FxWatch.app`

Autoupdates require Mac OS app to be signed.
