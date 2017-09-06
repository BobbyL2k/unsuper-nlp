console.log('hello from page');

var g = {
    updatedStorageCallback: undefined,
    injectedFunction: undefined,
    localStorage: undefined,
    backgroundPageResponse: undefined
};

const callback_handler = {
    update_storage: (newStorage, callback) => {
        console.log('sending new storage', newStorage);
        g.updatedStorageCallback = callback;
        g.backgroundPageResponse({
            type: 'update',
            storage: newStorage
        });
    },
    close: () => {
        g.backgroundPageResponse({
            type: 'close'
        });
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
        if (g.updatedStorageCallback !== undefined) {
            g.updatedStorageCallback(g.localStorage, callback_handler);
            return true;
        }
    }
});

function executeInjectedFunction() {
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
