"use client";

import { useMutation, useQuery } from "convex/react";
import { FormEvent, useEffect, useState } from "react";
import { api } from "../../../convex/_generated/api";
import { SignOutButton } from "@/components/sign-out-button";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";

export default function SettingsPage() {
  const business = useQuery(api.business.get);
  const upsert = useMutation(api.business.upsert);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    abn: "",
    accountName: "",
    bsb: "",
    accountNumber: "",
    defaultRateDollars: "120",
    gstRegistered: false,
    cardSurchargePercent: "1.75",
    payOnlineUrl: "",
    thankYouLine1: "",
    thankYouLine2: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!business) return;
    setForm({
      name: business.name,
      phone: business.phone,
      email: business.email,
      abn: business.abn,
      accountName: business.accountName,
      bsb: business.bsb,
      accountNumber: business.accountNumber,
      defaultRateDollars: String(business.defaultRateCents / 100),
      gstRegistered: business.gstRegistered,
      cardSurchargePercent: String(business.cardSurchargePercent),
      payOnlineUrl: business.payOnlineUrl ?? "",
      thankYouLine1: business.thankYouLine1,
      thankYouLine2: business.thankYouLine2,
    });
  }, [business]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setSaved(false);
    await upsert({
      name: form.name,
      phone: form.phone,
      email: form.email,
      abn: form.abn,
      accountName: form.accountName,
      bsb: form.bsb,
      accountNumber: form.accountNumber,
      defaultRateCents: Math.round(Number(form.defaultRateDollars) * 100),
      gstRegistered: form.gstRegistered,
      cardSurchargePercent: Number(form.cardSurchargePercent),
      payOnlineUrl: form.payOnlineUrl.trim() || undefined,
      thankYouLine1: form.thankYouLine1,
      thankYouLine2: form.thankYouLine2,
    });
    setSaving(false);
    setSaved(true);
  }

  if (business === undefined) {
    return <p className="text-sm text-zinc-500">Loading settings…</p>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Business settings</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Your details appear on every invoice. Update them once here.
        </p>
      </div>
      <form onSubmit={onSubmit} className="space-y-6 rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="name">Your name</Label>
            <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="abn">ABN</Label>
            <Input id="abn" value={form.abn} onChange={(e) => setForm({ ...form, abn: e.target.value })} required />
          </div>
          <div>
            <Label htmlFor="defaultRate">Default hourly rate ($)</Label>
            <Input id="defaultRate" type="number" min={0} value={form.defaultRateDollars} onChange={(e) => setForm({ ...form, defaultRateDollars: e.target.value })} required />
          </div>
          <div>
            <Label htmlFor="surcharge">Card surcharge (%)</Label>
            <Input id="surcharge" type="number" step="0.01" value={form.cardSurchargePercent} onChange={(e) => setForm({ ...form, cardSurchargePercent: e.target.value })} required />
          </div>
          <div>
            <Label htmlFor="accountName">Account name</Label>
            <Input id="accountName" value={form.accountName} onChange={(e) => setForm({ ...form, accountName: e.target.value })} required />
          </div>
          <div>
            <Label htmlFor="bsb">BSB</Label>
            <Input id="bsb" value={form.bsb} onChange={(e) => setForm({ ...form, bsb: e.target.value })} required />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="accountNumber">Account number</Label>
            <Input id="accountNumber" value={form.accountNumber} onChange={(e) => setForm({ ...form, accountNumber: e.target.value })} required />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="payOnlineUrl">Pay online URL (optional)</Label>
            <Input id="payOnlineUrl" value={form.payOnlineUrl} onChange={(e) => setForm({ ...form, payOnlineUrl: e.target.value })} />
          </div>
          <div className="sm:col-span-2 flex items-center gap-2">
            <input id="gst" type="checkbox" checked={form.gstRegistered} onChange={(e) => setForm({ ...form, gstRegistered: e.target.checked })} />
            <Label htmlFor="gst" className="mb-0">GST registered (show on invoice)</Label>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="thank1">Thank you line 1</Label>
            <Textarea id="thank1" rows={2} value={form.thankYouLine1} onChange={(e) => setForm({ ...form, thankYouLine1: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="thank2">Thank you line 2</Label>
            <Textarea id="thank2" rows={2} value={form.thankYouLine2} onChange={(e) => setForm({ ...form, thankYouLine2: e.target.value })} />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save settings"}</Button>
          {saved && <span className="text-sm text-green-400">Saved</span>}
        </div>
      </form>

      <div className="mt-12 border-t border-zinc-800 pt-8">
        <h2 className="mb-2 text-sm font-medium text-zinc-300">Session</h2>
        <p className="mb-4 text-sm text-zinc-500">
          Clear the saved password cookie on this device.
        </p>
        <SignOutButton />
      </div>
    </div>
  );
}
