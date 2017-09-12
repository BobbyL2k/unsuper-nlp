console.log('hello from page');

class SingleUseFunction {
    constructor(){
        this._func = undefined;
    }
    set(_func){
        console.assert(_func !== undefined, 'function set is undefined');
        console.assert(this._func === undefined, 'function is already set');

        this._func = _func;
    }
    isNotUndef(){
        return this._func !== undefined;
    }
    run(...args){
        console.assert(this._func !== undefined, 'function is not set, or is already ran');
        var _func = this._func;
        this._func = undefined;
        _func(...args);
    }
}

var g = {
    localStorage: undefined,
    operationCompleteCallback: new SingleUseFunction(),
    injectedFunction: new SingleUseFunction(),
    backgroundPageResponse: new SingleUseFunction()
};

const callback_handler = {
    update_storage: (newStorage, callback) => {
        console.log('sending new storage', newStorage);
        g.operationCompleteCallback.set(callback);
        g.backgroundPageResponse.run({
            type: 'update',
            storage: newStorage
        });
    },
    close: () => {
        g.backgroundPageResponse.run({
            type: 'close'
        });
    },
    save: (data, callback) => {
        g.operationCompleteCallback.set(callback);
        g.backgroundPageResponse.run({
            type: 'save',
            data: data
        });
    },
    message: (data, callback) => {
        console.log('calling message callback', data, callback);
        g.operationCompleteCallback.set(callback);
        g.backgroundPageResponse.run({
            type: 'message',
            data: data
        });
    }
}

chrome.runtime.onMessage.addListener(function (message, _sender, sendResponse) {

    // handle readiness handshake
    if (message.type == 'ok') {
        sendResponse({ value: 'ok' });
        return;
    }

    // handle storage
    if (message.type == 'storage') {
        console.log('recived tab storage');
        g.localStorage = message.storage;
        g.backgroundPageResponse.set(sendResponse);
        if (executeInjectedFunction() == false) {
            // failed to run the injected script
            // requesting async call
            return true;
        }
    }

    if (message.type == 'updated' || message.type == 'response') {
        console.log(message.type=='update'?'storage have been updated':'response recevied', message);
        g.localStorage = message.storage;
        g.backgroundPageResponse.set(sendResponse);
        if (g.operationCompleteCallback.isNotUndef()) {
            g.operationCompleteCallback.run(g.localStorage, callback_handler);
            return true;
        }
    }

    if (message.type == 'saved') {
        console.log('storage have been saved to database');
        var response = { success: message.success };
        g.backgroundPageResponse.set(sendResponse);
        if (g.operationCompleteCallback.isNotUndef()) {
            g.operationCompleteCallback.run(g.localStorage, callback_handler);
            return true;
        }
    }
});

function executeInjectedFunction() {
    // returns true if g.injectedFunction is executed
    // returns false if g.injectedFunction is NOT executed
    if (
        g.injectedFunction.isNotUndef() &&
        g.localStorage &&
        g.backgroundPageResponse.isNotUndef()
    ) {
        console.log('executing injection');
        g.injectedFunction.run(g.localStorage, callback_handler);
        return true;
    } else {
        console.log(
            'executeInjectedFunction: incomplete : injectedFunction, localStorage, backgroundPageResponse',
            g.injectedFunction.isNotUndef(),
            g.localStorage !== undefined,
            g.backgroundPageResponse.isNotUndef()
        );
        return false;
    }
}

function set_func(func) {
    g.injectedFunction.set(func);
    executeInjectedFunction();
}
