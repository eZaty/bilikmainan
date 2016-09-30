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
var SCOOL_SPREADSHEETS_ID = "1-hqYbZfvPGedZJU2ySOcgi7xsrh_14jivdqk7dYplmM";
var SCOOL_SPREADSHEETS_RANGE = "a1%3Ak1000";

Meteor.startup(function () {
    // code to run on server at startup
    Scool_Trainings.remove({});

    Meteor.call('getTrainingList');

    Meteor.setInterval(function() {
        Meteor.call('getTrainingList');
    }, 3600000); //6*60*60*1000); // 6 jam
});

Meteor.methods({
    getTrainingList: function(params){
        this.unblock();
        console.log("calling google api..");
        var API_URL = "https://sheets.googleapis.com/v4/spreadsheets/" + SCOOL_SPREADSHEETS_ID + "/values/" + SCOOL_SPREADSHEETS_RANGE + "?key=" + SCOOL_API_KEY;
        var response = Meteor.http.call("GET", API_URL);
        console.log(API_URL);

        var index = 0;

        //var trainings = Scool_Trainings.find();

        _.each(response.data.values, function(item) {
            var start = moment(item[3],'D/M/YYYY');
            var end = moment(item[4],'D/M/YYYY');

            var start_date = item[3];
            var end_date = item[4];

            if (start.isValid()){
                start_date = start.format('YYYY/MM/DD');
            }

            if (end.isValid()){
                end_date = end.format('YYYY/MM/DD');
            }

            var tmp = Scool_Trainings.findOne({
                //"no": item[0],
                //"type": item[1],
                "title": item[1],
                "month": item[2],
                "start": start_date,
                "end": end_date,
                "hours": item[5],
                "days": item[6],
                "status": item[7],
                "venue": item[8]
                //"pax": item[9]
            });
            
            if (!tmp){
                var training = {
                    title: item[1],
                    month: item[2],
                    start: start_date,
                    end: end_date,
                    hours: item[5],
                    days: item[6],
                    status: item[7],
                    venue: item[8]
                };

                if (index>0){// && parseInt(item[0])>0){
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