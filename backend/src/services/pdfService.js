const PDFDocument = require('pdfkit');

const generateCertificateBuffer = (volunteer, issueDate) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ layout: 'landscape', size: 'A4' });
    const chunks = [];

    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', err => reject(err));

    // Outer double border
    doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).lineWidth(4).stroke('#1a365d');
    doc.rect(26, 26, doc.page.width - 52, doc.page.height - 52).lineWidth(1.5).stroke('#d69e2e');

    // Header JIVAN JYOT ASHRAM
    doc.font('Helvetica-Bold').fontSize(16).fillColor('#1a365d').text('JIVAN JYOT ASHRAM FOUNDATION', 0, 50, { align: 'center' });
    doc.font('Helvetica').fontSize(10).fillColor('#718096').text('Serving the Community with Care and Dignity', 0, 70, { align: 'center' });

    // Decorative shape/ribbon (using text or vector)
    doc.font('Helvetica-Bold').fontSize(38).fillColor('#1a365d').text('CERTIFICATE OF APPRECIATION', 0, 120, { align: 'center', characterSpacing: 1 });

    doc.font('Helvetica-Oblique').fontSize(14).fillColor('#4a5568').text('This certificate is proudly presented to', 0, 180, { align: 'center' });

    // Volunteer Name
    doc.font('Helvetica-Bold').fontSize(32).fillColor('#d69e2e').text(volunteer.fullName, 0, 215, { align: 'center' });

    // Recognition text
    doc.font('Helvetica').fontSize(14).fillColor('#2d3748').text(
      `For their outstanding dedication, selflessness, and contribution as a Volunteer.\n` +
      `Your support has made a meaningful impact in the lives of our residents.`,
      100, 270, { align: 'center', width: doc.page.width - 200, lineGap: 6 }
    );

    // Contribution Details table/box
    doc.rect(150, 340, doc.page.width - 300, 50).fill('#f7fafc');
    doc.rect(150, 340, doc.page.width - 300, 50).lineWidth(1).stroke('#e2e8f0');
    doc.font('Helvetica-Bold').fontSize(12).fillColor('#1a365d').text('Volunteer Details & Contribution', 0, 348, { align: 'center' });
    doc.font('Helvetica').fontSize(11).fillColor('#4a5568').text(
      `ID: ${volunteer.volunteerId}  |  Total Contribution: ${volunteer.totalHours || 0} Hours`,
      0, 368, { align: 'center' }
    );

    // Issue Date and Signatures
    const dateStr = new Date(issueDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    doc.font('Helvetica').fontSize(11).fillColor('#718096').text(`Date of Issue: ${dateStr}`, 80, 460);

    // Signature line
    doc.moveTo(doc.page.width - 280, 470).lineTo(doc.page.width - 80, 470).lineWidth(1).stroke('#718096');
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#1a365d').text('Authorized Signatory', doc.page.width - 280, 478, {
      width: 200,
      align: 'center'
    });
    doc.font('Helvetica').fontSize(10).fillColor('#718096').text('Jivan Jyot Ashram Management', doc.page.width - 280, 492, {
      width: 200,
      align: 'center'
    });

    doc.end();
  });
};

