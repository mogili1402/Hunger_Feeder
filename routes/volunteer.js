const express = require("express");
const router = express.Router();
const middleware = require("../middleware/index.js");
const User = require("../models/user.js");
const Donation = require("../models/donation.js");

router.get("/volunteer/dashboard", middleware.ensureVolunteerLoggedIn, async (req,res) => {
	const volunteerId = req.user._id;
	const numAssignedDonations = await Donation.countDocuments({ volunteer: volunteerId, status: "assigned" });
	const numCollectedDonations = await Donation.countDocuments({ volunteer: volunteerId, status: "collected" });
	res.render("volunteer/dashboard", {
		title: "Dashboard",
		numAssignedDonations, numCollectedDonations
	});
});

router.get("/volunteer/collections/pending", middleware.ensureVolunteerLoggedIn, async (req,res) => {
	try
	{
		const pendingCollections = await Donation.find({ volunteer: req.user._id, status: "assigned" }).populate("donor");
		res.render("volunteer/pendingCollections", { title: "Pending Collections", pendingCollections });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/volunteer/collections/previous", middleware.ensureVolunteerLoggedIn, async (req,res) => {
	try
	{
		const previousCollections = await Donation.find({ volunteer: req.user._id, status: "collected" }).populate("donor");
		res.render("volunteer/previousCollections", { title: "Previous Collections", previousCollections });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/volunteer/collection/view/:collectionId", middleware.ensureVolunteerLoggedIn, async (req,res) => {
	try
	{
		const collectionId = req.params.collectionId;
		const collection = await Donation.findById(collectionId).populate("donor");
		res.render("volunteer/collection", { title: "Collection details", collection });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/volunteer/collection/collect/:collectionId", middleware.ensureVolunteerLoggedIn, async (req,res) => {
	try
	{
		const collectionId = req.params.collectionId;
		await Donation.findByIdAndUpdate(collectionId, { status: "collected", collectionTime: Date.now() });
		req.flash("success", "Donation collected successfully");
		res.redirect(`/volunteer/collection/view/${collectionId}`);
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});



router.get("/volunteer/profile", middleware.ensureVolunteerLoggedIn, (req,res) => {
	res.render("volunteer/profile", { title: "My Profile" });
});

router.put("/volunteer/profile", middleware.ensureVolunteerLoggedIn, async (req,res) => {
	try
	{
		const id = req.user._id;
		const updateObj = req.body.volunteer;	// updateObj: {firstName, lastName, gender, address, phone}
		await User.findByIdAndUpdate(id, updateObj);
		
		req.flash("success", "Profile updated successfully");
		res.redirect("/volunteer/profile");
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
	
});


module.exports = router;