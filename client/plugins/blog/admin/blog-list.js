Template.adminBlogList.rendered = function() {
  //Meteor.typeahead.inject();
  $('#blog-editors').select2();
};

Template.adminBlogList.helpers({
	blogs: function() {
		return Blogs.find();
	},

	blog: function(){
		return Blogs.findOne(Session.get('selectedBlogId'));
	},

	editors: function() {
    	return Meteor.users.find({roles: 'blog-editor'}).fetch().map(function(object){ return {id: object._id, name: object.profile.name}; });
  	},

 	blog_cover_thumb: function(id){
 		return blog_cover_photo(id,'thumbs');
 	}
});


Template.adminBlogList.events({
	'submit #form-blog': function(e) {
		e.preventDefault();
		var elem = $(e.currentTarget);
		var mode = $('#mode').val();

		NProgress.start();

		var editors = [];
		var tmp = $('#blog-editors').val();
		
		if (tmp!=null){
			for (i=0; i<tmp.length; i++){
				var editor = {
					user_id: tmp[i]
				}
				editors.push(editor);
			}
		}

		var params = {
			title: $('#blog-title').val(),
			path: $('#blog-path').val(),
			editors: editors
		}

		if (mode == "create"){
			Meteor.call('addBlog', params, function(error, result){
				if(error){
					console.log("error", error);
					var msg = 'Failed to add blog.';
					ClientHelper.notify('danger', msg, true);
				}
				if(result){
					var msg = 'Blog successfully added.';

					if ($('#blog-cover-photo').val()!=""){
				      var cover = $('#blog-cover-photo').get(0).files[0];
				      var newCover = new FS.File(cover);
				      newCover.blogId = result;
				      newCover.fileType = 'blog_cover_photo';
				      newCover.status = 'uploading';

				      Blog_Images.insert(newCover, function(err, fileObj){
				          if(err){
				          	msg += '<br>Cover photo not uploaded.';
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
			var blogId = Session.get('selectedBlogId');

			Meteor.call('updateBlog', blogId, params, function(error, result){
				if(error){
					console.log("error", error);
					var msg = 'Failed to update blog.';
					ClientHelper.notify('danger', msg, true);
				}
				if(result){
					var msg = 'Blog successfully updated.';

					if ($('#blog-cover-photo').val()!=""){
				      var cover = $('#blog-cover-photo').get(0).files[0];
				      var newCover = new FS.File(cover);
				      newCover.blogId = blogId;
				      newCover.fileType = 'blog_cover_photo';
				      newCover.status = 'uploading';

				      Meteor.call('removeBlogCoverImage', blogId, function(err, res){

				      });

				      Blog_Images.insert(newCover, function(err, fileObj){
				          if(err){
				          	msg += '<br>Cover photo not uploaded.';
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

	'click .add-blog': function(e) {
		$('#mode').val('create');
		$('button[type="submit"]').html('Create');
		$('.modal-title').html('Add New Blog');
		
		$('#blog-path').val('');
		$('#blog-title').val('');
		$('#preview-cover-photo').prop('src', '/images/placeholder.jpg');

		Session.set("selectedBlogId", '');
	},

	'click .edit-blog': function(e) {
		var elem = $(e.currentTarget);
		var blogId = elem.data('blogid');

		$('#mode').val('update');
		$('button[type="submit"]').html('Save');
		$('.modal-title').html('Update Blog');

		var blog = Blogs.findOne(blogId);

		var editors = blog.editors;

		var editors_id = [];

		$.each(editors, function(key, item) {
			//console.log("editor: " + item.user_id);
			editors_id.push(item.user_id);
		});

		$('#blog-path').val(blog.path);
		$('#blog-title').val(blog.title);
		$('#blog-editors').val(editors_id).trigger("change");
		$('#preview-cover-photo').prop('src', blog_cover_photo(blogId,'images'));

		Session.set("selectedBlogId", blogId);
	},

	'click .delete-blog': function(e) {
		e.preventDefault();
		NProgress.start();
		var elem = $(e.currentTarget);
		var blogId = elem.data('blogid');

		var notice = ClientHelper.confirm('danger', 'Are you sure want to delete this blog?');
		notice.get().on('pnotify.confirm', function() {
			Meteor.call('deleteBlog', blogId, function(error, result){
				if(error) {
					console.log("error", error);
					var msg = 'Failed to delete blog.';
					ClientHelper.notify('danger', msg, true);
				}
				if(result){
					var msg = 'Blog has been deleted.';
					ClientHelper.notify('success', msg, true);
				}
			});
		});
		NProgress.done();
	},

	'change #blog-cover-photo': function(e){
		var file = e.currentTarget.files[0];
		var url = $('#blog-cover-photo').val();
	    var ext = url.substring(url.lastIndexOf('.') + 1).toLowerCase();
	    
	    $('#upload-msg').html('');

	    if (file) 
	     {
	     	if (ext == "gif" || ext == "png" || ext == "jpeg" || ext == "jpg"){
		     	if (file.size < 1024000){
			        var reader = new FileReader();

			        reader.onload = function (e) {
			           $('#preview-cover-photo').attr('src', e.target.result);
			        }
			        reader.readAsDataURL(file);
		    	}else{
		    		$('#upload-msg').html('Your file is too big (more than 1MB). Please select another file.');
		    	}
		    }else{
		    	$('#upload-msg').html('Your file format is not supported. Please select another file.');
		    }
	    }
	    else
	    {
	    	$('#preview-cover-photo').attr('src', '');
	    }
	}
});