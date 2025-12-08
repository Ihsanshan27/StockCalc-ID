-- ========================================
-- StockCalc ID - Database Setup
-- Run this in Supabase SQL Editor
-- ========================================

-- Transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stock_code VARCHAR(10) NOT NULL,
  stock_name VARCHAR(100),
  buy_price DECIMAL(15,2) NOT NULL,
  sell_price DECIMAL(15,2),
  lot_qty INTEGER NOT NULL,
  buy_fee DECIMAL(5,2) DEFAULT 0.15,
  sell_fee DECIMAL(5,2) DEFAULT 0.25,
  transaction_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- IPO Investments table
CREATE TABLE IF NOT EXISTS public.ipo_investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stock_code VARCHAR(10) NOT NULL,
  stock_name VARCHAR(100),
  ipo_price DECIMAL(15,2) NOT NULL,
  lot_qty INTEGER NOT NULL,
  listing_date DATE,
  status VARCHAR(20) DEFAULT 'hold',
  current_price DECIMAL(15,2),
  avg_sell_price DECIMAL(15,2),
  sold_lot_qty INTEGER,
  sell_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ipo_investments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can delete own transactions" ON public.transactions;

DROP POLICY IF EXISTS "Users can view own IPO" ON public.ipo_investments;
DROP POLICY IF EXISTS "Users can insert own IPO" ON public.ipo_investments;
DROP POLICY IF EXISTS "Users can update own IPO" ON public.ipo_investments;
DROP POLICY IF EXISTS "Users can delete own IPO" ON public.ipo_investments;

-- Create policies for transactions
CREATE POLICY "Users can view own transactions" 
  ON public.transactions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" 
  ON public.transactions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" 
  ON public.transactions FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" 
  ON public.transactions FOR DELETE 
  USING (auth.uid() = user_id);

-- Create policies for IPO investments
CREATE POLICY "Users can view own IPO" 
  ON public.ipo_investments FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own IPO" 
  ON public.ipo_investments FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own IPO" 
  ON public.ipo_investments FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own IPO" 
  ON public.ipo_investments FOR DELETE 
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ipo_user_id ON public.ipo_investments(user_id);
CREATE INDEX IF NOT EXISTS idx_ipo_created_at ON public.ipo_investments(created_at DESC);
