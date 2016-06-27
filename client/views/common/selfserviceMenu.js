Template.selfserviceMenu.events({
    "click #toggle-sidebar": function(e){
         e.preventDefault();
         $('body').toggleClass('sidebar-xs');
    }
});
