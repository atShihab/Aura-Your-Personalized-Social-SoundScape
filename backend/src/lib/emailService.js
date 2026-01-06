import { createClerkClient } from '@clerk/clerk-sdk-node';
import dotenv from 'dotenv';

dotenv.config();

const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY
});

export const sendEmail = async (clerkUserId, subject, html, text = '') => {
  try {
    // Get user's email address from Clerk
    const user = await clerk.users.getUser(clerkUserId);
    const emailAddress = user.emailAddresses.find(email => email.id === user.primaryEmailAddressId);
    
    if (!emailAddress) {
      throw new Error('User email address not found');
    }

    // Send email using Clerk's email API
    const email = await clerk.emails.createEmail({
      fromEmailName: 'noreply', // This will be noreply@your-domain.com
      subject: subject,
      body: text || html.replace(/<[^>]*>/g, ''),
      emailAddressId: emailAddress.id,
    });

    console.log('✅ Email sent successfully via Clerk:', email.id);
    return { success: true, messageId: email.id };
  } catch (error) {
    console.error('❌ Email sending failed via Clerk:', error);
    return { success: false, error: error.message };
  }
};

export const sendEmailToAddress = async (emailAddress, subject, html, text = '') => {
  try {
    // For cases where we have email address but not clerkUserId
    // We need to find the user by email first
    const users = await clerk.users.getUserList({
      emailAddress: [emailAddress]
    });

    if (users.data.length === 0) {
      throw new Error('User not found with this email address');
    }

    const user = users.data[0];
    return await sendEmail(user.id, subject, html, text);
  } catch (error) {
    console.error('❌ Email sending failed via Clerk:', error);
    return { success: false, error: error.message };
  }
};

export const sendBulkEmails = async (clerkUserIds, subject, html, text = '') => {
  const results = [];
  
  for (const clerkUserId of clerkUserIds) {
    const result = await sendEmail(clerkUserId, subject, html, text);
    results.push({ clerkUserId, ...result });
  }
  
  return results;
};
