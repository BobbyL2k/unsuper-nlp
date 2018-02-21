"use strict";
// Load Data Options
const dom = {
    loadOptions: {
        contentId: {
            input: document.getElementById("content-id-input"),
            loadButton: {
                elem: document.getElementById("load-content-id-btn"),
                defaultTextStr: "load",
            }
        },
        pantipId: {
            input: document.getElementById("pantip-id-input"),
            loadButton: {
                elem: document.getElementById("load-pantip-id-btn"),
                defaultTextStr: "load",
            }
        },
        type: {
            first: {
                elem: document.getElementById("load-first-btn"),
                defaultTextStr: "First Entry",
            },
            unlabeled: {
                elem: document.getElementById("load-unlabled-btn"),
                defaultTextStr: "Unlabeled",
            },
            prev: {
                elem: document.getElementById("load-prev-btn"),
                defaultTextStr: "Prev Entry",
            },
            next: {
                elem: document.getElementById("load-next-btn"),
                defaultTextStr: "Next Entry",
            },
        }
    },
    dataInfo: {
        id: document.getElementById("id"),
        infoSelection: document.getElementById("info-section"),
        infoToggleButton: document.getElementById("info-section-btn"),
        tagStatusLabel: document.getElementById("tag-status-label"),
        previewTextBox: document.getElementById("text-preview"),
    },
    label: {
        sentiment: {
            positive: document.getElementById("positive-btn"),
            mixed: document.getElementById("mixed-btn"),
            negative: document.getElementById("negative-btn"),
            neutral: document.getElementById("neutral-btn"),
        }
    }
}
const domType = {
    loadButton: [
        dom.loadOptions.contentId.loadButton,
        dom.loadOptions.pantipId.loadButton,
        dom.loadOptions.type.first,
        dom.loadOptions.type.next,
        dom.loadOptions.type.prev,
        dom.loadOptions.type.unlabeled,
    ]
}

const g = {
    allowLoading: true,
    content: null,
    userId: (function getUsername() {
        const username = document.cookie.split(";")[0].split("=")[1];
        console.log(document.cookie, username);
        return username;
    })(),
};

{// start up
    // Display username on logout button
    document.getElementById("user-logout-btn").textContent = `Logout of "${g.userId}"`;

    console.log(dom);
    refreshButtons();

    // Clear

    dom.dataInfo.id.textContent = "-";
    document.getElementById("title").textContent = "-";
    document.getElementById("time").textContent = "-";
    document.getElementById("source").textContent = "-";
    dom.dataInfo.previewTextBox.textContent = "-";

    dom.loadOptions.contentId.loadButton.elem.addEventListener("click", onLoadByContentId);
    dom.loadOptions.pantipId.loadButton.elem.addEventListener("click", onLoadByPantipId);
    dom.loadOptions.type.first.elem.addEventListener("click", onLoadFirst);
    dom.loadOptions.type.unlabeled.elem.addEventListener("click", onUnlabeled);
    dom.loadOptions.type.next.elem.addEventListener("click", onLoadByNext);
    dom.loadOptions.type.prev.elem.addEventListener("click", onLoadByPrev);

    dom.label.sentiment.positive.addEventListener("click", onClickPositive);
    dom.label.sentiment.mixed.addEventListener("click", onClickMixed);
    dom.label.sentiment.negative.addEventListener("click", onClickNegative);
    dom.label.sentiment.neutral.addEventListener("click", onClickNeutral);

    // Code from stackoverflow
    // https://stackoverflow.com/questions/5448545/how-to-retrieve-get-parameters-from-javascript
    function getSearchParameters() {
        var prmstr = window.location.search.substr(1);
        return prmstr != null && prmstr != "" ? transformToAssocArray(prmstr) : {};
    }

    function transformToAssocArray(prmstr) {
        var params = {};
        var prmarr = prmstr.split("&");
        for (var i = 0; i < prmarr.length; i++) {
            var tmparr = prmarr[i].split("=");
            params[tmparr[0]] = tmparr[1];
        }
        return params;
    }

    const params = getSearchParameters();
    // End Code from stackoverflow

    if (params.id !== undefined) {
        disableLoading();
        loadContentWithId(params.id);
    }

    console.log("params", params);
}

function disableLoading() {
    console.log("start loading");
    g.allowLoading = false;
    domType.loadButton.map(btn => {
        btn.elem.classList.add("disabled")
        btn.elem.textContent = "Loading";
    });
};

function onLoadByContentId() {
    if (!g.allowLoading) return;
    disableLoading();
    loadContentWithId(dom.loadOptions.contentId.input.value);
}

function loadContentWithId(id) {
    handleContentPromise($.getJSON(`/api/data/content/${id}`));
}

