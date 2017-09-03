console.log('hello from page');

var tabStorage = undefined;
var tabFunc = undefined;
var tabSendResponse = undefined;

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse){
    console.log('message recevied', message);
    if(message.type == 'ok'){
        sendResponse({
            value:'ok'
        });
    }
    if(message.type == 'storage'){
        console.log('recived tab storage');
        tabStorage = message.storage;
        tabSendResponse = sendResponse;
        if(run_func() == false){
            return true;
        }
    }
});

function set_func(func){
    tabFunc = func;
    run_func();
}

function run_func(sendResponse){
    console.log('run_func: tabFunc && tabStorage && tabSendResponse', tabFunc !== undefined, tabStorage !== undefined, tabSendResponse !== undefined);
    if(tabFunc && tabStorage && tabSendResponse){
        console.log('executing injection');
        tabFunc(tabStorage, (err, newStorage)=>{
            if(err) return console.log(err);
            console.log('sending new storage', newStorage);
            tabSendResponse(newStorage)
        });
        return true;
    }else{
        return false;
    }
}