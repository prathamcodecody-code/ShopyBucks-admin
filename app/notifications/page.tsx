import AdminLayout from "@/components/AdminLayout";
import SendNotification from "@/components/notifications/SendNotification";

export default function Page() {
  return (
    <AdminLayout>
    <div className="p-8">
      <SendNotification />
    </div>
    </AdminLayout>
  );
}