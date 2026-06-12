import { relations } from "drizzle-orm";
import {
  bigint,
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

export const fuelTypeEnum = pgEnum("fuel_type", [
  "gasoline",
  "diesel",
  "electric",
  "hybrid",
  "lpg",
]);

export const transmissionEnum = pgEnum("transmission", ["automatic", "manual"]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    telegramId: bigint("telegram_id", { mode: "number" }).notNull().unique(),
    username: text("username"),
    firstName: text("first_name"),
    lastName: text("last_name"),
    photoUrl: text("photo_url"),
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
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("idx_cars_user_id").on(table.userId),
    index("idx_cars_is_active").on(table.isActive),
    index("idx_cars_deleted_at").on(table.deletedAt),
    index("idx_cars_brand").on(table.brand),
    index("idx_cars_price").on(table.price),
    index("idx_cars_year").on(table.year),
    index("idx_cars_fuel_type").on(table.fuelType),
    index("idx_cars_location").on(table.location),
    index("idx_cars_created_at").on(table.createdAt),
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
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_car_images_car_id").on(table.carId),
    index("idx_car_images_sort_order").on(table.carId, table.sortOrder),
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
  ],
);

export const usersRelations = relations(users, ({ many }) => ({
  cars: many(cars),
  favorites: many(favorites),
}));

export const carsRelations = relations(cars, ({ one, many }) => ({
  user: one(users, {
    fields: [cars.userId],
    references: [users.id],
  }),
  carImages: many(carImages),
  favorites: many(favorites),
}));

export const carImagesRelations = relations(carImages, ({ one }) => ({
  car: one(cars, {
    fields: [carImages.carId],
    references: [cars.id],
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
