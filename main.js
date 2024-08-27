const { app, Tray, Menu, nativeImage, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const axios = require('axios');

const DEBUG_MODE = false;
const MAX_TREND_HISTORY_LENGTH = 25;
const WALUTOMAT_API_KEY = 'YOUR-API-KEY';

let tray = null;
let intervalId = null;
let intervalSec = 5;
let lastPrice = 0;
let trendHistory = [];

// On macOS, template images consist of black and an alpha channel. 
// https://www.electronjs.org/docs/latest/api/native-image#template-image-macos
let imgUp = path.join(__dirname, 'up-20.png');
let imgDown = path.join(__dirname, 'down-20.png');
let imgNone = nativeImage.createEmpty();

function pad(number) {
    return number < 10 ? '0' + number : number;
}

function timestamp() {
    // Get the current date and time
    const now = new Date();

    // Extract individual components
    const year = now.getFullYear();
    const month = pad(now.getMonth() + 1); // Months are zero-indexed
    const day = pad(now.getDate());
    const hours = pad(now.getHours());
    const minutes = pad(now.getMinutes());
    const seconds = pad(now.getSeconds());

    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
}

function debug() {
    if (DEBUG_MODE) {
        return console.log.apply(null, [timestamp(), ' – ', ...arguments]);
    }
}

function updateInterval(newIntervalSec) {
    debug('updating interval from', intervalSec, 'to', newIntervalSec);
    if (intervalId) {
        clearInterval(intervalId);
    }

    // clear trend history
    trendHistory = [];

    intervalSec = newIntervalSec;
    startInterval();
}

function startInterval() {
    // Update the tray every N seconds
    intervalId = setInterval(updateTray, intervalSec * 1000);
}

function buildContextMenu() {
    return Menu.buildFromTemplate([
        {
            label: '⏰ Update every',
            type: 'submenu',
            submenu: Menu.buildFromTemplate([
                { label: '5 seconds', type: 'radio', checked: intervalSec === 5, click: () => updateInterval(5) },
                { label: '30 seconds', type: 'radio', checked: intervalSec === 30, click: () => updateInterval(30) },
                { label: '1 minute', type: 'radio', checked: intervalSec === 60, click: () => updateInterval(60) },
                { label: '5 minutes', type: 'radio', checked: intervalSec === 5 * 60, click: () => updateInterval(5 * 60) },
                { label: '30 minutes', type: 'radio', checked: intervalSec === 30 * 60, click: () => updateInterval(30 * 60) },
                { label: '1 hour', type: 'radio', checked: intervalSec === 60 * 60, click: () => updateInterval(60 * 60) },
            ])
        },
        {
            label: '📈 Trend history',
            type: 'submenu',
            submenu: Menu.buildFromTemplate(
                trendHistory.map(([img, price]) => ({
                    icon: img, label: price
                }))
            )
        },
        { type: 'separator' },
        { label: 'Quit', click: () => app.quit() }
    ]);
}

function addTrendHistory(newItem) {
    trendHistory.unshift(newItem); // add to the start
    if (trendHistory.length > MAX_TREND_HISTORY_LENGTH) {
        trendHistory.pop(); // Remove the last (oldest) item
    }
}

// Function to update the tray tooltip with API data
async function updateTray() {
    try {
        const response = await axios.get('https://api.walutomat.pl/api/v2.0.0/market_fx/best_offers?currencyPair=USDPLN', {
            headers: {
                'X-API-Key': WALUTOMAT_API_KEY
            }
        });
        const bidPrice = response.data.result.bids[0].price;
        debug('bidPrice', bidPrice);

        let imgTrend = null;
        if (lastPrice !== 0) {
            if (bidPrice > lastPrice) {
                imgTrend = imgUp;
            } else if (bidPrice < lastPrice) {
                imgTrend = imgDown;
            }
        }

        if (imgTrend !== null) {
            tray.setImage(imgTrend);
            addTrendHistory([imgTrend, `${timestamp()} – ${bidPrice}`]);
            tray.setContextMenu(buildContextMenu());
        }

        lastPrice = bidPrice;

        tray.setTitle(bidPrice + " PLN");
        tray.setToolTip(bidPrice); // Update this based on your API response structure
    } catch (error) {
        debug('error', error);
        tray.setToolTip('Error loading data');
    }
};

app.whenReady().then(() => {
    // https://www.electronjs.org/docs/latest/api/tray#new-trayimage-guid
    tray = new Tray(imgNone); // Add your tray icon path
    tray.setTitle("X.XX PLN"); // Set the text next to the tray icon
    tray.setToolTip('Loading...');
    tray.setContextMenu(buildContextMenu());

    // Initial call to update the tray
    updateTray();

    startInterval();

    // Autoupdates works on Win and Linux but on Mac it requires Apple Dev certificate for app to be signed.
    if (process.platform !== 'darwin') {
        autoUpdater.checkForUpdatesAndNotify();
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Auto updater event listeners
autoUpdater.on('update-available', () => {
    dialog.showMessageBox({
        type: 'info',
        title: 'Update Available',
        message: 'A new version is available. Downloading now...',
        buttons: ['OK']
    });
});

autoUpdater.on('update-downloaded', () => {
    dialog.showMessageBox({
        type: 'info',
        title: 'Update Ready',
        message: 'A new version has been downloaded. Quit and install now?',
        buttons: ['Yes', 'Later']
    }).then(result => {
        if (result.response === 0) {
            autoUpdater.quitAndInstall();
        }
    });
});

autoUpdater.on('error', (error) => {
    dialog.showMessageBox({
        type: 'error',
        title: 'Error',
        message: `Update error: ${error.message}`,
        buttons: ['OK']
    });
});
