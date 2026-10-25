import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from './models/User.js';
import { Organization } from './models/Organization.js';
import { Category } from './models/Category.js';
import { Product } from './models/Product.js';
import { InventoryBatch } from './models/InventoryBatch.js';
import { Order } from './models/Order.js';
import { ProductRequest } from './models/ProductRequest.js';
import { DonorProfile } from './models/DonorProfile.js';
import { BloodRequest } from './models/BloodRequest.js';
import { Notification } from './models/Notification.js';
import { ActivityLog } from './models/ActivityLog.js';

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/medistock';

const seedDatabase = async () => {
  try {
    console.log(`[Seed] Connecting to MongoDB at ${mongoUri}...`);
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 6000 });
    console.log('[Seed] Connected successfully.');

    console.log('[Seed] Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Organization.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      InventoryBatch.deleteMany({}),
      Order.deleteMany({}),
      ProductRequest.deleteMany({}),
      DonorProfile.deleteMany({}),
      BloodRequest.deleteMany({}),
      Notification.deleteMany({}),
      ActivityLog.deleteMany({}),
    ]);

    console.log('[Seed] Inserting Categories...');
    const categoryData = [
      { name: 'Cold, Cough and Fever Medicines', slug: 'cold-cough-fever', icon: 'Thermometer', description: 'Antipyretics, decongestants, cough syrups and lozenges.' },
      { name: 'Gastric and Digestive Medicines', slug: 'gastric-digestive', icon: 'Activity', description: 'Antacids, proton pump inhibitors, and digestive relief.' },
      { name: 'Blood Pressure and Cardiovascular', slug: 'cardiovascular', icon: 'Heart', description: 'Hypertension, beta-blockers, and cardiovascular maintenance.' },
      { name: 'Diabetes Care', slug: 'diabetes-care', icon: 'Droplets', description: 'Insulins, glucometers, test strips, and oral hypoglycemics.' },
      { name: 'First Aid and Wound Care', slug: 'first-aid', icon: 'ShieldAlert', description: 'Bandages, antiseptic lotions, sterile gauze, and adhesive dressings.' },
      { name: 'Creams, Ointments and Skin Care', slug: 'skin-care-ointments', icon: 'Sparkles', description: 'Topical steroids, burn treatments, antifungal ointments.' },
      { name: 'Syrups and Liquid Medicines', slug: 'syrups-liquids', icon: 'FlaskConical', description: 'Pediatric suspensions, liquid antibiotics, oral electrolytes.' },
      { name: 'Tablets and Capsules', slug: 'tablets-capsules', icon: 'Pill', description: 'Broad-spectrum antibiotics, pain relievers, daily vitamins.' },
      { name: 'Masks and Protective Equipment', slug: 'protective-equipment', icon: 'Shield', description: 'N95 respirators, 3-ply surgical masks, sterile surgical gowns.' },
      { name: 'Thermometers and Monitoring', slug: 'monitoring-devices', icon: 'Cpu', description: 'Infrared digital thermometers, pulse oximeters, BP monitors.' },
      { name: 'Medical Devices and Equipment', slug: 'medical-devices', icon: 'Stethoscope', description: 'Nebulizers, suction pumps, IV infusion stands, oxygen regulators.' },
      { name: 'Syringes, Gloves and Disposables', slug: 'syringes-gloves-disposables', icon: 'Layers', description: 'Sterile disposable syringes, latex examination gloves, cannula.' },
      { name: 'Sanitizers and Hygiene Products', slug: 'sanitizers-hygiene', icon: 'Sparkle', description: 'Hospital grade chlorhexidine, 70% IPA rub, surface disinfectants.' },
      { name: 'Other Medical Supplies', slug: 'other-medical-supplies', icon: 'Package', description: 'Specimen containers, catheter sets, surgical cotton rolls.' },
    ];

    const categories = await Category.insertMany(categoryData);
    const catMap = new Map(categories.map((c) => [c.name, c._id]));

    console.log('[Seed] Inserting Users & Roles with Encrypted Passwords...');
    const ownerPassword = await bcrypt.hash('owner123456', 10);
    const adminPassword = await bcrypt.hash('admin123456', 10);
    const hospitalPassword = await bcrypt.hash('hospital123456', 10);
    const pharmacyPassword = await bcrypt.hash('pharma123456', 10);
    const userPassword = await bcrypt.hash('user123456', 10);

    const ownerUser = await User.create({
      firebaseUid: 'UID_OWNER_001',
      name: 'Dr. Salman Khan',
      email: 'owner@medistock.health',
      password: ownerPassword,
      profileImage: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80',
      role: 'owner',
      accountStatus: 'active',
    });

    const adminUser = await User.create({
      firebaseUid: 'UID_ADMIN_001',
      name: 'Sarah Ahmed (Supply Director)',
      email: 'admin@medistock.health',
      password: adminPassword,
      profileImage: 'https://images.unsplash.com/photo-1594824813620-47d0e3ec8972?w=150&auto=format&fit=crop&q=80',
      role: 'admin',
      accountStatus: 'active',
    });

    const hospitalUser = await User.create({
      firebaseUid: 'UID_HOSPITAL_001',
      name: 'Prof. Dr. Mahbub Alam',
      email: 'dhakacentral@medistock.health',
      password: hospitalPassword,
      profileImage: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
      role: 'organization',
      accountStatus: 'active',
    });

    const pharmacyUser = await User.create({
      firebaseUid: 'UID_PHARMACY_001',
      name: 'Kazi M. Rahman',
      email: 'labaidpharmacy@medistock.health',
      password: pharmacyPassword,
      profileImage: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
      role: 'organization',
      accountStatus: 'active',
    });

    const pendingOrgUser = await User.create({
      firebaseUid: 'UID_PENDING_001',
      name: 'Dr. Nusrat Jahan',
      email: 'greenlife@medistock.health',
      password: hospitalPassword,
      profileImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
      role: 'organization',
      accountStatus: 'active',
    });

    const regularUser = await User.create({
      firebaseUid: 'UID_USER_001',
      name: 'Ayesha Siddiqua',
      email: 'user@medistock.health',
      password: userPassword,
      profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      role: 'user',
      accountStatus: 'active',
    });

    console.log('[Seed] Inserting Organizations...');
    const hospitalOrg = await Organization.create({
      name: 'Dhaka Central Hospital',
      type: 'Hospital',
      ownerUserId: hospitalUser._id,
      ownerName: 'Prof. Dr. Mahbub Alam',
      contactNumber: '+880 1711-234567',
      businessEmail: 'supply@dhakacentral.health',
      address: 'Plot 45, Road 27, Dhanmondi',
      city: 'Dhaka',
      area: 'Dhanmondi',
      licenseNumber: 'DGHS-HOSP-2024-8841',
      licenseDocumentUrl: 'https://medistock.health/docs/license-dhakacentral.pdf',
      verificationStatus: 'approved',
      reviewedBy: adminUser._id as any,
      reviewedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      isSuspended: false,
    });
    hospitalUser.organizationId = hospitalOrg._id as any;
    await hospitalUser.save();

    const pharmacyOrg = await Organization.create({
      name: 'Labaid Care Pharmacy',
      type: 'Pharmacy',
      ownerUserId: pharmacyUser._id,
      ownerName: 'Kazi M. Rahman',
      contactNumber: '+880 1819-876543',
      businessEmail: 'orders@labaidpharmacy.com',
      address: 'Shop 12, Gulshan Avenue, Circle 2',
      city: 'Dhaka',
      area: 'Gulshan',
      licenseNumber: 'DGDA-PHARM-2023-1102',
      licenseDocumentUrl: 'https://medistock.health/docs/license-labaid.pdf',
      verificationStatus: 'approved',
      reviewedBy: adminUser._id as any,
      reviewedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      isSuspended: false,
    });
    pharmacyUser.organizationId = pharmacyOrg._id as any;
    await pharmacyUser.save();

    const pendingOrg = await Organization.create({
      name: 'Green Life Specialized Clinic',
      type: 'Clinic',
      ownerUserId: pendingOrgUser._id,
      ownerName: 'Dr. Nusrat Jahan',
      contactNumber: '+880 1912-345678',
      businessEmail: 'procurement@greenlifeclinic.org',
      address: '32 Bir Uttam KM Shafiullah Sarak, Green Road',
      city: 'Dhaka',
      area: 'Green Road',
      licenseNumber: 'DGHS-CLINIC-2025-091',
      licenseDocumentUrl: 'https://medistock.health/docs/license-greenlife.pdf',
      verificationStatus: 'pending',
      additionalNotes: 'Urgent expansion needs bulk syringes and IV fluids.',
      isSuspended: false,
    });
    pendingOrgUser.organizationId = pendingOrg._id as any;
    await pendingOrgUser.save();

    console.log('[Seed] Inserting Products & Batches...');
    const now = new Date();
    const futureDate = (days: number) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const productRawList = [
      {
        name: 'Paracetamol 500mg (Napa Extra)',
        sku: 'MED-NAP-500',
        category: 'Cold, Cough and Fever Medicines',
        manufacturer: 'Beximco Pharmaceuticals Ltd.',
        description: 'Paracetamol 500mg with Caffeine 65mg for fever, headache, and body aches.',
        image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80',
        unit: 'Box (20x10 Tablets)',
        price: 45.0,
        stock: 450,
        lowStockThreshold: 50,
        prescriptionRequired: false,
        batchNumber: 'BCH-NAP-9021',
        expiryDate: futureDate(540),
      },
      {
        name: 'Esomeprazole 20mg (Nexum)',
        sku: 'MED-NEX-20',
        category: 'Gastric and Digestive Medicines',
        manufacturer: 'Square Pharmaceuticals PLC',
        description: 'Proton-pump inhibitor for acid reflux, peptic ulcers, and GERD relief.',
        image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=500&auto=format&fit=crop&q=80',
        unit: 'Box (10x10 Tablets)',
        price: 70.0,
        stock: 320,
        lowStockThreshold: 40,
        prescriptionRequired: true,
        batchNumber: 'BCH-NEX-4412',
        expiryDate: futureDate(420),
      },
      {
        name: 'Amlodipine 5mg (Amdocal)',
        sku: 'MED-AMD-05',
        category: 'Blood Pressure and Cardiovascular',
        manufacturer: 'Square Pharmaceuticals PLC',
        description: 'Calcium channel blocker for essential hypertension and coronary artery disease.',
        image: 'https://images.unsplash.com/photo-1577401239170-897942555fb3?w=500&auto=format&fit=crop&q=80',
        unit: 'Box (5x10 Tablets)',
        price: 35.0,
        stock: 190,
        lowStockThreshold: 30,
        prescriptionRequired: true,
        batchNumber: 'BCH-AMD-8172',
        expiryDate: futureDate(365),
      },
      {
        name: 'Insulin Glargine 100IU/ml (Lantus SoloStar)',
        sku: 'MED-LAN-100',
        category: 'Diabetes Care',
        manufacturer: 'Sanofi Healthcare Ltd.',
        description: 'Long-acting basal human insulin analog in prefilled pen for diabetes mellitus.',
        image: 'https://images.unsplash.com/photo-1583912267550-d44d9c9a0c47?w=500&auto=format&fit=crop&q=80',
        unit: 'Pack (5 Pens)',
        price: 210.0,
        stock: 45,
        lowStockThreshold: 20,
        prescriptionRequired: true,
        batchNumber: 'BCH-LAN-2201',
        expiryDate: futureDate(240),
      },
      {
        name: 'Sterile Gauze Bandage 4" x 5 Yards',
        sku: 'SUP-GB-4X5',
        category: 'First Aid and Wound Care',
        manufacturer: 'Opso Saline Ltd.',
        description: '100% bleached absorbent cotton gauze bandage for clinical dressing and wound care.',
        image: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=500&auto=format&fit=crop&q=80',
        unit: 'Pack (12 Rolls)',
        price: 18.5,
        stock: 600,
        lowStockThreshold: 100,
        prescriptionRequired: false,
        batchNumber: 'BCH-GB-1099',
        expiryDate: futureDate(720),
      },
      {
        name: 'Silver Sulfadiazine 1% Burn Cream (Burnsil)',
        sku: 'MED-BUR-01',
        category: 'Creams, Ointments and Skin Care',
        manufacturer: 'Incepta Pharmaceuticals Ltd.',
        description: 'Topical antibacterial cream for second and third-degree burn wound prevention.',
        image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&auto=format&fit=crop&q=80',
        unit: 'Tube (25g)',
        price: 12.0,
        stock: 140,
        lowStockThreshold: 25,
        prescriptionRequired: false,
        batchNumber: 'BCH-BUR-3309',
        expiryDate: futureDate(300),
      },
      {
        name: 'Amoxicillin + Clavulanic Acid Oral Suspension (Moxacil CV)',
        sku: 'MED-MOX-CV',
        category: 'Syrups and Liquid Medicines',
        manufacturer: 'Square Pharmaceuticals PLC',
        description: 'Co-amoxiclav powder for oral suspension 156.25mg/5ml for pediatric bacterial infections.',
        image: 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=500&auto=format&fit=crop&q=80',
        unit: 'Bottle (100ml)',
        price: 24.0,
        stock: 85,
        lowStockThreshold: 20,
        prescriptionRequired: true,
        batchNumber: 'BCH-MOX-7761',
        expiryDate: futureDate(180),
      },
      {
        name: 'Cefixime 200mg Capsules (Ceftron)',
        sku: 'MED-CEF-200',
        category: 'Tablets and Capsules',
        manufacturer: 'Square Pharmaceuticals PLC',
        description: 'Third-generation cephalosporin antibiotic for respiratory, ENT, and UTI infections.',
        image: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=500&auto=format&fit=crop&q=80',
        unit: 'Box (2x7 Capsules)',
        price: 65.0,
        stock: 18, // LOW STOCK ALERT TEST
        lowStockThreshold: 25,
        prescriptionRequired: true,
        batchNumber: 'BCH-CEF-0019',
        expiryDate: futureDate(210),
      },
      {
        name: '3-Ply Surgical Face Mask (BFE >= 98%)',
        sku: 'SUP-MSK-3PLY',
        category: 'Masks and Protective Equipment',
        manufacturer: 'Getwell Limited',
        description: 'Fluid-resistant surgical face masks with soft elastic ear loops and moldable nose clip.',
        image: 'https://images.unsplash.com/photo-1586942593568-29361efcd571?w=500&auto=format&fit=crop&q=80',
        unit: 'Box (50 Pieces)',
        price: 8.5,
        stock: 1200,
        lowStockThreshold: 150,
        prescriptionRequired: false,
        batchNumber: 'BCH-MSK-5520',
        expiryDate: futureDate(1000),
      },
      {
        name: 'Infrared Non-Contact Digital Thermometer',
        sku: 'DEV-THM-IR',
        category: 'Thermometers and Monitoring',
        manufacturer: 'Omron Healthcare Co.',
        description: 'High-precision instant reading infrared forehead temperature sensor with color LCD alert.',
        image: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=500&auto=format&fit=crop&q=80',
        unit: 'Unit (Piece)',
        price: 42.0,
        stock: 80,
        lowStockThreshold: 15,
        prescriptionRequired: false,
        batchNumber: 'DEV-OMR-2025',
        expiryDate: null,
      },
      {
        name: 'Sterile Disposable Syringe 5ml with 23G Needle',
        sku: 'SUP-SYR-05ML',
        category: 'Syringes, Gloves and Disposables',
        manufacturer: 'JMI Syringes & Medical Devices Ltd.',
        description: 'Non-toxic, pyrogen-free luer slip sterile syringe with ultra-sharp siliconized needle.',
        image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=500&auto=format&fit=crop&q=80',
        unit: 'Box (100 Pieces)',
        price: 15.0,
        stock: 850,
        lowStockThreshold: 100,
        prescriptionRequired: false,
        batchNumber: 'BCH-SYR-9912',
        expiryDate: futureDate(850),
      },
      {
        name: 'Powder-Free Nitrile Examination Gloves (Medium)',
        sku: 'SUP-GLV-NIT-M',
        category: 'Syringes, Gloves and Disposables',
        manufacturer: 'Top Glove Healthcare',
        description: 'Medical examination grade latex-free blue nitrile gloves with textured fingertips.',
        image: 'https://images.unsplash.com/photo-1584744982491-665216d95f8b?w=500&auto=format&fit=crop&q=80',
        unit: 'Box (100 Pieces)',
        price: 16.5,
        stock: 500,
        lowStockThreshold: 80,
        prescriptionRequired: false,
        batchNumber: 'BCH-GLV-7182',
        expiryDate: futureDate(600),
      },
      {
        name: 'Chlorhexidine 0.5% Hospital Disinfectant Rub (Hexisol)',
        sku: 'SUP-HEX-500',
        category: 'Sanitizers and Hygiene Products',
        manufacturer: 'ACI Limited (Healthcare Div)',
        description: 'Hand and skin antiseptic rub containing 0.5% w/v chlorhexidine gluconate in 70% v/v isopropanol.',
        image: 'https://images.unsplash.com/photo-1584483766114-2cea6facdf57?w=500&auto=format&fit=crop&q=80',
        unit: 'Bottle (500ml with Dispenser)',
        price: 9.5,
        stock: 350,
        lowStockThreshold: 50,
        prescriptionRequired: false,
        batchNumber: 'BCH-HEX-3011',
        expiryDate: futureDate(450),
      },
      {
        name: 'Normal Saline 0.9% IV Infusion (1000ml)',
        sku: 'MED-NS-1000',
        category: 'Other Medical Supplies',
        manufacturer: 'Beximco Infusions Ltd.',
        description: 'Sterile isotonic sodium chloride intravenous solution in blow-fill-seal polymer bottle.',
        image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=500&auto=format&fit=crop&q=80',
        unit: 'Carton (12 Bottles)',
        price: 36.0,
        stock: 12, // NEAR-EXPIRY AND LOW STOCK TEST
        lowStockThreshold: 20,
        prescriptionRequired: true,
        batchNumber: 'BCH-NS-4011',
        expiryDate: futureDate(45), // Expiring in 45 days (Triggers near-expiry alert)
      },
    ];

    const insertedProducts: any[] = [];
    for (const p of productRawList) {
      const catId = catMap.get(p.category);
      const prod = await Product.create({
        ...p,
        categoryId: catId || null,
        isActive: true,
      });

      if (p.expiryDate) {
        await InventoryBatch.create({
          productId: prod._id,
          batchNumber: p.batchNumber,
          quantity: p.stock,
          initialQuantity: p.stock + 50,
          manufacturingDate: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000),
          expiryDate: p.expiryDate,
          notes: 'Standard warehouse batch',
        });
      }

      insertedProducts.push(prod);
    }

    console.log('[Seed] Inserting Realistic Orders...');
    // Order 1: Dhaka Central Hospital (Delivered)
    await Order.create({
      orderNumber: 'MS-ORD-1001',
      organizationId: hospitalOrg._id,
      organizationName: hospitalOrg.name,
      organizationType: hospitalOrg.type,
      contactNumber: hospitalOrg.contactNumber,
      deliveryAddress: hospitalOrg.address,
      city: hospitalOrg.city,
      items: [
        {
          productId: insertedProducts[0]._id,
          name: insertedProducts[0].name,
          sku: insertedProducts[0].sku,
          category: insertedProducts[0].category,
          unit: insertedProducts[0].unit,
          unitPrice: 45.0,
          quantity: 20,
          subtotal: 900.0,
        },
        {
          productId: insertedProducts[8]._id,
          name: insertedProducts[8].name,
          sku: insertedProducts[8].sku,
          category: insertedProducts[8].category,
          unit: insertedProducts[8].unit,
          unitPrice: 8.5,
          quantity: 50,
          subtotal: 425.0,
        },
        {
          productId: insertedProducts[10]._id,
          name: insertedProducts[10].name,
          sku: insertedProducts[10].sku,
          category: insertedProducts[10].category,
          unit: insertedProducts[10].unit,
          unitPrice: 15.0,
          quantity: 30,
          subtotal: 450.0,
        },
      ],
      totalAmount: 1775.0,
      status: 'delivered',
      statusHistory: [
        { status: 'pending', note: 'Order placed by Dhaka Central Hospital', timestamp: new Date(now.getTime() - 12 * 86400000), updatedBy: hospitalOrg.name },
        { status: 'confirmed', note: 'Order verified and inventory reserved', timestamp: new Date(now.getTime() - 11 * 86400000), updatedBy: adminUser.name },
        { status: 'processing', note: 'Packed at central medical warehouse', timestamp: new Date(now.getTime() - 10 * 86400000), updatedBy: adminUser.name },
        { status: 'shipped', note: 'Dispatched via MediStock Express Logistics', timestamp: new Date(now.getTime() - 9 * 86400000), updatedBy: adminUser.name },
        { status: 'delivered', note: 'Received and verified by Dr. Mahbub Alam', timestamp: new Date(now.getTime() - 8 * 86400000), updatedBy: hospitalOrg.name },
      ],
      invoiceNumber: 'MS-INV-1001',
      placedByUserId: hospitalUser._id,
      createdAt: new Date(now.getTime() - 12 * 86400000),
    });

    // Order 2: Dhaka Central Hospital (Processing)
    await Order.create({
      orderNumber: 'MS-ORD-1002',
      organizationId: hospitalOrg._id,
      organizationName: hospitalOrg.name,
      organizationType: hospitalOrg.type,
      contactNumber: hospitalOrg.contactNumber,
      deliveryAddress: hospitalOrg.address,
      city: hospitalOrg.city,
      items: [
        {
          productId: insertedProducts[3]._id,
          name: insertedProducts[3].name,
          sku: insertedProducts[3].sku,
          category: insertedProducts[3].category,
          unit: insertedProducts[3].unit,
          unitPrice: 210.0,
          quantity: 5,
          subtotal: 1050.0,
        },
        {
          productId: insertedProducts[11]._id,
          name: insertedProducts[11].name,
          sku: insertedProducts[11].sku,
          category: insertedProducts[11].category,
          unit: insertedProducts[11].unit,
          unitPrice: 16.5,
          quantity: 20,
          subtotal: 330.0,
        },
      ],
      totalAmount: 1380.0,
      status: 'processing',
      statusHistory: [
        { status: 'pending', note: 'Emergency restocking order submitted', timestamp: new Date(now.getTime() - 2 * 86400000), updatedBy: hospitalOrg.name },
        { status: 'confirmed', note: 'Confirmed by Supply Director Sarah Ahmed', timestamp: new Date(now.getTime() - 1 * 86400000), updatedBy: adminUser.name },
        { status: 'processing', note: 'Order undergoing cold-chain packaging', timestamp: new Date(now.getTime() - 8 * 3600000), updatedBy: adminUser.name },
      ],
      invoiceNumber: 'MS-INV-1002',
      placedByUserId: hospitalUser._id,
      createdAt: new Date(now.getTime() - 2 * 86400000),
    });

    // Order 3: Labaid Care Pharmacy (Pending)
    await Order.create({
      orderNumber: 'MS-ORD-1003',
      organizationId: pharmacyOrg._id,
      organizationName: pharmacyOrg.name,
      organizationType: pharmacyOrg.type,
      contactNumber: pharmacyOrg.contactNumber,
      deliveryAddress: pharmacyOrg.address,
      city: pharmacyOrg.city,
      items: [
        {
          productId: insertedProducts[1]._id,
          name: insertedProducts[1].name,
          sku: insertedProducts[1].sku,
          category: insertedProducts[1].category,
          unit: insertedProducts[1].unit,
          unitPrice: 70.0,
          quantity: 15,
          subtotal: 1050.0,
        },
        {
          productId: insertedProducts[12]._id,
          name: insertedProducts[12].name,
          sku: insertedProducts[12].sku,
          category: insertedProducts[12].category,
          unit: insertedProducts[12].unit,
          unitPrice: 9.5,
          quantity: 40,
          subtotal: 380.0,
        },
      ],
      totalAmount: 1430.0,
      status: 'pending',
      statusHistory: [
        { status: 'pending', note: 'Weekly retail replenishment submitted', timestamp: new Date(now.getTime() - 3 * 3600000), updatedBy: pharmacyOrg.name },
      ],
      invoiceNumber: 'MS-INV-1003',
      placedByUserId: pharmacyUser._id,
      createdAt: new Date(now.getTime() - 3 * 3600000),
    });

    console.log('[Seed] Inserting Product Demand Requests...');
    await ProductRequest.create({
      organizationId: hospitalOrg._id,
      organizationName: hospitalOrg.name,
      requestedByUserId: hospitalUser._id,
      itemName: 'Remdesivir 100mg Lyophilized Powder for Injection',
      category: 'Tablets and Capsules',
      expectedQuantity: 50,
      urgency: 'high',
      explanation: 'Critical ICU respiratory care replenishment for seasonal viral pneumonia.',
      status: 'under_review',
      adminResponse: 'Evaluating procurement pricing with certified international distributors.',
    });

    await ProductRequest.create({
      organizationId: pharmacyOrg._id,
      organizationName: pharmacyOrg.name,
      requestedByUserId: pharmacyUser._id,
      itemName: 'Pediatric Salbutamol 2mg/5ml Inhaler Solution',
      category: 'Syrups and Liquid Medicines',
      expectedQuantity: 100,
      urgency: 'medium',
      explanation: 'High winter seasonal demand for childhood asthma and wheezing relief.',
      status: 'pending',
    });

    console.log('[Seed] Inserting Blood Donors & Requests...');
    await DonorProfile.create({
      userId: regularUser._id,
      fullName: 'Ayesha Siddiqua',
      bloodGroup: 'O+',
      city: 'Dhaka',
      area: 'Dhanmondi',
      contactNumber: '+880 1712-349911',
      contactPreference: 'call',
      lastDonationDate: new Date(now.getTime() - 120 * 86400000),
      isAvailable: true,
      consentGiven: true,
      totalDonationsCount: 4,
      notes: 'Available for emergency evening donations.',
    });

    // Additional voluntary donors
    const dummyDonors = [
      { name: 'Tanvir Hossain', group: 'A+', city: 'Dhaka', area: 'Uttara', phone: '+880 1819-112233', count: 6 },
      { name: 'Dr. Rashed Karim', group: 'B+', city: 'Dhaka', area: 'Mirpur', phone: '+880 1911-445566', count: 11 },
      { name: 'Farhana Akter', group: 'O-', city: 'Dhaka', area: 'Gulshan', phone: '+880 1612-778899', count: 3 },
      { name: 'Mehedi Hasan', group: 'AB+', city: 'Chittagong', area: 'Agrabad', phone: '+880 1814-332211', count: 5 },
      { name: 'Shahadat Hossain', group: 'B-', city: 'Sylhet', area: 'Zindabazar', phone: '+880 1713-998877', count: 2 },
      { name: 'Sumaiya Rahman', group: 'A-', city: 'Dhaka', area: 'Mohakhali', phone: '+880 1915-667788', count: 1 },
    ];

    for (const d of dummyDonors) {
      const u = await User.create({
        firebaseUid: `UID_DONOR_${d.name.replace(/\s+/g, '_')}`,
        name: d.name,
        email: `${d.name.toLowerCase().replace(/[^a-z]/g, '')}@medistock.demo`,
        role: 'user',
        accountStatus: 'active',
      });

      await DonorProfile.create({
        userId: u._id,
        fullName: d.name,
        bloodGroup: d.group as any,
        city: d.city,
        area: d.area,
        contactNumber: d.phone,
        contactPreference: 'call',
        isAvailable: true,
        consentGiven: true,
        totalDonationsCount: d.count,
        notes: 'Voluntary active community donor.',
      });
    }

    // Active blood requests
    await BloodRequest.create({
      requesterUserId: regularUser._id,
      requesterName: 'Ayesha Siddiqua',
      patientName: 'Kazi Nurul Islam (Age 62)',
      bloodGroup: 'B+',
      unitsNeeded: 2,
      hospitalName: 'National Institute of Cardiovascular Diseases (NICVD)',
      city: 'Dhaka',
      area: 'Sher-e-Bangla Nagar',
      contactNumber: '+880 1712-349911',
      requiredDate: futureDate(1),
      urgency: 'critical',
      reasonNotes: 'Emergency coronary artery bypass graft (CABG) surgery scheduled tomorrow morning.',
      status: 'open',
      responses: [
        {
          donorUserId: adminUser._id as any,
          donorName: 'Tanvir Hossain',
          donorPhone: '+880 1819-112233',
          message: 'I am B+ and ready to reach NICVD blood bank by 8:30 AM.',
          status: 'accepted',
          createdAt: new Date(),
        },
      ],
    });

    await BloodRequest.create({
      requesterUserId: regularUser._id,
      requesterName: 'Ayesha Siddiqua',
      patientName: 'Rina Begum (Thalassemia patient)',
      bloodGroup: 'O-',
      unitsNeeded: 1,
      hospitalName: 'Dhaka Shishu (Children) Hospital',
      city: 'Dhaka',
      area: 'Shyamoli',
      contactNumber: '+880 1819-776655',
      requiredDate: futureDate(2),
      urgency: 'urgent',
      reasonNotes: 'Monthly regular transfusion required.',
      status: 'open',
      responses: [],
    });

    console.log('[Seed] Inserting Notifications & Activity Logs...');
    await Notification.create({
      recipientRole: 'admin',
      title: 'Stock Replenishment Needed',
      message: 'Cefixime 200mg Capsules has fallen below threshold (18 boxes remaining).',
      type: 'stock_alert',
      link: '/admin/products',
    });

    await Notification.create({
      recipientRole: 'admin',
      title: 'Batch Near Expiry Warning',
      message: 'Normal Saline 0.9% IV Infusion batch BCH-NS-4011 expires in 45 days.',
      type: 'stock_alert',
      link: '/admin/products',
    });

    await Notification.create({
      recipientUserId: hospitalUser._id,
      organizationId: hospitalOrg._id,
      title: 'Order MS-ORD-1002 In Processing',
      message: 'Your cold-chain order is currently being packed at our logistics hub.',
      type: 'order',
      link: '/organization/orders',
    });

    await ActivityLog.create({
      actorUserId: ownerUser._id,
      actorName: ownerUser.name,
      actorRole: ownerUser.role,
      action: 'PLATFORM_INITIALIZED',
      entityType: 'System',
      description: 'System seed data successfully provisioned for MediStock Platform.',
    });

    console.log('===========================================================');
    console.log(' SEEDING COMPLETED SUCCESSFULLY!');
    console.log(' System Accounts & Passwords:');
    console.log(' - Owner:        owner@medistock.health        / owner123456');
    console.log(' - Admin:        admin@medistock.health        / admin123456');
    console.log(' - Hospital Org: dhakacentral@medistock.health / hospital123456');
    console.log(' - Pharmacy Org: labaidpharmacy@medistock.health / pharma123456');
    console.log(' - Normal User:  user@medistock.health         / user123456');
    console.log('===========================================================');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error: any) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedDatabase();

