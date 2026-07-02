import { asyncHandler } from '../middleware/error.js';
import BoardMember from '../models/BoardMember.js';
import Service from '../models/Service.js';
import Offer from '../models/Offer.js';
import Lecture from '../models/Lecture.js';
import Judgment from '../models/Judgment.js';
import Contract from '../models/Contract.js';
import GovernmentLink from '../models/GovernmentLink.js';
import Activity from '../models/Activity.js';
import Complaint from '../models/Complaint.js';

// @desc Dashboard statistics
// @route GET /api/stats
export const getStats = asyncHandler(async (req, res) => {
  const [
    boardMembers,
    services,
    offers,
    lectures,
    judgments,
    contracts,
    governmentLinks,
    activities,
    complaintsTotal,
    complaintsNew,
    complaintsByStatus,
    judgmentsByCategory,
    recentComplaints,
  ] = await Promise.all([
    BoardMember.countDocuments(),
    Service.countDocuments(),
    Offer.countDocuments(),
    Lecture.countDocuments(),
    Judgment.countDocuments(),
    Contract.countDocuments(),
    GovernmentLink.countDocuments(),
    Activity.countDocuments(),
    Complaint.countDocuments(),
    Complaint.countDocuments({ status: 'جديد' }),
    Complaint.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Judgment.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
    Complaint.find().sort({ createdAt: -1 }).limit(5).lean(),
  ]);

  res.json({
    success: true,
    data: {
      counts: {
        boardMembers,
        services,
        offers,
        lectures,
        judgments,
        contracts,
        governmentLinks,
        activities,
        complaints: complaintsTotal,
        newComplaints: complaintsNew,
      },
      complaintsByStatus,
      judgmentsByCategory,
      recentComplaints,
    },
  });
});
