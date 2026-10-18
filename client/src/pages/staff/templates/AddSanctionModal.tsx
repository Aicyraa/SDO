import { useState } from 'react';
import { FormModal, useToast } from '@/components/feedback';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Textarea } from '@/components/ui/Textarea';
import { toApiError } from '@/api/client';
import { templatesApi } from '@/api/templates';
import { MAX_SANCTION_DESCRIPTION, MAX_SANCTION_NAME, sanctionErrors, type SanctionDraft, type SanctionErrors } from '@/validators/sanction';

/** Add sanction, as a dialog over the Sanction templates list (FINAL-POLISH-SPEC F7). */
export function AddSanctionModal({ existingNames, onClose, onAdded }: { existingNames: readonly string[]; onClose: () => void; onAdded: (sanctionId: number) => void }) {
  const toast = useToast();
  const [draft, setDraft] = useState<SanctionDraft>({ name: '', description: '' });
  const [errors, setErrors] = useState<SanctionErrors>({});
  const [busy, setBusy] = useState(false);
  const set = (key: keyof SanctionDraft, value: string) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  async function save() {
    const found = sanctionErrors(draft, existingNames);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }
    setBusy(true);
    const name = draft.name.trim();
    try {
      const { template } = await templatesApi.createSanction({ sanctionType: name, description: draft.description.trim() });
      toast.show(`${name} added.`, 'success');
      onAdded(template.sanctionId);
    } catch (caught) {
      const failure = toApiError(caught);
      if (failure.code === 'sanction_exists') setErrors({ name: failure.message });
      else toast.show(failure.message, 'error');
      setBusy(false);
    }
  }

  const problems = Object.keys(errors).length > 0;
  return (
    <FormModal
      open
      icon="folder_managed"
      title="Add sanction"
      subtitle="Adds a sanction the handbook can use. Attach its template and requirements afterwards."
      busy={busy}
      onClose={onClose}
      footer={
        <>
          <Button variant="neutral" disabled={busy} onClick={onClose}>
            Cancel
          </Button>
          <Button busy={busy} onClick={() => void save()}>
            Add sanction
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {problems ? <Alert tone="error">Check the highlighted fields and try again.</Alert> : null}
        <Field label="Sanction name" placeholder="e.g. Community Service" maxLength={MAX_SANCTION_NAME} value={draft.name} error={errors.name} onChange={(event) => set('name', event.target.value)} />
        <Textarea
          label="Description"
          rows={4}
          maxLength={MAX_SANCTION_DESCRIPTION}
          placeholder="What the student has to do or receive."
          value={draft.description}
          error={errors.description}
          onChange={(event) => set('description', event.target.value)}
        />
      </div>
    </FormModal>
  );
}
