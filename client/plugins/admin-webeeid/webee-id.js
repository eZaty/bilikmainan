Tracker.autorun(function(){
  Session.set('approvedSearchQuery', '');
  Session.set('collectedSearchQuery', '');
  Session.set('printedSearchQuery', '');
  Session.set('rejectedSearchQuery', '');
});

Template.adminWebeeID.rendered = function(){
	$('#webeeIDTabs').tab('show');
}

Template.adminWebeeID.helpers({
	users: function(){
		var searchString = Session.get('pendingSearchQuery');

		if (Session.get('pendingSearchQuery')){
			searchString = searchString.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
			return Meteor.users.find(
				{
					'profile.greeting': {$exists : false},
					$or : [
					  { 'profile.name':{ $regex:searchString, $options: 'i'} },
					  { 'profile.department':{ $regex:searchString, $options: 'i'} },
					  { 'profile.nickname':{$regex:searchString, $options: 'i'} } ]
				});
		}else{
			return Meteor.users.find({
				'profile.greeting': {$exists : false}
			});
		}
	},

	new_users: function(){
		var searchString = Session.get('newSearchQuery');

		if (Session.get('newSearchQuery')){
			searchString = searchString.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
			return Meteor.users.find(
				{
					 'profile.greeting': {$ne : null},
                	 $or: [
                	 	{'webeeidstatus': {$exists: false}},
						{'webeeidstatus': 'new'} ],
					$or : [
					  { 'profile.name':{ $regex:searchString, $options: 'i'} },
					  { 'profile.department':{ $regex:searchString, $options: 'i'} },
					  { 'profile.nickname':{$regex:searchString, $options: 'i'} } ]
				});
		}else{
			return Meteor.users.find({
				'profile.greeting': {$ne : null},
    			$or: [
                	 	{'webeeidstatus': {$exists: false}},
						{'webeeidstatus': 'new'} ]
			});
		}

	},

	approved_users: function(){
		var searchString = Session.get('approvedSearchQuery');

		if (Session.get('approvedSearchQuery')){
			searchString = searchString.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
			return Meteor.users.find(
				{
					'webeeidstatus': {
						$in: ['approved', 'accepted']
					},
					$or : [
					  { 'profile.name':{ $regex:searchString, $options: 'i'} },
					  { 'profile.department':{ $regex:searchString, $options: 'i'} },
					  { 'profile.nickname':{$regex:searchString, $options: 'i'} } ]
				});
		}else{
			return Meteor.users.find({
				'webeeidstatus': {
					$in: ['approved', 'accepted']
				}
			});
		}
    },

	printed_users: function(){
		var searchString = Session.get('printedSearchQuery');

		if (Session.get('printedSearchQuery')){
			searchString = searchString.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
			return Meteor.users.find(
				{
					'webeeidstatus': {
						$in: ['printed', 'completed']
					},
					$or : [
					  { 'profile.name':{ $regex:searchString, $options: 'i'} },
					  { 'profile.department':{ $regex:searchString, $options: 'i'} },
					  { 'profile.nickname':{$regex:searchString, $options: 'i'} } ]
				});
		}else{
			return Meteor.users.find({
				'webeeidstatus': {
					$in: ['printed', 'completed']
				}
			});
		}
    },

	rejected_users: function(){
		var searchString = Session.get('rejectedSearchQuery');

		if (Session.get('rejectedSearchQuery')){
			searchString = searchString.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
			return Meteor.users.find(
				{
					'webeeidstatus': 'rejected',
					$or : [
					  { 'profile.name':{ $regex:searchString, $options: 'i'} },
					  { 'profile.department':{ $regex:searchString, $options: 'i'} },
					  { 'profile.nickname':{$regex:searchString, $options: 'i'} } ]
				});
		}else{
			return Meteor.users.find({
				'webeeidstatus': 'rejected'
			});
		}
	},

	collected_IDs: function(){
		var searchString = Session.get('collectedSearchQuery');

		if (Session.get('collectedSearchQuery')){
			searchString = searchString.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
			return Meteor.users.find(
				{
					'webeeidstatus': 'collected',
					$or : [
					  { 'profile.name':{ $regex:searchString, $options: 'i'} },
					  { 'profile.department':{ $regex:searchString, $options: 'i'} },
					  { 'profile.nickname':{$regex:searchString, $options: 'i'} } ]
				});
		}else{
			return Meteor.users.find({
				'webeeidstatus': 'collected'
			});
		}
    },

	nbUsers: function(){
        return Counts.get('users');
	},

	nbwebeeIDPending: function(){
        return Counts.get('pendingUsers');
	},

	nbwebeeIDNew: function(){
        return Counts.get('newUsers');
	},

	nbwebeeIDApproved: function(){
        return Counts.get('approvedUsers');
	},

	nbwebeeIDRejected: function(){
        return Counts.get('rejectedUsers');
	},

	nbwebeeIDPrinted: function(){
        return Counts.get('printedUsers');
	},

	nbwebeeIDCollected: function(){
        return Counts.get('collectedUsers');
	},

	getColor: function(id){
		var user = Meteor.users.findOne(id);
		if(user.profile.color) return user.profile.color;
        else return '00A6A3';
	},

	getPattern: function(id){
		var user = Meteor.users.findOne(id);
		if(user.profile.pattern) return user.profile.pattern;
        else return 'pattern1';
	}
});

