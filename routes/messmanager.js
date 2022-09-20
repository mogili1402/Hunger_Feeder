const express = require("express");
const router = express.Router();
const middleware = require("../middleware/index.js");
const User = require("../models/user.js");
const Donation = require("../models/donation.js");


router.get("/messmanager/dashboard", middleware.ensureMessManagerLoggedIn, async (req,res) => {
	const donorId = req.user._id;
	const numPendingDonations = await Donation.countDocuments({ donor: donorId, status: "pending" });
	const numAcceptedDonations = await Donation.countDocuments({ donor: donorId, status: "accepted" });
	const numAssignedDonations = await Donation.countDocuments({ donor: donorId, status: "assigned" });
	const numCollectedDonations = await Donation.countDocuments({ donor: donorId, status: "collected" });
	res.render("messmanager/dashboard", {
		title: "Dashboard",
		numPendingDonations, numAcceptedDonations, numAssignedDonations, numCollectedDonations
	});
});

router.get("/messmanager/donate", middleware.ensureMessManagerLoggedIn, (req,res) => {
	res.render("messmanager/donate", { title: "Donate" });
});

router.post("/messmanager/donate", middleware.ensureMessManagerLoggedIn, async (req,res) => {
	try
	{
		const donation = req.body.donation;
		donation.status = "pending";
		donation.donor = req.user._id;
		const newDonation = new Donation(donation);
		await newDonation.save();
		req.flash("success", "Donation request sent successfully");
		res.redirect("/messmanager/donations/pending");
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/messmanager/donations/pending", middleware.ensureMessManagerLoggedIn, async (req,res) => {
	try
	{
		const pendingDonations = await Donation.find({ donor: req.user._id, status: ["pending", "rejected", "accepted", "assigned"] }).populate("volunteer");
		res.render("messmanager/pendingDonations", { title: "Pending Donations", pendingDonations });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/messmanager/donations/previous", middleware.ensureMessManagerLoggedIn, async (req,res) => {
	try
	{
		const previousDonations = await Donation.find({ donor: req.user._id, status: "collected" }).populate("volunteer");
		res.render("messmanager/previousDonations", { title: "Previous Donations", previousDonations });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/messmanager/donations/deleteRejected/:donationId", async (req,res) => {
	try
	{
		console.log("mess manager")
		const donationId = req.params.donationId;
		await Donation.findByIdAndDelete(donationId);
		console.log("sass")
		res.redirect("/messmanager/donations/pending");
		console.log("sass")
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/messmanager/profile", middleware.ensureMessManagerLoggedIn, (req,res) => {
	res.render("messmanager/profile", { title: "My Profile" });
});

router.put("/messmanager/profile", middleware.ensureMessManagerLoggedIn, async (req,res) => {
	try
	{
		const id = req.user._id;
		const updateObj = req.body.donor;	// updateObj: {firstName, lastName, gender, address, phone}
		await User.findByIdAndUpdate(id, updateObj);
		
		req.flash("success", "Profile updated successfully");
		res.redirect("/messmanager/profile");
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
	
});


module.exports = router;