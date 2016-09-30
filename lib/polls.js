Polls = new Meteor.Collection('polls');

TabularTables = {};

TabularTables.Polls = new Tabular.Table({
  name: "Polls",
  collection: Polls,
  responsive: true,
  autoWidth: false,
  order: [[1, "asc"]],
  columns: [
  	{data: "_id", title: "",
      	render: function (val, type, doc) {
      		return "";
      	}
    },
    {data: "question", title: "Question",
		render: function (val, type, doc){
			return "<a href='#' style='font-family: Panton Black;'>" + val + "</a>";
		}
	},
    {data: "channel", title: "Channel",
		render: function (val, type, doc){
			var channel = Channels.findOne(val);

			if (channel)
				return "<span class='label label-info'>" + channel.title + "</span>";
			else
				return "";
		}
	},
    {data: "userId", title: "Creator",
		render: function (val, type, doc){
			var creator = Meteor.users.findOne(val);
			if (creator)
				return "<span style='font-family: Panton ExtraBold; color: #de1175;'>" + creator.profile.name + "</span>";
			else
				return "";
		}
	},
    {data: "createdAt", title: "Time Created",
		render: function (val, type, doc){
			var date = moment(val).format("Do MMM YYYY, H:mma");
    		return date;
		}
	},
    {data: "total", title: "Nb. Options"},
    {data: "status", title: "Status",
      render: function (val, type, doc) {
        var cls = "label-warning";

        if (val=='published'){
            cls = 'label-success';
        }

        if (val == undefined){
        	val = "draft";
        }

        var ret = "<span class='label " + cls + "'>" + val + "</span>";

        return ret;
      }
    },
    {
      tmpl: Meteor.isClient && Template.pollTableButtons
    }
  ]
});