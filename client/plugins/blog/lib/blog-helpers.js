Template.registerHelper('blog_post_cover', function(id){
	return blog_post_cover_photo(id,'full');
});

Template.registerHelper('blog_cover', function(id){
	return blog_cover_photo(id,'full');
});

Template.registerHelper('blog_post_content_photo', function(id){
	return blog_post_content_photo(id,'full');
});

Template.registerHelper('blog_path', function(id){
	var blogId = id;

	if (!id){
		blogId = Session.get('selectedBlogId');
	}
	
	var blog = Blogs.findOne(blogId);

	if (blog){
		return blog.path;
	}else{
		return '[undefined]';
	}
});

Template.registerHelper('blog_post_content_preview', function(content){
	var content = $(content).text();

	return content.substr(0,200) + "...";
});

Template.registerHelper('blog_root', function(){
	return BLOG_CONFIG.root;
});