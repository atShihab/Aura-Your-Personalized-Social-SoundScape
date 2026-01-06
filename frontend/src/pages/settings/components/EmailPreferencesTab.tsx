import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Mail, Bell, Music, User, CreditCard, AlertCircle } from 'lucide-react';
import { axiosInstance } from '@/lib/axios';
import toast from 'react-hot-toast';

interface EmailPreferences {
  account: {
    signupVerification: boolean;
    passwordReset: boolean;
    newDeviceLogin: boolean;
  };
  subscription: {
    confirmation: boolean;
    renewal: boolean;
  };
  music: {
    newReleases: boolean;
    artistUpdates: boolean;
  };
  artist: {
    verification: boolean;
    uploadStatus: boolean;
    payments: boolean;
  };
}

const EmailPreferencesTab: React.FC = () => {
  const [preferences, setPreferences] = useState<EmailPreferences>({
    account: {
      signupVerification: true,
      passwordReset: true,
      newDeviceLogin: true
    },
    subscription: {
      confirmation: true,
      renewal: true
    },
    music: {
      newReleases: true,
      artistUpdates: true
    },
    artist: {
      verification: true,
      uploadStatus: true,
      payments: true
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchEmailPreferences();
  }, []);

  const fetchEmailPreferences = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get('/notifications/preferences');
      if (response.data.success) {
        setPreferences(response.data.emailPreferences);
      }
    } catch (error: any) {
      console.error('Error fetching email preferences:', error);
      toast.error('Failed to load email preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreferenceChange = (category: keyof EmailPreferences, key: string, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const response = await axiosInstance.put('/notifications/preferences', {
        preferences
      });
      
      if (response.data.success) {
        toast.success('Email preferences updated successfully');
      }
    } catch (error: any) {
      console.error('Error saving email preferences:', error);
      toast.error('Failed to save email preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestEmail = async (type: string) => {
    try {
      const response = await axiosInstance.post('/notifications/test', {
        type,
        testData: {
          userName: 'Test User',
          verificationLink: 'https://example.com/verify',
          resetLink: 'https://example.com/reset',
          deviceInfo: { device: 'Test Device', browser: 'Test Browser', location: 'Test Location' },
          loginTime: new Date().toLocaleString(),
          planName: 'Premium Plan',
          amount: '$9.99',
          artistName: 'Test Artist',
          releaseTitle: 'Test Song',
          releaseType: 'Song',
          reason: 'Test reason'
        }
      });
      
      if (response.data.success) {
        toast.success('Test email sent successfully');
      } else {
        toast.error('Failed to send test email');
      }
    } catch (error: any) {
      console.error('Error sending test email:', error);
      toast.error('Failed to send test email');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Email Preferences</h2>
          <p className="text-muted-foreground">
            Manage your email notification preferences
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account & Security
            </CardTitle>
            <CardDescription>
              Notifications about your account and security
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="signup-verification">Sign-up Verification</Label>
                <p className="text-sm text-muted-foreground">
                  Email verification when you sign up
                </p>
              </div>
              <Switch
                id="signup-verification"
                checked={preferences.account.signupVerification}
                onCheckedChange={(checked) => handlePreferenceChange('account', 'signupVerification', checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="password-reset">Password Reset</Label>
                <p className="text-sm text-muted-foreground">
                  Notifications when you reset your password
                </p>
              </div>
              <Switch
                id="password-reset"
                checked={preferences.account.passwordReset}
                onCheckedChange={(checked) => handlePreferenceChange('account', 'passwordReset', checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="new-device-login">New Device Login</Label>
                <p className="text-sm text-muted-foreground">
                  Alerts when someone logs in from a new device
                </p>
              </div>
              <Switch
                id="new-device-login"
                checked={preferences.account.newDeviceLogin}
                onCheckedChange={(checked) => handlePreferenceChange('account', 'newDeviceLogin', checked)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Subscription & Payment
            </CardTitle>
            <CardDescription>
              Notifications about your subscription and payments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="subscription-confirmation">Subscription Confirmation</Label>
                <p className="text-sm text-muted-foreground">
                  Confirmation when you subscribe or renew
                </p>
              </div>
              <Switch
                id="subscription-confirmation"
                checked={preferences.subscription.confirmation}
                onCheckedChange={(checked) => handlePreferenceChange('subscription', 'confirmation', checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="subscription-renewal">Subscription Renewal</Label>
                <p className="text-sm text-muted-foreground">
                  Reminders before your subscription expires
                </p>
              </div>
              <Switch
                id="subscription-renewal"
                checked={preferences.subscription.renewal}
                onCheckedChange={(checked) => handlePreferenceChange('subscription', 'renewal', checked)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="h-5 w-5" />
              Music Updates
            </CardTitle>
            <CardDescription>
              Notifications about new music from artists you follow
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="new-releases">New Releases</Label>
                <p className="text-sm text-muted-foreground">
                  When followed artists release new songs or albums
                </p>
              </div>
              <Switch
                id="new-releases"
                checked={preferences.music.newReleases}
                onCheckedChange={(checked) => handlePreferenceChange('music', 'newReleases', checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="artist-updates">Artist Updates</Label>
                <p className="text-sm text-muted-foreground">
                  General updates from artists you follow
                </p>
              </div>
              <Switch
                id="artist-updates"
                checked={preferences.music.artistUpdates}
                onCheckedChange={(checked) => handlePreferenceChange('music', 'artistUpdates', checked)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Artist Notifications
            </CardTitle>
            <CardDescription>
              Notifications for artists about their content and earnings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="verification">Verification Status</Label>
                <p className="text-sm text-muted-foreground">
                  When your artist verification is approved or rejected
                </p>
              </div>
              <Switch
                id="verification"
                checked={preferences.artist.verification}
                onCheckedChange={(checked) => handlePreferenceChange('artist', 'verification', checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="upload-status">Upload Status</Label>
                <p className="text-sm text-muted-foreground">
                  When your songs or albums are approved or rejected
                </p>
              </div>
              <Switch
                id="upload-status"
                checked={preferences.artist.uploadStatus}
                onCheckedChange={(checked) => handlePreferenceChange('artist', 'uploadStatus', checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="payments">Payment Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  When your royalty payments are processed
                </p>
              </div>
              <Switch
                id="payments"
                checked={preferences.artist.payments}
                onCheckedChange={(checked) => handlePreferenceChange('artist', 'payments', checked)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Test Email Notifications
            </CardTitle>
            <CardDescription>
              Send test emails to verify your notification settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleTestEmail('signup_verification')}
              >
                Test Signup
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleTestEmail('password_reset')}
              >
                Test Password Reset
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleTestEmail('new_device_login')}
              >
                Test Device Login
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleTestEmail('subscription_confirmation')}
              >
                Test Subscription
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleTestEmail('new_release_from_followed_artist')}
              >
                Test New Release
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleTestEmail('verification_approved')}
              >
                Test Verification
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmailPreferencesTab;
