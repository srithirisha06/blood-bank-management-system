import supabase from '../config/supabaseClient.js';

// @desc    Get inventory summary & stock items
// @route   GET /api/inventory
// @access  Private
export const getInventory = async (req, res, next) => {
  try {
    const { bloodGroup, status } = req.query;
    
    let query = supabase.from('inventories').select('*');

    if (bloodGroup) query = query.eq('blood_group', bloodGroup);
    if (status) query = query.eq('status', status);

    const { data: inventoryItems, error } = await query.order('expiry_date', { ascending: true });
    if (error) throw error;

    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const summary = {};

    bloodGroups.forEach(bg => {
      summary[bg] = 0;
    });

    const { data: availableItems } = await supabase.from('inventories').select('*').eq('status', 'Available');
    
    (availableItems || []).forEach(item => {
      if (summary[item.blood_group] !== undefined) {
        summary[item.blood_group] += Number(item.units);
      }
    });

    const lowStockGroups = Object.entries(summary)
      .filter(([_, units]) => units < 5)
      .map(([bg, units]) => ({ bloodGroup: bg, units }));

    const mappedInventory = inventoryItems.map(item => ({
      ...item,
      _id: item.id,
      bloodGroup: item.blood_group,
      collectionDate: item.collection_date,
      expiryDate: item.expiry_date,
      batchNumber: item.batch_number,
      donationId: item.donation_id
    }));

    res.json({
      success: true,
      summary,
      inventory: mappedInventory,
      lowStockGroups
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add blood batch to inventory
// @route   POST /api/inventory
// @access  Private (Admin, Staff)
export const addInventoryBatch = async (req, res, next) => {
  try {
    const { bloodGroup, units, collectionDate, expiryDays = 35, donationId } = req.body;

    const colDate = collectionDate ? new Date(collectionDate) : new Date();
    const expDate = new Date(colDate);
    expDate.setDate(expDate.getDate() + Number(expiryDays));

    const batchNumber = `BATCH-${bloodGroup.replace('+', 'P').replace('-', 'N')}-${Date.now()}`;

    const { data: inventory, error } = await supabase
      .from('inventories')
      .insert({
        blood_group: bloodGroup,
        units: Number(units),
        collection_date: colDate.toISOString(),
        expiry_date: expDate.toISOString(),
        batch_number: batchNumber,
        status: 'Available',
        donation_id: donationId || null
      })
      .select()
      .single();

    if (error) throw error;

    inventory._id = inventory.id;
    inventory.bloodGroup = inventory.blood_group;

    res.status(201).json({ success: true, inventory });
  } catch (error) {
    next(error);
  }
};

// @desc    Update inventory batch status or units
// @route   PUT /api/inventory/:id
// @access  Private (Admin, Staff)
export const updateInventoryItem = async (req, res, next) => {
  try {
    const { data: existing } = await supabase.from('inventories').select('id').eq('id', req.params.id).maybeSingle();
    if (!existing) return res.status(404).json({ success: false, message: 'Inventory item not found' });

    const { units, status } = req.body;
    const updates = {};
    if (units !== undefined) updates.units = Number(units);
    if (status) updates.status = status;

    const { data: item, error } = await supabase
      .from('inventories')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    
    item._id = item.id;
    item.bloodGroup = item.blood_group;

    res.json({ success: true, inventory: item });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete inventory item
// @route   DELETE /api/inventory/:id
// @access  Private (Admin)
export const deleteInventoryItem = async (req, res, next) => {
  try {
    const { data: existing } = await supabase.from('inventories').select('id').eq('id', req.params.id).maybeSingle();
    if (!existing) return res.status(404).json({ success: false, message: 'Inventory item not found' });

    const { error } = await supabase.from('inventories').delete().eq('id', req.params.id);
    if (error) throw error;

    res.json({ success: true, message: 'Inventory item removed' });
  } catch (error) {
    next(error);
  }
};
