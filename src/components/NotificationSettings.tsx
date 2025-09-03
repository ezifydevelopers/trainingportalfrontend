import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, MessageCircle, Volume2, VolumeX } from 'lucide-react';
import { toast } from 'sonner';

interface NotificationSettingsProps {
  onClose: () => void;
}

export default function NotificationSettings({ onClose }: NotificationSettingsProps) {
  const [browserNotifications, setBrowserNotifications] = useState(false);
  const [soundNotifications, setSoundNotifications] = useState(true);
  const [toastNotifications, setToastNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);

  useEffect(() => {
    // Check current notification permission
    if ('Notification' in window) {
      setBrowserNotifications(Notification.permission === 'granted');
    }
  }, []);

  const handleBrowserNotificationToggle = async () => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        // Permission already granted, just toggle
        setBrowserNotifications(!browserNotifications);
      } else if (Notification.permission === 'default') {
        // Request permission
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          setBrowserNotifications(true);
          toast.success('Browser notifications enabled!');
        } else {
          toast.error('Browser notifications permission denied');
        }
      } else {
        // Permission denied, show instructions
        toast.error('Please enable notifications in your browser settings');
      }
    }
  };

  const handleSaveSettings = () => {
    // Save settings to localStorage
    localStorage.setItem('notificationSettings', JSON.stringify({
      browserNotifications,
      soundNotifications,
      toastNotifications,
      emailNotifications
    }));
    
    toast.success('Notification settings saved!');
    onClose();
  };

  const testNotification = () => {
    if (browserNotifications && 'Notification' in window) {
      new Notification('Test Notification', {
        body: 'This is a test notification from the Training Portal',
        icon: '/favicon.ico'
      });
    }
    
    if (toastNotifications) {
      toast.success('Test notification sent!');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-96 max-h-[80vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Browser Notifications */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="browser-notifications">Browser Notifications</Label>
              <p className="text-sm text-gray-500">
                Show notifications even when the app is not active
              </p>
            </div>
            <Switch
              id="browser-notifications"
              checked={browserNotifications}
              onCheckedChange={handleBrowserNotificationToggle}
            />
          </div>

          {/* Sound Notifications */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sound-notifications">Sound Notifications</Label>
              <p className="text-sm text-gray-500">
                Play sound when receiving messages
              </p>
            </div>
            <Switch
              id="sound-notifications"
              checked={soundNotifications}
              onCheckedChange={setSoundNotifications}
            />
          </div>

          {/* Toast Notifications */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="toast-notifications">Toast Notifications</Label>
              <p className="text-sm text-gray-500">
                Show toast messages in the app
              </p>
            </div>
            <Switch
              id="toast-notifications"
              checked={toastNotifications}
              onCheckedChange={setToastNotifications}
            />
          </div>

          {/* Email Notifications */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <p className="text-sm text-gray-500">
                Send email notifications for important updates
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>

          {/* Test Button */}
          <div className="pt-4 border-t">
            <Button
              onClick={testNotification}
              variant="outline"
              className="w-full"
              disabled={!browserNotifications && !toastNotifications}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Test Notifications
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button onClick={handleSaveSettings} className="flex-1">
              Save Settings
            </Button>
            <Button onClick={onClose} variant="outline" className="flex-1">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
