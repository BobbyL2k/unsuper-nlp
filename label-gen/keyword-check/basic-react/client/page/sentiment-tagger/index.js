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
        contentTagStatus: document.getElementById("content-tag-status-label"),
        sentimentTagStatus: document.getElementById("sentiment-tag-status-label"),
        previewTextBox: document.getElementById("text-preview"),
    },
    textbox: document.getElementById("textbox"),
    submitPreview: {
        selectedText: document.getElementById("selected-text"),
        selectedSize: document.getElementById("selected-size"),
        nBtn: document.getElementById("nothing-btn"),
        mpBtn: document.getElementById("mp-btn"),
        upBtn: document.getElementById("up-btn"),
        mpnBtn: document.getElementById("mpn-btn"),
        upnBtn: document.getElementById("upn-btn"),
        mnBtn: document.getElementById("mn-btn"),
        unBtn: document.getElementById("un-btn"),
        mfBtn: document.getElementById("mf-btn"),
        ufBtn: document.getElementById("uf-btn"),
        mqBtn: document.getElementById("mq-btn"),
        uqBtn: document.getElementById("uq-btn"),
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
    data: {
        string: null,
        entries: null,
    }
}

function renderSentmentPreview() {

    console.log("g.data.entries", g.data.entries);
    const entryTypes = Object.keys(g.data.entries);
    const entryTypeName = {
        pos: "Positive",
        neg: "Negative",
        feedback: "Feedback",
        question: "Question",
    }
    if (entryTypes.length > 0) {
        if (entryTypes[0] === "none") {
            dom.dataInfo.sentimentTagStatus.textContent = 'Labeled, NO tags (0 tags)';
        } else {
            const total = 0;
            let textContent = "Labeled";
            for(const entryType of entryTypes){
                textContent += `, ${g.data.entries[entryType].length} ${entryTypeName[entryType]} `;
                textContent += g.data.entries[entryType].length > 1 ? "tags" : "tag";
            }
            dom.dataInfo.sentimentTagStatus.textContent = textContent;
        }
    } else {
        dom.dataInfo.sentimentTagStatus.textContent = 'Unlabeled';
    }

    // Clear old children
    while (dom.textbox.firstChild) {
        dom.textbox.removeChild(dom.textbox.firstChild);
    }

    const separators = [];
    separators.push(g.data.string.length);
    
    for (const entryType of Object.keys(g.data.entries)) {
        if(entryType === "none"){
            continue;
        }
        const entries = g.data.entries[entryType];
        for (const entry of entries) {
            console.assert(entry.start < g.data.string.length);
            console.assert(entry.end <= g.data.string.length);
            separators.push(entry.start);
            separators.push(entry.end);
        }
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
        for (const entryType of Object.keys(g.data.entries)) {
            if(entryType === "none") {
                continue;
            }
            const entry = g.data.entries[entryType];
            if (inEntries(lastIndex, separator, g.data.entries[entryType])) {
                elem.classList.add(entryType);
        }
        }
        elem.dataset.offset = lastIndex;
        elem.innerHTML = g.data.string.slice(lastIndex, separator);
        lastIndex = separator;
        dom.textbox.appendChild(elem);
    }
}

