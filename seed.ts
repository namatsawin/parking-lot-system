// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PrismaClient } = require('@prisma/client');

// initialize Prisma Client
const prisma = new PrismaClient();

async function main() {
  prisma.parking_lot.deleteMany();
  prisma.parking_slot.deleteMany();
  prisma.ticket.deleteMany();

  const parkingLot = await prisma.parking_lot.create({
    data: {
      name: 'parking-lot-1',
      capacity: 10,
    },
  });

  const slots = await prisma.parking_slot.createMany({
    data: Array.from(Array(parkingLot.capacity).keys()).map((index) => ({
      slot_no: index + 1,
      parking_lot_id: parkingLot.id,
      is_allocated: true,
    })),
  });

  const parkingLot2 = await prisma.parking_lot.create({
    data: {
      name: 'parking-lot-2',
      capacity: 10,
    },
  });

  const slots2 = await prisma.parking_slot.createMany({
    data: Array.from(Array(parkingLot2.capacity).keys()).map((index) => ({
      slot_no: index + 1,
      parking_lot_id: parkingLot2.id,
      is_allocated: true,
    })),
  });

  console.log({ parkingLot, slots, parkingLot2, slots2 });
}

// execute the main function
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // close Prisma Client at the end
    await prisma.$disconnect();
  });
