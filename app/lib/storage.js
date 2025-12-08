import { createClient } from './supabase';

// ========================================
// Transaction Functions (Supabase)
// ========================================

export const getTransactions = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        // Fallback to localStorage for non-logged in users
        return getLocalTransactions();
    }

    const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching transactions:', error);
        return [];
    }

    // Transform from DB format to app format
    return data.map(t => ({
        id: t.id,
        stockCode: t.stock_code,
        stockName: t.stock_name,
        buyPrice: t.buy_price,
        sellPrice: t.sell_price,
        lotQty: t.lot_qty,
        buyFee: t.buy_fee,
        sellFee: t.sell_fee,
        transactionDate: t.transaction_date,
        notes: t.notes,
        createdAt: t.created_at,
    }));
};

export const addTransaction = async (transaction) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return addLocalTransaction(transaction);
    }

    const { data, error } = await supabase
        .from('transactions')
        .insert({
            user_id: user.id,
            stock_code: transaction.stockCode,
            stock_name: transaction.stockName || null,
            buy_price: transaction.buyPrice,
            sell_price: transaction.sellPrice || null,
            lot_qty: transaction.lotQty,
            buy_fee: transaction.buyFee || 0.15,
            sell_fee: transaction.sellFee || 0.25,
            transaction_date: transaction.transactionDate || null,
            notes: transaction.notes || null,
        })
        .select()
        .single();

    if (error) {
        console.error('Error adding transaction:', error);
        return null;
    }

    return {
        id: data.id,
        stockCode: data.stock_code,
        stockName: data.stock_name,
        buyPrice: data.buy_price,
        sellPrice: data.sell_price,
        lotQty: data.lot_qty,
        buyFee: data.buy_fee,
        sellFee: data.sell_fee,
        transactionDate: data.transaction_date,
        notes: data.notes,
        createdAt: data.created_at,
    };
};

export const updateTransaction = async (id, updates) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return updateLocalTransaction(id, updates);
    }

    const { data, error } = await supabase
        .from('transactions')
        .update({
            stock_code: updates.stockCode,
            stock_name: updates.stockName || null,
            buy_price: updates.buyPrice,
            sell_price: updates.sellPrice || null,
            lot_qty: updates.lotQty,
            buy_fee: updates.buyFee || 0.15,
            sell_fee: updates.sellFee || 0.25,
            transaction_date: updates.transactionDate || null,
            notes: updates.notes || null,
            updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating transaction:', error);
        return null;
    }

    return {
        id: data.id,
        stockCode: data.stock_code,
        stockName: data.stock_name,
        buyPrice: data.buy_price,
        sellPrice: data.sell_price,
        lotQty: data.lot_qty,
        buyFee: data.buy_fee,
        sellFee: data.sell_fee,
        transactionDate: data.transaction_date,
        notes: data.notes,
        createdAt: data.created_at,
    };
};

export const deleteTransaction = async (id) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return deleteLocalTransaction(id);
    }

    const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting transaction:', error);
        return false;
    }

    return true;
};

// ========================================
// IPO Functions (Supabase)
// ========================================

export const getIPOData = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return getLocalIPOData();
    }

    const { data, error } = await supabase
        .from('ipo_investments')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching IPO:', error);
        return [];
    }

    return data.map(i => ({
        id: i.id,
        stockCode: i.stock_code,
        stockName: i.stock_name,
        ipoPrice: i.ipo_price,
        lotQty: i.lot_qty,
        listingDate: i.listing_date,
        status: i.status,
        currentPrice: i.current_price,
        avgSellPrice: i.avg_sell_price,
        soldLotQty: i.sold_lot_qty,
        sellDate: i.sell_date,
        notes: i.notes,
        createdAt: i.created_at,
    }));
};

export const addIPO = async (ipo) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return addLocalIPO(ipo);
    }

    const { data, error } = await supabase
        .from('ipo_investments')
        .insert({
            user_id: user.id,
            stock_code: ipo.stockCode,
            stock_name: ipo.stockName || null,
            ipo_price: ipo.ipoPrice,
            lot_qty: ipo.lotQty,
            listing_date: ipo.listingDate || null,
            status: ipo.status || 'hold',
            current_price: ipo.currentPrice || null,
            avg_sell_price: ipo.avgSellPrice || null,
            sold_lot_qty: ipo.soldLotQty || null,
            sell_date: ipo.sellDate || null,
            notes: ipo.notes || null,
        })
        .select()
        .single();

    if (error) {
        console.error('Error adding IPO:', error);
        return null;
    }

    return {
        id: data.id,
        stockCode: data.stock_code,
        stockName: data.stock_name,
        ipoPrice: data.ipo_price,
        lotQty: data.lot_qty,
        listingDate: data.listing_date,
        status: data.status,
        currentPrice: data.current_price,
        avgSellPrice: data.avg_sell_price,
        soldLotQty: data.sold_lot_qty,
        sellDate: data.sell_date,
        notes: data.notes,
        createdAt: data.created_at,
    };
};

