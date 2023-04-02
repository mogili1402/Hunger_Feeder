const express = require("express");
const router = express.Router();
const middleware = require("../middleware/index.js");
const User = require("../models/user.js");
const Donation = require("../models/donation.js");


router.get("/admin/dashboard", middleware.ensureAdminLoggedIn, async (req,res) => {
	const numFaculty = await User.countDocuments({ role: "faculty" });
	const numMessManager = await User.countDocuments({ role: "messmanager" });
	const numDonors = await User.countDocuments({ role: "donor" });
	const numVolunteers = await User.countDocuments({ role: "volunteer" });
	const numPendingDonations = await Donation.countDocuments({ status: "pending" });
	const numAcceptedDonations = await Donation.countDocuments({ status: "accepted" });
	const numAssignedDonations = await Donation.countDocuments({ status: "assigned" });
	const numCollectedDonations = await Donation.countDocuments({ status: "collected" });

	
	
	last30Days=[]
	last30DaysDonations=[]
	
	aggregatedStats=await Donation.aggregate(
		[
			{
				$group:
				{
					_id: {
						$dateToString: {
							"date": "$cookingTime",
							"format": "%Y-%m-%d",
							"timezone": "Asia/Kolkata"
						}
					}, 
					count: { $sum:1 }
				}
			}
		])
	for (i=0;i<aggregatedStats.length;i++){

		l=aggregatedStats[i]._id+"T00:00:00.000Z"
		aggregatedStats[i]._id=new Date(l)
			
	}
		
	aggregatedStats.sort(function(a,b){return -(a._id.getTime() - b._id.getTime())});
	
	
	for (i=0;i<aggregatedStats.length;i++){
		aggregatedStats[i]._id=aggregatedStats[i]._id.toString()
		last30Days.push(aggregatedStats[i]._id)
		last30DaysDonations.push(aggregatedStats[i].count)
	}

	last30DaysDonations.push(0)
	res.render("admin/dashboard", {
		title: "Dashboard",
		numFaculty, numMessManager, numDonors, numVolunteers, numPendingDonations, numAcceptedDonations, numAssignedDonations, numCollectedDonations, last30Days, last30DaysDonations
	});
});

router.get("/admin/donations/pending", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		const pendingDonations = await Donation.find({status: ["pending", "accepted", "assigned"]}).populate("donor");
		res.render("admin/pendingDonations", { title: "Pending Donations", pendingDonations });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/admin/donations/previous", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		const previousDonations = await Donation.find({ status: "collected" }).populate("donor");
		res.render("admin/previousDonations", { title: "Previous Donations", previousDonations });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/admin/donation/view/:donationId", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		const donationId = req.params.donationId;
		const donation = await Donation.findById(donationId).populate("donor").populate("volunteer");
		res.render("admin/donation", { title: "Donation details", donation });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/admin/donation/accept/:donationId", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		const donationId = req.params.donationId;
		await Donation.findByIdAndUpdate(donationId, { status: "accepted" });
		req.flash("success", "Donation accepted successfully");
		res.redirect(`/admin/donation/view/${donationId}`);
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/admin/donation/reject/:donationId", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		const donationId = req.params.donationId;
		await Donation.findByIdAndUpdate(donationId, { status: "rejected" });
		req.flash("success", "Donation rejected successfully");
		res.redirect(`/admin/donation/view/${donationId}`);
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/admin/donation/assign/:donationId", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		const donationId = req.params.donationId;
		const volunteers = await User.find({ role: "volunteer" });
		const donation = await Donation.findById(donationId).populate("donor");
		res.render("admin/assignVolunteer", { title: "Assign volunteer", donation, volunteers });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.post("/admin/donation/assign/:donationId", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		const donationId = req.params.donationId;
		const {volunteer, adminToVolunteerMsg} = req.body;
		await Donation.findByIdAndUpdate(donationId, { status: "assigned", volunteer, adminToVolunteerMsg });
		req.flash("success", "Volunteer assigned successfully");
		res.redirect(`/admin/donation/view/${donationId}`);
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/admin/volunteers", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		const volunteers = await User.find({ role: "volunteer" });
		res.render("admin/volunteers", { title: "List of volunteers", volunteers });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});




module.exports = router;