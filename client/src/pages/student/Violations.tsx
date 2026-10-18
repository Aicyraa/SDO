import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import type { Severity, StudentCaseView } from '@shared/types';
import { PageError } from '@/components/feedback/PageState';
import { SkeletonList } from '@/components/feedback/Skeleton';
import { MasterDetail } from '@/components/layout/MasterDetail';
import { ClassTiles } from '@/components/student/ClassTiles';
import { ChipGroup } from '@/components/ui/ChipGroup';
import { meApi } from '@/api/me';
import { useApi } from '@/hooks/useApi';
import { useFitRows } from '@/hooks/useFitRows';
import { classTiles, statusChips, violationBase, type CaseStatusKey, type ClassKey } from '@/utils/studentView';
import { ViolationDetail } from './violations/ViolationDetail';
import { ViolationTable } from './violations/ViolationTable';

const isClosed = (item: StudentCaseView) => item.status === 'resolved' || item.status === 'rejected';

/** My violations (deck W62 to W64): class tiles, status chips, the table, and the selected case (D14). */
export function ViolationsPage() {
  const { id } = useParams();
  const location = useLocation();
  const caseId = /^\d+$/.test(id ?? '') ? Number(id) : null;
  const resource = useApi(() => meApi.myCases(), []);
  const [cls, setCls] = useState<ClassKey>('all');
  const [status, setStatus] = useState<CaseStatusKey>('all');
  const [showResolved, setShowResolved] = useState(false);
  const [page, setPage] = useState(1);

  const cases = resource.status === 'ready' ? resource.data.cases : [];
  const base = violationBase(cases, showResolved);
  const byClass = base.filter((item) => cls === 'all' || item.severity === (cls as Severity));
  const rows = byClass.filter((item) => showResolved || status === 'all' || item.status === status);
  // As many rows per page as the card holds (F1); the filtered count says whether a pager is needed.
  const { areaRef, rows: perPage } = useFitRows(resource.status === 'ready' ? rows.length : undefined);
  // A taller window means fewer pages: step back when the page we were on no longer exists.
  const lastPage = Math.max(1, Math.ceil(rows.length / perPage));
  useEffect(() => {
    if (page > lastPage) setPage(lastPage);
  }, [page, lastPage]);

  // Arriving at a case from elsewhere (dashboard, bell): show it whatever the filters were, on its page (5.4b).
  const fromList = (location.state as { fromList?: boolean } | null)?.fromList;
  const target = caseId === null ? undefined : cases.find((item) => item.id === caseId);
  useEffect(() => {
    if (!target || fromList) return;
    const resolved = isClosed(target);
    const list = violationBase(cases, resolved);
    setShowResolved(resolved);
    setCls('all');
    setStatus('all');
    setPage(Math.floor(list.findIndex((item) => item.id === target.id) / perPage) + 1);
    // Only when the case or the address changes, not on every refresh of the list.
  }, [target?.id, location.key]);

  if (resource.status === 'loading') {
    return (
      <SkeletonList label="Loading your violations…" className="px-0" />
    );
  }
  if (resource.status === 'error') return <PageError page="My violations" detail={resource.error.message} onRetry={resource.reload} />;

  const resetPage = () => setPage(1);
  const first = rows[(page - 1) * perPage]?.id ?? null;
  const pane = (shownId: number) => <ViolationDetail key={shownId} caseId={shownId} />;

  return (
    <>
      <h1 className="sr-only">My violations</h1>
      <MasterDetail
        ratio="student"
        detailKey={caseId}
        list={
          <div className="flex h-full min-h-0 flex-col gap-2.5">
            <ClassTiles
              label="Classification"
              tiles={classTiles(base, showResolved)}
              value={cls}
              onChange={(key) => {
                setCls(key);
                resetPage();
              }}
            />
            {showResolved ? null : (
              <ChipGroup
                label="Filter by status"
                options={statusChips(byClass)}
                value={status}
                onChange={(value) => {
                  setStatus(value as CaseStatusKey);
                  resetPage();
                }}
                className="justify-center [&>button]:min-h-11 rail:[&>button]:min-h-[38px]"
              />
            )}
            <ViolationTable
              rows={rows}
              page={page}
              perPage={perPage}
              areaRef={areaRef}
              onPage={setPage}
              selectedId={caseId ?? first}
              resolvedCount={cases.filter(isClosed).length}
              showResolved={showResolved}
              onToggleResolved={() => {
                setShowResolved((value) => !value);
                setCls('all');
                setStatus('all');
                resetPage();
              }}
            />
          </div>
        }
        detail={caseId === null ? null : pane(caseId)}
        emptyDetail={
          first === null ? (
            <div className="grid min-h-40 place-items-center rounded-xl border border-line bg-white px-5 py-10 text-center text-muted">
              {cases.length === 0 ? 'You have no violations on record.' : 'No violation selected.'}
            </div>
          ) : (
            pane(first)
          )
        }
      />
    </>
  );
}