const generateDonationReceiptBuffer = (donation, donor) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks = [];

    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', err => reject(err));

    // Outer frame
    doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60).lineWidth(1).stroke('#e2e8f0');

    // Header Area
    doc.fillColor('#1a365d').fontSize(26).font('Helvetica-Bold').text('JIVAN JYOT ASHRAM', 50, 60);
    doc.fontSize(10).font('Helvetica').fillColor('#718096').text(
      'Sardar Chowk, Jivan Jyot Ashram Road, Navagam, Surat, Gujarat - 394185\n' +
      'Phone: +91 99246 16768, +91 98790 01943 | Email: manavsevasamaj.surat@gmail.com',
      50, 92
    );

    // Decorative horizontal separator
    doc.moveTo(50, 130).lineTo(doc.page.width - 50, 130).lineWidth(1.5).stroke('#d69e2e');

    // Receipt Title
    doc.fillColor('#2d3748').fontSize(20).font('Helvetica-Bold').text('DONATION RECEIPT', 50, 150);

    // Left Column - Receipt Details
    const leftColX = 50;
    doc.fontSize(10).font('Helvetica').fillColor('#4a5568');
    doc.text(`Receipt No: REC-${donation._id.toString().substring(18).toUpperCase()}`, leftColX, 190);
    doc.text(`Donation Date: ${new Date(donation.donationDate).toLocaleDateString()}`, leftColX, 205);
    doc.text(`Payment Mode: Bank Transfer / UPI`, leftColX, 220);
    doc.text(`Transaction Reference: ${donation.transactionId}`, leftColX, 235);
    
    // Status Badge
    doc.font('Helvetica-Bold');
    if (donation.verificationStatus === 'Verified') {
      doc.fillColor('#38a169').text('STATUS: VERIFIED RECEIPT', leftColX, 255);
    } else if (donation.verificationStatus === 'Rejected') {
      doc.fillColor('#e53e3e').text('STATUS: REJECTED / INVALID', leftColX, 255);
    } else {
      doc.fillColor('#dd6b20').text('STATUS: PENDING VERIFICATION', leftColX, 255);
    }

    // Right Column - Donor Information
    const rightColX = 320;
    doc.fillColor('#2d3748').font('Helvetica-Bold').fontSize(11).text('DONOR DETAILS', rightColX, 190);
    doc.font('Helvetica').fontSize(10).fillColor('#4a5568');
    doc.text(`Name: ${donor.name}`, rightColX, 205);
    doc.text(`Email: ${donor.email}`, rightColX, 220);
    doc.text(`Mobile: ${donor.mobile}`, rightColX, 235);
    if (donor.address) {
      doc.text(`Address: ${donor.address}`, rightColX, 250, { width: doc.page.width - rightColX - 50 });
    }

    // Amount Table Header
    const tableY = 300;
    doc.rect(50, tableY, doc.page.width - 100, 25).fill('#1a365d');
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(10).text('Description', 60, tableY + 8);
    doc.text('Amount (INR)', doc.page.width - 150, tableY + 8, { align: 'right', width: 90 });

    // Table Content
    const rowY = tableY + 25;
    doc.rect(50, rowY, doc.page.width - 100, 40).fill('#f7fafc');
    doc.rect(50, rowY, doc.page.width - 100, 40).lineWidth(1).stroke('#e2e8f0');
    doc.fillColor('#2d3748').font('Helvetica').fontSize(10).text('Voluntary Contribution towards Jivan Jyot Ashram Welfare Fund', 60, rowY + 15);
    doc.font('Helvetica-Bold').fontSize(11).text(`Rs. ${donation.amount.toFixed(2)}`, doc.page.width - 150, rowY + 15, {
      align: 'right',
      width: 90
    });

    // Notes
    if (donation.notes) {
      doc.font('Helvetica-Oblique').fontSize(9).fillColor('#718096').text(
        `Remarks: ${donation.notes}`,
        50,
        rowY + 60,
        { width: doc.page.width - 100 }
      );
    }

    // Legal and Tax Exemption Note
    doc.rect(50, 480, doc.page.width - 100, 60).fill('#edf2f7');
    doc.fillColor('#4a5568').font('Helvetica').fontSize(9).text(
      'Thank you for your contribution. Jivan Jyot Manav Mandir Mandbuddhi Ashram is a registered charity (E/7349/Surat). ' +
      'All donations are voluntary and utilized solely for resident care, medical treatments, ' +
      'and maintenance of shelter facilities. Please retain this receipt for your records.',
      60, 490, { width: doc.page.width - 120, lineGap: 3 }
    );

    // Signatures and Seal
    const sigY = 620;
    doc.moveTo(doc.page.width - 220, sigY).lineTo(doc.page.width - 50, sigY).lineWidth(1).stroke('#718096');
    doc.fillColor('#1a365d').font('Helvetica-Bold').fontSize(10).text('Authorized Representative', doc.page.width - 220, sigY + 8, {
      width: 170,
      align: 'center'
    });
    doc.fillColor('#718096').font('Helvetica').fontSize(9).text('JIVAN JYOT ASHRAM FOUNDATION', doc.page.width - 220, sigY + 22, {
      width: 170,
      align: 'center'
    });

    doc.end();
  });
};

