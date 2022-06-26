import packageJson from "../package.json";
import { ManifestType } from "@src/manifest-type";

const manifest: ManifestType = {
  manifest_version: 3,
  name: packageJson.name.replace("-", " "),
  version: packageJson.version,
  description: packageJson.description,
  options_page: "src/pages/options/index.html",
  background: {
    service_worker: "src/pages/background/index.js",
    type: "module",
  },
  action: {
    default_popup: "src/pages/popup/index.html",
  },
  icons: {
    "16": "/icon-16.png",
    "48": "/icon-48.png",
    "128": "/icon-128.png",
  },
  content_scripts: [
    {
      matches: ["http://*/*", "https://*/*", "<all_urls>"],
      js: ["src/pages/content/index.js"],
      css: ["contentStyle.css"],
    },
  ],
  web_accessible_resources: [
    {
      resources: [
        "contentStyle.css",
      ],
      matches: [],
    },
  ],
  permissions: ["storage", "tabs", "scripting", "downloads"],
};

export default manifest;
