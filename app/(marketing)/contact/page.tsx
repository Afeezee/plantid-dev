"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

type FormState = { name: string; email: string; subject: string; message: string };

const EMPTY: FormState = { name: "", email: "", subject: "", message: "" };

export default function ContactPage() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const send = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Contact submission failed");
      return res.json();
    },
    onSuccess: () => setForm(EMPTY),
  });

  const update = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.message) {
      setFieldError("All fields are required.");
      return;
    }
    setFieldError(null);
    send.mutate();
  };

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <p className="stamp mb-6">Get in touch</p>
      <h1 className="text-4xl md:text-5xl leading-tight mb-4">
        Questions, feedback, or a plant we got wrong?
      </h1>
      <p className="text-parchment-200/70 max-w-xl mb-10">
        Drop us a note — we read every message. For account or billing issues,
        include the email address you signed up with.
      </p>

      {send.isSuccess ? (
        <div className="specimen-label">
          <p className="text-xs uppercase tracking-wider text-parchment-200/50">
            Message received
          </p>
          <p className="mt-2 text-parchment-200/80">
            Thanks — we&apos;ll be in touch by email, usually within a couple of
            working days.
          </p>
          <button
            type="button"
            onClick={() => send.reset()}
            className="mt-4 text-sm text-ochre-400 hover:text-ochre-300 underline underline-offset-4"
          >
            Send another message
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="specimen-label flex flex-col gap-4">
          <Field label="Name">
            <input
              value={form.name}
              onChange={update("name")}
              className="input-field"
              autoComplete="name"
              required
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              value={form.email}
              onChange={update("email")}
              className="input-field"
              autoComplete="email"
              required
            />
          </Field>
          <Field label="Subject">
            <input
              value={form.subject}
              onChange={update("subject")}
              className="input-field"
              required
            />
          </Field>
          <Field label="Message">
            <textarea
              value={form.message}
              onChange={update("message")}
              rows={5}
              className="input-field resize-y"
              required
            />
          </Field>

          {(fieldError || send.isError) && (
            <p className="text-rust-400 text-sm">
              {fieldError ?? "Couldn't send your message — please try again."}
            </p>
          )}

          <button
            type="submit"
            disabled={send.isPending}
            className="mt-2 btn-primary py-3"
          >
            {send.isPending ? "Sending…" : "Send message"}
          </button>
        </form>
      )}

    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-xs uppercase tracking-wider text-parchment-200/50">
        {label}
      </span>
      {children}
    </label>
  );
}
