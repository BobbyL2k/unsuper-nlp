"use strict";

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
        contentTagStatusLabel: document.getElementById("content-tag-status-label"),
        sentimentTagStatusLabel: document.getElementById("sentiment-tag-status-label"),
        previewTextBox: document.getElementById("text-preview"),
    },
    textbox: document.getElementById("textbox"),
    submitPreview: {
        selectedText: document.getElementById("selected-text"),
        selectedSize: document.getElementById("selected-size"),
        nBtn: document.getElementById("nothing-btn"),
        mpBtn: document.getElementById("mp-btn"),
        upBtn: document.getElementById("up-btn"),
        mnBtn: document.getElementById("mn-btn"),
        unBtn: document.getElementById("un-btn"),
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
    selectedText: null,
    newEntry: null,
    allowLoading: true,
    data:{
        string: null,
        posEntries: [],
        negEntries: []
    }
}

function renderTextbox() {
    // Clear old children
    while (dom.textbox.firstChild) {
        dom.textbox.removeChild(dom.textbox.firstChild);
    }

    const separators = [];
    separators.push(g.data.string.length);
    for (const entry of g.data.posEntries) {
        console.assert(entry.start < g.data.string.length);
        console.assert(entry.end <= g.data.string.length);
        separators.push(entry.start);
        separators.push(entry.end);
    }
    for (const entry of g.data.negEntries) {
        console.assert(entry.start < g.data.string.length);
        console.assert(entry.end <= g.data.string.length);
        separators.push(entry.start);
        separators.push(entry.end);
    }
    separators.sort((a, b) => a - b);
    console.log(separators);

    function inEntries(start, end, entries) {
        for (const entry of entries) {
            if (entry.start <= start && start < entry.end && entry.start < end && end <= entry.end) {
                return true;
            }
        }
    }

    let lastIndex = 0;
    for (const separator of separators) {
        if (lastIndex === separator) {
            continue;
        }
        const elem = document.createElement("span");
        if (inEntries(lastIndex, separator, g.data.posEntries)) {
            elem.classList.add("pos");
        }
        if (inEntries(lastIndex, separator, g.data.negEntries)) {
            elem.classList.add("neg");
        }
        elem.dataset.offset = lastIndex;
        elem.innerText = g.data.string.slice(lastIndex, separator);
        lastIndex = separator;
        dom.textbox.appendChild(elem);
    }
}

function renderSubmissionPreview() {
    if (g.data.string !== null) {
        if (g.newEntry !== null) {
            const selectedText = g.data.string.slice(g.newEntry.start, g.newEntry.end)
            dom.submitPreview.selectedText.value = `"${selectedText}"`;
            dom.submitPreview.selectedSize.value = selectedText.length;
            dom.submitPreview.nBtn.children[1].innerText = "Unselect";
            dom.submitPreview.nBtn.classList.remove("disabled");
            dom.submitPreview.mpBtn.classList.remove("disabled");
            dom.submitPreview.upBtn.classList.remove("disabled");
            dom.submitPreview.mnBtn.classList.remove("disabled");
            dom.submitPreview.unBtn.classList.remove("disabled");

        } else {
            dom.submitPreview.selectedText.value = "No text selected";
            dom.submitPreview.selectedSize.value = "No text selected";

            if (g.data.posEntries.length !== 0 && g.data.negEntries.length !== 0) {
                dom.submitPreview.nBtn.children[0].innerText = "Remove all tags to mark as nothing";
                dom.submitPreview.nBtn.classList.add("disabled");
            }else{
                dom.submitPreview.nBtn.children[1].innerText = "Mark as Nothing-to-Tag";
                dom.submitPreview.nBtn.classList.remove("disabled");
            }
            dom.submitPreview.mpBtn.children[0].innerText = "No text selected";
            dom.submitPreview.mpBtn.classList.add("disabled");
            dom.submitPreview.upBtn.children[0].innerText = "No text selected";
            dom.submitPreview.upBtn.classList.add("disabled");
            dom.submitPreview.mnBtn.children[0].innerText = "No text selected";
            dom.submitPreview.mnBtn.classList.add("disabled");
            dom.submitPreview.unBtn.children[0].innerText = "No text selected";
            dom.submitPreview.unBtn.classList.add("disabled");
        }
    } else {
        dom.submitPreview.selectedText.value = "No text loaded";
        dom.submitPreview.selectedSize.value = "No text loaded";

        dom.submitPreview.nBtn.children[0].innerText = "No text loaded";
        dom.submitPreview.nBtn.classList.add("disabled");
        dom.submitPreview.mpBtn.children[0].innerText = "No text loaded";
        dom.submitPreview.mpBtn.classList.add("disabled");
        dom.submitPreview.upBtn.children[0].innerText = "No text loaded";
        dom.submitPreview.upBtn.classList.add("disabled");
        dom.submitPreview.mnBtn.children[0].innerText = "No text loaded";
        dom.submitPreview.mnBtn.classList.add("disabled");
        dom.submitPreview.unBtn.children[0].innerText = "No text loaded";
        dom.submitPreview.unBtn.classList.add("disabled");
    }
}

