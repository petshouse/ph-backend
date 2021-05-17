import nodemailer from 'nodemailer';

"use strict";

const smtpEndpoint = "email-smtp.us-west-2.amazonaws.com";
const port = 587;
const senderAddress = "Mary Major <caroink@naver.com>";

let toAddresses = "recipient@example.com";
let ccAddresses = "cc-recipient0@example.com,cc-recipient1@example.com";
let bccAddresses = "bcc-recipient@example.com";

const smtpUsername = "AKIAIOSFODNN7EXAMPLE";

const smtpPassword = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY";

let configurationSet = "ConfigSet";

let subject = "Amazon SES test (Nodemailer)";

let body_text = `Amazon SES Test (Nodemailer)
---------------------------------
This email was sent through the Amazon SES SMTP interface using Nodemailer.
`;

let body_html = `<html>
<head></head>
<body>
  <h1>Amazon SES Test (Nodemailer)</h1>
  <p>This email was sent with <a href='https://aws.amazon.com/ses/'>Amazon SES</a>
        using <a href='https://nodemailer.com'>Nodemailer</a> for Node.js.</p>
</body>
</html>`;

let tag0 = "key0=value0";
let tag1 = "key1=value1";

async function main(){

  // Create the SMTP transport.
  let transporter = nodemailer.createTransport({
    host: smtpEndpoint,
    port: port,
    secure: false, // true for 465, false for other ports
    auth: {
      user: smtpUsername,
      pass: smtpPassword
    }
  });

  let mailOptions = {
    from: senderAddress,
    to: toAddresses,
    subject: subject,
    cc: ccAddresses,
    bcc: bccAddresses,
    text: body_text,
    html: body_html,
    // Custom headers for configuration set and message tags.
    headers: {
      'X-SES-CONFIGURATION-SET': configurationSet,
      'X-SES-MESSAGE-TAGS': tag0,
      'X-SES-MESSAGE-TAGSs': tag1
    }
  };

  let info = await transporter.sendMail(mailOptions)

  console.log("Message sent! Message ID: ", info.messageId);
}
main().catch(console.error);

export default main;