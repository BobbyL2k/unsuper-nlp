console.assert(onExtensionFirstClicked !== undefined, 'onExtensionFirstClicked function is not defined');
console.assert(pageInject !== undefined, 'pageInject function is not defined');
console.assert(onPageMessage !== undefined, 'onPageMessage function is not defined');

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
            console.warn('warn removeTab: tab with tabId', tabId, 'not found');
        }
    },
    addTab: function (tabObject) {
        if (global.tabs[tabObject.id] === undefined) {
            tabObject.status = enm.status.LOADING;
            global.tabs[tabObject.id] = tabObject;
            extension_action.updateTabsCount();

            if (state_action.getTabCount() == 1) {
                extension_action.cleanDeadTabs();
            }
        } else {
            console.warn('warn addTab: tab with tabId', tabId, 'already exist');
        }
    },
    getTabCount: function () {
        return Object.keys(global.tabs).length;
    }
}

const extension_action = {
    updateTabsCount: function () {
        chrome.browserAction.setBadgeText({ text: state_action.getTabCount().toString() });
    },
    startUp: function () {
        extension_action.updateTabsCount();
    },
    cleanDeadTabs: function () {
        // console.log('checking dead', global.tabs);
        // for (var tabId in global.tabs) {
        //     tab = global.tabs[tabId];
        //     if (tab.status === enm.status.ALIVE) {
        //         tab_action.checkOk(tab.id, (ok) => {
        //             if (!ok) {
        //                 console.log('tab', tab.id, 'is DEAD, killing tab.');
        //                 tab.status = enm.status.DEAD;
        //             } else {
        //                 console.log('tab', tab.id, 'is ok.');
        //             }
        //         });
        //     }
        //     // Note: can NOT use else if due to the ALIVE condition marking the tab as DEAD
        //     if (tab.status === enm.status.DEAD) {
        //         // Note: chrome.tabs.remove requires int as tab's ID
        //         chrome.tabs.remove(tab.id);
        //         state_action.removeTab(tabId);
        //     }
        //     if (tab.status === enm.status.LOADING) {
        //         console.log('skipping check tab', tabId, 'with status', tab.status);
        //     }
        // }
        // if (state_action.getTabCount() > 0)
        //     setTimeout(extension_action.cleanDeadTabs, 5000);
    }
}

// Start Extension
extension_action.startUp();

var firstClicked = true;
// Setup Events Handling
chrome.browserAction.onClicked.addListener(()=>{
    console.log('Icon clicked');
    if(firstClicked){
        firstClicked = false;
        onExtensionFirstClicked(state_action);
    }
    onExtensionClicked(state_action);
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
                }, {}, createResponseHandler(tabId));

                chrome.tabs.executeScript(tabId, {
                    code: `set_func(${pageInject.toString()});`
                });
            });
        }
    }
});

function createResponseHandler(tabId) {
    return function responseHandler(response) {
        if (response === undefined) {
            console.trace();
            console.error('chrome.runtime.lastError', chrome.runtime.lastError);
        }
        else if (response.type == 'update') {
            console.log('recived new storage', response.storage, 'from tab', tabId);
            global.tabs[tabId].storage = response.storage;
            chrome.tabs.sendMessage(tabId, {
                type: 'updated',
                storage: global.tabs[tabId].storage
            }, {}, responseHandler);
        }
        else if (response.type == 'close') {
            chrome.tabs.remove(tabId);
        }
        else if (response.type == 'save') {
            var request = new XMLHttpRequest();
            request.open('POST', 'http://128.199.232.162/save/data', true);

            request.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
            request.onload = ()=>{
                send_saved_message(request.response == 'inserted ok 1')
            };
            request.onerror = ()=>{
                send_saved_message(false)
            };
            request.send(JSON.stringify(response.data));

            function send_saved_message(success){
                chrome.tabs.sendMessage(tabId, {
                    type: 'saved',
                    success: success
                }, {}, responseHandler);
            }
        }
        else if (response.type == 'message'){
            console.log('recived message from tab', tabId, response);
            onPageMessage(tabId, response.data, (newStorage)=>{
                global.tabs[tabId].storage = newStorage;
                chrome.tabs.sendMessage(tabId, {
                    type: 'response',
                    storage: global.tabs[tabId].storage
                }, {}, responseHandler);
            });
        }
        else{
            console.log('unknown response recived', response);
        }
    }
}

console.log('background.js loaded');