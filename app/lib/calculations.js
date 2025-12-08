// Format number to Rupiah
export const formatRupiah = (number) => {
    if (number === null || number === undefined || isNaN(number)) return 'Rp 0';

    const formatted = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(number);

    return formatted;
};

// Format number with thousand separators
export const formatNumber = (number) => {
    if (number === null || number === undefined || isNaN(number)) return '0';
    return new Intl.NumberFormat('id-ID').format(number);
};

// Format percentage
export const formatPercentage = (number, decimals = 2) => {
    if (number === null || number === undefined || isNaN(number)) return '0%';
    return `${number >= 0 ? '+' : ''}${number.toFixed(decimals)}%`;
};

// Parse Rupiah string to number
export const parseRupiah = (str) => {
    if (!str) return 0;
    return parseInt(str.toString().replace(/[^\d-]/g, ''), 10) || 0;
};

// Calculate P/L from a transaction
export const calculatePL = (buyPrice, sellPrice, lotQty, buyFee = 0.15, sellFee = 0.25) => {
    const shares = lotQty * 100; // 1 lot = 100 shares

    const buyValue = buyPrice * shares;
    const sellValue = sellPrice * shares;

    const buyFeeAmount = buyValue * (buyFee / 100);
    const sellFeeAmount = sellValue * (sellFee / 100);

    const totalBuyCost = buyValue + buyFeeAmount;
    const netSellValue = sellValue - sellFeeAmount;

    const pl = netSellValue - totalBuyCost;
    const plPercentage = ((netSellValue - totalBuyCost) / totalBuyCost) * 100;

    return {
        buyValue,
        sellValue,
        buyFeeAmount,
        sellFeeAmount,
        totalBuyCost,
        netSellValue,
        pl,
        plPercentage,
        shares,
    };
};

// Calculate P/L percentage
export const calculatePercentage = (buyPrice, currentPrice) => {
    if (!buyPrice || buyPrice === 0) return 0;
    return ((currentPrice - buyPrice) / buyPrice) * 100;
};

// Calculate average price from multiple transactions
export const calculateAveragePrice = (transactions) => {
    if (!transactions || transactions.length === 0) return 0;

    let totalValue = 0;
    let totalShares = 0;

    transactions.forEach(t => {
        const shares = t.lotQty * 100;
        totalValue += t.buyPrice * shares;
        totalShares += shares;
    });

    return totalShares > 0 ? totalValue / totalShares : 0;
};

// Calculate total investment
export const calculateTotalInvestment = (transactions) => {
    if (!transactions || transactions.length === 0) return 0;

    return transactions.reduce((total, t) => {
        const shares = t.lotQty * 100;
        return total + (t.buyPrice * shares);
    }, 0);
};

// Calculate portfolio value
export const calculatePortfolioValue = (stocks, getCurrentPrice) => {
    if (!stocks || stocks.length === 0) return 0;

    return stocks.reduce((total, stock) => {
        const currentPrice = getCurrentPrice ? getCurrentPrice(stock.code) : stock.currentPrice || stock.buyPrice;
        const shares = stock.lotQty * 100;
        return total + (currentPrice * shares);
    }, 0);
};

// Calculate total realized P/L from transactions
export const calculateTotalRealizedPL = (transactions) => {
    if (!transactions || transactions.length === 0) return { total: 0, profit: 0, loss: 0 };

    let totalPL = 0;
    let totalProfit = 0;
    let totalLoss = 0;

    transactions.forEach(t => {
        if (t.sellPrice) {
            const result = calculatePL(t.buyPrice, t.sellPrice, t.lotQty, t.buyFee || 0.15, t.sellFee || 0.25);
            totalPL += result.pl;
            if (result.pl >= 0) {
                totalProfit += result.pl;
            } else {
                totalLoss += result.pl;
            }
        }
    });

    return { total: totalPL, profit: totalProfit, loss: totalLoss };
};

// Calculate win rate
export const calculateWinRate = (transactions) => {
    if (!transactions || transactions.length === 0) return 0;

    const completedTrades = transactions.filter(t => t.sellPrice);
    if (completedTrades.length === 0) return 0;

    const profitableTrades = completedTrades.filter(t => {
        const result = calculatePL(t.buyPrice, t.sellPrice, t.lotQty);
        return result.pl > 0;
    });

    return (profitableTrades.length / completedTrades.length) * 100;
};

// Get biggest win and loss
export const getBiggestWinLoss = (transactions) => {
    if (!transactions || transactions.length === 0) return { biggestWin: null, biggestLoss: null };

    let biggestWin = null;
    let biggestWinPL = 0;
    let biggestLoss = null;
    let biggestLossPL = 0;

    transactions.forEach(t => {
        if (t.sellPrice) {
            const result = calculatePL(t.buyPrice, t.sellPrice, t.lotQty);
            if (result.pl > biggestWinPL) {
                biggestWinPL = result.pl;
                biggestWin = { ...t, ...result };
            }
            if (result.pl < biggestLossPL) {
                biggestLossPL = result.pl;
                biggestLoss = { ...t, ...result };
            }
        }
    });

    return { biggestWin, biggestLoss };
};

