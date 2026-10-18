import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { ClearanceRosterRow, TermRef } from '@shared/types';
import { useToast } from '@/components/feedback';
import { PageError } from '@/components/feedback/PageState';
import { SkeletonPanel } from '@/components/feedback/Skeleton';
import { Button } from '@/components/ui/Button';
import { ChipGroup } from '@/components/ui/ChipGroup';
import { HistoryList } from '@/components/ui/HistoryList';
import { Icon } from '@/components/ui/Icon';
import { Pill } from '@/components/ui/Pill';
import { SegmentedTabs } from '@/components/ui/SegmentedTabs';
import { toApiError } from '@/api/client';
import { clearanceApi } from '@/api/clearance';
import { useApi } from '@/hooks/useApi';
import { clearanceCopy, clearanceHistoryItems, clearanceStatus, parseTermParam, termParam } from '@/utils/clearance';
import { formatTerm } from '@/utils/format';
import { Requirements } from './Requirements';

/** One student's clearance for one term: requirements, activity history, add requirement, set up (deck W51 to W56). */
function TermClearance({ studentId, name, term, onChanged }: { studentId: string; name: string; term: TermRef; onChanged: () => void }) {
  const toast = useToast();
  const [tab, setTab] = useState<'req' | 'log'>('req');
  const [settingUp, setSettingUp] = useState(false);
  // The student's roster row says whether this term is set up and gives the clearance id.
  const row = useApi(async () => {
    const roster = await clearanceApi.clearanceRoster(term.academicYear, term.semester, { q: studentId });
    return roster.students.find((r) => r.studentId === studentId) ?? null;
  }, [studentId, term.academicYear, term.semester]);
  const clearanceId = row.status === 'ready' ? (row.data?.clearance?.id ?? null) : null;
  const detail = useApi(() => (clearanceId === null ? Promise.resolve(null) : clearanceApi.staffClearance(clearanceId).then((r) => r.clearance)), [clearanceId]);
  const termText = formatTerm(term.academicYear, term.semester);

  if (row.status === 'loading' || (clearanceId !== null && detail.status === 'loading')) return <SkeletonPanel label="Loading clearance…" />;
  if (row.status === 'error' || detail.status === 'error') {
    const failed = row.status === 'error' ? row : detail;
    return <PageError page="this clearance" detail={failed.status === 'error' ? failed.error.message : undefined} onRetry={failed.reload} />;
  }
  const student: ClearanceRosterRow | null = row.data;
  const view = detail.status === 'ready' ? detail.data : null;
  const status = clearanceStatus(view);
  const reload = () => {
    row.reload();
    detail.reload();
    onChanged();
  };

  async function setUp() {
    setSettingUp(true);
    try {
      await clearanceApi.setUpClearance({ studentId, academicYear: term.academicYear, semester: term.semester });
      toast.show(clearanceCopy(name, termText).setUp, 'success');
      reload();
    } catch (error) {
      toast.show(toApiError(error).message, 'error');
    } finally {
      setSettingUp(false);
    }
  }

  return (
    <div aria-label={`Clearance, ${termText}`} className="flex flex-col gap-4">
      <p className="flex items-center gap-2 text-[13px] text-muted">
        Clearance status
        <Pill tone={status === 'Cleared' ? 'done' : status === 'In progress' ? 'pending' : 'neutral'}>{status}</Pill>
      </p>
      <SegmentedTabs
        label="Clearance sections"
        options={[
          { value: 'req', label: 'Requirements' },
          { value: 'log', label: 'Activity history' },
        ]}
        value={tab}
        onChange={(value) => setTab(value as 'req' | 'log')}
        className="flex w-full [&>button]:flex-1 [&>button]:justify-center"
      />

      {tab === 'req' ? (
        view ? (
          <Requirements view={view} name={student?.name ?? name} term={termText} onChanged={reload} />
        ) : (
          <div className="flex flex-col items-center gap-2 px-5 py-9 text-center text-muted">
            <Icon name="checklist" className="!text-[32px] text-disabled" />
            <p className="font-semibold text-body">No clearance set for this term</p>
            <p className="mb-2 text-[13px]">Add the standard requirements to start tracking.</p>
            <Button busy={settingUp} onClick={() => void setUp()}>
              Set up clearance
            </Button>
          </div>
        )
      ) : view && view.history.length > 0 ? (
        <HistoryList items={clearanceHistoryItems(view)} />
      ) : (
        <p className="text-[13px] text-muted">No changes recorded for this term.</p>
      )}
    </div>
  );
}

/**
 * The Clearance section of a staff student record (FINAL-POLISH-SPEC F6): term chips, the status of the chosen
 * term, then its requirements and history. The term lives in the address (`?tab=clr&term=2026-1`). The student's
 * name is not repeated: the record above already shows it.
 */
export function StudentClearance({ studentId, name, onChanged }: { studentId: string; name: string; onChanged: () => void }) {
  const [params, setParams] = useSearchParams();
  const terms = useApi(() => clearanceApi.clearanceTerms(), []);

  if (terms.status === 'loading') return <SkeletonPanel label="Loading terms…" />;
  if (terms.status === 'error') return <PageError page="Clearance" detail={terms.error.message} onRetry={terms.reload} />;

  const term = parseTermParam(params.get('term')) ?? terms.data.current;
  const options = [...terms.data.terms];
  if (!options.some((t) => termParam(t) === termParam(term))) options.unshift(term);
  const pickTerm = (value: string) => {
    const next = new URLSearchParams(params);
    next.set('term', value);
    setParams(next, { replace: true });
  };

  return (
    <div className="flex flex-col gap-4">
      <ChipGroup
        label="Term"
        options={options.map((t) => ({ value: termParam(t), label: formatTerm(t.academicYear, t.semester) }))}
        value={termParam(term)}
        onChange={pickTerm}
        className="gap-1.5"
      />
      <TermClearance key={`${studentId}-${termParam(term)}`} studentId={studentId} name={name} term={term} onChanged={onChanged} />
    </div>
  );
}
