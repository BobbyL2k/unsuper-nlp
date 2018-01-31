"use strict";
// User input
const loadButton = document.getElementById("load-btn");
const contentIdInput = document.getElementById("contentId-input");
const postPreviewElem = document.getElementById("post-preview");
const postTextareaElem = document.getElementById("post-textarea");
const submitButton = document.getElementById("submit-btn");
// Output Preview
const selectedTextElem = document.getElementById("selected-text");
const selectedSizeElem = document.getElementById("selected-size");

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

document.getElementById("user-logout-btn").textContent = `Logout of "${g.userId}"`
postTextareaElem.value = "";

clearSubmitData();

function clearSubmitData(params) {
    selectedTextElem.value = "-";
    selectedSizeElem.value = "-";
    submitButton.classList.add("disabled");
    g.allowSubmit = false;
}

function tagStrToObj(str) {
    const [type, from, to] = str.split('-');
    if (type !== "text") {
        throw Error("Invalid Tag", str);
    }
    return { from: parseInt(from), to: parseInt(to) };
}

function overlap(tagObjA, tagObjB) {
    return (
        tagObjA.from <= tagObjB.from && tagObjB.from < tagObjA.to ||
        tagObjA.from < tagObjB.to && tagObjB.to <= tagObjA.to ||
        tagObjB.from <= tagObjA.from && tagObjA.from < tagObjB.to ||
        tagObjB.from < tagObjA.to && tagObjA.to <= tagObjB.to
    );
}

const loadContent = () => {
    if (!g.allowLoading) return;

    g.contentId = contentIdInput.value;
    console.log("start loading", g.contentId);
    g.allowLoading = false;
    loadButton.classList.add("disabled");
    loadButton.textContent = "Loading";

    $.getJSON(`/api/data/content-pantip-post/${g.contentId}`)
        .then((loadedContent) => {
            g.content = loadedContent;
            console.log("g.content", g.content);
            document.getElementById("title").textContent = g.content.info.title;
            document.getElementById("time").textContent = g.content.info.time;
            document.getElementById("source").textContent = g.content.info.source;
            postTextareaElem.value = g.content.text;

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
                previewHtmlStr += "</span>"
                latestIndex = tag.to;
            }
            previewHtmlStr += g.content.text.slice(latestIndex) + "</div>";
            postPreviewElem.innerHTML = previewHtmlStr;

            g.allowLoading = true;
            loadButton.classList.remove("disabled");
            loadButton.textContent = "Done";
        })
        .catch((err) => {
            loadButton.textContent = "Error";
            console.log("Loading Error", err);
            alert(err.responseText);
        });

    clearSubmitData();
}

loadButton.addEventListener("click", loadContent);

postTextareaElem.addEventListener("mouseup", (event) => {
    if (postTextareaElem.selectionStart === postTextareaElem.selectionEnd) {
        return;
    }
    console.log("Selection Change", event);
    g.from = postTextareaElem.selectionStart;
    g.to = postTextareaElem.selectionEnd;
    g.selectedText = postTextareaElem.value.slice(g.from, g.to);

    selectedTextElem.value = `"${g.selectedText}"`;
    selectedSizeElem.value = g.selectedText.length;

    const newTag = { from: g.from, to: g.to };
    for (const tag of g.tags) {
        if (overlap(newTag, tag)) {
            submitButton.innerText = "Tag Overlap";
            submitButton.classList.add("disabled");
            g.allowSubmit = false;
            return;
        }
    }

    submitButton.innerText = "Submit";
    submitButton.classList.remove("disabled");
    g.allowSubmit = true;

    console.log(g.selectedText);
});

postTextareaElem.addEventListener("onchange", (event) => {
    console.log("onchange");
});

submitButton.addEventListener("click", (event) => {
    if (!g.allowSubmit) { return; }
    console.log("click submit");
    const path = `/api/data/mark-content/${g.contentId}/post`;
    const type = "text";
    const payload = {
        tag: `${type}-${g.from}-${g.to}`,
        verify: g.selectedText,
    };
    console.log("sending to", path, "payload", payload);

    submitButton.innerText = "Sending";
    submitButton.classList.add("disabled");
    g.allowSubmit = false;

    $.post(path, payload)
        .then((result) => {
            console.log("result after submit", result);
            submitButton.innerText = "Done";

            loadContent();
        })
        .catch((err) => {
            console.log("error after submit", err);
            submitButton.innerText = "Error";
        });;
})