Template.adminWebeeID.events({
    'click #tab-new': function() {
    	Meteor.subscribe('newUsers');
    },
    'click #tab-approved': function() {
        Meteor.subscribe('approvedUsers');
    },
    'click #tab-rejected': function() {
        Meteor.subscribe('rejectedUsers');
    },
    'click #tab-printed': function() {
        Meteor.subscribe('printedUsers');
    },
    'click #tab-collected': function() {
        Meteor.subscribe('collectedUsers');
    },


	'click .btn-approve': function(e){

		var elem = $(e.currentTarget);
		var userId = elem.data('userid');

		const selectedUserSubscription = Meteor.subscribe('updatedUser', userId);

		Tracker.autorun(() => {
		  const isReady = selectedUserSubscription.ready();
		  // console.log(`Subscription is ${isReady ? 'ready' : 'not ready'}`);  
		});

		var params = {
            "webeeidstatus": "approved" 
        }

        Meteor.call('updateWebeeIDStatus', userId, params, function(error, result){
			if (error){
				var msg = 'Failed to approved.';
				ClientHelper.notify('danger', msg, true);
			}

			if (result){
				var msg = 'Approval process successful.';
				ClientHelper.notify('success', msg, true);
				NProgress.done();
			}
        });


	},

	'click .btn-collect': function(e){
		var elem = $(e.currentTarget);
		var userId = elem.data('userid');

		const selectedUserSubscription = Meteor.subscribe('updatedUser', userId);

		Tracker.autorun(() => {
		  const isReady = selectedUserSubscription.ready();
		  // console.log(`Subscription is ${isReady ? 'ready' : 'not ready'}`);  
		});

		var params = {
            "webeeidstatus": "collected"
        }
        Meteor.call('updateWebeeIDStatus', userId, params);
	},

	'click .btn-renew': function(e){
		var elem = $(e.currentTarget);
		var userId = elem.data('userid');

		var params = {
            "webeeidstatus": "new"
        }
        Meteor.call('updateWebeeIDStatus', userId, params);
	},

    'click .btn-to-printed': function(e){
    	var elem = $(e.currentTarget);
		var userId = elem.data('userid');

		const selectedUserSubscription = Meteor.subscribe('updatedUser', userId);

		Tracker.autorun(() => {
		  const isReady = selectedUserSubscription.ready();
		  // console.log(`Subscription is ${isReady ? 'ready' : 'not ready'}`);  
		});

		var params = {
            "webeeidstatus": "printed"
        }
        Meteor.call('updateWebeeIDStatus', userId, params);
	},

	'click .btn-reject': function(e){
		var elem = $(e.currentTarget);
		var userId = elem.data('userid');

		const selectedUserSubscription = Meteor.subscribe('updatedUser', userId);

		Tracker.autorun(() => {
		  const isReady = selectedUserSubscription.ready();
		  // console.log(`Subscription is ${isReady ? 'ready' : 'not ready'}`);  
		});

		Session.set("currentUserToReject", userId);
	},

	'click .btn-user-details': function(e){
		var elem = $(e.currentTarget);
		var userId = elem.data('userid');

		if ($('#card-' + userId + ' .card-info').is(':visible')){
			$('#card-' + userId + ' .card-info').hide();
			$('#card-' + userId + ' .card-details').removeClass('hidden');
		}else{
			$('#card-' + userId + ' .card-info').show();
			$('#card-' + userId + ' .card-details').addClass('hidden');
		}
	},

	'click .btn-reminder': function(e){
		NProgress.start();

		Meteor.call('sendWebeeIDReminder',function(error, result){
			if (error){
				var msg = 'Failed to send reminder.';
				ClientHelper.notify('danger', msg, true);
			}

			if (result){
				var msg = 'Reminder sent successfully.';
				ClientHelper.notify('success', msg, true);
				NProgress.done();
			}
		});
	},

    'click .btn-reminder-individual': function(e){
		NProgress.start();

		var elem = $(e.currentTarget);
		var userId = elem.data('userid');

		Meteor.call('sendWebeeIDIndividualReminder', userId, function(error, result){
			if (error){
				var msg = 'Failed to send reminder.';
				ClientHelper.notify('danger', msg, true);
			}

			if (result){
				var msg = 'Reminder sent successfully.';
				ClientHelper.notify('success', msg, true);
				NProgress.done();
			}
		});
	},

    'click .btn-print': function(e){
		var elem = $(e.currentTarget);
		var userId = elem.data('userid');

		const selectedUserSubscription = Meteor.subscribe('updatedUser', userId);

		Tracker.autorun(() => {
		  const isReady = selectedUserSubscription.ready();
		  // console.log(`Subscription is ${isReady ? 'ready' : 'not ready'}`);  
		});

		var user = Meteor.users.findOne(userId);

        var backgroundColor = "00A6A3";

		if (user.profile.color){
			backgroundColor = user.profile.color;
		}

		if (!$('#card-' + userId + ' .card-info').is(':visible')){
			$('#card-' + userId + ' .card-info').show();
			$('#card-' + userId + ' .card-details').addClass('hidden');
		}

		var imgUrl = $('#photo-'+userId).attr('src');

		var image = new Image();

		var docx = new PDFDocument({
						//size: [290, 439],
						//size: [213, 332],
						size: [160, 250],
					  	margin: 0
					});

		var cWidth = docx.page.width;
		var cHeight = docx.page.height;

		var stream = docx.pipe(blobStream());

		docx.rect(0,0,cWidth, cHeight)
            .fill('#'+backgroundColor);

		var myfont_black, myfont_regular, myfont_bold;

	    image.onload = function () {

	        var canvas = document.createElement('canvas');
	        canvas.width = this.naturalWidth; // or 'width' if you want a special/scaled size
	        canvas.height = this.naturalHeight; // or 'height' if you want a special/scaled size

	        canvas.getContext('2d').drawImage(this, 0, 0);

	        docx.image(canvas.toDataURL('image/png'), 0, 0, {width: cWidth});

	        docx.rect(0,129,cWidth, cHeight - 129)
				.fill('#'+backgroundColor);

	        var imgUrl2 = $('#pattern-'+userId).attr('src');

			var image2 = new Image();

			image2.onload = function () {
				var canvas = document.createElement('canvas');
		        canvas.width = this.naturalWidth; // or 'width' if you want a special/scaled size
		        canvas.height = this.naturalHeight; // or 'height' if you want a special/scaled size

		        canvas.getContext('2d').drawImage(this, 0, 0);

		        docx.image(canvas.toDataURL('image/png'), 20, cHeight - 60, {width: 25});

		        var image3 = new Image();

		        image3.onload = function () {
		        	var canvas = document.createElement('canvas');
			        canvas.width = this.naturalWidth; // or 'width' if you want a special/scaled size
			        canvas.height = this.naturalHeight; // or 'height' if you want a special/scaled size

			        canvas.getContext('2d').drawImage(this, 0, 0);

			        docx.image(canvas.toDataURL('image/png'), cWidth - 56, cHeight - 38, {width: 15});

					var xhr = new XMLHttpRequest;
					xhr.onload = function() {
					  	// set the font using the arraybuffer returned from the xhr
					  	myfont_black = xhr.response;

						docx.font(myfont_black)
							.fill('#FFFFFF')
							.fontSize(26)
						    .text('webe', cWidth - 85, cHeight - 65);

						var xhr2 = new XMLHttpRequest;
						xhr2.onload = function() {
							myfont_regular = xhr2.response;


							var xhr3 = new XMLHttpRequest;
							xhr3.onload = function() {
								myfont_bold = xhr3.response;

                                var mainText = user.profile.greeting + ' ' + user.profile.nickName;

								// draw some text
								docx.font(myfont_bold)
									.fill('#FFFFFF')
									.fontSize(13)
                                    .text(mainText.toLowerCase(), 20, cHeight - 115);

								docx.rect(0,153,cWidth, 20)
									.fill('#'+backgroundColor);

								var webeeIDText = user.profile.webeeId;
								if (!Roles.userIsInRole(Meteor.userId(), ['admin', 'admin-webeeid'])){
									webeeIDText = 'wb' + webeeIDText;
								}

								docx.font(myfont_bold)
                                    .fill('#FFFFFF')
									.fontSize(10)
								    .text(webeeIDText, 20, cHeight - 97);

								docx.font('Helvetica-Bold')
									.fontSize(3.5)
								    .text('TM', cWidth - 22, cHeight - 57);

								docx.font('Helvetica-Bold')
									.fontSize(4)
								    .text('A              Company', cWidth - 60, cHeight - 34);


								docx.addPage({
							    	size: [cWidth, cHeight],
							    	margins: {
							    		top: 15,
							    		bottom: 0,
							    		left: 15,
							    		right: 0
							    	}
							    });

								docx.font('Helvetica')
									.fill('#000000')
									.fontSize(3.5)
								    .text('TM', cWidth - 22, cHeight - 57);

							    docx.font('Helvetica')
									.fontSize(4)
								    .text('A              Company', cWidth - 58, cHeight - 34);

								docx.font(myfont_black)
									.fontSize(26)
								    .text('webe', cWidth - 85, cHeight - 65);

							    docx.font(myfont_regular)
								.fontSize(6)
							    .text('This card must be worn at all times while on webe premises.', 20, 25,
							    	{width: 100, align: 'justify'})
							    .text(' ')
							    .text(' ')
							    .text(' ')
							    .text('If found, please return to:',
							    	{width: 100, align: 'justify'})
							    .text(' ')
							    //.font(myfont_bold)
							    //.fontSize(6)
							    .text('People Experience Division')
								//.fontSize(6)
								.font(myfont_bold)
							    .text('webe digital sdn bhd (571389-H)',
							    	{width: 100, align: 'left'})
							    .font(myfont_regular)
								.fontSize(5)
							    .text('(Formerly known as Packet One Networks (Malaysia) Sdn Bhd)',
							    	{width: 100, align: 'left'})
							    .fontSize(6)
							    .text('159, Jalan Templer,',
							    	{width: 100, align: 'left'})
							    .text('46050 Petaling Jaya, Selangor.',
							    	{width: 100, align: 'left'})
							    .text('Tel: +603-7450 8888',
							    	{width: 100, align: 'left'})
							    .text('Fax: +603-7450 8899',
							    	{width: 100, align: 'left'});


							    var image4 = new Image();

						        image4.onload = function () {
						        	var canvas = document.createElement('canvas');
							        canvas.width = this.naturalWidth; // or 'width' if you want a special/scaled size
							        canvas.height = this.naturalHeight; // or 'height' if you want a special/scaled size

							        canvas.getContext('2d').drawImage(this, 0, 0);

							        docx.image(canvas.toDataURL('image/png'), cWidth - 54, cHeight - 38, {width: 15});

							        docx.end();
									stream.on('finish', function() {
									  var win = window.open(stream.toBlobURL('application/pdf'));
									  win.print();

									  //var notice = ClientHelper.confirm('success', 'Notify user that his/her webee ID is ready for collection?');
										var notice = ClientHelper.confirm('success', 'The webee ID is properly printed and ready for collection?');

										notice.get().on('pnotify.confirm', function() {
											var params = {
									            "webeeidstatus": "printed"
									        }

									        console.log("printed: " + userId);

									        Meteor.call('updateWebeeIDStatus', userId, params, function(error, result){
												// if (error){
												// 	console.log("error", error);
												// 	var msg = 'Failed to update status to "printed"';
												// 	ClientHelper.notify('danger', msg, true);
												// }

												// if (result){
												// 	var notice = ClientHelper.confirm('success', 'Do you want to notify the user?');
												// 	notice.get().on('pnotify.confirm', function() {
														
												// 	});
												// }
									        });
										});
									});
								}

								image4.src = "/images/logos/TMlogo.png";

							}
							xhr3.responseType = 'arraybuffer';
							xhr3.open('GET', '/fonts/panton/Panton-Bold.ttf', true);
							xhr3.send();
						}

						xhr2.responseType = 'arraybuffer';
						xhr2.open('GET', '/fonts/panton/Panton-Regular.ttf', true);
						xhr2.send();

					};

					xhr.responseType = 'arraybuffer';
					xhr.open('GET', '/fonts/panton/Panton-Black.ttf', true);
					xhr.send();
				}

				image3.src = "/images/logos/TMlogowhite.png";
			}

			image2.src = imgUrl2;
	    };

	    image.src = imgUrl;
	},

	'click .btn-submit-webee-id-comment': function(){
		var userId = Session.get("currentUserToReject");

		var params = {
            "webeeidstatus": "rejected"
            //"webeeidcomment": $('#webee-id-comment').val()
        }

        Meteor.call('updateWebeeIDStatus', userId, params);

        $('.btn-close').click();
	},

	'keyup #search-approved': function(e){
	    Session.set('approvedSearchQuery', $('#search-approved').val());
  	},

	'keyup #search-pending': function(e){
	    Session.set('pendingSearchQuery', $('#search-pending').val());
  	},

	'keyup #search-new': function(e){
	    Session.set('newSearchQuery', $('#search-new').val());
  	},

	'keyup #search-rejected': function(e){
	    Session.set('rejectedSearchQuery', $('#search-rejected').val());
  	},

	'keyup #search-printed': function(e){
	    Session.set('printedSearchQuery', $('#search-printed').val());
  	},

	'keyup #search-collected': function(e){
	    Session.set('collectedSearchQuery', $('#search-collected').val());
  	}
});
