Template.feedback.helpers({
    'feedbacks': function(){
        return Feedbacks.find({});
    }
});

Template.feedback.events({

    'click [data-action="close"]': function(e){
        e.preventDefault();
        $('.feedback-form').addClass('hide');
        $('#feedback-layer').addClass('hide');
        $('#alert-tq').addClass('hide');
        $('#feedback-msg').removeClass('hide')
    },

    'submit #feedback-formid' : function(e){
        e.preventDefault();
        var elem = $(e.currentTarget);

        var type = $('#feedbck-pill').find('li.active').data('type');
        if(type == 'problem') {
            type = $('#feedbck-pill').find('li.active').find('ul').find('li.active').data('sub');
        }

        var msg = $('#feedback-'+type).val();
        var params = {
            createdAt : new Date(),
            user : Meteor.userId(),
            message : msg,
            type: type
        }

        Meteor.call("addFeedback", params, function(error, result){
            console.log("call addFeedback");
            if(error){
                console.log("error", error);
            } else {
                console.log("ok");
                elem[0].reset();
                  $('#alert-tq').removeClass('hide');
                  $('#feedback-msg').addClass('hide');
                //   $('#feedback-layer').addClass('hide');
            }
        });
    },

    'click #feedback-layer': function(e) {
        e.preventDefault();
        $('.close-feedback').click();
    }
});
