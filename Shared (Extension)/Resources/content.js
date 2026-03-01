const storageKey = "redirectRules";

function hasScheme(value) {
    return /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(value);
}

function normalizeHostname(hostname) {
    return hostname.replace(/^www\./, "");
}

function normalizeHttpUrl(rawUrl) {
    const trimmed = String(rawUrl || "").trim();

    if (!trimmed) {
        return null;
    }

    const candidate = hasScheme(trimmed) ? trimmed : `https://${trimmed}`;
    let url;

    try {
        url = new URL(candidate);
    } catch (error) {
        return null;
    }

    if (url.protocol !== "http:" && url.protocol !== "https:") {
        return null;
    }

    url.hash = "";
    return url.toString();
}

function createMatchKey(rawUrl) {
    const normalized = normalizeHttpUrl(rawUrl);

    if (!normalized) {
        return null;
    }

    const url = new URL(normalized);
    return [
        url.protocol,
        normalizeHostname(url.hostname),
        url.port,
        url.pathname,
        url.search
    ].join("|");
}

function sanitizeRules(value) {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .filter((rule) => rule && typeof rule === "object")
        .map((rule) => ({
            enabled: rule.enabled !== false,
            from: normalizeHttpUrl(rule.from),
            to: normalizeHttpUrl(rule.to)
        }))
        .filter((rule) => rule.from && rule.to);
}

async function redirectIfNeeded() {
    if (!browser.storage || !browser.storage.local) {
        return;
    }

    const currentMatchKey = createMatchKey(window.location.href);

    if (!currentMatchKey) {
        return;
    }

    const stored = await browser.storage.local.get(storageKey);
    const rules = sanitizeRules(stored[storageKey]);

    for (const rule of rules) {
        if (!rule.enabled) {
            continue;
        }

        if (createMatchKey(rule.from) !== currentMatchKey) {
            continue;
        }

        if (createMatchKey(rule.to) === currentMatchKey) {
            return;
        }

        window.location.replace(rule.to);
        return;
    }
}

redirectIfNeeded().catch(() => {
    // Ignore storage access and URL parsing failures; the page should continue normally.
});
