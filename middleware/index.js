const middleware = {
	ensureLoggedIn: (req, res, next) => {
		if(req.isAuthenticated()) {
			return next();
		}
		req.flash("warning", "Please log in first to continue");
		res.redirect("/auth/login");
	},
	
	ensureAdminLoggedIn: (req, res, next) => {
		if(req.isUnauthenticated()) {
			req.session.returnTo = req.originalUrl;
			req.flash("warning", "Please log in first to continue");
			return res.redirect("/auth/login");
		}
		if(req.user.role != "admin") {
			req.flash("warning", "This route is allowed for admin only!!");
			return res.redirect("back");
		}
		next();
	},
	ensureFacultyLoggedIn: (req, res, next) => {
		if(req.isUnauthenticated()) {
			req.session.returnTo = req.originalUrl;
			req.flash("warning", "Please log in first to continue");
			return res.redirect("/auth/login");
		}
		if(req.user.role != "faculty") {
			req.flash("warning", "This route is allowed for donor only!!");
			return res.redirect("back");
		}
		next();
	},
	ensureDonorLoggedIn: (req, res, next) => {
		if(req.isUnauthenticated()) {
			req.session.returnTo = req.originalUrl;
			req.flash("warning", "Please log in first to continue");
			return res.redirect("/auth/login");
		}
		if(req.user.role != "donor") {
			req.flash("warning", "This route is allowed for donor only!!");
			return res.redirect("back");
		}
		next();
	},
	
	ensureVolunteerLoggedIn: (req, res, next) => {
		if(req.isUnauthenticated()) {
			req.session.returnTo = req.originalUrl;
			req.flash("warning", "Please log in first to continue");
			return res.redirect("/auth/login");
		}
		if(req.user.role != "volunteer") {
			req.flash("warning", "This route is allowed for volunteer only!!");
			return res.redirect("back");
		}
		next();
	},
	ensureMessManagerLoggedIn: (req, res, next) => {
		if(req.isUnauthenticated()) {
			req.session.returnTo = req.originalUrl;
			req.flash("warning", "Please log in first to continue");
			return res.redirect("/auth/login");
		}
		if(req.user.role != "messmanager") {
			req.flash("warning", "This route is allowed for Mess Manager only!!");
			return res.redirect("back");
		}
		next();
	},
	ensureNotLoggedIn: (req, res, next) => {
		if(req.isAuthenticated()) {
			console.log(req.isAuthenticated())
			req.flash("warning", "Please logout first to continue");
			if(req.user.role == "admin")
				return res.redirect("/admin/dashboard");
			if(req.user.role == "donor")
				return res.redirect("/donor/dashboard");
			if(req.user.role == "volunteer")
				return res.redirect("/volunteer/dashboard");
			if(req.user.role == "messmanager")
				return res.redirect("/messmanager/dashboard");
			if(req.user.role == "faculty")
				return res.redirect("/faculty/dashboard");
		}
		next();
	}
	
}

module.exports = middleware;