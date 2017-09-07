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
    }
}

// Start Extension
extension_action.startUp();

// Setup Events Handling
chrome.browserAction.onClicked.addListener(function (/*tab*/) {
    console.log('Icon clicked');

    var pageList = ['html', 'css', 'js'];

    for (var pageIndex = 0; pageIndex < pageList.length; pageIndex++) {
        function create_callback(local_pageIndex) {
            return function callback(tab) {
                console.log('tab', tab.id, 'created');
                console.log('pageList', pageList, pageList[local_pageIndex], local_pageIndex)
                var tabObject = {
                    id: tab.id,
                    status: enm.status.LOADING,
                    storage: {
                        pageName: pageList[local_pageIndex]
                    }
                };
                console.log('tabObject', JSON.stringify(tabObject));
                state_action.addTab(tabObject);
            }
        }
        chrome.tabs.create({}, create_callback(pageIndex));
    }

    // create tab
    // chrome.tabs.create({}, function (tab) {
    //     console.log('tab', tab.id, 'created');

    //     var tabObject = {
    //         id: tab.id,
    //         status: enm.status.LOADING,
    //         storage: { pageName: pageList[pageIndex] },
    //         code: undefined
    //     };
    //     pageIndex++;
    //     state_action.addTab(tabObject);

    // });
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
            console.log('chrome.runtime.lastError', chrome.runtime.lastError);
            return;
        }
        if (response.type == 'update') {
            console.log('recived new storage', response.storage, 'from tab', tabId);
            global.tabs[tabId].storage = response.storage;
            chrome.tabs.sendMessage(tabId, {
                type: 'updated',
                storage: global.tabs[tabId].storage
            }, {}, responseHandler);
        }
        if (response.type == 'close') {
            chrome.tabs.remove(tabId);
        }
        if (response.type == 'save') {
            var request = new XMLHttpRequest();
            request.open('POST', 'http://128.199.232.162', true);

            request.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
            request.onload = ()=>{
                send_saved_message(request.response == 'inserted ok 1')
            };
            request.onerror = ()=>{
                send_saved_message(false)
            };
            console.log(JSON.stringify(response.data))
            request.send(JSON.stringify(response.data));

            function send_saved_message(success){
                chrome.tabs.sendMessage(tabId, {
                    type: 'saved',
                    success: false
                }, {}, responseHandler);
            }
        }
    }
}

function pageInject(storage, callback) {
    console.log('storage', storage);
    var target = `https://www.w3schools.com/${storage.pageName}/default.asp`;
    if (document.location != target) {
        document.location = target;
    }
    else {
        var save_obj = {target:target};
        callback.save(save_obj, (response, callback)=>{
            console.log(response);
        })
        // var dom_list = document.querySelectorAll('.entry-content');
        // var text_list = [];
        // for (var c = 0; c < dom_list.length; c++) {
        //     text_list.push(dom_list[c].innerText);
        // }
        // callback.update_storage(document.body.innerHTML, (storage, callback) => {
        //     // callback.close();
        // });
    }
}
