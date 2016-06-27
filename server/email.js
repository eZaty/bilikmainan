Meteor.startup(function () {
    // console.log('startup');

    // var var_username = 'Playroom';
    var var_email = 'playroom@packet-1.com';
    // var var_password = '';
    var var_server = 'mail.packet-1.com';
    var var_port = '25';
    // 1. Set up stmp
    //   your_server would be something like 'smtp.gmail.com'
    //   and your_port would be a number like 25
    process.env.MAIL_URL = 'smtp://' +
        // encodeURIComponent(var_username) + ':' +
        // encodeURIComponent(var_password) + '@' +
        encodeURIComponent(var_server) + ':' + var_port;

    // 2. Format the email
    //-- Set the from address
    Accounts.emailTemplates.from = var_email;

    //-- Application name
    Accounts.emailTemplates.siteName = 'Playroom';

    //-- Subject line of the email.
    Accounts.emailTemplates.verifyEmail.subject = function(user) {
    return 'Confirm Your Email Address for Playroom';
    };

    //-- Email text
    Accounts.emailTemplates.verifyEmail.text = function(user, url) {
    return 'Thank you for registering. Please click on the following link to verify your email address: \r\n' + url;
    };

    // 3.  Send email when account is created
    Accounts.config({
        sendVerificationEmail: true
    });

});
