import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	event: defineTable({
		name: v.string(),
		phoneNumber: v.string(),
		location: v.string(),
	}),

	tickets: defineTable({
		phoneNumber: v.number(),
	}).index("by_phoneNumber", ["phoneNumber"]), // 👈 Add this index
});
