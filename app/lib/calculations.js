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