function onLoadByPantipId() {
    if (!g.allowLoading) return;
    disableLoading();
    console.log("pantip");
    handleContentPromise($.getJSON(`/api/data/content/pantip/${dom.loadOptions.pantipId.input.value}/post`));
}

function onLoadFirst() {
    if (!g.allowLoading) return;
    disableLoading();
    handleContentPromise($.getJSON(`/api/data/content/`));
}

function onUnlabeled() {
    if (!g.allowLoading) return;
    disableLoading();
    console.log("unlabeled");
    handleContentPromise($.getJSON(`/api/data/unlabeled-content/`));
}
function onLoadByNext() {
    if (!g.allowLoading || g.contentId === undefined) return;
    disableLoading();
    console.log("next");
    handleContentPromise($.getJSON(`/api/data/next-content/${g.contentId}`));
}

function onLoadByPrev() {
    if (!g.allowLoading || g.contentId === undefined) return;
    disableLoading();
    console.log("prev");
    handleContentPromise($.getJSON(`/api/data/prev-content/${g.contentId}`));
}

function handleContentPromise(promise) {
    g.from = undefined;
    g.to = undefined;
    g.allowSubmit = false;

    promise
        .then((loadedContent) => {
            console.log("loaded", loadedContent);
            g.content = loadedContent;
            g.contentId = g.content.id;
            
            {// Display data info
                dom.dataInfo.id.textContent = g.contentId;
                document.getElementById("title").textContent = g.content.info.title;
                document.getElementById("time").textContent = g.content.info.time;
                if (g.content.info.source !== undefined) {
                    document.getElementById("source").textContent = g.content.info.source;
                } else {
                    document.getElementById("source").textContent = g.content.info.url
                }
            }

            {// Fill missing attributes
                if (g.content.tag === undefined) {
                    g.content.tag = {};
                }

                if (g.content.label === undefined) {
                    g.content.label = {};
                }
                if (g.content.label.sentiment === undefined) {
                    g.content.label.sentiment = {};
                }
            }

            {// Verify Tags are displayable
                function tagStrToObj(str) {
                    const [type, from, to] = str.split('-');
                    if (type !== "text") {
                        throw Error("Invalid Tag", str);
                    }
                    return { from: parseInt(from), to: parseInt(to), str };
                }

                function overlap(tagObjA, tagObjB) {
                    return (
                        tagObjA.from <= tagObjB.from && tagObjB.from < tagObjA.to ||
                        tagObjA.from < tagObjB.to && tagObjB.to <= tagObjA.to ||
                        tagObjB.from <= tagObjA.from && tagObjA.from < tagObjB.to ||
                        tagObjB.from < tagObjA.to && tagObjA.to <= tagObjB.to
                    );
                }
                
                g.tags = Object.keys(g.content.tag).map(tagStrToObj);
                g.tags.sort((a, b) => a.from - b.from);
                console.log("gtags", g.tags);
                for (const tagA of g.tags) {
                    // console.log("tagA", tagA);
                    for (const tagB of g.tags) {
                        // console.log("tagB", tagB, tagA !== tagB);
                        if (tagA !== tagB && overlap(tagA, tagB)) {
                            throw Error("Overlaping Tags");
                        }
                    }
                }
            }

            {// Display tagging status
                if (g.tags.length > 0) {
                    console.log
                    if (g.tags[0].str === "text-none") {
                        dom.dataInfo.tagStatusLabel.textContent = "Labeled, NO tags (0 tags)";
                    } else {
                        dom.dataInfo.tagStatusLabel.textContent = g.tags.length === 1 ? "Labeled, 1 tag" : `Labeled, ${g.tags.length} tags`;
                    }
                } else {
                    dom.dataInfo.tagStatusLabel.textContent = "Unlabeled";
                }
            }

            {// Display tagging text preview
                let textContentElem = document.createElement("div");
                let latestIndex = 0;
                for (const tag of g.tags) {
                    const textElem = document.createElement("span");
                    textElem.innerText = g.content.text.slice(latestIndex, tag.from);
                    textContentElem.appendChild(textElem);
                    const badge = document.createElement("span");
                    badge.classList.add("badge");
                    badge.classList.add("badge-primary");
                    badge.innerText = g.content.text.slice(tag.from, tag.to);
                    textContentElem.appendChild(badge);
                    latestIndex = tag.to;
                }
                const textElem = document.createElement("span");
                textElem.innerText = g.content.text.slice(latestIndex);
                textContentElem.appendChild(textElem);
                while (dom.dataInfo.previewTextBox.firstChild) {
                    dom.dataInfo.previewTextBox.removeChild(dom.dataInfo.previewTextBox.firstChild);
                }
                dom.dataInfo.previewTextBox.appendChild(textContentElem);
            }

            g.allowSubmit = true;
            refreshButtons();

            {// enable loading
                g.allowLoading = true;
                domType.loadButton.map(btn => {
                    btn.elem.classList.remove("disabled");
                    btn.elem.textContent = btn.defaultTextStr;
                });
            }
        })
        .catch((err) => {
            domType.loadButton.map(btn => {
                btn.elem.textContent = "Error";
            });
            console.log("Loading Error", err);
            alert(err.responseText);
        });
}

