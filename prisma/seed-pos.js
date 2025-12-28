const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log(" Setting up POS system...");

  // Create Ghana Cedi currency
  const ghsCurrency = await prisma.currency.upsert({
    where: { code: "GHS" },
    update: {},
    create: {
      code: "GHS",
      symbol: "",
      name: "Ghana Cedi",
      exchangeRate: 1.0,
      isBase: true,
      decimals: 2,
      isActive: true,
    },
  });

  console.log(" Base currency created: GHS ()");

  // Create other currencies
  const currencies = [
    {
      code: "USD",
      symbol: "$",
      name: "US Dollar",
      exchangeRate: 12.5,
      isBase: false,
      decimals: 2,
      isActive: true,
    },
    {
      code: "EUR",
      symbol: "",
      name: "Euro",
      exchangeRate: 13.8,
      isBase: false,
      decimals: 2,
      isActive: true,
    },
  ];

  for (const currency of currencies) {
    await prisma.currency.upsert({
      where: { code: currency.code },
      update: currency,
      create: currency,
    });
    console.log(` Currency added: ${currency.code}`);
  }

  // Create business settings
  await prisma.businessSettings.upsert({
    where: { id: "default-settings" },
    update: {},
    create: {
      id: "default-settings",
      businessName: "My Inventory Business",
      baseCurrencyId: ghsCurrency.id,
      defaultTaxRate: 15.0,
      allowMultiCurrency: true,
      dateFormat: "DD/MM/YYYY",
      timezone: "Africa/Accra",
    },
  });

  console.log(" Business settings created");

  // Create default customer
  await prisma.customer.upsert({
    where: { phone: "0000000000" },
    update: {},
    create: {
      name: "Walk-in Customer",
      phone: "0000000000",
      address: "Not specified",
      city: "Various",
      region: "N/A",
    },
  });

  // Create sample customers
  const sampleCustomers = [
    {
      name: "Kwame Mensah",
      phone: "0241234567",
      email: "kwame@example.com",
      address: "123 Independence Avenue",
      city: "Accra",
      region: "Greater Accra",
    },
    {
      name: "Ama Serwaa",
      phone: "0209876543",
      email: "ama@example.com",
      address: "45 Adum Street",
      city: "Kumasi",
      region: "Ashanti",
    },
  ];

  for (const customer of sampleCustomers) {
    await prisma.customer.upsert({
      where: { phone: customer.phone },
      update: customer,
      create: customer,
    });
    console.log(` Customer added: ${customer.name}`);
  }

  console.log(" POS setup completed!");
}

main()
  .catch((e) => {
    console.error(" Setup error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
