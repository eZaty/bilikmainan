Scool_Trainings= new Meteor.Collection('scool_trainings');

TabularTables = {};

TabularTables.ScoolTrainings = new Tabular.Table({
  name: "ScoolTrainings",
  collection: Scool_Trainings,
  responsive: true,
  autoWidth: false,
  order: [[2, "desc"]],
  columns: [
  	{data: "_id", title: ""},
    {data: "month", title: "Month"},
    {data: "start", title: "Start",
    	render: function (val, type, doc) {
    		var d = moment(val,'YYYY/MM/DD');

    		if (d.isValid()){
                return d.format('Do MMM YYYY');
            }else{
            	return val;
            }
    	}
	},
    {data: "end", title: "End",
    	render: function (val, type, doc) {
    		var d = moment(val,'YYYY/MM/DD');

    		if (d.isValid()){
                return d.format('Do MMM YYYY');
            }else{
            	return val;
            }
    	}
	},
    {data: "title", title: "Training Title"},
    {data: "venue", title: "Venue"},
    {data: "days", title: "Nb Days"},
    {data: "hours", title: "Nb Hours"},
    {data: "status", title: "Status",
      render: function (val, type, doc) {
        var cls = "";

        if (val.toLowerCase()=='confirmed'){
            cls = 'label-success';
        }

        if (val.toLowerCase()=='done'){
            cls = 'label-info';
        }

        if (val.toLowerCase()=='incoming'){
            cls = 'label-warning';
        }

        if (val == undefined){
        	val = "-";
        }

        var ret = "<span class='label " + cls + "'>" + val + "</span>";

        return ret;
      }
    }
  ]
});