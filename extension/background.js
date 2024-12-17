const restrictedDomain = "facebook.com";
var activatedOrigin = [];
var isEnabled = true;

// Listen for tab updates (existing or newly created tab)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab.url) {
        // I don't know why using tab.id doesn't work well in some cases, so use origin instead
        const origin = new URL(tab.url).origin;
        if (activatedOrigin.includes(origin)) {
            return;
        }
        handleTabChange(tab, isEnabled);
    }
});

// Listen for tab activation (e.g., when the user switches tabs)
chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
        if (tab.url && tab.url.includes(restrictedDomain)) {
            handleTabChange(tab, isEnabled);
        }
    });
});

// Listen for tab closure
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
    if (activatedOrigin.length < 1) {
        return;
    }
    activatedOrigin.pop();
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action) {
        switch (message.action) {
            case "enableExtension":
                chrome.storage.local.set({ state: "enabled" });
                isEnabled = true;
                return true;
            case "disableExtension":
                chrome.storage.local.set({ state: "disabled" });
                isEnabled = false;
                return true;
        }
    }
    
    if (!message.verified) {
        console.log("Passphrase verification failed!");
        chrome.tabs.remove(sender.tab.id);
    } else {
        console.log("Passphrase verified!");
        if (activatedOrigin.length > 1) {
            activatedOrigin = [];
        }
        activatedOrigin.push(new URL(sender.tab.url).origin);
    }

    return false;
});

function handleTabChange(tab, isActivated) {
    if (isActivated === false) {
        return;
    }

    try {
        const tabUrl = new URL(tab.url);

        // Check if the tab URL matches Facebook
        if (tabUrl.hostname.includes(restrictedDomain)) {
            chrome.tabs.sendMessage(tab.id, { action: "showPrompt" });
        }
    } catch (e) {
        console.error("Error handling tab change:", e);
    }
}
