Template.webetv2.rendered = function(){
	var showingTime = 10000; // 10 seconds
	document.body.style.overflow = "hidden";
	var winHeight = window.innerHeight;
	var viewportWidth = $('#tv-root').width();
	var viewportHeight = $('#tv-root').height();

	$('#webetv-carousel').height(viewportWidth*9/16);
	$('#webetv-contents').width(viewportWidth);
	$('#webetv-contents').height(viewportWidth*9/16);
	// $('#webetv-comments').prop('left',viewportWidth-500);
	// $('#webetv-comments').prop('top',0);
	// $('#webetv-footer').height(150);

	

	// var clock = $('.clock').FlipClock({
	// 		clockFace: 'TwentyFourHourClock',
	// 		showSeconds: true
	// 	});


	var initialItemID = $('.carousel-inner > .item:eq(0)').attr('id');

	if (initialItemID!=undefined){
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


	$('#newsticker').vTicker('init',{
		pause: 10000,
		mousePause: false
	});

	//bClocksInitialised = true;
    //oClockAnalog.fInit();
    //oClockDigital.fInit();

    var monthNames = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ]; 
	var dayNames= ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]

	// Create a newDate() object
	var newDate = new Date();
	// Extract the current date from Date object
	newDate.setDate(newDate.getDate());
	// Output the day, date, month and year    
	$('#Date').html(dayNames[newDate.getDay()] + " " + newDate.getDate() + ' ' + monthNames[newDate.getMonth()] + ' ' + newDate.getFullYear());

	setInterval( function() {
		// Create a newDate() object and extract the seconds of the current time on the visitor's
		var seconds = new Date().getSeconds();
		// Add a leading zero to seconds value
		$("#sec").html(( seconds < 10 ? "0" : "" ) + seconds);
		},1000);
		
	setInterval( function() {
		// Create a newDate() object and extract the minutes of the current time on the visitor's
		var minutes = new Date().getMinutes();
		// Add a leading zero to the minutes value
		$("#min").html(( minutes < 10 ? "0" : "" ) + minutes);
	    },1000);
		
	setInterval( function() {
		// Create a newDate() object and extract the hours of the current time on the visitor's
		var hours = new Date().getHours();
		// Add a leading zero to the hours value
		$("#hours").html(( hours < 10 ? "0" : "" ) + hours);
	    }, 1000);
}

Template.webetv2.helpers({
	trainings: function(){
		return Scool_Trainings.find({}, {
	      sort: { start: -1 }
	    });
	},

	contents: function(){
		var contents = Timelines.find({
			collection: {
				$nin: ['polls','albums','blogs','galleries']
			},
			announcementType: 'video'
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

		if (objType=="video"){
			Meteor.subscribe('comments', objId);

			var comments = Comments.find({}, {
				sort: { createdAt: -1 },
				limit: 50
			});

			return comments;
		}else{
			return null;
		}

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
