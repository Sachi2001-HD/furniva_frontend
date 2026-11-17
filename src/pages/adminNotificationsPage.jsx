import AdminLayout from "../components/admin/adminLayout";
import NotificationList from "../components/notificationList";

export default function AdminNotificationsPage() {
  return (
    <AdminLayout
      title="Notifications"
      subtitle="New orders, requests and alerts that need your attention."
    >
      <div className="max-w-4xl">
        <NotificationList />
      </div>
    </AdminLayout>
  );
}