import Record from '../models/Record.model.js';

// @desc    Get all records
// @route   GET /api/records
// @access  Private
export const getRecords = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    let query = {};
    
    // Filter by terminal if user is admin
    if (req.user.role === 'admin' && req.user.terminalId) {
      query.terminalId = req.user.terminalId;
    }

    // Filter by date range
    if (req.query.startDate && req.query.endDate) {
      query.createdAt = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }

    // Filter by action
    if (req.query.action) {
      query.action = req.query.action;
    }

    // Filter by vehicle
    if (req.query.vehicleId) {
      query.vehicleId = req.query.vehicleId;
    }

    // Filter by driver
    if (req.query.driverId) {
      query.driverId = req.query.driverId;
    }

    const records = await Record.find(query)
      .populate('vehicleId', 'plateNumber type')
      .populate('driverId', 'name phone')
      .populate('terminalId', 'name location')
      .populate('createdBy', 'name')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    const total = await Record.countDocuments(query);

    res.status(200).json({
      success: true,
      count: records.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      records
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get single record
// @route   GET /api/records/:id
// @access  Private
export const getRecord = async (req, res) => {
  try {
    const record = await Record.findById(req.params.id)
      .populate('vehicleId')
      .populate('driverId')
      .populate('terminalId')
      .populate('createdBy', 'name email');

    if (!record) {
      return res.status(404).json({
        success: false,
        error: 'Record not found'
      });
    }

    res.status(200).json({
      success: true,
      record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get today's records
// @route   GET /api/records/today
// @access  Private
export const getTodaysRecords = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    let query = {
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    };

    if (req.user.role === 'admin' && req.user.terminalId) {
      query.terminalId = req.user.terminalId;
    }

    const records = await Record.find(query)
      .populate('vehicleId', 'plateNumber type')
      .populate('driverId', 'name phone')
      .populate('terminalId', 'name location')
      .populate('createdBy', 'name')
      .sort('-createdAt');

    const checkIns = records.filter(r => r.action === 'check-in').length;
    const checkOuts = records.filter(r => r.action === 'check-out').length;

    res.status(200).json({
      success: true,
      total: records.length,
      checkIns,
      checkOuts,
      records
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};