# Grafana screenshot panel plugin 

## Take screenshots of other panels in dashboard in PNG/JPEG/SVG formats
### Add optional timestamps and text notes and accumulate them in panel or save to file

This plugin relies heavily on [dom-to-image library](https://github.com/tsayen/dom-to-image)
(see details on browser support there)
and also uses
[save-as](https://github.com/noderaider/save-as) - provides ES6 version of FileSaver.js window.saveAs functionality.

Initial plugin skeleton is based on
[grafana plugin template](https://github.com/CorpGlory/grafana-plugin-template-webpack)
for developing plugins for Grafana with Webpack.


## Basic usage

* This plugin does not use server-side rendering - everything is done in clients' browser
* Add a single instance of this panel to dashboard
* Use **_Ctrl-RightClick_** on a panel of your choice to open screenshot dialog
* Select screenshot source (**Panel** is default).
* Select screenshot format (**PNG** is default). 
* **File** format option takes screenshot and opens standard browser file saving dialog (always in PNG format)
* Add optional text note, screenshot time and dashboard time range to screenshot if needed
  (you can edit/add text notes any time later.)
* Press submit button to complete.
* Taken screenshot will be added to this panel unless **File** was selected.

If non-zero **Max entries**  is set in panel options the number of screenshots in panel will be limited to this number.
After this limit is reached the older screenshot will be deleted on a FIFO basis.

## Notes

* There should be only one instance of screenshot panel per dashboard
* If **Dashboard** is selected as screenshot source result will include this panel too. 
So, it's best to empty it before action.
* If screenshot panel is not shown (row is collapsed) **_Ctrl-RightClick_** binding is disabled.
* All screenshots in panel are lost when this panel is hidden or when you switch to another dashboard.
<hr>

## Build plugin

```
npm install
npm run build
```
## Installation

While this plugin is not in offical Grafana plugins repository it has to be installed manually:

1.  Download [plugin](https://github.com/yuyutime/yuyutime-screenshot-panel/archive/master.zip)
1.	Unzip to folder
1.  Create /var/lib/grafana/plugins/yuyutime-screenshot-panel directory and put all files
1.  Copy all files from plugins' dist/ folder to /var/lib/grafana/plugins/yuyutime-screenshot-panel
1.  Restart grafana-server


## Links
[![NPM](https://nodei.co/npm/dom-to-image.png?stars=true&downloads=true)](https://nodei.co/npm/dom-to-image/)

[![NPM](https://nodei.co/npm/save-as.png?stars=true&downloads=true)](https://nodei.co/npm/save-as/)
