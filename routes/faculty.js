const express = require("express");
const router = express.Router();
const middleware = require("../middleware/index.js");
const User = require("../models/user.js");
const Donation = require("../models/donation.js");


router.get("/faculty/dashboard", middleware.ensureFacultyLoggedIn, async (req,res) => {
	const donorId = req.user._id;
	const numPendingDonations = await Donation.countDocuments({ donor: donorId, status: "pending" });
	const numAcceptedDonations = await Donation.countDocuments({ donor: donorId, status: "accepted" });
	const numAssignedDonations = await Donation.countDocuments({ donor: donorId, status: "assigned" });
	const numCollectedDonations = await Donation.countDocuments({ donor: donorId, status: "collected" });
	res.render("faculty/dashboard", {
		title: "Dashboard",
		numPendingDonations, numAcceptedDonations, numAssignedDonations, numCollectedDonations
	});
});

router.get("/faculty/donate", middleware.ensureFacultyLoggedIn, (req,res) => {
	res.render("faculty/donate", { title: "Donate" });
});

router.post("/faculty/donate", middleware.ensureFacultyLoggedIn, async (req,res) => {
	try
	{
		const donation = req.body.donation;
		donation.status = "pending";
		donation.donor = req.user._id;
		const newDonation = new Donation(donation);
		await newDonation.save();
		req.flash("success", "Donation request sent successfully");
		res.redirect("/faculty/donations/pending");
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/faculty/donations/pending", middleware.ensureFacultyLoggedIn, async (req,res) => {
	try
	{
		const pendingDonations = await Donation.find({ donor: req.user._id, status: ["pending", "rejected", "accepted", "assigned"] }).populate("volunteer");
		res.render("faculty/pendingDonations", { title: "Pending Donations", pendingDonations });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/faculty/donations/previous", middleware.ensureFacultyLoggedIn, async (req,res) => {
	try
	{
		const previousDonations = await Donation.find({ donor: req.user._id, status: "collected" }).populate("volunteer");
		res.render("faculty/previousDonations", { title: "Previous Donations", previousDonations });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/faculty/donations/deleteRejected/:donationId", async (req,res) => {
	try
	{
		console.log("Deletion")
		const donationId = req.params.donationId;
		await Donation.findByIdAndDelete(donationId);
		res.redirect("/faculty/donations/pending");
		console.log("compelted")
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/faculty/profile", middleware.ensureFacultyLoggedIn, (req,res) => {
	res.render("faculty/profile", { title: "My Profile" });
});

router.put("/faculty/profile", middleware.ensureFacultyLoggedIn, async (req,res) => {
	try
	{
		const id = req.user._id;
		const updateObj = req.body.donor;	// updateObj: {firstName, lastName, gender, address, phone}
		await User.findByIdAndUpdate(id, updateObj);
		
		req.flash("success", "Profile updated successfully");
		res.redirect("/faculty/profile");
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
	
});


module.exports = router;