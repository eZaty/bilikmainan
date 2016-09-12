Template.registerHelper('bulletin_post_cover', function(id){
	return bulletin_post_cover_photo(id,'full');
});

Template.registerHelper('bulletin_post_content_photo', function(id){
	return bulletin_post_content_photo(id,'full');
});

Template.registerHelper('bulletin_post_content_preview', function(content){
	var content = $(content).text();

	return content.substr(0,200) + "...";
});

Template.registerHelper('bulletin_root', function(){
	return BULLETIN_CONFIG.root;
});

Template.registerHelper('bulletin_post_type', function(id){		
	var type = Bulletin_Post_Types.findOne(id);

	if (type){
		return type.title;
	}else{
		return '[-]';
	}
});