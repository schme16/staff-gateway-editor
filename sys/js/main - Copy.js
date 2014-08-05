
	
	
function landingPageCreator($scope, $http){

	l = $scope;
	
	l.buttonArray = [];
	
	l.switchImage = function(s){
		return function(a){
			var reader = new FileReader();
			
			reader.onload = function(h){
				s.image = h.target.result;
				l.apply();
			};
			
			reader.readAsDataURL(a);
		};
	};
	 
	l.icon = 'https://usqdirect.usq.edu.au/usq/file/805afc61-5986-412d-92f0-f7ac94417521/1/sys/img/iconPlaceholder.png';
	
	l.rounding = 'https://usqdirect.usq.edu.au/usq/file/805afc61-5986-412d-92f0-f7ac94417521/1/sys/img/rounding.png';
	
	l.removebutton = function(editButton){
		var i = buttonArray.indexOf(editButton);
		if (confirm('Are you sure you want to delete this button?') && i!== -1) {
			l.buttonArray.splice(i, 1);
		}
	}

	l.addIcon = function(a){
		var reader = new FileReader();
		
		reader.onload = function(h){
			l.icon = h.target.result;
			l.safeApply();
		};
		
		reader.readAsDataURL(a);
		
	};
	
	l.buttons = function(a, url){
			
			if(!url){
				var reader = new FileReader();
			
				reader.onload = function(h){
					l.buttonArray.push({ image: h.target.result,  name: prompt('Button name:'), url: prompt('Please enter the web address this button will link to:') });
					l.safeApply();
				};
				
				reader.readAsDataURL(a);
			}
			else{
				l.buttonArray.push({ image: url,  name: prompt('Button name:'), url: prompt('Please enter the web address this button will link to:') });
				l.safeApply();
			}
		
	};
	
	l.getURL = function(a){
		var t = '#';
		if(l.showCode) t = a.url;
		console.log(t);
		return t;
	};
	
	l.handlePlaceholders = function(arr){
		return new Array(3-(arr.length%3));
	}

	l.body = '';
	
	l.load = function load(url){
		
		if(!url) return;

		l.loading = true;
		l.apply();
		
		$.get(url, function(data){
		
			try {
				l.id = $(data).find('a[title="Edit summary"] ').attr('href')
				l.id = l.id.substr(l.id.indexOf('id=')+3);
				l.id = l.id.substr(0, l.id.indexOf('&'));
			} catch(e) {
				l.id = querystring(url.split('?')[1]).id;
			}
			
			var body = $(data).find('.__landingPageBody');
			if(body.length == 0 && !confirm('No landing page was found, are you sure you want this page?')){}
			else{
				
				$('.__icon').attr('src', body.find('.__icon').attr('src'));
				body.find('.__icon').remove();
				
				//Now the buttons
				l.buttonArray = []; //clear the old stuff out
				body.find('.__button').not('.__placeholder').each(function(){
					var button = $(this);
					body.find('.__buttonText').find('span').remove();
					body.find('.__buttonTextNew').find('span').remove();
					var image = button.css('background-image').replace('url(','').replace(')','').replace('none', '');
					if (image.length == 0) {
						image = button.find('.__buttonBG').attr('src');
					}
					
					var title = button.find('.__buttonTextNew').text().trim()||button.find('.__buttonText').text().trim();
					
					//console.log();
					
					l.buttonArray.push({ image:image, external:button.attr('target'),  name: title, url: button.attr('href')||'#' });
				});
				
				
				//lastly lets import the blurb
				$('.__blurb').html('');
				var blurb = $('.__blurb');
				body.find('.__blurb').appendTo(blurb);
				blurb.find('.__icon').remove();
				blurb.find('.__blurb').removeClass('__blurb');
				blurb.addClass('__blurb')
				
			}
			
			l.loading = l.loadUrl = false;
			l.apply();
			
		}).error(function(){
			l.loading = l.loadUrl = false;
			l.apply();
		});
		
		
	}
	
	l.save = function(){
		try{l.safeApply(l.genLoading = true)}catch(e){}
		if(!l.id) return;
		var pageData = $('.landingPage').html().replace(/contenteditable/g,'');
		$.get('http://mystaffdesk.usq.edu.au/moodle2/course/modedit.php?update='+l.id, {}, function(dd){
			var d = {};
			var data = $(dd).find('#region-main form').serializeArray();
			for(var i in data){
				var v = data[i];
				d[v.name] = v.value;
			}
			
			d['submitbutton'] = 'Save and display';
			d['page[text]'] = pageData;
			$.post('http://mystaffdesk.usq.edu.au/moodle2/course/modedit.php', d, function(){
				try{l.safeApply(l.genLoading = false)}catch(e){}
			}).error(function(){
				try{l.safeApply(l.genLoading = false)}catch(e){}
			});
		}).error(function(){
			$.get('http://mystaffdesk.usq.edu.au/moodle2/course/editsection.php?id='+l.id, {}, function(dd){
				
				var d = {};
				var data = $(dd).find('#region-main form').serializeArray();
				for(var i in data){
					var v = data[i];
					d[v.name] = v.value;
				}
			
				d['submitbutton'] = 'Save changes';
				d['summary_editor[text]'] =  pageData;
				$.post('http://mystaffdesk.usq.edu.au/moodle2/course/editsection.php', d, function(){
					try{l.safeApply(l.genLoading = false)}catch(e){}
				}).error(function(){
					try{l.safeApply(l.genLoading = false)}catch(e){}
				});
			});
		});
			
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
	
	l.uploadImage = function(){
		
		var server = 'http://base64.ap01.aws.af.cm/get/?filename=imageData';
		
		$.get(server, function(d){
			
			l.buttons(false, d);
			
		}, 'text').error(function(){alert('Could not upload, please check your connection and try again.')});
		
	}

}

angular.module('USQ', ['ui.bootstrap', 'contenteditable'])

//Drag and drop handler
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
			event.preventDefault();
			return false;
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
			})
		});
	};
})

//Allows two way editing
.directive('ngBindToModel', ['$timeout', function($timeout) { return {
	restrict: 'A',
	require: '?ngModel',
	link: function($scope, $element, attrs, ngModel) {
		// don't do anything unless this is actually bound to a model
		if (!ngModel) {
			return;
		}
		
		$element.bind('blur focus input change keyup keydown mouseup mousedown click load created', function(){
			var html = $element.html();
			ngModel.$setViewValue(html);
			ngModel.$render();
		});
		
		setTimeout(function(){
			var html = $element.html();
			ngModel.$setViewValue(html)
			ngModel.$render();
		}, 100);
		
	}
}}]);









