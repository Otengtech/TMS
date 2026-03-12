import Driver from '../models/Driver.model.js';
import Vehicle from '../models/Vehicle.model.js';
import Record from '../models/Record.model.js';

// @desc    Get all drivers
// @route   GET /api/drivers
// @access  Private
export const getDrivers = async (req, res) => {
  try {
    let query = {};
    
    // Filter by terminal if user is admin
    if (req.user.role === 'admin' && req.user.terminalId) {
      query.terminalId = req.user.terminalId;
    }

    // Filter by active status
    if (req.query.isActive !== undefined) {
      query.isActive = req.query.isActive === 'true';
    }

    // Add search functionality
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { phone: { $regex: req.query.search, $options: 'i' } },
        { licenseNumber: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const drivers = await Driver.find(query)
      .populate('terminalId', 'name location')
      .sort('-createdAt');

    // Get vehicle assignment for each driver
    const driversWithVehicle = await Promise.all(
      drivers.map(async (driver) => {
        const vehicle = await Vehicle.findOne({ 
          driverId: driver._id,
          status: 'checked-in'
        }).select('plateNumber type status');
        
        // Check if license is expired
        const isLicenseExpired = new Date(driver.licenseExpiry) < new Date();
        
        return {
          ...driver.toObject(),
          currentVehicle: vehicle,
          isLicenseExpired
        };
      })
    );

    res.status(200).json({
      success: true,
      count: driversWithVehicle.length,
      drivers: driversWithVehicle
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get single driver
// @route   GET /api/drivers/:id
// @access  Private
export const getDriver = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id)
      .populate('terminalId', 'name location');

    if (!driver) {
      return res.status(404).json({
        success: false,
        error: 'Driver not found'
      });
    }

    // Get driver's vehicles (all time)
    const vehicles = await Vehicle.find({ driverId: driver._id })
      .select('plateNumber type status createdAt');

    // Get current active vehicle
    const currentVehicle = await Vehicle.findOne({ 
      driverId: driver._id,
      status: 'checked-in'
    }).select('plateNumber type checkInTime');

    // Get recent records
    const recentRecords = await Record.find({ driverId: driver._id })
      .populate('vehicleId', 'plateNumber type')
      .populate('createdBy', 'name')
      .sort('-createdAt')
      .limit(10);

    // Get statistics
    const totalTrips = await Record.countDocuments({ 
      driverId: driver._id,
      action: 'check-out'
    });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const todayTrips = await Record.countDocuments({
      driverId: driver._id,
      action: 'check-out',
      createdAt: { $gte: todayStart }
    });

    res.status(200).json({
      success: true,
      driver: {
        ...driver.toObject(),
        isLicenseExpired: new Date(driver.licenseExpiry) < new Date(),
        currentVehicle,
        vehicles,
        recentRecords,
        stats: {
          totalTrips,
          todayTrips,
          vehiclesOwned: vehicles.length
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Create driver
// @route   POST /api/drivers
// @access  Private
export const createDriver = async (req, res) => {
  try {
    // Set terminalId if user is admin
    if (req.user.role === 'admin') {
      req.body.terminalId = req.user.terminalId;
    }

    // Validate license expiry
    const licenseExpiry = new Date(req.body.licenseExpiry);
    if (licenseExpiry < new Date()) {
      return res.status(400).json({
        success: false,
        error: 'License expiry date cannot be in the past'
      });
    }

    const driver = await Driver.create(req.body);
    
    res.status(201).json({
      success: true,
      driver
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        error: `Driver with this ${field} already exists`
      });
    }
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update driver
// @route   PUT /api/drivers/:id
// @access  Private
export const updateDriver = async (req, res) => {
  try {
    const { name, phone, licenseNumber, licenseExpiry, isActive } = req.body;

    // Validate license expiry if provided
    if (licenseExpiry) {
      const expiryDate = new Date(licenseExpiry);
      if (expiryDate < new Date()) {
        return res.status(400).json({
          success: false,
          error: 'License expiry date cannot be in the past'
        });
      }
    }

    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      { name, phone, licenseNumber, licenseExpiry, isActive },
      { new: true, runValidators: true }
    ).populate('terminalId', 'name location');

    if (!driver) {
      return res.status(404).json({
        success: false,
        error: 'Driver not found'
      });
    }

    res.status(200).json({
      success: true,
      driver
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Delete driver
// @route   DELETE /api/drivers/:id
// @access  Private
export const deleteDriver = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);

    if (!driver) {
      return res.status(404).json({
        success: false,
        error: 'Driver not found'
      });
    }

    // Check if driver has active vehicle
    const activeVehicle = await Vehicle.findOne({ 
      driverId: driver._id,
      status: 'checked-in'
    });

    if (activeVehicle) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete driver with active vehicle. Please check out the vehicle first.'
      });
    }

    // Check if driver has any vehicles registered
    const vehiclesCount = await Vehicle.countDocuments({ driverId: driver._id });
    if (vehiclesCount > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete driver with registered vehicles. Please delete or reassign vehicles first.'
      });
    }

    await driver.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Driver deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get drivers with expired licenses
// @route   GET /api/drivers/expired-licenses
// @access  Private
export const getExpiredLicenses = async (req, res) => {
  try {
    let query = {
      licenseExpiry: { $lt: new Date() }
    };

    if (req.user.role === 'admin' && req.user.terminalId) {
      query.terminalId = req.user.terminalId;
    }

    const drivers = await Driver.find(query)
      .populate('terminalId', 'name location')
      .sort('licenseExpiry');

    // Get drivers expiring soon (next 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringSoon = await Driver.find({
      terminalId: query.terminalId,
      licenseExpiry: { 
        $gte: new Date(),
        $lte: thirtyDaysFromNow 
      }
    }).populate('terminalId', 'name location');

    res.status(200).json({
      success: true,
      count: {
        expired: drivers.length,
        expiringSoon: expiringSoon.length
      },
      expiredDrivers: drivers,
      expiringSoonDrivers: expiringSoon
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Toggle driver active status
// @route   PATCH /api/drivers/:id/toggle-status
// @access  Private
export const toggleDriverStatus = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);

    if (!driver) {
      return res.status(404).json({
        success: false,
        error: 'Driver not found'
      });
    }

    // Check if trying to deactivate driver with active vehicle
    if (driver.isActive) {
      const activeVehicle = await Vehicle.findOne({
        driverId: driver._id,
        status: 'checked-in'
      });

      if (activeVehicle) {
        return res.status(400).json({
          success: false,
          error: 'Cannot deactivate driver with active vehicle'
        });
      }
    }

    driver.isActive = !driver.isActive;
    await driver.save();

    res.status(200).json({
      success: true,
      message: `Driver ${driver.isActive ? 'activated' : 'deactivated'} successfully`,
      driver: {
        _id: driver._id,
        name: driver.name,
        isActive: driver.isActive
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};