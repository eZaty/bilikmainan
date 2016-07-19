Meteor.publish('devices', function() {
    return Devices.find();
});

Meteor.publish('deviceWithUserId', function(userId) {
    return Devices.find({
        userId: userId
    });
});

Meteor.methods({
	pushNotification: function(params){
		// call fcm-push
        // import { FCM } from 'meteor/meteor';
        var FCM = require('fcm-push');
        var fcm = new FCM('AIzaSyCKKXE9QnKGPyRVC3MK8BDBAGoPYqDYtT8');

        //var deviceToken = 'cMr_muxmFL0:APA91bHbbpocfOFjfh8xzjRUwnYhARy4_kiDDQsL2TfVitw-z8pA8bN4Ah7xJlwzHKskog6xhQEeLdzD9s93io2hDLJRjUoV3hfeFaKRxZTDxyLoXTr27sNKfbEVcB18rF6OuK9eJ4WE'; // kerol
        //var deviceToken = 'd8dTm19zcqQ:APA91bFcX7cob4GoNIFbR9exVdFiIGsHq-IkPAMs_nnTabnf4ggWQv6ag8l7k3eds-o10x04nt9rVOF33U1NqGgoYRmzDGL4PgR3RWvS4aSGIg86rVWT48owJwbFL1I2WZ-fhziTVXhY'; // fahmi
        //var deviceToken = 'fKYSHSTMPyQ:APA91bGlxVkdy6q68IQ8kQ7WEKhLcG_tJ8efK_NXnIDIG4R07uD9HFPifqK4V-MLon7TH5ssLrLzUhgSDEaMmOoR6DxTwVDPartl4N-Idh4qxdPAHY4FZgf1ZGc2fO0jjF9s0a3MNi3S'; //ikhsan
        
        var devices = Devices.find();

        devices.forEach(function(device){
            var message = {
                to: device.deviceToken,
                priority: 'high',
                collapse_key: 'your_collapse_key',
                data: {
                    your_custom_data_key: 'your_custom_data_value'
                },
                notification: {
                    title: 'webe playroom - ' + params.type,
                    body: params.title,
                    click_action: 'fcm.ACTION.HELLO',
                    sound: 'default',
                    color: '#008080'
                }
            };

            fcm.send(message, function(err, response){
                if (err) {
                    console.log("Something has gone wrong!", err);
                } else {
                    console.log("Successfully sent with response: ", response);
                }
            });
        });
	}
});