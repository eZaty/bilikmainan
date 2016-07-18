Template.registerHelper('announcement_post_cover', function(id){
	return announcement_post_cover_photo(id,'full');
});

Template.registerHelper('announcement_channel_cover', function(id){
	return announcement_channel_cover_photo(id,'full');
});

Template.registerHelper('announcement_post_content_photo', function(id){
	return announcement_post_content_photo(id,'full');
});

Template.registerHelper('announcement_channel_path', function(id){
	var channelId = id;

	if (!id){
		channelId = Session.get('selectedChannelId');
	}
	
	var channel = Announcement_Channels.findOne(channelId);

	if (channel){
		return channel.path;
	}else{
		return '[undefined]';
	}
});

Template.registerHelper('announcement_post_content_preview', function(content){
	var content = $(content).text();

	return content.substr(0,200) + "...";
});

Template.registerHelper('announcement_root', function(){
	return ANNOUNCEMENT_CONFIG.root;
});