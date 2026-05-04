-- ============================================================
-- OUREDUCA: FINANCE & FEES SCHEMA
-- ============================================================

-- Status types: 'PENDING', 'PAID', 'OVERDUE'
-- Transaction status: 'PENDING_VERIFICATION', 'VERIFIED', 'REJECTED'

-- 1. FEES TABLE (Invoices)
CREATE TABLE fees (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id   UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    student_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title       TEXT NOT NULL,
    amount      DECIMAL(10, 2) NOT NULL,
    due_date    TIMESTAMPTZ NOT NULL,
    status      TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'OVERDUE')),
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- 2. FEE TRANSACTIONS (Payment attempts)
CREATE TABLE fee_transactions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fee_id          UUID NOT NULL REFERENCES fees(id) ON DELETE CASCADE,
    student_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    school_id       UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    amount          DECIMAL(10, 2) NOT NULL,
    payment_method  TEXT DEFAULT 'Digital', -- 'Digital', 'Cash'
    transaction_ref TEXT, -- External ref from payment gateway
    status          TEXT DEFAULT 'PENDING_VERIFICATION' CHECK (status IN ('PENDING_VERIFICATION', 'VERIFIED', 'REJECTED')),
    paid_at         TIMESTAMPTZ DEFAULT now(),
    verified_by     UUID REFERENCES users(id) ON DELETE SET NULL,
    verified_at     TIMESTAMPTZ
);

-- 3. RLS POLICIES
ALTER TABLE fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_transactions ENABLE ROW LEVEL SECURITY;

-- For development: permissive policies
CREATE POLICY "Permissive fees" ON fees FOR ALL USING (true);
CREATE POLICY "Permissive transactions" ON fee_transactions FOR ALL USING (true);

-- Indexes for performance
CREATE INDEX idx_fees_student ON fees(student_id);
CREATE INDEX idx_fees_school ON fees(school_id);
CREATE INDEX idx_transactions_school ON fee_transactions(school_id);
CREATE INDEX idx_transactions_status ON fee_transactions(status);
