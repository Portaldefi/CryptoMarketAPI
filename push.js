var apn = require('apn');

module.exports.send_ios_notification = function(deviceToken, msg, provider){
    var note = new apn.Notification();
    note.expiry = Math.floor(Date.now() / 1000) + 3600;
    note.badge = 1;
    note.sound = "ping.aiff";
    note.alert = msg;
    note.payload = {'messageFrom': 'Portal Alerts'};
    note.topic = "com.tides.portal.mac";

    provider.send(note, deviceToken).then( (response) => {
        response.sent.forEach( (token) => {
        //  notificationSent(user, token);
            console.log("Sent notification")
        });
        response.failed.forEach( (failure) => {
          if (failure.error) {
          //  notificationError(user, failure.device, failure.error);
            console.log(failure.device, failure.error)
          } else {
          // notificationFailed(user, failure.device, failure.status, failure.response);
            console.log(failure.device, failure.error)
          }
        });
    });

}