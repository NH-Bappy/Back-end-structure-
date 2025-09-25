const QRCode = require('qrcode');
const bwipjs = require('bwip-js');
const { CustomError } = require('../utils/customError');

// generate QRCode

exports.generateQR = async text => {
  try {
    const createQRCode= await QRCode.toDataURL(text , {
        errorCorrectionLevel: 'H',
        margin: 1,
    });
    return createQRCode;
  } catch (err) {
    throw new CustomError(500 , 'error from generate QRCode'+ err);
  }
}

//generate barcode
exports.generateBarcode = async(text) => {
    try {
    return bwipjs.toSVG({
    bcid:'code128',           // Barcode type
    text:text,               // Text to encode
    height:12,              // Bar height, in millimeters
    includetext:true,      // Show human-readable text
    textxalign:'center',  // Always good to set this
    textcolor: 'ff0000', // Red text
});
    } catch (error) {
        throw new CustomError(500 , 'error from generate barcode'+ error);
    }
}