function onClickPositive() {
    console.log("click Positive");
    if (g.content === null) {
        return;
    }
    dom.label.sentiment.positive.innerText = "Submitting";
    submitSentiment("positive")
        .then(()=>{
            console.log("done");
            dom.label.sentiment.positive.innerText = "Positive";
        });
}
function onClickMixed() {
    console.log("click Mixed");
    if (g.content === null) {
        return;
    }
    dom.label.sentiment.mixed.innerText = "Submitting";
    submitSentiment("mixed")
        .then(()=>{
            console.log("done");
            dom.label.sentiment.mixed.innerText = "Mixed";
        });
}
function onClickNegative() {
    console.log("click Negative");
    if (g.content === null) {
        return;
    }
    dom.label.sentiment.negative.innerText = "Submitting";
    submitSentiment("negative")
        .then(()=>{
            console.log("done");
            dom.label.sentiment.negative.innerText = "Negative";
        });
}
function onClickNeutral() {
    console.log("click Neutral");
    if (g.content === null) {
        return;
    }
    dom.label.sentiment.neutral.innerText = "Submitting";
    submitSentiment("neutral")
        .then(()=>{
            console.log("done");
            dom.label.sentiment.neutral.innerText = "Neutral";
        });
}

async function submitSentiment(value) {
    if (!g.allowSubmit) {
        console.log('submit at wrong time');
        return;
    }
    console.log("submiting");
    const path = `/api/data/label-content/${g.contentId}`;

    const payload = { domain:"sentiment", value };
    console.log("sending to", path, "payload", payload);
    g.allowSubmit = false;
    refreshButtons();

    try{
        const result = await $.post(path, payload);
        console.log("result after submit", result);
        loadContentWithId(g.content.id);
    }catch(err){
        console.log("error after submit", err);
    }
}

function refreshButtons() {
    dom.label.sentiment.positive.classList.add("btn-outline-success");
    dom.label.sentiment.mixed.classList.add("btn-outline-warning");
    dom.label.sentiment.negative.classList.add("btn-outline-danger");
    dom.label.sentiment.neutral.classList.add("btn-outline-info");

    dom.label.sentiment.positive.classList.remove("btn-success");
    dom.label.sentiment.mixed.classList.remove("btn-warning");
    dom.label.sentiment.negative.classList.remove("btn-danger");
    dom.label.sentiment.neutral.classList.remove("btn-info");

    if (!g.allowSubmit) {
        dom.label.sentiment.positive.classList.add("disabled");
        dom.label.sentiment.mixed.classList.add("disabled");
        dom.label.sentiment.negative.classList.add("disabled");
        dom.label.sentiment.neutral.classList.add("disabled");

    } else {
        dom.label.sentiment.positive.classList.remove("disabled");
        dom.label.sentiment.mixed.classList.remove("disabled");
        dom.label.sentiment.negative.classList.remove("disabled");
        dom.label.sentiment.neutral.classList.remove("disabled");

        if (g.content.label.sentiment.value === "positive") {
            dom.label.sentiment.positive.classList.remove("btn-outline-success");
            dom.label.sentiment.positive.classList.add("btn-success");
        } else if (g.content.label.sentiment.value === "mixed") {
            dom.label.sentiment.mixed.classList.remove("btn-outline-warning");
            dom.label.sentiment.mixed.classList.add("btn-warning");
        } else if (g.content.label.sentiment.value === "negative") {
            dom.label.sentiment.negative.classList.remove("btn-outline-danger");
            dom.label.sentiment.negative.classList.add("btn-danger");
        } else if (g.content.label.sentiment.value === "neutral") {
            dom.label.sentiment.neutral.classList.remove("btn-outline-info");
            dom.label.sentiment.neutral.classList.add("btn-info");
        }

    }
}

window.addEventListener("keypress", (e) => {
    if (e.key === "u") { onUnlabeled(); }
    if (e.key === "p" || e.key === "ArrowLeft") { onLoadByPrev(); }
    if (e.key === "n" || e.key === "ArrowRight") { onLoadByNext(); }
    if (e.key === "Enter") { submitData(); }
})