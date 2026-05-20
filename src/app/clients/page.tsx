"use client";

import { useMutation, useQuery } from "convex/react";
import { FormEvent, Fragment, useState } from "react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";

type Client = {
  _id: Id<"clients">;
  contactName: string;
  companyName: string;
  address?: string;
  email?: string;
};

function emptyForm() {
  return { contactName: "", companyName: "", address: "", email: "" };
}

export default function ClientsPage() {
  const clients = useQuery(api.clients.list);
  const createClient = useMutation(api.clients.create);
  const updateClient = useMutation(api.clients.update);
  const removeClient = useMutation(api.clients.remove);

  const [contactName, setContactName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<Id<"clients"> | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  function startEdit(client: Client) {
    setEditingId(client._id);
    setEditForm({
      contactName: client.contactName,
      companyName: client.companyName,
      address: client.address ?? "",
      email: client.email ?? "",
    });
    setEditError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm(emptyForm());
    setEditError(null);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await createClient({
        contactName: contactName.trim(),
        companyName: companyName.trim(),
        address: address.trim(),
        email: email.trim() || undefined,
      });
      setContactName("");
      setCompanyName("");
      setAddress("");
      setEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add client.");
    } finally {
      setSaving(false);
    }
  }

  async function onEditSubmit(event: FormEvent) {
    event.preventDefault();
    if (!editingId) return;
    setEditSaving(true);
    setEditError(null);
    try {
      await updateClient({
        id: editingId,
        contactName: editForm.contactName.trim(),
        companyName: editForm.companyName.trim(),
        address: editForm.address.trim(),
        email: editForm.email.trim() || undefined,
      });
      cancelEdit();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Could not save client.");
    } finally {
      setEditSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Clients</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Save clients once and reuse them on invoices and contracts.
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
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Level 1, 49 Elizabeth street, Richmond 3121"
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
              <th className="px-4 py-3 font-medium">Address</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {clients?.map((client) => (
              <Fragment key={client._id}>
                <tr className="border-b border-zinc-800 last:border-0">
                  <td className="px-4 py-3 font-medium">{client.contactName}</td>
                  <td className="px-4 py-3 text-zinc-400">{client.companyName}</td>
                  <td className="whitespace-pre-line px-4 py-3 text-zinc-400">
                    {client.address?.trim() || "—"}
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{client.email ?? "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => startEdit(client)}
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => void removeClient({ id: client._id })}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
                {editingId === client._id && (
                  <tr className="border-b border-zinc-800 bg-zinc-950/50">
                    <td colSpan={5} className="px-4 py-4">
                      <form onSubmit={onEditSubmit}>
                        <p className="mb-3 text-sm font-medium text-zinc-200">
                          Edit client
                        </p>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <Label htmlFor={`edit-contact-${client._id}`}>
                              Contact name
                            </Label>
                            <Input
                              id={`edit-contact-${client._id}`}
                              value={editForm.contactName}
                              onChange={(e) =>
                                setEditForm((f) => ({
                                  ...f,
                                  contactName: e.target.value,
                                }))
                              }
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor={`edit-company-${client._id}`}>
                              Company
                            </Label>
                            <Input
                              id={`edit-company-${client._id}`}
                              value={editForm.companyName}
                              onChange={(e) =>
                                setEditForm((f) => ({
                                  ...f,
                                  companyName: e.target.value,
                                }))
                              }
                              required
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <Label htmlFor={`edit-address-${client._id}`}>
                              Address
                            </Label>
                            <Textarea
                              id={`edit-address-${client._id}`}
                              rows={2}
                              value={editForm.address}
                              onChange={(e) =>
                                setEditForm((f) => ({
                                  ...f,
                                  address: e.target.value,
                                }))
                              }
                              required
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <Label htmlFor={`edit-email-${client._id}`}>
                              Email (optional)
                            </Label>
                            <Input
                              id={`edit-email-${client._id}`}
                              type="email"
                              value={editForm.email}
                              onChange={(e) =>
                                setEditForm((f) => ({
                                  ...f,
                                  email: e.target.value,
                                }))
                              }
                            />
                          </div>
                        </div>
                        {editError && (
                          <p className="mt-3 text-sm text-red-400">{editError}</p>
                        )}
                        <div className="mt-4 flex gap-2">
                          <Button type="submit" disabled={editSaving}>
                            {editSaving ? "Saving…" : "Save"}
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={cancelEdit}
                            disabled={editSaving}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
            {clients?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
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
