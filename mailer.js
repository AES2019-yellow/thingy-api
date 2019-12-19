 const nodemailer = require("nodemailer");

 async function sendMail(reciever,subject,plainText,richText){

    var transport = nodemailer.createTransport({
        host: "smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "1eab0d87cd34b9",
          pass: "e30e1ce282408d"
        }
      });
      
      let info = await transport.sendMail({
        from: '"Thingy-Yellow" <info@thingy-yellow.io>', // sender address
        to: reciever, // list of receivers
        subject: subject, // Subject line
        text: plainText, // plain text body
        html: richText // html body
      });

      console.log("Message sent: %s", info.messageId);


 }

 module.exports = sendMail

 