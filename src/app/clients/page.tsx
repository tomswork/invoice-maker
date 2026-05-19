"use client";

import { useMutation, useQuery } from "convex/react";
import { FormEvent, useState } from "react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export default function ClientsPage() {
  const clients = useQuery(api.clients.list);
  const createClient = useMutation(api.clients.create);
  const removeClient = useMutation(api.clients.remove);

  const [contactName, setContactName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await createClient({
        contactName: contactName.trim(),
        companyName: companyName.trim(),
        email: email.trim() || undefined,
      });
      setContactName("");
      setCompanyName("");
      setEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add client.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Clients</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Save clients once and reuse them on every invoice.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm"
      >
        <h2 className="mb-4 text-lg font-semibold">Add client</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="contactName">Contact name</Label>
            <Input
              id="contactName"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Diana Williams"
              required
            />
          </div>
          <div>
            <Label htmlFor="companyName">Company</Label>
            <Input
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Fernwood Fitness"
              required
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="email">Email (optional)</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        <Button type="submit" className="mt-4" disabled={saving}>
          {saving ? "Saving…" : "Add client"}
        </Button>
      </form>

      <section className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-800 bg-zinc-800/60 text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-medium">Contact</th>
              <th className="px-4 py-3 font-medium">Company</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {clients?.map((client) => (
              <tr key={client._id} className="border-b border-zinc-800 last:border-0">
                <td className="px-4 py-3 font-medium">{client.contactName}</td>
                <td className="px-4 py-3 text-zinc-400">{client.companyName}</td>
                <td className="px-4 py-3 text-zinc-400">{client.email ?? "—"}</td>
                <td className="px-4 py-3 text-right">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => void removeClient({ id: client._id })}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
            {clients?.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-zinc-500">
                  No clients yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
