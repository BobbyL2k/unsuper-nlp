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
        previewTextBox: document.getElementById("text-preview"),
        taggingTextBox: document.getElementById("tag-textarea"),
    },
    submitPreview: {
        selectedText: document.getElementById("selected-text"),
        selectedSize: document.getElementById("selected-size"),
        submitButton: document.getElementById("submit-btn"),
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
// // Buttons
// const loadButton = document.getElementById("load-btn");
// const submitButton = document.getElementById("submit-btn");
// // Inputs
// const contentIdInput = document.getElementById("contentId-input");
// // textarea
// const postPreviewElem = document.getElementById("post-preview");
// const postTextareaElem = document.getElementById("post-textarea");

// // Output Preview
// const selectedTextElem = document.getElementById("selected-text");
// const selectedSizeElem = document.getElementById("selected-size");

const g = {
    allowLoading: true,
    allowSubmit: false,
    content: null,
    userId: (function getUsername() {
        const username = document.cookie.split(";")[0].split("=")[1];
        console.log(document.cookie, username);
        return username;
    })(),
};

(function startUp() {
    // Display username on logout button
    document.getElementById("user-logout-btn").textContent = `Logout of "${g.userId}"`;

    console.log(dom);

    // Clear

    dom.dataInfo.id.textContent = "-";
    document.getElementById("title").textContent = "-";
    document.getElementById("time").textContent = "-";
    document.getElementById("source").textContent = "-";
    dom.dataInfo.previewTextBox.textContent = "-";
    dom.dataInfo.taggingTextBox.value = "-";
    dom.submitPreview.selectedText.value = "-";
    dom.submitPreview.selectedSize.value = "-";

    dom.loadOptions.contentId.loadButton.elem.addEventListener("click", onLoadByContentId);
    dom.loadOptions.pantipId.loadButton.elem.addEventListener("click", onLoadByPantipId);
    dom.loadOptions.type.first.elem.addEventListener("click", onLoadFirst);
    dom.loadOptions.type.next.elem.addEventListener("click", onLoadByNext);
    dom.loadOptions.type.prev.elem.addEventListener("click", onLoadByPrev);

    dom.dataInfo.taggingTextBox.addEventListener("mouseup", onTagSelectionChange);

    dom.submitPreview.submitButton.addEventListener("click", submitData);
})();

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
    handleContentPromise($.getJSON(`/api/data/content/${dom.loadOptions.pantipId.input.value}/post`));
}

function onLoadFirst() {
    if (!g.allowLoading) return;
    disableLoading();
    handleContentPromise($.getJSON(`/api/data/content/`));
}

function onLoadByNext() {
    if (!g.allowLoading) return;
    disableLoading();
    console.log("next");
    handleContentPromise($.getJSON(`/api/data/next-content/${g.contentId}`));
}

function onLoadByPrev() {
    if (!g.allowLoading) return;
    disableLoading();
    console.log("prev");
    handleContentPromise($.getJSON(`/api/data/prev-content/${g.contentId}`));
}

