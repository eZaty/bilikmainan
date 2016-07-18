var Helpers = {
	checkS3: function(fileObj) {
		var gallery = Galleries.findOne(fileObj._id);
		if(gallery.copies) {
			if(gallery.copies.galleryImages) {

				Meteor.call('addTimeline', {
					collection: 'galleries',
					postId: fileObj._id,
					createdAt: gallery.uploadedAt,
					userId: Meteor.userId(),
					userName: Meteor.user().profile.nickName,
					title: fileObj.title,
					description: fileObj.description,
					photoKey: gallery.copies.galleryImages.key
				});

				return null;
			} else {
				setTimeout(function () {
					Helpers.checkS3(fileObj);
				}, 1000);
			};
		} else {
			setTimeout(function () {
				Helpers.checkS3(fileObj);
			}, 1000);
		}
	}
}

Template.adminPhotoGallery.onRendered(function() {
	ClientHelper.activeMenu('adminPhotoGallery', 'adminMobile');
	ClientHelper.startLazy();

	// Setting datatable defaults
	$.extend( $.fn.dataTable.defaults, {
		autoWidth: false,
		columnDefs: [
			{
				orderable: false,
				width: '20px',
				targets: 0
			},
			{
				orderable: false,
				width: '100px',
				targets: 1
			},
			{
				orderable: false,
				width: '90px',
				targets: 6
			}
		],
		order: [[ 2, "asc" ]],
		lengthMenu: [ 25, 50, 75, 100 ],
		displayLength: 25,
		dom: '<"datatable-header"fl><"datatable-scroll"t><"datatable-footer"ip>',
		language: {
			search: '<span>Filter:</span> _INPUT_',
			lengthMenu: '<span>Show:</span> _MENU_',
			paginate: { 'first': 'First', 'last': 'Last', 'next': '&rarr;', 'previous': '&larr;' }
		},
		drawCallback: function () {
			$(this).find('tbody tr').slice(-3).find('.dropdown, .btn-group').addClass('dropup');
		},
		preDrawCallback: function() {
			$(this).find('tbody tr').slice(-3).find('.dropdown, .btn-group').removeClass('dropup');
		}
	});

	// Initialize table
	var media_library = $('.media-library').DataTable({
		drawCallback: function () {
			$(this).find('tbody tr').slice(-3).find('.dropdown, .btn-group').addClass('dropup');
		},
		preDrawCallback: function() {
			$(this).find('tbody tr').slice(-3).find('.dropdown, .btn-group').removeClass('dropup');
		}
	});

	// Lightbox
	$('[data-popup="lightbox"]').fancybox({
		padding: 3,
		type: 'image'
	});


	// Styles checkboxes, radios
	$('.styled').uniform({
		wrapperClass: 'bg-white'
	});


	// Add placeholder to the datatable filter option
	$('.dataTables_filter input[type=search]').attr('placeholder','Type to filter...');


	// Enable Select2 select for the length option
	$('.dataTables_length select').select2({
		minimumResultsForSearch: Infinity,
		width: 'auto'
	});

	$('.file-input').fileinput({
		browseLabel: 'Browse',
		browseClass: 'btn btn-default',
		removeLabel: '',
		uploadAsync: true,
		browseIcon: '<i class="icon-plus22 position-left"></i> ',
		removeClass: 'btn btn-danger btn-icon',
		removeIcon: '<i class="icon-cancel-square"></i> ',
		layoutTemplates: {
			caption: '<div tabindex="-1" class="form-control file-caption {class}">\n' + '<span class="icon-file-plus kv-caption-icon"></span><div class="file-caption-name"></div>\n' + '</div>'
		},
		initialCaption: "No file selected",
		allowedFileExtensions: ["jpg", "jpeg", "gif", "png"]
	});

});

Template.adminPhotoGallery.helpers({
	galleries: function() {
		return Galleries.find({}, {
			sort: {
				uploadedAt: -1
			}
		});
	},

	getUser: function(userId) {
		var usr = Meteor.users.findOne(userId);
		if(usr != undefined) return usr.profile.nickName;
	},

	formatDate: function(date) {
		return moment(date).format('MMM Do YYYY');
	},

	getTags: function(id) {
		var tags = Tags.find({
			obj_ids: id
		});

		var str = "";

		if (tags){
			tags.forEach(function(tag){
				str += tag.tag + ", ";
			});

			return str.substring(0, str.length - 2);
		}else{
			return "";
		}
	},

	getFormattedSize: function(size) {
		return (parseInt(size)/1024).toFixed(2);
	}
});

Template.adminPhotoGallery.events({
	'click [data-popup="lightbox"]': function(e) {
		e.preventDefault();
	},

	'submit #form-photo': function(e) {
		e.preventDefault();
		var elem = $(e.currentTarget);
		NProgress.start();
		if ($('#upload-photo').val() != ''){
			var file = $('#upload-photo').get(0).files[0];
			var newFile = new FS.File(file);
			newFile.userId = Meteor.userId();
			newFile.title = $('#title').val();
			// newFile.video = $('#video').val();
			newFile.description = $('#description').val();

			Galleries.insert(newFile, function(err, fileObj){
				if(err) console.log(err);
				else {
					var tags = $('#tags').val().trim().split(",");

					if (tags.length>0){
						for(i=0; i< tags.length; i++){
							var tag = tags[i].trim();
							if (tag != ""){
								var params = {
									tag: tag,
									obj: 'gallery-photo',
									obj_id: fileObj._id
								}

								Meteor.call('addTag', params, function(error, result){
									if(error){
										console.log("error adding tag: " + tag, error);
									}
									if(result){
										elem[0].reset();
										$('#uniform-upload-photo .filename').html('No file selected');
										$('.btn-close').click();
										$.uniform.update();
									}
								});
							}
						}
					} else {
						elem[0].reset();
						$('#uniform-upload-photo .filename').html('No file selected');
						$('.btn-close').click();
						$.uniform.update();
					}

					Helpers.checkS3(fileObj);
				}
			});
			NProgress.done();
		}
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

	'click .delete-photo': function(e) {
		e.preventDefault();
		var elem = $(e.currentTarget);
		var galleryId = elem.data('id');
		var notice = ClientHelper.confirm('danger', 'Are you sure want to delete this photo?');
		notice.get().on('pnotify.confirm', function() {
			Meteor.call('deleteGallery', galleryId, function(error, result){
				if(error) {
					console.log("error", error);
					var msg = 'Failed to delete photo.';
					ClientHelper.notify('danger', msg, true);
				}
				if(result){
					Meteor.call('deleteTimeline', galleryId);
					var msg = 'Photo has been removed from gallery.';
					ClientHelper.notify('success', msg, true);
				}
			});
		});
	}
});
