"use client";
import dynamic from "next/dynamic";
import "easymde/dist/easymde.min.css";
import axios from "axios";
import { Button, Callout, Text, TextField } from "@radix-ui/themes";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { createIssueSchema } from "@/app/validationSchemas";
import { z } from "zod";
import ErrorMessage from "@/app/components/ErrorMessage";
import Spinner from "@/app/components/Spinner";

const SimpleMDE = dynamic(
	() => import("react-simplemde-editor"),
	{ ssr: false }
);

type IssueForm = z.infer<typeof createIssueSchema>;

const NewIssuePage = () => {
  const router = useRouter();
  const [error, setError] = useState<null | string>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<IssueForm>({
    resolver: zodResolver(createIssueSchema),
  });

  const onSubmit = handleSubmit(async (data) => {
    //Seperation of concerns improvement here. However there is no reuse of logic in the app.
      try {
        setIsSubmitting(true);
        await axios.post("/api/issues", data);
        setIsSubmitting(false);
        router.push("/issues");
      } catch (error) {
        setIsSubmitting(false);
        setError("An unexpected error occured.");
      }
    })
  

  return (
    <div className="max-w-xl">
      {error && (
        <Callout.Root color="red" className="mb-5">
          <Callout.Text>{error}</Callout.Text>
        </Callout.Root>
      )}
      <form
        className="space-y-5"
        onSubmit={onSubmit}
      >
        <TextField.Root>
          <TextField.Input placeholder="Title" {...register("title")} />
        </TextField.Root>
        <ErrorMessage>{errors.title?.message}</ErrorMessage>
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <SimpleMDE placeholder="Description" {...field} />
          )}
        />
        <ErrorMessage>{errors.description?.message}</ErrorMessage>
        <Button disabled={isSubmitting}>
          Submit New Issue{isSubmitting && <Spinner />}
        </Button>
      </form>
    </div>
  );
};

export default NewIssuePage;
