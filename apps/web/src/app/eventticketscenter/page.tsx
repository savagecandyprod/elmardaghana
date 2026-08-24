"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@mosty-repo/backend/convex/_generated/api";
import { Button } from "@mosty-repo/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@mosty-repo/ui/components/card";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@mosty-repo/ui/components/field";
import { Input } from "@mosty-repo/ui/components/input";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { useQRCode } from "next-qrcode";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const formSchema = z.object({
	phoneNumber: z
		.string()
		.length(11, "Must be exactly 11 digits.")
		.regex(/^\d+$/, "Must contain numbers only."),
});

export default function Home() {
	const [ticketId, setTicketId] = useState<string | null>(null);
	const addTicket = useMutation(api.event.addTicket);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			phoneNumber: "",
		},
	});

	async function onSubmit(data: z.infer<typeof formSchema>) {
		try {
			// Convert phone number string to number for Convex schema
			const id = await addTicket({
				phoneNumber: Number.parseInt(data.phoneNumber, 10),
			});

			setTicketId(id);
			toast.success("Ticket created successfully!");
		} catch (error) {
			let errorMessage = "An unexpected error occurred. Please try again.";

			if (error instanceof ConvexError) {
				errorMessage =
					typeof error.data === "string" ? error.data : errorMessage;
			} else if (error instanceof Error) {
				// Extracts clean message from Convex error output
				const match = error.message.match(/Uncaught Error: (.*?)\n/);
				errorMessage = match ? match[1] : error.message;
			}

			toast.error("Failed to create ticket", {
				description: errorMessage,
			});
		}
	}

	function handleReset() {
		form.reset();
		setTicketId(null);
	}

	const { Image } = useQRCode();

	return (
		<div className="flex flex-col items-center gap-6 p-4">
			<Card className="w-full sm:max-w-md">
				<CardHeader>
					<CardTitle>Phone Number</CardTitle>
					<CardDescription>
						Enter your 11-digit mobile number below.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form id="form-rhf-input" onSubmit={form.handleSubmit(onSubmit)}>
						<FieldGroup>
							<Controller
								name="phoneNumber"
								control={form.control}
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel htmlFor="form-rhf-input-phone">
											Phone Number
										</FieldLabel>
										<Input
											{...field}
											id="form-rhf-input-phone"
											type="text"
											inputMode="numeric"
											maxLength={11}
											aria-invalid={fieldState.invalid}
											placeholder="12345678901"
										/>
										<FieldDescription>
											Must be exactly 11 numeric digits.
										</FieldDescription>
										{fieldState.invalid && (
											<FieldError errors={[fieldState.error]} />
										)}
									</Field>
								)}
							/>
						</FieldGroup>
					</form>
				</CardContent>
				<CardFooter>
					<Field orientation="horizontal">
						<Button type="button" variant="outline" onClick={handleReset}>
							Reset
						</Button>
						<Button
							type="submit"
							form="form-rhf-input"
							disabled={form.formState.isSubmitting}
						>
							{form.formState.isSubmitting ? "Creating..." : "Save"}
						</Button>
					</Field>
				</CardFooter>
			</Card>

			{ticketId && (
				<Card className="flex flex-col items-center p-6 text-center">
					<CardTitle className="mb-2 font-medium text-sm">
						Your Ticket QR Code
					</CardTitle>
					<Image
						text={`http://localhost:3001/${ticketId}`}
						options={{
							type: "image/jpeg",
							quality: 0.3,
							errorCorrectionLevel: "M",
							margin: 3,
							scale: 4,
							width: 200,
							color: {
								dark: "#010599FF",
								light: "#FFBF60FF",
							},
						}}
					/>
					<CardDescription className="mt-2 font-mono text-xs">
						ID: {ticketId}
					</CardDescription>
				</Card>
			)}
		</div>
	);
}
