// Template.adminUserListBackup.onRendered(function() {
// 	ClientHelper.activeMenu('adminUserList', 'adminUsers');
// 	ClientHelper.startLazy();
// });
//
// Template.adminUserListBackup.helpers({
// 	users: function() {
// 		return Meteor.users.find({},{
// 			fields: {
// 				profile: 1,
// 				username: 1,
// 				roles: 1
// 			}
// 		});
// 	},
//
// 	hasRole: function(role, roles) {
// 		if($.inArray(role, roles) >= 0) {
// 			return true;
// 		} else {
// 			return false;
// 		}
// 	},
//
// 	isNotPlayroomAdmin: function(username) {
// 		if(username == 'playroom') return false;
// 		else return true;
// 	},
//
// 	groups: function() {
// 		var groups = Groups.find({
// 			slug: {
// 				$nin: ['employee']
// 			}
// 		}, {
// 			fields: {
// 				name: 1,
// 				slug: 1
// 			}
// 		}).fetch();
// 		groups.push({
// 			name: 'Admin',
// 			slug: 'admin'
// 		});
// 		return groups;
// 	}
// });
//
// Template.adminUserListBackup.events({
// 	'click .promote': function(e) {
// 		e.preventDefault();
// 		var elem = $(e.currentTarget);
// 		NProgress.start();
// 		var userId = elem.data('userid');
// 		var role = elem.data('role');
// 		Meteor.call('promoteUser', userId, role);
// 		NProgress.done();
// 	},
//
// 	'click .revoke': function(e) {
// 		e.preventDefault();
// 		var elem = $(e.currentTarget);
// 		NProgress.start();
// 		var userId = elem.data('userid');
// 		var role = elem.data('role');
// 		Meteor.call('revokeUser', userId, role);
// 		NProgress.done();
// 	},
//
// 	'click .delete-user': function(e) {
// 		e.preventDefault();
// 		var elem = $(e.currentTarget);
// 		NProgress.start();
// 		var userId = elem.data('userid');
//
// 		var notice = ClientHelper.confirm('danger', 'Are you sure want to delete this user?');
// 		notice.get().on('pnotify.confirm', function() {
// 			Meteor.call('deleteUser', userId, function(error, result){
// 				if(error) console.log("error", error);
// 				if(result) ClientHelper.notify('success', 'The selected user has been deleted.', true);
// 			});
// 		});
// 		NProgress.done();
// 	}
//
// });
