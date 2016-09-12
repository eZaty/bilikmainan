Template.bulletinAllPosts.rendered = function(){
	Session.set("nb_posts", -1);

	var self = this;

    this.autorun(function(a) {
    	var data = Template.currentData(self.view);

        if(!data) return;

        //console.log("has data! do stuff...");
    });

    var intervalHandle = Meteor.setInterval(function () {
    	var n = $('.animate-box').length;

    	var nb_posts = Session.get("nb_posts");

    	//console.log(".animate-box length: " + n + " / posts length: " + nb_posts);

    	if (nb_posts>0 && n>0){
        	contentWayPoint();
            // file has stored, close out interval
            Meteor.clearInterval(intervalHandle);
        }else{
        	if (nb_posts == 0){
        		$('.fh5co-post-entry').html('<center><h1>This bulletin is empty.</h1></center>');
        		Meteor.clearInterval(intervalHandle);
        	}
        }
    }, 1000); 

	var contentWayPoint = function() {
		var i = 0;
		$('.animate-box').waypoint( function( direction ) {
			if( direction === 'down' && !$(this.element).hasClass('animated') ) {
				
				i++;
				
				$(this.element).addClass('item-animate');
				setTimeout(function(){
					
					$('body .animate-box.item-animate').each(function(k){
						var el = $(this);
						setTimeout( function () {
							el.addClass('fadeInUp animated');
							el.removeClass('item-animate');
						},  k * 200, 'easeInOutExpo' );
					});
					
				}, 100);
				
			}

		} , { offset: '85%' } );
	};
}

Template.bulletinAllPosts.helpers({
	posts: function(id) {
	    var channel = Bulletin_Channels.findOne(id);

        if (channel){
			var isEditor = false;

	        var editors = channel.editors;

	        // for (i=0; i<editors.length; i++){
	        //     if (editors[i].user_id==Meteor.userId()){
	        //         isEditor = true;
	        //     }
	        // }

	        var params = {
	            "channel_id": id
	        }

	        if (!isEditor){
	            params.status = "published";
	        }

	        var posts = Bulletin_Posts.find(
	            params, 
	            {sort: 
	            	{
	            		created_at: -1
	            	}
	            }
	        );
	        
	        Session.set("nb_posts", posts.count());

			return posts;
			
		}else{

		}
	},
	channelHasPosts: function(id){
		var channel = Bulletin_Channels.findOne(id);

        if (channel){
        	var isEditor = false;

	        var editors = channel.editors;
			for (i=0; i<editors.length; i++){
	            if (editors[i].user_id==Meteor.userId()){
	                isEditor = true;
	            }
	        }

			var params = {
	            "channel_id": id
	        }

	        if (!isEditor){
	            params.status = "published";
	        }

	        var nb_posts = Bulletin_Posts.find(
	            params
	        ).count();
	        
			return (nb_posts > 0);
		}else{
			return false;
		}
	}
});