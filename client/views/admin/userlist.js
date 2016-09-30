var max = 50;
var loading = false;

Template.adminUserList.onCreated(function() {
	var instance = this;

	// // 1. initialization
	// instance.loaded = new ReactiveVar(0);
	// instance.limit = new ReactiveVar(max);
	// instance.skip = new ReactiveVar(0);
	//
	// // 2. autorun
	// var subscription = null;
	// instance.autorun(function () {
	// 	var skip = instance.skip.get();
	// 	var limit = instance.limit.get();
	// 	subscription = instance.subscribe('limitUsers', limit);
	// 	Meteor.subscribe('profiles');
	// });
	//
	// instance.autorun(function () {
	// 	var limit = instance.limit.get();
	// 	if (subscription.ready()) {
	// 		instance.loaded.set(limit);
	// 	}
	// });

	instance.skip = new ReactiveVar(0);
	instance.limit = max;
	instance.loaded = new ReactiveVar(max);

	instance.autorun(function() {
		if(Session.get('SEARCH_QUERY')) {
			Meteor.subscribe('limitSearchUsers', Session.get('SEARCH_QUERY'), instance.skip.get(), instance.limit);
			Meteor.subscribe('searchUsers-count', Session.get('SEARCH_QUERY'));
		} else {
			Meteor.subscribe('limitUsers', instance.skip.get(), instance.limit);
			Meteor.subscribe('users-count');
		}
		Meteor.subscribe('profiles');
	});

	// // 3. cursor
	// instance.users = function() {
	// 	var skip = instance.skip.get();
	// 	// var limit = instance.limit.get();
	// 	return Meteor.users.find({},{
	// 		skip: skip,
	// 		limit: max,
	// 		fields: {
	// 			profile: 1,
	// 			username: 1,
	// 			roles: 1
	// 		}
	// 	});
	// }
	//
	// instance.total = function() {
	// 	return Meteor.users.find().count();
	// }
});

Template.adminUserList.onRendered(function() {
	ClientHelper.activeMenu('adminUserList', 'adminUsers');
	ClientHelper.startLazy();

	var table = $('#userTable').DataTable();
	table.column(0).visible(false);
	table.column(1).visible(false);
});

Template.adminUserList.helpers({

	users: function() {
		return Meteor.users.find();
	},

	// moreResults: function () {
	//     if(Counts.get('users') > Template.instance().loaded.get()) {
	//         loading = false;
	//         return true;
	//     }
	// },

	hasRole: function(role, roles) {
		if($.inArray(role, roles) >= 0) {
			return true;
		} else {
			return false;
		}
	},

	pagings: function() {
		var total = Counts.get('users');
		var totalPage = Math.ceil(total / max);
		var arr = [];
		for (var i = 0; i < totalPage; i++) {
			arr.push({
				number: (i + 1),
				skip: (i * max)
			});
		}
		return arr;
	},

	isNotPlayroomAdmin: function(username) {
		if(username == 'playroom') return false;
		else return true;
	},

	groups: function() {
		var groups = Groups.find({
			slug: {
				$nin: ['employee']
			}
		}, {
			fields: {
				name: 1,
				slug: 1
			}
		}).fetch();
		groups.push({
			name: 'Admin',
			slug: 'admin'
		});
		return groups;
	}
});

Template.adminUserList.events({
	'click .promote': function(e) {
		e.preventDefault();
		var elem = $(e.currentTarget);
		NProgress.start();
		var userId = elem.data('userid');
		var role = elem.data('role');
		Meteor.call('promoteUser', userId, role);
		NProgress.done();
	},

	'click .revoke': function(e) {
		e.preventDefault();
		var elem = $(e.currentTarget);
		NProgress.start();
		var userId = elem.data('userid');
		var role = elem.data('role');
		Meteor.call('revokeUser', userId, role);
		NProgress.done();
	},

	'click .delete-user': function(e) {
		e.preventDefault();
		var elem = $(e.currentTarget);
		NProgress.start();
		var userId = elem.data('userid');

		var notice = ClientHelper.confirm('danger', 'Are you sure want to delete this user?');
		notice.get().on('pnotify.confirm', function() {
			Meteor.call('deleteUser', userId, function(error, result){
				if(error) console.log("error", error);
				if(result) ClientHelper.notify('success', 'The selected user has been deleted.', true);
			});
		});
		NProgress.done();
	},

	'click .migrate-photo': function(e) {
		e.preventDefault();
		var elem = $(e.currentTarget);
		var userId = elem.data('userid');
		var profile = Profiles.findOne({userId: userId});
		if(!profile) {
			console.log(userId + ' - done');
			Meteor.call("migratePhoto", userId);
		} else {
			console.log(userId + " - exists");
		}
	},

	'click #migrate-photo': function(e) {
		e.preventDefault();
		// var elem = $(e.currentTarget);
		// var userId = elem.data('userid');
		// Meteor.call("migratePhoto", userId);
		var users = Meteor.users.find({},{
			fields: {
				_id: 1
			}
		});
		users.forEach(function(user){
			var userId = user._id;
			var profile = Profiles.findOne({userId: userId});
			if(!profile) {
				console.log(userId + ' - done');
				Meteor.call("migratePhoto", userId, function(error, result){
					if(error){
						console.log("error", error);
					}
					if(result){

					}
				});
			} else {
				console.log(userId + " - exists");
			}
		});

	},

	'click .paging-btn': function(e, instance) {
		e.preventDefault();
		var elem = $(e.currentTarget);
		var skip = elem.data('skip');
		instance.skip.set(skip);
		$('.paging-btn').each(function(){
			$(this).removeClass('bg-primary');
		});
		elem.addClass('bg-primary');
	},

	'submit #search-form, click #search-form .btn': function(e, instance) {
		e.preventDefault();
		var keyword = $('#search-keyword').val();
		instance.skip.set(0);
		Session.set('SEARCH_QUERY', keyword);
	}

});
