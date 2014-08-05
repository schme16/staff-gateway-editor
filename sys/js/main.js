$.fn.deepest = function() {

	var $target = $(this).children();

	while( $target.length === 1 ) {
	  $target = $target.children();
	}

	return $target;
};

function landingPageCreator($scope, $http){

	l = $scope;

	l.buttonArray = [];

	l.switchImage = function(s){

		return function(a){

			var reader = new FileReader();

			reader.onload = function(h){
				s.image = h.target.result;
				l.safeApply();
			};

			reader.readAsDataURL(a);
		};
	};

	l.icon = 'https://usqdirect.usq.edu.au/usq/file/805afc61-5986-412d-92f0-f7ac94417521/1/sys/img/iconPlaceholder.png';

	l.rounding = 'https://usqdirect.usq.edu.au/usq/file/805afc61-5986-412d-92f0-f7ac94417521/1/sys/img/rounding.png';

	l.removeButton = function(){
		var i = l.buttonArray.indexOf(l.editBox);
		if (i!== -1 && confirm('Are you sure you want to delete this button?')) {
			l.buttonArray.splice(i, 1);
			l.editBox = null;
		}
	};

	l.addIcon = function(a){

		var reader = new FileReader();

		reader.onload = function(h){
			l.icon = h.target.result;
			l.safeApply();
		};

		reader.readAsDataURL(a);

	};

	l.buttons = function(a, imageUrl){
		var link = '',
		name = ' ',
		newIndex;

		var finished = function() {
			l.editBox = l.buttonArray[newIndex-1];
			l.safeApply();
		};

		if(a){
			var reader = new FileReader();

			reader.onload = function(h){
				l.buttonArray.push({ image: h.target.result,  name:name , url:link, order: l.buttonArray.length });
				finished();
			};

			reader.readAsDataURL(a);

		}
		else{
			l.buttonArray.push({ image: imageUrl,  name:name , url:link, order: l.buttonArray.length });
		}

		finished();


	};

	l.getURL = function(a){
		var t = '#';
		if(l.showCode) t = a.url;
		return t;
	};

	l.handlePlaceholders = function(arr){
		return new Array(3-(arr.length%3));
	}

	l.body = '';

	l.load = function load(url){

		if(!url) return;
		l.uri = url;

		server = {
			edit : (function (a) {
				var data = url.replace('http://','').replace('https://','').split('.')[0];
				//''

				switch(data) {
					case 'mystaffdesk':
						return {normal: 'http://mystaffdesk.usq.edu.au/moodle2/course/modedit.php', section:'http://mystaffdesk.usq.edu.au/moodle2/course/editsection.php'}
					break;

					case 'usqstudydesk':
						return {normal: 'http://usqstudydesk.usq.edu.au/m2/course/modedit.php', section:'http://usqstudydesk.usq.edu.au/m2/course/editsection.php'}
					break;

					case 'open':
						return {normal: 'https://open.usq.edu.au/course/modedit.php', section:'https://open.usq.edu.au/course/editsection.php'}
					break;


				}


			}())
		}

		l.loading = true;

		l.safeApply();

		$.get(url, function(data){

			try {
				l.id = $(data).find('a[title="Edit summary"] ').attr('href');
				l.id = l.id.substr(l.id.indexOf('id=')+3);
				l.id = l.id.substr(0, l.id.indexOf('&'));
			} catch(e) {
				l.id = querystring(url.split('?')[1]).id;
			}

			var body = $(data).find('.__landingPageBody');
			if(body.length === 0 && !confirm('No landing page was found, are you sure you want this page?')){}
			else{

				$('.__icon').attr('src', body.find('.__icon').attr('src'));

				l.showIcon = (body.find('.__icon').css('display') == 'none' ? false: true);


				//body.find('.__icon').remove();

				//Now the buttons
				l.buttonArray = []; //clear the old stuff out
				body.find('.__button').not('.__placeholder').each(function(){
					var button = $(this);
					body.find('.__buttonText').find('span').remove();
					body.find('.__buttonTextNew').find('span').remove();


					var title = button.find('.__buttonTextNew').text().trim()||button.find('.__buttonText').text().trim();

					l.buttonArray.push({
						external: button.attr('target'),
						name: title,
						url: button.attr('href')||'#',
						disabled: (button.data('disabled')),
						onclick:button.attr('onclick'),
						ondblclick:button.attr('ondblclick')
					});
				});


				//lastly lets import the blurb
				var t = $('<div>');
				lll = body.find('.__icon').clone();
				if (body.find('.__icon').parent()[0] && body.find('.__icon').parent()[0].localName === 'p') {
					body.find('.__icon').parent().remove();
				}
				console.log(body.find('.__blurb').deepest())
				body.find('.__blurb').deepest().appendTo(t);
				l.blurb = t.html();
				l.safeApply();

			}

			l.loading = l.loadUrl = false;

			try{
				$($('iframe')[0].contentDocument.body).prepend(lll);
			} catch(e) {}


			l.safeApply();

		}).error(function(){
			l.loading = l.loadUrl = false;
			l.safeApply();

		});


	};

	l.save = function(){
		l.safeApply(l.genLoading = true);
		if(!l.id) return;
		var wrapper = $('.landingPage').clone();

		wrapper.find('.editorItem, .mce-tinymce').remove();
		wrapper.find('.editorItem, .mce-tinymce').remove();

		wrapper.find('*')
			.removeClass('ng-scope')
			.removeClass('ng-valid')
			.removeClass('angular-medium-editor')
			.removeClass('ng-dirty')
			.removeClass('ng-pristine')
			.removeClass('ng-pristine')
			.removeClass('ng-valid')
			.removeClass('blurbHidden')
			.removeAttr('contenteditable')
			.removeAttr('ng-src')
			.removeAttr('ng-href')
			.removeAttr('ng-click')
			.removeAttr('medium-editor')
			.removeAttr('ng-show')
			.removeAttr('ng-hide')
			.removeAttr('ng-model')
			.removeAttr('ng-hide-in-editor')
			.removeAttr('ng-class')
			.removeAttr('ng-hide-in-editor')
			.removeAttr('ng-include')
			.removeAttr('ng-style')
			.removeAttr('ng-invisible')
			.removeAttr('ng-bind-html-unsafe')
			.removeAttr('ng-repeat')
			.removeAttr('options')
			.removeAttr('data-medium-element')
			.removeAttr('select-non-editable')
			.removeAttr('onselect')
			.removeAttr('ondrag')
			.removeAttr('ng-kill-drag')
			.removeAttr('ng-kill-drop')
			.removeAttr('ng-drop')
			.removeAttr('data-index')
			.removeAttr('ng-bind-to-model')
			.removeAttr('data-clicky')
			.removeAttr('strip-br')
			.removeAttr('ng-init')
			.removeAttr('data-doubleclicky')
			.removeAttr('ng-pristine')
			.removeAttr('ng-valid')
			.removeAttr('ng-drop-limit')
			.removeAttr('draggable')
			.removeAttr('data-placeholder');

			wrapper.find('*').not('br,hr,img,obj,iframe,link').each(function(){
				var v = $(this);
				if (v.html().trim()==='') {
					v.remove();
				}
			})

		var _type = (l.uri.indexOf('/course/') !== -1 ? 'section' : 'normal')
		var _method = (_type === 'section' ? 'id' : 'update')
		var _server = (l.uri.indexOf('/course/') !== -1 ? server.edit.section : server.edit.normal) + '?'+ _method +'='+ (l.updateID || l.id);
		console.log(_server);
		$.get(_server , {}, function(dd){

			var d = {};
			var data = $(dd).find('form').serializeArray();
			for(var i in data) {
				var v = data[i];
				d[v.name] = v.value;
			}

			d['submitbutton'] = 'Save and display';
			if(_type === 'normal') {
				d['page[text]'] = wrapper.html();
			}
			else if(_type === 'section') {
				d['summary_editor[text]'] = wrapper.html();
			}


			$.post(_server, d, function(){
				try{l.safeApply(l.genLoading = false)}catch(e){console.log(e)}
			}).error(function(err){
				console.log(err)
				try{l.safeApply(l.genLoading = false)}catch(e){console.log(e)}
			});

		}).error(function(){

		});

	};

	l.parseUrl = function(button){
		if (button.disabled) {

		}
	};

	l.getImage = function(img){
		var image = img || '#';
		return String("url('"+image.replace(/\"/g,'')+"')").replace(/\"/g,'');
	};

	l.apply = function(fn) {
		var phase = this.$root.$$phase;
		if(phase == '$apply' || phase == '$digest') {
			if(fn && (typeof(fn) === 'function')) {
				fn();
			}
		}
		else {
			this.$apply(fn);
		}
	};

	l.safeApply = function(fn) {
		var phase = this.$root.$$phase;
		if(phase == '$apply' || phase == '$digest') {
			if(fn && (typeof(fn) === 'function')) {
				fn();
			}
		}
		else {
			this.$apply(fn);
		}
	};

	l.uploadImage = function(newButton, changeButton, changeIcon){
		console.log(newButton, changeButton, changeIcon);
		var server = 'http://base64.ap01.aws.af.cm/get?_t='+getEpoch()+Math.randomTo(0, 999999);
		//var server = 'http://localhost:1337/get';
		$.support.cors = true;
		$.get(server, function(d){
			l.genLoading = false;
			l.safeApply();

			if (newButton) {
				console.log(1);
				setTimeout(function(){
					l.buttons(false, d);
					l.safeApply();
				}, 500);
			}
			else if (changeButton){
				console.log(2);
				l.editBox.image = d;
				l.editBox.loading = false;
				l.safeApply();
			}
			else if (changeIcon){
				console.log(3);
				l.icon = d;
				l.safeApply();
			}


		}, 'text').error(function(e){
			l.errorBox = {details:'Could not upload, please check your connection and try again.'};
			l.safeApply();
		});

	}

	$('.image').change(function(e,t){
		$(this).parent().submit();
	})

	l.tools = [
		{
			'title': 'bold',
			'func': function () {
				document.execCommand('bold', false, null);
			}
		},
		{
			'title': 'italics',
			'func': function () {
				document.execCommand('italic', false, null);
			}
		},
		{
			'title': 'underline',
			'func': function () {
				document.execCommand('underline', false, null);
			}
		},
		{
			'title': 'link',
			'func': function () {
				var url = prompt('Please enter the url:');
				if (url) document.execCommand('createLink', false, url);
			}
		},
		{
			'title': 'unlink',
			'func': function () {
				document.execCommand('unlink', false, false);
			}
		},
		{
			'title': 'fontSizeUp',
			'test': !document.queryCommandSupported('increasefontsize'),
			'func': function () {
				document.execCommand('increasefontsize', false, null);
			}
		},
		{
			'title': 'fontSizeDown',
			'test': !document.queryCommandSupported('decreasefontsize'),
			'func': function () {
				document.execCommand('decreasefontsize', false, null);
			}
		},
		{
			'title': 'list',
			'func': function () {
				document.execCommand('insertUnorderedList', false, null);
			}
		},
		{
			'title': 'orderedList',
			'func': function () {
				document.execCommand('insertOrderedList', false, null);
			}
		},
		{
			'title': 'alignLeft',
			'func': function () {
				document.execCommand('justifyLeft', false, null);
			}
		},
		{
			'title': 'alignCenter',
			'func': function () {
				document.execCommand('JustifyCenter', false, null);
			}
		},
		{
			'title': 'alignRight',
			'func': function () {
				document.execCommand('justifyright', false, null);
			}
		},


		{
			'title': 'insertImage',
			'test': true,
			'func': function () {
				document.execCommand('insertImage', false, null);
			}
		},
		{
			'title': 'setFontSize',
			'test': true,
			'func': function (size) {
				if (size) document.execCommand('setFontSize', false, size);
			}
		}
	]

	l.stylesheets = [
		'../Staff-Gateway/styles.css',
		'https://studyreserveprd.usq.edu.au/usq/file/ce09b718-35d9-4c66-87f3-37b9bbc09421/1/sys/css/oldStyle.css'
	]

	l.getOptions = function (classname, toolbars, menus, validElements) {

		return {
			body_class: classname,
			theme: "modern",
			convert_urls: 0,
			//valid_elements : validElements || null,
			remove_script_host: 0,
			plugins: [
				"advlist autolink lists link image charmap print  hr anchor pagebreak",
				"searchreplace wordcount visualblocks visualchars code fullscreen",
				"insertdatetime nonbreaking save table contextmenu directionality",
				"template paste textcolor table noneditable"
			],
			content_css: l.stylesheets,
			noneditable_leave_contenteditable: true,
			toolbar1: toolbars || "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | forecolor backcolor",
			menubar: menus || "edit insert format table view",
			image_advtab: true,
			setup: function(editor) {
				editor.on('input', function(e) {
					changesMade = true;
				});
			}
		};
	}



	try {
		var url = atob(decodeURIComponent(querystring(location.href.split('?')[1]).page))
		if(!!url) l.load(url)

	} catch (e) {}
























}

angular.module('USQ', ['ui.bootstrap', 'ui.tinymce'])

//Drag and drop handler
.directive('ngKillDrag', function() {
	return function(scope, element, attrs) {

		element.bind('dragstart', function(e) {
			var event = e.originalEvent || e;
			event.preventDefault();
			return false;
		});
	}

})

//Drag and drop handler
.directive('ngKillDrop', function() {

	return function(scope, element, attrs) {

		element.bind('dragover drop', function(e) {
			var event = e.originalEvent || e;
			event.preventDefault();
			return false;
		});
	}

})
/*
.directive('ngDrop', function() {

	return function(scope, element, attrs) {

		element.bind('dragenter', function(e) {
			var event = e.originalEvent || e;
			event.preventDefault();
			return false;
		});

		element.bind('dragover', function(e) {
			var event = e.originalEvent || e;
			event.preventDefault();

			return false;
		});

		element.bind('drop', function(e) {
			// Read the File objects in this FileList.
			var event = e.originalEvent || e;
			if (!l.prevent) {
				var files = event.dataTransfer.files;
				try{
					eval("var k = scope."+attrs.ngDrop);
					k = (typeof k === 'function' ? k:function(){});
					for(var i = 0; i < (parseInt(element.attr('ng-drop-limit')) > 0 ? element.attr('ng-drop-limit'):files.length); i++){
						k(files[i]);
					}
				}catch(e){console.log(e);}

				scope.$apply();
				element.trigger('change');
				element.trigger('focus');
				element.trigger('blur');
				// Stops some browsers from redirecting.

			}
				event.preventDefault();
				return false;
		});
	};
})
*/
//Drag and drop handler
.directive('draggable', function() {

	return function(scope, element, attrs) {

		element.bind('dragenter', function(e) {
			var event = e.originalEvent || e;
			event.preventDefault();
			return false;
		});

		element.bind('dragstart', function(e) {
			var event = e.originalEvent || e;
			if(!element.hasClass('__placeholder')) {
				event.dataTransfer.setDragImage(element[0], 85, 35);
				l.prevent = {el: element};
			}
			else{
				event.preventDefault();
				event.stopPropagation();
				return false;

			}
		});

		element.bind('dragend', function(e) {
			var event = e.originalEvent || e;
			l.prevent = false;
			if(!event.dataTransfer.files && event.dataTransfer.files.length === 0){
				event.preventDefault();
				return false;
			}
		});

		element.bind('dragenter', function(e) {
			var event = e.originalEvent || e;
			if(!element.hasClass('__placeholder') && l.prevent ) {
				var newPos = l.buttonArray[element.data('index')].order;
				var dropped = l.buttonArray[l.prevent.el.data('index')];
				var oldPos = dropped.order;
				for(var i in l.buttonArray){
					var v = l.buttonArray[i];
					if(oldPos > newPos){
						if(v.order <= oldPos && v.order >= newPos ){
							l.buttonArray[i].order = v.order+1;
							l.buttonArray[i].timestamp = getEpoch();
						}
					}
					else{
						if(v.order >= oldPos && v.order <= newPos ){
							l.buttonArray[i].timestamp = getEpoch();
							l.buttonArray[i].order = v.order-1;
						}
					}
				}

				dropped.order = newPos;
				l.safeApply();

				//swapElements(l.buttonArray, l.prevent.el.data('index'), element.data('index'));
			}
		});



	};
})

//hides things
.directive('ngInvisible', function() {
	return function(scope, element, attr) {
		//var animate = $animator(scope, attr);
		scope.$watch(attr.ngInvisible, function ngShowWatchAction(value){

			element.css('visibility', (value ? 'visible':'hidden'))
		});
	};
})

//Allows two way editing
.directive('href', function() {
	return function(scope, element, attr) {
		//var animate = $animator(scope, attr);
		scope.$watch(attr.ngHrefDisable, function ngShowWatchAction(value){
			element.click(function(e){
				e.preventDefault();
				e.stopPropagation();
				return false;
			});
		});
	};
})

.directive('ngBindHtmlUnsafe', function() {
	return function(scope, element, attr) {
		scope.$watch(attr.ngBindHtmlUnsafe, function (value) {
			element.html(scope.$eval(attr.ngBindHtmlUnsafe));
		})
	};
})



function swapElements(list, x, y) {
	if(!!list[x] && !!list[y]) {
		var b = list[y];
		list[y] = list[x];
		list[x] = b;
		l.safeApply();
	}
}
