import emailjs from '@emailjs/browser';

/**
 * EMAILJS CONFIGURATION
 * To make this automation work:
 * 1. Sign up at https://www.emailjs.com/
 * 2. Create a Email Service (e.g., Gmail) and get the SERVICE_ID.
 * 3. Create an Email Template with placeholders: {{admin_name}}, {{admin_email}}, {{request_time}}, {{content}}.
 * 4. Get your PUBLIC_KEY from the Account section.
 * 5. Replace the placeholders below.
 */
const EMAILJS_CONFIG = {
  SERVICE_ID: import.meta.env.VITE_EMAILJS_SERVICE_ID,
  TEMPLATE_ID: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
  PUBLIC_KEY: import.meta.env.VITE_EMAILJS_PUBLIC_KEY
};

export const sendAdminResetNotification = async (adminData) => {
  const requestTime = new Date().toLocaleString();
  const templateParams = {
    to_email: 'karanveer092004@gmail.com',
    admin_name: adminData.name,
    admin_email: adminData.email,
    request_time: requestTime,
    subject: "Password Reset Request – System Administrator",
    content: `Dear Developer,

I hope you are doing well.

This is to inform you that a password reset request has been initiated by the System Administrator (Admin Level 1) within the LeaveEase application.

Since administrative credentials are managed at the highest level, this request requires your intervention and authorization.

Details of the Request:
- Name: ${adminData.name}
- Role: System Administrator (Admin Level 1)
- Registered Email: ${adminData.email}
- Request Date & Time: ${requestTime}

Kindly process this request at your earliest convenience and ensure that appropriate security measures are followed during the reset process.

If any additional verification is required, please feel free to reach out.

Thank you for your support.

Regards,
LeaveEase System`
  };

  try {
    // In a real scenario, this would send the email. 
    // If the keys are placeholders, it will fail but we still log the action.
    if (EMAILJS_CONFIG.PUBLIC_KEY) {
      await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        templateParams,
        EMAILJS_CONFIG.PUBLIC_KEY
      );
    }

    // Always log to console for development verification
    console.log('--- AUTOMATED EMAIL LOG ---');
    console.log('To:', templateParams.to_email);
    console.log('Subject:', templateParams.subject);
    console.log('Body:', templateParams.content);
    console.log('---------------------------');

    return true;
  } catch (error) {
    console.error('EmailJS automation error:', error);
    return false;
  }
};
