module.exports = function(app, passport, fs, db) {

  // ====================================================
  // HOME PAGE
  // ====================================================
  app.get('/', function(req, res) {
    var hasUser, email, userid, firstName, lastName;
    // set variables depending on if there is a logged in user
    if (typeof req.user !== 'undefined' && req.user && typeof req.user[0] !== 'undefined' && req.user[0]) {
      hasUser = true;
      email = req.user[0].Email;
      userid = req.user[0].UserID;
      firstName = req.user[0].FirstName;
      lastName = req.user[0].LastName;
    } else {
      hasUser = false;
      email = '';
      userid = '';
      firstName = '';
      lastName = '';
    }

    //console.log('current user = ' + email);
    res.render('pages/index', {
      hasUser: hasUser,
      email: email,
      userid: userid,
      firstName: firstName,
      lastName: lastName
    });
  });

  // ====================================================
  // LOGIN PAGE
  // ====================================================
	app.get('/login', function(req, res){
		res.render('pages/login', {
			message: req.flash('loginMessage')
		});
	});
	// process the login form
	app.post('/login', passport.authenticate('local-login', {
		successRedirect: '/',
		failureRedirect: '/login',
		failureFlash: true
	}));

	// ====================================================
	// SIGN-UP PAGE
	// ====================================================
	app.get('/signup', function(req, res){
		res.render('pages/signup', {
			message: req.flash('signupMessage')
		});
	});
	// process the signup form
	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect: '/profile',
		failureRedirect: '/signup',
		failureFlash: true
	}));

  // ====================================================
  // LOGOUT PAGE
  // ====================================================
	app.get('/logout', function(req, res){
		req.logout();
		res.redirect('/');
	});

  // ====================================================
  // PROFILE PAGE
  // ====================================================
	app.get('/profile', isLoggedIn, function(req, res){
		res.render('pages/profile', {
			user: req.user[0]
		});
	});

  // ====================================================
  // ABOUT PAGE
  // ====================================================
  app.get('/about', function(req, res) {
    var text = fs.readFileSync('./views/partials/aboutText.txt').toString();
    res.render('pages/about', {
      aboutText: text
    });
  });

  // ====================================================
  // VOLUNTEER PAGE
  // ====================================================
  app.get('/volunteer', function(req, res) {
    var hasUser = false;
    var email = '';
    var userid = '';
    var firstName = '';
    var lastName = '';
    // set variables depending on if there is a logged in user
    if (typeof req.user !== 'undefined' && req.user && typeof req.user[0] !== 'undefined' && req.user[0]) {
      hasUser = true;
      email = req.user[0].Email;
      userid = req.user[0].UserID;
      firstName = req.user[0].FirstName;
      lastName = req.user[0].LastName;
    }
    // get volunteer LIST
    var sql = fs.readFileSync('./queries/volunteerList.sql').toString();
    db.all(sql, function(err, volunteers) {
      if (err) {
        console.log(err);
        console.log(sql);
        req.flash('failureMessage', 'There was a problem retrieving a volunteer list.');
      }
      res.render('pages/volunteer', {
        hasUser: hasUser,
        volunteers: volunteers,
        successMessage: req.flash('successMessage'),
        failMessage: req.flash('failureMessage')
      });
    });
  });
  // process the volunteer Information
  app.post('/volunteer', function(req, res) {
    var hasUser = false;
    var volunteers = [];
    if (typeof req.user !== 'undefined' && req.user && typeof req.user[0] !== 'undefined' && req.user[0]) {
      hasUser = true;
    }
    successMessage: true;
    failureFlash: true;
    var sql = fs.readFileSync('./queries/volunteerList.sql').toString();
    db.all(sql, function(err, volunteers) {
      if (err) {
        console.log(err);
        console.log(sql);
        req.flash('failureMessage', 'There was a problem retrieving a volunteer list.');
      }
      sql = fs.readFileSync('./queries/serviceInsert.sql').toString()
        .replace('{0}', req.body.serviceName.replace("'", "''"))
        .replace('{1}', req.body.serviceDescription.replace("'", "''"));
      db.run(sql, function(err, records) {
        if (err) {
          console.log(err);
          console.log(sql);
          req.flash('failureMessage', 'There was a problem saving the service.');
          res.render('pages/volunteer', {
            hasUser: hasUser,
            volunteers: volunteers,
            successMessage: req.flash('successMessage'),
            failMessage: req.flash('failureMessage')
          });
        } else {
          sql = fs.readFileSync('./queries/volunteerInsert.sql').toString()
            .replace('{0}', req.user[0].UserID)
            .replace('{1}', req.body.serviceName.replace("'", "''"));
          db.run(sql, function(err, records) {
            if (err) {
              console.log(err);
              console.log(sql);
              req.flash('failureMessage', 'There was a problem saving the volunteer.');
            } else {
              req.flash('successMessage', 'The volunteer service was added successfully.');
            }
            res.render('pages/volunteer', {
              hasUser: hasUser,
              volunteers: volunteers,
              successMessage: req.flash('successMessage'),
              failMessage: req.flash('failureMessage')
            });
          });
        }
      });
    });
  });

  // ====================================================
  // DONATIONS PAGE
  // ====================================================
  app.get('/donations', function(req, res) {
    var hasUser = typeof req.user !== 'undefined' && req.user &&
      typeof req.user[0] !== 'undefined' && req.user[0];
    res.render('pages/donations', {
      hasUser: hasUser,
      email: (hasUser) ? req.user[0].Email : '',
      userid: (hasUser) ? req.user[0].UserID : '',
      firstName: (hasUser) ? req.user[0].FirstName : '',
      lastName: (hasUser) ? req.user[0].LastName : '',
      successMessage: req.flash('successMessage'),
      failMessage: req.flash('failureMessage')
    });
  });
  // process donation FORM
  app.post('/donations', function(req, res) {
    var hasUser = typeof req.user !== 'undefined' && req.user &&
      typeof req.user[0] !== 'undefined' && req.user[0];
    successMessage: true;
    failureFlash: true;
    var sql = fs.readFileSync('./queries/donationInsert.sql').toString()
      .replace('{0}', req.body.firstName)
      .replace('{1}', req.body.lastName)
      .replace('{2}', req.body.email)
      .replace('{3}', req.body.creditCard)
      .replace('{4}', req.body.expDate)
      .replace('{5}', req.body.cvcCode)
      .replace('{6}', req.body.zipCode);
    db.run(sql, function(err, records) {
      if (err) {
        console.log(err);
        console.log(sql);
        req.flash('failureMessage', 'There was a problem saving the donation.');
      } else {
        req.flash('successMessage', 'Thank you! The donation was made successfully.');
      }
      res.render('pages/donations', {
        hasUser: hasUser,
        email: (hasUser) ? req.user[0].Email : '',
        userid: (hasUser) ? req.user[0].UserID : '',
        firstName: (hasUser) ? req.user[0].FirstName : '',
        lastName: (hasUser) ? req.user[0].LastName : '',
        successMessage: req.flash('successMessage'),
        failMessage: req.flash('failureMessage')
      });
    });
  });

  // ====================================================
  // SERVICES PAGE
  // ====================================================
  app.get('/services', function(req, res) {
    var hasUser = typeof req.user !== 'undefined' && req.user &&
      typeof req.user[0] !== 'undefined' && req.user[0];
    var type = req.query.ServiceType;
    var sql = fs.readFileSync('./queries/servicesSelect.sql').toString();
    if (typeof type !== 'undefined' && type) {
      sql = sql.replace("order by", "where ServiceType = '" + type + "'\n order by")
    }
    db.all(sql, function(err, services) {
      if (err) {
        console.log(err);
        console.log(sql);
        req.flash('failureMessage', 'There was a problem retrieving the services list.');
      }
      res.render('pages/services', {
        hasUser: hasUser,
        email: (hasUser) ? req.user[0].Email : '',
        userid: (hasUser) ? req.user[0].UserID : '',
        firstName: (hasUser) ? req.user[0].FirstName : '',
        lastName: (hasUser) ? req.user[0].LastName : '',
        isAdmin: (hasUser) ? req.user[0].IsAdmin : false,
        services: services,
        successMessage: req.flash('successMessage'),
        failMessage: req.flash('failureMessage')
      });
    });
  });
  // process admin operations
  app.post('/services', function(req, res) {
    var serviceID = req.body.serviceId;
    var serviceName = (req.body.serviceName) ? req.body.serviceName : '';
    var serviceDesc = (req.body.serviceDescription) ? req.body.serviceDescription : '';
    var sql = fs.readFileSync('./queries/serviceEdit.sql').toString()
      .replace('{0}', serviceName)
      .replace('{1}', serviceDesc)
      .replace('{2}', req.body.serviceType)
      .replace('{3}', req.body.servicePrice)
      .replace('{4}', req.body.serviceFee)
      .replace('{5}', serviceID);
    if (req.body.operationType == "DELETE") {
      sql = fs.readFileSync('./queries/serviceDelete.sql').toString()
        .replace('{0}', serviceID);
    }
    db.run(sql, function(err, records) {
      if (err) {
        console.log(err);
        console.log(sql);
      }
      res.redirect('/services');
    });
  });

  // ====================================================
  // SERVICE DETAILS PAGE
  // ====================================================
  app.get('/service', function(req, res) {
    var hasUser = typeof req.user !== 'undefined' && req.user &&
      typeof req.user[0] !== 'undefined' && req.user[0];
    var id = req.query.ServiceID;
    var sql = fs.readFileSync('./queries/serviceDetails.sql').toString().replace('{0}', id);
    db.all(sql, function(err, services) {
      if (err) {
          console.log(err);
          console.log(sql);
          req.flash('failureMessage', 'There was a problem retrieving the service details.');
      }
      res.render('pages/service', {
        hasUser: hasUser,
        email: (hasUser) ? req.user[0].Email : '',
        userid: (hasUser) ? req.user[0].UserID : '',
        firstName: (hasUser) ? req.user[0].FirstName : '',
        lastName: (hasUser) ? req.user[0].LastName : '',
        service: services[0],
        successMessage: req.flash('successMessage'),
        failMessage: req.flash('failureMessage')
      });
    });
  });
  // process purchase FORM
  app.post('/service', function(req, res) {
    var hasUser = typeof req.user !== 'undefined' && req.user &&
      typeof req.user[0] !== 'undefined' && req.user[0];
    successMessage: true;
    failureFlash: true;
    var sql = fs.readFileSync('./queries/servicesSelect.sql').toString();
    db.all(sql, function(err, services) {
      if (err) {
          console.log(err);
          console.log(sql);
          req.flash('failureMessage', 'There was a problem retrieving a services list.');
      } else {
        req.flash('successMessage', 'Thank you! A voucher for the service will be emailed to the supplied email address.');
      }
      res.render('pages/services', {
        hasUser: hasUser,
        email: (hasUser) ? req.user[0].Email : '',
        userid: (hasUser) ? req.user[0].UserID : '',
        firstName: (hasUser) ? req.user[0].FirstName : '',
        lastName: (hasUser) ? req.user[0].LastName : '',
        services: services,
        successMessage: req.flash('successMessage'),
        failMessage: req.flash('failureMessage')
      });
    });
  });

  // ====================================================
  // SERVICE REQUEST PAGE
  // ====================================================
  app.get('/request', function(req, res) {
    res.render('pages/request', {
      successMessage: req.flash('successMessage'),
      failMessage: req.flash('failureMessage')
    });
  });
  // process request form
  app.post('/request', function(req, res) {
    var hasUser = typeof req.user !== 'undefined' && req.user &&
      typeof req.user[0] !== 'undefined' && req.user[0];
    successMessage: true;
    failureFlash: true;
    var sql = fs.readFileSync('./queries/servicesSelect.sql').toString();
    db.all(sql, function(err, services) {
      if (err) {
          console.log(err);
          console.log(sql);
          req.flash('failureMessage', 'There was a problem retrieving a services list.');
      } else {
        req.flash('successMessage', 'Your request has been submitted successfully.');
      }
      res.render('pages/services', {
        hasUser: hasUser,
        email: (hasUser) ? req.user[0].Email : '',
        userid: (hasUser) ? req.user[0].UserID : '',
        firstName: (hasUser) ? req.user[0].FirstName : '',
        lastName: (hasUser) ? req.user[0].LastName : '',
        isAdmin: (hasUser) ? req.user[0].IsAdmin : false,
        services: services,
        successMessage: req.flash('successMessage'),
        failMessage: req.flash('failureMessage')
      });
    });
  });

  //===================================================
};

// ====================================================
// route middle-ware to make sure user is logged in
function isLoggedIn(req, res, next) {
  // if user is authenticated in the session, carry on
  if (req.isAuthenticated())
    return next();
  // if they aren't redirect them to the home page
  res.redirect('/login');
};
