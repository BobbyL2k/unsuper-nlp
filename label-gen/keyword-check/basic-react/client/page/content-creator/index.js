"use strict";
// Load Data Options
const dom = {
    dataInfo: {
        url: document.getElementById("url-input"),
        textArea: document.getElementById("textarea"),
    },
    submitPreview: {
        submitButton: document.getElementById("submit-btn"),
    }
};

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

    dom.dataInfo.url.value = "";
    dom.dataInfo.textArea.value = "";

    // Event Binding

    dom.submitPreview.submitButton.addEventListener("click", onClickSubmit);

})();

function onClickSubmit() {
    console.log("submit clicked");

    const payload = {
        text: dom.dataInfo.textArea.value,
        url: dom.dataInfo.url.value,
    }

    if (payload.url.length === 0) {
        alert("URL is empty");
        return
    }
    else if (payload.text.length === 0) {
        alert("Text is empty");
        return;
    }
    console.log("payload", payload);

    $.post("/api/data/create-content/", payload)
        .then((result) => {
            console.log("result after submit", result);
            if (result.ok === true) {
                console.log("create OK");
            }
            // loadContentWithId(g.content.id);
        })
        .catch((err) => {
            console.log("error after submit", err);
            alert(`Error removing tag ${err}`);
        });;
}

// function requestRemoveData(tagId) {
//     console.log("click remove", tagId);
//     const path = `/api/data/unmark-content/${g.contentId}`;
//     const type = "text";
//     const payload = {
//         tag: tagId,
//     };
//     console.log("sending to", path, "payload", payload);

//     $.post(path, payload)
//         .then((result) => {
//             console.log("result after submit", result);
//             loadContentWithId(g.content.id);
//         })
//         .catch((err) => {
//             console.log("error after submit", err);
//             alert(`Error removing tag ${err}`);
//         });;
// }