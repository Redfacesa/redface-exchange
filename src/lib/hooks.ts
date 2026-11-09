import { useEffect, useState, FormEvent } from 'react';
import { errMsg } from './util';

/** Load data once when a component mounts. Failures fall back to the initial value. */
export function useLoad<T>(fn: () => Promise<T>, initial: T): T {
  const [v, setV] = useState<T>(initial);
  useEffect(() => {
    let live = true;
    fn().then((r) => { if (live) setV(r); }).catch(() => undefined);
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return v;
}

export type FormState = { s: 'idle' | 'sending' | 'done' | 'error'; msg: string };

/** Shared submit handling for the public forms. */
export function useForm(action: (data: Record<string, string>, form: HTMLFormElement) => Promise<void>) {
  const [st, setSt] = useState<FormState>({ s: 'idle', msg: '' });
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(Array.from(new FormData(form).entries()).filter(([, v]) => typeof v === 'string')) as Record<string, string>;
    setSt({ s: 'sending', msg: '' });
    action(data, form).then(
      () => setSt({ s: 'done', msg: '' }),
      (er: unknown) => setSt({ s: 'error', msg: errMsg(er) })
    );
  };
  return { st, onSubmit };
}
