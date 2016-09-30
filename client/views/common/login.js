var Scheme = {
    resizeBgImage: function() {
        var win = $(window);
        var h = win.height();
        var w = win.width();
        if(w >= h) {
            $('#bg-login > img').css('width', '100%').css('height', 'auto');
        } else {
            $('#bg-login > img').css('height', '100%').css('width', 'auto');
        }
    }
}

Template.login.rendered = function(){
    Scheme.resizeBgImage();
    $(window).on('resize', function(){
        Scheme.resizeBgImage();
    });
}

Template.login.helpers({
    thisYear: function() {
        var date = new Date();
        return moment(date).format('YYYY');
    },
    greetWeekend: function() {
        var date = new Date();
        var days = date.getDay();
        if (days==6){
            return moment(days);
        }
        else if (days==0){
            return moment(days);
        }
    },

    greetMorning: function() {
        var date = new Date();
        var hrs = date.getHours();
        var days = date.getDay();
        if (days!=0 && days!=6){
            if (hrs>=0 && hrs<12){
                return moment(hrs).format('HH:MM:SS');
            }
        }
    },

    greetAfternoon: function() {
        var date = new Date();
        var hrs = date.getHours();
        var days = date.getDay();
        if(days!=0 && days!=6){
            if (hrs>=12 && hrs<=15){
                return moment(hrs).format('HH:MM:SS');
            }
        }
    },

    greetEvening: function() {
        var date = new Date();
        var hrs = date.getHours();
        var days = date.getDay();
        if(days!=0 && days!=6){
            if (hrs>15 && hrs<=23){
                return moment(hrs).format('HH:MM:SS');
            }
        }
    }
});

Template.login.events({
    'submit .form-login': function(e) {
        e.preventDefault();
        NProgress.start();

        var loginId = e.target.loginId.value.toLowerCase();
        var password = e.target.loginPassword.value;
        var domain = 'greenpacket';
        // var domain = 'webedigital';
        // console.log(loginId, password);

        if (loginId == ""){
            var msg = ClientHelper.alertDanger("Please provide your username");
            $('.alertBox').html(msg);
            NProgress.done();
        } else if (password == ""){
            var msg = ClientHelper.alertDanger("Please provide your password");
            $('.alertBox').html(msg);
            NProgress.done();
        } else if(loginId == 'playroom' || loginId == 'viewer') {
            Meteor.loginWithPassword(loginId, password,
                function(err){
                    if(err) {
                        console.log(err);
                        var msg = ClientHelper.alertDanger('Incorrect username or password.');
                        $('.alertBox').html(msg);
                    } else {
                        console.log('success');
                    }
                    NProgress.done();
                });

            } else {

                Meteor.loginWithLDAP(loginId, password, {
                    dn: domain + '\\' + loginId,
                    search: '(sAMAccountName=' + loginId + ')'
                }, function(err) {
                    if (err) {
                        console.log(err);
                        var msg = ClientHelper.alertDanger('Incorrect username or password.');
                        $('.alertBox').html(msg);
                    }
                    else {
                        console.log('success');
                    }
                    NProgress.done();
                });
            }
            // NProgress.done();
        },

        // 'resize window': function(e) {
        //     console.log('resized');
        // }
    });
