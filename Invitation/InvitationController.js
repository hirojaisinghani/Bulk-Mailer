const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
var Invitation = require('./Invitation');
const BulkMailer = require("../bulkmailer");
const emailContent = require('../emailContent');
const options = {
    transport: {
        service: 'Gmail',
        auth: {
            // user: 'hiro.jaisinghani.sa@gmail.com',
            // pass: 'Hiro@sa1234'
            user: 'vyasapuja2019@gmail.com',
            pass: 'krishna@108'
    }
    },
    verbose: true
};


// RETURNS ALL THE Devotees IN THE DATABASE
router.get('/', function (req, res) {
    const perPage = parseInt(req.query.perPage) || 10
    const pageNo = parseInt(req.query.pageNO) || 1;
    const pagination = {
        limit: perPage ,
        skip:perPage * (pageNo - 1)
      }
    const invitation = Invitation.find({}).limit(pagination.limit).skip(pagination.skip).exec();
    invitation.then((invitations) => {
        res.status(200).send(invitations);
    });
    
});



// RETURNS ALL THE Devotees IN THE DATABASE
router.get('/email', function (req, res) {
    const perPage = parseInt(req.query.perPage) || 10
    const pageNo = parseInt(req.query.pageNO) || 1;
    const pagination = {
        limit: perPage ,
        skip:perPage * (pageNo - 1)
      }

      Invitation.count({})
      .then(number => {
          if (number > 0) {
            const invitation = Invitation.find({isEmailSent: false}).exec();
            invitation.then((invitations) => {
                repeater(0, invitations);
                res.status(200).send(invitations);
            });
          }
      });
    
    
});


// GETS A SINGLE Devotee FROM THE DATABASE
router.get('/:id', function (req, res) {
    Devotee.findById(req.params.id, function (err, Devotee) {
        if (err) return res.status(500).send("There was a problem finding the Devotee.");
        if (!Devotee) return res.status(404).send("No Devotee found.");
        res.status(200).send(Devotee);
    });
});

// DELETES A Devotee FROM THE DATABASE
router.delete('/:id', function (req, res) {
    Devotee.findByIdAndRemove(req.params.id, function (err, Devotee) {
        if (err) return res.status(500).send("There was a problem deleting the Devotee.");
        res.status(200).send("Devotee: "+ Devotee.name +" was deleted.");
    });
});

// UPDATES A SINGLE Devotee IN THE DATABASE
router.put('/:id', function (req, res) {
    Devotee.findByIdAndUpdate(req.params.id, req.body, {new: true}, function (err, Devotee) {
        if (err) return res.status(500).send("There was a problem updating the Devotee.");
        res.status(200).send(Devotee);
    });
});

const sendEmail = (user, callback) => {
    const content = emailContent.mapToHtmlContent(user.name);
    // console.log(content);
    
    const bulkMailer = new BulkMailer(options)
    const mailOptions = {
        from: 'Vyasapuja Coordination Team <vyasapuja2019@gmail.com>',
        to: user.email.toLowerCase(),//emailArray, //'hirojaisinghani@gmail.com, hiro@mailinator.com',
        subject: `HH Lokanath Swami Maharaj 70th Vyasapuja Invitation`,
        html: content,
        attachments: [
            {
                filename: 'Vyasapuja Registration Group.xlsx',
                path: '/Users/user/Documents/LokDis/Bulk-Mailer/Vyasapuja Registration Group.xlsx',
            },
            {
                filename: 'HH Lokanath Swami Maharaj Invitation Card 1.jpg',
                path: '/Users/user/Documents/LokDis/Bulk-Mailer/HH Lokanath Swami Maharaj Invitation Card 1.jpg',
                cid:'unique@kreata.eee'
            },
            {
                filename: 'HH Lokanath Swami Maharaj Invitation Card 2.jpg',
                path: '/Users/user/Documents/LokDis/Bulk-Mailer/HH Lokanath Swami Maharaj Invitation Card 2.jpg',
                cid:'unique@kreata.ee'
            },
            

        ],
        // attachments: 
    }
    // console.log(mailOptions);
    // callback();
    bulkMailer.send(mailOptions, false, function (error, result) { // arg1: mailinfo, agr2: parallel mails, arg3: callback
        if (error) {
            console.error(error);
            Invitation.findByIdAndUpdate(user._id, { isEmailSent: false, error: JSON.stringify(error) }, {}, (err, doc) => {
                console.info('Number email sent fail', user._id);
                callback();
            })
        } else {
            Invitation.findByIdAndUpdate(user._id, { isEmailSent: true, success: JSON.stringify(result) }, {}, (err, doc) => {
                console.info('Number email sent success', user._id);
                callback();
            })
        }
    });
}
function repeater(i, emailsArray) {
    if (i == emailsArray.length) {
        console.log('number of devotees ::::'+i);
        console.log('successfully email sent to all');
        return;
    }
    if (i < emailsArray.length) {
        sendEmail(emailsArray[i], function(){
            repeater(i+1, emailsArray);
        });
    }
    
}




module.exports = router;