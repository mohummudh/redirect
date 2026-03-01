const storageKey = "redirectRules";
const defaultRules = [
    {
        id: createRuleId(),
        enabled: true,
        from: "https://youtube.com/",
        to: "https://www.youtube.com/playlist?list=PLe807xCohVCXf-VknnkgcDwD63o7kbcTw"
    }
];

const state = {
    rules: []
};

const rulesList = document.getElementById("rules-list");
const emptyState = document.getElementById("empty-state");
const statusNode = document.getElementById("status");
const saveButton = document.getElementById("save-rules");

document.getElementById("add-rule").addEventListener("click", () => {
    state.rules.push(createEmptyRule());
    render();
});

document.getElementById("rules-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    await saveRules();
});

rulesList.addEventListener("input", handleFieldChange);
rulesList.addEventListener("change", handleFieldChange);
rulesList.addEventListener("click", handleRuleActions);

initialize().catch((error) => {
    showStatus("Could not load your rules.", true);
    console.error(error);
});

function createRuleId() {
    if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
        return globalThis.crypto.randomUUID();
    }

    return `rule-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createEmptyRule() {
    return {
        id: createRuleId(),
        enabled: true,
        from: "",
        to: ""
    };
}

function hasScheme(value) {
    return /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(value);
}

function normalizeHttpUrl(rawUrl) {
    const trimmed = String(rawUrl || "").trim();

    if (!trimmed) {
        throw new Error("URL is required.");
    }

    const candidate = hasScheme(trimmed) ? trimmed : `https://${trimmed}`;
    const url = new URL(candidate);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
        throw new Error("Only http and https URLs are supported.");
    }

    url.hash = "";
    return url.toString();
}

function normalizeHostname(hostname) {
    return hostname.replace(/^www\./, "");
}

function createMatchKey(rawUrl) {
    const normalized = normalizeHttpUrl(rawUrl);
    const url = new URL(normalized);

    return [
        url.protocol,
        normalizeHostname(url.hostname),
        url.port,
        url.pathname,
        url.search
    ].join("|");
}

function sanitizeStoredRules(value) {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .filter((rule) => rule && typeof rule === "object")
        .map((rule) => ({
            id: typeof rule.id === "string" && rule.id ? rule.id : createRuleId(),
            enabled: rule.enabled !== false,
            from: typeof rule.from === "string" ? rule.from : "",
            to: typeof rule.to === "string" ? rule.to : ""
        }));
}

async function initialize() {
    const stored = await browser.storage.local.get(storageKey);
    let rules = sanitizeStoredRules(stored[storageKey]);

    if (!rules.length) {
        rules = defaultRules.map((rule) => ({ ...rule }));
        await browser.storage.local.set({ [storageKey]: rules });
    }

    state.rules = rules;
    render();
    showStatus("Rules load in Safari as pages open.");
}

function handleFieldChange(event) {
    const ruleCard = event.target.closest("[data-rule-id]");

    if (!ruleCard) {
        return;
    }

    const rule = state.rules.find((entry) => entry.id === ruleCard.dataset.ruleId);

    if (!rule) {
        return;
    }

    if (event.target.name === "enabled") {
        rule.enabled = event.target.checked;
    } else if (event.target.name === "from") {
        rule.from = event.target.value;
    } else if (event.target.name === "to") {
        rule.to = event.target.value;
    }

    showStatus("");
}

function handleRuleActions(event) {
    if (!event.target.matches("[data-remove-rule]")) {
        return;
    }

    const ruleCard = event.target.closest("[data-rule-id]");

    if (!ruleCard) {
        return;
    }

    state.rules = state.rules.filter((rule) => rule.id !== ruleCard.dataset.ruleId);

    if (!state.rules.length) {
        state.rules = [createEmptyRule()];
    }

    render();
    showStatus("Rule removed.");
}

function render() {
    emptyState.hidden = state.rules.length > 0;
    rulesList.innerHTML = state.rules.map((rule, index) => renderRule(rule, index)).join("");
}

function renderRule(rule, index) {
    const checked = rule.enabled ? "checked" : "";

    return `
        <article class="rule-card" data-rule-id="${escapeHtml(rule.id)}">
            <div class="rule-head">
                <div>
                    <h3 class="rule-title">Rule ${index + 1}</h3>
                </div>
                <label class="toggle">
                    <input type="checkbox" name="enabled" ${checked}>
                    Enabled
                </label>
            </div>

            <div class="fields">
                <div class="field">
                    <label>From URL</label>
                    <input
                        type="text"
                        name="from"
                        value="${escapeHtml(rule.from)}"
                        placeholder="https://youtube.com/"
                        spellcheck="false"
                        autocomplete="off"
                    >
                </div>

                <div class="field">
                    <label>Redirect To</label>
                    <input
                        type="text"
                        name="to"
                        value="${escapeHtml(rule.to)}"
                        placeholder="https://example.com/playlist"
                        spellcheck="false"
                        autocomplete="off"
                    >
                </div>
            </div>

            <div>
                <button class="danger" data-remove-rule type="button">Remove</button>
            </div>
        </article>
    `;
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

async function saveRules() {
    saveButton.disabled = true;

    try {
        const preparedRules = state.rules
            .map((rule, index) => prepareRule(rule, index))
            .filter(Boolean);

        if (!preparedRules.length) {
            throw new Error("Add at least one complete rule before saving.");
        }

        state.rules = preparedRules;
        await browser.storage.local.set({ [storageKey]: preparedRules });
        render();
        showStatus("Saved. Reload or revisit a page to apply changes.");
    } catch (error) {
        showStatus(error.message || "Could not save rules.", true);
    } finally {
        saveButton.disabled = false;
    }
}

function prepareRule(rule, index) {
    const hasSource = String(rule.from || "").trim().length > 0;
    const hasDestination = String(rule.to || "").trim().length > 0;

    if (!hasSource && !hasDestination) {
        return null;
    }

    if (!hasSource || !hasDestination) {
        throw new Error(`Rule ${index + 1} must include both a source and destination URL.`);
    }

    let sourceUrl;
    let destinationUrl;

    try {
        sourceUrl = normalizeHttpUrl(rule.from);
    } catch (error) {
        throw new Error(`Rule ${index + 1} source is invalid. ${error.message}`);
    }

    try {
        destinationUrl = normalizeHttpUrl(rule.to);
    } catch (error) {
        throw new Error(`Rule ${index + 1} destination is invalid. ${error.message}`);
    }

    if (createMatchKey(sourceUrl) === createMatchKey(destinationUrl)) {
        throw new Error(`Rule ${index + 1} redirects to itself.`);
    }

    return {
        id: rule.id || createRuleId(),
        enabled: rule.enabled !== false,
        from: sourceUrl,
        to: destinationUrl
    };
}

function showStatus(message, isError) {
    statusNode.textContent = message;
    statusNode.classList.toggle("error", Boolean(isError && message));
}