function renderSubmissionPreview() {
    if (g.data.string !== null) {
        if (g.newEntry !== null) {
            const selectedText = g.data.string.slice(g.newEntry.start, g.newEntry.end)
            dom.submitPreview.selectedText.innerText = `"${selectedText}"`;
            dom.submitPreview.selectedSize.innerText = selectedText.length;
            dom.submitPreview.nBtn.children[1].innerText = "Unselect";
            dom.submitPreview.nBtn.classList.remove("disabled");
            dom.submitPreview.mpBtn.classList.remove("disabled");
            dom.submitPreview.upBtn.classList.remove("disabled");
            dom.submitPreview.mpnBtn.classList.remove("disabled");
            dom.submitPreview.upnBtn.classList.remove("disabled");
            dom.submitPreview.mnBtn.classList.remove("disabled");
            dom.submitPreview.unBtn.classList.remove("disabled");
            dom.submitPreview.mfBtn.classList.remove("disabled");
            dom.submitPreview.ufBtn.classList.remove("disabled");
            dom.submitPreview.mqBtn.classList.remove("disabled");
            dom.submitPreview.uqBtn.classList.remove("disabled");

        } else {
            dom.submitPreview.selectedText.innerText = "No text selected";
            dom.submitPreview.selectedSize.innerText = "No text selected";

            const entryTypes = Object.keys(g.data.entries);
            if (entryTypes.length === 1 && entryTypes[0] === "none"){
                dom.submitPreview.nBtn.children[1].innerText = "Unmark as Nothing-to-Tag";
                dom.submitPreview.nBtn.classList.remove("disabled");
            }
            if (entryTypes.length !== 0) { // There exist some entires
                dom.submitPreview.nBtn.children[0].innerText = "Remove all tags to mark as nothing";
                dom.submitPreview.nBtn.classList.add("disabled");
            } else {
                dom.submitPreview.nBtn.children[1].innerText = "Mark as Nothing-to-Tag";
                dom.submitPreview.nBtn.classList.remove("disabled");
            }
            dom.submitPreview.mpBtn.children[0].innerText = "No text selected";
            dom.submitPreview.mpBtn.classList.add("disabled");
            dom.submitPreview.upBtn.children[0].innerText = "No text selected";
            dom.submitPreview.upBtn.classList.add("disabled");
            dom.submitPreview.mpnBtn.children[0].innerText = "No text selected";
            dom.submitPreview.mpnBtn.classList.add("disabled");
            dom.submitPreview.upnBtn.children[0].innerText = "No text selected";
            dom.submitPreview.upnBtn.classList.add("disabled");
            dom.submitPreview.mnBtn.children[0].innerText = "No text selected";
            dom.submitPreview.mnBtn.classList.add("disabled");
            dom.submitPreview.unBtn.children[0].innerText = "No text selected";
            dom.submitPreview.unBtn.classList.add("disabled");
            dom.submitPreview.mfBtn.children[0].innerText = "No text selected";
            dom.submitPreview.mfBtn.classList.add("disabled");
            dom.submitPreview.ufBtn.children[0].innerText = "No text selected";
            dom.submitPreview.ufBtn.classList.add("disabled");
            dom.submitPreview.mqBtn.children[0].innerText = "No text selected";
            dom.submitPreview.mqBtn.classList.add("disabled");
            dom.submitPreview.uqBtn.children[0].innerText = "No text selected";
            dom.submitPreview.uqBtn.classList.add("disabled");
        }
    } else {
        dom.submitPreview.selectedText.innerText = "No text loaded";
        dom.submitPreview.selectedSize.innerText = "No text loaded";

        dom.submitPreview.nBtn.children[0].innerText = "No text loaded";
        dom.submitPreview.nBtn.classList.add("disabled");
        dom.submitPreview.mpBtn.children[0].innerText = "No text loaded";
        dom.submitPreview.mpBtn.classList.add("disabled");
        dom.submitPreview.upBtn.children[0].innerText = "No text loaded";
        dom.submitPreview.upBtn.classList.add("disabled");
        dom.submitPreview.mpnBtn.children[0].innerText = "No text loaded";
        dom.submitPreview.mpnBtn.classList.add("disabled");
        dom.submitPreview.upnBtn.children[0].innerText = "No text loaded";
        dom.submitPreview.upnBtn.classList.add("disabled");
        dom.submitPreview.mnBtn.children[0].innerText = "No text loaded";
        dom.submitPreview.mnBtn.classList.add("disabled");
        dom.submitPreview.unBtn.children[0].innerText = "No text loaded";
        dom.submitPreview.unBtn.classList.add("disabled");
        dom.submitPreview.mfBtn.children[0].innerText = "No text loaded";
        dom.submitPreview.mfBtn.classList.add("disabled");
        dom.submitPreview.ufBtn.children[0].innerText = "No text loaded";
        dom.submitPreview.ufBtn.classList.add("disabled");
        dom.submitPreview.mqBtn.children[0].innerText = "No text loaded";
        dom.submitPreview.mqBtn.classList.add("disabled");
        dom.submitPreview.uqBtn.children[0].innerText = "No text loaded";
        dom.submitPreview.uqBtn.classList.add("disabled");
    }
}

