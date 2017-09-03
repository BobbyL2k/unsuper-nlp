// Declare "global" variable
var global = {
    tabs: {}
};
const enm = {
    status: {
        LOADING: 'loading',
        ALIVE: 'alive',
        DEAD: 'dead'
    }
};

// Functions definition
function timedCallback(wait_ms, callback) {
    // create a new proxy callback function that will execute the
    // provided callback if a certain amount of time have passed and
    // the proxy was not called
    var tooLate = false;
    var timer = setTimeout(() => {
        tooLate = true;
        callback('timed');
    }, wait_ms);
    var proxy = (...args) => {
        if (!tooLate) {
            clearTimeout(timer);
            callback(null, ...args);
        }
    }
    return proxy;
}

const tab_action = {
    checkOk: function (tabId, callback) {
        var message = {
            type: 'ok'
        };
        chrome.tabs.sendMessage(tabId, message, {}, timedCallback(1000, function (err, response) {
            if (!err && response && response.value == 'ok') {
                callback(true);
            } else {
                callback(false);
            }
        }));
    }
}

const state_action = {
    removeTab: function (tabId) {
        if (global.tabs[tabId] !== undefined) {
            delete global.tabs[tabId];
            extension_action.updateTabsCount();
        } else {
            console.log('error removeTab: tab with tabId', tabId, 'not found');
        }
    },
    addTab: function (tabObject) {
        if (global.tabs[tabObject.id] === undefined) {
            global.tabs[tabObject.id] = tabObject;
            extension_action.updateTabsCount();

            if (state_info.getTabCount() == 1) {
                extension_action.cleanDeadTabs();
            }
        } else {
            console.log('error addTab: tab with tabId', tabId, 'already exist');
        }
    },
    setInjectionToTab: function (tabId, code) {
        if (global.tabs[tabId] !== undefined) {
            global.tabs[tabId].code = code;
        } else {
            console.log('error setInjectionToTab: tab with tabId', tabId, 'not found');
        }
    }
}

const state_info = {
    getTabCount: function () {
        return Object.keys(global.tabs).length;
    }
}

const extension_action = {
    updateTabsCount: function () {
        chrome.browserAction.setBadgeText({ text: state_info.getTabCount().toString() });
    },
    startUp: function () {
        console.log("bg page started");
        extension_action.updateTabsCount();
    },
    cleanDeadTabs: function () {
        console.log('checking dead', global.tabs);
        for (var tabId in global.tabs) {
            tab = global.tabs[tabId];
            if (tab.status === enm.status.ALIVE) {
                tab_action.checkOk(tab.id, (ok) => {
                    if (!ok) {
                        console.log('tab', tab.id, 'is DEAD, killing tab.');
                        tab.status = enm.status.DEAD;
                    } else {
                        console.log('tab', tab.id, 'is ok.');
                    }
                });
            }
            // Note: can NOT use else if due to the ALIVE condition marking the tab as DEAD
            if (tab.status === enm.status.DEAD) {
                // Note: chrome.tabs.remove requires int as tab's ID
                chrome.tabs.remove(tab.id);
                state_action.removeTab(tabId);
            }
            if (tab.status === enm.status.LOADING) {
                console.log('skipping check tab', tabId, 'with status', tab.status);
            }
        }
        if (state_info.getTabCount() > 0)
            setTimeout(extension_action.cleanDeadTabs, 5000);
    },
    injectCodeToTab: function (tabId) {
        if (global.tabs[tabId] !== undefined) {
            if (global.tabs[tabId].code !== undefined) {
                console.log('injecting code to tab', tabId);
                chrome.tabs.executeScript(tabId, {
                    code: global.tabs[tabId].code
                });
            }else{
                console.log('warning injectCodeToTab: no code to inject to tab', tabId)
            }
        } else {
            console.log('error injectCodeToTab: tab with tabId', tabId, 'not found');
        }
    }
}

// function tabsDo(func, callback) {
//     global.tabs.forEach((tab) => {
//         chrome.tabs.executeScript(tab.id, {
//             code: func
//         }, callback);
//     });
// }

// Start Extension
extension_action.startUp();

// Setup Events Handling
chrome.browserAction.onClicked.addListener(function (/*tab*/) {
    console.log('Icon clicked');
    // create tab
    chrome.tabs.create({}, function (tab) {
        console.log('tab', tab.id, 'created');

        var tabObject = {
            id: tab.id,
            status: enm.status.LOADING,
            storage: { test: 2 },
            code: undefined
        };

        state_action.addTab(tabObject);

    });
});

chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
    if (global.tabs[tabId] !== undefined) {
        console.log('managed tab', tabId, 'closed');
        state_action.removeTab(tabId);
    }
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (global.tabs[tabId] !== undefined) {
        console.log('chrome.tabs.onUpdated on managed tab', tabId, changeInfo, tab);
        if (changeInfo.status == 'complete') {
            chrome.tabs.executeScript(tabId, {
                file: 'page.js'
            }, function () {
                console.log('injected extension page script into tab', tabId);
                global.tabs[tabId].status = enm.status.ALIVE;

                console.log('sending tab storage', global.tabs[tabId].storage, global.tabs[tabId], 'into tab', tabId); /// TO REMOVE
                chrome.tabs.sendMessage(tabId, {
                    type: 'storage',
                    storage: global.tabs[tabId].storage
                }, {}, (newStorage) => {
                    console.log('recived new storage', newStorage, 'from tab', tabId);
                    if(newStorage === undefined){
                        console.log('chrome.runtime.lastError', chrome.runtime.lastError);
                    }else{
                        global.tabs[tabId].storage = newStorage;
                    }
                    // global.tabs[tabId].status = enm.status.DEAD;
                });

                state_action.setInjectionToTab(tabId,
                    `
                    console.log('eiei');
                    const func = ${pageInject.toString()};
                    set_func(func);
                    `
                )
                extension_action.injectCodeToTab(tabId);
            });
        }
    }
});

function pageInject(storage, callback) {
    console.log('storage', storage);
    const urlRegex = /https\:\/\/pantip.com/g;
    if (urlRegex.test(document.location) == false) {
        setTimeout(() => {
            console.log('redirecting');
            document.location = 'https://pantip.com/';
        }, 1000);
    }
    else {
        storage.test++;
        callback(null, storage);
    }
}