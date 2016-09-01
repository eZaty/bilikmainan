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

	$('.file-input').fileinput();
});

Template.adminPhotoGallery.helpers({
	albums: function() {
		return Albums.find({}, {
			sort: {
				created_at: -1
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

	getPhotosCount: function(id) {
		return Galleries.find({album_id: id}).count();
	},

	getFirstPhotoThumb: function(id) {
		var photo = Galleries.findOne({album_id: id},
			{
				sort: {
					uploadedAt: 1,
					limit: 1
				}
			});

		return photo.S3Url('galleryThumbs');
	},

	getFormattedSize: function(size) {
		return (parseInt(size)/1024).toFixed(2);
	}
});

Template.adminPhotoGallery.events({
	'click [data-popup="lightbox"]': function(e) {
		e.preventDefault();
	},

	'change #upload-photo': function(e){
		if ($('#upload-photo').get(0).files.length<=0){
			$('#btnUpload').attr('disabled','disabled');
		}
		else{
			$('#btnUpload').removeAttr('disabled');
		}
	},

	'submit #form-photo': function(e) {
		e.preventDefault();
		var elem = $(e.currentTarget);
		NProgress.start();
		if ($('#upload-photo').val() != ''){
			var d = new Date().getTime();

			var album_uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c){
				var r = (d + Math.random()*16)%16|0;
				d = Math.floor(d/16);
				return (c=='x' ? r:(r&0x7|0x8)).toString(16);
			});

			var params = {
				title: $('#title').val()
			}

			Meteor.call('addAlbum', params, function(error, result){
				if (error){}

				if (result){
					var album = Albums.findOne(result);

					var uploadedPhotos = [];

					for (i=0; i<$('#upload-photo').get(0).files.length; i++){
						var file = $('#upload-photo').get(0).files[i];
						var newFile = new FS.File(file);
						newFile.userId = Meteor.userId();
						newFile.album_id = album._id;

						Galleries.insert(newFile, function(err, fileObj){
							if(err){
								uploadedPhotos.push(null);
								console.log(err);
							}
							else {
								
								// var tags = $('#tags').val().trim().split(",");

								// if (tags.length>0){
								// 	for(i=0; i< tags.length; i++){
								// 		var tag = tags[i].trim();
								// 		if (tag != ""){
								// 			var params = {
								// 				tag: tag,
								// 				obj: 'gallery-photo',
								// 				obj_id: fileObj._id
								// 			}

								// 			Meteor.call('addTag', params, function(error, result){
								// 				if(error){
								// 					console.log("error adding tag: " + tag, error);
								// 				}
								// 				if(result){
								// 					elem[0].reset();
								// 					$('#uniform-upload-photo .filename').html('No file selected');
								// 					$('.btn-close').click();
								// 					$.uniform.update();
								// 				}
								// 			});
								// 		}
								// 	}
								// } else {
								// 	elem[0].reset();
								// 	$('#uniform-upload-photo .filename').html('No file selected');
								// 	$('.btn-close').click();
								// 	$.uniform.update();
								// }
								var intervalHandle = Meteor.setInterval(function () {
                                    if (fileObj.hasStored("galleryImages")) {
                                        var photo = {
											key: fileObj.copies.galleryImages.key
										}

										uploadedPhotos.push(photo);

										Meteor.clearInterval(intervalHandle);
                                    }
                                }, 1000);
							}
						});
					}

					var intervalHandle2 = Meteor.setInterval(function () {
                        if (uploadedPhotos.length>=$('#upload-photo').get(0).files.length) {
                            Meteor.call('addTimeline', {
								collection: 'albums',
								postId: album._id,
								albumTitle: album.title,
								createdAt: album.created_at,
								userId: Meteor.userId(),
								userName: Meteor.user().profile.nickName,
								photos: uploadedPhotos
							});

							var prms = {
				                'title': result.title,
				                'type': 'New Photo Album'
				            }
				            
				            //Meteor.call('pushNotification', prms);

				            elem[0].reset();
				            var msg = 'Album successfully created.';
							ClientHelper.notify('success', msg, true);
							$('#uniform-upload-photo .filename').html('No file selected');
							$('.btn-close').click();
							$.uniform.update();

							Meteor.clearInterval(intervalHandle2);
                        }
                    }, 1000);
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

	'click .delete-album': function(e) {
		e.preventDefault();
		var elem = $(e.currentTarget);
		var albumId = elem.data('id');
		var notice = ClientHelper.confirm('danger', 'Are you sure want to delete this album?');
		notice.get().on('pnotify.confirm', function() {
			Meteor.call('deleteAlbum', albumId, function(error, result){
				if(error) {
					console.log("error", error);
					var msg = 'Failed to delete album.';
					ClientHelper.notify('danger', msg, true);
				}
				if(result){
					
					var msg = 'Album has been removed.';
					ClientHelper.notify('success', msg, true);
				}
			});
		});
	}
});
