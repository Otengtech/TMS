import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../../models/User.model.js';
import Terminal from '../../models/Terminal.model.js';
import Driver from '../../models/Driver.model.js';
import Vehicle from '../../models/Vehicle.model.js';
import Record from '../../models/Record.model.js';
import connectDB from '../../config/database.js';

// Load env vars first
dotenv.config();

const users = [
  {
    name: "System Administrator",
    email: "admin@terminal.com",
    password: "password123",
    role: "superadmin",
    terminalId: null
  },
  {
    name: "Accra Terminal Manager",
    email: "manager@accra.com",
    password: "password123",
    role: "admin",
    terminalId: null // Will be set after terminal creation
  }
];

const terminals = [
  {
    name: "Accra Central Terminal",
    location: "Accra",
    capacity: 100,
    currentVehicles: 0
  }
];

const drivers = [
  {
    name: "Kwame Mensah",
    phone: "+233241234567",
    licenseNumber: "DL-984573",
    licenseExpiry: "2028-05-01",
    terminalId: null
  },
  {
    name: "Kofi Adu",
    phone: "+233245678901",
    licenseNumber: "DL-334578",
    licenseExpiry: "2027-08-10",
    terminalId: null
  }
];

const importData = async () => {
  try {
    // Connect to database
    await connectDB();

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany();
    await Terminal.deleteMany();
    await Driver.deleteMany();
    await Vehicle.deleteMany();
    await Record.deleteMany();

    console.log('Data cleared...');

    // Create terminal
    console.log('Creating terminal...');
    const createdTerminal = await Terminal.create(terminals[0]);
    console.log('Terminal created...');

    // Update terminalId for admin user
    users[1].terminalId = createdTerminal._id;

    // Create users
    console.log('Creating users...');
    const createdUsers = await User.create(users);
    console.log('Users created...');

    // Update terminalId for drivers
    drivers[0].terminalId = createdTerminal._id;
    drivers[1].terminalId = createdTerminal._id;

    // Create drivers
    console.log('Creating drivers...');
    const createdDrivers = await Driver.create(drivers);
    console.log('Drivers created...');

    // Create vehicles
    const vehicles = [
      {
        plateNumber: "GR-3456-22",
        type: "bus",
        driverId: createdDrivers[0]._id,
        terminalId: createdTerminal._id,
        status: "checked-in",
        checkInTime: new Date("2026-03-11T09:45:00Z")
      },
      {
        plateNumber: "AS-7743-23",
        type: "taxi",
        driverId: createdDrivers[1]._id,
        terminalId: createdTerminal._id,
        status: "checked-out",
        checkInTime: new Date("2026-03-11T08:10:00Z"),
        checkOutTime: new Date("2026-03-11T10:15:00Z")
      }
    ];

    console.log('Creating vehicles...');
    const createdVehicles = await Vehicle.create(vehicles);
    console.log('Vehicles created...');

    // Update terminal currentVehicles
    await Terminal.findByIdAndUpdate(createdTerminal._id, {
      currentVehicles: 1 // One vehicle checked in
    });

    // Create records
    const records = [
      {
        vehicleId: createdVehicles[0]._id,
        driverId: createdDrivers[0]._id,
        terminalId: createdTerminal._id,
        action: "check-in",
        notes: "Vehicle entered terminal",
        createdBy: createdUsers[1]._id,
        createdAt: new Date("2026-03-11T09:45:00Z")
      },
      {
        vehicleId: createdVehicles[1]._id,
        driverId: createdDrivers[1]._id,
        terminalId: createdTerminal._id,
        action: "check-out",
        notes: "Vehicle left terminal",
        createdBy: createdUsers[1]._id,
        createdAt: new Date("2026-03-11T10:15:00Z")
      }
    ];

    console.log('Creating records...');
    await Record.create(records);
    console.log('Records created...');

    console.log('\n✅ Data imported successfully!');
    console.log('\nYou can now login with:');
    console.log('📧 SuperAdmin: admin@terminal.com / password123');
    console.log('📧 Admin: manager@accra.com / password123');
    
    process.exit(0);
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    if (error.code === 11000) {
      console.error('Duplicate key error. Data might already exist.');
    }
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connectDB();
    
    console.log('Destroying all data...');
    await User.deleteMany();
    await Terminal.deleteMany();
    await Driver.deleteMany();
    await Vehicle.deleteMany();
    await Record.deleteMany();

    console.log('✅ Data destroyed successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

// Check command line arguments
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}