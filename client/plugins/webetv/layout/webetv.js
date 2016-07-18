Template.webetv.rendered = function(){
	var showingTime = 10000; // 10 seconds
	document.body.style.overflow = "hidden";
	var viewportWidth = $(window).width();
	var viewportHeight = $(window).height();

	$('#webetv-carousel').height(viewportHeight-150);
	$('#webetv-contents').width(viewportWidth-500);
	$('#webetv-contents').height(viewportHeight);
	$('#webetv-comments').prop('left',viewportWidth-500);
	$('#webetv-comments').prop('top',0);
	$('#webetv-footer').height(150);

	var clock = $('.clock').FlipClock({
			clockFace: 'TwentyFourHourClock',
			showSeconds: true
		});


	var initialItemID = $('.carousel-inner > .item:eq(0)').attr('id');
	$('#'+initialItemID).addClass('active');

	var video = $('#' + initialItemID + ' > .carousel-vid').attr('id');

	var tmp = initialItemID.split("-");

	Session.set('timelineID', tmp[1]);

	if (video && video!==undefined){
		Session.set('timelineType', 'video');
		var vid = document.getElementById(video);
		vid.play();
	}else{
		Session.set('timelineType', 'photo');
		setTimeout(
		  function()
		  {
		    $('#webetv-carousel').carousel('next');
		  }, showingTime);
	}

	$('#webetv-carousel').carousel({
		interval: false
	});

	$('.carousel-img').width($('#webetv-carousel').width());
	$('.carousel-img').height($('#webetv-carousel').height());
	$('.carousel-vid').width($('#webetv-carousel').width());
	$('.carousel-vid').height($('#webetv-carousel').height());

	$("video").bind("ended", function() {
	   //console.log("Video ended");
	   $('#webetv-carousel').carousel('next');
	});

	$('#newsticker').vTicker('init',{
		pause: 10000,
		mousePause: false
	});

	$('#webetv-carousel').on('slide.bs.carousel', function (e) {
		var activeItemID = $(e.relatedTarget).attr('id');

		video = $('#' + activeItemID + ' > .carousel-vid').attr('id');

		// load comments
		var tmp = activeItemID.split("-");

		Session.set('timelineID', tmp[1]);

		if (video && video!==undefined){
			Session.set('timelineType', 'video');
			var vid = document.getElementById(video);
			vid.play();
		}else{
			Session.set('timelineType', 'photo');
			setTimeout(
			  function()
			  {
			    $('#webetv-carousel').carousel('next');
			  }, showingTime);
		}
	});
}

Template.webetv.helpers({
	trainings: function(){
		return Scool_Trainings.find({}, {
	      sort: { start: -1 }
	    });
	},

	contents: function(){
		var contents = Timelines.find({
			collection: {
				$ne: 'polls'
			}
		}, {
			sort: { created_at: -1 },
			// limit: 10
		});

		return contents;
	},

	getPhoto: function(obj){
		var photo;

		if (obj.collection=="blog_posts"){
			if(obj.photoKey) {
				var url = 'https://s3-ap-southeast-1.amazonaws.com/webe-playroom/images/' + obj.photoKey
				return url;
		    }else{
		        return '/images/placeholder.jpg';
		    }
		}

		if (obj.collection=="galleries"){
			if(obj.photoKey) {
				var url = 'https://s3-ap-southeast-1.amazonaws.com/webe-playroom/images/' + obj.photoKey
				return url;
		    }else{
		        return '/images/placeholder.jpg';
		    }
		}

		if (obj.collection=="announcement_posts"){
			if(obj.photoKey) {
				var url = 'https://s3-ap-southeast-1.amazonaws.com/webe-playroom/images/' + obj.photoKey
				return url;
		    }else{
		        return '/images/placeholder.jpg';
		    }
		}

	    return '/images/placeholder.jpg';
	},

	getVideo: function(obj){
		if(obj.photoKey) {
			var url = 'https://s3-ap-southeast-1.amazonaws.com/webe-playroom/videos/' + obj.photoKey
			return url;
		}else{
			return '/images/placeholder.jpg';
		}
	},

	isVideo: function(obj){
		return obj.photoKey.startsWith("announcement_videos");
	},

	getComments: function(){
		var objId = Session.get('timelineID');
		var objType = Session.get('timelineType');

		//var timeline = Timelines.findOne(objId);

		Meteor.subscribe('comments', objId);

		var comments = Comments.find();

		return comments;

		// if (objType=="video"){
		// 	var comments = Announcement_Comments.find({
		// 		announcement_post_id: objId
		// 	});

		// 	//if (comments)
		// 		return comments;
		// 	//else
		// 	//	return "There is no comment to display..";
		// }

		// if (objType=="photo"){
		// 	var comments = Blog_Comments.find({
		// 		blog_post_id: objId
		// 	});

		// 	if (comments.count()>0){
		// 		return comments;
		// 	}
		// 	else{
		// 		comments = Announcement_Comments.find({
		// 			announcement_post_id: objId
		// 		});

		// 		return comments;
		// 	}
		// 	//	return "There is no comment to display..";
		// }

		//return "There is no comment to display.."
	},

	commentTimestamp: function(time) {
        var diff = moment().diff(time, 'days');
        if(diff > 0) {
            var date = moment(time).format("MMMM Do, H:mma");
            return date;
        }
        else {
            var date = moment(time).format("H:mma");
            return date;
        }
    },

    isNotSameUser: function(userId) {
        if(userId != previousUserId) {
            previousUserId = userId;
            return true;
        } else return false;
    },

    RSSNewsItems: function(){
    	return RSS_News.find();
    }
});
