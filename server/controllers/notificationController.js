import supabase from '../config/supabaseClient.js';

// @desc    Get notifications for current logged in user
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res, next) => {
  try {
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .or(`receiver.eq.${req.user._id},receiver_role.eq.${req.user.role},receiver_role.eq.all`)
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) throw error;

    const unreadCount = notifications.filter(n => !n.read).length;

    const mappedNotifications = notifications.map(n => ({
      ...n,
      _id: n.id,
      receiverRole: n.receiver_role
    }));

    res.json({
      success: true,
      notifications: mappedNotifications,
      unreadCount
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markNotificationRead = async (req, res, next) => {
  try {
    const { data: existing } = await supabase.from('notifications').select('id').eq('id', req.params.id).maybeSingle();
    if (!existing) return res.status(404).json({ success: false, message: 'Notification not found' });

    const { data: notification, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    
    notification._id = notification.id;

    res.json({ success: true, notification });
  } catch (error) {
    next(error);
  }
};
