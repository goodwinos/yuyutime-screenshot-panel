import { PanelCtrl } from 'grafana/app/plugins/sdk';
import appEvents from 'grafana/app/core/app_events';

import domtoimage from 'dom-to-image';
import saveAs from 'save-as';
import './panel.css';

const moduleTemplate = `
<div>
  <div class="row screenshots-container-controls"  ng-model="ctrl.entriesCounter" ng-change="ctrl.render()">
	<button class="btn btn-inverse screenshot-clear-all"><i class="fa fa-remove"></i>
	  &nbsp;Clear All ({{ctrl.entriesCounter}})
	</button>
	&nbsp;<span>Screenshots in panel: {{ctrl.entriesCounter}}</span>
  </div>
  <div class="screenshots-container">
	<!-- screenshots with clear btn, timestamps and note go here -->
  </div>
  <hr>
</div>
`

const  modalTemplate = `
<div class="modal-body">
  <div class="modal-header">
	<h2 class="modal-header-title">
	  <i class="fa fa-camera"></i>
	  <span class="p-l-1">Take screenshot</span>
	</h2>
	<span>Screenshots in panel:  <strong>{{ctrl.entriesCounter}}</strong> / max {{ctrl.settings.maxEntries}}</span>
	<a class="modal-header-close" ng-click="ctrl.dismiss();">
	  <i class="fa fa-remove"></i>
	</a>
  </div>

  <form name="screenshotForm" ng-submit="ctrl.takeScreenshot('panel');ctrl.dismiss()" class="modal-content" novalidate>
	<div style="width:70%;" ng-if="ctrl.entriesCounter&&ctrl.entriesCounter==ctrl.settings.maxEntries">
	  There are already {{ctrl.entriesCounter}} = max configured number of screenshots in panel.
	  <br>
	  &rarr;&nbsp;The oldest screenshot will be removed!
	</div>
	<hr>

	<div class="gf-form-group section width-30" on-change="ctrl.render()">
	  <label class="gf-form-label">Screenshot source</label>
		<input type="radio" name=screenshotSelector value=".panel-container"  ng-model="ctrl.screenshotSelector"/> &nbsp; Panel &nbsp
		<input type="radio" name=screenshotSelector value=".dash-row" ng-model="ctrl.screenshotSelector"/> &nbsp; Row &nbsp;
		<input type="radio" name=screenshotSelector value=".dashboard-container" ng-model="ctrl.screenshotSelector"/> &nbsp; Dashboard
	</div>

	<div class="gf-form-group section width-30" on-change="ctrl.render()">
	  <label class="gf-form-label">Image format</label>
	  <input type="radio" name=imageFormat value="png" ng-model="ctrl.imageFormat"> &nbsp;PNG </input>&nbsp;
	  <input type="radio" name=imageFormat value="jpg" ng-model="ctrl.imageFormat"> &nbsp;JPEG </input>&nbsp;
	  <input type="radio" name=imageFormat value="svg" ng-model="ctrl.imageFormat"> &nbsp;SVG </input>&nbsp;
	  <input type="radio" name=imageFormat value="file" class="" ng-model="ctrl.imageFormat">&nbsp;File</input>
	  <span>(<i>File is always saved in PNG format</i>)</span>
	</div>

	<div ng-if="ctrl.imageFormat!='file'">
	  <gf-form-switch class="gf-form" checked="ctrl.settings.addTimeRange"  label-class="width-30" label="Add dashboard time range to screenshot?"></gf-form-switch>
	  <gf-form-switch class="gf-form" checked="ctrl.settings.addTimestamp"  label-class="width-30" label="Add screenshot timestamp?"></gf-form-switch>
	  <div class="gf-form">
		<textarea rows="7" type="text" name="note" class="gf-form-input" ng-model="ctrl.note"
		  placeholder="Optional note to this screenshot &hellip;"
		  give-focus="true"
		  autocomplete="off" />
		</div>
	</div>


	<div class="gf-form-button-row text-center">
	  <button type="submit" class="btn btn-success fa fa-camera">&nbsp;Take screenshot as {{ctrl.imageFormat}}</button>
	  <button class="btn btn-inverse" ng-click="ctrl.dismiss();">Cancel</button>
	  <button type="reset" class="btn btn-inverse" ng-click="ctrl.note=''">Reset</button>
	</div>
  </form>
</div>
`

const panelDefaults = {
  disableDraggable: false,
  locale: 'en',
  addTimestamp: true,
  addTimeRange: true,
  timestampFormat:'YYYY-MM-DD HH:mm:ss(Z)',
  timeRangeFormat: 'YYYY-MM-DD HH:mm:ss(Z)',
  screenshotSelector: '.panel-container', //what to screenshot
  imageFormat: 'png',
  maxEntries: 10 // older screenshots removed on FIFO basis. Set maxEntries = 0 for unlimited
}

export class Ctrl extends PanelCtrl {

