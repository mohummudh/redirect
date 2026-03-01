function show(platform, enabled, useSettingsInsteadOfPreferences) {
    document.body.classList.add(`platform-${platform}`);

    if (useSettingsInsteadOfPreferences) {
        document.getElementsByClassName("platform-mac state-on")[0].innerText = "Redirect is on. Manage website access in the Extensions section of Safari Settings if a rule is not triggering.";
        document.getElementsByClassName("platform-mac state-off")[0].innerText = "Redirect is off. Turn it on in the Extensions section of Safari Settings before your rules can run.";
        document.getElementsByClassName("platform-mac state-unknown")[0].innerText = "Turn on Redirect in the Extensions section of Safari Settings, then allow website access for the sites you want to redirect.";
        document.getElementsByClassName("platform-mac open-preferences")[0].innerText = "Quit and Open Safari Settings…";
    }

    if (typeof enabled === "boolean") {
        document.body.classList.toggle(`state-on`, enabled);
        document.body.classList.toggle(`state-off`, !enabled);
    } else {
        document.body.classList.remove(`state-on`);
        document.body.classList.remove(`state-off`);
    }
}

function openPreferences() {
    webkit.messageHandlers.controller.postMessage("open-preferences");
}

document.querySelector("button.open-preferences").addEventListener("click", openPreferences);
