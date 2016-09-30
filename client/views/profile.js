Template.profile.onCreated(function(){
    instance = this;
    instance.autorun(function(){
        Meteor.subscribe('uploadsByUserId', Meteor.userId());
        Meteor.subscribe('selectedUserProfile', Meteor.userId());
        Meteor.subscribe('currentUserCover', Meteor.userId());
    });
});

Template.profile.onRendered(function(){
    ClientHelper.fixedHeader();
    var hash = Router.current().params.hash;
    if(hash) {
        $('a[href="#'+hash+'"]').click();
    }

    $('.file-input').fileinput({
        browseLabel: 'Browse',
        browseClass: 'btn btn-default',
        removeLabel: '',
        uploadAsync: true,
        browseIcon: '<i class="icon-plus22 position-left"></i> ',
        // uploadIcon: '<i class="icon-file-upload position-left"></i> ',
        removeClass: 'btn btn-danger btn-icon',
        removeIcon: '<i class="icon-cancel-square"></i> ',
        layoutTemplates: {
            caption: '<div tabindex="-1" class="form-control file-caption {class}">\n' + '<span class="icon-file-plus kv-caption-icon"></span><div class="file-caption-name"></div>\n' + '</div>'
        },
        initialCaption: "No file selected",
        // maxFilesNum: 10,
        allowedFileExtensions: ["jpg", "jpeg", "gif", "png"]
    });

    $('#upload-photo').on('fileloaded', function(event, file, previewId, index, reader) {
        var imgsrc = $('.file-preview-image').attr('src');
        var reader = new FileReader();
        reader.onload = function (ev) {
            // get loaded data and render thumbnail.
            var h = $('.photo-container').height() + 2;
            var w = $('.photo-container').width();

            $('.file-preview-image').cropper({
                viewMode: 0,
                aspectRatio: w / h,
                crop: function(e) {
                    $('#photo').html($('.file-preview-image').cropper('getCroppedCanvas',{ width: w, height: h}));
                }
            });
        };
        reader.readAsDataURL($('#upload-photo').get(0).files[0]);
    });

    // $('#upload-photo').on('fileloaded', function(event, file, previewId, index, reader) {
    //     var imgsrc = $('.file-preview-image').attr('src');
    //     $('#photo').attr('src', imgsrc).css('height', 'auto').css('width', '100%');
    // });

    var palette = [
        ["#000000","#1DAFEC","#29A7A8","#E87231"],
        ["#DC1B74","#632E78","#4FB564","#F7E737"]
    ];

    $(".colorpicker").spectrum({
        showPalette: true,
        showPaletteOnly: true,
        hideAfterPaletteSelect: true,
        palette: palette
    });

    if(!Meteor.user().profile.nickName) {
        Session.set('WEBE_NAME', Meteor.user().profile.givenName);
    } else {
        Session.set('WEBE_NAME', Meteor.user().profile.nickName);
    }

    if(!Meteor.user().profile.webeeId) {
        Session.set('WEBE_ID', '0000');
    } else {
        Session.set('WEBE_ID', Meteor.user().profile.webeeId);
    }

    if(!Meteor.user().profile.greeting) {
        Session.set('WEBE_GREETING', 'hi, i\'m');
    } else {
        Session.set('WEBE_GREETING', Meteor.user().profile.greeting);
    }
});

Template.profile.helpers({
    'uploads':function(){
        return Uploads.find({});
    },

    isStatusNew: function() {
        // var status = Meteor.user().webeeidstatus;
        // console.log(status);
        // if(!status || status == 'new' || status == 'rejected') return true;
        // else return false;
        return true;
    },

    'getNickName': function() {
        return Session.get('WEBE_NAME');
    },

    'getWebeeId': function() {
        return Session.get('WEBE_ID');
    },

    'getGreeting': function() {
        return Session.get('WEBE_GREETING');
    },

    'getLogo': function() {
        if(Meteor.user().profile.logo) return '/images/logos/'+Meteor.user().profile.logo+'.png';
        else return '/images/logos/logo0.png';
    },

    'getPattern': function() {
        // if(Meteor.user().profile.pattern) return '/images/patterns/'+Meteor.user().profile.pattern+'.png';
        // else return '/images/patterns/pattern1.png';
        if(Meteor.user().profile.pattern) return Meteor.user().profile.pattern;
        else return 'pattern1';
    },

    'getColor': function() {
        if(Meteor.user().profile.color) return Meteor.user().profile.color;
        else return '00A6A3';
    },

    // 'getTitleColor': function() {
    //     if(Meteor.user().profile.titleColor) return Meteor.user().profile.titleColor;
    //     else return '#000000';
    // },
});