function renderLoadButtons() {
    if (g.allowLoading) {
        domType.loadButton.map(btn => {
            btn.elem.classList.remove("disabled")
        });
    } else {
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
    handleContentPromise($.getJSON(`/api/tags/find/id/${id}`));
}

const load = {
    byId(){
        if (!g.allowLoading) return;
        disableLoading();
        console.log("load by ID")
        loadContentWithId(dom.loadOptions.contentId.input.value);
    },
    byPantipTopic() {
        if (!g.allowLoading) return;
        disableLoading();
        console.log("load by Pantip Topic");
        loadContentWithId(`pantip/${dom.loadOptions.pantipId.input.value}/post`);
    },
    first() {
        if (!g.allowLoading) return;
        disableLoading();
        console.log("load first");
        handleContentPromise($.getJSON(`/api/tags/find/first`));
    },
    unlabeled() {
        if (!g.allowLoading) return;
        disableLoading();
        console.log("load Unlabeled");
        handleContentPromise($.getJSON(`/api/tags/find/unlabeled`));
    },
    prev() {
        if (!g.allowLoading || g.contentId === undefined) return;
        disableLoading();
        console.log("load prev");
        handleContentPromise($.getJSON(`/api/tags/find/prev-id/${g.contentId}`));
    },
    next() {
        if (!g.allowLoading || g.contentId === undefined) return;
        disableLoading();
        console.log("load next");
        handleContentPromise($.getJSON(`/api/tags/find/next-id/${g.contentId}`));
    }
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
                    dom.dataInfo.contentTagStatus.textContent = 'Labeled, NO tags (0 tags)';
                } else {
                    dom.dataInfo.contentTagStatus.textContent = g.tags.length === 1 ? `Labeled, 1 tag` : `Labeled, ${g.tags.length} tags`;
                }
            } else {
                dom.dataInfo.contentTagStatus.textContent = 'Unlabeled';
            }

            g.data.string = g.content.text;
            g.data.entries = g.content.tags;
            if(g.data.entries === undefined){
                g.data.entries = {};
            }
            renderSentmentPreview();
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

    dom.loadOptions.contentId.loadButton.elem.addEventListener("click", load.byId);
    dom.loadOptions.pantipId.loadButton.elem.addEventListener("click", load.byPantipTopic);
    dom.loadOptions.type.first.elem.addEventListener("click", load.first);
    dom.loadOptions.type.unlabeled.elem.addEventListener("click", load.unlabeled);
    dom.loadOptions.type.prev.elem.addEventListener("click", load.prev);
    dom.loadOptions.type.next.elem.addEventListener("click", load.next);
    
    dom.submitPreview.nBtn.addEventListener("click", () => {
        if (g.data.string === null) {
            return;
        }
        if (g.newEntry !== null) {
            g.newEntry = null;
            renderSubmissionPreview();
            return;
        }
        const entryTypes = Object.keys(g.data.entries);
        if (entryTypes.length === 1 && entryTypes[0] === "none"){
            const path = `/api/tags/mark-empty/id/${g.contentId}`;
            handleContentPromise($.post(path));
        }
        if (entryTypes.length !== 0) { // There exist some entires
            return
        } else {
            const path = `/api/tags/mark-empty/id/${g.contentId}`;
            handleContentPromise($.post(path));
        }
    });

    function createSubmitListener(type, value) {
        return () => {
            console.log("submitting", type, value, g.newEntry);
            const path = `/api/tags/mark/id/${g.contentId}`;
            const payload = { value, type, newEntry: g.newEntry };
            handleContentPromise($.post(path, payload));
        };
    }

    const markPositive = createSubmitListener("pos", true);
    const unmarkPositive = createSubmitListener("pos", false);
    const markNegative = createSubmitListener("neg", true);
    const unmarkNegative = createSubmitListener("neg", false);

    dom.submitPreview.mpBtn.addEventListener("click", markPositive);
    dom.submitPreview.upBtn.addEventListener("click", unmarkPositive);
    dom.submitPreview.mnBtn.addEventListener("click", markNegative);
    dom.submitPreview.unBtn.addEventListener("click", unmarkNegative);
    dom.submitPreview.mpnBtn.addEventListener("click", () => {
        const value = true;
        let type = "pos";
        console.log("submitting", type, value, g.newEntry);
        const path = `/api/tags/mark/id/${g.contentId}`;
        const payload = { value, type, newEntry: g.newEntry };
        $.post(path, payload).then(()=>{
            type = "neg";
            console.log("submitting", type, value, g.newEntry);
            const path = `/api/tags/mark/id/${g.contentId}`;
            const payload = { value, type, newEntry: g.newEntry };
            handleContentPromise($.post(path, payload));
        });
    });
    dom.submitPreview.upnBtn.addEventListener("click", () => {
        const value = false;
        let type = "pos";
        console.log("submitting", type, value, g.newEntry);
        const path = `/api/tags/mark/id/${g.contentId}`;
        const payload = { value, type, newEntry: g.newEntry };
        $.post(path, payload).then(()=>{
            type = "neg";
            console.log("submitting", type, value, g.newEntry);
            const path = `/api/tags/mark/id/${g.contentId}`;
            const payload = { value, type, newEntry: g.newEntry };
            handleContentPromise($.post(path, payload));
        });
    });
    dom.submitPreview.mfBtn.addEventListener("click", createSubmitListener("feedback", true));
    dom.submitPreview.ufBtn.addEventListener("click", createSubmitListener("feedback", false));
    dom.submitPreview.mqBtn.addEventListener("click", createSubmitListener("question", true));
    dom.submitPreview.uqBtn.addEventListener("click", createSubmitListener("question", false));

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
        if(g.newEntry.start === g.newEntry.end || isNaN(g.newEntry.start) || isNaN(g.newEntry.end)){
            g.newEntry = null;
        }
        console.log("newEntry", g.newEntry);
        renderSubmissionPreview();
    });

    
    window.addEventListener("keypress", (e) => {
        console.log("Keypress event on key", e.key)
        if (e.key === "u") { load.unlabeled(); }
        if (e.key === "p" || e.key === "ArrowLeft") { load.prev(); }
        if (e.key === "n" || e.key === "ArrowRight") { load.next(); }
        // if (e.key === "Enter") { submitData(); }
    })

    renderSubmissionPreview();

}