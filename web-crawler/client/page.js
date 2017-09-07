console.log('hello from page');

var g = {
    operationCompleteCallback: undefined,
    injectedFunction: undefined,
    localStorage: undefined,
    backgroundPageResponse: undefined
};

const callback_handler = {
    update_storage: (newStorage, callback) => {
        console.log('sending new storage', newStorage);
        g.operationCompleteCallback = callback;
        g.backgroundPageResponse({
            type: 'update',
            storage: newStorage
        });
        g.backgroundPageResponse = undefined;
    },
    close: () => {
        g.backgroundPageResponse({
            type: 'close'
        });
        g.backgroundPageResponse = undefined;
    },
    save: (data, callback) => {
        g.operationCompleteCallback = callback;
        g.backgroundPageResponse({
            type: 'save',
            data: data
        });
        g.backgroundPageResponse = undefined;
    }
}

chrome.runtime.onMessage.addListener(function (message, _sender, sendResponse) {
    console.log('message recevied', message);

    // handle readiness handshake
    if (message.type == 'ok') {
        sendResponse({ value: 'ok' });
        return;
    }

    // handle storage
    if (message.type == 'storage') {
        console.log('recived tab storage');
        g.localStorage = message.storage;
        g.backgroundPageResponse = sendResponse;
        if (executeInjectedFunction() == false) {
            // failed to run the injected script
            // requesting async call
            return true;
        }
    }

    if (message.type == 'updated') {
        console.log('storage have been updated');
        g.localStorage = message.storage;
        g.backgroundPageResponse = sendResponse;
        if (g.operationCompleteCallback !== undefined) {
            g.operationCompleteCallback(g.localStorage, callback_handler);
            g.operationCompleteCallback = undefined;
            return true;
        }
    }

        if (message.type == 'saved') {
            console.log('storage have been saved to database');
            var response = { success: message.success };
            g.backgroundPageResponse = sendResponse;
            if (g.operationCompleteCallback !== undefined) {
                g.operationCompleteCallback(response, callback_handler);
                g.operationCompleteCallback = undefined;
                return true;
            }
        }
});

function executeInjectedFunction() {
    // returns true if g.injectedFunction is executed
    // returns false if g.injectedFunction is NOT executed
    if (
        g.injectedFunction &&
        g.localStorage &&
        g.backgroundPageResponse
    ) {
        console.log('executing injection');
        g.injectedFunction(g.localStorage, callback_handler);
        return true;
    } else {
        console.log(
            'executeInjectedFunction: incomplete : injectedFunction, localStorage, backgroundPageResponse',
            g.injectedFunction !== undefined,
            g.localStorage !== undefined,
            g.backgroundPageResponse !== undefined
        );
        return false;
    }
}

function set_func(func) {
    g.injectedFunction = func;
    executeInjectedFunction();
}
