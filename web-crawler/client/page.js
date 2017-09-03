console.log('hello from page');
// window.location = 'https://pantip.com';
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse){
    console.log('message recevied', message);
    if(message.type == 'ok'){
        sendResponse({
            value:'ok'
        });
    }
});