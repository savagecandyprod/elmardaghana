import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getTicket = query({
	args: { ticketId: v.string() },
	handler: async (ctx, args) => {
		// 1. Check if the string is a valid Convex ID for table "tickets"
		const normalizedId = ctx.db.normalizeId("tickets", args.ticketId);

		if (!normalizedId) {
			return null; // Invalid ID format (prevents runtime throw)
		}

		// 2. Fetch ticket safely
		const ticket = await ctx.db.get(normalizedId);

		if (!ticket?.attended) {
			return ticket;
		}
	},
});

export const addTicket = mutation({
	args: { phoneNumber: v.number() },
	handler: async (ctx, args) => {
		// 1. Check if a ticket with this phone number already exists
		const existingTicket = await ctx.db
			.query("tickets")
			.withIndex("by_phoneNumber", (q) => q.eq("phoneNumber", args.phoneNumber))
			.unique(); // Returns null if it does not exist

		// 2. Reject if it already exists
		if (existingTicket !== null) {
			throw new ConvexError("A ticket for this phone number already exists.");
		}

		// 3. Insert the new ticket safely
		const ticketId = await ctx.db.insert("tickets", {
			phoneNumber: args.phoneNumber,
		});

		return ticketId;
	},
});

export const checkInTicket = mutation({
	args: { ticketId: v.string() },
	handler: async (ctx, args) => {
		const normalizedId = ctx.db.normalizeId("tickets", args.ticketId);

		if (!normalizedId) {
			return null;
		}

		const ticket = await ctx.db.get(normalizedId);

		if (!ticket) {
			return null;
		}

		// Update attended status to true
		await ctx.db.patch(normalizedId, {
			attended: true,
		});

		return { ...ticket, attended: true };
	},
});
