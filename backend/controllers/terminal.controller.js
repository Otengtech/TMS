import Terminal from '../models/Terminal.model.js';
import Vehicle from '../models/Vehicle.model.js';
import Driver from '../models/Driver.model.js';
import Record from '../models/Record.model.js';

// @desc    Get all terminals
// @route   GET /api/terminals
// @access  Private
export const getTerminals = async (req, res) => {
  try {
    let query = {};
    
    // If user is admin (not superadmin), only show their terminal
    if (req.user.role === 'admin' && req.user.terminalId) {
      query._id = req.user.terminalId;
    }

    const terminals = await Terminal.find(query)
      .populate({
        path: 'vehicles',
        populate: { path: 'driverId', select: 'name phone' }
      })
      .populate('drivers');

    res.status(200).json({
      success: true,
      count: terminals.length,
      terminals
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get single terminal
// @route   GET /api/terminals/:id
// @access  Private
export const getTerminal = async (req, res) => {
  try {
    const terminal = await Terminal.findById(req.params.id)
      .populate({
        path: 'vehicles',
        populate: { path: 'driverId', select: 'name phone' }
      })
      .populate('drivers');

    if (!terminal) {
      return res.status(404).json({
        success: false,
        error: 'Terminal not found'
      });
    }

    res.status(200).json({
      success: true,
      terminal
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Create terminal
// @route   POST /api/terminals
// @access  Private/SuperAdmin
export const createTerminal = async (req, res) => {
  try {
    const terminal = await Terminal.create(req.body);
    
    res.status(201).json({
      success: true,
      terminal
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Terminal with this name already exists'
      });
    }
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update terminal
// @route   PUT /api/terminals/:id
// @access  Private/SuperAdmin
export const updateTerminal = async (req, res) => {
  try {
    const terminal = await Terminal.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!terminal) {
      return res.status(404).json({
        success: false,
        error: 'Terminal not found'
      });
    }

    res.status(200).json({
      success: true,
      terminal
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Delete terminal
// @route   DELETE /api/terminals/:id
// @access  Private/SuperAdmin
export const deleteTerminal = async (req, res) => {
  try {
    const terminal = await Terminal.findById(req.params.id);

    if (!terminal) {
      return res.status(404).json({
        success: false,
        error: 'Terminal not found'
      });
    }

    // Check if terminal has vehicles
    if (terminal.currentVehicles > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete terminal with vehicles currently checked in'
      });
    }

    // Check if terminal has any drivers
    const driversCount = await Driver.countDocuments({ terminalId: terminal._id });
    if (driversCount > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete terminal with registered drivers'
      });
    }

    await terminal.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Terminal deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Add this temporary debug endpoint
export const debugTerminalStats = async (req, res) => {
  try {
    const terminalId = req.params.id;
    console.log('Debug - Terminal ID:', terminalId);
    
    // Check if terminal exists
    const terminal = await Terminal.findById(terminalId);
    console.log('Debug - Terminal found:', terminal ? 'Yes' : 'No');
    
    if (!terminal) {
      return res.status(404).json({ error: 'Terminal not found' });
    }
    
    // Test each query individually
    const results = {
      terminal: terminal,
      vehicleCount: 0,
      driverCount: 0,
      recordCount: 0
    };
    
    try {
      results.vehicleCount = await Vehicle.countDocuments({ terminalId });
      console.log('Debug - Vehicle count:', results.vehicleCount);
    } catch (e) {
      results.vehicleError = e.message;
    }
    
    try {
      results.driverCount = await Driver.countDocuments({ terminalId });
      console.log('Debug - Driver count:', results.driverCount);
    } catch (e) {
      results.driverError = e.message;
    }
    
    try {
      results.recordCount = await Record.countDocuments({ terminalId });
      console.log('Debug - Record count:', results.recordCount);
    } catch (e) {
      results.recordError = e.message;
    }
    
    res.json({
      success: true,
      debug: results
    });
    
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get terminal statistics
// @route   GET /api/terminals/:id/stats
// @access  Private
// @desc    Get terminal statistics
// @route   GET /api/terminals/:id/stats
// @access  Private
export const getTerminalStats = async (req, res) => {
  try {
    const terminalId = req.params.id;
    console.log('=================================');
    console.log('Getting stats for terminal:', terminalId);
    console.log('User:', req.user?._id, req.user?.role);
    console.log('=================================');

    // Find terminal first
    console.log('Looking for terminal...');
    const terminal = await Terminal.findById(terminalId);
    console.log('Terminal found:', terminal ? 'Yes' : 'No');
    
    if (!terminal) {
      console.log('Terminal not found');
      return res.status(404).json({
        success: false,
        error: 'Terminal not found'
      });
    }

    console.log('Terminal data:', {
      name: terminal.name,
      currentVehicles: terminal.currentVehicles,
      capacity: terminal.capacity
    });

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get start of week (Sunday)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    console.log('Date ranges:', {
      today: today.toISOString(),
      tomorrow: tomorrow.toISOString(),
      startOfWeek: startOfWeek.toISOString(),
      endOfWeek: endOfWeek.toISOString()
    });

    // Test each query individually with try-catch
    let totalVehicles = 0;
    let activeDrivers = 0;
    let totalDrivers = 0;
    let todayCheckIns = 0;
    let todayCheckOuts = 0;
    let weekCheckIns = 0;
    let weekCheckOuts = 0;
    let recentRecords = [];
    let busCount = 0;
    let taxiCount = 0;
    let truckCount = 0;
    let privateCount = 0;

    try {
      totalVehicles = await Vehicle.countDocuments({ terminalId });
      console.log('Total vehicles:', totalVehicles);
    } catch (error) {
      console.error('Error counting vehicles:', error.message);
    }

    try {
      activeDrivers = await Driver.countDocuments({ terminalId, isActive: true });
      console.log('Active drivers:', activeDrivers);
    } catch (error) {
      console.error('Error counting active drivers:', error.message);
    }

    try {
      totalDrivers = await Driver.countDocuments({ terminalId });
      console.log('Total drivers:', totalDrivers);
    } catch (error) {
      console.error('Error counting total drivers:', error.message);
    }

    try {
      todayCheckIns = await Record.countDocuments({ 
        terminalId, 
        action: 'check-in',
        createdAt: { $gte: today, $lt: tomorrow }
      });
      console.log('Today check-ins:', todayCheckIns);
    } catch (error) {
      console.error('Error counting today check-ins:', error.message);
    }

    try {
      todayCheckOuts = await Record.countDocuments({ 
        terminalId, 
        action: 'check-out',
        createdAt: { $gte: today, $lt: tomorrow }
      });
      console.log('Today check-outs:', todayCheckOuts);
    } catch (error) {
      console.error('Error counting today check-outs:', error.message);
    }

    try {
      weekCheckIns = await Record.countDocuments({ 
        terminalId, 
        action: 'check-in',
        createdAt: { $gte: startOfWeek, $lt: endOfWeek }
      });
      console.log('Week check-ins:', weekCheckIns);
    } catch (error) {
      console.error('Error counting week check-ins:', error.message);
    }

    try {
      weekCheckOuts = await Record.countDocuments({ 
        terminalId, 
        action: 'check-out',
        createdAt: { $gte: startOfWeek, $lt: endOfWeek }
      });
      console.log('Week check-outs:', weekCheckOuts);
    } catch (error) {
      console.error('Error counting week check-outs:', error.message);
    }

    try {
      recentRecords = await Record.find({ terminalId })
        .populate('vehicleId', 'plateNumber type')
        .populate('driverId', 'name phone')
        .populate('createdBy', 'name')
        .sort('-createdAt')
        .limit(10)
        .lean();
      console.log('Recent records count:', recentRecords.length);
    } catch (error) {
      console.error('Error fetching recent records:', error.message);
    }

    try {
      busCount = await Vehicle.countDocuments({ terminalId, type: 'bus' });
      taxiCount = await Vehicle.countDocuments({ terminalId, type: 'taxi' });
      truckCount = await Vehicle.countDocuments({ terminalId, type: 'truck' });
      privateCount = await Vehicle.countDocuments({ terminalId, type: 'private' });
      console.log('Vehicle counts:', { bus: busCount, taxi: taxiCount, truck: truckCount, private: privateCount });
    } catch (error) {
      console.error('Error counting vehicle types:', error.message);
    }

    // Calculate occupancy
    const currentVehicles = terminal.currentVehicles || 0;
    const capacity = terminal.capacity || 0;
    const occupancyRate = capacity > 0 ? ((currentVehicles / capacity) * 100).toFixed(2) : 0;

    console.log('Sending successful response');
    
    // Prepare response
    res.status(200).json({
      success: true,
      stats: {
        overview: {
          currentVehicles,
          capacity,
          availableSpots: capacity - currentVehicles,
          occupancyRate: parseFloat(occupancyRate),
          totalVehicles,
          activeDrivers,
          totalDrivers,
          inactiveDrivers: totalDrivers - activeDrivers
        },
        today: {
          checkIns: todayCheckIns,
          checkOuts: todayCheckOuts,
          total: todayCheckIns + todayCheckOuts
        },
        thisWeek: {
          checkIns: weekCheckIns,
          checkOuts: weekCheckOuts,
          total: weekCheckIns + weekCheckOuts
        },
        vehicleTypeBreakdown: {
          bus: busCount,
          taxi: taxiCount,
          truck: truckCount,
          private: privateCount
        },
        hourlyDistribution: [],
        recentRecords
      }
    });

  } catch (error) {
    console.error('=================================');
    console.error('FATAL ERROR in getTerminalStats:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('=================================');
    
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};