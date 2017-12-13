# Grafana screenshot panel plugin 

## Take screenshots of other panels in dashboard in PNG/JPEG/SVG formats
and add optional timestamps and text notes and accumulate them in panel or save to file

Plugin skeleton is based on
> [Template project](https://github.com/CorpGlory/grafana-plugin-template-webpack)
> for developing plugins for Grafana with Webpack.

and 

> relies heavily on [dom-to-image library](https://travis-ci.org/tsayen/dom-to-image)
>  (see details on browser support there)
> and 
> [![NPM](https://nodei.co/npm/save-as.png?stars=true&downloads=true)](https://nodei.co/npm/save-as/) 



## Basic usage

* This plugin does not use server-side rendering - everything is done in clients' browser
* Add a single instance of this panel to dashboard
* Use Ctrl-RightClick on a panel of your choice to open screenshot dialog
* Select screenshot source (**Panel** is default).
* Select screenshot format (**PNG** is default). 
* **File** format option takes screenshot and opens standard browser file saving dialog (always in PNG format)
* Add optional text note, screenshot time and dashboard time range to screenshot if needed
  (you can edit/add text notes any time later.)
* Press submit button to complete.
* Taken screenshot will be added to this panel unless **File** was selected.

If non-zero **Max entries** panel option is set the number of screenshots in panel will be limited to this number.
After this limit is reached the older screenshot will be deleted on a FIFO basis.

## Notes

* There should be only one instance of screenshot panel per dashboard
* If **Dashboard** is selected as screenshot source result will include this panel too. 
So, it's wise to empty it before action.
* If screenshot panel is not shown (row is collapsed) Ctrl-RightClick binding is disabled.
* All screenshots in panel are lost when this panel is hidden or when you switch to another dashboard.
<hr>

## Build plugin

```
npm install
npm run build
```