export const updateIPO = async (id, updates) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return updateLocalIPO(id, updates);
    }

    const updateData = {
        updated_at: new Date().toISOString(),
    };

    if (updates.stockCode !== undefined) updateData.stock_code = updates.stockCode;
    if (updates.stockName !== undefined) updateData.stock_name = updates.stockName;
    if (updates.ipoPrice !== undefined) updateData.ipo_price = updates.ipoPrice;
    if (updates.lotQty !== undefined) updateData.lot_qty = updates.lotQty;
    if (updates.listingDate !== undefined) updateData.listing_date = updates.listingDate;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.currentPrice !== undefined) updateData.current_price = updates.currentPrice;
    if (updates.avgSellPrice !== undefined) updateData.avg_sell_price = updates.avgSellPrice;
    if (updates.soldLotQty !== undefined) updateData.sold_lot_qty = updates.soldLotQty;
    if (updates.sellDate !== undefined) updateData.sell_date = updates.sellDate;
    if (updates.notes !== undefined) updateData.notes = updates.notes;

    const { data, error } = await supabase
        .from('ipo_investments')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating IPO:', error);
        return null;
    }

    return {
        id: data.id,
        stockCode: data.stock_code,
        stockName: data.stock_name,
        ipoPrice: data.ipo_price,
        lotQty: data.lot_qty,
        listingDate: data.listing_date,
        status: data.status,
        currentPrice: data.current_price,
        avgSellPrice: data.avg_sell_price,
        soldLotQty: data.sold_lot_qty,
        sellDate: data.sell_date,
        notes: data.notes,
        createdAt: data.created_at,
    };
};

export const deleteIPO = async (id) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return deleteLocalIPO(id);
    }

    const { error } = await supabase
        .from('ipo_investments')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting IPO:', error);
        return false;
    }

    return true;
};

// ========================================
// LocalStorage Fallback Functions
// ========================================

const STORAGE_KEYS = {
    TRANSACTIONS: 'stockcalc_transactions',
    IPO: 'stockcalc_ipo',
};

const isLocalStorageAvailable = () => {
    try {
        const test = '__storage_test__';
        window.localStorage.setItem(test, test);
        window.localStorage.removeItem(test);
        return true;
    } catch (e) {
        return false;
    }
};

const getData = (key) => {
    if (!isLocalStorageAvailable()) return null;
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (e) {
        console.error('Error reading from localStorage:', e);
        return null;
    }
};

const saveData = (key, data) => {
    if (!isLocalStorageAvailable()) return false;
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (e) {
        console.error('Error saving to localStorage:', e);
        return false;
    }
};

// Local Transaction Functions
const getLocalTransactions = () => {
    return getData(STORAGE_KEYS.TRANSACTIONS) || [];
};

const saveLocalTransactions = (transactions) => {
    return saveData(STORAGE_KEYS.TRANSACTIONS, transactions);
};

const addLocalTransaction = (transaction) => {
    const transactions = getLocalTransactions();
    const newTransaction = {
        ...transaction,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
    };
    transactions.unshift(newTransaction);
    saveLocalTransactions(transactions);
    return newTransaction;
};

const updateLocalTransaction = (id, updates) => {
    const transactions = getLocalTransactions();
    const index = transactions.findIndex(t => t.id === id);
    if (index !== -1) {
        transactions[index] = { ...transactions[index], ...updates, updatedAt: new Date().toISOString() };
        saveLocalTransactions(transactions);
        return transactions[index];
    }
    return null;
};

const deleteLocalTransaction = (id) => {
    const transactions = getLocalTransactions();
    const filtered = transactions.filter(t => t.id !== id);
    saveLocalTransactions(filtered);
    return filtered;
};

// Local IPO Functions
const getLocalIPOData = () => {
    return getData(STORAGE_KEYS.IPO) || [];
};

const saveLocalIPOData = (data) => {
    return saveData(STORAGE_KEYS.IPO, data);
};

const addLocalIPO = (ipo) => {
    const data = getLocalIPOData();
    const newIPO = {
        ...ipo,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
    };
    data.unshift(newIPO);
    saveLocalIPOData(data);
    return newIPO;
};

const updateLocalIPO = (id, updates) => {
    const data = getLocalIPOData();
    const index = data.findIndex(i => i.id === id);
    if (index !== -1) {
        data[index] = { ...data[index], ...updates, updatedAt: new Date().toISOString() };
        saveLocalIPOData(data);
        return data[index];
    }
    return null;
};

const deleteLocalIPO = (id) => {
    const data = getLocalIPOData();
    const filtered = data.filter(i => i.id !== id);
    saveLocalIPOData(filtered);
    return filtered;
};

// ========================================
// Export/Import Functions
// ========================================

export const exportAllData = async () => {
    const transactions = await getTransactions();
    const ipo = await getIPOData();

    const data = {
        transactions,
        ipo,
        exportedAt: new Date().toISOString(),
        version: '1.0',
    };
    return JSON.stringify(data, null, 2);
};

export const importData = async (jsonString) => {
    try {
        const data = JSON.parse(jsonString);
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            // Import to localStorage
            if (data.transactions) {
                saveLocalTransactions(data.transactions);
            }
            if (data.ipo) {
                saveLocalIPOData(data.ipo);
            }
            return { success: true, message: 'Data berhasil diimport ke local storage!' };
        }

        // Import to Supabase
        if (data.transactions && data.transactions.length > 0) {
            for (const t of data.transactions) {
                await addTransaction(t);
            }
        }
        if (data.ipo && data.ipo.length > 0) {
            for (const i of data.ipo) {
                await addIPO(i);
            }
        }

        return { success: true, message: 'Data berhasil diimport!' };
    } catch (e) {
        return { success: false, message: 'Format data tidak valid!' };
    }
};

export const clearAllData = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
        localStorage.removeItem(STORAGE_KEYS.IPO);
        return true;
    }

    await supabase.from('transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('ipo_investments').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    return true;
};