const generateMonthlyReportBuffer = (data) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks = [];

    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', err => reject(err));

    const { month, year, stats } = data;

    // Header
    doc.fillColor('#1a365d').fontSize(22).font('Helvetica-Bold').text('JIVAN JYOT MANAV MANDIR ASHRAM', 50, 50);
    doc.fontSize(14).fillColor('#d69e2e').text(`MONTHLY OPERATIONS REPORT - ${month.toUpperCase()} ${year}`, 50, 75);
    
    // Metadata
    doc.fontSize(9).font('Helvetica').fillColor('#718096').text(
      `Generated Date: ${new Date().toLocaleDateString()} | Target Month: ${month} ${year}`,
      50, 95
    );

    doc.moveTo(50, 110).lineTo(doc.page.width - 50, 110).lineWidth(1).stroke('#e2e8f0');

    // Summary Cards Grid (4 boxes)
    const gridY = 130;
    const cardWidth = 115;
    const cardHeight = 70;
    const cardGap = 13;

    const cards = [
      { title: 'Total Donations', val: `INR ${stats.totalDonationsAmount.toLocaleString()}`, color: '#3182ce' },
      { title: 'New Residents', val: `${stats.newResidentsCount} Admitted`, color: '#38a169' },
      { title: 'Active Volunteers', val: `${stats.activeVolunteersCount} Members`, color: '#805ad5' },
      { title: 'Pending Needs', val: `${stats.pendingRequirementsCount} Items`, color: '#dd6b20' }
    ];

    cards.forEach((card, index) => {
      const x = 50 + index * (cardWidth + cardGap);
      // Background card
      doc.rect(x, gridY, cardWidth, cardHeight).fill('#f7fafc');
      doc.rect(x, gridY, cardWidth, cardHeight).lineWidth(1).stroke('#e2e8f0');
      // Left border accent color
      doc.rect(x, gridY, 4, cardHeight).fill(card.color);
      
      // Card content
      doc.fillColor('#718096').font('Helvetica-Bold').fontSize(8.5).text(card.title.toUpperCase(), x + 10, gridY + 12);
      doc.fillColor('#2d3748').font('Helvetica-Bold').fontSize(12).text(card.val, x + 10, gridY + 35, {
        width: cardWidth - 15
      });
    });

    // 1. Donation Performance
    let sectionY = gridY + cardHeight + 30;
    doc.fillColor('#1a365d').font('Helvetica-Bold').fontSize(14).text('1. Financial Summary', 50, sectionY);
    doc.moveTo(50, sectionY + 18).lineTo(doc.page.width - 50, sectionY + 18).lineWidth(0.5).stroke('#cbd5e0');
    
    doc.font('Helvetica').fontSize(10).fillColor('#4a5568');
    doc.text(`Total Donations Received: ${stats.totalDonationsCount} contributions`, 50, sectionY + 30);
    doc.text(`Verified Funds: INR ${stats.verifiedDonationsAmount.toLocaleString()}`, 50, sectionY + 45);
    doc.text(`Pending Verification: INR ${stats.pendingDonationsAmount.toLocaleString()}`, 50, sectionY + 60);

    // 2. Residents Welfare & Status
    sectionY = sectionY + 90;
    doc.fillColor('#1a365d').font('Helvetica-Bold').fontSize(14).text('2. Residents Welfare', 50, sectionY);
    doc.moveTo(50, sectionY + 18).lineTo(doc.page.width - 50, sectionY + 18).lineWidth(0.5).stroke('#cbd5e0');

    doc.font('Helvetica').fontSize(10).fillColor('#4a5568');
    doc.text(`Current Active Residents inside Ashram: ${stats.totalActiveResidents} residents`, 50, sectionY + 30);
    doc.text(`Admissions in this Month: ${stats.newResidentsCount}`, 50, sectionY + 45);
    doc.text(`Discharged / Relocated: ${stats.dischargedResidentsCount}`, 50, sectionY + 60);

    // 3. Community Engagement & Events
    sectionY = sectionY + 90;
    doc.fillColor('#1a365d').font('Helvetica-Bold').fontSize(14).text('3. Community & Events', 50, sectionY);
    doc.moveTo(50, sectionY + 18).lineTo(doc.page.width - 50, sectionY + 18).lineWidth(0.5).stroke('#cbd5e0');

    doc.font('Helvetica').fontSize(10).fillColor('#4a5568');
    doc.text(`Events Organized: ${stats.eventsCount} events conducted`, 50, sectionY + 30);
    doc.text(`Total Volunteer Support Hours: ${stats.totalVolunteerHours} hours of service`, 50, sectionY + 45);
    doc.text(`New Volunteer Enrolments: ${stats.newVolunteersCount} registrations`, 50, sectionY + 60);

    // 4. Logistics & Supply Requirements
    sectionY = sectionY + 90;
    doc.fillColor('#1a365d').font('Helvetica-Bold').fontSize(14).text('4. Resource & Requirements Status', 50, sectionY);
    doc.moveTo(50, sectionY + 18).lineTo(doc.page.width - 50, sectionY + 18).lineWidth(0.5).stroke('#cbd5e0');

    doc.font('Helvetica').fontSize(10).fillColor('#4a5568');
    doc.text(`Urgent Resource Demands: ${stats.urgentRequirementsCount} items flagged as urgent`, 50, sectionY + 30);
    doc.text(`Fulfilled Needs in this Month: ${stats.fulfilledRequirementsCount} requests resolved`, 50, sectionY + 45);
    doc.text(`Currently Active / Unfulfilled Requirements: ${stats.pendingRequirementsCount} items`, 50, sectionY + 60);

    // Footer Copyright notice
    doc.moveTo(50, 720).lineTo(doc.page.width - 50, 720).lineWidth(1).stroke('#e2e8f0');
    doc.font('Helvetica').fontSize(8.5).fillColor('#718096').text(
      'Jivan Jyot Ashram Operations Report. For Internal Circulation and Audit Only.',
      50, 735, { align: 'center' }
    );

    doc.end();
  });
};

