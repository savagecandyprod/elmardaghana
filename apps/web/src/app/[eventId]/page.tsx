"use client";

import { api } from "@mosty-repo/backend/convex/_generated/api";
import type { Id } from "@mosty-repo/backend/convex/_generated/dataModel";
import { Button } from "@mosty-repo/ui/components/button";
import { Card, CardContent } from "@mosty-repo/ui/components/card";
import { useQuery } from "convex/react";
import { AlertTriangle, Phone } from "lucide-react";
import Link from "next/link";
import { useQRCode } from "next-qrcode";
import { use } from "react";
import { CiInstagram } from "react-icons/ci";
import { ImLocation } from "react-icons/im";
import { BackgroundLines } from "@/components/ui/background-lines";

interface PageProps {
	params: Promise<{
		eventId: string;
	}>;
}

export default function EventQRPage({ params }: PageProps) {
	const { eventId } = use(params);
	const { Image } = useQRCode();

	// Fetch ticket validation status from Convex backend
	const ticket = useQuery(api.event.getTicket, {
		ticketId: eventId as Id<"tickets">,
	});

	// Replace with your actual target location and phone number
	const locationUrl = "https://maps.app.goo.gl/z1SZvKvrwayL3pGx5";
	const phoneNumber = "01030268871";

	// 1. Loading State
	if (ticket === undefined) {
		return (
			<div className="flex min-h-screen items-center justify-center p-4">
				<p className="animate-pulse font-medium text-muted-foreground text-sm">
					Validating event pass...
				</p>
			</div>
		);
	}

	// 2. Invalid Ticket State
	if (ticket === null) {
		return (
			<div className="flex min-h-screen items-center justify-center p-4">
				<Card className="flex w-full max-w-sm flex-col items-center p-6 text-center shadow-lg">
					<CardContent className="flex w-full flex-col items-center gap-4 p-0">
						<div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
							<AlertTriangle className="h-6 w-6" />
						</div>

						<h2 className="font-bold text-red-600 text-xl">
							Invalid Event Pass
						</h2>

						<p className="text-muted-foreground text-sm">
							This ticket ID does not exist or is invalid.
						</p>

						<Link href="/" className="mt-2 w-full">
							<Button variant="outline" className="w-full">
								Create New Pass
							</Button>
						</Link>
					</CardContent>
				</Card>
			</div>
		);
	}

	// 3. Valid Ticket State
	return (
		<BackgroundLines className="flex min-h-screen flex-col items-center justify-center gap-6 p-4">
			{/* logo */}
			<h2 className="relative bg-gradient-to-b from-neutral-900 to-neutral-700 bg-clip-text py-2 text-center font-bold font-sans text-4xl text-transparent uppercase tracking-tight md:py-10 md:text-4xl lg:text-7xl dark:from-neutral-600 dark:to-white">
				elmardaghana.
			</h2>

			<Card className="z-50 flex w-full max-w-sm flex-col items-center bg-transparent p-6 text-center shadow-lg">
				<CardContent className="flex w-full flex-col items-center gap-6 p-0">
					{/* QR Code Container */}
					<div className="rounded-2xl border p-3 shadow-sm">
						<Image
							text={eventId}
							options={{
								type: "image/jpeg",
								quality: 0.3,
								errorCorrectionLevel: "M",
								margin: 2,
								scale: 4,
								width: 220,
								color: {
									dark: "#010599FF",
									light: "#FFBF60FF",
								},
							}}
						/>
					</div>

					{/* Social Media Links Row */}
					<div className="flex items-center justify-center gap-4 py-2">
						<a
							href="https://instagram.com/elmardaghana"
							target="_blank"
							rel="noreferrer"
							className="rounded-full bg-gray-100 p-2.5 text-gray-700 transition hover:bg-gray-200 hover:text-black"
						>
							<CiInstagram className="h-5 w-5 text-red-900" />
						</a>
					</div>

					{/* Action Buttons */}
					<div className="flex w-full flex-col gap-3">
						<a
							href={locationUrl}
							target="_blank"
							rel="noreferrer"
							className="w-full"
						>
							<Button className="w-full gap-2 font-medium text-sm" size="lg">
								<ImLocation className="h-4 w-4" />
								Location
							</Button>
						</a>

						<a href={`tel:${phoneNumber}`} className="w-full">
							<Button
								variant="outline"
								className="w-full gap-2 font-medium text-sm"
								size="lg"
							>
								<Phone className="h-4 w-4" />
								Phone Number
							</Button>
						</a>

						<div>
							<h1 className="text-gray-500 text-sm">
								استوديو نغم 12 شارع شركه الكهربيه خلف كليه هندسه الابرهيميه
							</h1>
						</div>
					</div>
				</CardContent>
			</Card>
		</BackgroundLines>
	);
}
