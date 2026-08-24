"use client";

import { api } from "@mosty-repo/backend/convex/_generated/api";
import { Button } from "@mosty-repo/ui/components/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@mosty-repo/ui/components/card";
import { type IDetectedBarcode, Scanner } from "@yudiel/react-qr-scanner";
import { useMutation } from "convex/react";
import { CheckCircle2, QrCode, RefreshCw, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ScanPage() {
	const checkInTicket = useMutation(api.event.checkInTicket);

	const [scannedId, setScannedId] = useState<string | null>(null);
	const [status, setStatus] = useState<
		"idle" | "loading" | "success" | "error"
	>("idle");
	const [errorMessage, setErrorMessage] = useState<string>("");

	async function handleScan(detectedCodes: IDetectedBarcode[]) {
		if (status !== "idle" || detectedCodes.length === 0) return;

		const rawText = detectedCodes[0]?.rawValue || "";
		if (!rawText) return;

		let extractedId = rawText.trim();
		if (extractedId.includes("/")) {
			extractedId = extractedId.split("/").pop() || extractedId;
		}

		setScannedId(extractedId);
		setStatus("loading");

		try {
			const result = await checkInTicket({ ticketId: extractedId });

			if (result) {
				setStatus("success");
				toast.success("Ticket verified & marked as attended!");
			} else {
				setStatus("error");
				setErrorMessage("Invalid ticket or ID not found.");
				toast.error("Invalid ticket ID.");
			}
		} catch {
			setStatus("error");
			setErrorMessage("Failed to process check-in.");
			toast.error("Error updating ticket status.");
		}
	}

	function handleReset() {
		setStatus("idle");
		setScannedId(null);
		setErrorMessage("");
	}

	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
			<Card className="w-full max-w-sm text-center shadow-lg">
				<CardHeader>
					<CardTitle className="flex items-center justify-center gap-2 font-bold text-xl">
						<QrCode className="h-6 w-6" />
						Ticket Scanner
					</CardTitle>
				</CardHeader>

				<CardContent className="flex flex-col items-center gap-4">
					{/* Active Scanner View */}
					{status === "idle" && (
						<div className="w-full overflow-hidden rounded-xl border bg-black shadow-inner">
							<Scanner
								onScan={handleScan}
								onError={(error) => console.error("Scanner error:", error)}
								constraints={{ facingMode: "environment" }}
								components={{
									torch: true,
									finder: true,
								}}
								styles={{
									container: { width: "100%", height: "280px" },
								}}
							/>
						</div>
					)}

					{/* Loading State */}
					{status === "loading" && (
						<div className="flex flex-col items-center justify-center gap-3 py-12">
							<RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
							<p className="font-medium text-muted-foreground text-sm">
								Updating attendance...
							</p>
						</div>
					)}

					{/* Success State */}
					{status === "success" && (
						<div className="flex flex-col items-center gap-3 py-4">
							<div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
								<CheckCircle2 className="h-10 w-10" />
							</div>
							<h3 className="font-bold text-green-700 text-lg">Attended!</h3>
							<p className="break-all font-mono text-muted-foreground text-xs">
								ID: {scannedId}
							</p>
							<Button onClick={handleReset} className="mt-2 w-full gap-2">
								<RefreshCw className="h-4 w-4" /> Scan Next Ticket
							</Button>
						</div>
					)}

					{/* Error State */}
					{status === "error" && (
						<div className="flex flex-col items-center gap-3 py-4">
							<div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
								<XCircle className="h-10 w-10" />
							</div>
							<h3 className="font-bold text-lg text-red-600">Scan Failed</h3>
							<p className="text-muted-foreground text-sm">{errorMessage}</p>
							<Button
								onClick={handleReset}
								variant="outline"
								className="mt-2 w-full gap-2"
							>
								<RefreshCw className="h-4 w-4" /> Try Again
							</Button>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
