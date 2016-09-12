Meteor.publish('scool_trainings', function() {
  return Scool_Trainings.find();
});

Scool_Trainings.allow({
    insert: function(){
        return true;
    },
    update: function(){
        return true;
    },
    remove: function(){
        return true;
    }
});

var SCOOL_API_KEY = "AIzaSyBUoxGeEPFoF-sFdV1Z2YTtNv1LZqeRMkI";
var SCOOL_SPREADSHEETS_ID = "1n7VPaxOXcMsuHZd_I3yrreovwTVWXNYaozDrpJCWI_s";
var SCOOL_SPREADSHEETS_RANGE = "a1%3Ak1000";

Meteor.startup(function () {
    // code to run on server at startup
    Scool_Trainings.remove({});

    Meteor.call('getTrainingList');

    Meteor.setInterval(function() {
        Meteor.call('getTrainingList');
    }, 6*60*60*1000); // 6 jam
});

Meteor.methods({
    getTrainingList: function(params){
        this.unblock();
        console.log("calling google api..");
        var response = Meteor.http.call("GET", "https://sheets.googleapis.com/v4/spreadsheets/" + SCOOL_SPREADSHEETS_ID + "/values/" + SCOOL_SPREADSHEETS_RANGE + "?key=" + SCOOL_API_KEY,
        function(e, d){
            console.log("Error 500: Internal Server Error: Http.call response", d);
        });

        if(!response) return;
        var index = 0;

        //var trainings = Scool_Trainings.find();

        _.each(response.data.values, function(item) {
            var start = moment(item[3],'M/D/YY');
            var end = moment(item[4],'M/D/YY');

            var start_date = item[3];
            var end_date = item[4];

            if (start.isValid()){
                start_date = start.format('MM/DD/YYYY');
            }

            if (end.isValid()){
                end_date = end.format('MM/DD/YYYY');
            }

            var tmp = Scool_Trainings.findOne({
                "no": item[0],
                "type": item[1],
                "title": item[2],
                "start": start_date,
                "end": end_date,
                "status": item[7],
                "venue": item[8],
                "pax": item[9]
            });

            if (!tmp){
                var training = {
                    no: item[0],
                    type: item[1],
                    title: item[2],
                    start: start_date,
                    end: end_date,
                    status: item[7],
                    venue: item[8],
                    pax: item[9]
                };

                if (index>0 && parseInt(item[0])>0){
                    var oldrecs = Scool_Trainings.findOne({
                        "no": item[0]
                    })

                    if (oldrecs){
                        // _.each(oldrecs, function(item){
                        //     if (item)
                                Scool_Trainings.remove(item._id);
                        // });
                    }else{
                        console.log('no record found');
                    }

                    Scool_Trainings.insert(training);
                }
            }

            index++;
        });

        return response;
    }
});
