Template.adminAnnouncementMailingList.rendered = function() {
  	$('#employees').DualListBox({},[]);
};

Template.adminAnnouncementMailingList.helpers({
	mail_lists: function() {
		return Announcement_Mailing_Lists.find();
	},

	mail_list: function(){
		return Announcement_Mailing_Lists.findOne(Session.get('selectedMailListId'));
	}
});


Template.adminAnnouncementMailingList.events({
	'submit #form-mail-list': function(e) {
		e.preventDefault();
		var elem = $(e.currentTarget);
		var mode = $('#mode').val();

		NProgress.start();

		var selected_employees = [];

		$('#form-mail-list select.selected').find('option').each(function() { 
			selected_employees.push($(this).val()); 
		});

		var params = {
			title: $('#mail-list-title').val(),
			recipients: selected_employees
		}

		if (mode == "create"){
			Meteor.call('addAnnouncementMailingList', params, function(error, result){
				if(error){
					console.log("error", error);
					var msg = 'Failed to add mailing list.';
					ClientHelper.notify('danger', msg, true);
				}
				if(result){
					var msg = 'Mailing list successfully added.';

					ClientHelper.notify('success', msg, true);
					elem[0].reset();
					$('#employees').DualListBox();
					$('.btn-close').click();
				}
			});
		}else if (mode == "update"){
			var mailListId = Session.get('selectedMailListId');

			Meteor.call('updateAnnouncementMailingList', mailListId, params, function(error, result){
				if(error){
					console.log("error", error);
					var msg = 'Failed to update mailing list.';
					ClientHelper.notify('danger', msg, true);
				}
				if(result){
					var msg = 'Mailing list successfully updated.';

				
					ClientHelper.notify('success', msg, true);
					elem[0].reset();
					$('#employees').DualListBox();
					$('.btn-close').click();
				}
			});
		}

		NProgress.done();
	},

	'click .add-mail-list': function(e) {
		// unselect all employees
		$('.atl').click();

		$('#mode').val('create');
		$('button[type="submit"]').html('Create');
		$('.modal-title').html('Add New Mailing List');
		
		$('#mail-list-title').val('');

		Session.set("selectedMailListId", '');
	},

	'click .edit-mail-list': function(e) {
		var elem = $(e.currentTarget);
		var mailListId = elem.data('maillistid');

		// unselect all employees
		$('.atl').click();

		$('#mode').val('update');
		$('button[type="submit"]').html('Save');
		$('.modal-title').html('Update Mailing List');

		var mail_list = Announcement_Mailing_Lists.findOne(mailListId);

		$('#mail-list-title').val(mail_list.title);

		var recipients = mail_list.recipients;

		if (recipients.length>0){
			for(i=0; i<recipients.length; i++){
				$('option[value="' + recipients[i] + '"]').dblclick();
			}
		}

		Session.set("selectedMailListId", mailListId);
	},

	'click .delete-mail-list': function(e) {
		e.preventDefault();
		NProgress.start();
		var elem = $(e.currentTarget);
		var mailListId = elem.data('maillistid');

		var notice = ClientHelper.confirm('danger', 'Are you sure want to delete this mailing list?');
		notice.get().on('pnotify.confirm', function() {
			Meteor.call('deleteAnnouncementMailingList', mailListId, function(error, result){
				if(error) {
					console.log("error", error);
					var msg = 'Failed to delete mailing list.';
					ClientHelper.notify('danger', msg, true);
				}
				if(result){
					var msg = 'Mailing list has been deleted.';
					ClientHelper.notify('success', msg, true);
				}
			});
		});
		NProgress.done();
	},

	'dblclick option': function(e){
		var unselected = $('select.unselected');
        var selected = $('select.selected');

		var elem = $(e.currentTarget);
		var parentClass = elem.parent().prop('className');
		
		if (parentClass.startsWith("unselected"))
			elem.remove().appendTo(selected);

		if (parentClass.startsWith("selected"))
			elem.remove().appendTo(unselected);
	}
});