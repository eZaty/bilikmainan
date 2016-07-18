Template.adminAnnouncementChannelList.rendered = function() {
  //Meteor.typeahead.inject();
  $('#channel-editors').select2();
};

Template.adminAnnouncementChannelList.helpers({
	channels: function() {
		return Announcement_Channels.find();
	},

	channel: function(){
		return Announcement_Channels.findOne(Session.get('selectedChannelId'));
	},

	editors: function() {
    	return Meteor.users.find({roles: 'announcement-editor'}).fetch().map(function(object){ return {id: object._id, name: object.profile.name}; });
  	},

 	channel_cover_thumb: function(id){
 		return announcement_channel_cover_photo(id,'thumbs');
 	}
});


Template.adminAnnouncementChannelList.events({
	'submit #form-channel': function(e) {
		e.preventDefault();
		var elem = $(e.currentTarget);
		var mode = $('#mode').val();

		NProgress.start();

		var editors = [];
		var tmp = $('#channel-editors').val();
		
		if (tmp!=null){
			for (i=0; i<tmp.length; i++){
				var editor = {
					user_id: tmp[i]
				}
				editors.push(editor);
			}
		}

		var params = {
			title: $('#channel-title').val(),
			path: $('#channel-path').val(),
			email: $('#channel-email').val(),
			editors: editors
		}

		if (mode == "create"){
			Meteor.call('addAnnouncementChannel', params, function(error, result){
				if(error){
					console.log("error", error);
					var msg = 'Failed to add channel.';
					ClientHelper.notify('danger', msg, true);
				}
				if(result){
					var msg = 'Channel successfully added.';

					if ($('#channel-cover-photo').val()!=""){
				      var cover = $('#channel-cover-photo').get(0).files[0];
				      var newCover = new FS.File(cover);
				      newCover.channelId = result;
				      newCover.fileType = 'announcement_channel_cover_photo';
				      newCover.status = 'uploading';

				      Announcement_Images.insert(newCover, function(err, fileObj){
				          if(err){
				          	msg += '<br>Cover photo not uploaded.';
				          } else {
				              elem[0].reset();
				              //$('#uniform-upload-cover .filename').html('No file selected');
				          }
				      });
				    }

				    if ($('#channel-footer-photo').val()!=""){
				      var footer = $('#channel-footer-photo').get(0).files[0];
				      var newFooter = new FS.File(footer);
				      newFooter.channelId = result;
				      newFooter.fileType = 'announcement_channel_footer_photo';
				      newFooter.status = 'uploading';

				      Announcement_Images.insert(newFooter, function(err, fileObj){
				          if(err){
				          	msg += '<br>Footer photo not uploaded.';
				          } else {
				              elem[0].reset();
				              //$('#uniform-upload-cover .filename').html('No file selected');
				          }
				      });
				    }

					ClientHelper.notify('success', msg, true);
					elem[0].reset();
					$('.btn-close').click();
				}
			});
		}else if (mode == "update"){
			var channelId = Session.get('selectedChannelId');

			Meteor.call('updateAnnouncementChannel', channelId, params, function(error, result){
				if(error){
					console.log("error", error);
					var msg = 'Failed to update announcement channel.';
					ClientHelper.notify('danger', msg, true);
				}
				if(result){
					var msg = 'Announcement channel successfully updated.';

					if ($('#channel-cover-photo').val()!=""){
				      var cover = $('#channel-cover-photo').get(0).files[0];
				      var newCover = new FS.File(cover);
				      newCover.channelId = channelId;
				      newCover.fileType = 'announcement_channel_cover_photo';
				      newCover.status = 'uploading';

				      Meteor.call('removeAnnouncementChannelCoverImage', channelId, function(err, res){

				      });

				      Announcement_Images.insert(newCover, function(err, fileObj){
				          if(err){
				          	msg += '<br>Cover photo not uploaded.';
				          } else {
				              elem[0].reset();
				              //$('#uniform-upload-cover .filename').html('No file selected');
				          }
				      });
				    }

				    if ($('#channel-footer-photo').val()!=""){
				      var footer = $('#channel-footer-photo').get(0).files[0];
				      var newFooter = new FS.File(footer);
				      newFooter.channelId = channelId;
				      newFooter.fileType = 'announcement_channel_footer_photo';
				      newFooter.status = 'uploading';

				      Meteor.call('removeAnnouncementChannelFooterImage', channelId, function(err, res){

				      });

				      Announcement_Images.insert(newFooter, function(err, fileObj){
				          if(err){
				          	msg += '<br>Footer photo not uploaded.';
				          } else {
				              elem[0].reset();
				              //$('#uniform-upload-cover .filename').html('No file selected');
				          }
				      });
				    }

					ClientHelper.notify('success', msg, true);
					elem[0].reset();
					$('.btn-close').click();
				}
			});
		}

		NProgress.done();
	},

	'click .add-channel': function(e) {
		$('#mode').val('create');
		$('button[type="submit"]').html('Create');
		$('.modal-title').html('Add New Channel');
		
		$('#channel-path').val('');
		$('#channel-email').val('');
		$('#channel-title').val('');
		$('#preview-cover-photo').prop('src', '/images/placeholder.jpg');
		$('#preview-footer-photo').prop('src', '/images/placeholder.jpg');

		Session.set("selectedChannelId", '');
	},

	'click .edit-channel': function(e) {
		var elem = $(e.currentTarget);
		var channelId = elem.data('channelid');

		$('#mode').val('update');
		$('button[type="submit"]').html('Save');
		$('.modal-title').html('Update Channel');

		var channel = Announcement_Channels.findOne(channelId);

		var editors = channel.editors;

		var editors_id = [];

		$.each(editors, function(key, item) {
			//console.log("editor: " + item.user_id);
			editors_id.push(item.user_id);
		});

		$('#channel-path').val(channel.path);
		$('#channel-title').val(channel.title);
		$('#channel-email').val(channel.email);
		$('#channel-editors').val(editors_id).trigger("change");
		$('#preview-cover-photo').prop('src', announcement_channel_cover_photo(channelId,'full'));
		$('#preview-footer-photo').prop('src', announcement_channel_footer_photo(channelId,'full'));

		Session.set("selectedChannelId", channelId);
	},

	'click .delete-channel': function(e) {
		e.preventDefault();
		NProgress.start();
		var elem = $(e.currentTarget);
		var channelId = elem.data('channelid');

		var notice = ClientHelper.confirm('danger', 'Are you sure want to delete this channel?');
		notice.get().on('pnotify.confirm', function() {
			Meteor.call('deleteAnnouncementChannel', channelId, function(error, result){
				if(error) {
					console.log("error", error);
					var msg = 'Failed to delete channel.';
					ClientHelper.notify('danger', msg, true);
				}
				if(result){
					var msg = 'Channel has been deleted.';
					ClientHelper.notify('success', msg, true);
				}
			});
		});
		NProgress.done();
	},

	'change #channel-cover-photo': function(e){
		var file = e.currentTarget.files[0];
		var url = $('#channel-cover-photo').val();
	    var ext = url.substring(url.lastIndexOf('.') + 1).toLowerCase();

	    if (file && (ext == "gif" || ext == "png" || ext == "jpeg" || ext == "jpg")) 
	     {
	        var reader = new FileReader();

	        reader.onload = function (e) {
	           $('#preview-cover-photo').attr('src', e.target.result);
	        }
	       reader.readAsDataURL(file);
	    }
	    else
	    {
	    	$('#preview-cover-photo').attr('src', '');
	    }
	},

	'change #channel-footer-photo': function(e){
		var file = e.currentTarget.files[0];
		var url = $('#channel-footer-photo').val();
	    var ext = url.substring(url.lastIndexOf('.') + 1).toLowerCase();

	    if (file && (ext == "gif" || ext == "png" || ext == "jpeg" || ext == "jpg")) 
	     {
	        var reader = new FileReader();

	        reader.onload = function (e) {
	           $('#preview-footer-photo').attr('src', e.target.result);
	        }
	       reader.readAsDataURL(file);
	    }
	    else
	    {
	    	$('#preview-footer-photo').attr('src', '');
	    }
	}
});