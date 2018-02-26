var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt-nodejs');
module.exports = function(passport, fs, db) {

  // serialize a user for the sessions
  passport.serializeUser(function(user, done) {
    done(null, user.Email);
  });

  // deserialize a user
  passport.deserializeUser(function(email, done) {
    var sql = fs.readFileSync('./queries/userSelect.sql').toString().replace('{0}', email);
    db.all(sql, function(err, records) {
      done(err, records);
    });
  });

  // ================================================================================================
	// REGISTER A NEW USER
	// ================================================================================================
	passport.use('local-signup', new LocalStrategy({
		usernameField: 'email',
		passwordField: 'password',
		passReqToCallback : true
	},
	function(req, email, password, done) {
		var sql = fs.readFileSync('./queries/userSelect.sql').toString().replace('{0}', email);
		db.all(sql, function(err, records) {
			if (err)
				return done(err);
			if (records.length) {
				return done(null, false, req.flash('signupMessage', 'That email is already registered.'));
			} else {
				// new user object
				var newUser = new Object();
				newUser.email = email;
				newUser.password = bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
				newUser.lastName = req.body.lastName;
				newUser.firstName = req.body.firstName;
        newUser.isAdmin = (req.body.isAdmin) ? 1 : 0;
				// form the insert query
				var sql_insert = fs.readFileSync('./queries/userInsert.sql').toString()
					.replace('{0}', newUser.email)
					.replace('{1}', newUser.password)
					.replace('{2}', newUser.firstName)
					.replace('{3}', newUser.lastName)
          .replace('{4}', newUser.isAdmin);
				db.run(sql_insert, function(err, records) {
					db.all(sql, function(err, users) {
						var user = users[0];
						return done(null, user);
					});
				});
			}
		});
	}));

	// ================================================================================================
	// USER LOGIN
	// ================================================================================================
	passport.use('local-login', new LocalStrategy({
		usernameField: 'email',
		passwordField: 'password',
		passReqToCallback: true
	},
	function(req, email, password, done) {
		var sql = fs.readFileSync('./queries/userSelect.sql').toString().replace('{0}', email);
		db.all(sql, function(err, records) {
			var user = records[0];

			if (err)
				return done(err);
			if (!user)
				return done(null, false, req.flash('loginMessage', 'No user found.'));
			if (!bcrypt.compareSync(password, user.Password))
				return done(null, false, req.flash('loginMessage', 'Incorrect password.'));
			return done(null, user);
		});
	}));
};