function handleContentPromise(promise) {
    promise
        .then((loadedContent) => {
            console.log("loaded", loadedContent);
            g.content = loadedContent;
            g.contentId = g.content.id;
            console.log("g.content", g.content);
            dom.dataInfo.id.textContent = g.contentId;
            document.getElementById("title").textContent = g.content.info.title;
            document.getElementById("time").textContent = g.content.info.time;
            document.getElementById("source").textContent = g.content.info.source;
            dom.dataInfo.taggingTextBox.value = g.content.text;
            dom.dataInfo.taggingTextBox.style.height = dom.dataInfo.taggingTextBox.scrollHeight + 'px';

            if (g.content.tag === undefined) {
                g.content.tag = {};
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
            let previewHtmlStr = "<div>";
            let latestIndex = 0;
            for (const tag of g.tags) {
                previewHtmlStr += g.content.text.slice(latestIndex, tag.from);
                previewHtmlStr += "<span class=\"badge badge-primary\">"
                previewHtmlStr += g.content.text.slice(tag.from, tag.to);
                previewHtmlStr += " <i class=\"fa fa-times-circle\" onclick=\"requestRemoveData('" + tag.str + "')\"></i>"
                previewHtmlStr += "</span>"
                latestIndex = tag.to;
            }
            previewHtmlStr += g.content.text.slice(latestIndex) + "</div>";
            dom.dataInfo.previewTextBox.innerHTML = previewHtmlStr;

            (function enableLoading(params) {
                g.allowLoading = true;
                domType.loadButton.map(btn => {
                    btn.elem.classList.remove("disabled");
                    btn.elem.textContent = btn.defaultTextStr;
                });
            })();
        })
        .catch((err) => {
            domType.loadButton.map(btn => {
                btn.elem.textContent = "Error";
            });
            console.log("Loading Error", err);
            alert(err.responseText);
        });

    clearSubmitData();
};

function clearSubmitData(params) {
    dom.submitPreview.selectedText.value = "-";
    dom.submitPreview.selectedSize.value = "-";
    dom.submitPreview.submitButton.classList.add("disabled");
    g.allowSubmit = false;
}

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

// function loadContent() {
//     if (!g.allowLoading) return;

//     g.contentId = contentIdInput.value;
//     console.log("start loading", g.contentId);
//     g.allowLoading = false;
//     loadButton.classList.add("disabled");
//     loadButton.textContent = "Loading";

//     $.getJSON(`/api/data/content-pantip-post/${g.contentId}`)
//         .then((loadedContent) => {
//             g.content = loadedContent;
//             console.log("g.content", g.content);
//             document.getElementById("title").textContent = g.content.info.title;
//             document.getElementById("time").textContent = g.content.info.time;
//             document.getElementById("source").textContent = g.content.info.source;
//             postTextareaElem.value = g.content.text;

//             if (g.content.tag === undefined) {
//                 g.content.tag = {};
//             }

//             g.tags = Object.keys(g.content.tag).map(tagStrToObj);
//             g.tags.sort((a, b) => a.from - b.from);
//             console.log("gtags", g.tags);
//             for (const tagA of g.tags) {
//                 // console.log("tagA", tagA);
//                 for (const tagB of g.tags) {
//                     // console.log("tagB", tagB, tagA !== tagB);
//                     if (tagA !== tagB && overlap(tagA, tagB)) {
//                         throw Error("Overlaping Tags");
//                     }
//                 }
//             }
//             let previewHtmlStr = "<div>";
//             let latestIndex = 0;
//             for (const tag of g.tags) {
//                 previewHtmlStr += g.content.text.slice(latestIndex, tag.from);
//                 previewHtmlStr += "<span class=\"badge badge-primary\">"
//                 previewHtmlStr += g.content.text.slice(tag.from, tag.to);
//                 previewHtmlStr += "</span>"
//                 latestIndex = tag.to;
//             }
//             previewHtmlStr += g.content.text.slice(latestIndex) + "</div>";
//             postPreviewElem.innerHTML = previewHtmlStr;

//             g.allowLoading = true;
//             loadButton.classList.remove("disabled");
//             loadButton.textContent = "Done";
//         })
//         .catch((err) => {
//             loadButton.textContent = "Error";
//             console.log("Loading Error", err);
//             alert(err.responseText);
//         });

//     clearSubmitData();
// }

// loadButton.addEventListener("click", loadContent);

function onTagSelectionChange(event) {
    const tagTextBox = dom.dataInfo.taggingTextBox
    if (tagTextBox.selectionStart === tagTextBox.selectionEnd) {
        return;
    }
    console.log("Selection Change", event);
    g.from = tagTextBox.selectionStart;
    g.to = tagTextBox.selectionEnd;
    g.selectedText = tagTextBox.value.slice(g.from, g.to);

    dom.submitPreview.selectedText.value = `"${g.selectedText}"`;
    dom.submitPreview.selectedSize.value = g.selectedText.length;

    const newTag = { from: g.from, to: g.to };
    for (const tag of g.tags) {
        if (overlap(newTag, tag)) {
            dom.submitPreview.submitButton.innerText = "Tag Overlap";
            dom.submitPreview.submitButton.classList.add("disabled");
            g.allowSubmit = false;
            return;
        }
    }

    dom.submitPreview.submitButton.innerText = "Submit";
    dom.submitPreview.submitButton.classList.remove("disabled");
    g.allowSubmit = true;

    console.log(g.selectedText);
}

// postTextareaElem.addEventListener("onchange", (event) => {
//     console.log("onchange");
// });

function submitData() {
    console.log('click');
    if (!g.allowSubmit) { return; }
    console.log("click submit");
    const path = `/api/data/mark-content/${g.contentId}`;
    const type = "text";
    const payload = {
        tag: `${type}-${g.from}-${g.to}`,
        verify: g.selectedText,
    };
    console.log("sending to", path, "payload", payload);

    dom.submitPreview.submitButton.innerText = "Sending";
    dom.submitPreview.submitButton.classList.add("disabled");
    g.allowSubmit = false;

    $.post(path, payload)
        .then((result) => {
            console.log("result after submit", result);
            dom.submitPreview.submitButton.innerText = "Done";

            loadContentWithId(g.content.id);
        })
        .catch((err) => {
            console.log("error after submit", err);
            dom.submitPreview.submitButton.innerText = "Error";
        });;
}

function requestRemoveData(tagId) {
    console.log("click remove", tagId);
    const path = `/api/data/unmark-content/${g.contentId}`;
    const type = "text";
    const payload = {
        tag: tagId,
    };
    console.log("sending to", path, "payload", payload);

    $.post(path, payload)
        .then((result) => {
            console.log("result after submit", result);
            loadContentWithId(g.content.id);
        })
        .catch((err) => {
            console.log("error after submit", err);
            document.alert(`Error removing tag ${err}`);
        });;
}