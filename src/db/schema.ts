import { relations, sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  check,
  customType,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

const tsvector = customType<{ data: string }>({
  dataType() {
    return "tsvector";
  },
});

export const fuelTypeEnum = pgEnum("fuel_type", [
  "gasoline",
  "diesel",
  "electric",
  "hybrid",
  "lpg",
]);

export const transmissionEnum = pgEnum("transmission", ["automatic", "manual"]);

export const messageDirectionEnum = pgEnum("message_direction", [
  "buyer_to_seller",
  "seller_to_buyer",
]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    telegramId: bigint("telegram_id", { mode: "number" }).notNull().unique(),
    username: text("username"),
    firstName: text("first_name"),
    lastName: text("last_name"),
    photoUrl: text("photo_url"),
    phone: text("phone"),
    isAdmin: boolean("is_admin").notNull().default(false),
    bannedAt: timestamp("banned_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("idx_users_telegram_id").on(table.telegramId),
    index("idx_users_deleted_at").on(table.deletedAt),
    index("idx_users_active").on(table.id).where(sql`deleted_at IS NULL`),
    index("idx_users_banned_at").on(table.bannedAt),
    check("users_telegram_id_positive", sql`${table.telegramId} > 0`),
    check(
      "users_phone_not_empty",
      sql`${table.phone} IS NULL OR length(trim(${table.phone})) > 0`,
    ),
  ],
);

export const cars = pgTable(
  "cars",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    brand: text("brand").notNull(),
    model: text("model").notNull(),
    year: integer("year").notNull(),
    price: bigint("price", { mode: "number" }).notNull(),
    mileage: integer("mileage").notNull(),
    fuelType: fuelTypeEnum("fuel_type").notNull(),
    transmission: transmissionEnum("transmission").notNull(),
    description: text("description"),
    location: text("location"),
    sellerDisplayName: text("seller_display_name"),
    sellerUsername: text("seller_username"),
    sellerTelegramId: bigint("seller_telegram_id", { mode: "number" }),
    sellerPhone: text("seller_phone"),
    isActive: boolean("is_active").notNull().default(true),
    isFeatured: boolean("is_featured").notNull().default(false),
    soldAt: timestamp("sold_at", { withTimezone: true }),
    viewCount: integer("view_count").notNull().default(0),
    contactCount: integer("contact_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    searchVector: tsvector("search_vector"),
  },
  (table) => [
    index("idx_cars_user_id").on(table.userId),
    index("idx_cars_is_active").on(table.isActive),
    index("idx_cars_deleted_at").on(table.deletedAt),
    index("idx_cars_brand").on(table.brand),
    index("idx_cars_price").on(table.price),
    index("idx_cars_year").on(table.year),
    index("idx_cars_fuel_type").on(table.fuelType),
    index("idx_cars_transmission").on(table.transmission),
    index("idx_cars_location").on(table.location),
    index("idx_cars_seller_username").on(table.sellerUsername),
    index("idx_cars_created_at").on(table.createdAt),
    index("idx_cars_is_featured").on(table.isFeatured),
    index("idx_cars_sold_at").on(table.soldAt),
    index("idx_cars_featured_list")
      .on(table.createdAt)
      .where(
        sql`is_featured = TRUE AND is_active = TRUE AND deleted_at IS NULL`,
      ),
    index("idx_cars_active_list")
      .on(table.createdAt)
      .where(sql`is_active = TRUE AND deleted_at IS NULL`),
    index("idx_cars_filter_combo")
      .on(
        table.brand,
        table.fuelType,
        table.transmission,
        table.year,
        table.price,
      )
      .where(sql`is_active = TRUE AND deleted_at IS NULL`),
    index("idx_cars_price_year")
      .on(table.price, table.year)
      .where(sql`is_active = TRUE AND deleted_at IS NULL`),
    index("idx_cars_search_vector").using("gin", table.searchVector),
    index("idx_cars_title_trgm").using("gin", table.title),
    index("idx_cars_brand_trgm").using("gin", table.brand),
    check("cars_year_range", sql`${table.year} >= 1990 AND ${table.year} <= 2100`),
    check("cars_price_positive", sql`${table.price} > 0`),
    check("cars_mileage_non_negative", sql`${table.mileage} >= 0`),
    check("cars_title_not_empty", sql`length(trim(${table.title})) > 0`),
    check("cars_brand_not_empty", sql`length(trim(${table.brand})) > 0`),
    check("cars_model_not_empty", sql`length(trim(${table.model})) > 0`),
    check("cars_view_count_non_negative", sql`${table.viewCount} >= 0`),
    check(
      "cars_contact_count_non_negative",
      sql`${table.contactCount} >= 0`,
    ),
  ],
);

export const carViews = pgTable(
  "car_views",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    carId: uuid("car_id")
      .notNull()
      .references(() => cars.id, { onDelete: "cascade" }),
    viewerKey: text("viewer_key").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("car_views_car_id_viewer_key_unique").on(table.carId, table.viewerKey),
    index("idx_car_views_car_id").on(table.carId),
    check(
      "car_views_viewer_key_not_empty",
      sql`length(trim(${table.viewerKey})) > 0`,
    ),
  ],
);

