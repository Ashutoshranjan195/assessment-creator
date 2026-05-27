import InfoCardPage from '@/components/InfoCardPage';

export default function SettingsPage(): JSX.Element {
  return (
    <InfoCardPage
      title="Settings"
      description="Account and workspace settings are not wired yet, but the route exists so the shell behaves like the reference and stays free of broken links."
      actionLabel="Back to Assignments"
      actionHref="/assignments"
    />
  );
}