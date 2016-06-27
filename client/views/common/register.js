Template.register.helpers({

});

Template.register.events({
    'submit .form-register': function(e){
        e.preventDefault();
        var fullnameVar = e.target.registerFullname.value;
        var emailVar = e.target.registerEmail.value;
        var passwordVar = e.target.registerPassword.value;
        var acceptVar = e.target.registerAccept.checked;
        // console.log("Form submitted.", fullnameVar, emailVar, passwordVar, acceptVar);

        if (!acceptVar) {
            var msg = 'You have to accept <a href="/help/tos">term of service</a>';
            $('.alertBox').html(ClientHelper.alertDanger(msg));
            return false;
        }

        if (!fullnameVar) {
            var msg = 'Full name is required';
            $('.alertBox').html(ClientHelper.alertDanger(msg));
            return false;
        }

        if (!emailVar) {
            var msg = 'Email is required';
            $('.alertBox').html(ClientHelper.alertDanger(msg));
            return false;
        }

        if (!passwordVar) {
            var msg = 'Password is required';
            $('.alertBox').html(ClientHelper.alertDanger(msg));
            return false;
        }

        if(acceptVar) {
            Accounts.createUser({
                email: emailVar,
                password: passwordVar,
                profile: {
                    name: fullnameVar
                }
            }, function(err) {
                if(!err) {
                    Router.go('/');
                } else {
                    var msg = ClientHelper.alertDanger(err.reason);
                    $('.alertBox').html(msg);
                }
            });
            // console.log('masuk');
        }
    }
});