// Calculate IPO P/L
export const calculateIPOPL = (ipo) => {
    const shares = ipo.lotQty * 100;
    const ipoValue = ipo.ipoPrice * shares;

    let realizedPL = 0;
    let unrealizedPL = 0;
    let currentValue = 0;

    if (ipo.status === 'sold' && ipo.avgSellPrice) {
        // Fully sold
        const soldShares = (ipo.soldLotQty || ipo.lotQty) * 100;
        realizedPL = (ipo.avgSellPrice - ipo.ipoPrice) * soldShares;
    } else if (ipo.status === 'partial' && ipo.avgSellPrice && ipo.soldLotQty) {
        // Partially sold
        const soldShares = ipo.soldLotQty * 100;
        const remainingShares = (ipo.lotQty - ipo.soldLotQty) * 100;
        realizedPL = (ipo.avgSellPrice - ipo.ipoPrice) * soldShares;
        currentValue = (ipo.currentPrice || ipo.ipoPrice) * remainingShares;
        unrealizedPL = ((ipo.currentPrice || ipo.ipoPrice) - ipo.ipoPrice) * remainingShares;
    } else {
        // Still holding
        currentValue = (ipo.currentPrice || ipo.ipoPrice) * shares;
        unrealizedPL = ((ipo.currentPrice || ipo.ipoPrice) - ipo.ipoPrice) * shares;
    }

    const totalPL = realizedPL + unrealizedPL;
    const plPercentage = ipoValue > 0 ? (totalPL / ipoValue) * 100 : 0;

    return {
        ipoValue,
        currentValue,
        realizedPL,
        unrealizedPL,
        totalPL,
        plPercentage,
    };
};

// Calculate IPO summary stats
export const calculateIPOSummary = (ipoList) => {
    if (!ipoList || ipoList.length === 0) {
        return {
            totalIPOValue: 0,
            totalCurrentValue: 0,
            totalRealizedPL: 0,
            totalUnrealizedPL: 0,
            totalPL: 0,
            totalPLPercentage: 0,
            bestIPO: null,
            worstIPO: null,
        };
    }

    let totalIPOValue = 0;
    let totalCurrentValue = 0;
    let totalRealizedPL = 0;
    let totalUnrealizedPL = 0;
    let bestIPO = null;
    let bestPLPercentage = -Infinity;
    let worstIPO = null;
    let worstPLPercentage = Infinity;

    ipoList.forEach(ipo => {
        const result = calculateIPOPL(ipo);
        totalIPOValue += result.ipoValue;
        totalCurrentValue += result.currentValue;
        totalRealizedPL += result.realizedPL;
        totalUnrealizedPL += result.unrealizedPL;

        if (result.plPercentage > bestPLPercentage) {
            bestPLPercentage = result.plPercentage;
            bestIPO = { ...ipo, ...result };
        }
        if (result.plPercentage < worstPLPercentage) {
            worstPLPercentage = result.plPercentage;
            worstIPO = { ...ipo, ...result };
        }
    });

    const totalPL = totalRealizedPL + totalUnrealizedPL;
    const totalPLPercentage = totalIPOValue > 0 ? (totalPL / totalIPOValue) * 100 : 0;

    return {
        totalIPOValue,
        totalCurrentValue,
        totalRealizedPL,
        totalUnrealizedPL,
        totalPL,
        totalPLPercentage,
        bestIPO,
        worstIPO,
    };
};

// Format date
export const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(date);
};

// Format date input value
export const formatDateInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
};

// ========================================
// ARA/ARB Calculator
// ========================================

// Get price fraction (kelipatan harga) based on IDX rules
export const getPriceFraction = (price) => {
    if (price < 200) return 1;
    if (price < 500) return 2;
    if (price < 2000) return 5;
    if (price < 5000) return 10;
    return 25;
};

// Round price to valid fraction
export const roundToFraction = (price, direction = 'nearest') => {
    const fraction = getPriceFraction(price);
    if (direction === 'up') {
        return Math.ceil(price / fraction) * fraction;
    } else if (direction === 'down') {
        return Math.floor(price / fraction) * fraction;
    }
    return Math.round(price / fraction) * fraction;
};

