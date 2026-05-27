import InfoCardPage from '@/components/InfoCardPage';

export default function ToolsPage(): JSX.Element {
  return (
    <InfoCardPage
      title="AI Teacher's Toolkit"
      description="This area is reserved for assistant tools, prompt helpers, and paper generation workflows. The route is now in place to keep the sidebar consistent with the Figma screens."
      actionLabel="Create Assignment"
      actionHref="/assignments/new"
    />
  );
}