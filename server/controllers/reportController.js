import supabase from '../config/supabaseClient.js';

// @desc    Generate report data (Daily, Weekly, Monthly, Annual)
// @route   GET /api/reports
// @access  Private (Admin, Super Admin)
export const getReports = async (req, res, next) => {
  try {
    const { timeframe = 'monthly' } = req.query;
    let startDate = new Date();

    if (timeframe === 'daily') {
      startDate.setHours(0, 0, 0, 0);
    } else if (timeframe === 'weekly') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (timeframe === 'monthly') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (timeframe === 'annual') {
      startDate.setFullYear(startDate.getFullYear() - 1);
    }

    const isoDate = startDate.toISOString();

    const { data: donations } = await supabase
      .from('donations')
      .select('*, donors!inner(users!inner(name))')
      .gte('created_at', isoDate);

    const { data: requests } = await supabase
      .from('requests')
      .select('*, hospitals!inner(hospital_name)')
      .gte('created_at', isoDate);

    const { data: inventoryAdded } = await supabase
      .from('inventories')
      .select('id')
      .gte('created_at', isoDate);

    const summary = {
      timeframe,
      startDate,
      totalDonationsCollected: (donations || []).length,
      totalDonationUnits: (donations || []).reduce((acc, d) => acc + Number(d.units), 0),
      totalRequestsReceived: (requests || []).length,
      approvedRequestsCount: (requests || []).filter(r => ['Approved', 'Allocated', 'Completed'].includes(r.status)).length,
      rejectedRequestsCount: (requests || []).filter(r => r.status === 'Rejected').length,
      inventoryBatchesAdded: (inventoryAdded || []).length
    };

    res.json({
      success: true,
      summary,
      donations: donations || [],
      requests: requests || []
    });
  } catch (error) {
    next(error);
  }
};