function renderLoadButtons() {
    if (g.allowLoading) {
        domType.loadButton.map(btn => {
            btn.elem.classList.remove("disabled")
        });
    }else{
        domType.loadButton.map(btn => {
            btn.elem.classList.add("disabled")
        });
    }
}

function addEntry(entries, newEntry) {
    if (newEntry.start === newEntry.end) {
        return;
    }
    const stack = [];
    while (entries.length > 0) {
        stack.push(entries.pop());
    }
    function canMerge(entryA, entryB) {
        if (entryA.start <= entryB.start && entryB.start <= entryA.end) {
            return true;
        }
        if (entryB.start <= entryA.start && entryA.start <= entryB.end) {
            return true;
        }
        return false;
    }
    function merge(entryA, entryB) {
        return {
            start: Math.min(entryA.start, entryB.start),
            end: Math.max(entryA.end, entryB.end),
        };
    }

    while (stack.length !== 0) {
        const top = stack.pop();
        if (canMerge(top, newEntry)) {
            newEntry = merge(top, newEntry);
            // reset stack
            while (entries.length > 0) {
                stack.push(entries.pop());
            }
        } else {
            entries.push(top);
        }
    }
    entries.push(newEntry);
    entries.sort((a, b) => a.start - b.start);
}

function removeEntry(entries, newEntry) {
    if (newEntry.start === newEntry.end) {
        return;
    }
    const stack = [];
    while (entries.length > 0) {
        stack.push(entries.pop());
    }
    function isIntersecting(entryA, entryB) {
        if (entryA.start <= entryB.start && entryB.start < entryA.end) {
            return true;
        }
        if (entryB.start <= entryA.start && entryA.start < entryB.end) {
            return true;
        }
        return false;
    }
    function subtract(entryA, entryB) {
        const result = [];
        if (entryA.start < entryB.start) {
            result.push({
                start: entryA.start,
                end: entryB.start,
            });
        }
        if (entryB.end < entryA.end) {
            result.push({
                start: entryB.end,
                end: entryA.end,
            });
        }
        return result;
    }

    while (stack.length !== 0) {
        const top = stack.pop();
        if (isIntersecting(top, newEntry)) {
            const resultingTopEntries = subtract(top, newEntry);
            while (resultingTopEntries.length > 0) {
                entries.push(resultingTopEntries.pop());
            }
        } else {
            entries.push(top);
        }
    }
    entries.sort((a, b) => a.start - b.start);
}

function disableLoading() {
    console.log("start loading");
    g.allowLoading = false;
    renderLoadButtons();
}

