import { redirect } from "next/navigation";

const AdminRootPage = () => {
  redirect("/admin/dashboard");
};

export default AdminRootPage;
