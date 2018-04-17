"use strict";

const dom = {
    submitBtn: document.getElementById("submit-btn"),
    input: document.getElementById("input"),
    containNe: document.getElementById("contain-ne"),
    namedEntity: document.getElementById("named-entity"),
    question: document.getElementById("question"),
    positive: document.getElementById("positive"),
    negative: document.getElementById("negative"),
    feedback: document.getElementById("feedback"),
}
const g = {
    text: undefined,
    userId: (function getUsername() {
        function getCookie(name) {
            var value = "; " + document.cookie;
            var parts = value.split("; " + name + "=");
            if (parts.length == 2) return parts.pop().split(";").shift();
        }
        const username = getCookie("user");
        console.log(document.cookie, username);
        return username;
    })(),
}

function clearText(){
    dom.containNe.innerText = "N/A";
    dom.namedEntity.innerText = "";
    dom.question.innerText = "";
    dom.positive.innerText = "";
    dom.negative.innerText = "";
    dom.feedback.innerText = "";
}

{
    // Display username on logout button
    document.getElementById("user-logout-btn").textContent = `Logout of "${g.userId}"`;
    
    console.log(dom);
    dom.submitBtn.addEventListener("click", ()=>{
        g.text = input.value;
        clearText();
        $.post("/api/predict", {text:g.text})
            .then((message)=>{
                const messageObj = JSON.parse(message);
                console.log("message", messageObj);
                if(messageObj.status === "ok"){
                    dom.containNe.innerText = `${Math.round(messageObj.payload.ner_exist*10000)/100}%`;
                    const words = [];
                    let lastIdx = 0;
                    for(const idx of messageObj.payload.word_boundary){
                        words.push(g.text.substring(lastIdx, idx));
                        lastIdx = idx;
                    }
                    dom.namedEntity.innerHTML = words.map(
                        (word, index)=>{
                            const prop = messageObj.payload.ner_pred[index];
                            const disProp = Math.min(1, Math.round(prop / messageObj.payload.ner_pred_threshold * 10000)/10000);
                            const active = prop > messageObj.payload.ner_pred_threshold;
                            if(active){
                                return `<span title="${disProp}"class="active" style="background-color: hsl(217, 100%, ${100-disProp*40}%)">${word}</span>`
                            }else{
                                return `<span title="${disProp}"style="background-color: hsl(217, 100%, ${100-disProp*40}%)">${word}</span>`
                            }
                        }
                    ).join("");
                    dom.question.innerHTML = words.map(
                        (word, index)=>{
                            const prop = messageObj.payload.sentiment_pred[0][index];
                            const disProp = Math.min(1, Math.round(prop / messageObj.payload.sentiment_pred_threshold[0] * 10000)/10000);
                            const active = prop > messageObj.payload.sentiment_pred_threshold[0];
                            if(active){
                                return `<span title="${disProp}"class="active" style="background-color: hsl(275, 100%, ${100-disProp*40}%)">${word}</span>`
                            }else{
                                return `<span title="${disProp}"style="background-color: hsl(275, 100%, ${100-disProp*40}%)">${word}</span>`
                            }
                        }
                    ).join("");
                    dom.positive.innerHTML = words.map(
                        (word, index)=>{
                            const prop = messageObj.payload.sentiment_pred[1][index];
                            const disProp = Math.min(1, Math.round(prop / messageObj.payload.sentiment_pred_threshold[1] * 10000)/10000);
                            const active = prop > messageObj.payload.sentiment_pred_threshold[1];
                            if(active){
                                return `<span title="${disProp}"class="active" style="background-color: hsl(123, 59%, ${100-disProp*40}%)">${word}</span>`
                            }else{
                                return `<span title="${disProp}"style="background-color: hsl(123, 59%, ${100-disProp*40}%)">${word}</span>`
                            }
                        }
                    ).join("");
                    dom.negative.innerHTML = words.map(
                        (word, index)=>{
                            const prop = messageObj.payload.sentiment_pred[2][index];
                            const disProp = Math.min(1, Math.round(prop / messageObj.payload.sentiment_pred_threshold[2] * 10000)/10000);
                            const active = prop > messageObj.payload.sentiment_pred_threshold[2];
                            if(active){
                                return `<span title="${disProp}"class="active" style="background-color: hsl(0, 55%, ${100-disProp*40}%)">${word}</span>`
                            }else{
                                return `<span title="${disProp}"style="background-color: hsl(0, 55%, ${100-disProp*40}%)">${word}</span>`
                            }
                        }
                    ).join("");
                    dom.feedback.innerHTML = words.map(
                        (word, index)=>{
                            const prop = messageObj.payload.sentiment_pred[3][index];
                            const disProp = Math.min(1, Math.round(prop / messageObj.payload.sentiment_pred_threshold[3] * 10000)/10000);
                            const active = prop > messageObj.payload.sentiment_pred_threshold[3];
                            if(active){
                                return `<span title="${disProp}"class="active" style="background-color: hsl(180, 77%, ${100-disProp*40}%)">${word}</span>`
                            }else{
                                return `<span title="${disProp}"style="background-color: hsl(180, 77%, ${100-disProp*40}%)">${word}</span>`
                            }
                        }
                    ).join("");
                }else{
                    clearText();
                }
            })
            .catch((error)=>{
                console.log("Error", error);
            });
    });
}