function loadContentWithId(id) {
    handleContentPromise($.getJSON(`/api/data/content/${id}`));
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
            if (g.content.info.source !== undefined) {
                document.getElementById("source").textContent = g.content.info.source;
            } else {
                document.getElementById("source").textContent = g.content.info.url
            }
            // dom.dataInfo.taggingTextBox.value = g.content.text;
            // // dom.dataInfo.taggingTextBox.style.height = dom.dataInfo.taggingTextBox.scrollHeight + 'px';

            if (g.content.tag === undefined) {
                g.content.tag = {};
            }

            function tagStrToObj(str) {
                const [type, from, to] = str.split('-');
                if (type !== "text") {
                    throw Error("Invalid Tag", str);
                }
                return { from: parseInt(from), to: parseInt(to), str };
            }
            g.tags = Object.keys(g.content.tag).map(tagStrToObj);
            // g.tags.sort((a, b) => a.from - b.from);
            // console.log("gtags", g.tags);
            // for (const tagA of g.tags) {
            //     // console.log("tagA", tagA);
            //     for (const tagB of g.tags) {
            //         // console.log("tagB", tagB, tagA !== tagB);
            //         if (tagA !== tagB && overlap(tagA, tagB)) {
            //             throw Error("Overlaping Tags");
            //         }
            //     }
            // }

            if (g.tags.length > 0) {
                console.log
                if (g.tags[0].str === "text-none") {
                    dom.dataInfo.contentTagStatusLabel.textContent = 'Labeled, NO tags (0 tags)';
                } else {
                    dom.dataInfo.contentTagStatusLabel.textContent = g.tags.length === 1 ? `Labeled, 1 tag` : `Labeled, ${g.tags.length} tags`;
                }
            } else {
                dom.dataInfo.contentTagStatusLabel.textContent = 'Unlabeled';
            }

            g.data.string = g.content.text;
            renderTextbox();
            renderSubmissionPreview();
            // checkShouldSubmitAsNothing();

            // let previewHtmlStr = "<div>";
            // let latestIndex = 0;
            // for (const tag of g.tags) {
            //     previewHtmlStr += g.content.text.slice(latestIndex, tag.from);
            //     previewHtmlStr += "<span class=\"badge badge-primary\">"
            //     previewHtmlStr += g.content.text.slice(tag.from, tag.to);
            //     previewHtmlStr += " <i class=\"fa fa-times-circle\" onclick=\"requestRemoveData('" + tag.str + "')\"></i>"
            //     previewHtmlStr += "</span>"
            //     latestIndex = tag.to;
            // }
            // previewHtmlStr += g.content.text.slice(latestIndex) + "</div>";
            // dom.dataInfo.previewTextBox.innerHTML = previewHtmlStr;

            (function enableLoading(params) {
                g.allowLoading = true;
                renderLoadButtons();
            })();
        })
        .catch((err) => {
            domType.loadButton.map(btn => {
                btn.elem.textContent = "Error";
            });
            console.log("Loading Error", err);
            alert(err.responseText);
        });


    g.newEntry = null;
    renderSubmissionPreview();
}

{
    console.log(dom);

    dom.loadOptions.contentId.loadButton.elem.addEventListener("click", () => {
        if (!g.allowLoading) return;
        disableLoading();
        loadContentWithId(dom.loadOptions.contentId.input.value);
    });
    dom.loadOptions.pantipId.loadButton.elem.addEventListener("click", () => {
        if (!g.allowLoading) return;
        disableLoading();
        console.log("pantip");
        handleContentPromise($.getJSON(`/api/data/content/pantip/${dom.loadOptions.pantipId.input.value}/post`));
    });
    
    dom.submitPreview.nBtn.addEventListener("click", ()=>{
        if(g.data.string === null){
            return;
        }
        if(g.newEntry !== null){
            g.newEntry = null;
            renderSubmissionPreview();
            return;
        }
        if(g.data.posEntries.length !== 0 && g.data.negEntries.length !== 0){
            return;
        }
    });

    function createSubmitListener(type, value) {
        return () => {
            console.log("clicking", type, value);
            const entries = type === "pos" ? g.data.posEntries : g.data.negEntries;
            if (value === true) {
                addEntry(entries, g.newEntry);
                renderTextbox();
            } else {
                removeEntry(entries, g.newEntry);
                renderTextbox();
            }
        };
    }
    dom.submitPreview.mpBtn.addEventListener("click", createSubmitListener("pos", true));
    dom.submitPreview.upBtn.addEventListener("click", createSubmitListener("pos", false));
    dom.submitPreview.mnBtn.addEventListener("click", createSubmitListener("neg", true));
    dom.submitPreview.unBtn.addEventListener("click", createSubmitListener("neg", false));

    dom.textbox.addEventListener("mouseup", (event) => {
        console.log(event);
        const sel = window.getSelection();
        console.log(sel);
        const range0 = parseInt(sel.anchorNode.parentElement.dataset.offset) + sel.anchorOffset;
        const range1 = parseInt(sel.focusNode.parentElement.dataset.offset) + sel.focusOffset;
        g.newEntry = {
            start: Math.min(range0, range1),
            end: Math.max(range0, range1),
        };
        renderSubmissionPreview();
    });

    renderSubmissionPreview();

}