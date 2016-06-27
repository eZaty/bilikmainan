ClientHelper = {

	activeMenu : function(menu, parent) {
		$('#menu-nav').find('li[id^=menu-]').each(function(){
			$(this).removeClass('active');
		});
		$('#menu-nav').find('#menu-'+menu).addClass('active');
		if(parent) {
			$('#menu-nav').find('#menu-'+parent).addClass('active');
			$('#menu-'+menu).parent().css('display', 'block');
		}
	},

	alertSuccess: function(msg) {
		var str = '<div class="alert alert-success alert-styled-left alert-arrow-left alert-bordered">';
		str += '<button type="button" class="close" data-dismiss="alert"><span>×</span><span class="sr-only">Close</span></button><h5>' + msg + '</h5></div>';
		return str;
	},

	alertDanger: function(msg) {
		var str = '<div class="alert alert-danger alert-styled-left alert-bordered">';
		str += '<button type="button" class="close" data-dismiss="alert"><span>×</span><span class="sr-only">Close</span></button><h5>' + msg + '</h5></div>';
		return str;
	},

	alertWarning: function(msg) {
		var str = '<div class="alert alert-warning alert-styled-left">';
		str += '<button type="button" class="close" data-dismiss="alert"><span>×</span><span class="sr-only">Close</span></button><h5>' + msg + '</h5></div>';
		return str;
	},

	internalOnly: function(callback) {
		Meteor.call("clientAddress", function(error, result){
			if(error){
				console.log("error", error);
			}
			if(result){
				var tip = result.split('.');
				var ip = Number(tip[0]);
				var arr = [10, 127, 172, 192];
				if($.inArray(ip, arr) < 0) {
					callback(true);
				}
				else callback(false);
				// console.log('ip:', result);
			}
		});
	},

	notify: function(type, msg, hide) {
		var stack_bottomright = {"dir1": "up", "dir2": "left", "firstpos1": 25, "firstpos2": 25};
		var notice = new PNotify({
			title: msg,
			addclass: 'stack-bottom-right bg-' + type,
			stack: stack_bottomright,
			hide: hide,
			delay: 3000,
			opacity: 0.9,
			buttons: {
				closer: true,
				sticker: false
			}
		});
		notice.get().click(function() {
			notice.remove();
		});
	},

	confirm: function(type, msg) {
		var stack_bottomright = {"dir1": "up", "dir2": "left", "firstpos1": 25, "firstpos2": 25};
		var notice = new PNotify({
			title: msg,
			addclass: 'stack-bottom-right bg-' + type,
			stack: stack_bottomright,
			hide: false,
			opacity: 0.9,
			confirm: {
				confirm: true,
				buttons: [
					{
						text: 'Yes',
						addClass: 'btn-md'
					},
					{
						text: 'Cancel',
						addClass: 'btn-md'
					}
				]
			},
			buttons: {
				closer: false,
				sticker: false
			},
			history: {
				history: false
			}
		});
		return notice;
	},

	// routePermission: function(routeName) {
	// 	if (!Meteor.userId()) {
    //         Router.go('/login');
	// 		return false;
    //     } else {
	// 		var roles = ['admin'];
	// 		var groups = Groups.find({
	// 			routes: routeName
	// 		});
	//
	// 		groups.forEach(function(group){
	// 			roles.push(group.slug);
	// 		});
	//
	// 		// console.log(routeName, roles);
	// 		if(Roles.userIsInRole(Meteor.userId(), roles) || $.inArray('employee', roles) > 0) {
	// 			console.log(routeName, 'permitted');
	// 			return true;
	// 		}
	// 		else {
	// 			console.log(routeName, 'prohibited');
	// 			return false;
	// 		}
	// 	}
	// },

	// permission: function(route) {
	// 	var roles = ['admin'];
	// 	var routeName = Router.current().route.getName();
	// 	if(!Meteor.userId()) return;
	// 	if(route) routeName = route;
	//
	// 	var groups = Groups.find({
	// 		routes: routeName
	// 	});
	//
	// 	groups.forEach(function(group){
	// 		roles.push(group.slug);
	// 	});
	//
	// 	// console.log(routeName, roles);
	// 	if(Roles.userIsInRole(Meteor.userId(), roles) || $.inArray('employee', roles) > 0) {
	// 		console.log(routeName, 'permitted');
	// 		return true;
	// 	}
	// 	else {
	// 		console.log(routeName, 'prohibited');
	// 		return false;
	// 	}
	// },
	//
	// checkPermission: function() {
	// 	if(!this.permission()) {
	// 		Router.go('/');
	// 		this.notify('danger', 'You do not have sufficient access to enter this page. Please <a href="/logout" class="text-white"><u><strong>re-login</strong></u></a> as appropriate user.', true);
	// 	}
	// },

	accessPermission: function(route) {
		var roles = Meteor.user().roles;
		console.log('roles:', roles);

	},

	fixedHeader : function() {
		if(!$('.head-fixed').length) return;
		var navbarHeight = $('.navbar').height();
		var coverHeight = $('.profile-cover').height() - navbarHeight;
		$(window).scroll(function() {
			var scroll = $(window).scrollTop();
			if ( scroll < coverHeight ) {
				$('.head-fixed').removeClass('fixed');
			} else if ( scroll >= coverHeight ) {
				$('.head-fixed').addClass('fixed')
			}
		});
	},

	startLazy: function() {
		$('img.lazy').unveil(200, function(){
			$(this).load(function() {
				this.style.opacity = 1;
			});
		});
	}
}
