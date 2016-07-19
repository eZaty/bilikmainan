Template.adminPolls.onRendered(function() {
	ClientHelper.activeMenu('adminPolls', 'adminPolls');
});

Template.adminPolls.helpers({
	polls: function() {
		return Polls.find();
	},

	getUser: function(userId) {
		var usr = Meteor.users.findOne(userId);
		if(usr != undefined) return usr.profile.nickName;
	},

	formatDate: function(date) {
		return moment(date).format('MMM Do YYYY');
	}
});

Template.adminPolls.events({

	'submit #form-submit': function(e) {
		console.log('masuk');
		e.preventDefault();
		var elem = $(e.currentTarget);
		NProgress.start();

		var options = [];
		var j = 1;
		for(var i=1; i<=10; i++) {
			var opt = $('#option_'+i).val() ? $('#option_'+i).val() : null;
			if(opt != null) {
				if(j == 1) obj = { option_1: opt };
				else if(j == 2) obj = { option_2: opt };
				else if(j == 3) obj = { option_3: opt };
				else if(j == 4) obj = { option_4: opt };
				else if(j == 5) obj = { option_5: opt };
				else if(j == 6) obj = { option_6: opt };
				else if(j == 7) obj = { option_7: opt };
				else if(j == 8) obj = { option_8: opt };
				else if(j == 9) obj = { option_9: opt };
				else if(j == 10) obj = { option_10: opt };
				options.push(obj);
				j++;
			}
		}

		var params = {
			type: 'poll',
			createdAt: new Date(),
			ending: new Date($('#ending').val()),
			userId: Meteor.userId(),
			question: $('#question').val(),
			channel: $('#channel').val(),
			options: options,
			total: (j-1)
		}
		Meteor.call('addPoll', params, function(error, result){
			if(error) console.log("error", error);
			else if(result) {
				// -- timeline
				Meteor.call('addTimeline', {
					collection: 'polls',
					postId: result,
					createdAt: params.createdAt,
					ending: params.ending,
					channel: params.channel,
					userId: Meteor.userId(),
					userName: Meteor.user().profile.nickName
				});

				var prms = {
	                'title': $('#question').val(),
	                'type': 'New Poll'
	            }

	            Meteor.call('pushNotification', prms);
			}
			elem[0].reset();
			$('.btn-close').click();
		});

		NProgress.done();
	},

	'change .media-library tbody td input[type=checkbox]': function(e) {
		e.preventDefault();
		var elem = $(e.currentTarget);
		if (elem.is(':checked')) {
			elem.parents('tr').addClass('success');
			$.uniform.update();
		}
		else {
			elem.parents('tr').removeClass('success');
			$.uniform.update();
		}
	},

	'click .delete-poll': function(e) {
		e.preventDefault();
		var elem = $(e.currentTarget);
		var pollId = elem.data('id');
		var notice = ClientHelper.confirm('danger', 'Are you sure want to delete this poll?');
		notice.get().on('pnotify.confirm', function() {
			Meteor.call('deletePoll', pollId, function(error, result){
				if(error) {
					console.log("error", error);
					var msg = 'Failed to delete poll.';
					ClientHelper.notify('danger', msg, true);
				}
				if(result){
					Meteor.call('deleteTimeline', pollId);
					Meteor.call('removePollVotesByPollId', pollId);
					var msg = 'Poll has been removed from record.';
					ClientHelper.notify('success', msg, true);
				}
			});
		});
	}
});
