var nbImgLoaded = 0;

Template.poplayer.helpers({
    'post' : function(){
		return Wordpress.find();
	},
	'postCount' : function(){
		var nbPosts = Wordpress.find().count();
		console.log("nb posts: " + nbPosts);
		return nbPosts;
	},
	'trimString' : function(str, start, end){
		return str.substring(start,end);
	},
	'trimDatetime' : function(datetimeStr){
		return datetimeStr.replace(/:/g, "-");
	},
	'getImage' : function(str){
		var imgs = [];
		var rex = /<img.*?src=['"](.*?)['"]/;

		if ( m = rex.exec( str ) ) {
		    imgs.push( m[1] );
		}

		if (imgs.length > 0) {
			return imgs[0];
		} else {
			return "/images/placeholder.jpg";
        }
	},
	'getSite' : function(str){
		var tmp = str.split('/');

		return '<span class="label site-label site-label-' + tmp[3] + '">' + tmp[3] + '</span>';
	}
});

Template.poplayer.events({
    'mouseenter .webePost' : function(event){
		$('#adsGallery #' + event.currentTarget.id + ' .caption').animate({ opacity : 0}, 300, function() {
    		$('#adsGallery #' + event.currentTarget.id + ' .read-more').animate({ opacity : 1}, 200);
  		});
	},
	'mouseleave .webePost' : function(event){
		$('#adsGallery #' + event.currentTarget.id + ' .read-more').animate({ opacity : 0}, 200, function() {
    		$('#adsGallery #' + event.currentTarget.id + ' .caption').animate({ opacity : 1}, 300);
  		});
	},
	'load .ads-img' : function(event){
		nbImgLoaded++;

		if (nbImgLoaded == $('.ads-img').length){
			$('#adsGallery').show();
			$('#pageLoader').fadeOut("slow");
			$('#adsGallery').justifiedGallery({
                rowHeight : $('.ads-modal-body').height()/4,
                lastRow : 'nojustify',
                margins : 10,
                captionSettings: { animationDuration: 500,
                                    visibleOpacity: 1,
                                    nonVisibleOpacity: 1 }
            });
		}
	}
});
