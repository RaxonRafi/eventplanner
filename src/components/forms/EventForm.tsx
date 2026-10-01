"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PLATFORM_FEE_RATE } from "@/lib/fees";
import {
  useCreateEventMutation,
  useUpdateEventMutation,
  useUploadBannerMutation,
} from "@/redux/features/Event/event.api";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus, Info, Loader2, Lock, Plus, Trash2, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const packageSchema = z.object({
  id: z.string().optional(),
  bookings: z.number().optional(), // edit mode: packages with bookings can't be removed
  name: z.string().trim().min(2, "Package name is required"),
  price: z.number({ message: "Price must be a number" }).positive("Price must be greater than 0"),
});

const eventSchema = z.object({
  title: z.string().trim().min(3, "Title is required"),
  description: z.string().trim().min(10, "Description must be at least 10 characters"),
  date: z
    .string()
    .min(1, "Date is required")
    .refine((v) => !Number.isNaN(new Date(v).getTime()), "Invalid date"),
  location: z.string().trim().min(2, "Location is required"),
  capacity: z.number({ message: "Capacity must be a number" }).int().positive("Capacity must be greater than 0"),
  bannerImage: z.string().optional(),
  packages: z.array(packageSchema).min(1, "At least one package is required"),
});

type EventFormValues = z.infer<typeof eventSchema>;

export type EditableEvent = {
  id: string;
  title: string;
  description: string | null;
  date: string; // ISO
  location: string;
  capacity: number | null;
  bannerImage: string | null;
  status: string;
  confirmedBookings: number;
  packages: { id: string; name: string; price: number; bookings: number }[];
};