const generateDischargeFormBuffer = (discharge, resident) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks = [];

    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', err => reject(err));

    // Outer border
    doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60).lineWidth(1.5).stroke('#1a365d');
    doc.rect(35, 35, doc.page.width - 70, doc.page.height - 70).lineWidth(0.5).stroke('#d69e2e');

    // Header Area
    doc.fillColor('#1a365d').fontSize(22).font('Helvetica-Bold').text('JIVANJYOT MANAV MANDIR ASHRAM', 50, 60, { align: 'center' });
    doc.fontSize(10).font('Helvetica').fillColor('#718096').text(
      'Managed by Manav Seva Samaj Trust, Surat (Reg. No. E/7349/Surat)\n' +
      'Phone: +91 99246 16768, +91 99254 23508 | Email: manavsevasamaj.surat@gmail.com',
      50, 88, { align: 'center' }
    );

    // Decorative separator
    doc.moveTo(50, 120).lineTo(doc.page.width - 50, 120).lineWidth(1.5).stroke('#d69e2e');

    // Title
    doc.fillColor('#2d3748').fontSize(16).font('Helvetica-Bold').text('RESIDENT DISCHARGE FORM (FORM NO. 2)', 50, 140, { align: 'center' });

    // Date
    const dischargeDateStr = new Date(discharge.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#4a5568').text(`Discharge Date: ${dischargeDateStr}`, doc.page.width - 220, 170, { align: 'right' });

    // Resident Details Section
    doc.fillColor('#1a365d').fontSize(12).font('Helvetica-Bold').text('1. RESIDENT DETAILS', 50, 190);
    doc.moveTo(50, 205).lineTo(doc.page.width - 50, 205).lineWidth(0.5).stroke('#cbd5e0');

    doc.fontSize(10).font('Helvetica').fillColor('#2d3748');
    const labelX = 60;
    const valueX = 180;
    
    doc.font('Helvetica-Bold').text('Resident Name:', labelX, 220);
    doc.font('Helvetica').text(discharge.residentName || resident.name, valueX, 220);

    doc.font('Helvetica-Bold').text('Resident ID:', labelX, 235);
    doc.font('Helvetica').text(resident.residentId || '—', valueX, 235);

    doc.font('Helvetica-Bold').text('Primary Address:', labelX, 250);
    doc.font('Helvetica').text(discharge.address || resident.address || '—', valueX, 250);

    doc.font('Helvetica-Bold').text('Village / Taluka:', labelX, 265);
    doc.font('Helvetica').text(`${discharge.village} / ${discharge.taluka}`, valueX, 265);

    doc.font('Helvetica-Bold').text('Mobile Number:', labelX, 280);
    doc.font('Helvetica').text(discharge.mobile || '—', valueX, 280);

    // Discharge Declaration Text (as in Form 2 Gujarati, translated)
    doc.fillColor('#1a365d').fontSize(12).font('Helvetica-Bold').text('2. DISCHARGE DECLARATION & RELEASE', 50, 315);
    doc.moveTo(50, 330).lineTo(doc.page.width - 50, 330).lineWidth(0.5).stroke('#cbd5e0');

    doc.fontSize(10).font('Helvetica-Oblique').fillColor('#4a5568');
    doc.text(
      'To the Management of Manav Seva Samaj Trust, Jivan Jyot Ashram Surat:\n\n' +
      'We hereby state that our resident relative was admitted in the Ashram in a poor state of health and mind. ' +
      'Today, through the treatment, boarding, and care provided completely free of charge by your institution, ' +
      'they are being handed back over to our home in a safe, healthy, and restored condition.\n\n' +
      'We express our deep gratitude to the organization. Henceforth, all custody, well-being, and legal ' +
      'responsibilities of the discharged individual rest solely with us. The Jivan Jyot Ashram trust and its management ' +
      'will hold zero responsibility or liability from this day forward.',
      60, 345, { width: doc.page.width - 120, lineGap: 4 }
    );

    // Responsibility Person Details
    doc.fillColor('#1a365d').fontSize(12).font('Helvetica-Bold').text('3. GUARDIAN / RESPONSIBILITY TAKER DETAILS', 50, 480);
    doc.moveTo(50, 495).lineTo(doc.page.width - 50, 495).lineWidth(0.5).stroke('#cbd5e0');

    doc.fontSize(10).font('Helvetica').fillColor('#2d3748');
    doc.font('Helvetica-Bold').text('Responsible Person:', labelX, 510);
    doc.font('Helvetica').text(discharge.takingResponsibilityPerson, valueX, 510);

    doc.font('Helvetica-Bold').text('Relationship:', labelX, 525);
    doc.font('Helvetica').text(discharge.relationship, valueX, 525);

    doc.font('Helvetica-Bold').text('Contact Address:', labelX, 540);
    doc.font('Helvetica').text(discharge.responsibilityAddress, valueX, 540, { width: doc.page.width - valueX - 60 });

    // Signatures block
    const sigY = 640;
    
    // Left side: Taker signature
    doc.moveTo(60, sigY).lineTo(230, sigY).lineWidth(0.75).stroke('#718096');
    doc.fillColor('#2d3748').font('Helvetica-Bold').fontSize(9).text('Signature of Responsibility Taker', 60, sigY + 6);
    doc.font('Helvetica').fillColor('#718096').text(discharge.takingResponsibilityPerson, 60, sigY + 18);
    if (discharge.signature) {
      doc.font('Helvetica-Oblique').fillColor('#1a365d').text(`Signed: ${discharge.signature}`, 60, sigY - 14);
    }

    // Right side: Ashram representative
    doc.moveTo(doc.page.width - 230, sigY).lineTo(doc.page.width - 60, sigY).lineWidth(0.75).stroke('#718096');
    doc.fillColor('#2d3748').font('Helvetica-Bold').fontSize(9).text('Authorized Representative / Seal', doc.page.width - 230, sigY + 6, { align: 'center', width: 170 });
    doc.font('Helvetica').fillColor('#718096').text('JIVAN JYOT ASHRAM TRUSTEE', doc.page.width - 230, sigY + 18, { align: 'center', width: 170 });

    doc.end();
  });
};

module.exports = {
  generateCertificateBuffer,
  generateDonationReceiptBuffer,
  generateMonthlyReportBuffer,
  generateDischargeFormBuffer
};
