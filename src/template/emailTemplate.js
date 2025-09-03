exports.registrationTemplate =  (name, email, sendOtp, OtpExpiresTime, verifyEmailLink) => {
  return `
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Verify Your Email</title>
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #f5f7fa; margin: 0; padding: 0;">

    <table align="center" width="600" cellpadding="0" cellspacing="0" 
           style="background-color: #ffffff; border-radius: 6px; overflow: hidden;">
      <!-- Logo -->
      <tr>
        <td align="center" style="padding: 30px;">
          <img src="https://img.icons8.com/ios-filled/50/000000/briefcase.png" alt="Logo" width="50" />
          <h2 style="margin: 10px 0; font-weight: bold; color: #333;">THE JOB BOX</h2>
        </td>
      </tr>

      <!-- Main Message -->
      <tr>
        <td align="center" style="padding: 20px 40px;">
          <h1 style="color: #333; font-size: 24px;">Welcome, ${name}!</h1>
          <p style="color: #555; font-size: 16px;">
            Please verify your email <strong>${email}</strong> to activate your account.  
            <br><br>
            <strong style="color:#f7b500;">Your OTP: ${sendOtp}</strong>  
            <br>
            (This OTP will expire at: <strong>${new Date(OtpExpiresTime).toLocaleString()}</strong>)
          </p>
          <a href="${verifyEmailLink}" 
             style="display: inline-block; background-color: #f7b500; color: #000; 
                    padding: 12px 24px; text-decoration: none; font-weight: bold; 
                    border-radius: 4px; margin-top: 20px;">
            Verify Email Now
          </a>
        </td>
      </tr>
    </table>

  </body>
  </html>
  `;
};
