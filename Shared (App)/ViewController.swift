import WebKit

import Cocoa
import SafariServices
typealias PlatformViewController = NSViewController

private let fallbackExtensionBundleIdentifier = "com.example.redirect.extension"

private func resolveExtensionBundleIdentifier() -> String {
    guard
        let builtInPlugInsURL = Bundle.main.builtInPlugInsURL,
        let plugInURLs = try? FileManager.default.contentsOfDirectory(
            at: builtInPlugInsURL,
            includingPropertiesForKeys: nil,
            options: [.skipsHiddenFiles]
        )
    else {
        return fallbackExtensionBundleIdentifier
    }

    for plugInURL in plugInURLs where plugInURL.pathExtension == "appex" {
        if let bundleIdentifier = Bundle(url: plugInURL)?.bundleIdentifier {
            return bundleIdentifier
        }
    }

    return fallbackExtensionBundleIdentifier
}

let extensionBundleIdentifier = resolveExtensionBundleIdentifier()

class ViewController: PlatformViewController, WKNavigationDelegate, WKScriptMessageHandler {

    @IBOutlet var webView: WKWebView!

    override func viewDidLoad() {
        super.viewDidLoad()

        self.webView.navigationDelegate = self

        self.webView.configuration.userContentController.add(self, name: "controller")

        self.webView.loadFileURL(Bundle.main.url(forResource: "Main", withExtension: "html")!, allowingReadAccessTo: Bundle.main.resourceURL!)
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        webView.evaluateJavaScript("show('mac')")

        SFSafariExtensionManager.getStateOfSafariExtension(withIdentifier: extensionBundleIdentifier) { (state, error) in
            guard let state = state, error == nil else {
                // Insert code to inform the user that something went wrong.
                return
            }

            DispatchQueue.main.async {
                if #available(macOS 13, *) {
                    webView.evaluateJavaScript("show('mac', \(state.isEnabled), true)")
                } else {
                    webView.evaluateJavaScript("show('mac', \(state.isEnabled), false)")
                }
            }
        }
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        if (message.body as! String != "open-preferences") {
            return
        }

        SFSafariApplication.showPreferencesForExtension(withIdentifier: extensionBundleIdentifier) { error in
            guard error == nil else {
                // Insert code to inform the user that something went wrong.
                return
            }

            DispatchQueue.main.async {
                NSApp.terminate(self)
            }
        }
    }
}
