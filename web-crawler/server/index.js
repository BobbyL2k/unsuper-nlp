const https = require('https');
const cheerio = require('cheerio');

main();
function main(){
    buffered_request
}

function load_forum_index(url_string, callback){
    buffered_request(url_string, (data)=>{
        var dom = cheerio.load(data);
        var a_collection = dom('#show_topic_lists .post-item-title > a');
        var next_page_button = ;
        var return_obj = {
            topics:[],
            next_page: dom('.loadmore-bar.indexlist > a')[0].attribs.href
        };
        function get_text(div_element){
            return div_element.children[0].data;
        }

        for(var c=0; c<a_collection.length; c++){
            var a_element = a_collection[c];
            return_obj.topics.push({
                title:get_text(a_element),
                url:a_element.attribs.href
            })
        }
        call
    });
}


function buffered_request(url_string, callback){
    https.request(url_string, (res)=>{

        var buffer = '';

        res.on('data', (data) => {
            buffer += data;
        });
        res.on('end', ()=>{
            callback(buffer);
        })
    })
    .on('error',(error)=>{
        console.log('error', error);
    })
    .end();
}