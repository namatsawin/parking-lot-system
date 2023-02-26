-- CreateEnum
CREATE TYPE "CarSize" AS ENUM ('SMALL', 'MEDIUM', 'LARGE');

-- CreateTable
CREATE TABLE "parking_lot" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "parking_lot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parking_slot" (
    "id" SERIAL NOT NULL,
    "slot_no" INTEGER NOT NULL,
    "is_allocated" BOOLEAN NOT NULL DEFAULT false,
    "parking_lot_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "parking_slot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket" (
    "id" SERIAL NOT NULL,
    "registration_no" TEXT NOT NULL,
    "car_size" "CarSize" NOT NULL,
    "parking_slot_id" INTEGER NOT NULL,
    "entry_time" TIMESTAMP(3),
    "exit_time" TIMESTAMP(3),

    CONSTRAINT "ticket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "parking_lot_name_key" ON "parking_lot"("name");

-- CreateIndex
CREATE INDEX "parking_slot_slot_no_parking_lot_id_idx" ON "parking_slot"("slot_no", "parking_lot_id");

-- CreateIndex
CREATE UNIQUE INDEX "parking_slot_slot_no_parking_lot_id_key" ON "parking_slot"("slot_no", "parking_lot_id");

-- AddForeignKey
ALTER TABLE "parking_slot" ADD CONSTRAINT "parking_slot_parking_lot_id_fkey" FOREIGN KEY ("parking_lot_id") REFERENCES "parking_lot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_parking_slot_id_fkey" FOREIGN KEY ("parking_slot_id") REFERENCES "parking_slot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
