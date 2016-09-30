Template.home.rendered = function(){
    // $("#js-rotating").Morphext({
    //     animation: "fadeInLeft",
    //     // separator: "|",
    //     speed: 2000,
    //     complete: function () {
    //     }
    // });

    var wall = new Freewall("#freewall");
    wall.reset({
        selector: '.brick',
        animate: true,
        cellW: 150,
        cellH: 150,
        onResize: function() {
            wall.fitWidth();
        }
    });

    var browserWidth = $(window).width();

    var imgWidth = browserWidth/5;


    $('.brick').width(imgWidth).height(imgWidth);

    var blogPostCoverWidth = $('#latest-blog-post').width();

    $('.blog-post-cover').height(blogPostCoverWidth/2);


    var announcementCoverWidth = $('.announcement-card').width();

    $('.announcement-cover').height(announcementCoverWidth*3/4);

    var titleMaxHeight = Math.max.apply(null, $(".home-announcement-title").map(function ()
        {
            return $(this).height();
        }).get());

    $(".home-announcement-title").height(titleMaxHeight);

    var postedByMaxHeight = Math.max.apply(null, $(".home-announcement-posted-by").map(function ()
        {
            return $(this).height();
        }).get());

    $(".home-announcement-posted-by").height(postedByMaxHeight);

    $('#video-div').html('<video id="bgvids" width="100%" height="100%" autoplay="true" loop="true" muted="true" poster=""><source src="http://webe-playroom.s3.amazonaws.com/videos/comms/Webe%20Raya%20Event.mp4" type="video/mp4" /></video>');
}

Template.home.helpers({
    'quoteImage': function() {
        var arr = [
            '/images/start-here-go-anywhere_black.png',
            '/images/start-here-go-anywhere_blue.png',
            '/images/start-here-go-anywhere_orange.png',
            '/images/start-here-go-anywhere_turquoise.png'
        ];
        var rand = Math.floor((Math.random()*arr.length));
        var randNumber = arr[rand];
        return arr.splice(rand,1);
    },

    'photos': function(){
        var photos = Galleries.find({},{
            sort: {
                uploadedAt: -1
            },
            limit: 10
        });

        return photos;
    },

    posts: function() {
        var posts = Blog_Posts.find(
            {
                status: "published"
            },
            {
                sort:
                {
                    created_at: -1
                },
                limit: 2
            }
        );

        return posts;
    },

    announcements: function() {
        var posts = Announcement_Posts.find(
            {
                status: "published"
            },
            {
                sort:
                {
                    created_at: -1
                },
                limit: 4
            }
        );

        return posts;
    }
});

Template.home.events({
    'click a.module-internal': function(e) {
        e.preventDefault();
        var elem = $(e.currentTarget);
        var data = elem.data('internalonly');
        var url = elem.attr('href');
        if(data) {
            ClientHelper.internalOnly(function(status){
                if(status) {
                    // console.log('prohibited', status);
                    ClientHelper.notify('warning', 'Sorry, module <strong>'+data+'</strong> is not accessible from outside at this moment.', false);
                } else {
                    // console.log('allowed', status);
                    location.href = url;
                }
            });
        }
    }
});
