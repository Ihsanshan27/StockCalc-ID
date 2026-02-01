
const calculateWeightedAverage = (entries) => {
    if (!entries || entries.length === 0) {
        return {
            avgPrice: 0,
            totalLot: 0,
            totalShares: 0,
            totalValue: 0,
        };
    }

    let totalValue = 0;
    let totalShares = 0;

    entries.forEach(entry => {
        if (entry.price > 0 && entry.lot > 0) {
            const shares = entry.lot * 100;
            totalValue += entry.price * shares;
            totalShares += shares;
        }
    });

    const avgPrice = totalShares > 0 ? totalValue / totalShares : 0;
    const totalLot = totalShares / 100;

    return {
        avgPrice: Math.round(avgPrice * 100) / 100, // Round to 2 decimals
        totalLot,
        totalShares,
        totalValue,
    };
};

// Test Cases
const testCases = [
    // 1. Standard Case
    [
        { price: 1000, lot: 1 },
        { price: 2000, lot: 1 }
    ],
    // 2. Different Lots
    [
        { price: 1000, lot: 1 },
        { price: 2000, lot: 3 }
    ],
    // 3. Decimals in Price
    [
        { price: 1000.5, lot: 1 },
        { price: 2000.5, lot: 1 }
    ],
    // 4. Decimals in Lot (Partial lots?)
    [
        { price: 1000, lot: 1.5 },
        { price: 2000, lot: 1.5 }
    ]
];

testCases.forEach((entries, idx) => {
    console.log(`Test Case ${idx + 1}:`, calculateWeightedAverage(entries));
});
