Albums = new Meteor.Collection('albums');

TabularTables = {};

TabularTables.Albums = new Tabular.Table({
  name: "Albums",
  collection: Albums,
  responsive: true,
  autoWidth: false,
  order: [[1, "asc"]],
  columns: [
  	{data: "_id", title: "", orderable: false,
      	render: function (val, type, doc) {
      		var photo = Galleries.findOne({album_id: val},
			{
				sort: {
					uploadedAt: 1,
					limit: 1
				}
			});

			if (photo){
				var thumb = photo.S3Url('galleryThumbs');

				if (thumb){
					return "<img src='" + thumb + "' class='img-rounded img-preview'>";
				}
			}
      	}
    },
    {data: "title", title: "Title",
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
    {data: "created_by", title: "Creator",
		render: function (val, type, doc){
			var creator = Meteor.users.findOne(val);

      var creator_name = "-";

        if (creator){
            creator_name = creator.profile.name;
        }

			return "<span style='font-family: Panton ExtraBold; color: #de1175;'>" + creator_name + "</span>";
		}
	},
    {data: "created_at", title: "Time Created",
		render: function (val, type, doc){
			var date = moment(val).format("Do MMM YYYY, H:mma");
    		return date;
		}
	},
    {data: "updated_by", title: "Nb. Photos",
      render: function (val, type, doc) {
      	return Galleries.find({album_id: doc._id}).count();
      }
    },
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
      tmpl: Meteor.isClient && Template.albumTableButtons
    }
  ]
});