export const carContacts = pgTable(
  "car_contacts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    carId: uuid("car_id")
      .notNull()
      .references(() => cars.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("car_contacts_car_id_user_id_unique").on(table.carId, table.userId),
    index("idx_car_contacts_car_id").on(table.carId),
    index("idx_car_contacts_user_id").on(table.userId),
  ],
);

export const carImages = pgTable(
  "car_images",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    carId: uuid("car_id")
      .notNull()
      .references(() => cars.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    thumbnailUrl: text("thumbnail_url").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_car_images_car_id").on(table.carId),
    index("idx_car_images_sort_order").on(table.carId, table.sortOrder),
    check("car_images_url_not_empty", sql`length(trim(${table.url})) > 0`),
    check(
      "car_images_thumbnail_url_not_empty",
      sql`length(trim(${table.thumbnailUrl})) > 0`,
    ),
    check(
      "car_images_sort_order_non_negative",
      sql`${table.sortOrder} >= 0`,
    ),
  ],
);

export const conversations = pgTable(
  "conversations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    carId: uuid("car_id")
      .notNull()
      .references(() => cars.id, { onDelete: "cascade" }),
    buyerId: uuid("buyer_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    sellerId: uuid("seller_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("conversations_car_id_buyer_id_unique").on(table.carId, table.buyerId),
    index("idx_conversations_car_id").on(table.carId),
    index("idx_conversations_buyer_id").on(table.buyerId),
    index("idx_conversations_seller_id").on(table.sellerId),
  ],
);

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    senderId: uuid("sender_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    direction: messageDirectionEnum("direction").notNull(),
    telegramMessageId: bigint("telegram_message_id", { mode: "number" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_messages_conversation_id").on(table.conversationId),
    index("idx_messages_conversation_created").on(
      table.conversationId,
      table.createdAt,
    ),
    uniqueIndex("idx_messages_telegram_message_id")
      .on(table.telegramMessageId)
      .where(sql`telegram_message_id IS NOT NULL`),
    check("messages_body_not_empty", sql`length(trim(${table.body})) > 0`),
  ],
);

export const favorites = pgTable(
  "favorites",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    carId: uuid("car_id")
      .notNull()
      .references(() => cars.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("favorites_user_id_car_id_unique").on(table.userId, table.carId),
    index("idx_favorites_user_id").on(table.userId),
    index("idx_favorites_car_id").on(table.carId),
    index("idx_favorites_user_created").on(table.userId, table.createdAt),
  ],
);

export const usersRelations = relations(users, ({ many }) => ({
  cars: many(cars),
  favorites: many(favorites),
  buyerConversations: many(conversations, { relationName: "buyer" }),
  sellerConversations: many(conversations, { relationName: "seller" }),
  sentMessages: many(messages),
}));

export const carsRelations = relations(cars, ({ one, many }) => ({
  user: one(users, {
    fields: [cars.userId],
    references: [users.id],
  }),
  carImages: many(carImages),
  favorites: many(favorites),
  views: many(carViews),
  contacts: many(carContacts),
  conversations: many(conversations),
}));

export const carViewsRelations = relations(carViews, ({ one }) => ({
  car: one(cars, {
    fields: [carViews.carId],
    references: [cars.id],
  }),
}));

export const carContactsRelations = relations(carContacts, ({ one }) => ({
  car: one(cars, {
    fields: [carContacts.carId],
    references: [cars.id],
  }),
  user: one(users, {
    fields: [carContacts.userId],
    references: [users.id],
  }),
}));

export const carImagesRelations = relations(carImages, ({ one }) => ({
  car: one(cars, {
    fields: [carImages.carId],
    references: [cars.id],
  }),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  car: one(cars, {
    fields: [conversations.carId],
    references: [cars.id],
  }),
  buyer: one(users, {
    fields: [conversations.buyerId],
    references: [users.id],
    relationName: "buyer",
  }),
  seller: one(users, {
    fields: [conversations.sellerId],
    references: [users.id],
    relationName: "seller",
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, {
    fields: [favorites.userId],
    references: [users.id],
  }),
  car: one(cars, {
    fields: [favorites.carId],
    references: [cars.id],
  }),
}));
