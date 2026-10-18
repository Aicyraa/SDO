import { useEffect, useState } from 'react';
import type { NoticeView } from '@shared/types';
import { PageError } from '@/components/feedback/PageState';
import { SkeletonList } from '@/components/feedback/Skeleton';
import { ListHeader } from '@/components/layout/ListHeader';
import { usePageAction } from '@/components/layout/PageAction';
import { EmptyBlock } from '@/components/ui/EmptyBlock';
import { Icon } from '@/components/ui/Icon';
import { IconHint } from '@/components/ui/IconHint';
import { Pager } from '@/components/ui/Pager';
import { noticesApi } from '@/api/notices';
import { useApi } from '@/hooks/useApi';
import { useFitRows } from '@/hooks/useFitRows';
import { cn } from '@/utils/cn';
import { noticeMeta } from '@/utils/notices';
import { pageOf } from '@/utils/inbox';
import { NoticeForm } from './notices/NoticeForm';
import { NoticeViewModal } from './notices/NoticeViewModal';

/** What the row's state icon says: a notice is either still shown to students or past its end date. */
const stateOf = (notice: NoticeView) =>
  notice.expired
    ? ({ icon: 'event_busy', tone: 'pending', label: 'Expired: students no longer see it' } as const)
    : ({ icon: 'check_circle', tone: 'good', label: 'Active: shown in every student’s bell and inbox' } as const);

/**
 * Staff Notices (source src 1609 to 1668; not in the deck, UI-POLISH-SPEC 5.13; FINAL-POLISH-SPEC F3): one
 * full-width list like the Inbox. A row opens the notice in a dialog; New and Edit are dialogs too.
 */
export function NoticesPage() {
  const resource = useApi(() => noticesApi.notices(), []);
  const [viewing, setViewing] = useState<NoticeView | null>(null);
  const [editing, setEditing] = useState<NoticeView | 'new' | null>(null);
  const [page, setPage] = useState(1);
  usePageAction('New notice', 'campaign', () => setEditing('new'));

  const notices = resource.status === 'ready' ? resource.data.notices : [];
  const { areaRef, rows: perPage } = useFitRows(resource.status === 'ready' ? notices.length : undefined);
  const shown = pageOf(notices, page, perPage);
  useEffect(() => {
    if (page !== shown.page) setPage(shown.page);
  }, [page, shown.page]);

  if (resource.status === 'loading') {
    return <SkeletonList label="Loading notices…" className="px-0" />;
  }
  if (resource.status === 'error') return <PageError page="Notices" detail={resource.error.message} onRetry={resource.reload} />;

  const done = () => {
    setViewing(null);
    setEditing(null);
    resource.reload();
  };

  return (
    <>
      <h1 className="sr-only">Notices</h1>
      <section className="flex min-h-[var(--page-h)] flex-col overflow-hidden rounded-xl border border-line bg-white rail:h-[var(--page-h)]">
        <ListHeader title="Important notices" subtitle="Shown in every student’s bell and inbox" />
        <div ref={areaRef} className="flex min-h-0 flex-1 flex-col">
          <div data-fit-body className="min-h-0 flex-1 overflow-y-auto">
            {notices.length === 0 ? (
              <EmptyBlock icon="campaign" title="No notices published">
                Publish a notice to reach every student at once.
              </EmptyBlock>
            ) : null}
            {shown.rows.map((notice) => {
              const state = stateOf(notice);
              return (
                <div
                  key={notice.id}
                  data-fit-row
                  className="flex h-20 shrink-0 items-center gap-3 border-b border-line-soft bg-white pr-6 pl-6 transition-colors hover:bg-row-hover"
                >
                  <button
                    type="button"
                    onClick={() => setViewing(notice)}
                    aria-label={`Open notice: ${notice.title}`}
                    className="flex h-full min-w-0 flex-1 items-center gap-3.5 text-left outline-none focus-visible:shadow-[inset_0_0_0_2px_var(--color-primary)]"
                  >
                    <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-full bg-pending-soft text-warn-ink">
                      <Icon name="campaign" className="!text-xl" />
                    </span>
                    <span className="min-w-0 flex-1 leading-snug">
                      <span className={cn('block truncate font-semibold', notice.expired ? 'text-body' : 'text-ink')}>{notice.title}</span>
                      <span className="mt-0.5 block truncate text-xs text-muted">{noticeMeta(notice)}</span>
                    </span>
                  </button>
                  <IconHint icon={state.icon} tone={state.tone} label={state.label} />
                  <Icon name="chevron_right" className="!text-xl text-disabled" />
                </div>
              );
            })}
          </div>
          <Pager page={shown.page} pageCount={shown.pages} onChange={setPage} className="mt-auto border-t border-line-soft py-2.5" />
        </div>
      </section>

      {viewing && editing === null ? (
        <NoticeViewModal notice={viewing} onClose={() => setViewing(null)} onEdit={() => setEditing(viewing)} onRemoved={done} />
      ) : null}
      {editing !== null ? (
        <NoticeForm
          key={editing === 'new' ? 'new' : editing.id}
          notice={editing === 'new' ? null : editing}
          onDone={done}
          onCancel={() => setEditing(null)}
        />
      ) : null}
    </>
  );
}
