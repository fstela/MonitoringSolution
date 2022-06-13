import packageJson from "../package.json";
import { ManifestType } from "@src/manifest-type";

const manifest: ManifestType = {
  manifest_version: 3,
  name: packageJson.name.replace("-", " "),
  version: packageJson.version,
  description: packageJson.description,
  options_page: "src/pages/options/index.html",
  background: { service_worker: "src/pages/background/index.js" },
  action: {
    default_popup: "src/pages/popup/index.html"
  },
  icons: {
    "128": "./icon-128.png",
    "48": "./icon-48.png",
    "38": "./icon-38.png",
    "19": "./icon-19.png",
    "16": "./icon-16.png"
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
      resources: ["contentStyle.css", "icon-128.png", "icon-38.png", "icon-48.png", "icon-19.png", "icon-16.png"],
      matches: [],
    },
  ],
  permissions: ['storage', 'tabs', 'scripting']
};

export default manifest;
