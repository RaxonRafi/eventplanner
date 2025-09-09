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
import { useCreateEventMutation } from "@/redux/features/Event/event.api";


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
  packages: z.array(packageSchema).min(1, "At least one package is required"),
});


export function CreateEventForm() {
  const router = useRouter();
  const [createEvent, { isLoading }] = useCreateEventMutation();
  const form = useForm<z.infer<typeof eventSchema>>({
    resolver: zodResolver(eventSchema) as any,
    defaultValues: {
      title: "",
      description: "",
      date: "",
      location: "",
      capacity: 100,
      packages: [{ name: "Standard Pass", price: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "packages",
  });

  const onSubmit = async (data: z.infer<typeof eventSchema>) => {
    try {
      const payload = {
        ...data,
        packages: {
          create: data.packages.map((pkg: { name: any; price: any; }) => ({
            name: pkg.name,
            price: pkg.price,
          })),
        },
      };

      await createEvent(payload).unwrap();
      toast.success("Event created successfully!");
      router.push("/dashboard/events");
    } catch (error: any) {
      console.error(error);
      toast.error(error?.data?.message || "Failed to create event");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Event"}
        </Button>
      </form>
    </Form>
  );
}
