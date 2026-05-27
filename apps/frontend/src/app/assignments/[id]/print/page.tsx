import { QuestionPaper } from '@/components/QuestionPaper';
import type { AssignmentDocument } from '@vedaai/shared';

/**
 * Print-friendly route fetched by Puppeteer when generating the PDF.
 * Uses server-side rendering to fetch assignment data via BACKEND_INTERNAL_URL,
 * so worker containers can access it reliably without CORS issues.
 */
export default async function PrintPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const backendUrl = process.env.BACKEND_INTERNAL_URL || 'http://localhost:4000';
  
  let assignment: AssignmentDocument | null = null;
  let error: string | null = null;

  try {
    const res = await fetch(`${backendUrl}/api/assignments/${id}`, {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    assignment = await res.json();
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load assignment';
  }

  if (error) {
    return <p style={{ padding: 24, color: 'red' }}>Error: {error}</p>;
  }
  
  if (!assignment?.generatedPaper) {
    return <p style={{ padding: 24 }}>No paper generated yet</p>;
  }

  return (
    <div data-print-ready="true">
      <QuestionPaper paper={assignment.generatedPaper} printMode />
    </div>
  );
}
