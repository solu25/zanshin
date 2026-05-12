import Dashboard from "../_components/Dashboard";

export const metadata = {
  title: "Zanshin · Preview (filled)",
};

export default function PreviewFilled() {
  return (
    <main className="min-h-screen overflow-auto bg-page">
      <Dashboard state="filled" />
    </main>
  );
}
