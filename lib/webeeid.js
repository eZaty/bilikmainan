TabularTables = {};

TabularTables.WebeeIdCollected = new Tabular.Table({
  name: "WebeeIdCollected",
  collection: Meteor.users,
  selector: function(){
    return { webeeidstatus: "collected"};
  },
  responsive: true,
  autoWidth: false,
  order: [[2, "asc"]],
  columns: [
    {data: "profile.name", title: "Name"},
    {data: "profile.email", title: "Email"},
    {data: "profile", title: "webees",
      render: function (val, type, doc) {
        return "<span style='font-family: Panton-Black'>" + val.name + "</span><br>" + val.nickName + " / <i>" + val.email + "</i>";
      }
    },
    {data: "profile.department", title: "Department"},
    {
      tmpl: Meteor.isClient && Template.webeeIdCollectedTableButtons
    }
  ]
});

TabularTables.WebeeIdPending = new Tabular.Table({
  name: "WebeeIdPending",
  collection: Meteor.users,
  selector: function(){
    return {'profile.greeting': {$exists : false}};
  },
  responsive: true,
  autoWidth: false,
  order: [[2, "asc"]],
  columns: [
    {data: "profile.name", title: "Name"},
    {data: "profile.email", title: "Email"},
    {data: "profile", title: "webees",
      render: function (val, type, doc) {
        return "<span style='font-family: Panton-Black'>" + val.name + "</span><br>" + val.nickName + " / <i>" + val.email + "</i>";
      }
    },
    {data: "profile.department", title: "Department"},
    {
      tmpl: Meteor.isClient && Template.webeeIdPendingTableButtons
    }
  ]
});

TabularTables.WebeeIdPrinted = new Tabular.Table({
  name: "WebeeIdPrinted",
  collection: Meteor.users,
  selector: function(){
    return { webeeidstatus: "printed"};
  },
  responsive: true,
  autoWidth: false,
  order: [[2, "asc"]],
  columns: [
    {data: "profile.name", title: "Name"},
    {data: "profile.email", title: "Email"},
    {data: "profile", title: "webees",
      render: function (val, type, doc) {
        return "<a href='#' style='font-family: Panton-Black' data-userid='"+doc._id+"'' data-toggle='modal' data-target='#modal-webee-id-preview' class='preview-opener'>" + val.name + "</a><br>" + val.nickName + " / <i>" + val.email + "</i>";
      }
    },
    {data: "profile.department", title: "Department"},
    {
      tmpl: Meteor.isClient && Template.webeeIdPrintedTableButtons
    }
  ]
});