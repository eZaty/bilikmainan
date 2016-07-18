Template.featuredAnnouncementPosts.rendered = function(){

};

Template.featuredAnnouncementPosts.helpers({
	posts: function() {
		return posts = Announcement_Posts.find({
			featured: 'yes',
			status: 'published'
		},{sort: {created_at: -1}, limit: ANNOUNCEMENT_CONFIG.maxFeaturedPostsListing});
	}
});

Template.featuredPosts.events({
	'load': function(){
		$('.owl-carousel').owlCarousel({
		    loop:true,
		    margin:10,
		    nav:true,
		    responsive:{
		        0:{
		            items:1
		        },
		        600:{
		            items:3
		        },
		        1000:{
		            items:5
		        }
		    }
		});
	}
});