const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const DonorProfile = require('./models/DonorProfile');
const BloodRequest = require('./models/BloodRequest');
const BloodInventory = require('./models/BloodInventory');
const DonationRecord = require('./models/DonationRecord');
const Hospital = require('./models/Hospital');
const Notification = require('./models/Notification');
const AuditLog = require('./models/AuditLog');
const { getSeedData } = require('./utils/seedData');

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/blood_donation_db';
    console.log(`Connecting to MongoDB at: ${mongoUri}`);
    await mongoose.connect(mongoUri);

    console.log('Clearing existing data...');
    await Promise.all([
      User.deleteMany(),
      DonorProfile.deleteMany(),
      BloodRequest.deleteMany(),
      BloodInventory.deleteMany(),
      DonationRecord.deleteMany(),
      Hospital.deleteMany(),
      Notification.deleteMany(),
      AuditLog.deleteMany(),
    ]);

    console.log('Seeding baseline data with Somali profiles...');
    const { users, hospitals, inventory } = await getSeedData();

    // 1. Insert users
    const createdUsers = await User.insertMany(users);
    console.log(`Created ${createdUsers.length} users`);

    // Map users by email for easy reference
    const userMap = {};
    createdUsers.forEach((u) => {
      userMap[u.email] = u;
    });

    // 2. Insert Hospitals
    const createdHospitals = await Hospital.insertMany(hospitals);
    console.log(`Created ${createdHospitals.length} hospitals & blood centers`);

    // 3. Create Donor Profiles
    const donorProfiles = [
      {
        user: userMap['donor@example.com']._id,
        bloodGroup: 'O-',
        age: 28,
        gender: 'Male',
        weightKg: 74,
        address: 'Degmada Hodan',
        city: 'Muqdisho',
        state: 'Banaadir',
        postalCode: '25201',
        contactPhone: '+252 61 555 0001',
        emergencyContact: { name: 'Canab Maxamuud Cilmi', phone: '+252 61 555 0099', relation: 'Walaashiis' },
        isAvailableToDonate: true,
        lastDonationDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 3 months ago
        medicalConditions: 'Caafimaad qaba, dhiig-bixiye guud (O- Universal Donor)',
        eligibilityNotes: 'Dhiig-bixiye diiwaangashan oo la xaqiijiyay',
        totalDonations: 5,
      },
      {
        user: userMap['donor2@example.com']._id,
        bloodGroup: 'A+',
        age: 24,
        gender: 'Female',
        weightKg: 58,
        address: 'Degmada Xamar Weyne',
        city: 'Muqdisho',
        state: 'Banaadir',
        postalCode: '25202',
        contactPhone: '+252 61 555 0002',
        emergencyContact: { name: 'Ismaaciil Guuleed Faarax', phone: '+252 61 555 0098', relation: 'Aabbe' },
        isAvailableToDonate: true,
        lastDonationDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        medicalConditions: 'Caafimaad qabtaa',
        eligibilityNotes: 'Diyaar u ah dhiig bixinta',
        totalDonations: 3,
      },
      {
        user: userMap['donor3@example.com']._id,
        bloodGroup: 'B+',
        age: 34,
        gender: 'Male',
        weightKg: 80,
        address: 'Degmada Axmed Dhagax',
        city: 'Hargeysa',
        state: 'Woqooyi Galbeed',
        postalCode: '25203',
        contactPhone: '+252 63 466 0003',
        emergencyContact: { name: 'Faadumo Cismaan Faarax', phone: '+252 63 466 0097', relation: 'Walaashiis' },
        isAvailableToDonate: true,
        lastDonationDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        medicalConditions: 'Wax cudur ah ma qabo',
        eligibilityNotes: 'Xaalad wanaagsan',
        totalDonations: 8,
      },
      {
        user: userMap['donor4@example.com']._id,
        bloodGroup: 'AB-',
        age: 29,
        gender: 'Female',
        weightKg: 62,
        address: 'Waddada 30-ka',
        city: 'Garoowe',
        state: 'Nugaal',
        postalCode: '25204',
        contactPhone: '+252 90 777 0004',
        emergencyContact: { name: 'Cabdullaahi Jaamac Nuur', phone: '+252 90 777 0096', relation: 'Aabbe' },
        isAvailableToDonate: false, // Temporarily unavailable
        lastDonationDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        medicalConditions: 'Qalliin ilig fudud kasoo kabanaysa',
        eligibilityNotes: 'Bisha dambe ayaa la heli karaa',
        totalDonations: 2,
      },
      {
        user: userMap['donor5@example.com']._id,
        bloodGroup: 'O+',
        age: 39,
        gender: 'Male',
        weightKg: 82,
        address: 'Degmada Calanley',
        city: 'Kismaayo',
        state: 'Jubbada Hoose',
        postalCode: '25205',
        contactPhone: '+252 69 988 0005',
        emergencyContact: { name: 'Khadro Cali Maxamed', phone: '+252 69 988 0095', relation: 'Xaaskiisa' },
        isAvailableToDonate: true,
        lastDonationDate: new Date(Date.now() - 110 * 24 * 60 * 60 * 1000),
        medicalConditions: 'Caafimaad buuxa',
        eligibilityNotes: 'Dhiig-bixiye Sharaf Leh - 10+ jeer dhiig shubay',
        totalDonations: 11,
      },
    ];

    await DonorProfile.insertMany(donorProfiles);
    console.log(`Created ${donorProfiles.length} donor profiles`);

    // 4. Create Blood Inventory
    const inventoryWithUser = inventory.map((item) => ({
      ...item,
      lastUpdatedBy: userMap['bloodbank@example.com']._id,
    }));
    await BloodInventory.insertMany(inventoryWithUser);
    console.log(`Created ${inventoryWithUser.length} inventory records`);

    // 5. Create Blood Requests
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const inTwoDays = new Date(Date.now() + 48 * 60 * 60 * 1000);
    const inFiveDays = new Date(Date.now() + 120 * 60 * 60 * 1000);
    const pastTwoDays = new Date(Date.now() - 48 * 60 * 60 * 1000);

    const requests = [
      // Request 1: Critical Emergency (O- needed, Pending)
      {
        requester: userMap['hospital@example.com']._id,
        requesterRole: 'HospitalStaff',
        patientName: 'Bukaan Maxamed Cali (Qaybta ICU)',
        bloodGroup: 'O-',
        unitsNeeded: 3,
        unitsFulfilled: 0,
        hospitalName: 'Isbitaalka Banaadir',
        hospitalAddress: 'Waddada Digfeer, Degmada Hodan',
        city: 'Muqdisho',
        state: 'Banaadir',
        urgency: 'Critical',
        contactName: 'Dr. Fadumo Cali Shire',
        contactPhone: '+252 61 500 1122',
        requiredByDate: tomorrow,
        status: 'Approved',
        notes: 'Shil gaari oo culus iyo dhiig-bax daran oo ku socda qalliin deg-deg ah. Dhiigga O-negative aad ayaa loogu baahan yahay.',
        verifiedBy: userMap['hospital@example.com']._id,
        verifiedAt: new Date(),
      },
      // Request 2: Urgent matched request (A+ needed, Matched with donor pledge)
      {
        requester: userMap['requester@example.com']._id,
        requesterRole: 'Requester',
        patientName: 'Ayeeyo Canab Xaashi Warsame',
        bloodGroup: 'A+',
        unitsNeeded: 2,
        unitsFulfilled: 1,
        hospitalName: 'Isbitaalka Madiina',
        hospitalAddress: 'Waddada Madiina, Degmada Wadajir',
        city: 'Muqdisho',
        state: 'Banaadir',
        urgency: 'Urgent',
        contactName: 'Deeqa Axmed Warsame',
        contactPhone: '+252 61 544 0005',
        requiredByDate: inTwoDays,
        status: 'Matched',
        notes: 'Qalliin lagu sameynayo bukaanka. Dhiigga loo baahan yahay waa A positive.',
        pledges: [
          {
            donor: userMap['donor2@example.com']._id,
            unitsPledged: 1,
            status: 'Pledged',
            pledgedAt: new Date(Date.now() - 3 * 3600 * 1000),
            notes: 'Waxaan imaan karaa isbitaalka galabta inta u dhaxeysa 3 PM ilaa 5 PM.',
          },
        ],
        bloodBankResponses: [
          {
            bloodBankStaff: userMap['bloodbank@example.com']._id,
            bloodBankName: 'Bangiga Dhiigga Qaranka',
            unitsAllocated: 1,
            allocatedAt: new Date(Date.now() - 2 * 3600 * 1000),
            notes: 'Waxaa loo qoondeeyay 1 unit oo dhiigga A+ ah keydka qaranka.',
          },
        ],
        verifiedBy: userMap['hospital2@example.com']._id,
        verifiedAt: new Date(Date.now() - 10 * 3600 * 1000),
      },
      // Request 3: Pending verification (B+ needed, standard)
      {
        requester: userMap['requester2@example.com']._id,
        requesterRole: 'Requester',
        patientName: 'Jaamac Cumar Cali',
        bloodGroup: 'B+',
        unitsNeeded: 2,
        unitsFulfilled: 0,
        hospitalName: 'Isbitaalka Guud ee Hargeysa',
        hospitalAddress: 'Waddada Madaxtooyada',
        city: 'Hargeysa',
        state: 'Woqooyi Galbeed',
        urgency: 'Standard',
        contactName: 'Cabdirisaaq Cumar Cali',
        contactPhone: '+252 63 455 0006',
        requiredByDate: inFiveDays,
        status: 'Pending',
        notes: 'Qalliin lafaha ah oo loo qorsheeyay dhammaadka usbuucan.',
      },
      // Request 4: Fulfilled request (O+)
      {
        requester: userMap['hospital2@example.com']._id,
        requesterRole: 'HospitalStaff',
        patientName: 'Bukaan Xaliimo Jaamac Cilmi',
        bloodGroup: 'O+',
        unitsNeeded: 2,
        unitsFulfilled: 2,
        hospitalName: 'Isbitaalka Digfeer / Erdogan',
        hospitalAddress: 'Degmada Hodan',
        city: 'Muqdisho',
        state: 'Banaadir',
        urgency: 'Urgent',
        contactName: 'Dr. Xasan Cabdi Jaamac',
        contactPhone: '+252 61 522 0003',
        requiredByDate: pastTwoDays,
        status: 'Fulfilled',
        notes: 'Dhiig-shubid lagama maarmaan ah. Bukaanku waxa uu si nabad ah u helay 2 units.',
        pledges: [
          {
            donor: userMap['donor5@example.com']._id,
            unitsPledged: 2,
            status: 'Donated',
            pledgedAt: new Date(Date.now() - 72 * 3600 * 1000),
          },
        ],
        verifiedBy: userMap['hospital2@example.com']._id,
        verifiedAt: new Date(Date.now() - 75 * 3600 * 1000),
        fulfilledAt: new Date(Date.now() - 24 * 3600 * 1000),
      },
      // Request 5: Critical B- emergency
      {
        requester: userMap['hospital@example.com']._id,
        requesterRole: 'HospitalStaff',
        patientName: 'Luul Cabdi Maxamuud',
        bloodGroup: 'B-',
        unitsNeeded: 2,
        unitsFulfilled: 0,
        hospitalName: 'Isbitaalka Banaadir',
        hospitalAddress: 'Waddada Digfeer, Degmada Hodan',
        city: 'Muqdisho',
        state: 'Banaadir',
        urgency: 'Critical',
        contactName: 'Dr. Fadumo Cali Shire',
        contactPhone: '+252 61 500 1122',
        requiredByDate: tomorrow,
        status: 'Approved',
        notes: 'Xaalad deg-deg ah oo dhiig-bax dhalmada kadib ah. Dhiigga B-negative aad ayaa loogu baahan yahay.',
        verifiedBy: userMap['hospital@example.com']._id,
        verifiedAt: new Date(),
      },
    ];

    const createdRequests = await BloodRequest.insertMany(requests);
    console.log(`Created ${createdRequests.length} sample blood requests`);

    // 6. Create Donation Records & Certificates
    const donationRecords = [
      {
        donor: userMap['donor@example.com']._id,
        facilityName: 'Isbitaalka Banaadir',
        bloodGroup: 'O-',
        unitsDonated: 1,
        donationDate: new Date(Date.now() - 90 * 24 * 3600 * 1000),
        status: 'Completed',
        certificateCode: 'SHAH-SO-901842',
        recordedBy: userMap['hospital@example.com']._id,
        notes: 'Dhiig bixin tabarruc ah oo guuleysatay. Caafimaadkiisu aad buu u fiicanyahay.',
      },
      {
        donor: userMap['donor2@example.com']._id,
        facilityName: 'Bangiga Dhiigga Qaranka',
        bloodGroup: 'A+',
        unitsDonated: 1,
        donationDate: new Date(Date.now() - 60 * 24 * 3600 * 1000),
        status: 'Completed',
        certificateCode: 'SHAH-SO-812049',
        recordedBy: userMap['bloodbank@example.com']._id,
        notes: 'Dhiig bixin qaybta Platelet-ka ah.',
      },
      {
        donor: userMap['donor5@example.com']._id,
        recipientRequest: createdRequests[3]._id,
        facilityName: 'Isbitaalka Digfeer / Erdogan',
        bloodGroup: 'O+',
        unitsDonated: 2,
        donationDate: new Date(Date.now() - 24 * 3600 * 1000),
        status: 'Completed',
        certificateCode: 'SHAH-SO-773190',
        recordedBy: userMap['hospital2@example.com']._id,
        notes: 'Dhiig bixin toos ah oo loogu gurmaday bukaan Xaliimo Jaamac Cilmi.',
      },
    ];

    await DonationRecord.insertMany(donationRecords);
    console.log(`Created ${donationRecords.length} donation history records`);

    // 7. Seed Notifications
    const sampleNotifications = [
      {
        recipient: userMap['donor@example.com']._id,
        title: 'DEG-DEG: Dhiig O- ah oo looga baahan yahay Isbitaalka Banaadir!',
        message: 'Bukaan ku jira qaybta daryeelka deg-degga ah ayaa u baahan dhiigga O-. Noocaaga dhiiggu wuu la jaanqaadayaa!',
        type: 'emergency_request',
        link: `/requests/${createdRequests[0]._id}`,
        isRead: false,
      },
      {
        recipient: userMap['requester@example.com']._id,
        title: 'Dhiig-bixiye ayaa u ballanqaaday Ayeeyo Canab',
        message: 'Hani Ismaaciil Guuleed ayaa ballanqaaday 1 unit oo dhiigga A+ ah dalabkaaga.',
        type: 'pledge_received',
        link: `/requests/${createdRequests[1]._id}`,
        isRead: false,
      },
      {
        recipient: userMap['bloodbank@example.com']._id,
        title: 'DIGNIIN: Dhiigga O- iyo B- oo hoos u dhacay',
        message: 'Keydka dhiigga O- (3 units) iyo B- (2 units) ayaa ka hooseeya heerka badqabka.',
        type: 'inventory_alert',
        link: '/inventory',
        isRead: false,
      },
      {
        recipient: userMap['hospital@example.com']._id,
        title: 'Dalab Dhiig Deg-deg ah oo Cusub',
        message: 'Deeqa Axmed Warsame ayaa soo gudbisay dalab dhiig si loo xaqiijiyo.',
        type: 'status_change',
        link: `/requests/${createdRequests[1]._id}`,
        isRead: true,
      },
    ];

    await Notification.insertMany(sampleNotifications);
    console.log(`Created ${sampleNotifications.length} notifications`);

    // 8. Seed Audit Logs
    const sampleLogs = [
      {
        user: userMap['admin@example.com']._id,
        userName: 'Abdullahi Maxamed Barre',
        userRole: 'Admin',
        action: 'SYSTEM_INITIALIZED',
        details: 'Diiwaanka nidaamka dhiig-bixinta qaranka ayaa si guul leh loo bilaabay',
      },
      {
        user: userMap['hospital@example.com']._id,
        userName: 'Dr. Fadumo Cali Shire',
        userRole: 'HospitalStaff',
        action: 'REQUEST_CREATED',
        details: 'Waxay dalab deg-deg ah u samaysay Bukaan Maxamed Cali oo jooga Isbitaalka Banaadir',
      },
      {
        user: userMap['bloodbank@example.com']._id,
        userName: 'Sahra Yuusuf Nuur',
        userRole: 'BloodBankStaff',
        action: 'INVENTORY_ALLOCATED',
        details: 'Waxay 1 unit oo dhiigga A+ ah u qoondeysay Ayeeyo Canab Xaashi',
      },
    ];

    await AuditLog.insertMany(sampleLogs);
    console.log(`Created ${sampleLogs.length} audit logs`);

    console.log('\n==========================================');
    console.log(' DATABASE SEEDING COMPLETED (SOMALI PROFILES)!');
    console.log('==========================================');
    console.log('\nAkoonnada Tijaabada ah (Password-ka dhamaan waa: password123):');
    console.log('1. Admin:           admin@example.com (Abdullahi Maxamed Barre)');
    console.log('2. Hospital Staff:  hospital@example.com (Dr. Fadumo Cali Shire - Isbitaalka Banaadir)');
    console.log('3. Blood Bank Staff:bloodbank@example.com (Sahra Yuusuf Nuur - Bangiga Dhiigga Qaranka)');
    console.log('4. Requester:       requester@example.com (Deeqa Axmed Warsame)');
    console.log('5. Donor:           donor@example.com (Cabdiraxmaan Maxamuud Cilmi - O- Universal Donor)');
    console.log('==========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
};

seedDB();
