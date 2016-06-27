var previousUserId = undefined;
var previousTime = undefined;
var lastChatTime = undefined;
var imgCount = 0;
var Scheme = {
    scrollChat: function() {
        var height = 0;
        var margin = 10;
        $('ul.chat-list li').each(function(i, value){
            height += parseInt($(this).height()) + margin;
        });
        $('#chat-container ul.chat-list').animate({ scrollTop: height }, 'slow');
        $('#text-chat').focus();
        $("img.lazy").trigger("unveil");
    }
}

Template.chatBoard.onCreated(function(){
    instance = this;
    instance.autorun(function(){
        // Meteor.subscribe('profiles');
        // Meteor.subscribe('allUsers');
        Meteor.subscribe('chat-users', 50, {
            services: 0
        });
    });
});



// Template.chatBoard.rendered = function(){
Template.chatBoard.onRendered(function(){

    var pfx = ["webkit", "moz", "MS", "o", ""];
    function PrefixedEvent(element, type, callback) {
        for (var p = 0; p < pfx.length; p++) {
            if (!pfx[p]) type = type.toLowerCase();
            element.addEventListener(pfx[p]+type, callback, false);
        }
    }

    function AnimationListener() {
        if($('#chat-container').hasClass('bounceOutDown')) {
            $('#chat-container').addClass('hide').removeClass('bounceOutDown');
        }
        else if($('#chat-container').hasClass('bounceInUp')) {
            $('#chat-container').removeClass('bounceInUp');
        }
    }

    var chatContainer = document.getElementById('chat-container');
    chatContainer.addEventListener("AnimationEnd", AnimationListener, false);
    PrefixedEvent(chatContainer, "AnimationEnd", AnimationListener);

    $(window).resize(function(){
        var h = $('#chat-container').height() - 130;
        $('#chat-container ul.chat-list').css('max-height', h);
    });

    $('[data-popup="tooltip"]').tooltip();

    ClientHelper.startLazy();
});

Template.chatBoard.helpers({

    chats: function(){
        var chats = Chats.find({
            chatid: '@engage'
        }, {
            sort: {
                time: -1
            },
            limit: 50
        });
        var chts = chats.fetch().reverse();
        if(!chts.length) return;
        var lastId = chts[chts.length-1]._id;

        var checkExist = setInterval(function() {
            var lastImg = $('img[data-id="'+lastId+'"]');
            if (lastImg.length) {
                lastImg.removeClass('lazy');
                lastImg.attr('src', lastImg.data('src'));
                clearInterval(checkExist);
            }
        }, 100);

        return chts;
    },

    isMyChat: function(userId) {
        if(userId == Meteor.userId()) return true;
        else return false;
    },

    // getUser: function(userId) {
    //     var usr = Meteor.users.findOne(userId);
    //     if(usr != undefined) return usr.profile.nickName;
    // },

    isNotSameUser: function(userId) {
        if(userId != previousUserId) {
            previousUserId = userId;
            return true;
        } else return false;
    },

    chatTimestamp: function(time) {
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

    isExceedTime: function(time) {
        var firstdiff = moment(time).diff(lastChatTime);
        if(firstdiff == 0) {
            // do nothing
        }
        else if(previousTime == undefined) {
            previousTime = moment(time).add(-10, 'minutes').toDate();
        }
        var msgtime = moment(time);
        var prev = moment(previousTime);
        var diff = msgtime.diff(prev, 'minutes');
        var maxMinute = 5; //-- if > 5 minutes, display time
        if(diff > maxMinute) {
            previousTime = time;
            return true;
        }
        else return false;
    },

    // isNeedRefresh:

});

Template.chatBoard.events({

    // -- chat
    'click #float-btn, click .close-chat': function(e) {
        e.preventDefault();
        var $chatBox = $('#chat-container');
        if($chatBox.hasClass('hide')) {
            $chatBox.removeClass('hide').addClass('bounceInUp').removeClass('bounceOutDown');
            var h = $('#chat-container').height() - 130;
            $('#chat-container ul.chat-list').css('max-height', h);
            Scheme.scrollChat();
            $("img.lazy").trigger("unveil");
        } else {
            $chatBox.removeClass('bounceInUp').addClass('bounceOutDown')
        }
    },

    'submit #chat-form': function(e){
        e.preventDefault();

        var elem = $(e.currentTarget);
        var time = new Date();
        var text = $('#text-chat').val();
        var chatid = "@engage";

        if(text.length < 1) return;
        NProgress.start();
        $('#text-chat').attr('disabled', true);

        var params = {
            sender : Meteor.userId(),
            senderName: Meteor.user().profile.nickName,
            text : text,
            time : time,
            chatid : chatid
        }
        previousTime = undefined;
        Meteor.call('insertChat', params, function(error, result){
            if(error) console.log("error", error);
            if(result){
                lastChatTime = time;
                $('#text-chat').val('').attr('disabled', false);
                Scheme.scrollChat();

                // var checkExist = setInterval(function() {
                //     var lastImg = $('img[data-id="'+result+'"]');
                //     if (lastImg.length) {
                //         // lastImg.removeClass('lazy');
                //         // $("img.lazy").trigger("unveil");
                //         lastImg.unveil();
                //         clearInterval(checkExist);
                //     }
                // }, 100);
                // Session.set('CHAT_CURR_ID', result);

                NProgress.done();
            }
        });

        // Scheme.scrollChat();
    },

    'mouseover #chat-container': function(e) {
        e.preventDefault();
        $('body').css('overflow', 'hidden');
    },

    'mouseout #chat-container': function(e) {
        e.preventDefault();
        $('body').css('overflow', 'auto');
    },

    'click .profile-link': function(e){
        e.preventDefault();
        var elem = $(e.currentTarget);
        var link = elem.attr('href');
        $('body').css('overflow', 'auto');
        Router.go(link);
    }

});
