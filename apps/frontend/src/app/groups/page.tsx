import InfoCardPage from '@/components/InfoCardPage';

export default function GroupsPage(): JSX.Element {
  return (
    <InfoCardPage
      title="My Groups"
      description="Organize students into groups before assigning work. This section is scaffolded to match the design system and can be extended with class rosters or group management next."
      actionLabel="Create a Group"
      actionHref="/assignments/new"
    />
  );
}