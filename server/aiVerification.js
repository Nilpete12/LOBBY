// File: aiVerification.js
const Tesseract = require('tesseract.js');

const verifyDriverDocument = async (imageUrl, expectedName) => {
  try {
    console.log(`🤖 AI: Scanning document for name: ${expectedName}...`);
    
    // Run OCR on the Cloudinary URL
    const { data: { text } } = await Tesseract.recognize(
      imageUrl,
      'eng',
      { logger: m => console.log(`🤖 AI Status: ${m.status} - ${Math.round(m.progress * 100)}%`) }
    );

    const cleanText = text.replace(/\n/g, ' ').toLowerCase();
    const cleanName = (expectedName || "").toLowerCase();

    console.log("\n--- 🔍 WHAT THE AI ACTUALLY SAW ---");
    console.log(cleanText);
    console.log("-----------------------------------\n");

    // Logic Checks
    const isNameMatch = cleanText.includes(cleanName);
    const isLicense = cleanText.includes('license') || cleanText.includes('driving') || cleanText.includes('card') || cleanText.includes('dob');;

    return {
      success: true,
      extractedText: cleanText,
      isVerified: isNameMatch && isLicense,
      reason: isNameMatch ? "Name match found on document." : "Name mismatch or unreadable document."
    };

  } catch (error) {
    console.error("AI Vision Error:", error);
    return { success: false, isVerified: false, reason: "Failed to scan document." };
  }
};

module.exports = { verifyDriverDocument };