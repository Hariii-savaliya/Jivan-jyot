const QRCode = require('qrcode');

const generateUPIQR = async (amount, notes) => {
  const upiId = process.env.UPI_ID || 'jivanjyotashram@upi';
  const upiName = process.env.UPI_NAME || 'Jivan Jyot Manav Mandir Mandbuddhi Ashram';

  // Build standard UPI URL payload
  let upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(upiName)}&cu=INR`;
  
  if (amount && Number(amount) > 0) {
    upiUrl += `&am=${encodeURIComponent(amount)}`;
  }
  
  if (notes) {
    upiUrl += `&tn=${encodeURIComponent(notes)}`;
  }

  try {
    const qrDataUrl = await QRCode.toDataURL(upiUrl, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 300,
      color: {
        dark: '#1a365d',  // Custom styling matching the theme
        light: '#ffffff'
      }
    });

    return {
      upiUrl,
      qrDataUrl
    };
  } catch (error) {
    console.error('QR code generation failed:', error);
    throw new Error('Failed to generate donation QR Code');
  }
};

module.exports = { generateUPIQR };
