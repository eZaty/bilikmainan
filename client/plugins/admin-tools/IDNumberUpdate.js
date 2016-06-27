Template.IDNumberUpdate.events({
    'click #uploadBtn': function( e ) {
        Papa.parse( $('#uploadFile').get(0).files[0], {
            header: true,
            complete: function( results, file ) {
                Meteor.call( 'webeIDAutoUpdate', results.data, function ( error, response ) {
                    if ( error ) {
                        var msg = 'Failed to auto update webeeID number: ' + error;
                        ClientHelper.notify('danger', msg, true);
                    } else {
                        $('#result').html(response);
                    }
                });
            }
        });
    }
});
