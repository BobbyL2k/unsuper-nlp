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
    check_ok: function (tabId, callback) {
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
            extension_action.update_tabs_count();
        } else {
            console.log('error removeTab: tab with tabId', tabId, 'not found');
        }
    },
    addTab: function (tabObject) {
        if(global.tabs[tabObject.id] === undefined){
            global.tabs[tabObject.id] = tabObject;
            extension_action.update_tabs_count();

            if (state_info.getTabCount() == 1) {
                extension_action.clean_dead_tabs();
            }
        } else {
            console.log('error addTab: tab with tabId', tabId, 'already exist');
        }
    }
}

const state_info = {
    getTabCount: function(){
        return Object.keys(global.tabs).length;
    }
}

const extension_action = {
    update_tabs_count: function () {
        chrome.browserAction.setBadgeText({ text: state_info.getTabCount().toString() });
    },
    start_up: function () {
        console.log("bg page started");
        extension_action.update_tabs_count();
    },
    clean_dead_tabs: function () {
        console.log('checking dead', global.tabs);
        for(var tabId in global.tabs){
            tab = global.tabs[tabId];
            if (tab.status === enm.status.ALIVE) {
                tab_action.check_ok(tab.id, (ok) => {
                    if (!ok) {
                        console.log('tab', tab.id, 'is DEAD, killing tab.');
                        tab.status = enm.status.DEAD;
                        chrome.tabs.remove(tabId);
                        state_action.removeTab(tabId);
                    } else {
                        console.log('tab', tab.id, 'is ok.');
                    }
                });
            }
        }
        if (state_info.getTabCount() > 0)
            setTimeout(extension_action.clean_dead_tabs, 5000);
    }
}

function tabs_do(func, callback){
    global.tabs.forEach((tab)=>{
        chrome.tabs.executeScript(tab.id, {
            code: func
        }, callback);
    });
}

// Start Extension
extension_action.start_up();

// Setup Events Handling
chrome.browserAction.onClicked.addListener(function (/*tab*/) {
    console.log('Icon clicked');
    // create tab
    chrome.tabs.create({}, function (tab) {
        console.log('tab', tab.id, 'created');

        var tabObject = {
            id: tab.id,
            status: enm.status.LOADING
        };

        state_action.addTab(tabObject);

    });
});

chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
    if (global.tabs[tabId] !== undefined) {
        console.log('managed tab closed');
        state_action.removeTab(tabId);
    }
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab){
    if(global.tabs[tabId] !== undefined){
        console.log('chrome.tabs.onUpdated on managed tab', tabId, changeInfo, tab);
        if(changeInfo.status == 'complete'){
            chrome.tabs.executeScript(tabId, {
                file: 'page.js'
            }, function(){
                console.log('Injected extension page script into tab', tabId);
                global.tabs[tabId].status = enm.status.ALIVE;
            });
        }
    }
});