  constructor($scope, $injector){ /////, dashboardSrv) {
    super($scope, $injector);
	this.settings = {};
    _.defaults(this.settings, panelDefaults);

	var self = this;
	var screenshotSource;
	this.note = '';
	this.entriesCounter = 0; // reset counter of added screenshots

	this.events.on('panel-teardown', this.onPanelTeardown.bind(this));
	this.events.on('init-edit-mode', this.onInitEditMode.bind(this));

	if (!this.contexmenuSet) {
	  $(document).on("contextmenu", '.panel:not(".screenshot")', function($event) {
		self.contexmenuSet = true;
		if ($event.ctrlKey) { // trigger screenshot dialog on Ctrl-RightClick
		  self.showScreenshotsModal($event);
		}
	  });
	}

	if (this.settings.disableDraggable) { 
	  // hack: disable draggable attribute to make text selection working in grafana panels
	  // way-around for https://github.com/grafana/grafana/issues/2083
	  $('.panel').each(function(i, obj) { obj.setAttribute("draggable", "false"); });
	}
  }

  dismiss(){
	appEvents.emit('hide-modal');
  };


  showScreenshotsModal($event) {
    let modalScope = this.$scope.$new(true);

    $event.stopPropagation();
    $event.preventDefault();
    this.screenshotEvent = $event;

    modalScope.ctrl = this;

    this.publishAppEvent('show-modal', {
      templateHtml: modalTemplate,
      scope: modalScope
    });
  }


  onInitEditMode() {
    this.addEditorTab('Options', 'public/plugins/yuyutime-screenshot-panel/editor.html', 2);
  }

  onRender() {
	//console.log('panel render event handler');
  }

  onPanelTeardown() {
	//console.log('panel Teardown event handler');
    this.$timeout.cancel(this.nextTickPromise);
    this.entriesCounter = 0;
	this.contextmenuSet = false;
    // turn off context menu dialog for screenshooter
	$(document).off("contextmenu", '.panel:not(".screenshot")')
  }

  link(scope, elem, attrs, ctrl) {
	//console.debug('called link(scope, elem, attrs, ctrl) with args:',scope, elem, attrs, ctrl );
	this.screenshotsContainer = elem.find('.screenshots-container');

	elem.on('click','.screenshots-container .fa-remove',function(){ // remove single screenshot
	  //console.debug('removing screenshot');
	  this.parentNode.remove();
	  ctrl.render();
	  if (ctrl.entriesCounter > 0){
		ctrl.entriesCounter--;
	  }
	});

	elem.on('click', '.screenshot-clear-all', function() { 
	  //console.log('Removing all screenshots in panel for ',this); 
	  $(this.parentNode.nextElementSibling).empty();
	  ctrl.entriesCounter = 0; // reset counter of added screenshots
	  ctrl.render();
	});
  }

  takeScreenshot(destination='panel', imageFormat=null) {
	let self=this;
	let timestamp = '', timerange = '', ctime = (new Date).getTime(), from='N/A', to='N/A';
	let maxEntries = this.settings.maxEntries;
	let fmt = imageFormat || this.imageFormat || this.settings.imageFormat || 'png';
	let selector = this.screenshotSelector || this.settings.screenshotSelector;
	let source = $(this.screenshotEvent.target).closest(selector).get(0);

	//console.debug(this.screenshotSelector, this.settings.screenshotSelector, selector, source);

	destination = destination || 'panel';
	if (fmt==='file') {
	  destination = 'file';
	}
	
	if (this.settings.addTimestamp) {
	  timestamp = '<div class="screenshot-timestamp"><u>Screenshot time</u>: ' + new Date() + '</div>';
	}
	if (this.settings.addTimeRange) {
	  let tr = this.$injector.get('timeSrv').timeRange();
	  from = tr.from.locale(this.settings.locale).format(this.settings.dashboardTimeRangeFormat);
	  to = tr.to.locale(this.settings.locale).format(this.settings.dashboardTimeRangeFormat);
	  timerange = '<div class="screenshot-timerange"><u>Dashboard range</u>: ' + from + ' to ' + to + '</div>';
	}

	switch(destination) {
	  case "file":
		domtoimage.toBlob(source)
		  .then(function(blob){
			if (confirm('Save screenshot to file?')) {
			  saveAs(blob, 'grafana-panel-screenshot.png'); //always PNG format when saving to file
			}
		});
		break;

	  case "panel":
		if (maxEntries>0 && this.entriesCounter >= maxEntries) {
		  self.screenshotsContainer.find('.screenshot:first').remove();
		  this.entriesCounter--;
		}

		this.entriesCounter++;
		//console.log('Number of screenshots in panel: ', this.entriesCounter);
	
		let dom2img = (fmt==='jpg') ? domtoimage.toJpeg : (fmt=='svg') ? domtoimage.toSvg: domtoimage.toPng;

		let note = '<div class="screenshot-note" contenteditable=true>' + timerange + timestamp + '<hr>' + this.note + '</div>';

		dom2img(source).then(function(dataURL){
			let img = new Image();
			img.src = dataURL;
			img.alt = 'Dashboard range: ' + from + ' to ' + to;
			img.width = source.clientWidth;
			img.height = source.clientHeight;
			self.screenshotsContainer.append(
			  '<div class="screenshot" data-ctime='+ctime+' style="width:'+source.clientWidth+'px;">' + 
			  '<span class="fa fa-remove" style="color:red;align-self:flex-start;"></span></div>'
			);
			self.screenshotsContainer.find('.screenshot:last')
			  .append(img)
			  .append(note);
		});
	  break;

	  default: alert('Unknown screenshot destination/format requested!');
	}
  }

}

Ctrl.template = moduleTemplate;