// Calculate ARA (Auto Rejection Atas) and ARB (Auto Rejection Bawah)
export const calculateARAARB = (price, type = 'symmetric') => {
    if (!price || price <= 0) {
        return { ara: 0, arb: 0, araPercent: 0, arbPercent: 0, priceFraction: 0 };
    }

    let araPercent, arbPercent;

    // IDX rules based on price range
    if (price < 50) {
        // Untuk harga < Rp50: ±10% atau minimal perubahan Rp10
        araPercent = 35;
        arbPercent = 7;
    } else if (price <= 200) {
        // Symmetric: 35% up, 7% down (non-accelerated market)
        araPercent = type === 'accelerated' ? 35 : 35;
        arbPercent = type === 'accelerated' ? 7 : 7;
    } else {
        // Standard: 25% symmetric or 35%/7% asymmetric
        if (type === 'symmetric') {
            araPercent = 25;
            arbPercent = 25;
        } else if (type === 'asymmetric') {
            araPercent = 35;
            arbPercent = 7;
        } else {
            araPercent = 20;
            arbPercent = 20;
        }
    }

    const priceFraction = getPriceFraction(price);
    const araRaw = price * (1 + araPercent / 100);
    const arbRaw = price * (1 - arbPercent / 100);

    const ara = roundToFraction(araRaw, 'down');
    const arb = roundToFraction(arbRaw, 'up');

    // Calculate actual percentage after rounding
    const actualAraPercent = ((ara - price) / price) * 100;
    const actualArbPercent = ((price - arb) / price) * 100;

    return {
        ara,
        arb,
        araPercent: actualAraPercent,
        arbPercent: actualArbPercent,
        araTargetPercent: araPercent,
        arbTargetPercent: arbPercent,
        priceFraction,
        araGain: ara - price,
        arbLoss: price - arb,
    };
};

// Calculate multiple ARA days
export const calculateMultipleARA = (price, days = 5, type = 'symmetric') => {
    const results = [];
    let currentPrice = price;

    for (let i = 0; i < days; i++) {
        const result = calculateARAARB(currentPrice, type);
        results.push({
            day: i + 1,
            openPrice: currentPrice,
            ara: result.ara,
            arb: result.arb,
            araPercent: result.araPercent,
            arbPercent: result.arbPercent,
        });
        currentPrice = result.ara;
    }

    const totalGain = results[results.length - 1].ara - price;
    const totalGainPercent = (totalGain / price) * 100;

    return { results, totalGain, totalGainPercent };
};

// Calculate multiple ARB days
export const calculateMultipleARB = (price, days = 5, type = 'symmetric') => {
    const results = [];
    let currentPrice = price;

    for (let i = 0; i < days; i++) {
        const result = calculateARAARB(currentPrice, type);
        results.push({
            day: i + 1,
            openPrice: currentPrice,
            ara: result.ara,
            arb: result.arb,
            araPercent: result.araPercent,
            arbPercent: result.arbPercent,
        });
        currentPrice = result.arb;
    }

    const totalLoss = price - results[results.length - 1].arb;
    const totalLossPercent = (totalLoss / price) * 100;

    return { results, totalLoss, totalLossPercent };
};

// ========================================
// Average Price Calculator
// ========================================

// Calculate weighted average price from multiple entries
export const calculateWeightedAverage = (entries) => {
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

// Add new entry and recalculate average
export const addToAverage = (currentAvg, currentLot, newPrice, newLot) => {
    const currentShares = currentLot * 100;
    const newShares = newLot * 100;
    const totalShares = currentShares + newShares;

    const currentValue = currentAvg * currentShares;
    const newValue = newPrice * newShares;
    const totalValue = currentValue + newValue;

    const newAvg = totalShares > 0 ? totalValue / totalShares : 0;

    return {
        avgPrice: Math.round(newAvg * 100) / 100,
        totalLot: currentLot + newLot,
        totalShares,
        totalValue,
        changePercent: currentAvg > 0 ? ((newAvg - currentAvg) / currentAvg) * 100 : 0,
    };
};

// Calculate target price to average down
export const calculateTargetAverageDown = (currentAvg, currentLot, targetAvg, maxLot = 1000) => {
    if (targetAvg >= currentAvg) return null; // Can't average down to higher price

    const currentShares = currentLot * 100;
    const currentValue = currentAvg * currentShares;

    // Formula: targetAvg = (currentValue + newPrice * newShares) / (currentShares + newShares)
    // We need to find newPrice and newShares combination

    const results = [];
    for (let addLot = 1; addLot <= Math.min(maxLot, currentLot * 5); addLot++) {
        const addShares = addLot * 100;
        const totalShares = currentShares + addShares;

        // targetAvg * totalShares = currentValue + newPrice * addShares
        // newPrice = (targetAvg * totalShares - currentValue) / addShares
        const requiredPrice = (targetAvg * totalShares - currentValue) / addShares;

        if (requiredPrice > 0 && requiredPrice < currentAvg) {
            results.push({
                lot: addLot,
                price: Math.round(requiredPrice),
                totalLot: currentLot + addLot,
                totalValue: currentValue + (requiredPrice * addShares),
            });
        }
    }

    return results.slice(0, 10); // Return top 10 combinations
};
