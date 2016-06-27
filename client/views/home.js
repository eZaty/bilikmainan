Template.home.rendered = function(){
    $("#js-rotating").Morphext({
        animation: "fadeInLeft",
        // separator: "|",
        speed: 2000,
        complete: function () {

        }
    });
    // $('#modal-poplayer').modal('show');
}

Template.home.helpers({
    'quoteImage': function() {
        var arr = [
            '/images/start-here-go-anywhere_black.png',
            '/images/start-here-go-anywhere_blue.png',
            '/images/start-here-go-anywhere_orange.png',
            '/images/start-here-go-anywhere_turquoise.png'
        ];
        var rand = Math.floor((Math.random()*arr.length));
        var randNumber = arr[rand];
        return arr.splice(rand,1);
    }
});

Template.home.events({
    'click a.module-internal': function(e) {
        e.preventDefault();
        var elem = $(e.currentTarget);
        var data = elem.data('internalonly');
        var url = elem.attr('href');
        if(data) {
            ClientHelper.internalOnly(function(status){
                if(status) {
                    // console.log('prohibited', status);
                    ClientHelper.notify('warning', 'Sorry, module <strong>'+data+'</strong> is not accessible from outside at this moment.', false);
                } else {
                    // console.log('allowed', status);
                    location.href = url;
                }
            });
        }
    }
});
