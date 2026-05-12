import Dashboard from "../_components/Dashboard";

export const metadata = {
  title: "Zanshin · Preview (empty)",
};

export default function PreviewEmpty() {
  return (
    <main className="min-h-screen overflow-auto bg-page">
      <Dashboard state="empty" />
    </main>
  );
}
