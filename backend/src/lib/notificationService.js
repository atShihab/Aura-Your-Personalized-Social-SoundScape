import { sendEmail, sendEmailToAddress, sendBulkEmails } from './emailService.js';
import { emailTemplates } from './emailTemplates.js';
import { User } from '../models/user.model.js';
import { Follow } from '../models/follow.model.js';

export class NotificationService {
  static async sendListenerNotification(type, data) {
    try {
      const { clerkUserId, userEmail, userName, ...templateData } = data;
      
      let template;
      let subject;
      
      switch (type) {
        case 'signup_verification':
          template = emailTemplates.listener.signupVerification(templateData.userName, templateData.verificationLink);
          subject = 'Welcome to Aura - Verify Your Email';
          break;
          
        case 'password_reset':
          template = emailTemplates.listener.passwordReset(templateData.userName, templateData.resetLink);
          subject = 'Password Reset Request - Aura';
          break;
          
        case 'new_device_login':
          template = emailTemplates.listener.newDeviceLogin(templateData.userName, templateData.deviceInfo, templateData.loginTime);
          subject = 'New Device Login Alert - Aura';
          break;
          
        case 'subscription_confirmation':
          template = emailTemplates.listener.subscriptionConfirmation(templateData.userName, templateData.planName, templateData.amount);
          subject = 'Subscription Confirmed - Aura';
          break;
          
        case 'new_release_from_followed_artist':
          template = emailTemplates.listener.newReleaseFromFollowedArtist(
            templateData.userName, 
            templateData.artistName, 
            templateData.releaseTitle, 
            templateData.releaseType
          );
          subject = `New Release from ${templateData.artistName} - Aura`;
          break;
          
        default:
          throw new Error(`Unknown listener notification type: ${type}`);
      }
      
      // Use Clerk's email system
      let result;
      if (clerkUserId) {
        result = await sendEmail(clerkUserId, subject, template);
      } else if (userEmail) {
        result = await sendEmailToAddress(userEmail, subject, template);
      } else {
        throw new Error('Either clerkUserId or userEmail must be provided');
      }
      
      console.log(`📧 Listener notification sent (${type}):`, result.success ? 'Success' : 'Failed');
      return result;
      
    } catch (error) {
      console.error(`❌ Error sending listener notification (${type}):`, error);
      return { success: false, error: error.message };
    }
  }
  
  static async sendArtistNotification(type, data) {
    try {
      const { clerkUserId, userEmail, userName, ...templateData } = data;
      
      let template;
      let subject;
      
      switch (type) {
        case 'verification_approved':
          template = emailTemplates.artist.verificationApproved(templateData.artistName);
          subject = 'Verification Approved - Aura';
          break;
          
        case 'verification_rejected':
          template = emailTemplates.artist.verificationRejected(templateData.artistName, templateData.reason);
          subject = 'Verification Update - Aura';
          break;
          
        case 'upload_success':
          template = emailTemplates.artist.uploadSuccess(templateData.artistName, templateData.releaseTitle, templateData.releaseType);
          subject = 'Upload Successful - Aura';
          break;
          
        case 'upload_rejected':
          template = emailTemplates.artist.uploadRejected(templateData.artistName, templateData.releaseTitle, templateData.reason);
          subject = 'Upload Rejected - Aura';
          break;
          
        case 'payment_processed':
          template = emailTemplates.artist.paymentProcessed(templateData.artistName, templateData.amount, templateData.period);
          subject = 'Payment Processed - Aura';
          break;
          
        default:
          throw new Error(`Unknown artist notification type: ${type}`);
      }
      
      // Use Clerk's email system
      let result;
      if (clerkUserId) {
        result = await sendEmail(clerkUserId, subject, template);
      } else if (userEmail) {
        result = await sendEmailToAddress(userEmail, subject, template);
      } else {
        throw new Error('Either clerkUserId or userEmail must be provided');
      }
      
      console.log(`📧 Artist notification sent (${type}):`, result.success ? 'Success' : 'Failed');
      return result;
      
    } catch (error) {
      console.error(`❌ Error sending artist notification (${type}):`, error);
      return { success: false, error: error.message };
    }
  }
  
  static async notifyFollowersOfNewRelease(artistId, releaseTitle, releaseType) {
    try {
      const artist = await User.findOne({ clerkId: artistId });
      if (!artist) {
        throw new Error('Artist not found');
      }
      
      const followers = await Follow.find({ followingId: artistId }).populate('followerId', 'clerkId fullName');
      
      if (followers.length === 0) {
        console.log('📧 No followers to notify for new release');
        return { success: true, notified: 0 };
      }
      
      const followerData = followers.map(follow => {
        const follower = follow.followerId;
        return {
          clerkUserId: follower.clerkId,
          name: follower.fullName
        };
      });
      
      const template = emailTemplates.listener.newReleaseFromFollowedArtist(
        '{USER_NAME}', 
        artist.artistName || artist.fullName, 
        releaseTitle, 
        releaseType
      );
      
      const subject = `New Release from ${artist.artistName || artist.fullName} - Aura`;
      
      const results = [];
      for (const follower of followerData) {
        const personalizedTemplate = template.replace('{USER_NAME}', follower.name);
        const result = await sendEmail(follower.clerkUserId, subject, personalizedTemplate);
        results.push({ follower: follower.name, ...result });
      }
      
      const successCount = results.filter(r => r.success).length;
      console.log(`📧 New release notifications sent: ${successCount}/${followerData.length} successful`);
      
      return { success: true, notified: successCount, total: followerData.length, results };
      
    } catch (error) {
      console.error('❌ Error notifying followers of new release:', error);
      return { success: false, error: error.message };
    }
  }
  
  static async sendBulkNotificationToArtists(type, templateData) {
    try {
      const artists = await User.find({ isArtist: true });
      
      if (artists.length === 0) {
        console.log('📧 No artists found for bulk notification');
        return { success: true, notified: 0 };
      }
      
      const results = [];
      for (const artist of artists) {
        const data = {
          clerkUserId: artist.clerkId,
          userName: artist.fullName,
          artistName: artist.artistName || artist.fullName,
          ...templateData
        };
        
        const result = await this.sendArtistNotification(type, data);
        results.push({ artist: artist.artistName || artist.fullName, ...result });
      }
      
      const successCount = results.filter(r => r.success).length;
      console.log(`📧 Bulk artist notifications sent: ${successCount}/${artists.length} successful`);
      
      return { success: true, notified: successCount, total: artists.length, results };
      
    } catch (error) {
      console.error('❌ Error sending bulk artist notifications:', error);
      return { success: false, error: error.message };
    }
  }
}