Template.profile.events({
    'click .logout-btn' : function(e) {
        e.preventDefault();
        Meteor.logout();
    },

    'submit #profInfo' : function(e){
        e.preventDefault();
        NProgress.start();
        var elem = $(e.currentTarget);

        if ($('#upload-photo').val() != ""){

            var profile = Profiles.findOne({
                userId: Meteor.userId()
            });

            if(profile) {
                profile.remove();
            }

            var h = $('.photo-container').height();
            var w = $('.photo-container').width();
            var file = $('.file-preview-image').first().cropper('getCroppedCanvas',{ width: w, height: h}).toDataURL();

            var newFile = new FS.File(file);
            newFile.userId = Meteor.userId();
            newFile.fileType = 'profile_photo';
            newFile.status = 'uploading';

            Profiles.insert(newFile, function(err, fileObj){
                if(err) console.log(err);
                else {
                    // elem[0].reset();
                    $('#upload-photo').val('');
                    $('#uniform-upload-photo .filename').html('No file selected');
                }
            });
        }

        if ($('#upload-fileCover').val() != ""){
            var cover = Covers.findOne({
                userId: Meteor.userId()
            });

            if(cover) {
                cover.remove();
            }

            var coverfile = $('#upload-fileCover').get(0).files[0];
            var newCover = new FS.File(coverfile);
            newCover.userId = Meteor.userId();
            newCover.fileType = 'cover_photo';
            newCover.status = 'uploading';

            Covers.insert(newCover, function(err, fileObj){
                if(err) console.log(err);
                else {
                    $('#upload-fileCover').val('');
                    $('.file-caption-name').html('No file selected');
                }
            });
        }

        // -- other fields
        if ($('#nickName').val() != '' && $('#webeeId').val() != '0000'){
            var color = $('input:radio[name="color"]:checked').val();
            var pattern = $('input:radio[name="pattern"]:checked').val();
            var nickName = Session.get('WEBE_NAME');
            var webeeId = Session.get('WEBE_ID');
            var greeting = Session.get('WEBE_GREETING');

            var status = Meteor.user().webeeidstatus;

            if(!status || status == 'new' || status == 'approved' || status == 'rejected'){
                status = 'new';
            }

            var params = {
                profile: {
                    "name": Meteor.user().profile.name,
                    "email": Meteor.user().profile.email,
                    "phone": Meteor.user().profile.phone,
                    "title": Meteor.user().profile.title,
                    "department": Meteor.user().profile.department,
                    "givenName": Meteor.user().profile.givenName,
                    "nickName": nickName,
                    "greeting": greeting,
                    "webeeId": webeeId,
                    "pattern": pattern,
                    "color": color
                },
                webeeidstatus: status
            }
            // Meteor.call('updateUser', Meteor.userId(), params);
            Meteor.call('updateUser', Meteor.userId(), params, function(error, result){
                if(error){
                    var msg = 'Cannot update your profile. Please try again later.';
                    ClientHelper.notify('warning', msg, true);
                }
                if(result){
                    var msg = 'Profile successfully updated.';
                    ClientHelper.notify('success', msg, true);
                }
            });
            $('.file-input').addClass('file-input-new');
        } else {
            var msg = 'Please enter your webee name and ID.';
            ClientHelper.notify('warning', msg, true);
        }
        NProgress.done();
    },

    'click .smooth-scroll': function(e) {
        e.preventDefault();
        var elem = $(e.currentTarget);
        var div = elem.attr('href');
        var navbarHeight = $('.navbar').height();
        $('.head-fixed').addClass('fixed');
        $('html, body').animate({
            scrollTop: $(div).offset().top - navbarHeight - 15
        }, 1000);
        $('.smooth-scroll').each(function(){
            $(this).closest('li').removeClass('active');
        });
        elem.closest('li').addClass('active');
    },

    'keyup #nickName, blur #nickName': function(e) {
        e.preventDefault();
        var typed = $('#nickName').val().toLowerCase();
        Session.set('WEBE_NAME', typed);
        // $('.card-preview .name').html(typed);
    },

    'keyup #webeeId, blur #webeeId': function(e) {
        e.preventDefault();
        var typed = $('#webeeId').val();

        if (!Roles.userIsInRole(Meteor.userId(), ['admin'])){
            if (typed.length > 4) {
                $('#webeeId').val(typed.substring(0,4));
                return false;
            }
        }

        Session.set('WEBE_ID', typed);
    },

    'change #greeting': function(e) {
        e.preventDefault();
        var elem = $(e.currentTarget);
        var greeting = elem.val();
        Session.set('WEBE_GREETING', greeting);
    },

    'change input[name="pattern"]': function(e) {
        e.preventDefault();
        var elem = $(e.currentTarget);
        var pattern = elem.data('pattern');
        $('#pattern').attr('src', '/images/patterns/'+pattern+'.png');
    },

    'change input[name="color"]': function(e) {
        e.preventDefault();
        var elem = $(e.currentTarget);
        var color = elem.data('color');
        $('.card-preview').css('background-color', '#'+color);
        $('.photo-container').css('background-color', '#'+color);
    },

    'click .reset-default': function(e) {
        e.preventDefault();
        var notice = ClientHelper.confirm('danger', 'Are you sure want to reset your profile to default?');
        notice.get().on('pnotify.confirm', function() {
            Meteor.call('deleteUserPhoto', Meteor.userId());
            var params = {
                profile: {
                    "name": Meteor.user().profile.name,
                    "email": Meteor.user().profile.email,
                    "phone": Meteor.user().profile.phone,
                    "title": Meteor.user().profile.title,
                    "department": Meteor.user().profile.department,
                    "givenName": Meteor.user().profile.givenName,
                    "nickName": Meteor.user().profile.givenName,
                    "greeting": '',
                    "webeeId": '',
                    "pattern": '',
                    "color": ''
                }
            }
            Meteor.call('updateUser', Meteor.userId(), params, function(error, result){
                if(error){
                    var msg = 'Cannot reset your profile. Please try again later.';
                    ClientHelper.notify('warning', msg, true);
                }
                if(result){
                    var msg = 'Profile has been reset to default.';
                    ClientHelper.notify('success', msg, true);
                    Session.set('WEBE_NAME', Meteor.user().profile.givenName);
                    Session.set('WEBE_ID', '0000');
                    Session.set('WEBE_GREETING', 'hi i\'m');
                }
            });
        });
    }

});
