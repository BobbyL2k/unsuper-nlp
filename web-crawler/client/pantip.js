// const MAX_TAB_COUNT = 3;

function onExtensionFirstClicked (state_action) {

    var pageList = ['HTML'];
    // var pageList = ['HTML', 'CSS', 'JS'];

    for (var pageIndex = 0; pageIndex < pageList.length; pageIndex++) {
        function create_callback(local_pageIndex) {
            return function callback(tab) {
                console.log('tab', tab.id, 'created');
                console.log('pageList', pageList, pageList[local_pageIndex], local_pageIndex)
                var tabObject = {
                    id: tab.id,
                    storage: {
                        target: "https://pantip.com/tag/%E0%B8%84%E0%B8%AD%E0%B8%99%E0%B9%82%E0%B8%94%E0%B8%A1%E0%B8%B4%E0%B9%80%E0%B8%99%E0%B8%B5%E0%B8%A2%E0%B8%A1",
                        type: "GET_TOPICS"
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
}

function onExtensionClicked(){

}

var topic_pages = [];
var next_page = undefined;
var page_counter = 0;

function onPageMessage(tab, message, callback){
    let loadNextPage = false;
    if(message.type == 'TOPICS'){
        for(var c=0; c<message.value.length; c++){
            topic_pages.push(message.value[c]);
        }
        return callback('ok');
    }
    if(message.type == 'INDEX_PAGE'){
        console.log(next_page === undefined);
        next_page = message.value
        loadNextPage = true;
    }
    if(message.type == 'POST'){
        loadNextPage = true;
        // posts.push(message)
    }
    if(loadNextPage && page_counter < 10){
        if(topic_pages.length > 0){
            let topic = topic_pages.pop();
            return callback({
                target: topic.url,
                type: "GET_POST"
            });
        }else{
            if(next_page === undefined){
                return callback('error next page');
            }
            page_counter++;
            let temp = next_page
            next_page = undefined;
            return callback({
                target: temp,
                type: "GET_TOPICS"
            })
        }
    }
    callback('Nani?');
}

function pageInject(storage, callback) {
    console.log('storage', storage);
    if(typeof storage != 'object'){
        return;
    }
    // console.assert(typeof storage == 'object');
    if (document.location.href != storage.target) {
        document.location.href = storage.target;
    }
    else {
        if(storage.type == 'GET_TOPICS'){
            var topic_dom_elems = document.querySelectorAll('#show_topic_lists .post-item-title a');
            var topics = [];
            for(var c=0; c<topic_dom_elems.length; c++){
                let topic_dom_elem = topic_dom_elems[c];
                topics.push({
                    title: topic_dom_elem.text.trim(),
                    url: topic_dom_elem.href
                });
            }
            callback.message({
                type: "TOPICS",
                value: topics
            }, (response, callback)=>{
                console.log('res after send TOPICS', response);
                callback.message({
                    type: "INDEX_PAGE",
                    value: document.querySelector('.loadmore-bar a').href
                }, pageInject);
            });
        }else if(storage.type == 'GET_POST'){
            var dom_comments = document.querySelectorAll('#comments-jsrender div:not(.remove-comment) > div > div > div > .display-post-story:not(.main-comment)');
            var dom_c_timestamp = document.querySelectorAll('#comments-jsrender div:not(.remove-comment) > div > div > div > div > div > div > span.display-post-timestamp abbr');
            console.assert(dom_c_timestamp.length == dom_comments.length);
            var comments = [];
            for(var c=0; c<dom_comments.length; c++){
                comments.push({
                    time: dom_c_timestamp[c].attributes['data-utime'].value,
                    text: dom_comments[c].innerText.trim()
                });
            }
            var res_obj = {
                from: storage.target,
                type: "POST",
                title: document.querySelector('.display-post-title').innerText.trim(),
                post:{
                    time: document.querySelector('.display-post-timestamp abbr').attributes['data-utime'].value,
                    text: document.querySelector('.display-post-story:not(.main-comment)').innerText.trim()
                },
                comments
            };
            callback.save(res_obj, (storage, callback)=>{
                callback.message({
                    type: "POST",
                    saved: res_obj
                }, pageInject);
            });
        }
    }
}

console.log('pantip.js loaded')