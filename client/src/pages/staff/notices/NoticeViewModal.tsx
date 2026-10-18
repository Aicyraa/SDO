import { useState } from 'react';
import type { NoticeView } from '@shared/types';
import { ConfirmModal, FormModal, useToast } from '@/components/feedback';
import { Button } from '@/components/ui/Button';
import { DetailTable } from '@/components/ui/DetailTable';
import { Icon } from '@/components/ui/Icon';
import { toApiError } from '@/api/client';
import { noticesApi } from '@/api/notices';
import { noticeFacts, noticeToasts } from '@/utils/notices';

/** One notice, read only, with Edit and Remove (FINAL-POLISH-SPEC F3). Edit hands over to the form dialog. */
export function NoticeViewModal({ notice, onEdit, onClose, onRemoved }: { notice: NoticeView; onEdit: () => void; onClose: () => void; onRemoved: () => void }) {
  const toast = useToast();
  const [removing, setRemoving] = useState(false);
  const facts = noticeFacts(notice);
  return (
    <>
      <FormModal
        open={!removing}
        icon="campaign"
        title={notice.title}
        subtitle={notice.expired ? 'Expired: students no longer see it.' : 'Active: shown in every student’s bell and inbox.'}
        onClose={onClose}
        maxWidth="max-w-[600px]"
        footer={
          <>
            <Button variant="danger" onClick={() => setRemoving(true)}>
              <Icon name="delete" className="!text-xl" />
              Remove notice
            </Button>
            <Button variant="neutral" onClick={onEdit}>
              <Icon name="edit" className="!text-xl" />
              Edit notice
            </Button>
          </>
        }
      >
        <DetailTable
          rows={[
            { label: 'Published', value: facts.published },
            { label: 'Visible until', value: facts.until },
            { label: 'Sent to', value: facts.reach },
            { label: 'Message', value: <span className="whitespace-pre-line">{notice.message}</span> },
            ...(notice.instructions ? [{ label: 'Instructions and reminders', value: <span className="whitespace-pre-line">{notice.instructions}</span> }] : []),
            ...(facts.edited ? [{ label: 'Edited', value: facts.edited }] : []),
          ]}
        />
      </FormModal>
      <ConfirmModal
        open={removing}
        tone="danger"
        title="Remove this notice?"
        description={`“${notice.title}” is taken down from every student’s bell and inbox. The removal is recorded. Emails already sent cannot be taken back.`}
        confirmLabel="Remove notice"
        onClose={() => setRemoving(false)}
        onConfirm={async () => {
          try {
            await noticesApi.removeNotice(notice.id);
          } catch (error) {
            throw new Error(toApiError(error).message);
          }
          setRemoving(false);
          toast.show(noticeToasts.removed, 'success');
          onRemoved();
        }}
      />
    </>
  );
}
