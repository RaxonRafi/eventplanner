"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateEventMutation,
  useUploadBannerMutation,
} from "@/redux/features/Event/event.api";
import Image from "next/image";
import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";

const packageSchema = z.object({
  name: z.string().min(2, { message: "Package name is required" }),
  price: z
    .number({ message: "Price must be a number" })
    .positive("Price must be greater than 0"),
});

const eventSchema = z.object({
  title: z.string().min(3, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  date: z.string().min(1, "Date is required"),
  location: z.string().min(3, "Location is required"),
  capacity: z.coerce.number().positive("Capacity must be greater than 0"),
  bannerImage: z.string().optional(),
  packages: z.array(packageSchema).min(1, "At least one package is required"),
});

export function CreateEventForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [createEvent, { isLoading }] = useCreateEventMutation();
  const [uploadBanner, { isLoading: isUploading }] = useUploadBannerMutation();

  const form = useForm<z.infer<typeof eventSchema>>({
    resolver: zodResolver(eventSchema) as any,
    defaultValues: {
      title: "",
      description: "",
      date: "",
      location: "",
      capacity: 100,
      bannerImage: "",
      packages: [{ name: "Standard Pass", price: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "packages",
  });

  const handleBannerSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setPreviewUrl(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("file", file);

    try {
      const result = await uploadBanner(formData).unwrap();
      form.setValue("bannerImage", result.url);
      toast.success("Banner uploaded");
    } catch {
      toast.error("Failed to upload banner");
      setPreviewUrl(null);
    }
  };

  const clearBanner = () => {
    form.setValue("bannerImage", "");
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = async (data: z.infer<typeof eventSchema>) => {
    try {
      const payload = {
        title: data.title,
        description: data.description,
        date: data.date,
        location: data.location,
        capacity: data.capacity,
        bannerImage: data.bannerImage || undefined,
        packages: {
          create: data.packages.map((pkg) => ({
            name: pkg.name,
            price: pkg.price,
          })),
        },
      };

      await createEvent(payload).unwrap();
      toast.success("Event created successfully! It will be reviewed by an admin.");
      router.push("/dashboard/events");
    } catch (error: any) {
      console.error(error);
      toast.error(error?.data?.message || "Failed to create event");
    }
  };

  const bannerImage = form.watch("bannerImage");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Banner Upload */}
        <FormItem>
          <FormLabel>Event Banner</FormLabel>
          <div className="space-y-3">
            {(previewUrl || bannerImage) ? (
              <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                <Image
                  src={previewUrl || bannerImage!}
                  alt="Event banner preview"
                  fill
                  className="object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 size-8"
                  onClick={clearBanner}
                >
                  <X className="size-4" />
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <ImagePlus className="size-10 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">
                  {isUploading ? "Uploading..." : "Click to upload banner image"}
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  JPEG, PNG, WebP or GIF • Max 5MB
                </span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleBannerSelect}
            />
          </div>
        </FormItem>

        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Tech Conference 2025" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your event..."
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Date */}
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date & Time</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Location */}
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="Grand Hall, City Center" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Capacity */}
        <FormField
          control={form.control}
          name="capacity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Capacity</FormLabel>
              <FormControl>
                <Input type="number" min={1} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Packages */}
        <div>
          <FormLabel>Packages</FormLabel>
          <div className="space-y-3 mt-2">
            {fields.map((pkg, index) => (
              <div key={pkg.id} className="flex items-center gap-3">
                <FormField
                  control={form.control}
                  name={`packages.${index}.name`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input placeholder="Standard Pass" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`packages.${index}.price`}
                  render={({ field }) => (
                    <FormItem className="w-32">
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="49.99"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => remove(index)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            className="mt-3"
            onClick={() => append({ name: "", price: 0 })}
          >
            + Add Package
          </Button>
        </div>

        {/* Submit */}
        <Button type="submit" className="w-full" disabled={isLoading || isUploading}>
          {isLoading ? "Creating..." : "Create Event"}
        </Button>
      </form>
    </Form>
  );
}
