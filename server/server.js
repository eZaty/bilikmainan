Meteor.methods({
    clientAddress:function(){
         return this.connection.clientAddress;
    }
});