/** ISO timestamp -> value for <input type="datetime-local"> in the viewer's timezone. */
function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function EventForm({ event }: { event?: EditableEvent }) {
  const isEdit = Boolean(event);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [createEvent, { isLoading: creating }] = useCreateEventMutation();
  const [updateEvent, { isLoading: updating }] = useUpdateEventMutation();
  const [uploadBanner, { isLoading: isUploading }] = useUploadBannerMutation();
  const saving = creating || updating;

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: event
      ? {
          title: event.title,
          description: event.description ?? "",
          date: toLocalInput(event.date),
          location: event.location,
          capacity: event.capacity ?? 100,
          bannerImage: event.bannerImage ?? "",
          packages: event.packages.map((p) => ({ id: p.id, name: p.name, price: p.price, bookings: p.bookings })),
        }
      : {
          title: "",
          description: "",
          date: "",
          location: "",
          capacity: 100,
          bannerImage: "",
          packages: [{ name: "Standard Pass", price: 500 }],
        },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "packages" });
  const watchedPackages = form.watch("packages");
  const bannerImage = form.watch("bannerImage");

  const handleBannerSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Please select an image file");
    if (file.size > 5 * 1024 * 1024) return toast.error("Image must be less than 5MB");

    setPreviewUrl(URL.createObjectURL(file));
    const formData = new FormData();
    formData.append("file", file);
    try {
      const result = await uploadBanner(formData).unwrap();
      form.setValue("bannerImage", result.url, { shouldDirty: true });
      toast.success("Banner uploaded");
    } catch (err) {
      const e = err as { data?: { error?: string } };
      toast.error(e?.data?.error || "Failed to upload banner");
      setPreviewUrl(null);
    }
  };

  const clearBanner = () => {
    form.setValue("bannerImage", "", { shouldDirty: true });
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = async (data: EventFormValues) => {
    const payload = {
      title: data.title,
      description: data.description,
      // datetime-local has no timezone — send an exact instant so the server doesn't guess
      date: new Date(data.date).toISOString(),
      location: data.location,
      capacity: data.capacity,
      bannerImage: data.bannerImage || null,
      packages: data.packages.map(({ id, name, price }) => ({ ...(id ? { id } : {}), name, price })),
    };
    try {
      if (event) {
        await updateEvent({ id: event.id, ...payload }).unwrap();
        toast.success("Event updated");
      } else {
        await createEvent(payload).unwrap();
        toast.success("Event created — it will go live once an admin approves it.");
      }
      router.push("/dashboard/events");
    } catch (err) {
      const e = err as { data?: { error?: string } };
      toast.error(e?.data?.error || `Failed to ${isEdit ? "update" : "create"} event`);
    }
  };

  const banner = previewUrl || bannerImage;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start"
      >
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basics</CardTitle>
              <CardDescription>What attendees see first.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Dhaka Tech Conference 2026" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="What's the event about? Who is it for? What's included?"
                        rows={6}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Date & venue</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date & time</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        {...field}
                        value={Number.isNaN(field.value) ? "" : field.value}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    {event && event.confirmedBookings > 0 && (
                      <FormDescription>
                        {event.confirmedBookings} seats already booked — can&apos;t go lower.
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Venue name, city" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tickets</CardTitle>
              <CardDescription>Offer one or more packages, e.g. General and VIP.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {fields.map((pkg, index) => {
                const price = watchedPackages?.[index]?.price;
                const bookings = watchedPackages?.[index]?.bookings ?? 0;
                return (
                  <div key={pkg.id} className="rounded-xl border p-4">
                    <div className="flex flex-wrap items-start gap-3">
                      <FormField
                        control={form.control}
                        name={`packages.${index}.name`}
                        render={({ field }) => (
                          <FormItem className="min-w-40 flex-1">
                            <FormLabel className="text-xs text-muted-foreground">Package name</FormLabel>
                            <FormControl>
                              <Input placeholder="General Admission" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`packages.${index}.price`}
                        render={({ field }) => (
                          <FormItem className="w-40">
                            <FormLabel className="text-xs text-muted-foreground">Price (BDT)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min={0}
                                {...field}
                                value={Number.isNaN(field.value) ? "" : field.value}
                                onChange={(e) => field.onChange(e.target.valueAsNumber)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="mt-6 text-muted-foreground hover:text-destructive"
                        disabled={fields.length === 1 || bookings > 0}
                        onClick={() => remove(index)}
                        aria-label="Remove package"
                        title={bookings > 0 ? "This package has bookings" : "Remove package"}
                      >
                        {bookings > 0 ? <Lock className="size-4" /> : <Trash2 className="size-4" />}
                      </Button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-4 text-xs text-muted-foreground">
                      {price > 0 && (
                        <span>
                          You receive{" "}
                          <span className="font-medium text-foreground">
                            BDT {(price * (1 - PLATFORM_FEE_RATE)).toFixed(2)}
                          </span>{" "}
                          per booking
                        </span>
                      )}
                      {bookings > 0 && <span>{bookings} booking(s) — can be renamed or repriced, not removed</span>}
                    </div>
                  </div>
                );
              })}
              <Button
                type="button"
                variant="outline"
                className="w-full border-dashed"
                disabled={fields.length >= 10}
                onClick={() => append({ name: "", price: NaN })}
              >
                <Plus className="size-4" /> Add package
              </Button>
              <p className="flex items-start gap-2 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
                <Info className="mt-0.5 size-3.5 shrink-0" />
                A {PLATFORM_FEE_RATE * 100}% platform fee is deducted from every booking. Attendees pay the
                price shown; you receive the remaining {100 - PLATFORM_FEE_RATE * 100}%.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Side column */}
        <div className="space-y-6 lg:sticky lg:top-20">
          <Card>
            <CardHeader>
              <CardTitle>Banner</CardTitle>
              <CardDescription>JPEG, PNG, WebP or GIF, up to 5MB.</CardDescription>
            </CardHeader>
            <CardContent>
              {banner ? (
                <div className="relative aspect-[16/10] overflow-hidden rounded-xl border">
                  <Image src={banner} alt="Event banner preview" fill className="object-cover" />
                  {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                      <Loader2 className="size-6 animate-spin" />
                    </div>
                  )}
                  <div className="absolute right-2 top-2 flex gap-1.5">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      Change
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="secondary"
                      className="size-8"
                      onClick={clearBanner}
                      aria-label="Remove banner"
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex aspect-[16/10] w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted/50"
                >
                  {isUploading ? <Loader2 className="size-8 animate-spin" /> : <ImagePlus className="size-8" />}
                  <span className="text-sm">{isUploading ? "Uploading…" : "Upload banner image"}</span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleBannerSelect}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 pt-6">
              <Button type="submit" className="h-11 w-full" disabled={saving || isUploading}>
                {saving && <Loader2 className="size-4 animate-spin" />}
                {isEdit ? (saving ? "Saving…" : "Save changes") : saving ? "Creating…" : "Create event"}
              </Button>
              <Button type="button" variant="ghost" className="w-full" onClick={() => router.back()}>
                Cancel
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                {isEdit
                  ? event?.status === "REJECTED"
                    ? "Saving resubmits this event for admin review."
                    : "Changes go live immediately."
                  : "New events are reviewed by an admin before they're published."}
              </p>
            </CardContent>
          </Card>
        </div>
      </form>
    </Form>
  );
}
