import supabase from '../config/supabaseClient.js';

// @desc    Get complete dashboard metrics & charts data
// @route   GET /api/dashboard/stats
// @access  Private
export const getDashboardStats = async (req, res, next) => {
  try {
    const [{ count: totalDonors }, { count: totalHospitals }, { count: totalCamps }] = await Promise.all([
      supabase.from('donors').select('id', { count: 'exact' }),
      supabase.from('hospitals').select('id', { count: 'exact' }),
      supabase.from('camps').select('id', { count: 'exact' })
    ]);

    const { data: availableInventory } = await supabase.from('inventories').select('*').eq('status', 'Available');
    const totalBloodUnits = (availableInventory || []).reduce((acc, item) => acc + Number(item.units), 0);

    const bloodGroupDistribution = {
      'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0, 'AB+': 0, 'AB-': 0, 'O+': 0, 'O-': 0
    };

    (availableInventory || []).forEach(item => {
      if (bloodGroupDistribution[item.blood_group] !== undefined) {
        bloodGroupDistribution[item.blood_group] += Number(item.units);
      }
    });

    const lowStockThreshold = 5;
    const lowStockCount = Object.values(bloodGroupDistribution).filter(units => units < lowStockThreshold).length;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const { count: todaysDonations } = await supabase
      .from('donations')
      .select('id', { count: 'exact' })
      .gte('donation_date', startOfToday.toISOString());

    const { count: pendingRequests } = await supabase.from('requests').select('id', { count: 'exact' }).eq('status', 'Pending');
    const { count: approvedRequests } = await supabase.from('requests').select('id', { count: 'exact' }).in('status', ['Approved', 'Allocated', 'Completed']);
    const { count: rejectedRequests } = await supabase.from('requests').select('id', { count: 'exact' }).eq('status', 'Rejected');

    const monthlyDonations = [];
    const monthlyRequests = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const currentDate = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const nextD = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 1);
      const label = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;

      const { count: donCount } = await supabase
        .from('donations')
        .select('id', { count: 'exact' })
        .gte('donation_date', d.toISOString())
        .lt('donation_date', nextD.toISOString());

      const { count: reqCount } = await supabase
        .from('requests')
        .select('id', { count: 'exact' })
        .gte('created_at', d.toISOString())
        .lt('created_at', nextD.toISOString());

      monthlyDonations.push({ month: label, count: donCount || 0 });
      monthlyRequests.push({ month: label, count: reqCount || 0 });
    }

    res.json({
      success: true,
      stats: {
        totalDonors: totalDonors || 0,
        totalHospitals: totalHospitals || 0,
        totalBloodUnits,
        lowStockCount,
        todaysDonations: todaysDonations || 0,
        pendingRequests: pendingRequests || 0,
        approvedRequests: approvedRequests || 0,
        rejectedRequests: rejectedRequests || 0,
        totalCamps: totalCamps || 0
      },
      charts: {
        bloodGroupDistribution,
        monthlyDonations,
        monthlyRequests
      }
    });
  } catch (error) {
    next(error);
  }
};
