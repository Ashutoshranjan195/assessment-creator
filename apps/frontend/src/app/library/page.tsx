import InfoCardPage from '@/components/InfoCardPage';

export default function LibraryPage(): JSX.Element {
  return (
    <InfoCardPage
      title="My Library"
      description="Saved question banks, uploaded resources, and reusable content will live here. The route is now live so the navigation shell no longer lands on a 404."
      actionLabel="Upload Material"
      actionHref="/assignments/new"
    />
  );
}