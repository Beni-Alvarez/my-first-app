import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ApiError } from '../api/client';
import {
  emptySongForm,
  songFormSchema,
  type SongFormField,
  type SongFormValues,
} from '../schemas/song-form.schema';
import type { SongInput } from '../types/song';
import { ErrorMessage } from './ErrorMessage';
import styles from './SongForm.module.css';
import ui from './ui.module.css';

type FormErrors = Partial<Record<SongFormField, string>>;

interface SongFormProps {
  initialValues?: SongFormValues;
  submitLabel: string;
  cancelTo: string;
  isSubmitting: boolean;
  /** Error from the last save attempt, e.g. a 400 from the server. */
  submitError: unknown;
  onSubmit: (input: SongInput) => void;
}

export function SongForm({
  initialValues = emptySongForm,
  submitLabel,
  cancelTo,
  isSubmitting,
  submitError,
  onSubmit,
}: SongFormProps) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});

  // Field errors from the server are shown next to the matching input; anything else on top.
  const serverFieldErrors = submitError instanceof ApiError ? submitError.fieldErrors : {};
  const hasServerFieldErrors = Object.keys(serverFieldErrors).length > 0;
  const errorFor = (field: SongFormField) => errors[field] ?? serverFieldErrors[field]?.[0];

  function handleChange(field: SongFormField, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = songFormSchema.safeParse(values);
    if (!result.success) {
      const fieldErrors: FormErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as SongFormField;
        fieldErrors[field] ??= issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    onSubmit(result.data);
  }

  function fieldProps(field: SongFormField) {
    const error = errorFor(field);
    return {
      id: field,
      name: field,
      value: values[field],
      onChange: (event: { target: { value: string } }) => handleChange(field, event.target.value),
      'aria-invalid': error ? true : undefined,
      'aria-describedby': error ? `${field}-error` : undefined,
    };
  }

  function fieldError(field: SongFormField) {
    const error = errorFor(field);
    return error ? (
      <p id={`${field}-error`} className={styles.error}>
        {error}
      </p>
    ) : null;
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {submitError != null && !hasServerFieldErrors && <ErrorMessage error={submitError} />}

      <div className={styles.field}>
        <label htmlFor="title" className={styles.label}>
          Title
        </label>
        <input className={styles.input} autoComplete="off" {...fieldProps('title')} />
        {fieldError('title')}
      </div>

      <div className={styles.field}>
        <label htmlFor="artist" className={styles.label}>
          Artist
        </label>
        <input className={styles.input} autoComplete="off" {...fieldProps('artist')} />
        {fieldError('artist')}
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="album" className={styles.label}>
            Album <span className={styles.optional}>(optional)</span>
          </label>
          <input className={styles.input} autoComplete="off" {...fieldProps('album')} />
          {fieldError('album')}
        </div>

        <div className={styles.field}>
          <label htmlFor="year" className={styles.label}>
            Year <span className={styles.optional}>(optional)</span>
          </label>
          <input
            className={styles.input}
            inputMode="numeric"
            maxLength={4}
            autoComplete="off"
            {...fieldProps('year')}
          />
          {fieldError('year')}
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="lyrics" className={styles.label}>
          Lyrics
        </label>
        <textarea className={styles.textarea} {...fieldProps('lyrics')} />
        {fieldError('lyrics')}
      </div>

      <div className={ui.actions}>
        <button type="submit" className={`${ui.button} ${ui.primary}`} disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : submitLabel}
        </button>
        <Link to={cancelTo} className={ui.button}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
