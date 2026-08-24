"use client";

import { api } from "@mosty-repo/backend/convex/_generated/api";
import { Button } from "@mosty-repo/ui/components/button";
import { Card, CardContent } from "@mosty-repo/ui/components/card";
import { useMutation } from "convex/react";
import { AlertTriangle, CheckCircle, Phone } from "lucide-react";
import Link from "next/link";
import { useQRCode } from "next-qrcode";
import { use, useEffect, useState } from "react";
import { CiInstagram } from "react-icons/ci";
import { FaTiktok, FaYoutube } from "react-icons/fa";
import { ImLocation } from "react-icons/im";

interface PageProps {
	params: Promise<{
		ticketId: string;
	}>;
}

export default function TicketCenterPage({ params }: PageProps) {
	const { ticketId } = use(params);
	const { Image } = useQRCode();

	const checkInTicket = useMutation(api.event.checkInTicket);

	const [loading, setLoading] = useState(true);
	const [isValidTicket, setIsValidTicket] = useState<boolean | null>(null);

	useEffect(() => {
		let isMounted = true;

		async function processCheckIn() {
			try {
				const result = await checkInTicket({ ticketId });
				if (isMounted) {
					setIsValidTicket(result !== null);
					setLoading(false);
				}
			} catch {
				if (isMounted) {
					setIsValidTicket(false);
					setLoading(false);
				}
			}
		}

		processCheckIn();

		return () => {
			isMounted = false;
		};
	}, [ticketId, checkInTicket]);

	// 1. Loading State
	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center p-4">
				<p className="animate-pulse font-medium text-muted-foreground text-sm">
					Checking in ticket...
				</p>
			</div>
		);
	}

	// 2. Invalid Ticket State
	if (!isValidTicket) {
		return (
			<div className="flex min-h-screen items-center justify-center p-4">
				<Card className="flex w-full max-w-sm flex-col items-center p-6 text-center shadow-lg">
					<CardContent className="flex w-full flex-col items-center gap-4 p-0">
						<div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
							<AlertTriangle className="h-6 w-6" />
						</div>

						<h2 className="font-bold text-red-600 text-xl">Invalid Ticket</h2>

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

	// 3. Valid Ticket State (Marked as Attended)
	return (
		<div className="flex min-h-screen items-center justify-center p-4">
			<Card className="flex w-full max-w-sm flex-col items-center p-6 text-center shadow-lg">
				<CardContent className="flex w-full flex-col items-center gap-6 p-0">
					{/* Attendance Status Badge */}
					<div className="flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 font-semibold text-green-700 text-xs">
						<CheckCircle className="h-4 w-4" />
						Attended
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
